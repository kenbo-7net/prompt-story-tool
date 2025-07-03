import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// ✅ 初期化
const app = express();
const port = process.env.PORT || 10000;
const historyDir = path.join(os.tmpdir(), 'prompt-history');

// ✅ 履歴保存フォルダの作成
if (!fs.existsSync(historyDir)) {
  fs.mkdirSync(historyDir, { recursive: true });
}

// ✅ ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

// ✅ OpenRouter API
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://あなたのサービスURL',
    'X-Title': 'Prompt Story Tool'
  }
});

// ✅ プロンプト生成API
app.post('/api/generate', upload.single('image'), async (req, res) => {
  const { situation, model } = req.body;

  if (!situation) return res.status(400).json({ error: 'situationが必要です' });

  try {
    const messages = [
      {
        role: 'system',
        content:
          'あなたはNSFW画像用のプロンプト職人です。日本語シチュエーションからStable Diffusion用英語プロンプト、ネガティブプロンプトを生成し、LoRA提案を出します。'
      },
      {
        role: 'user',
        content: `シチュエーション: ${situation}`
      }
    ];

    const response = await openai.chat.completions.create({
      model: model || process.env.MODEL_NAME,
      messages,
      temperature: 0.8
    });

    const reply = response.choices[0].message.content;

    // ✅ 履歴保存
    const historyEntry = {
      prompt: reply,
      negative_prompt: '[Negative Prompt]', // 実装時に必要に応じて分離
      model: model || process.env.MODEL_NAME,
      timestamp: new Date().toISOString()
    };

    const filename = `history_${Date.now()}.json`;
    const filepath = path.join(historyDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(historyEntry, null, 2));

    res.json({ prompt: reply });
  } catch (err) {
    console.error('❌ APIエラー:', err);
    res.status(500).json({ error: 'プロンプト生成に失敗しました' });
  }
});

// ✅ ZIPエクスポート
import archiver from 'archiver';
app.get('/api/export-zip', (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=prompt-history.zip');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(historyDir, false);
  archive.finalize();
});

// ✅ サーバー起動
app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});
