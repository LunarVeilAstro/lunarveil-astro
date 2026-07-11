// reports.js — All report generators + consultation engine
// Depends on: astronomy.js, data.js
// ═══════════════════════════════════════════════════════════════════════════
//  REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

// ── Deep Natal Chart Report ────────────────────────────────────────────────

function detectStelliums(positions, houses) {
  const signGroups = {};
  const houseGroups = {};
  for (const p of PLANETS) {
    const lon = positions[p.id];
    const {si} = degToSign(lon);
    const h = houses[p.id];
    if (!signGroups[si]) signGroups[si] = [];
    signGroups[si].push(p);
    if (!houseGroups[h]) houseGroups[h] = [];
    houseGroups[h].push(p);
  }
  const stelliums = [];
  for (const [si, planets] of Object.entries(signGroups)) {
    if (planets.length >= 3) stelliums.push({type:'sign', index:parseInt(si), planets, label:ZODIAC_SIGNS_ZH[parseInt(si)]+'群星', enLabel:ZODIAC_SIGNS_EN[parseInt(si)]+' Stellium'});
  }
  for (const [h, planets] of Object.entries(houseGroups)) {
    if (planets.length >= 3) stelliums.push({type:'house', index:parseInt(h), planets, label:'第'+h+'宫群星', enLabel:'House '+h+' Stellium'});
  }
  return stelliums;
}

function detectKeyPatterns(positions, aspects) {
  const patterns = [];
  let diff = mod360(Math.abs(positions.Moon - positions.Venus));
  if (diff > 180) diff = 360 - diff;
  if (Math.abs(diff - 180) <= 8) patterns.push({name:'月金对冲', text:'你的情感需求（月亮）与爱的表达方式（金星）之间存在根本性的张力。你可能在亲密关系中反复经历"靠近-疏远"的循环。这是你星盘中最核心的情感课题——学会在爱中既不失去自我，也不筑起高墙。', enName:'Moon-Venus Opposition', enText:'There is a fundamental tension between your emotional needs (Moon) and how you express love (Venus). You may repeatedly experience the "approach-withdraw" cycle in intimate relationships. This is the most central emotional lesson in your chart — learning to neither lose yourself in love nor build walls too high.'});

  diff = mod360(Math.abs(positions.Sun - positions.Saturn));
  if (diff > 180) diff = 360 - diff;
  if (Math.abs(diff - 90) <= 7 || Math.abs(diff - 180) <= 8 || Math.abs(diff) <= 8) {
    patterns.push({name:'日土相位', text:'太阳与土星的相位赋予你强大的责任感和坚韧的意志力，但也可能带来对自我价值的严苛审判。你的人生成就往往在30岁之后才真正开始显现——这不是诅咒，而是让你有足够时间打好地基。', enName:'Sun-Saturn Aspect', enText:'The Sun-Saturn aspect endows you with a strong sense of responsibility and resilient willpower, but can also bring harsh self-judgment. Your life achievements often truly begin to manifest after age 30 — this is not a curse, but time given to build a solid foundation.'});
  }

  diff = mod360(Math.abs(positions.Mars - positions.Saturn));
  if (diff > 180) diff = 360 - diff;
  if (Math.abs(diff - 90) <= 7 || Math.abs(diff - 180) <= 8 || Math.abs(diff) <= 8) {
    patterns.push({name:'火土相位', text:'火星与土星的相位赋予你惊人的毅力和持久力，但也让你容易在行动与克制之间反复拉扯。你的行动力需要经过"审查"才能释放——这让你不会轻易犯错，但也可能因过度克制而错失良机。', enName:'Mars-Saturn Aspect', enText:'The Mars-Saturn aspect grants you remarkable perseverance and endurance, but also makes you prone to the tug-of-war between action and restraint. Your drive must pass through "inspection" before release — this means you rarely make careless mistakes, but may also miss opportunities through over-restraint.'});
  }

  diff = mod360(Math.abs(positions.Uranus - positions.Neptune));
  if (diff > 180) diff = 360 - diff;
  if (Math.abs(diff) <= 8) {
    patterns.push({name:'天海合相', text:'天王星与海王星的合相是1990年代出生者的共同印记。你这一代人在理想主义和科技创新之间拥有独特的桥梁——你们既是梦想家，也有能力将梦想落地。个人层面上，你需要在直觉和理性之间找到属于自己的平衡方式。', enName:'Uranus-Neptune Conjunction', enText:'The Uranus-Neptune conjunction is a shared signature of those born in the 1990s. Your generation holds a unique bridge between idealism and technological innovation — you are both dreamers and capable of grounding dreams into reality. On a personal level, you need to find your own balance between intuition and reason.'});
  }

  return patterns;
}

function generateDeepNatalReport(positions, houses, aspects, asc, mc) {
  let html = '';

  html += '<div class="report-section"><h3>' + _t('natal.section.overview') + '</h3>';

  const ec = {火:0,土:0,风:0,水:0};
  const mc2 = {开创:0,固定:0,变动:0};
  for (const p of PLANETS) {
    const {si} = degToSign(positions[p.id]);
    ec[ELEMENTS[si]]++;
    mc2[MODES[si]]++;
  }

  const sortedElem = Object.entries(ec).sort((a,b)=>b[1]-a[1]);
  const domElem = sortedElem[0];
  const weakElem = sortedElem[3];
  const sortedMode = Object.entries(mc2).sort((a,b)=>b[1]-a[1]);
  const domMode = sortedMode[0];

  html += '<p style="font-size:1.05em;color:var(--accent);text-indent:0;">';
  html += _L(
    `你的星盘呈现<strong>${domElem[0]}象主导</strong>（${domElem[1]}颗行星）· <strong>${domMode[0]}星座</strong>能量的格局。`,
    `Your chart shows a <strong>${ELEMENTS_EN[domElem[0]]} dominance</strong> (${domElem[1]} planets) · <strong>${MODES_EN[domMode[0]]}</strong> energy pattern.`
  );
  if (weakElem[1] === 0) {
    html += _L(
      `值得注意的是<strong>${weakElem[0]}元素完全缺失</strong>——这不是缺陷，而是你此生的"空白画布"，你最深刻的学习和成长往往发生在${weakElem[0]}元素掌管的领域。`,
      `Notably, <strong>${ELEMENTS_EN[weakElem[0]]} is entirely absent</strong> — this is not a flaw, but your "blank canvas" in this lifetime. Your deepest learning and growth often happen in areas governed by the ${ELEMENTS_EN[weakElem[0]]} element.`
    );
  } else if (weakElem[1] <= 1) {
    html += _L(
      `${weakElem[0]}元素在你的星盘中较为薄弱（仅${weakElem[1]}颗），你在此领域需要更有意识地学习和补充。`,
      `${ELEMENTS_EN[weakElem[0]]} is under-represented in your chart (only ${weakElem[1]} planet). You'll benefit from consciously cultivating this energy.`
    );
  }
  html += '</p>';

  // Element weakness cultivation guide
  if (weakElem[1] <= 1) {
    html += '<div style="margin-top:10px;padding:14px 18px;background:rgba(20,20,50,0.4);border-radius:8px;border-left:3px solid var(--gold-dim);">';
    html += '<p style="color:var(--accent);text-indent:0;font-weight:bold;margin-bottom:8px;">✦ ' + _L(weakElem[0] + '元素的修行之道', 'The Way of ' + ELEMENTS_EN[weakElem[0]]) + '</p>';
    if (weakElem[0] === '水') {
      html += _L(
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">水是情感、直觉与共情的力量。你的星盘水象薄弱，意味着你习惯用逻辑而非感受来判断事物——这不是错，但当生活只剩下分析和行动，灵魂会干涸。<br><br>' +
        '<strong>日常修行：</strong>每天给自己一段"没有目的"的时间——不是工作、不是学习、不是运动，而是纯粹的"存在"。泡一杯茶、听一首歌、看一部能让你流泪的电影。记下那些你平时会压下去的"不舒服"的感受——让它们流淌出来，而不是绕道而行。<br>' +
        '<strong>关系层面：</strong>练习在伴侣或朋友面前说"我不知道我为什么会有这种感觉，但我确实有"。不必解释所有情绪，不是所有事都需要一个理由。允许自己被看见脆弱的那一面——那是你最深的力量。<br>' +
        '<strong>创造性表达：</strong>写诗、涂鸦、摄影、做一顿没有食谱的菜——任何不需要"做对"、只需要"感受"的创作。水不需要方向，它只需要流动。</p>',
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">Water is the power of emotion, intuition, and empathy. With a weak water element in your chart, you tend to judge through logic rather than feeling — this isn\'t wrong, but when life is reduced to analysis and action, the soul becomes parched.<br><br>' +
        '<strong>Daily Practice:</strong> Give yourself a stretch of "purposeless" time each day — not work, not study, not exercise, but pure "being." Brew a cup of tea, listen to a song, watch a film that moves you to tears. Write down the "uncomfortable" feelings you usually suppress — let them flow out instead of detouring around them.<br>' +
        '<strong>In Relationships:</strong> Practice saying to your partner or friend, "I don\'t know why I feel this way, but I do." Not every emotion needs an explanation; not everything requires a reason. Allow yourself to be seen in your vulnerability — that is your deepest strength.<br>' +
        '<strong>Creative Expression:</strong> Write poetry, doodle, take photos, cook a meal without a recipe — any act of creation that doesn\'t need to be "right," only needs to be "felt." Water doesn\'t need direction; it only needs to flow.</p>'
      );
    } else if (weakElem[0] === '火') {
      html += _L(
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">火是勇气、行动与生命力的表达。你的星盘火象不足，意味着你倾向于先想再做、或者一直停留在想的阶段。你的灵魂渴望冲动，却总被理智按住。<br><br>' +
        '<strong>日常修行：</strong>每天做一件"没用但想做"的事——对镜子里的自己笑一下、在无人处大声喊出来、报名一个你从没试过的课。不需要理由，不需要"意义"，只需要"我想"。<br>' +
        '<strong>身体层面：</strong>运动是你最直接的火焰通道。跑步、搏击、舞蹈——任何能让身体发热、心跳加速的运动。让身体动起来，火就会被点燃。<br>' +
        '<strong>决策层面：</strong>练习在 30 秒内做一个决定（从吃饭、穿什么、周末去哪开始）。不需要最优解——火不追求完美，它只追求"在燃烧"。</p>',
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">Fire is the expression of courage, action, and vitality. With insufficient fire in your chart, you tend to overthink before acting — or stay stuck in the thinking phase. Your soul craves impulse, but reason keeps holding it down.<br><br>' +
        '<strong>Daily Practice:</strong> Do one "useless but desired" thing each day — smile at yourself in the mirror, shout out loud when no one\'s around, sign up for a class you\'ve never tried. No reason needed, no "meaning" required — only "I want to."<br>' +
        '<strong>Through the Body:</strong> Exercise is your most direct channel for fire. Running, boxing, dancing — any movement that heats up the body and speeds up the heart. When the body moves, fire ignites.<br>' +
        '<strong>In Decision-Making:</strong> Practice making a decision within 30 seconds (start with what to eat, what to wear, where to go on the weekend). The optimal choice isn\'t the goal — fire doesn\'t pursue perfection; it only pursues "burning."</p>'
      );
    } else if (weakElem[0] === '土') {
      html += _L(
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">土是稳定、务实与物质世界的连接。你的星盘土象薄弱，意味着你活在概念和感受的云端，却常常忽略了脚下的土地。没有土，梦想永远只是梦想。<br><br>' +
        '<strong>日常修行：</strong>建立一两个"不可撼动"的日常仪式——固定时间起床、睡前整理明天的衣物、每周做一顿让自己期待的饭。这些微小的锚点会让你在精神世界中找到一个可以着陆的地方。<br>' +
        '<strong>财富层面：</strong>定期查看你的账户余额，即使只有几百块钱。记录一个月的每一笔收支——不是为了削减，而是为了"看见"。土的力量来自"我知道每一个数字"。<br>' +
        '<strong>身体层面：</strong>赤脚踩在泥土或草地上，散步时留意脚底的触感。种一盆植物，每天照料它——照顾一个生命本身就是最深的土象修行。</p>',
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">Earth is stability, practicality, and connection to the material world. With weak earth in your chart, you live among clouds of concepts and feelings, often neglecting the ground beneath your feet. Without earth, dreams remain merely dreams.<br><br>' +
        '<strong>Daily Practice:</strong> Establish one or two "unshakeable" daily rituals — waking at a fixed time, laying out tomorrow\'s clothes before bed, cooking one meal each week that you look forward to. These small anchors give your mental world a place to land.<br>' +
        '<strong>Financial Practice:</strong> Check your account balance regularly, even if it\'s just a small amount. Track every expense and income for one month — not to cut back, but to "see." Earth\'s power comes from "I know every number."<br>' +
        '<strong>Through the Body:</strong> Walk barefoot on soil or grass; during a stroll, notice the sensations under your feet. Plant something and tend to it daily — caring for a living thing is itself the deepest earth practice.</p>'
      );
    } else if (weakElem[0] === '风') {
      html += _L(
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">风是思维、交流与视野的扩展。你的星盘风象薄弱，意味着你习惯于沉浸在自己的感受和直觉中，却较少用"旁观者"的视角审视生活。没有风，灵魂的风景会缺少变化。<br><br>' +
        '<strong>日常修行：</strong>每天花 15 分钟阅读一个你不知道的领域——科学、政治、设计、哲学。不是为了"有用"，而是让你的大脑习惯在陌生的航道上航行。<br>' +
        '<strong>社交层面：</strong>找一个和你完全不同的人吃一次饭。不是深交，而是练习"倾听一个你永远不会成为的人"。风的智慧在于理解——不是认同，是理解。<br>' +
        '<strong>表达层面：</strong>把一件困扰你的事讲给另一个人听——但讲的方式是"如果我是另一个人，我会怎么看待这件事"。练习用不同的角度看待同一个问题，你的世界会多出很多出口。</p>',
        '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">Air is thought, communication, and the expansion of perspective. With weak air in your chart, you tend to immerse yourself in your own feelings and intuition, rarely stepping back to examine life through an observer\'s lens. Without air, the landscape of the soul lacks variety.<br><br>' +
        '<strong>Daily Practice:</strong> Spend 15 minutes each day reading about a field you know nothing about — science, politics, design, philosophy. Not to be "useful," but to train your mind to navigate unfamiliar waters.<br>' +
        '<strong>Social Practice:</strong> Share a meal with someone completely unlike you. Not to become close friends, but to practice "listening to someone you\'ll never become." The wisdom of air lies in understanding — not agreement, but understanding.<br>' +
        '<strong>In Expression:</strong> Tell someone about something troubling you — but frame it as "if I were another person, how would I see this?" Practice viewing the same problem from different angles, and your world will open many new exits.</p>'
      );
    }
    html += '</div>';
  }

  if (domElem[0] === '水') {
    html += _L(
      '<p>水象主导意味着你的生命由情感、直觉和深层连接驱动。你像深海——表面上可能平静无波，但内部蕴含着巨大的能量和智慧。你做决定时依赖的是感受而非逻辑，这让你在人际和创意领域有天然优势。但也需要注意不要被情绪淹没，学会在必要时抽离。</p>',
      '<p>A water-dominant chart means your life is driven by emotion, intuition, and deep connection. You are like the deep ocean — calm on the surface, yet immense power and wisdom lie beneath. You make decisions based on feeling rather than logic, giving you a natural edge in relationships and creative fields. But be mindful not to be overwhelmed by emotion — learn to step back when necessary.</p>'
    );
  } else if (domElem[0] === '土') {
    html += _L(
      '<p>土象主导让你拥有稳固的现实感和强大的执行力。在这个充满浮躁的时代，你的脚踏实地是稀缺的优势。你重视结果和实质，不喜欢空洞的理论和无法落地的承诺。但需要注意在追求安全感的过程中，不要关闭了探索未知的勇气。</p>',
      '<p>An earth-dominant chart gives you a solid sense of reality and strong executive ability. In this age of restlessness, your groundedness is a rare advantage. You value results and substance, and have little patience for empty theories or undeliverable promises. But be careful not to close off your courage to explore the unknown in the pursuit of security.</p>'
    );
  } else if (domElem[0] === '火') {
    html += _L(
      '<p>火象主导赋予你充沛的生命力和行动力。你是人群中的点火者——你的热情和勇气能感染周围所有人。你不怕冒险，直觉式地知道什么时候该行动。但需要注意持续的耐力，以及在行动之前多听取他人的意见。</p>',
      '<p>A fire-dominant chart endows you with abundant vitality and drive. You are the spark in any crowd — your passion and courage are contagious. You don\'t fear risk, and you intuitively know when to act. But pay attention to sustaining stamina, and listen more to others before charging ahead.</p>'
    );
  } else {
    html += _L(
      '<p>风象主导让你以理性、沟通和连接世界的方式运作。你的大脑是你最强大的工具，你天然懂得如何分析、表达和连接。人际网络和信息流是你最大的资源。但需要注意不要只活在头脑中，你的身体和情感也需要同等的关注。</p>',
      '<p>An air-dominant chart means you operate through reason, communication, and connection. Your mind is your most powerful tool — you naturally know how to analyze, express, and connect. Networks and information flow are your greatest resources. But be careful not to live only in your head — your body and emotions need equal attention.</p>'
    );
  }

  html += _L(
    '<p>行为模式上，' + domMode[0] + '星座的' + (
      domMode[0] === '开创' ? '能量让你善于启动和开辟新局面，但可能在长期的坚持上需要额外的自律和支持系统。' :
      domMode[0] === '固定' ? '特质让你一旦确定方向就坚定不移，耐力惊人，但也可能在需要改变时显得固执。' :
      '灵活性让你能快速适应环境变化，但也可能在需要坚定时显得摇摆不定。'
    ) + '</p>',
    '<p>In terms of behavioral patterns, the ' + MODES_EN[domMode[0]] + ' energy ' + (
      domMode[0] === '开创' ? 'makes you skilled at initiating and breaking new ground, though you may need extra discipline and support systems for long-term follow-through.' :
      domMode[0] === '固定' ? 'makes you unwavering once committed — your endurance is remarkable, though you may appear stubborn when change is needed.' :
      'gives you flexibility to adapt quickly to changing circumstances, though you may seem unsteady when firmness is called for.'
    ) + '</p>'
  );

  const stelliums = detectStelliums(positions, houses);
  if (stelliums.length > 0) {
    html += '<p style="color:var(--accent);text-indent:0;">';
    for (const s of stelliums) {
      html += _L(
        `⭐ <strong>${s.label}</strong>：${s.planets.map(p=>p.name).join('、')} 汇聚于此，` +
        (s.type === 'sign' ? `这个星座的能量在你生命中异常集中。该领域是你灵魂投入了最多"兵力"的地方——既是天赋所在，也是执着所在。` :
         `这个生活领域是你此生的核心舞台。该宫位的议题会反复出现在你人生的关键时刻。`),
        `⭐ <strong>${s.enLabel||s.label}</strong>: ${s.planets.map(p=>p.name).join(', ')} converge here, ` +
        (s.type === 'sign' ? `The energy of this sign is exceptionally concentrated in your life. This is where your soul has deployed the most "troops" — it is both your greatest talent and your deepest attachment.` :
         `This life area is the central stage of your current incarnation. The themes of this house will repeatedly appear at pivotal moments in your life.`)
      );
    }
    html += '</p>';
  }

  html += '</div>';

  html += '<div class="report-section"><h3>' + _t('natal.section.sunMoonRising') + '</h3>';
  const sunSign = degToSign(positions.Sun).si;
  const moonSign = degToSign(positions.Moon).si;
  const ascSign = degToSign(asc).si;
  const sunHouse = houses.Sun || '?';
  const moonHouse = houses.Moon || '?';

  html += _L(
    '<p style="color:var(--accent);text-indent:0;"><strong>太阳' + getSignNamePure(sunSign) + ' · 第' + sunHouse + '宫</strong>：你的核心意志与生命目标。</p>',
    '<p style="color:var(--accent);text-indent:0;"><strong>Sun in ' + getSignNamePure(sunSign) + ' · House ' + sunHouse + '</strong>: Your core will and life purpose.</p>'
  );
  html += '<p>' + (PLANET_SIGN.Sun[sunSign] || '') + '</p>';

  html += _L(
    '<p style="color:var(--accent);text-indent:0;margin-top:12px;"><strong>月亮' + getSignNamePure(moonSign) + ' · 第' + moonHouse + '宫</strong>：你的情绪底色与内在安全感。</p>',
    '<p style="color:var(--accent);text-indent:0;margin-top:12px;"><strong>Moon in ' + getSignNamePure(moonSign) + ' · House ' + moonHouse + '</strong>: Your emotional foundation and inner sense of security.</p>'
  );
  html += '<p>' + (PLANET_SIGN.Moon[moonSign] || '') + '</p>';

  html += _L(
    '<p style="color:var(--accent);text-indent:0;margin-top:12px;"><strong>上升' + getSignNamePure(ascSign) + '</strong>：你与世界相遇时戴的面具，也是别人对你的第一印象。</p>',
    '<p style="color:var(--accent);text-indent:0;margin-top:12px;"><strong>Rising ' + getSignNamePure(ascSign) + '</strong>: The mask you wear when meeting the world, and the first impression you leave on others.</p>'
  );
  html += _L(
    '<p>上升' + getSignNamePure(ascSign) + '赋予你' + getSignNamePure(ascSign) + '的外在气质和行为方式。这是你的"默认模式"——当你不经思考地回应世界时，就是这个星座的能量在主导。' + (SIGN_MEANING[ascSign] || '') + '</p>',
    '<p>Rising ' + getSignNamePure(ascSign) + ' gives you the outward temperament and behavioral style of ' + getSignNamePure(ascSign) + '. This is your "default mode" — when you respond to the world without thinking, this is the sign energy leading the way. ' + (SIGN_MEANING[ascSign] || '') + '</p>'
  );

  html += '</div>';

  const keyPatterns = detectKeyPatterns(positions, aspects);
  if (keyPatterns.length > 0) {
    html += '<div class="report-section"><h3>' + _t('natal.section.patterns') + '</h3>';
    for (const kp of keyPatterns) {
      html += _L(
        '<p><span class="highlight">' + kp.name + '</span>：' + kp.text + '</p>',
        '<p><span class="highlight">' + kp.enName + '</span>: ' + kp.enText + '</p>'
      );
    }
    html += '</div>';
  }

  html += '<div class="report-section"><h3>' + _t('natal.section.planets') + '</h3>';

  const personalPlanets = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
  const housesDescribed = {};
  for (const pid of personalPlanets) {
    const lon = positions[pid];
    const {si} = degToSign(lon);
    const h = houses[pid] || '?';
    const p = PLANETS.find(x=>x.id===pid);

    const planetAspects = aspects.filter(a => a.p1===pid || a.p2===pid).slice(0, 4);
    const aspectNames = planetAspects.map(a=>{
      const other = a.p1===pid ? a.p2 : a.p1;
      const otherName = PLANETS.find(x=>x.id===other)?.name||other;
      return otherName + _aspectName(a);
    });

    html += _L(
      '<p style="margin-top:12px;text-indent:0;"><span class="highlight">' + p.name + '在' + getSignNamePure(si) + '／第' + h + '宫</span>' + (aspectNames.length > 0 ? '（' + aspectNames.join('、') + '）' : '') + '</p>',
      '<p style="margin-top:12px;text-indent:0;"><span class="highlight">' + p.name + ' in ' + getSignNamePure(si) + ' / House ' + h + '</span>' + (aspectNames.length > 0 ? ' (' + aspectNames.join(', ') + ')' : '') + '</p>'
    );

    const signText = PLANET_SIGN[pid] ? PLANET_SIGN[pid][si] : '';
    html += '<p>' + (signText || '') + '</p>';

    if (h !== '?' && !housesDescribed[h]) {
      housesDescribed[h] = true;
      html += _L(
        '<p style="font-size:0.88em;color:#9a9ab0;">落第' + h + '宫 — ' + (HOUSE_MEANINGS[h] || '') + '</p>',
        '<p style="font-size:0.88em;color:#9a9ab0;">House ' + h + ' — ' + (HOUSE_MEANINGS[h] || '') + '</p>'
      );
    }

    for (const a of planetAspects.slice(0, 2)) {
      const otherId = a.p1===pid ? a.p2 : a.p1;
      const otherP = PLANETS.find(x=>x.id===otherId);
      if (otherP) {
        const nature = (a.name==='三合'||a.name==='六合') ? '和谐' : (a.name==='合'?'融合':(a.name==='冲'?'对立':'张力'));
        const natureEN = (a.name==='三合'||a.name==='六合') ? 'harmonious' : (a.name==='合'?'blending':(a.name==='冲'?'opposing':'tense'));
        html += _L(
          '<p style="font-size:0.85em;color:#8a8aa0;">↳ 与' + otherP.name + '的' + a.name + '相（' + nature + '）：此相位为上述解读增添了' + nature + '的色彩。' +
          (a.name==='冲' ? '两个行星所在的领域需要你在生活中不断寻找平衡点。' :
           a.name==='刑' ? '内在的张力推动你在这两个领域之间不断成长和突破。' :
           a.name==='三合' ? '两个领域的能量流动顺畅，是你可以善用的天赋管道。' :
           a.name==='六合' ? '这是一个"机会窗口"——需要你主动作为才能激活的潜能。' :
           '两股能量合而为一，此领域对你影响深远而持久。') + '</p>',
          '<p style="font-size:0.85em;color:#8a8aa0;">↳ ' + _aspectName(a) + ' with ' + otherP.name + ' (' + natureEN + '): This aspect adds a ' + natureEN + ' quality to the interpretation above. ' +
          (a.name==='冲' ? 'The two planetary domains ask you to continually find balance in life.' :
           a.name==='刑' ? 'The inner tension drives you to grow and break through between these two areas.' :
           a.name==='三合' ? 'Energy flows smoothly between the two domains — a natural talent channel you can draw upon.' :
           a.name==='六合' ? 'This is a "window of opportunity" — potential that needs your active effort to unlock.' :
           'The two energies merge into one, with deep and lasting influence in this area.') + '</p>'
        );
      }
    }
  }
  html += '</div>';

  html += '<div class="report-section"><h3>' + _t('natal.section.lesson') + '</h3>';

  const satSign = degToSign(positions.Saturn).si;
  const satHouse = houses.Saturn || '?';
  html += _L(
    '<p><span class="highlight">土星在' + getSignNamePure(satSign) + '／第' + satHouse + '宫</span>揭示了你此生最重要的功课所在。</p>',
    '<p><span class="highlight">Saturn in ' + getSignNamePure(satSign) + ' / House ' + satHouse + '</span> reveals your most important life lesson.</p>'
  );
  html += '<p>' + (PLANET_SIGN.Saturn ? PLANET_SIGN.Saturn[satSign] : '') + '</p>';

  html += '<p style="border-left:3px solid var(--gold-dim);padding-left:16px;margin-top:16px;color:var(--accent);">';
  const adj1 = ec['水']>=4?'情感深邃':ec['火']>=4?'热情奔放':ec['土']>=3?'根基稳固':ec['风']>=3?'思维灵动':'层次丰富';
  const str1 = ec['水']>=3?'感受的深度和直觉的精准':ec['火']>=3?'行动的果敢和创造的火花':ec['土']>=2?'持久的耐力和现实的判断力':ec['风']>=2?'沟通的智慧和灵活的适应力':'内在的完整与自洽';
  const adj1_EN = ec['水']>=4?'emotionally profound':ec['火']>=4?'passionately vibrant':ec['土']>=3?'solidly grounded':ec['风']>=3?'intellectually agile':'richly layered';
  const str1_EN = ec['水']>=3?'depth of feeling and precision of intuition':ec['火']>=3?'decisive action and creative spark':ec['土']>=2?'enduring patience and sound judgment':ec['风']>=2?'communicative wisdom and flexible adaptability':'inner wholeness and self-acceptance';
  html += _L(
    '你的星盘是一幅' + adj1 + '的图景。你的力量不在于"无所不能"，而在于' + str1 + '。信任你的内在节奏——你不需要成为别人，你只需要成为最完整的自己。',
    'Your chart is a ' + adj1_EN + ' picture. Your strength lies not in "being capable of everything," but in ' + str1_EN + '. Trust your inner rhythm — you don\'t need to become someone else; you only need to become the most complete version of yourself.'
  );
  html += '</p>';

  html += '</div>';

  return html;
}

// ── Natal Chart Report ────────────────────────────────────────────────────
function generateNatalReport(positions, houses, aspects, asc, mc) {
  let html = '<div class="report-section">';
  html += '<h3>' + _t('natal.section.overview') + '</h3>';

  // Element & Mode tally
  const ec = {火:0,土:0,风:0,水:0};
  const mc2 = {开创:0,固定:0,变动:0};
  for (const p of PLANETS) {
    const {si} = degToSign(positions[p.id]);
    ec[ELEMENTS[si]]++;
    mc2[MODES[si]]++;
  }

  const domElem = Object.entries(ec).sort((a,b)=>b[1]-a[1])[0];
  const weakElem = Object.entries(ec).sort((a,b)=>a[1]-b[1])[0];
  const domMode = Object.entries(mc2).sort((a,b)=>b[1]-a[1])[0];

  html += _L(
    `<p>你的星盘中<span class="highlight">${domElem[0]}元素</span>（${ELEM_EMOJI[domElem[0]]}）最为突出，共${domElem[1]}颗行星落入${domElem[0]}象星座，` +
    (domElem[0] === '火' ? '你是一个充满行动力和激情的人，敢于冒险，勇往直前。' :
     domElem[0] === '土' ? '你是一个务实稳健的人，重视物质基础，做事脚踏实地。' :
     domElem[0] === '风' ? '你是一个理性思考者，重视信息交流和人际关系，思维活跃。' :
     '你是一个情感丰富的人，直觉力强，内心世界深邃。') +
    (weakElem[1] <= 1 ? `${weakElem[0]}元素在你的星盘中相对薄弱，这恰恰是你此生需要重点发展和学习的领域。</p>` : `</p>`),
    `<p>The <span class="highlight">${ELEMENTS_EN[domElem[0]]} element</span> (${ELEM_EMOJI[domElem[0]]}) dominates your chart with ${domElem[1]} planets in ${ELEMENTS_EN[domElem[0]]} signs, ` +
    (domElem[0] === '火' ? 'You are a person full of drive and passion, unafraid of risk and always charging forward.' :
     domElem[0] === '土' ? 'You are practical and steady, valuing material foundations and keeping your feet on the ground.' :
     domElem[0] === '风' ? 'You are a rational thinker who values communication and relationships, with an active, agile mind.' :
     'You are emotionally rich, with strong intuition and a profound inner world.') +
    (weakElem[1] <= 1 ? `The ${ELEMENTS_EN[weakElem[0]]} element is relatively under-represented in your chart — this is precisely the area for focused growth and learning in this lifetime.</p>` : `</p>`)
  );

  html += _L(
    `<p>你的行为模式以<span class="highlight">${domMode[0]}星座</span>为主，` +
    (domMode[0] === '开创' ? '善于开创局面，主导事情的走向；' :
     domMode[0] === '固定' ? '坚韧不拔，一旦确定方向就坚定不移；' :
     '灵活应变，善于适应环境和调整策略。') + '</p></div>',
    `<p>Your behavioral pattern is primarily <span class="highlight">${MODES_EN[domMode[0]]}</span> energy: ` +
    (domMode[0] === '开创' ? 'skilled at initiating and setting the direction of events;' :
     domMode[0] === '固定' ? 'unwavering — once committed, you hold your course with remarkable tenacity;' :
     'flexible and adaptable, skilled at adjusting to circumstances and shifting strategies.') + '</p></div>'
  );

  // Sun, Moon, ASC
  html += '<div class="report-section"><h3>' + _t('natal.section.sunMoonRising') + '</h3>';
  const sunSign = degToSign(positions.Sun).si;
  const moonSign = degToSign(positions.Moon).si;
  const ascSign = degToSign(asc).si;
  html += _L(
    `<p><span class="highlight">太阳${getSignNamePure(sunSign)}</span>代表你的核心意志和人生目标。${(PLANET_SIGN.Sun||{})[sunSign]||''}</p>`,
    `<p><span class="highlight">Sun in ${getSignNamePure(sunSign)}</span> represents your core will and life purpose. ${(PLANET_SIGN.Sun||{})[sunSign]||''}</p>`
  );
  html += _L(
    `<p><span class="highlight">月亮${getSignNamePure(moonSign)}</span>代表你的情绪底色和内在安全感。${(PLANET_SIGN.Moon||{})[moonSign]||''}</p>`,
    `<p><span class="highlight">Moon in ${getSignNamePure(moonSign)}</span> represents your emotional foundation and inner sense of security. ${(PLANET_SIGN.Moon||{})[moonSign]||''}</p>`
  );
  html += _L(
    `<p><span class="highlight">上升${getSignNamePure(ascSign)}</span>是你戴的面具，也是别人见你的第一印象。上升${getSignNamePure(ascSign)}赋予你${getSignNamePure(ascSign)}的外在气质。</p>`,
    `<p><span class="highlight">Rising ${getSignNamePure(ascSign)}</span> is the mask you wear and the first impression you leave on others. Rising ${getSignNamePure(ascSign)} gives you the outward temperament of ${getSignNamePure(ascSign)}.</p>`
  );
  html += '</div>';

  // Key planets
  html += '<div class="report-section"><h3>' + _t('natal.section.keyPlanets') + '</h3>';
  const keyPlanets = ['Sun','Moon','Mercury','Venus','Mars'];
  for (const pid of keyPlanets) {
    const lon = positions[pid];
    const {si} = degToSign(lon);
    const h = houses[pid] || '?';
    const p = PLANETS.find(x=>x.id===pid);
    html += _L(
      `<p><span class="highlight">${p.name}在${getSignNamePure(si)}／第${h}宫</span> — ${(PLANET_SIGN[pid] && PLANET_SIGN[pid][si]) ? PLANET_SIGN[pid][si].slice(0, -1) + '。' : ''}落第${h}宫，${HOUSE_MEANINGS[h]||''}</p>`,
      `<p><span class="highlight">${p.name} in ${getSignNamePure(si)} / House ${h}</span> — ${(PLANET_SIGN[pid] && PLANET_SIGN[pid][si]) ? PLANET_SIGN[pid][si].slice(0, -1) + '. ' : ''}In House ${h}, ${HOUSE_MEANINGS[h]||''}</p>`
    );
  }
  html += '</div>';

  // Major aspects
  html += '<div class="report-section"><h3>' + _t('natal.section.aspects') + '</h3>';
  const majorAspects = aspects.filter(a =>
    ['Sun','Moon','Mercury','Venus','Mars'].includes(a.p1) ||
    ['Sun','Moon','Mercury','Venus','Mars'].includes(a.p2)
  ).slice(0, 8);
  for (const a of majorAspects) {
    const n1 = PLANETS.find(x=>x.id===a.p1)?.name||a.p1;
    const n2 = PLANETS.find(x=>x.id===a.p2)?.name||a.p2;
    html += _L(
      `<p><span class="${a.cls}">${n1} ${a.name} ${n2}</span>（偏差${a.orb.toFixed(1)}°）— ` +
      (a.name==='合' ? '两股能量融为一体，此领域对你影响深远。' :
       a.name==='三合'||a.name==='六合' ? '能量流动顺畅，是你的天赋所在。' :
       '内在张力推动你不断成长和突破。') + '</p>',
      `<p><span class="${a.cls}">${n1} ${_aspectName(a)} ${n2}</span> (orb ${a.orb.toFixed(1)}°) — ` +
      (a.name==='合' ? 'The two energies merge into one, with profound influence in this area.' :
       a.name==='三合'||a.name==='六合' ? 'Energy flows smoothly — this is where your natural talent lies.' :
       'Inner tension drives you to continually grow and break through.') + '</p>'
    );
  }
  html += '</div>';

  return html;
}

// ── Deep 5-Year Forecast ───────────────────────────────────────────────────

function generateDeepForecast(positions, houses, mc) {
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitNow = calcAllPlanets(nowT);

  const transitPlanets = [
    {id:"Jupiter", label:"木星", enLabel:"Jupiter", period:"约1年/星座", enPeriod:"~1 year/sign", theme:"机遇、扩张、幸运", enTheme:"Opportunity, expansion, luck"},
    {id:"Saturn", label:"土星", enLabel:"Saturn", period:"约2.5年/星座", enPeriod:"~2.5 years/sign", theme:"考验、责任、成长", enTheme:"Trial, responsibility, growth"},
    {id:"Uranus", label:"天王星", enLabel:"Uranus", period:"约7年/星座", enPeriod:"~7 years/sign", theme:"突变、觉醒、突破", enTheme:"Upheaval, awakening, breakthrough"},
    {id:"Neptune", label:"海王星", enLabel:"Neptune", period:"约14年/星座", enPeriod:"~14 years/sign", theme:"梦想、消融、灵性", enTheme:"Dreams, dissolution, spirituality"},
    {id:"Pluto", label:"冥王星", enLabel:"Pluto", period:"约15-20年/星座", enPeriod:"~15-20 years/sign", theme:"蜕变、权力、重生", enTheme:"Transformation, power, rebirth"}
  ];

  // Natal element counts for synthesis
  const ec = {火:0,土:0,风:0,水:0};
  for (const p of PLANETS) {
    const {si} = degToSign(positions[p.id]);
    ec[ELEMENTS[si]]++;
  }
  const sortedElem = Object.entries(ec).sort((a,b)=>b[1]-a[1]);
  const domElem = sortedElem[0];

  let html = '';

  // ═══ Section 1: Current Major Transits ═══
  html += '<div class="report-section">';
  html += _L(
    `<p style="text-indent:0;color:var(--text-dim);margin-bottom:16px;">当前行运深度分析（基于 ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日天象）</p>`,
    `<p style="text-indent:0;color:var(--text-dim);margin-bottom:16px;">In-Depth Transit Analysis (based on ${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()} sky)</p>`
  );

  for (const tp of transitPlanets) {
    const tl = transitNow[tp.id];
    const {si} = degToSign(tl);
    html += _L(
      `<h3>✦ ${tp.label}行运 — ${tp.theme}</h3>`,
      `<h3>✦ ${tp.enLabel} Transit — ${tp.enTheme}</h3>`
    );
    html += _L(
      `<p><span class="highlight">${tp.label}当前位于${getSignName(si)}</span>，${tp.period}。</p>`,
      `<p><span class="highlight">${tp.enLabel} is currently in ${getSignName(si)}</span>, ${tp.enPeriod}.</p>`
    );

    // Current sign interpretation for outer planets
    if (tp.id === 'Jupiter') {
      const jHouse = houses.Jupiter || '?';
      html += _L(
        `<p>木星是你星盘中的幸运之星，当前它正在你第${jHouse}宫领域释放扩张能量。这是你${jHouse <= 6 ? '个人成长':'外部世界'}层面最易获得突破的阶段。</p>`,
        `<p>Jupiter is the lucky star in your chart, currently releasing expansive energy in your ${jHouse}th House. This is the phase where breakthrough is most likely on the ${jHouse <= 6 ? 'personal growth':'outer world'} level.</p>`
      );
    } else if (tp.id === 'Saturn') {
      const sHouse = houses.Saturn || '?';
      html += _L(
        `<p>土星是你此生的主要功课导师，当前它正穿行于你第${sHouse}宫，要求你在这个领域建立结构、承担责任。虽然过程不轻松，但所有在此阶段打下的基础将支撑你未来数十年的发展。</p>`,
        `<p>Saturn is your primary life-lesson teacher, currently transiting your ${sHouse}th House, asking you to build structure and take responsibility in this area. Though the process isn't easy, every foundation laid during this phase will support your development for decades to come.</p>`
      );
    } else if (tp.id === 'Uranus') {
      html += _L(
        '<p>天王星带来不可预测的转变。它正在松动你生活中那些"理所当然"的领域——看似突然的改变其实是你内心早已渴望的解放。</p>',
        '<p>Uranus brings unpredictable change. It is loosening the areas of your life you take for granted — what seems like sudden change is actually the liberation your heart has long desired.</p>'
      );
    } else if (tp.id === 'Neptune') {
      html += _L(
        '<p>海王星正在模糊某些边界，让你的直觉和灵感异常活跃。但同时也需要警惕自欺欺人和不切实际的幻想——尤其是在金钱和承诺方面。</p>',
        '<p>Neptune is blurring certain boundaries, making your intuition and inspiration unusually active. But stay vigilant against self-deception and unrealistic fantasies — especially regarding money and commitments.</p>'
      );
    } else if (tp.id === 'Pluto') {
      html += _L(
        '<p>冥王星正在进行深层的灵魂手术。它在剥除那些不再服务于你最高利益的东西——虽然过程伴随失去的痛感，但每一次"死亡"都孕育着更强大的重生。</p>',
        '<p>Pluto is performing deep soul surgery. It is stripping away what no longer serves your highest good — though the process carries the pain of loss, each "death" births a more powerful rebirth.</p>'
      );
    }

    // Check aspects to natal planets
    const natalAspects = [];
    for (const p of PLANETS) {
      let diff = mod360(Math.abs(tl - positions[p.id]));
      if (diff > 180) diff = 360 - diff;
      for (const ad of ASPECT_DEFS) {
        const delta = Math.abs(diff - ad.angle);
        if (delta <= ad.orb) {
          natalAspects.push({planet:p, aspect:ad.name, orb:delta, cls:ad.cls});
        }
      }
    }

    if (natalAspects.length > 0) {
      html += _L(
        '<p style="margin-top:8px;text-indent:0;"><strong>当前与本命行星的关键链接：</strong></p>',
        '<p style="margin-top:8px;text-indent:0;"><strong>Key current links to your natal planets:</strong></p>'
      );
      for (const na of natalAspects.slice(0, 5)) {
        let forecast = '', forecastEN = '';
        const pid = na.planet.id;
        if (tp.id === 'Jupiter') {
          if (pid === 'Sun') { forecast = '个人影响力显著扩大，事业发展迎来重要机遇。你的自信和魅力处于高峰期，适合争取更高职位或开启新项目。'; forecastEN = 'Your personal influence expands significantly, with major career opportunities emerging. Your confidence and charisma are at a peak — ideal for pursuing higher positions or launching new projects.'; }
          else if (pid === 'Moon') { forecast = '家庭和情感领域充满温暖和好运。适合搬家、装修、或改善家庭关系。内心的安全感增强。'; forecastEN = 'Warmth and good fortune fill your home and emotional life. A great time for moving, renovating, or improving family relationships. Your inner sense of security strengthens.'; }
          else if (pid === 'Mercury') { forecast = '学习和沟通运势极佳，适合考试、签约、开展新业务。你的想法更容易被他人接受和支持。'; forecastEN = 'Excellent luck in learning and communication — ideal for exams, signing contracts, launching new ventures. Your ideas are more easily accepted and supported by others.'; }
          else if (pid === 'Venus') { forecast = '感情和财运的双重利好！桃花旺盛，容易遇到有缘人；投资和艺术相关领域也有不错的回报。'; forecastEN = 'A double boost for love and finances! Romance flourishes — you may easily meet someone special. Investments and artistic pursuits also see favorable returns.'; }
          else if (pid === 'Mars') { forecast = '行动力和勇气爆棚，适合创业、竞赛或启动需要胆识的项目。但要避免过度乐观冒进。'; forecastEN = 'Courage and drive surge — ideal for entrepreneurship, competition, or launching bold projects. But avoid over-optimism and reckless moves.'; }
          else if (pid === 'Jupiter') { forecast = '本命木星被激活——这是"双重幸运"的时期，人生重要目标有望取得突破性进展。'; forecastEN = 'Your natal Jupiter is activated — a "double luck" period. Major life goals may see breakthrough progress.'; }
          else if (pid === 'Saturn') { forecast = '长期坚持的努力开始显现回报。财务上的长期投资或事业上的持久付出迎来收获期。'; forecastEN = 'Long-held efforts begin to show returns. Long-term financial investments or sustained career dedication enter a harvest period.'; }
          else { forecast = '该领域迎来扩展和幸运的能量，善用这段时间的顺风。'; forecastEN = 'This area receives expansive and fortunate energy — make good use of this tailwind.'; }
        } else if (tp.id === 'Saturn') {
          if (pid === 'Sun') { forecast = '这是你人生中的"大考"时期。事业和责任压力增大，但这也是你奠定长期成就的关键阶段。保持自律，成果将在1-2年后显现。'; forecastEN = 'This is a "major test" period in your life. Career and responsibility pressures increase, but this is also the crucial phase for laying the foundation of long-term achievement. Stay disciplined — results will manifest in 1-2 years.'; }
          else if (pid === 'Moon') { forecast = '情感和家庭领域面临成熟化的压力。可能需要承担更多家庭责任，或重新审视你的情感需求与安全感的来源。'; forecastEN = 'Emotional and family realms face pressure to mature. You may need to shoulder more family responsibilities, or re-examine your emotional needs and the source of your sense of security.'; }
          else if (pid === 'Mercury') { forecast = '思维变得更加严谨务实，适合深度学习、重要决策和长期规划。注意不要陷入过度悲观或自我怀疑。'; forecastEN = 'Your thinking becomes more rigorous and pragmatic — ideal for deep learning, important decisions, and long-term planning. Guard against sinking into excessive pessimism or self-doubt.'; }
          else if (pid === 'Venus') { forecast = '感情关系经历现实考验。不稳固的关系可能走向终结，而真正有价值的关系将变得更加深厚和有承诺。财务上趋于保守。'; forecastEN = 'Romantic relationships face reality checks. Unstable connections may end, while truly valuable ones deepen with greater commitment. Financially, a conservative approach prevails.'; }
          else if (pid === 'Mars') { forecast = '行动受阻的感觉让你沮丧，但这其实是宇宙在教你"精准发力"。与其硬冲，不如重新审视策略和方向。'; forecastEN = 'The feeling of blocked action is frustrating, but the universe is actually teaching you "precision over force." Rather than pushing harder, re-examine your strategy and direction.'; }
          else if (pid === 'Saturn') { forecast = '土星回归！这是约29年一次的人生重要转折点。你在重新定义自己的身份、责任和人生方向。'; forecastEN = 'Saturn Return! This is a major life turning point that comes roughly every 29 years. You are redefining your identity, responsibilities, and life direction.'; }
          else { forecast = '该领域需要你承担更多责任，付出努力将获得长期回报。'; forecastEN = 'This area asks you to take on more responsibility — your efforts will bring long-term rewards.'; }
        } else if (tp.id === 'Uranus') {
          if (pid === 'Sun' || pid === 'Mars') { forecast = '生活中可能发生突如其来的变化，打破旧有模式。这可能表现为突然的职业转变、搬家、或重要的个人觉醒。'; forecastEN = 'Sudden changes may disrupt old patterns. This could manifest as an unexpected career shift, relocation, or a significant personal awakening.'; }
          else if (pid === 'Venus' || pid === 'Moon') { forecast = '情感关系可能经历意想不到的转折。单身的你可能突然遇到一个完全不同类型的人；有伴的可能需要给彼此更多自由和空间。'; forecastEN = 'Relationships may undergo unexpected turns. If single, you might suddenly meet someone completely different from your usual type; if attached, you may need to give each other more freedom and space.'; }
          else if (pid === 'Mercury') { forecast = '思维异常活跃，灵感迸发。适合创新和突破性思考，但注意不要因为想法太多而无法深入。'; forecastEN = 'Your mind is unusually active, bursting with inspiration. Great for innovation and breakthrough thinking, but beware of having too many ideas to pursue any one deeply.'; }
          else { forecast = '该领域可能经历意想不到的变化和觉醒，顺应改变而非抗拒。'; forecastEN = 'This area may experience unexpected change and awakening — flow with the change rather than resisting it.'; }
        } else if (tp.id === 'Neptune') {
          if (pid === 'Sun' || pid === 'Moon') { forecast = '直觉异常敏锐的时期，但方向感可能变得模糊。适合灵性探索和创意工作，但在重大决策上需要更多理性验证。'; forecastEN = 'A period of unusually sharp intuition, though your sense of direction may become hazy. Ideal for spiritual exploration and creative work, but major decisions require extra rational verification.'; }
          else if (pid === 'Venus') { forecast = '浪漫氛围浓厚，但需警惕"滤镜效应"——你可能在感情中看到的是自己投射的理想而非真实的人。财务上避免模糊不清的安排。'; forecastEN = 'Romance is thick in the air, but watch for the "rose-colored glasses" effect — you may see your own projected ideal rather than the real person. Financially, avoid ambiguous arrangements.'; }
          else if (pid === 'Mars') { forecast = '行动力可能被迷茫感稀释。与其强迫自己前进，不如利用这段时间进行内在探索和调整。'; forecastEN = 'Your drive may be diluted by confusion. Rather than forcing yourself forward, use this time for inner exploration and recalibration.'; }
          else { forecast = '该领域需要你信任直觉，但同时保持清醒的边界感。'; forecastEN = 'This area asks you to trust your intuition while maintaining clear boundaries.'; }
        } else if (tp.id === 'Pluto') {
          if (pid === 'Sun' || pid === 'Moon') { forecast = '深刻的身份转化正在发生。你可能发现自己不再认同过去的某些身份标签——你正在蜕变成一个更真实的自己。'; forecastEN = 'A profound identity transformation is underway. You may find you no longer identify with certain past labels — you are shedding into a more authentic self.'; }
          else if (pid === 'Venus') { forecast = '情感领域正在经历深度转化。控制与被控制、占有与放手的课题浮现。真正的爱不依赖操控，而在于信任与自由。'; forecastEN = 'The emotional realm is undergoing deep transformation. Themes of control vs. being controlled, possession vs. letting go emerge. True love doesn\'t rely on manipulation but on trust and freedom.'; }
          else if (pid === 'Mars' || pid === 'Saturn') { forecast = '你的事业方向和权力位置经历深刻重组。某些局面可能面临"不破不立"的选择——相信这个过程中的毁灭是为了更好的重建。'; forecastEN = 'Your career direction and power position are undergoing profound reorganization. Certain situations may face a "no destruction, no construction" choice — trust that the dismantling is for better rebuilding.'; }
          else { forecast = '该领域正在经历根本性的转化，旧的不去新的不来。'; forecastEN = 'This area is undergoing fundamental transformation — the old must go for the new to arrive.'; }
        }
        html += _L(
          `<p>${tp.label}${na.aspect}本命${na.planet.name} → ${forecast}</p>`,
          `<p>${tp.enLabel} ${_aspectName(na.aspect)} natal ${na.planet.name} → ${forecastEN}</p>`
        );
      }
    } else {
      html += _L(
        `<p style="color:var(--text-dim);">${tp.label}目前与本命行星无紧密相位，该领域的直接影响较为温和，是整合和准备的好时机。</p>`,
        `<p style="color:var(--text-dim);">${tp.enLabel} currently has no tight aspects to natal planets — a relatively mild influence in this area, ideal for integration and preparation.</p>`
      );
    }
  }
  html += '</div>';

  // ═══ Section 2: 5-Year Timeline ═══
  html += _L(
    '<div class="report-section"><h3>✦ 未来五年 · 关键时间线</h3>',
    '<div class="report-section"><h3>✦ Five-Year Forecast · Key Timeline</h3>'
  );
  html += _L(
    '<p style="color:var(--text-dim);margin-bottom:12px;">以下时间线基于外行星行运与本命行星的相位推算。时间节点为近似值，实际感受可能提前或延后1-2个月。</p>',
    '<p style="color:var(--text-dim);margin-bottom:12px;">This timeline is calculated from outer-planet transits to your natal planets. Dates are approximate; actual felt effects may arrive 1-2 months early or late.</p>'
  );

  // Compute 6-month intervals
  const intervals = [];
  for (let i = 0; i <= 10; i++) {
    const intJD = nowJD + i * 182.625; // ~6 months in days
    const intT = centuriesSinceJ2000(intJD);
    const intPos = calcAllPlanets(intT);
    const intDate = new Date(now.getTime() + i * 182.625 * 86400000);
    const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const m = intDate.getMonth()+1;
    const label = intDate.getFullYear() + '年' + m + '月';
    const enLabel = MONTHS_EN[intDate.getMonth()] + ' ' + intDate.getFullYear();

    // Find key aspects at this interval
    const keyTransits = [];
    const outerIds = ['Jupiter','Saturn','Uranus','Neptune','Pluto'];
    const personalIds = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
    for (const oid of outerIds) {
      for (const pid of personalIds) {
        if (oid === pid) continue;
        let diff = mod360(Math.abs(intPos[oid] - positions[pid]));
        if (diff > 180) diff = 360 - diff;
        for (const ad of ASPECT_DEFS) {
          const delta = Math.abs(diff - ad.angle);
          if (delta <= ad.orb + 2) { // slightly wider orb for forecasting
            const opZH = PLANETS_ZH.find(x=>x.id===oid);
            const ppZH = PLANETS_ZH.find(x=>x.id===pid);
            const opEN = PLANETS_EN.find(x=>x.id===oid);
            const ppEN = PLANETS_EN.find(x=>x.id===pid);
            keyTransits.push({
              transitPlanet: opZH ? opZH.name : oid,
              transitPlanetEN: opEN ? opEN.name : oid,
              natalPlanet: ppZH ? ppZH.name : pid,
              natalPlanetEN: ppEN ? ppEN.name : pid,
              aspect: ad.name,
              aspectEN: ad.en || ad.name,
              orb: delta
            });
          }
        }
      }
    }

    intervals.push({label, enLabel, keyTransits});
  }

  html += _L(
    '<table class="chart-table" style="font-size:0.82em;"><thead><tr><th>时间段</th><th>关键行运</th><th>主题</th></tr></thead><tbody>',
    '<table class="chart-table" style="font-size:0.82em;"><thead><tr><th>Time Period</th><th>Key Transits</th><th>Theme</th></tr></thead><tbody>'
  );

  for (const iv of intervals) {
    let theme = '', themeEN = '', rowClass = '';
    if (iv.keyTransits.length === 0) {
      theme = '平稳整合期 — 适合巩固已有成果，为下一阶段做准备。';
      themeEN = 'Calm integration — ideal for consolidating gains and preparing for the next phase.';
    } else {
      const hardTypes = ['刑', '冲'];
      const hasJupiter = iv.keyTransits.some(t=>t.transitPlanet.includes('木星'));
      const hasJupiterSoft = iv.keyTransits.some(t=>t.transitPlanet.includes('木星') && !hardTypes.includes(t.aspect));
      const hasSaturnHard = iv.keyTransits.some(t=>t.transitPlanet.includes('土星') && hardTypes.includes(t.aspect));
      const hasSaturnSoft = iv.keyTransits.some(t=>t.transitPlanet.includes('土星') && !hardTypes.includes(t.aspect));
      const hasUranusHard = iv.keyTransits.some(t=>t.transitPlanet.includes('天王') && hardTypes.includes(t.aspect));
      const hasUranus = iv.keyTransits.some(t=>t.transitPlanet.includes('天王'));
      const hasNeptune = iv.keyTransits.some(t=>t.transitPlanet.includes('海王'));
      const hasPlutoHard = iv.keyTransits.some(t=>t.transitPlanet.includes('冥王') && hardTypes.includes(t.aspect));
      const hasPluto = iv.keyTransits.some(t=>t.transitPlanet.includes('冥王'));
      const hasOuterStress = hasSaturnHard || hasUranusHard || hasPlutoHard;

      if (hasOuterStress && hasJupiterSoft) { theme = '成长突破期 ⚡ '; themeEN = 'Growth Breakthrough ⚡ '; rowClass = ' style="border-left:3px solid var(--gold-dim);"'; }
      else if (hasSaturnHard || hasPlutoHard) { theme = '责任考验期 ⚙ '; themeEN = 'Trial by Responsibility ⚙ '; }
      else if (hasUranusHard) { theme = '重大转折期 🔥 '; themeEN = 'Major Turning Point 🔥 '; }
      else if (hasSaturnSoft && hasJupiterSoft) { theme = '稳步建设期 🏗 '; themeEN = 'Steady Building 🏗 '; }
      else if (hasJupiterSoft) { theme = '机遇扩展期 ✦ '; themeEN = 'Opportunity Expansion ✦ '; rowClass = ' style="border-left:3px solid var(--gold-dim);"'; }
      else if (hasSaturnSoft) { theme = '稳步建设期 🏗 '; themeEN = 'Steady Building 🏗 '; }
      else if (hasUranus || hasPluto) { theme = '重大转折期 🔥 '; themeEN = 'Major Turning Point 🔥 '; }
      else if (hasNeptune) { theme = '内省调整期 ~ '; themeEN = 'Introspective Adjustment ~ '; }
      else { theme = '稳定发展期 ● '; themeEN = 'Stable Development ● '; }

      theme += iv.keyTransits.map(t=>t.transitPlanet+t.aspect+t.natalPlanet).slice(0,4).join('，');
      themeEN += iv.keyTransits.map(t=>t.transitPlanetEN+t.aspectEN+t.natalPlanetEN).slice(0,4).join(', ');
      if (iv.keyTransits.length > 4) { theme += ' 等...'; themeEN += ' etc...'; }
    }

    html += _L(
      `<tr${rowClass}><td>${iv.label}</td><td>${iv.keyTransits.length === 0 ? '—' : iv.keyTransits.length+'个重要相位'}</td><td>${theme}</td></tr>`,
      `<tr${rowClass}><td>${iv.enLabel}</td><td>${iv.keyTransits.length === 0 ? '—' : iv.keyTransits.length+' major aspects'}</td><td>${themeEN}</td></tr>`
    );
  }

  html += '</tbody></table>';
  html += _L(
    '<p style="color:var(--text-dim);margin-top:8px;">※ 行运的影响是渐进的——在准确成相的前后几周内感受最为明显。外行星运行缓慢，一个相位的影响可能持续数月至一年以上。</p>',
    '<p style="color:var(--text-dim);margin-top:8px;">※ Transit effects are gradual — felt most clearly in the weeks around exact aspect. Outer planets move slowly; a single aspect\'s influence may last months to over a year.</p>'
  );
  html += '</div>';

  // ═══ Section 3: Topic Deep Dive ═══
  html += _L(
    '<div class="report-section"><h3>✦ 三大主题深度分析</h3>',
    '<div class="report-section"><h3>✦ Three Key Life Areas in Depth</h3>'
  );

  // --- Wealth ---
  html += _L(
    '<h4 style="color:var(--gold);margin-top:16px;">💰 财运深度分析</h4>',
    '<h4 style="color:var(--gold);margin-top:16px;">💰 Wealth & Finances</h4>'
  );
  const venusSign = degToSign(positions.Venus).si;
  const jupiterSign = degToSign(positions.Jupiter).si;
  const saturnSign = degToSign(positions.Saturn).si;
  const venusHouse = houses.Venus || '?';
  const jupiterHouse = houses.Jupiter || '?';

  html += _L(
    '<p>你的财运格局由金星（价值观与吸引力）和木星（扩张与幸运）共同塑造。</p>',
    '<p>Your wealth blueprint is shaped by Venus (values & magnetism) and Jupiter (expansion & luck).</p>'
  );

  const wealthElem = sortedElem[0][0];
  if (wealthElem === '土') {
    html += _L(
      '<p>你的土象元素突出，天然具备稳健的理财基因。你倾向于通过长期积累和务实投资来增长财富，而非追求快速暴富。这种特质让你在长期财富竞赛中占有优势——你能守住别人守不住的钱。</p>',
      '<p>With strong earth, you have a natural gene for steady financial management. You grow wealth through long-term accumulation and pragmatic investment rather than chasing quick riches. This trait gives you an edge in the long game — you can hold onto money that others can\'t.</p>'
    );
  } else if (wealthElem === '水') {
    html += _L(
      '<p>水象主导的你对金钱的态度往往是情感化的——赚钱的动力与安全感、情感连接紧密相关。你的财富机会往往与人际关系和直觉判断有关。投资方面的第六感常常很准，但需要搭配理性的风险管理。</p>',
      '<p>With water dominant, your relationship with money is often emotional — your drive to earn is closely tied to security and emotional connection. Wealth opportunities often come through relationships and intuitive judgment. Your investment instincts are often spot-on but need rational risk management as a partner.</p>'
    );
  } else if (wealthElem === '火') {
    html += _L(
      '<p>火象的你财富机会来自大胆的行动。创业、投资有成长潜力的领域、或将热情转化为产品和服务是你积累财富的主要路径。需要注意平衡冒险精神和财务安全底线。</p>',
      '<p>With fire dominant, wealth opportunities come through bold action. Entrepreneurship, investing in growth-potential areas, or turning passion into products and services are your main paths to building wealth. Balance your adventurous spirit with a financial safety net.</p>'
    );
  } else {
    html += _L(
      '<p>风象的你财富与人脉和信息流密切相关。你的价值在于知识和连接能力——通过专业服务、咨询、或信息差创造财富是你最擅长的路径。</p>',
      '<p>With air dominant, your wealth is closely tied to networks and information flow. Your value lies in knowledge and connection — creating wealth through professional services, consulting, or information arbitrage is your strongest path.</p>'
    );
  }

  const jupiterNatalHouse = houses.Jupiter || 1;
  const jupiterCycleYear = (jupiterNatalHouse + 5) % 12 || 12;
  html += _L(
    `<p><strong>关键时间窗口：</strong>当行运木星进入你第${jupiterHouse}宫和第${((jupiterHouse%12)+2)}宫附近时（约每6年一次），是财务扩张的最佳时机。下一个重要窗口期在木星经过你太阳星座及其对宫时——届时新的收入渠道或投资机会将自然浮现。</p>`,
    `<p><strong>Key Time Windows:</strong> When transiting Jupiter enters your ${jupiterHouse}th House and around the ${((jupiterHouse%12)+2)}th House (roughly every 6 years), it\'s the best time for financial expansion. The next important window arrives when Jupiter transits your Sun sign and its opposite sign — new income channels or investment opportunities will naturally emerge.</p>`
  );

  html += _L(
    '<p style="color:var(--accent);">你的财务策略应聚焦于：' + (wealthElem==='土'?'发挥稳健长期的复利思维':wealthElem==='火'?'发挥将热情转化为收入的创业能力':wealthElem==='水'?'发挥跟随直觉同时做好风险控制的能力':'发挥信息和连接的优势，构建多元化的收入来源') + '。</p>',
    '<p style="color:var(--accent);">Your financial strategy should focus on: ' + (wealthElem==='土'?'leveraging steady, long-term compound thinking':wealthElem==='火'?'turning passion into income through entrepreneurial ability':wealthElem==='水'?'following your intuition while maintaining risk control':'leveraging information and connections to build diversified income streams') + '.</p>'
  );

  // --- Career ---
  html += _L(
    '<h4 style="color:var(--gold);margin-top:16px;">💼 事业深度分析</h4>',
    '<h4 style="color:var(--gold);margin-top:16px;">💼 Career & Vocation</h4>'
  );
  const sunSignN = degToSign(positions.Sun).si;
  const marsSign = degToSign(positions.Mars).si;
  const sunHouse = houses.Sun || '?';
  const marsHouse = houses.Mars || '?';
  const mcSign = degToSign(mc).si;

  html += _L(
    '<p>你的事业格局由太阳（核心驱动力）+ 火星（行动模式）+ 中天MC（社会形象）共同定义。</p>',
    '<p>Your career blueprint is defined by the Sun (core drive) + Mars (action style) + Midheaven MC (public image).</p>'
  );
  html += _L(
    `<p>太阳落第${sunHouse}宫暗示你的核心成就感来自${HOUSE_LABELS[sunHouse] || '个人成长'}领域。火星落第${marsHouse}宫则说明你的行动能量主要在${HOUSE_LABELS[marsHouse] || '行动'}领域释放。你的中天${getSignNamePure(mcSign)}为你在这个世界上的"职业面孔"涂上了${getSignNamePure(mcSign)}的色彩。</p>`,
    `<p>Sun in the ${sunHouse}th House suggests your core fulfillment comes from the realm of ${HOUSE_LABELS[sunHouse] || 'personal growth'}. Mars in the ${marsHouse}th House shows your action energy flows mainly through ${HOUSE_LABELS[marsHouse] || 'action'}. Your Midheaven in ${getSignNamePure(mcSign)} colors your "professional face" shown to the world.</p>`
  );

  if (domElem[0] === '火') {
    html += _L(
      '<p>火象主导赋予你开拓型职业生涯的潜能。适合创业、管理、销售、或任何需要领导力和驱动力的领域。你的职业满足感来自"做大事"和"影响他人"——被限制在格子间里做重复性工作会消耗你的生命力。</p>',
      '<p>A fire-dominant chart gives you potential for a pioneering career path. Entrepreneurship, management, sales, or any field requiring leadership and drive suits you. Your career satisfaction comes from "doing big things" and "impacting others" — being confined to a cubicle doing repetitive work drains your life force.</p>'
    );
  } else if (domElem[0] === '土') {
    html += _L(
      '<p>土象主导让你在需要耐心和方法的职业中脱颖而出。金融、工程、建筑、医疗、或任何需要积累和精进的领域都适合你。你不在意一时的光环，而更看重长期的积累和实质性的产出。</p>',
      '<p>An earth-dominant chart helps you excel in careers requiring patience and method. Finance, engineering, architecture, healthcare — any field requiring accumulation and refinement suits you. You don\'t chase temporary glory but value long-term building and substantive output.</p>'
    );
  } else if (domElem[0] === '水') {
    html += _L(
      '<p>水象主导适合与人深度相关的职业——心理咨询、艺术创作、医疗护理、教育、或任何需要同理心和情感智慧的领域。你的职业满足感来自于"触及他人的灵魂"而非纯粹的商业成就。</p>',
      '<p>A water-dominant chart suits professions of depth with people — counseling, artistic creation, healthcare, education, or any field requiring empathy and emotional intelligence. Your career satisfaction comes from "touching another\'s soul" rather than pure commercial success.</p>'
    );
  } else {
    html += _L(
      '<p>风象主导适合与人沟通和信息处理相关的职业——媒体、科技、法律、咨询、写作、或任何需要分析能力和社交智慧的领域。多元化和持续学习是你职业生涯的关键词。</p>',
      '<p>An air-dominant chart suits careers in communication and information processing — media, technology, law, consulting, writing, or any field requiring analytical ability and social intelligence. Diversity and continuous learning are the keywords of your career.</p>'
    );
  }

  html += _L(
    '<p><strong>事业关键时间线：</strong>土星行运经过你的太阳、火星、或MC附近时（约每7年循环中的关键节点），是你事业面临重要考验和飞跃的时期。未来5年中，当行运木星与你的MC或太阳形成和谐相位时，是晋升、跳槽或创业的黄金窗口。</p>',
    '<p><strong>Key Career Timeline:</strong> When Saturn transits near your Sun, Mars, or MC (roughly every 7-year cycle at key nodes), you face important career tests and leaps. In the next 5 years, when transiting Jupiter forms harmonious aspects with your MC or Sun, a golden window opens for promotion, job change, or entrepreneurship.</p>'
  );

  // --- Romance ---
  html += _L(
    '<h4 style="color:var(--gold);margin-top:16px;">💕 桃花运深度分析</h4>',
    '<h4 style="color:var(--gold);margin-top:16px;">💕 Love & Romance</h4>'
  );
  const moonSignN = degToSign(positions.Moon).si;
  const marsHouseN = houses.Mars || '?';

  html += _L(
    '<p>你的情感格局由月亮（情感需求）+ 金星（爱的表达）+ 火星（欲望模式）交织而成。</p>',
    '<p>Your romantic blueprint is woven from the Moon (emotional needs) + Venus (expression of love) + Mars (desire patterns).</p>'
  );
  html += _L(
    `<p>月亮${getSignNamePure(moonSignN)}的你需要${moonSignN <= 3 ? '安全感和情绪共鸣' : moonSignN <= 7 ? '尊重和情感确认' : '自由与精神连接'}来感到被爱。金星${getSignNamePure(venusSign)}则决定了你如何表达爱意——以及在什么样的人身上看到美。火星落第${marsHouseN}宫透露出你的激情最容易在${HOUSE_LABELS[marsHouseN] || '行动'}领域被点燃。</p>`,
    `<p>Moon in ${getSignNamePure(moonSignN)} — you need ${moonSignN <= 3 ? 'security and emotional resonance' : moonSignN <= 7 ? 'respect and emotional validation' : 'freedom and spiritual connection'} to feel loved. Venus in ${getSignNamePure(venusSign)} determines how you express affection — and in whom you see beauty. Mars in the ${marsHouseN}th House reveals where your passion is most easily ignited: the realm of ${HOUSE_LABELS[marsHouseN] || 'action'}.</p>`
  );

  if (domElem[0] === '水') {
    html += _L(
      '<p>水象元素突出的你在感情中深度优先。你不需要很多段关系，但每一段都必须触及灵魂。你的挑战在于学会保护自己的情感边界——不是所有人都值得你的深度共情。</p>',
      '<p>With strong water, you prioritize depth in relationships. You don\'t need many connections, but each one must touch the soul. Your challenge is learning to protect your emotional boundaries — not everyone deserves your deep empathy.</p>'
    );
  } else if (domElem[0] === '火') {
    html += _L(
      '<p>火象的你在感情中热情主动、敢于表达。你容易被自信和有活力的人吸引。挑战在于学会持久的耐心——爱情的初始火花需要细水长流的养护才能成为温暖的火焰。</p>',
      '<p>With fire, you are passionate, proactive, and bold in love. You\'re drawn to confident, energetic people. The challenge is learning sustained patience — love\'s initial spark needs steady tending to become a warm, lasting flame.</p>'
    );
  } else if (domElem[0] === '土') {
    html += _L(
      '<p>土象的你在感情中务实而忠诚。你不会轻易开始一段关系，但一旦开始就会用心经营。挑战在于不要让"安全感"成为唯一的标准——有时候最好的爱来自最不按常理出牌的人。</p>',
      '<p>With earth, you are practical and loyal in love. You don\'t enter relationships lightly, but once committed, you invest wholeheartedly. The challenge is not letting "security" become the only criterion — sometimes the best love comes from the most unexpected person.</p>'
    );
  } else {
    html += _L(
      '<p>风象的你在感情中重视精神契合和有趣的对话。你需要一个能与你持续对话的伴侣。挑战在于学会沉入情感的深水区——思考爱和感受爱是两件不同的事。</p>',
      '<p>With air, you value mental chemistry and engaging conversation in love. You need a partner who can sustain dialogue with you. The challenge is learning to dive into the deep waters of feeling — thinking about love and feeling love are two different things.</p>'
    );
  }

  html += _L(
    '<p><strong>桃花关键时间线：</strong>行运木星经过你的金星、月亮或第5/7宫时，是桃花最旺的时期。行运天王星触碰到本命金星时，则可能出现"电光火石"式的情感转折——可能是突如其来的邂逅，也可能是一次重要的关系重组。未来5年中，注意以下窗口：木星每约1年切换一次星座，当它进入与你金星同元素的星座时（约每3年一次），你的情感磁场会明显增强。</p>',
    '<p><strong>Key Romance Timeline:</strong> When transiting Jupiter passes your Venus, Moon, or 5th/7th House, romance peaks. When transiting Uranus touches your natal Venus, a "lightning strike" emotional turning point may occur — either a sudden encounter or a significant relationship restructuring. In the next 5 years, watch for these windows: Jupiter changes signs roughly every year; when it enters the same element as your Venus (about every 3 years), your romantic magnetism noticeably intensifies.</p>'
  );
  html += '</div>';

  return html;
}

// ── 5-Year Forecast ───────────────────────────────────────────────────────
function generateForecast(positions, houses) {
  // Use "current" positions computed for July 2026 (approximate)
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitPos = calcAllPlanets(nowT);

  const transitPlanets = [
    {id:"Jupiter", label:"木星", enLabel:"Jupiter", period:"约1年/星座", enPeriod:"~1 year/sign", theme:"机遇、扩张、幸运", enTheme:"Opportunity, expansion, luck"},
    {id:"Saturn", label:"土星", enLabel:"Saturn", period:"约2.5年/星座", enPeriod:"~2.5 years/sign", theme:"考验、责任、成长", enTheme:"Trial, responsibility, growth"},
    {id:"Uranus", label:"天王星", enLabel:"Uranus", period:"约7年/星座", enPeriod:"~7 years/sign", theme:"突变、觉醒、突破", enTheme:"Upheaval, awakening, breakthrough"}
  ];

  let html = '<div class="report-section">';
  html += _L(
    `<p style="text-indent:0;color:var(--text-dim);margin-bottom:16px;">当前行运分析（基于 ${now.getFullYear()}年${now.getMonth()+1}月天象）</p>`,
    `<p style="text-indent:0;color:var(--text-dim);margin-bottom:16px;">Current Transit Analysis (based on ${now.getMonth()+1}/${now.getFullYear()} sky)</p>`
  );

  for (const tp of transitPlanets) {
    const tl = transitPos[tp.id];
    const {si} = degToSign(tl);
    html += _L(
      `<h3>✦ ${tp.label}行运（${tp.theme}）</h3>`,
      `<h3>✦ ${tp.enLabel} Transit (${tp.enTheme})</h3>`
    );
    html += _L(
      `<p><span class="highlight">${tp.label}当前位于${getSignName(si)}</span>，${tp.period}。</p>`,
      `<p><span class="highlight">${tp.enLabel} is currently in ${getSignName(si)}</span>, ${tp.enPeriod}.</p>`
    );

    const natalAspects = [];
    for (const p of PLANETS) {
      let diff = mod360(Math.abs(tl - positions[p.id]));
      if (diff > 180) diff = 360 - diff;
      for (const ad of ASPECT_DEFS) {
        const delta = Math.abs(diff - ad.angle);
        if (delta <= ad.orb) {
          natalAspects.push({planet:p, aspect:ad.name, orb:delta, cls:ad.cls});
        }
      }
    }

    if (natalAspects.length > 0) {
      for (const na of natalAspects.slice(0, 4)) {
        const area = na.planet.id;
        let forecast = '', forecastEN = '';
        if (tp.id === 'Jupiter') {
          if (area === 'Sun' || area === 'Jupiter') { forecast = '事业发展迎来重要机遇，个人影响力扩大。'; forecastEN = 'Major career opportunities emerge — your personal influence expands.'; }
          else if (area === 'Venus') { forecast = '人际关系和财运方面的好运，桃花旺盛。'; forecastEN = 'Good fortune in relationships and finances — romance flourishes.'; }
          else if (area === 'Mars') { forecast = '行动力和勇气增强，适合创业或新项目启动。'; forecastEN = 'Drive and courage surge — ideal for entrepreneurship or launching new projects.'; }
          else if (area === 'Saturn') { forecast = '财务或事业上的长期投资开始回报。'; forecastEN = 'Long-term financial or career investments begin to pay off.'; }
          else { forecast = '该领域迎来扩展和幸运的能量。'; forecastEN = 'This area receives expansive and fortunate energy.'; }
        } else if (tp.id === 'Saturn') {
          if (area === 'Sun' || area === 'Mars') { forecast = '事业上面临重要考验，需要更加努力和自律。这是奠定长期成就的时期。'; forecastEN = 'Important career tests — harder work and discipline needed. This period lays the foundation for long-term achievement.'; }
          else if (area === 'Moon' || area === 'Venus') { forecast = '情感和家庭领域面临成熟化的压力，需要更负责任地处理关系。'; forecastEN = 'Emotional and family realms face pressure to mature — relationships need more responsible handling.'; }
          else if (area === 'Mercury') { forecast = '思维变得更加严谨务实，适合学习深造或重要决策。'; forecastEN = 'Thinking becomes more rigorous and pragmatic — ideal for advanced study or important decisions.'; }
          else { forecast = '该领域需要承担更多责任，付出努力将获得长期回报。'; forecastEN = 'This area requires more responsibility; your efforts will bring long-term rewards.'; }
        } else {
          if (area === 'Sun' || area === 'Mars') { forecast = '生活中可能发生突如其来的变化，打破旧有模式，带来新的可能。'; forecastEN = 'Sudden changes may disrupt old patterns, bringing new possibilities.'; }
          else if (area === 'Venus' || area === 'Moon') { forecast = '情感关系可能经历意想不到的转折，引导你走向更真实的自我。'; forecastEN = 'Relationships may undergo unexpected turns, guiding you toward a more authentic self.'; }
          else { forecast = '该领域可能经历意想不到的变化和觉醒。'; forecastEN = 'This area may experience unexpected change and awakening.'; }
        }
        html += _L(
          `<p>${tp.label}${na.aspect}本命${na.planet.name} → ${forecast}</p>`,
          `<p>${tp.enLabel} ${_aspectName(na.aspect)} natal ${na.planet.name} → ${forecastEN}</p>`
        );
      }
    } else {
      html += _L(
        `<p>${tp.label}目前与本命行星无紧密相位，该领域处于平稳过渡期。</p>`,
        `<p>${tp.enLabel} currently has no tight aspects to natal planets — this area is in a calm transition period.</p>`
      );
    }
  }

  // Summary by topic
  html += _L('<h3>✦ 专题运势摘要</h3>', '<h3>✦ Fortune Summary by Topic</h3>');
  const ascHouse = houses.Sun || 1;
  const ec2Earth = ec2(positions)['土'];
  const ec2Fire = ec2(positions)['火'];
  html += _L(
    `<p><span class="highlight">💰 财运：</span>基于你的星盘配置，财富积累的关键在于发挥你的核心优势。` +
    (ec2Earth >= 3 ? '你天生具有较强的理财能力，未来5年通过稳健投资和长期规划可获得稳定增长。' :
     ec2Fire >= 3 ? '你的财富机会来自大胆的行动和创业精神，但需注意风险管理。' :
     '财运与你的人际网络和专业技能紧密相关，持续深耕专业领域将带来回报。') + '</p>',
    `<p><span class="highlight">💰 Wealth:</span> Based on your chart, the key to wealth accumulation lies in leveraging your core strengths. ` +
    (ec2Earth >= 3 ? 'You have natural financial management ability — steady investment and long-term planning will bring stable growth over the next 5 years.' :
     ec2Fire >= 3 ? 'Your wealth opportunities come from bold action and entrepreneurial spirit, but mind your risk management.' :
     'Your finances are closely tied to your network and professional expertise — deepening your specialization will bring returns.') + '</p>'
  );

  html += _L(
    `<p><span class="highlight">💼 事业运：</span>` +
    ((mcSign >= 9 && mcSign <= 11 || mcSign <= 1) ? '未来五年是你事业的关键上升期，社会地位和影响力有望显著提升。把握好当下的努力方向。' :
     '事业发展的重点在于深耕专业能力和建立可靠的合作伙伴关系。稳步前进，不急于求成。') + '</p>',
    `<p><span class="highlight">💼 Career:</span> ` +
    ((mcSign >= 9 && mcSign <= 11 || mcSign <= 1) ? 'The next five years are a key upward period for your career — social status and influence are likely to rise significantly. Stay focused on your current direction.' :
     'Your career focus should be on deepening expertise and building reliable partnerships. Steady progress — no need to rush.') + '</p>'
  );

  html += _L(
    `<p><span class="highlight">💕 桃花运：</span>` +
    (venusSign >= 2 && venusSign <= 4 ? '你的魅力正在上升期，未来两年桃花运势较强。真诚表达自我，美好的缘分自然会来。' :
     venusSign >= 6 && venusSign <= 8 ? '深度情感连接是你未来五年的主题。质量重于数量，一段深刻的关系比众多浅薄的缘分更有价值。' :
     '桃花运平缓上升，在事业和社交场合中容易遇到志同道合的人。保持开放的心态。') + '</p></div>',
    `<p><span class="highlight">💕 Romance:</span> ` +
    (venusSign >= 2 && venusSign <= 4 ? 'Your charm is on the rise — romance luck is strong over the next two years. Express yourself authentically, and the right person will naturally come.' :
     venusSign >= 6 && venusSign <= 8 ? 'Deep emotional connection is the theme of your next five years. Quality over quantity — one profound relationship is worth more than many shallow encounters.' :
     'Romance luck rises steadily — you\'ll easily meet kindred spirits in career and social settings. Keep an open heart.') + '</p></div>'
  );

  return html;
}

function ec2(positions) {
  const ec = {火:0,土:0,风:0,水:0};
  for (const p of PLANETS) {
    const {si} = degToSign(positions[p.id]);
    ec[ELEMENTS[si]]++;
  }
  return ec;
}

// ── Synastry Report ───────────────────────────────────────────────────────
function generateSynastryReport(pos1, pos2, asc1, asc2) {
  let html = '<div class="report-section">';

  // Cross aspects
  const crossAspects = [];
  for (const p1 of PLANETS) {
    for (const p2 of PLANETS) {
      let diff = mod360(Math.abs(pos1[p1.id] - pos2[p2.id]));
      if (diff > 180) diff = 360 - diff;
      for (const ad of ASPECT_DEFS) {
        const delta = Math.abs(diff - ad.angle);
        if (delta <= ad.orb) {
          crossAspects.push({p1:p1.id, p2:p2.id, name:ad.name, orb:delta, angle:ad.angle});
        }
      }
    }
  }

  // Score
  let goodScore = 0, hardScore = 0;
  for (const a of crossAspects) {
    if (a.name === '三合' || a.name === '六合') goodScore += a.name==='三合' ? 3 : 2;
    else if (a.name === '合') goodScore += 2;
    else if (a.name === '刑') hardScore += 2;
    else if (a.name === '冲') hardScore += 3;
  }

  const total = goodScore + hardScore;
  const compatPct = total > 0 ? Math.round(goodScore / total * 100) : 50;

  html += '<div class="score-display">';
  if (compatPct >= 75) html += _L(`💫 契合度：较高（${compatPct}%）`, `💫 Compatibility: High (${compatPct}%)`);
  else if (compatPct >= 55) html += _L(`✨ 契合度：中等偏上（${compatPct}%）`, `✨ Compatibility: Above Average (${compatPct}%)`);
  else if (compatPct >= 40) html += _L(`🌗 契合度：中等（${compatPct}%）`, `🌗 Compatibility: Moderate (${compatPct}%)`);
  else html += _L(`🌑 契合度：充满挑战（${compatPct}%）`, `🌑 Compatibility: Challenging (${compatPct}%)`);
  html += '</div>';

  html += `<p style="text-align:center;color:var(--text-dim);">` + _L(`和谐相位 ${goodScore} 分 / 紧张相位 ${hardScore} 分`, `Harmonious Aspects ${goodScore} pts / Tense Aspects ${hardScore} pts`) + `</p>`;

  // Key synastry aspects
  html += '<h3>✦ ' + _L('关键合盘相位', 'Key Synastry Aspects') + '</h3>';
  const keyPairs = [
    ['Sun','Moon'],['Sun','Venus'],['Sun','Mars'],
    ['Moon','Venus'],['Moon','Mars'],['Venus','Mars'],
    ['Sun','Saturn'],['Moon','Saturn'],['Jupiter','Venus']
  ];

  let found = false;
  for (const [p1,p2] of keyPairs) {
    for (const a of crossAspects) {
      if ((a.p1===p1&&a.p2===p2) || (a.p1===p2&&a.p2===p1)) {
        found = true;
        const key = `${p1}_${p2}`;
        const reversalKey = `${p2}_${p1}`;
        const data = SYNASTRY_ASPECTS[key] || SYNASTRY_ASPECTS[reversalKey];
        if (data) {
          const n1 = PLANETS.find(x=>x.id===p1)?.name||p1;
          const n2 = PLANETS.find(x=>x.id===p2)?.name||p2;
          const cls = (a.name==='三合'||a.name==='六合'||a.name==='合') ? 'aspect-good' : 'aspect-hard';
          const text = (a.name==='三合'||a.name==='六合'||a.name==='合') ? data.good : data.hard;
          html += `<p><span class="${cls}">${n1} ${_aspectName(a)} ${n2}</span> — ${text}</p>`;
        }
        break;
      }
    }
  }
  if (!found) {
    html += '<p>' + _L('你们的行星之间没有形成传统意义上的紧密相位，关系可能更多受到外在因素或其他星盘配置的影响。', 'Your planets don\'t form tight traditional aspects with each other — the relationship may be more influenced by external factors or other chart configurations.') + '</p>';
  }

  // Element compatibility
  html += '<h3>✦ ' + _L('元素契合度分析', 'Element Compatibility Analysis') + '</h3>';
  const asc1Sign = degToSign(asc1).si;
  const asc2Sign = degToSign(asc2).si;
  const e1 = ELEMENTS[asc1Sign], e2 = ELEMENTS[asc2Sign];
  const e1en = ELEMENTS_EN[e1] || e1, e2en = ELEMENTS_EN[e2] || e2;

  if (e1 === e2) {
    html += `<p>` + _L(`你们的上升星座同为${e1}象，初次见面就有一种熟悉感和默契。你们本能地用相似的方式理解和回应世界。`, `Your rising signs are both ${e1en} element — you feel a sense of familiarity and rapport from the first meeting. You instinctively understand and respond to the world in similar ways.`) + `</p>`;
  } else if ((e1==='火'&&e2==='风')||(e1==='风'&&e2==='火')||(e1==='土'&&e2==='水')||(e1==='水'&&e2==='土')) {
    html += `<p>` + _L(`你们的上升元素（${e1}🔥💨🌍🌊 与 ${e2}）天然互补，彼此能为对方提供所欠缺的视角。这是良好的化学反应的来源。`, `Your rising elements (${e1en} & ${e2en}) are naturally complementary — each provides the perspective the other lacks. This is a great source of chemistry.`) + `</p>`;
  } else {
    html += `<p>` + _L(`你们的上升元素（${e1} 与 ${e2}）差异较大，初期可能需要更多的理解和适应，但也因此能带来深刻的互相学习和成长。`, `Your rising elements (${e1en} & ${e2en}) are quite different — the initial phase may require more understanding and adjustment, but this can also bring profound mutual learning and growth.`) + `</p>`;
  }

  html += '<p style="color:var(--text-dim);margin-top:12px;">' + _L('※ 合盘是复杂的艺术，以上仅为初步分析。真正的缘分需要双方用心经营。', '※ Synastry is a complex art — the above is only a preliminary analysis. True connection requires nurturing from both sides.') + '</p>';
  html += '</div>';

  return html;
}

// ── Guidance Report ───────────────────────────────────────────────────────
function generateGuidance(positions, houses, asc) {
  const isEn = window._lang && window._lang() === 'en';
  let html = '<div class="report-section">';

  html += '<h3>✦ ' + _L('当前宇宙给你的讯息', 'Messages the Universe Has for You Right Now') + '</h3>';

  // Current Saturn transit guidance
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitPos = calcAllPlanets(nowT);

  const saturnTransitSign = degToSign(transitPos.Saturn).si;
  const jupiterTransitSign = degToSign(transitPos.Jupiter).si;

  html += `<p><span class="highlight">🪐 ` + _L(`土星当前在${getSignName(saturnTransitSign)}`, `Saturn is currently in ${getSignName(saturnTransitSign)}`) + `</span>` + _L('，它问你：', ' — it asks you: ');
  const saturnMessages_ZH = [
    "你愿意为真正重要的目标付出多少努力和耐心？",
    "哪些旧有的结构和模式已经不再服务于你的成长，需要被放下？",
    "你是否在逃避你内心真正知道需要面对的责任？",
    "你的根基够不够稳固？你需要在哪里建立更强的纪律和边界？"
  ];
  const saturnMessages_EN = [
    "How much effort and patience are you willing to invest in what truly matters?",
    "Which old structures and patterns no longer serve your growth and need to be released?",
    "Are you avoiding the responsibilities you know deep down you must face?",
    "How solid is your foundation? Where do you need to build stronger discipline and boundaries?"
  ];
  html += `「` + (isEn ? saturnMessages_EN[saturnTransitSign % 4] : saturnMessages_ZH[saturnTransitSign % 4]) + `」</p>`;

  html += `<p><span class="highlight">⭐ ` + _L(`木星当前在${getSignName(jupiterTransitSign)}`, `Jupiter is currently in ${getSignName(jupiterTransitSign)}`) + `</span>` + _L('，它告诉你：', ' — it tells you: ');
  const jupiterMessages_ZH = [
    "扩展的方向在于勇敢地开启新的冒险，相信自己的直觉和勇气。",
    "幸运来自于持续积累和感恩你已经拥有的资源。",
    "通过学习和交流打开新的视野，走出去认识新的人。",
    "情感的深度连接和家庭的温暖是你当前最大的幸运来源。",
    "创造性地表达自己，让你的才华被看见。",
    "精益求精，在你的专业领域里做到最好。",
    "合作与分享将带你走向更大的舞台。",
    "向内探索，深度的自我认知会带来意想不到的转化。",
    "旅行、学习和精神追求是你当前的最佳投资。",
    "一步步建立你的事业基础，辛勤的付出终将得到认可。",
    "拥抱你的独特之处，社群和志同道合的人会为你带来机遇。",
    "相信直觉和灵感，艺术和灵性实践会带来意想不到的收获。"
  ];
  const jupiterMessages_EN = [
    "The path of expansion lies in bravely embarking on new adventures — trust your intuition and courage.",
    "Luck comes from consistent accumulation and gratitude for the resources you already have.",
    "Open new horizons through learning and communication — go out and meet new people.",
    "Deep emotional connection and the warmth of home are your greatest sources of luck right now.",
    "Express yourself creatively and let your talents be seen.",
    "Refine your craft — strive for excellence in your field of expertise.",
    "Collaboration and sharing will lead you to a bigger stage.",
    "Turn inward — deep self-knowledge will bring unexpected transformation.",
    "Travel, learning, and spiritual pursuits are your best investments right now.",
    "Build your career foundation step by step — your hard work will eventually be recognized.",
    "Embrace your uniqueness — community and like-minded people will bring you opportunities.",
    "Trust your intuition and inspiration — artistic and spiritual practices will bring unexpected rewards."
  ];
  html += `「` + (isEn ? jupiterMessages_EN[jupiterTransitSign] : jupiterMessages_ZH[jupiterTransitSign]) + `」</p>`;

  // Life path based on Sun house
  const sunHouse = houses.Sun || 1;
  html += `<h3>✦ ` + _L('你当前的人生课题', 'Your Current Life Lesson') + `</h3>`;
  const guidanceByHouse_ZH = {
    1: "当下的核心课题是关于「自我确立」。你需要更清晰地知道自己是谁、想要什么。不要活在别人的期待中，勇敢做自己。星盘的指引：现在是重新定义个人形象和人生方向的最佳时机。",
    2: "当下的核心课题是关于「自我价值」。你是否真正认可自己的价值？是否在物质和精神上都给予了应有的重视？星盘的指引：重新审视你与金钱、资源的关系，建立更健康的自我价值感。",
    3: "当下的核心课题是关于「表达与连接」。有些话你需要说出来，有些关系需要你去主动维系。星盘的指引：打破沉默，用文字或言语分享你的想法和感受。",
    4: "当下的核心课题是关于「内在安全感」。你可能正在经历与家庭、根源和情感安全相关的议题。星盘的指引：回到内心，疗愈过去的创伤，建立内在的稳定基石。",
    5: "当下的核心课题是关于「真实的自我表达」。你多久没有纯粹地享受和创造了？星盘的指引：允许自己光芒四射，去做那些让你感到快乐和活力的事情。",
    6: "当下的核心课题是关于「身心灵的整体健康」。你的身体在告诉你什么？是否需要调整日常习惯？星盘的指引：关注健康，建立秩序，服务他人的同时也照顾好自己。",
    7: "当下的核心课题是关于「关系」。你与他人之间的互动正在映射你内在需要整合的部分。星盘的指引：学会平衡自我与他人，在关系中既不过度妥协也不过度独立。",
    8: "当下的核心课题是关于「深度转化」。你正处在一个重要的蜕变期，旧的不去新的不来。星盘的指引：面对你内心最深的恐惧和欲望，允许自己经历一场灵魂的重生。",
    9: "当下的核心课题是关于「信仰与意义」。你需要一次精神上的远行——无论是实际的旅行还是心智的探索。星盘的指引：打开心扉，接受不同的人生观和世界观。",
    10: "当下的核心课题是关于「使命与成就」。你正在被召唤去承担更多的社会责任和职业角色。星盘的指引：明确你的职业目标，用纪律和努力一步步实现。",
    11: "当下的核心课题是关于「找到你的族群」。孤独感可能来源于周围没有志同道合的人。星盘的指引：主动参与社群活动，你的梦想需要集体的力量来实现。",
    12: "当下的核心课题是关于「放下与臣服」。有些事情你无法用意志力控制，需要学会交给更大的力量。星盘的指引：独处、冥想和灵性实践会帮助你找到答案。"
  };
  const guidanceByHouse_EN = {
    1: "Your core lesson right now is about 'Self-Definition.' You need to know more clearly who you are and what you want. Don't live by others' expectations — be brave and be yourself. Chart guidance: This is the best time to redefine your personal image and life direction.",
    2: "Your core lesson right now is about 'Self-Worth.' Do you truly recognize your own value? Have you given due attention to both material and spiritual aspects? Chart guidance: Re-examine your relationship with money and resources, and build a healthier sense of self-worth.",
    3: "Your core lesson right now is about 'Expression & Connection.' Some words need to be spoken, some relationships need you to actively maintain. Chart guidance: Break the silence — share your thoughts and feelings through words, written or spoken.",
    4: "Your core lesson right now is about 'Inner Security.' You may be going through issues related to home, roots, and emotional safety. Chart guidance: Return inward, heal past wounds, and build a stable inner foundation.",
    5: "Your core lesson right now is about 'Authentic Self-Expression.' How long has it been since you purely enjoyed and created? Chart guidance: Allow yourself to shine brilliantly — do the things that bring you joy and vitality.",
    6: "Your core lesson right now is about 'Holistic Health.' What is your body telling you? Do you need to adjust your daily habits? Chart guidance: Pay attention to health, establish order, serve others while also taking good care of yourself.",
    7: "Your core lesson right now is about 'Relationships.' Your interactions with others are mirroring the parts within you that need integration. Chart guidance: Learn to balance self and other — in relationships, neither over-compromise nor be overly independent.",
    8: "Your core lesson right now is about 'Deep Transformation.' You are in an important metamorphosis — the old must go for the new to arrive. Chart guidance: Face your deepest fears and desires, and allow yourself to experience a soul rebirth.",
    9: "Your core lesson right now is about 'Faith & Meaning.' You need a spiritual journey — whether an actual trip or an exploration of the mind. Chart guidance: Open your heart and embrace different philosophies and worldviews.",
    10: "Your core lesson right now is about 'Mission & Achievement.' You are being called to take on more social responsibility and professional roles. Chart guidance: Clarify your career goals and achieve them step by step with discipline and effort.",
    11: "Your core lesson right now is about 'Finding Your Tribe.' Loneliness may come from a lack of like-minded people around you. Chart guidance: Actively participate in community events — your dreams need collective power to manifest.",
    12: "Your core lesson right now is about 'Letting Go & Surrender.' Some things cannot be controlled by willpower alone — learn to hand them over to a greater force. Chart guidance: Solitude, meditation, and spiritual practice will help you find answers."
  };
  html += `<p>${isEn ? guidanceByHouse_EN[sunHouse] : guidanceByHouse_ZH[sunHouse]}</p>`;

  // Additional insight based on prominent planet
  html += '<h3>✦ ' + _L('星盘的智慧话语', 'Wisdom from Your Chart') + '</h3>';
  const moonHouse = houses.Moon || 1;
  const saturnHouse = houses.Saturn || 1;
  const jupiterHouse = houses.Jupiter || 1;

  html += '<p style="border-left:3px solid var(--gold-dim);padding-left:16px;margin:12px 0;color:var(--accent);">';
  const wisdomPool_ZH = [
    `你的月亮在第${moonHouse}宫——真正的安全感不是来自外界，而是你与自己的和解。照顾好你的情绪需求，这不是软弱，是智慧。`,
    `你的土星在第${saturnHouse}宫——最困难的道路往往通向最美的风景。你在这个领域的挣扎，正在锻造你灵魂的肌肉。`,
    `你的木星在第${jupiterHouse}宫——幸运不是等待机会，而是准备好了的自己。在这个领域保持学习和开放，大门会自然打开。`,
    `你的上升星座守护着你的外在路径，但你的太阳才是你真正的目的地。不要为了取悦世界而忘记你为何而来。`,
    `星盘中没有绝对的吉凶——刑冲相位虽然带来张力，却是你此生最有可能实现突破的领域。拥抱你的不完美。`
  ];
  const wisdomPool_EN = [
    `Your Moon in House ${moonHouse} — true security doesn't come from the outside world, but from making peace with yourself. Take care of your emotional needs — it's not weakness, it's wisdom.`,
    `Your Saturn in House ${saturnHouse} — the hardest roads often lead to the most beautiful views. Your struggles in this area are forging the muscles of your soul.`,
    `Your Jupiter in House ${jupiterHouse} — luck isn't waiting for opportunity, it's being prepared when it arrives. Stay open and keep learning in this area, and doors will naturally open.`,
    `Your rising sign guards your outer path, but your Sun is your true destination. Don't forget why you came here just to please the world.`,
    `There are no absolute good or bad aspects in a chart — squares and oppositions bring tension, but they also mark the areas where you're most likely to achieve breakthroughs in this lifetime. Embrace your imperfections.`
  ];
  html += isEn ? wisdomPool_EN[Math.floor(Math.random() * wisdomPool_EN.length)] : wisdomPool_ZH[Math.floor(Math.random() * wisdomPool_ZH.length)];
  html += '</p>';

  html += '<p style="color:var(--text-dim);margin-top:16px;">' + _L('※ 星盘是指南针，不是绝对。你所拥有的自由意志，才是最强大的行星。', '※ Your chart is a compass, not a verdict. The free will you possess is the most powerful planet of all.') + '</p>';
  html += '</div>';

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CAREER GENIUS — Dynamic career diagnosis (对标 career_path.txt)
// ═══════════════════════════════════════════════════════════════════════════

function generateCareerGenius(positions, houses, aspects, asc, mc, userJob) {
  const isEn = window._lang && window._lang() === 'en';
  const houseNames_ZH = ["命宫","财帛宫","兄弟宫","田宅宫","子女宫","健康宫","夫妻宫","疾厄宫","迁移宫","事业宫","交友宫","玄秘宫"];
  const houseNames_EN = ["Self","Wealth","Siblings","Home","Children","Health","Marriage","Shared Resources","Travel","Career","Friends","Mystery"];
  const houseNames = isEn ? houseNames_EN : houseNames_ZH;
  const personalPlanetIds = ['Sun','Moon','Mercury','Venus','Mars'];
  const allPlanetIds = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

  // Count planets per house
  const housePlanets = {};
  for (let i = 0; i < 12; i++) housePlanets[i] = [];
  for (const pid of allPlanetIds) {
    const h = houses[pid];
    if (h && h !== '?') {
      const hi = parseInt(h) - 1;
      if (!isNaN(hi)) housePlanets[hi].push(pid);
    }
  }

  // Count personal planets per house
  const housePersonal = {};
  for (let i = 0; i < 12; i++) {
    housePersonal[i] = housePlanets[i].filter(p => personalPlanetIds.includes(p));
  }

  let html = '';

  // Part 1: Planet energy distribution
  html += '<div class="report-section"><h3>✦ ' + _L('第一部分：行星能量分布', 'Part 1: Planetary Energy Distribution') + '</h3>';

  html += '<p style="color:var(--accent);text-indent:0;margin-bottom:12px;">' + _L('你的行星能量集中在以下宫位：', 'Your planetary energy is concentrated in the following houses:') + '</p>';

  for (let i = 0; i < 12; i++) {
    if (housePlanets[i].length > 0) {
      const planetNames = housePlanets[i].map(pid => {
        const p = PLANETS.find(x => x.id === pid);
        const {si} = degToSign(positions[pid]);
        return (p ? p.name : pid) + '(' + getSignNamePure(si).replace('座','') + ')';
      });
      html += '<p style="text-indent:0;margin-bottom:4px;"><strong>' + _L('第' + (i+1) + '宫（' + houseNames_ZH[i] + '）', 'House ' + (i+1) + ' (' + houseNames_EN[i] + ')') + '：</strong>' + planetNames.join('、') + '</p>';

      // Dynamic rules for specific house clusters
      const ppCount = housePersonal[i].length;
      if (ppCount >= 3) {
        const ruleMap_ZH = {
          2: '你有' + ppCount + '颗个人行星聚集在第2宫——你对金钱和价值的敏感度远超常人。财富积累是你此生的核心课题之一，你天生适合与金钱、资源、价值评估相关的工作，而非纯粹的执行性岗位。',
          3: '你有' + ppCount + '颗个人行星聚集在第3宫——这是写作、表达、沟通、创意的殿堂。你的天赋是：用文字和语言影响他人、创作内容、传播知识。而不是：整理表格、走流程、做事务性重复工作。',
          4: '你有' + ppCount + '颗个人行星聚集在第4宫——家庭、根源、内在安全感是你生命的重心。你适合与房地产、家居、家族事业、或深度情感关怀相关的领域。',
          5: '你有' + ppCount + '颗个人行星聚集在第5宫——创造力、表现力、浪漫是你灵魂的燃料。你天生适合舞台、艺术、创意产业，或任何能让你的独特性闪耀的领域。',
          9: '你有' + ppCount + '颗个人行星聚集在第9宫——高等教育、哲学、远行和信仰是你的灵魂路径。你适合学术、出版、跨文化交流或精神导师类工作。',
          10: '你有' + ppCount + '颗个人行星聚集在第10宫——事业和社会成就刻在你的灵魂蓝图里。你注定要在这个世界留下可见的印记，不适合隐于幕后。',
          12: '你有' + ppCount + '颗个人行星聚集在第12宫——灵性、潜意识、幕后的力量是你最大的资源。你适合心理咨询、灵性疗愈、艺术创作或在大型机构中担任幕后关键角色。'
        };
        const ruleMap_EN = {
          2: 'You have ' + ppCount + ' personal planets clustered in House 2 — your sensitivity to money and value far exceeds the average person. Wealth accumulation is one of your core life themes. You are naturally suited for work involving money, resources, and value assessment — not purely executional roles.',
          3: 'You have ' + ppCount + ' personal planets clustered in House 3 — this is the palace of writing, expression, communication, and creativity. Your gift: influencing others with words and language, creating content, and spreading knowledge. Not: organizing spreadsheets, following processes, or doing repetitive clerical work.',
          4: 'You have ' + ppCount + ' personal planets clustered in House 4 — home, roots, and inner security are the center of your life. You are suited for fields related to real estate, home, family business, or deep emotional care.',
          5: 'You have ' + ppCount + ' personal planets clustered in House 5 — creativity, expressiveness, and romance are the fuel of your soul. You are naturally suited for the stage, arts, creative industries, or any field that lets your uniqueness shine.',
          9: 'You have ' + ppCount + ' personal planets clustered in House 9 — higher education, philosophy, long journeys, and faith are your soul path. You are suited for academia, publishing, cross-cultural exchange, or spiritual mentorship.',
          10: 'You have ' + ppCount + ' personal planets clustered in House 10 — career and social achievement are etched into your soul blueprint. You are destined to leave a visible mark on this world — not suited for hiding behind the scenes.',
          12: 'You have ' + ppCount + ' personal planets clustered in House 12 — spirituality, the subconscious, and behind-the-scenes power are your greatest resources. You are suited for counseling, spiritual healing, artistic creation, or serving as a key behind-the-scenes role in large organizations.'
        };
        if (ruleMap_ZH[i+1]) {
          html += '<p style="color:#c8a060;font-size:0.88em;text-indent:0;margin-left:16px;border-left:2px solid var(--gold-dim);padding-left:12px;">' + (isEn ? ruleMap_EN[i+1] : ruleMap_ZH[i+1]) + '</p>';
        }
      }
    }
  }

  // Jupiter in 8th rule
  if (houses.Jupiter === 8) {
    html += '<p style="color:var(--accent);text-indent:0;margin-top:8px;">' + _L('⭐ 木星（大吉星）落在第8宫——你天生适合投资、偏财、深度资源运作。你对"他人的资源"（客户资金、合伙财产、保险、遗产规划等）有天然的嗅觉和运气。', '⭐ Jupiter (the Great Benefic) in House 8 — you are naturally suited for investments, passive income, and deep resource management. You have a natural nose and luck for "other people\'s resources" (client funds, partnership assets, insurance, estate planning, etc.).') + '</p>';
  }

  // Pluto in 10th rule
  if (houses.Pluto === 10) {
    html += '<p style="color:var(--accent);text-indent:0;margin-top:4px;">' + _L('⭐ 冥王星落在第10宫——你的事业注定要经历彻底的转化。你不可能在同一岗位做20年——这不是缺陷，而是你星盘的剧本。每一次"职业死亡"都孕育着更强大的重生。', '⭐ Pluto in House 10 — your career is destined to undergo complete transformation. You cannot stay in the same role for 20 years — this isn\'t a flaw, it\'s the script of your chart. Every "career death" conceives a more powerful rebirth.') + '</p>';
  }

  // Mars in 6H
  if (houses.Mars === 6) {
    html += '<p style="color:var(--accent);text-indent:0;">' + _L('你的火星在第6宫——你需要动手的、有实质产出、能立即看到成果的工作。纯抽象的、只动嘴皮子的工作会消耗你的生命力。', 'Your Mars in House 6 — you need hands-on work with tangible output and immediate visible results. Purely abstract, talk-only work will drain your life force.') + '</p>';
  }

  // Saturn in 12H
  if (houses.Saturn === 12) {
    html += '<p style="color:var(--accent);text-indent:0;">' + _L('土星在第12宫——你的事业发展节奏和别人不同。你需要在幕后默默积累一段时间，然后一举突破。急不得，但也停不下来。', 'Saturn in House 12 — your career development rhythm is different from others. You need to accumulate silently behind the scenes for a while, then break through all at once. Can\'t rush it, but can\'t stop either.') + '</p>';
  }

  html += '</div>';

  // Gap Analysis (if user provided job)
  if (userJob && userJob.trim()) {
    html += '<div class="report-section"><h3>✦ ' + _L('工作满意度差距分析', 'Job Satisfaction Gap Analysis') + '</h3>';

    // Determine what the chart needs
    const needsCreative = (housePersonal[2] && housePersonal[2].length >= 2) || (housePersonal[4] && housePersonal[4].length >= 2) || (positions.Mercury && degToSign(positions.Venus).si === degToSign(positions.Mercury).si);
    const needsExpression = (housePersonal[2] && housePersonal[2].length >= 2) || (housePersonal[4] && housePersonal[4].length >= 1);
    const needsAutonomy = houses.Uranus === 10 || houses.Mars === 1 || (degToSign(asc).si >= 0 && [0,3,6,8].includes(degToSign(positions.Sun).si));
    const needsGrowth = houses.Pluto === 10 || houses.Jupiter === 10 || housePersonal[9] && housePersonal[9].length >= 2;
    const needsConnection = degToSign(positions.Sun).si >= 3 && degToSign(positions.Sun).si <= 5;

    html += '<table class="gap-table"><thead><tr><th>' + _L('维度','Dimension') + '</th><th>' + _L('当前工作','Current Job') + '</th><th>' + _L('星盘真正需要','What Your Chart Needs') + '</th></tr></thead><tbody>';
    html += '<tr><td>' + _L('创造性','Creativity') + '</td><td>★★☆☆☆</td><td>' + (needsCreative ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>' + _L('表达空间','Expression Space') + '</td><td>★★☆☆☆</td><td>' + (needsExpression ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>' + _L('独立自主','Autonomy') + '</td><td>★★☆☆☆</td><td>' + (needsAutonomy ? '★★★★☆' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>' + _L('上升空间','Growth Potential') + '</td><td>★★☆☆☆</td><td>' + (needsGrowth ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>' + _L('情感连接','Emotional Connection') + '</td><td>★★☆☆☆</td><td>' + (needsConnection ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '</tbody></table>';

    html += '<p style="color:#c87070;text-indent:0;margin-top:12px;"><strong>' + _L('差距诊断：', 'Gap Diagnosis: ') + '</strong>' + _L('你目前的「' + userJob + '」与你的星盘能力结构存在明显错位。这不是你能力不够——而是位置错了。你的星盘配置需要的是创造、表达和成长空间，而非重复执行和被动等待。', 'Your current role as 「' + userJob + '」 is clearly misaligned with your chart\'s ability structure. It\'s not that you\'re not capable — you\'re just in the wrong place. Your chart configuration calls for creativity, expression, and growth, not repetitive execution and passive waiting.') + '</p>';
    html += '</div>';
  }

  // Part 2: Four Career Directions
  html += '<div class="report-section"><h3>✦ ' + _L('第二部分：你的天赋与职业方向', 'Part 2: Your Talents & Career Directions') + '</h3>';
  html += '<p style="color:var(--text-dim);text-indent:0;margin-bottom:14px;">' + _L('以下方向基于你的星盘真实配置，按匹配度从高到低排列：', 'The following directions are based on your actual chart configuration, ranked from highest to lowest match:') + '</p>';

  const directions = [];

  // Direction: Content Creation / Media
  let score1 = 0;
  const reasons1 = [];
  const mc3 = housePersonal[2] ? housePersonal[2].length : 0;
  if (mc3 >= 2) { score1 += 3; reasons1.push(isEn ? 'House 3 cluster of ' + mc3 + ' personal planets — expression/communication is your most powerful tool' : '第3宫聚集' + mc3 + '颗个人行星——表达/沟通是你最强大的工具'); }
  if (mc3 >= 1) { score1 += 1; }
  const mercVenusDiff = mod360(Math.abs(positions.Mercury - positions.Venus));
  if (mercVenusDiff <= 8 && houses.Mercury === 3) { score1 += 2; reasons1.push(isEn ? 'Mercury+Venus conjunct in House 3 — expression with both beauty and emotional depth' : '水星+金星合相第3宫——表达兼具美感与情感深度'); }
  const mercSign = degToSign(positions.Mercury).si;
  if ([3,7,11].includes(mercSign)) { score1 += 1; reasons1.push(isEn ? 'Mercury in water sign — expression rich with emotion and intuitive depth' : '水星在水象星座——表达富有情感和直觉深度'); }
  if (houses.Moon === 9) { score1 += 1; reasons1.push(isEn ? 'Moon in House 9 — suited for deep educational/cultural/psychological content' : '月亮第9宫——适合做有深度的教育/文化/心理内容'); }
  directions.push({
    name_ZH: '内容创作 / 自媒体', name_EN: 'Content Creation / Media',
    desc_ZH: '写作、知识输出、观点表达、视频创作——你内在有很多感受和洞察需要被世界看到。' + (mercSign >= 3 && mercSign <= 5 ? '巨蟹/狮子/处女座的情感细腻让你的内容有独特的温度。' : ''),
    desc_EN: 'Writing, knowledge sharing, opinion expression, video creation — you have many inner feelings and insights that need to be seen by the world.' + (mercSign >= 3 && mercSign <= 5 ? ' Your Cancer/Leo/Virgo emotional sensitivity gives your content a unique warmth.' : ''),
    score: score1, reasons: reasons1
  });

  // Direction: Education / Training / Consulting
  let score2 = 0;
  const reasons2 = [];
  const has3H = housePersonal[2] && housePersonal[2].length >= 1;
  const has9H = housePersonal[8] && housePersonal[8].length >= 1;
  if (has3H && has9H) { score2 += 3; reasons2.push(isEn ? 'House 3-House 9 axis activated — you are naturally good at "making complex things clear"' : '第3宫-第9宫轴线被激活——你天生适合"把复杂的东西讲清楚"'); }
  if (houses.Moon === 9) { score2 += 2; reasons2.push(isEn ? 'Moon in House 9 — patience to help others organize their life and knowledge' : '月亮第9宫——有耐心帮别人梳理人生和知识体系'); }
  if (houses.Jupiter === 9 || (degToSign(positions.Jupiter).si === 3 || degToSign(positions.Jupiter).si === 8)) { score2 += 1; reasons2.push(isEn ? 'Jupiter strengthens luck in teaching and spreading ideas' : '木星强化了教学和传播的幸运'); }
  const moonSign = degToSign(positions.Moon).si;
  if (moonSign === 9 || moonSign === 0 || moonSign === 6) { score2 += 1; reasons2.push(isEn ? 'Moon ' + getSignNamePure(moonSign) + ' — structured thinking and logical patience' : '月亮' + getSignNamePure(moonSign) + '——有框架感和逻辑耐心'); }
  directions.push({
    name_ZH: '教育培训 / 咨询指导', name_EN: 'Education / Training / Consulting',
    desc_ZH: '无论是学科教育、职业技能培训还是生涯咨询，你的星盘支持你把知识和经验转化为他人的成长动力。',
    desc_EN: 'Whether academic education, vocational skills training, or career counseling — your chart supports you in turning knowledge and experience into growth fuel for others.',
    score: score2, reasons: reasons2
  });

  // Direction: Arts / Aesthetics / Beauty
  let score3 = 0;
  const reasons3 = [];
  const venusSign = degToSign(positions.Venus).si;
  if (venusSign === 1 || venusSign === 6) { score3 += 2; reasons3.push(isEn ? 'Venus in ' + getSignNamePure(venusSign) + ' — aesthetic taste is your hidden talent' : '金星在' + getSignNamePure(venusSign) + '——审美品味是你的隐性天赋'); }
  if (degToSign(asc).si === 1) { score3 += 2; reasons3.push(isEn ? 'Taurus rising — natural discernment for texture, beauty, and comfort' : '上升金牛——对质感、美感、舒适有天然的鉴别力'); }
  if (houses.Venus === 2 || houses.Venus === 7) { score3 += 1; reasons3.push(isEn ? 'Venus in House 2/7 — you can turn aesthetics into value or interpersonal appeal' : '金星落财帛/夫妻宫——你能把审美转化为价值或人际吸引力'); }
  if (degToSign(positions.Sun).si >= 3 && degToSign(positions.Sun).si <= 5) { score3 += 1; reasons3.push(isEn ? 'Sun in water sign — emotional warmth is the soul of your creativity' : '太阳水象——情感温度是你创作的灵魂'); }
  directions.push({
    name_ZH: '文化艺术 / 美业 / 设计', name_EN: 'Arts / Aesthetics / Design',
    desc_ZH: '家居、穿搭、生活方式、美食、文创——你的审美不需要"学"，它已经刻在你的星盘里。' + (degToSign(asc).si === 1 ? '上升金牛的质感追求+内在的情感温度=独特的审美风格，这是市场上稀缺的组合。' : ''),
    desc_EN: 'Home decor, fashion, lifestyle, cuisine, creative products — your aesthetic sense doesn\'t need to be "learned," it\'s already written in your chart.' + (degToSign(asc).si === 1 ? ' Taurus rising\'s pursuit of quality + inner emotional warmth = a unique aesthetic style — a rare combination in the market.' : ''),
    score: score3, reasons: reasons3
  });

  // Direction: Psychology / Healing / Spirituality
  let score4 = 0;
  const reasons4 = [];
  if (houses.Neptune === 9 || houses.Neptune === 12) { score4 += 3; reasons4.push(isEn ? 'Neptune in House ' + houses.Neptune + ' — natural perception of deep psychology and spirituality' : '海王星在第' + houses.Neptune + '宫——对深层心理和灵性有天然的感知力'); }
  if (houses.Pluto === 8) { score4 += 2; reasons4.push(isEn ? 'Pluto in House 8 — insight into the depths of human nature and the power of transformation' : '冥王星第8宫——能洞察人性的深渊和转化的力量'); }
  if (moonSign === 7 || moonSign === 11) { score4 += 2; reasons4.push(isEn ? 'Moon in Scorpio/Pisces — extremely sharp emotional antennae' : '月亮在天蝎/双鱼——情感触角极其敏锐'); }
  const h12Count = housePersonal[11] ? housePersonal[11].length : 0;
  if (h12Count >= 2) { score4 += 2; reasons4.push(isEn ? 'House 12 stellium — your life mission is connected to spiritual service' : '第12宫群星——你此生的使命与灵性服务有关'); }
  directions.push({
    name_ZH: '心理学 / 疗愈 / 身心灵领域', name_EN: 'Psychology / Healing / Spirituality',
    desc_ZH: '心理咨询、塔罗占星、生涯规划、能量疗愈——这不是"不务正业"，这是你星盘明确指出的天赋路径。你的共情力和洞察力让你能触及他人触及不到的深度。',
    desc_EN: 'Counseling, tarot & astrology, life coaching, energy healing — this isn\'t "not a real job," it\'s the talent path your chart clearly points to. Your empathy and insight let you reach depths others cannot.',
    score: score4, reasons: reasons4
  });

  // Direction: Business / Leadership / Entrepreneurship
  let score5 = 0;
  const reasons5 = [];
  if (degToSign(positions.Sun).si === 0 || degToSign(positions.Sun).si === 4 || degToSign(positions.Sun).si === 8) { score5 += 1; reasons5.push(isEn ? 'Sun in fire sign — natural leadership and pioneering spirit' : '太阳火象——天然的领导力和开拓精神'); }
  if (houses.Mars === 1 || houses.Mars === 10) { score5 += 2; reasons5.push(isEn ? 'Mars in House 1/10 — drive directly aimed at career success' : '火星在命宫/事业宫——行动力直指事业成功'); }
  if (houses.Jupiter === 2 || houses.Jupiter === 10) { score5 += 2; reasons5.push(isEn ? 'Jupiter in House 2/10 — natural luck for business expansion' : '木星在财帛/事业宫——商业扩张的天然好运'); }
  if (degToSign(positions.Saturn).si === 9) { score5 += 1; reasons5.push(isEn ? 'Saturn in Capricorn — long-term business patience' : '土星摩羯——长期主义的商业耐心'); }
  directions.push({
    name_ZH: '商业创业 / 管理领导', name_EN: 'Business / Leadership / Entrepreneurship',
    desc_ZH: '你身上有创业者的DNA——敢于冒险、善于整合资源、并能带领团队向前。适合自己当老板，或者在组织中快速晋升到决策层。',
    desc_EN: 'You have an entrepreneur\'s DNA — willing to take risks, good at integrating resources, and able to lead a team forward. Suited for being your own boss or quickly rising to decision-making levels in an organization.',
    score: score5, reasons: reasons5
  });

  // Direction: Technology / Data / Research
  let score6 = 0;
  const reasons6 = [];
  const mercSign2 = degToSign(positions.Mercury).si;
  if (mercSign2 === 2 || mercSign2 === 5 || mercSign2 === 10) { score6 += 2; reasons6.push(isEn ? 'Mercury in Gemini/Virgo/Aquarius — outstanding analytical and logical ability' : '水星双子/处女/水瓶——分析力和逻辑力突出'); }
  if (houses.Saturn === 3 || houses.Saturn === 6) { score6 += 2; reasons6.push(isEn ? 'Saturn in House ' + houses.Saturn + ' — deep research and precise thinking ability' : '土星在第' + houses.Saturn + '宫——深度钻研和精密的思维能力'); }
  if (houses.Uranus === 3 || houses.Uranus === 11) { score6 += 2; reasons6.push(isEn ? 'Uranus boost — innovative thinking and tech sensitivity' : '天王星加持——创新思维和科技敏感度'); }
  directions.push({
    name_ZH: '科技研发 / 数据分析 / 学术研究', name_EN: 'Tech R&D / Data Analysis / Academic Research',
    desc_ZH: '你拥有深入钻研一个领域并成为专家的潜力。适合科学研究、数据分析、技术开发、或任何需要严谨思维和创新突破并重的领域。',
    desc_EN: 'You have the potential to dive deep into a field and become an expert. Suited for scientific research, data analysis, tech development, or any field requiring both rigorous thinking and innovative breakthroughs.',
    score: score6, reasons: reasons6
  });

  // Sort by score descending, take top 4
  directions.sort((a, b) => b.score - a.score);
  const topDirections = directions.slice(0, 4);

  for (let i = 0; i < topDirections.length; i++) {
    const d = topDirections[i];
    const isTop = i === 0;
    html += '<div class="direction-card' + (isTop ? ' top-match' : '') + '">';
    if (isTop) html += '<span class="direction-score">' + _L('最匹配','Top Match') + '</span>';
    const dirLabels_ZH = ['【方向一】','【方向二】','【方向三】','【方向四】'];
    const dirLabels_EN = ['[Direction 1]','[Direction 2]','[Direction 3]','[Direction 4]'];
    html += '<h4>' + (isEn ? dirLabels_EN[i] : dirLabels_ZH[i]) + ' ' + (isEn ? d.name_EN : d.name_ZH) + '</h4>';
    html += '<p>' + (isEn ? d.desc_EN : d.desc_ZH) + '</p>';
    if (d.reasons.length > 0) {
      html += '<p style="font-size:0.8em;color:#8a8aa0;margin-top:6px;">' + _L('星盘依据：','Chart Evidence: ') + d.reasons.join('；') + '</p>';
    }
    html += '</div>';
  }

  html += '</div>';

  // Part 3: Action Plan — LOCKED
  html += renderLockedBlock(
    _t('locked.unlockCareer'),
    _L('上面四个方向你已经看到了。但具体怎么从「' + (userJob || '现在') + '」一步步跳出去？<br>加微信获取为你量身撰写的四步行动方案、时间线和一句话方向诊断', 'You\'ve seen the four directions above. But how exactly do you leap from 「' + (userJob || 'where you are') + '」step by step?<br>Add us on WeChat for a custom four-step action plan, timeline, and one-line direction diagnosis.'),
    [{icon:'💬', platform:_L('微信','WeChat'), id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  return html;
}

// ── Full career action plan (unlocked when rendered from PDF/premium) ──────
function generateCareerActionPlan(positions, houses, userJob, topDirections) {
  var html = '';
  const isEn = window._lang && window._lang() === 'en';
  const topDir = topDirections[0];
  const topDirName = isEn ? (topDir.name_EN || topDir.name_ZH) : (topDir.name_ZH || topDir.name_EN);

  // Step 1: After-work 2 hours
  html += '<div class="action-step">';
  html += '<div class="step-label">' + _L('第1步：从"下班后2小时"开始（' + new Date().getFullYear() + '年）', 'Step 1: Start with "2 Hours After Work" (' + new Date().getFullYear() + ')') + '</div>';
  html += '<p>' + _L('不用辞职，不用大张旗鼓。每天留1-2小时，做一件与你天赋相关的事：', 'No need to quit your job or make a big scene. Set aside 1-2 hours daily to do something related to your talents:') + '<br>';
  if (topDirName.includes('Content') || topDirName.includes('内容') || topDirName.includes('自媒体')) {
    html += _L('• 写一篇内容（小红书/公众号/知乎/短视频脚本）<br>• 录一个短视频（读书心得/行业观察/生活感悟）<br>• 搭建一个简单的知识分享账号', '• Write a piece of content (blog post / social media / short video script)<br>• Record a short video (book notes / industry observations / life reflections)<br>• Set up a simple knowledge-sharing account');
  } else if (topDirName.includes('Education') || topDirName.includes('教育') || topDirName.includes('咨询') || topDirName.includes('Consulting')) {
    html += _L('• 整理一个你擅长领域的知识框架<br>• 做一次免费分享（线上/线下）测试你的输出能力<br>• 研究目标学员/客户的需求和痛点', '• Organize a knowledge framework for a field you excel in<br>• Do one free sharing session (online/offline) to test your output ability<br>• Research the needs and pain points of your target audience/clients');
  } else if (topDirName.includes('Art') || topDirName.includes('艺术') || topDirName.includes('美业') || topDirName.includes('Aesthetics') || topDirName.includes('Design') || topDirName.includes('设计')) {
    html += _L('• 创建一个视觉灵感库（Pinterest/小红书收藏）<br>• 尝试一个小的创作项目（穿搭/家居/手作）<br>• 把你的审美变成可分享的内容', '• Create a visual inspiration library (Pinterest / mood boards)<br>• Try a small creative project (styling / home decor / handmade)<br>• Turn your aesthetic sense into shareable content');
  } else if (topDirName.includes('Psychology') || topDirName.includes('心理') || topDirName.includes('疗愈') || topDirName.includes('Healing') || topDirName.includes('Spirituality')) {
    html += _L('• 系统学习一个疗愈/心理学课程的基础模块<br>• 从帮身边的朋友做免费解读开始<br>• 记录你的个案心得和观察', '• Systematically study the basic modules of a healing/psychology course<br>• Start by doing free readings for friends around you<br>• Record your case notes and observations');
  } else if (topDirName.includes('Business') || topDirName.includes('商业') || topDirName.includes('创业') || topDirName.includes('Leadership') || topDirName.includes('Entrepreneurship')) {
    html += _L('• 研究一个你感兴趣的细分市场<br>• 列出10个潜在客户/用户的真实需求<br>• 做一个小规模测试（最小可行产品）', '• Research a niche market that interests you<br>• List 10 real needs of potential customers/users<br>• Run a small-scale test (minimum viable product)');
  } else {
    html += _L('• 选定一个方向深入学习，每天积累<br>• 记录你的学习心得和阶段性成果<br>• 找到3个该领域的榜样，研究他们的路径', '• Choose a direction to deep-dive into, accumulating daily<br>• Record your learning insights and milestone achievements<br>• Find 3 role models in the field and study their paths');
  }
  const nowYear = new Date().getFullYear();
  html += '<br><span style="color:var(--accent);">' + _L(nowYear + '-' + (nowYear+1) + '年是表达力和行动的黄金窗口期——你投入的内容和努力会比平时更容易被看到。', 'The ' + nowYear + '-' + (nowYear+1) + ' window is a golden period for expression and action — the content and effort you put in will be more visible than usual.') + '</span></p>';
  html += '</div>';

  // Step 2: Find niche
  html += '<div class="action-step">';
  html += '<div class="step-label">' + _L('第2步：找到你"1厘米宽、1公里深"的切入点', 'Step 2: Find Your "1cm Wide, 1km Deep" Entry Point') + '</div>';
  html += '<p>' + _L('不必什么都会——星盘建议你走深度路线。选一个你真正有感触、能持续输出、且市场愿意买单的方向：', 'You don\'t need to know everything — your chart suggests going deep. Pick a direction you truly resonate with, can consistently output, and the market will pay for:') + '<br>';
  const moonSi = degToSign(positions.Moon).si;
  const moonStyle_ZH = (moonSi >= 0 && moonSi <= 2) ? '行动力强、直接果断的风格' :
                    (moonSi >= 3 && moonSi <= 5) ? '情感细腻、能触及人心的风格' :
                    (moonSi >= 6 && moonSi <= 8) ? '理性分析、有框架感的风格' :
                    '深度洞察、有哲学意味的风格';
  const moonStyle_EN = (moonSi >= 0 && moonSi <= 2) ? 'strong drive and decisive style' :
                    (moonSi >= 3 && moonSi <= 5) ? 'emotionally nuanced, heart-touching style' :
                    (moonSi >= 6 && moonSi <= 8) ? 'rational analysis and structured style' :
                    'deep insight and philosophical style';
  html += '• ' + _L('你的月亮在' + getSignNamePure(moonSi) + '——你的独特优势是' + moonStyle_ZH, 'Your Moon in ' + getSignNamePure(moonSi) + ' — your unique edge is a ' + moonStyle_EN) + '<br>';
  html += '• ' + _L('月亮' + getSignNamePure(moonSi) + '不是兴趣广泛的类型，而是深耕一个领域成为专家的料', 'Moon ' + getSignNamePure(moonSi) + ' isn\'t the type for broad interests — it\'s the stuff of deep-diving into one field and becoming an expert.') + '</p>';
  html += '</div>';

  // Step 3: Barbell strategy
  html += '<div class="action-step">';
  html += '<div class="step-label">' + _L('第3步：用"杠铃策略"控制风险', 'Step 3: Control Risk with a "Barbell Strategy"') + '</div>';
  let saturnCaution_ZH = '', saturnCaution_EN = '';
  if (houses.Saturn === 12) {
    saturnCaution_ZH = '土星当前在你的第12宫领域运作——这时期不鼓励冲动辞职，而是要在幕后做好准备。耐心是这个阶段最重要的资产。';
    saturnCaution_EN = 'Saturn is currently operating in your 12th house area — this period doesn\'t encourage impulsive resignation, but rather preparation behind the scenes. Patience is the most important asset in this phase.';
  } else if (houses.Saturn === 10) {
    saturnCaution_ZH = '土星在事业宫意味着你的事业转型需要稳扎稳打——用心积累每一点经验和人脉，量变终会引起质变。';
    saturnCaution_EN = 'Saturn in the career house means your career transition needs to be steady and solid — carefully accumulate every bit of experience and connection. Quantitative change will eventually lead to qualitative change.';
  } else if (houses.Saturn === 6) {
    saturnCaution_ZH = '土星在日常工作宫——你需要在现有岗位上磨练技能和耐心，同时用业余时间铺设转型之路。';
    saturnCaution_EN = 'Saturn in the daily work house — you need to hone your skills and patience in your current role while paving the transition path in your spare time.';
  } else {
    saturnCaution_ZH = '土星在你第' + (houses.Saturn || '?') + '宫——在每个阶段打下扎实的基础，不跳过任何一个必要的步骤。';
    saturnCaution_EN = 'Saturn in your ' + (houses.Saturn || '?') + 'th house — lay a solid foundation at each stage, don\'t skip any necessary step.';
  }
  html += '<p>' + _L('• 一边做稳定的当前工作（保底）<br>• 一边用小成本试错新方向（突破）<br>• 直到新方向的收入超过主业的1/3，再考虑下一步<br>• ' + saturnCaution_ZH, '• Keep your stable current job as a safety net<br>• Test new directions with low-cost experiments (breakthrough)<br>• Don\'t consider the next step until the new direction\'s income exceeds 1/3 of your main income<br>• ' + saturnCaution_EN) + '</p>';
  html += '</div>';

  // Step 4: Timeline
  html += '<div class="action-step">';
  html += '<div class="step-label">' + _L('第4步：你要相信的时间线', 'Step 4: The Timeline You Need to Trust') + '</div>';
  const y = new Date().getFullYear();
  html += '<p>' + _L(y + '-' + (y+1) + '  起步期——种下种子，每天积累内容/技能/人脉', y + '-' + (y+1) + '  Launch Phase — plant seeds, accumulate content/skills/connections daily') + '<br>';
  html += _L((y+2) + '-' + (y+3) + '  转型准备期——内心越来越清晰，副业开始有起色', (y+2) + '-' + (y+3) + '  Transition Prep — inner clarity grows, side hustle begins gaining traction') + '<br>';
  html += _L((y+4) + '-' + (y+5) + '  突破期——身份跃升，正式转换赛道', (y+4) + '-' + (y+5) + '  Breakthrough — identity leap, officially switch lanes') + '<br>';
  html += '<span style="color:var(--accent);">' + _L('不要用辞职来逃跑。要用副业来接住自己。从今晚开始。', 'Don\'t use resignation to escape. Use a side hustle to catch yourself. Start tonight.') + '</span></p>';
  html += '</div>';

  html += '</div>';

  // Part 4: One-line summary
  html += '<div class="report-section">';
  html += '<h3>✦ ' + _L('一句话说清楚', 'One-Line Summary') + '</h3>';

  // Build dynamic summary
  let coreTalent_ZH = '', coreTalent_EN = '';
  const topHouseCount = Object.entries(housePersonal).sort((a,b) => b[1].length - a[1].length)[0];
  if (topHouseCount && topHouseCount[1].length >= 2) {
    const talentMap_ZH = {2:'写作/表达/内容创作',3:'写作/表达/内容创作',4:'家庭/情感关怀',5:'创意/艺术/表现',9:'教育/哲学/传播',10:'事业/领导/管理',12:'灵性/疗愈/幕后'};
    const talentMap_EN = {2:'writing/expression/content creation',3:'writing/expression/content creation',4:'home/emotional care',5:'creativity/art/performance',9:'education/philosophy/communication',10:'career/leadership/management',12:'spirituality/healing/behind-the-scenes'};
    coreTalent_ZH = talentMap_ZH[parseInt(topHouseCount[0])+1] || '创造和表达';
    coreTalent_EN = talentMap_EN[parseInt(topHouseCount[0])+1] || 'creativity and expression';
  } else {
    coreTalent_ZH = '创造和表达'; coreTalent_EN = 'creativity and expression';
  }

  const firstStep_ZH = topDirName.includes('内容') || topDirName.includes('Content') ? '写一篇文章' :
                    topDirName.includes('教育') || topDirName.includes('Education') ? '整理一份知识大纲' :
                    topDirName.includes('艺术') || topDirName.includes('Art') ? '做一个小创作' :
                    topDirName.includes('心理') || topDirName.includes('Psychology') ? '为一位朋友做一次免费解读' :
                    topDirName.includes('商业') || topDirName.includes('Business') ? '研究一个你感兴趣的细分市场' :
                    '投入1小时做一件与天赋相关的事';
  const firstStep_EN = topDirName.includes('Content') || topDirName.includes('内容') ? 'write an article' :
                    topDirName.includes('Education') || topDirName.includes('教育') ? 'organize a knowledge outline' :
                    topDirName.includes('Art') || topDirName.includes('艺术') ? 'do a small creative project' :
                    topDirName.includes('Psychology') || topDirName.includes('心理') ? 'do a free reading for a friend' :
                    topDirName.includes('Business') || topDirName.includes('商业') ? 'research a niche market that interests you' :
                    'spend 1 hour on something related to your talent';

  html += '<p style="font-size:1.05em;border-left:3px solid var(--gold-dim);padding-left:18px;color:var(--accent);text-indent:0;">';
  if (userJob && userJob.trim()) {
    html += _L('「' + userJob + '」不是你该待的地方。', '「' + userJob + '」is not where you belong.');
  } else {
    html += _L('你的灵魂知道哪里不对——即使说不清楚。', 'Your soul knows something is off — even if it can\'t quite articulate it.');
  }
  html += _L('你的星盘核心天赋是<strong>' + coreTalent_ZH + '</strong>——这是你与生俱来的工具。<br><br>', 'Your chart\'s core talent is <strong>' + coreTalent_EN + '</strong> — this is the tool you were born with.<br><br>');
  html += _L('不要用辞职来逃跑。要用副业来接住自己。<br>从今晚' + firstStep_ZH + '开始。', 'Don\'t use resignation to escape. Use a side hustle to catch yourself.<br>Start tonight by: ' + firstStep_EN + '.') + '</p>';
  html += '</div>';

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
//  RELATIONSHIPS — Family, Friends, Love
// ═══════════════════════════════════════════════════════════════════════════

function generateRelationships(positions, houses, aspects, asc) {
  const isEn = window._lang && window._lang() === 'en';
  const personalPlanetIds = ['Sun','Moon','Mercury','Venus','Mars'];
  let html = '';

  // Family
  html += '<div class="report-section"><h3>✦ ' + _L('亲情 — 家庭与根源', 'Family — Home & Roots') + '</h3>';

  const moonSi = degToSign(positions.Moon).si;
  const moonH = houses.Moon || '?';
  html += '<p><span class="highlight">' + _L('月亮在' + getSignNamePure(moonSi) + '／第' + moonH + '宫', 'Moon in ' + getSignNamePure(moonSi) + ' / House ' + moonH) + '</span>——' + _L('你的情感底色和安全感来源。', 'Your emotional foundation and source of security.') + '</p>';
  const moonFamilyMap_ZH = {
    0: '你在家庭中需要独立和被认可——你可能是家里的"先锋者"，承担着开路和引领的角色。',
    1: '家庭对你来说意味着稳定和物质安全感。你与母亲/养育者的关系可能围绕着"提供"和"被提供"展开。',
    2: '你在家庭中扮演沟通者的角色——你是兄弟姐妹之间的桥梁，或者家里最善于表达的那个人。',
    3: '家庭是你情感的归宿。你对家族记忆、家庭传统和亲情纽带有着深深的依恋。保护家人是你的本能。',
    4: '你在家庭中需要被看见和认可。你可能是家里最耀眼的孩子，或者承担着让家族骄傲的期待。',
    5: '家庭关系中你倾向于"服务"和"照顾"——你可能从小就担当着照顾者的角色，有时会过度付出。',
    6: '家庭关系中你追求和谐与公平。你可能是家里的"调解员"，在冲突中寻找平衡点。',
    7: '家庭情感对你来说深刻而复杂。你与家族之间可能存在权力、控制和深层信任的课题。',
    8: '你在家庭中需要自由和空间——你可能是家族中"走最远"的那个人，在观念和生活方式上与原生家庭有显著不同。',
    9: '家庭对你来说是责任和结构的来源。你可能是家里的"顶梁柱"或承担着现实的家族责任。',
    10: '家庭关系对你来说有某种"疏离中的深刻"——你可能与家族在物理或情感上有距离，但精神层面的连接反而更深。',
    11: '家庭是你灵性的根基。你与家族之间有深层的业力连接——你可能承载着家族未完成的情感课题。'
  };
  const moonFamilyMap_EN = {
    0: 'You need independence and recognition within family — you may be the family "pioneer," taking on the role of trailblazer and leader.',
    1: 'Family means stability and material security to you. Your relationship with your mother/caregiver may revolve around "providing" and "being provided for."',
    2: 'You play the communicator role in your family — you are the bridge between siblings, or the most expressive one in the household.',
    3: 'Family is your emotional home. You have a deep attachment to family memories, traditions, and kinship bonds. Protecting your family is instinctive.',
    4: 'You need to be seen and recognized within your family. You may be the brightest child, or carry the expectation of making the family proud.',
    5: 'In family dynamics you lean toward "serving" and "caretaking" — you may have been the caregiver from a young age, sometimes over-giving.',
    6: 'In family dynamics you seek harmony and fairness. You may be the family "mediator," finding balance points in conflicts.',
    7: 'Family emotions are deep and complex for you. There may be themes of power, control, and deep trust between you and your family.',
    8: 'You need freedom and space within family — you may be the one in your family who "went the furthest," with notably different views and lifestyle from your family of origin.',
    9: 'Family is a source of responsibility and structure for you. You may be the family "pillar" or carry real family responsibilities.',
    10: 'Your family relationships have a certain "depth within distance" — you may be physically or emotionally distant from family, yet the spiritual connection runs even deeper.',
    11: 'Family is your spiritual root. You have deep karmic connections with your family — you may carry unresolved emotional themes from your lineage.'
  };
  html += '<p>' + (isEn ? (moonFamilyMap_EN[moonSi] || 'Your emotional foundation is deeply tied to family.') : (moonFamilyMap_ZH[moonSi] || '你的情感根基与家庭紧密相连。')) + '</p>';

  const saturnSi = degToSign(positions.Saturn).si;
  const saturnH = houses.Saturn || '?';
  html += '<p style="margin-top:12px;"><span class="highlight">' + _L('土星在' + getSignNamePure(saturnSi) + '／第' + saturnH + '宫', 'Saturn in ' + getSignNamePure(saturnSi) + ' / House ' + saturnH) + '</span>——' + _L('你与权威/父母的关系模式。', 'Your relationship pattern with authority/parents.') + '</p>';
  if (saturnH === 4 || saturnH === '4') {
    html += '<p>' + _L('土星在第4宫暗示你早年家庭环境中可能有较严格或沉重的氛围。你从小学会了"靠自己"——这不是冷漠，而是一种被生活磨练出来的韧性。随着年岁增长，你与家人的关系会越来越和解与温暖。', 'Saturn in House 4 suggests your early home environment may have had a strict or heavy atmosphere. You learned early to "rely on yourself" — this isn\'t coldness, but resilience forged by life. As the years pass, your relationship with family will grow increasingly reconciled and warm.') + '</p>';
  } else if (saturnH === 10 || saturnH === '10') {
    html += '<p>' + _L('土星在事业宫——父母（尤其是母亲一方）对你的事业和人生成就有较高期待。这种压力可能内化为你对自己的严格要求。学会区分"父母的期待"和"自己真正想要的"是你重要的人生课题。', 'Saturn in the career house — parents (especially the mother figure) had high expectations for your career and life achievements. This pressure may have been internalized as strict self-demands. Learning to distinguish "parental expectations" from "what you truly want" is an important life lesson.') + '</p>';
  } else {
    html += '<p>' + _L('土星在你的第' + saturnH + '宫——家族责任和结构性课题在这个领域体现。成年后，你有机会重新定义"家庭"在你人生中的意义和边界。', 'Saturn in your ' + saturnH + 'th house — family responsibilities and structural themes manifest in this area. In adulthood, you have the opportunity to redefine the meaning and boundaries of "family" in your life.') + '</p>';
  }

  // IC / 4H cusp
  const icSign = degToSign(mod360(asc + 180)).si;
  html += '<p style="margin-top:8px;">' + _L('你的天底（IC）在<strong>' + getSignNamePure(icSign) + '</strong>——这代表你的"根"和内在的家。', 'Your IC (Immum Coeli) is in <strong>' + getSignNamePure(icSign) + '</strong> — this represents your "root" and inner home.') + '</p>';
  const icMap_ZH = {
    0: '你的内在之家是一个充满行动力和开拓精神的地方。你需要的不是静止的港湾，而是一个能和你一起成长的动态空间。',
    1: '你需要的家是稳定、舒适、有质感的。物质的安全感对你来说就是情感的安全感。',
    2: '你的内在之家是一个信息和交流的枢纽。你需要家人之间保持开放的对话和思想的流动。',
    3: '家是情感的容器。你需要一个可以安放所有情绪、被无条件接纳的空间。',
    4: '你的内在之家需要温暖和光芒。你需要被认可、被欣赏——家是你展示真实自我的舞台。',
    5: '家是有序的、有仪式感的。你通过日常的照料和细节来表达爱，也期待同样的用心被回馈。',
    6: '你的内在之家追求平衡与美好。和谐的家庭氛围对你来说至关重要——你愿意为此付出很多。',
    7: '家的意义对你来说比表面看起来更深刻。你需要的是一个能承载真实情感、包括阴暗面的空间。',
    8: '你的内在之家是自由和开放的。你需要家人理解你的探索欲和对广阔世界的向往。',
    9: '家是责任和承诺。你用行动而非言语来表达对家人的爱——你是家人可以依靠的基石。',
    10: '你的内在之家是独立而独特的。你可能需要比大多数人更多的个人空间，但这不意味着你不爱你的家人。',
    11: '家是你灵性的源泉。你与家人之间有无形的纽带——你可能承载着超越这一世的家族业力。'
  };
  const icMap_EN = {
    0: 'Your inner home is a place full of drive and pioneering spirit. What you need isn\'t a static harbor, but a dynamic space that grows with you.',
    1: 'The home you need is stable, comfortable, and textured. Material security IS emotional security for you.',
    2: 'Your inner home is a hub of information and exchange. You need open dialogue and the flow of ideas between family members.',
    3: 'Home is an emotional container. You need a space where all emotions can be safely held and you are unconditionally accepted.',
    4: 'Your inner home needs warmth and radiance. You need to be recognized and appreciated — home is your stage for showing your true self.',
    5: 'Home is orderly and ritualistic. You express love through daily care and attention to detail, and expect the same thoughtfulness in return.',
    6: 'Your inner home pursues balance and beauty. A harmonious family atmosphere is crucial to you — and you\'re willing to invest a lot in it.',
    7: 'Home means something deeper to you than it appears on the surface. You need a space that can hold real emotions, including the shadow sides.',
    8: 'Your inner home is free and open. You need family members who understand your urge to explore and your longing for the wider world.',
    9: 'Home is responsibility and commitment. You express love for your family through actions, not words — you are the bedrock your family can rely on.',
    10: 'Your inner home is independent and unique. You may need more personal space than most, but that doesn\'t mean you don\'t love your family.',
    11: 'Home is the wellspring of your spirituality. You have invisible bonds with your family — you may carry family karma that transcends this lifetime.'
  };
  html += '<p>' + (isEn ? (icMap_EN[icSign] || 'Your "root" is deeply connected to your family memories and emotional security.') : (icMap_ZH[icSign] || '你的"根"与你的家庭记忆和情感安全紧密相连。')) + '</p>';

  html += '</div>';

  // Friends
  html += '<div class="report-section"><h3>✦ ' + _L('友情 — 社交与社群', 'Friendship — Social & Community') + '</h3>';

  const h11Planets = [];
  for (const pid of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']) {
    if (houses[pid] === 11) h11Planets.push(pid);
  }
  if (h11Planets.length > 0) {
    const pNames = h11Planets.map(pid => {
      const p = PLANETS.find(x => x.id === pid);
      return p ? p.name : pid;
    });
    html += '<p><span class="highlight">' + _L('第11宫行星：' + pNames.join('、'), 'House 11 Planets: ' + pNames.join(', ')) + '</span>——' + _L('你的社交圈特质。', 'Your social circle traits.') + '</p>';
    if (h11Planets.includes('Jupiter')) html += '<p>' + _L('木星在第11宫——朋友是你人生中重要的幸运来源。你容易结交到有资源、有格局的人，社交圈不断扩展。你的"贵人"往往从朋友中而来。', 'Jupiter in House 11 — friends are an important source of luck in your life. You easily connect with resourceful, big-picture people, and your social circle keeps expanding. Your "benefactors" often come from your friends.') + '</p>';
    if (h11Planets.includes('Saturn')) html += '<p>' + _L('土星在第11宫——你对朋友的质量要求高于数量。你的朋友圈可能不大，但一旦建立就是长久的关系。你在社交中倾向于"少而精"。', 'Saturn in House 11 — you value quality over quantity in friends. Your circle may be small, but once formed, friendships are lasting. You lean toward "few but deep" in social life.') + '</p>';
    if (h11Planets.includes('Venus')) html += '<p>' + _L('金星在第11宫——你在朋友中是受欢迎的"和谐制造者"。社交让你快乐，你也天生懂得如何让一群人聚在一起感到舒适。', 'Venus in House 11 — you are a welcome "harmony maker" among friends. Socializing brings you joy, and you naturally know how to make a group feel comfortable together.') + '</p>';
    if (h11Planets.includes('Uranus')) html += '<p>' + _L('天王星在第11宫——你吸引到的朋友多是独特、有想法、不按常理出牌的人。你的社交圈可能跨越不同领域和背景，充满新鲜感。', 'Uranus in House 11 — the friends you attract tend to be unique, opinionated, and unconventional. Your social circle may span different fields and backgrounds, full of freshness.') + '</p>';
  } else {
    html += '<p><span class="highlight">' + _L('第11宫没有行星', 'No planets in House 11') + '</span>——' + _L('你在社交上可能是有选择性的。你不需要大量的朋友，但你在寻找的是能与你灵魂共鸣的"同类"。质量永远大于数量。', 'You may be selective socially. You don\'t need a large number of friends — what you\'re looking for are "kindred spirits" who resonate with your soul. Quality always trumps quantity.') + '</p>';
  }

  // Mercury aspects for communication
  const mercAspects = aspects.filter(a => (a.p1 === 'Mercury' || a.p2 === 'Mercury')).slice(0, 3);
  if (mercAspects.length > 0) {
    html += '<p style="margin-top:8px;">' + _L('在朋友交往中，你的沟通风格：', 'Your communication style among friends:') + '</p>';
    for (const a of mercAspects) {
      const other = a.p1 === 'Mercury' ? a.p2 : a.p1;
      const otherP = PLANETS.find(x => x.id === other);
      if (otherP) {
        html += '<p style="font-size:0.85em;color:#9a9ab0;">↳ ' + _L('水星','Mercury') + ' ' + _aspectName(a) + ' ' + otherP.name + ' — ';
        if (a.name === '三合' || a.name === '六合') html += _L('在朋友中你是善于倾听和共情的人，沟通自然流畅。', 'Among friends you\'re a good listener with natural empathy — communication flows smoothly.');
        else if (a.name === '刑') html += _L('你在交流中可能有时过于直率或紧张，但也因此你的真诚让人信赖。', 'You may sometimes be too blunt or intense in conversation, but your sincerity is exactly why people trust you.');
        else if (a.name === '冲') html += _L('你在朋友中的角色常常是"提出不同观点的人"——你的视角能帮朋友看到另一面。', 'Your role among friends is often "the one who offers a different perspective" — your viewpoint helps friends see another side.');
        else html += _L('你能与朋友进行深度的思想交流。', 'You can engage in deep intellectual exchanges with friends.');
        html += '</p>';
      }
    }
  }

  html += '</div>';

  // Love
  html += '<div class="report-section"><h3>✦ ' + _L('爱情 — 亲密关系', 'Love — Intimate Relationships') + '</h3>';

  const venusSi = degToSign(positions.Venus).si;
  const marsSi = degToSign(positions.Mars).si;
  const venusH = houses.Venus || '?';
  const marsH = houses.Mars || '?';
  const h7Planets = [];
  for (const pid of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']) {
    if (houses[pid] === 7) h7Planets.push(pid);
  }

  html += '<p><span class="highlight">' + _L('金星在' + getSignNamePure(venusSi) + '／第' + venusH + '宫', 'Venus in ' + getSignNamePure(venusSi) + ' / House ' + venusH) + '</span>——' + _L('你如何表达爱、什么样的人吸引你。', 'How you express love and what kind of person attracts you.') + '</p>';
  const venusLoveMap_ZH = {
    0: '你在爱中直接、热情、主动。你被自信、有活力、敢于追求的人吸引。爱就是行动——你不太擅长暧昧和等待。',
    1: '你在爱中稳固、忠诚、注重实质。你被可靠、有品味、懂得享受生活的人吸引。爱是细水长流的陪伴和物质的安稳。',
    2: '你在爱中需要思想的交流和有趣的对话。你被聪明、健谈、思维活跃的人吸引。爱是一场永不结束的有趣对话。',
    3: '你在爱中温柔、深情、有保护欲。你被感性、有家庭观念、懂得照顾人的人吸引。爱是回到家的安全感。',
    4: '你在爱中大方、热情、有戏剧性。你被耀眼、有魅力、敢于在众人面前表达爱意的人吸引。爱是一场盛大的冒险。',
    5: '你在爱中细腻、体贴、倾向于用行动表达。你被认真、有条理、能照顾细节的人吸引。爱藏在每一件为你做的小事里。',
    6: '你在爱中追求平衡、和谐和美感。你被优雅、有品位、懂得浪漫的人吸引。爱是两个人并肩看世界。',
    7: '你在爱中深刻、炽热、不留余地。你被神秘、有深度、能与你进行灵魂对话的人吸引。爱是全部——没有灰色地带。',
    8: '你在爱中自由、真诚、讨厌束缚。你被有趣、有见识、能带你看到更大世界的人吸引。爱是两个独立灵魂的并肩冒险。',
    9: '你在爱中认真、负责、有长远的规划。你被成熟、有担当、值得信赖的人吸引。爱是共同建造的未来。',
    10: '你在爱中独立、理性、需要空间。你被独特、有思想、不随波逐流的人吸引。爱是彼此的尊重和理解。',
    11: '你在爱中浪漫、感性、有牺牲精神。你被温柔、有灵性、能理解你复杂情感的人吸引。爱是两个灵魂在无边大海中的相遇。'
  };
  const venusLoveMap_EN = {
    0: 'In love you are direct, passionate, and proactive. You\'re attracted to confident, energetic people who dare to pursue. Love is action — you\'re not great at ambiguity and waiting.',
    1: 'In love you are steady, loyal, and value substance. You\'re attracted to reliable, tasteful people who know how to enjoy life. Love is steady companionship and material security.',
    2: 'In love you need intellectual exchange and interesting conversation. You\'re attracted to smart, talkative, mentally agile people. Love is a never-ending fascinating conversation.',
    3: 'In love you are gentle, affectionate, and protective. You\'re attracted to sensitive, family-oriented people who know how to care. Love is the security of coming home.',
    4: 'In love you are generous, passionate, and dramatic. You\'re attracted to dazzling, charismatic people who dare to express love publicly. Love is a grand adventure.',
    5: 'In love you are attentive, considerate, and express through actions. You\'re attracted to earnest, organized people who care about details. Love hides in every small thing done for you.',
    6: 'In love you seek balance, harmony, and beauty. You\'re attracted to elegant, tasteful people who understand romance. Love is two people seeing the world side by side.',
    7: 'In love you are deep, intense, and all-in. You\'re attracted to mysterious, profound people who can have soul-level conversations with you. Love is everything — no gray areas.',
    8: 'In love you are free, sincere, and hate being constrained. You\'re attracted to interesting, worldly people who can show you a bigger world. Love is two independent souls adventuring together.',
    9: 'In love you are serious, committed, and plan for the long term. You\'re attracted to mature, responsible, trustworthy people. Love is a future built together.',
    10: 'In love you are independent, rational, and need space. You\'re attracted to unique, thoughtful people who don\'t follow the crowd. Love is mutual respect and understanding.',
    11: 'In love you are romantic, sensitive, and self-sacrificing. You\'re attracted to gentle, spiritual people who understand your complex emotions. Love is two souls meeting in a boundless ocean.'
  };
  html += '<p>' + (isEn ? (venusLoveMap_EN[venusSi] || 'Your love language is unique and profound.') : (venusLoveMap_ZH[venusSi] || '你的爱的语言是独特而深刻的。')) + '</p>';

  html += '<p style="margin-top:12px;"><span class="highlight">' + _L('火星在' + getSignNamePure(marsSi) + '／第' + marsH + '宫', 'Mars in ' + getSignNamePure(marsSi) + ' / House ' + marsH) + '</span>——' + _L('你的欲望模式和激情触发点。', 'Your desire pattern and passion triggers.') + '</p>';
  const marsDesireMap_ZH = {
    0: '你的激情来得快而直接。你在亲密关系中需要追逐感和征服感——对你来说，激情的火花往往从"挑战"开始。',
    1: '你的欲望是感官的、持久的。你需要身体的触摸和物质的舒适来感到被渴望。你享受慢慢燃烧的激情。',
    2: '你的欲望从大脑开始。智力的刺激和对谈对你来说是最强的前戏。你需要一个能跟你"聊到停不下来"的人。',
    3: '你的激情藏在情感的深处。你需要感到完全的安全和被接纳，才会展现你最炽热的一面。',
    4: '你需要被崇拜和赞美。你的激情在感到自己是"特别的"时候被点燃——浪漫的仪式感和戏剧化的表达让你心动。',
    5: '你的欲望被细节和服务点燃。对你来说，真正的激情体现在日常的用心和关怀中——行动比语言更有说服力。',
    6: '你需要美和平衡。浪漫的氛围、美好的环境、艺术的触动都能点燃你的激情。你是一个浪漫主义者。',
    7: '你的欲望深沉而强烈。你需要完全的融合——身心灵的彻底交付。对你是"全有或全无"。',
    8: '你的激情需要自由和新奇。你被冒险、探索和未知吸引。对你是持续不断的发现之旅。',
    9: '你认真而持久的欲望模式。你需要尊重和承诺的框架来完全展开你的激情。一旦进入状态，你是最忠诚的爱人。',
    10: '你的欲望是独特的、甚至有些反传统的。你需要智识上的刺激和自由的空间——被控制或束缚会扑灭你的激情。',
    11: '你的激情是梦幻的、无边界的。你需要灵魂的共鸣和情感的融合。对你来说，最深的欲望是超越身体的灵魂交融。'
  };
  const marsDesireMap_EN = {
    0: 'Your passion comes fast and direct. In intimacy you need a sense of pursuit and conquest — for you, the spark of passion often begins with a "challenge."',
    1: 'Your desire is sensory and enduring. You need physical touch and material comfort to feel desired. You enjoy a slow-burning passion.',
    2: 'Your desire starts in the brain. Intellectual stimulation and conversation are the strongest foreplay for you. You need someone who can "talk with you nonstop."',
    3: 'Your passion hides deep within your emotions. You need to feel completely safe and accepted before revealing your most intense side.',
    4: 'You need to be adored and praised. Your passion ignites when you feel "special" — romantic rituals and dramatic expressions make your heart race.',
    5: 'Your desire is ignited by details and acts of service. For you, real passion shows in daily care and thoughtfulness — actions speak louder than words.',
    6: 'You need beauty and balance. A romantic atmosphere, beautiful surroundings, and artistic touches can all ignite your passion. You are a romantic.',
    7: 'Your desire is deep and intense. You need complete fusion — total surrender of body, mind, and soul. For you it\'s "all or nothing."',
    8: 'Your passion needs freedom and novelty. You\'re drawn to adventure, exploration, and the unknown. For you it\'s a continuous journey of discovery.',
    9: 'You have a serious and enduring desire pattern. You need a framework of respect and commitment to fully unfold your passion. Once engaged, you are the most loyal lover.',
    10: 'Your desire is unique, even somewhat unconventional. You need intellectual stimulation and free space — being controlled or constrained extinguishes your passion.',
    11: 'Your passion is dreamy and boundless. You need soul resonance and emotional merging. For you, the deepest desire is a soul union that transcends the physical.'
  };
  html += '<p>' + (isEn ? (marsDesireMap_EN[marsSi] || 'Your passion is the core of your life force.') : (marsDesireMap_ZH[marsSi] || '你的激情是你生命力的核心。')) + '</p>';

  // 7H planets
  if (h7Planets.length > 0) {
    const p7Names = h7Planets.map(pid => {
      const p = PLANETS.find(x => x.id === pid);
      return p ? p.name : pid;
    });
    html += '<p style="margin-top:12px;"><span class="highlight">' + _L('第7宫行星：' + p7Names.join('、'), 'House 7 Planets: ' + p7Names.join(', ')) + '</span>——' + _L('你在伴侣身上寻找的特质。', 'The qualities you seek in a partner.') + '</p>';
    if (h7Planets.includes('Jupiter')) html += '<p>' + _L('木星在第7宫——你的伴侣很可能是有格局、有智慧、或来自不同文化背景的人。婚姻/伴侣关系是你人生重要的幸运管道。', 'Jupiter in House 7 — your partner is likely someone with vision, wisdom, or from a different cultural background. Marriage/partnership is an important channel of luck in your life.') + '</p>';
    if (h7Planets.includes('Saturn')) html += '<p>' + _L('土星在第7宫——你可能晚婚，或在关系中特别认真谨慎。你需要的不是一段轻松的恋情，而是一个能共同建造未来的伴侣。', 'Saturn in House 7 — you may marry later, or be especially serious and cautious in relationships. What you need isn\'t a casual romance, but a partner to build a future with.') + '</p>';
    if (h7Planets.includes('Pluto')) html += '<p>' + _L('冥王星在第7宫——你的亲密关系是深刻转化的场所。你吸引到的伴侣往往带着强烈的能量——关系中的"死亡与重生"是你灵魂成长的必经之路。', 'Pluto in House 7 — your intimate relationships are sites of deep transformation. The partners you attract often carry intense energy — "death and rebirth" in relationships is a necessary path for your soul\'s growth.') + '</p>';
  }

  // Moon-Venus aspect
  let moonVenusDiff = mod360(Math.abs(positions.Moon - positions.Venus));
  if (moonVenusDiff > 180) moonVenusDiff = 360 - moonVenusDiff;
  html += '<p style="margin-top:12px;"><span class="highlight">' + _L('月亮与金星的关系', 'Moon-Venus Relationship') + '</span>——' + _L('你的情感需求与爱的表达之间', 'Between your emotional needs and how you express love');
  if (Math.abs(moonVenusDiff - 120) <= 8 || Math.abs(moonVenusDiff - 60) <= 6) {
    html += _L('处于<strong style="color:#7ab87a;">和谐状态</strong>。你的情感需求和爱的表达方式相辅相成——你容易在关系中感到满足和平衡。', 'is in <strong style="color:#7ab87a;">harmony</strong>. Your emotional needs and love expression complement each other — you easily feel satisfied and balanced in relationships.') + '</p>';
  } else if (Math.abs(moonVenusDiff - 0) <= 8) {
    html += _L('处于<strong style="color:#d4a843;">融合状态</strong>。你的情感需求和爱的表达合为一体——你通过照顾和滋养来表达爱，也期待同样的方式被爱。', 'is in <strong style="color:#d4a843;">fusion</strong>. Your emotional needs and love expression are one — you express love through caring and nurturing, and expect to be loved the same way.') + '</p>';
  } else if (Math.abs(moonVenusDiff - 90) <= 7 || Math.abs(moonVenusDiff - 180) <= 8) {
    html += _L('存在<strong style="color:#c87070;">内在张力</strong>。你在关系中可能反复经历"靠近-疏远"的循环。你需要的是既能给你安全感又给你自由的关系——这不是矛盾，而是你此生的核心情感课题。', 'has <strong style="color:#c87070;">inner tension</strong>. You may repeatedly experience "approach-withdraw" cycles in relationships. What you need is a relationship that gives you both security and freedom — this isn\'t a contradiction, it\'s your core emotional lesson this lifetime.') + '</p>';
  } else {
    html += _L('的关系较为独立。你可能在不同的人生阶段对"爱"有不同的理解和需求——这是你的灵活性，也是你的成长空间。', 'is relatively independent. You may have different understandings and needs for "love" at different life stages — this is both your flexibility and your room for growth.') + '</p>';
  }

  html += '</div>';

  // ═══ Social引流: 加微信解锁深度缘分分析 ═══
  html += renderLockedBlock(
    _t('locked.unlockRel'),
    _t('locked.relDesc'),
    [{icon:'💬', platform:_L('微信','WeChat'), id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  return html;
}


function generateWeeklyFortune(positions, houses, asc) {
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitNow = calcAllPlanets(nowT);

  const isEn = window._lang && window._lang() === 'en';
  let html = '<div class="report-section">';
  // Daily Moon sign changes — trendy compact edition
  html += '<h3>✦ ' + _L('星象小抄 · 本周糊弄学', 'Astro Cheat Sheet · Wing It This Week') + '</h3>';
  html += '<table class="chart-table" style="font-size:0.8em;"><thead><tr><th>' + _L('日期','Date') + '</th><th>' + _L('月亮星座','Moon Sign') + '</th><th>' + _L('宜','DO') + '</th><th>' + _L('忌','DON\'T') + '</th></tr></thead><tbody>';
  const dayNames_ZH = ['周日','周一','周二','周三','周四','周五','周六'];
  const dayNames_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayNames = isEn ? dayNames_EN : dayNames_ZH;

  function getHolidayTag(m, d) {
    if (m === 1 && d === 1) return _L('🎉元旦','🎉New Year');
    if (m === 1 && d >= 25) return _L('🧧春节倒计时','🧧LNY Countdown');
    if (m === 2 && d <= 12) return _L('🧧春节ing','🧧Lunar New Year');
    if (m === 4 && d >= 3 && d <= 6) return _L('🌿清明假期','🌿Qingming');
    if (m === 5 && d >= 1 && d <= 5) return _L('🛠️五一假期','🛠️Labor Day');
    if (m === 6 && d >= 8 && d <= 12) return _L('🐉端午','🐉Dragon Boat');
    if (m === 9 && d >= 15 && d <= 22) return _L('🌕中秋','🌕Mid-Autumn');
    if (m === 10 && d >= 1 && d <= 7) return _L('🇨🇳国庆','🇨🇳National Day');
    if (m === 12 && d >= 20 && d <= 31) return _L('🎄年末假期','🎄Year-End Holidays');
    return '';
  }

  // 12 Moon-sign-based DO/DON'T — 6 variants per sign, playful & witty
  const signDos_ZH = [
    ['<span class="dos-bold">想到就去做</span><br><span class="dos-italic">别想太多是今天的超能力</span>','<span class="dos-bold">穿件亮色</span><br><span class="dos-italic">红色橘色都行，先镇住场子</span>','<span class="dos-bold">把最难的事第一个干掉</span><br><span class="dos-italic">然后一整天空气都是甜的</span>','<span class="dos-bold">运动出汗</span><br><span class="dos-italic">白羊的身体不动会生锈</span>','<span class="dos-bold">说走就走</span><br><span class="dos-italic">换个地方待着也算旅行</span>','<span class="dos-bold">发一条朋友圈</span><br><span class="dos-italic">今天你的表达欲值得被看见</span>'],
    ['<span class="dos-bold">吃顿好的</span><br><span class="dos-italic">今天不将就，从午餐开始升级</span>','<span class="dos-bold">整理一个抽屉</span><br><span class="dos-italic">扔一件就算断舍离</span>','<span class="dos-bold">给自己买杯好咖啡</span><br><span class="dos-italic">坐下来慢慢喝，不准边走边喝</span>','<span class="dos-bold">换上刚洗的床单</span><br><span class="dos-italic">今晚你值得五星级待遇</span>','<span class="dos-bold">摸一摸植物或泥土</span><br><span class="dos-italic">接地气是金牛的充电方式</span>','<span class="dos-bold">列一个"不做什么"清单</span><br><span class="dos-italic">比待办清单更管用</span>'],
    ['<span class="dos-bold">给老朋友发条语音</span><br><span class="dos-italic">打字太慢感情会凉</span>','<span class="dos-bold">换个路线回家</span><br><span class="dos-italic">打破日常惯性，路上说不定有好事</span>','<span class="dos-bold">学一句废话外语</span><br><span class="dos-italic">比如"我的猫今天心情不好"用西语怎么说</span>','<span class="dos-bold">把脑子里飘过的想法记下来</span><br><span class="dos-italic">双子不记三秒就忘</span>','<span class="dos-bold">找个人聊到停不下来</span><br><span class="dos-italic">今天你的话密度很高，找对听众</span>','<span class="dos-bold">同时开三个窗口但只专注一个</span><br><span class="dos-italic">先宠幸最重要的那个</span>'],
    ['<span class="dos-bold">窝家点外卖</span><br><span class="dos-italic">理直气壮，不出门就是对世界最大的温柔</span>','<span class="dos-bold">翻一张旧照片</span><br><span class="dos-italic">怀旧是巨蟹的超能力，不是弱点</span>','<span class="dos-bold">给自己煮一碗面加个蛋</span><br><span class="dos-italic">做饭这件事，形式大于内容</span>','<span class="dos-bold">跟最亲的人说一句"想你"</span><br><span class="dos-italic">巨蟹的想念是最好的礼物</span>','<span class="dos-bold">泡个脚或泡个澡</span><br><span class="dos-italic">水是你的元素，泡走一天的情绪</span>','<span class="dos-bold">把灯光调暗点个蜡烛</span><br><span class="dos-italic">营造你的壳，今晚你是软体动物</span>'],
    ['<span class="dos-bold">发自拍</span><br><span class="dos-italic">不P也行，今天的你本来就能打</span>','<span class="dos-bold">戴一件夸张的首饰</span><br><span class="dos-italic">狮子不闪谁闪</span>','<span class="dos-bold">大方夸一个人</span><br><span class="dos-italic">狮子的赞美自带光环，被夸的人会记很久</span>','<span class="dos-bold">做今天第一个开口的人</span><br><span class="dos-italic">会议室或群聊里，你的话自带BGM</span>','<span class="dos-bold">穿得像要去走红毯</span><br><span class="dos-italic">哪怕只是去拿快递</span>','<span class="dos-bold">主动做个决定</span><br><span class="dos-italic">狮子最擅长的就是让一群人跟着你走</span>'],
    ['<span class="dos-bold">大扫除</span><br><span class="dos-italic">扔一件就算赢，处女座的快乐就是这么简单</span>','<span class="dos-bold">把手机通知小红点全部清掉</span><br><span class="dos-italic">世界清净了三分钟</span>','<span class="dos-bold">整理手机相册</span><br><span class="dos-italic">删掉那37张拍糊了的同一角度</span>','<span class="dos-bold">列一个清单然后划掉第一项</span><br><span class="dos-italic">划掉那一瞬间的爽感无价</span>','<span class="dos-bold">早起十分钟</span><br><span class="dos-italic">不赶时间的早晨是处女座的奢侈品</span>','<span class="dos-bold">把一件事做到90分就停</span><br><span class="dos-italic">今天放过那剩下的10分</span>'],
    ['<span class="dos-bold">约朋友喝咖啡</span><br><span class="dos-italic">你请，天秤的社交货币就是一杯咖啡</span>','<span class="dos-bold">换一身搭配</span><br><span class="dos-italic">镜子前站五分钟，今天要好看不要将就</span>','<span class="dos-bold">听一首老歌循环三遍</span><br><span class="dos-italic">天秤的耳朵需要美的滋养</span>','<span class="dos-bold">纠结的时候抛硬币</span><br><span class="dos-italic">不是为了看结果，是硬币在空中时你知道自己希望哪面朝上</span>','<span class="dos-bold">给房间换一束花或一支香薰</span><br><span class="dos-italic">天秤的环境就是心情</span>','<span class="dos-bold">说一次"不"</span><br><span class="dos-italic">天秤的温柔很贵，今天不免费发放</span>'],
    ['<span class="dos-bold">一个人看剧</span><br><span class="dos-italic">不准快进，天蝎值得完整的故事</span>','<span class="dos-bold">删一个再也不聊的微信好友</span><br><span class="dos-italic">定期清理内存是成年人的体面</span>','<span class="dos-bold">把手机设为免打扰一小时</span><br><span class="dos-italic">世界找你之前先让自己找到自己</span>','<span class="dos-bold">喝一杯不加糖的黑咖啡或浓茶</span><br><span class="dos-italic">天蝎的味觉和人生一样，要浓不要甜</span>','<span class="dos-bold">写三行日记</span><br><span class="dos-italic">不用给别人看，天蝎的秘密只属于自己</span>','<span class="dos-bold">眼神交流多停一秒</span><br><span class="dos-italic">今天你的凝视有穿透力，别浪费</span>'],
    ['<span class="dos-bold">搜机票</span><br><span class="dos-italic">不买也算旅行，射手的精神已经在登机口了</span>','<span class="dos-bold">吃一种没吃过的食物</span><br><span class="dos-italic">猎奇是射手的基本人权</span>','<span class="dos-bold">计划一次周末短途</span><br><span class="dos-italic">哪怕只是隔壁城市，出发就是意义</span>','<span class="dos-bold">跟一个陌生人聊天</span><br><span class="dos-italic">射手最擅长把路人变成故事</span>','<span class="dos-bold">换一个App的头像或签名</span><br><span class="dos-italic">新鲜感是射手的燃料</span>','<span class="dos-bold">大大方方笑出声</span><br><span class="dos-italic">射手笑起来世界都亮了一点，别憋着</span>'],
    ['<span class="dos-bold">做计划</span><br><span class="dos-italic">不做也行，但摩羯做了计划心里就踏实</span>','<span class="dos-bold">提前十分钟到</span><br><span class="dos-italic">摩羯的时间管理是一种优雅</span>','<span class="dos-bold">完成一件拖延很久的小事</span><br><span class="dos-italic">那种如释重负的感觉会上瘾</span>','<span class="dos-bold">整理一下银行卡余额</span><br><span class="dos-italic">不是为了焦虑，是摩羯天生喜欢掌控感</span>','<span class="dos-bold">给自己设定一个本周小目标</span><br><span class="dos-italic">不难，但完成后你会偷偷开心</span>','<span class="dos-bold">穿一双舒服但好看的鞋</span><br><span class="dos-italic">摩羯的实用主义也可以很体面</span>'],
    ['<span class="dos-bold">换头像</span><br><span class="dos-italic">换种心情，水瓶的精神状态需要一个新皮肤</span>','<span class="dos-bold">尝试一个奇怪的组合</span><br><span class="dos-italic">比如蘸番茄酱的薯条配冰淇淋</span>','<span class="dos-bold">一个人逛美术馆或书店</span><br><span class="dos-italic">水瓶的灵魂需要不定期的独处补给</span>','<span class="dos-bold">发明一个只有你自己懂的词</span><br><span class="dos-italic">今天就用它发一条朋友圈</span>','<span class="dos-bold">把手机通知音换成一个奇怪的声音</span><br><span class="dos-italic">让每次响铃都像行为艺术</span>','<span class="dos-bold">半夜想到什么就记下来</span><br><span class="dos-italic">水瓶的好点子都住在凌晨两点</span>'],
    ['<span class="dos-bold">睡午觉</span><br><span class="dos-italic">定个闹钟再睡，双鱼的梦需要中场休息</span>','<span class="dos-bold">听一首纯音乐闭上眼睛五分钟</span><br><span class="dos-italic">双鱼的内心世界比现实精彩</span>','<span class="dos-bold">写一首只有三行的诗</span><br><span class="dos-italic">不用押韵，双鱼的浪漫不需要格式</span>','<span class="dos-bold">看一部画面很美的电影</span><br><span class="dos-italic">剧情不重要，眼睛吃饱就行</span>','<span class="dos-bold">给自己买一支花</span><br><span class="dos-italic">双鱼的生活需要一点无用的美好</span>','<span class="dos-bold">允许自己放空一小时</span><br><span class="dos-italic">不产出不社交不思考，双鱼需要飘着</span>']
  ];
  const signDos_EN = [
    ['<span class="dos-bold">Do it now</span><br><span class="dos-italic">Not overthinking is today\'s superpower</span>','<span class="dos-bold">Wear something bright</span><br><span class="dos-italic">Red or orange — set the tone first</span>','<span class="dos-bold">Tackle the hardest thing first</span><br><span class="dos-italic">Then the rest of the day tastes sweet</span>','<span class="dos-bold">Sweat it out</span><br><span class="dos-italic">An Aries body rusts if it stays still</span>','<span class="dos-bold">Go somewhere on impulse</span><br><span class="dos-italic">Being somewhere else counts as travel</span>','<span class="dos-bold">Post something</span><br><span class="dos-italic">Your urge to express deserves to be seen today</span>'],
    ['<span class="dos-bold">Eat something nice</span><br><span class="dos-italic">No compromises today — upgrade starting from lunch</span>','<span class="dos-bold">Organize one drawer</span><br><span class="dos-italic">Tossing one thing counts as decluttering</span>','<span class="dos-bold">Buy yourself a good coffee</span><br><span class="dos-italic">Sit down and sip slowly — no walking with it</span>','<span class="dos-bold">Put on fresh sheets</span><br><span class="dos-italic">You deserve a five-star experience tonight</span>','<span class="dos-bold">Touch a plant or soil</span><br><span class="dos-italic">Grounding is how Taurus recharges</span>','<span class="dos-bold">Make a "stop doing" list</span><br><span class="dos-italic">More effective than a to-do list</span>'],
    ['<span class="dos-bold">Send a voice message to an old friend</span><br><span class="dos-italic">Typing is too slow — feelings cool down</span>','<span class="dos-bold">Take a different route home</span><br><span class="dos-italic">Break the routine — something good might be waiting</span>','<span class="dos-bold">Learn a useless phrase in another language</span><br><span class="dos-italic">Like "my cat is in a bad mood today" in Spanish</span>','<span class="dos-bold">Write down the thoughts floating by</span><br><span class="dos-italic">Gemini forgets in three seconds if you don\'t</span>','<span class="dos-bold">Find someone to talk nonstop with</span><br><span class="dos-italic">Your word density is high today — find the right audience</span>','<span class="dos-bold">Open three windows but focus on one</span><br><span class="dos-italic">Favor the most important one first</span>'],
    ['<span class="dos-bold">Stay in and order delivery</span><br><span class="dos-italic">No guilt — not going out is your gift to the world</span>','<span class="dos-bold">Flip through an old photo</span><br><span class="dos-italic">Nostalgia is a Cancer superpower, not a weakness</span>','<span class="dos-bold">Cook noodles with an egg</span><br><span class="dos-italic">The ritual matters more than the dish</span>','<span class="dos-bold">Tell your closest person "I miss you"</span><br><span class="dos-italic">A Cancer\'s longing is the best gift</span>','<span class="dos-bold">Soak your feet or take a bath</span><br><span class="dos-italic">Water is your element — wash away the day\'s emotions</span>','<span class="dos-bold">Dim the lights and light a candle</span><br><span class="dos-italic">Build your shell — tonight you\'re a soft mollusk</span>'],
    ['<span class="dos-bold">Post a selfie</span><br><span class="dos-italic">No filter needed — you\'re camera-ready today</span>','<span class="dos-bold">Wear bold jewelry</span><br><span class="dos-italic">If Leo doesn\'t shine, who will?</span>','<span class="dos-bold">Compliment someone generously</span><br><span class="dos-italic">Leo\'s praise has a halo — the recipient will remember it</span>','<span class="dos-bold">Be the first to speak up today</span><br><span class="dos-italic">In meetings or group chats, your words have a built-in soundtrack</span>','<span class="dos-bold">Dress like you\'re walking a red carpet</span><br><span class="dos-italic">Even if it\'s just to grab a package</span>','<span class="dos-bold">Make a decision proactively</span><br><span class="dos-italic">Leo\'s best skill is getting people to follow your lead</span>'],
    ['<span class="dos-bold">Deep clean something</span><br><span class="dos-italic">Tossing one thing is a win — Virgo joy is that simple</span>','<span class="dos-bold">Clear all notification badges</span><br><span class="dos-italic">The world goes quiet for three whole minutes</span>','<span class="dos-bold">Clean up your photo gallery</span><br><span class="dos-italic">Delete those 37 blurry shots from the same angle</span>','<span class="dos-bold">Make a list and cross off the first item</span><br><span class="dos-italic">That crossing-off moment is pure satisfaction</span>','<span class="dos-bold">Wake up ten minutes early</span><br><span class="dos-italic">A morning without rushing is a Virgo luxury</span>','<span class="dos-bold">Stop at 90% done</span><br><span class="dos-italic">Let go of the remaining 10% today</span>'],
    ['<span class="dos-bold">Invite a friend for coffee</span><br><span class="dos-italic">Your treat — a Libra\'s social currency is a cup of coffee</span>','<span class="dos-bold">Switch up your outfit</span><br><span class="dos-italic">Stand in front of the mirror for five minutes — look good, don\'t settle</span>','<span class="dos-bold">Loop an old song three times</span><br><span class="dos-italic">A Libra\'s ears need beauty to thrive</span>','<span class="dos-bold">Flip a coin when you can\'t decide</span><br><span class="dos-italic">It\'s not about the result — it\'s knowing which side you hope for while it\'s in the air</span>','<span class="dos-bold">Change the flowers or light a new scent</span><br><span class="dos-italic">A Libra\'s environment IS their mood</span>','<span class="dos-bold">Say "no" once</span><br><span class="dos-italic">Libra kindness is expensive — not giving it away for free today</span>'],
    ['<span class="dos-bold">Watch a show alone</span><br><span class="dos-italic">No skipping — Scorpio deserves the full story</span>','<span class="dos-bold">Delete a contact you never talk to</span><br><span class="dos-italic">Regular memory cleanup is adult dignity</span>','<span class="dos-bold">Put your phone on DND for an hour</span><br><span class="dos-italic">Find yourself before the world finds you</span>','<span class="dos-bold">Drink unsweetened black coffee or strong tea</span><br><span class="dos-italic">Scorpio taste buds — and life — prefer intensity over sweetness</span>','<span class="dos-bold">Write three lines in a journal</span><br><span class="dos-italic">No one needs to see it — Scorpio secrets belong to yourself</span>','<span class="dos-bold">Hold eye contact one second longer</span><br><span class="dos-italic">Your gaze has penetrating power today — don\'t waste it</span>'],
    ['<span class="dos-bold">Search for flights</span><br><span class="dos-italic">You don\'t have to buy — your spirit is already at the gate</span>','<span class="dos-bold">Eat something you\'ve never tried</span><br><span class="dos-italic">Novelty-seeking is a Sagittarius birthright</span>','<span class="dos-bold">Plan a weekend getaway</span><br><span class="dos-italic">Even if it\'s just the next town over — the departure IS the point</span>','<span class="dos-bold">Talk to a stranger</span><br><span class="dos-italic">Sagittarius turns passersby into stories</span>','<span class="dos-bold">Change your avatar or bio</span><br><span class="dos-italic">Freshness is Sagittarius fuel</span>','<span class="dos-bold">Laugh out loud, uninhibited</span><br><span class="dos-italic">A Sagittarius laugh brightens the world — don\'t hold back</span>'],
    ['<span class="dos-bold">Make a plan</span><br><span class="dos-italic">You don\'t have to, but Capricorn sleeps better with one</span>','<span class="dos-bold">Arrive ten minutes early</span><br><span class="dos-italic">Capricorn time management is a form of elegance</span>','<span class="dos-bold">Finish one small thing you\'ve been putting off</span><br><span class="dos-italic">That wave of relief is addictive</span>','<span class="dos-bold">Check your account balance</span><br><span class="dos-italic">Not for anxiety — Capricorn just naturally likes a sense of control</span>','<span class="dos-bold">Set one small weekly goal</span><br><span class="dos-italic">Nothing hard — but you\'ll secretly smile when you hit it</span>','<span class="dos-bold">Wear comfortable but nice-looking shoes</span><br><span class="dos-italic">Capricorn practicality can be dignified too</span>'],
    ['<span class="dos-bold">Change your avatar</span><br><span class="dos-italic">New mood — Aquarius mental state needs a fresh skin</span>','<span class="dos-bold">Try a weird combination</span><br><span class="dos-italic">Like fries dipped in ketchup with ice cream</span>','<span class="dos-bold">Browse a gallery or bookstore alone</span><br><span class="dos-italic">Aquarius soul needs regular solo replenishment</span>','<span class="dos-bold">Invent a word only you understand</span><br><span class="dos-italic">Use it in a post today</span>','<span class="dos-bold">Change your notification sound to something odd</span><br><span class="dos-italic">Make every ring a performance art piece</span>','<span class="dos-bold">Write down whatever pops into your head at midnight</span><br><span class="dos-italic">Aquarius good ideas all live at 2 AM</span>'],
    ['<span class="dos-bold">Take a nap</span><br><span class="dos-italic">Set an alarm first — Pisces dreams need an intermission</span>','<span class="dos-bold">Listen to instrumental music with eyes closed for five minutes</span><br><span class="dos-italic">Your inner world is more colorful than reality</span>','<span class="dos-bold">Write a three-line poem</span><br><span class="dos-italic">No rhyme needed — Pisces romance has no format</span>','<span class="dos-bold">Watch a visually stunning film</span><br><span class="dos-italic">Plot doesn\'t matter — just feast your eyes</span>','<span class="dos-bold">Buy yourself a single flower</span><br><span class="dos-italic">Pisces life needs a touch of useless beauty</span>','<span class="dos-bold">Allow yourself an hour of blank space</span><br><span class="dos-italic">No output, no socializing, no thinking — Pisces needs to drift</span>']
  ];
  const signDos = new Proxy({}, { get(target, prop) { const src = (window._lang && window._lang() === 'en') ? signDos_EN : signDos_ZH; return src[prop]; } });

  const signDonts_ZH = [
    ['<span class="dos-bold">冲动下单</span><br><span class="dos-italic">先放购物车冷静到明天，它又不会跑</span>','<span class="dos-bold">跟人正面刚</span><br><span class="dos-italic">赢了场面输了心情，这笔账不划算</span>','<span class="dos-bold">三分钟等不了就暴躁</span><br><span class="dos-italic">有些答案需要你多坐一会儿</span>','<span class="dos-bold">替别人做决定</span><br><span class="dos-italic">白羊的热心今天先收一收</span>','<span class="dos-bold">开车路怒</span><br><span class="dos-italic">路上的人都是NPC，不值得你按喇叭</span>','<span class="dos-bold">熬夜装永动机</span><br><span class="dos-italic">白羊的电池也得充电，关机不丢人</span>'],
    ['<span class="dos-bold">凑合吃午饭</span><br><span class="dos-italic">今天不准将就，身体是你最贵的资产</span>','<span class="dos-bold">刷购物App停不下来</span><br><span class="dos-italic">加入购物车≠已经拥有</span>','<span class="dos-bold">死守舒适区</span><br><span class="dos-italic">偶尔伸一只脚出去试试水温也不赖</span>','<span class="dos-bold">跟别人比进度</span><br><span class="dos-italic">金牛有自己的节奏，慢也是快</span>','<span class="dos-bold">忍着不说憋成内伤</span><br><span class="dos-italic">说出来比吃下去健康</span>','<span class="dos-bold">把工作带回家</span><br><span class="dos-italic">沙发和床是你的结界，PPT不准进来</span>'],
    ['<span class="dos-bold">刷屏话痨</span><br><span class="dos-italic">说到第几句了？今天适可而止</span>','<span class="dos-bold">同时追三个群聊</span><br><span class="dos-italic">你的注意力比流量贵多了</span>','<span class="dos-bold">把吐槽当真</span><br><span class="dos-italic">双子嘴快但心软，别让气话过夜</span>','<span class="dos-bold">一个下午切换八个任务</span><br><span class="dos-italic">大脑不是浏览器，别开那么多标签页</span>','<span class="dos-bold">把秘密告诉一个不太熟的人</span><br><span class="dos-italic">八卦虽好，今天先存着</span>','<span class="dos-bold">看了标题就转发</span><br><span class="dos-italic">双子聪明但偶尔也要读完全文</span>'],
    ['<span class="dos-bold">熬夜emo</span><br><span class="dos-italic">十二点前关机，深夜的情绪都是假象</span>','<span class="dos-bold">过度解读别人的一句话</span><br><span class="dos-italic">巨蟹的雷达太灵敏，今天关掉一半</span>','<span class="dos-bold">替全公司的人操心</span><br><span class="dos-italic">你是同事不是妈，今天只照顾自己</span>','<span class="dos-bold">忍着眼泪说"没事"</span><br><span class="dos-italic">巨蟹的眼泪不丢人，哭出来比憋着勇敢</span>','<span class="dos-bold">把家里吃的东西都藏起来</span><br><span class="dos-italic">情绪化进食骗不了你的胃</span>','<span class="dos-bold">翻前任的社交账号</span><br><span class="dos-italic">过去已经翻篇了，你往前看</span>'],
    ['<span class="dos-bold">硬撑逞强</span><br><span class="dos-italic">说一句"我不会"比装懂要帅一万倍</span>','<span class="dos-bold">把别人的夸奖当真</span><br><span class="dos-italic">也别把别人的忽视当回事</span>','<span class="dos-bold">朋友圈没人点赞就删</span><br><span class="dos-italic">狮子不需要靠点赞数证明自己发光</span>','<span class="dos-bold">打断别人说话</span><br><span class="dos-italic">狮子热情但今天先让对方把话说完</span>','<span class="dos-bold">在一个地方死磕</span><br><span class="dos-italic">换条路走不叫认输，叫换个姿势赢</span>','<span class="dos-bold">冷落身边最亲近的人</span><br><span class="dos-italic">外面的掌声很好，但身边的人更需要你的温度</span>'],
    ['<span class="dos-bold">吹毛求疵</span><br><span class="dos-italic">今天放过自己，也放过身边人</span>','<span class="dos-bold">把一件事反复改了又改</span><br><span class="dos-italic">95分和99分在外人眼里一样好</span>','<span class="dos-bold">在心里给自己打分</span><br><span class="dos-italic">处女座的标准太高，今天别当自己的考官</span>','<span class="dos-bold">帮别人收拾烂摊子</span><br><span class="dos-italic">你的整理能力很值钱，今天先给自己用</span>','<span class="dos-bold">嫌弃别人的干活方式</span><br><span class="dos-italic">不一样不等于不对，随它去吧</span>','<span class="dos-bold">把一整天排满</span><br><span class="dos-italic">处女座的高效也需要中场休息</span>'],
    ['<span class="dos-bold">讨好所有人</span><br><span class="dos-italic">先讨好自己，其他人排队</span>','<span class="dos-bold">纠结到天黑还没决定</span><br><span class="dos-italic">选哪个都不会死，但不选的这一小时已经死了</span>','<span class="dos-bold">为了避免冲突说违心话</span><br><span class="dos-italic">天秤的和平主义不包含委屈自己</span>','<span class="dos-bold">过度在意别人怎么看你</span><br><span class="dos-italic">其实大家都在意自己，没人有空研究你</span>','<span class="dos-bold">同时跟三个人暧昧</span><br><span class="dos-italic">天秤的犹豫不决在感情里是减分项</span>','<span class="dos-bold">在购物车和下单之间反复横跳</span><br><span class="dos-italic">要么买要么关，中间态最耗神</span>'],
    ['<span class="dos-bold">翻旧账</span><br><span class="dos-italic">已经翻篇了，再翻一遍纸会破</span>','<span class="dos-bold">怀疑所有人的动机</span><br><span class="dos-italic">今天先假设大家都不是坏人，轻松一点</span>','<span class="dos-bold">暗中观察过度</span><br><span class="dos-italic">与其在暗处看，不如走到明处说</span>','<span class="dos-bold">把恨意存着当燃料</span><br><span class="dos-italic">天蝎的记性好，但选择性遗忘是更高级的能力</span>','<span class="dos-bold">冷暴力身边的人</span><br><span class="dos-italic">你不说他们真的不知道你在气什么</span>','<span class="dos-bold">打探前任的现状</span><br><span class="dos-italic">天蝎的好奇心用在别的地方都能改变世界</span>'],
    ['<span class="dos-bold">说走就走不带充电宝</span><br><span class="dos-italic">自由很重要，但手机没电更可怕</span>','<span class="dos-bold">立flag</span><br><span class="dos-italic">先立一个能做到的，剩下的下次再吹</span>','<span class="dos-bold">对着一桌人讲大道理</span><br><span class="dos-italic">射手的三观很正但今天让别人自己悟</span>','<span class="dos-bold">把信用卡刷爆去旅行</span><br><span class="dos-italic">诗和远方重要，下个月的账单也重要</span>','<span class="dos-bold">同时答应八个饭局</span><br><span class="dos-italic">射手的人缘好但身体只有一个</span>','<span class="dos-bold">跟人抬杠停不下来</span><br><span class="dos-italic">赢了辩论输了朋友，划不来</span>'],
    ['<span class="dos-bold">把工作当全部</span><br><span class="dos-italic">摩羯的事业心很强，但今天留一小时给自己</span>','<span class="dos-bold">立一个今年必须完成的大flag</span><br><span class="dos-italic">先立到月底的，剩下的交给时间</span>','<span class="dos-bold">用"我不够好"当借口不开始</span><br><span class="dos-italic">你比你以为的强多了</span>','<span class="dos-bold">把所有人都当竞争对手</span><br><span class="dos-italic">摩羯的赛道是自己，不用看别人</span>','<span class="dos-bold">熬夜加班证明自己</span><br><span class="dos-italic">摩羯不是靠工时定义的，是靠结果</span>','<span class="dos-bold">说"我没事"然后一个人扛</span><br><span class="dos-italic">示弱不是失败，摩羯也可以喊累</span>'],
    ['<span class="dos-bold">死守规矩</span><br><span class="dos-italic">偶尔破个例，水瓶就是为打破规则而生的</span>','<span class="dos-bold">对所有人的意见都嗤之以鼻</span><br><span class="dos-italic">与众不同不等于否定一切</span>','<span class="dos-bold">情感上离群索居</span><br><span class="dos-italic">就算你是外星人，也需要地球上的朋友</span>','<span class="dos-bold">在群里发表长篇大论然后退群</span><br><span class="dos-italic">说完就跑不算酷，留下来听回应</span>','<span class="dos-bold">过度标榜特立独行</span><br><span class="dos-italic">做自己就够了，不用证明自己是"不一样的烟火"</span>','<span class="dos-bold">把孤独当勋章</span><br><span class="dos-italic">水瓶的独特不需要用疏离来证明</span>'],
    ['<span class="dos-bold">过度共情</span><br><span class="dos-italic">先照顾好自己的情绪再替别人难过</span>','<span class="dos-bold">把自己溺在悲伤的歌里出不来</span><br><span class="dos-italic">双鱼的敏感是天赋不是自毁按钮</span>','<span class="dos-bold">对一个人上头太快</span><br><span class="dos-italic">浪漫很好，但先看清楚是不是海市蜃楼</span>','<span class="dos-bold">用做梦替代行动</span><br><span class="dos-italic">梦醒了还在原地，不如边梦边走</span>','<span class="dos-bold">把所有人的情绪背在自己身上</span><br><span class="dos-italic">你不是海绵，不用什么都吸</span>','<span class="dos-bold">逃避现实沉迷追剧</span><br><span class="dos-italic">偶尔上岸透口气，现实里也有好故事</span>']
  ];
  const signDonts_EN = [
    ['<span class="dos-bold">Impulse buying</span><br><span class="dos-italic">Leave it in the cart until tomorrow — it\'s not going anywhere</span>','<span class="dos-bold">Head-on confrontation</span><br><span class="dos-italic">Winning the battle but losing your mood is a bad deal</span>','<span class="dos-bold">Getting irritable after three minutes of waiting</span><br><span class="dos-italic">Some answers need you to sit a little longer</span>','<span class="dos-bold">Making decisions for others</span><br><span class="dos-italic">Rein in that Aries enthusiasm today</span>','<span class="dos-bold">Road rage</span><br><span class="dos-italic">Everyone on the road is an NPC — not worth the horn</span>','<span class="dos-bold">Pretending you\'re a perpetual motion machine</span><br><span class="dos-italic">Aries batteries need charging too — powering down isn\'t shameful</span>'],
    ['<span class="dos-bold">Settling for a sad lunch</span><br><span class="dos-italic">No compromises today — your body is your most valuable asset</span>','<span class="dos-bold">Endless shopping app scrolling</span><br><span class="dos-italic">Add to cart ≠ already own it</span>','<span class="dos-bold">Death-gripping your comfort zone</span><br><span class="dos-italic">Dip one toe in the water once in a while — it\'s not bad</span>','<span class="dos-bold">Comparing your progress to others</span><br><span class="dos-italic">Taurus has its own rhythm — slow is also fast</span>','<span class="dos-bold">Bottling it up until it hurts</span><br><span class="dos-italic">Speaking it out is healthier than swallowing it</span>','<span class="dos-bold">Bringing work home</span><br><span class="dos-italic">Your couch and bed are sacred barriers — no PPTs allowed inside</span>'],
    ['<span class="dos-bold">Spamming the group chat</span><br><span class="dos-italic">What sentence are you on? Know when to stop today</span>','<span class="dos-bold">Following three group chats at once</span><br><span class="dos-italic">Your attention is worth way more than your data plan</span>','<span class="dos-bold">Taking your own rants seriously</span><br><span class="dos-italic">Gemini speaks fast but has a soft heart — don\'t let harsh words last overnight</span>','<span class="dos-bold">Switching between eight tasks in one afternoon</span><br><span class="dos-italic">Your brain isn\'t a browser — don\'t open so many tabs</span>','<span class="dos-bold">Telling a secret to someone you barely know</span><br><span class="dos-italic">Gossip is fun but save it for now</span>','<span class="dos-bold">Forwarding based on the headline alone</span><br><span class="dos-italic">Gemini is smart but occasionally read the whole article</span>'],
    ['<span class="dos-bold">Late-night emo spiraling</span><br><span class="dos-italic">Power off before midnight — late-night emotions are illusions</span>','<span class="dos-bold">Over-analyzing someone\'s one sentence</span><br><span class="dos-italic">Cancer radar is too sensitive — turn it down by half today</span>','<span class="dos-bold">Worrying about everyone in the company</span><br><span class="dos-italic">You\'re a colleague, not a mom — just take care of yourself today</span>','<span class="dos-bold">Holding back tears and saying "I\'m fine"</span><br><span class="dos-italic">Cancer tears aren\'t shameful — crying is braver than holding it in</span>','<span class="dos-bold">Hiding all the snacks in the house</span><br><span class="dos-italic">Emotional eating can\'t fool your stomach</span>','<span class="dos-bold">Checking your ex\'s social media</span><br><span class="dos-italic">The past has turned the page — look forward</span>'],
    ['<span class="dos-bold">Faking strength</span><br><span class="dos-italic">Saying "I don\'t know" is ten thousand times cooler than pretending</span>','<span class="dos-bold">Taking every compliment to heart</span><br><span class="dos-italic">And don\'t take every bit of neglect to heart either</span>','<span class="dos-bold">Deleting posts with no likes</span><br><span class="dos-italic">Leo doesn\'t need a like count to prove they shine</span>','<span class="dos-bold">Interrupting people</span><br><span class="dos-italic">Leo is passionate but let the other person finish speaking today</span>','<span class="dos-bold">Stubbornly banging your head against one wall</span><br><span class="dos-italic">Taking another path isn\'t surrender — it\'s winning in a different pose</span>','<span class="dos-bold">Neglecting the people closest to you</span><br><span class="dos-italic">Applause from the crowd is nice, but the ones close to you need your warmth more</span>'],
    ['<span class="dos-bold">Nitpicking</span><br><span class="dos-italic">Give yourself — and everyone around you — a break today</span>','<span class="dos-bold">Revising the same thing over and over</span><br><span class="dos-italic">95% and 99% look exactly the same to everyone else</span>','<span class="dos-bold">Grading yourself internally</span><br><span class="dos-italic">Virgo standards are too high — don\'t be your own examiner today</span>','<span class="dos-bold">Cleaning up other people\'s messes</span><br><span class="dos-italic">Your organizing skills are valuable — use them for yourself first today</span>','<span class="dos-bold">Judging how others do things</span><br><span class="dos-italic">Different doesn\'t mean wrong — let it go</span>','<span class="dos-bold">Packing the entire day full</span><br><span class="dos-italic">Even Virgo efficiency needs an intermission</span>'],
    ['<span class="dos-bold">Pleasing everyone</span><br><span class="dos-italic">Please yourself first — everyone else can wait in line</span>','<span class="dos-bold">Indecision until dark</span><br><span class="dos-italic">Neither option will kill you, but the hour spent not choosing is already dead</span>','<span class="dos-bold">Saying what you don\'t mean to avoid conflict</span><br><span class="dos-italic">Libra pacifism doesn\'t include hurting yourself</span>','<span class="dos-bold">Obsessing over what others think of you</span><br><span class="dos-italic">Truth is, everyone\'s busy thinking about themselves — no one has time to study you</span>','<span class="dos-bold">Flirting with three people at once</span><br><span class="dos-italic">Libra indecisiveness is a liability in love</span>','<span class="dos-bold">Ping-ponging between cart and checkout</span><br><span class="dos-italic">Either buy or close — the in-between is the most draining</span>'],
    ['<span class="dos-bold">Dredging up old scores</span><br><span class="dos-italic">The page has turned — flip it again and the paper tears</span>','<span class="dos-bold">Suspecting everyone\'s motives</span><br><span class="dos-italic">Assume the best for once today — lighten the load</span>','<span class="dos-bold">Excessive lurking</span><br><span class="dos-italic">Instead of watching from the shadows, step into the light and speak</span>','<span class="dos-bold">Storing resentment as fuel</span><br><span class="dos-italic">Scorpio memory is strong, but selective forgetting is a higher-level skill</span>','<span class="dos-bold">Silent treatment to those close to you</span><br><span class="dos-italic">They genuinely don\'t know why you\'re upset if you don\'t say it</span>','<span class="dos-bold">Digging into what your ex is up to</span><br><span class="dos-italic">Scorpio curiosity applied elsewhere could change the world</span>'],
    ['<span class="dos-bold">Leaving without a power bank</span><br><span class="dos-italic">Freedom matters, but a dead phone is scarier</span>','<span class="dos-bold">Making grand proclamations</span><br><span class="dos-italic">Make one you can actually keep — save the rest for next time</span>','<span class="dos-bold">Lecturing a table full of people</span><br><span class="dos-italic">Sagittarius principles are solid but let others figure it out themselves today</span>','<span class="dos-bold">Maxing out your credit card to travel</span><br><span class="dos-italic">Poetry and faraway places matter, but so does next month\'s bill</span>','<span class="dos-bold">Saying yes to eight dinner invitations at once</span><br><span class="dos-italic">Sagittarius is popular but has only one body</span>','<span class="dos-bold">Arguing endlessly</span><br><span class="dos-italic">Winning the debate but losing the friend — not worth it</span>'],
    ['<span class="dos-bold">Making work your entire life</span><br><span class="dos-italic">Capricorn ambition is strong, but save one hour for yourself today</span>','<span class="dos-bold">Setting a massive year-long goal</span><br><span class="dos-italic">Set one that goes to month-end first — let time handle the rest</span>','<span class="dos-bold">Using "I\'m not good enough" as an excuse not to start</span><br><span class="dos-italic">You\'re way stronger than you think</span>','<span class="dos-bold">Treating everyone as a competitor</span><br><span class="dos-italic">Capricorn\'s only competitor is yourself — ignore the others</span>','<span class="dos-bold">Burning the midnight oil to prove yourself</span><br><span class="dos-italic">Capricorn isn\'t defined by hours worked, but by results</span>','<span class="dos-bold">Saying "I\'m fine" and carrying it all alone</span><br><span class="dos-italic">Vulnerability isn\'t failure — even Capricorn can say "I\'m tired"</span>'],
    ['<span class="dos-bold">Rigidly following rules</span><br><span class="dos-italic">Break one occasionally — Aquarius was born to break rules</span>','<span class="dos-bold">Dismissing everyone\'s opinions</span><br><span class="dos-italic">Being different doesn\'t mean rejecting everything</span>','<span class="dos-bold">Emotional hermit mode</span><br><span class="dos-italic">Even if you\'re an alien, you still need friends on Earth</span>','<span class="dos-bold">Posting a manifesto in the group chat then leaving</span><br><span class="dos-italic">Dropping the mic and running isn\'t cool — stay and hear the response</span>','<span class="dos-bold">Over-performing uniqueness</span><br><span class="dos-italic">Just be yourself — no need to prove you\'re "a special snowflake"</span>','<span class="dos-bold">Wearing loneliness like a medal</span><br><span class="dos-italic">Aquarius uniqueness doesn\'t need isolation to prove itself</span>'],
    ['<span class="dos-bold">Over-empathizing</span><br><span class="dos-italic">Take care of your own emotions before feeling sad for others</span>','<span class="dos-bold">Drowning in sad songs</span><br><span class="dos-italic">Pisces sensitivity is a gift, not a self-destruct button</span>','<span class="dos-bold">Falling too fast for someone</span><br><span class="dos-italic">Romance is lovely, but check if it\'s a mirage first</span>','<span class="dos-bold">Replacing action with daydreaming</span><br><span class="dos-italic">Waking up in the same place — better to walk while dreaming</span>','<span class="dos-bold">Carrying everyone\'s emotions on your back</span><br><span class="dos-italic">You\'re not a sponge — you don\'t have to absorb everything</span>','<span class="dos-bold">Escaping reality by binge-watching shows</span><br><span class="dos-italic">Come up for air once in a while — reality has good stories too</span>']
  ];
  const signDonts = new Proxy({}, { get(target, prop) { const src = (window._lang && window._lang() === 'en') ? signDonts_EN : signDonts_ZH; return src[prop]; } });

  const dayDoBonus_ZH = [
    ['<span class="dos-bold">出门晒太阳</span><br><span class="dos-italic">补足一周缺失的维生素D</span>','<span class="dos-bold">睡到自然醒</span><br><span class="dos-italic">周日不设闹钟是基本人权</span>','<span class="dos-bold">逛公园或菜市场</span><br><span class="dos-italic">烟火气和光合作用二选一</span>','<span class="dos-bold">做一顿Brunch</span><br><span class="dos-italic">仪式感不需要理由</span>','<span class="dos-bold">躺在沙发上什么也不干</span><br><span class="dos-italic">偶尔当一株植物也很幸福</span>'],
    ['<span class="dos-bold">摸鱼到午饭</span><br><span class="dos-italic">周一上午的核心生产力是咖啡的</span>','<span class="dos-bold">慢慢进入状态</span><br><span class="dos-italic">周一不冲刺，先热身</span>','<span class="dos-bold">冲一杯比平时贵的咖啡</span><br><span class="dos-italic">周一的自己需要被贿赂</span>','<span class="dos-bold">穿一套最喜欢的衣服</span><br><span class="dos-italic">周一的外在要撑起周一的内心</span>','<span class="dos-bold">列本周计划但不执行</span><br><span class="dos-italic">先写下来，周一的诚意到了就行</span>'],
    ['<span class="dos-bold">假装很忙</span><br><span class="dos-italic">演着演着就真的进入状态了</span>','<span class="dos-bold">洗手间多待五分钟</span><br><span class="dos-italic">那是周二唯一的私人空间</span>','<span class="dos-bold">认真挑午饭吃什么</span><br><span class="dos-italic">周二的午餐是今天的最高决策</span>','<span class="dos-bold">跟同事分享零食</span><br><span class="dos-italic">一块饼干换来一上午的和平</span>','<span class="dos-bold">把最难的事偷偷推进一点点</span><br><span class="dos-italic">然后奖励自己一杯奶茶</span>'],
    ['<span class="dos-bold">带薪发呆十分钟</span><br><span class="dos-italic">周三需要一个精神喘气口</span>','<span class="dos-bold">悄悄给同事翻白眼</span><br><span class="dos-italic">在心里翻就行，脸上保持微笑</span>','<span class="dos-bold">云旅行十分钟（搜机票不买）</span><br><span class="dos-italic">周三的灵魂需要短暂出逃</span>','<span class="dos-bold">把耳机塞上沉浸式工作一小时</span><br><span class="dos-italic">周三的效率靠降噪耳机</span>','<span class="dos-bold">跟饭搭子吐槽五分钟</span><br><span class="dos-italic">周三的毒不吐不快</span>'],
    ['<span class="dos-bold">周四当周五过</span><br><span class="dos-italic">提前预支周末的快乐</span>','<span class="dos-bold">提前计划周末吃什么</span><br><span class="dos-italic">周四的盼头就是周末的菜单</span>','<span class="dos-bold">下班准时消失</span><br><span class="dos-italic">周四的加班是对周末的背叛</span>','<span class="dos-bold">把本周最烦的事画个句号</span><br><span class="dos-italic">哪怕只是心理上的</span>','<span class="dos-bold">对着镜子说"再撑一天"</span><br><span class="dos-italic">周四的斗志靠自我催眠</span>'],
    ['<span class="dos-bold">把活推到下周</span><br><span class="dos-italic">周五下午的尊严就是不开始新任务</span>','<span class="dos-bold">下午三点开始摸鱼</span><br><span class="dos-italic">周五下午是周末的预告片</span>','<span class="dos-bold">约今晚的饭局</span><br><span class="dos-italic">周五晚上的快乐值得现在就安排</span>','<span class="dos-bold">整理桌面然后早早走人</span><br><span class="dos-italic">周五的仪式感是第一个走出办公室</span>','<span class="dos-bold">发自内心地笑</span><br><span class="dos-italic">周五的笑容不需要理由</span>'],
    ['<span class="dos-bold">睡到自然醒然后赖床一小时</span><br><span class="dos-italic">周六的床有磁力</span>','<span class="dos-bold">在城市里瞎逛</span><br><span class="dos-italic">不设导航，走到哪算哪</span>','<span class="dos-bold">吃一顿不赶时间的饭</span><br><span class="dos-italic">周六的餐桌不需要手机</span>','<span class="dos-bold">看一部一直想看的电影</span><br><span class="dos-italic">完整的两个小时，不暂停</span>','<span class="dos-bold">做一件你小时候喜欢做的事</span><br><span class="dos-italic">周六是回归童年的合法窗口</span>']
  ];
  const dayDoBonus_EN = [
    ['<span class="dos-bold">Get some sun</span><br><span class="dos-italic">Replenish a week\'s worth of missing vitamin D</span>','<span class="dos-bold">Sleep in</span><br><span class="dos-italic">No alarm on Sunday is a basic human right</span>','<span class="dos-bold">Stroll through a park or farmers market</span><br><span class="dos-italic">Pick between fresh air and fresh produce</span>','<span class="dos-bold">Make brunch</span><br><span class="dos-italic">Rituals don\'t need justification</span>','<span class="dos-bold">Lie on the couch doing absolutely nothing</span><br><span class="dos-italic">Being a houseplant once in a while is bliss</span>'],
    ['<span class="dos-bold">Coast until lunch</span><br><span class="dos-italic">Monday morning productivity is powered by coffee</span>','<span class="dos-bold">Ease into it</span><br><span class="dos-italic">Monday is for warming up, not sprinting</span>','<span class="dos-bold">Make a slightly more expensive coffee</span><br><span class="dos-italic">Monday you needs to be bribed</span>','<span class="dos-bold">Wear your favorite outfit</span><br><span class="dos-italic">Your Monday exterior needs to prop up your Monday interior</span>','<span class="dos-bold">Write this week\'s plan but don\'t execute</span><br><span class="dos-italic">Just write it down — Monday\'s sincerity is enough</span>'],
    ['<span class="dos-bold">Pretend to be busy</span><br><span class="dos-italic">Fake it till you actually get into the zone</span>','<span class="dos-bold">Spend five extra minutes in the restroom</span><br><span class="dos-italic">That\'s Tuesday\'s only private space</span>','<span class="dos-bold">Carefully choose your lunch</span><br><span class="dos-italic">Tuesday lunch is the day\'s highest-level decision</span>','<span class="dos-bold">Share snacks with a coworker</span><br><span class="dos-italic">One cookie buys a whole morning of peace</span>','<span class="dos-bold">Secretly push the hardest task forward just a bit</span><br><span class="dos-italic">Then reward yourself with bubble tea</span>'],
    ['<span class="dos-bold">Zone out for ten paid minutes</span><br><span class="dos-italic">Wednesday needs a mental breathing hole</span>','<span class="dos-bold">Secretly eye-roll at a coworker</span><br><span class="dos-italic">Do it internally — keep the smile on your face</span>','<span class="dos-bold">Cloud-travel for ten minutes (search flights, don\'t buy)</span><br><span class="dos-italic">Wednesday\'s soul needs a brief escape</span>','<span class="dos-bold">Headphones on, deep-focus work for one hour</span><br><span class="dos-italic">Wednesday efficiency runs on noise cancellation</span>','<span class="dos-bold">Vent for five minutes with your lunch buddy</span><br><span class="dos-italic">Wednesday toxins need releasing</span>'],
    ['<span class="dos-bold">Treat Thursday like Friday</span><br><span class="dos-italic">Advance your weekend joy by one day</span>','<span class="dos-bold">Plan what to eat this weekend</span><br><span class="dos-italic">Thursday\'s hope is the weekend menu</span>','<span class="dos-bold">Disappear right at quitting time</span><br><span class="dos-italic">Thursday overtime is a betrayal of the weekend</span>','<span class="dos-bold">Put a period on this week\'s most annoying thing</span><br><span class="dos-italic">Even if only mentally</span>','<span class="dos-bold">Look in the mirror and say "one more day"</span><br><span class="dos-italic">Thursday\'s fighting spirit runs on self-hypnosis</span>'],
    ['<span class="dos-bold">Push tasks to next week</span><br><span class="dos-italic">Friday afternoon dignity is not starting anything new</span>','<span class="dos-bold">Start coasting at 3 PM</span><br><span class="dos-italic">Friday afternoon is the weekend\'s trailer</span>','<span class="dos-bold">Make dinner plans for tonight</span><br><span class="dos-italic">Friday night joy deserves to be arranged right now</span>','<span class="dos-bold">Tidy your desk and leave early</span><br><span class="dos-italic">Friday\'s ritual is being the first one out the door</span>','<span class="dos-bold">Smile from the heart</span><br><span class="dos-italic">Friday smiles don\'t need a reason</span>'],
    ['<span class="dos-bold">Sleep in then laze in bed for an extra hour</span><br><span class="dos-italic">Saturday beds have magnetic force</span>','<span class="dos-bold">Wander the city aimlessly</span><br><span class="dos-italic">No GPS — go wherever your feet take you</span>','<span class="dos-bold">Eat a meal without rushing</span><br><span class="dos-italic">Saturday dining tables don\'t need phones</span>','<span class="dos-bold">Watch a movie you\'ve been meaning to see</span><br><span class="dos-italic">Two full uninterrupted hours</span>','<span class="dos-bold">Do something you loved as a kid</span><br><span class="dos-italic">Saturday is a legal window back to childhood</span>']
  ];
  const dayDoBonus = new Proxy({}, { get(target, prop) { const src = (window._lang && window._lang() === 'en') ? dayDoBonus_EN : dayDoBonus_ZH; return src[prop]; } });
  const dayDontBonus_ZH = [
    ['<span class="dos-bold">为周一焦虑</span><br><span class="dos-italic">周日的夜晚属于沙发，不属于焦虑</span>','<span class="dos-bold">看工作消息</span><br><span class="dos-italic">手机里的工作群今天请静音</span>','<span class="dos-bold">宅家一整天不出门</span><br><span class="dos-italic">至少站门口吸一口新鲜空气</span>','<span class="dos-bold">把周末过成"补觉马拉松"</span><br><span class="dos-italic">睡够就好，剩下的时间醒着活</span>','<span class="dos-bold">打开电脑处理"一件小事"</span><br><span class="dos-italic">那件小事会吃掉你的整个下午</span>'],
    ['<span class="dos-bold">开会走神被抓</span><br><span class="dos-italic">周一的眼神涣散需要藏好</span>','<span class="dos-bold">冲动提离职</span><br><span class="dos-italic">周一早上想的都不算，周五再决定</span>','<span class="dos-bold">在工位唉声叹气</span><br><span class="dos-italic">周一的气场决定一周的气场</span>','<span class="dos-bold">一上来就啃最硬的骨头</span><br><span class="dos-italic">先做点简单的给自信充值</span>','<span class="dos-bold">跟同事吐槽周末过太快</span><br><span class="dos-italic">说出来只会更难受</span>'],
    ['<span class="dos-bold">连轴转不喝水</span><br><span class="dos-italic">你的肾脏不是永动机</span>','<span class="dos-bold">跟同事抬杠</span><br><span class="dos-italic">周二的胜负欲请用在别处</span>','<span class="dos-bold">午饭凑合吃</span><br><span class="dos-italic">中午那顿饭是周二唯一的温柔</span>','<span class="dos-bold">把三件事攒到一起做</span><br><span class="dos-italic">多线程的结局往往是每件都差一点</span>','<span class="dos-bold">在群里发长篇大论</span><br><span class="dos-italic">周二没人有耐心读超过三行</span>'],
    ['<span class="dos-bold">开会说真话</span><br><span class="dos-italic">周三的真诚要收着点，有些话在心里说就行</span>','<span class="dos-bold">主动揽活</span><br><span class="dos-italic">周三的善良容易被当软柿子</span>','<span class="dos-bold">忘了今天是周三</span><br><span class="dos-italic">周三就是周三，不是周五也不是周一</span>','<span class="dos-bold">把咖啡当水喝</span><br><span class="dos-italic">第三杯之后心脏会抗议</span>','<span class="dos-bold">跟老板对视超过三秒</span><br><span class="dos-italic">容易被分配到额外的工作</span>'],
    ['<span class="dos-bold">把情绪写脸上</span><br><span class="dos-italic">周四的表情管理要绷住</span>','<span class="dos-bold">熬夜加班</span><br><span class="dos-italic">周四熬的夜周五会报复你</span>','<span class="dos-bold">跟老板硬刚</span><br><span class="dos-italic">再忍一天，周四的冲动是魔鬼</span>','<span class="dos-bold">开始一个需要超过两天的事</span><br><span class="dos-italic">周四启动的事大概率拖到下周</span>','<span class="dos-bold">把不爽的事憋在心里发酵</span><br><span class="dos-italic">周四找一个安全的人倒一倒苦水</span>'],
    ['<span class="dos-bold">假装勤奋加班</span><br><span class="dos-italic">周五晚上的你在工位上灵魂已经走了</span>','<span class="dos-bold">答应下周一交付</span><br><span class="dos-italic">周五的承诺周一要还的</span>','<span class="dos-bold">推进新项目</span><br><span class="dos-italic">周五下午开始的任何事都是下周的事</span>','<span class="dos-bold">在下班前五分钟开始一个新任务</span><br><span class="dos-italic">这时候的效率为零</span>','<span class="dos-bold">把工作带回家</span><br><span class="dos-italic">周五晚上书包里的电脑不该被打开</span>'],
    ['<span class="dos-bold">想起工作</span><br><span class="dos-italic">周六的大脑不需要上班的回忆</span>','<span class="dos-bold">设闹钟早起</span><br><span class="dos-italic">周六的自然醒是神圣不可侵犯的权利</span>','<span class="dos-bold">刷工作群</span><br><span class="dos-italic">别人加班不等于你要加，周六请隐身</span>','<span class="dos-bold">把一整天安排满</span><br><span class="dos-italic">周六需要留白，像中国画一样</span>','<span class="dos-bold">报复性熬夜</span><br><span class="dos-italic">周六的夜晚也是夜晚，身体不计较"明天不上班"</span>']
  ];
  const dayDontBonus_EN = [
    ['<span class="dos-bold">Anxiety about Monday</span><br><span class="dos-italic">Sunday night belongs to the couch, not anxiety</span>','<span class="dos-bold">Checking work messages</span><br><span class="dos-italic">Mute those work group chats today</span>','<span class="dos-bold">Staying indoors all day</span><br><span class="dos-italic">At least stand at the door and breathe fresh air once</span>','<span class="dos-bold">Turning the weekend into a sleep marathon</span><br><span class="dos-italic">Sleep enough, then spend the rest awake and alive</span>','<span class="dos-bold">Opening your laptop for "one quick thing"</span><br><span class="dos-italic">That one quick thing will eat your entire afternoon</span>'],
    ['<span class="dos-bold">Getting caught zoning out in a meeting</span><br><span class="dos-italic">Hide that Monday thousand-yard stare</span>','<span class="dos-bold">Impulse-quitting your job</span><br><span class="dos-italic">Monday morning thoughts don\'t count — decide on Friday</span>','<span class="dos-bold">Sighing loudly at your desk</span><br><span class="dos-italic">Monday\'s energy sets the tone for the whole week</span>','<span class="dos-bold">Starting with the hardest task immediately</span><br><span class="dos-italic">Do something easy first to recharge your confidence</span>','<span class="dos-bold">Complaining to coworkers about how fast the weekend went</span><br><span class="dos-italic">Saying it out loud only makes it worse</span>'],
    ['<span class="dos-bold">Working nonstop without drinking water</span><br><span class="dos-italic">Your kidneys are not a perpetual motion machine</span>','<span class="dos-bold">Arguing with coworkers</span><br><span class="dos-italic">Channel Tuesday\'s competitive energy elsewhere</span>','<span class="dos-bold">Throwing together a sad lunch</span><br><span class="dos-italic">That midday meal is Tuesday\'s only tenderness</span>','<span class="dos-bold">Bundling three things together</span><br><span class="dos-italic">Multitasking usually means each one falls a bit short</span>','<span class="dos-bold">Posting walls of text in group chats</span><br><span class="dos-italic">No one on Tuesday has the patience to read beyond three lines</span>'],
    ['<span class="dos-bold">Speaking unfiltered truth in meetings</span><br><span class="dos-italic">Hold back Wednesday honesty — some things stay in your head</span>','<span class="dos-bold">Volunteering for extra work</span><br><span class="dos-italic">Wednesday kindness gets mistaken for being a pushover</span>','<span class="dos-bold">Forgetting it\'s Wednesday</span><br><span class="dos-italic">Wednesday is Wednesday — not Friday, not Monday</span>','<span class="dos-bold">Drinking coffee like water</span><br><span class="dos-italic">Your heart will protest after the third cup</span>','<span class="dos-bold">Making eye contact with the boss for over three seconds</span><br><span class="dos-italic">You\'ll get assigned extra work</span>'],
    ['<span class="dos-bold">Wearing your emotions on your face</span><br><span class="dos-italic">Thursday facial expression management — hold the line</span>','<span class="dos-bold">Pulling an all-nighter</span><br><span class="dos-italic">Thursday\'s late night will take revenge on your Friday</span>','<span class="dos-bold">Butting heads with the boss</span><br><span class="dos-italic">Hold on one more day — Thursday impulses are the devil</span>','<span class="dos-bold">Starting something that takes more than two days</span><br><span class="dos-italic">Things started on Thursday will probably drag into next week</span>','<span class="dos-bold">Letting resentment ferment silently</span><br><span class="dos-italic">Find a safe person to vent to on Thursday</span>'],
    ['<span class="dos-bold">Pretending to work late diligently</span><br><span class="dos-italic">Friday night your soul has already left your desk</span>','<span class="dos-bold">Promising Monday delivery</span><br><span class="dos-italic">Friday promises come due on Monday</span>','<span class="dos-bold">Pushing new projects forward</span><br><span class="dos-italic">Anything started Friday afternoon is next week\'s problem</span>','<span class="dos-bold">Starting a new task five minutes before clock-out</span><br><span class="dos-italic">Efficiency at that moment is zero</span>','<span class="dos-bold">Bringing work home</span><br><span class="dos-italic">The laptop in your Friday night bag should stay shut</span>'],
    ['<span class="dos-bold">Thinking about work</span><br><span class="dos-italic">Saturday brains don\'t need work memories</span>','<span class="dos-bold">Setting an alarm to wake up early</span><br><span class="dos-italic">Saturday natural waking is a sacred and inviolable right</span>','<span class="dos-bold">Checking work group chats</span><br><span class="dos-italic">Others working late doesn\'t mean you have to — go invisible on Saturday</span>','<span class="dos-bold">Packing the entire day full</span><br><span class="dos-italic">Saturday needs blank space, like a Chinese ink painting</span>','<span class="dos-bold">Revenge bedtime procrastination</span><br><span class="dos-italic">Saturday night is still night — your body doesn\'t care that there\'s "no work tomorrow"</span>']
  ];
  const dayDontBonus = new Proxy({}, { get(target, prop) { const src = (window._lang && window._lang() === 'en') ? dayDontBonus_EN : dayDontBonus_ZH; return src[prop]; } });

  const weekNum = Math.floor(nowJD / 7);
  const signCount = [0,0,0,0,0,0,0,0,0,0,0,0]; // track sign appearances this week for variant cycling

  for (let d = 0; d < 7; d++) {
    const dayJD = nowJD + d;
    const dayT = centuriesSinceJ2000(dayJD);
    const dayMoon = calcAllPlanets(dayT).Moon;
    const daySi = degToSign(dayMoon).si;
    const dayDate = new Date(now.getTime() + d * 86400000);
    const dow = dayDate.getDay();
    const holiday = getHolidayTag(dayDate.getMonth()+1, dayDate.getDate());
    const prefix = holiday ? '<span style="color:var(--accent);">'+holiday+'</span> ' : '';

    const siVar = signCount[daySi] % signDos[daySi].length;
    signCount[daySi]++;

    const dayVar = (weekNum + dow) % dayDoBonus[dow].length;

    const doText = prefix + signDos[daySi][siVar] + '；<br>' + dayDoBonus[dow][dayVar] + '；';
    const dontText = signDonts[daySi][siVar] + '；<br>' + dayDontBonus[dow][dayVar] + '；';

    html += '<tr><td>' + dayNames[dow] + ' ' + (dayDate.getMonth()+1) + '/' + dayDate.getDate() + '</td><td>' + getSignNamePure(daySi) + '</td><td style="font-size:0.85em;color:#c9c9c9;">' + doText + '</td><td style="font-size:0.85em;color:#8a8aa0;">' + dontText + '</td></tr>';
  }
  html += '</tbody></table>';

  // Lucky colors & crystals for the week
  const weekColors_ZH = [
    '#e63946 正红', '#c4a35a 琥珀金', '#f4a261 暖橙', '#e8e8e8 月光银',
    '#ffd700 太阳金', '#6b8e6b 橄榄绿', '#d4a0c0 玫瑰粉', '#8b0000 深酒红',
    '#7b68ee 紫罗兰', '#2f4f4f 墨绿', '#4682b4 钢蓝', '#20b2aa 海绿'
  ];
  const weekColors_EN = [
    '#e63946 True Red', '#c4a35a Amber Gold', '#f4a261 Warm Orange', '#e8e8e8 Moonlight Silver',
    '#ffd700 Sun Gold', '#6b8e6b Olive Green', '#d4a0c0 Rose Pink', '#8b0000 Deep Burgundy',
    '#7b68ee Violet', '#2f4f4f Dark Green', '#4682b4 Steel Blue', '#20b2aa Sea Green'
  ];
  const weekColors = isEn ? weekColors_EN : weekColors_ZH;
  const weekCrystals_ZH = [
    '红玛瑙 — 或戴一块红色手表', '黄水晶 — 或系一条金色丝巾', '虎眼石 — 或拿一支亮色钢笔',
    '月光石 — 或一对小珍珠耳钉', '金发晶 — 或一个金色发夹', '绿幽灵 — 或穿一双绿袜子',
    '粉晶 — 或一根粉色头绳', '黑曜石 — 或一副黑框眼镜', '紫水晶 — 或一把紫色梳子',
    '石榴石 — 或一条深红围巾', '青金石 — 或一支蓝色圆珠笔', '海蓝宝 — 或一个浅蓝水杯'
  ];
  const weekCrystals_EN = [
    'Red Agate — or wear a red watch', 'Citrine — or a gold silk scarf', 'Tiger\'s Eye — or a bright-colored pen',
    'Moonstone — or small pearl earrings', 'Golden Rutilated Quartz — or a gold hair clip', 'Green Phantom Quartz — or green socks',
    'Rose Quartz — or a pink hair tie', 'Obsidian — or black-framed glasses', 'Amethyst — or a purple comb',
    'Garnet — or a deep red scarf', 'Lapis Lazuli — or a blue ballpoint pen', 'Aquamarine — or a light blue water bottle'
  ];
  const weekCrystals = isEn ? weekCrystals_EN : weekCrystals_ZH;
  const sunSignIdx = degToSign(transitNow.Sun).si;
  const moonSignIdx = degToSign(transitNow.Moon).si;

  html += '<div class="report-section" style="margin-top:16px;">';
  var weekTastes_ZH = [
    '生椰拿铁 · 少冰', '桂花酒酿拿铁 · 热', '杨枝甘露 · 少冰', '煎鸡蛋 · 配酱油',
    '番茄炒蛋 · 盖饭', '肉酱意面 · 配帕玛森', '味噌拉面 · 溏心蛋', '越南河粉 · 牛肉',
    '酸辣土豆丝 · 配米饭', '螺蛳粉 · 加炸蛋', '提拉米苏 · 堂食', '芒果糯米饭'
  ];
  var weekTastes_EN = [
    'Coconut Latte · light ice', 'Osmanthus Rice Wine Latte · hot', 'Mango Pomelo Sago · light ice', 'Fried Egg · with soy sauce',
    'Tomato Scrambled Eggs · over rice', 'Bolognese · with Parmesan', 'Miso Ramen · soft-boiled egg', 'Pho · beef',
    'Hot & Sour Shredded Potatoes · with rice', 'River Snail Noodles · with fried egg', 'Tiramisu · dine-in', 'Mango Sticky Rice'
  ];
  var weekTastes = isEn ? weekTastes_EN : weekTastes_ZH;
  var tasteIdx = (sunSignIdx + moonSignIdx + now.getDate()) % weekTastes.length;

  html += '<h3>✦ ' + _L('本周幸运指南', 'This Week\'s Lucky Guide') + '</h3>';
  html += '<div style="display:flex;gap:12px;flex-wrap:wrap;">';

  // Color
  html += '<div style="flex:1;min-width:160px;background:rgba(15,15,30,0.7);border:1px solid var(--border);border-radius:10px;padding:12px 14px;">';
  html += '<p style="color:var(--accent);font-weight:bold;text-indent:0;margin-bottom:6px;font-size:0.9em;">🎨 ' + _L('本周宜穿', 'Lucky Colors to Wear') + '</p>';
  html += '<p style="text-indent:0;margin-bottom:2px;font-size:0.85em;">' + _L('太阳','Sun') + '：<strong style="color:' + weekColors[sunSignIdx].split(' ')[0] + ';">' + weekColors[sunSignIdx] + '</strong></p>';
  html += '<p style="text-indent:0;margin-bottom:0;font-size:0.85em;">' + _L('月亮','Moon') + '：<strong style="color:' + weekColors[moonSignIdx].split(' ')[0] + ';">' + weekColors[moonSignIdx] + '</strong></p>';
  html += '<p style="font-size:0.72em;color:#8a8aa0;text-indent:0;margin-top:6px;">' + _L('穿身上或放身边——围巾、饰品、手机壳都行', 'Wear it or keep it nearby — scarf, accessory, phone case, anything works') + '</p>';
  html += '</div>';

  // Crystal
  var sunClr = weekColors[sunSignIdx].split(' ')[0];
  var moonClr = weekColors[moonSignIdx].split(' ')[0];
  var sunCrystal = weekCrystals[sunSignIdx].split(' — ');
  var moonCrystal = weekCrystals[moonSignIdx].split(' — ');
  html += '<div style="flex:1;min-width:160px;background:rgba(15,15,30,0.7);border:1px solid var(--border);border-radius:10px;padding:12px 14px;">';
  html += '<p style="color:var(--accent);font-weight:bold;text-indent:0;margin-bottom:6px;font-size:0.9em;">💎 ' + _L('本周宜戴', 'Lucky Crystals to Wear') + '</p>';
  html += '<p style="text-indent:0;margin-bottom:2px;font-size:0.85em;">' + _L('太阳','Sun') + '：<strong style="color:' + sunClr + ';">' + sunCrystal[0] + '</strong> — ' + sunCrystal[1] + '</p>';
  html += '<p style="text-indent:0;margin-bottom:0;font-size:0.85em;">' + _L('月亮','Moon') + '：<strong style="color:' + moonClr + ';">' + moonCrystal[0] + '</strong> — ' + moonCrystal[1] + '</p>';
  html += '<p style="font-size:0.72em;color:#8a8aa0;text-indent:0;margin-top:6px;">' + _L('没有水晶？日常小物也能沾沾好运 ✨', 'No crystals? Everyday items can carry a bit of luck too ✨') + '</p>';
  html += '</div>';

  // Taste
  html += '<div style="flex:1;min-width:160px;background:rgba(15,15,30,0.7);border:1px solid var(--border);border-radius:10px;padding:12px 14px;text-align:center;">';
  html += '<p style="color:var(--accent);font-weight:bold;text-indent:0;margin-bottom:6px;font-size:0.9em;">🥤 ' + _L('本周宜品', 'Taste of the Week') + '</p>';
  html += '<p style="text-indent:0;font-size:0.95em;color:#c0b8d0;margin-bottom:0;">' + weekTastes[tasteIdx] + '</p>';
  html += '<p style="font-size:0.72em;color:#8a8aa0;text-indent:0;margin-top:6px;">' + _L('不管是吃的还是喝的，这周安排上就行', 'Whether food or drink — just make sure you have it this week') + '</p>';
  html += '</div>';

  html += '</div>';

  html += '<h3>✦ ' + _L('本周行运概览', 'Weekly Transit Overview') + '</h3>';
  html += '<p style="color:var(--text-dim);text-indent:0;margin-bottom:12px;">' + _L(now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日起七日运势', '7-Day Forecast from ' + (now.getMonth()+1) + '/' + now.getDate() + '/' + now.getFullYear()) + '</p>';

  // Current Moon
  const moonSi = degToSign(transitNow.Moon).si;
  const moonElems_ZH = ['火','火','火','水','水','水','风','风','风','土','土','土'];
  const moonElems_EN = ['Fire','Fire','Fire','Water','Water','Water','Air','Air','Air','Earth','Earth','Earth'];
  html += '<p><span class="highlight">' + _L('月亮当前在' + getSignNamePure(moonSi), 'Moon currently in ' + getSignNamePure(moonSi)) + '</span>——' + _L('本周你的情绪底色偏向' + moonElems_ZH[moonSi] + '象能量。', 'Your emotional undertone this week leans toward ' + moonElems_EN[moonSi] + ' element energy. ');
  if (moonSi <= 3) html += _L('适合主动出击、开启新事物、表达情感。', 'Good for taking initiative, starting new things, and expressing emotions.');
  else if (moonSi <= 5) html += _L('适合内省、照顾自己、处理未完成的情感事务。', 'Good for introspection, self-care, and processing unfinished emotional business.');
  else if (moonSi <= 8) html += _L('适合社交、沟通、处理信息类工作。', 'Good for socializing, communicating, and information-oriented work.');
  else html += _L('适合规划、整理、处理现实世界的事务。', 'Good for planning, organizing, and handling practical real-world matters.');
  html += '</p>';

  // Current fast planets (Sun, Mercury, Venus, Mars)
  const fastPlanets = [
    {id:'Sun', name_ZH:'太阳', name_EN:'Sun', label_ZH:'本周核心焦点', label_EN:'Core focus of the week'},
    {id:'Mercury', name_ZH:'水星', name_EN:'Mercury', label_ZH:'沟通与思维', label_EN:'Communication & thinking'},
    {id:'Venus', name_ZH:'金星', name_EN:'Venus', label_ZH:'社交与财运', label_EN:'Social life & finances'},
    {id:'Mars', name_ZH:'火星', name_EN:'Mars', label_ZH:'行动与欲望', label_EN:'Action & desire'}
  ];

  for (const fp of fastPlanets) {
    const tl = transitNow[fp.id];
    const {si} = degToSign(tl);
    const aspectsToNatal = [];
    for (const p of PLANETS) {
      let diff = mod360(Math.abs(tl - positions[p.id]));
      if (diff > 180) diff = 360 - diff;
      for (const ad of ASPECT_DEFS) {
        if (Math.abs(diff - ad.angle) <= ad.orb) {
          aspectsToNatal.push({planet:p, aspect:ad.name});
          break;
        }
      }
    }
    const fpName = isEn ? fp.name_EN : fp.name_ZH;
    const fpLabel = isEn ? fp.label_EN : fp.label_ZH;
    html += '<p style="margin-top:6px;text-indent:0;"><strong>' + fpName + ' ' + _L('在','in') + ' ' + getSignNamePure(si) + '</strong> — ' + fpLabel;
    if (aspectsToNatal.length > 0) {
      for (const a of aspectsToNatal) {
        const aspectDetail = describeWeeklyAspect(fp.id, a.planet.id, a.aspect, positions, houses);
        html += '<br><span style="font-size:0.85em;color:#b8b8c8;">' + fpName + ' ' + _aspectName(a.aspect) + ' ' + _L('本命','natal') + ' ' + a.planet.name + ' — ' + aspectDetail + '</span>';
      }
    }
    html += '</p>';
  }

  html += '</div>';

  html += '</div>';

  html += '</div>';
  return html;
}

// ── Monthly Fortune ───────────────────────────────────────────────────────
// ── Weekly aspect interpretation helper ──────────────────────────────────
function describeWeeklyAspect(transitId, natalId, aspect, positions, houses) {
  const natalH = houses[natalId];
  const natalName = (PLANETS.find(x=>x.id===natalId)||{}).name || natalId;
  const hLabel = HOUSE_LABELS[natalH] || (window._lang && window._lang()==='en' ? 'Personal' : '个人领域');
  const areaMap_ZH = {
    Sun: '自我表达和自信心', Moon: '情绪和内心安全感', Mercury: '沟通和思维',
    Venus: '感情和财务', Mars: '行动力和竞争意识', Jupiter: '成长和机遇', Saturn: '责任和规划',
    Uranus: '觉醒与变革', Neptune: '灵性与梦想', Pluto: '蜕变与力量'
  };
  const areaMap_EN = {
    Sun: 'self-expression & confidence', Moon: 'emotions & inner security', Mercury: 'communication & thinking',
    Venus: 'love & finances', Mars: 'drive & competitiveness', Jupiter: 'growth & opportunity', Saturn: 'responsibility & planning',
    Uranus: 'awakening & change', Neptune: 'spirituality & dreams', Pluto: 'transformation & power'
  };
  const isEn = window._lang && window._lang() === 'en';
  const areaMap = isEn ? areaMap_EN : areaMap_ZH;
  const area = areaMap[natalId] || (isEn ? 'personal matters' : '个人领域');

  const poolSel = (zhArr, enArr) => isEn ? enArr : zhArr;

  const harmonyPool_ZH = [
    '能量在此领域自然流动——适合主动推进、与人分享或公开表达。',
    '天时在你这边，此领域的事务会比你预期的更顺利。',
    '轻松的能量笼罩此领域——不用"努力"，顺势即可。',
    '你的' + areaMap_ZH[natalId] + '处于绿灯区，大胆行动比深思熟虑更有效。'
  ];
  const harmonyPool_EN = [
    'Energy flows naturally in this area — ideal for taking initiative, sharing, or speaking up.',
    'Timing is on your side — things in this area will go more smoothly than you expect.',
    'A light energy surrounds this area — no need to "try hard," just go with the flow.',
    'Your ' + areaMap_EN[natalId] + ' has a green light — bold action beats overthinking right now.'
  ];
  const tensionPool_ZH = [
    '外界的压力触碰到你的' + areaMap_ZH[natalId] + '——这不是坏事，它帮你看到盲区。',
    '有些摩擦正在此领域浮现。别逃——那是需要你正视的信号。',
    '这可能让你感到不适，但恰恰说明此领域对你很重要。借力打力。',
    '本周此领域可能有些棘手，但解决它之后你会比之前更强。'
  ];
  const tensionPool_EN = [
    'External pressure is touching your ' + areaMap_EN[natalId] + ' — this isn\'t bad, it reveals blind spots.',
    'Some friction is surfacing in this area. Don\'t run — it\'s a signal worth facing.',
    'This may feel uncomfortable, but that only proves how much this area matters to you. Use the resistance.',
    'This area may be tricky this week, but you\'ll come out stronger after addressing it.'
  ];
  const opportunityPool_ZH = [
    '有一个微妙的"门"正在此领域打开——你需要主动走过去，它不会自己来找你。',
    '留意此领域的小线索：一个邀请、一条消息或一次偶遇都可能是指引。',
    '本周此领域隐藏着一个小机会——保持敏感，它会显现。'
  ];
  const opportunityPool_EN = [
    'A subtle "door" is opening in this area — you need to walk toward it; it won\'t come to you.',
    'Watch for small clues in this area: an invitation, a message, or a chance encounter could be a sign.',
    'A small opportunity is hiding in this area this week — stay sensitive and it will reveal itself.'
  ];
  const conjunctionPool_ZH = [
    '两股能量在此汇聚，此领域成为本周焦点。适合投入时间和注意力深耕。',
    '能量在此增强，你的' + areaMap_ZH[natalId] + '处于高亮状态——容易被别人注意到。'
  ];
  const conjunctionPool_EN = [
    'Two energies converge here — this area becomes the week\'s focal point. Worth investing time and attention.',
    'Energy is amplified here — your ' + areaMap_EN[natalId] + ' is spotlighted and others will take notice.'
  ];

  const harmonyPool = poolSel(harmonyPool_ZH, harmonyPool_EN);
  const tensionPool = poolSel(tensionPool_ZH, tensionPool_EN);
  const opportunityPool = poolSel(opportunityPool_ZH, opportunityPool_EN);
  const conjunctionPool = poolSel(conjunctionPool_ZH, conjunctionPool_EN);

  const pick = (arr) => arr[Math.floor(Math.abs(natalH * 7 + aspect.length * 3) % arr.length)];

  if (aspect === '合') {
    if (transitId === 'Sun') return _L('行运太阳与你的本命' + natalName + '合相——你的' + areaMap_ZH[natalId] + '被强力激活，本周在此领域的存在感和表达欲会明显增强。' + pick(conjunctionPool_ZH), 'Transiting Sun conjunct your natal ' + natalName + ' — your ' + areaMap_EN[natalId] + ' is powerfully activated. Your presence and desire to express yourself in this area will be noticeably amplified this week. ' + pick(conjunctionPool_EN));
    if (transitId === 'Mercury') return _L('行运水星合相你的本命' + natalName + '——沟通和思绪汇聚于此领域。适合谈判、写作或做出重要决定。' + pick(conjunctionPool_ZH), 'Transiting Mercury conjunct your natal ' + natalName + ' — communication and thoughts converge here. Ideal for negotiation, writing, or making important decisions. ' + pick(conjunctionPool_EN));
    return _L('行运' + transitId + '合相你的本命' + natalName + '——' + areaMap_ZH[natalId] + '的能量被激活，本周是关注此领域的好时机。', 'Transiting ' + transitId + ' conjunct your natal ' + natalName + ' — ' + areaMap_EN[natalId] + ' energy is activated. A good week to focus on this area.');
  }
  if (aspect === '冲') return _L('行运' + transitId + '对冲你的本命' + natalName + '——' + areaMap_ZH[natalId] + '（第' + natalH + '宫' + hLabel + '）出现张力。' + pick(tensionPool_ZH), 'Transiting ' + transitId + ' opposing your natal ' + natalName + ' — tension arises in ' + areaMap_EN[natalId] + ' (House ' + natalH + ' ' + (HOUSE_LABELS[natalH]||'Personal') + '). ' + pick(tensionPool_EN));
  if (aspect === '刑') return _L('行运' + transitId + '刑克你的本命' + natalName + '——在' + areaMap_ZH[natalId] + '方面可能遇到摩擦，' + pick(tensionPool_ZH), 'Transiting ' + transitId + ' square your natal ' + natalName + ' — possible friction in ' + areaMap_EN[natalId] + '. ' + pick(tensionPool_EN));
  if (aspect === '三合') return _L('行运' + transitId + '三合你的本命' + natalName + '——涉及第' + natalH + '宫' + hLabel + '。' + pick(harmonyPool_ZH), 'Transiting ' + transitId + ' trine your natal ' + natalName + ' — involving House ' + natalH + ' ' + (HOUSE_LABELS[natalH]||'Personal') + '. ' + pick(harmonyPool_EN));
  if (aspect === '六合') return _L('行运' + transitId + '六合你的本命' + natalName + '——' + pick(opportunityPool_ZH), 'Transiting ' + transitId + ' sextile your natal ' + natalName + ' — ' + pick(opportunityPool_EN));
  return _L('行运' + transitId + '当前触及你的本命' + natalName + '——第' + natalH + '宫（' + hLabel + '）本周有能量流动。', 'Transiting ' + transitId + ' is touching your natal ' + natalName + ' — House ' + natalH + ' (' + (HOUSE_LABELS[natalH]||'Personal') + ') has energy flowing this week.');
}

function generateMonthlyFortune(positions, houses, asc) {
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitNow = calcAllPlanets(nowT);

  const isEn = window._lang && window._lang() === 'en';

  let html = '<div class="report-section">';
  html += '<h3>✦ ' + _L(now.getFullYear() + '年' + (now.getMonth()+1) + '月运势', (now.getMonth()+1) + '/' + now.getFullYear() + ' Monthly Fortune') + '</h3>';

  // Sun transit theme
  const sunSi = degToSign(transitNow.Sun).si;
  html += '<p><span class="highlight">' + _L('太阳行经' + getSignNamePure(sunSi), 'Sun transiting ' + getSignNamePure(sunSi)) + '</span>——' + _L('本月你的核心能量聚焦于此。', 'Your core energy is focused here this month. ');
  const sunThemes_ZH = [
    '这是一个开始新项目、展示领导力、关注个人成长的月份。大胆行动，相信自己的直觉。',
    '本月焦点在金钱和价值观上。审视你的财务状况，重新定义什么对你来说是真正"有价值"的。',
    '沟通和学习是本月主题。适合签约、写作、短途出行、或开始一门新课程。',
    '家庭和情感安全是本月核心。适合处理房产事务、陪伴家人、或进行内在的情感整理。',
    '创造力和浪漫氛围高涨。适合艺术创作、恋爱表达、或尝试新的娱乐和爱好。',
    '健康和工作细节需要关注。适合建立新的日常习惯、体检、或完成积压的事务性工作。',
    '人际关系和合作是本月焦点。适合谈判、签约、改善重要的人际关系。',
    '深度转化和共享资源是本月课题。适合处理税务、保险、投资，或进行深层的心理探索。',
    '扩展视野、旅行和学习。适合报名课程、规划远行、或涉足新的知识领域。',
    '事业发展和社会形象是本月焦点。适合争取晋升、启动新项目、或在行业内建立影响力。',
    '社交圈和长远愿景。适合拓展人脉、参与社群活动、或重新审视你的人生目标。',
    '内省和灵性成长。适合冥想、艺术创作、或处理那些一直被你忽略的情感。'
  ];
  const sunThemes_EN = [
    'A month for starting new projects, showing leadership, and focusing on personal growth. Act boldly and trust your instincts.',
    'The spotlight is on money and values. Review your finances and redefine what truly holds "value" for you.',
    'Communication and learning are the themes. Ideal for signing contracts, writing, short trips, or starting a new course.',
    'Home and emotional security take center stage. Suitable for property matters, family time, or inner emotional housekeeping.',
    'Creativity and romance are running high. Great for artistic pursuits, expressing love, or exploring new hobbies.',
    'Health and work details need attention. Good for establishing new routines, checkups, or clearing backlogged tasks.',
    'Relationships and partnerships are the focus. Ideal for negotiation, signing deals, and improving key connections.',
    'Deep transformation and shared resources are on the table. Suitable for handling taxes, insurance, investments, or psychological exploration.',
    'Expanding horizons, travel, and learning. Great for enrolling in courses, planning journeys, or diving into new knowledge.',
    'Career development and public image are the focus. Ideal for seeking promotion, launching projects, or building industry influence.',
    'Social circles and long-term vision. Good for networking, community events, or re-examining your life goals.',
    'Introspection and spiritual growth. Suitable for meditation, creative work, or processing emotions you\'ve been neglecting.'
  ];
  html += (isEn ? sunThemes_EN[sunSi] : sunThemes_ZH[sunSi]) + '</p>';

  // Mercury position + retrograde check
  const mercSi = degToSign(transitNow.Mercury).si;
  const mercStyles_ZH = ['直接果断','务实谨慎','灵活多元','感性直觉','自信表达','细致分析','平衡协和','深刻洞察','开阔自由','严肃认真','创新独特','梦幻浪漫'];
  const mercStyles_EN = ['direct & decisive','practical & cautious','flexible & versatile','sensitive & intuitive','confident expression','meticulous analysis','balanced & harmonious','deep & penetrating','open & free','serious & disciplined','innovative & unique','dreamy & romantic'];
  html += '<p style="margin-top:8px;"><span class="highlight">' + _L('水星在' + getSignNamePure(mercSi), 'Mercury in ' + getSignNamePure(mercSi)) + '</span>——' + _L('本月你的思维和沟通风格偏向' + mercStyles_ZH[mercSi] + '。', 'Your thinking and communication style leans ' + mercStyles_EN[mercSi] + ' this month.') + '</p>';

  // Venus position
  const venusSi = degToSign(transitNow.Venus).si;
  html += '<p><span class="highlight">' + _L('金星在' + getSignNamePure(venusSi), 'Venus in ' + getSignNamePure(venusSi)) + '</span>——' + _L('本月你的社交和财务运势受此影响。', 'Your social and financial fortune is influenced by this this month. ');
  if (venusSi <= 2) html += _L('适合主动出击、在社交中展现自信。财运方面可能有快速来去的机会。', 'Good for taking initiative and showing confidence socially. Financially, quick opportunities may come and go.');
  else if (venusSi <= 5) html += _L('情感和社交趋于内敛——适合经营现有的关系而非拓展新关系。财务上偏保守。', 'Emotions and social life turn inward — better to nurture existing relationships than seek new ones. Financially conservative.');
  else if (venusSi <= 8) html += _L('社交活跃期，容易遇到新朋友或合作机会。财务上适合与人合作或信息类收入。', 'A socially active period — easy to meet new friends or collaboration opportunities. Financially favors partnerships or information-based income.');
  else html += _L('感情和金钱偏向务实和长期规划。适合为未来的财务安全做布局。', 'Love and money lean practical and long-term. Good for laying foundations for future financial security.');
  html += '</p>';

  // Mars house transit
  const marsSi = degToSign(transitNow.Mars).si;
  const marsHouse = Math.floor(mod360(transitNow.Mars - asc) / 30) + 1;
  html += '<p><span class="highlight">' + _L('火星在' + getSignNamePure(marsSi), 'Mars in ' + getSignNamePure(marsSi)) + '</span>——' + _L('本月你的行动力和欲望集中在第' + marsHouse + '宫（' + (HOUSE_LABELS[marsHouse] || '个人') + '）领域。', 'Your drive and desires are focused on House ' + marsHouse + ' (' + (HOUSE_LABELS[marsHouse] || 'Personal') + ') this month.') + '</p>';

  html += '<p style="color:var(--accent);text-indent:0;margin-top:12px;">' + _L('本月关键日期：新月和满月前后（约月中和月底），注意情绪和身体的信号——那是你的星盘在给你指引。', 'Key dates this month: around the New and Full Moons (~mid-month and month-end), pay attention to emotional and physical signals — your chart is giving you guidance.') + '</p>';

  html += '</div>';
  return html;
}

// ── Yearly Fortune ────────────────────────────────────────────────────────
function generateYearlyFortune(positions, houses, asc, mc) {
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitNow = calcAllPlanets(nowT);

  const year = now.getFullYear();
  const isEn = window._lang && window._lang() === 'en';
  let html = '<div class="report-section">';
  html += '<h3>✦ ' + _L(year + '年度运势总览', year + ' Annual Fortune Overview') + '</h3>';

  // Jupiter annual theme
  const jupSi = degToSign(transitNow.Jupiter).si;
  const jupH = Math.floor(mod360(transitNow.Jupiter - asc) / 30) + 1;
  html += '<p><span class="highlight">' + _L('木星全年位于' + getSignNamePure(jupSi), 'Jupiter in ' + getSignNamePure(jupSi) + ' all year') + '</span>——' + _L(year + '年是你人生中', year + ' is a year of ');
  const jupThemes_ZH = [
    '个人成长和自我突破的年份。大胆开启新项目——宇宙正在为你打开大门。',
    '财富和价值观扩展的年份。新的收入渠道可能出现，你对"富足"的理解也会深化。',
    '学习和沟通的丰收年。适合写作、出版、教学、或任何形式的"把自己的想法传播出去"。',
    '家庭和根基的扩张年。适合搬家、装修、或深刻疗愈与家人之间的关系。',
    '创意和浪漫的爆发年。你的创造力达到峰值，恋爱运也异常旺盛。',
    '工作和健康优化年。新的工作机会或健康习惯将给未来数年带来红利。',
    '合作和伴侣关系的幸运年。适合进入新的合作关系，或让现有关系升级到新高度。',
    '深度资源和转化的机会年。投资、遗产、或深层心理工作将带来超预期的回报。',
    '高等教育和远行的智慧年。适合出国、深造、或开始一段改变世界观的精神旅程。',
    '事业和社会地位的突破年。你的努力终于得到认可——抓住聚光灯下的机会。',
    '社交圈和理想的扩展年。遇到志同道合的伙伴，或通过朋友打开全新的机遇。',
    '灵性和内在世界的丰收年。适合闭关、艺术创作、或完成一段重要的内在旅程。'
  ];
  const jupThemes_EN = [
    'personal growth and self-breakthrough. Boldly start new projects — the universe is opening doors for you.',
    'wealth and value expansion. New income channels may emerge, and your understanding of "abundance" will deepen.',
    'learning and communication harvest. Ideal for writing, publishing, teaching, or any form of "spreading your ideas."',
    'home and foundation expansion. Suitable for moving, renovating, or deeply healing family relationships.',
    'creative and romantic explosion. Your creativity peaks and your love luck is exceptionally strong.',
    'work and health optimization. New job opportunities or health habits will pay dividends for years to come.',
    'partnership and relationship luck. Ideal for entering new partnerships or upgrading existing ones to new heights.',
    'deep resources and transformation opportunities. Investments, inheritance, or deep psychological work will bring outsized returns.',
    'higher education and long-distance wisdom. Suitable for going abroad, advanced study, or a spiritual journey that changes your worldview.',
    'career and social status breakthrough. Your efforts are finally recognized — seize the spotlight.',
    'social circle and ideal expansion. Meet like-minded companions, or discover new opportunities through friends.',
    'spiritual and inner world harvest. Suitable for retreat, creative work, or completing an important inner journey.'
  ];
  html += (isEn ? jupThemes_EN[jupSi] : jupThemes_ZH[jupSi]) + '</p>';

  // Saturn annual lesson
  const satSi = degToSign(transitNow.Saturn).si;
  const satH = Math.floor(mod360(transitNow.Saturn - asc) / 30) + 1;
  html += '<p style="margin-top:8px;"><span class="highlight">' + _L('土星全年位于' + getSignNamePure(satSi), 'Saturn in ' + getSignNamePure(satSi) + ' all year') + '</span>——' + _L('这是你今年的"功课"所在。土星要求你在相关领域建立结构、承担责任。过程或许不轻松，但所有在此阶段打下的基础将支撑你未来数十年的发展。', 'This is your "homework" for the year. Saturn asks you to build structure and take responsibility in the relevant area. The process may not be easy, but every foundation laid during this phase will support your development for decades to come.') + '</p>';

  // Check outer planet aspects to natal
  html += '<p style="margin-top:8px;"><strong>' + _L('年度关键相位：', 'Key Annual Aspects:') + '</strong></p>';
  let foundKeyAspect = false;
  const outerIds = ['Jupiter','Saturn','Uranus'];
  for (const oid of outerIds) {
    const tl = transitNow[oid];
    for (const p of PLANETS) {
      let diff = mod360(Math.abs(tl - positions[p.id]));
      if (diff > 180) diff = 360 - diff;
      for (const ad of ASPECT_DEFS) {
        if (Math.abs(diff - ad.angle) <= ad.orb + 1) {
          const op = PLANETS.find(x=>x.id===oid);
          const h = houses[p.id];
          const hLabel = HOUSE_LABELS[h] || (isEn ? 'Personal' : '个人领域');
          html += '<p style="font-size:0.85em;color:#b0b0c0;text-indent:0;">↳ ' + (op?op.name:oid) + _aspectName(ad) + _L('本命', ' natal ') + p.name + ' — ';
          if (oid === 'Jupiter') {
            if (ad.name === '三合' || ad.name === '六合') html += _L('幸运之门在此领域为你敞开，适合扩张和尝试新方向。', 'A lucky door opens in this area — ideal for expansion and trying new directions.');
            else if (ad.name === '刑' || ad.name === '冲') html += _L('过度乐观或铺得太开可能带来压力——聚焦一个方向，质量比数量重要。', 'Over-optimism or spreading too thin may bring pressure — focus on one direction; quality matters more than quantity.');
            else html += _L('今年此领域有显著的扩展机遇，宇宙在邀请你踏出舒适区。', 'This area has notable expansion opportunities this year — the universe is inviting you out of your comfort zone.');
          } else if (oid === 'Saturn') {
            if (ad.name === '三合' || ad.name === '六合') html += _L('你的耐心和纪律在此领域开始结出果实——这是收获"延迟回报"的一年。', 'Your patience and discipline in this area are beginning to bear fruit — this is a year of reaping "delayed rewards."');
            else if (ad.name === '刑' || ad.name === '冲') html += _L('责任和现实约束在此领域施加压力——这不是惩罚，是锻造。扛过去，你会比之前强大很多。', 'Responsibility and real-world constraints are applying pressure in this area — this isn\'t punishment, it\'s forging. Push through and you\'ll emerge much stronger.');
            else html += _L('今年此领域需要你建立结构、承担更多责任——认真对待，这是未来数年的根基。', 'This area requires you to build structure and take on more responsibility this year — take it seriously; it\'s the foundation for years to come.');
          } else {
            if (ad.name === '三合' || ad.name === '六合') html += _L('意想不到的突破或创新灵感在此领域浮现——保持开放和灵活。', 'Unexpected breakthroughs or innovative inspiration emerge in this area — stay open and flexible.');
            else if (ad.name === '刑' || ad.name === '冲') html += _L('此领域可能经历突如其来的震荡或觉醒——旧模式被打破，新可能正在出现。', 'This area may experience sudden shocks or awakenings — old patterns are breaking, new possibilities are emerging.');
            else html += _L('天王星的变革能量正在此领域运作——准备好迎接意外但必要的转变。', 'Uranus\' transformative energy is at work in this area — be ready for unexpected but necessary change.');
          }
          html += '</p>';
          foundKeyAspect = true;
        }
      }
    }
  }
  if (!foundKeyAspect) {
    html += '<p style="font-size:0.85em;color:#b0b0c0;">' + _L('今年是相对平稳的整合年——适合巩固已有成果，为下一阶段的大动作做准备。', 'This is a relatively stable consolidation year — ideal for reinforcing existing achievements and preparing for the next big move.') + '</p>';
  }

  // Eclipses simplified
  const jupKeywords_ZH = ['开拓','积累','表达','滋养','绽放','精进','连接','转化','探索','成就','联结','觉醒'];
  const jupKeywords_EN = ['Pioneering','Accumulation','Expression','Nurturing','Blossoming','Refinement','Connection','Transformation','Exploration','Achievement','Alliance','Awakening'];
  const satKeywords_ZH = ['责任','耐心','沟通','关怀','自信','服务','平衡','深度','自由','坚守','创新','超越'];
  const satKeywords_EN = ['Responsibility','Patience','Communication','Care','Confidence','Service','Balance','Depth','Freedom','Perseverance','Innovation','Transcendence'];
  const jupYearNames_ZH = ['行动之年','价值之年','学习之年','家庭之年','创造之年','健康之年','关系之年','蜕变之年','智慧之年','事业之年','社群之年','灵性之年'];
  const jupYearNames_EN = ['Year of Action','Year of Value','Year of Learning','Year of Family','Year of Creation','Year of Health','Year of Relationships','Year of Transformation','Year of Wisdom','Year of Career','Year of Community','Year of Spirituality'];

  html += '<p style="color:var(--accent);text-indent:0;margin-top:12px;">' + _L(year + '年主题词：<strong>' + jupKeywords_ZH[jupSi] + '</strong> + <strong>' + satKeywords_ZH[satSi] + '</strong>。这是你的"' + jupYearNames_ZH[jupSi] + '。', year + ' Keywords: <strong>' + jupKeywords_EN[jupSi] + '</strong> + <strong>' + satKeywords_EN[satSi] + '</strong>. This is your "' + jupYearNames_EN[jupSi] + '."') + '</p>';

  html += '</div>';
  return html;
}


function submitConsultation() {
  const q = document.getElementById('consultQuestion').value.trim();
  if (!q) { alert(_t('error.fillQuestion')); return; }
  if (!chartData1) return;

  const btn = document.querySelector('.consult-submit');
  btn.disabled = true;
  btn.textContent = _t('consult.loading');

  setTimeout(() => {
    try {
    const d = chartData1;
    const result = generateDeepConsultation(q, d.positions, d.houses, d.aspects, d.asc, d.mc);
    window._consultResult = result;
    const resultEl = document.getElementById('consultResult');
    if (resultEl) {
      resultEl.innerHTML = result;
      resultEl.scrollIntoView({behavior:'smooth'});
    }
    btn.disabled = false;
    btn.textContent = _t('consult.askAgain');
    } catch(e) {
    document.getElementById('consultResult').innerHTML = '<p style="color:#c87070;">' + _t('error.consult') + e.message + '</p>';
    btn.disabled = false;
    btn.textContent = _t('consult.submit');
    console.error(e);
    }
  }, 100);
}

// ═══════════════════════════════════════════════════════════════════════════
//  DEEP CONSULTATION — Astro + Transit + Tarot synthesis engine
// ═══════════════════════════════════════════════════════════════════════════

function generateDeepConsultation(question, positions, houses, aspects, asc, mc) {
  const isEn = window._lang && window._lang() === 'en';
  const q = (question || '').trim();
  if (!q) return '<p style="color:var(--text-dim);text-align:center;padding:30px;">'+_L('请输入你的问题，我会结合星盘、行运和塔罗为你深度解读。','Enter your question and I will combine your natal chart, transits, and tarot for a deep interpretation.')+'</p>';

  // ═══ Step 1: Domain detection ═══
  const domains = [];
  const domainKw = {
    love: { name:_L('感情关系','Love & Relationships'), kw: ['感情','爱情','恋爱','伴侣','婚姻','老公','老婆','男朋友','女朋友','分手','复合','喜欢','暗恋','暧昧','相亲','前任','劈腿','出轨','脱单','单身','夫妻','对象','约会','求婚','订婚','离婚'] },
    career: { name:_L('事业工作','Career & Work'), kw: ['工作','事业','职业','老板','同事','跳槽','辞职','升职','加薪','面试','找工作','转行','创业','副业','办公室','领导','薪资','试用','考核','项目','合伙','失业'] },
    money: { name:_L('财富金钱','Wealth & Money'), kw: ['钱','财','收入','投资','理财','股票','基金','负债','贷款','存款','买房','租房','赚钱','亏','花销','省','金融','资产','存款'] },
    family: { name:_L('家庭关系','Family & Home'), kw: ['家里','父母','妈妈','爸爸','孩子','子女','亲戚','家庭','婆婆','岳母','丈母娘','弟弟','妹妹','哥哥','姐姐','原生家庭'] },
    self: { name:_L('自我成长','Self-Growth'), kw: ['迷茫','方向','人生','意义','自己','改变','选择','焦虑','抑郁','孤独','压力','失眠','拖延','自卑','自信','天赋','使命','价值','未来','不知道','怎么办'] },
    health: { name:_L('身心健康','Health & Wellness'), kw: ['身体','健康','病','失眠','累','疲劳','精神','心理','情绪','养生','锻炼','减肥','饮食'] },
    social: { name:_L('社交人际','Social & Relationships'), kw: ['朋友','社交','人际','人脉','圈子','关系','室友','同学','闺蜜','哥们','人情'] },
    study: { name:_L('学习考试','Study & Exams'), kw: ['学习','考试','复习','考研','考公','考证','毕业','论文','留学','学校','专业','成绩'] }
  };
  for (const [key, d] of Object.entries(domainKw)) {
    const score = d.kw.reduce((s, w) => s + (q.includes(w) ? 1 : 0), 0);
    if (score > 0) domains.push({ key, name: d.name, score });
  }
  if (domains.length === 0) domains.push({ key: 'self', name: _L('自我成长','Self-Growth'), score: 1 });
  domains.sort((a, b) => b.score - a.score);
  const primary = domains[0];

  let html = '';
  html += '<div class="consult-domain-badge">🎯 ' + _L('识别问题领域：','Domain Identified: ') + primary.name + (domains.length > 1 ? ' · ' + domains.slice(0,2).map(d=>d.name).join('、') : '') + '</div>';

  // ═══ Step 2: Natal chart analysis for this domain ═══
  html += '<div class="consult-source astro"><h4>🔮 ' + _L('星盘本命 — 你与生俱来的模式','Natal Chart — Your Innate Patterns') + '</h4>';
  const natalInsights = getNatalDomainInsight(primary.key, positions, houses, aspects, asc, mc);
  html += '<p>' + natalInsights + '</p></div>';

  // ═══ Step 3: Current transits for this domain ═══
  html += '<div class="consult-source transit"><h4>🌠 ' + _L('当前行运 — 此刻的宇宙信号','Current Transits — Cosmic Signals Now') + '</h4>';
  const transitInsights = getTransitDomainInsight(primary.key, positions, houses, asc);
  html += '<p>' + transitInsights + '</p></div>';

  // ═══ Step 4: Tarot draw ═══
  html += '<div class="consult-source tarot"><h4>🃏 ' + _L('塔罗指引 — 宇宙给你的回应','Tarot Guidance — The Universe Responds') + '</h4>';
  const deck = shuffle(buildDeck());
  const card = deck[0];
  const tarotInsight = getTarotDomainInsight(card, primary.key);
  html += '<p><strong>' + (isEn ? card.en : card.name) + (card.num ? ' (' + card.num + ')' : '') + '</strong> — ' + tarotInsight + '</p></div>';

  // ═══ Step 5: Synthesis ═══
  html += '<div class="consult-synthesis"><h4>✦ ' + _L('综合解读','Synthesis') + '</h4>';
  html += '<p>' + synthesizeConsultation(primary.key, q, natalInsights, transitInsights, tarotInsight, positions, houses) + '</p>';
  html += '</div>';

  // ═══ Step 6: Actionable advice ═══
  html += '<div class="consult-advice">';
  html += '<strong>📝 ' + _L('给你的建议：','Advice for You:') + '</strong><br>';
  html += getActionableAdvice(primary.key, positions, houses, card, asc);
  html += '</div>';

  return html;
}

// ── Domain-specific natal analysis ─────────────────────────────────────────
function getNatalDomainInsight(domain, positions, houses, aspects, asc, mc) {
  const isEn = window._lang && window._lang() === 'en';
  const venusSi = degToSign(positions.Venus).si, marsSi = degToSign(positions.Mars).si;
  const moonSi = degToSign(positions.Moon).si, sunSi = degToSign(positions.Sun).si;
  const mercSi = degToSign(positions.Mercury).si, satSi = degToSign(positions.Saturn).si;
  const venusH = houses.Venus, marsH = houses.Mars, moonH = houses.Moon;
  const satH = houses.Saturn, jupH = houses.Jupiter, plutoH = houses.Pluto;

  const insights = {
    love: () => {
      let r = _L('你的金星落在','Your Venus is in ') + getSignNamePure(venusSi) + _L('第',' House ') + venusH + _L('宫——这决定了你在爱中如何表达、欣赏什么样的人。',' — this determines how you express love and what kind of person you\'re attracted to.');
      const venusLove_ZH = ['热情直接，被自信勇敢的人吸引','稳固忠诚，重视物质和感官的稳定','需要智慧的碰撞和有趣的对话','温柔深沉，需要安全感和情感共鸣','大方热烈，享受被关注和浪漫的仪式','细腻务实，用行动和付出来表达爱','优雅平衡，追求和谐美好的伴侣关系','深刻炽热，渴望灵魂层面的完全融合','自由真诚，需要空间和探索的伴侣','认真负责，看重承诺和长远规划','独立独特，需要精神上的理解和尊重','浪漫梦幻，追求超越现实的灵魂连接'];
      const venusLove_EN = ['Passionate and direct — attracted to confident, brave people','Steady and loyal — values material and sensory stability','Needs intellectual sparks and stimulating conversation','Gentle and deep — needs emotional security and resonance','Warm and radiant — enjoys being seen and romantic rituals','Detail-oriented and practical — expresses love through acts of service','Graceful and balanced — seeks harmonious, beautiful partnerships','Intense and passionate — craves complete soul-level fusion','Free and sincere — needs space and a partner who explores with you','Serious and responsible — values commitment and long-term planning','Independent and unique — needs spiritual understanding and respect','Romantic and dreamy — seeks a soul connection beyond the ordinary'];
      r += (isEn ? venusLove_EN[venusSi] : venusLove_ZH[venusSi]) + ' ';
      r += _L('火星落在','Your Mars is in ') + getSignNamePure(marsSi) + _L('第',' House ') + marsH + _L('宫——这透露了你的激情如何被点燃、在关系中如何追求。',' — this reveals how your passion is ignited and how you pursue in relationships.');
      let mvDiff = mod360(Math.abs(positions.Moon - positions.Venus));
      if (mvDiff > 180) mvDiff = 360 - mvDiff;
      if (Math.abs(mvDiff - 90) <= 7 || Math.abs(mvDiff - 180) <= 8) {
        r += _L('⚡ 你的月亮和金星存在紧张相位——这意味着你的情感需求和爱的表达方式存在内在冲突。你可能会在亲密关系中反复体验"想要靠近却又害怕受伤"的矛盾——这是你此生最重要的情感课题。','⚡ Your Moon and Venus form a tense aspect — there is an inner conflict between your emotional needs and how you express love. You may repeatedly experience the paradox of "wanting closeness yet fearing hurt" in intimate relationships — this is your most important emotional lesson in this lifetime.');
      } else if (Math.abs(mvDiff - 120) <= 8 || Math.abs(mvDiff - 60) <= 6) {
        r += _L('你的月亮和金星和谐共振——你天生懂得如何在爱中滋养和被滋养。情感需求和爱的表达是同一个方向，这是你的天赋。','Your Moon and Venus resonate in harmony — you naturally know how to nourish and be nourished in love. Your emotional needs and expression of love flow in the same direction — this is your gift.');
      }
      if (houses.Saturn === 7) r += _L('土星在第七宫——你在关系中格外认真谨慎，可能晚婚或在关系中承担较重的责任。这不是惩罚，而是你需要一个经得起时间考验的伴侣。','Saturn in the 7th House — you are especially serious and cautious in relationships. You may marry later or carry heavier responsibilities in partnership. This is not a punishment — you need a partner who can stand the test of time.');
      if (houses.Pluto === 7) r += _L('冥王星在第七宫——你的亲密关系是你灵魂深度转化的场域。你吸引的关系往往带着强烈的业力感，每一次深刻的连接都在重塑你。','Pluto in the 7th House — your intimate relationships are the field of your soul\'s deepest transformation. The relationships you attract often carry a strong karmic charge — every profound connection reshapes you.');
      return r;
    },
    career: () => {
      let r = _L('你的太阳（人生目标）在','Your Sun (life purpose) is in ') + getSignNamePure(sunSi) + _L('第',' House ') + (houses.Sun||'?') + _L('宫——这是你此生的核心驱动力和成就感的来源。',' — this is your core drive and source of fulfillment in this lifetime.');
      r += _L('火星（行动模式）在','Your Mars (mode of action) is in ') + getSignNamePure(marsSi) + _L('第',' House ') + marsH + _L('宫——这决定了你在工作中如何发力、面对竞争和挑战。',' — this determines how you exert force at work and face competition and challenges.');
      r += _L('中天MC在','Your Midheaven (MC) is in ') + getSignNamePure(degToSign(mc).si) + _L('——这是你展示给世界看的"职业面孔"。',' — this is the "professional face" you show the world.');
      if (houses.Pluto === 10) r += _L('冥王星在事业宫——你的事业注定经历不止一次重大转型。你不是"一份工作做一辈子"的人，每一次职业转变都是在向更真实的自己靠近。','Pluto in the 10th House — your career is destined to undergo more than one major transformation. You are not a "one job for life" person — every career shift brings you closer to your authentic self.');
      if (houses.Jupiter === 10) r += _L('木星在事业宫——你在事业上有天然的幸运和扩张力。做自己真正相信的事，宇宙会为你开路。','Jupiter in the 10th House — you have natural luck and expansive power in your career. Do what you truly believe in, and the universe will pave the way.');
      if (houses.Saturn === 10) r += _L('土星在事业宫——你的事业成就需要时间慢慢积累。早期的挫折和延迟不是失败，而是在为你打下任何人都无法撼动的根基。','Saturn in the 10th House — your career achievements need time to accumulate slowly. Early setbacks and delays are not failures — they are building a foundation no one can shake.');
      return r;
    },
    money: () => {
      let r = _L('你的财帛宫（第2宫）和偏财宫（第8宫）刻画了你的财富蓝图。金星在','Your 2nd House (earned income) and 8th House (shared resources) map your wealth blueprint. Venus in ') + getSignNamePure(venusSi) + _L('——你通过什么吸引金钱，以及你对"价值"的定义。',' — how you attract money and how you define "value".');
      if (houses.Jupiter === 2) r += _L('木星在财帛宫——你对金钱有天然的扩张力，但也容易大手大脚。学会让钱为你工作，而不仅仅是为钱工作。','Jupiter in the 2nd House — you have natural expansive power with money, but can also overspend. Learn to make money work for you, not just work for money.');
      if (houses.Saturn === 2) r += _L('土星在财帛宫——财富来得慢但来得稳。你越是对自己的价值有信心，金钱就越愿意来找你。','Saturn in the 2nd House — wealth comes slowly but steadily. The more confident you are in your own value, the more money will find its way to you.');
      if (houses.Jupiter === 8) r += _L('木星在偏财宫——投资、副业、合伙收益是你最强劲的财富通道。你天生适合"用别人的资源创造价值"。','Jupiter in the 8th House — investments, side businesses, and partnership income are your strongest wealth channels. You are naturally suited to "create value using shared resources".');
      if (houses.Pluto === 8) r += _L('冥王星在偏财宫——你对金钱和资源的掌控力会随着人生经历而加深。你可能经历财务上的"死亡与重生"，但每一次重生后都更加强大。','Pluto in the 8th House — your mastery over money and resources deepens with life experience. You may experience financial "death and rebirth", but each rebirth makes you stronger.');
      r += _L('你的财富密码不在于"赚更多"，而在于找到那个让你觉得"即使不赚钱也想做"的方向——当价值和热情对齐，金钱会自然跟随。','Your wealth code isn\'t about "earning more" — it\'s about finding the direction where you\'d do it "even if it didn\'t pay". When value and passion align, money follows naturally.');
      return r;
    },
    family: () => {
      let r = _L('你的月亮（情感根基）在','Your Moon (emotional foundation) is in ') + getSignNamePure(moonSi) + _L('第',' House ') + moonH + _L('宫——这揭示了你从原生家庭中获得的情感模式和安全感来源。',' — this reveals the emotional patterns and sense of security you absorbed from your family of origin.');
      const moonFamily_ZH = ['在家庭中你需要独立被认可','家庭对你意味着稳定和物质保障','你在家庭中扮演沟通者的角色','家庭是你情感的归宿和避风港','你在家庭中需要被看见和认可','你在家庭中倾向于"照顾者"的角色','家庭关系中你追求和谐与公平','家庭情感对你来说深刻而复杂','你在家庭中需要自由和空间','家庭对你来说是责任和承诺','家庭关系中有种"疏离中的深刻"','家庭是你灵性的根基和业力连接'];
      const moonFamily_EN = ['In family, you need independence to be recognized','Family means stability and material security to you','You play the role of communicator in the family','Family is your emotional home and safe harbor','In family, you need to be seen and acknowledged','In family, you tend toward the "caregiver" role','In family relationships, you seek harmony and fairness','Family emotions are deep and complex for you','In family, you need freedom and space','Family means responsibility and commitment to you','There is a "depth within distance" in your family ties','Family is your spiritual root and karmic connection'];
      r += (isEn ? moonFamily_EN[moonSi] : moonFamily_ZH[moonSi]) + '. ';
      if (houses.Saturn === 4) r += _L('土星在田宅宫——你早年家庭环境可能比较严肃或有较多责任。这让你从小就学会了"靠自己"。成年后，你有机会重新定义"家"对你的意义。','Saturn in the 4th House — your early home environment may have been strict or carried heavier responsibilities. This taught you to "rely on yourself" from a young age. As an adult, you have the opportunity to redefine what "home" means to you.');
      if (houses.Pluto === 4) r += _L('冥王星在田宅宫——你与家族之间有着深层的业力纠缠。家庭中的权力、控制和深层情感是你此生的转化课题。','Pluto in the 4th House — there is a deep karmic entanglement between you and your family. Power, control, and deep emotions within the family are your transformational lesson in this lifetime.');
      return r;
    },
    self: () => {
      let r = _L('你的太阳在','Your Sun is in ') + getSignNamePure(sunSi) + _L('——这是你此生需要成为的样子。月亮在',' — this is who you need to become in this lifetime. Your Moon is in ') + getSignNamePure(moonSi) + _L('——这是你来时的路，你灵魂的记忆。上升在',' — this is the path you came from, your soul\'s memory. Your Ascendant is in ') + getSignNamePure(degToSign(asc).si) + _L('——这是你与世界相遇的方式。',' — this is how you meet the world.');
      const ec = {火:0,土:0,风:0,水:0};
      for (const p of PLANETS) { const {si} = degToSign(positions[p.id]); ec[ELEMENTS[si]]++; }
      const domElem = Object.entries(ec).sort((a,b)=>b[1]-a[1])[0];
      const weakElem = Object.entries(ec).sort((a,b)=>b[1]-a[1])[3];
      const elemModes_ZH = {火:'行动和直觉',土:'实践和积累',风:'思考和连接',水:'感受和共情'};
      const elemModes_EN = {火:'action & intuition',土:'practice & accumulation',风:'thinking & connection',水:'feeling & empathy'};
      r += _L('你的星盘以','Your chart is dominated by the ') + domElem[0] + _L('元素为主导——你通过',' element — you understand the world through ') + (isEn ? elemModes_EN[domElem[0]] : elemModes_ZH[domElem[0]]) + _L('来理解世界。','.');
      if (weakElem[1] <= 1) r += _L('而你','And the scarcity of your ') + weakElem[0] + _L('元素的薄弱不是缺陷——恰恰相反，那是你此生要去完整的地方，是你最深刻的成长领域。',' element is not a flaw — on the contrary, it is the place you are here to make whole, your deepest area of growth.');
      return r;
    },
    health: () => {
      let r = _L('你的第6宫（健康与日常）和第12宫（潜意识与灵性）掌管着身心状态。','Your 6th House (health & daily routines) and 12th House (subconscious & spirituality) govern your mind-body state.');
      if (houses.Saturn === 6) r += _L('土星在日常健康宫——你需要建立规律的生活节奏。身体是你的"长期项目"，需要持续投入而非一时冲动。','Saturn in the 6th House — you need to establish a regular daily rhythm. Your body is a "long-term project" — it needs sustained investment, not impulsive bursts.');
      if (houses.Mars === 6) r += _L('火星在日常健康宫——你需要通过运动来释放能量。久坐不动或压抑行动力会让你的身体和情绪同时出问题。','Mars in the 6th House — you need physical activity to release energy. A sedentary lifestyle or suppressed drive will cause both your body and emotions to suffer.');
      if (houses.Neptune === 6) r += _L('海王星在日常健康宫——你对身体信号的感知可能比较模糊。学会定期检查、建立清晰的健康边界对你很重要。','Neptune in the 6th House — your perception of bodily signals may be somewhat unclear. Learning regular check-ups and establishing clear health boundaries is important for you.');
      r += _L('你的身心健康不在别处，在于每天的小选择——睡前一小时的放下手机、早晨十分钟的呼吸、对自己说一声"够了"。','Your well-being isn\'t somewhere else — it\'s in the small daily choices: putting down your phone an hour before bed, ten minutes of morning breathing, saying "enough" to yourself.');
      return r;
    }
  };
  const fn = insights[domain] || insights.self;
  return fn();
}

// ── Domain-specific transit analysis ────────────────────────────────────────
function getTransitDomainInsight(domain, positions, houses, asc) {
  const isEn = window._lang && window._lang() === 'en';
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const tn = calcAllPlanets(nowT);

  const transitMap = {
    love: () => {
      const vSi = degToSign(tn.Venus).si, marsSi = degToSign(tn.Mars).si;
      const venusStyles_ZH = ['热情主动','沉稳质感','灵动有趣','温柔深情','自信耀眼','细腻务实','优雅和谐','深刻神秘','自由洒脱','成熟稳重','独特个性','浪漫梦幻'];
      const venusStyles_EN = ['passionate & proactive','grounded & textured','witty & playful','gentle & deep','confident & radiant','refined & practical','graceful & harmonious','intense & mysterious','free-spirited & easygoing','mature & steady','uniquely individual','romantic & dreamy'];
      let r = _L('当前金星行经','Venus is currently transiting ') + getSignNamePure(vSi) + _L('——你此刻的吸引力风格偏向',' — your current magnetism leans toward ') + (isEn ? venusStyles_EN[vSi] : venusStyles_ZH[vSi]) + '。';
      for (const tid of ['Jupiter','Venus','Uranus']) {
        let diff = mod360(Math.abs(tn[tid] - positions.Venus));
        if (diff > 180) diff = 360 - diff;
        if (diff <= 6) {
          const tpName = PLANETS.find(x=>x.id===tid)?.name||tid;
          r += _L('⚡ ','⚡ ') + tpName + _L('正触及你的本命金星——这是感情领域的重要窗口期。',' is touching your natal Venus — this is an important window in your love life.');
          if (tid === 'Jupiter') r += _L('新的人、新的感情机会可能在此时出现。保持开放和真实。','New people and new romantic opportunities may appear now. Stay open and authentic.');
          if (tid === 'Uranus') r += _L('感情领域可能出现意料之外的变化——可能是突然的心动，也可能是现有关系的重组。','Unexpected changes may arise in your love life — a sudden spark, or a restructuring of an existing relationship.');
        }
      }
      return r;
    },
    career: () => {
      const jupSi = degToSign(tn.Jupiter).si, satSi = degToSign(tn.Saturn).si;
      let r = _L('木星当前在','Jupiter is currently in ') + getSignNamePure(jupSi) + _L('——事业发展的大方向受到此星座能量的加持。',' — the overall direction of your career is infused with this sign\'s energy.');
      r += _L('土星当前在','Saturn is currently in ') + getSignNamePure(satSi) + _L('——这是你事业上需要承担责任和耐心耕耘的领域。',' — this is the area of your career that requires responsibility and patient cultivation.');
      const jupH = Math.floor(mod360(tn.Jupiter - asc) / 30) + 1;
      r += _L('行运木星正穿过你第','Transiting Jupiter is moving through your ') + jupH + _L('宫——这个生活领域正处在扩张和机遇期。','th House — this life area is in a period of expansion and opportunity.');
      return r;
    },
    money: () => {
      const jupH = Math.floor(mod360(tn.Jupiter - asc) / 30) + 1;
      let r = _L('行运木星在你的第','Transiting Jupiter is in your ') + jupH + _L('宫——','th House — ');
      const jupWealth_ZH = ['新一轮个人成长将间接带动收入','正财运最佳窗口，收入模式可能升级','通过写作/沟通/教学创造财富','家庭/房产相关的财务机会','创意和投资运旺盛','工作收入稳定增长，适合谈加薪','合作和合伙带来的财务机会被放大','偏财/投资/被动收入的最佳时机','跨界/远方的财务机会浮现','事业突破带动收入跃升','人脉和社群转化为收入来源','幕后/灵性工作带来意外之财'];
      const jupWealth_EN = ['A new cycle of personal growth will indirectly boost income','Best window for earned income — your income model may level up','Creating wealth through writing, communication, or teaching','Financial opportunities related to home and property','Strong creative and investment luck','Steady growth in work income — a good time to negotiate a raise','Financial opportunities from collaboration and partnership are amplified','Best timing for side income, investments, and passive revenue','Cross-border and long-distance financial opportunities emerge','Career breakthroughs driving income leaps','Your network and community convert into income streams','Behind-the-scenes or spiritual work brings unexpected wealth'];
      r += (isEn ? jupWealth_EN[jupH-1] : jupWealth_ZH[jupH-1]) + '。';
      return r;
    },
    family: () => {
      const satH = Math.floor(mod360(tn.Saturn - asc) / 30) + 1;
      let r = _L('土星当前行经你的第','Saturn is currently transiting your ') + satH + _L('宫——家庭和情感根基领域正在经历成熟化的过程。','th House — the realm of home and emotional foundations is going through a maturation process.');
      if (satH === 4) r += _L('这是重新审视你与家人关系、或处理房产/居住问题的重要时期。你可能会感到额外的家庭责任——这不是负担，而是让你在"根"的层面变得更稳固。','This is an important period for re-examining your family relationships or dealing with property and housing matters. You may feel additional family responsibilities — this is not a burden, but an opportunity to become more solid at the "root" level.');
      return r;
    },
    self: () => {
      const jupSi = degToSign(tn.Jupiter).si;
      const jupInvite_ZH = ['勇敢行动','珍惜拥有','学习表达','深入情感','绽放自我','整理生活','建立连接','深度转化','扩展视野','脚踏实地','拥抱独特','信任直觉'];
      const jupInvite_EN = ['act bravely','cherish what you have','learn to express','go deep into feelings','blossom fully','organize your life','build connections','transform deeply','expand your horizons','stay grounded','embrace your uniqueness','trust your intuition'];
      let r = _L('木星在','Jupiter in ') + getSignNamePure(jupSi) + _L('的这一年，宇宙在邀请你',' this year — the universe invites you to ') + (isEn ? jupInvite_EN[jupSi] : jupInvite_ZH[jupSi]) + _L('。','.');
      r += _L('这是你人生故事的重要章节——不是高潮，就是转折。而你拥有书写它的笔。','This is an important chapter in your life story — if not a climax, then a turning point. And you hold the pen.');
      return r;
    }
  };
  const fn = transitMap[domain] || transitMap.self;
  return fn();
}

// ── Domain-specific tarot insight ───────────────────────────────────────────
function getTarotDomainInsight(card, domain) {
  const isEn = window._lang && window._lang() === 'en';
  const domainFields = {
    love: _cardT(card,'love'),
    career: _cardT(card,'career'),
    money: null,
    family: _cardT(card,'love'),
    self: _cardT(card,'advice'),
    health: _cardT(card,'advice'),
    social: _cardT(card,'love'),
    study: _cardT(card,'career')
  };
  const field = domainFields[domain] || _cardT(card,'advice');
  if (field) return field;

  if (_cardT(card,'up')) return _cardT(card,'up');
  return (isEn
    ? 'This card suggests you need to pay attention to the energy of ' + (card.en || card.name) + ' — ' + (_cardT(card,'up') || _cardT(card,'advice') || 'Let it guide you to your own answer.')
    : '这张牌的出现，暗示着你需要关注' + card.name + '所代表的能量——' + (_cardT(card,'up') || _cardT(card,'advice') || '让它引导你找到自己的答案。'));
}

// ── Synthesis engine ────────────────────────────────────────────────────────
function synthesizeConsultation(domain, question, natal, transit, tarot, positions, houses) {
  const isEn = window._lang && window._lang() === 'en';
  const sunSi = degToSign(positions.Sun).si;
  const moonSi = degToSign(positions.Moon).si;
  const sunSignNames_ZH = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];

  const synthesisMap = {
    love: (isEn
      ? 'Looking at your chart, current transits, and tarot guidance together: your Venus and Mars reveal your deepest patterns of longing in love, while the transits are opening new possibilities — or asking you to face what you\'ve been avoiding. The tarot card further confirms this direction. Your Sun in ' + getSignNamePure(sunSi) + ' gives you courage, while your Moon in ' + getSignNamePure(moonSi) + ' reminds you: on the journey of love, first learn to become your own home. Your question "' + question.substring(0, 20) + '..." — the answer isn\'t out there. It\'s in your chart, in your choices, and in how deep you\'re willing to go for yourself.'
      : '综合你的星盘配置、当前行运和塔罗指引来看：你的金星和火星揭示了你内心深处对爱的渴望模式，而行运的触发正在为你打开新的可能性——或者要求你直面一直回避的问题。塔罗的牌面进一步确认了这个方向。' + sunSignNames_ZH[sunSi] + '座的太阳给了你勇气，而' + getSignNamePure(moonSi) + '的月亮提醒你：在追求爱的过程中，先学会成为自己的归宿。你提出的"' + question.substring(0, 20) + '..."——这个问题的答案不在外面，在你的星盘里、在你的选择里、在你愿意为自己走多深里。'),
    career: (isEn
      ? 'Your Sun and Mars have illuminated your career direction, while transiting Jupiter and Saturn are pushing you into a new professional phase. The tarot card tells you: the most important thing right now isn\'t "what to do" but "in what state to do it." At the heart of your question "' + question.substring(0, 20) + '..." — your chart\'s career houses are calling for a deeper level of self-identification. When your work is no longer "making a living" but the path of "becoming yourself," the universe will make way.'
      : '你的太阳和火星为你点亮了事业的方向感，而行运木星和土星正在推动你进入新的事业阶段。塔罗的牌面告诉你，此刻最重要的不是"做什么"，而是"以什么状态去做"。问题"' + question.substring(0, 20) + '..."的核心是——你星盘的事业宫正在呼唤一种更深层的自我认同。当你的工作不再是"谋生"，而是"成为自己"的路径时，宇宙会为你让路。'),
    money: (isEn
      ? 'The positions of Venus and Jupiter reveal your wealth DNA — not how much you can earn, but how you relate to "value" itself. The transits are activating a sensitive period for your finances. The tarot reminds you: money is the flow of energy, not the endpoint of hoarding. For your question "' + question.substring(0, 20) + '..." — the answer is: first heal your relationship with "enough," and wealth will naturally find its way home.'
      : '金星和木星的位置揭示了你的财富DNA——不是你能赚多少，而是你如何与"价值"本身建立关系。行运正在激活你的财运敏感期。塔罗在提醒你：金钱是能量的流动，而非囤积的终点。对你提出的"' + question.substring(0, 20) + '..."，答案是——先疗愈你与"足够"的关系，财富自然会找到回家的路。'),
    family: (isEn
      ? 'The positions of the Moon and Saturn carry your family memories and emotional patterns. The current transits are loosening those deeply rooted old scripts — you don\'t have to repeat your parents\' story. The tarot card tells you: a true "home" isn\'t just a physical space — it\'s where you\'ve learned to be your authentic self in front of anyone. Your question "' + question.substring(0, 20) + '..." — the answer begins with acceptance.'
      : '月亮和土星的位置承载着你的家族记忆和情感模式。当前的行运正在松动那些根深蒂固的旧脚本——你不需要重复父母的剧本。塔罗的牌面告诉你，真正的"家"不只是一个物理空间，而是你学会了在任何人面前都做真实的自己。你的问题"' + question.substring(0, 20) + '..."——答案从接纳开始。'),
    self: (isEn
      ? 'Your Sun in ' + getSignNamePure(sunSi) + ' and Moon in ' + getSignNamePure(moonSi) + ' together write the duet of your soul — one is who you are becoming, the other is who you have been. The transits are pushing you into a new level of self-awareness. The tarot card did not appear by accident — it is a letter from your subconscious to your conscious mind. Your question "' + question.substring(0, 20) + '..." — the question itself is the beginning of the answer. Because you have paused long enough to ask it. Keep walking — with your chart as the map and your heart as the compass.'
      : '太阳' + getSignNamePure(sunSi) + '和月亮' + getSignNamePure(moonSi) + '共同书写了你灵魂的双重奏——一个是你要成为的，一个是你曾经是的。行运正在推动你进入新的自我认知层面。塔罗的出现不是偶然——它是你潜意识写给意识的一封信。你问的"' + question.substring(0, 20) + '..."——这个问题本身就是答案的开始。因为你已经停了足够久来问自己。继续走，带着你的星盘做地图，带着你的心做指南针。')
  };
  return synthesisMap[domain] || synthesisMap.self;
}

// ── Actionable advice ───────────────────────────────────────────────────────
function getActionableAdvice(domain, positions, houses, card, asc) {
  const isEn = window._lang && window._lang() === 'en';
  const now = new Date();
  const sunSi = degToSign(positions.Sun).si;
  const moonSi = degToSign(positions.Moon).si;
  const venusSi = degToSign(positions.Venus).si;
  const marsSi = degToSign(positions.Mars).si;
  const ascSi = degToSign(asc).si;
  const sunH = houses.Sun, moonH = houses.Moon, venusH = houses.Venus;
  const marsH = houses.Mars, satH = houses.Saturn, jupH = houses.Jupiter;

  const generators = {
    love: () => {
      let r = '';
      const venusNeed_ZH = ['一个能陪你冒险的人','让你感到安全和被珍视的人','一个能和你有智力共鸣的灵魂','让你感到被深深理解和保护的人','一个欣赏你独特性并能给你舞台的人','对生活品质有追求且值得信赖的人','一个优雅平衡、能与你对话的伴侣','让你感到灵魂契合的深度连接','一个给你空间又能与你一起探索世界的人','一个认真负责、能给你长久承诺的人','一个理解你的独特且不试图改变你的人','一个与你有精神共鸣和灵性连接的伴侣'];
      const venusNeed_EN = ['someone who can adventure with you','someone who makes you feel safe and cherished','a soul who can resonate with you intellectually','someone who makes you feel deeply understood and protected','someone who appreciates your uniqueness and gives you a stage','someone who values quality of life and is trustworthy','an elegant, balanced partner who can truly converse with you','a deep connection where you feel your souls fit together','someone who gives you space yet explores the world with you','someone serious and responsible who can give you long-term commitment','someone who understands your uniqueness without trying to change you','a partner with spiritual resonance and soul connection'];
      r += _L('① 你的金星在','① Your Venus is in ') + getSignNamePure(venusSi) + _L('第',' House ') + venusH + _L('宫——你真正需要的不是"完美的伴侣"，而是',' — what you truly need isn\'t a "perfect partner" but ') + (isEn ? venusNeed_EN[venusSi] : venusNeed_ZH[venusSi]) + _L('。','.');
      const marsTips_ZH = ['主动出击，表达你的热情','用行动而非语言来证明你的诚意','多聊天、多分享想法，智力上的火花很重要','创造安全感，让对方感受到你的情感深度','大胆展示你的魅力，发光的人自然被看到','用细致的关心和实际的付出来表达爱','保持优雅但也别怕袒露真实的自己','深度连接需要你放下控制欲，学会信任','给对方足够的自由，爱不是占有','用负责和认真的态度来对待感情','尊重彼此的独特性，关系是1+1>2','在关系中保持浪漫的幻想，但也要落地'];
      const marsTips_EN = ['Take initiative and express your passion','Prove your sincerity through actions, not just words','Chat more, share ideas — intellectual sparks matter','Create safety and let the other person feel your emotional depth','Boldly show your charm — people who shine are naturally seen','Express love through thoughtful care and practical actions','Stay graceful but don\'t be afraid to reveal your true self','Deep connection requires you to release control and learn to trust','Give the other person enough freedom — love is not possession','Approach relationships with responsibility and seriousness','Respect each other\'s uniqueness — a relationship is 1+1>2','Keep romantic dreams alive in the relationship, but stay grounded'];
      r += '<br>' + _L('② 火星在','② Your Mars is in ') + getSignNamePure(marsSi) + _L('第',' House ') + marsH + _L('宫——在关系中需要',' — in relationships, you need to ') + (isEn ? marsTips_EN[marsSi].toLowerCase() : marsTips_ZH[marsSi].toLowerCase()) + _L('。','.');
      const moonSoothe_ZH = ['行动而非空想来安抚自己','独处和深度情感连接来重新充电','和信任的人聊聊，理清思绪','给自己创造安静的空间，让感受自然流动'];
      const moonSoothe_EN = ['take action rather than overthink to soothe yourself','recharge through solitude and deep emotional connection','talk to someone you trust and sort through your thoughts','create quiet space for yourself and let feelings flow naturally'];
      const moonSoothe = isEn ? moonSoothe_EN[moonSi<=2?0:moonSi<=5?1:moonSi<=8?2:3] : moonSoothe_ZH[moonSi<=2?0:moonSi<=5?1:moonSi<=8?2:3];
      r += '<br>' + _L('③ 你的月亮在','③ Your Moon is in ') + getSignNamePure(moonSi) + _L('——当情绪波动时，你需要',' — when emotions fluctuate, you need to ') + moonSoothe + _L('。','.');
      r += '<br>' + _L('④ 牌面「','④ Card: "') + (isEn ? card.en : card.name) + _L('」的提示：','" says: ') + (_cardT(card,'love') || _cardT(card,'advice') || (isEn ? 'Trust your intuition — it knows more than you think' : '信任你的直觉，它比你以为的知道更多'));
      return r;
    },
    career: () => {
      let r = '';
      const sunFulfill_ZH = ['主动开拓、成为先锋','创造价值、建立安全感','学习新知、分享观点','营造温暖、守护重要的人','发光发热、获得认可','精进技能、把事情做完美','建立连接、促成合作','深度转化、处理复杂资源','探索未知、拓展边界','承担责任、获得成就','创新突破、引领潮流','灵性成长、服务他人'];
      const sunFulfill_EN = ['taking initiative and being a pioneer','creating value and building security','learning new things and sharing ideas','creating warmth and protecting what matters','shining bright and gaining recognition','refining your skills and perfecting your craft','building connections and facilitating collaboration','deep transformation and handling complex resources','exploring the unknown and expanding boundaries','taking responsibility and achieving milestones','innovating breakthroughs and leading trends','spiritual growth and serving others'];
      r += _L('① 太阳在','① Your Sun is in ') + getSignNamePure(sunSi) + _L('第',' House ') + sunH + _L('宫——你的核心成就感来自',' — your core fulfillment comes from ') + (isEn ? sunFulfill_EN[sunSi] : sunFulfill_ZH[sunSi]) + _L('。寻找一份能让你在这方面持续成长的工作，而不是一份"看起来不错"的工作。','. Find work that lets you grow in this area continuously — not just a job that "looks good."');
      const marsRhythm_ZH = ['快节奏、有挑战、需要立即行动的','需要专注、深度投入、能持续积累的','需要沟通、协调、建立连接的','需要深度思考、研究和内在洞察的'];
      const marsRhythm_EN = ['fast-paced, challenging, requiring immediate action','focused, deeply immersive, allowing sustained accumulation','requiring communication, coordination, and connection-building','requiring deep thinking, research, and inner insight'];
      const marsRhythm = isEn ? marsRhythm_EN[marsSi<=2?0:marsSi<=5?1:marsSi<=8?2:3] : marsRhythm_ZH[marsSi<=2?0:marsSi<=5?1:marsSi<=8?2:3];
      r += '<br>' + _L('② 火星在','② Your Mars is in ') + getSignNamePure(marsSi) + _L('第',' House ') + marsH + _L('宫——你最适合的工作节奏是',' — your ideal work rhythm is ') + marsRhythm + _L('。','.');
      if (satH === 10) r += '<br>' + _L('③ 土星在你的事业宫——你的事业成就会来，但需要时间。不急于一时的得失，每一段经历都是你事业大厦的一块砖石。','③ Saturn in your 10th House — your career achievements will come, but they need time. Don\'t rush the short-term wins and losses — every experience is a brick in the edifice of your career.');
      else if (satH === 6) r += '<br>' + _L('③ 土星在日常工作宫——把每天的工作做到极致，日常的积累比一时的灵感更可靠。','③ Saturn in your 6th House — do every day\'s work to the highest standard. Daily accumulation is more reliable than flashes of inspiration.');
      else if (satH === 2) r += '<br>' + _L('③ 土星在财帛宫——先建立你的"价值资本"：技能、作品、人脉。当你的价值扎实了，金钱和机会会自然跟上。','③ Saturn in your 2nd House — first build your "value capital": skills, portfolio, network. When your value is solid, money and opportunities will follow naturally.');
      else if (jupH === 10) r += '<br>' + _L('③ 木星在你的事业宫——你有"做大"的潜力。但木星也容易"铺得太开"——聚焦一个方向，做到极致再扩展。','③ Jupiter in your 10th House — you have the potential to "go big." But Jupiter can also spread too thin — focus on one direction, master it, then expand.');
      else r += '<br>' + _L('③ 你的职业成长不是线性的——允许自己尝试，每一次转向都是在靠近最适合你的位置。','③ Your career growth is not linear — allow yourself to experiment. Every turn brings you closer to where you belong.');
      r += '<br>' + _L('④ 牌面「','④ Card: "') + (isEn ? card.en : card.name) + _L('」的指引：','" guides: ') + (_cardT(card,'career') || _cardT(card,'advice') || (isEn ? 'Action beats perfectionism — take the first step' : '行动比完美主义更重要，先迈出一步'));
      return r;
    },
    money: () => {
      let r = '';
      const venusMoney_ZH = ['靠勇气和行动力创造价值','靠积累和品质感建立财富','靠信息和沟通能力变现','靠情感连接和直觉来吸引丰盛','靠个人魅力和创造力来创造收入','靠专业技能和精进细节来积累财富','靠合作和人脉来扩展财源','靠深度资源和转化能力来运作财富','靠跨界探索和新机会来增长财富','靠长期规划和责任心来稳步积累','靠创新和独特视角来开辟财路','靠直觉和灵感来吸引财富'];
      const venusMoney_EN = ['creating value through courage and action','building wealth through accumulation and quality','monetizing through information and communication skills','attracting abundance through emotional connection and intuition','generating income through personal charisma and creativity','accumulating wealth through professional skills and attention to detail','expanding financial streams through collaboration and network','operating wealth through deep resources and transformational ability','growing wealth through cross-disciplinary exploration and new opportunities','steadily accumulating through long-term planning and responsibility','opening financial paths through innovation and unique perspective','attracting wealth through intuition and inspiration'];
      r += _L('① 金星在','① Venus in ') + getSignNamePure(venusSi) + _L('——你吸引金钱的方式是',' — you attract money through ') + (isEn ? venusMoney_EN[venusSi] : venusMoney_ZH[venusSi]) + _L('。','.');
      if (jupH === 2) r += '<br>' + _L('② 木星在你的财帛宫——你的财运有天然扩张力，但需要学会"让钱流动"，而不是一味囤积。投资自己比投资任何产品都更可靠。','② Jupiter in your 2nd House — your wealth has natural expansive power, but you need to learn to "let money flow" rather than just hoard. Investing in yourself is more reliable than investing in any product.');
      else if (jupH === 8) r += '<br>' + _L('② 木星在偏财宫——副业、投资、合伙收益是你最强劲的财富引擎。学习理财知识，找到靠谱的合作伙伴。','② Jupiter in your 8th House — side businesses, investments, and partnership income are your strongest wealth engines. Learn financial literacy and find reliable partners.');
      else if (houses.Pluto === 8) r += '<br>' + _L('② 冥王星在偏财宫——你对金钱的观念会经历"死亡与重生"。每一次财富观的升级都在为你打开更大的丰盛之门。','② Pluto in your 8th House — your beliefs about money will experience "death and rebirth." Every upgrade in your wealth mindset opens a bigger door to abundance.');
      else r += '<br>' + _L('② 财富密码不在于"赚更多"，而在于找到那个让你愿意不计回报投入的方向——当价值和热情对齐，金钱会自然跟随。','② The wealth code isn\'t "earn more" — it\'s finding the direction you\'d pour yourself into even without reward. When value and passion align, money follows naturally.');
      r += '<br>' + _L('③ 本月行动：记录一周的每一笔支出，周末回看——哪些是滋养你的？哪些是填补空虚的？觉察是改变的第一步。','③ This month\'s action: track every expense for one week. At the weekend, review — which ones nourished you? Which ones were filling a void? Awareness is the first step of change.');
      r += '<br>' + _L('④ 牌面「','④ Card: "') + (isEn ? card.en : card.name) + _L('」的启示：','" reveals: ') + (_cardT(card,'advice') || (isEn ? 'Abundance is a mindset — first be grateful for what you have, and more will come' : '丰盛是一种心态，先感恩你已有的，更多的才会到来'));
      return r;
    },
    family: () => {
      let r = '';
      const moonPattern_ZH = ['独立自主、不依赖他人','以物质和安全感作为爱的语言','用沟通和理解来连接','深度共情、某种程度上承担了家人的情绪','需要被认可、被看见','通过照顾和付出来表达爱','追求家庭关系的和谐与公平','深刻的情感连接、同时也感知到家庭中的权力','需要自由、但也渴望归属感','对家人负责、可能承担了超出年龄的责任','在疏离中保持着深刻的连接','对家庭有超越世俗的灵性理解'];
      const moonPattern_EN = ['independence and self-reliance','using material security as a love language','connecting through communication and understanding','deep empathy — to some extent carrying the family\'s emotions','needing to be recognized and seen','expressing love through caregiving and service','seeking harmony and fairness in family relationships','deep emotional connection — while also perceiving family power dynamics','needing freedom, yet also longing for belonging','being responsible for family — possibly carrying burdens beyond your age','maintaining deep connection within distance','having a spiritual understanding of family that transcends the mundane'];
      r += _L('① 月亮在','① Your Moon is in ') + getSignNamePure(moonSi) + _L('——你从原生家庭中吸收的情感模式是',' — the emotional pattern you absorbed from your family of origin is ') + (isEn ? moonPattern_EN[moonSi] : moonPattern_ZH[moonSi]) + _L('。理解这一点，你就能看到哪些是你的，哪些是家人投射给你的。','. Understanding this, you can see what is truly yours and what was projected onto you by family.');
      if (houses.Saturn === 4) r += '<br>' + _L('② 土星在田宅宫——你需要重新定义"家"对你的意义。原生家庭的严肃氛围让你早熟，但成年后的你有能力创造属于自己的温暖空间。','② Saturn in the 4th House — you need to redefine what "home" means to you. The strict atmosphere of your original family made you mature early, but as an adult you have the power to create your own warm space.');
      else if (houses.Moon === 4) r += '<br>' + _L('② 月亮在田宅宫——家庭对你来说是最重要的情感根基。在感情和家庭事务中，信任你的直觉——它对家人的感知力比你想象中更准。','② Moon in the 4th House — family is your most important emotional foundation. In emotional and family matters, trust your intuition — it perceives family dynamics more accurately than you think.');
      else r += '<br>' + _L('② 无论原生家庭给了你什么，成年后的你都有能力重新选择——选择什么该传承，什么该到此为止。','② Whatever your family of origin gave you, as an adult you have the power to choose again — choose what to carry forward and what to let end here.');
      r += '<br>' + _L('③ 本周练习：注意在家人面前你"自动切换"成什么角色？那个角色是你真心想扮演的吗？觉察到的那一刻，你就有了选择。','③ This week\'s practice: notice what role you "automatically switch" into around family. Is that a role you truly want to play? The moment you notice it, you have a choice.');
      r += '<br>' + _L('④ 牌面「','④ Card: "') + (isEn ? card.en : card.name) + _L('」告诉你：','" tells you: ') + (_cardT(card,'love') || _cardT(card,'advice') || (isEn ? 'Forgiveness isn\'t letting others off the hook — it\'s letting yourself off' : '宽恕不是放过别人，是放过自己'));
      return r;
    },
    self: () => {
      let r = '';
      const sunBecome_ZH = ['勇敢的开拓者','踏实的建设者','智慧的传播者','情感的守护者','耀眼的创造者','精致的匠人','优雅的连接者','深度的转化者','自由的探索者','沉稳的成就者','独特的创新者','灵性的艺术家'];
      const sunBecome_EN = ['courageous pioneer','grounded builder','wise communicator','emotional guardian','radiant creator','refined artisan','graceful connector','deep transformer','free explorer','steady achiever','unique innovator','spiritual artist'];
      r += _L('① 太阳','① Sun in ') + getSignNamePure(sunSi) + _L('，上升',', Ascendant in ') + getSignNamePure(ascSi) + _L('——你此生要成为的人是',' — the person you are here to become is a ') + (isEn ? sunBecome_EN[sunSi] : sunBecome_ZH[sunSi]) + _L('，而世界首先看到你的是',' while the world first sees your ') + getSignNamePure(ascSi) + _L('的外在气质。当这两者开始对话而非冲突，你会感到前所未有的完整。',' outer presence. When these two begin to speak to each other rather than conflict, you will feel a wholeness you\'ve never known before.');
      const moonNavigate_ZH = ['去运动、去行动、去做一件有挑战的事','回家、独处、给自己温暖的食物和空间','找信任的人聊聊、写作、梳理你的思绪','安静坐着、冥想、听音乐、让感受自然流淌'];
      const moonNavigate_EN = ['go exercise, take action, do something challenging','go home, be alone, give yourself warm food and space','talk to someone you trust, write, sort through your thoughts','sit quietly, meditate, listen to music, let feelings flow naturally'];
      const moonNav = isEn ? moonNavigate_EN[moonSi<=2?0:moonSi<=5?1:moonSi<=8?2:3] : moonNavigate_ZH[moonSi<=2?0:moonSi<=5?1:moonSi<=8?2:3];
      r += '<br>' + _L('② 月亮在','② Your Moon is in ') + getSignNamePure(moonSi) + _L('——当你迷茫时，不要向外寻找答案。回到你的月亮——',' — when you feel lost, don\'t look outward for answers. Return to your Moon — ') + moonNav + _L('。你的月亮知道路。','. Your Moon knows the way.');
      r += '<br>' + _L('③ ','③ For the rest of ') + now.getFullYear() + _L('年剩下的时间——不必试图改变一切。选<strong>一个</strong>方向，在一个点上做到你能力范围内的极致。深度比广度更能带你到达想去的地方。',' — don\'t try to change everything. Choose <strong>one</strong> direction, and go as deep as you can in that single point. Depth, more than breadth, will take you where you want to go.');
      r += '<br>' + _L('④ 牌面「','④ Card: "') + (isEn ? card.en : card.name) + _L('」的低语：','" whispers: ') + (_cardT(card,'advice') || (isEn ? 'Your confusion isn\'t because you\'re on the wrong path — it\'s because you\'ve finally started asking yourself the truly important questions' : '你的迷茫不是因为走错了路，而是因为你终于开始问自己真正重要的问题'));
      return r;
    }
  };

  const fn = generators[domain] || generators.self;
  return fn();
}


