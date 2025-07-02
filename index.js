import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://your-deployed-site-url.com',
    'X-Title': 'Prompt Story Tool'
  }
});

// 画像キャプション生成API
app.post('/api/caption', async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: '画像がアップロードされていません' });
  }

  const image = req.files.image;
  const uploadPath = `uploads/${Date.now()}_${image.name}`;
  await image.mv(uploadPath);

  try {
    const base64Image = fs.readFileSync(uploadPath, { encoding: 'base64' });

    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'あなたはBLIPのような画像理解AIです。画像内容を詳細に分析して、人物像、背景、状況、体勢、服装を含めた日本語のキャプションを1文で出力してください。'
        },
        {
          role: 'user',
          content: `画像: data:image/jpeg;base64,${base64Image}`
        }
      ],
      temperature: 0.7
    });

    const caption = response.choices[0].message.content;
    res.json({ caption });
  } catch (err) {
    console.error('❌ キャプション生成エラー:', err);
    res.status(500).json({ error: 'キャプション生成に失敗しました' });
  }
});

// キャプション → プロンプト生成
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
            'あなたはNSFW画像を生成するプロンプト職人です。日本語のシチュエーションから、Stable Diffusion用の高品質な英語プロンプトを生成しなさい。以下の要素を含めること：人物像、背景、体勢、服装、プレイ内容。また、最高品質、8K、映画照明、ヌード、巨乳などの詳細も盛り込み、ネガティブプロンプトも最後に記載。最後に必要なLoRAがあれば "Recommended LoRA: xxx" 形式で提案してください。'
        },
        {
          role: 'user',
          content: `シチュエーション: ${situation}`
        }
      ],
      temperature: 0.85
    });

    const reply = response.choices[0].message.content;
    res.json({ prompt: reply });
  } catch (err) {
    console.error('❌ プロンプト生成エラー:', err);
    res.status(500).json({ error: 'プロンプト生成に失敗しました' });
  }
});

app.listen(port, () => {
  console.log(`✅ サーバー実行中: http://localhost:${port}`);
});


