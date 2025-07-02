import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// OpenRouterクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ← .env に合わせた
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://prompt-story-tool.onrender.com', // ← あなたのサイトURL
    'X-Title': 'Prompt Story Tool'
  }
});

// プロンプト生成API
app.post('/api/generate', async (req, res) => {
  const { situation } = req.body;

  if (!situation) {
    return res.status(400).json({ error: 'situation が必要です' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content:
            'あなたはNSFWイラストを生成するためのプロンプトエンジニアです。以下の日本語シチュエーションをもとに、Stable Diffusion向けの高品質なプロンプト（英語）を作成してください。\n\n' +
            '・人物の特徴（髪型・体型・表情・服装）\n' +
            '・シチュエーション（背景や場所）\n' +
            '・プレイ内容（NSFW表現あり）\n' +
            '・明確な構図（例：見上げ構図、横顔、後部座席など）\n\n' +
            '出力形式：\nPrompt: ～\nNegative Prompt: ～'
        },
        {
          role: 'user',
          content: `シチュエーション: ${situation}`
        }
      ],
      temperature: 0.8
    });

    const reply = response.choices[0].message.content;

    res.json({ prompt: reply });
  } catch (err) {
    console.error('❌ APIエラー:', err);
    res.status(500).json({ error: 'プロンプト生成に失敗しました' });
  }
});

app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});


