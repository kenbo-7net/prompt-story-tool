const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || "sk-xxxxxxx", // 本番は.envで管理推奨
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate', async (req, res) => {
  const { situation } = req.body;

  try {
    const prompt = `以下の日本語のシチュエーションを、Stable Diffusion用の英語プロンプトに変換し、人物像・構図・服装・背景・プレイ内容に分類して詳細に書き出して。:\n\n「${situation}」`;

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const result = response.data.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).send('生成に失敗しました');
  }
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動中`);
});
