// dailycard.js — Today's Astrology Overview Card (zero-input quick glance)
(function () {
  var SIGN_NAMES_ZH = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
  var SIGN_NAMES_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  var SIGN_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
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
      var jd, T, moonLon, si;
      try {
        jd = julianDay(now.getFullYear(), now.getMonth() + 1, now.getDate(),
          now.getHours() + now.getMinutes() / 60);
        T = centuriesSinceJ2000(jd);
        moonLon = calcAllPlanets(T).Moon;
        si = Math.floor(mod360(moonLon) / 30) % 12;
      } catch (e) {
        // Fallback: use a simple hash of today's date
        si = (now.getFullYear() * 397 + (now.getMonth() + 1) * 43 + now.getDate()) % 12;
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

      var html = '';
      html += '<div class="daily-card">';
      html += '<div class="daily-moon">🌙</div>';
      html += '<div class="daily-text">';
      html += '<div class="daily-title">✨ ' + (en ? "Today's Stars" : '今日星象') + ' · ' + dateStr + ' ✨</div>';
      html += '<div class="daily-vibe"><span class="daily-do">' + action + '</span><br><span class="daily-explain">' + explain + '</span></div>';
      html += '</div>';
      html += '<div class="daily-sign-badge">' + SIGN_EMOJI[si] + ' ' + signName + '</div>';
      html += '</div>';

      container.innerHTML = html;
    } catch (e) {
      // Silent fail — card will remain hidden
    }
  }

  window._renderDailyCard = renderDailyCard;

  function init() {
    renderDailyCard();
    // Re-render on language switch
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
