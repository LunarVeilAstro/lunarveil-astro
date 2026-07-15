// fortune.js — Daily fortune slips, RP, lucky items, share-for-extra
// Depends on: astronomy.js (chartData1, shuffle, escHtml), data.js
function todayKey() { return new Date().toISOString().slice(0,10); }
function personKey() { if (chartData1) { const el = (id) => (document.getElementById(id) || {}).value || ''; const raw = el('p1_date') + '|' + el('p1_time') + '|' + el('p1_lat') + '|' + el('p1_lng'); let h = 0; for (let i = 0; i < raw.length; i++) { h = ((h << 5) - h) + raw.charCodeAt(i); h |= 0; } return '_' + Math.abs(h).toString(36); } return '_default'; }

// ── Chart-enhanced tier-2 helpers ───────────────────────────────────────
function getCurrentTransits() {
  const now = new Date();
  const jd = julianDay(now.getUTCFullYear(), now.getUTCMonth()+1, now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes()/60 + now.getUTCSeconds()/3600);
  const T = centuriesSinceJ2000(jd);
  return calcAllPlanets(T);
}

function chartSignName(lonDeg) {
  return getSignNamePure(degToSign(lonDeg).si);
}

function getNatalSunSign() {
  if (!chartData1) return '';
  return chartSignName(chartData1.positions.Sun);
}

function getTopTransitInsight() {
  const transits = getCurrentTransits();
  const natal = chartData1.positions;
  const findings = [];
  const keyTransits = ['Jupiter','Saturn','Uranus','Venus','Mars'];
  const natalTargets = [
    {key:'Sun', lon: natal.Sun, name: '本命太阳', nameEN: 'natal Sun'},
    {key:'Moon', lon: natal.Moon, name: '本命月亮', nameEN: 'natal Moon'},
    {key:'Venus', lon: natal.Venus, name: '本命金星', nameEN: 'natal Venus'},
    {key:'Mars', lon: natal.Mars, name: '本命火星', nameEN: 'natal Mars'},
    {key:'Jupiter', lon: natal.Jupiter, name: '本命木星', nameEN: 'natal Jupiter'},
    {key:'Asc', lon: chartData1.asc, name: '上升点', nameEN: 'Ascendant'},
    {key:'MC', lon: chartData1.mc, name: '天顶', nameEN: 'Midheaven'},
  ];

  for (const tp of keyTransits) {
    const tLon = transits[tp];
    for (const nt of natalTargets) {
      const angle = Math.abs(mod360(tLon - nt.lon));
      let aspectName = null, orb = 999;

      if (angle < 8 || angle > 352) { aspectName = '合'; orb = Math.min(angle, 360-angle); }
      else if (angle > 52 && angle < 68) { aspectName = '六合'; orb = Math.abs(angle-60); }
      else if (angle > 82 && angle < 98) { aspectName = '刑'; orb = Math.abs(angle-90); }
      else if (angle > 112 && angle < 128) { aspectName = '三合'; orb = Math.abs(angle-120); }
      else if (angle > 172 && angle < 188) { aspectName = '冲'; orb = Math.abs(angle-180); }

      if (aspectName) {
        let weight = 1;
        if (tp === 'Jupiter' && (aspectName === '三合' || aspectName === '六合' || aspectName === '合')) weight = 5;
        else if (tp === 'Saturn' && (aspectName === '刑' || aspectName === '冲')) weight = 4;
        else if (tp === 'Venus' && (aspectName === '三合' || aspectName === '合')) weight = 3;
        else if (tp === 'Uranus' && (aspectName === '三合' || aspectName === '冲')) weight = 3;
        else if (tp === 'Mars' && aspectName === '合') weight = 2;
        findings.push({tp, nt, aspectName, orb, weight});
      }
    }
  }

  findings.sort((a,b) => b.weight - a.weight || a.orb - b.orb);
  return findings[0] || null;
}

function getTransitRPAdjustment() {
  const transits = getCurrentTransits();
  const natal = chartData1.positions;
  let adj = 0;
  const planets = ['Jupiter','Saturn','Venus','Mars','Sun','Moon','Mercury'];

  for (const tp of planets) {
    const tLon = transits[tp];
    for (const np of ['Sun','Moon','Venus','Mars','Jupiter','Saturn']) {
      const nLon = natal[np];
      const angle = Math.abs(mod360(tLon - nLon));

      if (angle < 8 || angle > 352) {
        adj += (tp === 'Jupiter') ? 10 : (tp === 'Venus') ? 7 : (tp === 'Saturn') ? -5 : 3;
      } else if (angle > 112 && angle < 128) {
        adj += (tp === 'Jupiter') ? 12 : (tp === 'Saturn') ? -3 : (tp === 'Venus') ? 8 : 4;
      } else if (angle > 52 && angle < 68) {
        adj += (tp === 'Jupiter') ? 8 : (tp === 'Saturn') ? -2 : 3;
      } else if (angle > 82 && angle < 98) {
        adj += (tp === 'Saturn') ? -12 : (tp === 'Mars') ? -5 : -3;
      } else if (angle > 172 && angle < 188) {
        adj += (tp === 'Saturn') ? -15 : (tp === 'Mars') ? -7 : -4;
      }
    }
  }
  return Math.max(-30, Math.min(30, Math.round(adj)));
}

function computeTransitWeightedRP() {
  const base = Math.floor(Math.random() * 101);
  const adj = getTransitRPAdjustment();
  return Math.max(0, Math.min(100, base + adj));
}

function getChartLuckyItems(score) {
  const isEn = window._lang && window._lang() === 'en';
  const vIdx = degToSign(chartData1.positions.Venus).si;
  const SIGN_COLORS = [
    '珊瑚红','翡翠绿','天青','月光银',
    '琥珀金','墨玉黑','玫瑰粉','深空蓝',
    '紫罗兰','靛蓝','杏黄','珊瑚橙'
  ];
  const SIGN_COLORS_EN_ARR = [
    'Coral Red','Jade Green','Sky Cyan','Moonlight Silver',
    'Amber Gold','Onyx Black','Rose Pink','Deep Space Blue',
    'Violet','Indigo','Apricot Yellow','Coral Orange'
  ];
  const DIRS_BY_HOUSE_ZH = ['正东','东北','正北','西北','正西','西南','正南','东南','正东','东北','正北','西北'];
  const DIRS_BY_HOUSE_EN = ['East','Northeast','North','Northwest','West','Southwest','South','Southeast','East','Northeast','North','Northwest'];
  const jupHouse = (chartData1.houses && chartData1.houses.Jupiter) || 1;
  const sunDeg = Math.floor(chartData1.positions.Sun % 30);
  const luckyColors = LUCKY_COLORS();
  const luckyDirs = LUCKY_DIRS();

  return {
    color: isEn ? (SIGN_COLORS_EN_ARR[vIdx] || luckyColors[Math.floor(score % luckyColors.length)]) : (SIGN_COLORS[vIdx] || luckyColors[Math.floor(score % luckyColors.length)]),
    dir: isEn ? (DIRS_BY_HOUSE_EN[jupHouse - 1] || luckyDirs[Math.floor(score % luckyDirs.length)]) : (DIRS_BY_HOUSE_ZH[jupHouse - 1] || luckyDirs[Math.floor(score % luckyDirs.length)]),
    num: (sunDeg + Math.floor(score/10)) % 100
  };
}

function generateFortuneAnnotation() {
  const isEn = window._lang && window._lang() === 'en';
  const insight = getTopTransitInsight();
  if (!insight) return '';

  const sunSign = getNatalSunSign();
  const transitNameMap_ZH = {Jupiter:'木星', Saturn:'土星', Uranus:'天王星', Venus:'金星', Mars:'火星'};
  const transitNameMap_EN = {Jupiter:'Jupiter', Saturn:'Saturn', Uranus:'Uranus', Venus:'Venus', Mars:'Mars'};
  const transitName = isEn ? (transitNameMap_EN[insight.tp] || insight.tp) : (transitNameMap_ZH[insight.tp] || insight.tp);
  const aspectNames_ZH = {合:'合', 六合:'六合', 刑:'刑', 三合:'三合', 冲:'冲'};
  const aspectNames_EN = {合:'Conjunction', 六合:'Sextile', 刑:'Square', 三合:'Trine', 冲:'Opposition'};
  const aspectName = isEn ? (aspectNames_EN[insight.aspectName] || insight.aspectName) : insight.aspectName;
  let house;
  if (insight.nt.key === 'Asc') { house = 1; }
  else if (insight.nt.key === 'MC') { house = 10; }
  else { house = (chartData1.houses && chartData1.houses[insight.nt.key]) || 1; }
  const hName = getHouseName(house);

  return (isEn
    ? '<div class="fortune-annotation" style="margin-top:12px;padding:10px 14px;background:rgba(201,169,110,0.08);border-left:3px solid var(--gold);border-radius:4px;font-size:0.82em;color:var(--accent);line-height:1.6;text-align:left;text-indent:2em;">✨ Chart-Specific Insight: Transiting ' + transitName + ' is forming a ' + aspectName + ' with your ' + insight.nt.nameEN + ' — this fortune slip applies especially to your ' + hName + '. ' + sunSign + ', today is for quiet inner reflection — follow the stars\' guidance.</div>'
    : '<div class="fortune-annotation" style="margin-top:12px;padding:10px 14px;background:rgba(201,169,110,0.08);border-left:3px solid var(--gold);border-radius:4px;font-size:0.82em;color:var(--accent);line-height:1.6;text-align:left;text-indent:2em;">✨ 星盘专属解读：行运' + transitName + '正' + insight.aspectName + '你的' + insight.nt.name + '——这张签文对你的' + hName + '尤其适用。' + sunSign + '今日宜静心内观，跟随星辰指引。</div>');
}

// ── Badge update ──────────────────────────────────────────────────────
function updateLodgeBadges() {
  const fb = document.getElementById('fortuneBadge');
  const rb = document.getElementById('rpBadge');
  // 每日一签 / 今日人品 均无每日限制，徽章永远显示「可玩」、不置灰
  if (fb) {
    fb.textContent = _t('fortune.available');
    fb.classList.remove('used');
  }
  if (rb) {
    rb.textContent = _t('lodge.badge.rpAvailable');
    rb.classList.remove('used');
  }
}

// ── Game modal helper ─────────────────────────────────────────────────
function showGameModal(html) {
  document.getElementById('gameModal').innerHTML = '<button class="game-close" onclick="closeGameModal()">✕</button>' + html;
  document.getElementById('gameOverlay').classList.add('show');
}
function closeGameModal() {
  document.getElementById('gameOverlay').classList.remove('show');
  updateLodgeBadges();
}
// 弹窗是否仍打开——动画途中被关闭时用于中止后续出签/渲染
function _gameModalShown() {
  var ov = document.getElementById('gameOverlay');
  return !!(ov && ov.classList.contains('show'));
}

// ── 每日一签 ─────────────────────────────────────────────────────────
function drawFortuneSlip() {
  // Always draw from ZH base for consistent index across languages
  const weights = {上上签:5, 上签:10, 中签:15, 下签:10, 下下签:5};
  const pool = [];
  for (let i=0; i<FORTUNE_SLIPS_ZH.length; i++) {
    for (let j=0; j<(weights[FORTUNE_SLIPS_ZH[i].lv]||1); j++) pool.push(i);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function openDailyFortune() {
  // 每次打开都出签筒、摇一摇都是新签（无每日限制）。
  // 签筒无需 data.js，立即渲染（默认静止）；data.js 后台预载，供点击摇签时用。
  if (typeof FORTUNE_SLIPS_ZH === 'undefined') loadScript(DATA_JS).catch(function(){});
  _fortuneShaking = false;
  let html = '<h3>' + _t('lodge.dailyFortune') + '</h3>';
  html += '<div class="fortune-tube" id="fortuneTube" onclick="shakeFortune()"></div>';
  html += '<p style="color:var(--text-dim);font-size:0.82em;">' + _t('fortune.drawHint') + '</p>';
  showGameModal(html);
}

var _fortuneShaking = false;
// 点击签筒：先摇 3 下（CSS 动画），摇完再抽签出结果
function shakeFortune() {
  if (_fortuneShaking) return;
  // 抽签需要 data.js，没载完先载再来
  if (typeof FORTUNE_SLIPS_ZH === 'undefined') {
    loadScript(DATA_JS).then(shakeFortune).catch(function(e){ console.error('data.js load error:', e); alert(_L('模块加载失败，请刷新页面后重试。','Module loading failed. Please refresh and try again.')); });
    return;
  }
  _fortuneShaking = true;
  var tube = document.getElementById('fortuneTube');
  if (!tube) { revealFortune(); return; }
  tube.classList.add('shaking');
  var done = false;
  var finish = function() { if (done) return; done = true; if (!_gameModalShown()) { _fortuneShaking = false; return; } revealFortune(); };
  tube.addEventListener('animationend', finish, { once: true });
  setTimeout(finish, 1100);   // 兜底：animationend 未触发也出签（3 下约 0.9s）
}

function revealFortune() {
  // 快速点击时 data.js 可能还没载完——载完再抽（签筒继续显示、动画照旧）
  if (typeof FORTUNE_SLIPS_ZH === 'undefined') {
    loadScript(DATA_JS).then(revealFortune).catch(function(e){ console.error('data.js load error:', e); alert(_L('模块加载失败，请刷新页面后重试。','Module loading failed. Please refresh and try again.')); });
    return;
  }
  const slipIdx = drawFortuneSlip();

  let html = '<h3>' + _t('lodge.dailyFortune') + '</h3>';
  html += renderFortuneResult(slipIdx);
  if (chartData1) {
    html += generateFortuneAnnotation();
  }
  html += renderShareButton('fortune');
  html += '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">📕</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">'+_L('每日运势推送','Daily Fortune Updates')+'</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">'+_L('关注小红书 <strong style="color:#d4b870;">LunarVeilAstro</strong> 全平台同名','Follow <strong style="color:#d4b870;">LunarVeilAstro</strong> on Xiaohongshu')+'</div></div><a href="https://www.xiaohongshu.com/user/LunarVeilAstro" target="_blank" rel="noopener" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;text-decoration:none;font-weight:bold;white-space:nowrap;">'+_L('去关注 →','Follow →')+'</a></div>';
  document.getElementById('gameModal').innerHTML = '<button class="game-close" onclick="closeGameModal()">✕</button>' + html;
}

function renderFortuneResult(slipIdx) {
  const slips = FORTUNE_SLIPS();
  const slip = slips[slipIdx % slips.length];
  let r = '<div class="fortune-slip">';
  r += '<div class="slip-level">' + slip.lv + '</div>';
  r += '<div class="slip-poem" style="white-space:pre-line;">' + slip.poem + '</div>';
  r += '<div class="slip-dos">' + slip.dos + '</div>';
  r += '<div class="slip-donts">' + slip.donts + '</div>';
  r += '</div>';
  return r;
}

// ── 今日人品 ─────────────────────────────────────────────────────────
function openDailyRP() {
  // 点击轮盘再开始测：先展示缓慢自转的命运之轮（中心✦）+ 提示，点一下才计算新分数。
  // 轮盘无需 data.js，立即渲染；data.js 后台预载，供点击揭晓时用。
  if (typeof RP_TIERS === 'undefined') loadScript(DATA_JS).catch(function(){});
  _rpRevealing = false;
  let html = '<h3>' + _t('lodge.dailyRP') + '</h3>';
  html += '<div class="rp-reveal rp-idle" id="rpReveal" onclick="revealRP()">';
  html += '<div class="rp-wheel" id="rpWheel"></div>';
  html += '<div class="rp-score-circle">';
  html += '<div class="rp-score-num" id="rpScoreNum">✦</div>';
  html += '<div class="rp-score-label">' + _t('rp.title') + '</div>';
  html += '</div>';
  html += '</div>';
  html += '<p class="rp-hint" id="rpHint" style="color:var(--text-dim);font-size:0.82em;margin-top:2px;">'+_L('点击轮盘，测今日人品','Tap the wheel to reveal today\'s luck')+'</p>';
  html += '<div id="rpRest"></div>';
  showGameModal(html);
}

var _rpRevealing = false;
function revealRP() {
  if (_rpRevealing) return;
  // 揭晓需要 data.js（评语/幸运物）；没载完先载再来（轮盘继续自转）
  if (typeof RP_TIERS === 'undefined') {
    loadScript(DATA_JS).then(revealRP).catch(function(e){ console.error('data.js load error:', e); alert(_L('模块加载失败，请刷新页面后重试。','Module loading failed. Please refresh and try again.')); });
    return;
  }
  _rpRevealing = true;

  var reveal = document.getElementById('rpReveal');
  if (reveal) { reveal.classList.remove('rp-idle'); reveal.onclick = null; reveal.style.cursor = 'default'; }
  var hint = document.getElementById('rpHint');
  if (hint) hint.style.display = 'none';

  // 每次点击都测一个全新分数
  var score, personalized = false;
  if (chartData1) {
    score = computeTransitWeightedRP();
    personalized = true;
  } else {
    score = Math.floor(Math.random() * 101);
  }

  animateRPReveal(score, function() {
    var rest = document.getElementById('rpRest');
    if (rest) rest.innerHTML = renderRPRest(score, personalized) + renderShareButton('rp') + _rpWeChatCard();
    _rpRevealing = false;
  });
}

function _rpWeChatCard() {
  return '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">💬</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">'+_L('每日专属解读','Daily Personal Reading')+'</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">'+_L('加微信 <strong style="color:#d4b870;">LunarVeilAstro</strong> 一对一专属解读','Add <strong style="color:#d4b870;">LunarVeilAstro</strong> on WeChat for a personal reading')+'</div></div><span onclick="copySocial(\'微信\',\'LunarVeilAstro\')" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;font-weight:bold;white-space:nowrap;">'+_L('复制微信号','Copy WeChat ID')+'</span></div>';
}

function renderRPRest(score, personalized) {
  const tier = RP_TIERS().find(t => score >= t.min);
  const rpLabelIdx = RP_TIERS().indexOf(tier);
  let color, dir, num;
  if (personalized && chartData1) {
    const items = getChartLuckyItems(score);
    color = items.color; dir = items.dir; num = items.num;
  } else {
    const luckyColors = LUCKY_COLORS();
    const luckyDirs = LUCKY_DIRS();
    color = luckyColors[Math.floor(Math.abs(score * 7) % luckyColors.length)];
    dir = luckyDirs[Math.floor(Math.abs(score * 13) % luckyDirs.length)];
    num = Math.floor(Math.abs(score * 17) % 100);
  }

  let r = '<div class="rp-comment">' + tier.emoji + ' ' + _ta('rp.tiers', rpLabelIdx) + '</div>';
  if (personalized && chartData1) {
    const sunSign = getNatalSunSign();
    r += '<div style="background:rgba(201,169,110,0.1);border:1px solid var(--gold);border-radius:8px;padding:4px 10px;margin:8px 0;display:inline-block;font-size:0.78em;color:var(--accent);">' + _t('rp.basedOnChart') + ' ' + sunSign + _t('rp.chartBased') + '</div>';
  }
  r += '<p style="color:#b8b8c8;font-size:0.85em;line-height:1.7;">' + tier.tip + '</p>';
  r += '<div class="rp-details">';
  r += '🍀 '+_L('幸运数字','Lucky Number')+'：<strong style="color:var(--accent);">' + num + '</strong>　|　';
  r += '🎨 '+_L('幸运色','Lucky Color')+'：<strong style="color:var(--accent);">' + color + '</strong><br>';
  r += '🧭 '+_L('幸运方位','Lucky Direction')+'：<strong style="color:var(--accent);">' + dir + '</strong>';
  r += '</div>';
  return r;
}

// 命运之轮：金环旋转定格 + 分数 0→终值滚动，定格时圆圈爆一下光晕，完成后回调 onDone
function animateRPReveal(score, onDone) {
  var numEl = document.getElementById('rpScoreNum');
  if (!numEl) { if (onDone) onDone(); return; }
  var target = parseInt(score, 10) || 0;
  var wheel = document.getElementById('rpWheel');
  if (wheel) { void wheel.offsetWidth; wheel.classList.add('spin'); }
  var dur = 1500, start = null;
  var ease = function(t) { return 1 - Math.pow(1 - t, 3); };  // easeOutCubic
  numEl.textContent = '0';
  function step(ts) {
    if (!_gameModalShown()) return;   // 弹窗已关闭则停止（重开 openDailyRP 会复位 _rpRevealing）
    if (start === null) start = ts;
    var t = Math.min(1, (ts - start) / dur);
    numEl.textContent = String(Math.round(ease(t) * target));
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      numEl.textContent = String(target);
      var circle = (numEl.closest && numEl.closest('.rp-score-circle')) || document.querySelector('.rp-score-circle');
      if (circle) circle.classList.add('pop');
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(step);
}

// ── 分享后再玩一次 ───────────────────────────────────────────────────
function shareForExtra(gameType) {
  var shareUrl = 'https://lunarveilastro.github.io/lunarveil-astro/';

  // 触发分享 / 复制链接（不阻塞 UI）
  // 仅在移动端/触屏用原生分享；电脑端直接静默复制链接，避免弹出系统分享框、取消后卡顿
  var preferNativeShare = navigator.share && window.isSecureContext &&
    (/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent) ||
     (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
  if (preferNativeShare) {
    navigator.share({
      title: _t('share.title'),
      text: _t('share.text'),
      url: shareUrl
    }).catch(function() {});
  } else {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).catch(function() {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.style.cssText = 'position:fixed;left:-9999px;';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(e) {}
        document.body.removeChild(ta);
      }
    } catch(e) {}
  }

  // 任何分享动作都解锁再玩一次：清当日记录并立即重新开始（无次数限制、不显示剩余次数）
  replayGame(gameType);
  showCopyMessage();
}

function showCopyMessage() {
  var modal = document.getElementById('gameModal');
  if (!modal) return;
  var exist = document.getElementById('copyMsg');
  if (exist) return;
  var msg = document.createElement('p');
  msg.id = 'copyMsg';
  msg.style.cssText = 'color:#7ab87a;font-size:0.82em;margin-top:8px;';
  msg.textContent = _t('share.linkCopied');
  modal.appendChild(msg);
}

function replayGame(gameType) {
  updateLodgeBadges();
  if (gameType === 'rp') openDailyRP();
  else if (gameType === 'temple') openTempleFortune();
  else openTempleFortune();
}

function renderShareButton(gameType) {
  var label = gameType === 'rp'
    ? _L('分享后再测一次','Share to Check Again')
    : _L('分享后再抽一次','Share to Draw Again');
  return '<button class="share-btn" onclick="event.stopPropagation();shareForExtra(\'' + gameType + '\')">📤 '+label+'</button>';
}

// ── 寺庙求签 ───────────────────────────────────────────────────────────
var _templeSystemId = 'guanyin';
var _templeShaking = false;

function openTempleFortune() {
  if (typeof TEMPLE_SLIPS_GUANYIN_ZH === 'undefined') {
    loadScript(DATA_JS).catch(function(){});
  }
  var html = '<h3>' + _t('lodge.templeFortune') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.82em;margin-bottom:14px;">' + _L('选择一套灵签系统，心中默念所求之事，然后摇签','Choose an oracle, hold your question in mind, then draw.') + '</p>';
  html += '<div class="temple-system-grid">';
  var systems = [
    {id:'guanyin',icon:'🪷',name:_L('观音灵签','Guanyin Oracle'),desc:_L('慈悲指引 · 姻缘 家庭 健康 求心安','Compassionate — love, family, health, peace of mind')},
    {id:'guandi',icon:'⚔️',name:_L('关帝灵签','Guandi Oracle'),desc:_L('刚毅决断 · 事业 财运 重大决策','Heroic — career, wealth, major decisions')},
    {id:'lvzu',icon:'☯️',name:_L('吕祖灵签','Lüzu Oracle'),desc:_L('玄妙哲理 · 学业 修行 人生方向','Taoist wisdom — study, self-cultivation, life direction')}
  ];
  for (var i=0; i<systems.length; i++) {
    var s = systems[i];
    html += '<div class="temple-system-card" onclick="startTempleDraw(\'' + s.id + '\')">';
    html += '<div class="temple-system-icon">' + s.icon + '</div>';
    html += '<div><div class="temple-system-name">' + s.name + '</div>';
    html += '<div class="temple-system-desc">' + s.desc + '</div></div>';
    html += '</div>';
  }
  html += '</div>';
  showGameModal(html);
  document.getElementById('gameModal').style.background = '#16081c';
}

function startTempleDraw(systemId) {
  if (typeof TEMPLE_SLIPS_GUANYIN_ZH === 'undefined') {
    loadScript(DATA_JS).then(function(){ startTempleDraw(systemId); }).catch(function(e){ console.error(e); });
    return;
  }
  var systemNames = {guanyin:_L('观音灵签','Guanyin Oracle'),guandi:_L('关帝灵签','Guandi Oracle'),lvzu:_L('吕祖灵签','Lüzu Oracle')};
  _templeSystemId = systemId;
  _templeShaking = false;
  var html = '<h3>' + systemNames[systemId] + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.82em;margin-bottom:14px;">' + _L('心中默念所求之事，点击签筒求签','Hold your question in mind, then click the cylinder to draw.') + '</p>';
  html += '<div class="temple-tube" id="templeTube" onclick="shakeTempleTube()"></div>';
  html += '<p style="color:var(--text-dim);font-size:0.78em;">' + _L('点击签筒摇签','Click the cylinder to draw') + '</p>';
  showGameModal(html);
  document.getElementById('gameModal').style.background = '#16081c';
}

function shakeTempleTube() {
  if (_templeShaking) return;
  if (typeof TEMPLE_SLIPS_GUANYIN_ZH === 'undefined') {
    loadScript(DATA_JS).then(shakeTempleTube).catch(function(e){ console.error(e); });
    return;
  }
  _templeShaking = true;
  var tube = document.getElementById('templeTube');
  if (!tube) { revealTempleSlip(); return; }
  tube.classList.add('shaking');
  var done = false;
  var finish = function() { if (done) return; done = true; if (!_gameModalShown()) { _templeShaking = false; return; } revealTempleSlip(); };
  tube.addEventListener('animationend', finish, {once:true});
  setTimeout(finish, 1100);
}

function drawTempleSlip(systemId) {
  var pool;
  if (systemId === 'guanyin') pool = TEMPLE_SLIPS_GUANYIN();
  else if (systemId === 'guandi') pool = TEMPLE_SLIPS_GUANDI();
  else pool = TEMPLE_SLIPS_LVZU();
  return pool[Math.floor(Math.random() * pool.length)];
}

function revealTempleSlip() {
  var slip = drawTempleSlip(_templeSystemId);
  var systemNames = {guanyin:_L('观音灵签','Guanyin Oracle'),guandi:_L('关帝灵签','Guandi Oracle'),lvzu:_L('吕祖灵签','Lüzu Oracle')};
  var html = '<h3>' + systemNames[_templeSystemId] + '</h3>';
  html += renderTempleSlipResult(slip);
  if (chartData1) { html += generateFortuneAnnotation(); }
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">';
  html += renderShareButton('temple');
  html += '<button class="share-btn" onclick="event.stopPropagation();downloadTempleCard()" style="background:rgba(200,160,100,0.15);border:1px solid rgba(200,160,100,0.4);">📥 '+_L('下载分享卡片','Download Share Card')+'</button>';
  html += '</div>';
  html += '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">📕</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">'+_L('每日运势推送','Daily Fortune Updates')+'</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">'+_L('关注小红书 <strong style="color:#d4b870;">LunarVeilAstro</strong> 全平台同名','Follow <strong style="color:#d4b870;">LunarVeilAstro</strong> on Xiaohongshu')+'</div></div><a href="https://www.xiaohongshu.com/user/LunarVeilAstro" target="_blank" rel="noopener" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;text-decoration:none;font-weight:bold;white-space:nowrap;">'+_L('去关注 →','Follow →')+'</a></div>';
  document.getElementById('gameModal').innerHTML = '<button class="game-close" onclick="closeGameModal()">✕</button>' + html;
  document.getElementById('gameModal').style.background = '#16081c';
  _templeShaking = false;
}

function renderTempleSlipResult(slip) {
  var r = '<div class="temple-slip-card">';
  r += '<div class="temple-slip-glow"></div>';
  r += '<div class="temple-slip-content">';

  // 顶部：品牌 + 签号
  r += '<div class="ts-top">';
  r += '<span class="ts-brand">LunarVeilAstro</span>';
  r += '<span class="ts-num">' + _L('第','#') + slip.id + _L('签','') + '</span>';
  r += '</div>';

  // 等第徽章
  var levelClass = 'ts-level-common';
  if (slip.level === '上上签' || slip.level === 'Supreme') levelClass = '';
  else if (slip.level === '上签' || slip.level === 'Excellent' || slip.level === '上吉') levelClass = 'ts-level-good';
  r += '<div class="ts-level"><span class="ts-level-badge ' + levelClass + '">' + slip.level + '</span></div>';

  // 签题
  r += '<div class="ts-title">' + slip.title + '</div>';

  // 签诗 + 白话
  r += '<div class="ts-poem-block">';
  var poemLines = slip.poem.split('\n');
  if (poemLines.length === 4) {
    r += '<div class="ts-poem-cols">';
    r += '<div class="ts-poem-col">' + poemLines[0] + '<br>' + poemLines[1] + '</div>';
    r += '<div class="ts-poem-sep">│</div>';
    r += '<div class="ts-poem-col">' + poemLines[2] + '<br>' + poemLines[3] + '</div>';
    r += '</div>';
  } else {
    r += '<div class="ts-poem-text">' + slip.poem.replace(/\n/g,'<br>') + '</div>';
  }
  r += '<div class="ts-vernacular">' + slip.vernacular + '</div>';
  r += '</div>';

  // 解签 + 宜忌 同格
  r += '<div class="ts-interp-section"><div class="ts-interp-grid">';
  var cats = [
    {key:'career',label:_L('事业','Career')},{key:'love',label:_L('姻缘','Love')},
    {key:'wealth',label:_L('财运','Wealth')},{key:'health',label:_L('健康','Health')},
    {key:'study',label:_L('学业','Study')},{key:'family',label:_L('家宅','Family')}
  ];
  for (var i=0; i<cats.length; i++) {
    r += '<div class="ts-interp-item">';
    r += '<span class="ts-interp-label">' + cats[i].label + '</span>';
    r += '<span class="ts-interp-text">' + (slip.interpretation[cats[i].key] || '') + '</span>';
    r += '</div>';
  }
  // 宜忌 — 左列
  r += '<div class="ts-interp-item ts-interp-dosdonts">';
  r += '<div class="ts-dos">' + slip.dos + '</div>';
  r += '<div class="ts-donts">' + slip.donts + '</div>';
  r += '<div class="ts-lucky-bar">';
  r += _L('幸运色','Lucky Color') + '：' + slip.luckyColor + '　';
  r += _L('幸运数','Lucky Num') + '：' + slip.luckyNum + '　';
  r += _L('方位','Direction') + '：' + slip.luckyDir;
  r += '</div>';
  r += '</div>';
  // 整体 — 右列
  r += '<div class="ts-interp-item ts-interp-overall">';
  r += '<span class="ts-interp-label">' + _L('整体','Overall') + '</span>';
  r += '<span class="ts-interp-text">' + (slip.interpretation['overall'] || '') + '</span>';
  r += '</div>';
  r += '</div></div>';

  // 底部
  r += '<div class="ts-footer">LunarVeilAstro · ' + _L('宇宙回声','Cosmic Echo') + '</div>';

  r += '</div></div>';
  return r;
}

function downloadTempleCard() {
  var node = document.querySelector('.temple-slip-card');
  if (!node) return;
  if (typeof htmlToImage === 'undefined') { alert(_L('加载中，请稍后再试','Loading, please try again.')); return; }
  var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  htmlToImage.toPng(node, {pixelRatio:2, backgroundColor:'#1e0d1a'})
    .then(function(dataUrl) {
      if (isIOS) {
        showIOSImagePreview(dataUrl);
      } else {
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'LunarVeilAstro_求签_' + new Date().toISOString().slice(0,10) + '.png';
        a.click();
      }
    })
    .catch(function(e) { console.error(e); alert(_L('下载失败，请重试','Download failed, please retry.')); });
}

function showIOSImagePreview(dataUrl) {
  var overlay = document.createElement('div');
  overlay.className = 'ios-preview-overlay';
  overlay.innerHTML =
    '<div class="ios-preview-box">' +
    '<button class="ios-preview-close" onclick="this.closest(\'.ios-preview-overlay\').remove()">✕</button>' +
    '<img src="' + dataUrl + '" alt="' + _L('求签卡片','Temple Slip') + '" class="ios-preview-img" />' +
    '<p class="ios-preview-hint">' + _L('长按上方图片 → 保存到相册','Long press the image → Save to Photos') + '</p>' +
    '</div>';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.getElementById('gameModal').appendChild(overlay);
}

// Initialize badges on load
updateLodgeBadges();

