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
    'HTTP-Referer': 'https://あなたのサービスURL',
    'X-Title': 'Prompt Story Tool'
  }
});

// ✅ プロンプト生成
app.post('/api/generate', upload.single('image'), async (req, res) => {
  const { situation, model, character, structure } = req.body;
  if (!situation || !model) return res.status(400).json({ error: 'シチュエーションとモデル名が必要です' });

  try {
    const messages = [
      {
        role: 'system',
        content: 'あなたはNSFW画像のプロンプト職人です。入力された日本語の説明をもとに、英語プロンプト・ネガティブプロンプト・LoRA提案を出力してください。'
      },
      {
        role: 'user',
        content: `シチュエーション: ${situation}\n構図: ${structure || '不明'}\nキャラ: ${character || '不明'}\nモデル: ${model}`
      }
    ];

    const response = await openai.chat.completions.create({ model, messages, temperature: 0.8 });
    const reply = response.choices[0].message.content;
    const prompt = reply.split('Negative Prompt:')[0].trim();
    const negative_prompt = (reply.split('Negative Prompt:')[1] || '').split('LoRA Suggestion:')[0].trim();
    const loras = suggestLoRAStack(situation + structure);

    const characterDir = character ? path.join(historyDir, character) : historyDir;
    if (!fs.existsSync(characterDir)) fs.mkdirSync(characterDir, { recursive: true });

    const historyEntry = {
      prompt, negative_prompt, model, character, structure,
      lora_suggestions: loras,
      timestamp: new Date().toISOString(),
      feedback: null
    };

    const filename = `history_${Date.now()}.json`;
    fs.writeFileSync(path.join(characterDir, filename), JSON.stringify(historyEntry, null, 2));

    res.json(historyEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'プロンプト生成失敗' });
  }
});

// ✅ 履歴取得
app.get('/api/history', (req, res) => {
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
});

// ✅ 再生成API
app.get('/api/regenerate/:index', (req, res) => {
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
});

// ✅ フィードバックAPI
app.post('/api/feedback/:index', (req, res) => {
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
});

// ✅ ZIP出力
app.get('/api/zip', (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=prompt-history.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(historyDir, false);
  archive.finalize();
});

// ✅ 出力DL
app.get('/api/export/:index', (req, res) => {
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
});

app.listen(port, () => {
  console.log(`✅ Prompt Tool Server 起動: http://localhost:${port}`);
});

