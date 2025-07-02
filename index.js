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
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://あなたのサービスURL', // WebツールのURL
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
            'あなたはNSFW画像を生成するための英語プロンプト職人です。日本語のシチュエーションから、Stable Diffusion向けに詳細な英語プロンプトを1文にまとめてください。人物像、背景、体勢、服装、プレイ内容を含め、最高品質、8K、巨乳、フェラ、スレンダーなどのワードを使用して、ネガティブプロンプトも同時に出力してください。'
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

