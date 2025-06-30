import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate', async (req, res) => {
  const { situation } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '与えられたシチュエーションに基づいて、英語の画像生成用プロンプトを構成してください。人物像、背景、服装、体勢、行為内容、必要なLoRA名、ネガティブプロンプトを含めて構成してください。',
        },
        {
          role: 'user',
          content: situation,
        },
      ],
    });

    const result = completion.choices[0].message.content;
    res.send({ result });
  } catch (error) {
    console.error('エラー:', error.message);
    res.status(500).send('エラーが発生しました');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
