const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <form action="/generate" method="post">
      <label>シチュエーションを入力：</label><br>
      <textarea name="situation" rows="6" cols="50"></textarea><br>
      <button type="submit">プロンプト生成</button>
    </form>
  `);
});

app.post('/generate', (req, res) => {
  const input = req.body.situation;

  // ↓ここに実際のプロンプト生成処理（仮でそのまま返す）
  const prompt = `Prompt: ${input} を英語でプロンプトに変換しました`;

  res.send(`<p>生成されたプロンプト：</p><textarea rows="10" cols="60">${prompt}</textarea><br><a href="/">戻る</a>`);
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動中やで`);
});
