// ── Early error trap: catch all errors and show them on page ────────────
var _earlyErrors = [];
window.onerror = function(msg, url, line, col, err) {
  _earlyErrors.push({msg:String(msg),line:line,col:col});
  var el = document.getElementById('errorLog');
  if (el) el.innerHTML = _earlyErrors.map(function(e){return '<div style="color:#f66;font-size:0.7em;">JS Error line '+e.line+': '+e.msg+'</div>';}).join('');
};
window.addEventListener('unhandledrejection', function(e) {
  var el = document.getElementById('errorLog');
  if (el) el.innerHTML += '<div style="color:#f66;font-size:0.7em;">Promise Error: ' + String(e.reason) + '</div>';
});


// ═══════════════════════════════════════════════════════════════════════════
//  CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function _L(cn, en) { return (window._lang && window._lang() === 'en' && en) ? en : cn; }
const SIGNS = [
  "白羊座♈","金牛座♉","双子座♊","巨蟹座♋",
  "狮子座♌","处女座♍","天秤座♎","天蝎座♏",
  "射手座♐","摩羯座♑","水瓶座♒","双鱼座♓"
];
const SIGN_PURE = ["白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"];

const PLANETS_ZH = [
  {id:"Sun",name:"太阳☉",emoji:"☉"},
  {id:"Moon",name:"月亮☽",emoji:"☽"},
  {id:"Mercury",name:"水星☿",emoji:"☿"},
  {id:"Venus",name:"金星♀",emoji:"♀"},
  {id:"Mars",name:"火星♂",emoji:"♂"},
  {id:"Jupiter",name:"木星♃",emoji:"♃"},
  {id:"Saturn",name:"土星♄",emoji:"♄"},
  {id:"Uranus",name:"天王星♅",emoji:"♅"},
  {id:"Neptune",name:"海王星♆",emoji:"♆"},
  {id:"Pluto",name:"冥王星♇",emoji:"♇"}
];
const PLANETS_EN = [
  {id:"Sun",name:"Sun☉",emoji:"☉"},
  {id:"Moon",name:"Moon☽",emoji:"☽"},
  {id:"Mercury",name:"Mercury☿",emoji:"☿"},
  {id:"Venus",name:"Venus♀",emoji:"♀"},
  {id:"Mars",name:"Mars♂",emoji:"♂"},
  {id:"Jupiter",name:"Jupiter♃",emoji:"♃"},
  {id:"Saturn",name:"Saturn♄",emoji:"♄"},
  {id:"Uranus",name:"Uranus♅",emoji:"♅"},
  {id:"Neptune",name:"Neptune♆",emoji:"♆"},
  {id:"Pluto",name:"Pluto♇",emoji:"♇"}
];
// ── i18n Proxy for PLANETS ────────────────────────────────────────
const PLANETS = new Proxy([], {
  get(target, prop, receiver) {
    const src = (window._lang && window._lang() === "en") ? PLANETS_EN : PLANETS_ZH;
    if (prop === Symbol.iterator) return src[Symbol.iterator].bind(src);
    if (typeof prop === 'string' && !isNaN(parseInt(prop))) return src[prop];
    if (prop === 'length') return src.length;
    // Array methods that iterate
    if (prop === 'find') return (...args) => src.find(...args);
    if (prop === 'filter') return (...args) => src.filter(...args);
    if (prop === 'map') return (...args) => src.map(...args);
    if (prop === 'forEach') return (...args) => src.forEach(...args);
    if (prop === 'reduce') return (...args) => src.reduce(...args);
    if (prop === 'some') return (...args) => src.some(...args);
    if (prop === 'every') return (...args) => src.every(...args);
    if (prop === 'findIndex') return (...args) => src.findIndex(...args);
    if (prop === 'includes') return (...args) => src.includes(...args);
    if (prop === 'indexOf') return (...args) => src.indexOf(...args);
    if (prop === 'slice') return (...args) => src.slice(...args);
    if (prop === 'flatMap') return (...args) => src.flatMap(...args);
    return Reflect.get(target, prop, receiver);
  }
});

const ELEMENTS = ["火","土","风","水","火","土","风","水","火","土","风","水"];
const MODES = ["开创","固定","变动","开创","固定","变动","开创","固定","变动","开创","固定","变动"];
const ELEM_EMOJI = { "火":"🔥", "土":"🌍", "风":"💨", "水":"🌊" };
const ELEMENTS_EN = {火:"Fire",土:"Earth",风:"Air",水:"Water"};
const MODES_EN = {开创:"Cardinal",固定:"Fixed",变动:"Mutable"};

function mod360(x) { return ((x % 360) + 360) % 360; }
function rad(d) { return d * Math.PI / 180; }
function deg(r) { return mod360(r * 180 / Math.PI); }
function sind(d) { return Math.sin(rad(d)); }
function cosd(d) { return Math.cos(rad(d)); }
function tand(d) { return Math.tan(rad(d)); }
function atan2d(y, x) { return deg(Math.atan2(y, x)); }

// ── Julian Date ───────────────────────────────────────────────────────────
function julianDay(y, m, d, h) {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + h / 24.0 + B - 1524.5;
}

// T in centuries since J2000.0
function centuriesSinceJ2000(jd) {
  return (jd - 2451545.0) / 36525.0;
}

// ── Obliquity (IAU 1980) ─────────────────────────────────────────────────
function obliquity(T) {
  return 23.4392911111 - 0.0130041667 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PLANETARY POSITIONS (Simplified Meeus / Keplerian)
// ═══════════════════════════════════════════════════════════════════════════

// Sun: mean anomaly + equation of center, accuracy ~0.01°
function calcSun(T) {
  const L = mod360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = mod360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sind(M)
          + (0.019993 - 0.000101 * T) * sind(2 * M)
          + 0.000289 * sind(3 * M);
  return mod360(L + C);
}

// Moon: truncated ELP, accuracy ~0.1°
function calcMoon(T) {
  const Lp = mod360(218.3164591 + 481267.88134236 * T);
  const D = mod360(297.8502042 + 445267.1115168 * T);
  const M = mod360(357.5291092 + 35999.0502909 * T);
  const Mp = mod360(134.9634114 + 477198.8676313 * T);
  const F = mod360(93.2720993 + 483202.0175273 * T);
  let lon = Lp
    + 6.289 * sind(Mp)
    + 1.274 * sind(2 * D - Mp)
    + 0.658 * sind(2 * D)
    + 0.214 * sind(2 * Mp)
    - 0.186 * sind(M)
    - 0.114 * sind(2 * F)
    + 0.059 * sind(2 * D - M - Mp)
    + 0.057 * sind(2 * D - M)
    + 0.053 * sind(2 * D + Mp)
    + 0.046 * sind(2 * D - M - M)
    + 0.041 * sind(Mp - M);
  return mod360(lon);
}

// Keplerian elements for planets (Standish approx, J2000)
// [a, e, i, L, peri, node, rate_L, rate_peri, rate_node]  -- angles in degrees
const ELEMS = {
  Mercury: [0.387099, 0.205636, 7.0050, 252.2509, 77.4561, 48.3317, 149472.6746, 0.1594, -0.1231],
  Venus:   [0.723332, 0.006777, 3.3947, 181.9798, 131.5637, 76.6808, 58517.8154, 0.0049, -0.0363],
  Mars:    [1.523710, 0.093405, 1.8497,  -4.5534, -23.9174, 49.5581, 19140.3027, 0.4440, -0.1000],
  Jupiter: [5.202887, 0.048498, 1.3044,  34.3515,  14.3312,100.4548,  3034.9051, 0.1725, -0.1215],
  Saturn:  [9.536651, 0.055508, 2.4860,  50.0774,  92.5989,113.6655,  1222.0005,-0.3830, -0.0568],
  Uranus:  [19.18916,0.046857, 0.7726, 314.1377, 172.8848, 74.0160,   428.4546,-0.0187, -0.0178],
  Neptune: [30.06992,0.008954, 1.7700, 304.3487,  46.1344,131.7842,   218.9985,-0.0254, -0.0122],
  Pluto:   [39.445,  0.250249,17.142,  238.955,  224.097, 110.299,     145.207, -0.561,  -0.044]
};

function trueAnomaly(M, e) {
  M = rad(M);
  let E = M;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return deg(2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)));
}

// Earth heliocentric: longitude = Sun geo + 180°, radius in AU
function earthHelio(T) {
  const sunGeo = calcSun(T);
  const lon = mod360(sunGeo + 180);
  const L = mod360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const perie = mod360(102.93735 + 0.32290 * T);
  const M = mod360(L - perie);
  const nu = trueAnomaly(M, 0.016709);
  const r = 1.000001 * (1 - 0.016709 * 0.016709) / (1 + 0.016709 * cosd(nu));
  return { lon, r };
}

function calcPlanet(id, T) {
  const e = ELEMS[id];
  if (!e) return 0;
  const L = mod360(e[3] + e[6] * T);
  const peri = mod360(e[4] + e[7] * T);
  const M = mod360(L - peri);
  const nu = trueAnomaly(M, e[1]);
  const lonHelio = mod360(nu + peri);
  const r = e[0] * (1 - e[1] * e[1]) / (1 + e[1] * cosd(nu));
  // Convert heliocentric → geocentric ecliptic
  const earth = earthHelio(T);
  const x = r * cosd(lonHelio) - earth.r * cosd(earth.lon);
  const y = r * sind(lonHelio) - earth.r * sind(earth.lon);
  return mod360(atan2d(y, x));
}

function calcAllPlanets(T) {
  return {
    Sun: calcSun(T),
    Moon: calcMoon(T),
    Mercury: calcPlanet("Mercury", T),
    Venus: calcPlanet("Venus", T),
    Mars: calcPlanet("Mars", T),
    Jupiter: calcPlanet("Jupiter", T),
    Saturn: calcPlanet("Saturn", T),
    Uranus: calcPlanet("Uranus", T),
    Neptune: calcPlanet("Neptune", T),
    Pluto: calcPlanet("Pluto", T)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOUSES: ASC, MC, Placidus cusps
// ═══════════════════════════════════════════════════════════════════════════

function calcHouses(jd, lat, lng, eps) {
  const T = centuriesSinceJ2000(jd);
  // GMST at 0h UT
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
  gmst = mod360(gmst);
  // Add longitude to get LST
  const lst = mod360(gmst + lng);
  const lstRad = rad(lst);
  const latRad = rad(lat);
  const epsRad = rad(eps);

  // MC
  const mcRad = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(epsRad));
  const mc = mod360(deg(mcRad));

  // ASC
  const y = Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(lstRad);
  let ascRad = Math.atan2(-Math.cos(lstRad), y);
  let asc = mod360(deg(ascRad));
  // Quadrant check
  const raAsc = eclToRA(asc, eps);
  if (eastwardSpan(lst, raAsc) > 180) {
    asc = mod360(asc + 180);
  }

  const ic = mod360(mc + 180);
  const dsc = mod360(asc + 180);

  // Placidus cusps
  const cusps = new Array(13).fill(0);
  cusps[1] = asc;
  cusps[4] = ic;
  cusps[7] = dsc;
  cusps[10] = mc;

  cusps[2]  = placidusOne(asc, ic, latRad, epsRad, 1/3, true, asc);
  cusps[3]  = placidusOne(cusps[2], ic, latRad, epsRad, 2/3, true, asc);
  cusps[5]  = placidusOne(ic, dsc, latRad, epsRad, 1/3, true, ic);
  cusps[6]  = placidusOne(cusps[5], dsc, latRad, epsRad, 2/3, true, ic);
  cusps[8]  = placidusOne(dsc, mc, latRad, epsRad, 1/3, false, dsc);
  cusps[9]  = placidusOne(cusps[8], mc, latRad, epsRad, 2/3, false, dsc);
  cusps[11] = placidusOne(mc, asc, latRad, epsRad, 1/3, false, mc);
  cusps[12] = placidusOne(cusps[11], asc, latRad, epsRad, 2/3, false, mc);

  return { cusps, asc, mc, ic, dsc };
}

function eclToRA(lon, eps) {
  const r = rad(lon);
  const epsR = rad(eps);
  return mod360(deg(Math.atan2(Math.sin(r) * Math.cos(epsR), Math.cos(r))));
}

function eclToDec(lon, eps) {
  return Math.asin(Math.max(-1, Math.min(1, Math.sin(rad(lon)) * Math.sin(rad(eps)))));
}

function semiArcDsa(dec, latRad) {
  const arg = -Math.tan(latRad) * Math.tan(dec);
  return deg(Math.acos(Math.max(-1, Math.min(1, arg))));
}

function semiArcNsa(dec, latRad) {
  return 180 - semiArcDsa(dec, latRad);
}

function eastwardSpan(a, b) {
  return b >= a ? b - a : 360 - a + b;
}

function lonAfterEastward(lon, offset) {
  return mod360(lon + offset);
}

function placidusOne(lonA, lonB, latRad, epsRad, fraction, nocturnal, refLon) {
  const raRef = eclToRA(refLon, deg(epsRad));

  function error(lon) {
    const dec = eclToDec(lon, deg(epsRad));
    const ra = eclToRA(lon, deg(epsRad));
    const ed = eastwardSpan(raRef, ra);
    const sa = nocturnal ? semiArcNsa(dec, latRad) : semiArcDsa(dec, latRad);
    return ed - fraction * sa;
  }

  const span = eastwardSpan(lonA, lonB);
  const N = 720;
  const step = span / N;

  let loLon = lonA;
  let loVal = error(lonA);

  for (let i = 1; i <= N; i++) {
    let hiLon = lonAfterEastward(lonA, i * step);
    let hiVal = error(hiLon);

    if (loVal * hiVal <= 0) {
      for (let j = 0; j < 60; j++) {
        const half = eastwardSpan(loLon, hiLon) / 2;
        const midLon = lonAfterEastward(loLon, half);
        const midVal = error(midLon);
        if (Math.abs(midVal) < 0.0001) return mod360(midLon);
        if (loVal * midVal <= 0) { hiLon = midLon; hiVal = midVal; }
        else { loLon = midLon; loVal = midVal; }
      }
      return lonAfterEastward(loLon, eastwardSpan(loLon, hiLon) / 2);
    }
    loLon = hiLon;
    loVal = hiVal;
  }
  return lonAfterEastward(lonA, span / 2);
}

function assignHouses(positions, cusps) {
  const houses = {};
  for (const [name, lon] of Object.entries(positions)) {
    for (let h = 1; h <= 12; h++) {
      const nh = h < 12 ? h + 1 : 1;
      const a = cusps[h], b = cusps[nh];
      if (b < a) {
        if (lon >= a || lon < b) { houses[name] = h; break; }
      } else {
        if (lon >= a && lon < b) { houses[name] = h; break; }
      }
    }
  }
  return houses;
}

// ═══════════════════════════════════════════════════════════════════════════
//  ASPECTS
// ═══════════════════════════════════════════════════════════════════════════
const ASPECT_DEFS = [
  {name:"合", angle:0, orb:8, cls:"aspect-neutral"},
  {name:"六合", angle:60, orb:6, cls:"aspect-good"},
  {name:"刑", angle:90, orb:7, cls:"aspect-hard"},
  {name:"三合", angle:120, orb:8, cls:"aspect-good"},
  {name:"冲", angle:180, orb:8, cls:"aspect-hard"}
];

function calcAspects(positions) {
  const aspects = [];
  const keys = Object.keys(positions);
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const p1 = keys[i], p2 = keys[j];
      let diff = mod360(Math.abs(positions[p1] - positions[p2]));
      if (diff > 180) diff = 360 - diff;
      for (const ad of ASPECT_DEFS) {
        const delta = Math.abs(diff - ad.angle);
        if (delta <= ad.orb) {
          aspects.push({p1, p2, name:ad.name, actual:diff, orb:delta, cls:ad.cls});
        }
      }
    }
  }
  return aspects;
}

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
        if (sfId) { var orig2 = sfId.textContent; sfId.textContent = '✓ 已复制'; sfId.style.color = '#5a8'; setTimeout(function() { sfId.textContent = orig2; sfId.style.color = ''; }, 2000); }
      }
    }
  }).catch(function() {
    alert(platform + '号：' + id + '\n请手动复制');
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
//  INTERPRETATION DATA
// ═══════════════════════════════════════════════════════════════════════════

const PLANET_SIGN_ZH = {
  "Sun": {
    "0": "太阳白羊赋予你开拓者的灵魂——勇敢、直接、充满生命力。你不喜欢等待，更不愿被规则束缚，是天生的先行者。在事业上适合创业或需要快速决策的领域；感情中主动热情，但需要学会耐心倾听伴侣。此生课题是将冲劲转化为持久的成就。",
    "1": "太阳金牛让你拥有大地般的沉稳和坚韧。你重视物质安全与感官享受，对美和财富有天然的判断力。赚钱是你建立安全感的核心方式之一，理财能力通常不弱。感情中忠诚且持久，但占有欲较强。需警惕因过度追求稳定而错过改变的机会。",
    "2": "太阳双子赋予你永不疲倦的好奇心和敏捷的思维。你擅长收集信息和连接人脉，是天生的沟通者。职业上适合媒体、教育、销售等多元领域。感情中需要智识的碰撞和不断的交流，伴侣必须能跟上你的思维速度。最大的功课是学会专注和深入。",
    "3": "太阳巨蟹让你将情感和安全感置于人生核心。家庭、根源和亲密关系是你力量的源泉。你天生具有滋养他人的能力，在照顾型职业中尤为出色。感情中温柔体贴但防御心重，需要对方先证明忠诚和可靠。财务决策常受情绪影响，需建立理性框架。",
    "4": "太阳狮子赋予你天生的舞台魅力和创造力。你渴望被看见、被认可，内心深处相信自己注定不凡。适合领导岗位和创意产业。感情中热情浪漫，需要被伴侣崇拜和赞美。财运上敢投敢花，大方慷慨，但需学会储蓄和规划。此生课题是在自信与谦逊间找到平衡。",
    "5": "太阳处女让你追求完美和秩序。你拥有精密的分析能力和服务精神，做事一丝不苟。职业上适合技术、医疗、研究等需要专业深度的领域。感情表达克制而务实，用行动而非言语证明爱。财运上精打细算，但可能因过度谨慎错过投资机会。学会接纳不完美是你的成长方向。",
    "6": "太阳天秤赋予你优雅的社交能力和公正的判断力。你天生追求和谐与平衡，擅长合作和外交。职业上适合法律、公关、设计等需要审美和协调能力的领域。感情是你人生中最重要的主题之一——你需要在关系中照见自己。决策时容易犹豫不决，这是你需要克服的短板。",
    "7": "太阳天蝎让你拥有X光般的洞察力和惊人的意志力。你不满足于表面的答案，总是在追问真相和深度。职业上适合研究、心理、金融等需要穿透力的领域。感情中全情投入，爱恨分明，背叛是你最难原谅的事。财运上有投资眼光，但需避免因执念而孤注一掷。",
    "8": "太阳射手赋予你永远在路上的灵魂。你热爱自由、冒险和哲学探索，生命的意义在于不断扩展视野。职业上适合教育、出版、国际事务等领域。感情中不喜欢被束缚，需要一个能和你一起探索世界的伴侣。财运上乐观但容易过于乐观，需建立风险意识。",
    "9": "太阳摩羯让你少年老成，早早承担起责任。你目标明确、意志坚定，耐心和耐力远超同龄人。职业上具有极强的事业心和执行力，适合管理和领导岗位。感情中克制而负责，用成就而非言语来表达爱。财运上擅长长线布局，但需学会享受奋斗的过程而不只是结果。",
    "10": "太阳水瓶赋予你独立前卫的思想和人道主义情怀。你天生与众不同，不按常理出牌。职业上适合科技、社群、创新领域。感情中需要精神共鸣和充分的个人空间，传统的关系模式可能不适合你。财运上常有独特的收入来源，但不稳定。学会在独立与合作间找到平衡是此生课题。",
    "11": "太阳双鱼让你拥有无边界的慈悲心和丰富的想象力。你的灵魂柔软而深邃，天然通晓艺术和灵性领域。职业上适合艺术、疗愈、慈善等需要共情能力的工作。感情中浪漫梦幻，容易在爱中失去自我边界。财运上直觉敏锐，但需建立实际的金钱管理习惯——你此生的修行是在现实世界中为梦想建造容器。"
  },
  "Moon": {
    "0": "月亮白羊让你的情绪表达直接而热烈。内心永远住着一个战士，需要不断的新刺激来保持情感活力。在亲密关系中，你反应迅速但缺乏耐心，容易因小事爆发但转头就忘。你的情感安全感来自「行动」——感到不安时你会本能地想做点什么。",
    "1": "月亮金牛给你最稳定的情绪底色。你需要物质安全和感官舒适来安抚内心，美食、美物、稳定的生活环境是你情感健康的基石。关系中忠诚度极高，但一旦受伤恢复缓慢。财运上的安全感直接影响你的情绪状态——存款数字是你内心平静的晴雨表。",
    "2": "月亮双子让你的情感需求多变且以智识为核心。你需要不断的信息交流和新鲜体验来获得情绪满足。内心永远年轻，机智善辩，但可能因思维过度活跃而难以在情感中稳定下来。伴侣一定要能和你在智力上交锋，否则你会感到无聊。",
    "3": "月亮巨蟹是月亮最自然的位置——情感丰富、直觉力强、极度重视家庭和亲密关系。你的情绪如潮汐般起伏，容易吸收周围人的情绪。在爱中你是天生的照顾者，但也需要被悉心呵护。情感安全感是你人生的基石，每当它被动摇，一切都会受影响。",
    "4": "月亮狮子让你的内心渴望被赞美和崇拜。情感表达戏剧化而热烈，你需要伴侣的绝对忠诚和持续关注。自尊心是你情绪健康的核心——当你感到被忽视或低估时会变得非常敏感。创造性的自我表达和舞台上的光芒是你情感滋养的重要来源。",
    "5": "月亮处女让你的情感表达谨慎克制。你通过服务和照顾他人来表达爱，内心追求完美但容易担忧和焦虑。在感情中你对自己和对方都有极高要求，这可能导致关系紧张。建立健康的生活秩序和日常规律是你的情绪稳定器。",
    "6": "月亮天秤赋予你对和谐关系的深切渴望。你害怕冲突和孤独，需要伴侣的陪伴来获得情感满足。优雅温和的外表下，你其实对关系中的不平衡非常敏感。审美和美的事物是你情绪调节的重要方式。学会在取悦他人和照顾自己之间找到平衡是重要课题。",
    "7": "月亮天蝎让你的情感世界如深海般强烈而神秘。爱恨分明，内心隐藏着巨大的情感能量和直觉力。你需要绝对的信任和灵魂层面的交融，肤浅的关系无法满足你。你具有极强的情绪再生能力——每一次的情感危机都是一次蜕变的契机。",
    "8": "月亮射手让你的情感表达乐观开朗。内心充满对远方的向往和对生命意义的追寻，不喜欢被琐碎日常束缚。你需要一个能和你一起成长和探索的伴侣，限制你自由的人会让你本能地逃离。旅行、学习和哲学是你情绪充电的方式。",
    "9": "月亮摩羯让你的情感表达克制而内敛。你重视责任和承诺，用行动而非言语表达爱。内心强大但不轻易表露，情绪管理能力是你在职场中的优势。但在亲密关系中，你需要学会允许自己脆弱——不是所有事都需要一个人扛。",
    "10": "月亮水瓶赋予你独立理性的情感模式。你需要精神共鸣和充分的个人空间，传统的情感依赖模式可能让你感到窒息。你关心人类多于关心个人，理想主义和社群意识是你情绪世界的重要组成部分。与他人的情感距离是你保护自己的方式，但也可能成为孤独的来源。",
    "11": "月亮双鱼让你拥有无边界的共情能力和丰富的内心世界。你的情绪敏锐度极高，能感知他人未说出口的感受。艺术和灵性是你情感滋养的重要来源。在感情中你容易迷失自我边界，将伴侣的课题当作自己的课题。你需要建立的不是更厚的墙，而是更清晰的界限。"
  },
  "Mercury": {
    "0": "水星白羊让你的思维和表达直接而迅速。说话不拐弯抹角，想到什么说什么。学习能力强但缺乏耐心，适合开创性思考和快节奏的信息处理。在谈判或辩论中可以成为犀利的对手，但需要注意不要因为说话太冲而伤到关系。",
    "1": "水星金牛让你的思维稳健而务实。学习速度不快，但一旦理解就根深蒂固。你的表达方式温和而有说服力，重视实际经验而非抽象理论。在财务决策和长期规划方面具有天赋。沟通风格偏保守，不喜欢无意义的闲聊。",
    "2": "水星双子是水星最活跃的位置——思维敏捷、口才出众、信息处理速度极快。你天生适合写作、教学、媒体或销售等需要沟通技巧的工作。好奇心驱动你不断学习新事物，但也容易浅尝辄止。你的思维需要在广度和深度之间找到平衡。",
    "3": "水星巨蟹让你的思维受情绪和记忆的深刻影响。你的记忆力极强，尤其是与情感体验相关的信息。直觉式的思维方式让你善于捕捉言语之外的信息。沟通风格温和而有同理心，适合从事需要情感智慧的领域。但需要注意不要让情绪完全主导判断。",
    "4": "水星狮子赋予你创造性和戏剧化的表达方式。你善于宏观思考和故事讲述，有将复杂想法包装得引人入胜的天赋。适合领导力沟通、创意策划、公共演讲等领域。你可能对细节不太有耐心，需要培养团队中能帮你落实想法的人。",
    "5": "水星处女是水星最强的位置之一——分析能力卓越，思维严谨细致。你善于分类、整理和优化信息，是天然的编辑、分析师或技术专家。工作中追求精确和效率。但过度追求完美可能让你陷入分析陷阱，迟迟无法做出最终判断。",
    "6": "水星天秤让你善于从多角度看问题。你的表达优雅得体，是天生的外交官和谈判者。追求思维上的和谐与公正，在冲突中能站在中立位置调和各方。适合法律、公关、咨询等需要平衡不同利益的工作。决策时可能犹豫不决——你需要相信自己的判断。",
    "7": "水星天蝎赋予你穿透表象的思维能力。你不满足于浅层信息，擅长挖掘真相和隐秘的动机。适合研究、调查、心理分析等需要深度的工作。你的表达简短但有力量，话不多但每句都在点上。保守秘密是你的天赋，但注意不要走向偏执和怀疑一切。",
    "8": "水星射手让你的思维开阔而乐观。你喜欢探索哲学、宗教、文化等宏观话题，对知识的渴望驱动你不断远行——无论是实际的还是心智的。学习方式跳跃式，擅长把握整体图景但不耐烦细节。适合教育、出版、国际事务等领域。",
    "9": "水星摩羯让你的思维严谨务实，逻辑性和结构性极强。学习方式循序渐进，适合需要长期积累和系统规划的领域。你的表达方式简洁高效，不说废话。在商业、管理、工程等需要精确思维和长期规划的领域有天然优势。",
    "10": "水星水瓶让你的思维独特而前卫。你不按常理出牌，常有意想不到的洞见和创新想法。适合科技、发明、社会创新等需要前瞻性思维的领域。你关心人类进步和社会议题，善于发现未来的趋势。你的沟通风格可能有些抽离，在亲密沟通中需要注意情感温度。",
    "11": "水星双鱼赋予你诗意和直觉式的思维方式。你的大脑不以线性逻辑运作，而是以图像、感受和联想。适合艺术创作、音乐、灵性疗愈等领域。你的表达能力可能不如其他配置清晰，但传达的情感和氛围是无与伦比的。日常逻辑表达需要刻意练习。"
  },
  "Venus": {
    "0": "金星白羊让你在爱情中主动而热情。你喜欢追求和征服带来的刺激感，被动等待不是你的风格。审美直接大胆，喜欢鲜明的色彩和风格。感情中需要保持新鲜感和挑战性，但要注意冲动和三分热度的倾向。财运上果断但需要加强规划。",
    "1": "金星金牛是金星最舒适的位置——你在爱情中忠诚稳定，重视感官享受和物质基础。喜欢自然舒适的美学风格，对品质有天然的判断力。感情慢热但持久，一旦交付真心就坚定不移。财运上具有积累财富的本能，对投资和保值有良好直觉。",
    "2": "金星双子让你在爱情中追求智识的交流和多样性。你的魅力来自机智的谈吐和永不枯竭的好奇心。容易被聪明有趣的人吸引，审美多元化且时常变化。在感情中需要持续的新鲜刺激，但也可能因此难以做出长期承诺。适合以沟通和社交为核心的工作。",
    "3": "金星巨蟹让你在爱中极度重视情感安全感。你温柔体贴，天然知道如何让伴侣感到被照顾和被珍视。喜欢营造温馨的家庭氛围，念旧且具有母性光辉。在感情中容易因害怕受伤而筑起保护壳，需要对方先证明忠诚。财运上倾向于储蓄和保守投资。",
    "4": "金星狮子让你在爱情中热情浪漫、光芒四射。你喜欢被追求和赞美，付出的爱也是慷慨而戏剧化的。审美华丽，喜欢能让你在人群中脱颖而出的风格。需要伴侣的持续关注和认可。财运上有赚大钱的野心和魅力，但消费上也相当大方。",
    "5": "金星处女让你在爱情中克制而理性。你通过实际行动而非华丽言辞来表达爱——为你爱的人做事、解决问题、提供实用的帮助。审美简约精致，注重细节和品质胜过数量。感情中对伴侣有较高标准，有时过于挑剔。财运上精打细算，擅长发现性价比高的东西。",
    "6": "金星天秤是金星最强的位置——你天生懂得爱与美的艺术。追求和谐平等的关系，善于经营感情中的平衡。审美优雅经典，有出色的品味。害怕孤独，在关系中容易为了维持和谐而过度妥协。财运上可能因追求品质生活而花费较多，但你的社交资源往往能带来回报。",
    "7": "金星天蝎让你在爱情中全情投入、渴望灵魂深处的连接。占有欲强但忠诚，一旦爱上便是刻骨铭心。审美神秘而性感，喜欢有深度和故事感的人和事。在感情中不容易原谅背叛。财运上有投资天赋，能洞察价值被低估的机会，但需避免因执念造成损失。",
    "8": "金星射手让你在爱情中乐观开放、热爱自由。你喜欢跨国跨文化的浪漫，容易被不同背景的人吸引。审美自由奔放，热爱异域文化和冒险。在感情中不喜欢被束缚，需要伴侣能接纳你的独立性。财运上好运常来但缺乏规划，需要在乐观和实际之间找到平衡。",
    "9": "金星摩羯让你在爱情中谨慎而认真。你不轻易陷入感情，但一旦确定关系就会认真对待并承担责任。审美经典低调，重视品质和长久价值而非潮流。在感情中可能显得有些冷淡和务实，但你用忠诚和实际行动来表达爱。财运上具有极强的长期积累和投资规划能力。",
    "10": "金星水瓶让你在爱情中独立自由、不拘一格。你不需要传统的关系模式——精神共鸣和个人空间比浪漫仪式更重要。审美前卫独特，喜欢实验性和与众不同的风格。你吸引人的地方恰恰是你的与众不同。财运上可能有来自社群、互联网或创新领域的收入。",
    "11": "金星双鱼是金星最高的表达——你在爱情中浪漫梦幻、具有无条件的慈悲心。爱对你来说是灵魂的融合而非物质的交换。审美富有艺术气息和灵性色彩。容易被需要帮助的人吸引，在感情中需要注意自我保护。财运上直觉力强，但需建立实际的金钱管理习惯。"
  },
  "Mars": {
    "0": "火星白羊是火星最强的位置——行动力爆表，竞争意识极强。你在面对挑战时反应迅速，是天生的先锋和领袖。行动方式直接果敢，但忍耐力有限，容易对长期项目失去耐心。在事业、运动和需要快速决断的领域有天然优势。感情中热情主动，需要释放能量的出口。",
    "1": "火星金牛让你的行动稳健而持久。启动速度慢，但一旦开始就坚定不移。你的耐力极强，适合需要长期坚持才能见到成果的领域。对物质和感官层面的追求驱动着你的行动力。在感情中你的欲望深沉而持续，但可能显得过于固执或占有欲强。",
    "2": "火星双子让你的行动方式灵活多变。你擅长多任务处理，精力分散但效率高。沟通、写作、旅行和智力挑战是你释放能量的主要途径。在需要快速反应和适应力的场合你表现出色。感情中你需要智识的刺激和持续的交流来维持热情。",
    "3": "火星巨蟹让你的行动受情绪和保护欲驱动。为家人和爱人而战时你最为勇猛。你的行动力是间歇性的——情绪高涨时无所不能，低落时需要安全港。具有极强的守护本能，但在职场中有时因情绪因素影响了行动的一致性。",
    "4": "火星狮子赋予你戏剧化的行动风格和领导魅力。你需要被认可和赞赏来保持动力，在团队中自然地走向领导位置。你的行动具有表演性——当你站在聚光灯下时表现最好。感情中热情主动且慷慨，但需注意不要用支配替代爱护。",
    "5": "火星处女让你的行动精准高效。你善于制定详细计划并严格执行，完美主义是你的驱动力。在需要精确性、手艺和分析能力的工作中表现出色。感情中通过服务的行动来表达爱——为你爱的人解决问题就是你的浪漫。需注意不要因过度自我批判而挫伤行动力。",
    "6": "火星天秤让你在行动中注重公平和协作。你不喜欢独自冲锋陷阵，更擅长调动团队力量。你的决策过程需要权衡各方利益，这使你成为一个公正的领导者，但也可能因过度权衡而行动迟缓。在感情和合作中，你需要伙伴才能发挥最佳行动力。",
    "7": "火星天蝎赋予你极强的意志力和持久的战斗力。不鸣则已一鸣惊人——你不需要时刻显示自己的力量，但在关键时刻爆发力惊人。具有战略思维，适合需要深度和坚韧的领域。感情中性魅力强烈，欲望深沉。你对背叛的反应是毁灭性的。",
    "8": "火星射手让你行动充满热情和冒险精神。热爱运动、旅行和户外挑战，乐观积极的心态是你的最大驱动力。你行动的方向是不断扩展视野和获得新体验。在需要热情和信念的事业中你表现最佳。感情中追求自由和共同的冒险，不喜欢被日常琐事束缚。",
    "9": "火星摩羯让你行动有计划、有纪律、有目标。你的执行力极强，一旦确定方向就会坚定不移地推进。成就导向驱动着你的每一步行动。在职场中你是一个可靠的力量，但可能显得过于严肃。感情中用实用行动表达爱，比起浪漫言辞更擅长为你爱的人提供实质支持。",
    "10": "火星水瓶赋予你独特不羁的行动风格。你按自己的节奏和方式行事，不受传统和权威的束缚。你的行动力集中在改革、创新和群体事业上。在需要突破常规的领域你表现最佳。感情中需要充分的自由和空间，传统的关系规则对你来说不是必须遵守的。",
    "11": "火星双鱼让你的行动受直觉和灵感驱动。看似柔弱实则柔韧——你的行动方式如水般适应力强。艺术创作、灵性实践和帮助他人是你释放能量的主要途径。在需要共情和想象力的领域中有独特优势。你可能不是最有执行力的配置，但你的行动具有深刻的感染力。"
  },
  "Jupiter": {
    "0": "木星白羊让你通过勇气、冒险和竞争获得成长。你的好运来自敢于当机立断和走在最前面。事业上适合开创性角色，桃花容易发生在竞争或运动场合。财运机会常在你主动出击时降临——等待不是你的幸运策略。",
    "1": "木星金牛让你通过积累、耐心和实际判断获得扩张。财富运是此配置中最突出的天赋——你不追求快钱，但长期稳健的财务增长是你的标志。感情中的幸运来自稳定和真诚的付出。你的福报常在缓慢而确定的过程中显现。",
    "2": "木星双子让你通过信息、学习和人脉网络获得机遇。你的口才和对信息的敏感性是最大的财富催化剂。事业上适合多元化发展，桃花运来自社交场合和智识交流。财运机会常在你最不经意的时候通过朋友或新信息出现。",
    "3": "木星巨蟹让你通过情感连接和家庭滋养获得成长。幸运来自直觉和对他人需求的敏感——你给予的温暖总会以某种方式回流。家庭和房产方面常有福报。感情中的好运来自你愿意照顾好自己和他人的情感需求。",
    "4": "木星狮子让你通过创造性的自我表达和领导力获得扩张。你的自信和舞台魅力是最大的财富催化剂。事业上被看见和被认可的机会远超常人。桃花运旺盛——你走到哪里都自带光环。财运机会来自你的个人品牌和影响力。",
    "5": "木星处女让你通过服务、精细化的工作和不断提升的专业能力获得成长。你的幸运在于把事做对、做细、做到极致。事业上的专业口碑是最可靠的财富来源。感情中的好运来自你真诚的付出和谦逊的态度——不求回报时反而得到最多。",
    "6": "木星天秤让你通过合作、外交和人际关系的平衡获得机遇。好的伴侣和合作伙伴是你最大的幸运来源。事业上适合需要协商和审美的领域。桃花运在社交和艺术场合最旺。财运机会常通过合作关系和人际网络到来。",
    "7": "木星天蝎让你通过深度转化、资源整合和策略性投资获得成长。你的投资眼光和资源运作能力是最大的财富天赋。事业上的成功来自深度的专业能力和战略思维。感情中的幸运在于你愿意面对自己的阴影并进行深刻的自我蜕变。",
    "8": "木星射手是木星最强的位置——通过旅行、高等教育、哲学探索和跨文化体验获得无限扩展。你的开放心态和对生命的热情是最大的财富。事业上适合国际化和教育领域。桃花运在旅行和进修中最旺盛。财运机会常有异国或跨文化的色彩。",
    "9": "木星摩羯让你通过努力、纪律和长期规划获得成长。虽然木星在此位置不够自如，但你的幸运在于持续不懈的付出——当别人已经放弃时你还在坚持。事业上的社会地位是最大的财富来源。财务安全感来自长线布局和稳定的职业晋升。",
    "10": "木星水瓶让你通过创新、社群参与和前瞻性的愿景获得扩张。你的独特思维和人道主义情怀是最大的财富催化剂。事业上适合科技、社群和创新领域。桃花运常在社群和共同事业中悄然绽放。财运机会来自非传统渠道和志同道合的群体。",
    "11": "木星双鱼让你通过灵性、艺术和慈悲心获得成长。你的直觉力和想象力是最大的财富来源。事业上适合艺术、疗愈和慈善领域。感情中的好运来自你无分别的爱和共情能力。财运上需在理想主义和实际管理之间找到平衡。"
  },
  "Saturn": {
    "0": "土星白羊：你此生的核心课题是学会耐心和策略性的行动。你被要求将白羊的冲动转化为持续的努力和有序的推进。事业上只有通过纪律才能将领导的潜力转化为实际的成就。感情中需要学会在自我主张和妥协让步之间找到平衡。",
    "1": "土星金牛：你此生的核心课题是建立健康的价值观和自我价值感。对物质安全感的过度执着需要被审视。事业上适合在稳定中逐步攀升，不适合高风险的操作。财运是你需要修行的重点领域——不是挣钱能力的问题，而是与金钱的心理关系。",
    "2": "土星双子：你此生的核心课题是学会专注和深度的思考。信息碎片化和浅尝辄止是你容易陷入的模式。事业上需要选择一个领域深耕而非不断切换方向。沟通是你的天赋也是你的课题——学会在合适的时候保持沉默同样重要。",
    "3": "土星巨蟹：你此生的核心课题是建立情绪边界和内在安全的根基。你容易承担超出自己承受范围的情感责任。事业上情感智慧是你的优势，但需要防止被他人的需求淹没。学会在照顾他人和保护自己之间取得平衡是你此生最重要的功课。",
    "4": "土星狮子：你此生的核心课题是将自我表现转化为真正的创造和服务。你被要求从「被看到」走向「照亮他人」。事业上的领导力需要通过谦逊和持续付出来赢得。感情中需要学会爱不是索取关注，而是给予真诚的看见。",
    "5": "土星处女：你此生的核心课题是接纳不完美和自我慈悲。过度批判和完美主义是你最沉重的负担。事业上你的专业能力极强，但焦虑可能阻碍你发挥。感情中需要学会关系的本质不是完美而是成长。当你停止苛责自己，世界也会对你温柔。",
    "6": "土星天秤：你此生的核心课题是学会建立健康的边界和独立决策的能力。过度依赖他人的认可和回避冲突是你需要克服的模式。事业上你的协调能力是优势，但需要在关键时刻坚定立场。感情中真正的亲密不是融合，而是两个独立完整的人的选择。",
    "7": "土星天蝎：你此生的核心课题是学会信任和放下控制。对背叛的恐惧可能导致你在关系中筑起高墙。事业上你的深度和战略思维是优势，但对权力的执念是陷阱。当你学会在适当的时候放手，转化才真正开始。",
    "8": "土星射手：你此生的核心课题是将乐观转化为纪律，将信念转化为行动。过度乐观和逃避现实是你需要注意的倾向。事业上适合教育和国际领域，但需要建立持续的行动框架。真正的自由不是随心所欲，而是在约束中找到意义。",
    "9": "土星摩羯：土星入庙——责任、成就和纪律是你此生最重要的课题和最大的力量来源。你天生懂得延迟满足和长远规划。事业上的成就驱动力极强，但也容易成为工作狂。学会在奋斗和享受之间找到平衡，是土星摩羯一生的功课。",
    "10": "土星水瓶：你此生的核心课题是在独立与合作之间找到平衡。情感疏离和过度理性化是你需要突破的模式。事业上你的创新思维是优势，但需要学会与他人协作。真正的独立不意味着排斥连接，而是在连接中保持自我。",
    "11": "土星双鱼：你此生的核心课题是建立界限和面对现实。逃避痛苦的倾向是你需要觉察的模式。事业上艺术和灵性天赋是优势，但需要建立实际的行动框架来承载你的梦想。当你学会在柔软中保持坚定，你的慈悲将成为真正的力量而非负担。"
  },
  "Uranus": {
    "0": "天王星白羊（世代的先锋）：你具有打破传统、独立行动的强大冲动。你对个人自由的需求超越一切。在事业上你是天生的创业者和改革者。爱情中你需要一个不被规则束缚的关系模式，传统婚姻框架可能让你感到窒息。",
    "1": "天王星金牛（世代的变革者）：你对物质世界和价值观有颠覆性的看法。可能经历财务上的大起大落或完全不同的赚钱方式。你这一代人将重塑金融体系和人与自然的关系。个人层面上，你对美的追求也不同寻常。",
    "2": "天王星双子（新一代的沟通者）：信息处理和传播方式将被彻底颠覆。你具有高度原创的思维方式，对新技术和新媒体有天生的敏感。社交圈多元且变化快。学习方式打破常规——你可能同时是多个领域的深度爱好者。",
    "3": "天王星巨蟹（情感的革命者）：你对家庭、安全感和情感表达的定义与上一代人截然不同。非传统的家庭结构、远程家庭关系、情感科技的应用都是你这一代带来的变革。个人层面上，你的情绪表达方式独特且不可预测。",
    "4": "天王星狮子（创造力的解放者）：自我表达和创造力的形式被彻底颠覆。你不满足于传统的舞台和认可方式。你这一代人带来了全新的艺术形式和领导力概念。爱情中的自我展示方式也不同寻常——你的个人魅力与众不同。",
    "5": "天王星处女（工作的革命者）：工作方式、健康观念和日常秩序正在被颠覆。你这一代人推动了远程工作和数字健康的发展。个人层面上，你的工作流程和健康习惯可能与主流完全不同。对完美的定义也在发生变化。",
    "6": "天王星天秤（关系的革命者）：婚姻、合作和社会关系的定义正在被彻底改写。你这一代人正在创造全新的关系模式和社会契约。个人层面上，你在合作关系和伴侣关系中需要充分的自由度和灵活性。",
    "7": "天王星天蝎（转化的加速器）：深度转化、权力结构和性的观念正在经历革命。你具有极强的直觉和突破禁忌的冲动。金融体系的变革和资源再分配是你这一代的核心议题。个人层面上，你的转化经历往往是突然而剧烈的。",
    "8": "天王星射手（信仰的革命者）：教育、宗教和旅行的形式正在被颠覆。你这一代人带来了全新的哲学体系和跨文化理解方式。个人层面上，你的信念系统可能经历多次突然的转向——每次转向都是一次觉醒。",
    "9": "天王星摩羯（权威的重塑者）：社会结构、政府和企业正在被根本性地改变。你这一代人将挑战和重建权威的形式。事业上的路径可能充满突然的转折——被裁员后创业、或在传统行业中引入颠覆性的模式。",
    "10": "天王星水瓶（极致的天王星）：这是天王星最强大的位置之一。你具有极强的独立精神和前瞻性思维，对集体未来有深刻的直觉。科技创新和社会变革是你此生的核心主题。人际关系的模式高度个性化且不按常理。",
    "11": "天王星双鱼（灵性的革命者）：灵性、艺术和集体潜意识的领域正在经历彻底的变革。你这一代人带来了全新的疗愈方式和灵性实践。个人层面上，你的直觉和灵性体验可能突然开启，以不寻常的方式与世界进行灵魂层面的连接。"
  },
  "Neptune": {
    "0": "海王星白羊（梦想的先锋）：你这一代人将灵性和理想主义注入了行动和开创精神之中。个人层面上，你对梦想的追求具有不寻常的勇气，但也需要警惕冲动投入虚幻的目标。学会区分直觉和一时冲动的幻想是你的功课。",
    "1": "海王星金牛（物质与灵性的融合）：你这一代人正在重新定义物质与精神的关系——金钱、自然、身体都可以是灵性的载体。个人层面上，你对财务和感官享受可能有理想化的倾向。财运上直觉敏锐，但需警惕不切实际的投资幻想。",
    "2": "海王星双子（信息的灵性化）：你这一代人沟通和获取信息的方式被灵感和直觉渗透。思维不再仅仅是线性和逻辑的。个人层面上，你的表达具有诗意和感染力，但可能缺乏精确性。学会在灵感与逻辑之间找到平衡。",
    "3": "海王星巨蟹（情感的海洋）：家庭、根源和情感安全被赋予了近乎神秘的色彩。你这一代人对「家」的定义更加流动和具有灵性维度。个人层面上，你对情感安全的需求与对超越家庭束缚的渴望之间存在张力。",
    "4": "海王星狮子（创造力的神性）：自我表达与灵性融合。你这一代人将艺术创作视为灵性实践，将浪漫爱情视为超越自我边界的途径。个人层面上，你在感情中容易将对方理想化——爱人是你灵魂的镜子。创造力的迸发来自灵感的降临。",
    "5": "海王星处女（日常的神圣）：工作、服务和健康被赋予了灵性维度。你这一代人将重新定义「服务」的意义——不仅是完成任务，更是灵魂的奉献。个人层面上，你可能对完美的追求带有不切实际的色彩，需警惕因过度付出而耗竭。",
    "6": "海王星天秤（关系的幻象与理想）：你对伴侣关系和美的追求带有理想化的色彩。你这一代人正在重新定义爱与公平的含义。个人层面上，你容易在关系中将对方过度美化——当幻象褪去时可能感到失望。学会在理想与真实之间找到和谐。",
    "7": "海王星天蝎（深度的迷幻）：潜意识、性和转化的领域被海王星的神秘力量渗透。你这一代人具有极强的灵性穿透力。个人层面上，你的直觉极强但可能被幻觉干扰。财运上需警惕与他人资源的模糊纠缠。灵魂层面的转化是你的道路。",
    "8": "海王星射手（信仰的迷雾与光芒）：信仰、真理和远方的追求被灵性化。你这一代人将重塑宗教和哲学的面貌。个人层面上，你可能在寻找「终极真理」的过程中经历多次幻灭和重生。旅行不只是地理的，更是灵魂的朝圣。",
    "9": "海王星摩羯（体制的溶解）：社会结构和权威形象正在被灵性力量悄悄溶解。你这一代人重新定义了成功和成就的含义。个人层面上，你可能在世俗成功和精神追求之间感到拉扯——真正的成就也许不是爬到塔顶，而是让塔本身变得不再重要。",
    "10": "海王星水瓶（集体的梦想）：社群、科技和人道主义被赋予了灵性使命。你这一代人将科技视为连接集体意识的工具。个人层面上，你的理想主义与社会变革紧密相连。需警惕在宏大的愿景中忽视个人情感的现实需求。",
    "11": "海王星双鱼（回归源头）：这是海王星最强的位置——灵性、艺术和集体慈悲达到顶峰。你这一代人拥有最强的共情能力和灵性天赋。个人层面上，边界感是你此生最大的课题。你的敏感是一份礼物，但首先你要学会保护自己的能量场。"
  },
  "Pluto": {
    "0": "冥王星白羊（权力的新生）：你这一代将彻底重塑权力的定义——从控制转向赋权。个人层面上，你对自己的身份和意志力有近乎强迫的执着。你的人生中可能经历多次身份的彻底重组。行动力中蕴含着深沉的推动力。",
    "1": "冥王星金牛（资源的掌控）：价值观、资源和物质世界正在经历根本性的转化。你这一代人将重塑经济体系和人与自然的关系。个人层面上，你对财务的掌控欲需要被觉察。真正的财富不是占有，而是智慧和资源的流动。",
    "2": "冥王星双子（思想的重塑）：信息、沟通和思维模式正在被彻底改变。你具有极强的思维穿透力，能看穿表层的信息直达本质。你对知识的追求带有痴迷的色彩——一旦对某件事产生兴趣，你会深入到无人之境。",
    "3": "冥王星巨蟹（情感的深渊）：家庭、根源和情感安全正在经历深度的重组。你这一代人对「家」和「归属感」的定义将被彻底改变。个人层面上，你与母亲或家庭之间可能存在着深刻的——有时是挑战性的——灵魂连接。",
    "4": "冥王星狮子（创造力的涅槃）：自我表达、创造力和爱的本质正在经历彻底的转化。你这一代人将重新定义「被看见」的方式。个人层面上，你的创造力来自最深的情感深渊——每一次创作都是一次灵魂的再生。",
    "5": "冥王星处女（日常的深度）：工作、健康和服务的意义正在被彻底重新定义。你具有穿透日常表层看见本质的能力。在工作中有强迫性的完美主义倾向——这是天赋也是陷阱。你的身体是你灵魂转化的重要场域。",
    "6": "冥王星天秤（关系的炼金术）：婚姻、合作和社会契约正在经历根本性的重塑。你这一代人对关系中的权力平衡极为敏感。个人层面上，你的亲密关系是你最深转化的催化剂——每一次重要的关系都是一次灵魂的黑暗之旅与重生。",
    "7": "冥王星天蝎（极致的冥王星）：这是冥王星最强大的位置。你具有穿透一切表象的洞察力和惊人的再生能力。转化是你生命的核心主题——你不会在舒适区停留太久。对真相和深度的追求近乎偏执。你的存在本身就是对周围人的转化催化剂。",
    "8": "冥王星射手（信仰的涅槃）：信仰体系、教育和生命意义正在经历彻底的瓦解与重建。你可能经历多次精神上的「死亡与重生」——旧的信念被摧毁，新的理解从中升起。你这一代人将重塑教育和精神追求的方式。",
    "9": "冥王星摩羯（体制的瓦解与重建）：社会结构、政府和企业正在经历最根本的权力重组。你这一代人的使命是摧毁已经腐朽的旧体系，并在废墟上建立新的秩序。个人事业上，你可能经历一次或多次彻底的职业转型——这不是失败，而是灵魂的必经之路。",
    "10": "冥王星水瓶（未来的权力）：社群、科技和集体意识正在被彻底重塑。你这一代人是数字时代真正的权力玩家。个人层面上，你对集体变革有深刻的直觉。你的人道主义情怀带有一种不动摇的力量——你不是仅仅梦想更好的世界，你有意志力去实现它。",
    "11": "冥王星双鱼（灵魂的暗夜与黎明）：灵性、慈悲和集体潜意识的领域正在经历最深层的清洗和重生。你这一代人承担着消化集体业力的使命。个人层面上，你的敏感度极高，可能会有激烈的灵性体验或深度的创作冲动。保护能量边界是你的必修课。"
  }
};

// ── PLANET_SIGN_EN ────────────────────────────────────────────────────
const PLANET_SIGN_EN = {
  "Sun": {
    "0": "Sun in Aries gives you a pioneer's soul — brave, direct, and full of vitality. You don't like waiting and resist being bound by rules; you are a natural trailblazer. In career, you thrive in entrepreneurship or fields requiring quick decisions. In love, you are passionate and proactive, but need to learn to listen patiently to your partner. Your life lesson is turning impulse into lasting achievement.",
    "1": "Sun in Taurus endows you with earth-like steadiness and resilience. You value material security and sensory pleasure, with natural judgment for beauty and wealth. Earning money is a core way you build security, and your financial instincts are usually strong. In love, you are loyal and enduring but can be possessive. Beware of missing opportunities for change in pursuit of excessive stability.",
    "2": "Sun in Gemini gives you tireless curiosity and an agile mind. You excel at gathering information and connecting people — a born communicator. Career-wise, you thrive in media, education, sales, and other diverse fields. In love, you need intellectual chemistry and constant conversation; your partner must keep up with the speed of your mind. Your biggest lesson is learning focus and depth.",
    "3": "Sun in Cancer places emotion and security at the center of your life. Family, roots, and intimate relationships are your sources of strength. You have a natural gift for nurturing others and excel in caregiving professions. In love, you are gentle and devoted but guarded — you need your partner to prove their loyalty and reliability first. Financial decisions are often swayed by emotion; building a rational framework helps.",
    "4": "Sun in Leo gives you natural stage presence and creative flair. You crave to be seen and recognized, and deep down believe you are destined for something remarkable. You thrive in leadership roles and creative industries. In love, you are passionate and romantic, needing admiration and praise from your partner. Financially, you earn boldly and spend generously — learning to save and plan is essential. Your life lesson is balancing confidence with humility.",
    "5": "Sun in Virgo makes you pursue perfection and order. You possess precise analytical ability and a service-oriented spirit, meticulous in everything you do. Career-wise, you excel in fields requiring professional depth — technology, healthcare, research. In love, your expression is restrained and practical; you prove love through actions, not words. Financially prudent, but may miss opportunities through excessive caution. Learning to accept imperfection is your growth path.",
    "6": "Sun in Libra endows you with graceful social skills and fair judgment. You naturally pursue harmony and balance, excelling at cooperation and diplomacy. Career-wise, law, PR, design — any field requiring aesthetics and coordination — suits you well. Love is one of the most important themes in your life — you need relationships to see yourself clearly. Decision-making can be a struggle; overcoming indecision is key.",
    "7": "Sun in Scorpio gives you X-ray insight and astonishing willpower. You're not satisfied with surface answers and are always probing for truth and depth. Career-wise, research, psychology, finance — fields requiring penetration — fit you well. In love, you invest completely; you love and hate intensely, and betrayal is the hardest thing to forgive. Financially gifted with investment vision, but avoid betting everything on one obsession.",
    "8": "Sun in Sagittarius gives you a soul forever on the road. You love freedom, adventure, and philosophical exploration — the meaning of life lies in constantly expanding your horizons. Career-wise, education, publishing, international affairs suit you. In love, you resist being tied down and need a partner who will explore the world with you. Financially optimistic — sometimes too optimistic; building risk awareness is important.",
    "9": "Sun in Capricorn makes you an old soul from a young age, shouldering responsibility early. You are goal-oriented, determined, with patience and endurance far beyond your peers. Career-wise, you have strong ambition and execution ability, suited for management and leadership. In love, you are restrained and responsible, expressing love through achievement rather than words. Financially skilled at long-term planning, but learn to enjoy the journey, not just the result.",
    "10": "Sun in Aquarius gives you independent, forward-thinking ideas and humanitarian spirit. You are naturally different and don't play by the rules. Career-wise, technology, community, innovation fields suit you. In love, you need spiritual resonance and ample personal space — traditional relationship models may not fit you. Financially, income often comes from unique sources but can be unstable. Finding balance between independence and collaboration is your life lesson.",
    "11": "Sun in Pisces gives you boundless compassion and rich imagination. Your soul is soft and profound, naturally versed in art and spirituality. Career-wise, art, healing, charity — work requiring empathy — suits you. In love, you are romantic and dreamy, easily losing self-boundaries in relationships. Financially, your intuition is sharp, but you need practical money management habits. Your practice in this life is building containers for your dreams in the material world."
  },
  "Moon": {
    "0": "Moon in Aries makes your emotional expression direct and passionate. A warrior lives inside you, needing constant new stimulation to keep emotional vitality alive. In intimate relationships, you react quickly but lack patience — easily erupting over small things and forgetting just as fast. Your emotional security comes from 'action' — when unsettled, you instinctively want to do something.",
    "1": "Moon in Taurus gives you the most stable emotional foundation. You need material security and sensory comfort to soothe your heart — good food, beautiful things, a stable living environment are the cornerstones of your emotional health. In relationships, your loyalty is extremely high, but once hurt, recovery is slow. Financial security directly affects your emotional state — your bank balance is the barometer of your inner peace.",
    "2": "Moon in Gemini makes your emotional needs changeable and centered on intellectual stimulation. You need constant information exchange and fresh experiences for emotional satisfaction. Forever young at heart, witty and articulate, but may struggle to settle emotionally due to an overactive mind. Your partner must be able to spar with you intellectually, or you'll grow bored.",
    "3": "Moon in Cancer is the Moon's most natural position — rich in emotion, strong in intuition, deeply valuing family and intimate relationships. Your emotions ebb and flow like tides, and you easily absorb the feelings of those around you. In love, you are a natural caregiver, but also need to be tenderly cared for. Emotional security is the foundation of your life — when it's shaken, everything is affected.",
    "4": "Moon in Leo makes your heart crave praise and admiration. Your emotional expression is dramatic and passionate; you need absolute loyalty and sustained attention from your partner. Self-esteem is the core of your emotional health — when you feel overlooked or undervalued, you become highly sensitive. Creative self-expression and shining on stage are vital sources of emotional nourishment.",
    "5": "Moon in Virgo makes your emotional expression restrained and cautious. You express love through service and care for others, pursuing perfection inwardly but prone to worry and anxiety. In love, you hold both yourself and your partner to high standards, which can create tension. Building healthy daily routines and order is your emotional stabilizer.",
    "6": "Moon in Libra endows you with a deep longing for harmonious relationships. You fear conflict and loneliness, needing a partner's companionship for emotional fulfillment. Beneath an elegant, gentle exterior, you are acutely sensitive to imbalance in relationships. Aesthetics and beautiful things are important for emotional regulation. Learning to balance pleasing others with caring for yourself is a key lesson.",
    "7": "Moon in Scorpio makes your emotional world as deep and intense as the ocean. You love and hate distinctly, hiding enormous emotional energy and intuition within. You need absolute trust and soul-level fusion — superficial relationships cannot satisfy you. You have remarkable emotional regenerative ability — every emotional crisis is an opportunity for transformation.",
    "8": "Moon in Sagittarius makes your emotional expression optimistic and cheerful. Your heart is full of longing for distant places and the search for life's meaning, disliking being trapped by trivial routines. You need a partner who will grow and explore with you — anyone who limits your freedom makes you instinctively flee. Travel, learning, and philosophy are how you recharge emotionally.",
    "9": "Moon in Capricorn makes your emotional expression restrained and reserved. You value responsibility and commitment, expressing love through actions rather than words. Strong inside but not one to show it easily — your emotional management ability is an advantage in the workplace. But in intimate relationships, you need to learn to allow yourself to be vulnerable — not everything needs to be carried alone.",
    "10": "Moon in Aquarius gives you an independent, rational emotional pattern. You need spiritual resonance and ample personal space — traditional emotional dependency models may feel suffocating. You care about humanity more than individuals; idealism and community consciousness are important parts of your emotional world. Emotional distance is your way of protecting yourself, but it can also become a source of loneliness.",
    "11": "Moon in Pisces gives you boundless empathy and a rich inner world. Your emotional sensitivity is extremely high — you can sense what others haven't said out loud. Art and spirituality are vital sources of emotional nourishment. In love, you easily lose self-boundaries, taking on your partner's issues as your own. What you need to build is not thicker walls, but clearer boundaries."
  },
  "Mercury": {
    "0": "Mercury in Aries makes your thinking and expression direct and rapid. You don't beat around the bush — you say what you think. Quick to learn but lacking patience, suited for pioneering thinking and fast-paced information processing. In negotiation or debate, you can be a sharp opponent, but watch out for hurting relationships by speaking too bluntly.",
    "1": "Mercury in Taurus makes your thinking steady and pragmatic. You don't learn fast, but once you understand something, it's deeply rooted. Your expression is gentle yet persuasive, valuing practical experience over abstract theory. You have a natural gift for financial decisions and long-term planning. Your communication style is conservative — you dislike meaningless small talk.",
    "2": "Mercury in Gemini is Mercury's most active position — quick-witted, eloquent, processing information at lightning speed. You are naturally suited for writing, teaching, media, sales — any work requiring communication skills. Curiosity drives you to constantly learn new things, but you may skim the surface. Your mind needs to find balance between breadth and depth.",
    "3": "Mercury in Cancer makes your thinking deeply influenced by emotion and memory. Your memory is extremely strong, especially for information tied to emotional experiences. Intuitive thinking lets you pick up on messages beyond words. Your communication style is warm and empathetic, suited for fields requiring emotional intelligence. But be careful not to let emotions completely dominate your judgment.",
    "4": "Mercury in Leo gives you a creative and dramatic way of expressing yourself. You excel at big-picture thinking and storytelling, with a gift for packaging complex ideas in compelling ways. Suited for leadership communication, creative planning, public speaking. You may have little patience for details — cultivate team members who can help ground your ideas.",
    "5": "Mercury in Virgo is one of Mercury's strongest positions — outstanding analytical ability, rigorous and meticulous thinking. You excel at categorizing, organizing, and optimizing information — a natural editor, analyst, or technical expert. You pursue precision and efficiency in work. But excessive perfectionism may trap you in analysis paralysis, unable to make a final decision.",
    "6": "Mercury in Libra makes you skilled at seeing issues from multiple angles. Your expression is elegant and tactful — a natural diplomat and negotiator. You pursue harmony and fairness in thinking, able to stand in a neutral position and mediate between parties. Suited for law, PR, consulting. Decision-making may involve hesitation — you need to trust your own judgment.",
    "7": "Mercury in Scorpio gives you the ability to see through surfaces. You're not satisfied with shallow information and excel at digging up truth and hidden motives. Suited for research, investigation, psychological analysis — work requiring depth. Your expression is brief but powerful; you don't say much, but every word lands. Keeping secrets is your gift, but be careful not to become paranoid and suspicious of everything.",
    "8": "Mercury in Sagittarius makes your thinking broad and optimistic. You love exploring philosophy, religion, culture — macro topics. The thirst for knowledge drives you to constantly journey — whether physically or mentally. Your learning style is leap-based; you grasp the big picture well but are impatient with details. Suited for education, publishing, international affairs.",
    "9": "Mercury in Capricorn makes your thinking rigorous and pragmatic, with strong logic and structure. Your learning style is step-by-step, suited for fields requiring long-term accumulation and systematic planning. Your expression is concise and efficient — no wasted words. Natural advantages in business, management, engineering — fields needing precise thinking and long-term planning.",
    "10": "Mercury in Aquarius makes your thinking unique and avant-garde. You don't follow conventional patterns and often have unexpected insights and innovative ideas. Suited for technology, invention, social innovation — fields requiring forward-thinking. You care about human progress and social issues, skilled at spotting future trends. Your communication style can be somewhat detached — in intimate communication, pay attention to emotional warmth.",
    "11": "Mercury in Pisces gives you poetic and intuitive thinking. Your mind doesn't operate in linear logic but through images, feelings, and associations. Suited for artistic creation, music, spiritual healing. Your expressive ability may not be as clear as other placements, but the emotion and atmosphere you convey are unmatched. Everyday logical expression needs deliberate practice."
  },
  "Venus": {
    "0": "Venus in Aries makes you proactive and passionate in love. You enjoy the thrill of pursuit and conquest — passive waiting is not your style. Your aesthetic is bold and direct, liking vivid colors and styles. In love, you need novelty and challenge, but watch out for impulsiveness and a tendency to lose interest quickly. Financially decisive but needs better planning.",
    "1": "Venus in Taurus is Venus's most comfortable position — you are loyal and stable in love, valuing sensory pleasure and material foundation. You like natural, comfortable aesthetics, with natural judgment for quality. Slow to warm up in love but enduring — once your heart is given, it's unwavering. Financially, you have an instinct for accumulating wealth, with good intuition for investment and value preservation.",
    "2": "Venus in Gemini makes you pursue intellectual exchange and variety in love. Your charm comes from witty conversation and never-ending curiosity. Easily attracted to intelligent, interesting people, with diverse and ever-changing aesthetics. In love, you need continuous fresh stimulation, but this may make long-term commitment difficult. Suited for work centered on communication and social interaction.",
    "3": "Venus in Cancer makes you deeply value emotional security in love. You are gentle and caring, naturally knowing how to make your partner feel cherished and looked after. You like creating a warm home atmosphere, nostalgic with maternal radiance. In love, you tend to build protective shells for fear of getting hurt, needing your partner to prove loyalty first. Financially inclined toward saving and conservative investment.",
    "4": "Venus in Leo makes you passionate, romantic, and radiant in love. You like being pursued and admired, and the love you give is equally generous and dramatic. Your aesthetic is glamorous — you like styles that help you stand out in a crowd. You need sustained attention and recognition from your partner. Financially ambitious and charismatic for earning big, but also quite generous in spending.",
    "5": "Venus in Virgo makes you restrained and rational in love. You express love through practical actions rather than flowery words — doing things, solving problems, providing practical help for your loved one. Your aesthetic is minimalist and refined, valuing detail and quality over quantity. In love, you have high standards for your partner, sometimes too critical. Financially meticulous, skilled at finding great value.",
    "6": "Venus in Libra is Venus's strongest position — you are naturally versed in the art of love and beauty. You pursue harmonious, balanced relationships and are skilled at maintaining equilibrium in love. Your aesthetic is elegant and classic, with outstanding taste. You fear being alone and tend to over-compromise in relationships to maintain harmony. Financially, you may spend more pursuing quality of life, but your social resources often bring returns.",
    "7": "Venus in Scorpio makes you invest completely in love, craving soul-deep connection. Possessive yet loyal — once you fall in love, it's unforgettable. Your aesthetic is mysterious and sensual, drawn to people and things with depth and stories. In love, you don't easily forgive betrayal. Financially gifted at investing, able to spot undervalued opportunities, but avoid losses from obsession.",
    "8": "Venus in Sagittarius makes you optimistic, open, and freedom-loving in love. You enjoy cross-cultural romance and are easily attracted to people from different backgrounds. Your aesthetic is free-spirited, loving exotic cultures and adventure. In love, you dislike being confined and need a partner who accepts your independence. Financially, good luck often comes but planning is lacking — find balance between optimism and pragmatism.",
    "9": "Venus in Capricorn makes you cautious and serious in love. You don't fall easily, but once committed, you take the relationship seriously and accept responsibility. Your aesthetic is classic and understated, valuing quality and lasting value over trends. In love, you may appear somewhat cool and practical, but you express love through loyalty and concrete actions. Financially, you have strong long-term accumulation and investment planning ability.",
    "10": "Venus in Aquarius makes you independent and free in love, not bound by convention. You don't need traditional relationship models — spiritual resonance and personal space matter more than romantic rituals. Your aesthetic is avant-garde and unique, drawn to experimental and unconventional styles. What attracts people to you is precisely your uniqueness. Financially, income may come from community, internet, or innovative fields.",
    "11": "Venus in Pisces is Venus's highest expression — you are romantic, dreamy, and have unconditional compassion in love. Love for you is the merging of souls, not the exchange of material things. Your aesthetic is rich with artistic and spiritual qualities. Easily drawn to those in need of help; in love, be mindful of self-protection. Financially intuitive, but need to build practical money management habits."
  },
  "Mars": {
    "0": "Mars in Aries is Mars's strongest position — explosive drive, extremely competitive. You react quickly to challenges and are a natural pioneer and leader. Your action style is direct and bold, but endurance is limited; you may lose patience with long-term projects. Natural advantages in career, sports, and fields requiring quick decisions. Passionate and proactive in love, needing outlets to release energy.",
    "1": "Mars in Taurus makes your action steady and persistent. Slow to start, but once begun, unwavering. Your endurance is remarkable, suited for fields requiring long-term persistence to see results. The pursuit of material and sensory experiences drives your actions. In love, your desires are deep and sustained, but you may appear overly stubborn or possessive.",
    "2": "Mars in Gemini makes your action style flexible and changeable. You excel at multitasking, with scattered but efficient energy. Communication, writing, travel, and intellectual challenges are your main channels for releasing energy. You shine in situations requiring quick reaction and adaptability. In love, you need intellectual stimulation and continuous conversation to maintain passion.",
    "3": "Mars in Cancer makes your actions driven by emotion and protective instincts. You are most courageous when fighting for family and loved ones. Your drive is intermittent — capable of anything when emotionally high, needing a safe harbor when low. You have strong guardian instincts, but in the workplace, emotions sometimes affect consistency of action.",
    "4": "Mars in Leo gives you a dramatic action style and leadership charisma. You need recognition and appreciation to stay motivated, naturally gravitating toward leadership positions in teams. Your actions have a performative quality — you perform best when in the spotlight. In love, passionate and generous, but be careful not to replace care with domination.",
    "5": "Mars in Virgo makes your actions precise and efficient. You excel at making detailed plans and executing them rigorously — perfectionism is your driving force. You shine in work requiring precision, craftsmanship, and analytical ability. In love, you express love through acts of service — solving problems for your loved one is your romance. Beware of excessive self-criticism undermining your drive.",
    "6": "Mars in Libra makes you value fairness and collaboration in action. You don't like charging ahead alone and are better at mobilizing team strength. Your decision-making involves weighing all sides, making you a fair leader but sometimes slow to act due to over-deliberation. In love and partnerships, you need a partner to perform at your best.",
    "7": "Mars in Scorpio gives you extreme willpower and lasting combat strength. Silent but stunning — you don't need to constantly display your power, but your explosive force in critical moments is astonishing. Strategic thinking makes you suited for fields requiring depth and resilience. In love, your sexual magnetism is strong and desires run deep. Your reaction to betrayal is devastating.",
    "8": "Mars in Sagittarius fills your actions with enthusiasm and adventurous spirit. You love sports, travel, and outdoor challenges — an optimistic, positive attitude is your greatest driver. Your actions aim to constantly expand horizons and gain new experiences. You perform best in causes requiring passion and belief. In love, you pursue freedom and shared adventure, disliking being bound by daily trivialities.",
    "9": "Mars in Capricorn makes your actions planned, disciplined, and goal-oriented. Your execution is extremely strong — once the direction is set, you push forward unwaveringly. Achievement orientation drives every step. In the workplace, you are a reliable force, but may appear too serious. In love, you express love through practical actions — better at providing substantial support than romantic words.",
    "10": "Mars in Aquarius gives you a uniquely free-spirited action style. You act at your own pace and in your own way, unbound by tradition and authority. Your drive focuses on reform, innovation, and collective causes. You perform best in fields requiring breakthrough from convention. In love, you need ample freedom and space — traditional relationship rules are not mandatory for you.",
    "11": "Mars in Pisces makes your actions driven by intuition and inspiration. Apparently soft but truly resilient — your action style is water-like in adaptability. Artistic creation, spiritual practice, and helping others are your main channels for releasing energy. Unique advantages in fields requiring empathy and imagination. You may not be the most execution-oriented placement, but your actions carry profound emotional resonance."
  },
  "Jupiter": {
    "0": "Jupiter in Aries helps you grow through courage, adventure, and competition. Your good fortune comes from daring to decide quickly and being at the forefront. Career-wise, pioneering roles suit you; romance is likely to bloom in competitive or sports settings. Financial opportunities tend to arrive when you take the initiative — waiting is not your lucky strategy.",
    "1": "Jupiter in Taurus helps you grow through accumulation, patience, and practical judgment. Wealth luck is the most prominent gift of this placement — you don't chase quick money, but steady long-term financial growth is your hallmark. In love, luck comes from stability and sincere devotion. Your blessings often manifest in slow, certain processes.",
    "2": "Jupiter in Gemini helps you gain opportunities through information, learning, and networks. Your eloquence and sensitivity to information are the greatest wealth catalysts. Career-wise, diversified development suits you; romance comes through social occasions and intellectual exchange. Financial opportunities often appear when you least expect them, through friends or new information.",
    "3": "Jupiter in Cancer helps you grow through emotional connection and family nourishment. Luck comes from intuition and sensitivity to others' needs — the warmth you give always flows back in some form. Family and property often bring blessings. In love, good fortune comes from your willingness to care for both your own and others' emotional needs.",
    "4": "Jupiter in Leo helps you expand through creative self-expression and leadership. Your confidence and stage presence are the greatest wealth catalysts. Career-wise, opportunities to be seen and recognized far exceed the average. Romance luck is abundant — you carry a halo wherever you go. Financial opportunities come from your personal brand and influence.",
    "5": "Jupiter in Virgo helps you grow through service, meticulous work, and continuously improving professional skills. Your luck lies in doing things right, in detail, and to the utmost. Professional reputation is the most reliable source of wealth. In love, good fortune comes from sincere devotion and a humble attitude — you receive the most when you least demand it.",
    "6": "Jupiter in Libra helps you gain opportunities through cooperation, diplomacy, and interpersonal balance. Good partners and collaborators are your greatest source of luck. Career-wise, fields requiring negotiation and aesthetics suit you. Romance is strongest in social and artistic settings. Financial opportunities often arrive through partnerships and networks.",
    "7": "Jupiter in Scorpio helps you grow through deep transformation, resource integration, and strategic investment. Your investment vision and resource management ability are the greatest wealth gifts. Career success comes from deep expertise and strategic thinking. In love, luck comes from your willingness to face your shadow and undergo profound self-transformation.",
    "8": "Jupiter in Sagittarius is Jupiter's strongest position — unlimited expansion through travel, higher education, philosophical exploration, and cross-cultural experience. Your open mindset and passion for life are the greatest wealth. Career-wise, international and educational fields suit you. Romance is strongest during travel and study. Financial opportunities often carry an international or cross-cultural flavor.",
    "9": "Jupiter in Capricorn helps you grow through effort, discipline, and long-term planning. Though Jupiter is less comfortable here, your luck lies in persistent dedication — you're still going when others have given up. Social status in your career is the greatest source of wealth. Financial security comes from long-term planning and stable career advancement.",
    "10": "Jupiter in Aquarius helps you expand through innovation, community engagement, and forward-looking vision. Your unique thinking and humanitarian spirit are the greatest wealth catalysts. Career-wise, technology, community, and innovation fields suit you. Romance quietly blossoms in community and shared causes. Financial opportunities come from unconventional channels and like-minded groups.",
    "11": "Jupiter in Pisces helps you grow through spirituality, art, and compassion. Your intuition and imagination are the greatest sources of wealth. Career-wise, art, healing, and charity suit you. In love, good fortune comes from your unconditional love and empathy. Financially, you need to find balance between idealism and practical management."
  },
  "Saturn": {
    "0": "Saturn in Aries: Your core life lesson is learning patience and strategic action. You are asked to transform Aries impulsiveness into sustained effort and orderly progress. In career, only through discipline can leadership potential become actual achievement. In love, learn to find balance between self-assertion and compromise.",
    "1": "Saturn in Taurus: Your core life lesson is building healthy values and self-worth. Excessive attachment to material security needs examination. Career-wise, steady gradual ascent suits you — high-risk operations are not your path. Finances are a key area of growth for you — not about earning ability, but your psychological relationship with money.",
    "2": "Saturn in Gemini: Your core life lesson is learning focus and depth of thought. Information fragmentation and superficial dabbling are patterns you easily fall into. Career-wise, you need to choose one field and go deep rather than constantly switching directions. Communication is both your gift and your lesson — learning when silence is equally important.",
    "3": "Saturn in Cancer: Your core life lesson is establishing emotional boundaries and a foundation of inner security. You tend to take on emotional responsibilities beyond your capacity. In career, emotional intelligence is your advantage, but guard against being submerged by others' needs. Learning to balance caring for others with protecting yourself is your most important life lesson.",
    "4": "Saturn in Leo: Your core life lesson is transforming self-expression into genuine creation and service. You are asked to move from 'being seen' to 'illuminating others.' Leadership in career needs to be earned through humility and sustained effort. In love, learn that love is not demanding attention but offering sincere recognition.",
    "5": "Saturn in Virgo: Your core life lesson is accepting imperfection and practicing self-compassion. Excessive criticism and perfectionism are your heaviest burdens. In career, your professional ability is extremely strong, but anxiety may hinder your performance. In love, learn that the essence of relationships is growth, not perfection. When you stop harshly judging yourself, the world becomes gentler too.",
    "6": "Saturn in Libra: Your core life lesson is learning to establish healthy boundaries and independent decision-making. Over-dependence on others' approval and conflict avoidance are patterns to overcome. In career, your coordination ability is an advantage, but you need to stand firm at critical moments. In love, true intimacy is not merging, but the choice of two whole, independent people.",
    "7": "Saturn in Scorpio: Your core life lesson is learning trust and letting go of control. Fear of betrayal may cause you to build high walls in relationships. In career, your depth and strategic thinking are advantages, but obsession with power is a trap. When you learn to let go at the right moment, true transformation begins.",
    "8": "Saturn in Sagittarius: Your core life lesson is turning optimism into discipline and belief into action. Excessive optimism andescaping reality are tendencies to watch. Career-wise, education and international fields suit you, but you need to build sustainable action frameworks. True freedom is not doing whatever you want, but finding meaning within constraints.",
    "9": "Saturn in Capricorn: Saturn in domicile — responsibility, achievement, and discipline are your most important life lesson and greatest source of strength. You naturally understand delayed gratification and long-term planning. Your career achievement drive is extremely strong, but you may become a workaholic. Learning to find balance between striving and enjoying is a lifelong lesson for Saturn in Capricorn.",
    "10": "Saturn in Aquarius: Your core life lesson is finding balance between independence and collaboration. Emotional detachment and over-rationalization are patterns to break through. In career, your innovative thinking is an advantage, but you need to learn to collaborate with others. True independence doesn't mean rejecting connection — it means staying true to yourself within connection.",
    "11": "Saturn in Pisces: Your core life lesson is establishing boundaries and facing reality. The tendency toescaping pain is a pattern to be aware of. In career, artistic and spiritual gifts are advantages, but you need to build practical action frameworks to hold your dreams. When you learn to stay firm within softness, your compassion becomes true strength rather than burden."
  },
  "Uranus": {
    "0": "Uranus in Aries (Generation Pioneer): You have a powerful impulse to break traditions and act independently. Your need for personal freedom surpasses everything. In career, you are a natural entrepreneur and reformer. In love, you need a relationship model unbound by rules — traditional marriage frameworks may feel suffocating.",
    "1": "Uranus in Taurus (Generation Reformer): You hold revolutionary views on the material world and values. You may experience dramatic financial ups and downs or entirely different ways of earning. Your generation will reshape financial systems and humanity's relationship with nature. On a personal level, your pursuit of beauty is also unconventional.",
    "2": "Uranus in Gemini (New Generation Communicator): Information processing and dissemination methods will berevolutionized. You possess highly original thinking patterns, with natural sensitivity to new technology and media. Your social circles are diverse and rapidly changing. Your learning style breaks conventions — you may be a deep enthusiast in multiple fields simultaneously.",
    "3": "Uranus in Cancer (Emotional Revolutionary): Your definitions of family, security, and emotional expression are vastly different from the previous generation. Unconventional family structures, long-distance family relationships, emotional technology applications — all are changes your generation brings. On a personal level, your emotional expression is unique and unpredictable.",
    "4": "Uranus in Leo (Creativity Liberator): The forms of self-expression and creativity are beingrevolutionized. You are not satisfied with traditional stages and recognition methods. Your generation brings entirely new art forms and concepts of leadership. Your way of presenting yourself in love is also unconventional — your personal magnetism is distinctly different.",
    "5": "Uranus in Virgo (Work Revolutionary): Work methods, health concepts, and daily order are beingrevolutionized. Your generation drove the development of remote work and digital health. On a personal level, your workflow and health habits may be entirely different from the mainstream. The definition of perfection is also changing.",
    "6": "Uranus in Libra (Relationship Revolutionary): The definitions of marriage, cooperation, and social contracts are being fundamentally rewritten. Your generation is creating entirely new relationship models and social contracts. On a personal level, you need ample freedom and flexibility in partnerships and companion relationships.",
    "7": "Uranus in Scorpio (Transformation Accelerator): The realms of deep transformation, power structures, and sexuality are undergoing revolution. You have extremely strong intuition and an impulse to break taboos. Financial system reform and resource redistribution are core themes of your generation. On a personal level, your transformative experiences are often sudden and intense.",
    "8": "Uranus in Sagittarius (Belief Revolutionary): The forms of education, religion, and travel are beingrevolutionized. Your generation brings entirely new philosophical systems and cross-cultural understanding. On a personal level, your belief system may experience multiple sudden turns — each turn is an awakening.",
    "9": "Uranus in Capricorn (Authority Reshaper): Social structures, governments, and corporations are being fundamentally changed. Your generation will challenge and rebuild the forms of authority. Your career path may be full of sudden turns — being laid off then starting a business, or introducingdisruptive models into traditional industries.",
    "10": "Uranus in Aquarius (Ultimate Uranus): This is one of Uranus's most powerful positions. You have an extremely strong independent spirit and forward-thinking mind, with profound intuition about the collective future. Technological innovation and social change are core themes of your life. Your relationship patterns are highly individualized and unconventional.",
    "11": "Uranus in Pisces (Spiritual Revolutionary): The realms of spirituality, art, and the collective unconscious are undergoing the deepest cleansing and rebirth. Your generation brings entirely new healing methods and spiritual practices. On a personal level, your intuition and spiritual experiences may suddenly open, connecting with the world on a soul level in unusual ways."
  },
  "Neptune": {
    "0": "Neptune in Aries (Dream Pioneer): Your generation injects spirituality and idealism into action and pioneering spirit. On a personal level, your pursuit of dreams carries unusual courage, but be vigilant about impulsively investing inillusory goals. Learning to distinguish between intuition and momentaryimpulsive fantasy is your lesson.",
    "1": "Neptune in Taurus (Material-Spiritual Fusion): Your generation is redefining the relationship between material and spirit — money, nature, the body can all be vessels of spirituality. On a personal level, you may idealize finances and sensory pleasures. Financially intuitive but need to guard against unrealistic investment fantasies.",
    "2": "Neptune in Gemini (Spiritualized Information): Your generation's way of communicating and acquiring information is permeated by inspiration and intuition. Thinking is no longer merely linear and logical. On a personal level, your expression has poetic appeal but may lack precision. Learn to balance inspiration with logic.",
    "3": "Neptune in Cancer (Ocean of Emotion): Family, roots, and emotional security are imbued with near-mystical coloring. Your generation's definition of 'home' is more fluid and carries a spiritual dimension. On a personal level, there is tension between your need for emotional security and the longing to transcend family constraints.",
    "4": "Neptune in Leo (Divine Creativity): Self-expression merges with spirituality. Your generation views artistic creation as spiritual practice and romantic love as a path beyond self-boundaries. On a personal level, you tend to idealize your partner in love — the beloved is the mirror of your soul. Creative bursts come from the descent of inspiration.",
    "5": "Neptune in Virgo (Sacred Everyday): Work, service, and health are imbued with spiritual dimension. Your generation will redefine the meaning of 'service' — not just completing tasks, but soul devotion. On a personal level, your pursuit of perfection may carry unrealistic coloring; guard against burnout from excessive giving.",
    "6": "Neptune in Libra (Illusion and Ideal of Relationship): Your pursuit of partnership and beauty carries an idealizing quality. Your generation is redefining the meaning of love and fairness. On a personal level, you tend to over-glamorize your partner in relationships — when the illusion fades, disappointment may follow. Learn to find harmony between ideal and reality.",
    "7": "Neptune in Scorpio (Depth Psychedelia): The realms of the subconscious, sexuality, and transformation are permeated by Neptune's mysterious force. Your generation possesses extremely strong spiritual penetration. On a personal level, your intuition is powerful but may be disturbed by illusions. Financially, be vigilant about unclear entanglements with others' resources. Soul-level transformation is your path.",
    "8": "Neptune in Sagittarius (Mist and Light of Faith): The pursuit of faith, truth, and distant horizons is spiritualized. Your generation will reshape the face of religion and philosophy. On a personal level, you may experience multiple disillusionments and rebirths in the search for 'ultimate truth.' Travel is not just geographical but a pilgrimage of the soul.",
    "9": "Neptune in Capricorn (Dissolution of Institutions): Social structures and authority figures are being quietly dissolved by spiritual forces. Your generation redefines the meaning of success and achievement. On a personal level, you may feel torn between worldly success and spiritual pursuit — perhaps true achievement is not climbing to the top of the tower, but making the tower itself less important.",
    "10": "Neptune in Aquarius (Collective Dream): Community, technology, and humanitarianism are imbued with spiritual mission. Your generation sees technology as a tool for connecting collective consciousness. On a personal level, your idealism is closely tied to social change. Be vigilant about neglecting personal emotional needs in grand visions.",
    "11": "Neptune in Pisces (Return to Source): This is Neptune's strongest position — spirituality, art, and collective compassion reach their peak. Your generation possesses the strongest empathy and spiritual gifts. On a personal level, boundaries are your greatest life lesson. Your sensitivity is a gift, but first you must learn to protect your energy field."
  },
  "Pluto": {
    "0": "Pluto in Aries (Rebirth of Power): Your generation willcompletely reshape the definition of power — from control to empowerment. On a personal level, you have anearly obsessive attachment to your identity and willpower. You may experience multiple complete reorganizations of identity in your life. Your drive carries deep,driving force.",
    "1": "Pluto in Taurus (Mastery of Resources): Values, resources, and the material world are undergoing fundamental transformation. Your generation will reshape economic systems and humanity's relationship with nature. On a personal level, your desire to control finances needs to be examined. True wealth is not possession, but the flow of wisdom and resources.",
    "2": "Pluto in Gemini (Reshaping Thought): Information, communication, and thinking patterns are beingcompletely changed. You have extremely strong mental penetration, able to see through surface information to the essence. Your pursuit of knowledge carries an obsessive quality — once interested in something, you go deeper than anyone.",
    "3": "Pluto in Cancer (Abyss of Emotion): Family, roots, and emotional security are undergoing deep reorganization. Your generation's definition of 'home' and 'belonging' will becompletely changed. On a personal level, you may have a profound — sometimes challenging — soul connection with your mother or family.",
    "4": "Pluto in Leo (Nirvana of Creativity): Self-expression, creativity, and the nature of love are undergoing thorough transformation. Your generation will redefine how to 'be seen.' On a personal level, your creativity comes from the deepest emotional abyss — every act of creation is a soul rebirth.",
    "5": "Pluto in Virgo (Depth of the Everyday): The meaning of work, health, and service is beingcompletely redefined. You have the ability to see through daily surfaces to the essence. At work, there is a compulsive perfectionist tendency — this is both a gift and a trap. Your body is an important field for soul transformation.",
    "6": "Pluto in Libra (Alchemy of Relationship): Marriage, cooperation, and social contracts are undergoing fundamental reshaping. Your generation is extremely sensitive to power balance in relationships. On a personal level, your intimate relationships are the catalyst for your deepest transformation — every significant relationship is a dark journey and rebirth of the soul.",
    "7": "Pluto in Scorpio (Ultimate Pluto): This is Pluto's most powerful position. You possess the insight to see through all surfaces and astonishing regenerative ability. Transformation is the core theme of your life — you won't stay in the comfort zone for long. Your pursuit of truth and depth isnearly obsessive. Your very presence is a catalyst for transformation in those around you.",
    "8": "Pluto in Sagittarius (Nirvana of Faith): Belief systems, education, and life's meaning are undergoing thorough dissolution and reconstruction. You may experience multiple spiritual 'deaths and rebirths' — old beliefs destroyed, new understanding rising from the ashes. Your generation will reshape the way education and spiritual pursuit are approached.",
    "9": "Pluto in Capricorn (Dissolution and Reconstruction of Institutions): Social structures, governments, and corporations are undergoing the most fundamental power reorganization. Your generation's mission is to destroy decayed old systems and build new order on the ruins. In personal career, you may experience one or more thorough professional transformations — this is not failure, but the soul's necessary path.",
    "10": "Pluto in Aquarius (Power of the Future): Community, technology, and collective consciousness are beingcompletely reshaped. Your generation is the true power player of the digital age. On a personal level, you have profound intuition about collective change. Your humanitarian spirit carries an unshakable force — you don't just dream of a better world, you have the willpower to realize it.",
    "11": "Pluto in Pisces (Dark Night and Dawn of the Soul): Spirituality, compassion, and the collective unconscious are undergoing the deepest cleansing and rebirth. Your generation carries the mission of digesting collective karma. On a personal level, your sensitivity is extremely high; you may have intense spiritual experiences or deep creative urges. Protecting your energy boundaries is your required lesson."
  }
};

// ── HOUSE_MEANINGS_EN ─────────────────────────────────────────────────
const HOUSE_MEANINGS_EN = {
  "1": "The 1st House represents self-image, persona, and the first impression you leave on others. Planets here strongly influence your outward temperament and life path.",
  "2": "The 2nd House represents wealth, values, and self-worth. Planets here influence how you earn money and accumulate material resources.",
  "3": "The 3rd House represents communication, learning, siblings, and short trips. Planets here influence your thinking style and information processing.",
  "4": "The 4th House represents home, roots, father, and later life environment. Planets here reveal your family background and inner security.",
  "5": "The 5th House represents creativity, romance, children, and entertainment. Planets here influence your romantic expression and creative self-expression.",
  "6": "The 6th House represents work, health, service, and daily life. Planets here influence your work style and physical condition.",
  "7": "The 7th House represents marriage, partnerships, and open opponents. Planets here reveal your needs in partnership and relationship patterns.",
  "8": "The 8th House represents sex, death, transformation, and others' resources. Planets here influence how you handle deep life issues.",
  "9": "The 9th House represents higher education, philosophy, long-distance travel, and beliefs. Planets here influence your life philosophy and spiritual pursuits.",
  "10": "The 10th House represents career, social status, mother, and life goals. Planets here influence your career direction and social achievements.",
  "11": "The 11th House represents friends, community, hopes, and ideals. Planets here influence your social circles and long-term vision.",
  "12": "The 12th House represents the subconscious, spirituality, hidden matters, and self-dissolution. Planets here reveal your inner spiritual world and karmic lessons."
};

// ── HOUSE_LABELS_EN ───────────────────────────────────────────────────
const HOUSE_LABELS_EN = {
  "1": "Self-Image & Personal Expression",
  "2": "Wealth & Value Affirmation",
  "3": "Communication & Information",
  "4": "Family Roots & Inner Security",
  "5": "Creativity & Romantic Expression",
  "6": "Daily Work & Health Service",
  "7": "Partnership & Win-Win Cooperation",
  "8": "Deep Transformation & Resource Management",
  "9": "Philosophy & Far-Reaching Exploration",
  "10": "Career Achievement & Social Status",
  "11": "Social Circles & Long-Term Vision",
  "12": "Spiritual Practice & Subconscious"
};

// ── SIGN_MEANING_EN ───────────────────────────────────────────────────
const SIGN_MEANING_EN = {
  "0": "Aries is a Fire Cardinal sign, representing new beginnings, primal impulse, and competitive spirit. Its energy is direct and intense.",
  "1": "Taurus is an Earth Fixed sign, representing stability, sensory pleasure, and material accumulation. Its energy is steady and enduring.",
  "2": "Gemini is an Air Mutable sign, representing information, communication, and diversity. Its energy is light and flexible.",
  "3": "Cancer is a Water Cardinal sign, representing emotion, family, and nurturing. Its energy is gentle and profound.",
  "4": "Leo is a Fire Fixed sign, representing creativity, confidence, and expression. Its energy is passionate and radiant.",
  "5": "Virgo is an Earth Mutable sign, representing service, precision, and analysis. Its energy is precise and practical.",
  "6": "Libra is an Air Cardinal sign, representing harmony, beauty, and relationships. Its energy is elegant and balanced.",
  "7": "Scorpio is a Water Fixed sign, representing depth, transformation, and power. Its energy is intense and mysterious.",
  "8": "Sagittarius is a Fire Mutable sign, representing exploration, freedom, and truth. Its energy is optimistic and expansive.",
  "9": "Capricorn is an Earth Cardinal sign, representing achievement, responsibility, and discipline. Its energy is serious and resilient.",
  "10": "Aquarius is an Air Fixed sign, representing innovation, independence, and universal love. Its energy is avant-garde and rational.",
  "11": "Pisces is a Water Mutable sign, representing compassion, spirituality, and merging. Its energy is soft and boundless."
};

// ── SYNASTRY_ASPECTS_EN ───────────────────────────────────────────────
const SYNASTRY_ASPECTS_EN = {
  "Sun_Moon": {
    "good": "There is natural resonance between you on the emotional and will levels. The Sun person's self-expression nourishes the Moon person's emotional needs — a classic marriage aspect.",
    "hard": "Your emotional needs and self-expression styles are in conflict. You need to learn to respect each other's fundamental differences."
  },
  "Sun_Venus": {
    "good": "Strong attraction — you appreciate and enjoy each other. The Sun person is drawn to the Venus person's charm and beauty; the relationship is full of warmth and pleasure.",
    "hard": "Values and aesthetics sometimes clash, but the attraction remains."
  },
  "Sun_Mars": {
    "good": "A passionate and energetic combination. Strong drive to act — you can accomplish much together. Powerful sexual attraction.",
    "hard": "Prone to competition and power struggles — the clash of egos needs reconciliation."
  },
  "Moon_Venus": {
    "good": "The emotional relationship is highly harmonious — you naturally give each other the emotional nourishment needed. You enjoy being together and sharing good times.",
    "hard": "Different styles of emotional expression; one party needs to find balance between emotion and affection."
  },
  "Moon_Mars": {
    "good": "The emotional relationship is full of passion and vitality — you spark each other's emotional expression.",
    "hard": "Prone to emotional conflicts and arguments; emotional reactions are intense."
  },
  "Venus_Mars": {
    "good": "Extremely strong sexual attraction and romantic energy. The Venus person's soft beauty and Mars person's masculine energy form perfect magnetic polarity.",
    "hard": "Passion comes fast but may fade fast;friction easily arises in intimate relationships."
  },
  "Sun_Saturn": {
    "good": "The relationship is stable and lasting; both are responsible toward each other. The Saturn person gives the Sun person practical guidance and protection.",
    "hard": "The Saturn person may be too harsh or restrictive toward the Sun person, causing feelings of oppression."
  },
  "Jupiter_Venus": {
    "good": "You bring each other joy and expansive energy. Together you feel lucky and abundant — great companions for social activities and travel.",
    "hard": "May over-indulge or have excessively high expectations of the relationship."
  },
  "Saturn_Moon": {
    "good": "The Saturn person gives the Moon person stable emotional support. The relationship is serious and committed, with potential for long-term commitment.",
    "hard": "The Moon person may feel emotionally neglected or misunderstood, needing more warmth."
  }
};


// ── i18n Proxy for PLANET_SIGN ──────────────────────────────────────────
const PLANET_SIGN = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? PLANET_SIGN_EN : PLANET_SIGN_ZH;
    return src[prop];
  }
});



const HOUSE_MEANINGS_ZH = {
  1: "第1宫代表自我形象、人格面具和给他人留下的第一印象。此处的行星强烈影响你的外在气质和人生路径的起点。",
  2: "第2宫代表财富、价值观和自我价值感。此处的行星影响你的赚钱方式和物质资源的积累。",
  3: "第3宫代表沟通、学习、兄弟姐妹和短途旅行。此处的行星影响你的思维方式和信息处理能力。",
  4: "第4宫代表家庭、根源、父亲和晚年的生活环境。此处的行星揭示你的家庭背景和内在安全感。",
  5: "第5宫代表创造力、恋爱、子女和娱乐。此处的行星影响你的浪漫表达和创造性的自我展现。",
  6: "第6宫代表工作、健康、服务和日常生活。此处的行星影响你的工作方式和身体状况。",
  7: "第7宫代表婚姻、合作关系和公开的对手。此处的行星揭示你对伴侣的需求和关系模式。",
  8: "第8宫代表性、死亡、转变和他人的资源。此处的行星影响你对深层生命议题的处理方式。",
  9: "第9宫代表高等教育、哲学、长途旅行和信仰。此处的行星影响你的人生观和精神追求。",
  10: "第10宫代表事业、社会地位、母亲和人生目标。此处的行星影响你的职业方向和社会成就。",
  11: "第11宫代表朋友、社群、希望和理想。此处的行星影响你的社交圈和长远愿景。",
  12: "第12宫代表潜意识、灵性、隐秘的事物和自我消融。此处的行星揭示你的内在灵性世界和业力课题。"
};
// ── HOUSE_MEANINGS_EN ─────────────────────────────────────────────────


const HOUSE_LABELS_ZH = {
  1: '自我形象与个人表达',
  2: '财富积累与价值确认',
  3: '沟通学习与信息传播',
  4: '家庭根基与内在安全',
  5: '创造力与浪漫表达',
  6: '日常工作与健康服务',
  7: '伴侣关系与合作共赢',
  8: '深度转化与资源运作',
  9: '哲学探索与远行拓展',
  10: '事业成就与社会地位',
  11: '社交圈与长远愿景',
  12: '灵性修行与潜意识'
};
// ── HOUSE_LABELS_EN ───────────────────────────────────────────────────


const SIGN_MEANING_ZH = {
  0:"白羊座是火象开创星座，代表新的开始、原始冲动和竞争精神。能量直接而强烈。",
  1:"金牛座是土象固定星座，代表稳定、感官享受和物质积累。能量踏实而持久。",
  2:"双子座是风象变动星座，代表信息、交流和多样性。能量轻盈而灵活。",
  3:"巨蟹座是水象开创星座，代表情感、家庭和滋养。能量温柔而深邃。",
  4:"狮子座是火象固定星座，代表创造、自信和表现。能量热烈而辉煌。",
  5:"处女座是土象变动星座，代表服务、精细和分析。能量精准而实用。",
  6:"天秤座是风象开创星座，代表和谐、美感和关系。能量优雅而平衡。",
  7:"天蝎座是水象固定星座，代表深度、转变和力量。能量强烈而神秘。",
  8:"射手座是火象变动星座，代表探索、自由和真理。能量乐观而奔放。",
  9:"摩羯座是土象开创星座，代表成就、责任和纪律。能量严肃而坚韧。",
  10:"水瓶座是风象固定星座，代表创新、独立和博爱。能量前卫而理性。",
  11:"双鱼座是水象变动星座，代表慈悲、灵性和融合。能量柔软而无边。"
};
// ── SIGN_MEANING_EN ───────────────────────────────────────────────────

// ── i18n Proxy for SIGN_MEANING ────────────────────────────────────────
const SIGN_MEANING = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? SIGN_MEANING_EN : SIGN_MEANING_ZH;
    return src[prop];
  }
});

// ── i18n Proxy for HOUSE_MEANINGS ────────────────────────────────────────
const HOUSE_MEANINGS = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? HOUSE_MEANINGS_EN : HOUSE_MEANINGS_ZH;
    return src[prop];
  }
});

// ── i18n Proxy for HOUSE_LABELS ────────────────────────────────────────
const HOUSE_LABELS = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? HOUSE_LABELS_EN : HOUSE_LABELS_ZH;
    return src[prop];
  }
});

// Planet-to-planet aspect interpretations for synastry
const SYNASTRY_ASPECTS_ZH = {
  "Sun_Moon": { good:"你们在情感和意志层面有天然的共鸣。太阳方的自我表达能滋养月亮方的情绪需求，是经典的婚姻相位。", hard:"你们的情感需求和自我表达方式存在冲突。需要学会尊重彼此的根本差异。" },
  "Sun_Venus": { good:"强烈的吸引力，彼此欣赏和喜爱。太阳方被金星方的魅力和美感吸引，关系充满温暖和愉悦。", hard:"价值观和审美有时不一致，但吸引力仍然存在。" },
  "Sun_Mars": { good:"充满激情和活力的组合。行动力强，能一起完成很多事情。性吸引力强烈。", hard:"容易产生竞争和权力斗争，自我意志的碰撞需要调和。" },
  "Moon_Venus": { good:"情感关系非常和谐，彼此能给予对方所需的情感滋养。喜欢待在一起，共享美好时光。", hard:"情感表达方式不同，一方需要在情绪和爱意之间找到平衡。" },
  "Moon_Mars": { good:"情感关系中充满激情和活力，能激发彼此的情绪表达。", hard:"容易产生情绪冲突和争吵，情绪反应激烈。" },
  "Venus_Mars": { good:"极强的性吸引力和浪漫能量。金星方的柔美与火星方的阳刚形成完美的磁极吸引。", hard:"激情来得快去得也快，容易在亲密关系中产生摩擦。" },
  "Sun_Saturn": { good:"关系稳定长久，彼此负责任。土星方给予太阳方实际的指导和保护。", hard:"土星方可能对太阳方过于苛刻或限制，导致压抑感。" },
  "Jupiter_Venus": { good:"彼此带来快乐和扩张的能量。在一起时感觉幸运和富足，是很好的社交和旅行伙伴。", hard:"可能过度放纵或对关系期望过高。" },
  "Saturn_Moon": { good:"土星方给予月亮方稳定的情感支持。关系严肃认真，有长期承诺的潜力。", hard:"月亮方可能感觉情感上被冷落或不被理解，需要更多温暖。" }
};
// ── SYNASTRY_ASPECTS_EN ───────────────────────────────────────────────

// ── i18n Proxy for SYNASTRY_ASPECTS ────────────────────────────────────────
const SYNASTRY_ASPECTS = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? SYNASTRY_ASPECTS_EN : SYNASTRY_ASPECTS_ZH;
    return src[prop];
  }
});


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
    if (planets.length >= 3) stelliums.push({type:'sign', index:parseInt(si), planets, label:getSignNamePure(si)+'群星'});
  }
  for (const [h, planets] of Object.entries(houseGroups)) {
    if (planets.length >= 3) stelliums.push({type:'house', index:parseInt(h), planets, label:'第'+h+'宫群星'});
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
        `⭐ <strong>${s.label}</strong>: ${s.planets.map(p=>p.name).join(', ')} converge here, ` +
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
      return otherName + a.name;
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
          '<p style="font-size:0.85em;color:#8a8aa0;">↳ ' + a.name + ' with ' + otherP.name + ' (' + natureEN + '): This aspect adds a ' + natureEN + ' quality to the interpretation above. ' +
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
      `<p><span class="${a.cls}">${n1} ${a.name} ${n2}</span> (orb ${a.orb.toFixed(1)}°) — ` +
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
          `<p>${tp.enLabel} ${na.aspect} natal ${na.planet.name} → ${forecastEN}</p>`
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
    const label = intDate.getFullYear() + '年' + (intDate.getMonth()+1) + '月';

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
            const op = PLANETS.find(x=>x.id===oid);
            const pp = PLANETS.find(x=>x.id===pid);
            keyTransits.push({
              transitPlanet: op ? op.name : oid,
              natalPlanet: pp ? pp.name : pid,
              aspect: ad.name,
              orb: delta
            });
          }
        }
      }
    }

    intervals.push({label, keyTransits});
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
      themeEN += iv.keyTransits.map(t=>t.transitPlanet+t.aspect+t.natalPlanet).slice(0,4).join(', ');
      if (iv.keyTransits.length > 4) { theme += ' 等...'; themeEN += ' etc...'; }
    }

    html += _L(
      `<tr${rowClass}><td>${iv.label}</td><td>${iv.keyTransits.length === 0 ? '—' : iv.keyTransits.length+'个重要相位'}</td><td>${theme}</td></tr>`,
      `<tr${rowClass}><td>${iv.label}</td><td>${iv.keyTransits.length === 0 ? '—' : iv.keyTransits.length+' major aspects'}</td><td>${themeEN}</td></tr>`
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
          `<p>${tp.enLabel} ${na.aspect} natal ${na.planet.name} → ${forecastEN}</p>`
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
          html += `<p><span class="${cls}">${n1} ${a.name} ${n2}</span> — ${text}</p>`;
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

  html += '<p style="color:var(--text-dim);margin-top:16px;">' + _L('※ 星盘是指南针，不是判决书。你所拥有的自由意志，才是最强大的行星。', '※ Your chart is a compass, not a verdict. The free will you possess is the most powerful planet of all.') + '</p>';
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
    [{icon:'💬', platform:'微信', id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
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
        html += '<p style="font-size:0.85em;color:#9a9ab0;">↳ ' + _L('水星','Mercury') + ' ' + a.name + ' ' + otherP.name + ' — ';
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
    [{icon:'💬', platform:'微信', id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  return html;
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
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=zh`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'AstroChart/1.0' } });
    const data = await resp.json();
    if (data.length === 0) throw new Error('未找到该地点');

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

function computeChart(data) {
  const jd = julianDay(data.y, data.m, data.d, data.utcH);
  const T = centuriesSinceJ2000(jd);
  const eps = obliquity(T);
  const positions = calcAllPlanets(T);
  const { cusps, asc, mc } = calcHouses(jd, data.lat, data.lng, eps);
  const houses = assignHouses(positions, cusps);
  const aspects = calcAspects(positions);
  return { jd, T, eps, positions, cusps, asc, mc, houses, aspects };
}

let chartData1 = null;
let chartData2 = null;

function calculateAll() {
  try {
    const d1 = getInputValues('p1');
    if (!d1) { alert(_t('error.fillInfo')); return; }

    // Show ritual overlay
    const overlay = document.getElementById('ritualOverlay');
    overlay.style.display = 'flex';

    // Mystical loading phrases
    const phrases = _t('ritual.phrases');
    const phraseEl = document.getElementById('ritualPhrase');
    let phraseIdx = 0;
    phraseEl.textContent = phrases[0];

    const phraseInterval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % phrases.length;
      phraseEl.style.opacity = '0';
      setTimeout(() => {
        phraseEl.textContent = phrases[phraseIdx];
        phraseEl.style.opacity = '1';
      }, 400);
    }, 1800);

    // Compute in a small delay to allow UI to update
    setTimeout(() => {
      try {
        chartData1 = computeChart(d1);
        const d2 = getInputValues('p2');
        chartData2 = d2 ? computeChart(d2) : null;

        clearInterval(phraseInterval);

        // Final phrase
        phraseEl.style.opacity = '0';
        setTimeout(() => {
          phraseEl.textContent = _t('ritual.final');
          phraseEl.style.opacity = '1';
        }, 400);

        // Reveal results after a carefully timed pause
        setTimeout(() => {
          document.getElementById('resultsCard').style.display = 'block';

          // Render all tabs
          renderTab0();
          renderTab1();
          renderTab2();
          renderTab3();
          renderTab4();
          renderTab5();
          renderTab6();
          renderTab7();

          // Fade out overlay
          overlay.style.transition = 'opacity 0.8s';
          overlay.style.opacity = '0';

          // Remove overlay after fade
          setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
            overlay.style.transition = '';
          }, 800);

          // Stagger-reveal results
          document.getElementById('resultsCard').style.opacity = '0';
          document.getElementById('resultsCard').style.transition = 'opacity 1s';
          document.getElementById('resultsCard').scrollIntoView({behavior:'smooth'});

          // Switch to tab 0 with slight delay
          switchTab(0);

          // Fade in results
          setTimeout(() => {
            document.getElementById('resultsCard').style.opacity = '1';
          }, 200);

          // Show action buttons
          document.getElementById('btnPdf').style.display = 'inline-block';
          document.getElementById('btnEmail').style.display = 'inline-block';
          document.getElementById('btnCopyMobile').style.display = 'inline-block';

          // Collapse input card, show summary bar
          collapseInputCard();

        }, 800);
      } catch(e) {
        clearInterval(phraseInterval);
        overlay.style.display = 'none';
        document.getElementById('resultsCard').style.display = 'block';
        document.getElementById('tab0').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.calculate') + e.message + '</p>';
        console.error(e);
      }
    }, 200);
  } catch(e) {
    document.getElementById('resultsCard').style.display = 'block';
    document.getElementById('tab0').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.calculate') + e.message + '</p>';
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

  html += '<div class="blueprint-card">';
  html += '<h3>✦ 灵魂蓝图</h3>';

  // Element & mode summary
  html += '<div class="blueprint-stat-row">';
  html += '<div class="blueprint-stat"><div class="stat-val">' + domElem[0] + '象主导</div><div class="stat-lbl">' + domElem[1] + '颗行星 · ' + domMode[0] + '星座</div></div>';
  if (weakElem[1] <= 1) {
    html += '<div class="blueprint-stat"><div class="stat-val">' + weakElem[0] + '元素薄弱</div><div class="stat-lbl">' + (weakElem[1]===0?'完全缺失':'仅' + weakElem[1] + '颗') + ' · 此生的修行之地</div></div>';
  }
  html += '</div>';

  // Sun/Moon/Asc core
  html += '<div class="blueprint-stat-row">';
  html += '<div class="blueprint-stat"><div class="stat-val">☉ ' + getSignNamePure(sunSign) + '</div><div class="stat-lbl">太阳 · 第' + (d.houses.Sun||'?') + '宫</div></div>';
  html += '<div class="blueprint-stat"><div class="stat-val">☽ ' + getSignNamePure(moonSign) + '</div><div class="stat-lbl">月亮 · 第' + (d.houses.Moon||'?') + '宫</div></div>';
  html += '<div class="blueprint-stat"><div class="stat-val">ASC ' + getSignNamePure(ascSign) + '</div><div class="stat-lbl">上升星座</div></div>';
  html += '</div>';

  // Stelliums
  if (stelliums.length > 0) {
    html += '<div class="blueprint-stat-row">';
    for (const s of stelliums) {
      html += '<div class="blueprint-stat"><div class="stat-val">⭐ ' + s.label + '</div><div class="stat-lbl">' + s.planets.map(p=>p.name).join('、') + ' 汇聚</div></div>';
    }
    html += '</div>';
  }

  // Key patterns count
  if (keyPatterns.length > 0) {
    html += '<div class="blueprint-stat-row">';
    html += '<div class="blueprint-stat"><div class="stat-val">🔮 ' + keyPatterns.length + '个关键格局</div><div class="stat-lbl">' + keyPatterns.map(k=>k.name).join('、') + '</div></div>';
    html += '</div>';
  }

  html += '<button class="blueprint-expand-btn" onclick="expandNatalReport()">✨ 展开完整解读</button>';
  html += '</div>';

  // ═══ Hidden full report ═══
  html += '<div id="fullNatalReport">';
  html += generateDeepNatalReport(d.positions, d.houses, d.aspects, d.asc, d.mc);
  html += '</div>';

  // ═══ Technical tables (initially hidden) ═══
  html += '<div style="text-align:center;margin-top:18px;">';
  html += '<button class="blueprint-expand-btn" onclick="toggleDataTables()" id="btnToggleData" style="font-size:0.85em;padding:8px 24px;">📊 查看星盘数据</button>';
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
      <td>第${h}宫</td>
      <td><span class="tag ${tagCls}">${elem}</span></td>
      <td>${mode}</td>
    </tr>`;
  }
  html += '</tbody></table>';

  html += '<table class="chart-table" style="margin-top:8px;">';
  html += '<thead><tr><th>轴点</th><th>位置</th><th></th><th></th><th></th></tr></thead><tbody>';
  html += `<tr><td>ASC 上升</td><td>${formatPos(d.asc)}</td><td></td><td></td><td></td></tr>`;
  html += `<tr><td>MC 天顶</td><td>${formatPos(d.mc)}</td><td></td><td></td><td></td></tr>`;
  html += `<tr><td>DSC 下降</td><td>${formatPos(mod360(d.asc+180))}</td><td></td><td></td><td></td></tr>`;
  html += `<tr><td>IC 天底</td><td>${formatPos(mod360(d.mc+180))}</td><td></td><td></td><td></td></tr>`;
  html += '</tbody></table>';

  html += '<table class="chart-table" style="margin-top:8px;">';
  html += '<thead><tr><th>宫位</th><th>宫头 (Placidus)</th><th>元素/模式</th></tr></thead><tbody>';
  for (let h = 1; h <= 12; h++) {
    const {si} = degToSign(d.cusps[h]);
    html += `<tr><td>第${h}宫</td><td>${formatPos(d.cusps[h])}</td><td>${ELEMENTS[si]}/${MODES[si]}</td></tr>`;
  }
  html += '</tbody></table>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // ═══ Social引流: 加微信解锁深度报告 ═══
  html += renderLockedBlock(
    _t('locked.unlockYearly'),
    _t('locked.natalDesc'),
    [{icon:'💬', platform:'微信', id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
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

// ── Weekly Fortune ────────────────────────────────────────────────────────
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
    ['<span class="dos-bold">想到就去做 ·</span> <span class="dos-italic">别想太多是今天的超能力</span>','<span class="dos-bold">穿件亮色 ·</span> <span class="dos-italic">红色橘色都行，先镇住场子</span>','<span class="dos-bold">把最难的事第一个干掉 ·</span> <span class="dos-italic">然后一整天空气都是甜的</span>','<span class="dos-bold">运动出汗 ·</span> <span class="dos-italic">白羊的身体不动会生锈</span>','<span class="dos-bold">说走就走 ·</span> <span class="dos-italic">换个地方待着也算旅行</span>','<span class="dos-bold">发一条朋友圈 ·</span> <span class="dos-italic">今天你的表达欲值得被看见</span>'],
    ['<span class="dos-bold">吃顿好的 ·</span> <span class="dos-italic">今天不将就，从午餐开始升级</span>','<span class="dos-bold">整理一个抽屉 ·</span> <span class="dos-italic">扔一件就算断舍离</span>','<span class="dos-bold">给自己买杯好咖啡 ·</span> <span class="dos-italic">坐下来慢慢喝，不准边走边喝</span>','<span class="dos-bold">换上刚洗的床单 ·</span> <span class="dos-italic">今晚你值得五星级待遇</span>','<span class="dos-bold">摸一摸植物或泥土 ·</span> <span class="dos-italic">接地气是金牛的充电方式</span>','<span class="dos-bold">列一个"不做什么"清单 ·</span> <span class="dos-italic">比待办清单更管用</span>'],
    ['<span class="dos-bold">给老朋友发条语音 ·</span> <span class="dos-italic">打字太慢感情会凉</span>','<span class="dos-bold">换个路线回家 ·</span> <span class="dos-italic">打破日常惯性，路上说不定有好事</span>','<span class="dos-bold">学一句废话外语 ·</span> <span class="dos-italic">比如"我的猫今天心情不好"用西语怎么说</span>','<span class="dos-bold">把脑子里飘过的想法记下来 ·</span> <span class="dos-italic">双子不记三秒就忘</span>','<span class="dos-bold">找个人聊到停不下来 ·</span> <span class="dos-italic">今天你的话密度很高，找对听众</span>','<span class="dos-bold">同时开三个窗口但只专注一个 ·</span> <span class="dos-italic">先宠幸最重要的那个</span>'],
    ['<span class="dos-bold">窝家点外卖 ·</span> <span class="dos-italic">理直气壮，不出门就是对世界最大的温柔</span>','<span class="dos-bold">翻一张旧照片 ·</span> <span class="dos-italic">怀旧是巨蟹的超能力，不是弱点</span>','<span class="dos-bold">给自己煮一碗面加个蛋 ·</span> <span class="dos-italic">做饭这件事，形式大于内容</span>','<span class="dos-bold">跟最亲的人说一句"想你" ·</span> <span class="dos-italic">巨蟹的想念是最好的礼物</span>','<span class="dos-bold">泡个脚或泡个澡 ·</span> <span class="dos-italic">水是你的元素，泡走一天的情绪</span>','<span class="dos-bold">把灯光调暗点个蜡烛 ·</span> <span class="dos-italic">营造你的壳，今晚你是软体动物</span>'],
    ['<span class="dos-bold">发自拍 ·</span> <span class="dos-italic">不P也行，今天的你本来就能打</span>','<span class="dos-bold">戴一件夸张的首饰 ·</span> <span class="dos-italic">狮子不闪谁闪</span>','<span class="dos-bold">大方夸一个人 ·</span> <span class="dos-italic">狮子的赞美自带光环，被夸的人会记很久</span>','<span class="dos-bold">做今天第一个开口的人 ·</span> <span class="dos-italic">会议室或群聊里，你的话自带BGM</span>','<span class="dos-bold">穿得像要去走红毯 ·</span> <span class="dos-italic">哪怕只是去拿快递</span>','<span class="dos-bold">主动做个决定 ·</span> <span class="dos-italic">狮子最擅长的就是让一群人跟着你走</span>'],
    ['<span class="dos-bold">大扫除 ·</span> <span class="dos-italic">扔一件就算赢，处女座的快乐就是这么简单</span>','<span class="dos-bold">把手机通知小红点全部清掉 ·</span> <span class="dos-italic">世界清净了三分钟</span>','<span class="dos-bold">整理手机相册 ·</span> <span class="dos-italic">删掉那37张拍糊了的同一角度</span>','<span class="dos-bold">列一个清单然后划掉第一项 ·</span> <span class="dos-italic">划掉那一瞬间的爽感无价</span>','<span class="dos-bold">早起十分钟 ·</span> <span class="dos-italic">不赶时间的早晨是处女座的奢侈品</span>','<span class="dos-bold">把一件事做到90分就停 ·</span> <span class="dos-italic">今天放过那剩下的10分</span>'],
    ['<span class="dos-bold">约朋友喝咖啡 ·</span> <span class="dos-italic">你请，天秤的社交货币就是一杯咖啡</span>','<span class="dos-bold">换一身搭配 ·</span> <span class="dos-italic">镜子前站五分钟，今天要好看不要将就</span>','<span class="dos-bold">听一首老歌循环三遍 ·</span> <span class="dos-italic">天秤的耳朵需要美的滋养</span>','<span class="dos-bold">纠结的时候抛硬币 ·</span> <span class="dos-italic">不是为了看结果，是硬币在空中时你知道自己希望哪面朝上</span>','<span class="dos-bold">给房间换一束花或一支香薰 ·</span> <span class="dos-italic">天秤的环境就是心情</span>','<span class="dos-bold">说一次"不" ·</span> <span class="dos-italic">天秤的温柔很贵，今天不免费发放</span>'],
    ['<span class="dos-bold">一个人看剧 ·</span> <span class="dos-italic">不准快进，天蝎值得完整的故事</span>','<span class="dos-bold">删一个再也不聊的微信好友 ·</span> <span class="dos-italic">定期清理内存是成年人的体面</span>','<span class="dos-bold">把手机设为免打扰一小时 ·</span> <span class="dos-italic">世界找你之前先让自己找到自己</span>','<span class="dos-bold">喝一杯不加糖的黑咖啡或浓茶 ·</span> <span class="dos-italic">天蝎的味觉和人生一样，要浓不要甜</span>','<span class="dos-bold">写三行日记 ·</span> <span class="dos-italic">不用给别人看，天蝎的秘密只属于自己</span>','<span class="dos-bold">眼神交流多停一秒 ·</span> <span class="dos-italic">今天你的凝视有穿透力，别浪费</span>'],
    ['<span class="dos-bold">搜机票 ·</span> <span class="dos-italic">不买也算旅行，射手的精神已经在登机口了</span>','<span class="dos-bold">吃一种没吃过的食物 ·</span> <span class="dos-italic">猎奇是射手的基本人权</span>','<span class="dos-bold">计划一次周末短途 ·</span> <span class="dos-italic">哪怕只是隔壁城市，出发就是意义</span>','<span class="dos-bold">跟一个陌生人聊天 ·</span> <span class="dos-italic">射手最擅长把路人变成故事</span>','<span class="dos-bold">换一个App的头像或签名 ·</span> <span class="dos-italic">新鲜感是射手的燃料</span>','<span class="dos-bold">大大方方笑出声 ·</span> <span class="dos-italic">射手笑起来世界都亮了一点，别憋着</span>'],
    ['<span class="dos-bold">做计划 ·</span> <span class="dos-italic">不做也行，但摩羯做了计划心里就踏实</span>','<span class="dos-bold">提前十分钟到 ·</span> <span class="dos-italic">摩羯的时间管理是一种优雅</span>','<span class="dos-bold">完成一件拖延很久的小事 ·</span> <span class="dos-italic">那种如释重负的感觉会上瘾</span>','<span class="dos-bold">整理一下银行卡余额 ·</span> <span class="dos-italic">不是为了焦虑，是摩羯天生喜欢掌控感</span>','<span class="dos-bold">给自己设定一个本周小目标 ·</span> <span class="dos-italic">不难，但完成后你会偷偷开心</span>','<span class="dos-bold">穿一双舒服但好看的鞋 ·</span> <span class="dos-italic">摩羯的实用主义也可以很体面</span>'],
    ['<span class="dos-bold">换头像 ·</span> <span class="dos-italic">换种心情，水瓶的精神状态需要一个新皮肤</span>','<span class="dos-bold">尝试一个奇怪的组合 ·</span> <span class="dos-italic">比如蘸番茄酱的薯条配冰淇淋</span>','<span class="dos-bold">一个人逛美术馆或书店 ·</span> <span class="dos-italic">水瓶的灵魂需要不定期的独处补给</span>','<span class="dos-bold">发明一个只有你自己懂的词 ·</span> <span class="dos-italic">今天就用它发一条朋友圈</span>','<span class="dos-bold">把手机通知音换成一个奇怪的声音 ·</span> <span class="dos-italic">让每次响铃都像行为艺术</span>','<span class="dos-bold">半夜想到什么就记下来 ·</span> <span class="dos-italic">水瓶的好点子都住在凌晨两点</span>'],
    ['<span class="dos-bold">睡午觉 ·</span> <span class="dos-italic">定个闹钟再睡，双鱼的梦需要中场休息</span>','<span class="dos-bold">听一首纯音乐闭上眼睛五分钟 ·</span> <span class="dos-italic">双鱼的内心世界比现实精彩</span>','<span class="dos-bold">写一首只有三行的诗 ·</span> <span class="dos-italic">不用押韵，双鱼的浪漫不需要格式</span>','<span class="dos-bold">看一部画面很美的电影 ·</span> <span class="dos-italic">剧情不重要，眼睛吃饱就行</span>','<span class="dos-bold">给自己买一支花 ·</span> <span class="dos-italic">双鱼的生活需要一点无用的美好</span>','<span class="dos-bold">允许自己放空一小时 ·</span> <span class="dos-italic">不产出不社交不思考，双鱼需要飘着</span>']
  ];
  const signDos_EN = [
    ['<span class="dos-bold">Do it now ·</span> <span class="dos-italic">Not overthinking is today\'s superpower</span>','<span class="dos-bold">Wear something bright ·</span> <span class="dos-italic">Red or orange — set the tone first</span>','<span class="dos-bold">Tackle the hardest thing first ·</span> <span class="dos-italic">Then the rest of the day tastes sweet</span>','<span class="dos-bold">Sweat it out ·</span> <span class="dos-italic">An Aries body rusts if it stays still</span>','<span class="dos-bold">Go somewhere on impulse ·</span> <span class="dos-italic">Being somewhere else counts as travel</span>','<span class="dos-bold">Post something ·</span> <span class="dos-italic">Your urge to express deserves to be seen today</span>'],
    ['<span class="dos-bold">Eat something nice ·</span> <span class="dos-italic">No compromises today — upgrade starting from lunch</span>','<span class="dos-bold">Organize one drawer ·</span> <span class="dos-italic">Tossing one thing counts as decluttering</span>','<span class="dos-bold">Buy yourself a good coffee ·</span> <span class="dos-italic">Sit down and sip slowly — no walking with it</span>','<span class="dos-bold">Put on fresh sheets ·</span> <span class="dos-italic">You deserve a five-star experience tonight</span>','<span class="dos-bold">Touch a plant or soil ·</span> <span class="dos-italic">Grounding is how Taurus recharges</span>','<span class="dos-bold">Make a "stop doing" list ·</span> <span class="dos-italic">More effective than a to-do list</span>'],
    ['<span class="dos-bold">Send a voice message to an old friend ·</span> <span class="dos-italic">Typing is too slow — feelings cool down</span>','<span class="dos-bold">Take a different route home ·</span> <span class="dos-italic">Break the routine — something good might be waiting</span>','<span class="dos-bold">Learn a useless phrase in another language ·</span> <span class="dos-italic">Like "my cat is in a bad mood today" in Spanish</span>','<span class="dos-bold">Write down the thoughts floating by ·</span> <span class="dos-italic">Gemini forgets in three seconds if you don\'t</span>','<span class="dos-bold">Find someone to talk nonstop with ·</span> <span class="dos-italic">Your word density is high today — find the right audience</span>','<span class="dos-bold">Open three windows but focus on one ·</span> <span class="dos-italic">Favor the most important one first</span>'],
    ['<span class="dos-bold">Stay in and order delivery ·</span> <span class="dos-italic">No guilt — not going out is your gift to the world</span>','<span class="dos-bold">Flip through an old photo ·</span> <span class="dos-italic">Nostalgia is a Cancer superpower, not a weakness</span>','<span class="dos-bold">Cook noodles with an egg ·</span> <span class="dos-italic">The ritual matters more than the dish</span>','<span class="dos-bold">Tell your closest person "I miss you" ·</span> <span class="dos-italic">A Cancer\'s longing is the best gift</span>','<span class="dos-bold">Soak your feet or take a bath ·</span> <span class="dos-italic">Water is your element — wash away the day\'s emotions</span>','<span class="dos-bold">Dim the lights and light a candle ·</span> <span class="dos-italic">Build your shell — tonight you\'re a soft mollusk</span>'],
    ['<span class="dos-bold">Post a selfie ·</span> <span class="dos-italic">No filter needed — you\'re camera-ready today</span>','<span class="dos-bold">Wear bold jewelry ·</span> <span class="dos-italic">If Leo doesn\'t shine, who will?</span>','<span class="dos-bold">Compliment someone generously ·</span> <span class="dos-italic">Leo\'s praise has a halo — the recipient will remember it</span>','<span class="dos-bold">Be the first to speak up today ·</span> <span class="dos-italic">In meetings or group chats, your words have a built-in soundtrack</span>','<span class="dos-bold">Dress like you\'re walking a red carpet ·</span> <span class="dos-italic">Even if it\'s just to grab a package</span>','<span class="dos-bold">Make a decision proactively ·</span> <span class="dos-italic">Leo\'s best skill is getting people to follow your lead</span>'],
    ['<span class="dos-bold">Deep clean something ·</span> <span class="dos-italic">Tossing one thing is a win — Virgo joy is that simple</span>','<span class="dos-bold">Clear all notification badges ·</span> <span class="dos-italic">The world goes quiet for three whole minutes</span>','<span class="dos-bold">Clean up your photo gallery ·</span> <span class="dos-italic">Delete those 37 blurry shots from the same angle</span>','<span class="dos-bold">Make a list and cross off the first item ·</span> <span class="dos-italic">That crossing-off moment is pure satisfaction</span>','<span class="dos-bold">Wake up ten minutes early ·</span> <span class="dos-italic">A morning without rushing is a Virgo luxury</span>','<span class="dos-bold">Stop at 90% done ·</span> <span class="dos-italic">Let go of the remaining 10% today</span>'],
    ['<span class="dos-bold">Invite a friend for coffee ·</span> <span class="dos-italic">Your treat — a Libra\'s social currency is a cup of coffee</span>','<span class="dos-bold">Switch up your outfit ·</span> <span class="dos-italic">Stand in front of the mirror for five minutes — look good, don\'t settle</span>','<span class="dos-bold">Loop an old song three times ·</span> <span class="dos-italic">A Libra\'s ears need beauty to thrive</span>','<span class="dos-bold">Flip a coin when you can\'t decide ·</span> <span class="dos-italic">It\'s not about the result — it\'s knowing which side you hope for while it\'s in the air</span>','<span class="dos-bold">Change the flowers or light a new scent ·</span> <span class="dos-italic">A Libra\'s environment IS their mood</span>','<span class="dos-bold">Say "no" once ·</span> <span class="dos-italic">Libra kindness is expensive — not giving it away for free today</span>'],
    ['<span class="dos-bold">Watch a show alone ·</span> <span class="dos-italic">No skipping — Scorpio deserves the full story</span>','<span class="dos-bold">Delete a contact you never talk to ·</span> <span class="dos-italic">Regular memory cleanup is adult dignity</span>','<span class="dos-bold">Put your phone on DND for an hour ·</span> <span class="dos-italic">Find yourself before the world finds you</span>','<span class="dos-bold">Drink unsweetened black coffee or strong tea ·</span> <span class="dos-italic">Scorpio taste buds — and life — prefer intensity over sweetness</span>','<span class="dos-bold">Write three lines in a journal ·</span> <span class="dos-italic">No one needs to see it — Scorpio secrets belong to yourself</span>','<span class="dos-bold">Hold eye contact one second longer ·</span> <span class="dos-italic">Your gaze has penetrating power today — don\'t waste it</span>'],
    ['<span class="dos-bold">Search for flights ·</span> <span class="dos-italic">You don\'t have to buy — your spirit is already at the gate</span>','<span class="dos-bold">Eat something you\'ve never tried ·</span> <span class="dos-italic">Novelty-seeking is a Sagittarius birthright</span>','<span class="dos-bold">Plan a weekend getaway ·</span> <span class="dos-italic">Even if it\'s just the next town over — the departure IS the point</span>','<span class="dos-bold">Talk to a stranger ·</span> <span class="dos-italic">Sagittarius turns passersby into stories</span>','<span class="dos-bold">Change your avatar or bio ·</span> <span class="dos-italic">Freshness is Sagittarius fuel</span>','<span class="dos-bold">Laugh out loud, uninhibited ·</span> <span class="dos-italic">A Sagittarius laugh brightens the world — don\'t hold back</span>'],
    ['<span class="dos-bold">Make a plan ·</span> <span class="dos-italic">You don\'t have to, but Capricorn sleeps better with one</span>','<span class="dos-bold">Arrive ten minutes early ·</span> <span class="dos-italic">Capricorn time management is a form of elegance</span>','<span class="dos-bold">Finish one small thing you\'ve been putting off ·</span> <span class="dos-italic">That wave of relief is addictive</span>','<span class="dos-bold">Check your account balance ·</span> <span class="dos-italic">Not for anxiety — Capricorn just naturally likes a sense of control</span>','<span class="dos-bold">Set one small weekly goal ·</span> <span class="dos-italic">Nothing hard — but you\'ll secretly smile when you hit it</span>','<span class="dos-bold">Wear comfortable but nice-looking shoes ·</span> <span class="dos-italic">Capricorn practicality can be dignified too</span>'],
    ['<span class="dos-bold">Change your avatar ·</span> <span class="dos-italic">New mood — Aquarius mental state needs a fresh skin</span>','<span class="dos-bold">Try a weird combination ·</span> <span class="dos-italic">Like fries dipped in ketchup with ice cream</span>','<span class="dos-bold">Browse a gallery or bookstore alone ·</span> <span class="dos-italic">Aquarius soul needs regular solo replenishment</span>','<span class="dos-bold">Invent a word only you understand ·</span> <span class="dos-italic">Use it in a post today</span>','<span class="dos-bold">Change your notification sound to something odd ·</span> <span class="dos-italic">Make every ring a performance art piece</span>','<span class="dos-bold">Write down whatever pops into your head at midnight ·</span> <span class="dos-italic">Aquarius good ideas all live at 2 AM</span>'],
    ['<span class="dos-bold">Take a nap ·</span> <span class="dos-italic">Set an alarm first — Pisces dreams need an intermission</span>','<span class="dos-bold">Listen to instrumental music with eyes closed for five minutes ·</span> <span class="dos-italic">Your inner world is more colorful than reality</span>','<span class="dos-bold">Write a three-line poem ·</span> <span class="dos-italic">No rhyme needed — Pisces romance has no format</span>','<span class="dos-bold">Watch a visually stunning film ·</span> <span class="dos-italic">Plot doesn\'t matter — just feast your eyes</span>','<span class="dos-bold">Buy yourself a single flower ·</span> <span class="dos-italic">Pisces life needs a touch of useless beauty</span>','<span class="dos-bold">Allow yourself an hour of blank space ·</span> <span class="dos-italic">No output, no socializing, no thinking — Pisces needs to drift</span>']
  ];
  const signDos = new Proxy({}, { get(target, prop) { const src = (window._lang && window._lang() === 'en') ? signDos_EN : signDos_ZH; return src[prop]; } });

  const signDonts_ZH = [
    ['<span class="dos-bold">冲动下单 ·</span> <span class="dos-italic">先放购物车冷静到明天，它又不会跑</span>','<span class="dos-bold">跟人正面刚 ·</span> <span class="dos-italic">赢了场面输了心情，这笔账不划算</span>','<span class="dos-bold">三分钟等不了就暴躁 ·</span> <span class="dos-italic">有些答案需要你多坐一会儿</span>','<span class="dos-bold">替别人做决定 ·</span> <span class="dos-italic">白羊的热心今天先收一收</span>','<span class="dos-bold">开车路怒 ·</span> <span class="dos-italic">路上的人都是NPC，不值得你按喇叭</span>','<span class="dos-bold">熬夜装永动机 ·</span> <span class="dos-italic">白羊的电池也得充电，关机不丢人</span>'],
    ['<span class="dos-bold">凑合吃午饭 ·</span> <span class="dos-italic">今天不准将就，身体是你最贵的资产</span>','<span class="dos-bold">刷购物App停不下来 ·</span> <span class="dos-italic">加入购物车≠已经拥有</span>','<span class="dos-bold">死守舒适区 ·</span> <span class="dos-italic">偶尔伸一只脚出去试试水温也不赖</span>','<span class="dos-bold">跟别人比进度 ·</span> <span class="dos-italic">金牛有自己的节奏，慢也是快</span>','<span class="dos-bold">忍着不说憋成内伤 ·</span> <span class="dos-italic">说出来比吃下去健康</span>','<span class="dos-bold">把工作带回家 ·</span> <span class="dos-italic">沙发和床是你的结界，PPT不准进来</span>'],
    ['<span class="dos-bold">刷屏话痨 ·</span> <span class="dos-italic">说到第几句了？今天适可而止</span>','<span class="dos-bold">同时追三个群聊 ·</span> <span class="dos-italic">你的注意力比流量贵多了</span>','<span class="dos-bold">把吐槽当真 ·</span> <span class="dos-italic">双子嘴快但心软，别让气话过夜</span>','<span class="dos-bold">一个下午切换八个任务 ·</span> <span class="dos-italic">大脑不是浏览器，别开那么多标签页</span>','<span class="dos-bold">把秘密告诉一个不太熟的人 ·</span> <span class="dos-italic">八卦虽好，今天先存着</span>','<span class="dos-bold">看了标题就转发 ·</span> <span class="dos-italic">双子聪明但偶尔也要读完全文</span>'],
    ['<span class="dos-bold">熬夜emo ·</span> <span class="dos-italic">十二点前关机，深夜的情绪都是假象</span>','<span class="dos-bold">过度解读别人的一句话 ·</span> <span class="dos-italic">巨蟹的雷达太灵敏，今天关掉一半</span>','<span class="dos-bold">替全公司的人操心 ·</span> <span class="dos-italic">你是同事不是妈，今天只照顾自己</span>','<span class="dos-bold">忍着眼泪说"没事" ·</span> <span class="dos-italic">巨蟹的眼泪不丢人，哭出来比憋着勇敢</span>','<span class="dos-bold">把家里吃的东西都藏起来 ·</span> <span class="dos-italic">情绪化进食骗不了你的胃</span>','<span class="dos-bold">翻前任的社交账号 ·</span> <span class="dos-italic">过去已经翻篇了，你往前看</span>'],
    ['<span class="dos-bold">硬撑逞强 ·</span> <span class="dos-italic">说一句"我不会"比装懂要帅一万倍</span>','<span class="dos-bold">把别人的夸奖当真 ·</span> <span class="dos-italic">也别把别人的忽视当回事</span>','<span class="dos-bold">朋友圈没人点赞就删 ·</span> <span class="dos-italic">狮子不需要靠点赞数证明自己发光</span>','<span class="dos-bold">打断别人说话 ·</span> <span class="dos-italic">狮子热情但今天先让对方把话说完</span>','<span class="dos-bold">在一个地方死磕 ·</span> <span class="dos-italic">换条路走不叫认输，叫换个姿势赢</span>','<span class="dos-bold">冷落身边最亲近的人 ·</span> <span class="dos-italic">外面的掌声很好，但身边的人更需要你的温度</span>'],
    ['<span class="dos-bold">吹毛求疵 ·</span> <span class="dos-italic">今天放过自己，也放过身边人</span>','<span class="dos-bold">把一件事反复改了又改 ·</span> <span class="dos-italic">95分和99分在外人眼里一样好</span>','<span class="dos-bold">在心里给自己打分 ·</span> <span class="dos-italic">处女座的标准太高，今天别当自己的考官</span>','<span class="dos-bold">帮别人收拾烂摊子 ·</span> <span class="dos-italic">你的整理能力很值钱，今天先给自己用</span>','<span class="dos-bold">嫌弃别人的干活方式 ·</span> <span class="dos-italic">不一样不等于不对，随它去吧</span>','<span class="dos-bold">把一整天排满 ·</span> <span class="dos-italic">处女座的高效也需要中场休息</span>'],
    ['<span class="dos-bold">讨好所有人 ·</span> <span class="dos-italic">先讨好自己，其他人排队</span>','<span class="dos-bold">纠结到天黑还没决定 ·</span> <span class="dos-italic">选哪个都不会死，但不选的这一小时已经死了</span>','<span class="dos-bold">为了避免冲突说违心话 ·</span> <span class="dos-italic">天秤的和平主义不包含委屈自己</span>','<span class="dos-bold">过度在意别人怎么看你 ·</span> <span class="dos-italic">其实大家都在意自己，没人有空研究你</span>','<span class="dos-bold">同时跟三个人暧昧 ·</span> <span class="dos-italic">天秤的犹豫不决在感情里是减分项</span>','<span class="dos-bold">在购物车和下单之间反复横跳 ·</span> <span class="dos-italic">要么买要么关，中间态最耗神</span>'],
    ['<span class="dos-bold">翻旧账 ·</span> <span class="dos-italic">已经翻篇了，再翻一遍纸会破</span>','<span class="dos-bold">怀疑所有人的动机 ·</span> <span class="dos-italic">今天先假设大家都不是坏人，轻松一点</span>','<span class="dos-bold">暗中观察过度 ·</span> <span class="dos-italic">与其在暗处看，不如走到明处说</span>','<span class="dos-bold">把恨意存着当燃料 ·</span> <span class="dos-italic">天蝎的记性好，但选择性遗忘是更高级的能力</span>','<span class="dos-bold">冷暴力身边的人 ·</span> <span class="dos-italic">你不说他们真的不知道你在气什么</span>','<span class="dos-bold">打探前任的现状 ·</span> <span class="dos-italic">天蝎的好奇心用在别的地方都能改变世界</span>'],
    ['<span class="dos-bold">说走就走不带充电宝 ·</span> <span class="dos-italic">自由很重要，但手机没电更可怕</span>','<span class="dos-bold">立flag ·</span> <span class="dos-italic">先立一个能做到的，剩下的下次再吹</span>','<span class="dos-bold">对着一桌人讲大道理 ·</span> <span class="dos-italic">射手的三观很正但今天让别人自己悟</span>','<span class="dos-bold">把信用卡刷爆去旅行 ·</span> <span class="dos-italic">诗和远方重要，下个月的账单也重要</span>','<span class="dos-bold">同时答应八个饭局 ·</span> <span class="dos-italic">射手的人缘好但身体只有一个</span>','<span class="dos-bold">跟人抬杠停不下来 ·</span> <span class="dos-italic">赢了辩论输了朋友，划不来</span>'],
    ['<span class="dos-bold">把工作当全部 ·</span> <span class="dos-italic">摩羯的事业心很强，但今天留一小时给自己</span>','<span class="dos-bold">立一个今年必须完成的大flag ·</span> <span class="dos-italic">先立到月底的，剩下的交给时间</span>','<span class="dos-bold">用"我不够好"当借口不开始 ·</span> <span class="dos-italic">你比你以为的强多了</span>','<span class="dos-bold">把所有人都当竞争对手 ·</span> <span class="dos-italic">摩羯的赛道是自己，不用看别人</span>','<span class="dos-bold">熬夜加班证明自己 ·</span> <span class="dos-italic">摩羯不是靠工时定义的，是靠结果</span>','<span class="dos-bold">说"我没事"然后一个人扛 ·</span> <span class="dos-italic">示弱不是失败，摩羯也可以喊累</span>'],
    ['<span class="dos-bold">死守规矩 ·</span> <span class="dos-italic">偶尔破个例，水瓶就是为打破规则而生的</span>','<span class="dos-bold">对所有人的意见都嗤之以鼻 ·</span> <span class="dos-italic">与众不同不等于否定一切</span>','<span class="dos-bold">情感上离群索居 ·</span> <span class="dos-italic">就算你是外星人，也需要地球上的朋友</span>','<span class="dos-bold">在群里发表长篇大论然后退群 ·</span> <span class="dos-italic">说完就跑不算酷，留下来听回应</span>','<span class="dos-bold">过度标榜特立独行 ·</span> <span class="dos-italic">做自己就够了，不用证明自己是"不一样的烟火"</span>','<span class="dos-bold">把孤独当勋章 ·</span> <span class="dos-italic">水瓶的独特不需要用疏离来证明</span>'],
    ['<span class="dos-bold">过度共情 ·</span> <span class="dos-italic">先照顾好自己的情绪再替别人难过</span>','<span class="dos-bold">把自己溺在悲伤的歌里出不来 ·</span> <span class="dos-italic">双鱼的敏感是天赋不是自毁按钮</span>','<span class="dos-bold">对一个人上头太快 ·</span> <span class="dos-italic">浪漫很好，但先看清楚是不是海市蜃楼</span>','<span class="dos-bold">用做梦替代行动 ·</span> <span class="dos-italic">梦醒了还在原地，不如边梦边走</span>','<span class="dos-bold">把所有人的情绪背在自己身上 ·</span> <span class="dos-italic">你不是海绵，不用什么都吸</span>','<span class="dos-bold">逃避现实沉迷追剧 ·</span> <span class="dos-italic">偶尔上岸透口气，现实里也有好故事</span>']
  ];
  const signDonts_EN = [
    ['<span class="dos-bold">Impulse buying ·</span> <span class="dos-italic">Leave it in the cart until tomorrow — it\'s not going anywhere</span>','<span class="dos-bold">Head-on confrontation ·</span> <span class="dos-italic">Winning the battle but losing your mood is a bad deal</span>','<span class="dos-bold">Getting irritable after three minutes of waiting ·</span> <span class="dos-italic">Some answers need you to sit a little longer</span>','<span class="dos-bold">Making decisions for others ·</span> <span class="dos-italic">Rein in that Aries enthusiasm today</span>','<span class="dos-bold">Road rage ·</span> <span class="dos-italic">Everyone on the road is an NPC — not worth the horn</span>','<span class="dos-bold">Pretending you\'re a perpetual motion machine ·</span> <span class="dos-italic">Aries batteries need charging too — powering down isn\'t shameful</span>'],
    ['<span class="dos-bold">Settling for a sad lunch ·</span> <span class="dos-italic">No compromises today — your body is your most valuable asset</span>','<span class="dos-bold">Endless shopping app scrolling ·</span> <span class="dos-italic">Add to cart ≠ already own it</span>','<span class="dos-bold">Death-gripping your comfort zone ·</span> <span class="dos-italic">Dip one toe in the water once in a while — it\'s not bad</span>','<span class="dos-bold">Comparing your progress to others ·</span> <span class="dos-italic">Taurus has its own rhythm — slow is also fast</span>','<span class="dos-bold">Bottling it up until it hurts ·</span> <span class="dos-italic">Speaking it out is healthier than swallowing it</span>','<span class="dos-bold">Bringing work home ·</span> <span class="dos-italic">Your couch and bed are sacred barriers — no PPTs allowed inside</span>'],
    ['<span class="dos-bold">Spamming the group chat ·</span> <span class="dos-italic">What sentence are you on? Know when to stop today</span>','<span class="dos-bold">Following three group chats at once ·</span> <span class="dos-italic">Your attention is worth way more than your data plan</span>','<span class="dos-bold">Taking your own rants seriously ·</span> <span class="dos-italic">Gemini speaks fast but has a soft heart — don\'t let harsh words last overnight</span>','<span class="dos-bold">Switching between eight tasks in one afternoon ·</span> <span class="dos-italic">Your brain isn\'t a browser — don\'t open so many tabs</span>','<span class="dos-bold">Telling a secret to someone you barely know ·</span> <span class="dos-italic">Gossip is fun but save it for now</span>','<span class="dos-bold">Forwarding based on the headline alone ·</span> <span class="dos-italic">Gemini is smart but occasionally read the whole article</span>'],
    ['<span class="dos-bold">Late-night emo spiraling ·</span> <span class="dos-italic">Power off before midnight — late-night emotions are illusions</span>','<span class="dos-bold">Over-analyzing someone\'s one sentence ·</span> <span class="dos-italic">Cancer radar is too sensitive — turn it down by half today</span>','<span class="dos-bold">Worrying about everyone in the company ·</span> <span class="dos-italic">You\'re a colleague, not a mom — just take care of yourself today</span>','<span class="dos-bold">Holding back tears and saying "I\'m fine" ·</span> <span class="dos-italic">Cancer tears aren\'t shameful — crying is braver than holding it in</span>','<span class="dos-bold">Hiding all the snacks in the house ·</span> <span class="dos-italic">Emotional eating can\'t fool your stomach</span>','<span class="dos-bold">Checking your ex\'s social media ·</span> <span class="dos-italic">The past has turned the page — look forward</span>'],
    ['<span class="dos-bold">Faking strength ·</span> <span class="dos-italic">Saying "I don\'t know" is ten thousand times cooler than pretending</span>','<span class="dos-bold">Taking every compliment to heart ·</span> <span class="dos-italic">And don\'t take every bit of neglect to heart either</span>','<span class="dos-bold">Deleting posts with no likes ·</span> <span class="dos-italic">Leo doesn\'t need a like count to prove they shine</span>','<span class="dos-bold">Interrupting people ·</span> <span class="dos-italic">Leo is passionate but let the other person finish speaking today</span>','<span class="dos-bold">Stubbornly banging your head against one wall ·</span> <span class="dos-italic">Taking another path isn\'t surrender — it\'s winning in a different pose</span>','<span class="dos-bold">Neglecting the people closest to you ·</span> <span class="dos-italic">Applause from the crowd is nice, but the ones close to you need your warmth more</span>'],
    ['<span class="dos-bold">Nitpicking ·</span> <span class="dos-italic">Give yourself — and everyone around you — a break today</span>','<span class="dos-bold">Revising the same thing over and over ·</span> <span class="dos-italic">95% and 99% look exactly the same to everyone else</span>','<span class="dos-bold">Grading yourself internally ·</span> <span class="dos-italic">Virgo standards are too high — don\'t be your own examiner today</span>','<span class="dos-bold">Cleaning up other people\'s messes ·</span> <span class="dos-italic">Your organizing skills are valuable — use them for yourself first today</span>','<span class="dos-bold">Judging how others do things ·</span> <span class="dos-italic">Different doesn\'t mean wrong — let it go</span>','<span class="dos-bold">Packing the entire day full ·</span> <span class="dos-italic">Even Virgo efficiency needs an intermission</span>'],
    ['<span class="dos-bold">Pleasing everyone ·</span> <span class="dos-italic">Please yourself first — everyone else can wait in line</span>','<span class="dos-bold">Indecision until dark ·</span> <span class="dos-italic">Neither option will kill you, but the hour spent not choosing is already dead</span>','<span class="dos-bold">Saying what you don\'t mean to avoid conflict ·</span> <span class="dos-italic">Libra pacifism doesn\'t include hurting yourself</span>','<span class="dos-bold">Obsessing over what others think of you ·</span> <span class="dos-italic">Truth is, everyone\'s busy thinking about themselves — no one has time to study you</span>','<span class="dos-bold">Flirting with three people at once ·</span> <span class="dos-italic">Libra indecisiveness is a liability in love</span>','<span class="dos-bold">Ping-ponging between cart and checkout ·</span> <span class="dos-italic">Either buy or close — the in-between is the most draining</span>'],
    ['<span class="dos-bold">Dredging up old scores ·</span> <span class="dos-italic">The page has turned — flip it again and the paper tears</span>','<span class="dos-bold">Suspecting everyone\'s motives ·</span> <span class="dos-italic">Assume the best for once today — lighten the load</span>','<span class="dos-bold">Excessive lurking ·</span> <span class="dos-italic">Instead of watching from the shadows, step into the light and speak</span>','<span class="dos-bold">Storing resentment as fuel ·</span> <span class="dos-italic">Scorpio memory is strong, but selective forgetting is a higher-level skill</span>','<span class="dos-bold">Silent treatment to those close to you ·</span> <span class="dos-italic">They genuinely don\'t know why you\'re upset if you don\'t say it</span>','<span class="dos-bold">Digging into what your ex is up to ·</span> <span class="dos-italic">Scorpio curiosity applied elsewhere could change the world</span>'],
    ['<span class="dos-bold">Leaving without a power bank ·</span> <span class="dos-italic">Freedom matters, but a dead phone is scarier</span>','<span class="dos-bold">Making grand proclamations ·</span> <span class="dos-italic">Make one you can actually keep — save the rest for next time</span>','<span class="dos-bold">Lecturing a table full of people ·</span> <span class="dos-italic">Sagittarius principles are solid but let others figure it out themselves today</span>','<span class="dos-bold">Maxing out your credit card to travel ·</span> <span class="dos-italic">Poetry and faraway places matter, but so does next month\'s bill</span>','<span class="dos-bold">Saying yes to eight dinner invitations at once ·</span> <span class="dos-italic">Sagittarius is popular but has only one body</span>','<span class="dos-bold">Arguing endlessly ·</span> <span class="dos-italic">Winning the debate but losing the friend — not worth it</span>'],
    ['<span class="dos-bold">Making work your entire life ·</span> <span class="dos-italic">Capricorn ambition is strong, but save one hour for yourself today</span>','<span class="dos-bold">Setting a massive year-long goal ·</span> <span class="dos-italic">Set one that goes to month-end first — let time handle the rest</span>','<span class="dos-bold">Using "I\'m not good enough" as an excuse not to start ·</span> <span class="dos-italic">You\'re way stronger than you think</span>','<span class="dos-bold">Treating everyone as a competitor ·</span> <span class="dos-italic">Capricorn\'s only competitor is yourself — ignore the others</span>','<span class="dos-bold">Burning the midnight oil to prove yourself ·</span> <span class="dos-italic">Capricorn isn\'t defined by hours worked, but by results</span>','<span class="dos-bold">Saying "I\'m fine" and carrying it all alone ·</span> <span class="dos-italic">Vulnerability isn\'t failure — even Capricorn can say "I\'m tired"</span>'],
    ['<span class="dos-bold">Rigidly following rules ·</span> <span class="dos-italic">Break one occasionally — Aquarius was born to break rules</span>','<span class="dos-bold">Dismissing everyone\'s opinions ·</span> <span class="dos-italic">Being different doesn\'t mean rejecting everything</span>','<span class="dos-bold">Emotional hermit mode ·</span> <span class="dos-italic">Even if you\'re an alien, you still need friends on Earth</span>','<span class="dos-bold">Posting a manifesto in the group chat then leaving ·</span> <span class="dos-italic">Dropping the mic and running isn\'t cool — stay and hear the response</span>','<span class="dos-bold">Over-performing uniqueness ·</span> <span class="dos-italic">Just be yourself — no need to prove you\'re "a special snowflake"</span>','<span class="dos-bold">Wearing loneliness like a medal ·</span> <span class="dos-italic">Aquarius uniqueness doesn\'t need isolation to prove itself</span>'],
    ['<span class="dos-bold">Over-empathizing ·</span> <span class="dos-italic">Take care of your own emotions before feeling sad for others</span>','<span class="dos-bold">Drowning in sad songs ·</span> <span class="dos-italic">Pisces sensitivity is a gift, not a self-destruct button</span>','<span class="dos-bold">Falling too fast for someone ·</span> <span class="dos-italic">Romance is lovely, but check if it\'s a mirage first</span>','<span class="dos-bold">Replacing action with daydreaming ·</span> <span class="dos-italic">Waking up in the same place — better to walk while dreaming</span>','<span class="dos-bold">Carrying everyone\'s emotions on your back ·</span> <span class="dos-italic">You\'re not a sponge — you don\'t have to absorb everything</span>','<span class="dos-bold">Escaping reality by binge-watching shows ·</span> <span class="dos-italic">Come up for air once in a while — reality has good stories too</span>']
  ];
  const signDonts = new Proxy({}, { get(target, prop) { const src = (window._lang && window._lang() === 'en') ? signDonts_EN : signDonts_ZH; return src[prop]; } });

  const dayDoBonus_ZH = [
    ['<span class="dos-bold">出门晒太阳 ·</span> <span class="dos-italic">补足一周缺失的维生素D</span>','<span class="dos-bold">睡到自然醒 ·</span> <span class="dos-italic">周日不设闹钟是基本人权</span>','<span class="dos-bold">逛公园或菜市场 ·</span> <span class="dos-italic">烟火气和光合作用二选一</span>','<span class="dos-bold">做一顿Brunch ·</span> <span class="dos-italic">仪式感不需要理由</span>','<span class="dos-bold">躺在沙发上什么也不干 ·</span> <span class="dos-italic">偶尔当一株植物也很幸福</span>'],
    ['<span class="dos-bold">摸鱼到午饭 ·</span> <span class="dos-italic">周一上午的核心生产力是咖啡的</span>','<span class="dos-bold">慢慢进入状态 ·</span> <span class="dos-italic">周一不冲刺，先热身</span>','<span class="dos-bold">冲一杯比平时贵的咖啡 ·</span> <span class="dos-italic">周一的自己需要被贿赂</span>','<span class="dos-bold">穿一套最喜欢的衣服 ·</span> <span class="dos-italic">周一的外在要撑起周一的内心</span>','<span class="dos-bold">列本周计划但不执行 ·</span> <span class="dos-italic">先写下来，周一的诚意到了就行</span>'],
    ['<span class="dos-bold">假装很忙 ·</span> <span class="dos-italic">演着演着就真的进入状态了</span>','<span class="dos-bold">洗手间多待五分钟 ·</span> <span class="dos-italic">那是周二唯一的私人空间</span>','<span class="dos-bold">认真挑午饭吃什么 ·</span> <span class="dos-italic">周二的午餐是今天的最高决策</span>','<span class="dos-bold">跟同事分享零食 ·</span> <span class="dos-italic">一块饼干换来一上午的和平</span>','<span class="dos-bold">把最难的事偷偷推进一点点 ·</span> <span class="dos-italic">然后奖励自己一杯奶茶</span>'],
    ['<span class="dos-bold">带薪发呆十分钟 ·</span> <span class="dos-italic">周三需要一个精神喘气口</span>','<span class="dos-bold">悄悄给同事翻白眼 ·</span> <span class="dos-italic">在心里翻就行，脸上保持微笑</span>','<span class="dos-bold">云旅行十分钟（搜机票不买） ·</span> <span class="dos-italic">周三的灵魂需要短暂出逃</span>','<span class="dos-bold">把耳机塞上沉浸式工作一小时 ·</span> <span class="dos-italic">周三的效率靠降噪耳机</span>','<span class="dos-bold">跟饭搭子吐槽五分钟 ·</span> <span class="dos-italic">周三的毒不吐不快</span>'],
    ['<span class="dos-bold">周四当周五过 ·</span> <span class="dos-italic">提前预支周末的快乐</span>','<span class="dos-bold">提前计划周末吃什么 ·</span> <span class="dos-italic">周四的盼头就是周末的菜单</span>','<span class="dos-bold">下班准时消失 ·</span> <span class="dos-italic">周四的加班是对周末的背叛</span>','<span class="dos-bold">把本周最烦的事画个句号 ·</span> <span class="dos-italic">哪怕只是心理上的</span>','<span class="dos-bold">对着镜子说"再撑一天" ·</span> <span class="dos-italic">周四的斗志靠自我催眠</span>'],
    ['<span class="dos-bold">把活推到下周 ·</span> <span class="dos-italic">周五下午的尊严就是不开始新任务</span>','<span class="dos-bold">下午三点开始摸鱼 ·</span> <span class="dos-italic">周五下午是周末的预告片</span>','<span class="dos-bold">约今晚的饭局 ·</span> <span class="dos-italic">周五晚上的快乐值得现在就安排</span>','<span class="dos-bold">整理桌面然后早早走人 ·</span> <span class="dos-italic">周五的仪式感是第一个走出办公室</span>','<span class="dos-bold">发自内心地笑 ·</span> <span class="dos-italic">周五的笑容不需要理由</span>'],
    ['<span class="dos-bold">睡到自然醒然后赖床一小时 ·</span> <span class="dos-italic">周六的床有磁力</span>','<span class="dos-bold">在城市里瞎逛 ·</span> <span class="dos-italic">不设导航，走到哪算哪</span>','<span class="dos-bold">吃一顿不赶时间的饭 ·</span> <span class="dos-italic">周六的餐桌不需要手机</span>','<span class="dos-bold">看一部一直想看的电影 ·</span> <span class="dos-italic">完整的两个小时，不暂停</span>','<span class="dos-bold">做一件你小时候喜欢做的事 ·</span> <span class="dos-italic">周六是回归童年的合法窗口</span>']
  ];
  const dayDoBonus_EN = [
    ['<span class="dos-bold">Get some sun ·</span> <span class="dos-italic">Replenish a week\'s worth of missing vitamin D</span>','<span class="dos-bold">Sleep in ·</span> <span class="dos-italic">No alarm on Sunday is a basic human right</span>','<span class="dos-bold">Stroll through a park or farmers market ·</span> <span class="dos-italic">Pick between fresh air and fresh produce</span>','<span class="dos-bold">Make brunch ·</span> <span class="dos-italic">Rituals don\'t need justification</span>','<span class="dos-bold">Lie on the couch doing absolutely nothing ·</span> <span class="dos-italic">Being a houseplant once in a while is bliss</span>'],
    ['<span class="dos-bold">Coast until lunch ·</span> <span class="dos-italic">Monday morning productivity is powered by coffee</span>','<span class="dos-bold">Ease into it ·</span> <span class="dos-italic">Monday is for warming up, not sprinting</span>','<span class="dos-bold">Make a slightly more expensive coffee ·</span> <span class="dos-italic">Monday you needs to be bribed</span>','<span class="dos-bold">Wear your favorite outfit ·</span> <span class="dos-italic">Your Monday exterior needs to prop up your Monday interior</span>','<span class="dos-bold">Write this week\'s plan but don\'t execute ·</span> <span class="dos-italic">Just write it down — Monday\'s sincerity is enough</span>'],
    ['<span class="dos-bold">Pretend to be busy ·</span> <span class="dos-italic">Fake it till you actually get into the zone</span>','<span class="dos-bold">Spend five extra minutes in the restroom ·</span> <span class="dos-italic">That\'s Tuesday\'s only private space</span>','<span class="dos-bold">Carefully choose your lunch ·</span> <span class="dos-italic">Tuesday lunch is the day\'s highest-level decision</span>','<span class="dos-bold">Share snacks with a coworker ·</span> <span class="dos-italic">One cookie buys a whole morning of peace</span>','<span class="dos-bold">Secretly push the hardest task forward just a bit ·</span> <span class="dos-italic">Then reward yourself with bubble tea</span>'],
    ['<span class="dos-bold">Zone out for ten paid minutes ·</span> <span class="dos-italic">Wednesday needs a mental breathing hole</span>','<span class="dos-bold">Secretly eye-roll at a coworker ·</span> <span class="dos-italic">Do it internally — keep the smile on your face</span>','<span class="dos-bold">Cloud-travel for ten minutes (search flights, don\'t buy) ·</span> <span class="dos-italic">Wednesday\'s soul needs a brief escape</span>','<span class="dos-bold">Headphones on, deep-focus work for one hour ·</span> <span class="dos-italic">Wednesday efficiency runs on noise cancellation</span>','<span class="dos-bold">Vent for five minutes with your lunch buddy ·</span> <span class="dos-italic">Wednesday toxins need releasing</span>'],
    ['<span class="dos-bold">Treat Thursday like Friday ·</span> <span class="dos-italic">Advance your weekend joy by one day</span>','<span class="dos-bold">Plan what to eat this weekend ·</span> <span class="dos-italic">Thursday\'s hope is the weekend menu</span>','<span class="dos-bold">Disappear right at quitting time ·</span> <span class="dos-italic">Thursday overtime is a betrayal of the weekend</span>','<span class="dos-bold">Put a period on this week\'s most annoying thing ·</span> <span class="dos-italic">Even if only mentally</span>','<span class="dos-bold">Look in the mirror and say "one more day" ·</span> <span class="dos-italic">Thursday\'s fighting spirit runs on self-hypnosis</span>'],
    ['<span class="dos-bold">Push tasks to next week ·</span> <span class="dos-italic">Friday afternoon dignity is not starting anything new</span>','<span class="dos-bold">Start coasting at 3 PM ·</span> <span class="dos-italic">Friday afternoon is the weekend\'s trailer</span>','<span class="dos-bold">Make dinner plans for tonight ·</span> <span class="dos-italic">Friday night joy deserves to be arranged right now</span>','<span class="dos-bold">Tidy your desk and leave early ·</span> <span class="dos-italic">Friday\'s ritual is being the first one out the door</span>','<span class="dos-bold">Smile from the heart ·</span> <span class="dos-italic">Friday smiles don\'t need a reason</span>'],
    ['<span class="dos-bold">Sleep in then laze in bed for an extra hour ·</span> <span class="dos-italic">Saturday beds have magnetic force</span>','<span class="dos-bold">Wander the city aimlessly ·</span> <span class="dos-italic">No GPS — go wherever your feet take you</span>','<span class="dos-bold">Eat a meal without rushing ·</span> <span class="dos-italic">Saturday dining tables don\'t need phones</span>','<span class="dos-bold">Watch a movie you\'ve been meaning to see ·</span> <span class="dos-italic">Two full uninterrupted hours</span>','<span class="dos-bold">Do something you loved as a kid ·</span> <span class="dos-italic">Saturday is a legal window back to childhood</span>']
  ];
  const dayDoBonus = new Proxy({}, { get(target, prop) { const src = (window._lang && window._lang() === 'en') ? dayDoBonus_EN : dayDoBonus_ZH; return src[prop]; } });
  const dayDontBonus_ZH = [
    ['<span class="dos-bold">为周一焦虑 ·</span> <span class="dos-italic">周日的夜晚属于沙发，不属于焦虑</span>','<span class="dos-bold">看工作消息 ·</span> <span class="dos-italic">手机里的工作群今天请静音</span>','<span class="dos-bold">宅家一整天不出门 ·</span> <span class="dos-italic">至少站门口吸一口新鲜空气</span>','<span class="dos-bold">把周末过成"补觉马拉松" ·</span> <span class="dos-italic">睡够就好，剩下的时间醒着活</span>','<span class="dos-bold">打开电脑处理"一件小事" ·</span> <span class="dos-italic">那件小事会吃掉你的整个下午</span>'],
    ['<span class="dos-bold">开会走神被抓 ·</span> <span class="dos-italic">周一的眼神涣散需要藏好</span>','<span class="dos-bold">冲动提离职 ·</span> <span class="dos-italic">周一早上想的都不算，周五再决定</span>','<span class="dos-bold">在工位唉声叹气 ·</span> <span class="dos-italic">周一的气场决定一周的气场</span>','<span class="dos-bold">一上来就啃最硬的骨头 ·</span> <span class="dos-italic">先做点简单的给自信充值</span>','<span class="dos-bold">跟同事吐槽周末过太快 ·</span> <span class="dos-italic">说出来只会更难受</span>'],
    ['<span class="dos-bold">连轴转不喝水 ·</span> <span class="dos-italic">你的肾脏不是永动机</span>','<span class="dos-bold">跟同事抬杠 ·</span> <span class="dos-italic">周二的胜负欲请用在别处</span>','<span class="dos-bold">午饭凑合吃 ·</span> <span class="dos-italic">中午那顿饭是周二唯一的温柔</span>','<span class="dos-bold">把三件事攒到一起做 ·</span> <span class="dos-italic">多线程的结局往往是每件都差一点</span>','<span class="dos-bold">在群里发长篇大论 ·</span> <span class="dos-italic">周二没人有耐心读超过三行</span>'],
    ['<span class="dos-bold">开会说真话 ·</span> <span class="dos-italic">周三的真诚要收着点，有些话在心里说就行</span>','<span class="dos-bold">主动揽活 ·</span> <span class="dos-italic">周三的善良容易被当软柿子</span>','<span class="dos-bold">忘了今天是周三 ·</span> <span class="dos-italic">周三就是周三，不是周五也不是周一</span>','<span class="dos-bold">把咖啡当水喝 ·</span> <span class="dos-italic">第三杯之后心脏会抗议</span>','<span class="dos-bold">跟老板对视超过三秒 ·</span> <span class="dos-italic">容易被分配到额外的工作</span>'],
    ['<span class="dos-bold">把情绪写脸上 ·</span> <span class="dos-italic">周四的表情管理要绷住</span>','<span class="dos-bold">熬夜加班 ·</span> <span class="dos-italic">周四熬的夜周五会报复你</span>','<span class="dos-bold">跟老板硬刚 ·</span> <span class="dos-italic">再忍一天，周四的冲动是魔鬼</span>','<span class="dos-bold">开始一个需要超过两天的事 ·</span> <span class="dos-italic">周四启动的事大概率拖到下周</span>','<span class="dos-bold">把不爽的事憋在心里发酵 ·</span> <span class="dos-italic">周四找一个安全的人倒一倒苦水</span>'],
    ['<span class="dos-bold">假装勤奋加班 ·</span> <span class="dos-italic">周五晚上的你在工位上灵魂已经走了</span>','<span class="dos-bold">答应下周一交付 ·</span> <span class="dos-italic">周五的承诺周一要还的</span>','<span class="dos-bold">推进新项目 ·</span> <span class="dos-italic">周五下午开始的任何事都是下周的事</span>','<span class="dos-bold">在下班前五分钟开始一个新任务 ·</span> <span class="dos-italic">这时候的效率为零</span>','<span class="dos-bold">把工作带回家 ·</span> <span class="dos-italic">周五晚上书包里的电脑不该被打开</span>'],
    ['<span class="dos-bold">想起工作 ·</span> <span class="dos-italic">周六的大脑不需要上班的回忆</span>','<span class="dos-bold">设闹钟早起 ·</span> <span class="dos-italic">周六的自然醒是神圣不可侵犯的权利</span>','<span class="dos-bold">刷工作群 ·</span> <span class="dos-italic">别人加班不等于你要加，周六请隐身</span>','<span class="dos-bold">把一整天安排满 ·</span> <span class="dos-italic">周六需要留白，像中国画一样</span>','<span class="dos-bold">报复性熬夜 ·</span> <span class="dos-italic">周六的夜晚也是夜晚，身体不计较"明天不上班"</span>']
  ];
  const dayDontBonus_EN = [
    ['<span class="dos-bold">Anxiety about Monday ·</span> <span class="dos-italic">Sunday night belongs to the couch, not anxiety</span>','<span class="dos-bold">Checking work messages ·</span> <span class="dos-italic">Mute those work group chats today</span>','<span class="dos-bold">Staying indoors all day ·</span> <span class="dos-italic">At least stand at the door and breathe fresh air once</span>','<span class="dos-bold">Turning the weekend into a sleep marathon ·</span> <span class="dos-italic">Sleep enough, then spend the rest awake and alive</span>','<span class="dos-bold">Opening your laptop for "one quick thing" ·</span> <span class="dos-italic">That one quick thing will eat your entire afternoon</span>'],
    ['<span class="dos-bold">Getting caught zoning out in a meeting ·</span> <span class="dos-italic">Hide that Monday thousand-yard stare</span>','<span class="dos-bold">Impulse-quitting your job ·</span> <span class="dos-italic">Monday morning thoughts don\'t count — decide on Friday</span>','<span class="dos-bold">Sighing loudly at your desk ·</span> <span class="dos-italic">Monday\'s energy sets the tone for the whole week</span>','<span class="dos-bold">Starting with the hardest task immediately ·</span> <span class="dos-italic">Do something easy first to recharge your confidence</span>','<span class="dos-bold">Complaining to coworkers about how fast the weekend went ·</span> <span class="dos-italic">Saying it out loud only makes it worse</span>'],
    ['<span class="dos-bold">Working nonstop without drinking water ·</span> <span class="dos-italic">Your kidneys are not a perpetual motion machine</span>','<span class="dos-bold">Arguing with coworkers ·</span> <span class="dos-italic">Channel Tuesday\'s competitive energy elsewhere</span>','<span class="dos-bold">Throwing together a sad lunch ·</span> <span class="dos-italic">That midday meal is Tuesday\'s only tenderness</span>','<span class="dos-bold">Bundling three things together ·</span> <span class="dos-italic">Multitasking usually means each one falls a bit short</span>','<span class="dos-bold">Posting walls of text in group chats ·</span> <span class="dos-italic">No one on Tuesday has the patience to read beyond three lines</span>'],
    ['<span class="dos-bold">Speaking unfiltered truth in meetings ·</span> <span class="dos-italic">Hold back Wednesday honesty — some things stay in your head</span>','<span class="dos-bold">Volunteering for extra work ·</span> <span class="dos-italic">Wednesday kindness gets mistaken for being a pushover</span>','<span class="dos-bold">Forgetting it\'s Wednesday ·</span> <span class="dos-italic">Wednesday is Wednesday — not Friday, not Monday</span>','<span class="dos-bold">Drinking coffee like water ·</span> <span class="dos-italic">Your heart will protest after the third cup</span>','<span class="dos-bold">Making eye contact with the boss for over three seconds ·</span> <span class="dos-italic">You\'ll get assigned extra work</span>'],
    ['<span class="dos-bold">Wearing your emotions on your face ·</span> <span class="dos-italic">Thursday facial expression management — hold the line</span>','<span class="dos-bold">Pulling an all-nighter ·</span> <span class="dos-italic">Thursday\'s late night will take revenge on your Friday</span>','<span class="dos-bold">Butting heads with the boss ·</span> <span class="dos-italic">Hold on one more day — Thursday impulses are the devil</span>','<span class="dos-bold">Starting something that takes more than two days ·</span> <span class="dos-italic">Things started on Thursday will probably drag into next week</span>','<span class="dos-bold">Letting resentment ferment silently ·</span> <span class="dos-italic">Find a safe person to vent to on Thursday</span>'],
    ['<span class="dos-bold">Pretending to work late diligently ·</span> <span class="dos-italic">Friday night your soul has already left your desk</span>','<span class="dos-bold">Promising Monday delivery ·</span> <span class="dos-italic">Friday promises come due on Monday</span>','<span class="dos-bold">Pushing new projects forward ·</span> <span class="dos-italic">Anything started Friday afternoon is next week\'s problem</span>','<span class="dos-bold">Starting a new task five minutes before clock-out ·</span> <span class="dos-italic">Efficiency at that moment is zero</span>','<span class="dos-bold">Bringing work home ·</span> <span class="dos-italic">The laptop in your Friday night bag should stay shut</span>'],
    ['<span class="dos-bold">Thinking about work ·</span> <span class="dos-italic">Saturday brains don\'t need work memories</span>','<span class="dos-bold">Setting an alarm to wake up early ·</span> <span class="dos-italic">Saturday natural waking is a sacred and inviolable right</span>','<span class="dos-bold">Checking work group chats ·</span> <span class="dos-italic">Others working late doesn\'t mean you have to — go invisible on Saturday</span>','<span class="dos-bold">Packing the entire day full ·</span> <span class="dos-italic">Saturday needs blank space, like a Chinese ink painting</span>','<span class="dos-bold">Revenge bedtime procrastination ·</span> <span class="dos-italic">Saturday night is still night — your body doesn\'t care that there\'s "no work tomorrow"</span>']
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
        html += '<br><span style="font-size:0.85em;color:#b8b8c8;">' + fpName + ' ' + a.aspect + ' ' + _L('本命','natal') + ' ' + a.planet.name + ' — ' + aspectDetail + '</span>';
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
    Venus: '感情和财务', Mars: '行动力和竞争意识', Jupiter: '成长和机遇', Saturn: '责任和规划'
  };
  const areaMap_EN = {
    Sun: 'self-expression & confidence', Moon: 'emotions & inner security', Mercury: 'communication & thinking',
    Venus: 'love & finances', Mars: 'drive & competitiveness', Jupiter: 'growth & opportunity', Saturn: 'responsibility & planning'
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
          html += '<p style="font-size:0.85em;color:#b0b0c0;text-indent:0;">↳ ' + (op?op.name:oid) + ad.name + _L('本命', ' natal ') + p.name + ' — ';
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

// ── Tab 2: Synastry ───────────────────────────────────────────────────────
function renderTab2() {
  try {
  let html = '';
  if (!chartData2) {
    html += '<div class="report-section">';
    html += '<p style="text-align:center;color:var(--text-dim);padding:40px;">请在"对方"区域填写第二个人的出生信息，然后点击"解读星盘"查看合盘分析。</p>';
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
    [{icon:'💬', platform:'微信', id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  html += '<p style="color:var(--text-dim);font-size:0.72em;margin-top:20px;">' + _t('consult.tip') + '</p>';
  html += '</div>';

  document.getElementById('tab7').innerHTML = html;
  } catch(e) { document.getElementById('tab7').innerHTML = '<p style=\"color:#c87070;padding:20px;\">' + _t('error.render') + e.message + '</p>'; console.error(e); }
}

// Global submit handler for consultation
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

// ═══════════════════════════════════════════════════════════════════════════
//  TAROT SYSTEM — 78 cards, 3-card & single-card spreads
// ═══════════════════════════════════════════════════════════════════════════

const MAJOR_ARCANA = [
  { id:0, name:"愚者", en:"The Fool", num:"0",
    up:"新的开始、冒险精神、天真无畏、信任宇宙的安排、无限可能",
    rev:"鲁莽冲动、缺乏计划、被欺骗、过于天真、逃避责任",
    love:"一段全新的恋情或感情阶段即将开始。放下过去的包袱，像愚者一样勇敢地跳入未知。保持开放和信任的心态。",
    career:"新的职业方向或创业机会正在召唤你。虽然前路未知，但宇宙在鼓励你大胆迈出第一步。相信直觉。",
    advice:"不要过度分析，不要等待完美时机。宇宙在邀请你迈出信任的一步，旅程本身就会教会你一切。",
    up_EN:"New beginnings, adventurous spirit, fearless innocence, trusting the universe's plan, infinite possibilities",
    rev_EN:"Reckless impulses, lack of planning, being deceived, naive to a fault, avoiding responsibility",
    love_EN:"A brand new romance or emotional phase is about to begin. Let go of past baggage and, like the Fool, leap bravely into the unknown. Stay open and trusting.",
    career_EN:"A new career direction or entrepreneurial opportunity is calling you. Though the path ahead is unknown, the universe encourages you to boldly take the first step. Trust your intuition.",
    advice_EN:"Don't over-analyze. Don't wait for the perfect moment. The universe invites you to take one trusting step — the journey itself will teach you everything." },
  { id:1, name:"魔术师", en:"The Magician", num:"I",
    up:"创造力、技能、自信、资源整合、心想事成的能力、意志力",
    rev:"欺骗、操纵、技能不足、资源浪费、计划受阻、自信缺失",
    love:"你拥有吸引理想伴侣的所有条件。主动展现真实的自己，用你的魅力和智慧去创造你想要的感情生活。",
    career:"现在是将想法转化为行动的最佳时机。你拥有所需的全部技能和资源。专注目标，展现专业能力。",
    advice:"你手中握有所有元素（风火水土），只需将它们整合并付诸行动。相信自己，你可以创造奇迹。",
    up_EN:"Creativity, skill, confidence, resourcefulness, the power to manifest, willpower",
    rev_EN:"Deception, manipulation, lack of skill, wasted resources, blocked plans, lack of confidence",
    love_EN:"You have all the conditions to attract your ideal partner. Take initiative in showing your true self — use your charm and wisdom to create the love life you desire.",
    career_EN:"Now is the best time to turn ideas into action. You have all the skills and resources you need. Focus on your goals and showcase your professional abilities.",
    advice_EN:"You hold all the elements (fire, water, air, earth) in your hands — now integrate them and take action. Trust yourself — you can create miracles." },
  { id:2, name:"女祭司", en:"The High Priestess", num:"II",
    up:"直觉、潜意识、内在智慧、神秘、等待、灵性觉醒",
    rev:"忽视直觉、隐藏的秘密被揭露、情感封闭、肤浅、内在混乱",
    love:"静下心来倾听内心的声音。有些答案不在外面，而在你内心深处。保持神秘感，不要过早暴露全部底牌。",
    career:"表面之下的信息比可见的部分更重要。相信你的直觉判断，特别是在涉及隐藏信息或未明朗的局面时。",
    advice:"向内探索，而非向外寻求答案。静坐、冥想、关注梦境。答案会在你准备好时自然浮现。",
    up_EN:"Intuition, subconscious, inner wisdom, mystery, waiting, spiritual awakening",
    rev_EN:"Ignoring intuition, hidden secrets revealed, emotional withdrawal, superficiality, inner chaos",
    love_EN:"Quiet your mind and listen to your inner voice. Some answers aren't out there — they're deep within you. Maintain some mystery — don't reveal all your cards too soon.",
    career_EN:"What lies beneath the surface is more important than what's visible. Trust your intuitive judgment, especially in situations with hidden information or uncertainty.",
    advice_EN:"Go inward rather than seeking answers outside. Sit in stillness, meditate, pay attention to your dreams. Answers will surface naturally when you are ready." },
  { id:3, name:"皇后", en:"The Empress", num:"III",
    up:"丰饶、母爱、创造力、自然、感官享受、滋养、繁荣",
    rev:"依赖过度、创造力枯竭、忽视自我照顾、物质匮乏、情感冷漠",
    love:"爱与温暖围绕着你。现在是享受关系中的甜蜜和滋养的时刻。单身者可能遇到一位温暖而富有魅力的人。",
    career:"创意项目将获得丰硕成果。适合从事与美、艺术、自然或照顾他人相关的工作。财务上也有增长的好兆头。",
    advice:"像皇后一样，允许自己去感受、去创造、去享受生活中的美好。照顾好你的身体和心灵，丰盛自然而来。",
    up_EN:"Abundance, motherly love, creativity, nature, sensual pleasure, nourishment, prosperity",
    rev_EN:"Over-dependence, creative depletion, neglecting self-care, material scarcity, emotional coldness",
    love_EN:"Love and warmth surround you. Now is a time to enjoy the sweetness and nourishment in your relationship. Singles may meet someone warm and charismatic.",
    career_EN:"Creative projects will bear abundant fruit. Well-suited for work related to beauty, art, nature, or caring for others. Financial growth is also on the horizon.",
    advice_EN:"Like the Empress, allow yourself to feel, to create, to enjoy the beauty of life. Take care of your body and soul — abundance follows naturally." },
  { id:4, name:"皇帝", en:"The Emperor", num:"IV",
    up:"权威、结构、领导力、稳定、规则、保护、野心",
    rev:"专制、滥用权力、不稳定、缺乏纪律、失控、软弱",
    love:"关系中需要建立清晰的边界和规则。寻找一位成熟稳重的伴侣，或在现有关系中承担更多的责任和承诺。",
    career:"职场中展现出领导才能。现在是为长远目标建立稳固基础的时候。遵守规则，建立秩序，逐步攀升。",
    advice:"用理性和纪律来组织你的生活。建立稳固的结构和规则，这看似枯燥，却是实现长远目标的基础。",
    up_EN:"Authority, structure, leadership, stability, rules, protection, ambition",
    rev_EN:"Tyranny, abuse of power, instability, lack of discipline, loss of control, weakness",
    love_EN:"Clear boundaries and rules need to be established in your relationship. Seek a mature and steady partner, or take on more responsibility and commitment in your current relationship.",
    career_EN:"Your leadership abilities are showing in the workplace. Now is the time to build a solid foundation for long-term goals. Follow the rules, establish order, and steadily rise.",
    advice_EN:"Organize your life with reason and discipline. Building solid structures and rules may seem tedious, but it's the foundation for achieving your long-term goals." },
  { id:5, name:"教皇", en:"The Hierophant", num:"V",
    up:"传统、信仰、教育、导师、精神指引、仪式、社会规范",
    rev:"挑战传统、反叛、不受教、过时观念、教条主义、盲目追随",
    love:"传统形式的感情或婚姻可能被提上日程。寻求长辈或专业人士的情感建议。遵循内心的道德准则。",
    career:"寻找导师或参加专业培训将大有裨益。遵循行业规范，在现有的体系内稳步前进比另辟蹊径更有效。",
    advice:"你不需要独自解决所有问题。寻找一位导师或加入一个有共同信念的团体。遵循经过验证的道路。",
    up_EN:"Tradition, faith, education, mentorship, spiritual guidance, ritual, social norms",
    rev_EN:"Challenging tradition, rebellion, unteachable, outdated ideas, dogmatism, blind following",
    love_EN:"Traditional forms of romance or marriage may be on the horizon. Seek relationship advice from elders or professionals. Follow your inner moral compass.",
    career_EN:"Finding a mentor or pursuing professional training will be highly beneficial. Follow industry norms — steady progress within the existing system is more effective than blazing a new trail.",
    advice_EN:"You don't need to solve everything alone. Find a mentor or join a community that shares your beliefs. Follow the proven path." },
  { id:6, name:"恋人", en:"The Lovers", num:"VI",
    up:"真爱、和谐、选择、价值观念、结合、吸引力、重要决定",
    rev:"分离、背叛、价值观冲突、错误选择、犹豫不决、不平衡",
    love:"爱情是当前的核心主题。无论是新恋情的开始还是现有关系的深化，都需要发自内心的真诚选择。",
    career:"面临重要的职业选择。选择你真正热爱和相信的方向，而不仅仅是看起来有利可图的。合作伙伴关系至关重要。",
    advice:"你正站在十字路口。这个选择反映了你的核心价值观。选择出于爱而非恐惧的道路。",
    up_EN:"True love, harmony, choice, values, union, attraction, important decision",
    rev_EN:"Separation, betrayal, value conflicts, wrong choice, indecision, imbalance",
    love_EN:"Love is the central theme right now. Whether it's the beginning of a new romance or deepening an existing relationship, what's needed is a sincere choice from the heart.",
    career_EN:"You face an important career decision. Choose the direction you truly love and believe in, not just what looks profitable. Partnership is crucial.",
    advice_EN:"You stand at a crossroads. This choice reflects your core values. Choose the path of love, not fear." },
  { id:7, name:"战车", en:"The Chariot", num:"VII",
    up:"胜利、决心、意志力、掌控、前进、克服困难、野心实现",
    rev:"失控、失败、攻击性、方向错误、被击败、缺乏信心",
    love:"感情方面你需要主动掌控方向盘。用决心和毅力克服感情中的障碍。异地恋或需要努力维持的关系将取得进展。",
    career:"竞争激烈的环境中你能脱颖而出。保持专注，用钢铁般的意志克服一切阻碍。胜利属于坚持到最后的人。",
    advice:"你已经拥有战胜一切困难的力量。关键在于驾驭内心各种冲突的力量，让它们朝同一个方向前进。",
    up_EN:"Victory, determination, willpower, control, forward momentum, overcoming obstacles, ambition fulfilled",
    rev_EN:"Loss of control, failure, aggression, wrong direction, defeated, lack of confidence",
    love_EN:"In love, you need to take the wheel. Use determination and perseverance to overcome obstacles in your relationship. Long-distance relationships or those requiring effort will make progress.",
    career_EN:"You can stand out in a competitive environment. Stay focused and overcome every barrier with iron will. Victory belongs to those who persist to the end.",
    advice_EN:"You already have the strength to overcome any challenge. The key is to harness the conflicting forces within you and make them move in the same direction." },
  { id:8, name:"力量", en:"Strength", num:"VIII",
    up:"内在力量、勇气、耐心、温柔的力量、驯服本能、自信",
    rev:"软弱、自我怀疑、失控、攻击性、缺乏耐心、被本能支配",
    love:"用温柔而非控制来赢得对方的心。你内心的力量足以化解感情中的矛盾。耐心和包容是最强大的武器。",
    career:"以柔克刚是当前的制胜策略。不需要大声证明自己，你的专业能力和内在沉稳自行会说话。",
    advice:"真正的力量不是征服外在，而是驯服内在的野兽。用爱和耐心对待自己的恐惧和不安。",
    up_EN:"Inner strength, courage, patience, gentle power, taming instincts, confidence",
    rev_EN:"Weakness, self-doubt, loss of control, aggression, impatience, ruled by instinct",
    love_EN:"Win their heart with gentleness, not control. Your inner strength is enough to dissolve conflicts in your relationship. Patience and acceptance are your most powerful weapons.",
    career_EN:"Overcoming hardness with softness is your winning strategy right now. You don't need to loudly prove yourself — your professional ability and inner calm speak for themselves.",
    advice_EN:"True strength is not conquering the external, but taming the beast within. Treat your fears and insecurities with love and patience." },
  { id:9, name:"隐士", en:"The Hermit", num:"IX",
    up:"内省、独处、智慧、寻求真理、指引、沉淀、深思熟虑",
    rev:"孤独、孤立、逃避、拒绝建议、迷失方向、偏执",
    love:"需要一段独处来反思自己在感情中真正的需求。不要为了填补空虚而匆忙进入关系。内在的圆满才能吸引健康的爱情。",
    career:"暂时从外界的喧嚣中抽离，重新审视你的职业方向。深造、进修或独立研究将带来突破性的洞见。",
    advice:"回归内心，在寂静中找到答案。你不需要更多的信息，你需要的是更深的洞察。独处不是逃避，是蓄力。",
    up_EN:"Introspection, solitude, wisdom, seeking truth, guidance, contemplation, deep reflection",
    rev_EN:"Loneliness, isolation, avoidance, rejecting advice, lost direction, stubbornness",
    love_EN:"You need a period of solitude to reflect on what you truly need in love. Don't rush into a relationship just to fill a void. Inner wholeness attracts healthy love.",
    career_EN:"Step back from the noise of the outside world and reexamine your career direction. Further study, training, or independent research will bring breakthrough insights.",
    advice_EN:"Return to your heart — find answers in silence. You don't need more information; you need deeper insight. Solitude is not avoidance — it's gathering strength." },
  { id:10, name:"命运之轮", en:"Wheel of Fortune", num:"X",
    up:"命运转变、机遇、周期、运气、转折点、命运的安排",
    rev:"厄运、阻力、失控、负循环、错失机会、命运受阻",
    love:"命运的齿轮正在转动。命中注定的相遇或重逢可能到来。接受感情中的周期性变化，把握当下出现的缘分。",
    career:"职场或事业即将迎来重要转折。好运正在靠近，但你需要主动抓住机会。命运的青睐往往伴随着准备。",
    advice:"你是命运之轮的一部分。好运和坏运都是暂时的，顺应变化而不是抵抗它。站在轮子的中心保持平衡。",
    up_EN:"Turn of fate, opportunity, cycles, luck, turning point, destiny's arrangement",
    rev_EN:"Bad luck, resistance, loss of control, negative cycles, missed opportunities, blocked fortune",
    love_EN:"The gears of fate are turning. A destined meeting or reunion may be approaching. Accept the cyclical nature of relationships and seize the connections that appear now.",
    career_EN:"An important turning point in your career is approaching. Good luck is near, but you need to take initiative to seize opportunities. Fortune favors the prepared.",
    advice_EN:"You are part of the Wheel of Fortune. Both good and bad luck are temporary — flow with change rather than resist it. Stand at the center of the wheel and keep your balance." },
  { id:11, name:"正义", en:"Justice", num:"XI",
    up:"公正、真相、因果、平衡、法律、决定、理性",
    rev:"不公、偏见、逃避后果、失衡、法律纠纷、错误判断",
    love:"感情中需要公平和诚实。现在做出的决定将产生影响深远的后果。真诚面对自己和伴侣，做出公正的选择。",
    career:"涉及合同、谈判或法律事务时需格外谨慎。你过去在职场中的行为将在此时得到公正的回报（好或坏）。",
    advice:"因果法则正在运作。诚实地评估自己的处境，为你的选择承担后果。公正不仅是对别人，也是对自己。",
    up_EN:"Fairness, truth, cause and effect, balance, law, decision, rationality",
    rev_EN:"Injustice, bias, avoiding consequences, imbalance, legal disputes, poor judgment",
    love_EN:"Fairness and honesty are needed in your relationship. Decisions made now will have far-reaching consequences. Face yourself and your partner honestly, and make a just choice.",
    career_EN:"Be especially careful with contracts, negotiations, or legal matters. Your past actions in the workplace will receive their fair return at this time — good or bad.",
    advice_EN:"The law of cause and effect is at work. Honestly assess your situation and take responsibility for your choices. Justice applies not only to others, but to yourself." },
  { id:12, name:"倒吊人", en:"The Hanged Man", num:"XII",
    up:"牺牲、换个角度看世界、放手、等待、灵性启迪、暂停",
    rev:"停滞、无谓的牺牲、固执己见、不愿放手、拖延、内耗",
    love:"在感情中可能需要做出某种牺牲或妥协。暂时放下一味追求的执念，转换视角看问题，会有新的领悟。",
    career:"当前可能需要暂停或延迟。这不是失败，而是让你换个角度审视自己的职业路径。耐心的等待自有其价值。",
    advice:"当你觉得被困住时，试着倒过来看世界。有时候最大的行动是停止行动，最大的控制是放手。",
    up_EN:"Sacrifice, seeing from a different angle, letting go, waiting, spiritual insight, pause",
    rev_EN:"Stagnation, needless sacrifice, stubbornness, unwilling to let go, procrastination, inner friction",
    love_EN:"You may need to make a sacrifice or compromise in your relationship. Temporarily release the obsession with pursuing — shift your perspective and new insights will emerge.",
    career_EN:"A pause or delay may be needed right now. This is not failure — it's an opportunity to reexamine your career path from a different angle. Patient waiting has its own value.",
    advice_EN:"When you feel stuck, try looking at the world upside down. Sometimes the greatest action is to stop acting, and the greatest control is to let go." },
  { id:13, name:"死神", en:"Death", num:"XIII",
    up:"转变、结束、新生、蜕变、放下过去、必然的改变",
    rev:"抗拒改变、停滞不前、恐惧结束、无法放手、腐朽",
    love:"一段旧有的感情模式必须结束，才能迎来新的可能。不要抗拒感情的转变和蜕变。结束是为了更好的开始。",
    career:"可能面临职业的重大转变——离职、转行或项目终结。这是蜕变的阵痛，新生的曙光紧随其后。",
    advice:"死神牌不是肉体的死亡，而是旧我的消融。放下那些已经不再服务你的人和事，让蜕变自然发生。",
    up_EN:"Transformation, ending, rebirth, metamorphosis, letting go of the past, inevitable change",
    rev_EN:"Resisting change, stagnation, fearing endings, unable to let go, decay",
    love_EN:"An old relationship pattern must end for new possibilities to emerge. Don't resist the transformation of your love life. Endings make way for better beginnings.",
    career_EN:"You may face a major career change — resignation, career shift, or project closure. This is the growing pain of transformation — the dawn of rebirth follows closely behind.",
    advice_EN:"The Death card is not physical death, but the dissolution of the old self. Let go of people and things that no longer serve you. Allow the transformation to unfold naturally." },
  { id:14, name:"节制", en:"Temperance", num:"XIV",
    up:"平衡、调和、耐心、中庸之道、融合、治愈、适应",
    rev:"失衡、过度、缺乏节制、冲突、不和谐、急躁",
    love:"感情需要双方的调和与融合。避免极端情绪，寻找两人之间的平衡点。细水长流的爱比轰轰烈烈更持久。",
    career:"工作中需要平衡多个方面——效率与质量、合作与独立。找到适合自己的节奏，不急不躁地稳步前进。",
    advice:"像炼金术师一样，将生活中不同的元素融合成黄金。避免极端，中庸之道是你当前的智慧之选。",
    up_EN:"Balance, moderation, patience, the middle way, fusion, healing, adaptation",
    rev_EN:"Imbalance, excess, lack of moderation, conflict, disharmony, impulsiveness",
    love_EN:"Relationships need blending and harmony from both sides. Avoid emotional extremes — find the balance point between you. A steady, flowing love lasts longer than dramatic passion.",
    career_EN:"Work requires balancing multiple dimensions — efficiency and quality, collaboration and independence. Find your own rhythm and move forward steadily, without rushing or anxiety.",
    advice_EN:"Like an alchemist, blend the different elements of your life into gold. Avoid extremes — the middle way is your wisest choice right now." },
  { id:15, name:"恶魔", en:"The Devil", num:"XV",
    up:"束缚、物质主义、欲望、执念、阴影面、上瘾、权力",
    rev:"挣脱束缚、觉醒、面对阴影、重获自由、戒除成瘾",
    love:"审视感情中是否存在不健康的依赖、控制或执念。也许是性吸引掩盖了真正的问题。诚实面对黑暗面才能解脱。",
    career:"你可能被困在一份只有金钱回报但没有热情的工作中。检查权力关系和职场中的操控。改变始于认清现实。",
    advice:"锁链其实是你自己戴上的。正视你的欲望和恐惧——它们控制你的程度远比你意识到的深。你可以选择自由。",
    up_EN:"Bondage, materialism, desire, obsession, the shadow self, addiction, power",
    rev_EN:"Breaking free, awakening, facing the shadow, regaining freedom, overcoming addiction",
    love_EN:"Examine whether unhealthy dependency, control, or obsession exists in your relationship. Perhaps sexual attraction is masking the real issues. Only by honestly facing the darkness can you find liberation.",
    career_EN:"You may be trapped in a job that offers only financial reward but no passion. Examine power dynamics and manipulation in the workplace. Change begins with seeing reality clearly.",
    advice_EN:"The chains are ones you put on yourself. Face your desires and fears — they control you far more than you realize. You can choose freedom." },
  { id:16, name:"高塔", en:"The Tower", num:"XVI",
    up:"突变、崩塌、启示、真相大白、打破幻象、觉醒",
    rev:"避免灾难、抗拒改变、延迟不可避免的崩塌、恐惧突破",
    love:"关系中一些虚假的稳定可能会突然崩塌。虽然痛苦，但真相的揭露会让你看清关系的本质。重建需要勇气。",
    career:"职场中可能出现突如其来的变动——被裁员、项目失败或组织重组。这是宇宙在推你走向更真实的道路。",
    advice:"高塔的崩塌是剧烈的，但它摧毁的只是那些本就不稳固的东西。在废墟之上，你可以建造真正坚固的新生。",
    up_EN:"Sudden change, collapse, revelation, truth exposed, shattering illusions, awakening",
    rev_EN:"Avoiding disaster, resisting change, delaying the inevitable collapse, fearing breakthrough",
    love_EN:"Some false stability in your relationship may suddenly collapse. Though painful, the revelation of truth will help you see the relationship's true nature. Rebuilding takes courage.",
    career_EN:"Sudden upheaval may occur in the workplace — layoffs, project failure, or organizational restructuring. The universe is pushing you toward a more authentic path.",
    advice_EN:"The Tower's collapse is violent, but it only destroys what was never solid to begin with. On the ruins, you can build something truly strong and new." },
  { id:17, name:"星星", en:"The Star", num:"XVII",
    up:"希望、疗愈、灵感、宁静、信念、重生、指引",
    rev:"绝望、失去信心、消极、灵感枯竭、自我否定、迷失",
    love:"感情中的疗愈和新生正在发生。过去的伤痛正在愈合，你将重新相信爱情的美好。保持希望，星光正指引着你。",
    career:"职业生涯迎来充满希望的新阶段。创意灵感源源不断，你的才华将被看见和欣赏。梦想正在变为现实。",
    advice:"暴风雨后的宁静星空。你在正确的道路上，宇宙正在用星光为你照亮前路。保持信念，疗愈自己。",
    up_EN:"Hope, healing, inspiration, serenity, faith, renewal, guidance",
    rev_EN:"Despair, loss of faith, negativity, creative drought, self-denial, feeling lost",
    love_EN:"Healing and renewal are unfolding in your love life. Past wounds are mending, and you will believe in the beauty of love again. Keep hope alive — the starlight is guiding you.",
    career_EN:"Your career is entering a hopeful new phase. Creative inspiration flows abundantly, and your talents will be seen and appreciated. Dreams are becoming reality.",
    advice_EN:"The calm, starry sky after the storm. You are on the right path — the universe is lighting your way with starlight. Keep the faith and heal yourself." },
  { id:18, name:"月亮", en:"The Moon", num:"XVIII",
    up:"幻觉、恐惧、潜意识、梦境、直觉、迷惑、未知",
    rev:"恐惧消散、真相浮现、克服焦虑、混乱结束、看清现实",
    love:"感情中可能存在误解、隐藏的信息或不明确的局面。不要被表面的幻象迷惑。信任直觉，但也要保持理性。",
    career:"职场中的某些事情可能并非表面看起来那样。谨慎行事，在信息不明确时避免重大决策。迷雾终将散去。",
    advice:"在月光下，一切都显得朦胧而不确定。你内心最深处的恐惧可能被放大——直面它们，你会发现它们只是影子。",
    up_EN:"Illusion, fear, the subconscious, dreams, intuition, confusion, the unknown",
    rev_EN:"Fear dissipating, truth emerging, overcoming anxiety, chaos ending, seeing reality clearly",
    love_EN:"There may be misunderstandings, hidden information, or unclear situations in your love life. Don't be fooled by surface illusions. Trust your intuition, but also stay rational.",
    career_EN:"Certain things in the workplace may not be what they seem. Proceed with caution, and avoid major decisions when information is unclear. The fog will eventually lift.",
    advice_EN:"Under the moonlight, everything appears hazy and uncertain. Your deepest fears may be magnified — face them directly, and you'll discover they are only shadows." },
  { id:19, name:"太阳", en:"The Sun", num:"XIX",
    up:"快乐、成功、活力、真理、童真、光明、成就",
    rev:"暂时的黯淡、缺乏自信、抑郁、延迟的快乐、悲观",
    love:"爱情中最灿烂的一张牌。热烈、真诚、充满快乐的感情。单身者将遇到阳光般温暖的人。关系中的一切都被温暖照亮。",
    career:"你正处于事业的阳光时刻。成就被认可，才华被赏识。享受这段黄金时期，同时用它来照亮更多人。",
    advice:"世界为你点亮了聚光灯。这是属于你的高光时刻——享受它，分享它，让内心的阳光照亮你走的每一步。",
    up_EN:"Joy, success, vitality, truth, childlike innocence, radiance, achievement",
    rev_EN:"Temporary dimming, lack of confidence, depression, delayed happiness, pessimism",
    love_EN:"The most radiant card in love. Warm, sincere, joy-filled romance. Singles will meet someone who shines like sunshine. Everything in the relationship is illuminated by warmth.",
    career_EN:"You are in the sunshine moment of your career. Your achievements are recognized, and your talents are appreciated. Enjoy this golden period while using it to brighten the path for others.",
    advice_EN:"The world has turned the spotlight on you. This is your moment to shine — enjoy it, share it, and let your inner sunshine illuminate every step you take." },
  { id:20, name:"审判", en:"Judgement", num:"XX",
    up:"觉醒、重生、召唤、清算、宽恕、灵魂的召唤、重大决定",
    rev:"逃避召唤、无法面对过去、悔恨、拒绝改变、自我审判",
    love:"旧情复燃或感情中的重大觉醒可能到来。听从内心最真实的召唤。原谅自己和对方过去的错误，迎接感情的再生。",
    career:"你正在被召唤到更高的职业舞台。也许是转行、创业或接受一个重要项目。这是你回应灵魂使命的时刻。",
    advice:"觉醒的号角已经吹响。你不必等到「完美的时机」，现在的你已经准备好了。回应召唤，获得灵魂的升华。",
    up_EN:"Awakening, rebirth, calling, reckoning, forgiveness, soul's calling, major decision",
    rev_EN:"Avoiding the call, unable to face the past, remorse, refusing change, self-judgment",
    love_EN:"An old flame may rekindle or a major awakening in love may arrive. Listen to your heart's truest calling. Forgive yourself and your partner for past mistakes, and welcome love's rebirth.",
    career_EN:"You are being called to a higher professional stage — perhaps a career change, entrepreneurship, or taking on an important project. This is your moment to answer your soul's mission.",
    advice_EN:"The trumpet of awakening has sounded. You don't need to wait for the 'perfect moment' — you are ready now. Answer the call and receive the elevation of your soul." },
  { id:21, name:"世界", en:"The World", num:"XXI",
    up:"完成、圆满、成就、旅行、整合、宇宙意识、达成",
    rev:"未完成、拖延、不圆满、封闭、延迟成功、缺乏整合",
    love:"一段感情可能迎来圆满的结局——无论是走向更深承诺还是和平完成一个周期。你正处于感情整合的完满时刻。",
    career:"一个重要的职业周期即将圆满结束。你已完成了一个阶段的所有功课，准备好进入下一个更大的舞台。",
    advice:"你完成了一个重要的生命循环。在进入下一个周期之前，停下来庆祝你的成就。你与宇宙和谐共舞。",
    up_EN:"Completion, fulfillment, achievement, travel, integration, cosmic consciousness, attainment",
    rev_EN:"Incompletion, procrastination, lack of fulfillment, closed-off, delayed success, lack of integration",
    love_EN:"A relationship may reach a fulfilling conclusion — whether moving toward deeper commitment or peacefully completing a cycle. You are at a moment of wholeness in love.",
    career_EN:"An important career cycle is nearing its successful completion. You have finished all the lessons of one phase and are ready to enter the next, greater stage.",
    advice_EN:"You have completed an important life cycle. Before entering the next one, pause and celebrate your achievements. You are dancing in harmony with the universe." }
];

const MINOR_SUITS = [
  {
    "suit": "权杖",
    "en": "Wands",
    "element": "火",
    "theme": "行动、创造力、热情、事业",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "一股强大的创造力与行动力正在你体内觉醒。这是一个全新的开始，灵感如同火焰般燃烧，推动你迈出勇敢的第一步。不要犹豫，宇宙在邀请你去开创属于自己的道路。",
        "rev": "创意的火花暂时被压抑，你可能感到动力不足或方向迷茫。新的计划遭遇延迟，不是时机未到就是你还没准备好。先整理内在的火焰，等风来再点燃。",
        "love": "一段充满激情的新恋情或现有关系的重大突破正在酝酿。主动表达你的热情和渴望，不要害怕展露真实的自己。",
        "career": "创业、新项目、跳槽的绝佳时机。你拥有开创性的能量，适合主动争取机会、提出创新方案。勇敢地做第一个点火的人。",
        "advice": "宇宙正在给你一张空白的画布。不要等待完美的时机——行动起来，让灵感在实践中成形。",
        "up_EN": "A powerful creative and active force is awakening within you. This is a brand new beginning — inspiration burns like a flame, pushing you to take the first brave step. Don't hesitate. The universe is inviting you to blaze your own trail.",
        "rev_EN": "The creative spark is temporarily suppressed. You may feel unmotivated or directionless. New plans are delayed — either the timing isn't right or you're not yet ready. Tend to your inner flame first, and wait for the wind to ignite it.",
        "love_EN": "A passionate new romance or a major breakthrough in an existing relationship is brewing. Take initiative in expressing your passion and desire. Don't be afraid to reveal your true self.",
        "career_EN": "An excellent time for entrepreneurship, new projects, or changing jobs. You possess pioneering energy — ideal for proactively seizing opportunities and proposing innovative solutions. Be brave enough to be the first to light the fire.",
        "advice_EN": "The universe is handing you a blank canvas. Don't wait for the perfect moment — take action and let inspiration take shape through practice."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你站在两个方向之间，手握选择的权力。对未来你已经有了初步的规划和设想，现在需要的是做出决定并坚定地朝前走。相信自己的远见。",
        "rev": "犹豫不决正在消耗你的能量。你可能在多个选项中徘徊，或者害怕做出错误的选择。这种优柔寡断本身就是一种决定——停滞不前。",
        "love": "在感情中面临抉择，也许是两段关系的取舍，也许是关系中某个重要决定的权衡。倾听你内心的声音，而非外界的意见。",
        "career": "职业规划的关键节点。你可能在考虑转行、跳槽或选择不同的发展方向。做好调研，然后大胆下注。",
        "advice": "选择没有绝对的对错。重要的是选择之后全力以赴。不要因为害怕选错而不选。",
        "up_EN": "You stand between two directions, holding the power of choice. You already have a preliminary plan and vision for the future — what's needed now is to make a decision and move forward with resolve. Trust your foresight.",
        "rev_EN": "Indecision is draining your energy. You may be wavering between multiple options, or afraid of making the wrong choice. This hesitation itself is a decision — to stand still.",
        "love_EN": "You face a choice in love — perhaps between two relationships, or weighing an important decision within your current one. Listen to your inner voice, not external opinions.",
        "career_EN": "A critical juncture in your career planning. You may be considering a career change, job switch, or different development path. Do your research, then boldly place your bet.",
        "advice_EN": "There is no absolute right or wrong in choices. What matters is giving your all once you've chosen. Don't let the fear of choosing wrong keep you from choosing at all."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "你的远见和规划正在结出初步的果实。事业上的拓展、合作的达成、项目的推进都呈现出良好的势头。这是向外探索、扩展版图的时刻。",
        "rev": "计划遇到了阻力，可能是外部环境的变动，也可能是你自身缺乏足够的远见。初期的小挫折不应让你退缩，调整策略而非放弃目标。",
        "love": "感情关系进入了新的发展阶段，可能是同居、订婚或者一起规划未来。关系的基础正在夯实，前景可期。",
        "career": "事业拓展期，适合开拓新市场、建立新合作、推进新项目。你的领导力和远见正在得到认可。",
        "advice": "初期的成功是信心的基石，不是骄傲的资本。保持远见的同时，脚踏实地地推进每一步。",
        "up_EN": "Your vision and planning are beginning to bear fruit. Business expansion, partnership agreements, and project progress all show strong momentum. This is a time to explore outward and expand your horizons.",
        "rev_EN": "Your plans have encountered resistance — perhaps from changes in the external environment, or a lack of sufficient foresight on your part. Early setbacks shouldn't make you retreat. Adjust your strategy rather than abandoning your goal.",
        "love_EN": "Your relationship has entered a new phase of development — perhaps cohabitation, engagement, or planning a future together. The foundation of the relationship is being solidified, and the prospects are promising.",
        "career_EN": "A period of career expansion — ideal for exploring new markets, forming new partnerships, and advancing new projects. Your leadership and vision are being recognized.",
        "advice_EN": "Early success is a foundation for confidence, not a reason for pride. Maintain your vision while grounding every step in practical action."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "经过努力，你迎来了稳定和收获的时刻。事业或生活的基础已经夯实，你可以安心地庆祝这来之不易的成就。这是一个享受成果、感受安全感的阶段。",
        "rev": "根基不稳，你可能感到焦虑不安。计划中的稳定被外部因素扰动，工作上出现变数。需要重新审视基础是否牢固。",
        "love": "感情关系进入稳定期，适合考虑同居、结婚或一起建立一个安稳的家。安全感和归属感是此时的核心主题。",
        "career": "职业发展进入平台期，基础已经奠定，可以享受一段安稳的时光。适合巩固已有的成果，而非激进扩张。",
        "advice": "稳固的根基是未来腾飞的跳板。珍惜现有的果实，同时为下一步的成长留出空间。",
        "up_EN": "Through hard work, you have arrived at a moment of stability and harvest. The foundation of your career or life has been solidified — you can peacefully celebrate these hard-won achievements. This is a phase of enjoying the fruits and feeling secure.",
        "rev_EN": "The foundation is unstable. You may feel anxious and unsettled. Planned stability has been disrupted by external factors, and work has encountered unexpected changes. Re-examine whether your foundation is truly solid.",
        "love_EN": "Your relationship has entered a stable period — ideal for considering cohabitation, marriage, or building a secure home together. Security and belonging are the core themes right now.",
        "career_EN": "Your career has reached a plateau phase — the foundation is laid, and you can enjoy a period of stability. This is suited for consolidating existing achievements rather than aggressive expansion.",
        "advice_EN": "A solid foundation is the springboard for future leaps. Cherish the fruits you've earned while leaving room for the next stage of growth."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "竞争和挑战正在激发你的斗志。这是一个需要你站出来争取自己立场的时刻。冲突本身不是坏事，它能让你更加清楚自己的边界和力量。",
        "rev": "你被冲突耗尽能量，可能想要逃避或妥协。内部的纷争或外部的压力让你感到孤立。有时退一步不是失败，而是战略调整。",
        "love": "感情中可能出现竞争或冲突，也许是第三者的介入，也许是双方观念的碰撞。面对挑战是关系中不可避免的成长过程。",
        "career": "职场竞争加剧，你可能面临来自同事或同行的压力。将竞争转化为动力，证明自己的实力和价值。",
        "advice": "挑战是成长的催化剂。不要逃避冲突——它会告诉你你的边界在哪里，你的力量有多大。",
        "up_EN": "Competition and challenges are igniting your fighting spirit. This is a moment that calls you to stand up and fight for your position. Conflict itself is not bad — it helps you see your boundaries and strength more clearly.",
        "rev_EN": "You're drained by conflict and may want to flee or compromise. Internal strife or external pressure is making you feel isolated. Sometimes stepping back isn't failure — it's a strategic adjustment.",
        "love_EN": "Competition or conflict may arise in your love life — perhaps the involvement of a third party, or a clash of values between you. Facing challenges is an inevitable part of growth in any relationship.",
        "career_EN": "Workplace competition is intensifying. You may face pressure from colleagues or peers. Turn competition into motivation and prove your strength and value.",
        "advice_EN": "Challenges are catalysts for growth. Don't run from conflict — it will show you where your boundaries lie and how strong you truly are."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "胜利的凯歌已经奏响。你的努力和坚持得到了认可和赞誉，可能是升职加薪、项目成功或公开表彰。这是属于你的荣耀时刻，请骄傲地接受掌声。",
        "rev": "失败或丢脸的经历让你备受打击。可能是傲慢导致了跌落，也可能是外界的不公正评价。无论哪种，都是一个谦逊的功课。",
        "love": "在感情中占据主动和优势，你的魅力和付出得到了伴侣的欣赏和回应。一段充满认可和赞誉的关系正在展开。",
        "career": "升职加薪、项目大获成功、行业认可——职业上的高光时刻。你的努力即将被看到并得到实质性的回报。",
        "advice": "胜利不仅是结果，更是你一路走来的印证。接受赞誉，但不要忘记那些曾经帮助过你的人。",
        "up_EN": "The song of victory has sounded. Your effort and persistence have earned recognition and praise — perhaps a promotion, salary increase, project success, or public commendation. This is your moment of glory. Accept the applause with pride.",
        "rev_EN": "An experience of failure or humiliation has dealt you a heavy blow. Perhaps arrogance led to a fall, or perhaps it's unfair judgment from others. Either way, it's a lesson in humility.",
        "love_EN": "You hold the initiative and advantage in love. Your charm and dedication are being appreciated and reciprocated by your partner. A relationship filled with recognition and mutual admiration is unfolding.",
        "career_EN": "Promotion, salary increase, major project success, industry recognition — a career highlight moment. Your efforts are about to be seen and tangibly rewarded.",
        "advice_EN": "Victory is not just the result — it's the validation of your entire journey. Accept the praise, but don't forget those who helped you along the way."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "你正在坚守自己的阵地，面对压力和反对毫不退缩。这是一场勇气的考验，你需要坚持自己的信念和立场。虽然孤立，但你的勇敢值得尊敬。",
        "rev": "力量的对比让你无法继续坚守，撤退或投降也许是最明智的选择。继续硬撑只会消耗更多。有时放下是一种更大的勇气。",
        "love": "在感情中捍卫自己的底线和原则。也许面临外界的反对或伴侣的挑战，但你清楚地知道什么是不可以妥协的。",
        "career": "职场中需要坚守自己的立场，可能面临不公平的对待或恶意的竞争。勇敢地为自己发声，捍卫你的权益。",
        "advice": "独自坚守的感觉是孤独的，但这也正是你证明自己信念的时刻。知道何时该坚守，也知何时该放手。",
        "up_EN": "You are holding your ground, refusing to retreat in the face of pressure and opposition. This is a test of courage — you need to stand firm in your beliefs and position. Though isolated, your bravery is worthy of respect.",
        "rev_EN": "The balance of power makes it impossible to keep holding on. Retreat or surrender may be the wisest choice. Continuing to tough it out will only drain you further. Sometimes letting go requires greater courage.",
        "love_EN": "Defend your bottom line and principles in your relationship. You may face external opposition or challenges from your partner, but you clearly know what is non-negotiable.",
        "career_EN": "You need to hold your ground in the workplace — you may face unfair treatment or malicious competition. Bravely speak up for yourself and defend your rights.",
        "advice_EN": "Standing alone feels lonely, but this is precisely the moment that proves your conviction. Know when to hold your ground, and know when to let go."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "事情正在快速推进！消息、旅行、变化接踵而至。停滞的局面即将被打破，你需要保持敏捷和开放的心态来迎接即将到来的变化。",
        "rev": "计划被推迟或取消，你期待的进展迟迟不来。这种停滞可能是外部的阻力，也可能是内在的恐惧在拖慢你的脚步。",
        "love": "感情中的变化来得很快——可能是突然的表白、关系的推进或者一起旅行。保持开放的心态迎接这段加速的旅程。",
        "career": "工作中节奏加快，可能有出差、调动或突发任务。保持灵活应变的能力，快速行动中蕴藏着新的机会。",
        "advice": "当风的翅膀展开时，不要犹豫。机会来得快也去得快，敏捷是此时最大的优势。",
        "up_EN": "Things are moving fast! News, travel, and changes are arriving one after another. The stagnation is about to be broken — you need to stay agile and open-minded to embrace the changes coming your way.",
        "rev_EN": "Plans are being postponed or canceled. The progress you've been waiting for is nowhere in sight. This stagnation may be due to external resistance or internal fear slowing you down.",
        "love_EN": "Changes in love are coming fast — perhaps a sudden confession, a relationship advancing, or traveling together. Keep an open heart to embrace this accelerated journey.",
        "career_EN": "The pace at work is quickening — there may be business trips, transfers, or unexpected tasks. Stay flexible and adaptable. New opportunities are hidden within the rapid pace.",
        "advice_EN": "When the wings of the wind unfurl, don't hesitate. Opportunities come and go quickly — agility is your greatest advantage right now."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "你在最后的坚守中展现出惊人的韧性。虽然疲惫，但你还没有放弃。这最后的坚持是最珍贵的品质，再坚持一步，黎明就在前方。",
        "rev": "筋疲力尽，你的能量已经透支。也许是时候承认自己需要休息和支援。过度防御会耗尽你最后的力量。",
        "love": "感情中的坚持到了关键时刻。你可能已经疲惫，但心中还有最后一丝信念。问问自己：这段关系值得你坚持到什么程度？",
        "career": "工作压力和责任已经让你接近极限。最后的冲刺需要顽强的意志力。但也请注意：过度消耗不是可持续的策略。",
        "advice": "韧性是你最宝贵的品质，但智慧在于知道何时该休息。保护好自己的能量，这场战役还很长。",
        "up_EN": "You are showing incredible resilience in your final stand. Though weary, you haven't given up. This last stretch of perseverance is your most precious quality. Hold on one more step — dawn is just ahead.",
        "rev_EN": "Exhausted and drained, your energy is overdrawn. Perhaps it's time to admit you need rest and support. Excessive defensiveness will deplete your last reserves.",
        "love_EN": "Your persistence in love has reached a critical moment. You may be tired, but a last flicker of faith remains in your heart. Ask yourself: to what extent is this relationship worth holding on to?",
        "career_EN": "Work pressure and responsibilities have pushed you near your limit. The final sprint requires tenacious willpower. But be aware: overexertion is not a sustainable strategy.",
        "advice_EN": "Resilience is your most precious quality, but wisdom lies in knowing when to rest. Protect your energy — this battle is a long one."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "负担沉重，责任如山。你可能正在承担超出常人的工作量或义务。虽然压力大，但你能够坚持完成。问题是：这些负担真的都是你的吗？",
        "rev": "你正在学会放下不属于你的重担，或者不再愿意一个人扛下所有。过度压力正在损害你的健康，放手是一种解脱。",
        "love": "感情中你承担了太多责任，也许是单方面付出太多。问问自己：这段关系是否在消耗你而非滋养你？",
        "career": "工作量大到难以承受，也许在同时处理多个项目或角色。你需要优先排序和合理分配，而不是一个人硬扛。",
        "advice": "负重前行不是能力的证明，而是边界的缺失。学会说'不'，将不属于你的担子放下。",
        "up_EN": "The burden is heavy and the responsibilities are mountainous. You may be shouldering more work or obligations than most people could bear. Though the pressure is great, you are able to carry through. The question is: do all these burdens truly belong to you?",
        "rev_EN": "You are learning to put down burdens that aren't yours, or you're no longer willing to carry everything alone. Excessive pressure is harming your health — letting go is a form of liberation.",
        "love_EN": "You are carrying too much responsibility in your relationship — perhaps giving far more than you receive. Ask yourself: is this relationship draining you rather than nourishing you?",
        "career_EN": "The workload is overwhelming — you may be handling multiple projects or roles simultaneously. You need to prioritize and delegate rather than shouldering everything alone.",
        "advice_EN": "Carrying a heavy load forward is not proof of capability — it's a sign of missing boundaries. Learn to say 'no' and put down burdens that aren't yours to carry."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "一个充满热情和好奇心的新开始。新的消息、新的学习机会或新的探索方向正在出现。保持开放和天真的心态，像孩子一样去探索未知。",
        "rev": "不成熟的表现可能会带来麻烦。你或许在接受坏消息，或者因为缺乏方向而四处乱撞。需要更多的耐心和规划。",
        "love": "一段轻松愉快的新恋情可能在萌芽，或者在现有关系中加入新鲜的元素。保持好奇心和探索欲，让感情充满活力。",
        "career": "收到新的工作消息或学习机会。也许是培训、新项目或者职业发展的新鲜方向。保持开放的接收状态。",
        "advice": "以赤子之心面对新的开始。你还不需要知道所有答案——好奇心是你最强的导航。",
        "up_EN": "An enthusiastic and curious new beginning. New messages, new learning opportunities, or new directions for exploration are emerging. Stay open and innocent — explore the unknown like a child.",
        "rev_EN": "Immaturity may cause trouble. You may be receiving bad news, or flailing around due to a lack of direction. More patience and planning are needed.",
        "love_EN": "A light and joyful new romance may be budding, or fresh elements are entering an existing relationship. Stay curious and exploratory — keep the relationship vibrant.",
        "career_EN": "New work-related messages or learning opportunities are arriving. Perhaps training, new projects, or fresh directions for career development. Stay in receiving mode with an open mind.",
        "advice_EN": "Face new beginnings with the heart of a child. You don't need to know all the answers yet — curiosity is your strongest navigator."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "冒险精神正在驱动你向前冲。行动迅速、激情满满，你对未来充满了无畏的勇气。这是一个冲锋的时刻，不要被恐惧拖慢脚步。",
        "rev": "鲁莽和缺乏耐心可能导致半途而废。你太急于看到结果而忽视了必要的准备和细节。慢下来，才不会翻车。",
        "love": "主动追求心仪的对象，或者在关系中注入冒险和激情。你是一个充满了浪漫勇气的骑士，但要小心不要太冲动。",
        "career": "事业上的冲锋期，适合大胆行动、主动争取。你有着充沛的行动力，但需要确保方向正确再出发。",
        "advice": "勇敢的骑士也需要地图。激情是翅膀，但计划是方向——两者兼顾才能飞得更远。",
        "up_EN": "An adventurous spirit is driving you forward. Swift action, boundless passion — you face the future with fearless courage. This is a moment to charge ahead. Don't let fear slow you down.",
        "rev_EN": "Recklessness and impatience may lead to giving up halfway. You're too eager to see results and have neglected necessary preparation and details. Slow down so you don't crash.",
        "love_EN": "Actively pursue the one you desire, or inject adventure and passion into your relationship. You are a knight full of romantic courage — but be careful not to be too impulsive.",
        "career_EN": "A charging period in your career — ideal for bold action and proactive pursuit. You have abundant drive, but make sure your direction is correct before you set off.",
        "advice_EN": "Even a brave knight needs a map. Passion gives you wings, but planning gives you direction — only with both can you fly far."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "自信和温暖是你最大的魅力。你能够独立领导他人，同时保持亲和力。这是一个展现个人魅力和领导力的阶段，用你的创造力照亮周围。",
        "rev": "专横或缺乏安全感正在损害你的影响力。你可能在过度控制或者因为不自信而退缩。找到内在的平衡是当前的功课。",
        "love": "在感情中展现出迷人的自信和温暖。你是一个充满魅力的伴侣，能够独立地爱而不依赖。吸引力自然散发。",
        "career": "职场中的领导力得到充分发挥。你自信而不咄咄逼人，能够激励团队又保持亲和力。职业女性力量的典范。",
        "advice": "真正的女王不需要证明自己的威严——她用存在本身影响一切。你身上的温暖与自信，是最好的武器。",
        "up_EN": "Confidence and warmth are your greatest charms. You can lead others independently while maintaining warmth and approachability. This is a phase for showcasing your charisma and leadership — illuminate those around you with your creativity.",
        "rev_EN": "Bossiness or insecurity is undermining your influence. You may be over-controlling or withdrawing due to a lack of self-confidence. Finding inner balance is your current lesson.",
        "love_EN": "You radiate captivating confidence and warmth in love. You are a charming partner, capable of loving independently without dependency. Your attraction emanates naturally.",
        "career_EN": "Your leadership abilities shine fully in the workplace. You are confident without being overbearing — able to inspire the team while maintaining approachability. A model of professional feminine power.",
        "advice_EN": "A true queen doesn't need to prove her majesty — she influences everything through her presence alone. The warmth and confidence within you are your greatest weapons."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "你正在展现成熟的领导力和远见卓识。这是一个负责任的领导者形象，能够做出果断的决定并带领他人向前。创造力与执行力兼备。",
        "rev": "权力被滥用或者因为急躁而做出错误的决定。你可能在过度专制或者因为缺乏耐心而失去追随者。",
        "love": "在感情中展现出成熟的担当和保护欲。你是一个负责任的伴侣，但也有着激情和创造力的一面。",
        "career": "事业上的顶峰状态。你具备企业家的远见和领导者的魄力，适合创业、管理或独立决策。",
        "advice": "真正的权力不是控制他人，而是引领方向。用你的远见照亮前路，让追随者自愿与你同行。",
        "up_EN": "You are demonstrating mature leadership and far-sighted vision. This is the image of a responsible leader — able to make decisive choices and lead others forward. Both creativity and execution are at your command.",
        "rev_EN": "Power is being abused, or wrong decisions are being made out of impatience. You may be overly autocratic or losing followers due to a lack of patience.",
        "love_EN": "You show mature responsibility and protective instincts in love. You are a dependable partner, yet you also have a passionate and creative side.",
        "career_EN": "The peak state of your career. You possess the vision of an entrepreneur and the decisiveness of a leader — ideal for starting a business, management, or independent decision-making.",
        "advice_EN": "True power is not controlling others — it's guiding the direction. Illuminate the path ahead with your vision, and let followers walk alongside you willingly."
      }
    ]
  },
  {
    "suit": "圣杯",
    "en": "Cups",
    "element": "水",
    "theme": "情感、爱情、直觉、关系",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "一股丰沛的情感能量正在涌出。新的恋情、深层的直觉、丰富的创造力都在此时被激活。敞开心扉，让爱的能量自由流动。",
        "rev": "情感被堵塞，你可能感到空虚或无法连接自己的内心。创意枯竭或感情受挫让你暂时封闭了自己。",
        "love": "一段全新的感情正在敲门。也许是命中注定的相遇，也许是现有关系的情感升华。打开心扉，爱正在流入你的生命。",
        "career": "创意工作者的灵感高峰期。适合开始新的创意项目、品牌策划或需要情感智慧的领域。让你的想象力自由流淌。",
        "advice": "爱是最强大的创造力。当你敞开心扉时，整个宇宙都会通过你表达自己。不要害怕情感的深度。",
        "up_EN": "Abundant emotional energy is flowing forth. New romance, deep intuition, and rich creativity are being activated right now. Open your heart and let the energy of love flow freely.",
        "rev_EN": "Emotions are blocked. You may feel empty or unable to connect with your inner self. Creative drought or romantic setbacks have caused you to temporarily shut down.",
        "love_EN": "A brand new romance is knocking at the door. Perhaps it's a destined meeting, or an emotional elevation of an existing relationship. Open your heart — love is flowing into your life.",
        "career_EN": "A peak period of inspiration for creative professionals. Ideal for starting new creative projects, brand strategy, or fields requiring emotional intelligence. Let your imagination flow freely.",
        "advice_EN": "Love is the most powerful creative force. When you open your heart, the entire universe expresses itself through you. Don't be afraid of emotional depth."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "两个灵魂之间的深度连接正在形成。这是两情相悦的和谐时刻，彼此看到对方最真实的样子。灵魂伴侣的相遇或现有关系的升华。",
        "rev": "关系中的裂痕正在扩大，信任在流失。分离或疏远可能是当前正在面对的课题。需要诚实地审视双方之间到底发生了什么。",
        "love": "爱情中最美好的牌之一——双向奔赴的深情。你和伴侣之间有着深刻的连接和理解，这是灵魂层面的相遇。",
        "career": "商业合作或团队协作的和谐期。找到志同道合的伙伴，合作关系将为你的事业带来深远的影响。",
        "advice": "真正的连接来自平等和相互尊重。爱不是占有，而是两个完整的灵魂选择并肩同行。",
        "up_EN": "A deep connection between two souls is forming. This is a harmonious moment of mutual affection, where each sees the other's truest self. A soulmate encounter or the elevation of an existing relationship.",
        "rev_EN": "The cracks in the relationship are widening, and trust is eroding. Separation or estrangement may be the issue you're facing. Honestly examine what has truly happened between you.",
        "love_EN": "One of the most beautiful cards in love — deep affection flowing in both directions. You and your partner share a profound connection and understanding — this is a meeting at the soul level.",
        "career_EN": "A harmonious period for business partnerships or team collaboration. Find like-minded partners — collaborative relationships will bring far-reaching impact to your career.",
        "advice_EN": "True connection comes from equality and mutual respect. Love is not possession — it's two whole souls choosing to walk side by side."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "友情和欢聚的快乐正在包围你。和朋友们的聚会、庆祝和分享带来心灵的滋养。这是社交和情感连接的丰收时刻。",
        "rev": "过度社交带来的疲惫，或者流言蜚语正在影响你的情绪。过多的聚会让你忽略了内在的需要。适当收敛，回归内心。",
        "love": "感情生活中的轻松和愉快正在增加。朋友聚会、约会或者轻松惬意的社交活动，让你在关系中感到快乐和满足。",
        "career": "同事关系的融洽期，团队合作和团建活动让工作氛围更加愉悦。创意和灵感在轻松的氛围中自由流动。",
        "advice": "快乐是用来分享的。在朋友中找到滋养和力量，但也不要忘记独处的重要性。",
        "up_EN": "The joy of friendship and celebration surrounds you. Gatherings with friends, celebrations, and sharing bring nourishment to the soul. This is a bountiful time for social and emotional connection.",
        "rev_EN": "Fatigue from excessive socializing, or gossip affecting your mood. Too many gatherings have made you neglect your inner needs. Pull back appropriately and return to your heart.",
        "love_EN": "Lightness and joy in your love life are increasing. Friend gatherings, dates, or relaxed social activities make you feel happy and content in your relationship.",
        "career_EN": "A period of harmonious colleague relationships — teamwork and group activities make the workplace atmosphere more pleasant. Creativity and inspiration flow freely in a relaxed environment.",
        "advice_EN": "Joy is meant to be shared. Find nourishment and strength in friends, but don't forget the importance of solitude."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "你正在经历情感上的沉淀和内在的冥想。表面的快乐不再满足你，你在寻找更深的意义和连接。这是一个内省和重新评估的阶段。",
        "rev": "倦怠和麻木让你对外界的邀请无动于衷。你可能正在错过重要的机会，因为你陷入了内心的死水。需要唤醒沉睡的感知力。",
        "love": "感情进入反思期。你也许在重新评估这段关系对你的意义，或者需要一些独处的时间来理清自己的感受。",
        "career": "对当前的工作产生了倦怠感，需要重新评估职业方向。适当的休息和反思比盲目努力更重要。",
        "advice": "安静不是空虚。在静默中，你才能听到内心最真实的声音。不要害怕停下来——这是重启的前奏。",
        "up_EN": "You are going through emotional contemplation and inner meditation. Surface-level happiness no longer satisfies you — you're searching for deeper meaning and connection. This is a phase of introspection and reevaluation.",
        "rev_EN": "Apathy and numbness have made you indifferent to external invitations. You may be missing important opportunities because you're stuck in inner stagnation. You need to awaken your dormant perception.",
        "love_EN": "Your love life has entered a period of reflection. You may be reevaluating what this relationship means to you, or you need some alone time to sort through your feelings.",
        "career_EN": "You feel a sense of burnout toward your current job and need to reassess your career direction. Proper rest and reflection are more important than blind effort.",
        "advice_EN": "Stillness is not emptiness. In silence, you can hear your heart's truest voice. Don't be afraid to pause — this is the prelude to a restart."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "失落和悲伤是此刻真实的感受，但请注意——在这失去的背后，希望的曙光已经出现。杯子没有完全倒下，你拥有的比你以为的多。",
        "rev": "你正在走出阴霾，开始接受现实并重建自己。虽然伤痛还在，但你已经能够看到前方的光亮。",
        "love": "感情中经历了失去或失望。但重要的是——你没有失去一切，留下的部分值得你珍惜。新的希望正在孕育。",
        "career": "职业上可能经历了挫折或损失，但这也是重新评估真正重要之事的时机。有些失去是在为更好的让路。",
        "advice": "当你只看到失去的两杯时，请回头看看——你还有三杯完好。悲伤是真实的，但希望也是。",
        "up_EN": "Loss and sorrow are real feelings in this moment, but take note — behind this loss, the light of hope has already appeared. The cups haven't all fallen — you have more than you think.",
        "rev_EN": "You are emerging from the gloom, beginning to accept reality and rebuild yourself. Though the pain still lingers, you can already see the light ahead.",
        "love_EN": "You've experienced loss or disappointment in love. But what matters is — you haven't lost everything. What remains is worth cherishing. New hope is being nurtured.",
        "career_EN": "You may have experienced setbacks or losses in your career, but this is also a time to reassess what truly matters. Some losses make way for something better.",
        "advice_EN": "When you can only see the two cups you've lost, look back — you still have three standing intact. The sadness is real, but so is the hope."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "怀旧的情绪将你带回过去。纯真的回忆、童年的影子、旧时的连接正在影响你做当下的选择。这不是逃避，而是从过去汲取智慧。",
        "rev": "你沉溺在过去无法前行。美好的回忆变成了逃避现实的借口。需要拔出被过去吸住的脚，回到当下的生活中来。",
        "love": "旧情复燃或回忆过往恋情的阶段。你也许在和旧人重新建立连接，或者在回忆中寻找对当下感情的启示。",
        "career": "过去的经验正在为你提供指引。也许在回归曾经热衷的领域，或者从以往的教训中找到了新的方向。",
        "advice": "回忆是甜美的，但它只是指向过去的箭头。不要让怀旧变成拒绝当下的理由。",
        "up_EN": "Nostalgia draws you back to the past. Innocent memories, shadows of childhood, and old connections are influencing your current choices. This is not escape — it's drawing wisdom from the past.",
        "rev_EN": "You're drowning in the past and unable to move forward. Sweet memories have become an excuse to escape reality. You need to pull your feet out of the past and return to the present.",
        "love_EN": "A phase of rekindling old flames or recalling past relationships. You may be reconnecting with someone from the past, or searching memories for insight about your current love life.",
        "career_EN": "Past experience is providing guidance. Perhaps you're returning to a field you once loved, or finding new direction from past lessons.",
        "advice_EN": "Memories are sweet, but they are arrows pointing backward. Don't let nostalgia become a reason to reject the present."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "你面对多种可能性，沉浸在白日梦和幻想中。美好的憧憬让你兴奋，但也需要分辨哪些是真正的机会，哪些只是幻影。",
        "rev": "幻梦破灭后的清醒时刻。你可能意识到自己一直在不切实际地幻想。虽然清醒有时残酷，但它给了你脚踏实地重新出发的机会。",
        "love": "感情中面临多种选择或诱惑，或者你对某段感情有太多不切实际的幻想。需要分辨真心和一时冲动。",
        "career": "职业发展中出现了多条可能的路径。白日梦的作用是激发愿景，但你需要将愿景与实际规划结合起来。",
        "advice": "幻想是创造力的翅膀，但地面上的行动才能让你真正飞起来。选择一条路，然后坚定地走下去。",
        "up_EN": "You face multiple possibilities, immersed in daydreams and fantasies. Beautiful visions excite you, but you also need to discern which are real opportunities and which are mere illusions.",
        "rev_EN": "A sobering moment after dreams have shattered. You may realize you've been indulging in unrealistic fantasies. Though waking up can be harsh, it gives you the chance to start fresh with both feet on the ground.",
        "love_EN": "You face multiple choices or temptations in love, or you have too many unrealistic fantasies about a certain relationship. You need to distinguish between genuine feelings and momentary impulses.",
        "career_EN": "Multiple possible paths have emerged in your career development. Daydreams serve to inspire vision, but you need to combine vision with practical planning.",
        "advice_EN": "Fantasy is the wings of creativity, but only action on the ground can truly make you fly. Choose one path, and walk it with determination."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "你决定离开熟悉的环境，去寻找更高的意义和更真实的自己。放下过去的安全感和舒适区，走向未知的旅程。这是勇敢者的选择。",
        "rev": "恐惧改变让你滞留在不满意的状态中。你知道该离开，但害怕未知让你动弹不得。停留的代价正在变得越来越大。",
        "love": "离开一段不再滋养你的感情。虽然不舍，但你知道继续下去只会消耗彼此。离开是为了更高的追求。",
        "career": "辞职、转行或离开熟悉的领域去探索新的方向。这是一个勇敢的决定，但也是被内心深处的高我召唤。",
        "advice": "当你不再属于脚下的这片土地时，离开就是最深的自我忠诚。未知并不可怕，停滞才可怕。",
        "up_EN": "You've decided to leave familiar surroundings to seek higher meaning and a truer version of yourself. Let go of past security and comfort zones, and embark on a journey into the unknown. This is the choice of the brave.",
        "rev_EN": "Fear of change keeps you stuck in an unsatisfying situation. You know you should leave, but fear of the unknown paralyzes you. The cost of staying is growing larger by the day.",
        "love_EN": "Leaving a relationship that no longer nourishes you. Though it's hard to let go, you know that continuing will only deplete both of you. Leaving is for a higher purpose.",
        "career_EN": "Resigning, changing careers, or leaving a familiar field to explore new directions. This is a brave decision, and one called forth by your inner higher self.",
        "advice_EN": "When you no longer belong to the ground beneath your feet, leaving is the deepest form of self-loyalty. The unknown is not what's frightening — stagnation is."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "深刻的满足感——你的情感需求正在得到满足。愿望正在实现，你感到内心充盈而喜悦。这是知足常乐的美好状态。",
        "rev": "虽然外在条件不错，但内心总感觉少了点什么。不满足感正在侵蚀你的幸福感。贪得无厌会让你看不到已经拥有的美好。",
        "love": "感情中的满足和幸福感。你正处于一段令人愉悦的关系中，内心的情感需求得到了回应和滋养。",
        "career": "职业上达到了一种满意的状态——也许是收入、成就感或工作氛围让你感到满足。享受当下的丰收。",
        "advice": "真正的富足不在于拥有更多，而在于感到自己已经足够。你此刻手中握着的，已经是很多人梦寐以求的。",
        "up_EN": "Deep satisfaction — your emotional needs are being fulfilled. Wishes are coming true, and you feel inner abundance and joy. This is the beautiful state of contentment.",
        "rev_EN": "Though external conditions look good, something still feels missing inside. A sense of dissatisfaction is eroding your happiness. Greed will prevent you from seeing the blessings you already have.",
        "love_EN": "Fulfillment and happiness in love. You are in a delightful relationship — your emotional needs are being met and nourished.",
        "career_EN": "You've reached a satisfying state in your career — perhaps it's the income, the sense of accomplishment, or the work atmosphere that brings you contentment. Enjoy this harvest.",
        "advice_EN": "True abundance is not about having more — it's about feeling that you already have enough. What you hold in your hands right now is what many people dream of."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "情感的圆满和家庭的幸福达到了顶峰。这是一个充满爱与和谐的阶段，你感到自己真正属于某个地方。家庭关系、亲密关系和内心的平和都达到了理想状态。",
        "rev": "家庭中的不和谐或关系的破裂让你感到失去了归属感。需要重新修复和家庭成员之间的连接。",
        "love": "感情关系达到了婚姻或家庭层面的圆满。这是建立一个温暖家庭的理想时期，情感承诺得到深化。",
        "career": "工作和家庭的平衡趋于完美。你也许在家族企业、居家办公或者团队中找到了一种归属感。",
        "advice": "情感的圆满是你一路走来所有选择的回报。好好享受这份幸福，同时也把爱传递出去。",
        "up_EN": "Emotional fulfillment and family happiness have reached their peak. This is a phase filled with love and harmony — you feel that you truly belong somewhere. Family relationships, intimacy, and inner peace have all reached an ideal state.",
        "rev_EN": "Disharmony in the family or broken relationships have left you feeling a loss of belonging. You need to repair the connections with your family members.",
        "love_EN": "Your romantic relationship has reached fulfillment at the marriage or family level. This is an ideal time to build a warm home — emotional commitment is deepening.",
        "career_EN": "The balance between work and family is approaching perfection. You may have found a sense of belonging in a family business, remote work, or within your team.",
        "advice_EN": "Emotional fulfillment is the reward for all the choices you've made along the way. Enjoy this happiness fully, and also pass the love forward."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "温柔的灵感和直觉信息正在流向你。一个情感上的新开始——可能是一段新的感情萌芽，或者创意灵感在你心中涌动。保持敏感和接收状态。",
        "rev": "情绪化的波动让你难以保持稳定。创意受阻或感情上的不成熟正在制造麻烦。需要有更多的自我觉察。",
        "love": "一段温柔的新恋情可能在萌芽。或者你收到了来自心仪对象的情感信号。保持接收的心态，但不要过度解读。",
        "career": "创意灵感的初期阶段，适合构思新方案或计划。你的直觉在工作中会发挥重要作用。",
        "advice": "敏感是一种超能力，但需要智慧来驾驭。保持心的敏锐，同时保持心智的清醒。",
        "up_EN": "Gentle inspiration and intuitive messages are flowing toward you. An emotional new beginning — perhaps a new romance budding, or creative inspiration stirring in your heart. Stay sensitive and receptive.",
        "rev_EN": "Emotional fluctuations are making it hard to stay stable. Creative blocks or emotional immaturity are causing trouble. Greater self-awareness is needed.",
        "love_EN": "A gentle new romance may be budding. Or you've received emotional signals from someone you're interested in. Stay receptive, but don't over-interpret.",
        "career_EN": "The early stage of creative inspiration — ideal for conceptualizing new plans or projects. Your intuition will play an important role at work.",
        "advice_EN": "Sensitivity is a superpower, but it needs wisdom to be wielded. Keep your heart sharp while keeping your mind clear."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "浪漫的追求者——你或你生活中的某人正在展示迷人的魅力和理想的爱情。举止优雅、充满激情，但需要确认这种热情是否持久。",
        "rev": "花心或不切实际的浪漫幻想正在浪费你的时间和感情。表面迷人的东西可能缺乏实质。需要警惕那些只说不做的人。",
        "love": "浪漫的追求期——你可能是追求者也可能是被追求者。爱情的氛围浓厚，但需要确认这不仅仅是瞬间的化学反应。",
        "career": "带着理想主义投入工作，适合需要创意和审美能力的领域。但需要注意不要因为理想化而忽视实际问题。",
        "advice": "浪漫是最美的糖衣，但持久的爱情需要更多——承诺、理解和共同的成长。",
        "up_EN": "A romantic pursuer — you or someone in your life is displaying captivating charm and idealized love. Elegant, passionate, but you need to confirm whether this enthusiasm will last.",
        "rev_EN": "Fickleness or unrealistic romantic fantasies are wasting your time and feelings. What looks charming on the surface may lack substance. Beware of those who only talk and never act.",
        "love_EN": "A period of romantic pursuit — you may be the pursuer or the pursued. The atmosphere of romance is strong, but you need to confirm this is more than just momentary chemistry.",
        "career_EN": "Bringing idealism to work — suited for fields requiring creativity and aesthetic ability. But be careful not to overlook practical issues due to idealization.",
        "advice_EN": "Romance is the sweetest sugar coating, but lasting love requires much more — commitment, understanding, and growing together."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "你正在展现出最高级的同理心和直觉力。像温柔的月亮一样，你能够滋养周围的人，同时保持着深刻的直觉洞察。情感智慧是你的超能力。",
        "rev": "情绪过度依赖他人，或者因为缺乏边界而感到疲惫。过度敏感让你失去了内在的中心。需要建立情感上的独立性。",
        "love": "在感情中展现出极高的情商和滋养力。你懂得如何爱人和被爱，是伴侣的精神港湾。",
        "career": "职场中的情感智慧得到发挥——也许是HR、心理咨询、创意或任何需要与人深度连接的领域。",
        "advice": "你不需要吸收所有人的情绪——共情不是同情。保持你的温柔，同时守护你的边界。",
        "up_EN": "You are displaying the highest level of empathy and intuition. Like a gentle moon, you can nourish those around you while maintaining profound intuitive insight. Emotional intelligence is your superpower.",
        "rev_EN": "Over-dependence on others emotionally, or exhaustion from lacking boundaries. Excessive sensitivity has caused you to lose your inner center. You need to establish emotional independence.",
        "love_EN": "You display high emotional intelligence and nurturing ability in love. You know how to love and be loved — you are a spiritual harbor for your partner.",
        "career_EN": "Your emotional intelligence is shining in the workplace — perhaps in HR, counseling, creative work, or any field requiring deep human connection.",
        "advice_EN": "You don't need to absorb everyone's emotions — empathy is not sympathy. Keep your gentleness while guarding your boundaries."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "情感上达到成熟的顶峰。你能够包容和理解他人，同时保持内在的稳定。艺术鉴赏力和情感智慧都处于最高水平。",
        "rev": "情感上的冷漠或者通过操纵他人的情绪来达到目的。压抑自己的情感表达，用理智的高墙隔绝内心。",
        "love": "感情中的成熟伴侣——你能够给予安全感和理解，是值得信赖的情感依托。",
        "career": "适合担任需要情感智慧和稳定性的领导角色。你的判断力兼具理智和情感的深度。",
        "advice": "真正的王者不是没有情感，而是能够驾驭情感的海洋而不被淹没。",
        "up_EN": "You have reached the peak of emotional maturity. You can accept and understand others while maintaining inner stability. Both artistic appreciation and emotional wisdom are at their highest level.",
        "rev_EN": "Emotional coldness, or manipulating others' emotions to achieve your goals. You're suppressing your emotional expression, using a high wall of rationality to isolate your heart.",
        "love_EN": "A mature partner in love — you can provide security and understanding, and are a trustworthy emotional anchor.",
        "career_EN": "Suited for leadership roles requiring emotional intelligence and stability. Your judgment combines the depth of both reason and emotion.",
        "advice_EN": "A true king is not one without emotions, but one who can navigate the ocean of emotions without being drowned by them."
      }
    ]
  },
  {
    "suit": "宝剑",
    "en": "Swords",
    "element": "风",
    "theme": "思想、沟通、挑战、真理",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "真理的利剑劈开了迷雾——一个清晰的洞见或突破性的想法正在降临。思维高度锐利，适合做重大决策。追求真相，不管它多不舒服。",
        "rev": "思维混乱，真相被遮蔽。你可能收到错误信息或者被自己的偏见蒙蔽。在做出重大决定前，先确认事实。",
        "love": "感情中需要坦诚沟通。也许是一个重要的对话即将发生，真相可能会刺破舒适的幻象，但长期来看是有益的。",
        "career": "突破性的想法或解决方案即将出现。清晰的思维和果断的沟通能力是你的利器。适合做重要决策。",
        "advice": "真相比舒适更珍贵。你此刻拥有看清事物本质的能力——不要放弃这个天赋。",
        "up_EN": "The sword of truth has cut through the fog — a clear insight or breakthrough idea is descending. Your mind is exceptionally sharp, ideal for making major decisions. Pursue the truth, no matter how uncomfortable.",
        "rev_EN": "Thinking is muddled, and the truth is obscured. You may be receiving wrong information or blinded by your own biases. Verify the facts before making any major decisions.",
        "love_EN": "Honest communication is needed in your relationship. Perhaps an important conversation is approaching — the truth may pierce comfortable illusions, but it is beneficial in the long run.",
        "career_EN": "A breakthrough idea or solution is about to emerge. Clear thinking and decisive communication are your sharpest tools. Ideal for making important decisions.",
        "advice_EN": "Truth is more precious than comfort. You have the ability right now to see through to the essence of things — don't give up this gift."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你正处在两难抉择的十字路口。两种选择各有优劣，让你陷入僵局。信息似乎都不够充分，需要更多的内心指引才能做出明智决定。",
        "rev": "错误的选择或逃避让你陷入了更深的困境。信息过载加重了焦虑，你可能已经做出了一个不明智的决定。",
        "love": "感情中的两难——两段关系的取舍，或者关系中某个无法回避的艰难选择。拖延只会让情况恶化。",
        "career": "职业选择的关键时刻。两份工作、两个方向，你需要权衡利弊做出决定。信息已经足够，不要再等。",
        "advice": "当理性无法抉择时，跟随你的直觉。平衡的假象不如一个坚定的选择重要。",
        "up_EN": "You stand at a crossroads of a difficult choice. Two options each have pros and cons, leaving you in a stalemate. Information seems insufficient — you need more inner guidance to make a wise decision.",
        "rev_EN": "A wrong choice or avoidance has pushed you into a deeper dilemma. Information overload is worsening your anxiety — you may have already made an unwise decision.",
        "love_EN": "A dilemma in love — choosing between two relationships, or an unavoidable difficult decision within your current one. Procrastination will only make things worse.",
        "career_EN": "A critical moment for career choice. Two jobs, two directions — you need to weigh the pros and cons and decide. You have enough information — don't wait any longer.",
        "advice_EN": "When reason can't decide, follow your intuition. The illusion of balance is less important than a firm decision."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "心碎、背叛、悲伤——这是宝剑牌组中最痛苦的一张。你的心正在经历一场暴雨。但请记住：这场风暴会过去，而你会比之前更强大。",
        "rev": "你正在从痛苦中恢复。虽然伤口还在隐隐作痛，但你已经能够释怀并向前看。治愈正在发生。",
        "love": "感情中的心碎——背叛、分离或深刻的失望。允许自己哀伤，但不要陷入自怜。时间是治愈的良药。",
        "career": "工作中可能经历了背叛或重大挫折。但这次痛苦会带给你重要的教训。有些人的离开是为了给你更好的让路。",
        "advice": "允许自己崩溃一会儿。悲伤不是软弱——它是你灵魂的暴雨，冲刷过后才会有彩虹。",
        "up_EN": "Heartbreak, betrayal, sorrow — this is the most painful card in the suit of Swords. Your heart is going through a storm. But remember: this storm will pass, and you will emerge stronger than before.",
        "rev_EN": "You are recovering from the pain. Though the wound still aches, you are already able to release and move forward. Healing is happening.",
        "love_EN": "Heartbreak in love — betrayal, separation, or profound disappointment. Allow yourself to grieve, but don't sink into self-pity. Time is the best medicine for healing.",
        "career_EN": "You may have experienced betrayal or a major setback at work. But this pain will bring you important lessons. Some people leave to make way for something better.",
        "advice_EN": "Allow yourself to break down for a moment. Sadness is not weakness — it's the storm of your soul, and only after it washes through can a rainbow appear."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "你需要彻底的休息和恢复。精神和身体的双重疲惫告诉你该暂停了。暂时从外界的纷扰中隐退，给自己充电的空间。",
        "rev": "焦躁不安让你无法好好休息。虽然身体躺在床上，但脑子还在高速运转。真正的休息不仅需要身体的静止，更需要心智的宁静。",
        "love": "感情中的冷静期。也许需要暂时的空间来整理自己的情绪和想法。距离不是疏远，而是为了更好地靠近。",
        "career": "工作上的倦怠需要被正视。强制性的休息比持续消耗更有效率。给自己放一个假，回来时你会更有力量。",
        "advice": "休息不是浪费时间，而是投资自己。在寂静中，你才能听到下一个阶段的召唤。",
        "up_EN": "You need complete rest and recovery. The dual exhaustion of mind and body is telling you to pause. Temporarily withdraw from the world's noise and give yourself space to recharge.",
        "rev_EN": "Restlessness prevents you from truly resting. Though your body lies in bed, your mind races at full speed. True rest requires not just physical stillness, but mental tranquility.",
        "love_EN": "A cooling-off period in your relationship. Perhaps you need temporary space to sort through your emotions and thoughts. Distance is not estrangement — it's for drawing closer in a better way.",
        "career_EN": "Workplace burnout needs to be acknowledged. Mandatory rest is more efficient than continuous depletion. Give yourself a break — you'll return with greater strength.",
        "advice_EN": "Rest is not wasting time — it's investing in yourself. Only in stillness can you hear the call of the next phase."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "你在冲突中可能落败了，但这只是一种消极的胜利——对方可能赢得并不光彩。评估这场冲突：你失去了什么？你又从中学到了什么？",
        "rev": "从冲突中学习和和解。你能够放下怨恨，看到冲突背后的教训。和解比胜利更有价值。",
        "love": "感情中的争执和冲突可能以你的不情愿让步而告终。问自己：赢不了的人是你，还是硬要赢的对方？",
        "career": "职场竞争中的挫折。同事或竞争者可能用不公平的方式胜出。不要降低自己的标准——实力终会被看到。",
        "advice": "有些胜利是带着苦味的。在冲突中保持自己的尊严比赢得争吵重要得多。",
        "up_EN": "You may have been defeated in this conflict, but it's a hollow victory for the other side — they may not have won honorably. Assess this conflict: what did you lose? And what did you learn from it?",
        "rev_EN": "Learning and reconciling from the conflict. You can let go of resentment and see the lesson behind the clash. Reconciliation is more valuable than victory.",
        "love_EN": "Arguments and conflicts in love may end with your reluctant concession. Ask yourself: is it you who can't win, or is it them who insists on winning at all costs?",
        "career_EN": "A setback in workplace competition. Colleagues or competitors may have won through unfair means. Don't lower your standards — your true ability will eventually be seen.",
        "advice_EN": "Some victories come with a bitter aftertaste. Maintaining your dignity in conflict is far more important than winning the argument."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "你正在离开困境，走向光明的彼岸。这是一个过渡时期，虽然身后还有未了之事，但你的船已经掉转了方向。新的开始正在地平线上显现。",
        "rev": "你被困在原地，拒绝改变。远离问题的机会就在眼前，但你的恐惧让你无法启航。需要看到更大的图景。",
        "love": "一段感情的过渡期——你正在从过去的伤痛中走出来，驶向新的情感风景。路途可能孤单，但方向是正确的。",
        "career": "职业转变的过渡期。你可能正在离开旧岗位、旧公司或旧行业，走向新的方向。这段路上的不确定性是暂时的。",
        "advice": "你不需要看到整条路才能启程，只需看到前面一步的亮光。过渡不是终点，而是抵达前的必经之路。",
        "up_EN": "You are leaving troubled waters behind and sailing toward brighter shores. This is a transitional period — though unfinished business remains behind you, your boat has already turned around. A new beginning is appearing on the horizon.",
        "rev_EN": "You're stuck in place, refusing to change. The opportunity to move away from the problem is right in front of you, but your fear prevents you from setting sail. You need to see the bigger picture.",
        "love_EN": "A transitional period in love — you are emerging from past pain and sailing toward new emotional landscapes. The journey may feel lonely, but the direction is correct.",
        "career_EN": "A transition period in your career. You may be leaving an old position, company, or industry, heading toward a new direction. The uncertainty on this path is temporary.",
        "advice_EN": "You don't need to see the entire road to set out — you only need to see the light one step ahead. Transition is not the destination — it's the necessary path before arrival."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "巧妙和灵活的策略正在发挥作用。你不需要从正面进攻——暗中的布局、借力打力、灵活的应对才是制胜之道。保持低调，让结果说话。",
        "rev": "诡计暴露或弄巧成拙。你的算计被他人识破了。需要重新审视策略，更诚实一些才能达成目标。",
        "love": "感情中需要一些微妙的策略——不是操纵，而是懂得何时该说、何时该等。暗恋或有秘密的感情关系。",
        "career": "职场需要灵活应对——不是所有事情都要硬碰硬。暗中准备、寻找盟友、等待最佳时机——这些比硬扛更有智慧。",
        "advice": "柔能克刚。不战而屈人之兵是最高级的战略。保持你的秘密武器，在关键时刻才亮出来。",
        "up_EN": "Clever and flexible strategy is working. You don't need a frontal assault — behind-the-scenes arrangements, using leverage, and adaptive responses are the path to victory. Keep a low profile and let the results speak for themselves.",
        "rev_EN": "Your schemes have been exposed or backfired. Your calculations have been seen through by others. Reexamine your strategy — greater honesty is needed to achieve your goals.",
        "love_EN": "Subtle strategy is needed in love — not manipulation, but knowing when to speak and when to wait. A secret crush or a clandestine relationship.",
        "career_EN": "The workplace requires flexible maneuvering — not everything should be confronted head-on. Preparing quietly, finding allies, waiting for the right moment — these are wiser than pushing through forcefully.",
        "advice_EN": "Softness overcomes hardness. Defeating the opponent without fighting is the highest strategy. Keep your secret weapons and reveal them only at the critical moment."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "你感到被困住了，但监狱的门其实是开着的。自我设限的想法让你看不到出路。重新评估你的假设，你的限制比你想象的要少得多。",
        "rev": "你正在释放自己，突破思维的牢笼。曾经的恐惧和限制正在被看清，你终于获得了自由思考的能力。",
        "love": "感情中的被困感——你或许觉得离不开一个人、一段关系，但实际上你比想象中更有选择。",
        "career": "职业上的无力感。你觉得自己别无选择，但其实是你选择了不选择。重新审视你的能力和市场价值。",
        "advice": "你唯一的监狱是你认为没有选择的那个想法。自由始于认知：你一直都有选择。",
        "up_EN": "You feel trapped, but the prison door is actually open. Self-limiting beliefs are blinding you to the way out. Reevaluate your assumptions — your limitations are far fewer than you imagine.",
        "rev_EN": "You are freeing yourself, breaking through the prison of your mind. The fears and limitations that once held you are being seen clearly — you have finally gained the ability to think freely.",
        "love_EN": "A feeling of being trapped in love — you may think you can't leave a person or a relationship, but in reality, you have more choices than you think.",
        "career_EN": "A sense of powerlessness in your career. You feel you have no options, but really you've chosen not to choose. Reevaluate your abilities and market value.",
        "advice_EN": "Your only prison is the belief that you have no choice. Freedom begins with recognition: you have always had a choice."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "焦虑和恐惧在深夜啃噬你的心。你可能被过度担忧、失眠和负面思维困扰。但请认清：绝大多数的恐惧只是头脑的虚构，现实远没有你想的那么糟。",
        "rev": "你终于能够释然——那些纠缠你许久的恐惧正在消散。学会放手和信任，噩梦终将过去。",
        "love": "感情中的焦虑不安——可能是对关系的不确定性、对伴侣忠诚的怀疑，或者是对自己被抛弃的恐惧。需要区分直觉和焦虑。",
        "career": "工作压力导致的身心疲惫。你可能在担心失业、犯错或被替代。但你的恐惧往往比现实更大。",
        "advice": "你恐惧的不是事实，而是你编造的故事。深呼吸，看看窗外——世界并没有崩塌。",
        "up_EN": "Anxiety and fear are gnawing at your heart in the dark of night. You may be plagued by excessive worry, insomnia, and negative thoughts. But recognize this: the vast majority of your fears are fabrications of the mind — reality is far less dire than you imagine.",
        "rev_EN": "You are finally able to find relief — the fears that have haunted you for so long are dissipating. Learn to let go and trust. The nightmare will eventually pass.",
        "love_EN": "Anxiety and unease in love — perhaps about the uncertainty of the relationship, doubts about your partner's loyalty, or fear of being abandoned. You need to distinguish between intuition and anxiety.",
        "career_EN": "Physical and mental exhaustion from work pressure. You may be worried about losing your job, making mistakes, or being replaced. But your fears are often bigger than the reality.",
        "advice_EN": "What you fear is not the facts — it's the stories you've made up. Take a deep breath, look out the window — the world has not collapsed."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "彻底的结束。痛苦的结局是不可避免的，但这也是触底反弹的时刻。你已经没什么可以失去了，从今往后只会好起来。",
        "rev": "拒绝结束带来持续的痛苦。你还在旧故事里挣扎，不接受已经结束的事实。放手是唯一的路。",
        "love": "一段感情的彻底终结。虽然痛苦，但结束意味着你可以重新开始。有些事到该结束的时候就是该结束了。",
        "career": "职业上的重大结束——离职、被裁或项目彻底终止。但结束不是失败，它是为新的机会腾出空间。",
        "advice": "有些结束不是惩罚，而是礼物。当一扇门关上时，别在走廊里站太久——转身看看窗户。",
        "up_EN": "A complete ending. The painful conclusion is inevitable, but this is also the moment of hitting bottom and bouncing back. You have nothing left to lose — from here on, it can only get better.",
        "rev_EN": "Refusing to end things brings ongoing suffering. You're still struggling in the old story, refusing to accept that it's over. Letting go is the only way.",
        "love_EN": "The definitive end of a relationship. Though painful, an ending means you can start anew. When something is time to end, it's time to end.",
        "career_EN": "A major ending in your career — resignation, layoff, or the complete termination of a project. But an ending is not failure — it's making space for new opportunities.",
        "advice_EN": "Some endings are not punishment, but gifts. When a door closes, don't stand in the hallway too long — turn around and look for a window."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "旺盛的求知欲和敏锐的观察力是你当前的特点。新信息正在汇集，保持警觉和开放的心态去接收。像侦探一样去探索你感兴趣的领域。",
        "rev": "八卦和不经思考的言论正在制造麻烦。信息泄露或轻信谣言可能伤害你关心的人。管好自己的嘴巴。",
        "love": "感情中的观察和试探期。你在收集关于心仪对象的信息，或者通过对话了解更多。保持敏锐但不要多疑。",
        "career": "学习新技能的时期。可能在参加培训、学习技术或者研究新的职业方向。保持好奇心。",
        "advice": "知识是宝剑，但智慧在于如何使用它。你的求知欲是天赋，但需要加上审慎才能带来真正的力量。",
        "up_EN": "A strong thirst for knowledge and sharp observational skills define you right now. New information is gathering — stay alert and open-minded to receive it. Explore your areas of interest like a detective.",
        "rev_EN": "Gossip and thoughtless remarks are causing trouble. Information leaks or credulously believing rumors may harm those you care about. Watch your mouth.",
        "love_EN": "A period of observation and testing in love. You're gathering information about the person you're interested in, or learning more through conversation. Stay sharp but don't become paranoid.",
        "career_EN": "A period of learning new skills. You may be in training, studying technology, or researching new career directions. Stay curious.",
        "advice_EN": "Knowledge is a sword, but wisdom lies in how you use it. Your thirst for knowledge is a gift, but it needs prudence to bring true power."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "你正在果敢地冲向真理的战场。言辞犀利、思维敏锐、行动迅速——你是一个不容小觑的对手。但记住：速度需要有方向才有意义。",
        "rev": "冲动的言论和好斗的姿态正在破坏关系。你可能说话太伤人、做事太急切。学会在说话前数到三。",
        "love": "感情中的冲突可能一触即发。你的言辞可能过于犀利，伤害到在乎的人。在表达不满时记得留有余地。",
        "career": "工作中需要果断决策和迅速行动。你的能力和态度都很强，但需注意不要用对抗代替沟通。",
        "advice": "最快的剑不一定是最好用的。真正的力量在于控制——知道何时出剑，更知道何时收剑。",
        "up_EN": "You are boldly charging into battle for the truth. Sharp-tongued, keen-minded, and swift in action — you are a formidable opponent. But remember: speed only matters when you have direction.",
        "rev_EN": "Impulsive remarks and a combative stance are damaging relationships. Your words may be too cutting, your actions too hasty. Learn to count to three before speaking.",
        "love_EN": "Conflict in love may be about to erupt. Your words may be too sharp and hurt those you care about. When expressing dissatisfaction, remember to leave room for reconciliation.",
        "career_EN": "Decisive decisions and swift action are needed at work. Your ability and attitude are strong, but be careful not to replace communication with confrontation.",
        "advice_EN": "The fastest sword is not necessarily the best to use. True power lies in control — knowing when to draw the sword, and even more, knowing when to sheathe it."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "独立的思考和清晰的判断是你最珍贵的品质。你能在复杂的局面中保持理性，同时不失人情味。这是智慧与沉着的结合。",
        "rev": "过于冷漠和批判——你在用自己的标准衡量一切。过度的理性让你失去了温度。偶尔示弱也是一种力量。",
        "love": "感情中的独立和理性——你不会为了感情失去自我，但也需要学习在关系中柔化你的边界。",
        "career": "职场中的明智决策者。你能在压力下保持冷静和判断力，是团队中最值得信赖的理性声音。",
        "advice": "智慧不只是知道什么是对的，更是在对的时候用对的方式说出来。",
        "up_EN": "Independent thinking and clear judgment are your most precious qualities. You can remain rational in complex situations without losing your humanity. This is the union of wisdom and composure.",
        "rev_EN": "Overly cold and critical — you are measuring everything by your own standards. Excessive rationality has cost you your warmth. Showing vulnerability is also a form of strength.",
        "love_EN": "Independence and rationality in love — you won't lose yourself for a relationship, but you also need to learn to soften your boundaries within one.",
        "career_EN": "A wise decision-maker in the workplace. You can remain calm and clear-headed under pressure, and are the team's most trusted voice of reason.",
        "advice_EN": "Wisdom is not just knowing what is right — it's saying it at the right time and in the right way."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "权威的智慧和公正的决断力正在你身上展现。你具备最高的逻辑思维能力和领导判断力。一个真正的智者和领袖。",
        "rev": "专制和冷酷——你正在用智慧作为武器去控制他人。过度强调逻辑而忽视情感，让你在人际关系中显得高高在上。",
        "love": "感情中展现出理性和智慧的掌控力。你能够帮助伴侣理清思绪，但不要让自己变成法官而非恋人。",
        "career": "职业生涯的智慧巅峰。你具备成为行业权威和资深专家的一切条件。你的判断被广泛尊重。",
        "advice": "真正的智慧是知道自己有局限。最伟大的君王不是从不犯错，而是能够听取逆耳之言。",
        "up_EN": "Authoritative wisdom and fair decisiveness are manifesting through you. You possess the highest capacity for logical thinking and leadership judgment. A true sage and leader.",
        "rev_EN": "Tyranny and coldness — you are using intellect as a weapon to control others. Over-emphasizing logic while neglecting emotion makes you seem aloof in interpersonal relationships.",
        "love_EN": "You demonstrate rational and wise control in love. You can help your partner sort through their thoughts, but don't let yourself become a judge instead of a lover.",
        "career_EN": "The wisdom peak of your career. You have all the conditions to become an industry authority and senior expert. Your judgment is widely respected.",
        "advice_EN": "True wisdom is knowing your own limitations. The greatest ruler is not one who never errs, but one who can listen to unwelcome advice."
      }
    ]
  },
  {
    "suit": "星币",
    "en": "Pentacles",
    "element": "土",
    "theme": "财富、工作、健康、物质",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "一扇财富和机遇的大门正在你面前打开。新的投资机会、收入来源或物质上的好运正在降临。脚踏实地去把握——这是你靠实力赢得的机会。",
        "rev": "错失良机或投资失利。财富的种子没有发芽，可能是因为土壤还没准备好。拖延或贪婪会让你错过窗口。",
        "love": "一段稳定且有物质基础的感情机会。金钱不是爱情的全部，但共同的财务目标能让关系更稳固。",
        "career": "职业上的黄金机会——跳槽、升职、创业或重大项目的启动。这是实质性的进步，不是画大饼。",
        "advice": "财富之门的钥匙一直在你手中。不要等待一个'完美'的时机——种下种子，然后耐心浇灌。",
        "up_EN": "A door of wealth and opportunity is opening before you. New investment opportunities, income streams, or material blessings are arriving. Stay grounded and seize them — this is an opportunity you've earned through your abilities.",
        "rev_EN": "Missed opportunities or investment losses. The seeds of wealth haven't sprouted, perhaps because the soil wasn't ready yet. Procrastination or greed may cause you to miss the window.",
        "love_EN": "A stable relationship opportunity with material foundations. Money isn't everything in love, but shared financial goals can make the relationship more solid.",
        "career_EN": "A golden career opportunity — job change, promotion, entrepreneurship, or launching a major project. This is substantive progress, not empty promises.",
        "advice_EN": "The key to the door of wealth has always been in your hand. Don't wait for a 'perfect' moment — plant the seed, then water it patiently."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你正在多个财务或工作任务之间巧妙地保持平衡。这是灵活调配资源的能力。像一个杂技演员一样，你能同时处理多项事务而不乱。",
        "rev": "财务失衡或分身乏术。你承担了太多，却没有足够的精力去做好每一件事。需要优先排序并学会拒绝。",
        "love": "感情和工作之间的平衡是当前的课题。你需要在爱情和生活中找到一个可持续的节奏。",
        "career": "同时在处理多个项目或收入来源。灵活性和适应力是你的优势，但也要防止过度分散精力。",
        "advice": "平衡不是静止的——它是在不断的微调中保持不倒下。欣赏自己已经做到的成就。",
        "up_EN": "You are skillfully maintaining balance between multiple financial or work tasks. This is the ability to flexibly allocate resources. Like a juggler, you can handle multiple matters simultaneously without dropping anything.",
        "rev_EN": "Financial imbalance or being stretched too thin. You've taken on too much without enough energy to do everything well. You need to prioritize and learn to say no.",
        "love_EN": "The balance between love and work is the current lesson. You need to find a sustainable rhythm between your relationship and your life.",
        "career_EN": "You're handling multiple projects or income sources at once. Flexibility and adaptability are your strengths, but guard against spreading yourself too thin.",
        "advice_EN": "Balance is not static — it's the constant fine-tuning that keeps you from falling. Appreciate what you've already achieved."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "团队合作正在结出硕果。你的专业技能得到认可，合作项目顺利推进。这是协作和共享成功的阶段。",
        "rev": "合作失败或技能不足导致项目受挫。也许你和团队的目标不一致，或者你需要进一步打磨自己的专业技能。",
        "love": "通过共同的兴趣或项目建立联系。一段建立在共同价值观和务实基础之上的关系。",
        "career": "职业认证、技能提升和团队合作的关键期。你的专业能力正在得到正式的认可。",
        "advice": "单打独斗成就有限。找到那些和你有共同愿景的人——合作能将你的能力放大数倍。",
        "up_EN": "Teamwork is bearing fruit. Your professional skills are being recognized, and collaborative projects are progressing smoothly. This is a phase of cooperation and shared success.",
        "rev_EN": "Failed collaboration or insufficient skills have set back the project. Perhaps your goals and the team's are misaligned, or you need to further hone your professional abilities.",
        "love_EN": "Building a connection through shared interests or projects. A relationship built on common values and a pragmatic foundation.",
        "career_EN": "A critical period for professional certification, skill enhancement, and teamwork. Your professional competence is receiving formal recognition.",
        "advice_EN": "Going it alone yields limited results. Find those who share your vision — collaboration can amplify your abilities many times over."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "财务基础稳固，储蓄在增加，你对物质资源的掌控力很强。这是经济安全感的建设期。但要注意：过度节省会变成吝啬。",
        "rev": "对金钱的控制欲过强——可能是吝啬或恐惧财务损失。抓住手中的钱不放，也拒绝了金钱的流通。",
        "love": "感情中可能过于注重物质安全而忽略了情感的流动。金钱上的控制欲也可能影响关系。",
        "career": "职业稳定，收入有保障。现在不适合冒险——先巩固已有的基础。但不要让安逸变成保守。",
        "advice": "财务安全是必要的，但金钱只是工具不是目的。你抓住的钱越多，能流动进来的就越少。",
        "up_EN": "Your financial foundation is solid, savings are growing, and you have strong control over material resources. This is a period of building economic security. But be careful: excessive frugality can become miserliness.",
        "rev_EN": "An excessive need to control money — perhaps miserliness or a fear of financial loss. Holding tightly onto your money also blocks its circulation.",
        "love_EN": "In love, you may focus too much on material security while neglecting emotional flow. Financial control issues can also affect the relationship.",
        "career_EN": "Your career is stable and your income is secure. Now is not the time for risk-taking — first consolidate your existing foundation. But don't let comfort become complacency.",
        "advice_EN": "Financial security is necessary, but money is only a tool, not the goal. The more money you clutch tightly, the less can flow in."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "财务困难或物质上的匮乏正在考验你。你可能感到被孤立或雪上加霜。但请看清：你周围的资源比你意识到的多——向外寻求帮助。",
        "rev": "你正在恢复，找到帮助和走出贫困的路径。境况正在好转，你不再是一个人。",
        "love": "感情中因为物质问题发生摩擦。财务方面的压力正在影响关系。记住你们是队友，不是对手。",
        "career": "职业或收入上的低谷期。但这只是暂时的——你的价值不因暂时的困难而降低。主动寻求支援。",
        "advice": "在最低落的时候，最难的是开口说'我需要帮助'。但你不需要一个人扛——伸出手。",
        "up_EN": "Financial difficulty or material scarcity is testing you. You may feel isolated or that troubles are piling on. But see clearly: there are more resources around you than you realize — reach out for help.",
        "rev_EN": "You are recovering and finding paths to help and lift yourself out of scarcity. The situation is improving, and you are no longer alone.",
        "love_EN": "Friction in love due to material issues. Financial pressure is affecting the relationship. Remember you are teammates, not opponents.",
        "career_EN": "A low point in your career or income. But this is only temporary — your value is not diminished by temporary hardship. Take the initiative to seek support.",
        "advice_EN": "At your lowest, the hardest thing is to say 'I need help.' But you don't have to carry it all alone — reach out your hand."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "慷慨的给予和资源的分享——你正处在能够帮助他人的位置上。也许是慈善捐助，也许是知识经验的分享。给出的都会以某种方式回来。",
        "rev": "在接受施舍的被动位置——权力的不对等让你不舒服。或者你有能力帮别人却在吝啬。",
        "love": "感情中的付出与接受达到了健康的平衡。你愿意为伴侣付出，也懂得接受对方的爱。",
        "career": "在工作中分享资源和机会，也许是在指导新人或回馈行业社区。善意的付出会扩大你的影响力。",
        "advice": "你给出的每一颗星币，都会在宇宙的账簿中刻下印记。真正的富有不是你拥有什么，而是你给出什么。",
        "up_EN": "Generous giving and sharing of resources — you are in a position to help others. Perhaps charitable donations, or sharing knowledge and experience. What you give will return to you in some form.",
        "rev_EN": "In a passive position of receiving charity — the power imbalance makes you uncomfortable. Or you have the ability to help others but are being stingy.",
        "love_EN": "A healthy balance of giving and receiving has been achieved in love. You are willing to give to your partner, and you also know how to receive their love.",
        "career_EN": "Sharing resources and opportunities at work — perhaps mentoring newcomers or giving back to the industry community. Generous giving will expand your influence.",
        "advice_EN": "Every coin you give leaves a mark in the universe's ledger. True wealth is not what you possess, but what you give."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "耐心等待你的投资和努力结出果实。这是一个评估进展的阶段——看看哪些已经成熟，哪些还需要更多时间。不急不躁的态度是最有价值的心态。",
        "rev": "对进展的焦虑让你失去了耐心。你急于看到结果，但这种急躁可能导致错误的判断。成长需要时间。",
        "love": "感情需要时间的浇灌——你不能催促一段关系的发展。耐心观察，看看这段关系是否值得继续投入。",
        "career": "长期职业投资的评估期。你之前种下的种子哪些快要收成了？哪些需要重新调整？",
        "advice": "种下一棵树最好的时间是十年前，其次是现在。有些成果需要时间——等待也是投资的一部分。",
        "up_EN": "Patiently wait for your investments and efforts to bear fruit. This is a phase of assessing progress — see what has matured and what still needs more time. A calm and unhurried attitude is your most valuable mindset.",
        "rev_EN": "Anxiety about progress has eroded your patience. You're eager to see results, but this impatience may lead to poor judgment. Growth takes time.",
        "love_EN": "Love needs time to grow — you cannot rush a relationship's development. Patiently observe and see if this relationship is worth continued investment.",
        "career_EN": "An assessment period for long-term career investments. Which seeds you planted earlier are nearly ready for harvest? Which ones need readjustment?",
        "advice_EN": "The best time to plant a tree was ten years ago. The second best time is now. Some results take time — waiting is part of the investment."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "勤奋和专注正在打磨你的技能。日复一日的努力虽然枯燥，但它是通向精通的唯一道路。你正在成为自己领域的高手。",
        "rev": "敷衍了事或缺乏动力的状态。你不投入，不思考，只是在走流程。这种状态持续下去会吞噬你的前途。",
        "love": "感情需要日复一日的用功——不是大张旗鼓的表白，而是每天的点滴关心和投入。",
        "career": "职业技能的精进期。适合学习新技能、考证、或者深度打磨专业能力。一万小时定律——投入就是你最大的竞争力。",
        "advice": "成功没有捷径。每天的微小进步，累积起来就是别人望尘莫及的高度。",
        "up_EN": "Diligence and focus are honing your skills. Day-after-day effort may be tedious, but it's the only path to mastery. You are becoming an expert in your field.",
        "rev_EN": "A state of going through the motions or lacking motivation. You're not invested, not thinking, just following the process. If this continues, it will consume your future.",
        "love_EN": "Love requires daily effort — not grand gestures, but small everyday care and investment.",
        "career_EN": "A period of refining professional skills. Ideal for learning new skills, getting certified, or deeply sharpening your professional abilities. The 10,000-hour rule — dedication is your greatest competitive edge.",
        "advice_EN": "There are no shortcuts to success. The tiny daily improvements accumulate into a height that others can only gaze up at from afar."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "独立和富足——你正在享受自己努力换来的成果。财务自由、专业技能被认可、生活品质优良。这是自给自足的丰盛状态。",
        "rev": "过度依赖他人的经济支持，或者因为挥霍无度而失去了之前积累的成果。需要重新建立财务独立。",
        "love": "感情中的独立和自信。你不需要依附于任何人来获得安全感——这本身就是一种魅力。",
        "career": "职业上的自给自足。你也许在自由职业、创业或达到了较高的专业级别。享受独立的状态。",
        "advice": "真正的富足是你能够独立地生活，优雅地给予，而不需要依赖任何人。你做到了。",
        "up_EN": "Independence and abundance — you are enjoying the fruits of your hard work. Financial freedom, recognized professional skills, excellent quality of life. This is the abundant state of self-sufficiency.",
        "rev_EN": "Over-dependence on others' financial support, or squandering what you previously accumulated through extravagance. You need to reestablish financial independence.",
        "love_EN": "Independence and confidence in love. You don't need to attach yourself to anyone to feel secure — this in itself is a form of attractiveness.",
        "career_EN": "Self-sufficiency in your career. You may be freelancing, running a business, or have reached a senior professional level. Enjoy this state of independence.",
        "advice_EN": "True abundance is being able to live independently and give gracefully, without needing to depend on anyone. You've achieved it."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "家族财富、遗产继承和长期的繁荣。你正在享受代代相传的成果，或者为自己家族的未来打下了坚实的基础。这是最长久的富足。",
        "rev": "家族纠纷或财富传承出现问题。继承权、遗产分配或家庭企业的矛盾让你既疲惫又无奈。",
        "love": "感情中考虑长远规划——婚姻、家庭、共同的财产和未来。你和伴侣正在为共同的家族打下基石。",
        "career": "事业进入长期稳定繁荣的阶段。你正在为退休、遗产或下一个世代积累资源。考虑更长远的布局。",
        "advice": "真正的遗产不是你留下的金钱，而是你这一生的作为对后世的影响。",
        "up_EN": "Family wealth, inheritance, and long-term prosperity. You are enjoying the fruits passed down through generations, or laying a solid foundation for your family's future. This is the most enduring form of abundance.",
        "rev_EN": "Family disputes or problems with wealth transfer. Conflicts over inheritance rights, estate distribution, or family business leave you both exhausted and helpless.",
        "love_EN": "Long-term planning in love — marriage, family, shared property, and future. You and your partner are laying the cornerstone for your shared family.",
        "career_EN": "Your career has entered a phase of long-term stability and prosperity. You are accumulating resources for retirement, legacy, or the next generation. Consider a longer-term strategy.",
        "advice_EN": "The true legacy you leave behind is not the money, but the impact your life's work has on future generations."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "务实的学习态度和对新技能的渴望。一个与金钱或职业相关的新机会正在萌芽——也许是实习、学徒或进修课程。",
        "rev": "懒散和缺乏上进心正在拖慢你。你不愿意为未来投资时间和精力，只想待在舒适区。",
        "love": "感情中的务实和默默付出。你可能在用实际行动而不是甜言蜜语来表达爱。",
        "career": "职业学习的起点——新的培训、技能课程或实习机会。这是打下基础的重要阶段。",
        "advice": "每一棵大树都是从一颗种子开始的。你现在学到的每一点知识，都是未来的财富。",
        "up_EN": "A pragmatic learning attitude and a thirst for new skills. A new opportunity related to money or career is budding — perhaps an internship, apprenticeship, or further study course.",
        "rev_EN": "Laziness and a lack of ambition are dragging you down. You're unwilling to invest time and energy in your future, preferring to stay in your comfort zone.",
        "love_EN": "Practicality and quiet dedication in love. You may be expressing your love through concrete actions rather than sweet words.",
        "career_EN": "The starting point of career learning — new training, skill courses, or internship opportunities. This is an important stage for laying the foundation.",
        "advice_EN": "Every great tree starts from a single seed. Every bit of knowledge you learn now is wealth for the future."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "踏实可靠和勤奋努力是你当前的特质。你在稳步前进，如一头勤恳的牛。虽然不快，但每一步都扎实。",
        "rev": "拖延和停滞正在消磨你的机会。你可能过于谨慎或缺乏野心，让自己在原地踏步。",
        "love": "感情中的务实和专一——你是一个值得信赖的伴侣。虽然不浪漫，但你用行动证明了你的承诺。",
        "career": "事业上稳步推进。虽然没有大起大落，但这种稳定和踏实是你长期发展的保障。",
        "advice": "慢不是缺点——只要方向正确，每一步都在靠近目的地。坚持你目前的步伐。",
        "up_EN": "Steadiness, reliability, and diligent effort define you right now. You are advancing steadily, like a hardworking ox. Not fast, but every step is solid.",
        "rev_EN": "Procrastination and stagnation are eroding your opportunities. You may be overly cautious or lacking in ambition, keeping yourself stuck in place.",
        "love_EN": "Pragmatism and loyalty in love — you are a trustworthy partner. Though not the most romantic, you prove your commitment through actions.",
        "career_EN": "Steady progress in your career. Though there are no dramatic ups and downs, this stability and reliability are the foundation of your long-term development.",
        "advice_EN": "Slowness is not a flaw — as long as the direction is correct, every step brings you closer to the destination. Keep your current pace."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "务实而温暖的财富管理者和滋养者。你不仅能够照顾好自己，还能滋养周围的人。实用的智慧加上丰盛的心态是你最大的财富。",
        "rev": "过度物质的倾向让你忽视了情感和精神的需要。可能因为过度消费或财务管理不善。",
        "love": "感情中的务实担当——你既能够给予伴侣物质上的安全感，又能用实际的行动表达爱。",
        "career": "职场中的实干家——你是团队中最可靠的那个人。财务管理和资源调配是你的强项。",
        "advice": "真正的丰盛是物质与精神的平衡。你拥有的不只是星币，更是滋养他人的能力。",
        "up_EN": "A pragmatic yet warm wealth manager and nurturer. You can not only take care of yourself, but also nourish those around you. Practical wisdom combined with an abundant mindset is your greatest asset.",
        "rev_EN": "An overly materialistic tendency has made you neglect emotional and spiritual needs. This may be due to excessive spending or poor financial management.",
        "love_EN": "A pragmatic pillar in love — you can give your partner material security while also expressing love through practical actions.",
        "career_EN": "A doer in the workplace — you are the most reliable person on the team. Financial management and resource allocation are your strengths.",
        "advice_EN": "True abundance is the balance between the material and the spiritual. What you possess is not just coins, but the ability to nourish others."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "财富和商业智慧的高度。你具备卓越的理财能力和商业头脑，是财富的大师。稳健和远见兼具，你正在进行大手笔的布局。",
        "rev": "贪婪和物质主义——你在用金钱的价值衡量一切。权力的腐败让你忘记了财富的真正意义。",
        "love": "感情中提供坚实的物质基础和安全感。但不要以为用钱可以买到一切——情感需要用心，不需要用钱。",
        "career": "商业和财富领域的巅峰。你具备企业家的远见和实力，适合大项目投资和资产管理。",
        "advice": "你是财富的主人，不是奴隶。真正的国王用财富编织未来，而不是被它编织。",
        "up_EN": "The height of wealth and business wisdom. You possess exceptional financial management ability and business acumen — a master of wealth. Both steady and visionary, you are making large-scale strategic moves.",
        "rev_EN": "Greed and materialism — you are measuring everything by monetary value. The corruption of power has caused you to forget the true meaning of wealth.",
        "love_EN": "Providing a solid material foundation and sense of security in love. But don't think money can buy everything — emotions require heart, not cash.",
        "career_EN": "The pinnacle in business and wealth. You possess the vision and capability of an entrepreneur — suited for large-scale project investment and asset management.",
        "advice_EN": "You are the master of wealth, not its slave. A true king weaves the future with wealth, rather than being woven by it."
      }
    ]
  }
];

// Build full 78-card deck
function _cardT(card, field) {
  // Return language-appropriate card text for the given field (up/rev/love/career/advice)
  const isEn = window._lang && window._lang() === 'en';
  const enField = field + '_EN';
  if (isEn && card[enField]) return card[enField];
  return card[field] || '';
}

function buildDeck() {
  const deck = [];
  for (const card of MAJOR_ARCANA) {
    deck.push({ ...card, type:'major', id:`major_${card.id}` });
  }
  const ELEMENTS_EN = {火:'Fire',土:'Earth',风:'Air',水:'Water'};
  for (const suit of MINOR_SUITS) {
    for (const c of suit.cards) {
      deck.push({
        ...c, name: suit.suit + c.rank,
        type:'minor', suit:suit.suit, element:suit.element,
        suitTheme:suit.theme, id:`${suit.en}_${c.en}`,
        suit_en: suit.en, element_en: ELEMENTS_EN[suit.element] || suit.element,
        suitTheme_en: suit.theme_en || suit.theme
      });
    }
  }
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Keyword-based question analysis
function analyzeQuestion(question) {
  const q = question.toLowerCase();
  const themes = [];
  if (/爱|情|恋|对象|男朋友|女朋友|老公|老婆|伴侣|分手|复合|婚姻|结婚|单相思|暗恋|喜欢/.test(q)) themes.push('爱情');
  if (/工作|事业|职业|老板|同事|跳槽|面试|升职|加薪|辞职|创业/.test(q)) themes.push('事业');
  if (/钱|财|收入|投资|理财|经济|债务|贷款|工资/.test(q)) themes.push('财运');
  if (/家人|父母|孩子|亲戚|家庭|妈|爸|兄弟|姐妹/.test(q)) themes.push('家庭');
  if (/健康|身体|病|不舒服|累|疲惫|失眠/.test(q)) themes.push('健康');
  if (/学习|考试|学校|大学|读书|成绩|毕业/.test(q)) themes.push('学业');
  if (/朋友|社交|人际|圈子|闺蜜|兄弟|关系/.test(q)) themes.push('人际');
  if (/自己|迷茫|人生|方向|意义|目标|选择|决定|怎么办/.test(q)) themes.push('人生方向');
  return themes.length > 0 ? themes : ['综合'];
}

function interpretCard(card, isReversed, position, questionThemes) {
  const isEn = window._lang && window._lang() === 'en';
  const rev = isReversed;
  let reading = '';
  const name = card.name || `${card.suit}${card.rank}`;
  const cardLabel = isEn ? (card.en || `${card.suit_en||card.suit} ${card.en||card.rank}`) : name;

  if (card.type === 'major') {
    const meaning = rev ? _cardT(card,'rev') : _cardT(card,'up');
    reading += `<strong>${cardLabel}</strong> ${rev?('<span class="reversed-badge">'+_L('逆位','Reversed')+'</span>'):''} — ${meaning}。`;

    const primaryTheme = questionThemes[0];
    if (primaryTheme === '爱情' && _cardT(card,'love')) {
      reading += `<br><br>💕 <em>` + _L('感情方面：','Love: ') + `</em>${rev ? _L('逆位提示需要反思：','Reversed suggests reflection: ') : ''}${_cardT(card,'love')}`;
    } else if (primaryTheme === '事业' && _cardT(card,'career')) {
      reading += `<br><br>💼 <em>` + _L('事业方面：','Career: ') + `</em>${rev ? _L('逆位提示需要警惕：','Reversed warns caution: ') : ''}${_cardT(card,'career')}`;
    }
    if (_cardT(card,'advice')) {
      reading += `<br><br>🔮 <em>` + _L('宇宙建议：','Cosmic Advice: ') + `</em>${_cardT(card,'advice')}`;
    }
  } else {
    const meaning = rev ? (_cardT(card,'rev') || _cardT(card,'up') + _L('（逆位）',' (Reversed)')) : _cardT(card,'up');
    const elemLabel = (isEn ? (card.element_en||card.element) : card.element) + (isEn ? ' Element' : '元素');
    const themeLabel = isEn ? (card.suitTheme_en||card.suitTheme) : card.suitTheme;
    reading += `<strong>${cardLabel}</strong> ${rev?('<span class="reversed-badge">'+_L('逆位','Reversed')+'</span>'):''} <span style="color:var(--text-dim)">${elemLabel} · ${themeLabel}</span>`;
    reading += `<br><br>${meaning}`;

    const primaryTheme = questionThemes[0];
    if (primaryTheme === '爱情' && _cardT(card,'love')) {
      reading += `<br><br>💕 <em>` + _L('感情方面：','Love: ') + `</em>${_cardT(card,'love')}`;
    } else if (primaryTheme === '事业' && _cardT(card,'career')) {
      reading += `<br><br>💼 <em>` + _L('事业方面：','Career: ') + `</em>${_cardT(card,'career')}`;
    }
    if (_cardT(card,'advice')) {
      reading += `<br><br>🔮 <em>` + _L('宇宙建议：','Cosmic Advice: ') + `</em>${_cardT(card,'advice')}`;
    }
  }

  return reading;
}

function synthesizeReading(cards, positions, question, questionThemes) {
  const isEn = window._lang && window._lang() === 'en';
  let syn = '';
  const count = cards.length;
  const majorCards = cards.filter(c => c.type === 'major');
  const minorCards = cards.filter(c => c.type === 'minor');
  const reversedCards = cards.filter(c => c.isReversed);
  const hasMajor = majorCards.length;
  const hasReversed = reversedCards.length;

  syn += `<div class="tarot-synthesis">`;

  // ── 1. Opening ──
  syn += (isEn
    ? `<p>Regarding your question "<span class="highlight">${question}</span>", the spread reveals the following deeper insights:</p>`
    : `<p>关于你的问题「<span class="highlight">${question}</span>」，牌阵为你揭示了以下深层信息：</p>`);

  // ── 2. Major Arcana significance ──
  if (hasMajor === count) {
    syn += (isEn
      ? `<p>🔥 <strong>All Major Arcana</strong> — this is not about daily trivialities, but a major turning point at the level of destiny. The Universe is speaking directly to you. Every card is a milestone on your soul\'s journey. Take this reading very seriously.</p>`
      : `<p>🔥 <strong>全部为大阿卡纳</strong> — 这不是日常小事，而是命运层面的重要转折。宇宙在直接对你说话，每一张牌都是灵魂旅程中的一个里程碑。请格外重视这次解读。</p>`);
  } else if (hasMajor >= 2) {
    const majorNames = majorCards.map(c => isEn ? (c.en||c.name) : c.name).join('、');
    syn += (isEn
      ? `<p>🌟 <strong>${hasMajor} Major Arcana cards</strong> (${majorNames}) appearing together — this question goes far beyond daily trivialities. It touches the core themes of your life. The Major Arcana are soul teachers — their presence means you stand at an important point of growth.</p>`
      : `<p>🌟 <strong>${hasMajor}张大阿卡纳</strong>（${majorNames}）同时出现 — 这个问题远超日常琐事，它触及你生命中的核心课题。大阿卡纳是灵魂的导师，它们的出现意味着你正站在一个重要的成长节点上。</p>`);
  } else if (hasMajor === 1) {
    const mn = isEn ? (majorCards[0].en||majorCards[0].name) : majorCards[0].name;
    syn += (isEn
      ? `<p>✨ Major Arcana "${mn}" sets the soul-level tone for this reading. It is the core signal of the entire spread, with the remaining cards unfolding details around it.</p>`
      : `<p>✨ 大阿卡纳「${mn}」的出现，为这次解读定下了灵魂层面的基调。它是整个牌阵的核心信号，其余牌围绕它展开细节。</p>`);
  }

  // ── 3. Element analysis ──
  if (minorCards.length > 0) {
    const elemCount = { '火': 0, '水': 0, '风': 0, '土': 0 };
    minorCards.forEach(c => { if (elemCount[c.element] !== undefined) elemCount[c.element]++; });
    const elemEntries = Object.entries(elemCount).filter(([k, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const dominantElem = elemEntries[0];
    const domName = dominantElem[0];
    const domCount = dominantElem[1];

    const elemLabel = (e) => isEn ? ({火:'Fire',水:'Water',风:'Air',土:'Earth'})[e] : e;

    let elemMsg = '';
    if (domCount >= 2 && domCount === minorCards.length) {
      elemMsg = (isEn
        ? `All minor arcana in the spread are concentrated in a single element — <strong>${elemLabel(domName)}</strong>.`
        : `牌阵中所有小阿卡纳全部集中在一个元素——<strong>${domName}元素</strong>。`);
    } else if (domCount >= 2) {
      elemMsg = (isEn
        ? `The minor arcana are dominated by the <strong>${elemLabel(domName)} element</strong> (${domCount} cards)`
        : `小阿卡纳以<strong>${domName}元素</strong>为主导（${domCount}张）`);
      if (elemEntries.length > 1) {
        const rest = elemEntries.slice(1).map(([k, v]) => `${elemLabel(k)} (${v})`).join(', ');
        elemMsg += (isEn ? `, supplemented by ${rest}.` : `，辅以${rest}。`);
      }
    }

    if (elemMsg) {
      syn += `<p>⚖️ ${elemMsg}`;
      const elemReadings_ZH = {
        '火': '火元素主导意味着行动力、热情和创造力是当前的核心驱动力。你被推动着去主动出击、大胆表达。注意不要过于冲动。',
        '水': '水元素主导意味着情感、直觉和关系是当前的焦点。你的心在说话，感受比逻辑更重要。注意不要被情绪淹没。',
        '风': '风元素主导意味着思想、沟通和真理是当前的战场。清晰的思考和坦诚的交流是关键。注意不要过度分析和焦虑。',
        '土': '土元素主导意味着务实、稳定和物质是当前的主题。脚踏实地、耐心积累是最佳策略。注意不要陷入保守和僵化。'
      };
      const elemReadings_EN = {
        '火': 'Fire dominance means action, passion, and creativity are your core driving forces right now. You\'re being pushed to take initiative and express boldly. Be mindful not to be overly impulsive.',
        '水': 'Water dominance means emotion, intuition, and relationships are the current focus. Your heart is speaking — feelings matter more than logic. Be mindful not to be overwhelmed by emotions.',
        '风': 'Air dominance means thought, communication, and truth are your current battlefield. Clear thinking and honest exchange are key. Be mindful not to over-analyze and spiral into anxiety.',
        '土': 'Earth dominance means practicality, stability, and the material realm are the theme. Staying grounded and patiently accumulating is your best strategy. Be mindful not to become rigid or stuck.'
      };
      syn += `${isEn ? elemReadings_EN[domName] : elemReadings_ZH[domName]}</p>`;
    }

    // Missing element warning
    const presentElems = new Set(Object.keys(elemCount).filter(k => elemCount[k] > 0));
    const allElems = ['火', '水', '风', '土'];
    const missing = allElems.filter(e => !presentElems.has(e));
    if (missing.length >= 2) {
      const missReadings_ZH = { '火':'行动力的缺失', '水':'情感连接的缺失', '风':'理性思考的缺失', '土':'务实落地能力的缺失' };
      const missReadings_EN = { '火':'lack of action drive', '水':'lack of emotional connection', '风':'lack of rational thinking', '土':'lack of grounded practicality' };
      const missDesc = missing.map(e => isEn ? missReadings_EN[e] : missReadings_ZH[e]).join('、');
      const missLabels = missing.map(e => elemLabel(e)).join('、');
      syn += (isEn
        ? `<p>⚠️ The spread <strong>lacks ${missLabels}</strong> (${missDesc}). This is not a flaw — the cards are pointing out which energies you need to borrow from outside or consciously cultivate for your current lesson.</p>`
        : `<p>⚠️ 牌阵中<strong>缺少${missLabels}元素</strong>（${missDesc}）。这不是缺陷，而是牌阵在提醒你——当前课题中哪些能量是你需要从外部借力或有意识培养的。</p>`);
    }
  }

  // ── 4. Suit dominance ──
  if (minorCards.length >= 2) {
    const suitCount = {};
    minorCards.forEach(c => {
      const s = c.suit || '';
      suitCount[s] = (suitCount[s] || 0) + 1;
    });
    const dominantSuit = Object.entries(suitCount).sort((a, b) => b[1] - a[1])[0];
    if (dominantSuit && dominantSuit[1] >= 2) {
      const suitReadings_ZH = {
        '权杖': '权杖牌组主导说明你当前的核心动力在于行动和创造。事业、项目和自我实现是你最关切的战场。',
        '圣杯': '圣杯牌组主导说明情感世界是你当前的主旋律。爱情、关系和内在感受正在塑造你的选择。',
        '宝剑': '宝剑牌组主导说明思想层面的挑战是核心。决策、沟通和真理的追寻是你目前最重要的课题。',
        '星币': '星币牌组主导说明物质世界是你关注的焦点。财务、工作和实际成果是你当前最在意的领域。'
      };
      const suitReadings_EN = {
        '权杖': 'The dominance of Wands means your core drive is currently in action and creation. Career, projects, and self-actualization are your most pressing battlefield.',
        '圣杯': 'The dominance of Cups means the emotional world is your current main theme. Love, relationships, and inner feelings are shaping your choices.',
        '宝剑': 'The dominance of Swords means intellectual challenges are central. Decisions, communication, and the search for truth are your most important lessons right now.',
        '星币': 'The dominance of Pentacles means the material world is your focus. Finances, work, and tangible results are the area you care about most.'
      };
      if (isEn ? suitReadings_EN[dominantSuit[0]] : suitReadings_ZH[dominantSuit[0]]) {
        syn += `<p>🎯 ${isEn ? suitReadings_EN[dominantSuit[0]] : suitReadings_ZH[dominantSuit[0]]}</p>`;
      }
    }
  }

  // ── 5. Number symbolism (for minor cards) ──
  const numberPatterns = minorCards.filter(c => c.rank && !isNaN(parseInt(c.rank))).map(c => parseInt(c.rank));
  if (numberPatterns.length >= 2) {
    const numCount = {};
    numberPatterns.forEach(n => { numCount[n] = (numCount[n] || 0) + 1; });
    const repeating = Object.entries(numCount).filter(([k, v]) => v >= 2);
    if (repeating.length > 0) {
      const numReadings_ZH = {
        1: '数字1（王牌）的重复出现强调了"新的开始"。一个全新的周期正在启动，你手握创造的火种。',
        2: '数字2的重复出现强调了"选择与平衡"。你在多个力量之间寻求平衡，决策是当前的关键词。',
        3: '数字3的重复出现强调了"创造与扩展"。初步的成果正在显现，合作和共享是你当前的力量来源。',
        4: '数字4的重复出现强调了"稳固与基础"。你需要夯实根基，稳定是当前最重要的主题。',
        5: '数字5的重复出现强调了"冲突与变化"。不稳定的能量在推动你突破舒适区，挑战中蕴含着成长。',
        6: '数字6的重复出现强调了"和谐与恢复"。平衡正在回归，关系中的给予与接受趋于健康。',
        7: '数字7的重复出现强调了"反思与评估"。你需要退一步审视全局，内在的智慧正在觉醒。',
        8: '数字8的重复出现强调了"行动与进展"。事情正在加速，快速的变化要求你保持灵活和专注。',
        9: '数字9的重复出现强调了"完成与满足"。一个周期接近尾声，成果正在显现，你接近了目标。',
        10: '数字10的重复出现强调了"圆满与终结"。一个完整的循环即将结束，新的循环在终点等候。'
      };
      const numReadings_EN = {
        1: 'The repetition of number 1 (Ace) emphasizes "new beginnings." A fresh cycle is starting — you hold the spark of creation in your hands.',
        2: 'The repetition of number 2 emphasizes "choice & balance." You\'re seeking equilibrium between multiple forces — decision is the keyword.',
        3: 'The repetition of number 3 emphasizes "creation & expansion." Initial results are emerging — collaboration and sharing are your current sources of strength.',
        4: 'The repetition of number 4 emphasizes "stability & foundation." You need to solidify your roots — stability is the most important theme right now.',
        5: 'The repetition of number 5 emphasizes "conflict & change." Unstable energy is pushing you beyond your comfort zone — growth lies within the challenge.',
        6: 'The repetition of number 6 emphasizes "harmony & recovery." Balance is returning — giving and receiving in relationships are becoming healthy.',
        7: 'The repetition of number 7 emphasizes "reflection & assessment." You need to step back and survey the whole picture — inner wisdom is awakening.',
        8: 'The repetition of number 8 emphasizes "action & progress." Things are accelerating — rapid changes require you to stay flexible and focused.',
        9: 'The repetition of number 9 emphasizes "completion & fulfillment." A cycle is nearing its end — results are emerging, you are approaching your goal.',
        10: 'The repetition of number 10 emphasizes "completion & closure." A full cycle is about to end — a new cycle waits at the finish line.'
      };
      repeating.forEach(([num, cnt]) => {
        if (isEn ? numReadings_EN[num] : numReadings_ZH[num]) syn += `<p>🔢 ${isEn ? numReadings_EN[num] : numReadings_ZH[num]}</p>`;
      });
    }
  }

  // ── 6. Reversed card energy ──
  if (hasReversed === count) {
    syn += (isEn
      ? `<p>🔄 <strong>All cards reversed</strong> — this is a strong signal: your current inner resistance or external obstacles are significant. But reversed cards are not "bad" — they are invitations to inner work. Every reversed card asks you: What are you resisting? What needs to be transformed?</p>`
      : `<p>🔄 <strong>全部逆位</strong> — 这是一个强烈的信号：你当前的内在阻力或外在障碍比较显著。但逆位并非坏牌——它们是内在功课的邀请函。每一张逆位的牌都在问你：你在抗拒什么？你需要转化什么？</p>`);
  } else if (hasReversed >= 2) {
    const revNames = reversedCards.map(c => isEn ? (c.en||c.name||'') : (c.name||`${c.suit||''}${c.rank||''}`)).join('、');
    syn += (isEn
      ? `<p>🔄 <strong>${hasReversed} reversed cards</strong> (${revNames}) — these areas contain inner resistance or external delays that need your attention. Reversed doesn\'t mean "bad" — it tells you: this lesson requires more inner work and awareness before it can turn upright.</p>`
      : `<p>🔄 <strong>${hasReversed}张逆位牌</strong>（${revNames}）— 这些领域存在需要你面对的内在阻力或外在延迟。逆位不是"不好"，而是在告诉你：这个课题需要更多的内在工作和觉察才能转正。</p>`);
  } else if (hasReversed === 1) {
    const rn = isEn ? (reversedCards[0].en||reversedCards[0].name||`${reversedCards[0].suit||''}${reversedCards[0].rank||''}`) : (reversedCards[0].name||`${reversedCards[0].suit||''}${reversedCards[0].rank||''}`);
    syn += (isEn
      ? `<p>🔄 The only reversed card — "${rn}" — is the key blockage the spread is pointing out. Its energy is blocked or internalized — this is also where you most need to focus and transform.</p>`
      : `<p>🔄 唯一逆位的「${rn}」是牌阵指出的关键卡点。它的能量被阻塞或内化——这也是你最需要关注和转化的地方。</p>`);
  }

  // ── 7. Position flow analysis (for 3-card spreads) ──
  if (cards.length === 3) {
    const pastOk = cards[0] && !cards[0].isReversed;
    const presentOk = cards[1] && !cards[1].isReversed;
    const futureOk = cards[2] && !cards[2].isReversed;

    if (!pastOk && presentOk && futureOk) {
      syn += (isEn
        ? `<p>📈 <strong>Trend is improving</strong> — past obstacles are dissolving. You stand on firmer ground now, and the future card suggests positive development. The trajectory from trough to peak has already begun.</p>`
        : `<p>📈 <strong>趋势向好</strong> — 过去的阻碍正在消散，你现在站得更稳，未来的牌面预示着积极的发展。从低谷走向高峰的轨迹已经开启。</p>`);
    } else if (pastOk && presentOk && !futureOk) {
      syn += (isEn
        ? `<p>⚠️ <strong>Watch ahead</strong> — your past accumulation and present stability are precious, but the future holds challenges you need to proactively avoid or prepare for. Early awareness can change the trajectory.</p>`
        : `<p>⚠️ <strong>注意前方</strong> — 过去的积累和当下的稳定值得珍惜，但未来存在需要你主动规避或准备的挑战。提前觉察可以改变走向。</p>`);
    } else if (!pastOk && !presentOk && futureOk) {
      syn += (isEn
        ? `<p>🌈 <strong>Rainbow after the storm</strong> — the past and present may be full of challenges, but the future card gives you a bright direction. This makes your current persistence meaningful.</p>`
        : `<p>🌈 <strong>风雨后有彩虹</strong> — 过去和当下可能充满了挑战，但未来的牌给了你明亮的方向。这让你当下的坚持有了意义。</p>`);
    }

    // Element flow
    if (cards[0].element && cards[1].element && cards[2].element) {
      const flow = cards.map(c => c.element);
      const flowLabel = (e) => isEn ? ({火:'Fire',水:'Water',风:'Air',土:'Earth'})[e] : e;
      if (flow[0] === flow[1] && flow[1] === flow[2]) {
        syn += (isEn
          ? `<p>🔗 All three cards share the same element (${flowLabel(flow[0])}), meaning the energy of this question is very focused and pure. You don\'t need to spread your attention — concentrate on this single thread.</p>`
          : `<p>🔗 三张牌的元素一致（均为${flowLabel(flow[0])}），说明这个问题的能量非常聚焦和纯粹。你不需要分散精力——专注于这一条主线即可。</p>`);
      } else if (flow[0] === '火' && flow[2] === '土') {
        syn += (isEn
          ? `<p>🔗 Evolution from Fire to Earth: the spread shows your energy is moving from passionate impulse toward grounded manifestation. Creativity and passion are transforming into tangible results.</p>`
          : `<p>🔗 从火到土的演进：牌阵显示你的能量正在从热情冲动走向务实落地。创意和激情正在转化为实际的成果。</p>`);
      } else if (flow[0] === '风' && flow[2] === '水') {
        syn += (isEn
          ? `<p>🔗 Flow from Air to Water: thoughts and anxiety are yielding to emotion and intuition. It\'s time to release mental analysis — listen to your heart\'s feelings to find the answer.</p>`
          : `<p>🔗 从风到水的流转：思维和焦虑正在向情感和直觉让步。头脑的分析该放下了，听从内心的感受会带你找到答案。</p>`);
      }
    }
  }

  // ── 8. Theme-based closing ──
  const theme = questionThemes[0];
  const themeClosings_ZH = {
    '爱情': '感情从来不是靠理性算计，而是靠心去感受。牌面的信息关于时机、心态和选择——最终，真爱不会因任何决定而错过，但需要你保持真诚和勇气。',
    '事业': '职业发展的核心不仅在于外在机会，更在于你内在的成熟和准备。牌的指引帮助你看到自己的力量和盲点。行动加上智慧，再加上耐心，属于你的舞台终将到来。',
    '财运': '财富是能量的物质显化。牌阵在告诉你：金钱的流动和你内在的能量状态密切相关。理清内在，外在自然会丰盛。',
    '人生方向': '迷茫时我们总在寻找唯一的"正确答案"。但塔罗的智慧在于——它不会替你选择，而是照亮你忽略的角落，让你更有智慧地为自己做出决定。',
    '家庭': '家庭是我们最早的根，也是最深的功课。牌阵反映了你与家人之间能量的流动——理解比改变更重要，接纳比评价更深刻。',
    '健康': '身心健康是一切的基础。牌的讯息不是诊断，而是提醒你关注身体与心灵之间微妙的联系。倾听身体的信号。',
    '学业': '学习不只是知识的堆积，更是灵魂的扩展。牌阵告诉你：当前最适合的学习方式和方向——保持好奇心和专注力。',
    '人际': '人际关系是我们投射在他人身上的自己。牌阵揭示了你在人际互动中的模式和盲点——调整你的能量，关系自然会变化。'
  };
  const themeClosings_EN = {
    '爱情': 'Love has never been about rational calculation — it\'s about what the heart feels. The cards speak about timing, mindset, and choice — ultimately, true love won\'t be missed because of any decision, but you need to stay sincere and courageous.',
    '事业': 'The core of career development lies not only in external opportunities, but in your inner maturity and readiness. The cards\' guidance helps you see your strengths and blind spots. Action plus wisdom, plus patience — the stage that belongs to you will arrive.',
    '财运': 'Wealth is the material manifestation of energy. The spread tells you: the flow of money is closely tied to your inner energetic state. Clarify within, and abundance will naturally appear without.',
    '人生方向': 'When lost, we always search for the one "right answer." But the wisdom of tarot is this — it won\'t choose for you, but will illuminate the corners you\'ve overlooked, giving you more wisdom to decide for yourself.',
    '家庭': 'Family is our earliest root and our deepest lesson. The spread reflects the flow of energy between you and your family — understanding is more important than changing, and acceptance is deeper than judgment.',
    '健康': 'Physical and mental health is the foundation of everything. The cards\' message is not a diagnosis, but a reminder to pay attention to the subtle connection between body and soul. Listen to your body\'s signals.',
    '学业': 'Learning is not just piling up knowledge — it\'s the expansion of the soul. The spread tells you: the most suitable way and direction for learning right now — keep your curiosity and focus.',
    '人际': 'Relationships are ourselves projected onto others. The spread reveals your patterns and blind spots in interpersonal interaction — adjust your energy, and relationships will naturally shift.'
  };
  const closing = isEn
    ? (themeClosings_EN[theme] || 'Every card is a mirror reflecting some aspect of your inner world. The answer isn\'t in the cards — it\'s in the part of you that is touched while reading these words. Keep an open heart, and you will find wisdom in your own soul.')
    : (themeClosings_ZH[theme] || '每张牌都是一面镜子，映照你内心的某个面向。答案不在牌中，而在你阅读这些文字时内心被触动的那个部分。保持开放的心态，你会在自己的灵魂中找到智慧。');

  syn += `<p style="margin-top:12px;">💫 ${closing}</p>`;

  syn += (isEn
    ? `<p style="color:var(--text-dim);margin-top:12px;font-size:0.85rem;">※ Tarot is an illuminating tool of awareness, helping you see yourself. The final judgment and choice are always in your hands. Keep an open heart and listen to your inner wisdom.</p>`
    : `<p style="color:var(--text-dim);margin-top:12px;font-size:0.85rem;">※ 塔罗牌是启发性的觉知工具，帮助你看见自己。最终的判断和选择权永远在你手中。保持开放的心态，聆听内在的智慧。</p>`);

  syn += `</div>`;
  return syn;
}

// ── Tab 4: Tarot ──────────────────────────────────────────────────────────
let tarotState = { deck:null, drawn:[], spread:'three', question:'', flipped:0 };

function renderTarotDeck() {
  // Shuffle and get fresh deck
  tarotState.deck = shuffle(buildDeck());
  tarotState.drawn = [];
  tarotState.flipped = 0;
  tarotState.question = '';

  drawTarotUI();
}

function drawTarotUI() {
  const isEn = window._lang && window._lang() === 'en';
  const tab4 = document.getElementById('tab4');
  let html = '';

  // Question area
  html += '<div class="tarot-question-area">';
  html += `<input type="text" id="tarot_question" placeholder="${isEn ? 'Hold your question in mind, then type it here…' : '默想你的问题，然后在此输入…'}" value="${escHtml(tarotState.question)}" onkeydown="if(event.key==='Enter')drawTarotCards()">`;
  html += '<button class="geo-btn" onclick="drawTarotCards()" id="tarot_draw_btn">' + _L('🔮 抽牌','🔮 Draw') + '</button>';
  html += '</div>';

  // Spread selector
  html += '<div class="spread-selector">';
  html += `<span class="spread-opt${tarotState.spread==='one'?' active':''}" onclick="setSpread('one')">` + _L('单张牌 · 快速指引','Single Card · Quick Guidance') + `</span>`;
  html += `<span class="spread-opt${tarotState.spread==='three'?' active':''}" onclick="setSpread('three')">` + _L('三张牌 · 过去现在未来','Three Cards · Past Present Future') + `</span>`;
  html += '</div>';

  // Cards area
  if (tarotState.drawn.length > 0) {
    const posLabels_ZH = tarotState.spread === 'three'
      ? ['过去的影响','当下的状态','未来的趋势']
      : ['宇宙的讯息'];
    const posLabels_EN = tarotState.spread === 'three'
      ? ['Past Influence','Present State','Future Trend']
      : ['Message from the Universe'];
    const posLabels = isEn ? posLabels_EN : posLabels_ZH;
    html += '<div class="cards-area">';
    for (let i = 0; i < tarotState.drawn.length; i++) {
      const card = tarotState.drawn[i];
      const isFlipped = i < tarotState.flipped;
      html += '<div style="display:flex;flex-direction:column;align-items:center;">';
      html += `<div class="tarot-card${isFlipped?' flipped':''}" onclick="flipCard(${i})">`;
      html += '<div class="tarot-card-inner">';
      // Back
      html += '<div class="card-face card-back"></div>';
      // Front
      html += '<div class="card-face card-front">';
      if (isFlipped) {
        html += `<div class="card-pos-label">${posLabels[i]}</div>`;
        html += `<div class="card-title">${isEn ? ((card.type==='major'?card.en:'')||(card.suit_en?card.suit_en+' '+card.en:card.name)) : (card.name||(card.suit+card.rank))}</div>`;
        if (card.isReversed) html += '<span class="reversed-badge" style="margin:2px 0">' + _L('逆位','Reversed') + '</span>';
        html += `<div class="card-suit">${card.type==='major'?card.num:(isEn?(card.element_en||card.element)+' Element':card.element+'元素')}</div>`;
        html += `<div class="card-keywords">${card.isReversed?(_cardT(card,'rev')||_cardT(card,'up')):_cardT(card,'up')}</div>`;
      }
      html += '</div>';
      html += '</div></div>';
      html += `<div class="card-position-label">${isFlipped ? posLabels[i] : (i+1)}</div>`;
      html += '</div>';
    }
    html += '</div>';

    // Interpretation
    if (tarotState.flipped >= tarotState.drawn.length) {
      const themes = analyzeQuestion(tarotState.question || (isEn ? 'General Fortune' : '综合运势'));
      html += '<div class="tarot-interpretation">';
      html += `<h3>` + _L('✦ 解读：','✦ Reading: ') + (tarotState.question||(isEn ? 'Message from the Universe' : '宇宙给你的信息')) + `</h3>`;
      for (let i = 0; i < tarotState.drawn.length; i++) {
        const card = tarotState.drawn[i];
        const readingLabels_ZH = tarotState.spread==='three'?['❶ 过去','❷ 现在','❸ 未来']:['🎴 指引'];
        const readingLabels_EN = tarotState.spread==='three'?['❶ Past','❷ Present','❸ Future']:['🎴 Guidance'];
        const readingLabels = isEn ? readingLabels_EN : readingLabels_ZH;
        html += '<div class="card-reading">';
        html += `<h4>${readingLabels[i]}</h4>`;
        html += `<p>${interpretCard(card, card.isReversed, i, themes)}</p>`;
        html += '</div>';
      }
      // Synthesis
      html += '<div class="synthesis">';
      html += synthesizeReading(tarotState.drawn, [], tarotState.question || (isEn ? 'Your Fortune' : '你的运势'), themes);
      html += '</div>';
      html += '<div style="text-align:center;margin-top:16px;">';
      html += '<button class="btn" onclick="renderTarotDeck()" style="padding:10px 30px;font-size:0.9em;">' + _L('🔄 重新抽牌','🔄 Draw Again') + '</button>';
      html += '</div>';
      html += '</div>';
    } else {
      html += '<p style="text-align:center;color:var(--text-dim);margin-top:12px;">' + _L('点击卡牌将其翻开，揭示宇宙的讯息 ✨','Click a card to reveal it and uncover the message of the universe ✨') + '</p>';
    }
  } else {
    html += '<div class="cards-area">';
    html += '<div style="text-align:center;color:var(--text-dim);padding:40px;">';
    html += '<div style="font-size:3em;margin-bottom:16px;">🃏</div>';
    html += '<p>' + _L('在心中默念你的问题','Hold your question in your mind') + '</p><p>' + _L('然后点击上方「🔮 抽牌」按钮','Then click the "🔮 Draw" button above') + '</p>';
    html += '</div></div>';
  }

  tab4.innerHTML = html;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setSpread(type) {
  tarotState.spread = type;
  tarotState.drawn = [];
  tarotState.flipped = 0;
  drawTarotUI();
}

function drawTarotCards() {
  const qInput = document.getElementById('tarot_question');
  const question = qInput ? qInput.value.trim() : '';
  tarotState.question = question;

  // Shuffle fresh each time
  tarotState.deck = shuffle(buildDeck());
  const count = tarotState.spread === 'three' ? 3 : 1;
  tarotState.drawn = [];
  for (let i = 0; i < count; i++) {
    const card = tarotState.deck.pop();
    card.isReversed = Math.random() < 0.3; // 30% chance of reversed
    tarotState.drawn.push(card);
  }
  tarotState.flipped = 0;
  drawTarotUI();
}

function flipCard(index) {
  if (index < tarotState.flipped) {
    // Clicked an already-flipped card: unflip this and all after
    tarotState.flipped = index;
  } else {
    // Clicked a face-down card: flip this and all before
    tarotState.flipped = index + 1;
  }
  drawTarotUI();
}

function renderTab4() {
  if (!tarotState.deck) {
    tarotState.deck = shuffle(buildDeck());
  }
  drawTarotUI();
}

// ── Tab Switching ─────────────────────────────────────────────────────────
function switchTab(idx) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
  document.querySelectorAll('.tab-content').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
  // Re-render on switch to ensure content is fresh (except tarot which is standalone)
  if (idx === 4) {
    renderTab4();
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
    if (!btn) return;
    if (window.scrollY > 400) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
//  福运方位 · 罗盘指路
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
//  福运方位 · 数据 — 8方位 × 4分类 × (今日+近期)
//  今日：轻量自我成长小动作   近期：方位+意象+反问，让用户自己投射
// ═══════════════════════════════════════════════════════════════════════════
var COMPASS_DIR_DATA_ZH = {
  '正东': {
    element:'木', trigram:'震位', imagery:'林木茂盛之地',
    '求财位': {
      today:'那本买回来只拆了塑封的书，往后读二十页。不是读完——二十页刚好够找回手感。',
      upcoming:'东方，林木茂盛之地。是留在现在的位置，还是去一个能长开的地方？你心里第一个跳出来的城市名——认真看它一眼。'
    },
    '贵人位': {
      today:'今天学一个你行业里的新词，用自己的话写一遍定义。不用发，自己看。',
      upcoming:'东方，震位——雷动之处。最近那件"再等等"的事，是在等时机还是等勇气？你其实知道。'
    },
    '桃花位': {
      today:'睡前不刷手机，刷三分钟牙。对着镜子站十秒——不干什么，就站。看见你自己。',
      upcoming:'东方，有风穿过的林木之间。你跟一个人待在一起的时候——是越来越像自己，还是越来越不像？'
    },
    '文昌位': {
      today:'还记得那只绿鸟吗，冷落它很久了。背五个单词，然后关掉——五个就够了，明天再来。',
      upcoming:'东方，震位属木。你最近在学的东西，是在长叶子还是长根？叶子好看，根才过冬。'
    }
  },
  '东南': {
    element:'木', trigram:'巽位', imagery:'风入之处',
    '求财位': {
      today:'翻出上个月的账单。不是焦虑——就看看钱流去了哪。不用改，先看。',
      upcoming:'东南，巽为风——风带来消息也带来过客。最近一笔收入之外的机会，你闻到了吗？'
    },
    '贵人位': {
      today:'给一个你欣赏但不太熟的人发条消息。不用写太长——就一句：最近在做什么有意思的事。',
      upcoming:'东南，风入之处。旗子动了不是旗子厉害，是风。谁在帮你——你看清楚了吗？'
    },
    '桃花位': {
      today:'打开那部标记了"想看"但一直没看的电影。别看解说，看原片。两个小时的完整叙事——今晚不开倍速。',
      upcoming:'东南，近水而热闹的地方。是一个很久没联系但不时想起的名字，还是总在同一个地方遇见的陌生面孔？哪个先冒出来，你心里有数。'
    },
    '文昌位': {
      today:'今天学的东西，用你自己的话讲给一个人听。讲不通的地方，就是你没真懂的地方。',
      upcoming:'东南，巽位。风不挑方向，但你知道自己该往哪吹。最近在学的——是别人让你学的，还是你自己想知道的？'
    }
  },
  '正南': {
    element:'火', trigram:'离位', imagery:'人声鼎沸之地',
    '求财位': {
      today:'一件闲置超过半年的东西，挂到二手平台。火星要溅出去才燃得起来。',
      upcoming:'南方，离为火，明亮处有阴影。你现在的收入来源——是在发光还是在耗光？'
    },
    '贵人位': {
      today:'站直。就现在，肩膀打开，深呼吸三次。姿势变了，气场跟着变。',
      upcoming:'南方，人声鼎沸之地。最近有没有一个你一直没去、又一直惦记的场合？答案快的那个，去。'
    },
    '桃花位': {
      today:'把微信头像换成你觉得最好看的那张。火需要被看见——先让你自己看见。',
      upcoming:'南方，离位。亮起来。你藏着的那个自己——有没有一个人是见过的？'
    },
    '文昌位': {
      today:'三分钟。就三分钟——打开那个你收藏了但一直没看的教程，只看第一节的开头。',
      upcoming:'南方，火象。兴趣这个东西，三分钟热度不是缺点——三分钟够烧开一壶水了。你上一次烧起来是什么时候？'
    }
  },
  '西南': {
    element:'土', trigram:'坤位', imagery:'厚德载物之处',
    '求财位': {
      today:'用手碰一样真的东西——木头、陶罐、石头。不是看，是碰。钱是虚的，触觉是真的。',
      upcoming:'西南，坤位。土不急着收成——你播下去的东西，季节到了自然有。现在是什么季节？'
    },
    '贵人位': {
      today:'今天做完一件事之后，不在脑子里过第二遍。做完就是做完了。',
      upcoming:'西南，坤位属土。大楼没人看地基，但盖楼的人自己知道。你最近做的工作——是往上盖还是在往下挖？'
    },
    '桃花位': {
      today:'今天给一个人真诚的夸奖。不是客气——是你真的觉得对方好的地方，说出来。',
      upcoming:'西南，厚德载物。舒服的关系不需要说明书，坐下去就知道了。你有没有哪里一直绷着？'
    },
    '文昌位': {
      today:'今天学一点明天忘一半也没关系。土不嫌慢——土什么都留得住。',
      upcoming:'西南，坤位。学东西最快的不是最聪明的，是最不急的。你在急什么？'
    }
  },
  '正西': {
    element:'金', trigram:'兑位', imagery:'精金锐气之所',
    '求财位': {
      today:'整理一个抽屉。只整理一个。扔掉明显没用的——剪刀用久了要磨，抽屉满了要清。',
      upcoming:'西方，兑位属金。金不藏——你手上有一件值钱但你一直没当回事的东西。是什么？'
    },
    '贵人位': {
      today:'今天有一句话该说了。你拖了多久？兑为口——说出来。',
      upcoming:'西方，锐气所聚。你现在做的这件事——是在磨刀还是在砍柴？磨刀不误砍柴工，但你多久没磨了？'
    },
    '桃花位': {
      today:'今天跟一个人说话的时候，看着对方的眼睛。不是盯，是停一秒。',
      upcoming:'西方，兑位。金声响亮——你欣赏一个人的时候，对方其实看出来了。你最近对谁藏着没说？'
    },
    '文昌位': {
      today:'删掉一个你根本不会看的收藏或课程。少即是多——删一个比加三个有用。',
      upcoming:'西方，金象。精不是多，是少而准。你最近学的东西——是广度够了还是深度不够？'
    }
  },
  '西北': {
    element:'金', trigram:'乾位', imagery:'天高云淡之处',
    '求财位': {
      today:'今天不花不必要的钱。不是省钱——是感受一下"不买"和"不缺"之间的区别。',
      upcoming:'西北，乾为天。天不下雨的时候你浇水也没用——有些收入是季节性的，急不来。现在是旱季还是雨季？'
    },
    '贵人位': {
      today:'出门前站直三秒，肩打开。姿势变了，运气会跟着变——乾卦的人走路带风。',
      upcoming:'西北，乾位，开阔高地。是继续待在这个位置，还是往更高处走？上个月睡不着的时候脑子里跳出来的那个念头——还在吗。'
    },
    '桃花位': {
      today:'今天一个人吃饭。不是孤独——是尝尝没人说话的时候，菜是什么味道。',
      upcoming:'西北，天高云淡。乾位的人容易先敬人后爱人——你最近遇到的人里，有一个值得你敬的吗？'
    },
    '文昌位': {
      today:'留意今天一个比你有经验的人说的话。就一句——然后想想这句话他为什么这么说。',
      upcoming:'西北，乾位。学什么都行，跟谁学才重要。你有没有一个真正意义上的引路人？'
    }
  },
  '正北': {
    element:'水', trigram:'坎位', imagery:'近水之地',
    '求财位': {
      today:'钱像水——今天只看不碰。看一遍余额，不用做什么，就看看。',
      upcoming:'北方，坎位近水。你在钱的方面——是越来越沉还是越来越浑？沉是积蓄，浑是消耗。哪个更接近你现在的状态？'
    },
    '贵人位': {
      today:'今天上班或学习的时候，每四十分钟起来走一圈。水要流动——人也一样。',
      upcoming:'北方，坎位。坎是坑也是井——往下挖的人，比往旁边跑的人先碰到水。你在挖还是在跑？'
    },
    '桃花位': {
      today:'今天听完一个人说话——不是准备回答，是听完。水最深的河，表面最安静。',
      upcoming:'北方，近水之地。一个人待着不是逃避——水面平静了才能映出东西。你现在映出来的是什么？'
    },
    '文昌位': {
      today:'读不进去的时候别硬读。换个地方——水换了杯子就换了味道。',
      upcoming:'北方，坎位属水。知识不灌进去，是浸润进去的。你最近是用灌的还是用浸的？'
    }
  },
  '东北': {
    element:'土', trigram:'艮位', imagery:'山止之处',
    '求财位': {
      today:'今天有一件事该停——一笔不必要的订阅、一个自动续费。关掉它。',
      upcoming:'东北，艮为山。山不长庄稼的地方，底下有矿。你一直以为没用的那部分——换个角度看过吗？'
    },
    '贵人位': {
      today:'如果最近太累——不是因为做得少，是因为方向多。今天划掉一个不重要的。',
      upcoming:'东北，艮位，山象。停下来不是退步，是换口气看看方向。你上一次停下来是什么时候？'
    },
    '桃花位': {
      today:'今天不主动找任何人。看看谁会先来找你——山不追人，人自己会来。',
      upcoming:'东北，山止之处。艮是止——有些关系要停下来才能看清。是你在追，还是你在被拽着走？'
    },
    '文昌位': {
      today:'背不进去的时候抄一遍。手比脑子慢，但手不会骗你。',
      upcoming:'东北，艮位。学到深处的人看起来都慢——山从来不急，但山一直在那里。你急什么？'
    }
  }
};

var COMPASS_DIR_DATA_EN = {
  East: {
    element: "Wood", trigram: "Zhen (Thunder)", imagery: "Lush woodlands",
    Wealth: { today: "That book you bought but only unwrapped — read twenty more pages. Not finish it — twenty pages is just enough to find your rhythm again.", upcoming: "East, where trees grow tall. Stay where you are, or go somewhere you can stretch? The first city that jumps to mind — take a real look at it." },
    Mentor: { today: "Learn one new term in your field today, and rewrite the definition in your own words. No need to share it — just for you.", upcoming: "East, Zhen — where thunder stirs. That thing you keep saying \"later\" about — are you waiting for timing or courage? You already know." },
    Romance: { today: "Before bed, put the phone down. Brush your teeth. Stand in front of the mirror for ten seconds — not to judge, just to see yourself.", upcoming: "East, where wind moves through trees. When you're with someone — do you become more yourself, or less?" },
    Wisdom: { today: "Remember that green bird? You've been ignoring it. Learn five new words — then stop. Five is enough. Come back tomorrow.", upcoming: "East, Zhen, of the Wood element. What you're learning lately — is it growing leaves or roots? Leaves look good, but roots survive winter." }
  },
  Southeast: {
    element: "Wood", trigram: "Xun (Wind)", imagery: "Where the wind enters",
    Wealth: { today: "Pull up last month's expenses. Not to stress — just to see where the money flowed. Don't change anything yet, just look.", upcoming: "Southeast, Xun — the wind brings news and passersby. A source of income beyond your main one — have you caught its scent?" },
    Mentor: { today: "Send a message to someone you admire but don't know well. Keep it short — just ask: \"What interesting things are you working on lately?\"", upcoming: "Southeast, where wind enters. The flag moves not because the flag is strong, but because the wind is. Who's helping you — can you see them clearly?" },
    Romance: { today: "Open that movie you marked \"watch later\" but never watched. No recaps or clips — the full two hours. No fast-forward tonight.", upcoming: "Southeast, lively places near water. A name you haven't thought about in a while, or a familiar face you keep seeing? The first one that comes to mind — you already know." },
    Wisdom: { today: "Explain what you learned today to someone else, in your own words. Where you stumble — that's where you haven't quite understood.", upcoming: "Southeast, Xun position. The wind doesn't pick a direction — but you should know which way you want to blow. What you're studying — is it what others want, or what you want to know?" }
  },
  South: {
    element: "Fire", trigram: "Li (Fire)", imagery: "Bustling, lively places",
    Wealth: { today: "Something sitting unused for over six months — list it on a second-hand platform. Fire has to leap out to burn.", upcoming: "South, Li — brightness casts shadows. Your current income stream — is it lighting you up or draining you dry?" },
    Mentor: { today: "Stand up straight. Right now — shoulders back, three deep breaths. Change your posture, change your presence.", upcoming: "South, where voices gather. Is there a gathering you've been meaning to attend? The one that answers fastest — go." },
    Romance: { today: "Change your profile picture to the one you think you look best in. Fire needs to be seen — let yourself see it first.", upcoming: "South, Li position. Light it up. That hidden self of yours — has anyone ever really seen it?" },
    Wisdom: { today: "Three minutes. Just three — open that tutorial you bookmarked but never started. Just the beginning of the first lesson.", upcoming: "South, of the Fire element. Passion is not a flaw — three minutes of fire is enough to boil a pot of water. When was the last time you caught fire?" }
  },
  Southwest: {
    element: "Earth", trigram: "Kun (Earth)", imagery: "Where virtue carries all",
    Wealth: { today: "Touch something real with your hands — wood, pottery, stone. Don't just look — touch. Money is abstract; texture is real.", upcoming: "Southwest, Kun position. Earth doesn't rush the harvest — what you planted will come in its season. What season is it now?" },
    Mentor: { today: "When you finish something today, don't replay it in your head. Done is done.", upcoming: "Southwest, Kun, of the Earth element. No one looks at a building's foundation — but the builder knows. The work you're doing — are you building up or digging down?" },
    Romance: { today: "Give someone a genuine compliment today. Not politeness — something you truly appreciate about them. Say it out loud.", upcoming: "Southwest, where virtue bears all. Comfortable relationships need no manual — you sit down and know. Is there somewhere you've been holding tension?" },
    Wisdom: { today: "If you learn something today and forget half of it tomorrow — that's fine. Earth doesn't mind slow. Earth keeps everything.", upcoming: "Southwest, Kun position. The fastest learner isn't the smartest — it's the one who isn't in a hurry. What are you rushing?" }
  },
  West: {
    element: "Metal", trigram: "Dui (Lake)", imagery: "Where fine metal gathers",
    Wealth: { today: "Organize one drawer. Just one. Throw out what's clearly useless — sharpen the scissors, clear the drawer.", upcoming: "West, Dui, of the Metal element. Metal doesn't hide. You have something valuable that you've never treated as valuable. What is it?" },
    Mentor: { today: "There's something you've needed to say. How long have you put it off? Dui is the mouth — speak it.", upcoming: "West, where sharpness gathers. What you're doing right now — are you sharpening the blade or chopping wood? Sharpening doesn't delay the work. When did you last sharpen yours?" },
    Romance: { today: "When you talk to someone today, look them in the eye. Not staring — just pause there for one second.", upcoming: "West, Dui position. Metal rings clearly — when you admire someone, they can usually tell. Who have you been hiding it from lately?" },
    Wisdom: { today: "Delete one saved tutorial or course you'll never actually go through. Less is more — removing one helps more than adding three.", upcoming: "West, of the Metal element. Refinement is not abundance — it's precision through subtraction. In what you're learning — do you have breadth or depth?" }
  },
  Northwest: {
    element: "Metal", trigram: "Qian (Heaven)", imagery: "Where sky meets open land",
    Wealth: { today: "Don't spend any unnecessary money today. Not to save — just to feel the difference between \"not buying\" and \"not lacking.\"", upcoming: "Northwest, Qian — the heavens. When the sky doesn't rain, watering won't help — some income is seasonal, and rushing won't change the season. Is it drought or monsoon right now?" },
    Mentor: { today: "Before you walk out the door, stand straight for three seconds. Shoulders open. Posture shifts luck — Qian people walk with wind at their back.", upcoming: "Northwest, Qian position, high open ground. Stay in this spot, or climb higher? That thought that jumped into your head last month when you couldn't sleep — is it still there?" },
    Romance: { today: "Eat one meal alone today. Not loneliness — just taste what the food is like when no one is talking.", upcoming: "Northwest, vast sky above. Qian people tend to respect before they love — among the people you've met recently, is there one worthy of your respect?" },
    Wisdom: { today: "Notice one thing said today by someone more experienced than you. Just one sentence — then think about why they said it that way.", upcoming: "Northwest, Qian position. You can learn anything — who you learn from is what matters. Do you have a true mentor?" }
  },
  North: {
    element: "Water", trigram: "Kan (Water)", imagery: "Near water",
    Wealth: { today: "Money is like water — today, just look at it, don't touch. Check your balance, don't do anything — just look.", upcoming: "North, Kan, near water. With money — are you growing clearer or murkier? Clarity is savings, murk is drain. Which is closer to where you are now?" },
    Mentor: { today: "At work or study today, get up and walk around every forty minutes. Water needs to flow — and so do you.", upcoming: "North, Kan position. Kan is a pit — but it's also a well. The one who digs down finds water before the one who runs sideways. Are you digging or running?" },
    Romance: { today: "Today, truly listen to one person — not preparing your reply, just listening. The deepest river has the quietest surface.", upcoming: "North, near water. Being alone isn't running away — the water surface only reflects when it's still. What do you see reflected now?" },
    Wisdom: { today: "If you can't focus, don't force it. Change your spot — water tastes different in a different cup.", upcoming: "North, Kan, of the Water element. Knowledge doesn't pour in — it seeps. Lately, have you been pouring or seeping?" }
  },
  Northeast: {
    element: "Earth", trigram: "Gen (Mountain)", imagery: "Where the mountain stands still",
    Wealth: { today: "There's one thing to stop today — an unused subscription, an auto-renewal. Cancel it.", upcoming: "Northeast, Gen — the mountain. Where nothing grows on the surface, there's ore beneath. That part of you you thought was useless — have you looked at it from another angle?" },
    Mentor: { today: "If you've been too tired lately — it's not because you're doing too little, but because there are too many directions. Cross one off today.", upcoming: "Northeast, Gen position, Mountain. Stopping isn't losing — it's catching your breath to see the direction. When did you last stop?" },
    Romance: { today: "Don't reach out to anyone today. See who reaches out to you first — the mountain doesn't chase people; people come to the mountain.", upcoming: "Northeast, where the mountain stands. Gen means stopping — some relationships need stillness to see clearly. Are you chasing, or being dragged?" },
    Wisdom: { today: "When you can't memorize, copy it out by hand. The hand is slower than the brain, but the hand never lies.", upcoming: "Northeast, Gen position. The deepest learners seem the slowest — the mountain never rushes, but the mountain has always been there. What are you rushing for?" }
  }
};
function COMPASS_DIR_DATA() { return (window._lang && window._lang() === 'en') ? COMPASS_DIR_DATA_EN : COMPASS_DIR_DATA_ZH; }

var COMPASS_DIRECTIONS_ZH = ['正东','东南','正南','西南','正西','西北','正北','东北'];
var COMPASS_DIRECTIONS_EN = ['East','Southeast','South','Southwest','West','Northwest','North','Northeast'];
var COMPASS_CAT_KEYS = ['compass_wealth','compass_career','compass_love','compass_study'];
var COMPASS_CAT_NAMES_ZH = ['求财位','贵人位','桃花位','文昌位'];
var COMPASS_CAT_NAMES_EN = ['Wealth','Mentor','Romance','Wisdom'];
var COMPASS_CAT_EMOJI = ['💰','💼','💕','📚'];
function COMPASS_DIRECTIONS() { return (window._lang && window._lang() === 'en') ? COMPASS_DIRECTIONS_EN : COMPASS_DIRECTIONS_ZH; }
function COMPASS_CAT_NAMES() { return (window._lang && window._lang() === 'en') ? COMPASS_CAT_NAMES_EN : COMPASS_CAT_NAMES_ZH; }

// Star chart weighting: map planet house positions to favored directions
function compassChartWeight() {
  if (!chartData1) return null;
  var weights = [0,0,0,0,0,0,0,0]; // E SE S SW W NW N NE
  var p = chartData1.planets;
  // Venus house → love/finance direction
  if (p.Venus) {
    var vh = Math.floor(p.Venus.house);
    if (vh===2||vh===7) { weights[2] += 2; weights[5] += 1; } // S, NW for wealth/love
    if (vh===5||vh===11) { weights[0] += 1; weights[1] += 2; } // E, SE for romance/social
  }
  // Mars → career/action direction
  if (p.Mars) {
    var mh = Math.floor(p.Mars.house);
    if (mh===10||mh===6) { weights[3] += 2; weights[4] += 1; } // SW, W for career/work
    if (mh===1||mh===9) { weights[7] += 1; weights[6] += 2; } // NE, N for initiative/learning
  }
  // Jupiter → expansion/luck direction
  if (p.Jupiter) {
    var jh = Math.floor(p.Jupiter.house);
    weights[jh % 8] += 3;
    weights[(jh+4) % 8] += 1;
  }
  // Moon → emotional/feminine direction
  if (p.Moon) {
    var moh = Math.floor(p.Moon.house);
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
  html += '<p style="text-align:center;color:var(--text-dim);font-size:0.92em;margin-bottom:16px;letter-spacing:0.06em;">' + _t('compass.prompt') + '</p>';
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
  var markNames = ['東','南','西','北'];
  for (var mi=0; mi<4; mi++) {
    var rad = markAngles[mi] * Math.PI / 180;
    var mx = Math.round(120 + Math.sin(rad) * 88 - 14);
    var my = Math.round(120 - Math.cos(rad) * 88 - 14);
    stageHtml += '<span class="compass-mark-char" style="left:'+mx+'px;top:'+my+'px;">'+markNames[mi]+'</span>';
  }
  stageHtml += '<div class="compass-pointer" id="compassPointer" style="transform: rotate(0deg);"></div>';
  stageHtml += '<div class="compass-center"></div>';
  stageHtml += '</div>';

  document.getElementById('compassStageArea').innerHTML = stageHtml;

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

// ═══════════════════════════════════════════════════════════════════════════
//  灵性驿站 · 每日一签 / 今日人品 / 分享得次数
// ═══════════════════════════════════════════════════════════════════════════

const FORTUNE_SLIPS_ZH = [
  {lv:'上上签', poem:'云开见月明，花开自有时。\n天心已在汝，何必问归期。', dos:'宜：出门晒太阳、吃顿好的、给爸妈打电话', donts:'忌：久坐不动、喝含糖饮料、熬夜刷手机'},
  {lv:'上上签', poem:'春风得意马蹄疾，\n一日看尽长安花。', dos:'宜：大胆尝试、表白心意、吃火锅', donts:'忌：畏首畏尾、空腹喝冰美式、在家躺一天'},
  {lv:'上上签', poem:'青山遮不住，毕竟东流去。\n大江日夜流，此心无绝期。', dos:'宜：散步一万步、学道新菜、存一笔小钱', donts:'忌：半途而废、冲动购物、喝咖啡全糖'},
  {lv:'上上签', poem:'众里寻他千百度，\n蓦然回首，那人却在灯火阑珊处。', dos:'宜：整理房间、联系老朋友、抬头看天空', donts:'忌：向外求索、低头玩手机、忽略身边人'},
  {lv:'上上签', poem:'长风破浪会有时，\n直挂云帆济沧海。', dos:'宜：换发型、发朋友圈、吃螺蛳粉加炸蛋', donts:'忌：安于现状、拖延到明天、过分焦虑'},
  {lv:'上上签', poem:'山重水复疑无路，\n柳暗花明又一村。', dos:'宜：再坚持一下、换个角度、喝杯热茶', donts:'忌：绝望放弃、钻牛角尖、深夜 emo'},
  {lv:'上签', poem:'好风凭借力，送我上青云。\n良机已至，切勿迟疑。', dos:'宜：转发微博求好运、约朋友散步、早睡早起', donts:'忌：孤军奋战、谦虚过度、报复性熬夜'},
  {lv:'上签', poem:'春种一粒粟，秋收万颗子。\n此刻耕耘，必有厚报。', dos:'宜：健身打卡、学新技能、喝无糖豆浆', donts:'忌：急功近利、炫耀、空腹喝酒'},
  {lv:'上签', poem:'海内存知己，天涯若比邻。\n贵人就在你身边。', dos:'宜：请人吃饭、主动求助、户外下午茶', donts:'忌：孤僻冷漠、逞强、只喝添加剂饮料'},
  {lv:'上签', poem:'不畏浮云遮望眼，\n只缘身在最高层。', dos:'宜：读书半小时、做拉伸、吃水果', donts:'忌：纠结琐事、刷短视频到凌晨、久坐'},
  {lv:'上签', poem:'莫愁前路无知己，\n天下谁人不识君。', dos:'宜：自信表达、更新简历、拍张好看的照片', donts:'忌：自我怀疑、穿秋裤嫌丑、不吃饭减肥'},
  {lv:'上签', poem:'花开堪折直须折，\n莫待无花空折枝。', dos:'宜：说走就走、吃当季水果、表白', donts:'忌：完美主义、等"准备好了再说"'},
  {lv:'上签', poem:'千淘万漉虽辛苦，\n吹尽狂沙始到金。', dos:'宜：坚持一个好习惯、多喝水、晒太阳补钙', donts:'忌：频繁跳槽、熬夜赶工、用饮料代替水'},
  {lv:'上签', poem:'在天愿作比翼鸟，\n在地愿为连理枝。', dos:'宜：牵手散步、做一顿饭给对方吃、看日落', donts:'忌：冷战、翻旧账、分心玩手机'},
  {lv:'上签', poem:'等闲识得东风面，\n万紫千红总是春。', dos:'宜：逛公园、拍照记录生活、吃烧烤', donts:'忌：宅家不出门、消极抱怨、不吃早餐'},
  {lv:'上签', poem:'沉舟侧畔千帆过，\n病树前头万木春。', dos:'宜：断舍离旧物、换新床单、吃一顿好的', donts:'忌：沉溺回忆、比较他人、不运动'},
  {lv:'上签', poem:'会当凌绝顶，一览众山小。\n格局打开，天地自宽。', dos:'宜：爬山、制定年度计划、喝绿茶', donts:'忌：斤斤计较、小家子气、长时间看屏幕'},
  {lv:'上签', poem:'身无彩凤双飞翼，\n心有灵犀一点通。', dos:'宜：相信直觉、给朋友发条暖心的消息', donts:'忌：过度解释、怀疑别人的好意'},
  {lv:'中签', poem:'行到水穷处，坐看云起时。\n不急不躁，顺势而为。', dos:'宜：泡脚、听雨声、写日记、喝温开水', donts:'忌：强行推进、冲动辞职、焦虑到失眠'},
  {lv:'中签', poem:'水至清则无鱼，人至察则无徒。\n难得糊涂，大智若愚。', dos:'宜：吃顿垃圾食品开心一下、看喜剧、睡午觉', donts:'忌：挑剔别人、钻牛角尖、对自己太苛刻'},
  {lv:'中签', poem:'人生如逆旅，我亦是行人。\n一切都会过去，包括此刻的迷茫。', dos:'宜：出去走走换口气、听喜欢的歌、喝奶茶三分糖', donts:'忌：胡思乱想到天亮、长时间刷负面新闻'},
  {lv:'中签', poem:'塞翁失马，焉知非福。\n今日得失，来日方知。', dos:'宜：保持平常心、存一笔钱、做顿健康餐', donts:'忌：大喜大悲、冲动消费、拿铁因子太多'},
  {lv:'中签', poem:'路漫漫其修远兮，\n吾将上下而求索。', dos:'宜：坚持运动、学一个拿手菜、早睡', donts:'忌：求快、走捷径、吃太多外卖'},
  {lv:'中签', poem:'明月几时有，把酒问青天。\n答案不在外面，在你自己心里。', dos:'宜：独处片刻、做几个深呼吸、喝热牛奶', donts:'忌：到处问人意见、轻信网络、睡前刷手机'},
  {lv:'中签', poem:'十年磨一剑，霜刃未曾试。\n你准备好了，但时机还未到。', dos:'宜：继续打磨自己、规律作息、吃坚果', donts:'忌：仓促出手、在朋友圈秀半成品'},
  {lv:'中签', poem:'两情若是久长时，\n又岂在朝朝暮暮。', dos:'宜：给对方空间、专注自己的事、健身', donts:'忌：黏人、患得患失、信息轰炸'},
  {lv:'中签', poem:'一花一世界，一叶一菩提。\n平凡之中自有深意。', dos:'宜：做一顿家常菜、打理绿植、感恩小事', donts:'忌：好高骛远、总羡慕别人的生活'},
  {lv:'中签', poem:'桃李不言，下自成蹊。\n做好自己，一切自会到来。', dos:'宜：默默努力、保持微笑、多吃蔬菜', donts:'忌：急于证明自己、和别人比较'},
  {lv:'中签', poem:'山不在高，有仙则名。\n水不在深，有龙则灵。', dos:'宜：深耕一个技能、午休小憩、喝柠檬水', donts:'忌：贪多嚼不烂、跟风报班、不吃午饭'},
  {lv:'中签', poem:'人有悲欢离合，月有阴晴圆缺。\n此事古难全。', dos:'宜：接受不完美、给自己放个假、吃甜点', donts:'忌：追求完美、自怨自艾、情绪化饮食'},
  {lv:'中签', poem:'旧时王谢堂前燕，\n飞入寻常百姓家。', dos:'宜：脚踏实地、逛菜市场、亲手做顿饭', donts:'忌：眼高手低、摆架子、只点外卖'},
  {lv:'中签', poem:'问渠那得清如许，\n为有源头活水来。', dos:'宜：去没去过的地方走走、认识新朋友、喝八杯水', donts:'忌：固步自封、吃老本、只喝奶茶不喝水'},
  {lv:'中签', poem:'纸上得来终觉浅，\n绝知此事要躬行。', dos:'宜：动手试试、户外活动、做一顿失败的菜也没关系', donts:'忌：光看教程不动手、收藏等于做了'},
  {lv:'中签', poem:'梅须逊雪三分白，\n雪却输梅一段香。', dos:'宜：找到自己的赛道、穿让你自信的衣服', donts:'忌：模仿别人、羡慕嫉妒、否定自己'},
  {lv:'中签', poem:'横看成岭侧成峰，\n远近高低各不同。', dos:'宜：换个角度看问题、散步时换条路走', donts:'忌：固执己见、一条道走到黑'},
  {lv:'中签', poem:'今朝有酒今朝醉，\n明日愁来明日愁。', dos:'宜：享受当下、和朋友小酌一杯、吃烤串', donts:'忌：过度焦虑未来、酗酒、暴饮暴食'},
  {lv:'中签', poem:'劝君更尽一杯酒，\n西出阳关无故人。', dos:'宜：给老朋友打视频、吃一顿送行饭', donts:'忌：不告而别、把话憋在心里'},
  {lv:'中签', poem:'小荷才露尖尖角，\n早有蜻蜓立上头。', dos:'宜：展示小成果、接受夸奖、穿亮色衣服', donts:'忌：害羞躲藏、觉得"还不够好"'},
  {lv:'下签', poem:'抽刀断水水更流，\n举杯消愁愁更愁。', dos:'宜：出门跑步流汗、找人倾诉、喝杯热可可', donts:'忌：借酒消愁、一个人憋着、深夜胡思乱想'},
  {lv:'下签', poem:'不识庐山真面目，\n只缘身在此山中。', dos:'宜：请教旁人意见、站远一点看、散步放空', donts:'忌：埋头硬干、以为自己全对、不听劝'},
  {lv:'下签', poem:'相见时难别亦难，\n东风无力百花残。', dos:'宜：温柔告别、写一封信给自己、吃顿好的安慰自己', donts:'忌：纠缠不放、反复联系、不吃不喝'},
  {lv:'下签', poem:'夕阳无限好，只是近黄昏。\n美好的事物正在消逝。', dos:'宜：拍照留念、感恩拥有、喝杯热茶看窗外', donts:'忌：沉溺于失去、活在回忆里'},
  {lv:'下签', poem:'欲渡黄河冰塞川，\n将登太行雪满山。', dos:'宜：停下来休息、做个 Spa、拉伸放松', donts:'忌：强行突破、冒险激进、不看路低头冲'},
  {lv:'下签', poem:'此情可待成追忆，\n只是当时已惘然。', dos:'宜：把遗憾写下来然后扔掉、向前看', donts:'忌：反复回想"如果当初"、后悔自责'},
  {lv:'下签', poem:'无可奈何花落去，\n似曾相识燕归来。', dos:'宜：清理旧物、等新机会、晒太阳发呆', donts:'忌：强留不属于你的东西、不甘心'},
  {lv:'下签', poem:'孤舟蓑笠翁，独钓寒江雪。\n此刻你需要独处。', dos:'宜：泡个热水澡、看书听音乐、早睡', donts:'忌：强融圈子、假装合群、在人群中感到孤独'},
  {lv:'下签', poem:'近乡情更怯，不敢问来人。\n你在害怕面对某件事。', dos:'宜：深呼吸、先做五分钟再说、找人陪着', donts:'忌：拖延到最后一刻、假装不存在'},
  {lv:'下签', poem:'多情自古空余恨，\n好梦由来最易醒。', dos:'宜：脚踏实地、检查合同细节、喝杯温水', donts:'忌：轻信画饼、冲动投资、迷信捷径'},
  {lv:'下签', poem:'出师未捷身先死，\n长使英雄泪满襟。', dos:'宜：养精蓄锐、锻炼身体增强体质、喝鸡汤', donts:'忌：盲目冲刺、熬夜加班、透支身体'},
  {lv:'下签', poem:'世间无限丹青手，\n一片伤心画不成。', dos:'宜：找个懂你的人说说话、哭一场也没关系', donts:'忌：假装没事、强颜欢笑、什么都不吃'},
  {lv:'下签', poem:'天长地久有时尽，\n此恨绵绵无绝期。', dos:'宜：彻底断舍离、删掉联系方式、去健身发泄', donts:'忌：反复回头看、视奸前任、不甘心'},
  {lv:'下签', poem:'同是天涯沦落人，\n相逢何必曾相识。', dos:'宜：找同病相怜的人聊天、互相取暖', donts:'忌：自我封闭、觉得全世界就你最惨'},
  {lv:'下下签', poem:'风萧萧兮易水寒，\n壮士一去兮不复还。', dos:'宜：保存实力、暂避锋芒、泡脚驱寒', donts:'忌：正面硬刚、孤注一掷、穿太少着凉'},
  {lv:'下下签', poem:'剪不断，理还乱，是离愁。\n别是一般滋味在心头。', dos:'宜：找信任的人聊聊、深呼吸十次、喝姜茶暖身', donts:'忌：做重大决定、迁怒于人、吃冷饮'},
  {lv:'下下签', poem:'前不见古人，后不见来者。\n念天地之悠悠，独怆然而涕下。', dos:'宜：给自己放一天假、什么也不做、晒太阳补能量', donts:'忌：硬撑、和所有人比较、否定自己的价值'},
  {lv:'下下签', poem:'人面不知何处去，\n桃花依旧笑春风。', dos:'宜：重新出发、换一个新环境、去公园看花', donts:'忌：在原地等待一个不会回来的人'},
  {lv:'下下签', poem:'物是人非事事休，欲语泪先流。\n有些事只能交给时间。', dos:'宜：允许自己悲伤、好好吃饭睡觉、慢慢来', donts:'忌：急着振作、假装已经好了、不吃不睡'},
  {lv:'下下签', poem:'庭院深深深几许，\n杨柳堆烟，帘幕无重数。', dos:'宜：走出去晒太阳、换一个环境透气、见见阳光', donts:'忌：把自己关起来、不见人、窗帘拉死'},
  {lv:'下下签', poem:'此去经年，应是良辰好景虚设。\n便纵有千种风情，更与何人说。', dos:'宜：写日记、学独处、养一只猫或植物作伴', donts:'忌：憋在心里烂掉、拒绝所有善意'},
  {lv:'下下签', poem:'十年生死两茫茫，\n不思量，自难忘。', dos:'宜：好好告别、烧一顿ta爱吃的菜、继续前行', donts:'忌：沉溺悲伤无法自拔、忽略身边还活着的人'},
];

const FORTUNE_SLIPS_EN = [
 { lv: 'Supreme', poem: 'Clouds part — the moon appears.\nFlowers bloom in their own time.\nHeaven\'s will is already within you.\nWhy ask when you\'ll return home?', dos: 'Do: Get some sun, eat a good meal, call your parents', donts: 'Don\'t: Sit still all day, drink sugary drinks, stay up scrolling' },
 { lv: 'Supreme', poem: 'The spring breeze lifts the horse\'s hooves —\nIn one day, see all the flowers of Chang\'an.', dos: 'Do: Take a bold leap, confess your feelings, eat hotpot', donts: 'Don\'t: Hesitate, drink iced coffee on an empty stomach, lie around all day' },
 { lv: 'Supreme', poem: 'Green mountains cannot block the river —\nIt flows east regardless.\nThe great river runs day and night.\nThis heart knows no end.', dos: 'Do: Walk 10,000 steps, learn a new recipe, save a little money', donts: 'Don\'t: Quit halfway, impulse shop, drink full-sugar coffee' },
 { lv: 'Supreme', poem: 'I searched for them among thousands —\nTurning back, there they stood,\nin the fading lantern light.', dos: 'Do: Tidy your room, call an old friend, look up at the sky', donts: 'Don\'t: Seek outside yourself, stare at your phone, ignore the people nearby' },
 { lv: 'Supreme', poem: 'A long wind will break the waves —\nI\'ll raise my sail and cross the sea.', dos: 'Do: Change your hairstyle, post on social media, eat noodles with extra egg', donts: 'Don\'t: Settle for the status quo, procrastinate till tomorrow, overthink' },
 { lv: 'Supreme', poem: 'Mountains and rivers seem to end —\nThen willows bloom and a new village appears.', dos: 'Do: Hold on a little longer, shift your perspective, drink a warm cup of tea', donts: 'Don\'t: Give up in despair, overthink in circles, late-night spiral' },
 { lv: 'Excellent', poem: 'A fair wind lifts me to the clouds.\nThe moment has come — do not hesitate.', dos: 'Do: Share for good luck, take a walk with a friend, sleep early tonight', donts: 'Don\'t: Go it alone, be too modest, stay up revenge-scrolling' },
 { lv: 'Excellent', poem: 'Plant one seed in spring,\nReap ten thousand grains in fall.\nWhat you sow now will bear rich fruit.', dos: 'Do: Hit the gym, learn a new skill, drink unsweetened soy milk', donts: 'Don\'t: Chase quick results, show off, drink on an empty stomach' },
 { lv: 'Excellent', poem: 'A bosom friend across the world\nIs as close as a neighbor.\nYour benefactor is right beside you.', dos: 'Do: Treat someone to a meal, ask for help when you need it, have afternoon tea outdoors', donts: 'Don\'t: Be cold or distant, tough it out alone, drink nothing but additives' },
 { lv: 'Excellent', poem: 'Floating clouds cannot block the view —\nFor I stand at the highest peak.', dos: 'Do: Read for half an hour, stretch, eat some fruit', donts: 'Don\'t: Obsess over trifles, scroll short videos till dawn, sit too long' },
 { lv: 'Excellent', poem: 'Don\'t worry about the road ahead —\nWho under heaven doesn\'t know your name?', dos: 'Do: Speak with confidence, update your resume, take a nice photo', donts: 'Don\'t: Doubt yourself, wear long johns and hate it, skip meals to lose weight' },
 { lv: 'Excellent', poem: 'When flowers bloom, pluck them —\nDon\'t wait till the branch is bare.', dos: 'Do: Go on that spontaneous trip, eat seasonal fruit, make the first move', donts: 'Don\'t: Be a perfectionist, wait till you\'re "ready"' },
 { lv: 'Excellent', poem: 'A thousand washings, a thousand siftings —\nOnly when the sand is gone does gold appear.', dos: 'Do: Stick to a good habit, drink more water, get some sun for vitamin D', donts: 'Don\'t: Job-hop impulsively, pull all-nighters, replace water with soda' },
 { lv: 'Excellent', poem: 'In heaven, we\'d be two birds flying wing to wing.\nOn earth, two trees with branches intertwined.', dos: 'Do: Hold hands on a walk, cook a meal for them, watch the sunset together', donts: 'Don\'t: Give the silent treatment, dredge up old fights, scroll on your phone instead' },
 { lv: 'Excellent', poem: 'Now I know the face of the east wind —\nA thousand purples, ten thousand reds — it is always spring.', dos: 'Do: Visit a park, take photos of your life, have a barbecue', donts: 'Don\'t: Stay home all day, complain endlessly, skip breakfast' },
 { lv: 'Excellent', poem: 'A thousand sails pass the sunken ship —\nTen thousand trees spring forth beside the withered one.', dos: 'Do: Declutter old things, put on fresh bedsheets, eat something really good', donts: 'Don\'t: Dwell on memories, compare yourself to others, skip exercise' },
 { lv: 'Excellent', poem: 'I will climb to the highest peak —\nAnd see all the mountains shrink below.\nOpen your mind; the world opens with it.', dos: 'Do: Hike a mountain, make an annual plan, drink green tea', donts: 'Don\'t: Sweat the small stuff, be petty, stare at screens all day' },
 { lv: 'Excellent', poem: 'Though I lack the phoenix\'s colorful wings,\nOur hearts share the same unspoken thread.', dos: 'Do: Trust your intuition, send a warm message to a friend', donts: 'Don\'t: Over-explain, doubt others\' kindness' },
 { lv: 'Moderate', poem: 'Walk to where the water ends —\nSit and watch the clouds rise.\nNo rush, no force — flow with what comes.', dos: 'Do: Soak your feet, listen to the rain, journal, drink warm water', donts: 'Don\'t: Push too hard, quit your job impulsively, lose sleep to anxiety' },
 { lv: 'Moderate', poem: 'Water too clear has no fish.\nToo discerning has no friends.\nBlessed is the art of not knowing.', dos: 'Do: Eat some junk food guilt-free, watch a comedy, take a nap', donts: 'Don\'t: Nitpick others, obsess over details, be too hard on yourself' },
 { lv: 'Moderate', poem: 'Life is a traveler\'s inn —\nAnd I, too, am just passing through.\nEverything passes — including this confusion.', dos: 'Do: Step outside for fresh air, listen to your favorite song, drink milk tea at 30% sugar', donts: 'Don\'t: Overthink till dawn, binge bad news for hours' },
 { lv: 'Moderate', poem: 'The old man lost his horse —\nWho knows if it wasn\'t a blessing?\nToday\'s loss — only time will tell its meaning.', dos: 'Do: Keep an even keel, save some money, cook a healthy meal', donts: 'Don\'t: Ride emotional highs and lows, impulse spend, leak money on small daily purchases' },
 { lv: 'Moderate', poem: 'The road ahead is long and endless —\nI will search high and low.', dos: 'Do: Keep exercising, master one signature dish, sleep early', donts: 'Don\'t: Chase shortcuts, rely on too much takeout' },
 { lv: 'Moderate', poem: 'When will the bright moon appear?\nI raise my cup and ask the sky.\nThe answer isn\'t out there — it\'s inside you.', dos: 'Do: Spend a moment alone, take deep breaths, drink warm milk', donts: 'Don\'t: Ask everyone for advice, trust the internet blindly, scroll before bed' },
 { lv: 'Moderate', poem: 'Ten years sharpening a single sword —\nIts blade has never been tested.\nYou\'re ready, but the time hasn\'t come.', dos: 'Do: Keep refining yourself, maintain a routine, eat some nuts', donts: 'Don\'t: Launch prematurely, show half-finished work on social media' },
 { lv: 'Moderate', poem: 'If love between two hearts can last —\nWhy must they be together day and night?', dos: 'Do: Give them space, focus on your own things, work out', donts: 'Don\'t: Be clingy, second-guess everything, message-bomb them' },
 { lv: 'Moderate', poem: 'One flower — one world.\nOne leaf — one wisdom.\nProfound meaning hides in the ordinary.', dos: 'Do: Cook a simple meal, tend your plants, appreciate small blessings', donts: 'Don\'t: Aim too high, envy everyone else\'s life' },
 { lv: 'Moderate', poem: 'The peach and plum trees speak not —\nYet a path forms beneath them.\nBe yourself, and everything will come.', dos: 'Do: Work quietly, keep smiling, eat more vegetables', donts: 'Don\'t: Rush to prove yourself, compare yourself to others' },
 { lv: 'Moderate', poem: 'A mountain needs no height to be famous —\nIf immortals dwell there.\nWater needs no depth to be magical —\nIf dragons live within.', dos: 'Do: Deepen one skill, take a power nap, drink lemon water', donts: 'Don\'t: Spread yourself too thin, sign up for every course, skip lunch' },
 { lv: 'Moderate', poem: 'People have joy and sorrow, parting and reunion.\nThe moon waxes and wanes —\nIt has always been this way.', dos: 'Do: Accept imperfection, give yourself a break, eat dessert', donts: 'Don\'t: Chase perfection, wallow in self-pity, emotionally eat' },
 { lv: 'Moderate', poem: 'The swallows that nested in grand halls —\nNow fly into ordinary homes.', dos: 'Do: Keep your feet on the ground, browse the farmers\' market, cook from scratch', donts: 'Don\'t: Aim high but do nothing, put on airs, order takeout for every meal' },
 { lv: 'Moderate', poem: 'Ask the canal — how is your water so clear?\nBecause fresh water flows in from the source.', dos: 'Do: Go somewhere you\'ve never been, meet someone new, drink eight glasses of water', donts: 'Don\'t: Stay stuck in your ways, rest on past success, drink only milk tea' },
 { lv: 'Moderate', poem: 'What you learn from books is shallow —\nTrue knowledge comes from doing it yourself.', dos: 'Do: Try it with your hands, do something outdoors, even a failed dish is a win', donts: 'Don\'t: Just watch tutorials, treat "saved" as "done"' },
 { lv: 'Moderate', poem: 'Plum blossoms may lack the snow\'s pure white —\nBut snow lacks the plum\'s fragrance.', dos: 'Do: Find your own lane, wear what makes you confident', donts: 'Don\'t: Copy others, envy others, deny your own worth' },
 { lv: 'Moderate', poem: 'Viewed from the side — a ridge. From the front — a peak.\nNear or far, high or low — each angle is different.', dos: 'Do: See things from another angle, take a different route on your walk', donts: 'Don\'t: Be stubborn, keep going the same dead-end way' },
 { lv: 'Moderate', poem: 'Drink today\'s wine today —\nTomorrow\'s worries belong to tomorrow.', dos: 'Do: Enjoy the present moment, have a small drink with a friend, eat barbecue', donts: 'Don\'t: Over-worry about the future, drink to excess, binge eat' },
 { lv: 'Moderate', poem: 'Let me pour you one more cup —\nWest of the pass, there\'ll be no old friends.', dos: 'Do: Video-call an old friend, share a farewell meal', donts: 'Don\'t: Leave without saying goodbye, keep everything bottled up' },
 { lv: 'Moderate', poem: 'A tiny lotus bud just peeks above the water —\nAnd already a dragonfly has perched upon it.', dos: 'Do: Share a small achievement, accept compliments, wear bright colors', donts: 'Don\'t: Hide in shyness, think it\'s "not good enough yet"' },
 { lv: 'Poor', poem: 'You draw a blade to cut the water — it flows faster.\nYou raise a cup to drown sorrow — it only deepens.', dos: 'Do: Go for a run and sweat it out, talk to someone you trust, drink hot cocoa', donts: 'Don\'t: Drown your sorrows, bottle it up, spiral alone late at night' },
 { lv: 'Poor', poem: 'You cannot see the true shape of the mountain —\nBecause you are standing on it.', dos: 'Do: Ask someone for their perspective, step back and look again, take a walk to clear your head', donts: 'Don\'t: Keep pushing blindly, assume you\'re always right, ignore advice' },
 { lv: 'Poor', poem: 'Hard to meet — and hard to part.\nThe east wind is weak, a hundred flowers wither.', dos: 'Do: Say a gentle goodbye, write a letter to yourself, comfort yourself with good food', donts: 'Don\'t: Cling and refuse to let go, keep reaching out, stop eating' },
 { lv: 'Poor', poem: 'The sunset is infinitely beautiful —\nOnly, dusk is near.\nSomething beautiful is fading.', dos: 'Do: Take a photo to remember, be grateful for what you have, sip tea and gaze out the window', donts: 'Don\'t: Drown in loss, live in the past' },
 { lv: 'Poor', poem: 'I try to cross the Yellow River — ice blocks my way.\nI try to climb the Taihang Mountains — snow fills the pass.', dos: 'Do: Stop and rest, get a massage, stretch and relax', donts: 'Don\'t: Force a breakthrough, take reckless risks, charge ahead with your head down' },
 { lv: 'Poor', poem: 'These feelings — now they\'re only memories.\nAt the time, I was too lost to understand.', dos: 'Do: Write down your regret, then throw it away. Look forward.', donts: 'Don\'t: Replay "what if" on a loop, drown in regret and self-blame' },
 { lv: 'Poor', poem: 'Nothing can stop the flowers falling —\nBut look — the swallows that return feel familiar.', dos: 'Do: Clear out old things, wait for new opportunities, bask in the sun and daydream', donts: 'Don\'t: Cling to what isn\'t yours, refuse to accept it\'s over' },
 { lv: 'Poor', poem: 'A lone boat, a straw cloak, an old man —\nFishing alone in the cold river snow.\nRight now, you need solitude.', dos: 'Do: Take a hot bath, read a book and listen to music, sleep early', donts: 'Don\'t: Force yourself into social circles, pretend to fit in, feel lonely in a crowd' },
 { lv: 'Poor', poem: 'Approaching home — my heart grows timid.\nI dare not ask the ones who come.\nYou\'re afraid to face something.', dos: 'Do: Take a deep breath, just do the first five minutes, bring someone with you', donts: 'Don\'t: Procrastinate to the last second, pretend it doesn\'t exist' },
 { lv: 'Poor', poem: 'Too much love — only endless regret.\nThe sweetest dreams are always the first to wake.', dos: 'Do: Keep your feet on the ground, check the fine print, drink warm water', donts: 'Don\'t: Believe empty promises, invest impulsively, fall for shortcuts' },
 { lv: 'Poor', poem: 'The army marched out, but the general fell first —\nHeroes shed tears through the ages.', dos: 'Do: Conserve your strength, build your body through exercise, drink nourishing soup', donts: 'Don\'t: Sprint blindly into battle, pull all-nighters, burn out your body' },
 { lv: 'Poor', poem: 'In all the world, countless master painters —\nYet none can paint a broken heart.', dos: 'Do: Find someone who understands you and talk, crying is okay too', donts: 'Don\'t: Pretend you\'re fine, force a smile, eat nothing at all' },
 { lv: 'Poor', poem: 'Heaven and earth will one day end —\nBut this ache goes on and on.', dos: 'Do: Cut ties completely, delete their contact, go to the gym and sweat it out', donts: 'Don\'t: Keep looking back, stalk your ex, refuse to let go' },
 { lv: 'Poor', poem: 'We are both wanderers at the edge of the world —\nWhy need we have met before to understand?', dos: 'Do: Find someone who\'s been through the same, keep each other warm', donts: 'Don\'t: Isolate yourself, think you\'re the only one suffering' },
 { lv: 'Dire', poem: 'The wind howls — the Yi River is cold.\nThe hero rides out — and will not return.', dos: 'Do: Save your strength, avoid the front line, soak your feet to ward off cold', donts: 'Don\'t: Charge in headfirst, gamble everything, wear too little and catch a chill' },
 { lv: 'Dire', poem: 'Cut — it won\'t sever.\nUntangle — it only knots more.\nThis is the taste of parting sorrow.\nAn unnamable ache in the heart.', dos: 'Do: Talk to someone you trust, take ten deep breaths, drink ginger tea to warm up', donts: 'Don\'t: Make big decisions, take anger out on others, drink cold beverages' },
 { lv: 'Dire', poem: 'No ancients before me —\nNo successors behind.\nThinking of the vastness of heaven and earth,\nAlone, my tears fall.', dos: 'Do: Give yourself a day off, do nothing at all, sunbathe to recharge', donts: 'Don\'t: Tough it out, compare yourself to everyone, deny your own worth' },
 { lv: 'Dire', poem: 'I don\'t know where they\'ve gone —\nBut the peach blossoms still smile in the spring breeze.', dos: 'Do: Start fresh, change your environment, go to a park and see the flowers', donts: 'Don\'t: Wait in the same place for someone who won\'t return' },
 { lv: 'Dire', poem: 'Everything has changed — nothing remains.\nI try to speak but tears come first.\nSome things only time can heal.', dos: 'Do: Allow yourself to grieve, eat well and sleep well, take it slowly', donts: 'Don\'t: Rush to be "fine" again, pretend you\'ve already healed, stop eating and sleeping' },
 { lv: 'Dire', poem: 'Deep, deep the courtyard — how deep?\nWillows piled on willows, curtains upon curtains —\nNo end in sight.', dos: 'Do: Go outside into the sun, change your environment for fresh air, see the daylight', donts: 'Don\'t: Lock yourself away, avoid people, keep the curtains drawn tight' },
 { lv: 'Dire', poem: 'After all these years —\nEven the most beautiful scenes feel empty.\nA thousand feelings — and no one to tell.', dos: 'Do: Keep a journal, learn to be alone, get a cat or a plant for company', donts: 'Don\'t: Let it rot inside you, reject every kindness offered' },
 { lv: 'Dire', poem: 'Ten years — life and death — vast and boundless.\nI do not think of them — yet I cannot forget.', dos: 'Do: Say a proper goodbye, cook their favorite dish, keep walking forward', donts: 'Don\'t: Drown in grief forever, ignore the living who are still here' }
];
function FORTUNE_SLIPS() { return (window._lang && window._lang() === 'en') ? FORTUNE_SLIPS_EN : FORTUNE_SLIPS_ZH; }

const RP_TIERS_ZH = [
  {min:95,  label:'气运之子',  emoji:'👑', tip:'去买彩票不如去表白——今天的你是被宇宙亲吻过的人。'},
  {min:85,  label:'吉星高照',  emoji:'🌟', tip:'今天的幸运女神在你这边，做什么都顺。大方地接受赞美和好运吧。'},
  {min:70,  label:'顺风顺水',  emoji:'🌈', tip:'不错的一天，小事顺利，大事可期。保持微笑，好运会被你吸引过来。'},
  {min:50,  label:'平平淡淡',  emoji:'🌤️', tip:'没有惊喜也没有惊吓，平凡也是一种幸福。今天的主题是"稳"。'},
  {min:30,  label:'小有波折',  emoji:'🌧️', tip:'可能有点小不顺，但不足以影响你的好心情。水逆吗？不，只是你太着急了。'},
  {min:15,  label:'诸事不宜',  emoji:'⛈️', tip:'今天适合低调——能不出门就不出门，能不说话就不说话。忍一天，明天再来。'},
  {min:0,   label:'触底反弹',  emoji:'🌪️', tip:'人品已跌至谷底——别担心，这说明明天只会更好。今天适合：吃饭、睡觉、看剧，不干正事。'},
];
const RP_TIERS_EN = [
  {min:95,  label:'Fortune\'s Child',  emoji:'👑', tip:'Forget the lottery — go confess your feelings. Today the universe has kissed your forehead.'},
  {min:85,  label:'Star-Blessed',  emoji:'🌟', tip:'Lady Luck is on your side today. Everything flows. Accept compliments and good fortune with grace.'},
  {min:70,  label:'Smooth Sailing',  emoji:'🌈', tip:'A lovely day — small things go well, big things look promising. Keep smiling and luck will find you.'},
  {min:50,  label:'Steady as She Goes',  emoji:'🌤️', tip:'No surprises, good or bad. Ordinary is its own kind of happiness. Today\'s theme: steady.'},
  {min:30,  label:'Minor Turbulence',  emoji:'🌧️', tip:'A few bumps, but nothing that should ruin your mood. Mercury retrograde? No, you\'re just rushing.'},
  {min:15,  label:'Everything Against You',  emoji:'⛈️', tip:'Today is for laying low — stay home if you can, stay quiet if you can\'t. Endure one day, come back tomorrow.'},
  {min:0,   label:'Bounce Back',  emoji:'🌪️', tip:'Rock bottom — don\'t worry, it only means tomorrow will be better. Today\'s agenda: eat, sleep, watch shows. Nothing productive.'},
];
function RP_TIERS() { return (window._lang && window._lang() === 'en') ? RP_TIERS_EN : RP_TIERS_ZH; }

const LUCKY_COLORS_ZH = ['琥珀金','深空蓝','玫瑰粉','翡翠绿','紫罗兰','珊瑚橙','月光银','墨玉黑','珊瑚红','天青','杏黄','靛蓝'];
const LUCKY_COLORS_EN = ['Amber Gold','Deep Space Blue','Rose Pink','Jade Green','Violet','Coral Orange','Moonlight Silver','Onyx Black','Coral Red','Sky Cyan','Apricot Yellow','Indigo'];
const LUCKY_DIRS_ZH  = ['东南方','正北','西南','正东','西北','正南','东北','正西'];
const LUCKY_DIRS_EN  = ['Southeast','North','Southwest','East','Northwest','South','Northeast','West'];
function LUCKY_COLORS() { return (window._lang && window._lang() === 'en') ? LUCKY_COLORS_EN : LUCKY_COLORS_ZH; }
function LUCKY_DIRS() { return (window._lang && window._lang() === 'en') ? LUCKY_DIRS_EN : LUCKY_DIRS_ZH; }

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
  const venusSign = chartSignName(chartData1.positions.Venus);
  const SIGN_COLORS_ZH = {
    '白羊座':'珊瑚红','金牛座':'翡翠绿','双子座':'天青','巨蟹座':'月光银',
    '狮子座':'琥珀金','处女座':'墨玉黑','天秤座':'玫瑰粉','天蝎座':'深空蓝',
    '射手座':'紫罗兰','摩羯座':'靛蓝','水瓶座':'杏黄','双鱼座':'珊瑚橙'
  };
  const SIGN_COLORS_EN = {
    '白羊座':'Coral Red','金牛座':'Jade Green','双子座':'Sky Cyan','巨蟹座':'Moonlight Silver',
    '狮子座':'Amber Gold','处女座':'Onyx Black','天秤座':'Rose Pink','天蝎座':'Deep Space Blue',
    '射手座':'Violet','摩羯座':'Indigo','水瓶座':'Apricot Yellow','双鱼座':'Coral Orange'
  };
  const DIRS_BY_HOUSE_ZH = ['正东','东北','正北','西北','正西','西南','正南','东南','正东','东北','正北','西北'];
  const DIRS_BY_HOUSE_EN = ['East','Northeast','North','Northwest','West','Southwest','South','Southeast','East','Northeast','North','Northwest'];
  const jupHouse = (chartData1.houses && chartData1.houses.Jupiter) || 1;
  const sunDeg = Math.floor(chartData1.positions.Sun % 30);

  return {
    color: isEn ? (SIGN_COLORS_EN[venusSign] || LUCKY_COLORS()[Math.floor(score % LUCKY_COLORS.length)]) : (SIGN_COLORS_ZH[venusSign] || LUCKY_COLORS()[Math.floor(score % LUCKY_COLORS.length)]),
    dir: isEn ? (DIRS_BY_HOUSE_EN[jupHouse - 1] || LUCKY_DIRS()[Math.floor(score % LUCKY_DIRS.length)]) : (DIRS_BY_HOUSE_ZH[jupHouse - 1] || LUCKY_DIRS()[Math.floor(score % LUCKY_DIRS.length)]),
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
  const weights = {上上签:5, 上签:10, 中签:15, 下签:10, 下下签:5};
  const pool = [];
  for (const s of FORTUNE_SLIPS()) { for (let i=0; i<(weights[s.lv]||1); i++) pool.push(s); }
  return pool[Math.floor(Math.random() * pool.length)];
}

function openDailyFortune() {
  const today = todayKey();
  const lastDate = localStorage.getItem('fortune_date'+personKey());
  let extra = parseInt(localStorage.getItem('fortune_extra_'+today+personKey()) || '0');

  if (lastDate === today && localStorage.getItem('fortune_slip'+personKey()) && extra <= 0) {
    const slip = JSON.parse(localStorage.getItem('fortune_slip'+personKey()));
    let html = '<h3>' + _t('lodge.dailyFortune') + '</h3>';
    html += '<p style="color:var(--text-dim);font-size:0.85em;">' + _t('fortune.alreadyDrawn') + '</p>';
    html += renderFortuneResult(slip);
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
  const slip = drawFortuneSlip();
  localStorage.setItem('fortune_date'+personKey(), todayKey());
  localStorage.setItem('fortune_slip'+personKey(), JSON.stringify(slip));

  let html = '<h3>' + _t('lodge.dailyFortune') + '</h3>';
  html += renderFortuneResult(slip);
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

function renderFortuneResult(slip) {
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
    color = LUCKY_COLORS()[Math.floor(Math.abs(score * 7) % LUCKY_COLORS.length)];
    dir = LUCKY_DIRS()[Math.floor(Math.abs(score * 13) % LUCKY_DIRS.length)];
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

// ═══ 答案之书 ═══════════════════════════════════════════════════════════════
const BOOK_ANSWERS_ZH = [
  '是的，毫无疑问。','现在还不是时候。','跟随你的直觉。','答案就在你心中。','勇敢迈出第一步吧。','保持耐心，好事将至。','这是正确的方向。','换一个角度去看。','放下你的顾虑吧。','不要急于求成。','它会以你意想不到的方式到来。','先照顾好自己，答案自会出现。','你要的答案，其实你一直都知道。','相信过程，而非结果。','值得等待。','行动比答案更重要。','先放一放，过几天再问。','时机未到。','宇宙正在为你铺路，别急。','当你不问的时候，答案会自己来找你。','你早已知道该怎么做。','这个问题本身，比答案更有意义。','再坚持一下，就快到了。','可以，但要注意方式。','向左走，而不是向右。','别问了，去做吧。','你会在梦里找到线索。','找一个安静的地方待一会，你会听见。','先吃顿好的，然后再想。','去大自然里走走，答案在那里。','答案也许是一个你没有预料到的人。','它比你想象的要简单。','此刻的不确定，正是答案的一部分。','相信那个让你心跳加快的选择。','别问别人，问你自己。','你值得更好的。','来日方长，不急。','把手机关掉，你就知道了。','先睡一觉，明天再说。',
];
const BOOK_ANSWERS_EN = [
  'Yes, without a doubt.','Not the right time yet.','Follow your intuition.','The answer lies within you.','Take the first bold step.','Be patient — good things are coming.','It is the right direction.','Look at it from another angle.','Let go of your worries.','Don\'t rush it.','It will come in a way you least expect.','Take care of yourself first — the answer will follow.','You already know the answer you seek.','Trust the process, not the outcome.','Worth the wait.','Action matters more than answers.','Put it aside for a few days, then ask again.','The time is not yet ripe.','The universe is paving the way — be patient.','When you stop asking, the answer will find you.','You already know what to do.','The question itself is more meaningful than the answer.','Hold on a little longer — you\'re almost there.','Yes, but mind your approach.','Go left, not right.','Stop asking and just do it.','You\'ll find a clue in your dreams.','Find a quiet place and listen — you\'ll hear it.','Have a good meal first, then think.','Take a walk in nature — the answer is there.','The answer may be someone you didn\'t expect.','It\'s simpler than you think.','The uncertainty right now is part of the answer.','Trust the choice that makes your heart beat faster.','Don\'t ask others — ask yourself.','You deserve better.','There\'s plenty of time — no rush.','Turn off your phone and you\'ll know.','Sleep on it — ask again tomorrow.',
];
function BOOK_ANSWERS() { return (window._lang && window._lang() === 'en') ? BOOK_ANSWERS_EN : BOOK_ANSWERS_ZH; }

function openAnswerBook() {
  const answer = BOOK_ANSWERS()[Math.floor(Math.random() * BOOK_ANSWERS.length)];
  let html = '<h3>' + _t('book.title') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:16px;">' + _t('book.prompt') + '</p>';
  html += '<div class="book-stage" id="bookStage" onclick="flipTheBook()">';
  var isEn = window._lang && window._lang() === 'en';
  html += '<div class="book-cover"><span class="book-cover-text" style="'+(isEn?'writing-mode:horizontal-tb;font-size:1.1em;letter-spacing:0.15em;':'')+'">'+_L('答案之书','BOOK OF ANSWERS')+'</span></div>';
  // Page layers stacked under the cover
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer" id="finalPage">' + answer + '</div>';
  html += '</div>';
  html += '<p style="color:var(--text-dim);font-size:0.78em;" id="bookHint">' + _t('book.hint') + '</p>';
  showGameModal(html);
}

function pickRandomAnswer() {
  return BOOK_ANSWERS()[Math.floor(Math.random() * BOOK_ANSWERS.length)];
}

function flipTheBook() {
  const stage = document.getElementById('bookStage');
  const hint = document.getElementById('bookHint');
  if (!stage || stage.classList.contains('flipping')) return;
  stage.classList.add('flipping');
  if (hint) hint.textContent = _t('book.flipping');
  // After all pages flip, show the answer card
  setTimeout(() => {
    const answer = document.getElementById('finalPage');
    const text = answer ? answer.textContent : '';
    stage.innerHTML = '<div class="book-answer">' + text + '</div>';
    if (hint) hint.textContent = '';
  }, 850);
}

// ═══ 魔法八球 ═══════════════════════════════════════════════════════════════
const BALL_ANSWERS_ZH = [
  '毫无疑问','是的','看起来不错','很可能是','迹象表明：是','星象显示：YES',
  '再问一次','现在说不准','稍后再问','天机不可泄露','换个问法吧',
  '别指望了','我的回答：否','可能性不大','非常可疑','星象显示：NO',
];
const BALL_ANSWERS_EN = [
  'Without a doubt','Yes','Looks good','Most likely','Signs point to: Yes','The stars say: YES',
  'Ask again','Unclear right now','Try again later','The stars keep their secrets','Try a different question',
  'Don\'t count on it','My answer is: No','Not likely','Highly doubtful','The stars say: NO',
];
function BALL_ANSWERS() { return (window._lang && window._lang() === 'en') ? BALL_ANSWERS_EN : BALL_ANSWERS_ZH; }

function openMagicBall() {
  let html = '<h3>' + _t('magic8.title') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:16px;">' + _t('magic8.prompt') + '</p>';
  html += '<div class="ball-container" id="magicBall" onclick="shakeBall()">';
  html += '<div class="ball-answer-window" id="ballWindow"><span class="star-cluster"><span class="star-big">✦</span><span class="star-small star-tl">✧</span><span class="star-small star-br">✧</span></span></div>';
  html += '</div>';
  html += '<p style="color:var(--text-dim);font-size:0.78em;">' + _t('magic8.hint') + '</p>';
  showGameModal(html);
}

function shakeBall() {
  const ball = document.getElementById('magicBall');
  const win = document.getElementById('ballWindow');
  if (!ball || ball.classList.contains('shaking')) return;
  ball.classList.add('shaking');
  win.textContent = '...';
  setTimeout(() => {
    ball.classList.remove('shaking');
    const answer = BALL_ANSWERS()[Math.floor(Math.random() * BALL_ANSWERS.length)];
    win.textContent = answer;
    win.style.fontSize = answer.length > 6 ? '0.6em' : '0.7em';
  }, 500);
}

// ═══ 单张塔罗 ═══════════════════════════════════════════════════════════════
function openSingleTarot() {
  // Reuse existing deck if available, or build fresh
  let deck = window._singleDeck;
  if (!deck || deck.length < 10) {
    deck = buildDeck ? buildDeck() : [];
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    window._singleDeck = deck;
  }

  let html = '<h3>' + _t('singletarot.title') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:14px;">' + _t('singletarot.prompt') + '</p>';
  html += '<div class="tarot-pick-row">';
  for (let i = 0; i < 7; i++) {
    html += '<div class="tarot-pick-card" onclick="revealTarotCard(' + i + ')" id="tarotPick' + i + '"><div class="card-back-pattern"></div></div>';
  }
  html += '</div>';
  showGameModal(html);
}

function revealTarotCard(idx) {
  let deck = window._singleDeck;
  if (!deck || deck.length < idx + 1) { deck = buildDeck ? buildDeck() : []; window._singleDeck = deck; }
  const card = deck[idx % deck.length];
  const isRev = Math.random() < 0.2;
  const name = (card.name || card.suit + card.rank);
  const desc = isRev ? (card.rev || card.up || '') : (card.up || '');

  let html = '<h3>' + _t('singletarot.title') + '</h3>';
  html += '<div class="tarot-reveal-card" style="text-align:center;">';
  html += '<p style="color:var(--accent);font-size:1.1em;font-weight:bold;margin-bottom:6px;">' + name + '</p>';
  if (isRev) html += '<span class="reversed-badge" style="display:inline-block;margin-bottom:8px;">' + _t('tarot.reversed') + '</span>';
  html += '<p style="color:#b8b8c8;font-size:0.82em;line-height:1.7;">' + (desc.length > 120 ? desc.substring(0,120) + '...' : desc) + '</p>';
  html += '</div>';
  html += '<p style="color:var(--text-dim);font-size:0.75em;margin-top:12px;">' + _t('tarot.cardHint') + '</p>';
  html += '<button class="share-btn" onclick="openSingleTarot()">' + _t('singletarot.drawAgain') + '</button>';

  document.getElementById('gameModal').innerHTML = '<button class="game-close" onclick="closeGameModal()">✕</button>' + html;
}

// ═══ 星座速配 ═══════════════════════════════════════════════════════════════
const ZODIAC_SIGNS_ZH = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const ZODIAC_SIGNS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function ZODIAC_SIGNS() { return (window._lang && window._lang() === 'en') ? ZODIAC_SIGNS_EN : ZODIAC_SIGNS_ZH; }

function openZodiacMatch() {
  let html = '<h3>' + _t('zodiac.title') + '</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:14px;">' + _t('zodiac.prompt') + '</p>';
  html += '<div class="zodiac-select-row">';
  html += '<select id="zSign1">';
  for (let i = 0; i < 12; i++) { html += '<option value="' + i + '">' + getZodiacSignName(i) + '</option>'; }
  html += '</select>';
  html += '<span class="match-heart">💕</span>';
  html += '<select id="zSign2">';
  for (let i = 0; i < 12; i++) {
    html += '<option value="' + i + '"' + (i === 6 ? ' selected' : '') + '>' + getZodiacSignName(i) + '</option>';
  }
  html += '</select>';
  html += '</div>';
  html += '<button class="share-btn" onclick="calculateMatch()" style="margin-top:0;">' + _t('zodiac.calculate') + '</button>';
  html += '<div id="matchResult" style="margin-top:16px;"></div>';
  showGameModal(html);
}

function calculateMatch() {
  const i1 = parseInt(document.getElementById('zSign1').value);
  const i2 = parseInt(document.getElementById('zSign2').value);
  const sameMod = (i1 % 3) === (i2 % 3); // same modality
  const elements = ['火','土','风','水','火','土','风','水','火','土','风','水'];
  const e1 = elements[i1], e2 = elements[i2];
  const sameElem = e1 === e2;
  const compatible = (e1==='火'&&e2==='风')||(e1==='风'&&e2==='火')||(e1==='土'&&e2==='水')||(e1==='水'&&e2==='土');

  let base = 50;
  if (i1 === i2) base = 85 + Math.floor(Math.random() * 15);
  else if (sameElem) base = 70 + Math.floor(Math.random() * 20);
  else if (compatible) base = 65 + Math.floor(Math.random() * 20);
  else if (sameMod) base = 55 + Math.floor(Math.random() * 20);
  else base = 35 + Math.floor(Math.random() * 30);

  const score = Math.min(99, base);

  const taglines = (window._lang && window._lang() === 'en') ? [
    'A match made in heaven! The universe arranged this meeting.',
    'A deep connection — cherish each other.',
    'You feel so comfortable together, like old souls reuniting.',
    'Sparks fly! Exciting, but needs some work.',
    'You understand each other with just a glance — perfect chemistry.',
    'Together, you\'re the sweetest couple in the room.',
    'You complement each other beautifully — a great team.',
    'You may be each other\'s lesson — but it\'s worth it.',
    'Take it slow — you need time to truly know each other.',
    'Great as friends, but think carefully about romance.',
    'Big personality differences — exciting but risky.',
    'There\'s potential, but both must be willing to work at it.',
  ] : [
    '天生一对！你们的相遇是宇宙的安排。',
    '缘分很深，好好珍惜彼此吧。',
    '你们在一起会很舒服，像认识了很久。',
    '火花四溅的组合！刺激但需要磨合。',
    '一个眼神就能懂对方，默契满分。',
    '你俩在一起就是朋友圈里最甜的那对。',
    '彼此互补，是很好的搭档型关系。',
    '你们可能是彼此的课题——但值得。',
    '慢慢来，你们需要时间了解对方。',
    '可以做朋友，但恋爱需要多考虑。',
    '性格差异大，但吸引力和危险并存。',
    '缘分有，但需要双方都愿意努力。',
  ];

  const idx = Math.floor((score * 7 + i1 * 13 + i2 * 3) % taglines.length);
  const tagline = taglines[idx];

  let clr = score >= 80 ? '#7ab87a' : score >= 60 ? '#c9a96e' : '#c87070';
  let html = '<div class="match-score-ring" style="border-color:' + clr + ';color:' + clr + ';">' + score + '%</div>';
  html += '<div class="match-tagline">' + tagline + '</div>';
  html += '<div class="match-detail">' + s1 + ' × ' + s2 + '</div>';

  document.getElementById('matchResult').innerHTML = html;
}

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
  r += '<h2 style="color:#333;">命 运 之 轮 · 星盘解读报告</h2>';
  r += '<p style="color:#666;">生成日期：' + now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日</p>';
  r += '</div>';

  // ═══ Tab 0: Natal report ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;">✦ 本命星盘深度解读</h3>';
  r += generateDeepNatalReport(d.positions, d.houses, d.aspects, d.asc, d.mc);

  // ═══ Tab 5: Career Genius ═══
  const userJob = document.getElementById('p1_job') ? document.getElementById('p1_job').value.trim() : '';
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 职业天赋诊断</h3>';
  r += generateCareerGenius(d.positions, d.houses, d.aspects, d.asc, d.mc, userJob);

  // ═══ Tab 6: Relationships ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 人际缘分分析</h3>';
  r += generateRelationships(d.positions, d.houses, d.aspects, d.asc);

  // ═══ Tab 2: Synastry (if available) ═══
  if (chartData2) {
    r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 合盘缘分分析</h3>';
    r += generateSynastryReport(d.positions, chartData2.positions, d.asc, chartData2.asc);
  }

  // ═══ Tab 3: Daily Guidance ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 今日星盘指引</h3>';
  r += generateGuidance(d.positions, d.houses, d.asc);

  // ═══ Tab 1: Fortune (all sub-modules) ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 本周运势</h3>';
  r += generateWeeklyFortune(d.positions, d.houses, d.asc);
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 本月运势</h3>';
  r += generateMonthlyFortune(d.positions, d.houses, d.asc);
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 年度运势</h3>';
  r += generateYearlyFortune(d.positions, d.houses, d.asc, d.mc);
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 五年运势展望</h3>';
  r += generateDeepForecast(d.positions, d.houses, d.mc);

  // ═══ Tab 4: Tarot (if drawn) ═══
  if (tarotState.drawn.length > 0 && tarotState.flipped >= tarotState.drawn.length) {
    r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 塔罗占卜</h3>';
    r += '<p style="color:#666;">问题：' + (tarotState.question || '综合运势') + '</p>';
    for (let i = 0; i < tarotState.drawn.length; i++) {
      const card = tarotState.drawn[i];
      const posLabel = tarotState.spread === 'three' ? ['过去','现在','未来'][i] : '指引';
      r += '<p><strong>' + posLabel + '：' + card.name + '</strong>' + (card.isReversed ? '（逆位）' : '') + '<br>';
      r += (card.isReversed ? (card.rev || card.up) : card.up) + '</p>';
    }
  }

  // ═══ Tab 7: Deep Consultation (if there's a current result) ═══
  if (window._consultResult) {
    r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 深度咨询</h3>';
    r += window._consultResult;
  }

  // ═══ Planet data table ═══
  r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ 星盘数据</h3>';
  r += '<table style="width:100%;border-collapse:collapse;font-size:0.85em;">';
  r += '<tr style="background:#eee;"><th>' + _t('table.planet') + '</th><th>' + _t('table.position') + '</th><th>' + _t('table.house') + '</th><th>' + _t('table.element') + '</th><th>' + _t('table.mode') + '</th></tr>';
  for (const p of PLANETS) {
    const lon = d.positions[p.id];
    const {si, d:dd, m} = degToSign(lon);
    const h = d.houses[p.id] || '?';
    r += '<tr><td>' + p.name + '</td><td>' + getSignNamePure(si) + ' ' + dd + '°' + String(m).padStart(2,'0') + '′</td><td>第' + h + '宫</td><td>' + ELEMENTS[si] + '</td><td>' + MODES[si] + '</td></tr>';
  }
  r += '</table>';

  // Disclaimer
  r += '<p style="text-align:center;color:#999;font-size:0.8em;margin-top:30px;">星辰不为任何人改写轨迹，星盘也从不替你掌舵。<br>本报告仅供自我觉察与灵性探索之参考。</p>';

  return r;
}

function downloadPDFReport() {
  if (!chartData1) { alert(_t('error.fillChart')); return; }

  var reportContent = buildReportHTML();
  var fullHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>星盘解读报告</title>';
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
  a.download = '星盘解读报告_' + new Date().toISOString().slice(0,10) + '.html';
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

  // Try EmailJS if configured, otherwise use copy-to-clipboard + mailto
  if (typeof emailjs !== 'undefined') {
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
      msg.textContent = '✓ 手机版报告已复制到剪贴板，直接粘贴到微信/QQ即可';
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
    msg.textContent = '✓ 手机版报告已复制到剪贴板';
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
    '  🔮 LunarVeilAstro · 星盘报告\n' +
    '  ' + now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日\n' +
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
