import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import dotenv from 'dotenv';
import archiver from 'archiver';
import { OpenAI } from 'openai';
import { suggestLoRAStack } from './lora-suggester.js';
import { registerFeedback } from './feedback.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 10000;
const historyDir = path.join(os.tmpdir(), 'prompt-history');
if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://prompt-story-tool.onrender.com',
    'X-Title': 'Prompt Story Tool'
  }
});

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function handleError(res, err, label = '🚨 サーバーエラー') {
  console.error(`${label}:`, err.message || err);
  return res.status(500).json({ error: label });
}

app.post('/api/generate', upload.single('image'), async (req, res) => {
  const { situation, model, character, structure, sd_model } = req.body;
  if (!situation) return res.status(400).json({ error: 'シチュエーションが必要です' });

  try {
    const messages = [
      {
        role: 'system',
        content: `あなたはNSFW画像用の英語プロンプト職人です。入力された日本語のシチュエーションから、英語の正しいプロンプトとネガティブプロンプト、Stable Diffusion用のLoRAタグ候補を生成してください。\n\n出力形式は以下の順で明記してください：\n1. Prompt:\n2. Negative Prompt:\n3. LoRA Suggestion:`
      },
      {
        role: 'user',
        content: `シチュエーション: ${situation}\n構図: ${structure || '不明'}\nキャラ: ${character || '不明'}\n画像モデル: ${sd_model || '未指定'}`
      }
    ];

    const response = await openai.chat.completions.create({ model: 'gpt-4o', messages, temperature: 0.8 });
    const reply = response?.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json({ error: 'AI応答が不正です（reply missing）' });

    const promptMatch = reply.match(/^(.*?)(Negative Prompt:|$)/s);
    const negativeMatch = reply.match(/Negative Prompt:(.*?)(LoRA Suggestion:|$)/s);
    const prompt = promptMatch?.[1]?.trim() || 'No prompt';
    const negative_prompt = negativeMatch?.[1]?.trim() || '';
    const loras = suggestLoRAStack(situation + structure);

    const characterDir = character ? path.join(historyDir, character) : historyDir;
    ensureDir(characterDir);

    const historyEntry = {
      prompt,
      negative_prompt,
      model: 'gpt-4o',
      sd_model,
      character,
      structure,
      lora_suggestions: loras,
      timestamp: new Date().toISOString(),
      feedback: null
    };

    const filename = `history_${Date.now()}.json`;
    fs.writeFileSync(path.join(characterDir, filename), JSON.stringify(historyEntry, null, 2));
    res.json(historyEntry);
  } catch (err) {
    return handleError(res, err, 'プロンプト生成失敗');
  }
});

app.get('/api/history', (req, res) => {
  try {
    const allFiles = fs.readdirSync(historyDir, { withFileTypes: true });
    const history = [];
    for (const entry of allFiles) {
      if (entry.isDirectory()) {
        const subfiles = fs.readdirSync(path.join(historyDir, entry.name));
        subfiles.forEach(f => {
          const content = fs.readFileSync(path.join(historyDir, entry.name, f), 'utf-8');
          history.push(JSON.parse(content));
        });
      }
    }
    res.json(history);
  } catch (err) {
    return handleError(res, err, '履歴取得エラー');
  }
});

app.get('/api/regenerate/:index', (req, res) => {
  try {
    const index = Number(req.params.index);
    const characters = fs.readdirSync(historyDir);
    let counter = 0;
    for (const char of characters) {
      const files = fs.readdirSync(path.join(historyDir, char));
      for (const f of files) {
        if (counter === index) {
          const filepath = path.join(historyDir, char, f);
          const content = JSON.parse(fs.readFileSync(filepath));
          return res.json(content);
        }
        counter++;
      }
    }
    res.status(404).json({ error: '履歴が見つかりません' });
  } catch (err) {
    return handleError(res, err, '再生成エラー');
  }
});

app.post('/api/feedback/:index', (req, res) => {
  try {
    const index = Number(req.params.index);
    const { like } = req.body;
    const characters = fs.readdirSync(historyDir);
    let counter = 0;
    for (const char of characters) {
      const files = fs.readdirSync(path.join(historyDir, char));
      for (const f of files) {
        if (counter === index) {
          const filepath = path.join(historyDir, char, f);
          const entry = JSON.parse(fs.readFileSync(filepath));
          entry.feedback = like ? 'like' : 'dislike';
          fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
          registerFeedback(entry);
          return res.json({ message: '👍 フィードバック反映しました' });
        }
        counter++;
      }
    }
    res.status(404).json({ error: 'フィードバック対象が見つかりません' });
  } catch (err) {
    return handleError(res, err, 'フィードバックエラー');
  }
});

app.get('/api/zip', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=prompt-history.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(historyDir, false);
    archive.finalize();
  } catch (err) {
    return handleError(res, err, 'ZIP出力エラー');
  }
});

app.get('/api/export/:index', (req, res) => {
  try {
    const index = Number(req.params.index);
    const characters = fs.readdirSync(historyDir);
    let counter = 0;
    for (const char of characters) {
      const files = fs.readdirSync(path.join(historyDir, char));
      for (const f of files) {
        if (counter === index) {
          return res.download(path.join(historyDir, char, f));
        }
        counter++;
      }
    }
    res.status(404).json({ error: 'エクスポート対象が見つかりません' });
  } catch (err) {
    return handleError(res, err, 'エクスポート失敗');
  }
});

app.listen(port, () => {
  console.log(`✅ Prompt Tool Server 起動: http://localhost:${port}`);
});
