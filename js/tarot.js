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
let tarotState = { deck:null, drawn:[], spread:'three', question:'', flipped:0 };

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

  // Question area
  html += '<div class="tarot-question-area">';
  html += `<input type="text" id="tarot_question" placeholder="${isEn ? 'Hold your question in mind, then type it here…' : '默想你的问题，然后在此输入…'}" value="${escHtml(tarotState.question)}" onkeydown="if(event.key==='Enter')drawTarotCards()">`;
  html += '<button class="geo-btn" onclick="drawTarotCards()" id="tarot_draw_btn">' + _L('🔮 抽牌','🔮 Draw') + '</button>';
  html += '</div>';

  // Spread selector
  html += '<div class="spread-selector">';
  html += `<span class="spread-opt${tarotState.spread==='one'?' active':''}" onclick="setSpread('one')">` + _L('单张牌 · 快速指引','Single Card · Quick Guidance') + `</span>`;
  html += `<span class="spread-opt${tarotState.spread==='three'?' active':''}" onclick="setSpread('three')">` + _L('三张牌 · 过去现在未来','Three Cards · Past Present Future') + `</span>`;
  html += '</div>';

  // Cards area
  if (tarotState.drawn.length > 0) {
    const posLabels_ZH = tarotState.spread === 'three'
      ? ['过去的影响','当下的状态','未来的趋势']
      : ['宇宙的讯息'];
    const posLabels_EN = tarotState.spread === 'three'
      ? ['Past Influence','Present State','Future Trend']
      : ['Message from the Universe'];
    const posLabels = isEn ? posLabels_EN : posLabels_ZH;
    html += '<div class="cards-area">';
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
      const themes = analyzeQuestion(tarotState.question || (isEn ? 'General Fortune' : '综合运势'));
      html += '<div class="tarot-interpretation">';
      html += `<h3>` + _L('✦ 解读：','✦ Reading: ') + (tarotState.question||(isEn ? 'Message from the Universe' : '宇宙给你的信息')) + `</h3>`;
      for (let i = 0; i < tarotState.drawn.length; i++) {
        const card = tarotState.drawn[i];
        const readingLabels_ZH = tarotState.spread==='three'?['❶ 过去','❷ 现在','❸ 未来']:['🎴 指引'];
        const readingLabels_EN = tarotState.spread==='three'?['❶ Past','❷ Present','❸ Future']:['🎴 Guidance'];
        const readingLabels = isEn ? readingLabels_EN : readingLabels_ZH;
        html += '<div class="card-reading">';
        html += `<h4>${readingLabels[i]}</h4>`;
        html += `<p>${interpretCard(card, card.isReversed, i, themes)}</p>`;
        html += '</div>';
      }
      // Synthesis
      html += '<div class="synthesis">';
      html += synthesizeReading(tarotState.drawn, [], tarotState.question || (isEn ? 'Your Fortune' : '你的运势'), themes);
      html += '</div>';
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

function drawTarotCards() {
  const qInput = document.getElementById('tarot_question');
  const question = qInput ? qInput.value.trim() : '';
  tarotState.question = question;

  // Shuffle fresh each time
  tarotState.deck = shuffle(buildDeck());
  const count = tarotState.spread === 'three' ? 3 : 1;
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

