// ═══════════════════════════════════════════════════════════════════════════
//  LunarVeilAstro i18n — Phase 1: UI Chrome
//  Flat key-value dictionary, domain-prefixed keys, O(1) lookup
// ═══════════════════════════════════════════════════════════════════════════
(function() {
  var DICT = {
    zh: {}, en: {}
  };

  // ── Shorthand: fill both ────────────────────────────────────────────────
  function add(key, zh, en) { DICT.zh[key] = zh; DICT.en[key] = en; }

  // ══════════════════════════════════════════════════════════════════════════
  //  META / HTML
  // ══════════════════════════════════════════════════════════════════════════
  add('html.lang', 'zh-CN', 'en');
  add('meta.title', 'LunarVeilAstro · 星盘解读 | 本命盘 · 运势预测 · 合盘分析', 'LunarVeilAstro · Birth Chart | Forecast · Synastry · Tarot');
  add('meta.description', 'LunarVeilAstro 免费在线星盘解读，提供本命星盘分析、五年运势预测、合盘缘分解读、塔罗占卜、职业天赋诊断。输入出生信息即可获取专属星盘报告。', 'Free online astrology readings: natal chart analysis, 5-year forecast, synastry, tarot, career genius. Enter your birth data for a personalized report.');
  add('meta.keywords', 'LunarVeilAstro,星盘解读,本命星盘,运势预测,合盘分析,塔罗占卜,星座,星盘,占星,命运之轮,在线星盘', 'LunarVeilAstro,astrology,birth chart,natal chart,forecast,synastry,tarot,zodiac,horoscope,online astrology');
  add('meta.ogTitle', 'LunarVeilAstro · 星盘解读', 'LunarVeilAstro · Astrology Reading');
  add('meta.ogDescription', '免费在线星盘解读，本命盘·运势预测·合盘分析·塔罗占卜，输入出生信息即可获取专属星盘报告。', 'Free online astrology: natal chart, forecast, synastry, tarot. Enter birth data for your personalized report.');

  // ══════════════════════════════════════════════════════════════════════════
  //  HEADER / BRANDING
  // ══════════════════════════════════════════════════════════════════════════
  add('header.tagline', '星盘解读 · 命运之轮', 'Chart Reading · Wheel of Fortune');
  add('header.subtitle', '· 本命星盘 · 运势预测 · 合盘分析 ·', '· Natal Chart · Forecast · Synastry ·');
  add('header.title', 'LunarVeilAstro', 'LunarVeilAstro');

  // ══════════════════════════════════════════════════════════════════════════
  //  TABS
  // ══════════════════════════════════════════════════════════════════════════
  add('tab.natal', '本命星盘', 'Natal Chart');
  add('tab.forecast', '五年运势', '5-Year Forecast');
  add('tab.synastry', '合盘缘分', 'Synastry');
  add('tab.guidance', '星盘指引', 'Guidance');
  add('tab.tarot', '塔罗占卜', 'Tarot');
  add('tab.career', '职业天赋', 'Career Genius');
  add('tab.relationship', '人际缘分', 'Relationships');
  add('tab.consult', '深度咨询', 'Consultation');
  add('tab.about', '关于', 'About');

  // ══════════════════════════════════════════════════════════════════════════
  //  BUTTONS
  // ══════════════════════════════════════════════════════════════════════════
  add('btn.calculate', '✦  解 读 星 盘  ✦', '✦  Read My Chart  ✦');
  add('btn.pdf', '📥 下载PDF报告', '📥 Download PDF Report');
  add('btn.email', '📧 发送报告至邮箱', '📧 Email Report');
  add('btn.copyMobile', '📱 复制手机版', '📱 Copy Mobile Version');
  add('btn.geocode', '🔍 定位', '🔍 Locate');
  add('btn.expandReport', '✨ 展开完整解读', '✨ Expand Full Reading');
  add('btn.backToEdit', '↩ 返回修改生日信息', '↩ Back to Edit Birth Info');
  add('btn.viewChartData', '📊 查看星盘数据', '📊 View Chart Data');
  add('btn.hideChartData', '📊 收起星盘数据', '📊 Hide Chart Data');

  // ══════════════════════════════════════════════════════════════════════════
  //  FORM LABELS
  // ══════════════════════════════════════════════════════════════════════════
  add('label.birthdate', '出生日期', 'Birth Date');
  add('label.birthtime', '出生时间', 'Birth Time');
  add('hint.datePicker', '💡 点击日期框左上角年份可快速切换年份', '💡 Tap the year at top-left to jump decades');
  add('hint.birthtime', '💡 记得就填，不记得也没关系，<strong class="time-gold">12:00</strong>就够了。行星照样准，只有上升和宫位是估算的。', '💡 Know it? Enter it. Forgot? No worries — <strong class="time-gold">12:00</strong> works fine. Planets are still spot on; only the ASC and houses are approximate.');
  add('hint.swipeTabs', '← 左右滑动标签栏，可切换查看个人星盘、运势等更多解读 →', '← Swipe the tab bar to view your personal chart, fortune & more →');
  add('hint.scrollLodge', '如模块显示不全，上下滑动页面即可完整加载', 'If items don\'t fully display, scroll up & down to reload');
  add('label.timezone', '时区 (UTC)', 'Timezone (UTC)');
  add('label.birthplace', '出生地点 (城市/地址)', 'Birthplace (City/Address)');
  add('label.job', '当前职业/现状（可选，用于职业天赋诊断）', 'Current Job (optional, for Career Genius)');
  add('label.email', '电子邮箱（可选，用于接收PDF报告）', 'Email (optional, for PDF report)');
  add('label.latitude', '纬度', 'Latitude');
  add('label.longitude', '经度', 'Longitude');
  add('label.manualCoords', '📍 手动输入经纬度 ▼', '📍 Enter coords manually ▼');

  // ══════════════════════════════════════════════════════════════════════════
  //  FORM PLACEHOLDERS
  // ══════════════════════════════════════════════════════════════════════════
  add('placeholder.birthplace', '如：北京、上海、纽约...', 'e.g. New York, London, Tokyo...');
  add('placeholder.job', '如：办公室文员、全职妈妈、大学生、自由职业...', 'e.g. office worker, student, freelancer...');
  add('placeholder.email', 'your@email.com', 'your@email.com');
  add('placeholder.lat', '如 38.466', 'e.g. 40.7128');
  add('placeholder.lng', '如 106.267', 'e.g. -74.0060');

  // ══════════════════════════════════════════════════════════════════════════
  //  PERSON SECTION
  // ══════════════════════════════════════════════════════════════════════════
  add('person.me', '本人', 'You');
  add('person.partner', '合盘对方', 'Partner');
  add('person.optional', '（选填，测感情·测默契·测合作，仅合盘需要）', '(optional — love · friendship · partnership, synastry only)');
  add('person.cpTagline', '（也可以测测你<span style="font-family:var(--font-heading);font-weight:700;font-size:1.2em;letter-spacing:0.08em;margin:0 1px;">cp</span>有多真，匹配度高说明两人天生一对，匹配度低证明真爱就是偏要强求）', '(Want to test how real your <span style="font-family:var(--font-heading);font-weight:700;font-size:1.2em;letter-spacing:0.08em;margin:0 1px;">CP</span> is? High compatibility = made for each other. Low compatibility = true love fights against all odds.)');
  add('person.expand', '▶ 合盘对方', '▶ Add Partner');
  add('person.collapse', '收起合盘对方', 'Remove Partner');

  // ══════════════════════════════════════════════════════════════════════════
  //  GEO STATUS
  // ══════════════════════════════════════════════════════════════════════════
  add('geo.placeholder', '请先输入城市名或地址', 'Enter a city or address first');
  add('geo.loading', '⏳ 正在查询坐标...', '⏳ Looking up coordinates...');
  add('geo.fail', '⚠️ 查询失败，请在下方手动输入经纬度', '⚠️ Location not found. Please enter coordinates manually below.');
  add('geo.success', '✅', '✅');
  add('geo.enterCity', '请输入城市名或地址', 'Please enter a city name or address');

  // ══════════════════════════════════════════════════════════════════════════
  //  SAMPLE NOTICE / INPUT SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  add('sample.notice', '⚠️ 当前显示为随机示例数据，请修改为你本人的真实出生信息', '⚠️ Showing sample data. Please enter your real birth information.');
  add('sample.tag', '示例数据', 'SAMPLE');
  add('remembered.notice', '🌙 已记住你上次填写的出生信息，可直接解读；换人算盘请修改。信息只存在本设备浏览器，不会上传服务器。', '🌙 Your last birth info is remembered on this device — read it directly, or edit for someone else. Stored only in this browser, never uploaded.');
  add('remembered.clear', '清除记录', 'Clear');
  add('btn.random', '🎲 随机', '🎲 Random');
  add('summary.clickToEdit', '点击展开修改', 'Click to edit');
  add('summary.title', '📡 输入出生信息', '📡 Enter Birth Information');

  // ══════════════════════════════════════════════════════════════════════════
  //  LODGE (灵性驿站)
  // ══════════════════════════════════════════════════════════════════════════
  add('lodge.title', '🔮 灵 性 驿 站', '🔮 Spiritual Lodge');
  add('lodge.intro', '无需填写星盘，打开即玩 · 每天回来都有新的启示', 'No chart needed — open and play · New insights every day');
  add('lodge.bannerTitle', '福运方位 · 罗盘指路', 'Fortune Compass · Find Your Direction');
  add('lodge.bannerDesc', '择一领域，罗盘指路 · 已算星盘者基于本命盘加权计算', 'Pick a domain · linked to your birth chart for personalized results');
  add('lodge.answerBook', '答案之书', 'Book of Answers');
  add('lodge.answerBookDesc', '默念问题，翻开一页寻找答案', 'Ask a question, turn the page for your answer');
  add('lodge.magic8', '魔法八球', 'Magic 8-Ball');
  add('lodge.magic8Desc', '问一个是/否问题，让命运回答', 'Ask a yes/no question, let fate decide');
  add('lodge.tarot', '单张塔罗', 'Single Tarot');
  add('lodge.tarotDesc', '抽一张牌，获得今日指引', 'Draw one card for today\'s guidance');
  add('lodge.zodiacMatch', '星座速配', 'Zodiac Match');
  add('lodge.zodiacMatchDesc', '测测你和TA的星座缘分', 'Check your zodiac compatibility');
  add('lodge.dailyFortune', '每日一签', 'Daily Fortune');
  add('lodge.dailyFortuneDesc', '摇一支签，已算星盘者得专属解读', 'Draw a slip — chart users get personalized reading');
  add('lodge.dailyRP', '今日人品', 'Daily RP');
  add('lodge.dailyRPDesc', '已算星盘者基于本命盘专属计算', 'Personalized luck score based on your chart');
  add('lodge.badge.available', '今日可探', 'Available Today');
  add('lodge.badge.usedUp', '今日已用完', 'Used Up Today');
  add('lodge.badge.remaining', '今日剩余', 'Left Today');
  add('lodge.badge.available.short', '今日可抽', 'Available');
  add('lodge.badge.drawn', '今日已抽', 'Drawn Today');
  add('lodge.badge.extra', '还可抽', 'More');
  add('lodge.badge.rpAvailable', '今日可查', 'Available');
  add('lodge.chartHint', '✨ 福运方位、每日一签、今日人品会结合你的星盘给出专属结果<br>先算星盘，解读更准', '✨ Fortune Direction, Daily Fortune & Daily RP sync with your birth chart<br>— get your chart calculated first for personalized results');
  add('lodge.chartHintLinked', '✨ 已关联你的星盘<br>以下福运方位、每日一签、今日人品将基于你的本命盘给出专属解读', '✨ Linked to your birth chart<br>— Fortune Direction, Daily Fortune & Daily RP are now personalized to you');

  // ══════════════════════════════════════════════════════════════════════════
  //  FORTUNE SUB-TABS
  // ══════════════════════════════════════════════════════════════════════════
  add('fortune.weekly', '本周运势', 'This Week');
  add('fortune.monthly', '本月运势', 'This Month');
  add('fortune.yearly', '今年运势', 'This Year');
  add('fortune.fiveyear', '五年运势', '5-Year Forecast');

  // ══════════════════════════════════════════════════════════════════════════
  //  TAROT UI
  // ══════════════════════════════════════════════════════════════════════════
  add('tarot.draw', '🔮 抽牌', '🔮 Draw Cards');
  add('tarot.redraw', '🔄 重新抽牌', '🔄 Draw Again');
  add('tarot.oneCard', '单张牌 · 快速指引', 'Single Card · Quick Guidance');
  add('tarot.threeCard', '三张牌 · 过去现在未来', 'Three Cards · Past Present Future');
  add('tarot.posPast', '过去的影响', 'Past Influence');
  add('tarot.posPresent', '当下的状态', 'Present State');
  add('tarot.posFuture', '未来的趋势', 'Future Trend');
  add('tarot.posMessage', '宇宙的讯息', 'Message from the Universe');
  add('tarot.clickToFlip', '点击卡牌将其翻开，揭示宇宙的讯息 ✨', 'Click a card to reveal the message of the universe ✨');
  add('tarot.meditate', '在心中默念你的问题', 'Hold your question in your mind');
  add('tarot.thenDraw', '然后点击上方「🔮 抽牌」按钮', 'Then click 「🔮 Draw Cards」 above');
  add('tarot.reversed', '逆位', 'Reversed');
  add('tarot.cardHint', '这张牌是今天给你的指引。记住：牌面不是预言，是你内心的回声。', 'This card is your guidance for today. Remember: the card is not a prophecy — it is the echo of your own heart.');
  add('tarot.interpretation', '✦ 解读：', '✦ Reading: ');
  add('tarot.defaultQuestion', '宇宙给你的信息', 'Message from the Universe');

  // ── TAROT MODE TOGGLE ──
  add('tarot.mode.personal', '个人塔罗', 'Personal Tarot');
  add('tarot.mode.synastry', '合盘塔罗', 'Synastry Tarot');

  // ── TAROT SYNASTRY SPREADS ──
  add('tarot.spread.synastryThree', '时间之箭 · 过去现在未来', 'Arrow of Time · PPF');
  add('tarot.spread.synastryFive', '关系十字', 'Relationship Cross');
  add('tarot.spread.synastrySeven', '维纳斯之爱', 'Venus Love Spread');

  // ── TAROT CTA ──
  add('tarot.cta.singleTitle', '解锁个人深度解读', 'Unlock In-Depth Tarot Reading');
  add('tarot.cta.singleDesc', '以上为牌面自动解读。每个人的星盘都是独一无二的宇宙地图——如需结合你的完整星盘+塔罗的精细化深度分析，请联系占星师一对一咨询。', 'The above is an automated card interpretation. Every birth chart is a unique cosmic map — for a personalized deep analysis combining your full chart with tarot, contact our astrologer for a one-on-one consultation.');
  add('tarot.cta.synastryTitle', '解锁合盘深度解读', 'Unlock In-Depth Synastry Reading');
  add('tarot.cta.synastryDesc', '以上为牌面自动解读。每段关系都独一无二——如需结合双方完整星盘+塔罗的精细化深度分析，请联系占星师一对一咨询。', 'The above is an automated card interpretation. Every relationship is unique — for a personalized deep analysis combining both birth charts with tarot, contact our astrologer for a one-on-one consultation.');

  // ══════════════════════════════════════════════════════════════════════════
  //  ERROR / VALIDATION MESSAGES
  // ══════════════════════════════════════════════════════════════════════════
  add('error.calculate', '计算出错：', 'Calculation error: ');
  add('error.render', '渲染错误：', 'Render error: ');
  add('error.consult', '解读出错：', 'Reading error: ');
  add('error.copyFailed', '复制失败，请重试', 'Copy failed, please try again');
  add('error.fillInfo', '请完整填写本人的出生信息', 'Please complete your birth information');
  add('error.fillChart', '请先生成星盘解读报告', 'Please generate your chart reading first');
  add('error.fillEmail', '请先在"电子邮箱"栏填写您的邮箱地址', 'Please enter your email address in the email field first');
  add('error.fillQuestion', '请输入你的问题', 'Please enter your question');
  add('error.noPartner', '请在"对方"区域填写第二个人的出生信息，然后点击"解读星盘"查看合盘分析。', 'Please fill in your partner\'s birth info in the "Partner" section, then click "Read My Chart" for synastry analysis.');
  add('error.noData', '请先填写出生信息并点击"解读星盘"', 'Please fill in your birth info and click "Read My Chart" first');

  // ══════════════════════════════════════════════════════════════════════════
  //  SOCIAL / FOOTER
  // ══════════════════════════════════════════════════════════════════════════
  add('footer.disclaimer1', '星辰不为任何人改写轨迹，星盘也从不替你掌舵。', 'The stars rewrite their course for no one, and the chart never steers your ship.');
  add('footer.disclaimer2', '它只是一面古老的镜子，映照你来时路上未曾看清的光与影。', 'It is merely an ancient mirror, reflecting the light and shadow you missed along the way.');
  add('footer.disclaimer3', '你看见的每一缕启示，皆为内心的回声；你做出的每一个选择，才是命运的笔锋。', 'Every revelation you see is an echo from within; every choice you make is the true pen of destiny.');
  add('footer.disclaimer4', '本页面的所有解读，仅供自我觉察与灵性探索之参考。', 'All readings on this site are for self-reflection and spiritual exploration only.');
  add('social.wechat', '微信', 'WeChat');
  add('social.qq', 'QQ', 'QQ');
  add('social.xiaohongshu', '小红书', 'Xiaohongshu');
  add('social.douyin', '抖音', 'Douyin');
  add('social.copy', '点击复制', 'Copy');
  add('social.follow', '点击关注', 'Follow');
  add('social.email', '邮箱', 'Email');
  add('social.emailHint', '点击发邮件', 'Click to email');
  add('social.copied', '✓ 已复制', '✓ Copied');

  // ══════════════════════════════════════════════════════════════════════════
  //  ABOUT PAGE — 品牌故事
  // ══════════════════════════════════════════════════════════════════════════
  add('about.heading', '关于 LunarVeilAstro', 'About LunarVeilAstro');
  add('about.p1', '我是 LunarVeil。', "I'm LunarVeil.");
  add('about.p2', '我搭这套系统的时候，第一个受益的人是我自己。', 'I built this system because I needed it myself.');
  add('about.p3', '我在自己的星盘里看到了我为什么习惯把情绪咽下去、我为什么坚持得比别人久、我为什么缺的那口气恰好推着我每天跟世界说话。我第一次觉得——原来我不是"有问题"，我是还未读懂自己的底色。', 'In my own birth chart, I saw why I swallow my emotions instead of speaking them, why I persist long after others give up, why the element I lack is the very thing pushing me to show up and talk to the world every day. For the first time, I understood — I wasn\'t broken. I just hadn\'t learned to read my own foundation.');
  add('about.p4', '所以我把它做出来了。然后我想把它分享给每一个还在用别人的尺子量自己的人。', 'So I built it. And now I want to share it with anyone still measuring themselves by someone else\'s ruler.');
  add('about.p5', '很多人一生都在不了解自己的情况下生活。做着自己不喜欢的事，却告诉自己"忍忍就过去了"。对自己说的话，比对讨厌自己的人更过分——但从来没有意识到自己在这么做。因为没有人给过她一面镜子。', 'So many of us go through life without truly knowing ourselves. We do things we don\'t love and tell ourselves to just push through. We say things to ourselves that we\'d never say to someone we dislike — and we never even notice. Because no one ever handed us a mirror.');
  add('about.p6', '星盘不是答案，不是命运，不是绝对。它是你出生那一刻的行星位置——你的底色。告诉你你生来带着什么底色、哪些是你与生俱来的、哪些是需要你来书就的。', 'A birth chart is not an answer, not a fate, not an absolute. It\'s the position of the planets at the exact moment you were born — your foundation. It tells you what you were born with, what\'s always been yours, and what\'s yours to create.');
  add('about.p7', '知道了，你才可以更好地整装出发。', 'When you truly know yourself, you\'re ready to begin again.');
  add('about.closing', '—— LunarVeil', '— LunarVeil');
  add('social.cta', '✦ 加微信解锁深度解读 ✦', '✦ Add WeChat for In-Depth Reading ✦');
  add('social.copyManual', '号：\n请手动复制', 'ID:\nPlease copy manually');

  // ══════════════════════════════════════════════════════════════════════════
  //  LOCKED CONTENT BLOCKS
  // ══════════════════════════════════════════════════════════════════════════
  add('locked.unlockCareer', '解锁完整职业转型行动方案', 'Unlock Full Career Transition Plan');
  add('locked.unlockRel', '解锁深度缘分分析', 'Unlock Deep Relationship Analysis');
  add('locked.unlockYearly', '解锁专属年度运势报告', 'Unlock Your Yearly Forecast Report');
  add('locked.unlockConsult', '预约深度咨询', 'Book In-Depth Consultation');

  // ══════════════════════════════════════════════════════════════════════════
  //  RITUAL LOADING PHRASES
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['ritual.phrases'] = [
    '星辰正在排列...', '星光穿越千年抵达...', '宇宙正为你调谐频率...',
    '命运之轮开始转动...', '你的星图正在展开...', '行星的低语穿越苍穹...',
    '灵魂的蓝图正在显影...', '古老的智慧正在苏醒...', '苍穹之下，万物有灵...',
    '你的故事即将浮现...'
  ];
  DICT.en['ritual.phrases'] = [
    'The stars are aligning...', 'Starlight travels across millennia...', 'The cosmos tunes its frequency for you...',
    'The Wheel of Fortune begins to turn...', 'Your star map is unfolding...', 'Planetary whispers cross the sky...',
    'The blueprint of your soul is developing...', 'Ancient wisdom is awakening...', 'All things under heaven are alive...',
    'Your story is about to emerge...'
  ];
  DICT.zh['ritual.final'] = '命运之轮已就位...';
  DICT.en['ritual.final'] = 'The Wheel of Fortune is in place...';

  // ══════════════════════════════════════════════════════════════════════════
  //  EMAIL / REPORT
  // ══════════════════════════════════════════════════════════════════════════
  add('email.subject', '您的星盘解读报告', 'Your Astrology Reading Report');
  add('email.sentPrefix', '报告已发送至 ', 'Report sent to ');
  add('email.checkSpam', '，请查收（如未收到请检查垃圾邮件箱）', '. Please check your inbox (and spam folder if not received).');
  add('email.openClient', '📧 点击此处打开邮件客户端发送报告', '📧 Click here to open your email client and send the report');
  add('email.copyMobileSuccess', '✓ 手机版报告已复制到剪贴板，直接粘贴到微信/QQ即可', '✓ Mobile report copied to clipboard. Paste directly into messaging apps.');
  add('email.copyFailed', '复制失败，请重试', 'Copy failed. Please try again.');
  add('email.noEmail', '请在下方填写邮箱后再发送', 'Please enter your email address below first.');

  // ══════════════════════════════════════════════════════════════════════════
  //  SHARE
  // ══════════════════════════════════════════════════════════════════════════
  add('share.title', '命运之轮 · 星盘解读', 'Wheel of Fortune · Astrology Reading');
  add('share.text', '刚刚在命运之轮抽了一支签，你也来试试吧！每日星盘运势 + 塔罗占卜，免费解读你的出生星盘。', 'I just drew a fortune at Wheel of Fortune — try it yourself! Daily horoscope + tarot, free birth chart reading.');
  add('share.linkCopied', '链接已复制！分享给朋友，即可获得额外次数', 'Link copied! Share with friends to get extra draws.');
  add('share.button', '📤 分享得次数', '📤 Share for Extra');

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPASS
  // ══════════════════════════════════════════════════════════════════════════
  add('compass.title', '🧭 福运方位 · 罗盘指路', '🧭 Fortune Compass');
  add('compass.prompt', '择一领域，罗盘为你指路', 'Pick a domain, let the compass guide you');
  add('compass.basedOnChart', '✦ 基于你的星盘加权计算', '✦ Weighted by your birth chart');
  add('compass.today', '◎ 今日', '◎ Today');
  add('compass.upcoming', '◎ 近期', '◎ Upcoming');
  DICT.zh['compass.categories'] = ['求财位','贵人位','桃花位','文昌位'];
  DICT.en['compass.categories'] = ['Wealth','Career','Love','Creativity'];
  DICT.zh['compass.subs'] = ['意外收获与副业','换工作与遇贵人','偶遇与旧识重逢','考试与灵感创作'];
  DICT.en['compass.subs'] = ['Windfalls & Side Income','Career Change & Mentors','Encounters & Reunions','Exams & Inspiration'];

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME MODALS — Answer Book
  // ══════════════════════════════════════════════════════════════════════════
  add('book.title', '📖 答案之书', '📖 Book of Answers');
  add('book.prompt', '在心里默念你的问题，然后翻开书页', 'Hold your question in mind, then turn the page');
  add('book.hint', '点击书页翻开答案', 'Click the page to reveal your answer');
  add('book.flipping', '哗啦啦...', 'Rustling...');

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME MODALS — Magic 8-Ball
  // ══════════════════════════════════════════════════════════════════════════
  add('magic8.title', '🔮 魔法八球', '🔮 Magic 8-Ball');
  add('magic8.prompt', '在心里想一个是/否问题', 'Think of a yes/no question');
  add('magic8.hint', '点击水晶球，震动命运的答案', 'Shake the crystal ball for your answer');
  add('magic8.placeholder', '...', '...');

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME MODALS — Single Tarot
  // ══════════════════════════════════════════════════════════════════════════
  add('singletarot.title', '🃏 单张塔罗', '🃏 Single Tarot');
  add('singletarot.prompt', '深呼吸，选一张属于你的牌', 'Take a deep breath, choose your card');
  add('singletarot.drawAgain', '🔄 再抽一张', '🔄 Draw Another');

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME MODALS — Zodiac Match
  // ══════════════════════════════════════════════════════════════════════════
  add('zodiac.title', '💫 星座速配', '💫 Zodiac Match');
  add('zodiac.prompt', '选择两个星座，看看缘分指数', 'Choose two signs to check compatibility');
  add('zodiac.calculate', '✨ 测算缘分', '✨ Check Match');

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME MODALS — Daily Fortune Slip
  // ══════════════════════════════════════════════════════════════════════════
  add('fortune.drawHint', '点击签筒摇签', 'Click the fortune cylinder to draw');

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME MODALS — Daily RP
  // ══════════════════════════════════════════════════════════════════════════
  add('rp.title', '人品值', 'RP Score');
  add('rp.checkedToday', '你今天已经查过啦', 'You\'ve already checked today');
  add('rp.basedOnChart', '✦ 基于你的', '✦ Based on your');
  add('rp.chartBased', '本命星盘专属计算', 'natal chart');
  add('rp.luckyNum', '🍀 幸运数字：', '🍀 Lucky Number: ');
  add('rp.luckyColor', '🎨 幸运色：', '🎨 Lucky Color: ');
  add('rp.luckyDir', '🧭 幸运方位：', '🧭 Lucky Direction: ');
  add('rp.comprehensive', '综合运势', 'Overall Luck');

  // ══════════════════════════════════════════════════════════════════════════
  //  CONSULTATION TAB
  // ══════════════════════════════════════════════════════════════════════════
  add('consult.title', '🔮 深度星盘咨询', '🔮 In-Depth Chart Consultation');
  add('consult.intro1', '你想问感情、事业、财富、还是人生方向？', 'Ask about love, career, wealth, or life direction?');
  add('consult.intro2', '结合你的出生星盘 + 当前行运 + 塔罗指引', 'Combining your birth chart + current transits + tarot guidance');
  add('consult.intro3', '一对一多维度深度解读，基于你的完整星盘', 'One-on-one multi-dimensional reading based on your full chart');
  add('consult.tip', '💡 建议先在本站生成星盘数据，再加好友发送截图\n可大幅提升解读效率', '💡 Generate your chart data here first, then send a screenshot\nThis greatly improves reading efficiency');
  add('consult.submit', '✦ 开始深度解读', '✦ Begin Reading');
  add('consult.loading', '✦ 解读中...', '✦ Reading...');
  add('consult.askAgain', '✦ 再次提问', '✦ Ask Again');
  add('consult.lockedDesc', '加微信发送你的出生信息和想问的问题<br>24小时内回复，每次解读约6000-10000字<br><span style="font-size:0.85em;color:#8a8aaa;">📕 小红书 · 🎵 抖音 LunarVeilAstro 每日推送运势，不提供私信解读</span>', 'Add WeChat with your birth info and questions<br>Reply within 24h, ~6000-10000 words per reading<br><span style="font-size:0.85em;color:#8a8aaa;">📕 Xiaohongshu · 🎵 Douyin LunarVeilAstro — daily posts, no DM readings</span>');

  // ══════════════════════════════════════════════════════════════════════════
  //  BACK TO TOP
  // ══════════════════════════════════════════════════════════════════════════
  add('backToTop', '回到顶部', 'Back to Top');

  // ══════════════════════════════════════════════════════════════════════════
  //  TIMEZONE CITY NAMES
  // ══════════════════════════════════════════════════════════════════════════
  add('tz.hawaii', '夏威夷', 'Hawaii');
  add('tz.losAngeles', '洛杉矶', 'Los Angeles');
  add('tz.denver', '丹佛', 'Denver');
  add('tz.mexico', '墨西哥城', 'Mexico City');
  add('tz.newyork', '纽约', 'New York');
  add('tz.brazil', '巴西', 'Brazil');
  add('tz.london', '伦敦', 'London');
  add('tz.paris', '巴黎', 'Paris');
  add('tz.moscow', '莫斯科', 'Moscow');
  add('tz.dubai', '迪拜', 'Dubai');
  add('tz.india', '印度', 'India');
  add('tz.bangkok', '曼谷', 'Bangkok');
  add('tz.beijing', '北京', 'Beijing');
  add('tz.tokyo', '东京', 'Tokyo');
  add('tz.sydney', '悉尼', 'Sydney');
  add('tz.auckland', '奥克兰', 'Auckland');

  // ══════════════════════════════════════════════════════════════════════════
  //  HOUSE NAMES
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['house'] = ['','命宫','财帛宫','兄弟宫','田宅宫','子女宫','奴仆宫','夫妻宫','疾厄宫','迁移宫','官禄宫','福德宫','玄秘宫'];
  DICT.en['house'] = ['','1st: Self','2nd: Wealth','3rd: Siblings','4th: Home','5th: Children','6th: Health','7th: Marriage','8th: Transformation','9th: Travel','10th: Career','11th: Community','12th: Spirituality'];
  add('house.fallback', '第', 'H');

  // ══════════════════════════════════════════════════════════════════════════
  //  PLANETS (UI labels — not interpretation content)
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['planets'] = ['','太阳☀️','月亮☽','水星☿','金星♀','火星♂','木星♃','土星♄','天王星♅','海王星♆','冥王星♇'];
  DICT.en['planets'] = ['','Sun ☀️','Moon ☽','Mercury ☿','Venus ♀','Mars ♂','Jupiter ♃','Saturn ♄','Uranus ♅','Neptune ♆','Pluto ♇'];

  // ══════════════════════════════════════════════════════════════════════════
  //  ZODIAC SIGNS
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['signs'] = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
  DICT.en['signs'] = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  DICT.zh['signsPure'] = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
  DICT.en['signsPure'] = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  // ══════════════════════════════════════════════════════════════════════════
  //  ELEMENTS & MODES
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['elements'] = ['火','土','风','水'];
  DICT.en['elements'] = ['Fire','Earth','Air','Water'];
  DICT.zh['modes'] = ['基本','固定','变动'];
  DICT.en['modes'] = ['Cardinal','Fixed','Mutable'];

  // ══════════════════════════════════════════════════════════════════════════
  //  ASPECT NAMES
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['aspect.合']='合'; DICT.en['aspect.合']='Conjunction';
  DICT.zh['aspect.六合']='六合'; DICT.en['aspect.六合']='Sextile';
  DICT.zh['aspect.刑']='刑'; DICT.en['aspect.刑']='Square';
  DICT.zh['aspect.三合']='三合'; DICT.en['aspect.三合']='Trine';
  DICT.zh['aspect.冲']='冲'; DICT.en['aspect.冲']='Opposition';
  DICT.zh['aspect.names'] = ['合','六合','刑','三合','冲'];
  DICT.en['aspect.names'] = ['Conjunction','Sextile','Square','Trine','Opposition'];

  // ══════════════════════════════════════════════════════════════════════════
  //  WEEKLY FORTUNE — Days
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['weekdays'] = ['周日','周一','周二','周三','周四','周五','周六'];
  DICT.en['weekdays'] = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  DICT.zh['weekdaysFull'] = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  DICT.en['weekdaysFull'] = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // ══════════════════════════════════════════════════════════════════════════
  //  NATAL REPORT SECTION HEADINGS
  // ══════════════════════════════════════════════════════════════════════════
  add('natal.section.overview', '✦ 整体格局 · 灵魂的蓝图', '✦ Overview · Blueprint of the Soul');
  add('natal.section.sunMoonRising', '✦ 日月升 — 灵魂的三重奏', '✦ Sun, Moon & Rising — The Soul\'s Triad');
  add('natal.section.patterns', '✦ 灵魂印记 — 关键格局', '✦ Soul Imprint — Key Patterns');
  add('natal.section.planets', '✦ 行星深度解读', '✦ Planets in Depth');
  add('natal.section.keyPlanets', '✦ 重点行星解读', '✦ Key Planet Interpretations');
  add('natal.section.aspects', '✦ 重要相位', '✦ Major Aspects');
  add('natal.section.lesson', '✦ 此生的核心课题', '✦ Your Core Life Lesson');
  add('natal.section.data', '✦ 星盘数据参考', '✦ Chart Data Reference');
  add('natal.section.dataSub', '以下是你的出生星盘精确数据，供深入学习参考。', 'Precise birth chart data for further study.');

  // ══════════════════════════════════════════════════════════════════════════
  //  TRANSIT / FORECAST LABELS
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['transit.jupiter']='木星'; DICT.en['transit.jupiter']='Jupiter';
  DICT.zh['transit.saturn']='土星'; DICT.en['transit.saturn']='Saturn';
  DICT.zh['transit.uranus']='天王星'; DICT.en['transit.uranus']='Uranus';
  DICT.zh['transit.neptune']='海王星'; DICT.en['transit.neptune']='Neptune';
  DICT.zh['transit.pluto']='冥王星'; DICT.en['transit.pluto']='Pluto';
  DICT.zh['transit.themes'] = ['机遇、扩张、幸运','考验、责任、成长','突变、觉醒、突破','梦想、消融、灵性','蜕变、权力、重生'];
  DICT.en['transit.themes'] = ['Opportunity, Expansion, Luck','Tests, Responsibility, Growth','Disruption, Awakening, Breakthrough','Dreams, Dissolution, Spirituality','Transformation, Power, Rebirth'];
  add('transit.noAspect', '目前与本命行星无紧密相位，该领域的直接影响较为温和，是整合和准备的好时机。', 'No tight aspects to natal planets right now — a good time for integration and preparation in this area.');
  add('transit.quiet', '目前与本命行星无紧密相位，该领域处于平稳过渡期。', 'No tight aspects to natal planets — this area is in a calm transition period.');
  add('transit.section', '行运 — ', ' Transit — ');
  add('transit.currentlyIn', '当前位于', 'currently in ');

  // ══════════════════════════════════════════════════════════════════════════
  //  5-YEAR FORECAST
  // ══════════════════════════════════════════════════════════════════════════
  add('forecast.timeline', '✦ 未来五年 · 关键时间线', '✦ Next 5 Years · Key Timeline');
  add('forecast.topics', '✦ 三大主题深度分析', '✦ Three Topics in Depth');
  add('forecast.table.time', '时间段', 'Period');
  add('forecast.table.transit', '关键行运', 'Key Transit');
  add('forecast.table.theme', '主题', 'Theme');
  add('forecast.defaultYear', '今年是相对平稳的整合年——适合巩固已有成果，为下一阶段的大动作做准备。', 'A relatively calm year of integration — consolidate your gains and prepare for the next big move.');
  add('forecast.career', '✦ 事业与使命', '✦ Career & Mission');
  add('forecast.love', '✦ 爱情与亲密关系', '✦ Love & Intimacy');
  add('forecast.wealth', '✦ 财富与物质世界', '✦ Wealth & Material World');

  // ══════════════════════════════════════════════════════════════════════════
  //  CAREER GENIUS
  // ══════════════════════════════════════════════════════════════════════════
  add('career.part1', '✦ 第一部分：行星能量分布', '✦ Part 1: Planetary Energy Distribution');
  add('career.gapTitle', '✦ 工作满意度差距分析', '✦ Job Satisfaction Gap Analysis');
  add('career.gapDim', '维度', 'Dimension');
  add('career.gapCurrent', '当前工作', 'Current Job');
  add('career.gapNeed', '星盘真正需要', 'What Your Chart Needs');
  add('career.part2', '✦ 第二部分：你的天赋与职业方向', '✦ Part 2: Your Talents & Career Directions');
  add('career.directionIntro', '以下方向基于你的星盘真实配置，按匹配度从高到低排列：', 'The following directions are based on your actual chart configuration, ranked by match:');
  add('career.bestMatch', '最匹配', 'Best Match');
  add('career.dir1', '【方向一】', '[Direction 1]');
  add('career.dir2', '【方向二】', '[Direction 2]');
  add('career.dir3', '【方向三】', '[Direction 3]');
  add('career.dir4', '【方向四】', '[Direction 4]');
  add('career.step1', '第1步：从"下班后2小时"开始', 'Step 1: Start with "2 Hours After Work"');
  add('career.step2', '第2步：找到你"1厘米宽、1公里深"的切入点', 'Step 2: Find Your "1cm Wide, 1km Deep" Niche');
  add('career.step3', '第3步：用"杠铃策略"控制风险', 'Step 3: Control Risk with the "Barbell Strategy"');
  add('career.step4', '第4步：你要相信的时间线', 'Step 4: The Timeline You Can Trust');

  // ══════════════════════════════════════════════════════════════════════════
  //  RELATIONSHIPS
  // ══════════════════════════════════════════════════════════════════════════
  add('rel.family', '✦ 亲情 — 家庭与根源', '✦ Family — Home & Roots');
  add('rel.friends', '✦ 友情 — 社交与社群', '✦ Friendship — Social & Community');
  add('rel.love', '✦ 爱情 — 亲密关系', '✦ Love — Intimate Relationships');

  // ══════════════════════════════════════════════════════════════════════════
  //  PLANET POSITION TABLE HEADERS
  // ══════════════════════════════════════════════════════════════════════════
  add('table.planet', '行星', 'Planet');
  add('table.position', '位置', 'Position');
  add('table.house', '宫位', 'House');
  add('table.element', '元素', 'Element');
  add('table.mode', '模式', 'Mode');
  add('table.axis', '轴点', 'Axis');
  add('table.cusp', '宫头 (Placidus)', 'Cusp (Placidus)');
  add('table.elemMode', '元素/模式', 'Element/Mode');

  // ══════════════════════════════════════════════════════════════════════════
  //  ELEMENT WEAKNESS / STELLIUM
  // ══════════════════════════════════════════════════════════════════════════
  add('elem.weak', '元素薄弱', 'Weak Element');
  add('elem.missing', '完全缺失', 'Completely Missing');
  add('elem.onlyCount', '仅', 'Only ');
  add('elem.countUnit', '颗', '');
  add('elem.cultivate', '此生的修行之地', 'Your Life\'s Cultivation');
  add('stellium.label', '汇聚', 'Stellium');
  add('pattern.count', '个关键格局', ' Key Patterns');

  // ══════════════════════════════════════════════════════════════════════════
  //  YEAR THEME WORDS
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['year.words'] = ['开拓','积累','表达','滋养','绽放','精进','连接','转化','探索','成就','联结','觉醒'];
  DICT.en['year.words'] = ['Pioneering','Building','Expression','Nurturing','Blossoming','Refinement','Connection','Transformation','Exploration','Achievement','Community','Awakening'];
  DICT.zh['year.tags'] = ['行动之年','价值之年','学习之年','家庭之年','创造之年','健康之年','关系之年','蜕变之年','智慧之年','事业之年','社群之年','灵性之年'];
  DICT.en['year.tags'] = ['Year of Action','Year of Value','Year of Learning','Year of Home','Year of Creativity','Year of Health','Year of Relationships','Year of Transformation','Year of Wisdom','Year of Career','Year of Community','Year of Spirituality'];

  // ══════════════════════════════════════════════════════════════════════════
  //  LOCKED BLOCK DESCRIPTIONS (with HTML)
  // ══════════════════════════════════════════════════════════════════════════
  add('locked.natalDesc', '本命星盘只是开始。加微信发送你的出生信息，获取为你量身撰写的<br>年度运势、行运解读和灵魂功课指引（约6000-10000字深度报告）', 'Your natal chart is just the beginning. Add WeChat with your birth info<br>to receive a personalized yearly forecast, transit reading, and soul lesson guide (~6000-10000 words).');
  add('locked.relDesc', '想知道你的金星/火星配置如何影响择偶模式？<br>加微信获取专属合盘解读、桃花运分析和关系疗愈建议<br><span style="font-size:0.85em;color:#8a8aaa;">📕 小红书 · 🎵 抖音 LunarVeilAstro 每日推送运势，不提供私信解读</span>', 'Want to know how your Venus/Mars shapes your love patterns?<br>Add WeChat for a personalized synastry reading, romance forecast, and relationship healing advice<br><span style="font-size:0.85em;color:#8a8aaa;">📕 Xiaohongshu · 🎵 Douyin LunarVeilAstro — daily posts, no DM readings</span>');

  // ══════════════════════════════════════════════════════════════════════════
  //  DYNAMIC STRINGS — templates with {placeholder} variables
  // ══════════════════════════════════════════════════════════════════════════
  add('geo.line', '✅ {city} · {lat}°{ns}, {lng}°{ew} · UTC{tz}', '✅ {city} · {lat}°{ns}, {lng}°{ew} · UTC{tz}');
  add('compass.remaining', '今日剩余 {count} 次', '{count} left today');
  add('compass.usedUp', '今日已用完', 'Used up today');
  add('fortune.available', '今日可抽', 'Available');
  add('rp.available', '今日可查', 'Available');
  add('rp.checked', '今日已查', 'Checked');
  add('year.summary', '{year}年主题词：{word1} + {word2}。这是你的"{yearLabel}"。', 'Theme for {year}: {word1} + {word2}. This is your "{yearLabel}".');

  // ══════════════════════════════════════════════════════════════════════════
  //  ZODIAC SIGN MATCH — UI LABELS
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['zodiac.signs'] = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  DICT.en['zodiac.signs'] = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  // ══════════════════════════════════════════════════════════════════════════
  //  FORTUNE SLIP TIER LABELS
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['rp.tiers'] = ['气运之子','吉星高照','顺风顺水','平平淡淡','小有波折','诸事不宜','触底反弹'];
  DICT.en['rp.tiers'] = ['Fortune\'s Child','Star-Blessed','Smooth Sailing','Steady as She Goes','Minor Turbulence','Everything Against You','Bounce Back'];

  // ══════════════════════════════════════════════════════════════════════════
  //  TIMELINE THEME LABELS
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['timeline.themes'] = ['成长突破期 ⚡','责任考验期 ⚙','重大转折期 🔥','稳步建设期 🏗','机遇扩展期 ✦','内省调整期 ~','稳定发展期 ●'];
  DICT.en['timeline.themes'] = ['Growth Breakthrough ⚡','Trial by Responsibility ⚙','Major Turning Point 🔥','Steady Building 🏗','Opportunity Expansion ✦','Inner Reflection ~','Stable Development ●'];
  add('timeline.calm', '平稳整合期 — 适合巩固已有成果，为下一阶段做准备。', 'Calm Integration — a good time to consolidate and prepare for the next phase.');
  add('timeline.footnote', '※ 行运的影响是渐进的——在准确成相的前后几周内感受最为明显。外行星运行缓慢，一个相位的影响可能持续数月至一年以上。', '※ Transits are gradual — felt most strongly in the weeks around exact aspect. Outer planets move slowly; one transit can last months to over a year.');

  // ══════════════════════════════════════════════════════════════════════════
  //  PDF / REPORT
  // ══════════════════════════════════════════════════════════════════════════
  add('pdf.title', '星盘解读报告', 'Astrology Reading Report');
  add('pdf.filename', '星盘解读报告_', 'Chart_Report_');

  // ══════════════════════════════════════════════════════════════════════════
  //  GAME MODAL — Close
  // ══════════════════════════════════════════════════════════════════════════
  add('modal.close', '✕', '✕');

  // ══════════════════════════════════════════════════════════════════════════
  //  FORTUNE DIRECTION (compass) — direction names
  // ══════════════════════════════════════════════════════════════════════════
  DICT.zh['dir.names'] = ['正北','东北','正东','东南','正南','西南','正西','西北'];
  DICT.en['dir.names'] = ['North','Northeast','East','Southeast','South','Southwest','West','Northwest'];
  DICT.zh['dir.八卦'] = ['','坎位','艮位','震位','巽位','离位','坤位','兑位','乾位'];
  DICT.en['dir.八卦'] = ['','Kan (Water)','Gen (Mountain)','Zhen (Thunder)','Xun (Wind)','Li (Fire)','Kun (Earth)','Dui (Lake)','Qian (Heaven)'];

  // ══════════════════════════════════════════════════════════════════════════
  //  TRANSIT PLANET STRUCTURE — used in forecast generation
  // ══════════════════════════════════════════════════════════════════════════
  add('transit.footnote', '※ 行运影响是渐进的——在准确成相的前后几周内感受最为明显。外行星运行缓慢，一个相位的影响可能持续数月至一年以上。', '※ Transit effects are gradual — most noticeable in the weeks around exact aspect. Outer planets move slowly; one aspect may last months to over a year.');

  // ══════════════════════════════════════════════════════════════════════════
  //  EXTRA UI STRINGS (misc)
  // ══════════════════════════════════════════════════════════════════════════
  add('misc.year', '年', 'yr');
  add('misc.month', '月', 'mo');
  add('misc.day', '日', 'd');
  add('misc.hour', '时', ':');
  add('misc.minute', '分', 'm');
  add('misc.degree', '°', '°');

  // ══════════════════════════════════════════════════════════════════════════
  //  SPECIAL DAY READING — 生日/土归/木归/次限月亮换座
  // ══════════════════════════════════════════════════════════════════════════
  add('specialDay.title', '✨ 你的宇宙时钟', '✨ Your Cosmic Clock');
  add('specialDay.subtitle', '太阳回归在生日、土归29年一考、木归12年一轮、次限月亮2.5年一换——你的宇宙有自己的时钟，这些钟只为你走。', 'Solar Return each birthday, Saturn Return every 29 years, Jupiter Return every 12, Progressed Moon shifts every 2.5 — your cosmos has its own clock, and it ticks only for you.');
  add('specialDay.multiple', '多个特殊天象在今天交汇，这让此刻的能量格外值得留意。', 'Multiple special transits converge today — this moment carries extra significance.');
  // Solar Return
  add('specialDay.birthday.tagline', '一年才一次的宇宙新年，太阳回到了你出生时的那一度——星盘重启，许愿最灵。', 'Your cosmic new year — once a year, the Sun returns to your natal degree. The chart resets; wishes made now carry extra weight.');
  add('specialDay.birthday.badge', '太阳回归日', 'Solar Return');
  add('specialDay.solarYearly.tagline', '太阳回归日就在你生日附近——太阳精准回到你出生时的那一度，每年一张全新的宇宙新年星图，描述从这次生日到下次生日之间你的个人主题和能量走向。', 'Your Solar Return falls near your birthday — the Sun returns to your exact natal degree, giving you a fresh cosmic chart each year that describes your personal themes from one birthday to the next.');
  add('specialDay.solarYearly.badge', '年度太阳回归', 'Annual Solar Return');
  // Saturn Return
  add('specialDay.saturnReturn.tagline', '人生大考来了。二十而立、三十而惑、六十耳顺——几乎所有人都在等这一天。土星回到你出生时的位置，逼你交出答卷，也给你打开下一关的钥匙。', 'The big test arrives. Around 29 and 58, Saturn returns to its natal spot — the exam everyone waits for. It demands your answers, and hands you the key to the next level.');
  add('specialDay.saturnReturn.badge', '土星回归', 'Saturn Return');
  add('specialDay.saturnReturn.lesson', '土星的教诲', 'Saturn\'s Lesson');
  // Jupiter Return
  add('specialDay.jupiterReturn.tagline', '十二年一轮的本命年，木星回家了。接下来一年是新一轮大运的开局——该膨胀的就让它膨胀，该出发的别再犹豫。', 'Once every 12 years, Jupiter comes home. The year ahead opens a new cycle of growth — let what wants to expand, expand. Don\'t hesitate to begin.');
  add('specialDay.jupiterReturn.badge', '木星回归', 'Jupiter Return');
  // Progressed Moon
  add('specialDay.progMoonChange.tagline', '你的心要搬家了。未来两年半，你的情感重心、安全感来源、直觉方向全部切换频道。旧的不去，新的不来。', 'Your heart is moving house. For the next 2.5 years, your emotional center, sense of security, and intuitive direction all shift. Out with the old, in with the new.');
  add('specialDay.progMoonChange.badge', '次限月亮换座中', 'Prog Moon Changing Signs');
  add('specialDay.progMoonStatus.badge', '次限月亮在{sign}', 'Prog Moon in {sign}');
  add('specialDay.progMoonStatus.tagline', '次限月亮是你的情绪导航——大约每两年半换一个星座，标记你当前的情感重心和直觉方向。此刻它在{sign}，距下次换座约{months}个月。', 'Your Progressed Moon is your emotional compass — it shifts signs every ~2.5 years, marking your emotional center and intuitive direction. It\'s currently in {sign}, ~{months} months from the next shift.');
  // Section headers
  add('specialDay.section.solarReturn', '☀️ 太阳回归盘 — 今年的宇宙主题', '☀️ Solar Return — This Year\'s Cosmic Theme');
  add('specialDay.section.predictions', '🔮 特殊周期预告 — 值得提前知道的大事', '🔮 Cycle Forecast — Big Events Worth Knowing in Advance');
  add('specialDay.section.deepestWell', '🕳 最深的井 — 最值得深挖的命盘配置', '🕳 The Deepest Well — Your Most Worth-Exploring Configuration');
  add('specialDay.section.timeline', '⏳ 精准时间线 — 未来12个月重要行运节点', '⏳ Timeline — Major Transit Dates in the Next 12 Months');
  add('specialDay.section.progMoon', '🌙 次限月亮 — 你的情绪导航', '🌙 Progressed Moon — Your Emotional Compass');
  add('specialDay.section.hiddenGift', '🎁 被忽略的礼物 — 一颗值得重新发现的星盘彩蛋', '🎁 The Hidden Gift — A Chart Easter Egg Worth Rediscovering');
  // Solar Return chart text
  add('specialDay.sr.ascSign', '今年你的太阳回归上升星座是', 'Your Solar Return Ascendant this year is ');
  add('specialDay.sr.sunHouse', '太阳落在第{house}宫', 'Sun in the {house}th House');
  add('specialDay.sr.theme', '年度主题', 'Annual Theme');
  // Predictions
  add('specialDay.pred.saturnComing', '🪐 <strong>土星回归</strong>预计在约<strong>{years}年后</strong>（{age}岁前后，约{date}）到来。土星将回到{sign}，触发你第{house}宫的人生课题——它是一次"人生质检"，逼你交出答卷，也给你打开下一关的钥匙。提前知道，提前准备。', '🪐 <strong>Saturn Return</strong> in ~<strong>{years} years</strong> (around age {age}, ~{date}). Saturn returns to {sign}, activating your {house}th House — it\'s a "life audit" that demands answers and hands you the key to the next level.');
  add('specialDay.pred.saturnNow', '🪐 <strong>土星回归正在进行中</strong>——此刻土星正踩在你出生时的土星位置上。这是人生最重要的转折点之一。', '🪐 <strong>Saturn Return in progress</strong> — Saturn is currently crossing your natal Saturn position. One of life\'s most important turning points.');
  add('specialDay.pred.jupiterComing', '🌟 <strong>木星回归</strong>预计在约<strong>{years}年后</strong>（约{date}）到来。木星将回到{sign}，触发你第{house}宫的扩张领域——那是一轮新大运的起点，该出发的时候别犹豫。', '🌟 <strong>Jupiter Return</strong> in ~<strong>{years} years</strong> (~{date}). Jupiter returns to {sign}, activating your {house}th House — the start of a new growth cycle. Don\'t hesitate to begin.');
  add('specialDay.pred.jupiterNow', '🌟 <strong>木星回归正在进行中</strong>——木星正站在你出生时的位置，开启新一轮12年的成长周期。', '🌟 <strong>Jupiter Return in progress</strong> — Jupiter stands at your natal position, opening a new 12-year growth cycle.');
  add('specialDay.pred.progMoonComing', '🌙 <strong>次限月亮</strong>预计在约<strong>{months}个月后</strong>（约{date}）从{current}换入{next}——届时你的情绪操作系统将全面切换，安全感来源和直觉方向都会改变。', '🌙 <strong>Progressed Moon</strong> in ~<strong>{months} months</strong> (~{date}) from {current} into {next} — when your emotional OS fully switches, along with your sense of security and intuition.');
  add('specialDay.pred.progMoonNow', '🌙 <strong>次限月亮正在换座</strong>——就在此刻，你的情绪操作系统正在从{current}迁移到{next}。', '🌙 <strong>Progressed Moon is changing signs</strong> — your emotional OS is migrating from {current} to {next} right now.');
  // Progressed moon text
  add('specialDay.pm.current', '当前次限月亮位于', 'Your progressed Moon is currently in ');
  add('specialDay.pm.nextSign', '，正靠近{sign}的边界——再过约{months}个月，它将正式进入', ', approaching the boundary of {sign} — in about {months} months, it will enter ');
  add('specialDay.pm.boundary', '，距换座还有{deg}°', ', {deg}° from the next sign');
  // Timeline
  add('specialDay.tl.item', '{trans} {angle} 本命{natal}', '{trans} {angleEN} natal {natal}');
  add('specialDay.tl.none', '未来12个月没有特别紧密的外行星行运——这是一段整合期，适合巩固已有成果而非急于求变。', 'No particularly tight outer-planet transits in the next 12 months — a period for consolidation rather than dramatic change.');
  // Hidden gift text
  add('specialDay.gift.intro', '在看遍了你命盘里那些被反复讨论的重磅配置之后，有一组相位不太起眼，却可能是你真正的隐藏技能点：', 'After reviewing the heavily discussed configurations in your chart, one aspect stands quietly in the corner — it might be your real hidden skill:');
  add('specialDay.gift.none', '你的每颗行星都在以自己的方式发光——不必强求"额外"的礼物，此刻的重点是善用你已经拥有的配置。', 'Every planet in your chart shines in its own way — no need to force an "extra" gift. The focus now is using what you already have well.');
  // Fallback / generic
  add('specialDay.generic.title', '✨ 你的宇宙时钟', '✨ Your Cosmic Clock');
  add('specialDay.generic.tagline', '太阳回归盘人人都有——你的宇宙时钟正在走，这一刻的星空也在讲属于你的故事。', 'Everyone has a Solar Return chart — your cosmic clock is ticking, and the sky is telling your story right now.');

  // ══════════════════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════

  /** Get current language — defaults to 'zh' */
  function getCurrentLang() {
    var lang = localStorage.getItem('lang');
    return (lang === 'en') ? 'en' : 'zh';
  }

  /** Translate a key. Falls back to zh, then raw key. Supports {placeholder} replacements. */
  window._t = function(key, replacements) {
    var lang = getCurrentLang();
    var val = (DICT[lang] && DICT[lang][key]);
    if (val === undefined || val === null) {
      val = (DICT.zh[key] !== undefined) ? DICT.zh[key] : key;
    }
    if (typeof val === 'string' && replacements) {
      for (var k in replacements) {
        if (replacements.hasOwnProperty(k)) {
          val = val.split('{' + k + '}').join(replacements[k]);
        }
      }
    }
    return val;
  };

  /** Get array item from translated array. e.g. _ta('signs', 0) → '白羊座' */
  window._ta = function(key, index) {
    var arr = window._t(key);
    if (Array.isArray(arr) && index >= 0 && index < arr.length) return arr[index];
    return '';
  };

  /** Convenience: get current lang */
  window._lang = function() { return getCurrentLang(); };

  /** Get sign name by index (0-11) in current language */
  window.getSignName = function(i) { return window._ta('signs', i); };
  window.getSignNamePure = function(i) { return window._ta('signsPure', i); };

  /** Get house name by number (1-12) in current language */
  window.getHouseName = function(n) {
    var arr = window._t('house');
    if (Array.isArray(arr) && n >= 1 && n <= 12) return arr[n];
    return window._t('house.fallback') + n;
  };

  /** Get planet name by index (0-10, 0=Sun) in current language */
  window.getPlanetName = function(i) { return window._ta('planets', i); };

  /** Get zodiac sign name (short) by index */
  window.getZodiacSignName = function(i) { return window._ta('zodiac.signs', i); };

  /** Get element name by index (0-3: fire,earth,air,water) */
  window.getElementName = function(i) { return window._ta('elements', i); };

  /** Get mode name by index (0-2: cardinal,fixed,mutable) */
  window.getModeName = function(i) { return window._ta('modes', i); };

  /** Fill timezone select options with language-appropriate city labels */
  function fillTimezoneOptions() {
    var isEn = getCurrentLang() === 'en';
    var TZ_CITIES = [
      [-10, '夏威夷', 'Hawaii'], [-8, '洛杉矶', 'Los Angeles'], [-7, '丹佛', 'Denver'],
      [-6, '墨西哥城', 'Mexico City'], [-5, '纽约', 'New York'], [-3, '巴西', 'Brazil'],
      [0, '伦敦', 'London'], [1, '巴黎', 'Paris'], [3, '莫斯科', 'Moscow'],
      [4, '迪拜', 'Dubai'], [5.5, '印度', 'India'], [7, '曼谷', 'Bangkok'],
      [8, '北京', 'Beijing'], [9, '东京', 'Tokyo'], [10, '悉尼', 'Sydney'],
      [12, '奥克兰', 'Auckland']
    ];
    var ALL_VALUES = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,5.5,6,7,8,9,10,11,12];
    var cityMap = {};
    for (var i = 0; i < TZ_CITIES.length; i++) {
      cityMap[TZ_CITIES[i][0]] = isEn ? TZ_CITIES[i][2] : TZ_CITIES[i][1];
    }
    var html = '';
    for (var j = 0; j < ALL_VALUES.length; j++) {
      var v = ALL_VALUES[j];
      var sign = v >= 0 ? '+' : '';
      var label = 'UTC' + sign + v;
      if (cityMap[v]) label += ' (' + cityMap[v] + ')';
      html += '<option value="' + v + '">' + label + '</option>';
    }
    var sel1 = document.getElementById('p1_tz');
    var sel2 = document.getElementById('p2_tz');
    if (sel1) { var oldVal1 = sel1.value; sel1.innerHTML = html; sel1.value = oldVal1 || '8'; }
    if (sel2) { var oldVal2 = sel2.value; sel2.innerHTML = html; sel2.value = oldVal2 || '8'; }
  }

  /** Set language and apply translations */
  window.setLanguage = function(lang) {
    if (lang !== 'zh' && lang !== 'en') lang = 'zh';
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    applyTranslations();
  };

  /** Central re-render function — called on language switch */
  function applyTranslations() {
    var lang = getCurrentLang();

    // 1. Document-level
    document.title = window._t('meta.title');
    setMeta('description', window._t('meta.description'));
    setMeta('keywords', window._t('meta.keywords'));
    setMetaOg('title', window._t('meta.ogTitle'));
    setMetaOg('description', window._t('meta.ogDescription'));

    // 2. All elements with data-i18n attribute → textContent
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = window._t(els[i].getAttribute('data-i18n'));
    }

    // 3. All elements with data-i18n-placeholder → placeholder
    var phEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < phEls.length; j++) {
      phEls[j].placeholder = window._t(phEls[j].getAttribute('data-i18n-placeholder'));
    }

    // 4. All elements with data-i18n-html → innerHTML (for HTML content)
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (var k = 0; k < htmlEls.length; k++) {
      htmlEls[k].innerHTML = window._t(htmlEls[k].getAttribute('data-i18n-html'));
    }

    // 5. Language switcher active state
    var opts = document.querySelectorAll('.lang-opt');
    for (var m = 0; m < opts.length; m++) {
      opts[m].classList.toggle('active', opts[m].getAttribute('data-lang') === lang);
    }

    // 6. If chart data exists, re-render all tabs
    if (typeof chartData1 !== 'undefined' && chartData1) {
      try {
        if (typeof renderTab0 === 'function') renderTab0();
        if (typeof renderTab1 === 'function') renderTab1();
        if (typeof renderTab2 === 'function') renderTab2();
        if (typeof renderTab3 === 'function') renderTab3();
        if (typeof renderTab4 === 'function') renderTab4();
        if (typeof renderTab5 === 'function') renderTab5();
        if (typeof renderTab6 === 'function') renderTab6();
        if (typeof renderTab7 === 'function') renderTab7();
        // Re-activate current tab
        var activeTab = document.querySelector('.tab.active');
        if (activeTab && typeof switchTab === 'function') {
          var idx = Array.prototype.indexOf.call(document.querySelectorAll('.tab'), activeTab);
          if (idx >= 0) switchTab(idx);
        }
      } catch(e) { /* silent */ }
    }

    // 7. Sync city name in address fields with current language
    var addrFields = ['p1_addr', 'p2_addr'];
    for (var af = 0; af < addrFields.length; af++) {
      var addrEl = document.getElementById(addrFields[af]);
      if (addrEl) {
        var cn = addrEl.getAttribute('data-city-cn');
        var en = addrEl.getAttribute('data-city-en');
        if (cn && en) {
          var prevVal = addrEl.value;
          addrEl.value = lang === 'en' ? en : cn;
          // Also update geo status text
          var statusEl = document.getElementById(addrFields[af] === 'p1_addr' ? 'p1_geo_status' : 'p2_geo_status');
          if (statusEl && statusEl.textContent) {
            statusEl.textContent = statusEl.textContent.replace(prevVal, lang === 'en' ? en : cn);
          }
        }
      }
    }

    // 8. Fill timezone selects with language-appropriate city labels
    fillTimezoneOptions();

    // 9. Refresh badges
    try {
      if (typeof updateLodgeBadges === 'function') updateLodgeBadges();
    } catch(e) { /* silent */ }

    // 8. Close game modals on language switch
    try {
      if (typeof closeGameModal === 'function') closeGameModal();
    } catch(e) { /* silent */ }
  }

  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (el) el.setAttribute('content', content);
  }
  function setMetaOg(prop, content) {
    var el = document.querySelector('meta[property="og:' + prop + '"]');
    if (el) el.setAttribute('content', content);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  INIT — bind language switcher, apply stored preference
  // ══════════════════════════════════════════════════════════════════════════
  function init() {
    // Bind language switcher click
    var switcher = document.getElementById('langSwitcher');
    if (switcher) {
      switcher.addEventListener('click', function(e) {
        var target = e.target;
        if (target.classList.contains('lang-opt')) {
          window.setLanguage(target.getAttribute('data-lang'));
        }
      });
    }

    // Apply stored language preference on load
    var saved = localStorage.getItem('lang');
    if (saved && saved !== 'zh') {
      document.documentElement.lang = 'en';
      applyTranslations();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
