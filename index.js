const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('プロンプトストーリーツール、動いてるで！');
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動中やで`);
});
