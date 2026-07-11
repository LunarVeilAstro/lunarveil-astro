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
    ? '<div class="fortune-annotation" style="margin-top:12px;padding:10px 14px;background:rgba(201,169,110,0.08);border-left:3px solid var(--gold);border-radius:4px;font-size:0.82em;color:var(--accent);line-height:1.6;">✨ Chart-Specific Insight: Transiting ' + transitName + ' is forming a ' + aspectName + ' with your ' + insight.nt.nameEN + ' — this fortune slip applies especially to your ' + hName + '. ' + sunSign + ', today is for quiet inner reflection — follow the stars\' guidance.</div>'
    : '<div class="fortune-annotation" style="margin-top:12px;padding:10px 14px;background:rgba(201,169,110,0.08);border-left:3px solid var(--gold);border-radius:4px;font-size:0.82em;color:var(--accent);line-height:1.6;">✨ 星盘专属解读：行运' + transitName + '正' + insight.aspectName + '你的' + insight.nt.name + '——这张签文对你的' + hName + '尤其适用。' + sunSign + '今日宜静心内观，跟随星辰指引。</div>');
}

// ── Badge update ──────────────────────────────────────────────────────
function updateLodgeBadges() {
  const today = todayKey();
  const fb = document.getElementById('fortuneBadge');
  const rb = document.getElementById('rpBadge');
  if (fb) {
    const drawn = localStorage.getItem('fortune_date'+personKey()) === today && localStorage.getItem('fortune_slip'+personKey());
    const extra = parseInt(localStorage.getItem('fortune_extra_'+today+personKey()) || '0');
    if (drawn && extra <= 0) { fb.textContent = _t('fortune.drawnToday'); fb.classList.add('used'); }
    else if (extra > 0) { fb.textContent = _t('fortune.remaining', {count: extra+1}); fb.classList.remove('used'); }
    else { fb.textContent = _t('fortune.available'); fb.classList.remove('used'); }
  }
  if (rb) {
    const checked = localStorage.getItem('rp_date'+personKey()) === today;
    if (checked) { rb.textContent = _t('lodge.badge.rpChecked'); rb.classList.add('used'); }
    else { rb.textContent = _t('lodge.badge.rpAvailable'); rb.classList.remove('used'); }
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
  const today = todayKey();
  const lastDate = localStorage.getItem('fortune_date'+personKey());
  let extra = parseInt(localStorage.getItem('fortune_extra_'+today+personKey()) || '0');

  if (lastDate === today && localStorage.getItem('fortune_slip'+personKey()) && extra <= 0) {
    let slipIdx = parseInt(localStorage.getItem('fortune_slip'+personKey()));
    if (isNaN(slipIdx)) { localStorage.removeItem('fortune_slip'+personKey()); openDailyFortune(); return; }
    let html = '<h3>' + _t('lodge.dailyFortune') + '</h3>';
    html += '<p style="color:var(--text-dim);font-size:0.85em;">' + _t('fortune.alreadyDrawn') + '</p>';
    html += renderFortuneResult(slipIdx);
    if (chartData1) {
      const annotation = localStorage.getItem('fortune_annotation'+personKey());
      if (annotation) html += annotation;
    }
    html += renderShareButton('fortune');
    showGameModal(html);
    return;
  }

  if (extra > 0) {
    extra--;
    if (extra <= 0) localStorage.removeItem('fortune_extra_'+today+personKey());
    else localStorage.setItem('fortune_extra_'+today+personKey(), extra);
  }

  let html = '<h3>' + _t('lodge.dailyFortune') + '</h3>';
  html += '<div class="fortune-tube" id="fortuneTube" onclick="revealFortune()"></div>';
  html += '<p style="color:var(--text-dim);font-size:0.82em;">' + _t('fortune.drawHint') + '</p>';
  showGameModal(html);
}

function revealFortune() {
  const slipIdx = drawFortuneSlip();
  localStorage.setItem('fortune_date'+personKey(), todayKey());
  localStorage.setItem('fortune_slip'+personKey(), String(slipIdx));

  let html = '<h3>' + _t('lodge.dailyFortune') + '</h3>';
  html += renderFortuneResult(slipIdx);
  if (chartData1) {
    const annotation = generateFortuneAnnotation();
    localStorage.setItem('fortune_annotation'+personKey(), annotation);
    html += annotation;
  } else {
    localStorage.removeItem('fortune_annotation'+personKey());
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
  const today = todayKey();
  const lastDate = localStorage.getItem('rp_date'+personKey());

  if (lastDate === today) {
    const score = parseInt(localStorage.getItem('rp_score'+personKey()) || '50');
    const personalized = localStorage.getItem('rp_personalized'+personKey()) === 'true' && chartData1;
    let html = '<h3>' + _t('lodge.dailyRP') + '</h3>';;
    html += '<p style="color:var(--text-dim);font-size:0.85em;">'+_L('你今天已经查过啦','You\'ve already checked today')+'</p>';
    html += renderRPResult(score, personalized);
    html += renderShareButton('fortune');
    html += '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">💬</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">'+_L('每日专属解读','Daily Personal Reading')+'</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">'+_L('加微信 <strong style="color:#d4b870;">LunarVeilAstro</strong> 一对一专属解读','Add <strong style="color:#d4b870;">LunarVeilAstro</strong> on WeChat for a personal reading')+'</div></div><span onclick="copySocial(\'微信\',\'LunarVeilAstro\')" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;font-weight:bold;white-space:nowrap;">'+_L('复制微信号','Copy WeChat ID')+'</span></div>';
    showGameModal(html);
    return;
  }

  let score, personalized = false;
  if (chartData1) {
    score = computeTransitWeightedRP();
    personalized = true;
    localStorage.setItem('rp_personalized'+personKey(), 'true');
  } else {
    score = Math.floor(Math.random() * 101);
    localStorage.setItem('rp_personalized'+personKey(), 'false');
  }
  localStorage.setItem('rp_date'+personKey(), today);
  localStorage.setItem('rp_score'+personKey(), score);

  let html = '<h3>' + _t('lodge.dailyRP') + '</h3>';;
  html += renderRPResult(score, personalized);
  html += renderShareButton('fortune');
  html += '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">💬</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">'+_L('每日专属解读','Daily Personal Reading')+'</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">'+_L('加微信 <strong style="color:#d4b870;">LunarVeilAstro</strong> 一对一专属解读','Add <strong style="color:#d4b870;">LunarVeilAstro</strong> on WeChat for a personal reading')+'</div></div><span onclick="copySocial(\'微信\',\'LunarVeilAstro\')" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;font-weight:bold;white-space:nowrap;">'+_L('复制微信号','Copy WeChat ID')+'</span></div>';
  showGameModal(html);
}

function renderRPResult(score, personalized) {
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

  let r = '<div class="rp-score-circle">';
  r += '<div class="rp-score-num">' + score + '</div>';
  r += '<div class="rp-score-label">' + _t('rp.title') + '</div>';
  r += '</div>';
  r += '<div class="rp-comment">' + tier.emoji + ' ' + _ta('rp.tiers', rpLabelIdx) + '</div>';
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

// ── 分享得次数 ───────────────────────────────────────────────────────
function shareForExtra(gameType) {
  const today = todayKey();

  if (navigator.share) {
    navigator.share({
      title: _t('share.title'),
      text: _t('share.text'),
      url: window.location.href
    }).then(() => {
      grantExtra(gameType);
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      grantExtra(gameType);
      const modal = document.getElementById('gameModal');
      const exist = document.getElementById('copyMsg');
      if (!exist) {
        const msg = document.createElement('p');
        msg.id = 'copyMsg';
        msg.style.cssText = 'color:#7ab87a;font-size:0.82em;margin-top:8px;';
        msg.textContent = _t('share.linkCopied');
        modal.appendChild(msg);
      }
    }).catch(() => {});
  }
}

function grantExtra(gameType) {
  const today = todayKey();
  if (gameType === 'fortune') {
    const cur = parseInt(localStorage.getItem('fortune_extra_'+today+personKey()) || '0');
    localStorage.setItem('fortune_extra_'+today+personKey(), cur + 1);
  }
  updateLodgeBadges();
}

function renderShareButton(gameType) {
  return '<button class="share-btn" onclick="event.stopPropagation();shareForExtra(\'' + gameType + '\')">📤 '+_L('分享得次数','Share for Extra Draw')+'</button>';
}

// Initialize badges on load
updateLodgeBadges();

