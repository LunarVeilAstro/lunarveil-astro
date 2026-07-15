// skynow.js — Live sky wheel: real-time planetary positions on homepage
// Depends on: astronomy.js (calcSun, calcMoon, calcPlanet, julianDay,
//   centuriesSinceJ2000, mod360, rad, _L)
(function(){
  var PL = [
    {id:'Sun',     cn:'太阳',   en:'Sun',     g:'☉'},
    {id:'Moon',    cn:'月亮',   en:'Moon',    g:'☽'},
    {id:'Mercury', cn:'水星',   en:'Mercury', g:'☿'},
    {id:'Venus',   cn:'金星',   en:'Venus',   g:'♀'},
    {id:'Mars',    cn:'火星',   en:'Mars',    g:'♂'},
    {id:'Jupiter', cn:'木星',   en:'Jupiter', g:'♃'},
    {id:'Saturn',  cn:'土星',   en:'Saturn',  g:'♄'},
    {id:'Uranus',  cn:'天王星', en:'Uranus',  g:'♅'},
    {id:'Neptune', cn:'海王星', en:'Neptune', g:'♆'},
    {id:'Pluto',   cn:'冥王星', en:'Pluto',   g:'♇'}
  ];
  var SG = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  var SN_CN = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  var SN_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  var ASP = [
    {angle:0,   orb:6, cn:'合相', en:'Conjunction', sym:'☌', color:'#e8d5a3'},
    {angle:60,  orb:3, cn:'六合', en:'Sextile',     sym:'⚹', color:'#8fbfa8'},
    {angle:90,  orb:5, cn:'刑',   en:'Square',      sym:'□', color:'#d4906a'},
    {angle:120, orb:5, cn:'拱',   en:'Trine',       sym:'△', color:'#8fa0d4'},
    {angle:180, orb:6, cn:'冲',   en:'Opposition',  sym:'☍', color:'#d47a7a'}
  ];
  var MON_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var WEEK_CN = ['日','一','二','三','四','五','六'];
  var WEEK_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  var expanded = false;
  var skyLoaded = false;

  function calcBody(id, T){
    if (id === 'Sun') return calcSun(T);
    if (id === 'Moon') return calcMoon(T);
    return calcPlanet(id, T);
  }
  function isRetro(id, T){
    if (id === 'Sun' || id === 'Moon') return false;
    return mod360(calcBody(id, T + 1/36525) - calcBody(id, T)) > 180;
  }
  function nowT(){
    var d = new Date();
    var h = d.getUTCHours() + d.getUTCMinutes()/60 + d.getUTCSeconds()/3600;
    return centuriesSinceJ2000(julianDay(d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate(), h));
  }
  function computeAspects(pos){
    var found = [];
    for (var a = 0; a < PL.length; a++){
      for (var b = a+1; b < PL.length; b++){
        var diff = Math.abs(mod360(pos[PL[a].id] - pos[PL[b].id]));
        if (diff > 180) diff = 360 - diff;
        for (var k = 0; k < ASP.length; k++){
          var orb = Math.abs(diff - ASP[k].angle);
          if (orb <= ASP[k].orb){ found.push({a:PL[a], b:PL[b], asp:ASP[k], orb:orb}); break; }
        }
      }
    }
    found.sort(function(x, y){ return x.orb - y.orb; });
    return found;
  }

  function drawWheel(canvas, pos, retro, aspects){
    var cssW = canvas.clientWidth;
    if (!cssW) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = cssW * dpr; canvas.height = cssW * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var SIZE = cssW, f = SIZE / 720;
    var big = SIZE >= 480;
    var cx = SIZE/2, cy = SIZE/2, R = SIZE/2 - 4;

    function pt(lon, r){
      var a = Math.PI - rad(lon);
      return { x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) };
    }

    ctx.clearRect(0, 0, SIZE, SIZE);
    var bg = ctx.createRadialGradient(cx, cy, R*0.1, cx, cy, R);
    bg.addColorStop(0, 'rgba(74,45,122,0.22)');
    bg.addColorStop(0.75, 'rgba(45,27,78,0.18)');
    bg.addColorStop(1, 'rgba(20,15,40,0.45)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = bg; ctx.fill();

    ctx.strokeStyle = 'rgba(201,169,110,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(201,169,110,0.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R*0.84, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(122,95,180,0.25)';
    ctx.beginPath(); ctx.arc(cx, cy, R*0.46, 0, Math.PI*2); ctx.stroke();

    var signFont = Math.max(12, Math.round(22*f));
    for (var s = 0; s < 12; s++){
      var a0 = Math.PI - rad(s*30), a1 = Math.PI - rad((s+1)*30);
      if (s % 2 === 0){
        ctx.beginPath();
        ctx.arc(cx, cy, R, a0, a1, true);
        ctx.arc(cx, cy, R*0.84, a1, a0, false);
        ctx.closePath();
        ctx.fillStyle = 'rgba(122,95,180,0.08)';
        ctx.fill();
      }
      var p1 = pt(s*30, R*0.84), p2 = pt(s*30, R);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = 'rgba(201,169,110,0.3)'; ctx.lineWidth = 1; ctx.stroke();

      var mid = s*30 + 15;
      var pg = pt(mid, big ? R*0.945 : R*0.92);
      ctx.fillStyle = 'rgba(200,180,235,0.9)';
      ctx.font = signFont + 'px "Segoe UI Symbol", serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(SG[s], pg.x, pg.y);
      if (big){
        var pn = pt(mid, R*0.875);
        ctx.fillStyle = 'rgba(160,140,200,0.55)';
        ctx.font = Math.round(11*f) + 'px "Noto Serif SC","SimSun",serif';
        ctx.fillText(_L(SN_CN[s], SN_EN[s].slice(0,3)), pn.x, pn.y);
      }
    }

    if (big){
      for (var t10 = 0; t10 < 360; t10 += 10){
        if (t10 % 30 === 0) continue;
        var q1 = pt(t10, R*0.84), q2 = pt(t10, R*0.82);
        ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y);
        ctx.strokeStyle = 'rgba(201,169,110,0.18)'; ctx.lineWidth = 1; ctx.stroke();
      }
    }

    for (var i = 0; i < aspects.length; i++){
      var asp = aspects[i];
      var pa = pt(pos[asp.a.id], R*0.46), pb = pt(pos[asp.b.id], R*0.46);
      if (asp.asp.angle === 0){
        var mx = (pa.x+pb.x)/2, my = (pa.y+pb.y)/2;
        ctx.beginPath(); ctx.arc(mx, my, Math.max(4, 7*f), 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(232,213,163,0.8)'; ctx.lineWidth = 1.5; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = asp.asp.color;
        ctx.globalAlpha = Math.max(0.25, 0.8 - asp.orb*0.12);
        ctx.lineWidth = 1.2; ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // 行星（近距离自动错层）
    var sorted = PL.map(function(p){ return { p:p, lon:pos[p.id] }; })
      .sort(function(x, y){ return x.lon - y.lon; });
    var levels = [];
    for (var i2 = 0; i2 < sorted.length; i2++){
      var lvl = 0;
      for (var j2 = 0; j2 < i2; j2++){
        var gap = Math.abs(sorted[i2].lon - sorted[j2].lon);
        if (gap > 180) gap = 360 - gap;
        if (gap < 11 && levels[j2] === lvl) lvl = (levels[j2] + 1) % 3;
      }
      levels.push(lvl);
    }
    var lvlR = [R*0.70, R*0.59, R*0.48];
    var glyphFont = Math.max(15, Math.round(26*f));
    for (var i3 = 0; i3 < sorted.length; i3++){
      var pl = sorted[i3].p, lon = sorted[i3].lon;
      var mark = pt(lon, R*0.815);
      var body = pt(lon, lvlR[levels[i3]]);
      ctx.beginPath(); ctx.arc(mark.x, mark.y, 2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(232,213,163,0.9)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(mark.x, mark.y); ctx.lineTo(body.x, body.y);
      ctx.strokeStyle = 'rgba(201,169,110,0.18)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#e8d5a3';
      ctx.shadowColor = 'rgba(201,169,110,0.5)'; ctx.shadowBlur = 8;
      ctx.font = glyphFont + 'px "Segoe UI Symbol", serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(pl.g, body.x, body.y);
      ctx.shadowBlur = 0;
      if (big){
        ctx.fillStyle = 'rgba(200,180,235,0.85)';
        ctx.font = Math.round(11*f) + 'px "Noto Serif SC","SimSun",serif';
        ctx.fillText(Math.floor(lon % 30) + '°' + (retro[pl.id] ? ' ℞' : ''), body.x, body.y + Math.round(19*f));
      }
    }

    ctx.fillStyle = 'rgba(201,169,110,0.55)';
    ctx.font = Math.max(9, Math.round(13*f)) + 'px "Noto Serif SC",serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', cx, cy - Math.round(12*f));
    ctx.fillText('LunarVeilAstro', cx, cy + Math.round(8*f));
  }

  function fmtDeg(lon){
    var inSign = lon % 30;
    var d = Math.floor(inSign);
    var m = Math.floor((inSign - d) * 60);
    return d + '°' + (m < 10 ? '0' : '') + m + '′';
  }

  function renderSkyNow(){
    var card = document.getElementById('skyNowCard');
    if (!card) return;
    var T = nowT();
    var pos = {}, retro = {};
    for (var i = 0; i < PL.length; i++){
      pos[PL[i].id] = calcBody(PL[i].id, T);
      retro[PL[i].id] = isRetro(PL[i].id, T);
    }
    var aspects = computeAspects(pos);

    var d = new Date();
    var hm = ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2);
    var dateEl = document.getElementById('skyNowDate');
    if (dateEl){
      dateEl.textContent = _L(
        d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 ' + hm + ' 周' + WEEK_CN[d.getDay()],
        MON_EN[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' · ' + hm + ' ' + WEEK_EN[d.getDay()]
      );
    }

    var mini = document.getElementById('skyMiniCanvas');
    var full = document.getElementById('skyFullCanvas');
    if (expanded && full){
      drawWheel(full, pos, retro, aspects);
      var rows = '';
      for (var j = 0; j < PL.length; j++){
        var p = PL[j], lon = pos[p.id];
        rows += '<tr><td class="skyg">' + p.g + '</td><td>' + _L(p.cn, p.en) + '</td>' +
          '<td class="skydeg">' + _L(SN_CN[Math.floor(lon/30)] + '座', SN_EN[Math.floor(lon/30)]) + ' ' + fmtDeg(lon) + '</td>' +
          '<td class="skyretro">' + (retro[p.id] ? '℞' : '') + '</td></tr>';
      }
      var tbl = document.getElementById('skyPlanetTable');
      if (tbl) tbl.innerHTML = rows;

      var ah = '';
      for (var k = 0; k < Math.min(aspects.length, 8); k++){
        var fnd = aspects[k];
        ah += '<div>' + _L(fnd.a.cn, fnd.a.en) + ' <span style="color:' + fnd.asp.color + '">' +
          fnd.asp.sym + '</span> ' + _L(fnd.b.cn, fnd.b.en) + ' · ' + _L(fnd.asp.cn, fnd.asp.en) +
          ' <span class="skyorb">(' + fnd.orb.toFixed(1) + '°)</span></div>';
      }
      var al = document.getElementById('skyAspectList');
      if (al) al.innerHTML = ah || ('<div class="skyorb">' + _t('skynow.noAspects') + '</div>');
    } else if (mini){
      drawWheel(mini, pos, retro, aspects);
    }
  }

  function toggleSkyFull(){
    expanded = !expanded;
    var miniWrap = document.getElementById('skyMiniWrap');
    var fullWrap = document.getElementById('skyFullWrap');
    if (miniWrap) miniWrap.style.display = expanded ? 'none' : '';
    if (fullWrap) fullWrap.style.display = expanded ? '' : 'none';
    renderSkyNow();
  }

  window.renderSkyNow = renderSkyNow;
  window.toggleSkyFull = toggleSkyFull;

  function toggleSkySection(){
    var content = document.getElementById('skyNowContent');
    var arrow = document.getElementById('skyNowArrow');
    if (!content) return;
    if (!skyLoaded){
      skyLoaded = true;
      content.style.display = '';
      if (arrow) arrow.textContent = '▾';
      requestAnimationFrame(function(){
        renderSkyNow();
        setInterval(renderSkyNow, 60000);
      });
    } else {
      var hidden = content.style.display === 'none';
      content.style.display = hidden ? '' : 'none';
      if (arrow) arrow.textContent = hidden ? '▾' : '▸';
    }
  }

  window.toggleSkySection = toggleSkySection;

  function init(){
    var wrap = document.getElementById('skyMiniWrap');
    if (wrap){
      wrap.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleSkyFull(); }
      });
    }
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      if (skyLoaded) resizeTimer = setTimeout(renderSkyNow, 200);
    });
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
