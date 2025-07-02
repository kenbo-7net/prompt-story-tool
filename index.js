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

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://your-service-url.com',
    'X-Title': 'Prompt Story Tool'
  }
});

// プロンプト生成API
app.post('/api/generate', async (req, res) => {
  const { situation } = req.body;

  if (!situation) return res.status(400).json({ error: 'situation が必要です' });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'あなたはNSFW画像生成プロンプトの専門家です。高品質なアニメ調画像の英語プロンプトを、人物像・背景・体位・服装・プレイ内容に分解して構成し、最終的に一文にまとめて出力してください。ネガティブプロンプトも付けてください。'
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
    console.error('❌ 生成エラー:', err);
    res.status(500).json({ error: 'プロンプト生成に失敗しました' });
  }
});

// キャプション生成API（画像からシチュエーション抽出）
app.post('/api/caption', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'あなたは画像から状況説明を英語で出力するAIです。画像を説明するシチュエーションキャプションを返してください。'
        },
        {
          role: 'user',
          content: '次の画像の内容を描写してください。',
          file: imagePath
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

app.listen(port, () => {
  console.log(`✅ サーバー起動: http://localhost:${port}`);
});


