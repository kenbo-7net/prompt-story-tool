import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import archiver from 'archiver';

const app = express();
const port = process.env.PORT || 10000;

// Load .env
dotenv.config();

// Init OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Prompt Generator Endpoint
app.post('/generate', async (req, res) => {
  try {
    const situation = req.body.situation;
    const gptResponse = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert prompt generator for Stable Diffusion. Based on the user's erotic story setting, you will decompose it into background, character, outfit, pose, play, and generate an English prompt, negative prompt, and suggest required LoRA models if needed.'
        },
        {
          role: 'user',
          content: `シチュエーション: ${situation}`
        }
      ],
      model: 'gpt-4o'
    });

    const reply = gptResponse.choices[0].message.content;
    const timestamp = new Date().toISOString();
    fs.appendFileSync('logs.txt', `\n[${timestamp}]\n${situation}\n${reply}\n`);
    res.send({ result: reply });
  } catch (error) {
    console.error(error);
    res.status(500).send('プロンプト生成中にエラーが発生しました');
  }
});

// Zip logs route
app.get('/download-logs', (req, res) => {
  const output = fs.createWriteStream('logs.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    res.download('logs.zip');
  });

  archive.pipe(output);
  archive.file('logs.txt', { name: 'logs.txt' });
  archive.finalize();
});

app.listen(port, () => {
  console.log(`サーバー実行中: http://localhost:${port}`);
});
