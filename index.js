const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('プロンプトストーリーツール、起動完了やで！');
});

app.listen(port, () => {
  console.log(`サーバーがポート${port}で起動しました`);
});
