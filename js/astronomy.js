// astronomy.js — Planetary calculations, houses, aspects, shared utilities
// Functions: mod360, julianDay, calcSun, calcMoon, calcAllPlanets,
//   calcHouses, assignHouses, calcAspects, computeChart, shuffle, escHtml
// Depends on: nothing (pure math, _L from i18n.js)
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
  {name:"合", en:"Conjunction", angle:0, orb:8, cls:"aspect-neutral"},
  {name:"六合", en:"Sextile", angle:60, orb:6, cls:"aspect-good"},
  {name:"刑", en:"Square", angle:90, orb:7, cls:"aspect-hard"},
  {name:"三合", en:"Trine", angle:120, orb:8, cls:"aspect-good"},
  {name:"冲", en:"Opposition", angle:180, orb:8, cls:"aspect-hard"}
];

const _ASPECT_EN = { '合':'Conjunction','六合':'Sextile','刑':'Square','三合':'Trine','冲':'Opposition' };
function _aspectName(a) {
  const name = typeof a === 'string' ? a : a.name;
  return (window._lang && window._lang() === 'en') ? (_ASPECT_EN[name] || name) : name;
}

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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

