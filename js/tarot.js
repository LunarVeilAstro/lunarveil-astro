// tarot.js — Card helpers, interpretation engine, draw/flip UI, single tarot
// Depends on: astronomy.js (shuffle, escHtml), data.js (MAJOR_ARCANA, MINOR_SUITS)
function _cardT(card, field) {
  // Return language-appropriate card text for the given field (up/rev/love/career/advice)
  const isEn = window._lang && window._lang() === 'en';
  const enField = field + '_EN';
  if (isEn && card[enField]) return card[enField];
  return card[field] || '';
}

function buildDeck() {
  const deck = [];
  for (const card of MAJOR_ARCANA) {
    deck.push({ ...card, type:'major', id:`major_${card.id}` });
  }
  const ELEMENTS_EN = {火:'Fire',土:'Earth',风:'Air',水:'Water'};
  for (const suit of MINOR_SUITS) {
    for (const c of suit.cards) {
      deck.push({
        ...c, name: suit.suit + c.rank,
        type:'minor', suit:suit.suit, element:suit.element,
        suitTheme:suit.theme, id:`${suit.en}_${c.en}`,
        suit_en: suit.en, element_en: ELEMENTS_EN[suit.element] || suit.element,
        suitTheme_en: suit.theme_en || suit.theme
      });
    }
  }
  return deck;
}

function analyzeQuestion(question) {
  const q = question.toLowerCase();
  const themes = [];
  if (/爱|情|恋|对象|男朋友|女朋友|老公|老婆|伴侣|分手|复合|婚姻|结婚|单相思|暗恋|喜欢/.test(q)) themes.push('爱情');
  if (/工作|事业|职业|老板|同事|跳槽|面试|升职|加薪|辞职|创业/.test(q)) themes.push('事业');
  if (/钱|财|收入|投资|理财|经济|债务|贷款|工资/.test(q)) themes.push('财运');
  if (/家人|父母|孩子|亲戚|家庭|妈|爸|兄弟|姐妹/.test(q)) themes.push('家庭');
  if (/健康|身体|病|不舒服|累|疲惫|失眠/.test(q)) themes.push('健康');
  if (/学习|考试|学校|大学|读书|成绩|毕业/.test(q)) themes.push('学业');
  if (/朋友|社交|人际|圈子|闺蜜|兄弟|关系/.test(q)) themes.push('人际');
  if (/自己|迷茫|人生|方向|意义|目标|选择|决定|怎么办/.test(q)) themes.push('人生方向');
  return themes.length > 0 ? themes : ['综合'];
}

function interpretCard(card, isReversed, position, questionThemes) {
  const isEn = window._lang && window._lang() === 'en';
  const rev = isReversed;
  let reading = '';
  const name = card.name || `${card.suit}${card.rank}`;
  const cardLabel = isEn ? (card.en || `${card.suit_en||card.suit} ${card.en||card.rank}`) : name;

  if (card.type === 'major') {
    const meaning = rev ? _cardT(card,'rev') : _cardT(card,'up');
    reading += `<strong>${cardLabel}</strong> ${rev?('<span class="reversed-badge">'+_L('逆位','Reversed')+'</span>'):''} — ${meaning}。`;

    const primaryTheme = questionThemes[0];
    if (primaryTheme === '爱情' && _cardT(card,'love')) {
      reading += `<br><br>💕 <em>` + _L('感情方面：','Love: ') + `</em>${rev ? _L('逆位提示需要反思：','Reversed suggests reflection: ') : ''}${_cardT(card,'love')}`;
    } else if (primaryTheme === '事业' && _cardT(card,'career')) {
      reading += `<br><br>💼 <em>` + _L('事业方面：','Career: ') + `</em>${rev ? _L('逆位提示需要警惕：','Reversed warns caution: ') : ''}${_cardT(card,'career')}`;
    }
    if (_cardT(card,'advice')) {
      reading += `<br><br>🔮 <em>` + _L('宇宙建议：','Cosmic Advice: ') + `</em>${_cardT(card,'advice')}`;
    }
  } else {
    const meaning = rev ? (_cardT(card,'rev') || _cardT(card,'up') + _L('（逆位）',' (Reversed)')) : _cardT(card,'up');
    const elemLabel = (isEn ? (card.element_en||card.element) : card.element) + (isEn ? ' Element' : '元素');
    const themeLabel = isEn ? (card.suitTheme_en||card.suitTheme) : card.suitTheme;
    reading += `<strong>${cardLabel}</strong> ${rev?('<span class="reversed-badge">'+_L('逆位','Reversed')+'</span>'):''} <span style="color:var(--text-dim)">${elemLabel} · ${themeLabel}</span>`;
    reading += `<br><br>${meaning}`;

    const primaryTheme = questionThemes[0];
    if (primaryTheme === '爱情' && _cardT(card,'love')) {
      reading += `<br><br>💕 <em>` + _L('感情方面：','Love: ') + `</em>${_cardT(card,'love')}`;
    } else if (primaryTheme === '事业' && _cardT(card,'career')) {
      reading += `<br><br>💼 <em>` + _L('事业方面：','Career: ') + `</em>${_cardT(card,'career')}`;
    }
    if (_cardT(card,'advice')) {
      reading += `<br><br>🔮 <em>` + _L('宇宙建议：','Cosmic Advice: ') + `</em>${_cardT(card,'advice')}`;
    }
  }

  return reading;
}

function synthesizeReading(cards, positions, question, questionThemes) {
  const isEn = window._lang && window._lang() === 'en';
  let syn = '';
  const count = cards.length;
  const majorCards = cards.filter(c => c.type === 'major');
  const minorCards = cards.filter(c => c.type === 'minor');
  const reversedCards = cards.filter(c => c.isReversed);
  const hasMajor = majorCards.length;
  const hasReversed = reversedCards.length;

  syn += `<div class="tarot-synthesis">`;

  // ── 1. Opening ──
  syn += (isEn
    ? `<p>Regarding your question "<span class="highlight">${question}</span>", the spread reveals the following deeper insights:</p>`
    : `<p>关于你的问题「<span class="highlight">${question}</span>」，牌阵为你揭示了以下深层信息：</p>`);

  // ── 2. Major Arcana significance ──
  if (hasMajor === count) {
    syn += (isEn
      ? `<p>🔥 <strong>All Major Arcana</strong> — this is not about daily trivialities, but a major turning point at the level of destiny. The Universe is speaking directly to you. Every card is a milestone on your soul\'s journey. Take this reading very seriously.</p>`
      : `<p>🔥 <strong>全部为大阿卡纳</strong> — 这不是日常小事，而是命运层面的重要转折。宇宙在直接对你说话，每一张牌都是灵魂旅程中的一个里程碑。请格外重视这次解读。</p>`);
  } else if (hasMajor >= 2) {
    const majorNames = majorCards.map(c => isEn ? (c.en||c.name) : c.name).join('、');
    syn += (isEn
      ? `<p>🌟 <strong>${hasMajor} Major Arcana cards</strong> (${majorNames}) appearing together — this question goes far beyond daily trivialities. It touches the core themes of your life. The Major Arcana are soul teachers — their presence means you stand at an important point of growth.</p>`
      : `<p>🌟 <strong>${hasMajor}张大阿卡纳</strong>（${majorNames}）同时出现 — 这个问题远超日常琐事，它触及你生命中的核心课题。大阿卡纳是灵魂的导师，它们的出现意味着你正站在一个重要的成长节点上。</p>`);
  } else if (hasMajor === 1) {
    const mn = isEn ? (majorCards[0].en||majorCards[0].name) : majorCards[0].name;
    syn += (isEn
      ? `<p>✨ Major Arcana "${mn}" sets the soul-level tone for this reading. It is the core signal of the entire spread, with the remaining cards unfolding details around it.</p>`
      : `<p>✨ 大阿卡纳「${mn}」的出现，为这次解读定下了灵魂层面的基调。它是整个牌阵的核心信号，其余牌围绕它展开细节。</p>`);
  }

  // ── 3. Element analysis ──
  if (minorCards.length > 0) {
    const elemCount = { '火': 0, '水': 0, '风': 0, '土': 0 };
    minorCards.forEach(c => { if (elemCount[c.element] !== undefined) elemCount[c.element]++; });
    const elemEntries = Object.entries(elemCount).filter(([k, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const dominantElem = elemEntries[0];
    const domName = dominantElem[0];
    const domCount = dominantElem[1];

    const elemLabel = (e) => isEn ? ({火:'Fire',水:'Water',风:'Air',土:'Earth'})[e] : e;

    let elemMsg = '';
    if (domCount >= 2 && domCount === minorCards.length) {
      elemMsg = (isEn
        ? `All minor arcana in the spread are concentrated in a single element — <strong>${elemLabel(domName)}</strong>.`
        : `牌阵中所有小阿卡纳全部集中在一个元素——<strong>${domName}元素</strong>。`);
    } else if (domCount >= 2) {
      elemMsg = (isEn
        ? `The minor arcana are dominated by the <strong>${elemLabel(domName)} element</strong> (${domCount} cards)`
        : `小阿卡纳以<strong>${domName}元素</strong>为主导（${domCount}张）`);
      if (elemEntries.length > 1) {
        const rest = elemEntries.slice(1).map(([k, v]) => `${elemLabel(k)} (${v})`).join(', ');
        elemMsg += (isEn ? `, supplemented by ${rest}.` : `，辅以${rest}。`);
      }
    }

    if (elemMsg) {
      syn += `<p>⚖️ ${elemMsg}`;
      const elemReadings_ZH = {
        '火': '火元素主导意味着行动力、热情和创造力是当前的核心驱动力。你被推动着去主动出击、大胆表达。注意不要过于冲动。',
        '水': '水元素主导意味着情感、直觉和关系是当前的焦点。你的心在说话，感受比逻辑更重要。注意不要被情绪淹没。',
        '风': '风元素主导意味着思想、沟通和真理是当前的战场。清晰的思考和坦诚的交流是关键。注意不要过度分析和焦虑。',
        '土': '土元素主导意味着务实、稳定和物质是当前的主题。脚踏实地、耐心积累是最佳策略。注意不要陷入保守和僵化。'
      };
      const elemReadings_EN = {
        '火': 'Fire dominance means action, passion, and creativity are your core driving forces right now. You\'re being pushed to take initiative and express boldly. Be mindful not to be overly impulsive.',
        '水': 'Water dominance means emotion, intuition, and relationships are the current focus. Your heart is speaking — feelings matter more than logic. Be mindful not to be overwhelmed by emotions.',
        '风': 'Air dominance means thought, communication, and truth are your current battlefield. Clear thinking and honest exchange are key. Be mindful not to over-analyze and spiral into anxiety.',
        '土': 'Earth dominance means practicality, stability, and the material realm are the theme. Staying grounded and patiently accumulating is your best strategy. Be mindful not to become rigid or stuck.'
      };
      syn += `${isEn ? elemReadings_EN[domName] : elemReadings_ZH[domName]}</p>`;
    }

    // Missing element warning
    const presentElems = new Set(Object.keys(elemCount).filter(k => elemCount[k] > 0));
    const allElems = ['火', '水', '风', '土'];
    const missing = allElems.filter(e => !presentElems.has(e));
    if (missing.length >= 2) {
      const missReadings_ZH = { '火':'行动力的缺失', '水':'情感连接的缺失', '风':'理性思考的缺失', '土':'务实落地能力的缺失' };
      const missReadings_EN = { '火':'lack of action drive', '水':'lack of emotional connection', '风':'lack of rational thinking', '土':'lack of grounded practicality' };
      const missDesc = missing.map(e => isEn ? missReadings_EN[e] : missReadings_ZH[e]).join('、');
      const missLabels = missing.map(e => elemLabel(e)).join('、');
      syn += (isEn
        ? `<p>⚠️ The spread <strong>lacks ${missLabels}</strong> (${missDesc}). This is not a flaw — the cards are pointing out which energies you need to borrow from outside or consciously cultivate for your current lesson.</p>`
        : `<p>⚠️ 牌阵中<strong>缺少${missLabels}元素</strong>（${missDesc}）。这不是缺陷，而是牌阵在提醒你——当前课题中哪些能量是你需要从外部借力或有意识培养的。</p>`);
    }
  }

  // ── 4. Suit dominance ──
  if (minorCards.length >= 2) {
    const suitCount = {};
    minorCards.forEach(c => {
      const s = c.suit || '';
      suitCount[s] = (suitCount[s] || 0) + 1;
    });
    const dominantSuit = Object.entries(suitCount).sort((a, b) => b[1] - a[1])[0];
    if (dominantSuit && dominantSuit[1] >= 2) {
      const suitReadings_ZH = {
        '权杖': '权杖牌组主导说明你当前的核心动力在于行动和创造。事业、项目和自我实现是你最关切的战场。',
        '圣杯': '圣杯牌组主导说明情感世界是你当前的主旋律。爱情、关系和内在感受正在塑造你的选择。',
        '宝剑': '宝剑牌组主导说明思想层面的挑战是核心。决策、沟通和真理的追寻是你目前最重要的课题。',
        '星币': '星币牌组主导说明物质世界是你关注的焦点。财务、工作和实际成果是你当前最在意的领域。'
      };
      const suitReadings_EN = {
        '权杖': 'The dominance of Wands means your core drive is currently in action and creation. Career, projects, and self-actualization are your most pressing battlefield.',
        '圣杯': 'The dominance of Cups means the emotional world is your current main theme. Love, relationships, and inner feelings are shaping your choices.',
        '宝剑': 'The dominance of Swords means intellectual challenges are central. Decisions, communication, and the search for truth are your most important lessons right now.',
        '星币': 'The dominance of Pentacles means the material world is your focus. Finances, work, and tangible results are the area you care about most.'
      };
      if (isEn ? suitReadings_EN[dominantSuit[0]] : suitReadings_ZH[dominantSuit[0]]) {
        syn += `<p>🎯 ${isEn ? suitReadings_EN[dominantSuit[0]] : suitReadings_ZH[dominantSuit[0]]}</p>`;
      }
    }
  }

  // ── 5. Number symbolism (for minor cards) ──
  const numberPatterns = minorCards.filter(c => c.rank && !isNaN(parseInt(c.rank))).map(c => parseInt(c.rank));
  if (numberPatterns.length >= 2) {
    const numCount = {};
    numberPatterns.forEach(n => { numCount[n] = (numCount[n] || 0) + 1; });
    const repeating = Object.entries(numCount).filter(([k, v]) => v >= 2);
    if (repeating.length > 0) {
      const numReadings_ZH = {
        1: '数字1（王牌）的重复出现强调了"新的开始"。一个全新的周期正在启动，你手握创造的火种。',
        2: '数字2的重复出现强调了"选择与平衡"。你在多个力量之间寻求平衡，决策是当前的关键词。',
        3: '数字3的重复出现强调了"创造与扩展"。初步的成果正在显现，合作和共享是你当前的力量来源。',
        4: '数字4的重复出现强调了"稳固与基础"。你需要夯实根基，稳定是当前最重要的主题。',
        5: '数字5的重复出现强调了"冲突与变化"。不稳定的能量在推动你突破舒适区，挑战中蕴含着成长。',
        6: '数字6的重复出现强调了"和谐与恢复"。平衡正在回归，关系中的给予与接受趋于健康。',
        7: '数字7的重复出现强调了"反思与评估"。你需要退一步审视全局，内在的智慧正在觉醒。',
        8: '数字8的重复出现强调了"行动与进展"。事情正在加速，快速的变化要求你保持灵活和专注。',
        9: '数字9的重复出现强调了"完成与满足"。一个周期接近尾声，成果正在显现，你接近了目标。',
        10: '数字10的重复出现强调了"圆满与终结"。一个完整的循环即将结束，新的循环在终点等候。'
      };
      const numReadings_EN = {
        1: 'The repetition of number 1 (Ace) emphasizes "new beginnings." A fresh cycle is starting — you hold the spark of creation in your hands.',
        2: 'The repetition of number 2 emphasizes "choice & balance." You\'re seeking equilibrium between multiple forces — decision is the keyword.',
        3: 'The repetition of number 3 emphasizes "creation & expansion." Initial results are emerging — collaboration and sharing are your current sources of strength.',
        4: 'The repetition of number 4 emphasizes "stability & foundation." You need to solidify your roots — stability is the most important theme right now.',
        5: 'The repetition of number 5 emphasizes "conflict & change." Unstable energy is pushing you beyond your comfort zone — growth lies within the challenge.',
        6: 'The repetition of number 6 emphasizes "harmony & recovery." Balance is returning — giving and receiving in relationships are becoming healthy.',
        7: 'The repetition of number 7 emphasizes "reflection & assessment." You need to step back and survey the whole picture — inner wisdom is awakening.',
        8: 'The repetition of number 8 emphasizes "action & progress." Things are accelerating — rapid changes require you to stay flexible and focused.',
        9: 'The repetition of number 9 emphasizes "completion & fulfillment." A cycle is nearing its end — results are emerging, you are approaching your goal.',
        10: 'The repetition of number 10 emphasizes "completion & closure." A full cycle is about to end — a new cycle waits at the finish line.'
      };
      repeating.forEach(([num, cnt]) => {
        if (isEn ? numReadings_EN[num] : numReadings_ZH[num]) syn += `<p>🔢 ${isEn ? numReadings_EN[num] : numReadings_ZH[num]}</p>`;
      });
    }
  }

  // ── 6. Reversed card energy ──
  if (hasReversed === count) {
    syn += (isEn
      ? `<p>🔄 <strong>All cards reversed</strong> — this is a strong signal: your current inner resistance or external obstacles are significant. But reversed cards are not "bad" — they are invitations to inner work. Every reversed card asks you: What are you resisting? What needs to be transformed?</p>`
      : `<p>🔄 <strong>全部逆位</strong> — 这是一个强烈的信号：你当前的内在阻力或外在障碍比较显著。但逆位并非坏牌——它们是内在功课的邀请函。每一张逆位的牌都在问你：你在抗拒什么？你需要转化什么？</p>`);
  } else if (hasReversed >= 2) {
    const revNames = reversedCards.map(c => isEn ? (c.en||c.name||'') : (c.name||`${c.suit||''}${c.rank||''}`)).join('、');
    syn += (isEn
      ? `<p>🔄 <strong>${hasReversed} reversed cards</strong> (${revNames}) — these areas contain inner resistance or external delays that need your attention. Reversed doesn\'t mean "bad" — it tells you: this lesson requires more inner work and awareness before it can turn upright.</p>`
      : `<p>🔄 <strong>${hasReversed}张逆位牌</strong>（${revNames}）— 这些领域存在需要你面对的内在阻力或外在延迟。逆位不是"不好"，而是在告诉你：这个课题需要更多的内在工作和觉察才能转正。</p>`);
  } else if (hasReversed === 1) {
    const rn = isEn ? (reversedCards[0].en||reversedCards[0].name||`${reversedCards[0].suit||''}${reversedCards[0].rank||''}`) : (reversedCards[0].name||`${reversedCards[0].suit||''}${reversedCards[0].rank||''}`);
    syn += (isEn
      ? `<p>🔄 The only reversed card — "${rn}" — is the key blockage the spread is pointing out. Its energy is blocked or internalized — this is also where you most need to focus and transform.</p>`
      : `<p>🔄 唯一逆位的「${rn}」是牌阵指出的关键卡点。它的能量被阻塞或内化——这也是你最需要关注和转化的地方。</p>`);
  }

  // ── 7. Position flow analysis (for 3-card spreads) ──
  if (cards.length === 3) {
    const pastOk = cards[0] && !cards[0].isReversed;
    const presentOk = cards[1] && !cards[1].isReversed;
    const futureOk = cards[2] && !cards[2].isReversed;

    if (!pastOk && presentOk && futureOk) {
      syn += (isEn
        ? `<p>📈 <strong>Trend is improving</strong> — past obstacles are dissolving. You stand on firmer ground now, and the future card suggests positive development. The trajectory from trough to peak has already begun.</p>`
        : `<p>📈 <strong>趋势向好</strong> — 过去的阻碍正在消散，你现在站得更稳，未来的牌面预示着积极的发展。从低谷走向高峰的轨迹已经开启。</p>`);
    } else if (pastOk && presentOk && !futureOk) {
      syn += (isEn
        ? `<p>⚠️ <strong>Watch ahead</strong> — your past accumulation and present stability are precious, but the future holds challenges you need to proactively avoid or prepare for. Early awareness can change the trajectory.</p>`
        : `<p>⚠️ <strong>注意前方</strong> — 过去的积累和当下的稳定值得珍惜，但未来存在需要你主动规避或准备的挑战。提前觉察可以改变走向。</p>`);
    } else if (!pastOk && !presentOk && futureOk) {
      syn += (isEn
        ? `<p>🌈 <strong>Rainbow after the storm</strong> — the past and present may be full of challenges, but the future card gives you a bright direction. This makes your current persistence meaningful.</p>`
        : `<p>🌈 <strong>风雨后有彩虹</strong> — 过去和当下可能充满了挑战，但未来的牌给了你明亮的方向。这让你当下的坚持有了意义。</p>`);
    }

    // Element flow
    if (cards[0].element && cards[1].element && cards[2].element) {
      const flow = cards.map(c => c.element);
      const flowLabel = (e) => isEn ? ({火:'Fire',水:'Water',风:'Air',土:'Earth'})[e] : e;
      if (flow[0] === flow[1] && flow[1] === flow[2]) {
        syn += (isEn
          ? `<p>🔗 All three cards share the same element (${flowLabel(flow[0])}), meaning the energy of this question is very focused and pure. You don\'t need to spread your attention — concentrate on this single thread.</p>`
          : `<p>🔗 三张牌的元素一致（均为${flowLabel(flow[0])}），说明这个问题的能量非常聚焦和纯粹。你不需要分散精力——专注于这一条主线即可。</p>`);
      } else if (flow[0] === '火' && flow[2] === '土') {
        syn += (isEn
          ? `<p>🔗 Evolution from Fire to Earth: the spread shows your energy is moving from passionate impulse toward grounded manifestation. Creativity and passion are transforming into tangible results.</p>`
          : `<p>🔗 从火到土的演进：牌阵显示你的能量正在从热情冲动走向务实落地。创意和激情正在转化为实际的成果。</p>`);
      } else if (flow[0] === '风' && flow[2] === '水') {
        syn += (isEn
          ? `<p>🔗 Flow from Air to Water: thoughts and anxiety are yielding to emotion and intuition. It\'s time to release mental analysis — listen to your heart\'s feelings to find the answer.</p>`
          : `<p>🔗 从风到水的流转：思维和焦虑正在向情感和直觉让步。头脑的分析该放下了，听从内心的感受会带你找到答案。</p>`);
      }
    }
  }

  // ── 8. Theme-based closing ──
  const theme = questionThemes[0];
  const themeClosings_ZH = {
    '爱情': '感情从来不是靠理性算计，而是靠心去感受。牌面的信息关于时机、心态和选择——最终，真爱不会因任何决定而错过，但需要你保持真诚和勇气。',
    '事业': '职业发展的核心不仅在于外在机会，更在于你内在的成熟和准备。牌的指引帮助你看到自己的力量和盲点。行动加上智慧，再加上耐心，属于你的舞台终将到来。',
    '财运': '财富是能量的物质显化。牌阵在告诉你：金钱的流动和你内在的能量状态密切相关。理清内在，外在自然会丰盛。',
    '人生方向': '迷茫时我们总在寻找唯一的"正确答案"。但塔罗的智慧在于——它不会替你选择，而是照亮你忽略的角落，让你更有智慧地为自己做出决定。',
    '家庭': '家庭是我们最早的根，也是最深的功课。牌阵反映了你与家人之间能量的流动——理解比改变更重要，接纳比评价更深刻。',
    '健康': '身心健康是一切的基础。牌的讯息不是诊断，而是提醒你关注身体与心灵之间微妙的联系。倾听身体的信号。',
    '学业': '学习不只是知识的堆积，更是灵魂的扩展。牌阵告诉你：当前最适合的学习方式和方向——保持好奇心和专注力。',
    '人际': '人际关系是我们投射在他人身上的自己。牌阵揭示了你在人际互动中的模式和盲点——调整你的能量，关系自然会变化。'
  };
  const themeClosings_EN = {
    '爱情': 'Love has never been about rational calculation — it\'s about what the heart feels. The cards speak about timing, mindset, and choice — ultimately, true love won\'t be missed because of any decision, but you need to stay sincere and courageous.',
    '事业': 'The core of career development lies not only in external opportunities, but in your inner maturity and readiness. The cards\' guidance helps you see your strengths and blind spots. Action plus wisdom, plus patience — the stage that belongs to you will arrive.',
    '财运': 'Wealth is the material manifestation of energy. The spread tells you: the flow of money is closely tied to your inner energetic state. Clarify within, and abundance will naturally appear without.',
    '人生方向': 'When lost, we always search for the one "right answer." But the wisdom of tarot is this — it won\'t choose for you, but will illuminate the corners you\'ve overlooked, giving you more wisdom to decide for yourself.',
    '家庭': 'Family is our earliest root and our deepest lesson. The spread reflects the flow of energy between you and your family — understanding is more important than changing, and acceptance is deeper than judgment.',
    '健康': 'Physical and mental health is the foundation of everything. The cards\' message is not a diagnosis, but a reminder to pay attention to the subtle connection between body and soul. Listen to your body\'s signals.',
    '学业': 'Learning is not just piling up knowledge — it\'s the expansion of the soul. The spread tells you: the most suitable way and direction for learning right now — keep your curiosity and focus.',
    '人际': 'Relationships are ourselves projected onto others. The spread reveals your patterns and blind spots in interpersonal interaction — adjust your energy, and relationships will naturally shift.'
  };
  const closing = isEn
    ? (themeClosings_EN[theme] || 'Every card is a mirror reflecting some aspect of your inner world. The answer isn\'t in the cards — it\'s in the part of you that is touched while reading these words. Keep an open heart, and you will find wisdom in your own soul.')
    : (themeClosings_ZH[theme] || '每张牌都是一面镜子，映照你内心的某个面向。答案不在牌中，而在你阅读这些文字时内心被触动的那个部分。保持开放的心态，你会在自己的灵魂中找到智慧。');

  syn += `<p style="margin-top:12px;">💫 ${closing}</p>`;

  syn += (isEn
    ? `<p style="color:var(--text-dim);margin-top:12px;font-size:0.85rem;">※ Tarot is an illuminating tool of awareness, helping you see yourself. The final judgment and choice are always in your hands. Keep an open heart and listen to your inner wisdom.</p>`
    : `<p style="color:var(--text-dim);margin-top:12px;font-size:0.85rem;">※ 塔罗牌是启发性的觉知工具，帮助你看见自己。最终的判断和选择权永远在你手中。保持开放的心态，聆听内在的智慧。</p>`);

  syn += `</div>`;
  return syn;
}

// ── Tab 4: Tarot ──────────────────────────────────────────────────────────
let tarotState = { deck:null, drawn:[], spread:'three', question:'', flipped:0, mode:'single' };

function renderTarotDeck() {
  // Shuffle and get fresh deck
  tarotState.deck = shuffle(buildDeck());
  tarotState.drawn = [];
  tarotState.flipped = 0;
  tarotState.question = '';

  drawTarotUI();
}

function drawTarotUI() {
  const isEn = window._lang && window._lang() === 'en';
  const tab4 = document.getElementById('tab4');
  let html = '';

  // Mode toggle
  html += '<div class="tarot-mode-toggle">';
  html += '<span class="tarot-mode-opt' + (tarotState.mode==='single'?' active':'') + '" onclick="setTarotMode(\'single\')">' + _L('个人塔罗','Personal Tarot') + '</span>';
  html += '<span class="tarot-mode-opt' + (tarotState.mode==='synastry'?' active':'') + '" onclick="setTarotMode(\'synastry\')">' + _L('合盘塔罗','Synastry Tarot') + '</span>';
  html += '</div>';

  // Synastry mode — no chartData2 → show guidance
  if (tarotState.mode === 'synastry' && !(typeof chartData2 !== 'undefined' && chartData2)) {
    html += '<div class="synastry-hint">';
    html += '<p>' + _L('🌙 合盘塔罗需要双方星盘数据', '🌙 Synastry Tarot requires both charts') + '</p>';
    html += '<p style="font-size:0.85em;">' + _L('请先在输入区展开「合盘对方」填写第二个人的出生信息，点击「解读星盘」生成合盘数据后，再使用合盘塔罗。', 'Please expand the "Partner" section, fill in the second person\'s birth info, and click "Read My Chart" to generate synastry data before using Synastry Tarot.') + '</p>';
    html += '</div>';
    tab4.innerHTML = html;
    return;
  }

  // Question area
  html += '<div class="tarot-question-area">';
  var qPlaceholder;
  if (tarotState.mode === 'synastry') {
    if (tarotState.spread === 'synastry-three') {
      qPlaceholder = isEn ? 'Meditate on your bond — e.g. "What brought us together? Where is this heading?"' : '默想你们的关系，例：我们因何相遇？这段关系会走向何方？';
    } else if (tarotState.spread === 'synastry-five') {
      qPlaceholder = isEn ? 'Reflect on your dynamic — e.g. "What are we to each other? What\'s our core challenge?"' : '默想你们的相处，例：我们各自在关系中的角色？最需要跨越的障碍是什么？';
    } else {
      qPlaceholder = isEn ? 'Dive into love\'s truth — e.g. "What does TA truly feel? Will we build a future together?"' : '探寻爱的真相，例：TA对这段感情的真实感受？我们能否走向共同的未来？';
    }
  } else {
    if (tarotState.spread === 'one') {
      qPlaceholder = isEn ? 'Ask one thing — e.g. "What should I focus on today?" or "A message for my career?"' : '默想一件事，例：今天我需要关注什么？事业上有什么指引？';
    } else {
      qPlaceholder = isEn ? 'Past · Present · Future — e.g. "What\'s blocking me? What\'s coming next?"' : '默想你的处境，例：我当下的困境从何而来？未来会如何转折？';
    }
  }
  html += '<input type="text" id="tarot_question" placeholder="' + qPlaceholder + '" value="' + escHtml(tarotState.question) + '" onkeydown="if(event.key===\'Enter\')drawTarotCards()">';
  html += '<button class="geo-btn" onclick="drawTarotCards()" id="tarot_draw_btn">' + _L('🔮 抽牌','🔮 Draw') + '</button>';
  html += '</div>';

  // Spread selector
  html += '<div class="spread-selector">';
  if (tarotState.mode === 'synastry') {
    html += '<span class="spread-opt' + (tarotState.spread==='synastry-three'?' active':'') + '" onclick="setSpread(\'synastry-three\')">' + _L('时间之箭 · 3张','Arrow of Time · 3') + '</span>';
    html += '<span class="spread-opt' + (tarotState.spread==='synastry-five'?' active':'') + '" onclick="setSpread(\'synastry-five\')">' + _L('关系十字 · 5张','Relation Cross · 5') + '</span>';
    html += '<span class="spread-opt' + (tarotState.spread==='synastry-seven'?' active':'') + '" onclick="setSpread(\'synastry-seven\')">' + _L('维纳斯之爱 · 7张','Venus Love · 7') + '</span>';
  } else {
    html += '<span class="spread-opt' + (tarotState.spread==='one'?' active':'') + '" onclick="setSpread(\'one\')">' + _L('单张牌 · 快速指引','Single Card · Quick Guidance') + '</span>';
    html += '<span class="spread-opt' + (tarotState.spread==='three'?' active':'') + '" onclick="setSpread(\'three\')">' + _L('三张牌 · 过去现在未来','Three Cards · Past Present Future') + '</span>';
  }
  html += '</div>';

  // Cards area
  if (tarotState.drawn.length > 0) {
    var posLabels;
    if (tarotState.mode === 'synastry') {
      posLabels = getSynastryPositionLabels(tarotState.spread);
    } else if (tarotState.spread === 'three') {
      posLabels = isEn ? ['Past Influence','Present State','Future Trend'] : ['过去的影响','当下的状态','未来的趋势'];
    } else {
      posLabels = isEn ? ['Message from the Universe'] : ['宇宙的讯息'];
    }
    var cardAreaClass = tarotState.mode === 'synastry' ? ('cards-area synastry-cards ' + tarotState.spread) : 'cards-area';
    html += '<div class="' + cardAreaClass + '">';
    for (let i = 0; i < tarotState.drawn.length; i++) {
      const card = tarotState.drawn[i];
      const isFlipped = i < tarotState.flipped;
      html += '<div style="display:flex;flex-direction:column;align-items:center;">';
      html += `<div class="tarot-card${isFlipped?' flipped':''}" onclick="flipCard(${i})">`;
      html += '<div class="tarot-card-inner">';
      // Back
      html += '<div class="card-face card-back"></div>';
      // Front
      html += '<div class="card-face card-front">';
      if (isFlipped) {
        html += `<div class="card-pos-label">${posLabels[i]}</div>`;
        html += `<div class="card-title">${isEn ? ((card.type==='major'?card.en:'')||(card.suit_en?card.suit_en+' '+card.en:card.name)) : (card.name||(card.suit+card.rank))}</div>`;
        if (card.isReversed) html += '<span class="reversed-badge" style="margin:2px 0">' + _L('逆位','Reversed') + '</span>';
        html += `<div class="card-suit">${card.type==='major'?card.num:(isEn?(card.suit_en||card.suit):(card.suit||card.element+'元素'))}</div>`;
        html += `<div class="card-keywords">${card.isReversed?(_cardT(card,'rev')||_cardT(card,'up')):_cardT(card,'up')}</div>`;
      }
      html += '</div>';
      html += '</div></div>';
      html += `<div class="card-position-label">${isFlipped ? posLabels[i] : (i+1)}</div>`;
      html += '</div>';
    }
    html += '</div>';

    // Interpretation
    if (tarotState.flipped >= tarotState.drawn.length) {
      var isSyn = tarotState.mode === 'synastry';
      var defaultQ = isSyn ? (isEn ? 'Relationship Guidance' : '关系指引') : (isEn ? 'General Fortune' : '综合运势');
      var themes = analyzeQuestion(tarotState.question || defaultQ);
      html += '<div class="tarot-interpretation">';

      if (isSyn) {
        html += '<h3>' + _L('✦ 关系解读：','✦ Relationship Reading: ') + (tarotState.question||(isEn ? 'Your Bond' : '你们的关系')) + '</h3>';
        var readingLabels = getReadingLabels(tarotState.spread);
        for (let i = 0; i < tarotState.drawn.length; i++) {
          var card = tarotState.drawn[i];
          html += '<div class="card-reading">';
          html += '<h4>' + readingLabels[i] + '</h4>';
          html += '<p>' + interpretSynastryCard(card, card.isReversed, i, themes, tarotState.spread) + '</p>';
          html += '</div>';
        }
        html += '<div class="synthesis">';
        html += synthesizeSynastryReading(tarotState.drawn, [], tarotState.question, themes, tarotState.spread);
        html += '</div>';
      } else {
        html += '<h3>' + _L('✦ 解读：','✦ Reading: ') + (tarotState.question||(isEn ? 'Message from the Universe' : '宇宙给你的信息')) + '</h3>';
        for (let i = 0; i < tarotState.drawn.length; i++) {
          var card = tarotState.drawn[i];
          var rl_ZH = tarotState.spread==='three'?['❶ 过去','❷ 现在','❸ 未来']:['🎴 指引'];
          var rl_EN = tarotState.spread==='three'?['❶ Past','❷ Present','❸ Future']:['🎴 Guidance'];
          var rl = isEn ? rl_EN : rl_ZH;
          html += '<div class="card-reading">';
          html += '<h4>' + rl[i] + '</h4>';
          html += '<p>' + interpretCard(card, card.isReversed, i, themes) + '</p>';
          html += '</div>';
        }
        html += '<div class="synthesis">';
        html += synthesizeReading(tarotState.drawn, [], tarotState.question || (isEn ? 'Your Fortune' : '你的运势'), themes);
        html += '</div>';
      }

      // CTA
      html += renderTarotCTA(isSyn);

      html += '<div style="text-align:center;margin-top:16px;">';
      html += '<button class="btn" onclick="renderTarotDeck()" style="padding:10px 30px;font-size:0.9em;">' + _L('🔄 重新抽牌','🔄 Draw Again') + '</button>';
      html += '</div>';
      html += '</div>';
    } else {
      html += '<p style="text-align:center;color:var(--text-dim);margin-top:12px;">' + _L('点击卡牌将其翻开，揭示宇宙的讯息 ✨','Click a card to reveal it and uncover the message of the universe ✨') + '</p>';
    }
  } else {
    html += '<div class="cards-area">';
    html += '<div style="text-align:center;color:var(--text-dim);padding:40px;">';
    html += '<div style="font-size:3em;margin-bottom:16px;">🃏</div>';
    html += '<p>' + _L('在心中默念你的问题','Hold your question in your mind') + '</p><p>' + _L('然后点击上方「🔮 抽牌」按钮','Then click the "🔮 Draw" button above') + '</p>';
    html += '</div></div>';
  }

  tab4.innerHTML = html;
}



function setSpread(type) {
  tarotState.spread = type;
  tarotState.drawn = [];
  tarotState.flipped = 0;
  drawTarotUI();
}

function setTarotMode(mode) {
  tarotState.mode = mode;
  tarotState.drawn = [];
  tarotState.flipped = 0;
  tarotState.question = '';
  tarotState.spread = mode === 'synastry' ? 'synastry-three' : 'three';
  drawTarotUI();
}

function getTarotCardCount(spread) {
  if (spread === 'one') return 1;
  if (spread === 'three' || spread === 'synastry-three') return 3;
  if (spread === 'synastry-five') return 5;
  if (spread === 'synastry-seven') return 7;
  return 3;
}

function getSynastryPositionLabels(spread) {
  var isEn = window._lang && window._lang() === 'en';
  if (spread === 'synastry-three') {
    return isEn ? ['Past Connection','Present Bond','Future Direction'] : ['过去的缘分','当下的连接','未来的走向'];
  }
  if (spread === 'synastry-five') {
    return isEn ? ['You','The Other','Status','Challenge','Outlook'] : ['你','对方','关系现状','核心挑战','前景指引'];
  }
  if (spread === 'synastry-seven') {
    return isEn ? ['Your Feelings','Their Feelings','Foundation','Obstacle','Subconscious','Turning Point','Outcome'] : ['你的感受','对方的感受','关系基础','当前障碍','潜意识影响','关键转机','最终结果'];
  }
  return [];
}

function getReadingLabels(spread) {
  var isEn = window._lang && window._lang() === 'en';
  if (spread === 'synastry-three') {
    return isEn ? ['❶ Past Connection','❷ Present Bond','❸ Future Direction'] : ['❶ 过去的缘分','❷ 当下的连接','❸ 未来的走向'];
  }
  if (spread === 'synastry-five') {
    return isEn ? ['❶ You','❷ The Other','❸ Status','❹ Challenge','❺ Outlook'] : ['❶ 你','❷ 对方','❸ 关系现状','❹ 核心挑战','❺ 前景指引'];
  }
  if (spread === 'synastry-seven') {
    return isEn ? ['❶ Your Feelings','❷ Their Feelings','❸ Foundation','❹ Obstacle','❺ Subconscious','❻ Turning Point','❼ Outcome'] : ['❶ 你的感受','❷ 对方的感受','❸ 关系基础','❹ 当前障碍','❺ 潜意识影响','❻ 关键转机','❼ 最终结果'];
  }
  return [];
}

function drawTarotCards() {
  const qInput = document.getElementById('tarot_question');
  const question = qInput ? qInput.value.trim() : '';
  tarotState.question = question;

  // Shuffle fresh each time
  tarotState.deck = shuffle(buildDeck());
  const count = getTarotCardCount(tarotState.spread);
  tarotState.drawn = [];
  for (let i = 0; i < count; i++) {
    const card = tarotState.deck.pop();
    card.isReversed = Math.random() < 0.3; // 30% chance of reversed
    tarotState.drawn.push(card);
  }
  tarotState.flipped = 0;
  drawTarotUI();
}

function flipCard(index) {
  if (index < tarotState.flipped) {
    // Clicked an already-flipped card: unflip this and all after
    tarotState.flipped = index;
  } else {
    // Clicked a face-down card: flip this and all before
    tarotState.flipped = index + 1;
  }
  drawTarotUI();
}

function renderTab4() {
  if (!tarotState.deck) {
    tarotState.deck = shuffle(buildDeck());
  }
  drawTarotUI();
}


// ═══ 单张塔罗 ═══════════════════════════════════════════════════════════════
function openSingleTarot() {
  const deck = buildDeck ? buildDeck() : [];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  window._singleDeck = deck;

  let html = '<h3>' + _t('singletarot.title') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:14px;">' + _t('singletarot.prompt') + '</p>';
  html += '<div class="tarot-pick-row">';
  for (let i = 0; i < 7; i++) {
    html += '<div class="tarot-pick-card" onclick="revealTarotCard(' + i + ')" id="tarotPick' + i + '"><div class="card-back-pattern"></div></div>';
  }
  html += '</div>';
  showGameModal(html);
}

function revealTarotCard(idx) {
  let deck = window._singleDeck;
  if (!deck || deck.length < idx + 1) { deck = buildDeck ? buildDeck() : []; window._singleDeck = deck; }
  const card = deck[idx % deck.length];
  const isRev = Math.random() < 0.2;
  const isEn = window._lang && window._lang() === 'en';
  const name = isEn ? (card.type==='major' ? (card.en||card.name) : ((card.suit_en||card.suit)+' '+(card.en||card.rank))) : (card.name || card.suit + card.rank);
  const desc = _cardT(card, isRev ? 'rev' : 'up') || _cardT(card, 'up');

  let html = '<h3>' + _t('singletarot.title') + '</h3>';
  html += '<div class="tarot-reveal-card" style="text-align:center;">';
  html += '<p style="color:var(--accent);font-size:1.1em;font-weight:bold;margin-bottom:6px;">' + name + '</p>';
  if (isRev) html += '<span class="reversed-badge" style="display:inline-block;margin-bottom:8px;">' + _t('tarot.reversed') + '</span>';
  html += '<p style="color:#b8b8c8;font-size:0.82em;line-height:1.7;">' + desc + '</p>';
  html += '</div>';
  html += '<p style="color:var(--text-dim);font-size:0.75em;margin-top:12px;">' + _t('tarot.cardHint') + '</p>';
  html += '<button class="share-btn" onclick="openSingleTarot()">' + _t('singletarot.drawAgain') + '</button>';

  document.getElementById('gameModal').innerHTML = '<button class="game-close" onclick="closeGameModal()">✕</button>' + html;
}

// ═══ 合盘塔罗 — Relationship Overlay Data ════════════════════════════════════
var MAJOR_REL_ZH = {
  '愚者':'在关系中，愚者邀请你放下过去的包袱，带着信任和开放的心跳入这段缘分。不要过度分析，让关系自然展开。',
  '魔术师':'在关系中，魔术师表明你拥有改善这段关系的一切资源。主动沟通、展现真实的自己，你可以创造想要的互动模式。',
  '女祭司':'在关系中，女祭司提醒你有些答案不在对话里，而在沉默与直觉中。给彼此空间去感受，不必急于定义这段关系。',
  '女皇':'在关系中，女皇带来滋养和丰盛的能量。用温柔和接纳去爱对方，关系会在被无条件包容时自然绽放。',
  '皇帝':'在关系中，皇帝代表稳定和承诺。你需要建立清晰的边界和共同的目标，但同时也要允许柔软进入这段关系。',
  '教皇':'在关系中，教皇指向更深层的契合——价值观的共鸣和精神的连接。传统的承诺方式（如婚姻）可能在这段关系中有重要意义。',
  '恋人':'在关系中，恋人是核心牌——代表重要的选择、灵魂的吸引和深度的亲密。但选择意味着取舍，你需要在心动和理性之间找到平衡。',
  '战车':'在关系中，战车代表克服困难和前进的动力。你们可能面临外部挑战，但共同的意志可以战胜一切。关键是方向一致。',
  '力量':'在关系中，力量牌不是硬碰硬，而是用温柔驯服恐惧。耐心、理解和持续的信任是你们关系最强大的纽带。',
  '隐士':'在关系中，隐士提醒你们各自需要独立的精神空间。适度的距离不是疏远，而是让彼此在安静中重新看清对方的价值。',
  '命运之轮':'在关系中，命运之轮标志着一个转折点——缘分将你们带到此刻。有些关系是命中注定的相遇，顺应这个周期的展开。',
  '正义':'在关系中，正义牌要求诚实和公平。你需要审视这段关系的给予与接受是否平衡。如果天平倾斜，现在是纠正的时候。',
  '倒吊人':'在关系中，倒吊人代表需要换个角度看待这段关系。暂时的停顿或牺牲不是终结，而是一种更深的理解正在酝酿。',
  '死神':'在关系中，死神牌象征一段旧模式的结束和新关系的开始。这不一定意味着分手，而是旧的互动方式必须"死去"，才能迎来真正的亲密。',
  '节制':'在关系中，节制牌是调和与融合的象征。两个不同的灵魂正在学习如何共舞——不急不躁，找到属于你们的节奏。',
  '恶魔':'在关系中，恶魔牌揭示可能存在的不健康依恋或控制模式。问问自己：这段关系让你自由吗？还是某种恐惧在捆绑你们？',
  '高塔':'在关系中，高塔牌预示着突然的冲击或真相的揭晓。虽然过程可能痛苦，但它是为了打破不再真实的幻象，让关系建立在更真实的基础上。',
  '星星':'在关系中，星星带来希望和治愈。即使经历了困难，你们之间仍然有温柔的星光在指引。信任这段关系的修复力。',
  '月亮':'在关系中，月亮牌提醒你注意隐藏的情绪和未说出口的感受。关系中可能有模糊不清的地方，不要被表象迷惑——深入的对话能照亮阴影。',
  '太阳':'在关系中，太阳是最明亮的祝福。真诚的喜悦、孩子的天真和纯粹的快乐充盈着你们的关系。享受这份温暖，它是真实的。',
  '审判':'在关系中，审判牌召唤你们重新评估这段关系的意义。是时候诚实面对内心的声音：这段关系值得你投入全部的自己吗？',
  '世界':'在关系中，世界标志着一个完整的循环达成。你们的关系已经走过了完整的旅程——现在是庆祝和收获的时候。这可能意味着关系进入更成熟的阶段，或自然地圆满完结。'
};
var MAJOR_REL_EN = {
  '愚者':'In relationship, The Fool invites you to release past baggage and leap into this connection with trust and an open heart. Don\'t over-analyze — let things unfold naturally.',
  '魔术师':'In relationship, The Magician shows you have all the tools to improve this connection. Communicate proactively, show your true self, and you can create the dynamic you desire.',
  '女祭司':'In relationship, The High Priestess reminds you that some answers lie not in words but in silence and intuition. Give each other space to feel — don\'t rush to define things.',
  '女皇':'In relationship, The Empress brings nurturing, abundant energy. Love with gentleness and acceptance — the relationship will blossom when held unconditionally.',
  '皇帝':'In relationship, The Emperor represents stability and commitment. Establish clear boundaries and shared goals — but also allow softness into the container you build together.',
  '教皇':'In relationship, The Hierophant points to deeper resonance — shared values and spiritual connection. Traditional forms of commitment may carry special meaning here.',
  '恋人':'In relationship, The Lovers is the core card — representing important choice, soul attraction, and deep intimacy. But choice means trade-offs: find balance between passion and reason.',
  '战车':'In relationship, The Chariot represents overcoming obstacles and forward momentum. You may face external challenges, but shared willpower can conquer anything. The key is aligned direction.',
  '力量':'In relationship, Strength is not about force — it is taming fear with gentleness. Patience, understanding, and sustained trust are your most powerful bonds.',
  '隐士':'In relationship, The Hermit reminds you that each person needs independent spiritual space. Healthy distance is not estrangement — it allows you to see each other\'s value anew in quiet.',
  '命运之轮':'In relationship, Wheel of Fortune marks a turning point — destiny brings you to this moment. Some connections are fated encounters. Flow with this cycle as it unfolds.',
  '正义':'In relationship, Justice demands honesty and fairness. Examine whether giving and receiving are in balance. If the scales are tilted, now is the time to correct them.',
  '倒吊人':'In relationship, The Hanged Man suggests seeing the relationship from a different angle. A temporary pause or sacrifice is not an ending — deeper understanding is brewing beneath the surface.',
  '死神':'In relationship, Death signals the end of an old pattern and the beginning of a new way of relating. This doesn\'t necessarily mean breakup — but old dynamics must "die" for true intimacy to emerge.',
  '节制':'In relationship, Temperance is the symbol of blending and harmony. Two different souls are learning to dance together — without rushing, find the rhythm that belongs to you both.',
  '恶魔':'In relationship, The Devil reveals possible unhealthy attachment or control patterns. Ask yourself: does this relationship set you free? Or is some form of fear binding you together?',
  '高塔':'In relationship, The Tower heralds sudden shock or truth revealed. Though the process may be painful, it serves to break illusions that are no longer real — so the relationship can be rebuilt on honest ground.',
  '星星':'In relationship, The Star brings hope and healing. Even through difficulty, gentle starlight still guides you. Trust in the relationship\'s capacity for repair.',
  '月亮':'In relationship, The Moon alerts you to hidden emotions and unspoken feelings. There may be unclear territory between you — don\'t be deceived by surface appearances. Deep dialogue can illuminate the shadows.',
  '太阳':'In relationship, The Sun is the brightest blessing. Genuine joy, childlike delight, and pure happiness fill your connection. Bask in this warmth — it is real.',
  '审判':'In relationship, Judgement calls you to re-evaluate the meaning of this bond. It\'s time to honestly face your inner voice: is this relationship worthy of your full self?',
  '世界':'In relationship, The World marks the completion of a full cycle. Your relationship has journeyed through its complete arc — now is a time of celebration and harvest. This may mean entering a more mature phase, or a natural, graceful completion.'
};

var ELEM_REL_ZH = {
  '火':'火元素的能量在关系中表现为激情和行动力。你们之间的热情是宝贵的动力，同时注意不要让冲动压倒倾听。',
  '水':'水元素在关系中代表情感的深度和直觉。你们之间的情感连接是这段关系最珍贵的资产——信任你的感受。',
  '风':'风元素在关系中代表沟通和思想。你们需要通过清晰和诚实的对话来建立理解——说出真心话比什么都重要。',
  '土':'土元素在关系中代表稳定和承诺。你们关系的根基在于彼此的可靠和实际的付出——耐心是最佳的滋养。'
};
var ELEM_REL_EN = {
  '火':'The Fire element manifests in your relationship as passion and drive. The heat between you is a precious engine — just be mindful that impulse doesn\'t override listening.',
  '水':'The Water element in relationship represents emotional depth and intuition. Your emotional connection is this bond\'s most treasured asset — trust what you feel.',
  '风':'The Air element in relationship represents communication and ideas. Build understanding through clear, honest dialogue — speaking your true heart matters more than anything.',
  '土':'The Earth element in relationship represents stability and commitment. Your foundation rests on mutual reliability and tangible effort — patience is the best nourishment.'
};

var POS_OVERLAY_ZH = {
  'synastry-three': [
    '这张牌揭示了你们之间过去的缘分模式——相遇背后可能有更深层的宇宙安排。',
    '这张牌描绘了你们关系当下的能量状态——此刻的连接质感和互动氛围。',
    '这张牌预示了关系在目前能量流之下的发展趋势和潜力。'
  ],
  'synastry-five': [
    '这张牌代表你在这段关系中的状态和投射——你在带给这段关系什么能量。',
    '这张牌代表对方在关系中的感受和立场——TA可能如何看待和体验这段关系。',
    '这张牌描绘了你们关系的整体现状——当前的能量场和互动模式。',
    '这张牌指出了关系面临的核心挑战——需要共同面对和转化的关键课题。',
    '这张牌为关系的发展方向提供高层次的宇宙指引。'
  ],
  'synastry-seven': [
    '这张牌反映你在这段关系中的情感需求和内心真实感受。',
    '这张牌反映对方在这段关系中可能感受到但未必表达出来的能量。',
    '这张牌揭示你们关系的基础——是什么根本的力量让你们走到一起。',
    '这张牌指出当前阻碍关系发展的具体障碍或卡点所在。',
    '这张牌揭示在潜意识层面影响你们互动模式的深层动力。',
    '这张牌指出了可以改变关系走向的关键转折点或机会。',
    '这张牌预示了在当前能量发展趋势下关系可能达成的结果。'
  ]
};
var POS_OVERLAY_EN = {
  'synastry-three': [
    'This card reveals the past karmic pattern between you — there may be a deeper cosmic arrangement behind your meeting.',
    'This card depicts the present energy state of your relationship — the current quality of connection and interaction.',
    'This card indicates the direction and potential of your relationship under the current energetic flow.'
  ],
  'synastry-five': [
    'This card represents your state and projection in the relationship — what energy you are bringing to the bond.',
    'This card represents the other person\'s feelings and position — how they may perceive and experience the relationship.',
    'This card depicts the overall status of your relationship — the current energetic field and interaction pattern.',
    'This card points to the core challenge facing the relationship — the key lesson to face and transform together.',
    'This card offers high-level cosmic guidance for the relationship\'s direction.'
  ],
  'synastry-seven': [
    'This card reflects your emotional needs and authentic inner feelings in this relationship.',
    'This card reflects what the other person may be feeling but not necessarily expressing in this relationship.',
    'This card reveals the foundation of your relationship — what fundamental force brought you together.',
    'This card points to the specific obstacle or blockage currently hindering the relationship\'s growth.',
    'This card reveals the subconscious dynamics influencing your interaction patterns.',
    'This card indicates the key turning point or opportunity that can shift the relationship\'s direction.',
    'This card foretells the possible outcome of the relationship under the current energetic trajectory.'
  ]
};

// ── Synastry Card Interpretation ────────────────────────────────────────────
function interpretSynastryCard(card, isReversed, positionIdx, questionThemes, spread) {
  var isEn = window._lang && window._lang() === 'en';
  var reading = interpretCard(card, isReversed, positionIdx, questionThemes);

  var posOverlays = isEn ? POS_OVERLAY_EN[spread] : POS_OVERLAY_ZH[spread];
  var posOverlay = posOverlays && posOverlays[positionIdx] ? posOverlays[positionIdx] : '';

  var relOverlay = '';
  if (card.type === 'major') {
    relOverlay = isEn ? (MAJOR_REL_EN[card.name] || '') : (MAJOR_REL_ZH[card.name] || '');
  } else if (card.element) {
    relOverlay = isEn ? (ELEM_REL_EN[card.element] || '') : (ELEM_REL_ZH[card.element] || '');
  }

  if (posOverlay || relOverlay) {
    reading += '<br><br><span class="syn-rel-label">💞 ' + _L('关系提示','Relationship Insight') + '</span> ';
    if (posOverlay) reading += posOverlay + ' ';
    if (relOverlay) reading += relOverlay;
  }

  return reading;
}

// ── Compute Synastry Data ────────────────────────────────────────────────────
function computeSynastryData() {
  if (typeof chartData1 === 'undefined' || !chartData1) return null;
  if (typeof chartData2 === 'undefined' || !chartData2) return null;

  var pos1 = chartData1.positions, pos2 = chartData2.positions;
  var asc1 = chartData1.asc, asc2 = chartData2.asc;

  var crossAspects = [];
  for (var i = 0; i < PLANETS.length; i++) {
    for (var j = 0; j < PLANETS.length; j++) {
      var diff = (Math.abs(pos1[PLANETS[i].id] - pos2[PLANETS[j].id]) + 360) % 360;
      if (diff > 180) diff = 360 - diff;
      for (var k = 0; k < ASPECT_DEFS.length; k++) {
        var ad = ASPECT_DEFS[k];
        if (Math.abs(diff - ad.angle) <= ad.orb) {
          crossAspects.push({p1:PLANETS[i].id, p2:PLANETS[j].id, name:ad.name, orb:Math.abs(diff-ad.angle)});
        }
      }
    }
  }

  var goodScore = 0, hardScore = 0;
  for (var a = 0; a < crossAspects.length; a++) {
    var ax = crossAspects[a];
    if (ax.name === '三合' || ax.name === '六合') goodScore += ax.name==='三合' ? 3 : 2;
    else if (ax.name === '合') goodScore += 2;
    else if (ax.name === '刑') hardScore += 2;
    else if (ax.name === '冲') hardScore += 3;
  }
  var total = goodScore + hardScore;
  var compatPct = total > 0 ? Math.round(goodScore / total * 100) : 50;

  var keyPairs = [['Sun','Moon'],['Sun','Venus'],['Sun','Mars'],['Moon','Venus'],
                  ['Moon','Mars'],['Venus','Mars'],['Sun','Saturn'],['Moon','Saturn'],['Jupiter','Venus']];
  var foundAspects = [];
  for (var kp = 0; kp < keyPairs.length; kp++) {
    var kp1 = keyPairs[kp][0], kp2 = keyPairs[kp][1];
    for (var ca = 0; ca < crossAspects.length; ca++) {
      var cax = crossAspects[ca];
      if ((cax.p1 === kp1 && cax.p2 === kp2) || (cax.p1 === kp2 && cax.p2 === kp1)) {
        foundAspects.push(cax);
        break;
      }
    }
  }

  var e1 = ELEMENTS[degToSign(asc1).si];
  var e2 = ELEMENTS[degToSign(asc2).si];
  var isSame = e1 === e2;
  var isComplement = (e1==='火'&&e2==='风')||(e1==='风'&&e2==='火')||(e1==='土'&&e2==='水')||(e1==='水'&&e2==='土');

  return { crossAspects:crossAspects, compatPct:compatPct, goodScore:goodScore, hardScore:hardScore,
           foundAspects:foundAspects, e1:e1, e2:e2, isSame:isSame, isComplement:isComplement };
}

// ── Synastry Synthesis ───────────────────────────────────────────────────────
function synthesizeSynastryReading(cards, positions, question, questionThemes, spread) {
  var isEn = window._lang && window._lang() === 'en';
  var html = '';

  // Part A: Card pattern analysis (reuse existing synthesis)
  html += synthesizeReading(cards, positions, question || (isEn ? 'Your Relationship' : '你们的关系'), questionThemes);

  // Part B: Synastry data integration
  var synData = computeSynastryData();
  if (synData) {
    html += '<div class="synastry-integration">';
    html += '<h4>' + _L('✦ 合盘能量解读','✦ Synastry Energy Reading') + '</h4>';

    var scoreText = synData.compatPct >= 75 ? _L('💫 契合度较高','💫 High Compatibility')
      : synData.compatPct >= 55 ? _L('✨ 契合度中等偏上','✨ Above Average Compatibility')
      : synData.compatPct >= 40 ? _L('🌗 契合度中等','🌗 Moderate Compatibility')
      : _L('🌑 契合度充满挑战','🌑 Challenging Compatibility');
    html += '<p class="synastry-score">' + scoreText + '（' + synData.compatPct + '%）'
          + ' · ' + _L('和谐','Harmony') + ' ' + synData.goodScore
          + ' / ' + _L('紧张','Tension') + ' ' + synData.hardScore + '</p>';

    if (synData.foundAspects.length > 0) {
      html += '<div class="synastry-aspects">';
      html += '<p><strong>' + _L('关键合盘相位：','Key Synastry Aspects:') + '</strong></p>';
      for (var fa = 0; fa < synData.foundAspects.length; fa++) {
        var a = synData.foundAspects[fa];
        var key = a.p1 + '_' + a.p2;
        var revKey = a.p2 + '_' + a.p1;
        var data = SYNASTRY_ASPECTS[key] || SYNASTRY_ASPECTS[revKey];
        if (data) {
          var n1 = '', n2 = '';
          for (var pi = 0; pi < PLANETS.length; pi++) {
            if (PLANETS[pi].id === a.p1) n1 = PLANETS[pi].name;
            if (PLANETS[pi].id === a.p2) n2 = PLANETS[pi].name;
          }
          var cls = (a.name==='三合'||a.name==='六合'||a.name==='合') ? 'aspect-good' : 'aspect-hard';
          var text = (a.name==='三合'||a.name==='六合'||a.name==='合') ? data.good : data.hard;
          html += '<p><span class="' + cls + '">' + n1 + ' ' + _aspectName(a) + ' ' + n2 + '</span> — ' + text + '</p>';
        }
      }
      html += '</div>';
    }

    var e1en = ELEMENTS_EN[synData.e1] || synData.e1;
    var e2en = ELEMENTS_EN[synData.e2] || synData.e2;
    if (synData.isSame) {
      html += '<p>' + _L(
        '你们上升同为' + synData.e1 + '象元素，对关系的本能反应和理解方式非常相似。',
        'Your rising signs share the ' + e1en + ' element — you instinctively understand relationships in similar ways.'
      ) + '</p>';
    } else if (synData.isComplement) {
      html += '<p>' + _L(
        '你们的上升元素（' + synData.e1 + '与' + synData.e2 + '）天然互补，彼此提供对方欠缺的视角。',
        'Your rising elements (' + e1en + ' & ' + e2en + ') are naturally complementary — each provides what the other lacks.'
      ) + '</p>';
    } else {
      html += '<p>' + _L(
        '你们的上升元素（' + synData.e1 + '与' + synData.e2 + '）差异较大，需要更多的理解和磨合，但也因此可能带来深刻的互相成长。',
        'Your rising elements (' + e1en + ' & ' + e2en + ') are quite different — requiring more understanding and adjustment, but this can also bring profound mutual growth.'
      ) + '</p>';
    }

    html += '</div>';
  }

  return html;
}

// ── CTA Block ────────────────────────────────────────────────────────────────
function renderTarotCTA(isSynastry) {
  var contacts = [
    {icon:'💬', platform:_L('微信','WeChat'), id:'LunarVeilAstro'},
    {icon:'🐧', platform:'QQ', id:'3393776733'}
  ];

  if (isSynastry) {
    return renderLockedBlock(
      _L('解锁合盘深度解读','Unlock In-Depth Synastry Reading'),
      _L('以上为牌面自动解读。每段关系都独一无二——如需结合双方完整星盘+塔罗的精细化深度分析，请联系占星师一对一咨询。','The above is an automated card interpretation. Every relationship is unique — for a personalized deep analysis combining both birth charts with tarot, contact our astrologer for a one-on-one consultation.'),
      contacts
    );
  } else {
    return renderLockedBlock(
      _L('解锁个人深度解读','Unlock In-Depth Tarot Reading'),
      _L('以上为牌面自动解读。每个人的星盘都是独一无二的宇宙地图——如需结合你的完整星盘+塔罗的精细化深度分析，请联系占星师一对一咨询。','The above is an automated card interpretation. Every birth chart is a unique cosmic map — for a personalized deep analysis combining your full chart with tarot, contact our astrologer for a one-on-one consultation.'),
      contacts
    );
  }
}

