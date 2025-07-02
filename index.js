import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

// OpenRouter API 初期化
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://your-domain.com',
    'X-Title': 'Prompt Story Tool'
  }
});

// 画像キャプション生成API（BLIP or CLIP）
app.post('/api/caption', upload.single('image'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: '画像の内容を分析し、どんなシチュエーションか説明文を出力してください。短く明確に日本語で書いてください。'
        },
        {
          role: 'user',
          content: `画像（base64）:${fileBuffer}`
        }
      ]
    });

    const caption = response.choices[0].message.content;
    res.json({ caption });
  } catch (err) {
    console.error('❌ キャプション生成エラー:', err);
    res.status(500).json({ error: 'キャプション生成に失敗しました' });
  }
});

// プロンプト生成API（エロ・NSFW特化）
app.post('/api/generate', async (req, res) => {
  const { situation } = req.body;

  if (!situation) return res.status(400).json({ error: 'situation が必要です' });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: `あなたはNSFW画像用のプロンプト職人です。入力された日本語シチュエーションからStable Diffusion向けに詳細な英語プロンプトを出力してください。以下を満たす構成：
- 最高品質、8K、高解像度、映画的ライティング
- 美少女アニメ調、銀髪、スレンダー、巨乳
- 行為の描写（フェラ、膝立ち、涙目など）
- ネガティブプロンプトも一緒に出力
- 1文でまとめて構成`
        },
        {
          role: 'user',
          content: `シチュエーション: ${situation}`
        }
      ],
      temperature: 0.9
    });

    const prompt = response.choices[0].message.content;
    res.json({ prompt });
  } catch (err) {
    console.error('❌ プロンプト生成エラー:', err);
    res.status(500).json({ error: 'プロンプト生成に失敗しました' });
  }
});

app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});

