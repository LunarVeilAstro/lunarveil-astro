// dailycard.js — Today's Astrology Overview Card (zero-input quick glance)
(function () {
  var moonVibes_ZH = [
    '今天适合想到就做——犹豫只会把冲动变成遗憾',       // 白羊
    '今天适合慢慢来——吃顿好的，摸摸植物，世界不会跑掉',  // 金牛
    '今天适合聊天、发圈、见人——你的表达欲值得被世界听见',  // 双子
    '今天适合宅着、翻旧照片、给家人发个消息——温柔就是你的超能力', // 巨蟹
    '今天适合闪闪发光——穿得好看、大方夸人、主动做个决定',   // 狮子
    '今天适合整理、收纳、划掉清单上第一项——清爽的环境带来清爽的心情', // 处女
    '今天适合约人喝杯咖啡、换身搭配、对镜子笑一下——好看的一天从好看的心情开始', // 天秤
    '今天适合一个人沉浸式看剧、删掉不联系的好友、给自己一小时免打扰', // 天蝎
    '今天适合搜个目的地、吃个没吃过的东西、对陌生人笑一下——出发就是意义', // 射手
    '今天适合做计划、提前十分钟到、完成一件拖延的小事——踏实是最好的安全感', // 摩羯
    '今天适合换个头像、尝试奇怪组合、一个人逛逛——你的独特不需要解释',  // 水瓶
    '今天适合睡午觉、听纯音乐、给自己买支花——生活需要一点无用的美好'   // 双鱼
  ];
  var moonVibes_EN = [
    "Do it now — hesitation is the only thing between you and a great idea",
    "Take it slow — eat well, touch a plant, the world can wait",
    "Talk, post, meet up — your words deserve to be heard today",
    "Stay cozy, flip through old photos, message someone you love — gentleness is your superpower",
    "Shine bright — dress up, give a compliment, make a bold decision",
    "Organize, declutter, cross off the first thing on your list — clarity brings peace",
    "Invite someone for coffee, switch up your outfit, smile at the mirror — a good day starts with a good mood",
    "Watch a show alone, delete contacts you never talk to, give yourself an hour of silence",
    "Search a destination, eat something new, smile at a stranger — the journey itself is the point",
    "Make a plan, arrive ten minutes early, finish one thing you've been putting off — stability is the best comfort",
    "Change your avatar, try a weird combo, browse alone — your uniqueness needs no explanation",
    "Take a nap, listen to instrumental music, buy yourself a flower — life needs a touch of useless beauty"
  ];
  var moonEmoji = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

  function renderDailyCard() {
    var now = new Date();
    var jd = julianDay(now.getFullYear(), now.getMonth() + 1, now.getDate(),
      now.getHours() + now.getMinutes() / 60);
    var T = centuriesSinceJ2000(jd);
    var moonLon = calcAllPlanets(T).Moon;
    var si = Math.floor(mod360(moonLon) / 30) % 12;

    var isEn = window._lang && window._lang() === 'en';
    var vibe = isEn ? moonVibes_EN[si] : moonVibes_ZH[si];
    var sep = isEn ? ' — ' : '——';
    var parts = vibe.split(sep);
    var action = parts[0];
    var explain = parts.slice(1).join(sep);
    var signName = isEn
      ? ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][si]
      : SIGN_PURE[si];
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var dateStr = isEn
      ? (['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + day)
      : (month + '月' + day + '日');

    var html = '';
    html += '<div class="daily-card">';
    html += '<div class="daily-moon">🌙</div>';
    html += '<div class="daily-text">';
    html += '<div class="daily-title">✨ ' + _L('今日星象','Today\'s Stars') + ' · ' + dateStr + ' ✨</div>';
    html += '<div class="daily-vibe"><span class="daily-do">' + action + '</span><br><span class="daily-explain">' + explain + '</span></div>';
    html += '</div>';
    html += '<div class="daily-sign-badge">' + moonEmoji[si] + ' ' + signName + '</div>';
    html += '</div>';

    var container = document.getElementById('dailyCard');
    if (container) container.innerHTML = html;
  }

  window._renderDailyCard = renderDailyCard;

  // Render after DOM ready (after i18n restores language preference)
  function init() {
    renderDailyCard();
    // Re-render on manual language switch
    var _origSetLang = window.setLanguage;
    window.setLanguage = function(lang) {
      _origSetLang(lang);
      renderDailyCard();
    };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
