// compass.js — Fortune direction compass logic
// Depends on: astronomy.js (chartData1), data.js (COMPASS_DIR_DATA)
// ═══════════════════════════════════════════════════════════════════════════
//  福运方位 · 罗盘指路
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
//  福运方位 · 数据 — 8方位 × 4分类 × (今日+近期)
//  今日：轻量自我成长小动作   近期：方位+意象+反问，让用户自己投射
// ═══════════════════════════════════════════════════════════════════════════

function compassChartWeight() {
  if (!chartData1) return null;
  var weights = [0,0,0,0,0,0,0,0]; // E SE S SW W NW N NE
  var h = chartData1.houses;
  // Venus house → love/finance direction
  if (h.Venus) {
    var vh = h.Venus;
    if (vh===2||vh===7) { weights[2] += 2; weights[5] += 1; } // S, NW for wealth/love
    if (vh===5||vh===11) { weights[0] += 1; weights[1] += 2; } // E, SE for romance/social
  }
  // Mars → career/action direction
  if (h.Mars) {
    var mh = h.Mars;
    if (mh===10||mh===6) { weights[3] += 2; weights[4] += 1; } // SW, W for career/work
    if (mh===1||mh===9) { weights[7] += 1; weights[6] += 2; } // NE, N for initiative/learning
  }
  // Jupiter → expansion/luck direction
  if (h.Jupiter) {
    var jh = h.Jupiter;
    weights[jh % 8] += 3;
    weights[(jh+4) % 8] += 1;
  }
  // Moon → emotional/feminine direction
  if (h.Moon) {
    var moh = h.Moon;
    weights[(moh+2) % 8] += 2; // 2 houses away
  }
  return weights;
}

function weightedCompassPick(weights) {
  if (!weights) return [Math.floor(Math.random()*8), Math.floor(Math.random()*6), Math.floor(Math.random()*3)];
  var total = 0;
  for (var i=0;i<weights.length;i++) total += Math.max(1, weights[i]);
  var r = Math.random() * total;
  var acc = 0;
  for (var i=0;i<weights.length;i++) { acc += Math.max(1, weights[i]); if (r <= acc) return [i, Math.floor(Math.random()*6), Math.floor(Math.random()*3)]; }
  return [Math.floor(Math.random()*8), Math.floor(Math.random()*6), Math.floor(Math.random()*3)];
}

function compassUsedToday(catIdx) {
  var key = COMPASS_CAT_KEYS[catIdx] + '_' + todayKey() + personKey();
  return localStorage.getItem(key) === '1';
}

function compassUseCount() {
  var count = 0;
  for (var i=0;i<4;i++) { if (compassUsedToday(i)) count++; }
  return count;
}

function markCompassUsed(catIdx) {
  var key = COMPASS_CAT_KEYS[catIdx] + '_' + todayKey() + personKey();
  localStorage.setItem(key, '1');
}

function updateCompassBadge() {
  var badge = document.getElementById('compassBadge');
  if (!badge) return;
  var count = compassUseCount();
  if (count >= 4) { badge.textContent = _t('compass.usedUp'); badge.classList.add('used'); }
  else if (count > 0) { badge.textContent = _t('compass.remaining', {count: 4-count}); badge.classList.remove('used'); }
  else { badge.textContent = _t('lodge.badge.available'); badge.classList.remove('used'); }
}

function openFortuneDirection() {
  updateCompassBadge();
  var html = '<h3>' + _t('compass.title') + '</h3>';
  var catSubs = _t('compass.subs');
  html += '<p style="text-align:center;color:var(--text-dim);font-size:0.92em;margin-bottom:6px;letter-spacing:0.06em;">' + _t('compass.prompt') + '</p>';
  html += '<p style="text-align:center;color:rgba(200,165,110,0.55);font-size:0.76em;margin-bottom:16px;letter-spacing:0.04em;">' +
    (chartData1
      ? _L('✦ 已关联你的星盘——方位基于本命盘加权计算','✦ Linked to your birth chart — directions are weighted by your natal placements')
      : _L('✦ 填写出生信息计算星盘后，罗盘会更精准——与你的本命盘联动','✦ Enter your birth info for a personalized reading — this compass links to your chart'))
    + '</p>';
  html += '<div class="category-btns">';
  for (var i=0;i<4;i++) {
    // TEST MODE: skip used check
    var used = false; // compassUsedToday(i);
    html += '<button class="cat-btn" onclick="selectCompassCategory('+i+')">';
    html += '<span class="cat-btn-icon">'+COMPASS_CAT_EMOJI[i]+'</span>';
    html += '<span class="cat-btn-name">'+_ta('compass.categories',i)+'</span>';
    html += '<span class="cat-btn-sub">'+catSubs[i]+'</span>';
    html += '</button>';
  }
  html += '</div>';
  html += '<div id="compassStageArea" style="min-height:180px;"></div>';
  showGameModal(html);
}

function selectCompassCategory(catIdx) {
  // TEST MODE: daily limit disabled
  // if (compassUsedToday(catIdx)) return;
  // markCompassUsed(catIdx);
  updateCompassBadge();

  var weights = compassChartWeight();
  var dirIdx = weightedCompassPick(weights)[0];
  var dirName = COMPASS_DIRECTIONS()[dirIdx];
  var catName = COMPASS_CAT_NAMES()[catIdx];
  var catEmoji = COMPASS_CAT_EMOJI[catIdx];
  var dirData = COMPASS_DIR_DATA()[dirName];
  var catData = dirData[catName];
  var element = dirData.element;
  var trigram = dirData.trigram;
  var imagery = dirData.imagery;
  var todayText = catData.today;
  var upcomingText = catData.upcoming;

  // Build compass stage with spinning animation
  var stageHtml = '<div class="compass-stage compass-spinning" id="compassStage">';
  stageHtml += '<div class="compass-ring"></div>';
  // Direction marks — seal-script style with calligraphy font
  var markAngles = [0, 90, 180, 270];
  var markNames = [_L('東','E'),_L('南','S'),_L('西','W'),_L('北','N')];
  var markIds = ['cmN','cmE','cmS','cmW'];
  for (var mi=0; mi<4; mi++) {
    stageHtml += '<span class="compass-mark-char" id="'+markIds[mi]+'">'+markNames[mi]+'</span>';
  }
  stageHtml += '<div class="compass-pointer" id="compassPointer" style="transform: rotate(0deg);"></div>';
  stageHtml += '<div class="compass-center"></div>';
  stageHtml += '</div>';

  document.getElementById('compassStageArea').innerHTML = stageHtml;

  // Position direction marks responsively based on actual container size
  var stage = document.getElementById('compassStage');
  var w = stage.offsetWidth;
  var cx = w / 2;
  var radius = w * 88 / 240;
  var halfMark = w * 14 / 240;
  for (var mi=0; mi<4; mi++) {
    var rad = markAngles[mi] * Math.PI / 180;
    var mx = Math.round(cx + Math.sin(rad) * radius - halfMark);
    var my = Math.round(cx - Math.cos(rad) * radius - halfMark);
    var mark = document.getElementById(markIds[mi]);
    if (mark) { mark.style.left = mx + 'px'; mark.style.top = my + 'px'; }
  }

  // Animate: spin pointer to target direction angle
  var angles = {0:0, 1:45, 2:90, 3:135, 4:180, 5:225, 6:270, 7:315};
  var targetAngle = angles[dirIdx] + Math.random() * 20 - 10;
  var spins = 1080 + targetAngle;

  setTimeout(function() {
    var ptr = document.getElementById('compassPointer');
    if (ptr) ptr.style.transform = 'rotate(' + spins + 'deg)';
  }, 100);

  // After animation, show result
  setTimeout(function() {
    // Hooks: nudge (immediate mental) for 今日, echo (delayed action) for 近期
    var nudgeHooks = (window._lang && window._lang() === 'en') ? ['Close your eyes and point in a direction — did you point somewhere?','Which city or place does this direction remind you of?','Take a few mental steps in this direction — what\'s the first image that appears?','Find this direction on a map — where\'s the nearest green space or water?'] : ['闭上眼睛指一个方向——指到了吗？','这个方向让你想起哪个城市？哪个地方？','在意念里朝这个方向走几步——第一个浮现的画面是什么？','在地图上找到这个方向——离家最近的绿地或水边在哪？'];
    var echoHooks = (window._lang && window._lang() === 'en') ? ['When you pass through this direction today, take an extra look around.','If there\'s a place you\'ve wanted to visit in this direction — write it down and go another day.'] : ['今天路过这个方位时，多看一眼周围。','如果这个方向有你想去的地方——记下来，改天去看看。'];
    var nudge = nudgeHooks[Math.floor(Math.random()*nudgeHooks.length)];
    var echo = echoHooks[Math.floor(Math.random()*echoHooks.length)];

    var resultHtml = '<div class="direction-result">';
    resultHtml += '<div class="direction-icon">'+catEmoji+'</div>';
    resultHtml += '<div class="direction-heading">'+catName+' · '+dirName+'</div>';
    resultHtml += '<div class="direction-location">'+dirName+' · '+trigram+' · '+element+' · '+imagery+'</div>';
    resultHtml += '<div style="margin-top:18px;padding:16px 20px;background:rgba(200,160,100,0.06);border-radius:12px;border-left:3px solid rgba(200,160,100,0.3);text-align:left;">';
    resultHtml += '<div style="color:#7ab87a;font-size:0.78em;letter-spacing:0.08em;margin-bottom:6px;">'+_L('▎今日','▎Today')+'</div>';
    resultHtml += '<div style="color:#c0b8d0;font-size:0.95em;line-height:1.7;">'+todayText+'</div>';
    resultHtml += '<div style="color:#9a90b0;font-size:0.92em;margin-top:8px;font-style:italic;">'+nudge+'</div>';
    resultHtml += '</div>';
    resultHtml += '<div style="margin-top:12px;padding:16px 20px;background:rgba(160,140,200,0.05);border-radius:12px;border-left:3px solid rgba(180,140,200,0.3);text-align:left;">';
    resultHtml += '<div style="color:#b8a0d0;font-size:0.78em;letter-spacing:0.08em;margin-bottom:6px;">'+_L('▎近期','▎Upcoming')+'</div>';
    resultHtml += '<div style="color:#b0a8c8;font-size:0.95em;line-height:1.7;">'+upcomingText+'</div>';
    resultHtml += '</div>';
    resultHtml += '<div class="direction-hook" style="margin-top:10px;">'+echo+'</div>';
    if (chartData1) {
      resultHtml += '<p style="color:#6a6a8a;font-size:0.75em;margin-top:10px;">'+_L('✦ 基于你的星盘加权计算','✦ Weighted by your natal chart')+'</p>';
    }
    resultHtml += '</div>';
    document.getElementById('compassStageArea').innerHTML = resultHtml;
  }, 2700);

  // TEST MODE: skip disabling buttons
}

// Update badge after star chart calculation
(function() {
  var _origCalcAll = window.calculateAll;
  window.calculateAll = function() {
    if (_origCalcAll) _origCalcAll.apply(this, arguments);
    setTimeout(function(){
      var badge = document.getElementById('compassBadge');
      if (badge) updateCompassBadge();
    }, 200);
  };
})();


