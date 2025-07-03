const fs = require('fs');
const path = require('path');

const historyPath = path.join(__dirname, 'history.json');

function addFeedback(index) {
  const data = JSON.parse(fs.readFileSync(historyPath));
  if (data[index]) {
    data[index].feedback = (data[index].feedback || 0) + 1;
    fs.writeFileSync(historyPath, JSON.stringify(data, null, 2));
  }
}

module.exports = { addFeedback };
