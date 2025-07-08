export function suggestLoRAStack(input) {
  const lower = input.toLowerCase();
  const stacks = [];

  // カテゴリ定義（将来的にはDBやJSON管理に移行可）
  const categories = [
    {
      title: '姿勢・体位',
      presets: [
        { keywords: ['正常位', 'missionary'], name: '正常位基本', url: 'https://civitai.com/models/missionary_position_LoRA' },
        { keywords: ['首絞め'], name: '首絞め正常位', url: 'https://civitai.com/models/choke_missionary_LoRA' },
        { keywords: ['バック', '後背位', 'doggy'], name: 'バック基本', url: 'https://civitai.com/models/doggy_style_LoRA' },
        { keywords: ['立ちバック'], name: '立ちバック', url: 'https://civitai.com/models/standing_doggy_LoRA' },
        { keywords: ['騎乗位', 'cowgirl'], name: '騎乗位基本', url: 'https://civitai.com/models/cowgirl_LoRA' },
        { keywords: ['m字', '開脚'], name: 'M字開脚', url: 'https://civitai.com/models/m_leg_spread_LoRA' },
        { keywords: ['対面座位', '座位'], name: '対面座位', url: 'https://civitai.com/models/face_to_face_sitting_LoRA' },
        { keywords: ['側位'], name: '側位', url: 'https://civitai.com/models/side_penetration_LoRA' }
      ]
    },
    {
      title: 'フェチ・羞恥',
      presets: [
        { keywords: ['アヘ顔', 'イキ顔'], name: 'アヘ顔', url: 'https://civitai.com/models/ahegao_LoRA' },
        { keywords: ['白目', 'イキすぎ'], name: '白目アヘ顔', url: 'https://civitai.com/models/whiteout_ahegao_LoRA' },
        { keywords: ['涙', '羞恥'], name: '羞恥涙', url: 'https://civitai.com/models/crying_fetish_LoRA' },
        { keywords: ['快楽堕ち'], name: '快楽堕ち', url: 'https://civitai.com/models/corruption_LoRA' }
      ]
    },
    {
      title: 'オーラル・顔射',
      presets: [
        { keywords: ['フェラ', '口内'], name: 'フェラチオ', url: 'https://civitai.com/models/blowjob_LoRA' },
        { keywords: ['イラマチオ', '喉奥'], name: 'イラマチオ', url: 'https://civitai.com/models/deepthroat_LoRA' },
        { keywords: ['顔射'], name: '顔射LoRA', url: 'https://civitai.com/models/facial_cumshot_LoRA' }
      ]
    },
    {
      title: '道具・責め',
      presets: [
        { keywords: ['手マン'], name: '手マン挿入', url: 'https://civitai.com/models/fingering_LoRA' },
        { keywords: ['バイブ'], name: 'バイブ挿入', url: 'https://civitai.com/models/dildo_insertion_LoRA' },
        { keywords: ['電マ'], name: '電マ責め', url: 'https://civitai.com/models/denma_LoRA' },
        { keywords: ['スパンキング'], name: 'お尻叩き', url: 'https://civitai.com/models/spanking_LoRA' }
      ]
    },
    {
      title: '射精描写',
      presets: [
        { keywords: ['中出し'], name: '中出しLoRA', url: 'https://civitai.com/models/internal_ejaculation_LoRA' },
        { keywords: ['精液', '射精'], name: '大量射精', url: 'https://civitai.com/models/massive_ejaculation_LoRA' }
      ]
    },
    {
      title: '拘束・多人数',
      presets: [
        { keywords: ['拘束', '手枷'], name: '拘束プレイ', url: 'https://civitai.com/models/restraint_LoRA' },
        { keywords: ['目隠し'], name: '目隠しプレイ', url: 'https://civitai.com/models/blindfold_LoRA' },
        { keywords: ['輪姦', '多人数'], name: '輪姦LoRA', url: 'https://civitai.com/models/gangbang_LoRA' },
        { keywords: ['陵辱'], name: 'ハード陵辱', url: 'https://civitai.com/models/hard_rape_LoRA' }
      ]
    }
  ];

  for (const cat of categories) {
    for (const preset of cat.presets) {
      if (preset.keywords.some(kw => lower.includes(kw))) {
        stacks.push({ category: cat.title, name: preset.name, url: preset.url });
      }
    }
  }

  // デフォルト提示
  if (stacks.length === 0) {
    stacks.push({ category: '姿勢・体位', name: '正常位デフォルト', url: 'https://civitai.com/models/missionary_position_LoRA' });
  }

  return stacks;
}

