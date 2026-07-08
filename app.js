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
//  STARFIELD BACKGROUND — galaxy with colored stars & clusters
// ═══════════════════════════════════════════════════════════════════════════
(function() {
try {
  const c = document.getElementById('stars');
  const ctx = c.getContext('2d');
  let stars = [];
  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
  resize(); window.addEventListener('resize', resize);

  // Star color palette: warm cream, cool blue, purple tint, gold
  const starColors = [
    [200,190,160], [210,200,180], [185,175,155], // cream/white
    [160,180,210], [140,170,220], [150,160,200], // cool blue
    [190,170,210], [180,160,220], [170,150,200], // purple
    [220,200,150], [210,185,140], [230,210,170], // gold
    [170,190,200], [155,175,195], [180,195,215], // slate blue
    [200,180,190], [195,170,185]                // mauve
  ];

  // Galaxy cluster centers (in percentage of screen)
  const clusters = [
    {cx: 0.25, cy: 0.30, r: 0.20, density: 50},
    {cx: 0.68, cy: 0.42, r: 0.24, density: 55},
    {cx: 0.42, cy: 0.68, r: 0.18, density: 40},
    {cx: 0.78, cy: 0.22, r: 0.14, density: 25}
  ];

  function initStars() {
    stars = [];

    // Cluster stars
    for (const cl of clusters) {
      for (let i = 0; i < cl.density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * cl.r * c.width;
        stars.push({
          x: cl.cx * c.width + Math.cos(angle) * dist,
          y: cl.cy * c.height + Math.sin(angle) * dist * 0.6,
          r: Math.random() * 1.4 + 0.2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.003,
          cluster: true
        });
      }
    }

    // Scattered background stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 1.6 + 0.3,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.025 + 0.008,
        cluster: false
      });
    }

    // Bright "galaxy core" stars — larger with halo
    for (let i = 0; i < 25; i++) {
      const cx = 0.45 + Math.random() * 0.1;
      const cy = 0.5 + Math.random() * 0.1;
      stars.push({
        x: cx * c.width, y: cy * c.height,
        r: Math.random() * 2.8 + 1.5,
        color: [230,215,185],
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.012 + 0.003,
        bright: true
      });
    }
  }
  initStars();

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const s of stars) {
      s.twinkle += s.speed;
      const phase = 0.5 + 0.5 * Math.sin(s.twinkle);
      const alpha = s.bright ? 0.55 + 0.45 * phase : s.cluster ? 0.4 + 0.45 * phase : 0.3 + 0.45 * phase;
      const [r, g, b] = s.color;

      // Draw star
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();

      // Halo for bright stars
      if (s.bright) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.22})`;
        ctx.fill();
      }
    }

    // Shooting stars
    if (!shootingStars) shootingStars = [];
    if (Math.random() < 0.003 && shootingStars.length < 3) {
      shootingStars.push({
        x: Math.random() * c.width * 0.9,
        y: Math.random() * c.height * 0.5,
        len: 60 + Math.random() * 120,
        speed: 3 + Math.random() * 6,
        angle: 0.3 + Math.random() * 0.5,
        life: 1, decay: 0.012 + Math.random() * 0.025,
        r: 1.2 + Math.random() * 0.8
      });
    }
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const m = shootingStars[i];
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.life -= m.decay;
      if (m.life <= 0) { shootingStars.splice(i, 1); continue; }
      const grad = ctx.createLinearGradient(
        m.x, m.y,
        m.x - Math.cos(m.angle) * m.len, m.y - Math.sin(m.angle) * m.len
      );
      grad.addColorStop(0, `rgba(255,255,240,${m.life})`);
      grad.addColorStop(1, 'rgba(255,255,240,0)');
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - Math.cos(m.angle) * m.len, m.y - Math.sin(m.angle) * m.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.r;
      ctx.lineCap = 'round';
      ctx.stroke();
      // Glow head
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,240,${m.life * 0.8})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    resize();
    initStars();
  });
} catch(e) {
  console.error('Starfield init failed:', e);
  // Non-critical — page continues without stars background
}
})();

// ═══════════════════════════════════════════════════════════════════════════
//  CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const SIGNS = [
  "白羊座♈","金牛座♉","双子座♊","巨蟹座♋",
  "狮子座♌","处女座♍","天秤座♎","天蝎座♏",
  "射手座♐","摩羯座♑","水瓶座♒","双鱼座♓"
];
const SIGN_PURE = ["白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"];

const PLANETS = [
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

const ELEMENTS = ["火","土","风","水","火","土","风","水","火","土","风","水"];
const MODES = ["开创","固定","变动","开创","固定","变动","开创","固定","变动","开创","固定","变动"];
const ELEM_EMOJI = { "火":"🔥", "土":"🌍", "风":"💨", "水":"🌊" };

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
  return `${SIGNS[si]} ${d}°${String(m).padStart(2,'0')}′`;
}

// ── Social引流 helpers ─────────────────────────────────────────────────────
function copySocial(platform, id) {
  navigator.clipboard.writeText(id).then(function() {
    var chips = document.querySelectorAll('.lock-contact-chip');
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].textContent.indexOf(id) >= 0) {
        chips[i].classList.add('copied');
        var orig = chips[i].innerHTML;
        chips[i].innerHTML = '✓ 已复制 ' + platform + '号';
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

const PLANET_SIGN = {
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

const HOUSE_MEANINGS = {
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

const HOUSE_LABELS = {
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

const SIGN_MEANING = {
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

// Planet-to-planet aspect interpretations for synastry
const SYNASTRY_ASPECTS = {
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
    if (planets.length >= 3) stelliums.push({type:'sign', index:parseInt(si), planets, label:SIGN_PURE[si]+'群星'});
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
  if (Math.abs(diff - 180) <= 8) patterns.push({name:'月金对冲', text:'你的情感需求（月亮）与爱的表达方式（金星）之间存在根本性的张力。你可能在亲密关系中反复经历"靠近-疏远"的循环。这是你星盘中最核心的情感课题——学会在爱中既不失去自我，也不筑起高墙。'});

  diff = mod360(Math.abs(positions.Sun - positions.Saturn));
  if (diff > 180) diff = 360 - diff;
  if (Math.abs(diff - 90) <= 7 || Math.abs(diff - 180) <= 8 || Math.abs(diff) <= 8) {
    patterns.push({name:'日土相位', text:'太阳与土星的相位赋予你强大的责任感和坚韧的意志力，但也可能带来对自我价值的严苛审判。你的人生成就往往在30岁之后才真正开始显现——这不是诅咒，而是让你有足够时间打好地基。'});
  }

  diff = mod360(Math.abs(positions.Mars - positions.Saturn));
  if (diff > 180) diff = 360 - diff;
  if (Math.abs(diff - 90) <= 7 || Math.abs(diff - 180) <= 8 || Math.abs(diff) <= 8) {
    patterns.push({name:'火土相位', text:'火星与土星的相位赋予你惊人的毅力和持久力，但也让你容易在行动与克制之间反复拉扯。你的行动力需要经过"审查"才能释放——这让你不会轻易犯错，但也可能因过度克制而错失良机。'});
  }

  diff = mod360(Math.abs(positions.Uranus - positions.Neptune));
  if (diff > 180) diff = 360 - diff;
  if (Math.abs(diff) <= 8) {
    patterns.push({name:'天海合相', text:'天王星与海王星的合相是1990年代出生者的共同印记。你这一代人在理想主义和科技创新之间拥有独特的桥梁——你们既是梦想家，也有能力将梦想落地。个人层面上，你需要在直觉和理性之间找到属于自己的平衡方式。'});
  }

  return patterns;
}

function generateDeepNatalReport(positions, houses, aspects, asc, mc) {
  let html = '';

  html += '<div class="report-section"><h3>✦ 整体格局 · 灵魂的蓝图</h3>';

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
  html += `你的星盘呈现<strong>${domElem[0]}象主导</strong>（${domElem[1]}颗行星）· <strong>${domMode[0]}星座</strong>能量的格局。`;
  if (weakElem[1] === 0) {
    html += `值得注意的是<strong>${weakElem[0]}元素完全缺失</strong>——这不是缺陷，而是你此生的"空白画布"，你最深刻的学习和成长往往发生在${weakElem[0]}元素掌管的领域。`;
  } else if (weakElem[1] <= 1) {
    html += `${weakElem[0]}元素在你的星盘中较为薄弱（仅${weakElem[1]}颗），你在此领域需要更有意识地学习和补充。`;
  }
  html += '</p>';

  // Element weakness cultivation guide
  if (weakElem[1] <= 1) {
    html += '<div style="margin-top:10px;padding:14px 18px;background:rgba(20,20,50,0.4);border-radius:8px;border-left:3px solid var(--gold-dim);">';
    html += '<p style="color:var(--accent);text-indent:0;font-weight:bold;margin-bottom:8px;">✦ ' + weakElem[0] + '元素的修行之道</p>';
    if (weakElem[0] === '水') {
      html += '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">水是情感、直觉与共情的力量。你的星盘水象薄弱，意味着你习惯用逻辑而非感受来判断事物——这不是错，但当生活只剩下分析和行动，灵魂会干涸。<br><br>';
      html += '<strong>日常修行：</strong>每天给自己一段"没有目的"的时间——不是工作、不是学习、不是运动，而是纯粹的"存在"。泡一杯茶、听一首歌、看一部能让你流泪的电影。记下那些你平时会压下去的"不舒服"的感受——让它们流淌出来，而不是绕道而行。<br>';
      html += '<strong>关系层面：</strong>练习在伴侣或朋友面前说"我不知道我为什么会有这种感觉，但我确实有"。不必解释所有情绪，不是所有事都需要一个理由。允许自己被看见脆弱的那一面——那是你最深的力量。<br>';
      html += '<strong>创造性表达：</strong>写诗、涂鸦、摄影、做一顿没有食谱的菜——任何不需要"做对"、只需要"感受"的创作。水不需要方向，它只需要流动。</p>';
    } else if (weakElem[0] === '火') {
      html += '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">火是勇气、行动与生命力的表达。你的星盘火象不足，意味着你倾向于先想再做、或者一直停留在想的阶段。你的灵魂渴望冲动，却总被理智按住。<br><br>';
      html += '<strong>日常修行：</strong>每天做一件"没用但想做"的事——对镜子里的自己笑一下、在无人处大声喊出来、报名一个你从没试过的课。不需要理由，不需要"意义"，只需要"我想"。<br>';
      html += '<strong>身体层面：</strong>运动是你最直接的火焰通道。跑步、搏击、舞蹈——任何能让身体发热、心跳加速的运动。让身体动起来，火就会被点燃。<br>';
      html += '<strong>决策层面：</strong>练习在 30 秒内做一个决定（从吃饭、穿什么、周末去哪开始）。不需要最优解——火不追求完美，它只追求"在燃烧"。</p>';
    } else if (weakElem[0] === '土') {
      html += '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">土是稳定、务实与物质世界的连接。你的星盘土象薄弱，意味着你活在概念和感受的云端，却常常忽略了脚下的土地。没有土，梦想永远只是梦想。<br><br>';
      html += '<strong>日常修行：</strong>建立一两个"不可撼动"的日常仪式——固定时间起床、睡前整理明天的衣物、每周做一顿让自己期待的饭。这些微小的锚点会让你在精神世界中找到一个可以着陆的地方。<br>';
      html += '<strong>财富层面：</strong>定期查看你的账户余额，即使只有几百块钱。记录一个月的每一笔收支——不是为了削减，而是为了"看见"。土的力量来自"我知道每一个数字"。<br>';
      html += '<strong>身体层面：</strong>赤脚踩在泥土或草地上，散步时留意脚底的触感。种一盆植物，每天照料它——照顾一个生命本身就是最深的土象修行。</p>';
    } else if (weakElem[0] === '风') {
      html += '<p style="color:#b8b8c8;font-size:0.9em;line-height:1.9;">风是思维、交流与视野的扩展。你的星盘风象薄弱，意味着你习惯于沉浸在自己的感受和直觉中，却较少用"旁观者"的视角审视生活。没有风，灵魂的风景会缺少变化。<br><br>';
      html += '<strong>日常修行：</strong>每天花 15 分钟阅读一个你不知道的领域——科学、政治、设计、哲学。不是为了"有用"，而是让你的大脑习惯在陌生的航道上航行。<br>';
      html += '<strong>社交层面：</strong>找一个和你完全不同的人吃一次饭。不是深交，而是练习"倾听一个你永远不会成为的人"。风的智慧在于理解——不是认同，是理解。<br>';
      html += '<strong>表达层面：</strong>把一件困扰你的事讲给另一个人听——但讲的方式是"如果我是另一个人，我会怎么看待这件事"。练习用不同的角度看待同一个问题，你的世界会多出很多出口。</p>';
    }
    html += '</div>';
  }

  if (domElem[0] === '水') {
    html += '<p>水象主导意味着你的生命由情感、直觉和深层连接驱动。你像深海——表面上可能平静无波，但内部蕴含着巨大的能量和智慧。你做决定时依赖的是感受而非逻辑，这让你在人际和创意领域有天然优势。但也需要注意不要被情绪淹没，学会在必要时抽离。</p>';
  } else if (domElem[0] === '土') {
    html += '<p>土象主导让你拥有稳固的现实感和强大的执行力。在这个充满浮躁的时代，你的脚踏实地是稀缺的优势。你重视结果和实质，不喜欢空洞的理论和无法落地的承诺。但需要注意在追求安全感的过程中，不要关闭了探索未知的勇气。</p>';
  } else if (domElem[0] === '火') {
    html += '<p>火象主导赋予你充沛的生命力和行动力。你是人群中的点火者——你的热情和勇气能感染周围所有人。你不怕冒险，直觉式地知道什么时候该行动。但需要注意持续的耐力，以及在行动之前多听取他人的意见。</p>';
  } else {
    html += '<p>风象主导让你以理性、沟通和连接世界的方式运作。你的大脑是你最强大的工具，你天然懂得如何分析、表达和连接。人际网络和信息流是你最大的资源。但需要注意不要只活在头脑中，你的身体和情感也需要同等的关注。</p>';
  }

  html += '<p>行为模式上，' + domMode[0] + '星座的';
  if (domMode[0] === '开创') html += '能量让你善于启动和开辟新局面，但可能在长期的坚持上需要额外的自律和支持系统。';
  else if (domMode[0] === '固定') html += '特质让你一旦确定方向就坚定不移，耐力惊人，但也可能在需要改变时显得固执。';
  else html += '灵活性让你能快速适应环境变化，但也可能在需要坚定时显得摇摆不定。';
  html += '</p>';

  const stelliums = detectStelliums(positions, houses);
  if (stelliums.length > 0) {
    html += '<p style="color:var(--accent);text-indent:0;">';
    for (const s of stelliums) {
      html += `⭐ <strong>${s.label}</strong>：${s.planets.map(p=>p.name).join('、')} 汇聚于此，`;
      if (s.type === 'sign') html += `这个星座的能量在你生命中异常集中。该领域是你灵魂投入了最多"兵力"的地方——既是天赋所在，也是执着所在。`;
      else html += `这个生活领域是你此生的核心舞台。该宫位的议题会反复出现在你人生的关键时刻。`;
    }
    html += '</p>';
  }

  html += '</div>';

  html += '<div class="report-section"><h3>✦ 日月升 — 灵魂的三重奏</h3>';
  const sunSign = degToSign(positions.Sun).si;
  const moonSign = degToSign(positions.Moon).si;
  const ascSign = degToSign(asc).si;
  const sunHouse = houses.Sun || '?';
  const moonHouse = houses.Moon || '?';

  html += '<p style="color:var(--accent);text-indent:0;"><strong>太阳' + SIGN_PURE[sunSign] + ' · 第' + sunHouse + '宫</strong>：你的核心意志与生命目标。</p>';
  html += '<p>' + (PLANET_SIGN.Sun[sunSign] || '') + '</p>';

  html += '<p style="color:var(--accent);text-indent:0;margin-top:12px;"><strong>月亮' + SIGN_PURE[moonSign] + ' · 第' + moonHouse + '宫</strong>：你的情绪底色与内在安全感。</p>';
  html += '<p>' + (PLANET_SIGN.Moon[moonSign] || '') + '</p>';

  html += '<p style="color:var(--accent);text-indent:0;margin-top:12px;"><strong>上升' + SIGN_PURE[ascSign] + '</strong>：你与世界相遇时戴的面具，也是别人对你的第一印象。</p>';
  html += '<p>上升' + SIGN_PURE[ascSign] + '赋予你' + SIGN_PURE[ascSign] + '的外在气质和行为方式。这是你的"默认模式"——当你不经思考地回应世界时，就是这个星座的能量在主导。' + (SIGN_MEANING[ascSign] || '') + '</p>';

  html += '</div>';

  const keyPatterns = detectKeyPatterns(positions, aspects);
  if (keyPatterns.length > 0) {
    html += '<div class="report-section"><h3>✦ 灵魂印记 — 关键格局</h3>';
    for (const kp of keyPatterns) {
      html += '<p><span class="highlight">' + kp.name + '</span>：' + kp.text + '</p>';
    }
    html += '</div>';
  }

  html += '<div class="report-section"><h3>✦ 行星深度解读</h3>';

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

    html += '<p style="margin-top:12px;text-indent:0;"><span class="highlight">' + p.name + '在' + SIGN_PURE[si] + '／第' + h + '宫</span>';
    if (aspectNames.length > 0) {
      html += '（' + aspectNames.join('、') + '）';
    }
    html += '</p>';

    const signText = PLANET_SIGN[pid] ? PLANET_SIGN[pid][si] : '';
    html += '<p>' + (signText || '') + '</p>';

    if (h !== '?' && !housesDescribed[h]) {
      housesDescribed[h] = true;
      html += '<p style="font-size:0.88em;color:#9a9ab0;">落第' + h + '宫 — ' + (HOUSE_MEANINGS[h] || '') + '</p>';
    }

    for (const a of planetAspects.slice(0, 2)) {
      const otherId = a.p1===pid ? a.p2 : a.p1;
      const otherP = PLANETS.find(x=>x.id===otherId);
      if (otherP) {
        const nature = (a.name==='三合'||a.name==='六合') ? '和谐' : (a.name==='合'?'融合':(a.name==='冲'?'对立':'张力'));
        html += '<p style="font-size:0.85em;color:#8a8aa0;">↳ 与' + otherP.name + '的' + a.name + '相（' + nature + '）：此相位为上述解读增添了' + nature + '的色彩。';
        if (a.name==='冲') html += '两个行星所在的领域需要你在生活中不断寻找平衡点。';
        else if (a.name==='刑') html += '内在的张力推动你在这两个领域之间不断成长和突破。';
        else if (a.name==='三合') html += '两个领域的能量流动顺畅，是你可以善用的天赋管道。';
        else if (a.name==='六合') html += '这是一个"机会窗口"——需要你主动作为才能激活的潜能。';
        else html += '两股能量合而为一，此领域对你影响深远而持久。';
        html += '</p>';
      }
    }
  }
  html += '</div>';

  html += '<div class="report-section"><h3>✦ 此生的核心课题</h3>';

  const satSign = degToSign(positions.Saturn).si;
  const satHouse = houses.Saturn || '?';
  html += '<p><span class="highlight">土星在' + SIGN_PURE[satSign] + '／第' + satHouse + '宫</span>揭示了你此生最重要的功课所在。</p>';
  html += '<p>' + (PLANET_SIGN.Saturn ? PLANET_SIGN.Saturn[satSign] : '') + '</p>';

  html += '<p style="border-left:3px solid var(--gold-dim);padding-left:16px;margin-top:16px;color:var(--accent);">';
  const adj1 = ec['水']>=4?'情感深邃':ec['火']>=4?'热情奔放':ec['土']>=3?'根基稳固':ec['风']>=3?'思维灵动':'层次丰富';
  const str1 = ec['水']>=3?'感受的深度和直觉的精准':ec['火']>=3?'行动的果敢和创造的火花':ec['土']>=2?'持久的耐力和现实的判断力':ec['风']>=2?'沟通的智慧和灵活的适应力':'内在的完整与自洽';
  html += '你的星盘是一幅' + adj1 + '的图景。你的力量不在于"无所不能"，而在于' + str1 + '。信任你的内在节奏——你不需要成为别人，你只需要成为最完整的自己。';
  html += '</p>';

  html += '</div>';

  return html;
}

// ── Natal Chart Report ────────────────────────────────────────────────────
function generateNatalReport(positions, houses, aspects, asc, mc) {
  let html = '<div class="report-section">';
  html += '<h3>✦ 整体格局</h3>';

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

  html += `<p>你的星盘中<span class="highlight">${domElem[0]}元素</span>（${ELEM_EMOJI[domElem[0]]}）最为突出，共${domElem[1]}颗行星落入${domElem[0]}象星座，`;
  if (domElem[0] === '火') html += '你是一个充满行动力和激情的人，敢于冒险，勇往直前。';
  else if (domElem[0] === '土') html += '你是一个务实稳健的人，重视物质基础，做事脚踏实地。';
  else if (domElem[0] === '风') html += '你是一个理性思考者，重视信息交流和人际关系，思维活跃。';
  else html += '你是一个情感丰富的人，直觉力强，内心世界深邃。';

  if (weakElem[1] <= 1) {
    html += `${weakElem[0]}元素在你的星盘中相对薄弱，这恰恰是你此生需要重点发展和学习的领域。</p>`;
  } else {
    html += `</p>`;
  }

  html += `<p>你的行为模式以<span class="highlight">${domMode[0]}星座</span>为主，`;
  if (domMode[0] === '开创') html += '善于开创局面，主导事情的走向；';
  else if (domMode[0] === '固定') html += '坚韧不拔，一旦确定方向就坚定不移；';
  else html += '灵活应变，善于适应环境和调整策略。';
  html += '</p></div>';

  // Sun, Moon, ASC
  html += '<div class="report-section"><h3>✦ 日月升 — 灵魂的三重奏</h3>';
  const sunSign = degToSign(positions.Sun).si;
  const moonSign = degToSign(positions.Moon).si;
  const ascSign = degToSign(asc).si;
  html += `<p><span class="highlight">太阳${SIGN_PURE[sunSign]}</span>代表你的核心意志和人生目标。${(PLANET_SIGN.Sun||{})[sunSign]||''}</p>`;
  html += `<p><span class="highlight">月亮${SIGN_PURE[moonSign]}</span>代表你的情绪底色和内在安全感。${(PLANET_SIGN.Moon||{})[moonSign]||''}</p>`;
  html += `<p><span class="highlight">上升${SIGN_PURE[ascSign]}</span>是你戴的面具，也是别人见你的第一印象。上升${SIGN_PURE[ascSign]}赋予你${SIGN_PURE[ascSign]}的外在气质。</p>`;
  html += '</div>';

  // Key planets
  html += '<div class="report-section"><h3>✦ 重点行星解读</h3>';
  const keyPlanets = ['Sun','Moon','Mercury','Venus','Mars'];
  for (const pid of keyPlanets) {
    const lon = positions[pid];
    const {si} = degToSign(lon);
    const h = houses[pid] || '?';
    const p = PLANETS.find(x=>x.id===pid);
    html += `<p><span class="highlight">${p.name}在${SIGN_PURE[si]}／第${h}宫</span> — `;
    if (PLANET_SIGN[pid] && PLANET_SIGN[pid][si]) {
      html += PLANET_SIGN[pid][si].slice(0, -1) + `。`;
    }
    html += `落第${h}宫，${HOUSE_MEANINGS[h]||''}</p>`;
  }
  html += '</div>';

  // Major aspects
  html += '<div class="report-section"><h3>✦ 重要相位</h3>';
  const majorAspects = aspects.filter(a =>
    ['Sun','Moon','Mercury','Venus','Mars'].includes(a.p1) ||
    ['Sun','Moon','Mercury','Venus','Mars'].includes(a.p2)
  ).slice(0, 8);
  for (const a of majorAspects) {
    const n1 = PLANETS.find(x=>x.id===a.p1)?.name||a.p1;
    const n2 = PLANETS.find(x=>x.id===a.p2)?.name||a.p2;
    html += `<p><span class="${a.cls}">${n1} ${a.name} ${n2}</span>（偏差${a.orb.toFixed(1)}°）— `;
    if (a.name==='合') html += '两股能量融为一体，此领域对你影响深远。';
    else if (a.name==='三合'||a.name==='六合') html += '能量流动顺畅，是你的天赋所在。';
    else html += '内在张力推动你不断成长和突破。';
    html += '</p>';
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
    {id:"Jupiter", label:"木星", period:"约1年/星座", theme:"机遇、扩张、幸运"},
    {id:"Saturn", label:"土星", period:"约2.5年/星座", theme:"考验、责任、成长"},
    {id:"Uranus", label:"天王星", period:"约7年/星座", theme:"突变、觉醒、突破"},
    {id:"Neptune", label:"海王星", period:"约14年/星座", theme:"梦想、消融、灵性"},
    {id:"Pluto", label:"冥王星", period:"约15-20年/星座", theme:"蜕变、权力、重生"}
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
  html += `<p style="text-indent:0;color:var(--text-dim);margin-bottom:16px;">当前行运深度分析（基于 ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日天象）</p>`;

  for (const tp of transitPlanets) {
    const tl = transitNow[tp.id];
    const {si} = degToSign(tl);
    html += `<h3>✦ ${tp.label}行运 — ${tp.theme}</h3>`;
    html += `<p><span class="highlight">${tp.label}当前位于${SIGNS[si]}</span>，${tp.period}。</p>`;

    // Current sign interpretation for outer planets
    if (tp.id === 'Jupiter') {
      const jHouse = houses.Jupiter || '?';
      html += `<p>木星是你星盘中的幸运之星，当前它正在你第${jHouse}宫领域释放扩张能量。这是你${jHouse <= 6 ? '个人成长':'外部世界'}层面最易获得突破的阶段。</p>`;
    } else if (tp.id === 'Saturn') {
      const sHouse = houses.Saturn || '?';
      html += `<p>土星是你此生的主要功课导师，当前它正穿行于你第${sHouse}宫，要求你在这个领域建立结构、承担责任。虽然过程不轻松，但所有在此阶段打下的基础将支撑你未来数十年的发展。</p>`;
    } else if (tp.id === 'Uranus') {
      html += '<p>天王星带来不可预测的转变。它正在松动你生活中那些"理所当然"的领域——看似突然的改变其实是你内心早已渴望的解放。</p>';
    } else if (tp.id === 'Neptune') {
      html += '<p>海王星正在模糊某些边界，让你的直觉和灵感异常活跃。但同时也需要警惕自欺欺人和不切实际的幻想——尤其是在金钱和承诺方面。</p>';
    } else if (tp.id === 'Pluto') {
      html += '<p>冥王星正在进行深层的灵魂手术。它在剥除那些不再服务于你最高利益的东西——虽然过程伴随失去的痛感，但每一次"死亡"都孕育着更强大的重生。</p>';
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
      html += '<p style="margin-top:8px;text-indent:0;"><strong>当前与本命行星的关键链接：</strong></p>';
      for (const na of natalAspects.slice(0, 5)) {
        let forecast = '';
        const pid = na.planet.id;
        if (tp.id === 'Jupiter') {
          if (pid === 'Sun') forecast = '个人影响力显著扩大，事业发展迎来重要机遇。你的自信和魅力处于高峰期，适合争取更高职位或开启新项目。';
          else if (pid === 'Moon') forecast = '家庭和情感领域充满温暖和好运。适合搬家、装修、或改善家庭关系。内心的安全感增强。';
          else if (pid === 'Mercury') forecast = '学习和沟通运势极佳，适合考试、签约、开展新业务。你的想法更容易被他人接受和支持。';
          else if (pid === 'Venus') forecast = '感情和财运的双重利好！桃花旺盛，容易遇到有缘人；投资和艺术相关领域也有不错的回报。';
          else if (pid === 'Mars') forecast = '行动力和勇气爆棚，适合创业、竞赛或启动需要胆识的项目。但要避免过度乐观冒进。';
          else if (pid === 'Jupiter') forecast = '本命木星被激活——这是"双重幸运"的时期，人生重要目标有望取得突破性进展。';
          else if (pid === 'Saturn') forecast = '长期坚持的努力开始显现回报。财务上的长期投资或事业上的持久付出迎来收获期。';
          else forecast = '该领域迎来扩展和幸运的能量，善用这段时间的顺风。';
        } else if (tp.id === 'Saturn') {
          if (pid === 'Sun') forecast = '这是你人生中的"大考"时期。事业和责任压力增大，但这也是你奠定长期成就的关键阶段。保持自律，成果将在1-2年后显现。';
          else if (pid === 'Moon') forecast = '情感和家庭领域面临成熟化的压力。可能需要承担更多家庭责任，或重新审视你的情感需求与安全感的来源。';
          else if (pid === 'Mercury') forecast = '思维变得更加严谨务实，适合深度学习、重要决策和长期规划。注意不要陷入过度悲观或自我怀疑。';
          else if (pid === 'Venus') forecast = '感情关系经历现实考验。不稳固的关系可能走向终结，而真正有价值的关系将变得更加深厚和有承诺。财务上趋于保守。';
          else if (pid === 'Mars') forecast = '行动受阻的感觉让你沮丧，但这其实是宇宙在教你"精准发力"。与其硬冲，不如重新审视策略和方向。';
          else if (pid === 'Saturn') forecast = '土星回归！这是约29年一次的人生重要转折点。你在重新定义自己的身份、责任和人生方向。';
          else forecast = '该领域需要你承担更多责任，付出努力将获得长期回报。';
        } else if (tp.id === 'Uranus') {
          if (pid === 'Sun' || pid === 'Mars') forecast = '生活中可能发生突如其来的变化，打破旧有模式。这可能表现为突然的职业转变、搬家、或重要的个人觉醒。';
          else if (pid === 'Venus' || pid === 'Moon') forecast = '情感关系可能经历意想不到的转折。单身的你可能突然遇到一个完全不同类型的人；有伴的可能需要给彼此更多自由和空间。';
          else if (pid === 'Mercury') forecast = '思维异常活跃，灵感迸发。适合创新和突破性思考，但注意不要因为想法太多而无法深入。';
          else forecast = '该领域可能经历意想不到的变化和觉醒，顺应改变而非抗拒。';
        } else if (tp.id === 'Neptune') {
          if (pid === 'Sun' || pid === 'Moon') forecast = '直觉异常敏锐的时期，但方向感可能变得模糊。适合灵性探索和创意工作，但在重大决策上需要更多理性验证。';
          else if (pid === 'Venus') forecast = '浪漫氛围浓厚，但需警惕"滤镜效应"——你可能在感情中看到的是自己投射的理想而非真实的人。财务上避免模糊不清的安排。';
          else if (pid === 'Mars') forecast = '行动力可能被迷茫感稀释。与其强迫自己前进，不如利用这段时间进行内在探索和调整。';
          else forecast = '该领域需要你信任直觉，但同时保持清醒的边界感。';
        } else if (tp.id === 'Pluto') {
          if (pid === 'Sun' || pid === 'Moon') forecast = '深刻的身份转化正在发生。你可能发现自己不再认同过去的某些身份标签——你正在蜕变成一个更真实的自己。';
          else if (pid === 'Venus') forecast = '情感领域正在经历深度转化。控制与被控制、占有与放手的课题浮现。真正的爱不依赖操控，而在于信任与自由。';
          else if (pid === 'Mars' || pid === 'Saturn') forecast = '你的事业方向和权力位置经历深刻重组。某些局面可能面临"不破不立"的选择——相信这个过程中的毁灭是为了更好的重建。';
          else forecast = '该领域正在经历根本性的转化，旧的不去新的不来。';
        }
        html += `<p>${tp.label}${na.aspect}本命${na.planet.name} → ${forecast}</p>`;
      }
    } else {
      html += `<p style="color:var(--text-dim);">${tp.label}目前与本命行星无紧密相位，该领域的直接影响较为温和，是整合和准备的好时机。</p>`;
    }
  }
  html += '</div>';

  // ═══ Section 2: 5-Year Timeline ═══
  html += '<div class="report-section"><h3>✦ 未来五年 · 关键时间线</h3>';
  html += '<p style="color:var(--text-dim);margin-bottom:12px;">以下时间线基于外行星行运与本命行星的相位推算。时间节点为近似值，实际感受可能提前或延后1-2个月。</p>';

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

  html += '<table class="chart-table" style="font-size:0.82em;">';
  html += '<thead><tr><th>时间段</th><th>关键行运</th><th>主题</th></tr></thead><tbody>';

  for (const iv of intervals) {
    let theme = '', rowClass = '';
    if (iv.keyTransits.length === 0) {
      theme = '平稳整合期 — 适合巩固已有成果，为下一阶段做准备。';
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

      // Hard aspects from malefics set the dominant tone; Jupiter blessings may soften the edge
      if (hasOuterStress && hasJupiterSoft) { theme = '成长突破期 ⚡ '; rowClass = ' style="border-left:3px solid var(--gold-dim);"'; }
      else if (hasSaturnHard || hasPlutoHard) { theme = '责任考验期 ⚙ '; }
      else if (hasUranusHard) { theme = '重大转折期 🔥 '; }
      else if (hasSaturnSoft && hasJupiterSoft) { theme = '稳步建设期 🏗 '; }
      else if (hasJupiterSoft) { theme = '机遇扩展期 ✦ '; rowClass = ' style="border-left:3px solid var(--gold-dim);"'; }
      else if (hasSaturnSoft) { theme = '稳步建设期 🏗 '; }
      else if (hasUranus || hasPluto) { theme = '重大转折期 🔥 '; }
      else if (hasNeptune) { theme = '内省调整期 ~ '; }
      else { theme = '稳定发展期 ● '; }

      theme += iv.keyTransits.map(t=>t.transitPlanet+t.aspect+t.natalPlanet).slice(0,4).join('，');
      if (iv.keyTransits.length > 4) theme += ' 等...';
    }

    html += `<tr${rowClass}><td>${iv.label}</td><td>${iv.keyTransits.length === 0 ? '—' : iv.keyTransits.length+'个重要相位'}</td><td>${theme}</td></tr>`;
  }

  html += '</tbody></table>';
  html += '<p style="color:var(--text-dim);margin-top:8px;">※ 行运的影响是渐进的——在准确成相的前后几周内感受最为明显。外行星运行缓慢，一个相位的影响可能持续数月至一年以上。</p>';
  html += '</div>';

  // ═══ Section 3: Topic Deep Dive ═══
  html += '<div class="report-section"><h3>✦ 三大主题深度分析</h3>';

  // --- 财运 ---
  html += '<h4 style="color:var(--gold);margin-top:16px;">💰 财运深度分析</h4>';
  const venusSign = degToSign(positions.Venus).si;
  const jupiterSign = degToSign(positions.Jupiter).si;
  const saturnSign = degToSign(positions.Saturn).si;
  const venusHouse = houses.Venus || '?';
  const jupiterHouse = houses.Jupiter || '?';

  html += '<p>你的财运格局由金星（价值观与吸引力）和木星（扩张与幸运）共同塑造。</p>';

  // Use dominant element for wealth style
  const wealthElem = sortedElem[0][0];
  if (wealthElem === '土') {
    html += '<p>你的土象元素突出，天然具备稳健的理财基因。你倾向于通过长期积累和务实投资来增长财富，而非追求快速暴富。这种特质让你在长期财富竞赛中占有优势——你能守住别人守不住的钱。</p>';
  } else if (wealthElem === '水') {
    html += '<p>水象主导的你对金钱的态度往往是情感化的——赚钱的动力与安全感、情感连接紧密相关。你的财富机会往往与人际关系和直觉判断有关。投资方面的第六感常常很准，但需要搭配理性的风险管理。</p>';
  } else if (wealthElem === '火') {
    html += '<p>火象的你财富机会来自大胆的行动。创业、投资有成长潜力的领域、或将热情转化为产品和服务是你积累财富的主要路径。需要注意平衡冒险精神和财务安全底线。</p>';
  } else {
    html += '<p>风象的你财富与人脉和信息流密切相关。你的价值在于知识和连接能力——通过专业服务、咨询、或信息差创造财富是你最擅长的路径。</p>';
  }

  // Jupiter transit timing
  const jupiterNatalHouse = houses.Jupiter || 1;
  const jupiterCycleYear = (jupiterNatalHouse + 5) % 12 || 12;
  html += `<p><strong>关键时间窗口：</strong>当行运木星进入你第${jupiterHouse}宫和第${((jupiterHouse%12)+2)}宫附近时（约每6年一次），是财务扩张的最佳时机。下一个重要窗口期在木星经过你太阳星座及其对宫时——届时新的收入渠道或投资机会将自然浮现。</p>`;

  html += '<p style="color:var(--accent);">你的财务策略应聚焦于：' + (wealthElem==='土'?'发挥稳健长期的复利思维':wealthElem==='火'?'发挥将热情转化为收入的创业能力':wealthElem==='水'?'发挥跟随直觉同时做好风险控制的能力':'发挥信息和连接的优势，构建多元化的收入来源') + '。</p>';

  // --- 事业 ---
  html += '<h4 style="color:var(--gold);margin-top:16px;">💼 事业深度分析</h4>';
  const sunSignN = degToSign(positions.Sun).si;
  const marsSign = degToSign(positions.Mars).si;
  const sunHouse = houses.Sun || '?';
  const marsHouse = houses.Mars || '?';
  const mcSign = degToSign(mc).si;

  html += '<p>你的事业格局由太阳（核心驱动力）+ 火星（行动模式）+ 中天MC（社会形象）共同定义。</p>';
  html += `<p>太阳落第${sunHouse}宫暗示你的核心成就感来自${HOUSE_LABELS[sunHouse] || '个人成长'}领域。火星落第${marsHouse}宫则说明你的行动能量主要在${HOUSE_LABELS[marsHouse] || '行动'}领域释放。你的中天${SIGN_PURE[mcSign]}为你在这个世界上的"职业面孔"涂上了${SIGN_PURE[mcSign]}的色彩。</p>`;

  // Career path based on dominant element
  if (domElem[0] === '火') {
    html += '<p>火象主导赋予你开拓型职业生涯的潜能。适合创业、管理、销售、或任何需要领导力和驱动力的领域。你的职业满足感来自"做大事"和"影响他人"——被限制在格子间里做重复性工作会消耗你的生命力。</p>';
  } else if (domElem[0] === '土') {
    html += '<p>土象主导让你在需要耐心和方法的职业中脱颖而出。金融、工程、建筑、医疗、或任何需要积累和精进的领域都适合你。你不在意一时的光环，而更看重长期的积累和实质性的产出。</p>';
  } else if (domElem[0] === '水') {
    html += '<p>水象主导适合与人深度相关的职业——心理咨询、艺术创作、医疗护理、教育、或任何需要同理心和情感智慧的领域。你的职业满足感来自于"触及他人的灵魂"而非纯粹的商业成就。</p>';
  } else {
    html += '<p>风象主导适合与人沟通和信息处理相关的职业——媒体、科技、法律、咨询、写作、或任何需要分析能力和社交智慧的领域。多元化和持续学习是你职业生涯的关键词。</p>';
  }

  // Saturn transit for career
  html += '<p><strong>事业关键时间线：</strong>土星行运经过你的太阳、火星、或MC附近时（约每7年循环中的关键节点），是你事业面临重要考验和飞跃的时期。未来5年中，当行运木星与你的MC或太阳形成和谐相位时，是晋升、跳槽或创业的黄金窗口。</p>';

  // --- 桃花 ---
  html += '<h4 style="color:var(--gold);margin-top:16px;">💕 桃花运深度分析</h4>';
  const moonSignN = degToSign(positions.Moon).si;
  const marsHouseN = houses.Mars || '?';

  html += '<p>你的情感格局由月亮（情感需求）+ 金星（爱的表达）+ 火星（欲望模式）交织而成。</p>';
  html += `<p>月亮${SIGN_PURE[moonSignN]}的你需要${moonSignN <= 3 ? '安全感和情绪共鸣' : moonSignN <= 7 ? '尊重和情感确认' : '自由与精神连接'}来感到被爱。金星${SIGN_PURE[venusSign]}则决定了你如何表达爱意——以及在什么样的人身上看到美。火星落第${marsHouseN}宫透露出你的激情最容易在${HOUSE_LABELS[marsHouseN] || '行动'}领域被点燃。</p>`;

  if (domElem[0] === '水') {
    html += '<p>水象元素突出的你在感情中深度优先。你不需要很多段关系，但每一段都必须触及灵魂。你的挑战在于学会保护自己的情感边界——不是所有人都值得你的深度共情。</p>';
  } else if (domElem[0] === '火') {
    html += '<p>火象的你在感情中热情主动、敢于表达。你容易被自信和有活力的人吸引。挑战在于学会持久的耐心——爱情的初始火花需要细水长流的养护才能成为温暖的火焰。</p>';
  } else if (domElem[0] === '土') {
    html += '<p>土象的你在感情中务实而忠诚。你不会轻易开始一段关系，但一旦开始就会用心经营。挑战在于不要让"安全感"成为唯一的标准——有时候最好的爱来自最不按常理出牌的人。</p>';
  } else {
    html += '<p>风象的你在感情中重视精神契合和有趣的对话。你需要一个能与你持续对话的伴侣。挑战在于学会沉入情感的深水区——思考爱和感受爱是两件不同的事。</p>';
  }

  // Key romance windows
  html += '<p><strong>桃花关键时间线：</strong>行运木星经过你的金星、月亮或第5/7宫时，是桃花最旺的时期。行运天王星触碰到本命金星时，则可能出现"电光火石"式的情感转折——可能是突如其来的邂逅，也可能是一次重要的关系重组。未来5年中，注意以下窗口：木星每约1年切换一次星座，当它进入与你金星同元素的星座时（约每3年一次），你的情感磁场会明显增强。</p>';
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
    {id:"Jupiter", label:"木星", period:"约1年/星座", theme:"机遇、扩张、幸运"},
    {id:"Saturn", label:"土星", period:"约2.5年/星座", theme:"考验、责任、成长"},
    {id:"Uranus", label:"天王星", period:"约7年/星座", theme:"突变、觉醒、突破"}
  ];

  let html = '<div class="report-section">';
  html += `<p style="text-indent:0;color:var(--text-dim);margin-bottom:16px;">当前行运分析（基于 ${now.getFullYear()}年${now.getMonth()+1}月天象）</p>`;

  for (const tp of transitPlanets) {
    const tl = transitPos[tp.id];
    const {si} = degToSign(tl);
    html += `<h3>✦ ${tp.label}行运（${tp.theme}）</h3>`;
    html += `<p><span class="highlight">${tp.label}当前位于${SIGNS[si]}</span>，${tp.period}。</p>`;

    // Check aspects to natal
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
        let forecast = '';
        if (tp.id === 'Jupiter') {
          if (area === 'Sun' || area === 'Jupiter') forecast = '事业发展迎来重要机遇，个人影响力扩大。';
          else if (area === 'Venus') forecast = '人际关系和财运方面的好运，桃花旺盛。';
          else if (area === 'Mars') forecast = '行动力和勇气增强，适合创业或新项目启动。';
          else if (area === 'Saturn') forecast = '财务或事业上的长期投资开始回报。';
          else forecast = '该领域迎来扩展和幸运的能量。';
        } else if (tp.id === 'Saturn') {
          if (area === 'Sun' || area === 'Mars') forecast = '事业上面临重要考验，需要更加努力和自律。这是奠定长期成就的时期。';
          else if (area === 'Moon' || area === 'Venus') forecast = '情感和家庭领域面临成熟化的压力，需要更负责任地处理关系。';
          else if (area === 'Mercury') forecast = '思维变得更加严谨务实，适合学习深造或重要决策。';
          else forecast = '该领域需要承担更多责任，付出努力将获得长期回报。';
        } else {
          if (area === 'Sun' || area === 'Mars') forecast = '生活中可能发生突如其来的变化，打破旧有模式，带来新的可能。';
          else if (area === 'Venus' || area === 'Moon') forecast = '情感关系可能经历意想不到的转折，引导你走向更真实的自我。';
          else forecast = '该领域可能经历意想不到的变化和觉醒。';
        }
        html += `<p>${tp.label}${na.aspect}本命${na.planet.name} → ${forecast}</p>`;
      }
    } else {
      html += `<p>${tp.label}目前与本命行星无紧密相位，该领域处于平稳过渡期。</p>`;
    }
  }

  // Summary by topic
  html += '<h3>✦ 专题运势摘要</h3>';
  const ascHouse = houses.Sun || 1;
  html += `<p><span class="highlight">💰 财运：</span>基于你的星盘配置，财富积累的关键在于发挥你的核心优势。`;
  if (ec2(positions)['土'] >= 3) html += '你天生具有较强的理财能力，未来5年通过稳健投资和长期规划可获得稳定增长。';
  else if (ec2(positions)['火'] >= 3) html += '你的财富机会来自大胆的行动和创业精神，但需注意风险管理。';
  else html += '财运与你的人际网络和专业技能紧密相关，持续深耕专业领域将带来回报。';
  html += '</p>';

  html += `<p><span class="highlight">💼 事业运：</span>`;
  const mcSign = degToSign(positions.Sun).si; // approximate
  if (mcSign >= 9 && mcSign <= 11 || mcSign <= 1) html += '未来五年是你事业的关键上升期，社会地位和影响力有望显著提升。把握好当下的努力方向。';
  else html += '事业发展的重点在于深耕专业能力和建立可靠的合作伙伴关系。稳步前进，不急于求成。';
  html += '</p>';

  html += `<p><span class="highlight">💕 桃花运：</span>`;
  const venusSign = degToSign(positions.Venus).si;
  if (venusSign >= 2 && venusSign <= 4) html += '你的魅力正在上升期，未来两年桃花运势较强。真诚表达自我，美好的缘分自然会来。';
  else if (venusSign >= 6 && venusSign <= 8) html += '深度情感连接是你未来五年的主题。质量重于数量，一段深刻的关系比众多浅薄的缘分更有价值。';
  else html += '桃花运平缓上升，在事业和社交场合中容易遇到志同道合的人。保持开放的心态。';
  html += '</p></div>';

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
  if (compatPct >= 75) html += `💫 契合度：较高（${compatPct}%）`;
  else if (compatPct >= 55) html += `✨ 契合度：中等偏上（${compatPct}%）`;
  else if (compatPct >= 40) html += `🌗 契合度：中等（${compatPct}%）`;
  else html += `🌑 契合度：充满挑战（${compatPct}%）`;
  html += '</div>';

  html += `<p style="text-align:center;color:var(--text-dim);">和谐相位 ${goodScore} 分 / 紧张相位 ${hardScore} 分</p>`;

  // Key synastry aspects
  html += '<h3>✦ 关键合盘相位</h3>';
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
    html += '<p>你们的行星之间没有形成传统意义上的紧密相位，关系可能更多受到外在因素或其他星盘配置的影响。</p>';
  }

  // Element compatibility
  html += '<h3>✦ 元素契合度分析</h3>';
  const asc1Sign = degToSign(asc1).si;
  const asc2Sign = degToSign(asc2).si;
  const e1 = ELEMENTS[asc1Sign], e2 = ELEMENTS[asc2Sign];

  if (e1 === e2) {
    html += `<p>你们的上升星座同为${e1}象，初次见面就有一种熟悉感和默契。你们本能地用相似的方式理解和回应世界。</p>`;
  } else if ((e1==='火'&&e2==='风')||(e1==='风'&&e2==='火')||(e1==='土'&&e2==='水')||(e1==='水'&&e2==='土')) {
    html += `<p>你们的上升元素（${e1}🔥💨🌍🌊 与 ${e2}）天然互补，彼此能为对方提供所欠缺的视角。这是良好的化学反应的来源。</p>`;
  } else {
    html += `<p>你们的上升元素（${e1} 与 ${e2}）差异较大，初期可能需要更多的理解和适应，但也因此能带来深刻的互相学习和成长。</p>`;
  }

  html += '<p style="color:var(--text-dim);margin-top:12px;">※ 合盘是复杂的艺术，以上仅为初步分析。真正的缘分需要双方用心经营。</p>';
  html += '</div>';

  return html;
}

// ── Guidance Report ───────────────────────────────────────────────────────
function generateGuidance(positions, houses, asc) {
  let html = '<div class="report-section">';

  html += '<h3>✦ 当前宇宙给你的讯息</h3>';

  // Current Saturn transit guidance
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitPos = calcAllPlanets(nowT);

  const saturnTransitSign = degToSign(transitPos.Saturn).si;
  const jupiterTransitSign = degToSign(transitPos.Jupiter).si;

  html += `<p><span class="highlight">🪐 土星当前在${SIGNS[saturnTransitSign]}</span>，它问你：`;
  const saturnMessages = [
    "你愿意为真正重要的目标付出多少努力和耐心？",
    "哪些旧有的结构和模式已经不再服务于你的成长，需要被放下？",
    "你是否在逃避你内心真正知道需要面对的责任？",
    "你的根基够不够稳固？你需要在哪里建立更强的纪律和边界？"
  ];
  html += `「${saturnMessages[saturnTransitSign % 4]}」</p>`;

  html += `<p><span class="highlight">⭐ 木星当前在${SIGNS[jupiterTransitSign]}</span>，它告诉你：`;
  const jupiterMessages = [
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
  html += `「${jupiterMessages[jupiterTransitSign]}」</p>`;

  // Life path based on Sun house
  const sunHouse = houses.Sun || 1;
  html += `<h3>✦ 你当前的人生课题</h3>`;
  const guidanceByHouse = {
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
  html += `<p>${guidanceByHouse[sunHouse]}</p>`;

  // Additional insight based on prominent planet
  html += '<h3>✦ 星盘的智慧话语</h3>';
  const moonHouse = houses.Moon || 1;
  const saturnHouse = houses.Saturn || 1;
  const jupiterHouse = houses.Jupiter || 1;

  html += '<p style="border-left:3px solid var(--gold-dim);padding-left:16px;margin:12px 0;color:var(--accent);">';
  const wisdomPool = [
    `你的月亮在第${moonHouse}宫——真正的安全感不是来自外界，而是你与自己的和解。照顾好你的情绪需求，这不是软弱，是智慧。`,
    `你的土星在第${saturnHouse}宫——最困难的道路往往通向最美的风景。你在这个领域的挣扎，正在锻造你灵魂的肌肉。`,
    `你的木星在第${jupiterHouse}宫——幸运不是等待机会，而是准备好了的自己。在这个领域保持学习和开放，大门会自然打开。`,
    `你的上升星座守护着你的外在路径，但你的太阳才是你真正的目的地。不要为了取悦世界而忘记你为何而来。`,
    `星盘中没有绝对的吉凶——刑冲相位虽然带来张力，却是你此生最有可能实现突破的领域。拥抱你的不完美。`
  ];
  html += wisdomPool[Math.floor(Math.random() * wisdomPool.length)];
  html += '</p>';

  html += '<p style="color:var(--text-dim);margin-top:16px;">※ 星盘是指南针，不是判决书。你所拥有的自由意志，才是最强大的行星。</p>';
  html += '</div>';

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CAREER GENIUS — Dynamic career diagnosis (对标 career_path.txt)
// ═══════════════════════════════════════════════════════════════════════════

function generateCareerGenius(positions, houses, aspects, asc, mc, userJob) {
  const houseNames = ["命宫","财帛宫","兄弟宫","田宅宫","子女宫","健康宫","夫妻宫","疾厄宫","迁移宫","事业宫","交友宫","玄秘宫"];
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

  // ═══ Part 1: Planet energy distribution ═══
  html += '<div class="report-section"><h3>✦ 第一部分：行星能量分布</h3>';

  html += '<p style="color:var(--accent);text-indent:0;margin-bottom:12px;">你的行星能量集中在以下宫位：</p>';

  for (let i = 0; i < 12; i++) {
    if (housePlanets[i].length > 0) {
      const planetNames = housePlanets[i].map(pid => {
        const p = PLANETS.find(x => x.id === pid);
        const {si} = degToSign(positions[pid]);
        return (p ? p.name : pid) + '(' + SIGN_PURE[si].replace('座','') + ')';
      });
      html += '<p style="text-indent:0;margin-bottom:4px;"><strong>第' + (i+1) + '宫（' + houseNames[i] + '）：</strong>' + planetNames.join('、') + '</p>';

      // Dynamic rules for specific house clusters
      const ppCount = housePersonal[i].length;
      if (ppCount >= 3) {
        const ruleMap = {
          2: '你有' + ppCount + '颗个人行星聚集在第2宫——你对金钱和价值的敏感度远超常人。财富积累是你此生的核心课题之一，你天生适合与金钱、资源、价值评估相关的工作，而非纯粹的执行性岗位。',
          3: '你有' + ppCount + '颗个人行星聚集在第3宫——这是写作、表达、沟通、创意的殿堂。你的天赋是：用文字和语言影响他人、创作内容、传播知识。而不是：整理表格、走流程、做事务性重复工作。',
          4: '你有' + ppCount + '颗个人行星聚集在第4宫——家庭、根源、内在安全感是你生命的重心。你适合与房地产、家居、家族事业、或深度情感关怀相关的领域。',
          5: '你有' + ppCount + '颗个人行星聚集在第5宫——创造力、表现力、浪漫是你灵魂的燃料。你天生适合舞台、艺术、创意产业，或任何能让你的独特性闪耀的领域。',
          9: '你有' + ppCount + '颗个人行星聚集在第9宫——高等教育、哲学、远行和信仰是你的灵魂路径。你适合学术、出版、跨文化交流或精神导师类工作。',
          10: '你有' + ppCount + '颗个人行星聚集在第10宫——事业和社会成就刻在你的灵魂蓝图里。你注定要在这个世界留下可见的印记，不适合隐于幕后。',
          12: '你有' + ppCount + '颗个人行星聚集在第12宫——灵性、潜意识、幕后的力量是你最大的资源。你适合心理咨询、灵性疗愈、艺术创作或在大型机构中担任幕后关键角色。'
        };
        if (ruleMap[i+1]) {
          html += '<p style="color:#c8a060;font-size:0.88em;text-indent:0;margin-left:16px;border-left:2px solid var(--gold-dim);padding-left:12px;">' + ruleMap[i+1] + '</p>';
        }
      }
    }
  }

  // Jupiter in 8th rule
  if (houses.Jupiter === 8) {
    html += '<p style="color:var(--accent);text-indent:0;margin-top:8px;">⭐ 木星（大吉星）落在第8宫——你天生适合投资、偏财、深度资源运作。你对"他人的资源"（客户资金、合伙财产、保险、遗产规划等）有天然的嗅觉和运气。</p>';
  }

  // Pluto in 10th rule
  if (houses.Pluto === 10) {
    html += '<p style="color:var(--accent);text-indent:0;margin-top:4px;">⭐ 冥王星落在第10宫——你的事业注定要经历彻底的转化。你不可能在同一岗位做20年——这不是缺陷，而是你星盘的剧本。每一次"职业死亡"都孕育着更强大的重生。</p>';
  }

  // Mars in 6H
  if (houses.Mars === 6) {
    html += '<p style="color:var(--accent);text-indent:0;">你的火星在第6宫——你需要动手的、有实质产出、能立即看到成果的工作。纯抽象的、只动嘴皮子的工作会消耗你的生命力。</p>';
  }

  // Saturn in 12H
  if (houses.Saturn === 12) {
    html += '<p style="color:var(--accent);text-indent:0;">土星在第12宫——你的事业发展节奏和别人不同。你需要在幕后默默积累一段时间，然后一举突破。急不得，但也停不下来。</p>';
  }

  html += '</div>';

  // ═══ Gap Analysis (if user provided job) ═══
  if (userJob && userJob.trim()) {
    html += '<div class="report-section"><h3>✦ 工作满意度差距分析</h3>';

    // Determine what the chart needs
    const needsCreative = (housePersonal[2] && housePersonal[2].length >= 2) || (housePersonal[4] && housePersonal[4].length >= 2) || (positions.Mercury && degToSign(positions.Venus).si === degToSign(positions.Mercury).si);
    const needsExpression = (housePersonal[2] && housePersonal[2].length >= 2) || (housePersonal[4] && housePersonal[4].length >= 1);
    const needsAutonomy = houses.Uranus === 10 || houses.Mars === 1 || (degToSign(asc).si >= 0 && [0,3,6,8].includes(degToSign(positions.Sun).si));
    const needsGrowth = houses.Pluto === 10 || houses.Jupiter === 10 || housePersonal[9] && housePersonal[9].length >= 2;
    const needsConnection = degToSign(positions.Sun).si >= 3 && degToSign(positions.Sun).si <= 5; // Cancer/Leo/Virgo

    html += '<table class="gap-table"><thead><tr><th>维度</th><th>当前工作</th><th>星盘真正需要</th></tr></thead><tbody>';
    html += '<tr><td>创造性</td><td>★★☆☆☆</td><td>' + (needsCreative ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>表达空间</td><td>★★☆☆☆</td><td>' + (needsExpression ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>独立自主</td><td>★★☆☆☆</td><td>' + (needsAutonomy ? '★★★★☆' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>上升空间</td><td>★★☆☆☆</td><td>' + (needsGrowth ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '<tr><td>情感连接</td><td>★★☆☆☆</td><td>' + (needsConnection ? '★★★★★' : '★★★☆☆') + '</td></tr>';
    html += '</tbody></table>';

    html += '<p style="color:#c87070;text-indent:0;margin-top:12px;"><strong>差距诊断：</strong>你目前的「' + userJob + '」与你的星盘能力结构存在明显错位。这不是你能力不够——而是位置错了。你的星盘配置需要的是创造、表达和成长空间，而非重复执行和被动等待。</p>';
    html += '</div>';
  }

  // ═══ Part 2: Four Career Directions ═══
  html += '<div class="report-section"><h3>✦ 第二部分：你的天赋与职业方向</h3>';
  html += '<p style="color:var(--text-dim);text-indent:0;margin-bottom:14px;">以下方向基于你的星盘真实配置，按匹配度从高到低排列：</p>';

  const directions = [];

  // Direction: Content Creation / Media
  let score1 = 0;
  const reasons1 = [];
  const mc3 = housePersonal[2] ? housePersonal[2].length : 0;
  if (mc3 >= 2) { score1 += 3; reasons1.push('第3宫聚集' + mc3 + '颗个人行星——表达/沟通是你最强大的工具'); }
  if (mc3 >= 1) { score1 += 1; }
  // Mercury-Venus conjunction in 3H
  const mercVenusDiff = mod360(Math.abs(positions.Mercury - positions.Venus));
  if (mercVenusDiff <= 8 && houses.Mercury === 3) { score1 += 2; reasons1.push('水星+金星合相第3宫——表达兼具美感与情感深度'); }
  // Mercury in water signs
  const mercSign = degToSign(positions.Mercury).si;
  if ([3,7,11].includes(mercSign)) { score1 += 1; reasons1.push('水星在水象星座——表达富有情感和直觉深度'); }
  // Moon in 9H
  if (houses.Moon === 9) { score1 += 1; reasons1.push('月亮第9宫——适合做有深度的教育/文化/心理内容'); }
  directions.push({
    name: '内容创作 / 自媒体',
    desc: '写作、知识输出、观点表达、视频创作——你内在有很多感受和洞察需要被世界看到。' + (mercSign >= 3 && mercSign <= 5 ? '巨蟹/狮子/处女座的情感细腻让你的内容有独特的温度。' : ''),
    score: score1, reasons: reasons1
  });

  // Direction: Education / Training / Consulting
  let score2 = 0;
  const reasons2 = [];
  const has3H = housePersonal[2] && housePersonal[2].length >= 1;
  const has9H = housePersonal[8] && housePersonal[8].length >= 1;
  if (has3H && has9H) { score2 += 3; reasons2.push('第3宫-第9宫轴线被激活——你天生适合"把复杂的东西讲清楚"'); }
  if (houses.Moon === 9) { score2 += 2; reasons2.push('月亮第9宫——有耐心帮别人梳理人生和知识体系'); }
  if (houses.Jupiter === 9 || (degToSign(positions.Jupiter).si === 3 || degToSign(positions.Jupiter).si === 8)) { score2 += 1; reasons2.push('木星强化了教学和传播的幸运'); }
  const moonSign = degToSign(positions.Moon).si;
  if (moonSign === 9 || moonSign === 0 || moonSign === 6) { score2 += 1; reasons2.push('月亮' + SIGN_PURE[moonSign] + '——有框架感和逻辑耐心'); }
  directions.push({
    name: '教育培训 / 咨询指导',
    desc: '无论是学科教育、职业技能培训还是生涯咨询，你的星盘支持你把知识和经验转化为他人的成长动力。',
    score: score2, reasons: reasons2
  });

  // Direction: Arts / Aesthetics / Beauty
  let score3 = 0;
  const reasons3 = [];
  const venusSign = degToSign(positions.Venus).si;
  if (venusSign === 1 || venusSign === 6) { score3 += 2; reasons3.push('金星在' + SIGN_PURE[venusSign] + '——审美品味是你的隐性天赋'); }
  if (degToSign(asc).si === 1) { score3 += 2; reasons3.push('上升金牛——对质感、美感、舒适有天然的鉴别力'); }
  if (houses.Venus === 2 || houses.Venus === 7) { score3 += 1; reasons3.push('金星落财帛/夫妻宫——你能把审美转化为价值或人际吸引力'); }
  if (degToSign(positions.Sun).si >= 3 && degToSign(positions.Sun).si <= 5) { score3 += 1; reasons3.push('太阳水象——情感温度是你创作的灵魂'); }
  directions.push({
    name: '文化艺术 / 美业 / 设计',
    desc: '家居、穿搭、生活方式、美食、文创——你的审美不需要"学"，它已经刻在你的星盘里。' + (degToSign(asc).si === 1 ? '上升金牛的质感追求+内在的情感温度=独特的审美风格，这是市场上稀缺的组合。' : ''),
    score: score3, reasons: reasons3
  });

  // Direction: Psychology / Healing / Spirituality
  let score4 = 0;
  const reasons4 = [];
  if (houses.Neptune === 9 || houses.Neptune === 12) { score4 += 3; reasons4.push('海王星在第' + houses.Neptune + '宫——对深层心理和灵性有天然的感知力'); }
  if (houses.Pluto === 8) { score4 += 2; reasons4.push('冥王星第8宫——能洞察人性的深渊和转化的力量'); }
  if (moonSign === 7 || moonSign === 11) { score4 += 2; reasons4.push('月亮在天蝎/双鱼——情感触角极其敏锐'); }
  const h12Count = housePersonal[11] ? housePersonal[11].length : 0;
  if (h12Count >= 2) { score4 += 2; reasons4.push('第12宫群星——你此生的使命与灵性服务有关'); }
  directions.push({
    name: '心理学 / 疗愈 / 身心灵领域',
    desc: '心理咨询、塔罗占星、生涯规划、能量疗愈——这不是"不务正业"，这是你星盘明确指出的天赋路径。你的共情力和洞察力让你能触及他人触及不到的深度。',
    score: score4, reasons: reasons4
  });

  // Direction: Business / Leadership / Entrepreneurship
  let score5 = 0;
  const reasons5 = [];
  if (degToSign(positions.Sun).si === 0 || degToSign(positions.Sun).si === 4 || degToSign(positions.Sun).si === 8) { score5 += 1; reasons5.push('太阳火象——天然的领导力和开拓精神'); }
  if (houses.Mars === 1 || houses.Mars === 10) { score5 += 2; reasons5.push('火星在命宫/事业宫——行动力直指事业成功'); }
  if (houses.Jupiter === 2 || houses.Jupiter === 10) { score5 += 2; reasons5.push('木星在财帛/事业宫——商业扩张的天然好运'); }
  if (degToSign(positions.Saturn).si === 9) { score5 += 1; reasons5.push('土星摩羯——长期主义的商业耐心'); }
  directions.push({
    name: '商业创业 / 管理领导',
    desc: '你身上有创业者的DNA——敢于冒险、善于整合资源、并能带领团队向前。适合自己当老板，或者在组织中快速晋升到决策层。',
    score: score5, reasons: reasons5
  });

  // Direction: Technology / Data / Research
  let score6 = 0;
  const reasons6 = [];
  const mercSign2 = degToSign(positions.Mercury).si;
  if (mercSign2 === 2 || mercSign2 === 5 || mercSign2 === 10) { score6 += 2; reasons6.push('水星双子/处女/水瓶——分析力和逻辑力突出'); }
  if (houses.Saturn === 3 || houses.Saturn === 6) { score6 += 2; reasons6.push('土星在第' + houses.Saturn + '宫——深度钻研和精密的思维能力'); }
  if (houses.Uranus === 3 || houses.Uranus === 11) { score6 += 2; reasons6.push('天王星加持——创新思维和科技敏感度'); }
  directions.push({
    name: '科技研发 / 数据分析 / 学术研究',
    desc: '你拥有深入钻研一个领域并成为专家的潜力。适合科学研究、数据分析、技术开发、或任何需要严谨思维和创新突破并重的领域。',
    score: score6, reasons: reasons6
  });

  // Sort by score descending, take top 4
  directions.sort((a, b) => b.score - a.score);
  const topDirections = directions.slice(0, 4);

  for (let i = 0; i < topDirections.length; i++) {
    const d = topDirections[i];
    const isTop = i === 0;
    html += '<div class="direction-card' + (isTop ? ' top-match' : '') + '">';
    if (isTop) html += '<span class="direction-score">最匹配</span>';
    html += '<h4>' + (i === 0 ? '【方向一】' : i === 1 ? '【方向二】' : i === 2 ? '【方向三】' : '【方向四】') + ' ' + d.name + '</h4>';
    html += '<p>' + d.desc + '</p>';
    if (d.reasons.length > 0) {
      html += '<p style="font-size:0.8em;color:#8a8aa0;margin-top:6px;">星盘依据：' + d.reasons.join('；') + '</p>';
    }
    html += '</div>';
  }

  html += '</div>';

  // ═══ Part 3: Action Plan — LOCKED ═══
  html += renderLockedBlock(
    '解锁完整职业转型行动方案',
    '上面四个方向你已经看到了。但具体怎么从「' + (userJob || '现在') + '」一步步跳出去？<br>加微信获取为你量身撰写的四步行动方案、时间线和一句话方向诊断',
    [{icon:'💬', platform:'微信', id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  return html;
}

// ── Full career action plan (unlocked when rendered from PDF/premium) ──────
function generateCareerActionPlan(positions, houses, userJob, topDirections) {
  var html = '';
  const topDir = topDirections[0];

  // Step 1: After-work 2 hours
  html += '<div class="action-step">';
  html += '<div class="step-label">第1步：从"下班后2小时"开始（' + new Date().getFullYear() + '年）</div>';
  html += '<p>不用辞职，不用大张旗鼓。每天留1-2小时，做一件与你天赋相关的事：<br>';
  if (topDir.name.includes('内容') || topDir.name.includes('自媒体')) {
    html += '• 写一篇内容（小红书/公众号/知乎/短视频脚本）<br>• 录一个短视频（读书心得/行业观察/生活感悟）<br>• 搭建一个简单的知识分享账号';
  } else if (topDir.name.includes('教育') || topDir.name.includes('咨询')) {
    html += '• 整理一个你擅长领域的知识框架<br>• 做一次免费分享（线上/线下）测试你的输出能力<br>• 研究目标学员/客户的需求和痛点';
  } else if (topDir.name.includes('艺术') || topDir.name.includes('美业')) {
    html += '• 创建一个视觉灵感库（Pinterest/小红书收藏）<br>• 尝试一个小的创作项目（穿搭/家居/手作）<br>• 把你的审美变成可分享的内容';
  } else if (topDir.name.includes('心理') || topDir.name.includes('疗愈')) {
    html += '• 系统学习一个疗愈/心理学课程的基础模块<br>• 从帮身边的朋友做免费解读开始<br>• 记录你的个案心得和观察';
  } else if (topDir.name.includes('商业') || topDir.name.includes('创业')) {
    html += '• 研究一个你感兴趣的细分市场<br>• 列出10个潜在客户/用户的真实需求<br>• 做一个小规模测试（最小可行产品）';
  } else {
    html += '• 选定一个方向深入学习，每天积累<br>• 记录你的学习心得和阶段性成果<br>• 找到3个该领域的榜样，研究他们的路径';
  }
  const nowYear = new Date().getFullYear();
  html += '<br><span style="color:var(--accent);">' + nowYear + '-' + (nowYear+1) + '年是表达力和行动的黄金窗口期——你投入的内容和努力会比平时更容易被看到。</span></p>';
  html += '</div>';

  // Step 2: Find niche
  html += '<div class="action-step">';
  html += '<div class="step-label">第2步：找到你"1厘米宽、1公里深"的切入点</div>';
  html += '<p>不必什么都会——星盘建议你走深度路线。选一个你真正有感触、能持续输出、且市场愿意买单的方向：<br>';
  const moonSi = degToSign(positions.Moon).si;
  const moonStyle = (moonSi >= 0 && moonSi <= 2) ? '行动力强、直接果断的风格' :
                    (moonSi >= 3 && moonSi <= 5) ? '情感细腻、能触及人心的风格' :
                    (moonSi >= 6 && moonSi <= 8) ? '理性分析、有框架感的风格' :
                    '深度洞察、有哲学意味的风格';
  html += '• 你的月亮在' + SIGN_PURE[moonSi] + '——你的独特优势是' + moonStyle + '<br>';
  html += '• 月亮' + SIGN_PURE[moonSi] + '不是兴趣广泛的类型，而是深耕一个领域成为专家的料</p>';
  html += '</div>';

  // Step 3: Barbell strategy
  html += '<div class="action-step">';
  html += '<div class="step-label">第3步：用"杠铃策略"控制风险</div>';
  let saturnCaution = '';
  if (houses.Saturn === 12) saturnCaution = '土星当前在你的第12宫领域运作——这时期不鼓励冲动辞职，而是要在幕后做好准备。耐心是这个阶段最重要的资产。';
  else if (houses.Saturn === 10) saturnCaution = '土星在事业宫意味着你的事业转型需要稳扎稳打——用心积累每一点经验和人脉，量变终会引起质变。';
  else if (houses.Saturn === 6) saturnCaution = '土星在日常工作宫——你需要在现有岗位上磨练技能和耐心，同时用业余时间铺设转型之路。';
  else saturnCaution = '土星在你第' + (houses.Saturn || '?') + '宫——在每个阶段打下扎实的基础，不跳过任何一个必要的步骤。';
  html += '<p>• 一边做稳定的当前工作（保底）<br>• 一边用小成本试错新方向（突破）<br>• 直到新方向的收入超过主业的1/3，再考虑下一步<br>• ' + saturnCaution + '</p>';
  html += '</div>';

  // Step 4: Timeline
  html += '<div class="action-step">';
  html += '<div class="step-label">第4步：你要相信的时间线</div>';
  const y = new Date().getFullYear();
  html += '<p>' + y + '-' + (y+1) + '  起步期——种下种子，每天积累内容/技能/人脉<br>';
  html += (y+2) + '-' + (y+3) + '  转型准备期——内心越来越清晰，副业开始有起色<br>';
  html += (y+4) + '-' + (y+5) + '  突破期——身份跃升，正式转换赛道<br>';
  html += '<span style="color:var(--accent);">不要用辞职来逃跑。要用副业来接住自己。从今晚开始。</span></p>';
  html += '</div>';

  html += '</div>';

  // ═══ Part 4: One-line summary ═══
  html += '<div class="report-section">';
  html += '<h3>✦ 一句话说清楚</h3>';

  // Build dynamic summary
  let coreTalent = '';
  const topHouseCount = Object.entries(housePersonal).sort((a,b) => b[1].length - a[1].length)[0];
  if (topHouseCount && topHouseCount[1].length >= 2) {
    const talentMap = {2:'写作/表达/内容创作',3:'写作/表达/内容创作',4:'家庭/情感关怀',5:'创意/艺术/表现',9:'教育/哲学/传播',10:'事业/领导/管理',12:'灵性/疗愈/幕后'};
    coreTalent = talentMap[parseInt(topHouseCount[0])+1] || '创造和表达';
  } else {
    coreTalent = '创造和表达';
  }

  const firstStep = topDir.name.includes('内容') ? '写一篇文章' :
                    topDir.name.includes('教育') ? '整理一份知识大纲' :
                    topDir.name.includes('艺术') ? '做一个小创作' :
                    topDir.name.includes('心理') ? '为一位朋友做一次免费解读' :
                    topDir.name.includes('商业') ? '研究一个你感兴趣的细分市场' :
                    '投入1小时做一件与天赋相关的事';

  html += '<p style="font-size:1.05em;border-left:3px solid var(--gold-dim);padding-left:18px;color:var(--accent);text-indent:0;">';
  if (userJob && userJob.trim()) {
    html += '「' + userJob + '」不是你该待的地方。';
  } else {
    html += '你的灵魂知道哪里不对——即使说不清楚。';
  }
  html += '你的星盘核心天赋是<strong>' + coreTalent + '</strong>——这是你与生俱来的工具。<br><br>';
  html += '不要用辞职来逃跑。要用副业来接住自己。<br>从今晚' + firstStep + '开始。</p>';
  html += '</div>';

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
//  RELATIONSHIPS — Family, Friends, Love
// ═══════════════════════════════════════════════════════════════════════════

function generateRelationships(positions, houses, aspects, asc) {
  const personalPlanetIds = ['Sun','Moon','Mercury','Venus','Mars'];
  let html = '';

  // ── Family (亲情) ──
  html += '<div class="report-section"><h3>✦ 亲情 — 家庭与根源</h3>';

  const moonSi = degToSign(positions.Moon).si;
  const moonH = houses.Moon || '?';
  html += '<p><span class="highlight">月亮在' + SIGN_PURE[moonSi] + '／第' + moonH + '宫</span>——你的情感底色和安全感来源。</p>';
  const moonFamilyMap = {
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
  html += '<p>' + (moonFamilyMap[moonSi] || '你的情感根基与家庭紧密相连。') + '</p>';

  const saturnSi = degToSign(positions.Saturn).si;
  const saturnH = houses.Saturn || '?';
  html += '<p style="margin-top:12px;"><span class="highlight">土星在' + SIGN_PURE[saturnSi] + '／第' + saturnH + '宫</span>——你与权威/父母的关系模式。</p>';
  if (saturnH === 4 || saturnH === '4') {
    html += '<p>土星在第4宫暗示你早年家庭环境中可能有较严格或沉重的氛围。你从小学会了"靠自己"——这不是冷漠，而是一种被生活磨练出来的韧性。随着年岁增长，你与家人的关系会越来越和解与温暖。</p>';
  } else if (saturnH === 10 || saturnH === '10') {
    html += '<p>土星在事业宫——父母（尤其是母亲一方）对你的事业和人生成就有较高期待。这种压力可能内化为你对自己的严格要求。学会区分"父母的期待"和"自己真正想要的"是你重要的人生课题。</p>';
  } else {
    html += '<p>土星在你的第' + saturnH + '宫——家族责任和结构性课题在这个领域体现。成年后，你有机会重新定义"家庭"在你人生中的意义和边界。</p>';
  }

  // IC / 4H cusp
  const icSign = degToSign(mod360(asc + 180)).si;
  html += '<p style="margin-top:8px;">你的天底（IC）在<strong>' + SIGN_PURE[icSign] + '</strong>——这代表你的"根"和内在的家。</p>';
  const icMap = {
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
  html += '<p>' + (icMap[icSign] || '你的"根"与你的家庭记忆和情感安全紧密相连。') + '</p>';

  html += '</div>';

  // ── Friends (友情) ──
  html += '<div class="report-section"><h3>✦ 友情 — 社交与社群</h3>';

  const h11Planets = [];
  for (const pid of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']) {
    if (houses[pid] === 11) h11Planets.push(pid);
  }
  if (h11Planets.length > 0) {
    const pNames = h11Planets.map(pid => {
      const p = PLANETS.find(x => x.id === pid);
      return p ? p.name : pid;
    });
    html += '<p><span class="highlight">第11宫行星：' + pNames.join('、') + '</span>——你的社交圈特质。</p>';
    if (h11Planets.includes('Jupiter')) html += '<p>木星在第11宫——朋友是你人生中重要的幸运来源。你容易结交到有资源、有格局的人，社交圈不断扩展。你的"贵人"往往从朋友中而来。</p>';
    if (h11Planets.includes('Saturn')) html += '<p>土星在第11宫——你对朋友的质量要求高于数量。你的朋友圈可能不大，但一旦建立就是长久的关系。你在社交中倾向于"少而精"。</p>';
    if (h11Planets.includes('Venus')) html += '<p>金星在第11宫——你在朋友中是受欢迎的"和谐制造者"。社交让你快乐，你也天生懂得如何让一群人聚在一起感到舒适。</p>';
    if (h11Planets.includes('Uranus')) html += '<p>天王星在第11宫——你吸引到的朋友多是独特、有想法、不按常理出牌的人。你的社交圈可能跨越不同领域和背景，充满新鲜感。</p>';
  } else {
    html += '<p><span class="highlight">第11宫没有行星</span>——你在社交上可能是有选择性的。你不需要大量的朋友，但你在寻找的是能与你灵魂共鸣的"同类"。质量永远大于数量。</p>';
  }

  // Mercury aspects for communication
  const mercAspects = aspects.filter(a => (a.p1 === 'Mercury' || a.p2 === 'Mercury')).slice(0, 3);
  if (mercAspects.length > 0) {
    html += '<p style="margin-top:8px;">在朋友交往中，你的沟通风格：</p>';
    for (const a of mercAspects) {
      const other = a.p1 === 'Mercury' ? a.p2 : a.p1;
      const otherP = PLANETS.find(x => x.id === other);
      if (otherP) {
        html += '<p style="font-size:0.85em;color:#9a9ab0;">↳ 水星' + a.name + otherP.name + ' — ';
        if (a.name === '三合' || a.name === '六合') html += '在朋友中你是善于倾听和共情的人，沟通自然流畅。';
        else if (a.name === '刑') html += '你在交流中可能有时过于直率或紧张，但也因此你的真诚让人信赖。';
        else if (a.name === '冲') html += '你在朋友中的角色常常是"提出不同观点的人"——你的视角能帮朋友看到另一面。';
        else html += '你能与朋友进行深度的思想交流。';
        html += '</p>';
      }
    }
  }

  html += '</div>';

  // ── Love (爱情) ──
  html += '<div class="report-section"><h3>✦ 爱情 — 亲密关系</h3>';

  const venusSi = degToSign(positions.Venus).si;
  const marsSi = degToSign(positions.Mars).si;
  const venusH = houses.Venus || '?';
  const marsH = houses.Mars || '?';
  const h7Planets = [];
  for (const pid of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']) {
    if (houses[pid] === 7) h7Planets.push(pid);
  }

  html += '<p><span class="highlight">金星在' + SIGN_PURE[venusSi] + '／第' + venusH + '宫</span>——你如何表达爱、什么样的人吸引你。</p>';
  const venusLoveMap = {
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
  html += '<p>' + (venusLoveMap[venusSi] || '你的爱的语言是独特而深刻的。') + '</p>';

  html += '<p style="margin-top:12px;"><span class="highlight">火星在' + SIGN_PURE[marsSi] + '／第' + marsH + '宫</span>——你的欲望模式和激情触发点。</p>';
  const marsDesireMap = {
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
  html += '<p>' + (marsDesireMap[marsSi] || '你的激情是你生命力的核心。') + '</p>';

  // 7H planets
  if (h7Planets.length > 0) {
    const p7Names = h7Planets.map(pid => {
      const p = PLANETS.find(x => x.id === pid);
      return p ? p.name : pid;
    });
    html += '<p style="margin-top:12px;"><span class="highlight">第7宫行星：' + p7Names.join('、') + '</span>——你在伴侣身上寻找的特质。</p>';
    if (h7Planets.includes('Jupiter')) html += '<p>木星在第7宫——你的伴侣很可能是有格局、有智慧、或来自不同文化背景的人。婚姻/伴侣关系是你人生重要的幸运管道。</p>';
    if (h7Planets.includes('Saturn')) html += '<p>土星在第7宫——你可能晚婚，或在关系中特别认真谨慎。你需要的不是一段轻松的恋情，而是一个能共同建造未来的伴侣。</p>';
    if (h7Planets.includes('Pluto')) html += '<p>冥王星在第7宫——你的亲密关系是深刻转化的场所。你吸引到的伴侣往往带着强烈的能量——关系中的"死亡与重生"是你灵魂成长的必经之路。</p>';
  }

  // Moon-Venus aspect
  let moonVenusDiff = mod360(Math.abs(positions.Moon - positions.Venus));
  if (moonVenusDiff > 180) moonVenusDiff = 360 - moonVenusDiff;
  html += '<p style="margin-top:12px;"><span class="highlight">月亮与金星的关系</span>——你的情感需求与爱的表达之间';
  if (Math.abs(moonVenusDiff - 120) <= 8 || Math.abs(moonVenusDiff - 60) <= 6) {
    html += '处于<strong style="color:#7ab87a;">和谐状态</strong>。你的情感需求和爱的表达方式相辅相成——你容易在关系中感到满足和平衡。</p>';
  } else if (Math.abs(moonVenusDiff - 0) <= 8) {
    html += '处于<strong style="color:#d4a843;">融合状态</strong>。你的情感需求和爱的表达合为一体——你通过照顾和滋养来表达爱，也期待同样的方式被爱。</p>';
  } else if (Math.abs(moonVenusDiff - 90) <= 7 || Math.abs(moonVenusDiff - 180) <= 8) {
    html += '存在<strong style="color:#c87070;">内在张力</strong>。你在关系中可能反复经历"靠近-疏远"的循环。你需要的是既能给你安全感又给你自由的关系——这不是矛盾，而是你此生的核心情感课题。</p>';
  } else {
    html += '的关系较为独立。你可能在不同的人生阶段对"爱"有不同的理解和需求——这是你的灵活性，也是你的成长空间。</p>';
  }

  html += '</div>';

  // ═══ Social引流: 加微信解锁深度缘分分析 ═══
  html += renderLockedBlock(
    '解锁深度缘分分析',
    '想知道你的金星/火星配置如何影响择偶模式？<br>加微信获取专属合盘解读、桃花运分析和关系疗愈建议<br><span style="font-size:0.85em;color:#8a8aaa;">📕 小红书 LunarVeilAstro 每日推送运势，不提供私信解读</span>',
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
  if (!query) { statusEl.textContent = '⚠️ 请输入城市名或地址'; statusEl.className = 'geo-status error'; return; }

  statusEl.textContent = '⏳ 正在查询坐标...';
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
    statusEl.textContent = '⚠️ 查询失败，请在下方手动输入经纬度';
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
    if (!d1) { alert('请完整填写本人的出生信息'); return; }

    // Show ritual overlay
    const overlay = document.getElementById('ritualOverlay');
    overlay.style.display = 'flex';

    // Mystical loading phrases
    const phrases = [
      '星辰正在排列...',
      '星光穿越千年抵达...',
      '宇宙正为你调谐频率...',
      '命运之轮开始转动...',
      '你的星图正在展开...',
      '行星的低语穿越苍穹...',
      '灵魂的蓝图正在显影...',
      '古老的智慧正在苏醒...',
      '天穹之下，万物有灵...',
      '你的故事即将浮现...'
    ];
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
          phraseEl.textContent = '命运之轮已就位...';
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

          // Show PDF/email buttons
          document.getElementById('btnPdf').style.display = 'inline-block';
          document.getElementById('btnEmail').style.display = 'inline-block';

          // Collapse input card, show summary bar
          collapseInputCard();

        }, 800);
      } catch(e) {
        clearInterval(phraseInterval);
        overlay.style.display = 'none';
        document.getElementById('resultsCard').style.display = 'block';
        document.getElementById('tab0').innerHTML = '<p style=\"color:#c87070;padding:20px;\">计算出错：' + e.message + '</p>';
        console.error(e);
      }
    }, 200);
  } catch(e) {
    document.getElementById('resultsCard').style.display = 'block';
    document.getElementById('tab0').innerHTML = '<p style=\"color:#c87070;padding:20px;\">计算出错：' + e.message + '</p>';
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
  html += '<div class="blueprint-stat"><div class="stat-val">☉ ' + SIGN_PURE[sunSign] + '</div><div class="stat-lbl">太阳 · 第' + (d.houses.Sun||'?') + '宫</div></div>';
  html += '<div class="blueprint-stat"><div class="stat-val">☽ ' + SIGN_PURE[moonSign] + '</div><div class="stat-lbl">月亮 · 第' + (d.houses.Moon||'?') + '宫</div></div>';
  html += '<div class="blueprint-stat"><div class="stat-val">ASC ' + SIGN_PURE[ascSign] + '</div><div class="stat-lbl">上升星座</div></div>';
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
  html += '<h3 style="color:var(--text-dim);">✦ 星盘数据参考</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.8em;margin-bottom:12px;">以下是你的出生星盘精确数据，供深入学习参考。</p>';

  html += '<div style="overflow-x:auto;">';
  html += '<table class="chart-table">';
  html += '<thead><tr><th>行星</th><th>位置</th><th>宫位</th><th>元素</th><th>模式</th></tr></thead><tbody>';
  for (const p of PLANETS) {
    const lon = d.positions[p.id];
    const {si, d:dd, m} = degToSign(lon);
    const h = d.houses[p.id] || '?';
    const elem = ELEMENTS[si], mode = MODES[si];
    const tagCls = elem==='火'?'tag-fire':elem==='土'?'tag-earth':elem==='风'?'tag-air':'tag-water';
    html += `<tr>
      <td>${p.name}</td>
      <td>${SIGNS[si]} ${dd}°${String(m).padStart(2,'0')}′</td>
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
    '解锁专属年度运势报告',
    '本命星盘只是开始。加微信发送你的出生信息，获取为你量身撰写的<br>年度运势、行运解读和灵魂功课指引（约3000字深度报告）',
    [{icon:'💬', platform:'微信', id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  document.getElementById('tab0').innerHTML = html;
  } catch(e) { document.getElementById('tab0').innerHTML = '<p style=\"color:#c87070;padding:20px;\">渲染错误：' + e.message + '</p>'; console.error(e); }
}

// ── Tab 1: Forecast ───────────────────────────────────────────────────────
function renderTab1() {
  try {
  const d = chartData1;
  let html = '';

  // Fortune sub-tabs navigation
  html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">';
  html += '<button class="fortune-sub-tab active" onclick="switchFortune(\'weekly\')">本周运势</button>';
  html += '<button class="fortune-sub-tab" onclick="switchFortune(\'monthly\')">本月运势</button>';
  html += '<button class="fortune-sub-tab" onclick="switchFortune(\'yearly\')">今年运势</button>';
  html += '<button class="fortune-sub-tab" onclick="switchFortune(\'fiveyear\')">五年运势</button>';
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
  } catch(e) { document.getElementById('tab1').innerHTML = '<p style=\"color:#c87070;padding:20px;\">渲染错误：' + e.message + '</p>'; console.error(e); }
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

  let html = '<div class="report-section">';
  html += '<h3>✦ 本周行运概览</h3>';
  html += '<p style="color:var(--text-dim);text-indent:0;margin-bottom:12px;">' + now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日起七日运势</p>';

  // Current Moon
  const moonSi = degToSign(transitNow.Moon).si;
  html += '<p><span class="highlight">月亮当前在' + SIGN_PURE[moonSi] + '</span>——本周你的情绪底色偏向' +
    (['火','火','火','水','水','水','风','风','风','土','土','土'][moonSi]) + '象能量。';
  if (moonSi <= 3) html += '适合主动出击、开启新事物、表达情感。';
  else if (moonSi <= 5) html += '适合内省、照顾自己、处理未完成的情感事务。';
  else if (moonSi <= 8) html += '适合社交、沟通、处理信息类工作。';
  else html += '适合规划、整理、处理现实世界的事务。';
  html += '</p>';

  // Current fast planets (Sun, Mercury, Venus, Mars)
  const fastPlanets = [
    {id:'Sun', name:'太阳', label:'本周核心焦点'},
    {id:'Mercury', name:'水星', label:'沟通与思维'},
    {id:'Venus', name:'金星', label:'社交与财运'},
    {id:'Mars', name:'火星', label:'行动与欲望'}
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
    html += '<p style="margin-top:6px;text-indent:0;"><strong>' + fp.name + '在' + SIGN_PURE[si] + '</strong> — ' + fp.label;
    if (aspectsToNatal.length > 0) {
      for (const a of aspectsToNatal) {
        const aspectDetail = describeWeeklyAspect(fp.id, a.planet.id, a.aspect, positions, houses);
        html += '<br><span style="font-size:0.85em;color:#b8b8c8;">' + fp.name + a.aspect + '本命' + a.planet.name + ' — ' + aspectDetail + '</span>';
      }
    }
    html += '</p>';
  }

  // Daily Moon sign changes — trendy compact edition
  html += '<p style="margin-top:14px;text-indent:0;"><strong>本周每日月亮行运：宜忌</strong></p>';
  html += '<table class="chart-table" style="font-size:0.8em;"><thead><tr><th>日期</th><th>月亮星座</th><th>宜</th><th>忌</th></tr></thead><tbody>';
  const dayNames = ['周日','周一','周二','周三','周四','周五','周六'];

  function getHolidayTag(m, d) {
    if (m === 1 && d === 1) return '🎉元旦';
    if (m === 1 && d >= 25) return '🧧春节倒计时';
    if (m === 2 && d <= 12) return '🧧春节ing';
    if (m === 4 && d >= 3 && d <= 6) return '🌿清明假期';
    if (m === 5 && d >= 1 && d <= 5) return '🛠️五一假期';
    if (m === 6 && d >= 8 && d <= 12) return '🐉端午';
    if (m === 9 && d >= 15 && d <= 22) return '🌕中秋';
    if (m === 10 && d >= 1 && d <= 7) return '🇨🇳国庆';
    if (m === 12 && d >= 20 && d <= 31) return '🎄年末假期';
    return '';
  }

  // 12 Moon-sign-based DO/DON'T pairs — short, punchy, modern
  const signDos = [
    '主动约饭 · 别想太多','吃顿好的 · 今天不将就','找人唠嗑 · 语音别打字','窝家点外卖 · 理直气壮','发自拍 · 不P也行',
    '大扫除 · 扔一件就算赢','约朋友喝咖啡 · 你请','一个人看剧 · 不准快进','搜机票 · 不买也算旅行','做计划 · 不做也行',
    '换头像 · 换种心情','睡午觉 · 定个闹钟再睡'
  ];
  const signDonts = [
    '冲动下单 · 先加购物车晾一天','暴饮暴食 · 留一口给明天','刷屏话痨 · 说到第几句了','熬夜emo · 十二点前关机','硬撑逞强 · 说一次"我不会"',
    '吹毛求疵 · 今天放过自己','讨好所有人 · 先讨好自己','翻旧账 · 已经翻篇了','说走就走 · 至少带个充电宝','立flag · 先立一个小的',
    '死守规矩 · 偶尔破个例','过度共情 · 先照顾好自己的情绪'
  ];

  // 7 day-specific vibes — one distinct flavor per weekday
  const dayDoBonus = [
    ['出门晒太阳','睡到自然醒','逛公园光合作用'],           // 周日
    ['摸鱼到午饭','慢慢进入状态','咖啡续命，勿扰'],          // 周一
    ['洗手间多待5分钟','假装很忙','认真挑午饭吃什么'],         // 周二
    ['悄悄给同事翻白眼','带薪发呆','云旅行（搜机票不买）'],   // 周三
    ['周四当周五过','提前计划周末','下班秒消失'],             // 周四
    ['把活推到下周','下午开始摸鱼','约今晚的饭局'],           // 周五
    ['睡到自然醒','Brunch+咖啡','在城市里瞎逛']               // 周六
  ];
  const dayDontBonus = [
    ['宅家一整天','为周一焦虑','看工作消息'],                 // 周日
    ['开会走神被抓','冲动提离职','在工位唉声叹气'],           // 周一
    ['连轴转不喝水','跟同事抬杠','午饭凑合吃'],               // 周二
    ['开会说真话','主动揽活','忘了今天是周三'],               // 周三
    ['把情绪写脸上','熬夜加班','跟老板硬刚'],                 // 周四
    ['假装勤奋加班','推进新项目','答应下周一交付'],           // 周五
    ['想起工作','设闹钟早起','刷工作群']                      // 周六
  ];

  for (let d = 0; d < 7; d++) {
    const dayJD = nowJD + d;
    const dayT = centuriesSinceJ2000(dayJD);
    const dayMoon = calcAllPlanets(dayT).Moon;
    const daySi = degToSign(dayMoon).si;
    const dayDate = new Date(now.getTime() + d * 86400000);
    const dow = dayDate.getDay();
    const holiday = getHolidayTag(dayDate.getMonth()+1, dayDate.getDate());
    const prefix = holiday ? '<span style="color:var(--accent);">'+holiday+'</span> ' : '';

    const doIdx = (dayDate.getDate() * 3 + dow) % dayDoBonus[dow].length;
    const dontIdx = (dayDate.getDate() * 7 + dow) % dayDontBonus[dow].length;

    const doText = prefix + signDos[daySi] + '；' + dayDoBonus[dow][doIdx];
    const dontText = signDonts[daySi] + '；' + dayDontBonus[dow][dontIdx];

    html += '<tr><td>' + dayNames[dow] + ' ' + (dayDate.getMonth()+1) + '/' + dayDate.getDate() + '</td><td>' + SIGN_PURE[daySi] + '</td><td style="font-size:0.85em;color:#c9c9c9;">' + doText + '</td><td style="font-size:0.85em;color:#8a8aa0;">' + dontText + '</td></tr>';
  }
  html += '</tbody></table>';

  // Lucky colors & crystals for the week
  const weekColors = [
    '#e63946 正红', '#c4a35a 琥珀金', '#f4a261 暖橙', '#e8e8e8 月光银',
    '#ffd700 太阳金', '#6b8e6b 橄榄绿', '#d4a0c0 玫瑰粉', '#8b0000 深酒红',
    '#7b68ee 紫罗兰', '#2f4f4f 墨绿', '#4682b4 钢蓝', '#20b2aa 海绿'
  ];
  const weekCrystals = [
    '红玛瑙 — 或戴一块红色手表', '黄水晶 — 或系一条金色丝巾', '虎眼石 — 或拿一支亮色钢笔',
    '月光石 — 或一对小珍珠耳钉', '金发晶 — 或一个金色发夹', '绿幽灵 — 或穿一双绿袜子',
    '粉晶 — 或一根粉色头绳', '黑曜石 — 或一副黑框眼镜', '紫水晶 — 或一把紫色梳子',
    '石榴石 — 或一条深红围巾', '青金石 — 或一支蓝色圆珠笔', '海蓝宝 — 或一个浅蓝水杯'
  ];
  const sunSignIdx = degToSign(transitNow.Sun).si;
  const moonSignIdx = degToSign(transitNow.Moon).si;

  html += '<div class="report-section" style="margin-top:16px;">';
  html += '<h3>✦ 本周幸运指南</h3>';
  html += '<div style="display:flex;gap:16px;flex-wrap:wrap;">';
  html += '<div style="flex:1;min-width:180px;background:rgba(15,15,30,0.7);border:1px solid var(--border);border-radius:10px;padding:14px 16px;">';
  html += '<p style="color:var(--accent);font-weight:bold;text-indent:0;margin-bottom:8px;">🎨 本周适合穿的颜色</p>';
  html += '<p style="text-indent:0;margin-bottom:4px;">太阳在' + SIGN_PURE[sunSignIdx] + '主导：<strong style="color:' + weekColors[sunSignIdx].split(' ')[0] + ';">' + weekColors[sunSignIdx] + '</strong></p>';
  html += '<p style="text-indent:0;margin-bottom:0;">月亮过' + SIGN_PURE[moonSignIdx] + '时搭配：<strong style="color:' + weekColors[moonSignIdx].split(' ')[0] + ';">' + weekColors[moonSignIdx] + '</strong></p>';
  html += '<p style="font-size:0.78em;color:#8a8aa0;text-indent:0;margin-top:8px;">把幸运色穿在身上或放在身边（围巾、饰品、手机壳），能增强你的能量场。</p>';
  html += '</div>';
  html += '<div style="flex:1;min-width:180px;background:rgba(15,15,30,0.7);border:1px solid var(--border);border-radius:10px;padding:14px 16px;">';
  html += '<p style="color:var(--accent);font-weight:bold;text-indent:0;margin-bottom:8px;">💎 本周能量水晶</p>';
  html += '<p style="text-indent:0;margin-bottom:4px;">太阳能量水晶：<strong>' + weekCrystals[sunSignIdx] + '</strong></p>';
  html += '<p style="text-indent:0;margin-bottom:0;">月亮能量水晶：<strong>' + weekCrystals[moonSignIdx] + '</strong></p>';
  html += '<p style="font-size:0.78em;color:#8a8aa0;text-indent:0;margin-top:8px;">没有水晶也没关系——日常小物也能沾沾好运 ✨</p>';
  html += '</div>';
  html += '</div>';

  // Weekly taste pick — casual, fun, not prescriptive
  var weekTastes = [
    '生椰拿铁 · 少冰', '桂花酒酿拿铁 · 热', '杨枝甘露 · 少冰', '煎鸡蛋 · 配酱油',
    '番茄炒蛋 · 盖饭', '肉酱意面 · 配帕玛森', '味噌拉面 · 溏心蛋', '越南河粉 · 牛肉',
    '酸辣土豆丝 · 配米饭', '螺蛳粉 · 加炸蛋', '提拉米苏 · 堂食', '芒果糯米饭'
  ];
  var tasteIdx = (sunSignIdx + moonSignIdx + now.getDate()) % weekTastes.length;
  html += '<div style="margin-top:14px;background:rgba(15,15,30,0.7);border:1px solid var(--border);border-radius:10px;padding:14px 16px;text-align:center;">';
  html += '<p style="color:var(--accent);font-weight:bold;text-indent:0;margin-bottom:6px;">🥤🍽️ 本周宜品鉴</p>';
  html += '<p style="text-indent:0;font-size:1.1em;color:#c0b8d0;">' + weekTastes[tasteIdx] + '</p>';
  html += '<p style="font-size:0.78em;color:#8a8aa0;text-indent:0;margin-top:6px;">不管是吃的还是喝的，这周安排上就行——科学喂养自己</p>';
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
  const hLabel = HOUSE_LABELS[natalH] || '个人领域';
  const areaMap = {
    Sun: '自我表达和自信心',
    Moon: '情绪和内心安全感',
    Mercury: '沟通和思维',
    Venus: '感情和财务',
    Mars: '行动力和竞争意识',
    Jupiter: '成长和机遇',
    Saturn: '责任和规划'
  };
  const area = areaMap[natalId] || '个人领域';

  // Varied phrasing pools per aspect type
  const harmonyPool = [
    '能量在此领域自然流动——适合主动推进、与人分享或公开表达。',
    '天时在你这边，此领域的事务会比你预期的更顺利。',
    '轻松的能量笼罩此领域——不用"努力"，顺势即可。',
    '你的' + area + '处于绿灯区，大胆行动比深思熟虑更有效。'
  ];
  const tensionPool = [
    '外界的压力触碰到你的' + area + '——这不是坏事，它帮你看到盲区。',
    '有些摩擦正在此领域浮现。别逃——那是需要你正视的信号。',
    '这可能让你感到不适，但恰恰说明此领域对你很重要。借力打力。',
    '本周此领域可能有些棘手，但解决它之后你会比之前更强。'
  ];
  const opportunityPool = [
    '有一个微妙的"门"正在此领域打开——你需要主动走过去，它不会自己来找你。',
    '留意此领域的小线索：一个邀请、一条消息或一次偶遇都可能是指引。',
    '本周此领域隐藏着一个小机会——保持敏感，它会显现。'
  ];
  const conjunctionPool = [
    '两股能量在此汇聚，此领域成为本周焦点。适合投入时间和注意力深耕。',
    '能量在此增强，你的' + area + '处于高亮状态——容易被别人注意到。'
  ];

  const pick = (arr) => arr[Math.floor(Math.abs(natalH * 7 + aspect.length * 3) % arr.length)];

  if (aspect === '合') {
    if (transitId === 'Sun') return '行运太阳与你的本命' + natalName + '合相——你的' + area + '被强力激活，本周在此领域的存在感和表达欲会明显增强。' + pick(conjunctionPool);
    if (transitId === 'Mercury') return '行运水星合相你的本命' + natalName + '——沟通和思绪汇聚于此领域。适合谈判、写作或做出重要决定。' + pick(conjunctionPool);
    return '行运' + transitId + '合相你的本命' + natalName + '——' + area + '的能量被激活，本周是关注此领域的好时机。';
  }
  if (aspect === '冲') return '行运' + transitId + '对冲你的本命' + natalName + '——' + area + '（第' + natalH + '宫' + hLabel + '）出现张力。' + pick(tensionPool);
  if (aspect === '刑') return '行运' + transitId + '刑克你的本命' + natalName + '——在' + area + '方面可能遇到摩擦，' + pick(tensionPool);
  if (aspect === '三合') return '行运' + transitId + '三合你的本命' + natalName + '——涉及第' + natalH + '宫' + hLabel + '。' + pick(harmonyPool);
  if (aspect === '六合') return '行运' + transitId + '六合你的本命' + natalName + '——' + pick(opportunityPool);
  return '行运' + transitId + '当前触及你的本命' + natalName + '——第' + natalH + '宫（' + hLabel + '）本周有能量流动。';
}

function generateMonthlyFortune(positions, houses, asc) {
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(),
    now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const transitNow = calcAllPlanets(nowT);

  let html = '<div class="report-section">';
  html += '<h3>✦ ' + now.getFullYear() + '年' + (now.getMonth()+1) + '月运势</h3>';

  // Sun transit theme
  const sunSi = degToSign(transitNow.Sun).si;
  html += '<p><span class="highlight">太阳行经' + SIGN_PURE[sunSi] + '</span>——本月你的核心能量聚焦于此。';
  const sunThemes = [
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
  html += sunThemes[sunSi] + '</p>';

  // Mercury position + retrograde check
  const mercSi = degToSign(transitNow.Mercury).si;
  html += '<p style="margin-top:8px;"><span class="highlight">水星在' + SIGN_PURE[mercSi] + '</span>——本月你的思维和沟通风格偏向' + (['直接果断','务实谨慎','灵活多元','感性直觉','自信表达','细致分析','平衡协和','深刻洞察','开阔自由','严肃认真','创新独特','梦幻浪漫'][mercSi]) + '。</p>';

  // Venus position
  const venusSi = degToSign(transitNow.Venus).si;
  html += '<p><span class="highlight">金星在' + SIGN_PURE[venusSi] + '</span>——本月你的社交和财务运势受此影响。';
  if (venusSi <= 2) html += '适合主动出击、在社交中展现自信。财运方面可能有快速来去的机会。';
  else if (venusSi <= 5) html += '情感和社交趋于内敛——适合经营现有的关系而非拓展新关系。财务上偏保守。';
  else if (venusSi <= 8) html += '社交活跃期，容易遇到新朋友或合作机会。财务上适合与人合作或信息类收入。';
  else html += '感情和金钱偏向务实和长期规划。适合为未来的财务安全做布局。';
  html += '</p>';

  // Mars house transit
  const marsSi = degToSign(transitNow.Mars).si;
  const marsHouse = Math.floor(mod360(transitNow.Mars - asc) / 30) + 1;
  html += '<p><span class="highlight">火星在' + SIGN_PURE[marsSi] + '</span>——本月你的行动力和欲望集中在第' + marsHouse + '宫（' + (HOUSE_LABELS[marsHouse] || '个人') + '）领域。</p>';

  html += '<p style="color:var(--accent);text-indent:0;margin-top:12px;">本月关键日期：新月和满月前后（约月中和月底），注意情绪和身体的信号——那是你的星盘在给你指引。</p>';

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
  let html = '<div class="report-section">';
  html += '<h3>✦ ' + year + '年度运势总览</h3>';

  // Jupiter annual theme
  const jupSi = degToSign(transitNow.Jupiter).si;
  const jupH = Math.floor(mod360(transitNow.Jupiter - asc) / 30) + 1;
  html += '<p><span class="highlight">木星全年位于' + SIGN_PURE[jupSi] + '</span>——' + year + '年是你人生中';
  const jupThemes = [
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
  html += jupThemes[jupSi] + '</p>';

  // Saturn annual lesson
  const satSi = degToSign(transitNow.Saturn).si;
  const satH = Math.floor(mod360(transitNow.Saturn - asc) / 30) + 1;
  html += '<p style="margin-top:8px;"><span class="highlight">土星全年位于' + SIGN_PURE[satSi] + '</span>——这是你今年的"功课"所在。土星要求你在相关领域建立结构、承担责任。过程或许不轻松，但所有在此阶段打下的基础将支撑你未来数十年的发展。</p>';

  // Check outer planet aspects to natal
  html += '<p style="margin-top:8px;"><strong>年度关键相位：</strong></p>';
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
          const hLabel = HOUSE_LABELS[h] || '个人领域';
          html += '<p style="font-size:0.85em;color:#b0b0c0;text-indent:0;">↳ ' + (op?op.name:oid) + ad.name + '本命' + p.name + ' — ';
          // Varied descriptions per outer planet
          if (oid === 'Jupiter') {
            if (ad.name === '三合' || ad.name === '六合') html += '幸运之门在此领域为你敞开，适合扩张和尝试新方向。';
            else if (ad.name === '刑' || ad.name === '冲') html += '过度乐观或铺得太开可能带来压力——聚焦一个方向，质量比数量重要。';
            else html += '今年此领域有显著的扩展机遇，宇宙在邀请你踏出舒适区。';
          } else if (oid === 'Saturn') {
            if (ad.name === '三合' || ad.name === '六合') html += '你的耐心和纪律在此领域开始结出果实——这是收获"延迟回报"的一年。';
            else if (ad.name === '刑' || ad.name === '冲') html += '责任和现实约束在此领域施加压力——这不是惩罚，是锻造。扛过去，你会比之前强大很多。';
            else html += '今年此领域需要你建立结构、承担更多责任——认真对待，这是未来数年的根基。';
          } else {
            if (ad.name === '三合' || ad.name === '六合') html += '意想不到的突破或创新灵感在此领域浮现——保持开放和灵活。';
            else if (ad.name === '刑' || ad.name === '冲') html += '此领域可能经历突如其来的震荡或觉醒——旧模式被打破，新可能正在出现。';
            else html += '天王星的变革能量正在此领域运作——准备好迎接意外但必要的转变。';
          }
          html += '</p>';
          foundKeyAspect = true;
        }
      }
    }
  }
  if (!foundKeyAspect) {
    html += '<p style="font-size:0.85em;color:#b0b0c0;">今年是相对平稳的整合年——适合巩固已有成果，为下一阶段的大动作做准备。</p>';
  }

  // Eclipses simplified
  html += '<p style="color:var(--accent);text-indent:0;margin-top:12px;">' + year + '年主题词：<strong>' + (['开拓','积累','表达','滋养','绽放','精进','连接','转化','探索','成就','联结','觉醒'][jupSi]) + '</strong> + <strong>' + (['责任','耐心','沟通','关怀','自信','服务','平衡','深度','自由','坚守','创新','超越'][satSi]) + '</strong>。这是你的"' + (['行动之年','价值之年','学习之年','家庭之年','创造之年','健康之年','关系之年','蜕变之年','智慧之年','事业之年','社群之年','灵性之年'][jupSi]) + '。</p>';

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
  } catch(e) { document.getElementById('tab2').innerHTML = '<p style=\"color:#c87070;padding:20px;\">渲染错误：' + e.message + '</p>'; console.error(e); }
}

// ── Tab 3: Guidance ───────────────────────────────────────────────────────
function renderTab3() {
  try {
  const d = chartData1;
  let html = generateGuidance(d.positions, d.houses, d.asc);
  document.getElementById('tab3').innerHTML = html;
  } catch(e) { document.getElementById('tab3').innerHTML = '<p style=\"color:#c87070;padding:20px;\">渲染错误：' + e.message + '</p>'; console.error(e); }
}

// ── Tab 5: Career Genius ──────────────────────────────────────────────────
function renderTab5() {
  try {
  const d = chartData1;
  const userJob = document.getElementById('p1_job') ? document.getElementById('p1_job').value.trim() : '';
  let html = generateCareerGenius(d.positions, d.houses, d.aspects, d.asc, d.mc, userJob);
  document.getElementById('tab5').innerHTML = html;
  } catch(e) { document.getElementById('tab5').innerHTML = '<p style=\"color:#c87070;padding:20px;\">渲染错误：' + e.message + '</p>'; console.error(e); }
}

// ── Tab 6: Relationships ──────────────────────────────────────────────────
function renderTab6() {
  try {
  const d = chartData1;
  let html = generateRelationships(d.positions, d.houses, d.aspects, d.asc);
  document.getElementById('tab6').innerHTML = html;
  } catch(e) { document.getElementById('tab6').innerHTML = '<p style=\"color:#c87070;padding:20px;\">渲染错误：' + e.message + '</p>'; console.error(e); }
}

// ── Tab 7: Deep Consultation ───────────────────────────────────────────────
function renderTab7() {
  try {
  if (!chartData1) { document.getElementById('tab7').innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:30px;">请先填写出生信息并点击"解读星盘"</p>'; return; }

  let html = '<div style="text-align:center;padding:20px 0;">';
  html += '<h3 style="color:var(--accent);margin-bottom:12px;">🔮 深度星盘咨询</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;line-height:1.8;margin-bottom:24px;">';
  html += '你想问感情、事业、财富、还是人生方向？<br>';
  html += '结合你的出生星盘 + 当前行运 + 塔罗指引<br>';
  html += '真人一对一为你做多维度深度解读（非AI生成）</p>';

  html += renderLockedBlock(
    '预约深度咨询',
    '加微信发送你的出生信息和想问的问题<br>24小时内回复，每次解读约1500-3000字<br><span style="font-size:0.85em;color:#8a8aaa;">📕 小红书 LunarVeilAstro 每日推送运势，不提供私信解读</span>',
    [{icon:'💬', platform:'微信', id:'LunarVeilAstro'}, {icon:'🐧', platform:'QQ', id:'3393776733'}]
  );

  html += '<p style="color:var(--text-dim);font-size:0.72em;margin-top:20px;">💡 建议先在本站生成星盘数据，再加好友发送截图<br>可大幅提升解读效率</p>';
  html += '</div>';

  document.getElementById('tab7').innerHTML = html;
  } catch(e) { document.getElementById('tab7').innerHTML = '<p style=\"color:#c87070;padding:20px;\">渲染错误：' + e.message + '</p>'; console.error(e); }
}

// Global submit handler for consultation
function submitConsultation() {
  const q = document.getElementById('consultQuestion').value.trim();
  if (!q) { alert('请输入你的问题'); return; }
  if (!chartData1) return;

  const btn = document.querySelector('.consult-submit');
  btn.disabled = true;
  btn.textContent = '✦ 解读中...';

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
    btn.textContent = '✦ 再次提问';
    } catch(e) {
    document.getElementById('consultResult').innerHTML = '<p style="color:#c87070;">解读出错：' + e.message + '</p>';
    btn.disabled = false;
    btn.textContent = '✦ 开始深度解读';
    console.error(e);
    }
  }, 100);
}

// ═══════════════════════════════════════════════════════════════════════════
//  DEEP CONSULTATION — Astro + Transit + Tarot synthesis engine
// ═══════════════════════════════════════════════════════════════════════════

function generateDeepConsultation(question, positions, houses, aspects, asc, mc) {
  const q = (question || '').trim();
  if (!q) return '<p style="color:var(--text-dim);text-align:center;padding:30px;">请输入你的问题，我会结合星盘、行运和塔罗为你深度解读。</p>';

  // ═══ Step 1: Domain detection ═══
  const domains = [];
  const domainKw = {
    love: { name:'感情关系', kw: ['感情','爱情','恋爱','伴侣','婚姻','老公','老婆','男朋友','女朋友','分手','复合','喜欢','暗恋','暧昧','相亲','前任','劈腿','出轨','脱单','单身','夫妻','对象','约会','求婚','订婚','离婚'] },
    career: { name:'事业工作', kw: ['工作','事业','职业','老板','同事','跳槽','辞职','升职','加薪','面试','找工作','转行','创业','副业','办公室','领导','薪资','试用','考核','项目','合伙','失业'] },
    money: { name:'财富金钱', kw: ['钱','财','收入','投资','理财','股票','基金','负债','贷款','存款','买房','租房','赚钱','亏','花销','省','金融','资产','存款'] },
    family: { name:'家庭关系', kw: ['家里','父母','妈妈','爸爸','孩子','子女','亲戚','家庭','婆婆','岳母','丈母娘','弟弟','妹妹','哥哥','姐姐','原生家庭'] },
    self: { name:'自我成长', kw: ['迷茫','方向','人生','意义','自己','改变','选择','焦虑','抑郁','孤独','压力','失眠','拖延','自卑','自信','天赋','使命','价值','未来','不知道','怎么办'] },
    health: { name:'身心健康', kw: ['身体','健康','病','失眠','累','疲劳','精神','心理','情绪','养生','锻炼','减肥','饮食'] },
    social: { name:'社交人际', kw: ['朋友','社交','人际','人脉','圈子','关系','室友','同学','闺蜜','哥们','人情'] },
    study: { name:'学习考试', kw: ['学习','考试','复习','考研','考公','考证','毕业','论文','留学','学校','专业','成绩'] }
  };

  for (const [key, d] of Object.entries(domainKw)) {
    const score = d.kw.reduce((s, w) => s + (q.includes(w) ? 1 : 0), 0);
    if (score > 0) domains.push({ key, name: d.name, score });
  }
  if (domains.length === 0) domains.push({ key: 'self', name: '自我成长', score: 1 });
  domains.sort((a, b) => b.score - a.score);
  const primary = domains[0];

  let html = '';
  html += '<div class="consult-domain-badge">🎯 识别问题领域：' + primary.name + (domains.length > 1 ? ' · ' + domains.slice(0,2).map(d=>d.name).join('、') : '') + '</div>';

  // ═══ Step 2: Natal chart analysis for this domain ═══
  html += '<div class="consult-source astro"><h4>🔮 星盘本命 — 你与生俱来的模式</h4>';
  const natalInsights = getNatalDomainInsight(primary.key, positions, houses, aspects, asc, mc);
  html += '<p>' + natalInsights + '</p></div>';

  // ═══ Step 3: Current transits for this domain ═══
  html += '<div class="consult-source transit"><h4>🌠 当前行运 — 此刻的宇宙信号</h4>';
  const transitInsights = getTransitDomainInsight(primary.key, positions, houses, asc);
  html += '<p>' + transitInsights + '</p></div>';

  // ═══ Step 4: Tarot draw ═══
  html += '<div class="consult-source tarot"><h4>🃏 塔罗指引 — 宇宙给你的回应</h4>';
  const deck = shuffle(buildDeck());
  const card = deck[0];
  const tarotInsight = getTarotDomainInsight(card, primary.key);
  html += '<p><strong>' + card.name + (card.num ? ' (' + card.num + ')' : '') + '</strong> — ' + tarotInsight + '</p></div>';

  // ═══ Step 5: Synthesis ═══
  html += '<div class="consult-synthesis"><h4>✦ 综合解读</h4>';
  html += '<p>' + synthesizeConsultation(primary.key, q, natalInsights, transitInsights, tarotInsight, positions, houses) + '</p>';
  html += '</div>';

  // ═══ Step 6: Actionable advice ═══
  html += '<div class="consult-advice">';
  html += '<strong>📝 给你的建议：</strong><br>';
  html += getActionableAdvice(primary.key, positions, houses, card, asc);
  html += '</div>';

  return html;
}

// ── Domain-specific natal analysis ─────────────────────────────────────────
function getNatalDomainInsight(domain, positions, houses, aspects, asc, mc) {
  const venusSi = degToSign(positions.Venus).si, marsSi = degToSign(positions.Mars).si;
  const moonSi = degToSign(positions.Moon).si, sunSi = degToSign(positions.Sun).si;
  const mercSi = degToSign(positions.Mercury).si, satSi = degToSign(positions.Saturn).si;
  const venusH = houses.Venus, marsH = houses.Mars, moonH = houses.Moon;
  const satH = houses.Saturn, jupH = houses.Jupiter, plutoH = houses.Pluto;

  const insights = {
    love: () => {
      let r = '你的金星落在' + SIGN_PURE[venusSi] + '第' + venusH + '宫——这决定了你在爱中如何表达、欣赏什么样的人。';
      const venusLove = ['热情直接，被自信勇敢的人吸引','稳固忠诚，重视物质和感官的稳定','需要智慧的碰撞和有趣的对话','温柔深沉，需要安全感和情感共鸣','大方热烈，享受被关注和浪漫的仪式','细腻务实，用行动和付出来表达爱','优雅平衡，追求和谐美好的伴侣关系','深刻炽热，渴望灵魂层面的完全融合','自由真诚，需要空间和探索的伴侣','认真负责，看重承诺和长远规划','独立独特，需要精神上的理解和尊重','浪漫梦幻，追求超越现实的灵魂连接'];
      r += venusLove[venusSi] + ' ';
      r += '火星落在' + SIGN_PURE[marsSi] + '第' + marsH + '宫——这透露了你的激情如何被点燃、在关系中如何追求。';
      // Moon-Venus aspect check
      let mvDiff = mod360(Math.abs(positions.Moon - positions.Venus));
      if (mvDiff > 180) mvDiff = 360 - mvDiff;
      if (Math.abs(mvDiff - 90) <= 7 || Math.abs(mvDiff - 180) <= 8) {
        r += '⚡ 你的月亮和金星存在紧张相位——这意味着你的情感需求和爱的表达方式存在内在冲突。你可能会在亲密关系中反复体验"想要靠近却又害怕受伤"的矛盾——这是你此生最重要的情感课题。';
      } else if (Math.abs(mvDiff - 120) <= 8 || Math.abs(mvDiff - 60) <= 6) {
        r += '你的月亮和金星和谐共振——你天生懂得如何在爱中滋养和被滋养。情感需求和爱的表达是同一个方向，这是你的天赋。';
      }
      // 7H check
      if (houses.Saturn === 7) r += '土星在第七宫——你在关系中格外认真谨慎，可能晚婚或在关系中承担较重的责任。这不是惩罚，而是你需要一个经得起时间考验的伴侣。';
      if (houses.Pluto === 7) r += '冥王星在第七宫——你的亲密关系是你灵魂深度转化的场域。你吸引的关系往往带着强烈的业力感，每一次深刻的连接都在重塑你。';
      return r;
    },
    career: () => {
      let r = '你的太阳（人生目标）在' + SIGN_PURE[sunSi] + '第' + (houses.Sun||'?') + '宫——这是你此生的核心驱动力和成就感的来源。';
      r += '火星（行动模式）在' + SIGN_PURE[marsSi] + '第' + marsH + '宫——这决定了你在工作中如何发力、面对竞争和挑战。';
      r += '中天MC在' + SIGN_PURE[degToSign(mc).si] + '——这是你展示给世界看的"职业面孔"。';
      if (houses.Pluto === 10) r += '冥王星在事业宫——你的事业注定经历不止一次重大转型。你不是"一份工作做一辈子"的人，每一次职业转变都是在向更真实的自己靠近。';
      if (houses.Jupiter === 10) r += '木星在事业宫——你在事业上有天然的幸运和扩张力。做自己真正相信的事，宇宙会为你开路。';
      if (houses.Saturn === 10) r += '土星在事业宫——你的事业成就需要时间慢慢积累。早期的挫折和延迟不是失败，而是在为你打下任何人都无法撼动的根基。';
      return r;
    },
    money: () => {
      let r = '你的财帛宫（第2宫）和偏财宫（第8宫）刻画了你的财富蓝图。金星在' + SIGN_PURE[venusSi] + '——你通过什么吸引金钱，以及你对"价值"的定义。';
      if (houses.Jupiter === 2) r += '木星在财帛宫——你对金钱有天然的扩张力，但也容易大手大脚。学会让钱为你工作，而不仅仅是为钱工作。';
      if (houses.Saturn === 2) r += '土星在财帛宫——财富来得慢但来得稳。你越是对自己的价值有信心，金钱就越愿意来找你。';
      if (houses.Jupiter === 8) r += '木星在偏财宫——投资、副业、合伙收益是你最强劲的财富通道。你天生适合"用别人的资源创造价值"。';
      if (houses.Pluto === 8) r += '冥王星在偏财宫——你对金钱和资源的掌控力会随着人生经历而加深。你可能经历财务上的"死亡与重生"，但每一次重生后都更加强大。';
      r += '你的财富密码不在于"赚更多"，而在于找到那个让你觉得"即使不赚钱也想做"的方向——当价值和热情对齐，金钱会自然跟随。';
      return r;
    },
    family: () => {
      let r = '你的月亮（情感根基）在' + SIGN_PURE[moonSi] + '第' + moonH + '宫——这揭示了你从原生家庭中获得的情感模式和安全感来源。';
      const moonFamily = ['在家庭中你需要独立被认可','家庭对你意味着稳定和物质保障','你在家庭中扮演沟通者的角色','家庭是你情感的归宿和避风港','你在家庭中需要被看见和认可','你在家庭中倾向于"照顾者"的角色','家庭关系中你追求和谐与公平','家庭情感对你来说深刻而复杂','你在家庭中需要自由和空间','家庭对你来说是责任和承诺','家庭关系中有种"疏离中的深刻"','家庭是你灵性的根基和业力连接'];
      r += moonFamily[moonSi] + '。';
      if (houses.Saturn === 4) r += '土星在田宅宫——你早年家庭环境可能比较严肃或有较多责任。这让你从小就学会了"靠自己"。成年后，你有机会重新定义"家"对你的意义。';
      if (houses.Pluto === 4) r += '冥王星在田宅宫——你与家族之间有着深层的业力纠缠。家庭中的权力、控制和深层情感是你此生的转化课题。';
      return r;
    },
    self: () => {
      let r = '你的太阳在' + SIGN_PURE[sunSi] + '——这是你此生需要成为的样子。月亮在' + SIGN_PURE[moonSi] + '——这是你来时的路，你灵魂的记忆。上升在' + SIGN_PURE[degToSign(asc).si] + '——这是你与世界相遇的方式。';
      const ec = {火:0,土:0,风:0,水:0};
      for (const p of PLANETS) { const {si} = degToSign(positions[p.id]); ec[ELEMENTS[si]]++; }
      const domElem = Object.entries(ec).sort((a,b)=>b[1]-a[1])[0];
      const weakElem = Object.entries(ec).sort((a,b)=>b[1]-a[1])[3];
      r += '你的星盘以' + domElem[0] + '元素为主导——你通过' + ({火:'行动和直觉','土':'实践和积累','风':'思考和连接','水':'感受和共情'})[domElem[0]] + '来理解世界。';
      if (weakElem[1] <= 1) r += '而你' + weakElem[0] + '元素的薄弱不是缺陷——恰恰相反，那是你此生要去完整的地方，是你最深刻的成长领域。';
      return r;
    },
    health: () => {
      let r = '你的第6宫（健康与日常）和第12宫（潜意识与灵性）掌管着身心状态。';
      if (houses.Saturn === 6) r += '土星在日常健康宫——你需要建立规律的生活节奏。身体是你的"长期项目"，需要持续投入而非一时冲动。';
      if (houses.Mars === 6) r += '火星在日常健康宫——你需要通过运动来释放能量。久坐不动或压抑行动力会让你的身体和情绪同时出问题。';
      if (houses.Neptune === 6) r += '海王星在日常健康宫——你对身体信号的感知可能比较模糊。学会定期检查、建立清晰的健康边界对你很重要。';
      r += '你的身心健康不在别处，在于每天的小选择——睡前一小时的放下手机、早晨十分钟的呼吸、对自己说一声"够了"。';
      return r;
    }
  };

  const fn = insights[domain] || insights.self;
  return fn();
}

// ── Domain-specific transit analysis ────────────────────────────────────────
function getTransitDomainInsight(domain, positions, houses, asc) {
  const now = new Date();
  const nowJD = julianDay(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours() + now.getMinutes()/60.0);
  const nowT = centuriesSinceJ2000(nowJD);
  const tn = calcAllPlanets(nowT);

  const transitMap = {
    love: () => {
      const vSi = degToSign(tn.Venus).si, marsSi = degToSign(tn.Mars).si;
      let r = '当前金星行经' + SIGN_PURE[vSi] + '——你此刻的吸引力风格偏向' + (['热情主动','沉稳质感','灵动有趣','温柔深情','自信耀眼','细腻务实','优雅和谐','深刻神秘','自由洒脱','成熟稳重','独特个性','浪漫梦幻'][vSi]) + '。';
      // Check Jupiter/Venus aspects to natal Venus/Mars
      for (const tid of ['Jupiter','Venus','Uranus']) {
        let diff = mod360(Math.abs(tn[tid] - positions.Venus));
        if (diff > 180) diff = 360 - diff;
        if (diff <= 6) {
          const tpName = PLANETS.find(x=>x.id===tid)?.name||tid;
          r += '⚡ ' + tpName + '正触及你的本命金星——这是感情领域的重要窗口期。';
          if (tid === 'Jupiter') r += '新的人、新的感情机会可能在此时出现。保持开放和真实。';
          if (tid === 'Uranus') r += '感情领域可能出现意料之外的变化——可能是突然的心动，也可能是现有关系的重组。';
        }
      }
      return r;
    },
    career: () => {
      const jupSi = degToSign(tn.Jupiter).si, satSi = degToSign(tn.Saturn).si;
      let r = '木星当前在' + SIGN_PURE[jupSi] + '——事业发展的大方向受到此星座能量的加持。';
      r += '土星当前在' + SIGN_PURE[satSi] + '——这是你事业上需要承担责任和耐心耕耘的领域。';
      const jupH = Math.floor(mod360(tn.Jupiter - asc) / 30) + 1;
      r += '行运木星正穿过你第' + jupH + '宫——这个生活领域正处在扩张和机遇期。';
      return r;
    },
    money: () => {
      const jupH = Math.floor(mod360(tn.Jupiter - asc) / 30) + 1;
      let r = '行运木星在你的第' + jupH + '宫——';
      const jupWealth = ['新一轮个人成长将间接带动收入','正财运最佳窗口，收入模式可能升级','通过写作/沟通/教学创造财富','家庭/房产相关的财务机会','创意和投资运旺盛','工作收入稳定增长，适合谈加薪','合作和合伙带来的财务机会被放大','偏财/投资/被动收入的最佳时机','跨界/远方的财务机会浮现','事业突破带动收入跃升','人脉和社群转化为收入来源','幕后/灵性工作带来意外之财'];
      r += jupWealth[jupH-1] + '。';
      return r;
    },
    family: () => {
      const satH = Math.floor(mod360(tn.Saturn - asc) / 30) + 1;
      let r = '土星当前行经你的第' + satH + '宫——家庭和情感根基领域正在经历成熟化的过程。';
      if (satH === 4) r += '这是重新审视你与家人关系、或处理房产/居住问题的重要时期。你可能会感到额外的家庭责任——这不是负担，而是让你在"根"的层面变得更稳固。';
      return r;
    },
    self: () => {
      const jupSi = degToSign(tn.Jupiter).si;
      let r = '木星在' + SIGN_PURE[jupSi] + '的这一年，宇宙在邀请你' + (['勇敢行动','珍惜拥有','学习表达','深入情感','绽放自我','整理生活','建立连接','深度转化','扩展视野','脚踏实地','拥抱独特','信任直觉'][jupSi]) + '。';
      r += '这是你人生故事的重要章节——不是高潮，就是转折。而你拥有书写它的笔。';
      return r;
    }
  };

  const fn = transitMap[domain] || transitMap.self;
  return fn();
}

// ── Domain-specific tarot insight ───────────────────────────────────────────
function getTarotDomainInsight(card, domain) {
  const domainFields = {
    love: card.love,
    career: card.career,
    money: null,
    family: card.love,
    self: card.advice,
    health: card.advice,
    social: card.love,
    study: card.career
  };
  const field = domainFields[domain] || card.advice;
  if (field) return field;

  // Fallback: use upright meaning
  if (card.up) return card.up;
  return '这张牌的出现，暗示着你需要关注' + card.name + '所代表的能量——' + (card.up || card.advice || '让它引导你找到自己的答案。');
}

// ── Synthesis engine ────────────────────────────────────────────────────────
function synthesizeConsultation(domain, question, natal, transit, tarot, positions, houses) {
  const sunSi = degToSign(positions.Sun).si;
  const moonSi = degToSign(positions.Moon).si;

  const synthesisMap = {
    love: '综合你的星盘配置、当前行运和塔罗指引来看：你的金星和火星揭示了你内心深处对爱的渴望模式，而行运的触发正在为你打开新的可能性——或者要求你直面一直回避的问题。塔罗的牌面进一步确认了这个方向。' + (['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'][sunSi]) + '座的太阳给了你勇气，而' + SIGN_PURE[moonSi] + '的月亮提醒你：在追求爱的过程中，先学会成为自己的归宿。你提出的"' + question.substring(0, 20) + '..."——这个问题的答案不在外面，在你的星盘里、在你的选择里、在你愿意为自己走多深里。',
    career: '你的太阳和火星为你点亮了事业的方向感，而行运木星和土星正在推动你进入新的事业阶段。塔罗的牌面告诉你，此刻最重要的不是"做什么"，而是"以什么状态去做"。问题"' + question.substring(0, 20) + '..."的核心是——你星盘的事业宫正在呼唤一种更深层的自我认同。当你的工作不再是"谋生"，而是"成为自己"的路径时，宇宙会为你让路。',
    money: '金星和木星的位置揭示了你的财富DNA——不是你能赚多少，而是你如何与"价值"本身建立关系。行运正在激活你的财运敏感期。塔罗在提醒你：金钱是能量的流动，而非囤积的终点。对你提出的"' + question.substring(0, 20) + '..."，答案是——先疗愈你与"足够"的关系，财富自然会找到回家的路。',
    family: '月亮和土星的位置承载着你的家族记忆和情感模式。当前的行运正在松动那些根深蒂固的旧脚本——你不需要重复父母的剧本。塔罗的牌面告诉你，真正的"家"不只是一个物理空间，而是你学会了在任何人面前都做真实的自己。你的问题"' + question.substring(0, 20) + '..."——答案从接纳开始。',
    self: '太阳' + SIGN_PURE[sunSi] + '和月亮' + SIGN_PURE[moonSi] + '共同书写了你灵魂的双重奏——一个是你要成为的，一个是你曾经是的。行运正在推动你进入新的自我认知层面。塔罗的出现不是偶然——它是你潜意识写给意识的一封信。你问的"' + question.substring(0, 20) + '..."——这个问题本身就是答案的开始。因为你已经停了足够久来问自己。继续走，带着你的星盘做地图，带着你的心做指南针。'
  };

  return synthesisMap[domain] || synthesisMap.self;
}

// ── Actionable advice ───────────────────────────────────────────────────────
function getActionableAdvice(domain, positions, houses, card, asc) {
  const now = new Date();
  const sunSi = degToSign(positions.Sun).si;
  const moonSi = degToSign(positions.Moon).si;
  const venusSi = degToSign(positions.Venus).si;
  const marsSi = degToSign(positions.Mars).si;
  const ascSi = degToSign(asc).si;
  const sunH = houses.Sun, moonH = houses.Moon, venusH = houses.Venus;
  const marsH = houses.Mars, satH = houses.Saturn, jupH = houses.Jupiter;

  // Dynamic advice based on actual chart
  const generators = {
    love: () => {
      let r = '';
      // Step 1: Based on Venus placement
      r += '① 你的金星在' + SIGN_PURE[venusSi] + '第' + venusH + '宫——你真正需要的不是"完美的伴侣"，而是' + (['一个能陪你冒险的人','让你感到安全和被珍视的人','一个能和你有智力共鸣的灵魂','让你感到被深深理解和保护的人','一个欣赏你独特性并能给你舞台的人','对生活品质有追求且值得信赖的人','一个优雅平衡、能与你对话的伴侣','让你感到灵魂契合的深度连接','一个给你空间又能与你一起探索世界的人','一个认真负责、能给你长久承诺的人','一个理解你的独特且不试图改变你的人','一个与你有精神共鸣和灵性连接的伴侣'][venusSi]) + '。';
      // Step 2: Based on Mars
      const marsTips = ['主动出击，表达你的热情','用行动而非语言来证明你的诚意','多聊天、多分享想法，智力上的火花很重要','创造安全感，让对方感受到你的情感深度','大胆展示你的魅力，发光的人自然被看到','用细致的关心和实际的付出来表达爱','保持优雅但也别怕袒露真实的自己','深度连接需要你放下控制欲，学会信任','给对方足够的自由，爱不是占有','用负责和认真的态度来对待感情','尊重彼此的独特性，关系是1+1>2','在关系中保持浪漫的幻想，但也要落地'];
      r += '<br>② 火星在' + SIGN_PURE[marsSi] + '第' + marsH + '宫——在关系中需要' + marsTips[marsSi].toLowerCase() + '。';
      // Step 3: Moon-based emotional need
      r += '<br>③ 你的月亮在' + SIGN_PURE[moonSi] + '——当情绪波动时，你需要' + (moonSi<=2?'行动而非空想来安抚自己':moonSi<=5?'独处和深度情感连接来重新充电':moonSi<=8?'和信任的人聊聊，理清思绪':'给自己创造安静的空间，让感受自然流动') + '。';
      // Step 4: Card insight
      r += '<br>④ 牌面「' + card.name + '」的提示：' + (card.love || card.advice || '信任你的直觉，它比你以为的知道更多');
      return r;
    },
    career: () => {
      let r = '';
      r += '① 太阳在' + SIGN_PURE[sunSi] + '第' + sunH + '宫——你的核心成就感来自' + (['主动开拓、成为先锋','创造价值、建立安全感','学习新知、分享观点','营造温暖、守护重要的人','发光发热、获得认可','精进技能、把事情做完美','建立连接、促成合作','深度转化、处理复杂资源','探索未知、拓展边界','承担责任、获得成就','创新突破、引领潮流','灵性成长、服务他人'][sunSi]) + '。寻找一份能让你在这方面持续成长的工作，而不是一份"看起来不错"的工作。';
      r += '<br>② 火星在' + SIGN_PURE[marsSi] + '第' + marsH + '宫——你最适合的工作节奏是' + (marsSi<=2?'快节奏、有挑战、需要立即行动的':marsSi<=5?'需要专注、深度投入、能持续积累的':marsSi<=8?'需要沟通、协调、建立连接的':'需要深度思考、研究和内在洞察的') + '。';
      // Step 3: Saturn-based career path
      if (satH === 10) r += '<br>③ 土星在你的事业宫——你的事业成就会来，但需要时间。不急于一时的得失，每一段经历都是你事业大厦的一块砖石。';
      else if (satH === 6) r += '<br>③ 土星在日常工作宫——把每天的工作做到极致，日常的积累比一时的灵感更可靠。';
      else if (satH === 2) r += '<br>③ 土星在财帛宫——先建立你的"价值资本"：技能、作品、人脉。当你的价值扎实了，金钱和机会会自然跟上。';
      else if (jupH === 10) r += '<br>③ 木星在你的事业宫——你有"做大"的潜力。但木星也容易"铺得太开"——聚焦一个方向，做到极致再扩展。';
      else r += '<br>③ 你的职业成长不是线性的——允许自己尝试，每一次转向都是在靠近最适合你的位置。';
      r += '<br>④ 牌面「' + card.name + '」的指引：' + (card.career || card.advice || '行动比完美主义更重要，先迈出一步');
      return r;
    },
    money: () => {
      let r = '';
      r += '① 金星在' + SIGN_PURE[venusSi] + '——你吸引金钱的方式是' + (['靠勇气和行动力创造价值','靠积累和品质感建立财富','靠信息和沟通能力变现','靠情感连接和直觉来吸引丰盛','靠个人魅力和创造力来创造收入','靠专业技能和精进细节来积累财富','靠合作和人脉来扩展财源','靠深度资源和转化能力来运作财富','靠跨界探索和新机会来增长财富','靠长期规划和责任心来稳步积累','靠创新和独特视角来开辟财路','靠直觉和灵感来吸引财富'][venusSi]) + '。';
      if (jupH === 2) r += '<br>② 木星在你的财帛宫——你的财运有天然扩张力，但需要学会"让钱流动"，而不是一味囤积。投资自己比投资任何产品都更可靠。';
      else if (jupH === 8) r += '<br>② 木星在偏财宫——副业、投资、合伙收益是你最强劲的财富引擎。学习理财知识，找到靠谱的合作伙伴。';
      else if (houses.Pluto === 8) r += '<br>② 冥王星在偏财宫——你对金钱的观念会经历"死亡与重生"。每一次财富观的升级都在为你打开更大的丰盛之门。';
      else r += '<br>② 财富密码不在于"赚更多"，而在于找到那个让你愿意不计回报投入的方向——当价值和热情对齐，金钱会自然跟随。';
      r += '<br>③ 本月行动：记录一周的每一笔支出，周末回看——哪些是滋养你的？哪些是填补空虚的？觉察是改变的第一步。';
      r += '<br>④ 牌面「' + card.name + '」的启示：' + (card.advice || '丰盛是一种心态，先感恩你已有的，更多的才会到来');
      return r;
    },
    family: () => {
      let r = '';
      r += '① 月亮在' + SIGN_PURE[moonSi] + '——你从原生家庭中吸收的情感模式是' + (['独立自主、不依赖他人','以物质和安全感作为爱的语言','用沟通和理解来连接','深度共情、某种程度上承担了家人的情绪','需要被认可、被看见','通过照顾和付出来表达爱','追求家庭关系的和谐与公平','深刻的情感连接、同时也感知到家庭中的权力','需要自由、但也渴望归属感','对家人负责、可能承担了超出年龄的责任','在疏离中保持着深刻的连接','对家庭有超越世俗的灵性理解'][moonSi]) + '。理解这一点，你就能看到哪些是你的，哪些是家人投射给你的。';
      if (houses.Saturn === 4) r += '<br>② 土星在田宅宫——你需要重新定义"家"对你的意义。原生家庭的严肃氛围让你早熟，但成年后的你有能力创造属于自己的温暖空间。';
      else if (houses.Moon === 4) r += '<br>② 月亮在田宅宫——家庭对你来说是最重要的情感根基。在感情和家庭事务中，信任你的直觉——它对家人的感知力比你想象中更准。';
      else r += '<br>② 无论原生家庭给了你什么，成年后的你都有能力重新选择——选择什么该传承，什么该到此为止。';
      r += '<br>③ 本周练习：注意在家人面前你"自动切换"成什么角色？那个角色是你真心想扮演的吗？觉察到的那一刻，你就有了选择。';
      r += '<br>④ 牌面「' + card.name + '」告诉你：' + (card.love || card.advice || '宽恕不是放过别人，是放过自己');
      return r;
    },
    self: () => {
      let r = '';
      r += '① 太阳' + SIGN_PURE[sunSi] + '，上升' + SIGN_PURE[ascSi] + '——你此生要成为的人是' + (['勇敢的开拓者','踏实的建设者','智慧的传播者','情感的守护者','耀眼的创造者','精致的匠人','优雅的连接者','深度的转化者','自由的探索者','沉稳的成就者','独特的创新者','灵性的艺术家'][sunSi]) + '，而世界首先看到你的是' + SIGN_PURE[ascSi] + '的外在气质。当这两者开始对话而非冲突，你会感到前所未有的完整。';
      r += '<br>② 月亮在' + SIGN_PURE[moonSi] + '——当你迷茫时，不要向外寻找答案。回到你的月亮——' + (moonSi<=2?'去运动、去行动、去做一件有挑战的事':moonSi<=5?'回家、独处、给自己温暖的食物和空间':moonSi<=8?'找信任的人聊聊、写作、梳理你的思绪':'安静坐着、冥想、听音乐、让感受自然流淌') + '。你的月亮知道路。';
      r += '<br>③ ' + now.getFullYear() + '年剩下的时间——不必试图改变一切。选<strong>一个</strong>方向，在一个点上做到你能力范围内的极致。深度比广度更能带你到达想去的地方。';
      r += '<br>④ 牌面「' + card.name + '」的低语：' + (card.advice || '你的迷茫不是因为走错了路，而是因为你终于开始问自己真正重要的问题');
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
    advice:"不要过度分析，不要等待完美时机。宇宙在邀请你迈出信任的一步，旅程本身就会教会你一切。" },
  { id:1, name:"魔术师", en:"The Magician", num:"I",
    up:"创造力、技能、自信、资源整合、心想事成的能力、意志力",
    rev:"欺骗、操纵、技能不足、资源浪费、计划受阻、自信缺失",
    love:"你拥有吸引理想伴侣的所有条件。主动展现真实的自己，用你的魅力和智慧去创造你想要的感情生活。",
    career:"现在是将想法转化为行动的最佳时机。你拥有所需的全部技能和资源。专注目标，展现专业能力。",
    advice:"你手中握有所有元素（风火水土），只需将它们整合并付诸行动。相信自己，你可以创造奇迹。" },
  { id:2, name:"女祭司", en:"The High Priestess", num:"II",
    up:"直觉、潜意识、内在智慧、神秘、等待、灵性觉醒",
    rev:"忽视直觉、隐藏的秘密被揭露、情感封闭、肤浅、内在混乱",
    love:"静下心来倾听内心的声音。有些答案不在外面，而在你内心深处。保持神秘感，不要过早暴露全部底牌。",
    career:"表面之下的信息比可见的部分更重要。相信你的直觉判断，特别是在涉及隐藏信息或未明朗的局面时。",
    advice:"向内探索，而非向外寻求答案。静坐、冥想、关注梦境。答案会在你准备好时自然浮现。" },
  { id:3, name:"皇后", en:"The Empress", num:"III",
    up:"丰饶、母爱、创造力、自然、感官享受、滋养、繁荣",
    rev:"依赖过度、创造力枯竭、忽视自我照顾、物质匮乏、情感冷漠",
    love:"爱与温暖围绕着你。现在是享受关系中的甜蜜和滋养的时刻。单身者可能遇到一位温暖而富有魅力的人。",
    career:"创意项目将获得丰硕成果。适合从事与美、艺术、自然或照顾他人相关的工作。财务上也有增长的好兆头。",
    advice:"像皇后一样，允许自己去感受、去创造、去享受生活中的美好。照顾好你的身体和心灵，丰盛自然而来。" },
  { id:4, name:"皇帝", en:"The Emperor", num:"IV",
    up:"权威、结构、领导力、稳定、规则、保护、野心",
    rev:"专制、滥用权力、不稳定、缺乏纪律、失控、软弱",
    love:"关系中需要建立清晰的边界和规则。寻找一位成熟稳重的伴侣，或在现有关系中承担更多的责任和承诺。",
    career:"职场中展现出领导才能。现在是为长远目标建立稳固基础的时候。遵守规则，建立秩序，逐步攀升。",
    advice:"用理性和纪律来组织你的生活。建立稳固的结构和规则，这看似枯燥，却是实现长远目标的基础。" },
  { id:5, name:"教皇", en:"The Hierophant", num:"V",
    up:"传统、信仰、教育、导师、精神指引、仪式、社会规范",
    rev:"挑战传统、反叛、不受教、过时观念、教条主义、盲目追随",
    love:"传统形式的感情或婚姻可能被提上日程。寻求长辈或专业人士的情感建议。遵循内心的道德准则。",
    career:"寻找导师或参加专业培训将大有裨益。遵循行业规范，在现有的体系内稳步前进比另辟蹊径更有效。",
    advice:"你不需要独自解决所有问题。寻找一位导师或加入一个有共同信念的团体。遵循经过验证的道路。" },
  { id:6, name:"恋人", en:"The Lovers", num:"VI",
    up:"真爱、和谐、选择、价值观念、结合、吸引力、重要决定",
    rev:"分离、背叛、价值观冲突、错误选择、犹豫不决、不平衡",
    love:"爱情是当前的核心主题。无论是新恋情的开始还是现有关系的深化，都需要发自内心的真诚选择。",
    career:"面临重要的职业选择。选择你真正热爱和相信的方向，而不仅仅是看起来有利可图的。合作伙伴关系至关重要。",
    advice:"你正站在十字路口。这个选择反映了你的核心价值观。选择出于爱而非恐惧的道路。" },
  { id:7, name:"战车", en:"The Chariot", num:"VII",
    up:"胜利、决心、意志力、掌控、前进、克服困难、野心实现",
    rev:"失控、失败、攻击性、方向错误、被击败、缺乏信心",
    love:"感情方面你需要主动掌控方向盘。用决心和毅力克服感情中的障碍。异地恋或需要努力维持的关系将取得进展。",
    career:"竞争激烈的环境中你能脱颖而出。保持专注，用钢铁般的意志克服一切阻碍。胜利属于坚持到最后的人。",
    advice:"你已经拥有战胜一切困难的力量。关键在于驾驭内心各种冲突的力量，让它们朝同一个方向前进。" },
  { id:8, name:"力量", en:"Strength", num:"VIII",
    up:"内在力量、勇气、耐心、温柔的力量、驯服本能、自信",
    rev:"软弱、自我怀疑、失控、攻击性、缺乏耐心、被本能支配",
    love:"用温柔而非控制来赢得对方的心。你内心的力量足以化解感情中的矛盾。耐心和包容是最强大的武器。",
    career:"以柔克刚是当前的制胜策略。不需要大声证明自己，你的专业能力和内在沉稳自行会说话。",
    advice:"真正的力量不是征服外在，而是驯服内在的野兽。用爱和耐心对待自己的恐惧和不安。" },
  { id:9, name:"隐士", en:"The Hermit", num:"IX",
    up:"内省、独处、智慧、寻求真理、指引、沉淀、深思熟虑",
    rev:"孤独、孤立、逃避、拒绝建议、迷失方向、偏执",
    love:"需要一段独处来反思自己在感情中真正的需求。不要为了填补空虚而匆忙进入关系。内在的圆满才能吸引健康的爱情。",
    career:"暂时从外界的喧嚣中抽离，重新审视你的职业方向。深造、进修或独立研究将带来突破性的洞见。",
    advice:"回归内心，在寂静中找到答案。你不需要更多的信息，你需要的是更深的洞察。独处不是逃避，是蓄力。" },
  { id:10, name:"命运之轮", en:"Wheel of Fortune", num:"X",
    up:"命运转变、机遇、周期、运气、转折点、命运的安排",
    rev:"厄运、阻力、失控、负循环、错失机会、命运受阻",
    love:"命运的齿轮正在转动。命中注定的相遇或重逢可能到来。接受感情中的周期性变化，把握当下出现的缘分。",
    career:"职场或事业即将迎来重要转折。好运正在靠近，但你需要主动抓住机会。命运的青睐往往伴随着准备。",
    advice:"你是命运之轮的一部分。好运和坏运都是暂时的，顺应变化而不是抵抗它。站在轮子的中心保持平衡。" },
  { id:11, name:"正义", en:"Justice", num:"XI",
    up:"公正、真相、因果、平衡、法律、决定、理性",
    rev:"不公、偏见、逃避后果、失衡、法律纠纷、错误判断",
    love:"感情中需要公平和诚实。现在做出的决定将产生影响深远的后果。真诚面对自己和伴侣，做出公正的选择。",
    career:"涉及合同、谈判或法律事务时需格外谨慎。你过去在职场中的行为将在此时得到公正的回报（好或坏）。",
    advice:"因果法则正在运作。诚实地评估自己的处境，为你的选择承担后果。公正不仅是对别人，也是对自己。" },
  { id:12, name:"倒吊人", en:"The Hanged Man", num:"XII",
    up:"牺牲、换个角度看世界、放手、等待、灵性启迪、暂停",
    rev:"停滞、无谓的牺牲、固执己见、不愿放手、拖延、内耗",
    love:"在感情中可能需要做出某种牺牲或妥协。暂时放下一味追求的执念，转换视角看问题，会有新的领悟。",
    career:"当前可能需要暂停或延迟。这不是失败，而是让你换个角度审视自己的职业路径。耐心的等待自有其价值。",
    advice:"当你觉得被困住时，试着倒过来看世界。有时候最大的行动是停止行动，最大的控制是放手。" },
  { id:13, name:"死神", en:"Death", num:"XIII",
    up:"转变、结束、新生、蜕变、放下过去、必然的改变",
    rev:"抗拒改变、停滞不前、恐惧结束、无法放手、腐朽",
    love:"一段旧有的感情模式必须结束，才能迎来新的可能。不要抗拒感情的转变和蜕变。结束是为了更好的开始。",
    career:"可能面临职业的重大转变——离职、转行或项目终结。这是蜕变的阵痛，新生的曙光紧随其后。",
    advice:"死神牌不是肉体的死亡，而是旧我的消融。放下那些已经不再服务你的人和事，让蜕变自然发生。" },
  { id:14, name:"节制", en:"Temperance", num:"XIV",
    up:"平衡、调和、耐心、中庸之道、融合、治愈、适应",
    rev:"失衡、过度、缺乏节制、冲突、不和谐、急躁",
    love:"感情需要双方的调和与融合。避免极端情绪，寻找两人之间的平衡点。细水长流的爱比轰轰烈烈更持久。",
    career:"工作中需要平衡多个方面——效率与质量、合作与独立。找到适合自己的节奏，不急不躁地稳步前进。",
    advice:"像炼金术师一样，将生活中不同的元素融合成黄金。避免极端，中庸之道是你当前的智慧之选。" },
  { id:15, name:"恶魔", en:"The Devil", num:"XV",
    up:"束缚、物质主义、欲望、执念、阴影面、上瘾、权力",
    rev:"挣脱束缚、觉醒、面对阴影、重获自由、戒除成瘾",
    love:"审视感情中是否存在不健康的依赖、控制或执念。也许是性吸引掩盖了真正的问题。诚实面对黑暗面才能解脱。",
    career:"你可能被困在一份只有金钱回报但没有热情的工作中。检查权力关系和职场中的操控。改变始于认清现实。",
    advice:"锁链其实是你自己戴上的。正视你的欲望和恐惧——它们控制你的程度远比你意识到的深。你可以选择自由。" },
  { id:16, name:"高塔", en:"The Tower", num:"XVI",
    up:"突变、崩塌、启示、真相大白、打破幻象、觉醒",
    rev:"避免灾难、抗拒改变、延迟不可避免的崩塌、恐惧突破",
    love:"关系中一些虚假的稳定可能会突然崩塌。虽然痛苦，但真相的揭露会让你看清关系的本质。重建需要勇气。",
    career:"职场中可能出现突如其来的变动——被裁员、项目失败或组织重组。这是宇宙在推你走向更真实的道路。",
    advice:"高塔的崩塌是剧烈的，但它摧毁的只是那些本就不稳固的东西。在废墟之上，你可以建造真正坚固的新生。" },
  { id:17, name:"星星", en:"The Star", num:"XVII",
    up:"希望、疗愈、灵感、宁静、信念、重生、指引",
    rev:"绝望、失去信心、消极、灵感枯竭、自我否定、迷失",
    love:"感情中的疗愈和新生正在发生。过去的伤痛正在愈合，你将重新相信爱情的美好。保持希望，星光正指引着你。",
    career:"职业生涯迎来充满希望的新阶段。创意灵感源源不断，你的才华将被看见和欣赏。梦想正在变为现实。",
    advice:"暴风雨后的宁静星空。你在正确的道路上，宇宙正在用星光为你照亮前路。保持信念，疗愈自己。" },
  { id:18, name:"月亮", en:"The Moon", num:"XVIII",
    up:"幻觉、恐惧、潜意识、梦境、直觉、迷惑、未知",
    rev:"恐惧消散、真相浮现、克服焦虑、混乱结束、看清现实",
    love:"感情中可能存在误解、隐藏的信息或不明确的局面。不要被表面的幻象迷惑。信任直觉，但也要保持理性。",
    career:"职场中的某些事情可能并非表面看起来那样。谨慎行事，在信息不明确时避免重大决策。迷雾终将散去。",
    advice:"在月光下，一切都显得朦胧而不确定。你内心最深处的恐惧可能被放大——直面它们，你会发现它们只是影子。" },
  { id:19, name:"太阳", en:"The Sun", num:"XIX",
    up:"快乐、成功、活力、真理、童真、光明、成就",
    rev:"暂时的黯淡、缺乏自信、抑郁、延迟的快乐、悲观",
    love:"爱情中最灿烂的一张牌。热烈、真诚、充满快乐的感情。单身者将遇到阳光般温暖的人。关系中的一切都被温暖照亮。",
    career:"你正处于事业的阳光时刻。成就被认可，才华被赏识。享受这段黄金时期，同时用它来照亮更多人。",
    advice:"世界为你点亮了聚光灯。这是属于你的高光时刻——享受它，分享它，让内心的阳光照亮你走的每一步。" },
  { id:20, name:"审判", en:"Judgement", num:"XX",
    up:"觉醒、重生、召唤、清算、宽恕、灵魂的召唤、重大决定",
    rev:"逃避召唤、无法面对过去、悔恨、拒绝改变、自我审判",
    love:"旧情复燃或感情中的重大觉醒可能到来。听从内心最真实的召唤。原谅自己和对方过去的错误，迎接感情的再生。",
    career:"你正在被召唤到更高的职业舞台。也许是转行、创业或接受一个重要项目。这是你回应灵魂使命的时刻。",
    advice:"觉醒的号角已经吹响。你不必等到「完美的时机」，现在的你已经准备好了。回应召唤，获得灵魂的升华。" },
  { id:21, name:"世界", en:"The World", num:"XXI",
    up:"完成、圆满、成就、旅行、整合、宇宙意识、达成",
    rev:"未完成、拖延、不圆满、封闭、延迟成功、缺乏整合",
    love:"一段感情可能迎来圆满的结局——无论是走向更深承诺还是和平完成一个周期。你正处于感情整合的完满时刻。",
    career:"一个重要的职业周期即将圆满结束。你已完成了一个阶段的所有功课，准备好进入下一个更大的舞台。",
    advice:"你完成了一个重要的生命循环。在进入下一个周期之前，停下来庆祝你的成就。你与宇宙和谐共舞。" }
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
        "advice": "宇宙正在给你一张空白的画布。不要等待完美的时机——行动起来，让灵感在实践中成形。"
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你站在两个方向之间，手握选择的权力。对未来你已经有了初步的规划和设想，现在需要的是做出决定并坚定地朝前走。相信自己的远见。",
        "rev": "犹豫不决正在消耗你的能量。你可能在多个选项中徘徊，或者害怕做出错误的选择。这种优柔寡断本身就是一种决定——停滞不前。",
        "love": "在感情中面临抉择，也许是两段关系的取舍，也许是关系中某个重要决定的权衡。倾听你内心的声音，而非外界的意见。",
        "career": "职业规划的关键节点。你可能在考虑转行、跳槽或选择不同的发展方向。做好调研，然后大胆下注。",
        "advice": "选择没有绝对的对错。重要的是选择之后全力以赴。不要因为害怕选错而不选。"
      },
      {
        "rank": "三",
        "en": "3",
        "up": "你的远见和规划正在结出初步的果实。事业上的拓展、合作的达成、项目的推进都呈现出良好的势头。这是向外探索、扩展版图的时刻。",
        "rev": "计划遇到了阻力，可能是外部环境的变动，也可能是你自身缺乏足够的远见。初期的小挫折不应让你退缩，调整策略而非放弃目标。",
        "love": "感情关系进入了新的发展阶段，可能是同居、订婚或者一起规划未来。关系的基础正在夯实，前景可期。",
        "career": "事业拓展期，适合开拓新市场、建立新合作、推进新项目。你的领导力和远见正在得到认可。",
        "advice": "初期的成功是信心的基石，不是骄傲的资本。保持远见的同时，脚踏实地地推进每一步。"
      },
      {
        "rank": "四",
        "en": "4",
        "up": "经过努力，你迎来了稳定和收获的时刻。事业或生活的基础已经夯实，你可以安心地庆祝这来之不易的成就。这是一个享受成果、感受安全感的阶段。",
        "rev": "根基不稳，你可能感到焦虑不安。计划中的稳定被外部因素扰动，工作上出现变数。需要重新审视基础是否牢固。",
        "love": "感情关系进入稳定期，适合考虑同居、结婚或一起建立一个安稳的家。安全感和归属感是此时的核心主题。",
        "career": "职业发展进入平台期，基础已经奠定，可以享受一段安稳的时光。适合巩固已有的成果，而非激进扩张。",
        "advice": "稳固的根基是未来腾飞的跳板。珍惜现有的果实，同时为下一步的成长留出空间。"
      },
      {
        "rank": "五",
        "en": "5",
        "up": "竞争和挑战正在激发你的斗志。这是一个需要你站出来争取自己立场的时刻。冲突本身不是坏事，它能让你更加清楚自己的边界和力量。",
        "rev": "你被冲突耗尽能量，可能想要逃避或妥协。内部的纷争或外部的压力让你感到孤立。有时退一步不是失败，而是战略调整。",
        "love": "感情中可能出现竞争或冲突，也许是第三者的介入，也许是双方观念的碰撞。面对挑战是关系中不可避免的成长过程。",
        "career": "职场竞争加剧，你可能面临来自同事或同行的压力。将竞争转化为动力，证明自己的实力和价值。",
        "advice": "挑战是成长的催化剂。不要逃避冲突——它会告诉你你的边界在哪里，你的力量有多大。"
      },
      {
        "rank": "六",
        "en": "6",
        "up": "胜利的凯歌已经奏响。你的努力和坚持得到了认可和赞誉，可能是升职加薪、项目成功或公开表彰。这是属于你的荣耀时刻，请骄傲地接受掌声。",
        "rev": "失败或丢脸的经历让你备受打击。可能是傲慢导致了跌落，也可能是外界的不公正评价。无论哪种，都是一个谦逊的功课。",
        "love": "在感情中占据主动和优势，你的魅力和付出得到了伴侣的欣赏和回应。一段充满认可和赞誉的关系正在展开。",
        "career": "升职加薪、项目大获成功、行业认可——职业上的高光时刻。你的努力即将被看到并得到实质性的回报。",
        "advice": "胜利不仅是结果，更是你一路走来的印证。接受赞誉，但不要忘记那些曾经帮助过你的人。"
      },
      {
        "rank": "七",
        "en": "7",
        "up": "你正在坚守自己的阵地，面对压力和反对毫不退缩。这是一场勇气的考验，你需要坚持自己的信念和立场。虽然孤立，但你的勇敢值得尊敬。",
        "rev": "力量的对比让你无法继续坚守，撤退或投降也许是最明智的选择。继续硬撑只会消耗更多。有时放下是一种更大的勇气。",
        "love": "在感情中捍卫自己的底线和原则。也许面临外界的反对或伴侣的挑战，但你清楚地知道什么是不可以妥协的。",
        "career": "职场中需要坚守自己的立场，可能面临不公平的对待或恶意的竞争。勇敢地为自己发声，捍卫你的权益。",
        "advice": "独自坚守的感觉是孤独的，但这也正是你证明自己信念的时刻。知道何时该坚守，也知何时该放手。"
      },
      {
        "rank": "八",
        "en": "8",
        "up": "事情正在快速推进！消息、旅行、变化接踵而至。停滞的局面即将被打破，你需要保持敏捷和开放的心态来迎接即将到来的变化。",
        "rev": "计划被推迟或取消，你期待的进展迟迟不来。这种停滞可能是外部的阻力，也可能是内在的恐惧在拖慢你的脚步。",
        "love": "感情中的变化来得很快——可能是突然的表白、关系的推进或者一起旅行。保持开放的心态迎接这段加速的旅程。",
        "career": "工作中节奏加快，可能有出差、调动或突发任务。保持灵活应变的能力，快速行动中蕴藏着新的机会。",
        "advice": "当风的翅膀展开时，不要犹豫。机会来得快也去得快，敏捷是此时最大的优势。"
      },
      {
        "rank": "九",
        "en": "9",
        "up": "你在最后的坚守中展现出惊人的韧性。虽然疲惫，但你还没有放弃。这最后的坚持是最珍贵的品质，再坚持一步，黎明就在前方。",
        "rev": "筋疲力尽，你的能量已经透支。也许是时候承认自己需要休息和支援。过度防御会耗尽你最后的力量。",
        "love": "感情中的坚持到了关键时刻。你可能已经疲惫，但心中还有最后一丝信念。问问自己：这段关系值得你坚持到什么程度？",
        "career": "工作压力和责任已经让你接近极限。最后的冲刺需要顽强的意志力。但也请注意：过度消耗不是可持续的策略。",
        "advice": "韧性是你最宝贵的品质，但智慧在于知道何时该休息。保护好自己的能量，这场战役还很长。"
      },
      {
        "rank": "十",
        "en": "10",
        "up": "负担沉重，责任如山。你可能正在承担超出常人的工作量或义务。虽然压力大，但你能够坚持完成。问题是：这些负担真的都是你的吗？",
        "rev": "你正在学会放下不属于你的重担，或者不再愿意一个人扛下所有。过度压力正在损害你的健康，放手是一种解脱。",
        "love": "感情中你承担了太多责任，也许是单方面付出太多。问问自己：这段关系是否在消耗你而非滋养你？",
        "career": "工作量大到难以承受，也许在同时处理多个项目或角色。你需要优先排序和合理分配，而不是一个人硬扛。",
        "advice": "负重前行不是能力的证明，而是边界的缺失。学会说'不'，将不属于你的担子放下。"
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "一个充满热情和好奇心的新开始。新的消息、新的学习机会或新的探索方向正在出现。保持开放和天真的心态，像孩子一样去探索未知。",
        "rev": "不成熟的表现可能会带来麻烦。你或许在接受坏消息，或者因为缺乏方向而四处乱撞。需要更多的耐心和规划。",
        "love": "一段轻松愉快的新恋情可能在萌芽，或者在现有关系中加入新鲜的元素。保持好奇心和探索欲，让感情充满活力。",
        "career": "收到新的工作消息或学习机会。也许是培训、新项目或者职业发展的新鲜方向。保持开放的接收状态。",
        "advice": "以赤子之心面对新的开始。你还不需要知道所有答案——好奇心是你最强的导航。"
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "冒险精神正在驱动你向前冲。行动迅速、激情满满，你对未来充满了无畏的勇气。这是一个冲锋的时刻，不要被恐惧拖慢脚步。",
        "rev": "鲁莽和缺乏耐心可能导致半途而废。你太急于看到结果而忽视了必要的准备和细节。慢下来，才不会翻车。",
        "love": "主动追求心仪的对象，或者在关系中注入冒险和激情。你是一个充满了浪漫勇气的骑士，但要小心不要太冲动。",
        "career": "事业上的冲锋期，适合大胆行动、主动争取。你有着充沛的行动力，但需要确保方向正确再出发。",
        "advice": "勇敢的骑士也需要地图。激情是翅膀，但计划是方向——两者兼顾才能飞得更远。"
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "自信和温暖是你最大的魅力。你能够独立领导他人，同时保持亲和力。这是一个展现个人魅力和领导力的阶段，用你的创造力照亮周围。",
        "rev": "专横或缺乏安全感正在损害你的影响力。你可能在过度控制或者因为不自信而退缩。找到内在的平衡是当前的功课。",
        "love": "在感情中展现出迷人的自信和温暖。你是一个充满魅力的伴侣，能够独立地爱而不依赖。吸引力自然散发。",
        "career": "职场中的领导力得到充分发挥。你自信而不咄咄逼人，能够激励团队又保持亲和力。职业女性力量的典范。",
        "advice": "真正的女王不需要证明自己的威严——她用存在本身影响一切。你身上的温暖与自信，是最好的武器。"
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "你正在展现成熟的领导力和远见卓识。这是一个负责任的领导者形象，能够做出果断的决定并带领他人向前。创造力与执行力兼备。",
        "rev": "权力被滥用或者因为急躁而做出错误的决定。你可能在过度专制或者因为缺乏耐心而失去追随者。",
        "love": "在感情中展现出成熟的担当和保护欲。你是一个负责任的伴侣，但也有着激情和创造力的一面。",
        "career": "事业上的顶峰状态。你具备企业家的远见和领导者的魄力，适合创业、管理或独立决策。",
        "advice": "真正的权力不是控制他人，而是引领方向。用你的远见照亮前路，让追随者自愿与你同行。"
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
        "advice": "爱是最强大的创造力。当你敞开心扉时，整个宇宙都会通过你表达自己。不要害怕情感的深度。"
      },
      {
        "rank": "二",
        "en": "2",
        "up": "两个灵魂之间的深度连接正在形成。这是两情相悦的和谐时刻，彼此看到对方最真实的样子。灵魂伴侣的相遇或现有关系的升华。",
        "rev": "关系中的裂痕正在扩大，信任在流失。分离或疏远可能是当前正在面对的课题。需要诚实地审视双方之间到底发生了什么。",
        "love": "爱情中最美好的牌之一——双向奔赴的深情。你和伴侣之间有着深刻的连接和理解，这是灵魂层面的相遇。",
        "career": "商业合作或团队协作的和谐期。找到志同道合的伙伴，合作关系将为你的事业带来深远的影响。",
        "advice": "真正的连接来自平等和相互尊重。爱不是占有，而是两个完整的灵魂选择并肩同行。"
      },
      {
        "rank": "三",
        "en": "3",
        "up": "友情和欢聚的快乐正在包围你。和朋友们的聚会、庆祝和分享带来心灵的滋养。这是社交和情感连接的丰收时刻。",
        "rev": "过度社交带来的疲惫，或者流言蜚语正在影响你的情绪。过多的聚会让你忽略了内在的需要。适当收敛，回归内心。",
        "love": "感情生活中的轻松和愉快正在增加。朋友聚会、约会或者轻松惬意的社交活动，让你在关系中感到快乐和满足。",
        "career": "同事关系的融洽期，团队合作和团建活动让工作氛围更加愉悦。创意和灵感在轻松的氛围中自由流动。",
        "advice": "快乐是用来分享的。在朋友中找到滋养和力量，但也不要忘记独处的重要性。"
      },
      {
        "rank": "四",
        "en": "4",
        "up": "你正在经历情感上的沉淀和内在的冥想。表面的快乐不再满足你，你在寻找更深的意义和连接。这是一个内省和重新评估的阶段。",
        "rev": "倦怠和麻木让你对外界的邀请无动于衷。你可能正在错过重要的机会，因为你陷入了内心的死水。需要唤醒沉睡的感知力。",
        "love": "感情进入反思期。你也许在重新评估这段关系对你的意义，或者需要一些独处的时间来理清自己的感受。",
        "career": "对当前的工作产生了倦怠感，需要重新评估职业方向。适当的休息和反思比盲目努力更重要。",
        "advice": "安静不是空虚。在静默中，你才能听到内心最真实的声音。不要害怕停下来——这是重启的前奏。"
      },
      {
        "rank": "五",
        "en": "5",
        "up": "失落和悲伤是此刻真实的感受，但请注意——在这失去的背后，希望的曙光已经出现。杯子没有完全倒下，你拥有的比你以为的多。",
        "rev": "你正在走出阴霾，开始接受现实并重建自己。虽然伤痛还在，但你已经能够看到前方的光亮。",
        "love": "感情中经历了失去或失望。但重要的是——你没有失去一切，留下的部分值得你珍惜。新的希望正在孕育。",
        "career": "职业上可能经历了挫折或损失，但这也是重新评估真正重要之事的时机。有些失去是在为更好的让路。",
        "advice": "当你只看到失去的两杯时，请回头看看——你还有三杯完好。悲伤是真实的，但希望也是。"
      },
      {
        "rank": "六",
        "en": "6",
        "up": "怀旧的情绪将你带回过去。纯真的回忆、童年的影子、旧时的连接正在影响你做当下的选择。这不是逃避，而是从过去汲取智慧。",
        "rev": "你沉溺在过去无法前行。美好的回忆变成了逃避现实的借口。需要拔出被过去吸住的脚，回到当下的生活中来。",
        "love": "旧情复燃或回忆过往恋情的阶段。你也许在和旧人重新建立连接，或者在回忆中寻找对当下感情的启示。",
        "career": "过去的经验正在为你提供指引。也许在回归曾经热衷的领域，或者从以往的教训中找到了新的方向。",
        "advice": "回忆是甜美的，但它只是指向过去的箭头。不要让怀旧变成拒绝当下的理由。"
      },
      {
        "rank": "七",
        "en": "7",
        "up": "你面对多种可能性，沉浸在白日梦和幻想中。美好的憧憬让你兴奋，但也需要分辨哪些是真正的机会，哪些只是幻影。",
        "rev": "幻梦破灭后的清醒时刻。你可能意识到自己一直在不切实际地幻想。虽然清醒有时残酷，但它给了你脚踏实地重新出发的机会。",
        "love": "感情中面临多种选择或诱惑，或者你对某段感情有太多不切实际的幻想。需要分辨真心和一时冲动。",
        "career": "职业发展中出现了多条可能的路径。白日梦的作用是激发愿景，但你需要将愿景与实际规划结合起来。",
        "advice": "幻想是创造力的翅膀，但地面上的行动才能让你真正飞起来。选择一条路，然后坚定地走下去。"
      },
      {
        "rank": "八",
        "en": "8",
        "up": "你决定离开熟悉的环境，去寻找更高的意义和更真实的自己。放下过去的安全感和舒适区，走向未知的旅程。这是勇敢者的选择。",
        "rev": "恐惧改变让你滞留在不满意的状态中。你知道该离开，但害怕未知让你动弹不得。停留的代价正在变得越来越大。",
        "love": "离开一段不再滋养你的感情。虽然不舍，但你知道继续下去只会消耗彼此。离开是为了更高的追求。",
        "career": "辞职、转行或离开熟悉的领域去探索新的方向。这是一个勇敢的决定，但也是被内心深处的高我召唤。",
        "advice": "当你不再属于脚下的这片土地时，离开就是最深的自我忠诚。未知并不可怕，停滞才可怕。"
      },
      {
        "rank": "九",
        "en": "9",
        "up": "深刻的满足感——你的情感需求正在得到满足。愿望正在实现，你感到内心充盈而喜悦。这是知足常乐的美好状态。",
        "rev": "虽然外在条件不错，但内心总感觉少了点什么。不满足感正在侵蚀你的幸福感。贪得无厌会让你看不到已经拥有的美好。",
        "love": "感情中的满足和幸福感。你正处于一段令人愉悦的关系中，内心的情感需求得到了回应和滋养。",
        "career": "职业上达到了一种满意的状态——也许是收入、成就感或工作氛围让你感到满足。享受当下的丰收。",
        "advice": "真正的富足不在于拥有更多，而在于感到自己已经足够。你此刻手中握着的，已经是很多人梦寐以求的。"
      },
      {
        "rank": "十",
        "en": "10",
        "up": "情感的圆满和家庭的幸福达到了顶峰。这是一个充满爱与和谐的阶段，你感到自己真正属于某个地方。家庭关系、亲密关系和内心的平和都达到了理想状态。",
        "rev": "家庭中的不和谐或关系的破裂让你感到失去了归属感。需要重新修复和家庭成员之间的连接。",
        "love": "感情关系达到了婚姻或家庭层面的圆满。这是建立一个温暖家庭的理想时期，情感承诺得到深化。",
        "career": "工作和家庭的平衡趋于完美。你也许在家族企业、居家办公或者团队中找到了一种归属感。",
        "advice": "情感的圆满是你一路走来所有选择的回报。好好享受这份幸福，同时也把爱传递出去。"
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "温柔的灵感和直觉信息正在流向你。一个情感上的新开始——可能是一段新的感情萌芽，或者创意灵感在你心中涌动。保持敏感和接收状态。",
        "rev": "情绪化的波动让你难以保持稳定。创意受阻或感情上的不成熟正在制造麻烦。需要有更多的自我觉察。",
        "love": "一段温柔的新恋情可能在萌芽。或者你收到了来自心仪对象的情感信号。保持接收的心态，但不要过度解读。",
        "career": "创意灵感的初期阶段，适合构思新方案或计划。你的直觉在工作中会发挥重要作用。",
        "advice": "敏感是一种超能力，但需要智慧来驾驭。保持心的敏锐，同时保持心智的清醒。"
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "浪漫的追求者——你或你生活中的某人正在展示迷人的魅力和理想的爱情。举止优雅、充满激情，但需要确认这种热情是否持久。",
        "rev": "花心或不切实际的浪漫幻想正在浪费你的时间和感情。表面迷人的东西可能缺乏实质。需要警惕那些只说不做的人。",
        "love": "浪漫的追求期——你可能是追求者也可能是被追求者。爱情的氛围浓厚，但需要确认这不仅仅是瞬间的化学反应。",
        "career": "带着理想主义投入工作，适合需要创意和审美能力的领域。但需要注意不要因为理想化而忽视实际问题。",
        "advice": "浪漫是最美的糖衣，但持久的爱情需要更多——承诺、理解和共同的成长。"
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "你正在展现出最高级的同理心和直觉力。像温柔的月亮一样，你能够滋养周围的人，同时保持着深刻的直觉洞察。情感智慧是你的超能力。",
        "rev": "情绪过度依赖他人，或者因为缺乏边界而感到疲惫。过度敏感让你失去了内在的中心。需要建立情感上的独立性。",
        "love": "在感情中展现出极高的情商和滋养力。你懂得如何爱人和被爱，是伴侣的精神港湾。",
        "career": "职场中的情感智慧得到发挥——也许是HR、心理咨询、创意或任何需要与人深度连接的领域。",
        "advice": "你不需要吸收所有人的情绪——共情不是同情。保持你的温柔，同时守护你的边界。"
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "情感上达到成熟的顶峰。你能够包容和理解他人，同时保持内在的稳定。艺术鉴赏力和情感智慧都处于最高水平。",
        "rev": "情感上的冷漠或者通过操纵他人的情绪来达到目的。压抑自己的情感表达，用理智的高墙隔绝内心。",
        "love": "感情中的成熟伴侣——你能够给予安全感和理解，是值得信赖的情感依托。",
        "career": "适合担任需要情感智慧和稳定性的领导角色。你的判断力兼具理智和情感的深度。",
        "advice": "真正的王者不是没有情感，而是能够驾驭情感的海洋而不被淹没。"
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
        "advice": "真相比舒适更珍贵。你此刻拥有看清事物本质的能力——不要放弃这个天赋。"
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你正处在两难抉择的十字路口。两种选择各有优劣，让你陷入僵局。信息似乎都不够充分，需要更多的内心指引才能做出明智决定。",
        "rev": "错误的选择或逃避让你陷入了更深的困境。信息过载加重了焦虑，你可能已经做出了一个不明智的决定。",
        "love": "感情中的两难——两段关系的取舍，或者关系中某个无法回避的艰难选择。拖延只会让情况恶化。",
        "career": "职业选择的关键时刻。两份工作、两个方向，你需要权衡利弊做出决定。信息已经足够，不要再等。",
        "advice": "当理性无法抉择时，跟随你的直觉。平衡的假象不如一个坚定的选择重要。"
      },
      {
        "rank": "三",
        "en": "3",
        "up": "心碎、背叛、悲伤——这是宝剑牌组中最痛苦的一张。你的心正在经历一场暴雨。但请记住：这场风暴会过去，而你会比之前更强大。",
        "rev": "你正在从痛苦中恢复。虽然伤口还在隐隐作痛，但你已经能够释怀并向前看。治愈正在发生。",
        "love": "感情中的心碎——背叛、分离或深刻的失望。允许自己哀伤，但不要陷入自怜。时间是治愈的良药。",
        "career": "工作中可能经历了背叛或重大挫折。但这次痛苦会带给你重要的教训。有些人的离开是为了给你更好的让路。",
        "advice": "允许自己崩溃一会儿。悲伤不是软弱——它是你灵魂的暴雨，冲刷过后才会有彩虹。"
      },
      {
        "rank": "四",
        "en": "4",
        "up": "你需要彻底的休息和恢复。精神和身体的双重疲惫告诉你该暂停了。暂时从外界的纷扰中隐退，给自己充电的空间。",
        "rev": "焦躁不安让你无法好好休息。虽然身体躺在床上，但脑子还在高速运转。真正的休息不仅需要身体的静止，更需要心智的宁静。",
        "love": "感情中的冷静期。也许需要暂时的空间来整理自己的情绪和想法。距离不是疏远，而是为了更好地靠近。",
        "career": "工作上的倦怠需要被正视。强制性的休息比持续消耗更有效率。给自己放一个假，回来时你会更有力量。",
        "advice": "休息不是浪费时间，而是投资自己。在寂静中，你才能听到下一个阶段的召唤。"
      },
      {
        "rank": "五",
        "en": "5",
        "up": "你在冲突中可能落败了，但这只是一种消极的胜利——对方可能赢得并不光彩。评估这场冲突：你失去了什么？你又从中学到了什么？",
        "rev": "从冲突中学习和和解。你能够放下怨恨，看到冲突背后的教训。和解比胜利更有价值。",
        "love": "感情中的争执和冲突可能以你的不情愿让步而告终。问自己：赢不了的人是你，还是硬要赢的对方？",
        "career": "职场竞争中的挫折。同事或竞争者可能用不公平的方式胜出。不要降低自己的标准——实力终会被看到。",
        "advice": "有些胜利是带着苦味的。在冲突中保持自己的尊严比赢得争吵重要得多。"
      },
      {
        "rank": "六",
        "en": "6",
        "up": "你正在离开困境，走向光明的彼岸。这是一个过渡时期，虽然身后还有未了之事，但你的船已经掉转了方向。新的开始正在地平线上显现。",
        "rev": "你被困在原地，拒绝改变。远离问题的机会就在眼前，但你的恐惧让你无法启航。需要看到更大的图景。",
        "love": "一段感情的过渡期——你正在从过去的伤痛中走出来，驶向新的情感风景。路途可能孤单，但方向是正确的。",
        "career": "职业转变的过渡期。你可能正在离开旧岗位、旧公司或旧行业，走向新的方向。这段路上的不确定性是暂时的。",
        "advice": "你不需要看到整条路才能启程，只需看到前面一步的亮光。过渡不是终点，而是抵达前的必经之路。"
      },
      {
        "rank": "七",
        "en": "7",
        "up": "巧妙和灵活的策略正在发挥作用。你不需要从正面进攻——暗中的布局、借力打力、灵活的应对才是制胜之道。保持低调，让结果说话。",
        "rev": "诡计暴露或弄巧成拙。你的算计被他人识破了。需要重新审视策略，更诚实一些才能达成目标。",
        "love": "感情中需要一些微妙的策略——不是操纵，而是懂得何时该说、何时该等。暗恋或有秘密的感情关系。",
        "career": "职场需要灵活应对——不是所有事情都要硬碰硬。暗中准备、寻找盟友、等待最佳时机——这些比硬扛更有智慧。",
        "advice": "柔能克刚。不战而屈人之兵是最高级的战略。保持你的秘密武器，在关键时刻才亮出来。"
      },
      {
        "rank": "八",
        "en": "8",
        "up": "你感到被困住了，但监狱的门其实是开着的。自我设限的想法让你看不到出路。重新评估你的假设，你的限制比你想象的要少得多。",
        "rev": "你正在释放自己，突破思维的牢笼。曾经的恐惧和限制正在被看清，你终于获得了自由思考的能力。",
        "love": "感情中的被困感——你或许觉得离不开一个人、一段关系，但实际上你比想象中更有选择。",
        "career": "职业上的无力感。你觉得自己别无选择，但其实是你选择了不选择。重新审视你的能力和市场价值。",
        "advice": "你唯一的监狱是你认为没有选择的那个想法。自由始于认知：你一直都有选择。"
      },
      {
        "rank": "九",
        "en": "9",
        "up": "焦虑和恐惧在深夜啃噬你的心。你可能被过度担忧、失眠和负面思维困扰。但请认清：绝大多数的恐惧只是头脑的虚构，现实远没有你想的那么糟。",
        "rev": "你终于能够释然——那些纠缠你许久的恐惧正在消散。学会放手和信任，噩梦终将过去。",
        "love": "感情中的焦虑不安——可能是对关系的不确定性、对伴侣忠诚的怀疑，或者是对自己被抛弃的恐惧。需要区分直觉和焦虑。",
        "career": "工作压力导致的身心疲惫。你可能在担心失业、犯错或被替代。但你的恐惧往往比现实更大。",
        "advice": "你恐惧的不是事实，而是你编造的故事。深呼吸，看看窗外——世界并没有崩塌。"
      },
      {
        "rank": "十",
        "en": "10",
        "up": "彻底的结束。痛苦的结局是不可避免的，但这也是触底反弹的时刻。你已经没什么可以失去了，从今往后只会好起来。",
        "rev": "拒绝结束带来持续的痛苦。你还在旧故事里挣扎，不接受已经结束的事实。放手是唯一的路。",
        "love": "一段感情的彻底终结。虽然痛苦，但结束意味着你可以重新开始。有些事到该结束的时候就是该结束了。",
        "career": "职业上的重大结束——离职、被裁或项目彻底终止。但结束不是失败，它是为新的机会腾出空间。",
        "advice": "有些结束不是惩罚，而是礼物。当一扇门关上时，别在走廊里站太久——转身看看窗户。"
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "旺盛的求知欲和敏锐的观察力是你当前的特点。新信息正在汇集，保持警觉和开放的心态去接收。像侦探一样去探索你感兴趣的领域。",
        "rev": "八卦和不经思考的言论正在制造麻烦。信息泄露或轻信谣言可能伤害你关心的人。管好自己的嘴巴。",
        "love": "感情中的观察和试探期。你在收集关于心仪对象的信息，或者通过对话了解更多。保持敏锐但不要多疑。",
        "career": "学习新技能的时期。可能在参加培训、学习技术或者研究新的职业方向。保持好奇心。",
        "advice": "知识是宝剑，但智慧在于如何使用它。你的求知欲是天赋，但需要加上审慎才能带来真正的力量。"
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "你正在果敢地冲向真理的战场。言辞犀利、思维敏锐、行动迅速——你是一个不容小觑的对手。但记住：速度需要有方向才有意义。",
        "rev": "冲动的言论和好斗的姿态正在破坏关系。你可能说话太伤人、做事太急切。学会在说话前数到三。",
        "love": "感情中的冲突可能一触即发。你的言辞可能过于犀利，伤害到在乎的人。在表达不满时记得留有余地。",
        "career": "工作中需要果断决策和迅速行动。你的能力和态度都很强，但需注意不要用对抗代替沟通。",
        "advice": "最快的剑不一定是最好用的。真正的力量在于控制——知道何时出剑，更知道何时收剑。"
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "独立的思考和清晰的判断是你最珍贵的品质。你能在复杂的局面中保持理性，同时不失人情味。这是智慧与沉着的结合。",
        "rev": "过于冷漠和批判——你在用自己的标准衡量一切。过度的理性让你失去了温度。偶尔示弱也是一种力量。",
        "love": "感情中的独立和理性——你不会为了感情失去自我，但也需要学习在关系中柔化你的边界。",
        "career": "职场中的明智决策者。你能在压力下保持冷静和判断力，是团队中最值得信赖的理性声音。",
        "advice": "智慧不只是知道什么是对的，更是在对的时候用对的方式说出来。"
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "权威的智慧和公正的决断力正在你身上展现。你具备最高的逻辑思维能力和领导判断力。一个真正的智者和领袖。",
        "rev": "专制和冷酷——你正在用智慧作为武器去控制他人。过度强调逻辑而忽视情感，让你在人际关系中显得高高在上。",
        "love": "感情中展现出理性和智慧的掌控力。你能够帮助伴侣理清思绪，但不要让自己变成法官而非恋人。",
        "career": "职业生涯的智慧巅峰。你具备成为行业权威和资深专家的一切条件。你的判断被广泛尊重。",
        "advice": "真正的智慧是知道自己有局限。最伟大的君王不是从不犯错，而是能够听取逆耳之言。"
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
        "advice": "财富之门的钥匙一直在你手中。不要等待一个'完美'的时机——种下种子，然后耐心浇灌。"
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你正在多个财务或工作任务之间巧妙地保持平衡。这是灵活调配资源的能力。像一个杂技演员一样，你能同时处理多项事务而不乱。",
        "rev": "财务失衡或分身乏术。你承担了太多，却没有足够的精力去做好每一件事。需要优先排序并学会拒绝。",
        "love": "感情和工作之间的平衡是当前的课题。你需要在爱情和生活中找到一个可持续的节奏。",
        "career": "同时在处理多个项目或收入来源。灵活性和适应力是你的优势，但也要防止过度分散精力。",
        "advice": "平衡不是静止的——它是在不断的微调中保持不倒下。欣赏自己已经做到的成就。"
      },
      {
        "rank": "三",
        "en": "3",
        "up": "团队合作正在结出硕果。你的专业技能得到认可，合作项目顺利推进。这是协作和共享成功的阶段。",
        "rev": "合作失败或技能不足导致项目受挫。也许你和团队的目标不一致，或者你需要进一步打磨自己的专业技能。",
        "love": "通过共同的兴趣或项目建立联系。一段建立在共同价值观和务实基础之上的关系。",
        "career": "职业认证、技能提升和团队合作的关键期。你的专业能力正在得到正式的认可。",
        "advice": "单打独斗成就有限。找到那些和你有共同愿景的人——合作能将你的能力放大数倍。"
      },
      {
        "rank": "四",
        "en": "4",
        "up": "财务基础稳固，储蓄在增加，你对物质资源的掌控力很强。这是经济安全感的建设期。但要注意：过度节省会变成吝啬。",
        "rev": "对金钱的控制欲过强——可能是吝啬或恐惧财务损失。抓住手中的钱不放，也拒绝了金钱的流通。",
        "love": "感情中可能过于注重物质安全而忽略了情感的流动。金钱上的控制欲也可能影响关系。",
        "career": "职业稳定，收入有保障。现在不适合冒险——先巩固已有的基础。但不要让安逸变成保守。",
        "advice": "财务安全是必要的，但金钱只是工具不是目的。你抓住的钱越多，能流动进来的就越少。"
      },
      {
        "rank": "五",
        "en": "5",
        "up": "财务困难或物质上的匮乏正在考验你。你可能感到被孤立或雪上加霜。但请看清：你周围的资源比你意识到的多——向外寻求帮助。",
        "rev": "你正在恢复，找到帮助和走出贫困的路径。境况正在好转，你不再是一个人。",
        "love": "感情中因为物质问题发生摩擦。财务方面的压力正在影响关系。记住你们是队友，不是对手。",
        "career": "职业或收入上的低谷期。但这只是暂时的——你的价值不因暂时的困难而降低。主动寻求支援。",
        "advice": "在最低落的时候，最难的是开口说'我需要帮助'。但你不需要一个人扛——伸出手。"
      },
      {
        "rank": "六",
        "en": "6",
        "up": "慷慨的给予和资源的分享——你正处在能够帮助他人的位置上。也许是慈善捐助，也许是知识经验的分享。给出的都会以某种方式回来。",
        "rev": "在接受施舍的被动位置——权力的不对等让你不舒服。或者你有能力帮别人却在吝啬。",
        "love": "感情中的付出与接受达到了健康的平衡。你愿意为伴侣付出，也懂得接受对方的爱。",
        "career": "在工作中分享资源和机会，也许是在指导新人或回馈行业社区。善意的付出会扩大你的影响力。",
        "advice": "你给出的每一颗星币，都会在宇宙的账簿中刻下印记。真正的富有不是你拥有什么，而是你给出什么。"
      },
      {
        "rank": "七",
        "en": "7",
        "up": "耐心等待你的投资和努力结出果实。这是一个评估进展的阶段——看看哪些已经成熟，哪些还需要更多时间。不急不躁的态度是最有价值的心态。",
        "rev": "对进展的焦虑让你失去了耐心。你急于看到结果，但这种急躁可能导致错误的判断。成长需要时间。",
        "love": "感情需要时间的浇灌——你不能催促一段关系的发展。耐心观察，看看这段关系是否值得继续投入。",
        "career": "长期职业投资的评估期。你之前种下的种子哪些快要收成了？哪些需要重新调整？",
        "advice": "种下一棵树最好的时间是十年前，其次是现在。有些成果需要时间——等待也是投资的一部分。"
      },
      {
        "rank": "八",
        "en": "8",
        "up": "勤奋和专注正在打磨你的技能。日复一日的努力虽然枯燥，但它是通向精通的唯一道路。你正在成为自己领域的高手。",
        "rev": "敷衍了事或缺乏动力的状态。你不投入，不思考，只是在走流程。这种状态持续下去会吞噬你的前途。",
        "love": "感情需要日复一日的用功——不是大张旗鼓的表白，而是每天的点滴关心和投入。",
        "career": "职业技能的精进期。适合学习新技能、考证、或者深度打磨专业能力。一万小时定律——投入就是你最大的竞争力。",
        "advice": "成功没有捷径。每天的微小进步，累积起来就是别人望尘莫及的高度。"
      },
      {
        "rank": "九",
        "en": "9",
        "up": "独立和富足——你正在享受自己努力换来的成果。财务自由、专业技能被认可、生活品质优良。这是自给自足的丰盛状态。",
        "rev": "过度依赖他人的经济支持，或者因为挥霍无度而失去了之前积累的成果。需要重新建立财务独立。",
        "love": "感情中的独立和自信。你不需要依附于任何人来获得安全感——这本身就是一种魅力。",
        "career": "职业上的自给自足。你也许在自由职业、创业或达到了较高的专业级别。享受独立的状态。",
        "advice": "真正的富足是你能够独立地生活，优雅地给予，而不需要依赖任何人。你做到了。"
      },
      {
        "rank": "十",
        "en": "10",
        "up": "家族财富、遗产继承和长期的繁荣。你正在享受代代相传的成果，或者为自己家族的未来打下了坚实的基础。这是最长久的富足。",
        "rev": "家族纠纷或财富传承出现问题。继承权、遗产分配或家庭企业的矛盾让你既疲惫又无奈。",
        "love": "感情中考虑长远规划——婚姻、家庭、共同的财产和未来。你和伴侣正在为共同的家族打下基石。",
        "career": "事业进入长期稳定繁荣的阶段。你正在为退休、遗产或下一个世代积累资源。考虑更长远的布局。",
        "advice": "真正的遗产不是你留下的金钱，而是你这一生的作为对后世的影响。"
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "务实的学习态度和对新技能的渴望。一个与金钱或职业相关的新机会正在萌芽——也许是实习、学徒或进修课程。",
        "rev": "懒散和缺乏上进心正在拖慢你。你不愿意为未来投资时间和精力，只想待在舒适区。",
        "love": "感情中的务实和默默付出。你可能在用实际行动而不是甜言蜜语来表达爱。",
        "career": "职业学习的起点——新的培训、技能课程或实习机会。这是打下基础的重要阶段。",
        "advice": "每一棵大树都是从一颗种子开始的。你现在学到的每一点知识，都是未来的财富。"
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "踏实可靠和勤奋努力是你当前的特质。你在稳步前进，如一头勤恳的牛。虽然不快，但每一步都扎实。",
        "rev": "拖延和停滞正在消磨你的机会。你可能过于谨慎或缺乏野心，让自己在原地踏步。",
        "love": "感情中的务实和专一——你是一个值得信赖的伴侣。虽然不浪漫，但你用行动证明了你的承诺。",
        "career": "事业上稳步推进。虽然没有大起大落，但这种稳定和踏实是你长期发展的保障。",
        "advice": "慢不是缺点——只要方向正确，每一步都在靠近目的地。坚持你目前的步伐。"
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "务实而温暖的财富管理者和滋养者。你不仅能够照顾好自己，还能滋养周围的人。实用的智慧加上丰盛的心态是你最大的财富。",
        "rev": "过度物质的倾向让你忽视了情感和精神的需要。可能因为过度消费或财务管理不善。",
        "love": "感情中的务实担当——你既能够给予伴侣物质上的安全感，又能用实际的行动表达爱。",
        "career": "职场中的实干家——你是团队中最可靠的那个人。财务管理和资源调配是你的强项。",
        "advice": "真正的丰盛是物质与精神的平衡。你拥有的不只是星币，更是滋养他人的能力。"
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "财富和商业智慧的高度。你具备卓越的理财能力和商业头脑，是财富的大师。稳健和远见兼具，你正在进行大手笔的布局。",
        "rev": "贪婪和物质主义——你在用金钱的价值衡量一切。权力的腐败让你忘记了财富的真正意义。",
        "love": "感情中提供坚实的物质基础和安全感。但不要以为用钱可以买到一切——情感需要用心，不需要用钱。",
        "career": "商业和财富领域的巅峰。你具备企业家的远见和实力，适合大项目投资和资产管理。",
        "advice": "你是财富的主人，不是奴隶。真正的国王用财富编织未来，而不是被它编织。"
      }
    ]
  }
];

// Build full 78-card deck
function buildDeck() {
  const deck = [];
  for (const card of MAJOR_ARCANA) {
    deck.push({ ...card, type:'major', id:`major_${card.id}` });
  }
  for (const suit of MINOR_SUITS) {
    for (const c of suit.cards) {
      deck.push({
        ...c, name: suit.suit + c.rank,
        type:'minor', suit:suit.suit, element:suit.element,
        suitTheme:suit.theme, id:`${suit.en}_${c.en}`
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
  const rev = isReversed;
  let reading = '';
  const name = card.name || `${card.suit}${card.rank}`;

  if (card.type === 'major') {
    const meaning = rev ? card.rev : card.up;
    reading += `<strong>${name}</strong> ${rev?'<span class="reversed-badge">逆位</span>':''} — ${meaning}。`;

    // Add context-specific interpretation
    const primaryTheme = questionThemes[0];
    if (primaryTheme === '爱情' && card.love) {
      reading += `<br><br>💕 <em>感情方面：</em>${rev ? '逆位提示需要反思：' : ''}${card.love}`;
    } else if (primaryTheme === '事业' && card.career) {
      reading += `<br><br>💼 <em>事业方面：</em>${rev ? '逆位提示需要警惕：' : ''}${card.career}`;
    }
    if (card.advice) {
      reading += `<br><br>🔮 <em>宇宙建议：</em>${card.advice}`;
    }
  } else {
    // Minor Arcana — now with deep interpretations
    const meaning = rev ? (card.rev || card.up + '（逆位）') : card.up;
    reading += `<strong>${card.suit}${card.rank}</strong> ${rev?'<span class="reversed-badge">逆位</span>':''} <span style="color:var(--text-dim)">${card.element}元素·${card.suitTheme}</span>`;
    reading += `<br><br>${meaning}`;

    // Context-specific interpretation (same pattern as major)
    const primaryTheme = questionThemes[0];
    if (primaryTheme === '爱情' && card.love) {
      reading += `<br><br>💕 <em>感情方面：</em>${card.love}`;
    } else if (primaryTheme === '事业' && card.career) {
      reading += `<br><br>💼 <em>事业方面：</em>${card.career}`;
    }
    if (card.advice) {
      reading += `<br><br>🔮 <em>宇宙建议：</em>${card.advice}`;
    }
  }

  return reading;
}

function synthesizeReading(cards, positions, question, questionThemes) {
  let syn = '';
  const count = cards.length;
  const majorCards = cards.filter(c => c.type === 'major');
  const minorCards = cards.filter(c => c.type === 'minor');
  const reversedCards = cards.filter(c => c.isReversed);
  const hasMajor = majorCards.length;
  const hasReversed = reversedCards.length;

  syn += `<div class="tarot-synthesis">`;

  // ── 1. Opening ──
  syn += `<p>关于你的问题「<span class="highlight">${question}</span>」，牌阵为你揭示了以下深层信息：</p>`;

  // ── 2. Major Arcana significance ──
  if (hasMajor === count) {
    syn += `<p>🔥 <strong>全部为大阿卡纳</strong> — 这不是日常小事，而是命运层面的重要转折。宇宙在直接对你说话，每一张牌都是灵魂旅程中的一个里程碑。请格外重视这次解读。</p>`;
  } else if (hasMajor >= 2) {
    const majorNames = majorCards.map(c => c.name).join('、');
    syn += `<p>🌟 <strong>${hasMajor}张大阿卡纳</strong>（${majorNames}）同时出现 — 这个问题远超日常琐事，它触及你生命中的核心课题。大阿卡纳是灵魂的导师，它们的出现意味着你正站在一个重要的成长节点上。</p>`;
  } else if (hasMajor === 1) {
    syn += `<p>✨ 大阿卡纳「${majorCards[0].name}」的出现，为这次解读定下了灵魂层面的基调。它是整个牌阵的核心信号，其余牌围绕它展开细节。</p>`;
  }

  // ── 3. Element analysis ──
  if (minorCards.length > 0) {
    const elemCount = { '火': 0, '水': 0, '风': 0, '土': 0 };
    minorCards.forEach(c => { if (elemCount[c.element] !== undefined) elemCount[c.element]++; });
    const elemEntries = Object.entries(elemCount).filter(([k, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const dominantElem = elemEntries[0];
    const domName = dominantElem[0];
    const domCount = dominantElem[1];

    let elemMsg = '';
    if (domCount >= 2 && domCount === minorCards.length) {
      elemMsg = `牌阵中所有小阿卡纳全部集中在一个元素——<strong>${domName}元素</strong>。`;
    } else if (domCount >= 2) {
      elemMsg = `小阿卡纳以<strong>${domName}元素</strong>为主导（${domCount}张），`;
      if (elemEntries.length > 1) {
        elemMsg += `辅以${elemEntries.slice(1).map(([k, v]) => `${k}元素（${v}张）`).join('、')}。`;
      }
    }

    if (elemMsg) {
      syn += `<p>⚖️ ${elemMsg}`;
      const elemReadings = {
        '火': '火元素主导意味着行动力、热情和创造力是当前的核心驱动力。你被推动着去主动出击、大胆表达。注意不要过于冲动。',
        '水': '水元素主导意味着情感、直觉和关系是当前的焦点。你的心在说话，感受比逻辑更重要。注意不要被情绪淹没。',
        '风': '风元素主导意味着思想、沟通和真理是当前的战场。清晰的思考和坦诚的交流是关键。注意不要过度分析和焦虑。',
        '土': '土元素主导意味着务实、稳定和物质是当前的主题。脚踏实地、耐心积累是最佳策略。注意不要陷入保守和僵化。'
      };
      syn += `${elemReadings[domName] || ''}</p>`;
    }

    // Missing element warning
    const presentElems = new Set(Object.keys(elemCount).filter(k => elemCount[k] > 0));
    const allElems = ['火', '水', '风', '土'];
    const missing = allElems.filter(e => !presentElems.has(e));
    if (missing.length >= 2) {
      const missReadings = {
        '火': '行动力的缺失',
        '水': '情感连接的缺失',
        '风': '理性思考的缺失',
        '土': '务实落地能力的缺失'
      };
      const missDesc = missing.map(e => missReadings[e]).join('、');
      syn += `<p>⚠️ 牌阵中<strong>缺少${missing.join('、')}元素</strong>（${missDesc}）。这不是缺陷，而是牌阵在提醒你——当前课题中哪些能量是你需要从外部借力或有意识培养的。</p>`;
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
      const suitReadings = {
        '权杖': '权杖牌组主导说明你当前的核心动力在于行动和创造。事业、项目和自我实现是你最关切的战场。',
        '圣杯': '圣杯牌组主导说明情感世界是你当前的主旋律。爱情、关系和内在感受正在塑造你的选择。',
        '宝剑': '宝剑牌组主导说明思想层面的挑战是核心。决策、沟通和真理的追寻是你目前最重要的课题。',
        '星币': '星币牌组主导说明物质世界是你关注的焦点。财务、工作和实际成果是你当前最在意的领域。'
      };
      if (suitReadings[dominantSuit[0]]) {
        syn += `<p>🎯 ${suitReadings[dominantSuit[0]]}</p>`;
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
      const numNames = { 1: '王牌/Ace', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十' };
      const numReadings = {
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
      repeating.forEach(([num, cnt]) => {
        if (numReadings[num]) syn += `<p>🔢 ${numReadings[num]}</p>`;
      });
    }
  }

  // ── 6. Reversed card energy ──
  if (hasReversed === count) {
    syn += `<p>🔄 <strong>全部逆位</strong> — 这是一个强烈的信号：你当前的内在阻力或外在障碍比较显著。但逆位并非坏牌——它们是内在功课的邀请函。每一张逆位的牌都在问你：你在抗拒什么？你需要转化什么？</p>`;
  } else if (hasReversed >= 2) {
    const revNames = reversedCards.map(c => c.name || `${c.suit||''}${c.rank||''}`).join('、');
    syn += `<p>🔄 <strong>${hasReversed}张逆位牌</strong>（${revNames}）— 这些领域存在需要你面对的内在阻力或外在延迟。逆位不是"不好"，而是在告诉你：这个课题需要更多的内在工作和觉察才能转正。</p>`;
  } else if (hasReversed === 1) {
    const rn = reversedCards[0].name || `${reversedCards[0].suit||''}${reversedCards[0].rank||''}`;
    syn += `<p>🔄 唯一逆位的「${rn}」是牌阵指出的关键卡点。它的能量被阻塞或内化——这也是你最需要关注和转化的地方。</p>`;
  }

  // ── 7. Position flow analysis (for 3-card spreads) ──
  if (cards.length === 3) {
    const pastOk = cards[0] && !cards[0].isReversed;
    const presentOk = cards[1] && !cards[1].isReversed;
    const futureOk = cards[2] && !cards[2].isReversed;

    if (!pastOk && presentOk && futureOk) {
      syn += `<p>📈 <strong>趋势向好</strong> — 过去的阻碍正在消散，你现在站得更稳，未来的牌面预示着积极的发展。从低谷走向高峰的轨迹已经开启。</p>`;
    } else if (pastOk && presentOk && !futureOk) {
      syn += `<p>⚠️ <strong>注意前方</strong> — 过去的积累和当下的稳定值得珍惜，但未来存在需要你主动规避或准备的挑战。提前觉察可以改变走向。</p>`;
    } else if (!pastOk && !presentOk && futureOk) {
      syn += `<p>🌈 <strong>风雨后有彩虹</strong> — 过去和当下可能充满了挑战，但未来的牌给了你明亮的方向。这让你当下的坚持有了意义。</p>`;
    }

    // Element flow
    if (cards[0].element && cards[1].element && cards[2].element) {
      const flow = cards.map(c => c.element);
      if (flow[0] === flow[1] && flow[1] === flow[2]) {
        syn += `<p>🔗 三张牌的元素一致（均为${flow[0]}），说明这个问题的能量非常聚焦和纯粹。你不需要分散精力——专注于这一条主线即可。</p>`;
      } else if (flow[0] === '火' && flow[2] === '土') {
        syn += `<p>🔗 从火到土的演进：牌阵显示你的能量正在从热情冲动走向务实落地。创意和激情正在转化为实际的成果。</p>`;
      } else if (flow[0] === '风' && flow[2] === '水') {
        syn += `<p>🔗 从风到水的流转：思维和焦虑正在向情感和直觉让步。头脑的分析该放下了，听从内心的感受会带你找到答案。</p>`;
      }
    }
  }

  // ── 8. Theme-based closing ──
  const theme = questionThemes[0];
  const themeClosings = {
    '爱情': '感情从来不是靠理性算计，而是靠心去感受。牌面的信息关于时机、心态和选择——最终，真爱不会因任何决定而错过，但需要你保持真诚和勇气。',
    '事业': '职业发展的核心不仅在于外在机会，更在于你内在的成熟和准备。牌的指引帮助你看到自己的力量和盲点。行动加上智慧，再加上耐心，属于你的舞台终将到来。',
    '财运': '财富是能量的物质显化。牌阵在告诉你：金钱的流动和你内在的能量状态密切相关。理清内在，外在自然会丰盛。',
    '人生方向': '迷茫时我们总在寻找唯一的"正确答案"。但塔罗的智慧在于——它不会替你选择，而是照亮你忽略的角落，让你更有智慧地为自己做出决定。',
    '家庭': '家庭是我们最早的根，也是最深的功课。牌阵反映了你与家人之间能量的流动——理解比改变更重要，接纳比评价更深刻。',
    '健康': '身心健康是一切的基础。牌的讯息不是诊断，而是提醒你关注身体与心灵之间微妙的联系。倾听身体的信号。',
    '学业': '学习不只是知识的堆积，更是灵魂的扩展。牌阵告诉你：当前最适合的学习方式和方向——保持好奇心和专注力。',
    '人际': '人际关系是我们投射在他人身上的自己。牌阵揭示了你在人际互动中的模式和盲点——调整你的能量，关系自然会变化。'
  };
  const closing = themeClosings[theme] || '每张牌都是一面镜子，映照你内心的某个面向。答案不在牌中，而在你阅读这些文字时内心被触动的那个部分。保持开放的心态，你会在自己的灵魂中找到智慧。';

  syn += `<p style="margin-top:12px;">💫 ${closing}</p>`;

  syn += `<p style="color:var(--text-dim);margin-top:12px;font-size:0.85rem;">※ 塔罗牌是启发性的觉知工具，帮助你看见自己。最终的判断和选择权永远在你手中。保持开放的心态，聆听内在的智慧。</p>`;

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
  const tab4 = document.getElementById('tab4');
  let html = '';

  // Question area
  html += '<div class="tarot-question-area">';
  html += `<input type="text" id="tarot_question" placeholder="默想你的问题，然后在此输入…" value="${escHtml(tarotState.question)}" onkeydown="if(event.key==='Enter')drawTarotCards()">`;
  html += '<button class="geo-btn" onclick="drawTarotCards()" id="tarot_draw_btn">🔮 抽牌</button>';
  html += '</div>';

  // Spread selector
  html += '<div class="spread-selector">';
  html += `<span class="spread-opt${tarotState.spread==='one'?' active':''}" onclick="setSpread('one')">单张牌 · 快速指引</span>`;
  html += `<span class="spread-opt${tarotState.spread==='three'?' active':''}" onclick="setSpread('three')">三张牌 · 过去现在未来</span>`;
  html += '</div>';

  // Cards area
  if (tarotState.drawn.length > 0) {
    const posLabels = tarotState.spread === 'three'
      ? ['过去的影响','当下的状态','未来的趋势']
      : ['宇宙的讯息'];
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
        html += `<div class="card-title">${card.name||(card.suit+card.rank)}</div>`;
        if (card.isReversed) html += '<span class="reversed-badge" style="margin:2px 0">逆位</span>';
        html += `<div class="card-suit">${card.type==='major'?card.num:(card.element+'元素')}</div>`;
        html += `<div class="card-keywords">${card.isReversed?(card.rev||card.up):card.up}</div>`;
      }
      html += '</div>';
      html += '</div></div>';
      html += `<div class="card-position-label">${isFlipped ? posLabels[i] : (i+1)}</div>`;
      html += '</div>';
    }
    html += '</div>';

    // Interpretation
    if (tarotState.flipped >= tarotState.drawn.length) {
      const themes = analyzeQuestion(tarotState.question || '综合运势');
      html += '<div class="tarot-interpretation">';
      html += `<h3>✦ 解读：${tarotState.question||'宇宙给你的信息'}</h3>`;
      for (let i = 0; i < tarotState.drawn.length; i++) {
        const card = tarotState.drawn[i];
        html += '<div class="card-reading">';
        html += `<h4>${tarotState.spread==='three'?['❶ 过去','❷ 现在','❸ 未来'][i]:'🎴 指引'}</h4>`;
        html += `<p>${interpretCard(card, card.isReversed, i, themes)}</p>`;
        html += '</div>';
      }
      // Synthesis
      html += '<div class="synthesis">';
      html += synthesizeReading(tarotState.drawn, [], tarotState.question || '你的运势', themes);
      html += '</div>';
      html += '<div style="text-align:center;margin-top:16px;">';
      html += '<button class="btn" onclick="renderTarotDeck()" style="padding:10px 30px;font-size:0.9em;">🔄 重新抽牌</button>';
      html += '</div>';
      html += '</div>';
    } else {
      html += '<p style="text-align:center;color:var(--text-dim);margin-top:12px;">点击卡牌将其翻开，揭示宇宙的讯息 ✨</p>';
    }
  } else {
    html += '<div class="cards-area">';
    html += '<div style="text-align:center;color:var(--text-dim);padding:40px;">';
    html += '<div style="font-size:3em;margin-bottom:16px;">🃏</div>';
    html += '<p>在心中默念你的问题</p><p>然后点击上方「🔮 抽牌」按钮</p>';
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
    btn.textContent = '📊 查看星盘数据';
  } else {
    wrap.style.maxHeight = 'none';
    wrap.style.opacity = '1';
    wrap.style.transition = 'opacity 0.8s ease';
    btn.textContent = '📊 收起星盘数据';
    setTimeout(() => { wrap.scrollIntoView({behavior:'smooth', block:'start'}); }, 200);
  }
}

// ── Input Card Collapse / Expand ──────────────────────────────────────────
function collapseInputCard() {
  const card = document.getElementById('inputCard');
  const summary = document.getElementById('inputSummary');
  if (!card || !summary) return;

  // Build summary text
  const date = document.getElementById('p1_date').value || '?';
  const time = document.getElementById('p1_time').value || '?';
  const addr = document.getElementById('p1_addr').value || document.getElementById('p1_geo_status').textContent.replace(/^[^]*?(\S+)/, '$1').substring(0, 10) || '?';

  document.getElementById('inputSummaryText').textContent = addr.substring(0, 15) + ' · ' + date + ' · ' + time;

  card.style.transition = 'opacity 0.5s, max-height 0.5s';
  card.style.overflow = 'hidden';
  card.style.maxHeight = card.scrollHeight + 'px';
  // Trigger collapse
  requestAnimationFrame(() => {
    card.style.maxHeight = '0px';
    card.style.opacity = '0';
    card.style.marginBottom = '0';
    card.style.padding = '0';
    card.style.border = 'none';
  });
  setTimeout(() => {
    card.style.display = 'none';
    summary.style.display = 'flex';
    summary.style.opacity = '0';
    summary.style.transition = 'opacity 0.5s';
    requestAnimationFrame(() => { summary.style.opacity = '1'; });
  }, 500);
}

function toggleInputCard() {
  const card = document.getElementById('inputCard');
  const summary = document.getElementById('inputSummary');
  if (!card || !summary) return;

  if (card.style.display === 'none') {
    // Expand
    summary.style.display = 'none';
    card.style.display = 'block';
    card.style.maxHeight = '0px';
    card.style.opacity = '0';
    card.style.border = '';
    card.style.padding = '';
    card.style.marginBottom = '';
    requestAnimationFrame(() => {
      card.style.maxHeight = card.scrollHeight + 'px';
      card.style.opacity = '1';
    });
    setTimeout(() => {
      card.style.maxHeight = 'none';
      card.style.overflow = '';
      card.style.transition = '';
      card.scrollIntoView({behavior:'smooth'});
    }, 500);
  } else {
    collapseInputCard();
  }
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
var COMPASS_DIR_DATA = {
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

var COMPASS_DIRECTIONS = ['正东','东南','正南','西南','正西','西北','正北','东北'];
var COMPASS_CAT_KEYS = ['compass_wealth','compass_career','compass_love','compass_study'];
var COMPASS_CAT_NAMES = ['求财位','贵人位','桃花位','文昌位'];
var COMPASS_CAT_EMOJI = ['💰','💼','💕','📚'];

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
  var count = compassUseCount();
  if (count >= 4) { badge.textContent = '今日已用完'; badge.classList.add('used'); }
  else if (count > 0) { badge.textContent = '今日剩余 ' + (4-count) + ' 次'; badge.classList.remove('used'); }
  else { badge.textContent = '今日可探'; badge.classList.remove('used'); }
}

function openFortuneDirection() {
  updateCompassBadge();
  var html = '<h3>🧭 福运方位 · 罗盘指路</h3>';
  var catSubs = ['意外收获与副业','换工作与遇贵人','偶遇与旧识重逢','考试与灵感创作'];
  html += '<p style="text-align:center;color:var(--text-dim);font-size:0.92em;margin-bottom:16px;letter-spacing:0.06em;">择一领域，罗盘为你指路</p>';
  html += '<div class="category-btns">';
  for (var i=0;i<4;i++) {
    // TEST MODE: skip used check
    var used = false; // compassUsedToday(i);
    html += '<button class="cat-btn" onclick="selectCompassCategory('+i+')">';
    html += '<span class="cat-btn-icon">'+COMPASS_CAT_EMOJI[i]+'</span>';
    html += '<span class="cat-btn-name">'+COMPASS_CAT_NAMES[i]+'</span>';
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
  var dirName = COMPASS_DIRECTIONS[dirIdx];
  var catName = COMPASS_CAT_NAMES[catIdx];
  var catEmoji = COMPASS_CAT_EMOJI[catIdx];
  var dirData = COMPASS_DIR_DATA[dirName];
  var catData = dirData[catName];
  var element = dirData.element;
  var trigram = dirData.trigram;
  var imagery = dirData.imagery;
  var todayText = catData.today;
  var upcomingText = catData.upcoming;

  // Build compass stage with spinning animation
  var stageHtml = '<div class="compass-stage compass-spinning" id="compassStage">';
  stageHtml += '<div class="compass-ring"></div>';
  // Classical marks rendered in KaiTi for a brush-stroke feel
  var markAngles = [0, 90, 180, 270];
  var markNames = ['东','南','西','北'];
  for (var mi=0; mi<4; mi++) {
    var rad = markAngles[mi] * Math.PI / 180;
    var mx = Math.round(120 + Math.sin(rad) * 88 - 10);
    var my = Math.round(120 - Math.cos(rad) * 88 - 10);
    stageHtml += '<span style="position:absolute;left:'+mx+'px;top:'+my+'px;font-size:1.1em;color:rgba(200,160,100,0.5);z-index:2;font-weight:bold;font-family:KaiTi,STKaiti,SimSun,serif;">'+markNames[mi]+'</span>';
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
    var nudgeHooks = ['闭上眼睛指一个方向——指到了吗？','这个方向让你想起哪个城市？哪个地方？','在意念里朝这个方向走几步——第一个浮现的画面是什么？','在地图上找到这个方向——离家最近的绿地或水边在哪？'];
    var echoHooks = ['今天路过这个方位时，多看一眼周围。','如果这个方向有你想去的地方——记下来，改天去看看。'];
    var nudge = nudgeHooks[Math.floor(Math.random()*nudgeHooks.length)];
    var echo = echoHooks[Math.floor(Math.random()*echoHooks.length)];

    var resultHtml = '<div class="direction-result">';
    resultHtml += '<div class="direction-icon">'+catEmoji+'</div>';
    resultHtml += '<div class="direction-heading">'+catName+' · '+dirName+'</div>';
    resultHtml += '<div class="direction-location">'+dirName+' · '+trigram+' · '+element+' · '+imagery+'</div>';
    // 今日 box
    resultHtml += '<div style="margin-top:18px;padding:16px 20px;background:rgba(200,160,100,0.06);border-radius:12px;border-left:3px solid rgba(200,160,100,0.3);text-align:left;">';
    resultHtml += '<div style="color:#7ab87a;font-size:0.78em;letter-spacing:0.08em;margin-bottom:6px;">▎今日</div>';
    resultHtml += '<div style="color:#c0b8d0;font-size:0.95em;line-height:1.7;">'+todayText+'</div>';
    resultHtml += '<div style="color:#9a90b0;font-size:0.92em;margin-top:8px;font-style:italic;">'+nudge+'</div>';
    resultHtml += '</div>';
    // 近期 box
    resultHtml += '<div style="margin-top:12px;padding:16px 20px;background:rgba(160,140,200,0.05);border-radius:12px;border-left:3px solid rgba(180,140,200,0.3);text-align:left;">';
    resultHtml += '<div style="color:#b8a0d0;font-size:0.78em;letter-spacing:0.08em;margin-bottom:6px;">▎近期</div>';
    resultHtml += '<div style="color:#b0a8c8;font-size:0.95em;line-height:1.7;">'+upcomingText+'</div>';
    resultHtml += '</div>';
    resultHtml += '<div class="direction-hook" style="margin-top:10px;">'+echo+'</div>';
    if (chartData1) {
      resultHtml += '<p style="color:#6a6a8a;font-size:0.75em;margin-top:10px;">✦ 基于你的星盘加权计算</p>';
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

const FORTUNE_SLIPS = [
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

const RP_TIERS = [
  {min:95,  label:'气运之子',  emoji:'👑', tip:'去买彩票不如去表白——今天的你是被宇宙亲吻过的人。'},
  {min:85,  label:'吉星高照',  emoji:'🌟', tip:'今天的幸运女神在你这边，做什么都顺。大方地接受赞美和好运吧。'},
  {min:70,  label:'顺风顺水',  emoji:'🌈', tip:'不错的一天，小事顺利，大事可期。保持微笑，好运会被你吸引过来。'},
  {min:50,  label:'平平淡淡',  emoji:'🌤️', tip:'没有惊喜也没有惊吓，平凡也是一种幸福。今天的主题是"稳"。'},
  {min:30,  label:'小有波折',  emoji:'🌧️', tip:'可能有点小不顺，但不足以影响你的好心情。水逆吗？不，只是你太着急了。'},
  {min:15,  label:'诸事不宜',  emoji:'⛈️', tip:'今天适合低调——能不出门就不出门，能不说话就不说话。忍一天，明天再来。'},
  {min:0,   label:'触底反弹',  emoji:'🌪️', tip:'人品已跌至谷底——别担心，这说明明天只会更好。今天适合：吃饭、睡觉、看剧，不干正事。'},
];

const LUCKY_COLORS = ['琥珀金','深空蓝','玫瑰粉','翡翠绿','紫罗兰','珊瑚橙','月光银','墨玉黑','珊瑚红','天青','杏黄','靛蓝'];
const LUCKY_DIRS  = ['东南方','正北','西南','正东','西北','正南','东北','正西'];

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
  return SIGN_PURE[degToSign(lonDeg).si];
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
    {key:'Sun', lon: natal.Sun, name: '本命太阳'},
    {key:'Moon', lon: natal.Moon, name: '本命月亮'},
    {key:'Venus', lon: natal.Venus, name: '本命金星'},
    {key:'Mars', lon: natal.Mars, name: '本命火星'},
    {key:'Jupiter', lon: natal.Jupiter, name: '本命木星'},
    {key:'Asc', lon: chartData1.asc, name: '上升点'},
    {key:'MC', lon: chartData1.mc, name: '天顶'},
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
  const venusSign = chartSignName(chartData1.positions.Venus);
  const SIGN_COLORS = {
    '白羊座':'珊瑚红','金牛座':'翡翠绿','双子座':'天青','巨蟹座':'月光银',
    '狮子座':'琥珀金','处女座':'墨玉黑','天秤座':'玫瑰粉','天蝎座':'深空蓝',
    '射手座':'紫罗兰','摩羯座':'靛蓝','水瓶座':'杏黄','双鱼座':'珊瑚橙'
  };
  const DIRS_BY_HOUSE = ['正东','东北','正北','西北','正西','西南','正南','东南','正东','东北','正北','西北'];
  const jupHouse = (chartData1.houses && chartData1.houses.Jupiter) || 1;
  const sunDeg = Math.floor(chartData1.positions.Sun % 30);

  return {
    color: SIGN_COLORS[venusSign] || LUCKY_COLORS[Math.floor(score % LUCKY_COLORS.length)],
    dir: DIRS_BY_HOUSE[jupHouse - 1] || LUCKY_DIRS[Math.floor(score % LUCKY_DIRS.length)],
    num: (sunDeg + Math.floor(score/10)) % 100
  };
}

function generateFortuneAnnotation() {
  const insight = getTopTransitInsight();
  if (!insight) return '';

  const sunSign = getNatalSunSign();
  const transitNameMap = {Jupiter:'木星', Saturn:'土星', Uranus:'天王星', Venus:'金星', Mars:'火星'};
  const transitName = transitNameMap[insight.tp] || insight.tp;
  let house;
  if (insight.nt.key === 'Asc') { house = 1; }
  else if (insight.nt.key === 'MC') { house = 10; }
  else { house = (chartData1.houses && chartData1.houses[insight.nt.key]) || 1; }
  const HOUSE_NAMES = ['','命宫','财帛宫','兄弟宫','田宅宫','子女宫','奴仆宫','夫妻宫','疾厄宫','迁移宫','官禄宫','福德宫','玄秘宫'];
  const hName = HOUSE_NAMES[house] || ('第'+house+'宫');

  return '<div class="fortune-annotation" style="margin-top:12px;padding:10px 14px;background:rgba(201,169,110,0.08);border-left:3px solid var(--gold);border-radius:4px;font-size:0.82em;color:var(--accent);line-height:1.6;">✨ 星盘专属解读：行运' + transitName + '正' + insight.aspectName + '你的' + insight.nt.name + '——这张签文对你的' + hName + '尤其适用。' + sunSign + '今日宜静心内观，跟随星辰指引。</div>';
}

// ── Badge update ──────────────────────────────────────────────────────
function updateLodgeBadges() {
  const today = todayKey();
  const fb = document.getElementById('fortuneBadge');
  const rb = document.getElementById('rpBadge');
  if (fb) {
    const drawn = localStorage.getItem('fortune_date'+personKey()) === today && localStorage.getItem('fortune_slip'+personKey());
    const extra = parseInt(localStorage.getItem('fortune_extra_'+today+personKey()) || '0');
    if (drawn && extra <= 0) { fb.textContent = '今日已抽'; fb.classList.add('used'); }
    else if (extra > 0) { fb.textContent = '还可抽'+(extra+1)+'次'; fb.classList.remove('used'); }
    else { fb.textContent = '今日可抽'; fb.classList.remove('used'); }
  }
  if (rb) {
    const checked = localStorage.getItem('rp_date'+personKey()) === today;
    if (checked) { rb.textContent = '今日已查'; rb.classList.add('used'); }
    else { rb.textContent = '今日可查'; rb.classList.remove('used'); }
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
  for (const s of FORTUNE_SLIPS) { for (let i=0; i<(weights[s.lv]||1); i++) pool.push(s); }
  return pool[Math.floor(Math.random() * pool.length)];
}

function openDailyFortune() {
  const today = todayKey();
  const lastDate = localStorage.getItem('fortune_date'+personKey());
  let extra = parseInt(localStorage.getItem('fortune_extra_'+today+personKey()) || '0');

  if (lastDate === today && localStorage.getItem('fortune_slip'+personKey()) && extra <= 0) {
    const slip = JSON.parse(localStorage.getItem('fortune_slip'+personKey()));
    let html = '<h3>🏮 每日一签</h3>';
    html += '<p style="color:var(--text-dim);font-size:0.85em;">今天的签文你已经抽过了</p>';
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

  let html = '<h3>🏮 每日一签</h3>';
  html += '<div class="fortune-tube" id="fortuneTube" onclick="revealFortune()"></div>';
  html += '<p style="color:var(--text-dim);font-size:0.82em;">点击签筒摇签</p>';
  showGameModal(html);
}

function revealFortune() {
  const slip = drawFortuneSlip();
  localStorage.setItem('fortune_date'+personKey(), todayKey());
  localStorage.setItem('fortune_slip'+personKey(), JSON.stringify(slip));

  let html = '<h3>🏮 每日一签</h3>';
  html += renderFortuneResult(slip);
  if (chartData1) {
    const annotation = generateFortuneAnnotation();
    localStorage.setItem('fortune_annotation'+personKey(), annotation);
    html += annotation;
  } else {
    localStorage.removeItem('fortune_annotation'+personKey());
  }
  html += renderShareButton('fortune');
  html += '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">📕</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">每日运势推送</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">关注小红书 <strong style="color:#d4b870;">LunarVeilAstro</strong> 全平台同名</div></div><a href="https://www.xiaohongshu.com/user/LunarVeilAstro" target="_blank" rel="noopener" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;text-decoration:none;font-weight:bold;white-space:nowrap;">去关注 →</a></div>';
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
    let html = '<h3>🎲 今日人品</h3>';
    html += '<p style="color:var(--text-dim);font-size:0.85em;">你今天已经查过啦</p>';
    html += renderRPResult(score, personalized);
    html += renderShareButton('fortune');
    html += '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">💬</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">每日专属解读</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">加微信 <strong style="color:#d4b870;">LunarVeilAstro</strong> 一对一真人解读</div></div><span onclick="copySocial(\'微信\',\'LunarVeilAstro\')" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;font-weight:bold;white-space:nowrap;">复制微信号</span></div>';
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

  let html = '<h3>🎲 今日人品</h3>';
  html += renderRPResult(score, personalized);
  html += renderShareButton('fortune');
  html += '<div style="margin-top:18px;padding:14px 18px;background:linear-gradient(135deg,rgba(200,160,120,0.12),rgba(180,140,90,0.04));border:1px solid rgba(200,160,100,0.3);border-radius:12px;display:flex;align-items:center;gap:12px;"><span style="font-size:2em;">💬</span><div style="flex:1;"><div style="color:#d4b870;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;">每日专属解读</div><div style="color:#b0a8c0;font-size:0.75em;margin-top:2px;">加微信 <strong style="color:#d4b870;">LunarVeilAstro</strong> 一对一真人解读</div></div><span onclick="copySocial(\'微信\',\'LunarVeilAstro\')" style="background:rgba(200,160,100,0.18);border:1px solid rgba(200,160,100,0.4);border-radius:18px;padding:8px 16px;color:#d4b870;font-size:0.78em;cursor:pointer;font-weight:bold;white-space:nowrap;">复制微信号</span></div>';
  showGameModal(html);
}

function renderRPResult(score, personalized) {
  const tier = RP_TIERS.find(t => score >= t.min);
  let color, dir, num;
  if (personalized && chartData1) {
    const items = getChartLuckyItems(score);
    color = items.color; dir = items.dir; num = items.num;
  } else {
    color = LUCKY_COLORS[Math.floor(Math.abs(score * 7) % LUCKY_COLORS.length)];
    dir = LUCKY_DIRS[Math.floor(Math.abs(score * 13) % LUCKY_DIRS.length)];
    num = Math.floor(Math.abs(score * 17) % 100);
  }

  let r = '<div class="rp-score-circle">';
  r += '<div class="rp-score-num">' + score + '</div>';
  r += '<div class="rp-score-label">人品值</div>';
  r += '</div>';
  r += '<div class="rp-comment">' + tier.emoji + ' ' + tier.label + '</div>';
  if (personalized && chartData1) {
    const sunSign = getNatalSunSign();
    r += '<div style="background:rgba(201,169,110,0.1);border:1px solid var(--gold);border-radius:8px;padding:4px 10px;margin:8px 0;display:inline-block;font-size:0.78em;color:var(--accent);">✨ 基于你的' + sunSign + '本命星盘专属计算</div>';
  }
  r += '<p style="color:#b8b8c8;font-size:0.85em;line-height:1.7;">' + tier.tip + '</p>';
  r += '<div class="rp-details">';
  r += '🍀 幸运数字：<strong style="color:var(--accent);">' + num + '</strong>　|　';
  r += '🎨 幸运色：<strong style="color:var(--accent);">' + color + '</strong><br>';
  r += '🧭 幸运方位：<strong style="color:var(--accent);">' + dir + '</strong>';
  r += '</div>';
  return r;
}

// ── 分享得次数 ───────────────────────────────────────────────────────
function shareForExtra(gameType) {
  const today = todayKey();

  if (navigator.share) {
    navigator.share({
      title: '命运之轮 · 星盘解读',
      text: '刚刚在命运之轮抽了一支签，你也来试试吧！每日星盘运势 + 塔罗占卜，免费解读你的出生星盘。',
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
        msg.textContent = '链接已复制！分享给朋友，即可获得额外次数';
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
  return '<button class="share-btn" onclick="event.stopPropagation();shareForExtra(\'' + gameType + '\')">📤 分享得次数</button>';
}

// Initialize badges on load
updateLodgeBadges();

// ═══ 答案之书 ═══════════════════════════════════════════════════════════════
const BOOK_ANSWERS = [
  '是的，毫无疑问。','现在还不是时候。','跟随你的直觉。','答案就在你心中。','勇敢迈出第一步吧。','保持耐心，好事将至。','这是正确的方向。','换一个角度去看。','放下你的顾虑吧。','不要急于求成。','它会以你意想不到的方式到来。','先照顾好自己，答案自会出现。','你要的答案，其实你一直都知道。','相信过程，而非结果。','值得等待。','行动比答案更重要。','先放一放，过几天再问。','时机未到。','宇宙正在为你铺路，别急。','当你不问的时候，答案会自己来找你。','你早已知道该怎么做。','这个问题本身，比答案更有意义。','再坚持一下，就快到了。','可以，但要注意方式。','向左走，而不是向右。','别问了，去做吧。','你会在梦里找到线索。','找一个安静的地方待一会，你会听见。','先吃顿好的，然后再想。','去大自然里走走，答案在那里。','答案也许是一个你没有预料到的人。','它比你想象的要简单。','此刻的不确定，正是答案的一部分。','相信那个让你心跳加快的选择。','别问别人，问你自己。','你值得更好的。','来日方长，不急。','把手机关掉，你就知道了。','先睡一觉，明天再说。',
];

function openAnswerBook() {
  const answer = BOOK_ANSWERS[Math.floor(Math.random() * BOOK_ANSWERS.length)];
  let html = '<h3>📖 答案之书</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:16px;">在心里默念你的问题，然后翻开书页</p>';
  html += '<div class="book-stage" id="bookStage" onclick="flipTheBook()">';
  html += '<div class="book-cover">📖</div>';
  // Page layers stacked under the cover
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer">' + pickRandomAnswer() + '</div>';
  html += '<div class="book-page-layer" id="finalPage">' + answer + '</div>';
  html += '</div>';
  html += '<p style="color:var(--text-dim);font-size:0.78em;" id="bookHint">点击书页翻开答案</p>';
  showGameModal(html);
}

function pickRandomAnswer() {
  return BOOK_ANSWERS[Math.floor(Math.random() * BOOK_ANSWERS.length)];
}

function flipTheBook() {
  const stage = document.getElementById('bookStage');
  const hint = document.getElementById('bookHint');
  if (!stage || stage.classList.contains('flipping')) return;
  stage.classList.add('flipping');
  if (hint) hint.textContent = '哗啦啦...';
  // After all pages flip, swap to final answer card
  setTimeout(() => {
    const answer = document.getElementById('finalPage');
    const text = answer ? answer.textContent : '';
    stage.innerHTML = '<div class="book-answer">' + text + '</div>';
    if (hint) hint.textContent = '';
  }, 850);
}

// ═══ 魔法八球 ═══════════════════════════════════════════════════════════════
const BALL_ANSWERS = [
  '毫无疑问','是的','看起来不错','很可能是','迹象表明：是','星象显示：YES',
  '再问一次','现在说不准','稍后再问','天机不可泄露','换个问法吧',
  '别指望了','我的回答：否','可能性不大','非常可疑','星象显示：NO',
];

function openMagicBall() {
  let html = '<h3>🔮 魔法八球</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:16px;">在心里想一个是/否问题</p>';
  html += '<div class="ball-container" id="magicBall" onclick="shakeBall()">';
  html += '<div class="ball-answer-window" id="ballWindow">🔮</div>';
  html += '</div>';
  html += '<p style="color:var(--text-dim);font-size:0.78em;">点击水晶球，震动命运的答案</p>';
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
    const answer = BALL_ANSWERS[Math.floor(Math.random() * BALL_ANSWERS.length)];
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

  let html = '<h3>🃏 单张塔罗</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:14px;">深呼吸，选一张属于你的牌</p>';
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

  let html = '<h3>🃏 单张塔罗</h3>';
  html += '<div class="tarot-reveal-card" style="text-align:center;">';
  html += '<p style="color:var(--accent);font-size:1.1em;font-weight:bold;margin-bottom:6px;">' + name + '</p>';
  if (isRev) html += '<span class="reversed-badge" style="display:inline-block;margin-bottom:8px;">逆位</span>';
  html += '<p style="color:#b8b8c8;font-size:0.82em;line-height:1.7;">' + (desc.length > 120 ? desc.substring(0,120) + '...' : desc) + '</p>';
  html += '</div>';
  html += '<p style="color:var(--text-dim);font-size:0.75em;margin-top:12px;">✨ 这张牌是今天给你的指引。记住：牌面不是预言，是你内心的回声。</p>';
  html += '<button class="share-btn" onclick="openSingleTarot()">🔄 再抽一张</button>';

  document.getElementById('gameModal').innerHTML = '<button class="game-close" onclick="closeGameModal()">✕</button>' + html;
}

// ═══ 星座速配 ═══════════════════════════════════════════════════════════════
const ZODIAC_SIGNS = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];

function openZodiacMatch() {
  let html = '<h3>💫 星座速配</h3>';
  html += '<p style="color:var(--text-dim);font-size:0.85em;margin-bottom:14px;">选择两个星座，看看缘分指数</p>';
  html += '<div class="zodiac-select-row">';
  html += '<select id="zSign1">';
  for (const s of ZODIAC_SIGNS) html += '<option value="' + s + '">' + s + '</option>';
  html += '</select>';
  html += '<span class="match-heart">💕</span>';
  html += '<select id="zSign2">';
  for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
    const s = ZODIAC_SIGNS[i];
    html += '<option value="' + s + '"' + (i === 6 ? ' selected' : '') + '>' + s + '</option>';
  }
  html += '</select>';
  html += '</div>';
  html += '<button class="share-btn" onclick="calculateMatch()" style="margin-top:0;">✨ 测算缘分</button>';
  html += '<div id="matchResult" style="margin-top:16px;"></div>';
  showGameModal(html);
}

function calculateMatch() {
  const s1 = document.getElementById('zSign1').value;
  const s2 = document.getElementById('zSign2').value;
  const i1 = ZODIAC_SIGNS.indexOf(s1);
  const i2 = ZODIAC_SIGNS.indexOf(s2);
  const sameMod = (i1 % 3) === (i2 % 3); // same modality
  const elements = ['火','土','风','水','火','土','风','水','火','土','风','水'];
  const e1 = elements[i1], e2 = elements[i2];
  const sameElem = e1 === e2;
  const compatible = (e1==='火'&&e2==='风')||(e1==='风'&&e2==='火')||(e1==='土'&&e2==='水')||(e1==='水'&&e2==='土');

  let base = 50;
  if (s1 === s2) base = 85 + Math.floor(Math.random() * 15);
  else if (sameElem) base = 70 + Math.floor(Math.random() * 20);
  else if (compatible) base = 65 + Math.floor(Math.random() * 20);
  else if (sameMod) base = 55 + Math.floor(Math.random() * 20);
  else base = 35 + Math.floor(Math.random() * 30);

  const score = Math.min(99, base);

  const taglines = [
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
  r += '<tr style="background:#eee;"><th>行星</th><th>位置</th><th>宫位</th><th>元素</th><th>模式</th></tr>';
  for (const p of PLANETS) {
    const lon = d.positions[p.id];
    const {si, d:dd, m} = degToSign(lon);
    const h = d.houses[p.id] || '?';
    r += '<tr><td>' + p.name + '</td><td>' + SIGN_PURE[si] + ' ' + dd + '°' + String(m).padStart(2,'0') + '′</td><td>第' + h + '宫</td><td>' + ELEMENTS[si] + '</td><td>' + MODES[si] + '</td></tr>';
  }
  r += '</table>';

  // Disclaimer
  r += '<p style="text-align:center;color:#999;font-size:0.8em;margin-top:30px;">星辰不为任何人改写轨迹，星盘也从不替你掌舵。<br>本报告仅供自我觉察与灵性探索之参考。</p>';

  return r;
}

function downloadPDFReport() {
  if (!chartData1) { alert('请先生成星盘解读报告'); return; }

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
  if (!chartData1) { alert('请先生成星盘解读报告'); return; }

  const email = document.getElementById('p1_email').value.trim();
  if (!email) { alert('请先在"电子邮箱"栏填写您的邮箱地址'); return; }

  const reportContent = buildReportHTML();

  // Try EmailJS if configured, otherwise use copy-to-clipboard + mailto
  if (typeof emailjs !== 'undefined') {
    // EmailJS path — requires user to set up free account at emailjs.com
    const templateParams = {
      to_email: email,
      subject: '您的星盘解读报告',
      report_html: reportContent
    };
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
      .then(() => {
        const msg = document.getElementById('emailMsg');
        msg.style.display = 'block'; msg.style.color = '#7ab87a';
        msg.textContent = '报告已发送至 ' + email + '，请查收（如未收到请检查垃圾邮件箱）';
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
      msg.innerHTML = '报告文本已复制到剪贴板。请粘贴到邮件中发送至 <strong>' + email + '</strong>，或点击下方直接打开邮件客户端：<br><a href="mailto:' + email + '?subject=星盘解读报告&body=' + encodeURIComponent(plainText.substring(0, 2000)) + '" style="color:var(--accent);">📧 打开邮件客户端</a>';
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
  msg.innerHTML = '<a href="mailto:' + email + '?subject=星盘解读报告&body=' + encodeURIComponent(plainText.substring(0, 2000)) + '" style="color:var(--accent);font-size:1em;">📧 点击此处打开邮件客户端发送报告</a>';
}
