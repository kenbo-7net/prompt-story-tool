export function suggestLoRAStack(input) {
  const lower = input.toLowerCase();
  const stacks = [];

  const presets = [
    // ────── 姿勢・体位 ──────
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
    { keywords: ['座位', '対面座位'], name: '対面座位', url: 'https://civitai.com/models/face_to_face_sitting_LoRA' },
    { keywords: ['側位'], name: '側位', url: 'https://civitai.com/models/side_penetration_LoRA' },
    { keywords: ['立ちバック拘束'], name: '拘束立ちバック', url: 'https://civitai.com/models/standing_doggy_bondage_LoRA' },

    // ────── フェチ ──────
    { keywords: ['アヘ顔', 'イキ顔'], name: 'アヘ顔', url: 'https://civitai.com/models/ahegao_LoRA' },
    { keywords: ['白目', 'イキすぎ'], name: '白目アヘ顔', url: 'https://civitai.com/models/whiteout_ahegao_LoRA' },
    { keywords: ['羞恥'], name: '羞恥フェチ', url: 'https://civitai.com/models/shame_fetish_LoRA' },
    { keywords: ['絶頂'], name: '絶頂描写', url: 'https://civitai.com/models/orgasm_expression_LoRA' },
    { keywords: ['羞恥涙'], name: '涙描写', url: 'https://civitai.com/models/crying_fetish_LoRA' },

    // ────── オーラル系 ──────
    { keywords: ['フェラ', '口内'], name: 'フェラチオ', url: 'https://civitai.com/models/blowjob_LoRA' },
    { keywords: ['イラマチオ', '喉奥'], name: 'イラマチオ', url: 'https://civitai.com/models/deepthroat_LoRA' },
    { keywords: ['顔面騎乗'], name: '顔面騎乗', url: 'https://civitai.com/models/face_sitting_LoRA' },

    // ────── 手や胸 ──────
    { keywords: ['手マン'], name: '手マン挿入', url: 'https://civitai.com/models/fingering_LoRA' },
    { keywords: ['乳首責め'], name: '乳首責め', url: 'https://civitai.com/models/nipple_torture_LoRA' },
    { keywords: ['パイズリ'], name: 'パイズリ', url: 'https://civitai.com/models/paizuri_LoRA' },

    // ────── 精液・射精 ──────
    { keywords: ['顔射', 'ぶっかけ'], name: '顔射LoRA', url: 'https://civitai.com/models/facial_cumshot_LoRA' },
    { keywords: ['中出し'], name: '中出しLoRA', url: 'https://civitai.com/models/internal_ejaculation_LoRA' },
    { keywords: ['精液', '射精'], name: '大量射精', url: 'https://civitai.com/models/massive_ejaculation_LoRA' },

    // ────── 玩具・道具 ──────
    { keywords: ['バイブ', 'ディルド'], name: 'バイブ挿入', url: 'https://civitai.com/models/dildo_insertion_LoRA' },
    { keywords: ['ローター', '玩具'], name: 'ローター責め', url: 'https://civitai.com/models/vibrator_toy_LoRA' },
    { keywords: ['電マ'], name: '電マ責め', url: 'https://civitai.com/models/denma_LoRA' },
    { keywords: ['アナル'], name: 'アナル挿入', url: 'https://civitai.com/models/anal_penetration_LoRA' },
    { keywords: ['スパンキング', 'お尻叩き'], name: 'スパンキング', url: 'https://civitai.com/models/spanking_LoRA' },
    { keywords: ['縄', '緊縛'], name: '緊縛', url: 'https://civitai.com/models/rope_bondage_LoRA' },

    // ────── 羞恥・快楽落ち系 ──────
    { keywords: ['羞恥', '快楽堕ち'], name: '快楽堕ち', url: 'https://civitai.com/models/corruption_LoRA' },
    { keywords: ['目隠し'], name: '目隠しプレイ', url: 'https://civitai.com/models/blindfold_LoRA' },
    { keywords: ['拘束'], name: '拘束プレイ', url: 'https://civitai.com/models/restraint_LoRA' },
    { keywords: ['陵辱'], name: 'ハード陵辱', url: 'https://civitai.com/models/hard_rape_LoRA' },
    { keywords: ['輪姦', '多人数'], name: '輪姦LoRA', url: 'https://civitai.com/models/gangbang_LoRA' }

    // 🟨 さらに拡張可（最大100種〜）
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

