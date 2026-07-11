// dailycard.js — Today's Astrology Overview Card (zero-input quick glance)
(function () {
  var SIGN_NAMES_ZH = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
  var SIGN_NAMES_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  var SIGN_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

  // ── 月相：8 phases ──
  var MOON_PHASE_ZH = ['🌑 新月','🌒 蛾眉月','🌓 上弦月','🌔 盈凸月','🌕 满月','🌖 亏凸月','🌗 下弦月','🌘 残月'];
  var MOON_PHASE_EN = ['🌑 New Moon','🌒 Waxing Crescent','🌓 First Quarter','🌔 Waxing Gibbous','🌕 Full Moon','🌖 Waning Gibbous','🌗 Last Quarter','🌘 Waning Crescent'];

  // ── 每日一问 ──
  var dailyQs_ZH = [
    '你今天最想按下删除键的事是什么？',
    '如果明天是最后一天，你会把今天花在哪？',
    '最近有什么事让你偷笑——但你没告诉任何人？',
    '你上一次觉得"原来我也可以"是什么时候？',
    '今天有谁让你想翻白眼——但你还是忍住了？',
    '你心里那个"等以后再说"的事，是什么？',
    '最近让你感到骄傲的一个小决定是什么？',
    '你今天花在手机上的时间，有一半是用在什么上？',
    '你上一次纯粹因为好玩做的事，是什么？',
    '有没有一句夸奖，你一直没敢当真？',
    '今天有什么小事让你觉得"还行，活着挺好的"？',
    '你最近一次说"算了就这样吧"，是真的算了还是不甘心？'
  ];
  var dailyQs_EN = [
    "What's the one thing you'd love to hit delete on today?",
    "If tomorrow were your last, where would you spend today?",
    "What made you smile recently — that you told no one about?",
    'When was the last time you thought "maybe I can do this"?',
    "Who made you roll your eyes today — and you held it together?",
    'What have you been saying "I\'ll get to it later" about?',
    "What's a small decision you're proud of lately?",
    "Half your screen time today — what was it actually spent on?",
    "When's the last time you did something just because it was fun?",
    "Is there a compliment you've never quite believed?",
    'What small thing today made you think "okay, life\'s alright"?',
    'The last time you said "fine, whatever" — did you mean it?'
  ];

  var moonVibes_ZH = [
    '今天适合说干就干——别想了，脑子跟不上你的手速',
    '今天适合躺平摸鱼——天塌了也等吃完这顿再说',
    '今天适合瞎扯淡、水群、发个九宫格——你的废话值得一条热搜',
    '今天适合窝着、翻黑历史照片、给老铁发个"在吗"——emo一下怎么了',
    '今天适合艳压全场——穿最亮的衫，做最靓的仔，吹最野的牛',
    '今天适合断舍离、删购物车、干掉待办第一项——爽感拉满不解释',
    '今天适合约咖啡、换套look、对镜子wink一下——好看就完事了',
    '今天适合沉浸式追剧、取关不熟的人、开免打扰装死——谁也别来找',
    '今天适合搜个冷门目的地、吃个没吃过的东西、对路人傻笑——走就完了',
    '今天适合写个计划、提前十分钟到、干掉拖了八百年的小事——稳如老狗',
    '今天适合换头像、尝试离谱穿搭、一个人瞎逛——怪就怪了，爱谁谁',
    '今天适合睡午觉、单曲循环、给自己买枝花——没用的浪漫最浪漫'
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

  function isEn() {
    return window._lang && typeof window._lang === 'function' && window._lang() === 'en';
  }

  function renderDailyCard() {
    try {
      var container = document.getElementById('dailyCard');
      if (!container) return;

      var now = new Date();
      var jd, T, moonLon, sunLon, si;
      try {
        jd = julianDay(now.getFullYear(), now.getMonth() + 1, now.getDate(),
          now.getHours() + now.getMinutes() / 60);
        T = centuriesSinceJ2000(jd);
        var planets = calcAllPlanets(T);
        moonLon = planets.Moon;
        sunLon = planets.Sun;
        si = Math.floor(mod360(moonLon) / 30) % 12;
      } catch (e) {
        si = (now.getFullYear() * 397 + (now.getMonth() + 1) * 43 + now.getDate()) % 12;
        sunLon = null;
        moonLon = null;
      }

      // ── 月相 ──
      var phaseIdx = -1;
      if (sunLon != null && moonLon != null) {
        var phaseAngle = mod360(moonLon - sunLon);
        phaseIdx = Math.round(phaseAngle / 45) % 8;
      }

      var en = isEn();
      var vibe = en ? moonVibes_EN[si] : moonVibes_ZH[si];
      var sep = en ? ' — ' : '——';
      var parts = vibe.split(sep);
      var action = parts[0];
      var explain = parts.slice(1).join(sep);
      var signName = en ? SIGN_NAMES_EN[si] : SIGN_NAMES_ZH[si];
      var month = now.getMonth() + 1;
      var day = now.getDate();
      var dateStr = en
        ? (['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + day)
        : (month + '月' + day + '日');

      // ── 每日一问 ──
      var qIdx = (now.getFullYear() * 397 + (now.getMonth() + 1) * 43 + now.getDate()) % 12;
      var dailyQ = en ? dailyQs_EN[qIdx] : dailyQs_ZH[qIdx];

      var phaseHTML = '';
      if (phaseIdx >= 0) {
        phaseHTML = '<div class="daily-phase">' + (en ? MOON_PHASE_EN[phaseIdx] : MOON_PHASE_ZH[phaseIdx]) + '</div>';
      }

      var html = '';
      html += '<div class="daily-card">';
      html += '<div class="daily-moon">🌙</div>';
      html += '<div class="daily-text">';
      html += '<div class="daily-title">✨ ' + (en ? "Today's Stars" : '今日星象') + ' · ' + dateStr + ' ✨</div>';
      if (phaseHTML) html += phaseHTML;
      html += '<div class="daily-vibe"><span class="daily-do">' + action + '</span><br><span class="daily-explain">' + explain + '</span></div>';
      html += '<div class="daily-question">' + dailyQ + '</div>';
      html += '</div>';
      html += '<div class="daily-sign-badge">' + SIGN_EMOJI[si] + ' ' + signName + '</div>';
      html += '</div>';

      container.innerHTML = html;
    } catch (e) {
      // Silent fail
    }
  }

  window._renderDailyCard = renderDailyCard;

  function init() {
    renderDailyCard();
    var _origSetLang = window.setLanguage;
    if (_origSetLang) {
      window.setLanguage = function(lang) {
        _origSetLang(lang);
        renderDailyCard();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
