module.exports = {
  analyzeHistory: (historyList) => {
    const freq = {};
    for (const item of historyList) {
      item.loras.forEach(l => freq[l] = (freq[l] || 0) + 1);
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }
};
