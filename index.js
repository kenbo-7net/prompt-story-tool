import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { OpenAIApi, Configuration } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 静的ファイル（index.html）を返す
app.use(express.static(path.join(__dirname)));

app.post('/generate', async (req, res) => {
  const { situation } = req.body;

  const promptText = `シチュエーション「${situation}」に最適な画像生成プロンプトを以下形式で出力：
1. prompt（英語で）
2. ネガティブプロンプト
3. 推奨構図
4. LoRA候補`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: promptText }],
      temperature: 0.9
    });

    const output = completion.data.choices[0].message.content;

    const result = {
      prompt: '',
      negative_prompt: '',
      composition: '',
      lora: ''
    };

    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('prompt')) result.prompt = line.replace(/.*?:/, '').trim();
      else if (line.includes('ネガティブ')) result.negative_prompt = line.replace(/.*?:/, '').trim();
      else if (line.includes('構図')) result.composition = line.replace(/.*?:/, '').trim();
      else if (line.toLowerCase().includes('lora')) result.lora = line.replace(/.*?:/, '').trim();
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('エラーが発生しました');
  }
});

app.listen(port, () => {
  console.log(`サーバーの実行 http://localhost:${port}`);
});
