export function suggestLoRAStack(input) {
  const lower = input.toLowerCase();
  const stacks = [];

  const presets = [
    // ──────────────── 姿勢・体位 ────────────────
    { keywords: ['正常位', 'missionary'], name: '正常位基本', url: 'https://civitai.com/models/missionary_position_LoRA' },
    { keywords: ['正常位', '首絞め'], name: '首絞め正常位', url: 'https://civitai.com/models/choke_missionary_LoRA' },
    { keywords: ['バック', 'doggy', '後背位'], name: 'バック基本', url: 'https://civitai.com/models/doggy_style_LoRA' },
    { keywords: ['バック', '片足'], name: '片足バック', url: 'https://civitai.com/models/one_leg_doggy_LoRA' },
    { keywords: ['立ちバック'], name: '立ちバック', url: 'https://civitai.com/models/standing_doggy_LoRA' },
    { keywords: ['騎乗位', 'cowgirl'], name: '騎乗位基本', url: 'https://civitai.com/models/cowgirl_LoRA' },
    { keywords: ['背面騎乗位', 'reverse cowgirl'], name: '背面騎乗位', url: 'https://civitai.com/models/reverse_cowgirl_LoRA' },
    { keywords: ['m字', 'M字', '開脚'], name: 'M字開脚', url: 'https://civitai.com/models/m_leg_spread_LoRA' },
    { keywords: ['拘束', '手枷'], name: '拘束正常位', url: 'https://civitai.com/models/bondage_missionary_LoRA' },
    { keywords: ['足掛け', '膝抱え'], name: '足掛け騎乗位', url: 'https://civitai.com/models/leghook_cowgirl_LoRA' },

    // ──────────────── フェチ ────────────────
    { keywords: ['アヘ顔', 'イキ顔'], name: 'アヘ顔', url: 'https://civitai.com/models/ahegao_LoRA' },
    { keywords: ['白目', 'イキすぎ'], name: '白目アヘ顔', url: 'https://civitai.com/models/whiteout_ahegao_LoRA' },
    { keywords: ['手マン'], name: '手マン挿入', url: 'https://civitai.com/models/fingering_LoRA' },
    { keywords: ['フェラ', '口内'], name: 'フェラチオ', url: 'https://civitai.com/models/blowjob_LoRA' },
    { keywords: ['パイズリ'], name: 'パイズリ', url: 'https://civitai.com/models/paizuri_LoRA' },
    { keywords: ['乳首責め'], name: '乳首責め', url: 'https://civitai.com/models/nipple_torture_LoRA' },
    { keywords: ['スパンキング', 'お尻叩き'], name: 'スパンキング', url: 'https://civitai.com/models/spanking_LoRA' },
    { keywords: ['潮吹き'], name: '潮吹き', url: 'https://civitai.com/models/squirt_LoRA' },

    // ──────────────── 玩具系 ────────────────
    { keywords: ['バイブ', 'ディルド'], name: 'バイブ挿入', url: 'https://civitai.com/models/dildo_insertion_LoRA' },
    { keywords: ['ローター', '玩具'], name: 'ローター責め', url: 'https://civitai.com/models/vibrator_toy_LoRA' },
    { keywords: ['電マ'], name: '電マ責め', url: 'https://civitai.com/models/denma_LoRA' },
    { keywords: ['アナル'], name: 'アナル挿入', url: 'https://civitai.com/models/anal_penetration_LoRA' },

    // ──────────────── 精液描写 ────────────────
    { keywords: ['顔射', 'ぶっかけ'], name: '顔射LoRA', url: 'https://civitai.com/models/facial_cumshot_LoRA' },
    { keywords: ['中出し'], name: '中出しLoRA', url: 'https://civitai.com/models/internal_ejaculation_LoRA' },
    { keywords: ['精液', '射精'], name: '大量射精', url: 'https://civitai.com/models/massive_ejaculation_LoRA' },

    // ──────────────── その他拡張例（さらに追加）──────────────
    // 以下に70〜100種類を追加可能（ニーズに応じて分割管理 or JSON化でもOK）
  ];

  for (const preset of presets) {
    if (preset.keywords.some(kw => lower.includes(kw))) {
      stacks.push({ name: preset.name, url: preset.url });
    }
  }

  if (stacks.length === 0) {
    stacks.push({
      name: '正常位デフォルト',
      url: 'https://civitai.com/models/missionary_position_LoRA'
    });
  }

  return stacks;
}


  return stacks;
}
