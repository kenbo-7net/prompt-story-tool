import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(fileUpload());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://あなたのサイトURL',
    'X-Title': 'PromptStoryTool'
  }
});

// キャプション生成
app.post('/api/caption', async (req, res) => {
  const file = req.files?.image;
  if (!file) return res.status(400).json({ error: '画像ファイルが必要です' });

  const base64Image = file.data.toString('base64');

  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        { role: 'system', content: '画像内容を説明するキャプションを英語で出力してください。' },
        { role: 'user', content: `base64 image:
${base64Image}` }
      ]
    });
    res.json({ caption: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'キャプション生成失敗' });
  }
});

// プロンプト生成
app.post('/api/generate', async (req, res) => {
  const { situation, imageCaption } = req.body;
  const basePrompt = situation || imageCaption;

  if (!basePrompt) return res.status(400).json({ error: 'situation または imageCaption が必要です' });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        { role: 'system', content: 'NSFWプロンプト職人として、英語の構成プロンプトとネガティブプロンプトをStable Diffusion向けに構築してください。' },
        { role: 'user', content: `シチュエーション: ${basePrompt}` }
      ]
    });
    res.json({ prompt: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'プロンプト生成失敗' });
  }
});

// LoRA提案
app.post('/api/lora-suggest', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'プロンプトが必要です' });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        { role: 'system', content: '以下のプロンプトに適したLoRAモデル名を最大3つ提案してください。' },
        { role: 'user', content: prompt }
      ]
    });
    res.json({ lora: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'LoRA提案失敗' });
  }
});

app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});


