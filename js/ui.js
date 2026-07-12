// ui.js — Error trap, formatting, geocoding, tab rendering, export
// Global state: chartData1, chartData2
// Depends on: ALL other modules (loaded last)
// ── Error trap: log to console only, not visible to visitors ────────────
window.onerror = function(msg, url, line, col, err) {
  console.error('JS Error line ' + line + ': ' + msg, err || '');
};
window.addEventListener('unhandledrejection', function(e) {
  console.error('Promise Error: ' + String(e.reason));
});



// ═══════════════════════════════════════════════════════════════════════════
//  FORMATTING
// ═══════════════════════════════════════════════════════════════════════════
function degToSign(deg) {
  deg = mod360(deg);
  const si = Math.floor(deg / 30) % 12;
  const pos = deg % 30;
  const d = Math.floor(pos);
  const m = Math.floor((pos - d) * 60);
  return { si, d, m };
}

function formatPos(deg) {
  const { si, d, m } = degToSign(deg);
  return `${getSignName(si)} ${d}°${String(m).padStart(2,'0')}′`;
}

// ── Social引流 helpers ─────────────────────────────────────────────────────
function copySocial(platform, id) {
  navigator.clipboard.writeText(id).then(function() {
    var chips = document.querySelectorAll('.lock-contact-chip');
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].textContent.indexOf(id) >= 0) {
        chips[i].classList.add('copied');
        var orig = chips[i].innerHTML;
        chips[i].innerHTML = _t('social.copied') + ' ' + platform;
        setTimeout(function() { chips[i].classList.remove('copied'); chips[i].innerHTML = orig; }, 2000);
      }
    }
    // Also handle floating sidebar items
    var fItems = document.querySelectorAll('.social-float-item');
    for (var j = 0; j < fItems.length; j++) {
      if (fItems[j].textContent.indexOf(id) >= 0) {
        var sfId = fItems[j].querySelector('.sf-id');
        if (sfId) { var orig2 = sfId.textContent; sfId.textContent = _L('✓ 已复制','✓ Copied'); sfId.style.color = '#5a8'; setTimeout(function() { sfId.textContent = orig2; sfId.style.color = ''; }, 2000); }
      }
    }
  }).catch(function() {
    alert(_L(platform + '号：' + id + '\n请手动复制', platform + ': ' + id + '\nPlease copy manually'));
  });
}

function renderLockedBlock(title, desc, contacts) {
  var h = '<div class="locked-block">';
  h += '<div class="lock-icon">🔒</div>';
  h += '<div class="lock-title">' + title + '</div>';
  h += '<div class="lock-desc">' + desc + '</div>';
  h += '<div class="lock-contacts">';
  for (var i = 0; i < contacts.length; i++) {
    var c = contacts[i];
    h += '<span class="lock-contact-chip" onclick="copySocial(\'' + c.platform + '\',\'' + c.id + '\')"><span class="lc-icon">' + c.icon + '</span>' + c.platform + '：' + c.id + '</span>';
  }
  h += '</div></div>';
  return h;
}

function renderSocialTeaser(icon, title, sub, actionText, onClick) {
  var h = '<div class="social-teaser">';
  h += '<div class="st-icon">' + icon + '</div>';
  h += '<div class="st-text"><div class="st-title">' + title + '</div><div class="st-sub">' + sub + '</div></div>';
  h += '<span class="st-action" onclick="' + onClick + '">' + actionText + '</span>';
  h += '</div>';
  return h;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN — Calculate & Render
// ═══════════════════════════════════════════════════════════════════════════

// ── Geocoding (Nominatim, free, no API key) ──────────────────────────────
async function geocode(prefix) {
  const addrInput = document.getElementById(prefix + '_addr');
  const statusEl = document.getElementById(prefix + '_geo_status');
  const query = addrInput.value.trim();
  if (!query) { statusEl.textContent = _t('geo.enterCity'); statusEl.className = 'geo-status error'; return; }

  statusEl.textContent = _t('geo.loading');
  statusEl.className = 'geo-status loading';

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=${(window._lang && window._lang() === 'en') ? 'en' : 'zh'}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'AstroChart/1.0' } });
    const data = await resp.json();
    if (data.length === 0) throw new Error(_L('未找到该地点','Location not found'));

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    const displayName = data[0].display_name || query;

    document.getElementById(prefix + '_lat').value = lat.toFixed(4);
    document.getElementById(prefix + '_lng').value = lng.toFixed(4);

    // Auto-detect timezone: China always UTC+8, otherwise lon/15 approx
    const isChina = data[0].display_name && data[0].display_name.includes('中国');
    const estTz = isChina ? 8 : Math.round(lng / 15);
    const tzSelect = document.getElementById(prefix + '_tz');
    let found = false;
    for (let i = 0; i < tzSelect.options.length; i++) {
      if (parseFloat(tzSelect.options[i].value) === estTz) {
        tzSelect.selectedIndex = i; found = true; break;
      }
    }
    if (!found && estTz === 8) tzSelect.value = '8';

    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lng >= 0 ? 'E' : 'W';
    const tzSign = estTz >= 0 ? '+' : '';
    statusEl.textContent = `✅ ${displayName.split(',')[0]} · ${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lng).toFixed(2)}°${ew} · UTC${tzSign}${estTz}`;
    statusEl.className = 'geo-status success';
  } catch (e) {
    statusEl.textContent = _t('geo.fail');
    statusEl.className = 'geo-status error';
    document.getElementById(prefix + '_manual').style.display = 'block';
  }
}

function toggleP2() {
  const content = document.getElementById('p2Content');
  const icon = document.getElementById('p2ToggleIcon');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▼';
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
  }
}

function getInputValues(prefix) {
  const dateVal = document.getElementById(prefix + '_date').value;
  const timeVal = document.getElementById(prefix + '_time').value;
  const tzVal = parseFloat(document.getElementById(prefix + '_tz').value);
  let lat = parseFloat(document.getElementById(prefix + '_lat').value);
  let lng = parseFloat(document.getElementById(prefix + '_lng').value);

  // Fallback to manual entry if geocoding failed
  if (isNaN(lat) || isNaN(lng)) {
    lat = parseFloat(document.getElementById(prefix + '_lat_m').value);
    lng = parseFloat(document.getElementById(prefix + '_lng_m').value);
  }

  if (!dateVal || !timeVal || isNaN(lat) || isNaN(lng)) return null;

  const [y, m, d] = dateVal.split('-').map(Number);
  const [hh, mm] = timeVal.split(':').map(Number);
  const localH = hh + mm / 60;
  const utcH = localH - tzVal;

  return { y, m, d, utcH, lat, lng };
}


let chartData1 = null;
let chartData2 = null;

// ── Progress ring helpers ──────────────────────────────────────────────
  var _ritualTotal = 16;
  var _ritualFilled = 0;
  var _ritualTimer = null;
  var _ritualCallback = null;

  function _buildProgressRing() {
    var container = document.getElementById('ritualProgress');
    if (!container) return;
    var n = _ritualTotal;
    var r = 60; // radius
    var cx = 70, cy = 70;
    var html = '';
    for (var i = 0; i < n; i++) {
      var angle = (i / n) * Math.PI * 2 - Math.PI / 2; // start from top
      var x = cx + r * Math.cos(angle) - 6;
      var y = cy + r * Math.sin(angle) - 6;
      html += '<div class="ritual-dot" id="rdot' + i + '" style="left:' + x + 'px;top:' + y + 'px;"></div>';
    }
    // Center: Astrolabe with moon
    html += '<div class="ritual-astrolabe">';
    html += '<div class="ritual-ring ring-outer"></div>';
    html += '<div class="ritual-ring ring-inner"></div>';
    html += '<div class="ritual-ring ring-core"></div>';
    html += '<div class="ritual-center-moon">🌙</div>';
    html += '</div>';
    container.innerHTML = html;
  }

  function _startProgress(callback) {
    _ritualFilled = 0;
    _ritualCallback = callback;
    var phraseEl = document.getElementById('ritualPhrase');
    phraseEl.textContent = _L('星辰正在排列...','The stars are aligning...');
	phraseEl.style.opacity = '1';

    _fillNextDot();
  }

  function _fillNextDot() {
    var dot = document.getElementById('rdot' + _ritualFilled);
    if (dot) { dot.classList.add('filled'); }
    _ritualFilled++;

    if (_ritualFilled >= _ritualTotal) {
      _onProgressComplete();
    } else {
      _ritualTimer = setTimeout(_fillNextDot, 110);
    }
  }

  function _finishProgress() {
    if (_ritualTimer) { clearTimeout(_ritualTimer); _ritualTimer = null; }
    // Quickly fill remaining dots
    var fastFill = function() {
      var dot = document.getElementById('rdot' + _ritualFilled);
      if (dot) { dot.classList.add('filled'); dot.style.transition = 'all 0.15s'; }
      _ritualFilled++;
      if (_ritualFilled >= _ritualTotal) {
        _onProgressComplete();
      } else {
        setTimeout(fastFill, 50);
      }
    };
    fastFill();
  }

  function _onProgressComplete() {
    // Flash all dots green
    for (var i = 0; i < _ritualTotal; i++) {
      var d = document.getElementById('rdot' + i);
      if (d) { d.classList.add('complete'); }
    }
    var astrolabe = document.querySelector('.ritual-astrolabe');
    if (astrolabe) { astrolabe.classList.add('complete'); }
    var phraseEl = document.getElementById("ritualPhrase");
	phraseEl.style.opacity = '0';
    setTimeout(function() {
      phraseEl.textContent = _L('星盘已就绪 ✦','Chart Ready ✦');
      phraseEl.style.opacity = '1';
    }, 250);

    setTimeout(function() {
      if (_ritualCallback) _ritualCallback();
    }, 800);
  }

function calculateAll() {
  try {
    const d1 = getInputValues('p1');
    if (!d1) { alert(_t('error.fillInfo')); return; }

    // Show overlay and build progress ring
    const overlay = document.getElementById('ritualOverlay');
    overlay.style.display = 'flex';
    _buildProgressRing();

    var computed = false;
    function onBothReady() {
      if (!computed) return;
      _finishProgress();
    }

    _startProgress(function() {
      // Called when ALL dots filled — show results
      document.getElementById('resultsCard').style.display = 'block';

      renderTab0(); renderTab1(); renderTab2(); renderTab3();
      renderTab4(); renderTab5(); renderTab6(); renderTab7();

      overlay.style.transition = 'opacity 0.6s';
      overlay.style.opacity = '0';
      setTimeout(function() {
        overlay.style.display = 'none';
        overlay.style.opacity = '1';
        overlay.style.transition = '';
      }, 600);

      document.getElementById('resultsCard').style.opacity = '0';
      document.getElementById('resultsCard').style.transition = 'opacity 1s';
      document.getElementById('resultsCard').scrollIntoView({behavior:'smooth'});
      switchTab(chartData2 ? 2 : 0);
      setTimeout(function() {
        document.getElementById('resultsCard').style.opacity = '1';
      }, 200);

      document.getElementById('btnPdf').style.display = 'inline-block';
      document.getElementById('btnEmail').style.display = 'inline-block';
      document.getElementById('btnCopyMobile').style.display = 'inline-block';

      var hint = document.getElementById('lodgeChartHint');
          if (hint) {
            hint.innerHTML = _t('lodge.chartHintLinked');
            hint.classList.add('linked');
          }

          // Collapse input card, show summary bar
          collapseInputCard();
        });

    // Compute charts while progress dots fill
    setTimeout(function() {
      try {
        chartData1 = computeChart(d1);
        var d2 = getInputValues('p2');
        chartData2 = d2 ? computeChart(d2) : null;
        computed = true;
        onBothReady();
      } catch(e) {
        if (_ritualTimer) clearTimeout(_ritualTimer);
        overlay.style.display = 'none';
        document.getElementById('resultsCard').style.display = 'block';
        document.getElementById('tab0').innerHTML = '<p style="color:#c87070;padding:20px;">' + _t('error.calculate') + e.message + '</p>';
        console.error(e);
      }
    }, 80);

  } catch(e) {
    document.getElementById('resultsCard').style.display = 'block';
    document.getElementById('tab0').innerHTML = '<p style="color:#c87070;padding:20px;">' + _t('error.calculate') + e.message + '</p>';
    console.error(e);
  }
}

// ── Tab 0: Natal Chart ────────────────────────────────────────────────────
function renderTab0() {
  try {
  const d = chartData1;
  let html = '';

  // ═══ Blueprint Summary Card ═══
  const ec = {火:0,土:0,风:0,水:0};
  const mc2 = {开创:0,固定:0,变动:0};
  for (const p of PLANETS) {
    const {si} = degToSign(d.positions[p.id]);
    ec[ELEMENTS[si]]++;
    mc2[MODES[si]]++;
  }
  const sortedElem = Object.entries(ec).sort((a,b)=>b[1]-a[1]);
  const domElem = sortedElem[0];
  const weakElem = sortedElem[3];
  const sortedMode = Object.entries(mc2).sort((a,b)=>b[1]-a[1]);
  const domMode = sortedMode[0];
  const sunSign = degToSign(d.positions.Sun).si;
  const moonSign = degToSign(d.positions.Moon).si;
  const ascSign = degToSign(d.asc).si;
  const stelliums = detectStelliums(d.positions, d.houses);
  const keyPatterns = detectKeyPatterns(d.positions, d.aspects);

  const isEn = window._lang && window._lang() === 'en';

  html += '<div class="blueprint-card">';
  html += '<h3>' + _L('✦ 灵魂蓝图','✦ Soul Blueprint') + '</h3>';

  // Element & mode summary
  html += '<div class="blueprint-stat-row">';
  html += '<div class="blueprint-stat"><div class="stat-val">' + _L(domElem[0]+'象主导', ELEMENTS_EN[domElem[0]]+' Dominant') + '</div><div class="stat-lbl">' + domElem[1] + _L('颗行星 · ',' planets · ') + _L(domMode[0]+'星座', MODES_EN[domMode[0]]) + '</div></div>';
  if (weakElem[1] <= 1) {
    html += '<div class="blueprint-stat"><div class="stat-val">' + _L(weakElem[0]+'元素薄弱', ELEMENTS_EN[weakElem[0]]+' Weak') + '</div><div class="stat-lbl">' + _L((weakElem[1]===0?'完全缺失':'仅'+weakElem[1]+'颗')+' · 此生的修行之地', (weakElem[1]===0?'Completely absent':'Only '+weakElem[1])+' · Your life\'s cultivation ground') + '</div></div>';
  }
  html += '</div>';

  // Sun/Moon/Asc core
  html += '<div class="blueprint-stat-row">';
  html += '<div class="blueprint-stat"><div class="stat-val">☉ ' + getSignNamePure(sunSign) + '</div><div class="stat-lbl">' + _L('太阳','Sun') + ' · ' + _L('第','House ') + (d.houses.Sun||'?') + '</div></div>';
  html += '<div class="blueprint-stat"><div class="stat-val">☽ ' + getSignNamePure(moonSign) + '</div><div class="stat-lbl">' + _L('月亮','Moon') + ' · ' + _L('第','House ') + (d.houses.Moon||'?') + '</div></div>';
  html += '<div class="blueprint-stat"><div class="stat-val">ASC ' + getSignNamePure(ascSign) + '</div><div class="stat-lbl">' + _L('上升星座','Ascendant Sign') + '</div></div>';
  html += '</div>';

  // Stelliums
  if (stelliums.length > 0) {
    html += '<div class="blueprint-stat-row">';
    for (const s of stelliums) {
      html += '<div class="blueprint-stat"><div class="stat-val">⭐ ' + (isEn ? (s.enLabel||s.label) : s.label) + '</div><div class="stat-lbl">' + s.planets.map(p=>p.name).join(isEn?', ':'、') + ' ' + _L('汇聚','converge') + '</div></div>';
    }
    html += '</div>';
  }

  // Key patterns count
  if (keyPatterns.length > 0) {
    html += '<div class="blueprint-stat-row">';
    html += '<div class="blueprint-stat"><div class="stat-val">🔮 ' + keyPatterns.length + _L('个关键格局',' Key Patterns') + '</div><div class="stat-lbl">' + keyPatterns.map(k=>isEn?(k.enName||k.name):k.name).join(isEn?', ':'、') + '</div></div>';
    html += '</div>';
  }

  html += '<button class="blueprint-expand-btn" onclick="expandNatalReport()">' + _t('btn.expandReport') + '</button>';
  html += '</div>';

  // ═══ Hidden full report ═══
  html += '<div id="fullNatalReport">';
  html += generateDeepNatalReport(d.positions, d.houses, d.aspects, d.asc, d.mc);
  html += '</div>';

  // ═══ Technical tables (initially hidden) ═══
  html += '<div style="text-align:center;margin-top:18px;">';
  html += '<button class="blueprint-expand-btn" onclick="toggleDataTables()" id="btnToggleData" style="font-size:0.85em;padding:8px 24px;">' + _t('btn.viewChartData') + '</button>';
  html += '</div>';

  html += '<div id="dataTablesWrap" style="opacity:0;max-height:0;overflow:hidden;transition:opacity 0.8s ease,max-height 0s 0.8s;">';
  html += '<div class="report-section" style="margin-top:24px;">';
  html += '<h3 style="color:var(--text-dim);">' + _t('natal.section.data') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">' + _t('natal.section.dataSub') + '</p>';

  html += '<div style="overflow-x:auto;">';
  html += '<table class="chart-table">';
  html += '<thead><tr><th>' + _t('table.planet') + '</th><th>' + _t('table.position') + '</th><th>' + _t('table.house') + '</th><th>' + _t('table.element') + '</th><th>' + _t('table.mode') + '</th></tr></thead><tbody>';
  for (const p of PLANETS) {
    const lon = d.positions[p.id];
    const {si, d:dd, m} = degToSign(lon);
    const h = d.houses[p.id] || '?';
    const elem = ELEMENTS[si], mode = MODES[si];
    const tagCls = elem==='火'?'tag-fire':elem==='土'?'tag-earth':elem==='风'?'tag-air':'tag-water';
    html += `<tr>
      <td>${p.name}</td>
      <td>${getSignName(si)} ${dd}°${String(m).padStart(2,'0')}′</td>
      <td>` + _L('第'+h+'宫','House '+h) + `</td>
      <td><span class="tag ${tagCls}">` + _L(elem, ELEMENTS_EN[elem]) + `</span></td>
      <td>` + _L(mode, MODES_EN[mode]) + `</td>
    </tr>`;
  }
  html += '</tbody></table>';

  html += '<table class="chart-table" style="margin-top:8px;">';
  html += '<thead><tr><th>' + _L('轴点','Axis') + '</th><th>' + _L('位置','Position') + '</th><th></th><th></th><th></th></tr></thead><tbody>';
  html += `<tr><td>ASC ` + _L('上升','Ascendant') + `</td><td>${formatPos(d.asc)}</td><td></td><td></td><td></td></tr>`;
  html += `<tr><td>MC ` + _L('天顶','Midheaven') + `</td><td>${formatPos(d.mc)}</td><td></td><td></td><td></td></tr>`;
  html += `<tr><td>DSC ` + _L('下降','Descendant') + `</td><td>${formatPos(mod360(d.asc+180))}</td><td></td><td></td><td></td></tr>`;
  html += `<tr><td>IC ` + _L('天底','Imum Coeli') + `</td><td>${formatPos(mod360(d.mc+180))}</td><td></td><td></td><td></td></tr>`;
  html += '</tbody></table>';

  html += '<table class="chart-table" style="margin-top:8px;">';
  html += '<thead><tr><th>' + _L('宫位','House') + '</th><th>' + _L('宫头 (Placidus)','Cusp (Placidus)') + '</th><th>' + _L('元素/模式','Element/Mode') + '</th></tr></thead><tbody>';
  for (let h = 1; h <= 12; h++) {
    const {si} = degToSign(d.cusps[h]);
    html += `<tr><td>` + _L('第'+h+'宫','House '+h) + `</td><td>${formatPos(d.cusps[h])}</td><td>${_L(ELEMENTS[si]+'/'+MODES[si], ELEMENTS_EN[ELEMENTS[si]]+'/'+MODES_EN[MODES[si]])}</td></tr>`;
  }
  html += '</tbody></table>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // ═══ Social引流: 加微信解锁深度报告 ═══
  html += renderLockedBlock(
    _t('locked.unlockYearly'),
    _t('locked.natalDesc'),
    [{icon:'💬', platform:_L('微信','WeChat'), id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  document.getElementById('tab0').innerHTML = html;
  } catch(e) { document.getElementById('tab0').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// ── Tab 1: Forecast ───────────────────────────────────────────────────────
function renderTab1() {
  try {
  const d = chartData1;
  let html = '';

  // Fortune sub-tabs navigation
  html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">';
  html += '<button class="fortune-sub-tab active" onclick="switchFortune(\'weekly\')">' + _t('fortune.weekly') + '</button>';
  html += '<button class="fortune-sub-tab" onclick="switchFortune(\'monthly\')">' + _t('fortune.monthly') + '</button>';
  html += '<button class="fortune-sub-tab" onclick="switchFortune(\'yearly\')">' + _t('fortune.yearly') + '</button>';
  html += '<button class="fortune-sub-tab" onclick="switchFortune(\'fiveyear\')">' + _t('fortune.fiveyear') + '</button>';
  html += '</div>';

  html += '<div id="fortune-weekly" class="fortune-content active">';
  html += generateWeeklyFortune(d.positions, d.houses, d.asc);
  html += '</div>';
  html += '<div id="fortune-monthly" class="fortune-content">';
  html += generateMonthlyFortune(d.positions, d.houses, d.asc);
  html += '</div>';
  html += '<div id="fortune-yearly" class="fortune-content">';
  html += generateYearlyFortune(d.positions, d.houses, d.asc, d.mc);
  html += '</div>';
  html += '<div id="fortune-fiveyear" class="fortune-content">';
  html += generateDeepForecast(d.positions, d.houses, d.mc);
  html += '</div>';

  document.getElementById('tab1').innerHTML = html;
  } catch(e) { document.getElementById('tab1').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// Fortune sub-tab switching
function switchFortune(type) {
  const tabs = document.querySelectorAll('.fortune-sub-tab');
  const contents = document.querySelectorAll('.fortune-content');
  const map = {weekly:0, monthly:1, yearly:2, fiveyear:3};
  tabs.forEach((t, i) => t.classList.toggle('active', i === map[type]));
  contents.forEach((c, i) => c.classList.toggle('active', i === map[type]));
}


// ── Tab 2: Synastry ───────────────────────────────────────────────────────
function renderTab2() {
  try {
  let html = '';
  if (!chartData2) {
    html += '<div class="report-section">';
    html += '<p style="text-align:center;color:var(--text-dim);padding:40px;">' + _t('error.noPartner') + '</p>';
    html += '</div>';
  } else {
    html += generateSynastryReport(chartData1.positions, chartData2.positions, chartData1.asc, chartData2.asc);
  }
  document.getElementById('tab2').innerHTML = html;
  } catch(e) { document.getElementById('tab2').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// ── Tab 3: Guidance ───────────────────────────────────────────────────────
function renderTab3() {
  try {
  const d = chartData1;
  let html = generateGuidance(d.positions, d.houses, d.asc);
  document.getElementById('tab3').innerHTML = html;
  } catch(e) { document.getElementById('tab3').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// ── Tab 5: Career Genius ──────────────────────────────────────────────────
function renderTab5() {
  try {
  const d = chartData1;
  const userJob = document.getElementById('p1_job') ? document.getElementById('p1_job').value.trim() : '';
  let html = generateCareerGenius(d.positions, d.houses, d.aspects, d.asc, d.mc, userJob);
  document.getElementById('tab5').innerHTML = html;
  } catch(e) { document.getElementById('tab5').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// ── Tab 6: Relationships ──────────────────────────────────────────────────
function renderTab6() {
  try {
  const d = chartData1;
  let html = generateRelationships(d.positions, d.houses, d.aspects, d.asc);
  document.getElementById('tab6').innerHTML = html;
  } catch(e) { document.getElementById('tab6').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// ── Tab 7: Deep Consultation ───────────────────────────────────────────────
function renderTab7() {
  try {
  if (!chartData1) { document.getElementById('tab7').innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:30px;">' + _t('error.noData') + '</p>'; return; }

  let html = '<div style="text-align:center;padding:20px 0;">';
  html += '<h3 style="color:var(--accent);margin-bottom:12px;">' + _t('consult.title') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;line-height:1.8;margin-bottom:24px;">';
  html += _t('consult.intro1') + '<br>';
  html += _t('consult.intro2') + '<br>';
  html += _t('consult.intro3') + '</p>';

  html += renderLockedBlock(
    _t('locked.unlockConsult'),
    _t('consult.lockedDesc'),
    [{icon:'💬', platform:_L('微信','WeChat'), id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  html += '<p style="color:var(--text-dim);font-size:0.72em;margin-top:20px;">' + _t('consult.tip') + '</p>';
  html += '</div>';

  document.getElementById('tab7').innerHTML = html;
  } catch(e) { document.getElementById('tab7').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// ── Tab 8: About / Brand Story ─────────────────────────────────────────────
function renderTab8() {
  var aboutHTML = '<div class="about-page">';
  aboutHTML += '<h2 class="about-heading">' + _t('about.heading') + '</h2>';
  aboutHTML += '<div class="about-content">';
  aboutHTML += '<p class="about-p about-first">' + _t('about.p1') + '</p>';
  aboutHTML += '<p class="about-p about-break">' + _t('about.p2') + '</p>';
  aboutHTML += '<p class="about-p">' + _t('about.p3') + '</p>';
  aboutHTML += '<p class="about-p about-break">' + _t('about.p4') + '</p>';
  aboutHTML += '<p class="about-p">' + _t('about.p5') + '</p>';
  aboutHTML += '<p class="about-p about-break">' + _t('about.p6') + '</p>';
  aboutHTML += '<p class="about-p about-closing-line">' + _t('about.p7') + '</p>';
  aboutHTML += '<p class="about-signature">' + _t('about.closing') + '</p>';
  aboutHTML += '</div></div>';
  document.getElementById('tab8').innerHTML = aboutHTML;
}

// Global submit handler for consultation

// ── Tab Switching ─────────────────────────────────────────────────────────
function switchTab(idx) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
  document.querySelectorAll('.tab-content').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
  // Tab swipe hint — only shown on synastry tab when partner data exists
  var tabHint = document.getElementById('tabHint');
  if (tabHint) {
    tabHint.style.display = (idx === 2 && chartData2) ? 'block' : 'none';
  }
  // Re-render on switch to ensure content is fresh
  if (idx === 4) {
    renderTab4();
  } else if (idx === 8) {
    renderTab8();
  } else if (chartData1) {
    [renderTab0, renderTab1, renderTab2, renderTab3, null, renderTab5, renderTab6, renderTab7][idx]();
  }
}

// ── Expand Natal Report (progressive disclosure) ──────────────────────────
function expandNatalReport() {
  const el = document.getElementById('fullNatalReport');
  if (!el) return;
  el.style.maxHeight = 'none';
  el.style.opacity = '1';
  el.style.transition = 'opacity 1.2s ease';
  // Remove the expand button
  const btn = document.querySelector('.blueprint-expand-btn');
  if (btn) {
    btn.style.opacity = '0';
    btn.style.transition = 'opacity 0.6s';
    setTimeout(() => { btn.style.display = 'none'; }, 600);
  }
  // Scroll to reveal
  setTimeout(() => {
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }, 300);
}

// ── Toggle Data Tables ────────────────────────────────────────────────────
function toggleDataTables() {
  const wrap = document.getElementById('dataTablesWrap');
  const btn = document.getElementById('btnToggleData');
  if (!wrap || !btn) return;
  const isOpen = wrap.style.maxHeight !== '0px' && wrap.style.maxHeight !== '';
  if (isOpen) {
    wrap.style.maxHeight = '0px';
    wrap.style.opacity = '0';
    wrap.style.transition = 'opacity 0.5s ease, max-height 0s 0.5s';
    btn.textContent = _t('btn.viewChartData');
  } else {
    wrap.style.maxHeight = 'none';
    wrap.style.opacity = '1';
    wrap.style.transition = 'opacity 0.8s ease';
    btn.textContent = _L('📊 收起星盘数据','📊 Hide Chart Data');
    setTimeout(() => { wrap.scrollIntoView({behavior:'smooth', block:'start'}); }, 200);
  }
}

// ── Input Card Collapse / Expand ──────────────────────────────────────────
function collapseInputCard() {
  const card = document.getElementById('inputCard');
  if (!card) return;
  var stag = document.querySelector('.sample-tag');
  if (stag) stag.style.display = 'none';
  var snotice = document.getElementById('sampleNotice');
  if (snotice) snotice.style.display = 'none';
  card.style.display = 'none';
}

// ── Back to Top visibility ────────────────────────────────────────────────
(function() {
  window.addEventListener('scroll', function() {
    const btn = document.getElementById('btnBackTop');
    if (btn) {
      btn.style.display = window.scrollY > 400 ? 'block' : 'none';
    }
  });

})();

// ═══════════════════════════════════════════════════════════════════════════
//  PDF REPORT & EMAIL
// ═══════════════════════════════════════════════════════════════════════════

function wrapReportForLightBg(html) {
  var s = '<div style="background:#fff;color:#222;padding:20px;font-family:Georgia,\'SimSun\',serif;line-height:1.8;max-width:750px;margin:0 auto;">';
  s += '<style>';
  // Override any dark-theme inline colors
  s += '[style*="color:#9a9ab0"],[style*="color:#8a8aa0"],[style*="color:#b8b8c8"],[style*="color:#b0b0c0"],';
  s += '[style*="color:#a8a8b8"],[style*="color:#c8c8d8"],[style*="color:#d0d0d8"],[style*="color:#c9c9c9"],';
  s += '[style*="color:#8a8aa0"],[style*="color:var(--text-dim)"],[style*="color:var(--gold-dim)"] { color: #444 !important; }';
  s += '[style*="background:rgba(20,20,50,0.4)"],[style*="background:rgba(15,15,30,0.5)"],';
  s += '[style*="background:rgba(15,15,30,0.7)"] { background: #f5f5f5 !important; }';
  s += 'h2,h3 { color: #333 !important; }';
  s += 'table { border-collapse: collapse; } th,td { border: 1px solid #ddd; padding: 6px 10px; }';
  s += 'th { background: #f0f0f0; }';
  s += '</style>';
  s += html;
  s += '</div>';
  return s;
}

function buildReportHTML() {
  if (!chartData1) return '';
  const d = chartData1;
  const now = new Date();
  let r = '';

  r += '<div style="text-align:center;margin-bottom:20px;">';
  r += '<h2 style="color:#333;">' + _L('命 运 之 轮 · 星盘解读报告','Wheel of Fortune · Birth Chart Report') + '</h2>';
  r += '<p style="color:#666;">' + _L('生成日期：','Generated: ') + now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + '</p>';
  r += '</div>';

  // ═══ Tab 0: Natal report ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;">✦ ' + _L('本命星盘深度解读','Natal Chart Deep Dive') + '</h3>';
  r += generateDeepNatalReport(d.positions, d.houses, d.aspects, d.asc, d.mc);

  // ═══ Tab 5: Career Genius ═══
  const userJob = document.getElementById('p1_job') ? document.getElementById('p1_job').value.trim() : '';
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('职业天赋诊断','Career Genius Diagnosis') + '</h3>';
  r += generateCareerGenius(d.positions, d.houses, d.aspects, d.asc, d.mc, userJob);

  // ═══ Tab 6: Relationships ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('人际缘分分析','Relationship Analysis') + '</h3>';
  r += generateRelationships(d.positions, d.houses, d.aspects, d.asc);

  // ═══ Tab 2: Synastry (if available) ═══
  if (chartData2) {
    r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('合盘缘分分析','Synastry Analysis') + '</h3>';
    r += generateSynastryReport(d.positions, chartData2.positions, d.asc, chartData2.asc);
  }

  // ═══ Tab 3: Daily Guidance ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('今日星盘指引','Daily Chart Guidance') + '</h3>';
  r += generateGuidance(d.positions, d.houses, d.asc);

  // ═══ Tab 1: Fortune (all sub-modules) ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('本周运势','Weekly Fortune') + '</h3>';
  r += generateWeeklyFortune(d.positions, d.houses, d.asc);
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('本月运势','Monthly Fortune') + '</h3>';
  r += generateMonthlyFortune(d.positions, d.houses, d.asc);
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('年度运势','Yearly Fortune') + '</h3>';
  r += generateYearlyFortune(d.positions, d.houses, d.asc, d.mc);
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('五年运势展望','Five-Year Forecast') + '</h3>';
  r += generateDeepForecast(d.positions, d.houses, d.mc);

  // ═══ Tab 4: Tarot (if drawn) ═══
  if (tarotState.drawn.length > 0 && tarotState.flipped >= tarotState.drawn.length) {
    r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('塔罗占卜','Tarot Reading') + '</h3>';
    r += '<p style="color:#666;">' + _L('问题：','Question: ') + (tarotState.question || _L('综合运势','General Fortune')) + '</p>';
    for (let i = 0; i < tarotState.drawn.length; i++) {
      const card = tarotState.drawn[i];
      const posLabel = tarotState.spread === 'three' ? [_L('过去','Past'),_L('现在','Present'),_L('未来','Future')][i] : _L('指引','Guidance');
      r += '<p><strong>' + posLabel + '：' + card.name + '</strong>' + (card.isReversed ? '（' + _L('逆位','Reversed') + '）' : '') + '<br>';
      r += (card.isReversed ? (card.rev || card.up) : card.up) + '</p>';
    }
  }

  // ═══ Tab 7: Deep Consultation (if there's a current result) ═══
  if (window._consultResult) {
    r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('深度咨询','Deep Consultation') + '</h3>';
    r += window._consultResult;
  }

  // ═══ Planet data table ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('星盘数据','Chart Data') + '</h3>';
  r += '<table style="width:100%;border-collapse:collapse;font-size:0.85em;">';
  r += '<tr style="background:#eee;"><th>' + _t('table.planet') + '</th><th>' + _t('table.position') + '</th><th>' + _t('table.house') + '</th><th>' + _t('table.element') + '</th><th>' + _t('table.mode') + '</th></tr>';
  for (const p of PLANETS) {
    const lon = d.positions[p.id];
    const {si, d:dd, m} = degToSign(lon);
    const h = d.houses[p.id] || '?';
    r += '<tr><td>' + p.name + '</td><td>' + getSignNamePure(si) + ' ' + dd + '°' + String(m).padStart(2,'0') + '′</td><td>' + _L('第','House ') + h + _L('宫','') + '</td><td>' + ELEMENTS[si] + '</td><td>' + MODES[si] + '</td></tr>';
  }
  r += '</table>';

  // Disclaimer
  r += '<p style="text-align:center;color:#999;font-size:0.8em;margin-top:30px;">' + _L('星辰不为任何人改写轨迹，星盘也从不替你掌舵。<br>本报告仅供自我觉察与灵性探索之参考。','The stars do not rewrite their course for anyone, nor does the birth chart steer your ship.<br>This report is for self-awareness and spiritual exploration only.') + '</p>';

  return r;
}

function downloadPDFReport() {
  if (!chartData1) { alert(_t('error.fillChart')); return; }

  var reportContent = buildReportHTML();
  var fullHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + _L('星盘解读报告','Birth Chart Report') + '</title>';
  fullHtml += '<style>';
  fullHtml += ':root { --accent: #8a7040; --gold: #8a7040; --gold-dim: #6a5030; --text-dim: #555; }';
  fullHtml += 'body { font-family: Georgia, "SimSun", serif; color: #222; line-height: 1.8; max-width: 750px; margin: 0 auto; padding: 30px; }';
  fullHtml += '[style*="color:#9a9ab0"],[style*="color:#8a8aa0"],[style*="color:#b8b8c8"],[style*="color:#b0b0c0"],[style*="color:#a8a8b8"],[style*="color:#c8c8d8"],[style*="color:#d0d0d8"]{color:#555!important}';
  fullHtml += '[style*="background:rgba(20,20,50,0.4)"],[style*="background:rgba(15,15,30,0.5)"],[style*="background:rgba(15,15,30,0.7)"]{background:#f5f5f5!important}';
  fullHtml += 'h2 { text-align: center; } h3 { color: #444; margin-top: 20px; }';
  fullHtml += 'table { width: 100%; border-collapse: collapse; margin: 10px 0; }';
  fullHtml += 'th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: center; }';
  fullHtml += 'th { background: #f0f0f0; }';
  fullHtml += '.report-section { margin-bottom: 14px; } .report-section p { color: #333; }';
  fullHtml += '.highlight { color: #5a3a1a; font-weight: bold; }';
  fullHtml += '.direction-card { border: 1px solid #ddd; padding: 12px; margin: 8px 0; border-radius: 8px; }';
  fullHtml += '.direction-card h4 { margin: 0 0 4px 0; }';
  fullHtml += '.action-step { border: 1px solid #ddd; padding: 10px; margin: 8px 0; border-radius: 8px; }';
  fullHtml += '.consult-domain-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; background: #f0e8d0; }';
  fullHtml += '.consult-source { margin-bottom: 12px; padding: 10px; border-left: 3px solid #ccc; }';
  fullHtml += '.consult-synthesis { background: #fafaf5; border: 1px solid #ddd; padding: 14px; margin-top: 12px; }';
  fullHtml += '.consult-advice { margin-top: 10px; padding: 10px; background: #f5f0e5; }';
  fullHtml += '@media print { @page { margin: 1.5cm; } }';
  fullHtml += '</style></head><body>';
  fullHtml += reportContent;
  fullHtml += '</body></html>';

  var blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = _L('星盘解读报告','Birth_Chart_Report') + '_' + new Date().toISOString().slice(0,10) + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Also open print dialog via hidden iframe
  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.contentDocument.write(fullHtml);
  iframe.contentDocument.close();
  setTimeout(function() { iframe.contentWindow.print(); document.body.removeChild(iframe); }, 500);
}

function sendReportEmail() {
  if (!chartData1) { alert(_t('error.fillChart')); return; }

  const email = document.getElementById('p1_email').value.trim();
  if (!email) { alert(_t('error.fillEmail')); return; }

  const reportContent = buildReportHTML();
  const wrappedContent = wrapReportForLightBg(reportContent);

  // Skip EmailJS if CDN failed to load
  if (typeof emailjs !== 'undefined' && !window._emailjsDisabled) {
    // EmailJS path — requires user to set up free account at emailjs.com
    const templateParams = {
      to_email: email,
      subject: _t('email.subject'),
      report_html: wrappedContent
    };
    emailjs.send('service_3n18koe', 'template_likx0sp', templateParams)
      .then(() => {
        const msg = document.getElementById('emailMsg');
        msg.style.display = 'block'; msg.style.color = '#7ab87a';
        msg.textContent = _t('email.sentPrefix') + email + _t('email.checkSpam');
      })
      .catch(() => {
        fallbackCopyToClipboard(email, reportContent);
      });
  } else {
    fallbackCopyToClipboard(email, reportContent);
  }
}

function fallbackCopyToClipboard(email, reportContent) {
  // Strip HTML for plain text clipboard
  const tmp = document.createElement('div');
  tmp.innerHTML = reportContent;
  const plainText = tmp.textContent || tmp.innerText || '';

  // Try clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(plainText).then(() => {
      const msg = document.getElementById('emailMsg');
      msg.style.display = 'block';
      msg.innerHTML = _t('email.copyMobileSuccess') + ' <strong>' + email + '</strong><br><a href="mailto:' + email + '?subject=' + encodeURIComponent(_t('email.subject')) + '&body=' + encodeURIComponent(plainText.substring(0, 2000)) + '" style="color:var(--accent);">' + _t('email.openClient') + '</a>';
    }).catch(() => {
      mailtoFallback(email, plainText);
    });
  } else {
    mailtoFallback(email, plainText);
  }
}

function mailtoFallback(email, plainText) {
  const msg = document.getElementById('emailMsg');
  msg.style.display = 'block';
  msg.innerHTML = '<a href="mailto:' + email + '?subject=' + encodeURIComponent(_t('email.subject')) + '&body=' + encodeURIComponent(plainText.substring(0, 2000)) + '" style="color:var(--accent);font-size:1em;">' + _t('email.openClient') + '</a>';
}

// ═══ Mobile-friendly report copy ══════════════════════════════════════════
function copyMobileReport() {
  if (!chartData1) { alert(_t('error.fillChart')); return; }
  var html = buildReportHTML();
  var text = htmlToMobileText(html);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      var msg = document.getElementById('emailMsg');
      msg.style.display = 'block'; msg.style.color = '#7ab87a';
      msg.textContent = _L('✓ 手机版报告已复制到剪贴板，直接粘贴到微信/QQ即可','✓ Mobile report copied to clipboard — paste directly into chat apps');
      setTimeout(function() { msg.style.display = 'none'; }, 3000);
    }).catch(function() {
      alert(_t('error.copyFailed'));
    });
  } else {
    // Fallback for older browsers
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    var msg = document.getElementById('emailMsg');
    msg.style.display = 'block'; msg.style.color = '#7ab87a';
    msg.textContent = _L('✓ 手机版报告已复制到剪贴板','✓ Mobile report copied to clipboard');
    setTimeout(function() { msg.style.display = 'none'; }, 3000);
  }
}

function htmlToMobileText(html) {
  var W = 34; // max Chinese chars per line for mobile chat readability

  // Step 1: Replace block tags with markers
  var s = html;
  s = s.replace(/<h3[^>]*>/gi, '\n\n━━━━━━━━━━━━━━━━━━━━\n');
  s = s.replace(/<\/h3>/gi, '\n━━━━━━━━━━━━━━━━━━━━\n');
  s = s.replace(/<h2[^>]*>/gi, '\n\n');
  s = s.replace(/<\/h2>/gi, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/p>/gi, '\n');
  s = s.replace(/<\/tr>/gi, '\n');
  s = s.replace(/<\/td>/gi, '  ');
  s = s.replace(/<\/th>/gi, '  ');
  s = s.replace(/<hr[^>]*>/gi, '\n─'.repeat(W) + '\n');

  // Step 2: Strip remaining HTML tags
  s = s.replace(/<[^>]+>/g, '');

  // Step 3: Decode HTML entities
  s = s.replace(/&nbsp;/g, ' ');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&#(\d+);/g, function(m, d) { return String.fromCharCode(d); });

  // Step 4: Normalize whitespace — collapse multiple blank lines to 2 max
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.replace(/[ \t]+/g, ' ');

  // Step 5: Wrap long lines
  var lines = s.split('\n');
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    // Don't wrap separator lines
    if (/^[━─]{5,}$/.test(line.trim())) { out.push(line); continue; }
    // Don't wrap empty lines
    if (line.trim() === '') { out.push(''); continue; }
    out = out.concat(wrapLine(line, W));
  }

  // Step 6: Add mobile header
  var now = new Date();
  var header = '━━━━━━━━━━━━━━━━━━━━\n' +
    '  🔮 LunarVeilAstro · ' + _L('星盘报告','Birth Chart Report') + '\n' +
    '  ' + now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + '\n' +
    '━━━━━━━━━━━━━━━━━━━━';

  return header + '\n' + out.join('\n');
}

function wrapLine(line, maxLen) {
  if (line.length <= maxLen) return [line];
  var result = [];
  var current = '';
  var currentWidth = 0;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    var w = (ch.charCodeAt(0) > 127) ? 2 : 1; // CJK chars are width 2
    if (currentWidth + w > maxLen * 2 - 4) {
      result.push(current.trim());
      current = ch;
      currentWidth = w;
    } else {
      current += ch;
      currentWidth += w;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

