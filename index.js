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

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.8
    });

    const reply = response.choices[0].message.content;
    const prompt = reply.split('Negative Prompt:')[0].trim();
    const negative_prompt = (reply.split('Negative Prompt:')[1] || '').split('LoRA Suggestion:')[0].trim();
    const loras = suggestLoRAStack(situation + structure);

    const historyEntry = {
      prompt,
      negative_prompt,
      model,
      character,
      structure,
      lora_suggestions: loras,
      timestamp: new Date().toISOString()
    };

    const filename = `history_${Date.now()}.json`;
    fs.writeFileSync(path.join(historyDir, filename), JSON.stringify(historyEntry, null, 2));

    res.json(historyEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'プロンプト生成失敗' });
  }
});

// ✅ 履歴取得
app.get('/api/history', (req, res) => {
  const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json'));
  const history = files.map(f => {
    const content = fs.readFileSync(path.join(historyDir, f), 'utf-8');
    return JSON.parse(content);
  });
  res.json(history);
});

// ✅ フィードバック受け取り
app.post('/api/feedback/:index', (req, res) => {
  const index = Number(req.params.index);
  const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json'));
  if (index < 0 || index >= files.length) return res.status(400).json({ error: '無効なインデックス' });

  const filePath = path.join(historyDir, files[index]);
  const history = JSON.parse(fs.readFileSync(filePath));
  registerFeedback(history);
  res.json({ message: '👍 ありがとう！学習に活かします' });
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

// ✅ WebUI連携 or JSON出力（簡易）
app.get('/api/export/:index', (req, res) => {
  const index = Number(req.params.index);
  const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json'));
  if (index < 0 || index >= files.length) return res.status(400).json({ error: '無効なインデックス' });
  const filePath = path.join(historyDir, files[index]);
  res.download(filePath);
});

app.listen(port, () => {
  console.log(`✅ Prompt Tool Server 起動: http://localhost:${port}`);
});

