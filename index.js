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

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// メインのプロンプト生成API
app.post('/api/generate', async (req, res) => {
  const { situation } = req.body;

  if (!situation) {
    return res.status(400).json({ error: 'situation が必要です' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたはAI画像生成用のプロンプト職人です。入力された日本語のシチュエーションから、アニメ調の高品質画像を生成するための詳細な英語プロンプトを出力してください。人物像、背景、体勢、服装、プレイ内容に分解して記述し、英語で1つのプロンプト文として完成させてください。ネガティブプロンプトも自動で出力してください。'
        },
        {
          role: 'user',
          content: `シチュエーション: ${situation}`
        }
      ],
      temperature: 0.8,
    });

    const reply = response.choices[0].message.content;
    res.json({ prompt: reply });
  } catch (err) {
    console.error('❌ APIエラー:', err);
    res.status(500).json({ error: 'プロンプト生成に失敗しました' });
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});
