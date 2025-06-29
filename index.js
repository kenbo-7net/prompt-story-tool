
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const archiver = require('archiver');

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || 'sk-xxxxxxxx',
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let history = [];

// プロンプト生成API
app.post('/generate', async (req, res) => {
  const { situation, model, lora } = req.body;

  const prompt = `以下の日本語のシチュエーションを、Stable Diffusion用の英語プロンプトに変換し、人物・構図・背景・服装・プレイ内容に分割して詳細に英訳して。lora=${lora}。状況: ${situation}`;

  try {
    const response = await openai.createChatCompletion({
      model: model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    const result = response.data.choices[0].message.content;

    // ログに保存
    const log = { prompt, result, date: new Date().toISOString() };
    history.push(log);

    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).send('生成に失敗しました');
  }
});

// 履歴を表示
app.get('/history', (req, res) => {
  res.json(history);
});

// ZIP出力
app.get('/download', (req, res) => {
  const zipPath = path.join(__dirname, 'prompt_logs.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip');

  output.on('close', () => res.download(zipPath));
  archive.on('error', err => res.status(500).send({ error: err.message }));

  archive.pipe(output);
  history.forEach((item, index) => {
    archive.append(item.result, { name: `prompt_${index + 1}.txt` });
  });
  archive.finalize();
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動中`);
});
