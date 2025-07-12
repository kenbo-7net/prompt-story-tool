const profile = require('./user-profile');

const history = [
  { loras: ['vtuberShame_v1', 'liveStreamAccident_v2'] },
  { loras: ['vtuberShame_v1'] },
  { loras: ['animeLineSharp_v2'] }
];

const top5 = profile.analyzeHistory(history);
console.log(top5); // 頻出LoRA順に並ぶ
