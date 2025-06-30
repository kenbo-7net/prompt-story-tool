const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const systemPrompt = req.body.systemPrompt;

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const result = chatCompletion.choices[0].message.content.trim();
    res.send({ result });
  } catch (error) {
    console.error(error);
    res.status(500).send('エラーが発生しました');
  }
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動中やで`);
});
