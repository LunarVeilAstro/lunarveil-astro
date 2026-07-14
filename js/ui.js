// ui.js — Error trap, formatting, geocoding, tab rendering, export
// Global state: chartData1, chartData2
// Depends on: ALL other modules (loaded last)
// ── Error trap: log to console only, not visible to visitors ────────────

// data.js 懒加载地址（版本号集中此处，data.js 更新时只改这一行）
var DATA_JS = 'js/data.js?v=20260712';

// ── Wrapper: lodge games (answer book / magic ball) need data.js (lazy) ──
// lodge.js already ran (defer order), so real fns are defined. Override immediately.
// 注意：每日一签(openDailyFortune)、今日人品(openDailyRP) 不在此列——签筒/轮盘无需 data.js，自己即时渲染+后台预载。
(function() {
  var _openAB = openAnswerBook;
  var _openMB = openMagicBall;
  var _ensureData = function(fn) {
    if (typeof BOOK_ANSWERS === 'function' && typeof BALL_ANSWERS === 'function' && typeof FORTUNE_SLIPS_ZH !== 'undefined') {
      fn(); return;
    }
    loadScript(DATA_JS).then(function() { fn(); })
      .catch(function(e) {
        console.error('data.js load error:', e);
        alert(_L('模块加载失败，请刷新页面后重试。','Module loading failed. Please refresh and try again.'));
      });
  };
  openAnswerBook = function() { _ensureData(_openAB); };
  openMagicBall = function() { _ensureData(_openMB); };
})();

// ── Wrapper: openSingleTarot in lodge section needs tarot.js (lazy) ──────
// Overwritten by the real function once tarot.js loads
function openSingleTarot() {
  if (window._modulesLoaded) return; // Already loaded, real fn handles it
  // Lazy-load the heavy modules, then delegate to real openSingleTarot
  loadScript(DATA_JS).then(function() {
    return Promise.all([
      loadScript('js/reports.js?v=20260715'),
      loadScript('js/tarot.js?v=20260712')
    ]);
  }).then(function() {
    window._modulesLoaded = true;
    openSingleTarot(); // Real function now defined (replaced this wrapper)
  }).catch(function(e) {
    console.error('Module load error:', e);
    alert(_L('模块加载失败，请刷新页面后重试。','Module loading failed. Please refresh and try again.'));
  });
}

// ── Lazy loader for heavy modules ────────────────────────────────────────
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

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

// ── Local city coordinate DB (avoids Nominatim for known cities) ──────────
var CITY_DB = [
  // === 直辖市 === UTC+8
  { k:'北京', en:'Beijing', lat:39.904, lng:116.407, tz:8 },
  { k:'上海', en:'Shanghai', lat:31.230, lng:121.474, tz:8 },
  { k:'天津', en:'Tianjin', lat:39.085, lng:117.200, tz:8 },
  { k:'重庆', en:'Chongqing', lat:29.432, lng:106.912, tz:8 },
  // === 广东 ===
  { k:'广州', en:'Guangzhou', lat:23.129, lng:113.264, tz:8 },
  { k:'深圳', en:'Shenzhen', lat:22.543, lng:114.058, tz:8 },
  { k:'东莞', en:'Dongguan', lat:23.021, lng:113.752, tz:8 },
  { k:'佛山', en:'Foshan', lat:23.022, lng:113.122, tz:8 },
  { k:'珠海', en:'Zhuhai', lat:22.271, lng:113.577, tz:8 },
  { k:'惠州', en:'Huizhou', lat:23.112, lng:114.417, tz:8 },
  { k:'中山', en:'Zhongshan', lat:22.516, lng:113.393, tz:8 },
  { k:'江门', en:'Jiangmen', lat:22.579, lng:113.082, tz:8 },
  { k:'湛江', en:'Zhanjiang', lat:21.271, lng:110.359, tz:8 },
  { k:'汕头', en:'Shantou', lat:23.354, lng:116.682, tz:8 },
  { k:'茂名', en:'Maoming', lat:21.663, lng:110.925, tz:8 },
  { k:'肇庆', en:'Zhaoqing', lat:23.047, lng:112.465, tz:8 },
  { k:'梅州', en:'Meizhou', lat:24.288, lng:116.122, tz:8 },
  { k:'汕尾', en:'Shanwei', lat:22.786, lng:115.375, tz:8 },
  { k:'河源', en:'Heyuan', lat:23.744, lng:114.701, tz:8 },
  { k:'清远', en:'Qingyuan', lat:23.682, lng:113.056, tz:8 },
  { k:'韶关', en:'Shaoguan', lat:24.801, lng:113.592, tz:8 },
  { k:'揭阳', en:'Jieyang', lat:23.550, lng:116.373, tz:8 },
  { k:'潮州', en:'Chaozhou', lat:23.657, lng:116.622, tz:8 },
  { k:'阳江', en:'Yangjiang', lat:21.858, lng:111.983, tz:8 },
  { k:'云浮', en:'Yunfu', lat:22.915, lng:112.045, tz:8 },
  // === 浙江 ===
  { k:'杭州', en:'Hangzhou', lat:30.274, lng:120.155, tz:8 },
  { k:'宁波', en:'Ningbo', lat:29.868, lng:121.544, tz:8 },
  { k:'温州', en:'Wenzhou', lat:27.994, lng:120.699, tz:8 },
  { k:'绍兴', en:'Shaoxing', lat:30.030, lng:120.580, tz:8 },
  { k:'嘉兴', en:'Jiaxing', lat:30.747, lng:120.756, tz:8 },
  { k:'湖州', en:'Huzhou', lat:30.893, lng:120.088, tz:8 },
  { k:'金华', en:'Jinhua', lat:29.078, lng:119.647, tz:8 },
  { k:'台州', en:'Taizhou', lat:28.656, lng:121.421, tz:8 },
  { k:'衢州', en:'Quzhou', lat:28.936, lng:118.874, tz:8 },
  { k:'丽水', en:'Lishui', lat:28.467, lng:119.923, tz:8 },
  { k:'舟山', en:'Zhoushan', lat:29.985, lng:122.207, tz:8 },
  // === 江苏 ===
  { k:'南京', en:'Nanjing', lat:32.060, lng:118.797, tz:8 },
  { k:'苏州', en:'Suzhou', lat:31.299, lng:120.585, tz:8 },
  { k:'无锡', en:'Wuxi', lat:31.491, lng:120.312, tz:8 },
  { k:'常州', en:'Changzhou', lat:31.811, lng:119.974, tz:8 },
  { k:'南通', en:'Nantong', lat:31.979, lng:120.894, tz:8 },
  { k:'徐州', en:'Xuzhou', lat:34.206, lng:117.284, tz:8 },
  { k:'扬州', en:'Yangzhou', lat:32.394, lng:119.413, tz:8 },
  { k:'镇江', en:'Zhenjiang', lat:32.190, lng:119.427, tz:8 },
  { k:'盐城', en:'Yancheng', lat:33.348, lng:120.162, tz:8 },
  { k:'淮安', en:'Huai\'an', lat:33.552, lng:119.113, tz:8 },
  { k:'连云港', en:'Lianyungang', lat:34.597, lng:119.221, tz:8 },
  { k:'泰州', en:'Taizhou', lat:32.456, lng:119.924, tz:8 },
  { k:'宿迁', en:'Suqian', lat:33.962, lng:118.275, tz:8 },
  // === 山东 ===
  { k:'济南', en:'Jinan', lat:36.651, lng:116.985, tz:8 },
  { k:'青岛', en:'Qingdao', lat:36.067, lng:120.383, tz:8 },
  { k:'烟台', en:'Yantai', lat:37.539, lng:121.392, tz:8 },
  { k:'淄博', en:'Zibo', lat:36.813, lng:118.055, tz:8 },
  { k:'潍坊', en:'Weifang', lat:36.707, lng:119.162, tz:8 },
  { k:'临沂', en:'Linyi', lat:35.105, lng:118.350, tz:8 },
  { k:'威海', en:'Weihai', lat:37.513, lng:122.120, tz:8 },
  { k:'日照', en:'Rizhao', lat:35.416, lng:119.527, tz:8 },
  { k:'济宁', en:'Jining', lat:35.415, lng:116.587, tz:8 },
  { k:'泰安', en:'Tai\'an', lat:36.200, lng:117.088, tz:8 },
  { k:'德州', en:'Dezhou', lat:37.436, lng:116.359, tz:8 },
  { k:'菏泽', en:'Heze', lat:35.234, lng:115.481, tz:8 },
  { k:'聊城', en:'Liaocheng', lat:36.456, lng:115.985, tz:8 },
  { k:'滨州', en:'Binzhou', lat:37.382, lng:117.973, tz:8 },
  { k:'东营', en:'Dongying', lat:37.435, lng:118.675, tz:8 },
  { k:'枣庄', en:'Zaozhuang', lat:34.811, lng:117.323, tz:8 },
  // === 四川 ===
  { k:'成都', en:'Chengdu', lat:30.573, lng:104.067, tz:8 },
  { k:'绵阳', en:'Mianyang', lat:31.467, lng:104.679, tz:8 },
  { k:'宜宾', en:'Yibin', lat:28.751, lng:104.644, tz:8 },
  { k:'德阳', en:'Deyang', lat:31.127, lng:104.398, tz:8 },
  { k:'南充', en:'Nanchong', lat:30.837, lng:106.111, tz:8 },
  { k:'泸州', en:'Luzhou', lat:28.872, lng:105.443, tz:8 },
  { k:'达州', en:'Dazhou', lat:31.209, lng:107.468, tz:8 },
  { k:'乐山', en:'Leshan', lat:29.552, lng:103.766, tz:8 },
  { k:'自贡', en:'Zigong', lat:29.339, lng:104.779, tz:8 },
  { k:'攀枝花', en:'Panzhihua', lat:26.582, lng:101.719, tz:8 },
  { k:'广元', en:'Guangyuan', lat:32.436, lng:105.844, tz:8 },
  { k:'遂宁', en:'Suining', lat:30.533, lng:105.593, tz:8 },
  { k:'内江', en:'Neijiang', lat:29.580, lng:105.058, tz:8 },
  { k:'眉山', en:'Meishan', lat:30.077, lng:103.848, tz:8 },
  { k:'资阳', en:'Ziyang', lat:30.129, lng:104.627, tz:8 },
  { k:'巴中', en:'Bazhong', lat:31.859, lng:106.753, tz:8 },
  { k:'雅安', en:'Ya\'an', lat:29.981, lng:103.013, tz:8 },
  // === 湖北 ===
  { k:'武汉', en:'Wuhan', lat:30.593, lng:114.305, tz:8 },
  { k:'襄阳', en:'Xiangyang', lat:32.009, lng:112.122, tz:8 },
  { k:'宜昌', en:'Yichang', lat:30.691, lng:111.287, tz:8 },
  { k:'荆州', en:'Jingzhou', lat:30.335, lng:112.240, tz:8 },
  { k:'黄冈', en:'Huanggang', lat:30.454, lng:114.872, tz:8 },
  { k:'十堰', en:'Shiyan', lat:32.630, lng:110.798, tz:8 },
  { k:'孝感', en:'Xiaogan', lat:30.925, lng:113.927, tz:8 },
  { k:'荆门', en:'Jingmen', lat:31.035, lng:112.199, tz:8 },
  { k:'鄂州', en:'Ezhou', lat:30.391, lng:114.895, tz:8 },
  { k:'黄石', en:'Huangshi', lat:30.200, lng:115.039, tz:8 },
  { k:'咸宁', en:'Xianning', lat:29.841, lng:114.322, tz:8 },
  { k:'随州', en:'Suizhou', lat:31.690, lng:113.383, tz:8 },
  { k:'恩施', en:'Enshi', lat:30.283, lng:109.487, tz:8 },
  // === 湖南 ===
  { k:'长沙', en:'Changsha', lat:28.228, lng:112.939, tz:8 },
  { k:'岳阳', en:'Yueyang', lat:29.357, lng:113.129, tz:8 },
  { k:'株洲', en:'Zhuzhou', lat:27.828, lng:113.134, tz:8 },
  { k:'湘潭', en:'Xiangtan', lat:27.830, lng:112.944, tz:8 },
  { k:'衡阳', en:'Hengyang', lat:26.893, lng:112.572, tz:8 },
  { k:'常德', en:'Changde', lat:29.032, lng:111.698, tz:8 },
  { k:'郴州', en:'Chenzhou', lat:25.771, lng:113.015, tz:8 },
  { k:'怀化', en:'Huaihua', lat:27.550, lng:109.959, tz:8 },
  { k:'邵阳', en:'Shaoyang', lat:27.239, lng:111.468, tz:8 },
  { k:'永州', en:'Yongzhou', lat:26.420, lng:111.612, tz:8 },
  { k:'娄底', en:'Loudi', lat:27.697, lng:111.996, tz:8 },
  { k:'益阳', en:'Yiyang', lat:28.554, lng:112.355, tz:8 },
  { k:'张家界', en:'Zhangjiajie', lat:29.117, lng:110.479, tz:8 },
  // === 河南 ===
  { k:'郑州', en:'Zhengzhou', lat:34.746, lng:113.625, tz:8 },
  { k:'洛阳', en:'Luoyang', lat:34.618, lng:112.454, tz:8 },
  { k:'开封', en:'Kaifeng', lat:34.797, lng:114.307, tz:8 },
  { k:'南阳', en:'Nanyang', lat:32.991, lng:112.528, tz:8 },
  { k:'许昌', en:'Xuchang', lat:34.036, lng:113.852, tz:8 },
  { k:'新乡', en:'Xinxiang', lat:35.304, lng:113.927, tz:8 },
  { k:'信阳', en:'Xinyang', lat:32.147, lng:114.091, tz:8 },
  { k:'安阳', en:'Anyang', lat:36.098, lng:114.393, tz:8 },
  { k:'商丘', en:'Shangqiu', lat:34.414, lng:115.656, tz:8 },
  { k:'焦作', en:'Jiaozuo', lat:35.216, lng:113.242, tz:8 },
  { k:'平顶山', en:'Pingdingshan', lat:33.766, lng:113.193, tz:8 },
  { k:'驻马店', en:'Zhumadian', lat:33.012, lng:114.023, tz:8 },
  { k:'周口', en:'Zhoukou', lat:33.636, lng:114.702, tz:8 },
  { k:'漯河', en:'Luohe', lat:33.581, lng:114.017, tz:8 },
  { k:'濮阳', en:'Puyang', lat:35.762, lng:115.029, tz:8 },
  // === 河北 ===
  { k:'石家庄', en:'Shijiazhuang', lat:38.042, lng:114.515, tz:8 },
  { k:'唐山', en:'Tangshan', lat:39.630, lng:118.180, tz:8 },
  { k:'保定', en:'Baoding', lat:38.874, lng:115.465, tz:8 },
  { k:'邯郸', en:'Handan', lat:36.626, lng:114.539, tz:8 },
  { k:'秦皇岛', en:'Qinhuangdao', lat:39.935, lng:119.600, tz:8 },
  { k:'廊坊', en:'Langfang', lat:39.538, lng:116.684, tz:8 },
  { k:'沧州', en:'Cangzhou', lat:38.304, lng:116.839, tz:8 },
  { k:'邢台', en:'Xingtai', lat:37.071, lng:114.504, tz:8 },
  { k:'衡水', en:'Hengshui', lat:37.739, lng:115.669, tz:8 },
  { k:'承德', en:'Chengde', lat:40.952, lng:117.962, tz:8 },
  { k:'张家口', en:'Zhangjiakou', lat:40.768, lng:114.886, tz:8 },
  // === 山西 ===
  { k:'太原', en:'Taiyuan', lat:37.870, lng:112.550, tz:8 },
  { k:'大同', en:'Datong', lat:40.076, lng:113.300, tz:8 },
  { k:'运城', en:'Yuncheng', lat:35.027, lng:111.007, tz:8 },
  { k:'临汾', en:'Linfen', lat:36.088, lng:111.519, tz:8 },
  { k:'长治', en:'Changzhi', lat:36.196, lng:113.117, tz:8 },
  { k:'晋城', en:'Jincheng', lat:35.491, lng:112.851, tz:8 },
  { k:'阳泉', en:'Yangquan', lat:37.857, lng:113.580, tz:8 },
  { k:'忻州', en:'Xinzhou', lat:38.416, lng:112.734, tz:8 },
  { k:'吕梁', en:'Lvliang', lat:37.519, lng:111.144, tz:8 },
  { k:'晋中', en:'Jinzhong', lat:37.687, lng:112.753, tz:8 },
  { k:'朔州', en:'Shuozhou', lat:39.332, lng:112.433, tz:8 },
  // === 陕西 ===
  { k:'西安', en:'Xi\'an', lat:34.341, lng:108.940, tz:8 },
  { k:'咸阳', en:'Xianyang', lat:34.330, lng:108.710, tz:8 },
  { k:'宝鸡', en:'Baoji', lat:34.362, lng:107.238, tz:8 },
  { k:'延安', en:'Yan\'an', lat:36.585, lng:109.490, tz:8 },
  { k:'榆林', en:'Yulin', lat:38.285, lng:109.734, tz:8 },
  { k:'汉中', en:'Hanzhong', lat:33.068, lng:107.023, tz:8 },
  { k:'安康', en:'Ankang', lat:32.685, lng:109.029, tz:8 },
  { k:'商洛', en:'Shangluo', lat:33.873, lng:109.941, tz:8 },
  { k:'渭南', en:'Weinan', lat:34.500, lng:109.510, tz:8 },
  { k:'铜川', en:'Tongchuan', lat:34.897, lng:108.945, tz:8 },
  // === 安徽 ===
  { k:'合肥', en:'Hefei', lat:31.821, lng:117.229, tz:8 },
  { k:'芜湖', en:'Wuhu', lat:31.353, lng:118.433, tz:8 },
  { k:'蚌埠', en:'Bengbu', lat:32.917, lng:117.389, tz:8 },
  { k:'安庆', en:'Anqing', lat:30.543, lng:117.064, tz:8 },
  { k:'马鞍山', en:'Ma\'anshan', lat:31.670, lng:118.506, tz:8 },
  { k:'滁州', en:'Chuzhou', lat:32.301, lng:118.317, tz:8 },
  { k:'阜阳', en:'Fuyang', lat:32.890, lng:115.814, tz:8 },
  { k:'宿州', en:'Suzhou', lat:33.647, lng:116.964, tz:8 },
  { k:'六安', en:'Lu\'an', lat:31.735, lng:116.520, tz:8 },
  { k:'亳州', en:'Bozhou', lat:33.845, lng:115.779, tz:8 },
  { k:'宣城', en:'Xuancheng', lat:30.941, lng:118.758, tz:8 },
  { k:'淮南', en:'Huainan', lat:32.626, lng:116.997, tz:8 },
  { k:'淮北', en:'Huaibei', lat:33.955, lng:116.794, tz:8 },
  { k:'铜陵', en:'Tongling', lat:30.945, lng:117.811, tz:8 },
  { k:'黄山', en:'Huangshan', lat:29.715, lng:118.338, tz:8 },
  // === 福建 ===
  { k:'福州', en:'Fuzhou', lat:26.074, lng:119.296, tz:8 },
  { k:'厦门', en:'Xiamen', lat:24.480, lng:118.089, tz:8 },
  { k:'泉州', en:'Quanzhou', lat:24.874, lng:118.676, tz:8 },
  { k:'莆田', en:'Putian', lat:25.454, lng:119.008, tz:8 },
  { k:'漳州', en:'Zhangzhou', lat:24.513, lng:117.647, tz:8 },
  { k:'龙岩', en:'Longyan', lat:25.075, lng:117.017, tz:8 },
  { k:'三明', en:'Sanming', lat:26.264, lng:117.639, tz:8 },
  { k:'南平', en:'Nanping', lat:26.642, lng:118.178, tz:8 },
  { k:'宁德', en:'Ningde', lat:26.666, lng:119.548, tz:8 },
  // === 江西 ===
  { k:'南昌', en:'Nanchang', lat:28.682, lng:115.858, tz:8 },
  { k:'赣州', en:'Ganzhou', lat:25.831, lng:114.935, tz:8 },
  { k:'九江', en:'Jiujiang', lat:29.705, lng:116.002, tz:8 },
  { k:'宜春', en:'Yichun', lat:27.815, lng:114.417, tz:8 },
  { k:'吉安', en:'Ji\'an', lat:27.114, lng:114.994, tz:8 },
  { k:'上饶', en:'Shangrao', lat:28.455, lng:117.943, tz:8 },
  { k:'抚州', en:'Fuzhou', lat:27.949, lng:116.358, tz:8 },
  { k:'景德镇', en:'Jingdezhen', lat:29.269, lng:117.179, tz:8 },
  { k:'萍乡', en:'Pingxiang', lat:27.623, lng:113.855, tz:8 },
  { k:'新余', en:'Xinyu', lat:27.818, lng:114.917, tz:8 },
  { k:'鹰潭', en:'Yingtan', lat:28.260, lng:117.069, tz:8 },
  // === 辽宁 ===
  { k:'沈阳', en:'Shenyang', lat:41.806, lng:123.432, tz:8 },
  { k:'大连', en:'Dalian', lat:38.914, lng:121.615, tz:8 },
  { k:'鞍山', en:'Anshan', lat:41.108, lng:122.994, tz:8 },
  { k:'抚顺', en:'Fushun', lat:41.880, lng:123.957, tz:8 },
  { k:'锦州', en:'Jinzhou', lat:41.095, lng:121.127, tz:8 },
  { k:'营口', en:'Yingkou', lat:40.667, lng:122.235, tz:8 },
  { k:'丹东', en:'Dandong', lat:40.000, lng:124.354, tz:8 },
  { k:'盘锦', en:'Panjin', lat:41.120, lng:122.071, tz:8 },
  { k:'葫芦岛', en:'Huludao', lat:40.711, lng:120.837, tz:8 },
  { k:'朝阳', en:'Chaoyang', lat:41.573, lng:120.449, tz:8 },
  { k:'辽阳', en:'Liaoyang', lat:41.268, lng:123.237, tz:8 },
  { k:'铁岭', en:'Tieling', lat:42.286, lng:123.842, tz:8 },
  // === 吉林 ===
  { k:'长春', en:'Changchun', lat:43.817, lng:125.324, tz:8 },
  { k:'吉林', en:'Jilin', lat:43.838, lng:126.550, tz:8 },
  { k:'延吉', en:'Yanji', lat:42.891, lng:129.509, tz:8 },
  { k:'四平', en:'Siping', lat:43.166, lng:124.350, tz:8 },
  { k:'通化', en:'Tonghua', lat:41.728, lng:125.940, tz:8 },
  { k:'松原', en:'Songyuan', lat:45.142, lng:124.825, tz:8 },
  // === 黑龙江 ===
  { k:'哈尔滨', en:'Harbin', lat:45.803, lng:126.535, tz:8 },
  { k:'齐齐哈尔', en:'Qiqihar', lat:47.354, lng:123.918, tz:8 },
  { k:'大庆', en:'Daqing', lat:46.589, lng:125.103, tz:8 },
  { k:'牡丹江', en:'Mudanjiang', lat:44.552, lng:129.633, tz:8 },
  { k:'佳木斯', en:'Jiamusi', lat:46.800, lng:130.327, tz:8 },
  // === 贵州 ===
  { k:'贵阳', en:'Guiyang', lat:26.647, lng:106.630, tz:8 },
  { k:'遵义', en:'Zunyi', lat:27.721, lng:106.927, tz:8 },
  { k:'毕节', en:'Bijie', lat:27.299, lng:105.305, tz:8 },
  { k:'六盘水', en:'Liupanshui', lat:26.593, lng:104.830, tz:8 },
  { k:'安顺', en:'Anshun', lat:26.253, lng:105.947, tz:8 },
  // === 云南 ===
  { k:'昆明', en:'Kunming', lat:25.039, lng:102.718, tz:8 },
  { k:'大理', en:'Dali', lat:25.591, lng:100.230, tz:8 },
  { k:'丽江', en:'Lijiang', lat:26.872, lng:100.230, tz:8 },
  { k:'曲靖', en:'Qujing', lat:25.490, lng:103.798, tz:8 },
  { k:'玉溪', en:'Yuxi', lat:24.352, lng:102.547, tz:8 },
  { k:'保山', en:'Baoshan', lat:25.112, lng:99.169, tz:8 },
  { k:'昭通', en:'Zhaotong', lat:27.338, lng:103.717, tz:8 },
  // === 广西 ===
  { k:'南宁', en:'Nanning', lat:22.824, lng:108.367, tz:8 },
  { k:'桂林', en:'Guilin', lat:25.274, lng:110.290, tz:8 },
  { k:'柳州', en:'Liuzhou', lat:24.326, lng:109.428, tz:8 },
  { k:'北海', en:'Beihai', lat:21.473, lng:109.119, tz:8 },
  { k:'玉林', en:'Yulin', lat:22.636, lng:110.181, tz:8 },
  { k:'梧州', en:'Wuzhou', lat:23.477, lng:111.279, tz:8 },
  { k:'钦州', en:'Qinzhou', lat:21.980, lng:108.654, tz:8 },
  { k:'百色', en:'Baise', lat:23.902, lng:106.618, tz:8 },
  // === 甘肃 ===
  { k:'兰州', en:'Lanzhou', lat:36.061, lng:103.834, tz:8 },
  { k:'天水', en:'Tianshui', lat:34.581, lng:105.725, tz:8 },
  { k:'酒泉', en:'Jiuquan', lat:39.733, lng:98.494, tz:8 },
  { k:'嘉峪关', en:'Jiayuguan', lat:39.772, lng:98.290, tz:8 },
  // === 内蒙古 ===
  { k:'呼和浩特', en:'Hohhot', lat:40.842, lng:111.749, tz:8 },
  { k:'包头', en:'Baotou', lat:40.658, lng:109.840, tz:8 },
  { k:'鄂尔多斯', en:'Ordos', lat:39.608, lng:109.781, tz:8 },
  { k:'赤峰', en:'Chifeng', lat:42.258, lng:118.889, tz:8 },
  // === 新疆 ===
  { k:'乌鲁木齐', en:'Urumqi', lat:43.826, lng:87.617, tz:8 },
  { k:'克拉玛依', en:'Karamay', lat:45.580, lng:84.889, tz:8 },
  // === 青海 ===
  { k:'西宁', en:'Xining', lat:36.617, lng:101.778, tz:8 },
  // === 宁夏 ===
  { k:'银川', en:'Yinchuan', lat:38.466, lng:106.267, tz:8 },
  // === 西藏 ===
  { k:'拉萨', en:'Lhasa', lat:29.651, lng:91.172, tz:8 },
  // === 海南 ===
  { k:'海口', en:'Haikou', lat:20.044, lng:110.200, tz:8 },
  { k:'三亚', en:'Sanya', lat:18.253, lng:109.512, tz:8 },
  // === 台湾 ===
  { k:'台北', en:'Taipei', lat:25.033, lng:121.565, tz:8 },
  { k:'高雄', en:'Kaohsiung', lat:22.617, lng:120.312, tz:8 },
  { k:'台中', en:'Taichung', lat:24.148, lng:120.674, tz:8 },
  { k:'台南', en:'Tainan', lat:22.999, lng:120.227, tz:8 },
  // === 港澳 ===
  { k:'香港', en:'Hong Kong', lat:22.319, lng:114.169, tz:8 },
  { k:'澳门', en:'Macau', lat:22.199, lng:113.544, tz:8 },
  // === 国际 ===
  { k:'东京', en:'Tokyo', lat:35.676, lng:139.650, tz:9 },
  { k:'大阪', en:'Osaka', lat:34.694, lng:135.502, tz:9 },
  { k:'首尔', en:'Seoul', lat:37.566, lng:126.978, tz:9 },
  { k:'釜山', en:'Busan', lat:35.180, lng:129.076, tz:9 },
  { k:'新加坡', en:'Singapore', lat:1.352, lng:103.820, tz:8 },
  { k:'曼谷', en:'Bangkok', lat:13.756, lng:100.502, tz:7 },
  { k:'清迈', en:'Chiang Mai', lat:18.788, lng:98.985, tz:7 },
  { k:'胡志明市', en:'Ho Chi Minh City', lat:10.823, lng:106.630, tz:7 },
  { k:'河内', en:'Hanoi', lat:21.028, lng:105.854, tz:7 },
  { k:'雅加达', en:'Jakarta', lat:-6.209, lng:106.846, tz:7 },
  { k:'吉隆坡', en:'Kuala Lumpur', lat:3.139, lng:101.687, tz:8 },
  { k:'马尼拉', en:'Manila', lat:14.599, lng:120.984, tz:8 },
  { k:'仰光', en:'Yangon', lat:16.840, lng:96.174, tz:6.5 },
  { k:'孟买', en:'Mumbai', lat:19.076, lng:72.877, tz:5.5 },
  { k:'新德里', en:'New Delhi', lat:28.614, lng:77.209, tz:5.5 },
  { k:'迪拜', en:'Dubai', lat:25.204, lng:55.271, tz:4 },
  { k:'莫斯科', en:'Moscow', lat:55.756, lng:37.617, tz:3 },
  { k:'伦敦', en:'London', lat:51.507, lng:-0.128, tz:0 },
  { k:'巴黎', en:'Paris', lat:48.857, lng:2.352, tz:1 },
  { k:'柏林', en:'Berlin', lat:52.520, lng:13.405, tz:1 },
  { k:'罗马', en:'Rome', lat:41.903, lng:12.496, tz:1 },
  { k:'马德里', en:'Madrid', lat:40.417, lng:-3.704, tz:1 },
  { k:'巴塞罗那', en:'Barcelona', lat:41.387, lng:2.170, tz:1 },
  { k:'阿姆斯特丹', en:'Amsterdam', lat:52.368, lng:4.904, tz:1 },
  { k:'伊斯坦布尔', en:'Istanbul', lat:41.008, lng:28.978, tz:3 },
  { k:'纽约', en:'New York', lat:40.713, lng:-74.006, tz:-5 },
  { k:'洛杉矶', en:'Los Angeles', lat:34.052, lng:-118.244, tz:-8 },
  { k:'旧金山', en:'San Francisco', lat:37.775, lng:-122.419, tz:-8 },
  { k:'芝加哥', en:'Chicago', lat:41.878, lng:-87.630, tz:-6 },
  { k:'休斯顿', en:'Houston', lat:29.760, lng:-95.370, tz:-6 },
  { k:'多伦多', en:'Toronto', lat:43.653, lng:-79.383, tz:-5 },
  { k:'温哥华', en:'Vancouver', lat:49.282, lng:-123.121, tz:-8 },
  { k:'悉尼', en:'Sydney', lat:-33.869, lng:151.209, tz:10 },
  { k:'墨尔本', en:'Melbourne', lat:-37.814, lng:144.963, tz:10 },
  { k:'布里斯班', en:'Brisbane', lat:-27.470, lng:153.026, tz:10 },
  { k:'奥克兰', en:'Auckland', lat:-36.848, lng:174.763, tz:12 }
];

// ── Offline county-level DB (~3100 China 县/区/县级市, tz +8), lazy-merged ──
// Sourced from Aliyun DataV centers (GCJ-02; sub-km offset, negligible for houses/ascendant).
// Loaded via <script> injection (works on file:// too — fetch() is blocked for local files),
// so 冷门小城 resolve fully offline — no Nominatim, which is unreachable in mainland China.
var _cityDbLoaded = false, _cityDbPromise = null;
function ensureCityDb() {
  if (_cityDbLoaded) return Promise.resolve();
  if (_cityDbPromise) return _cityDbPromise;
  _cityDbPromise = loadScript('js/city_db.js?v=20260717')
    .then(function(){
      var arr = window.CHINA_COUNTY_DB;
      if (Array.isArray(arr)) { for (var i = 0; i < arr.length; i++) CITY_DB.push(arr[i]); }
      _cityDbLoaded = true;
    })
    .catch(function(){ _cityDbLoaded = true; });  // fail-open: keep base DB working
  return _cityDbPromise;
}
// Warm city DB in background after initial paint, without competing for first-load bandwidth.
// Uses requestIdleCallback when available (yields to the event loop), falls back to 4s delay.
try {
  var _warm = function(){ ensureCityDb(); };
  if (window.requestIdleCallback) { requestIdleCallback(_warm, { timeout: 4000 }); }
  else { setTimeout(_warm, 4000); }
} catch (e) {}

function lookupCity(query) {
  if (!query || query.length < 1) return null;
  var q = query.trim();
  // Exact match (both Chinese and English names)
  for (var i = 0; i < CITY_DB.length; i++) {
    if (CITY_DB[i].k === q || CITY_DB[i].en === q) return CITY_DB[i];
  }
  // Contains: query contains city name OR city name contains query
  for (var i = 0; i < CITY_DB.length; i++) {
    var cn = CITY_DB[i].k, en = CITY_DB[i].en;
    if (q.indexOf(cn) !== -1 || cn.indexOf(q) !== -1) return CITY_DB[i];
    if (en && (q.toLowerCase().indexOf(en.toLowerCase()) !== -1 || en.toLowerCase().indexOf(q.toLowerCase()) !== -1)) return CITY_DB[i];
  }
  // Prefix (e.g. "北京朝阳区" → "北京")
  for (var i = 0; i < CITY_DB.length; i++) {
    var cn2 = CITY_DB[i].k, en2 = CITY_DB[i].en;
    if (q.length >= cn2.length && q.indexOf(cn2) === 0) return CITY_DB[i];
    if (en2 && q.length >= en2.length && q.toLowerCase().indexOf(en2.toLowerCase()) === 0) return CITY_DB[i];
  }
  return null;
}

// Fuzzy match: 2-gram overlap for Chinese, case-insensitive substring for English
function fuzzyMatchCity(query) {
  if (!query || query.length < 2) return null;
  var q = query.trim();
  var qLower = q.toLowerCase();

  // English-mode: try case-insensitive contains/prefix against en field first
  for (var j = 0; j < CITY_DB.length; j++) {
    var en = CITY_DB[j].en;
    if (!en) continue;
    var enLower = en.toLowerCase();
    if (qLower.indexOf(enLower) !== -1 || enLower.indexOf(qLower) !== -1) return CITY_DB[j];
    if (qLower.length >= 3 && enLower.indexOf(qLower) === 0) return CITY_DB[j];
  }

  // Chinese 2-gram overlap
  var qChars = {};
  for (var ci = 0; ci < q.length; ci++) { qChars[q[ci]] = true; }
  var qGrams = {};
  for (var i = 0; i < q.length - 1; i++) {
    qGrams[q.substring(i, i+2)] = true;
  }
  var best = null;
  var bestScore = 0;
  var bestHits = 0;
  for (var j2 = 0; j2 < CITY_DB.length; j2++) {
    var name = CITY_DB[j2].k;
    if (name.length < 2) continue;
    var hits = 0;
    for (var k = 0; k < name.length - 1; k++) {
      if (qGrams[name.substring(k, k+2)]) hits++;
    }
    var uniHits = 0;
    for (var u = 0; u < name.length; u++) {
      if (qChars[name[u]]) uniHits++;
    }
    var score = hits * 3 + uniHits;
    if (score > bestScore) {
      bestScore = score;
      bestHits = hits;
      best = CITY_DB[j2];
    }
  }
  // Require at least one shared 2-gram (adjacent pair). A single shared character
  // is too weak (e.g. 西宁→西安) and would preempt the correct lookup — reject it.
  return bestHits >= 1 ? best : null;
}

// ── Geocoding: offline DB (exact→fuzzy, tz+8) → CJK miss = manual → Latin = Nominatim ──
async function geocode(prefix) {
  const addrInput = document.getElementById(prefix + '_addr');
  const statusEl = document.getElementById(prefix + '_geo_status');
  const query = addrInput.value.trim();
  if (!query) { statusEl.textContent = ''; statusEl.className = 'geo-status'; return; }

  var prevText = statusEl.textContent;
  var prevClass = statusEl.className;
  statusEl.textContent = _t('geo.loading');
  statusEl.className = 'geo-status loading';

  // Make sure the offline county DB is merged first — domestic names resolve with no network.
  try { await ensureCityDb(); } catch (e) {}

  // 1) Exact local DB lookup
  var local = lookupCity(query);
  if (local) {
    var displayName = (window._lang && window._lang() === 'en') ? (local.en || local.k) : local.k;
    applyCityResult(prefix, local.lat, local.lng, local.tz, displayName, statusEl);
    return;
  }

  // 2) Fuzzy match — use nearest DB city's coords, show user's original query
  var fuzzy = fuzzyMatchCity(query);
  if (fuzzy) {
    applyCityResult(prefix, fuzzy.lat, fuzzy.lng, fuzzy.tz, null, statusEl);
    // Override display: show user's query, not the DB city name
    var ns = fuzzy.lat >= 0 ? 'N' : 'S';
    var ew2 = fuzzy.lng >= 0 ? 'E' : 'W';
    var tzSign2 = fuzzy.tz >= 0 ? '+' : '';
    statusEl.innerHTML = '📍 ' + escHtml(query) + ' · ' + Math.abs(fuzzy.lat).toFixed(2) + '°' + ns + ', ' + Math.abs(fuzzy.lng).toFixed(2) + '°' + ew2 + ' · UTC' + tzSign2 + fuzzy.tz + '  ' + _L('（近似坐标，精确排盘请<a href="#footer" style="color:var(--accent);text-decoration:underline;">联系占星师</a>）',' (approximate; <a href="#footer" style="color:var(--accent);text-decoration:underline;">contact for precision</a>)');
    statusEl.className = 'geo-status success';
    return;
  }

  // 3) Chinese place not in the offline DB → do NOT call Nominatim (unreachable in
  //    mainland China; it would just hang and time out). Guide to a broader name or manual coords.
  var hasCJK = /[一-鿿]/.test(query);
  if (hasCJK) {
    statusEl.innerHTML = '⚠️ ' + _L('没找到「', 'Couldn\'t find "') + escHtml(query) + _L('」。可改填上一级的市/县名，或点下方「手动输入经纬度」直接填坐标。', '". Try the parent city/county name, or use "Enter coordinates manually" below.');
    statusEl.className = 'geo-status error';
    var mBox = document.getElementById(prefix + '_manual');
    if (mBox) mBox.style.display = 'block';
    return;
  }

  // 4) Latin / overseas query → Nominatim (reachable outside the GFW, best global coverage)
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function() { ctrl.abort(); }, 8000);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=${(window._lang && window._lang() === 'en') ? 'en' : 'zh'}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'AstroChart/1.0' }, signal: ctrl.signal });
    clearTimeout(timer);
    const data = await resp.json();
    if (data.length === 0) throw new Error(_L('未找到该地点','Location not found'));

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    const displayName = data[0].display_name || query;

    document.getElementById(prefix + '_lat').value = lat.toFixed(4);
    document.getElementById(prefix + '_lng').value = lng.toFixed(4);

    const isChina = data[0].display_name && data[0].display_name.includes('中国');
    const estTz = isChina ? 8 : Math.round(lng / 15);
    const tzSelect2 = document.getElementById(prefix + '_tz');
    let found2 = false;
    for (let i = 0; i < tzSelect2.options.length; i++) {
      if (parseFloat(tzSelect2.options[i].value) === estTz) {
        tzSelect2.selectedIndex = i; found2 = true; break;
      }
    }
    if (!found2 && estTz === 8) tzSelect2.value = '8';

    const ns2 = lat >= 0 ? 'N' : 'S';
    const ew3 = lng >= 0 ? 'E' : 'W';
    const tzSign3 = estTz >= 0 ? '+' : '';
    statusEl.textContent = '✅ ' + displayName.split(',')[0] + ' · ' + Math.abs(lat).toFixed(2) + '°' + ns2 + ', ' + Math.abs(lng).toFixed(2) + '°' + ew3 + ' · UTC' + tzSign3 + estTz;
    statusEl.className = 'geo-status success';
  } catch (e) {
    var curLat = parseFloat(document.getElementById(prefix + '_lat').value);
    var curLng = parseFloat(document.getElementById(prefix + '_lng').value);
    if (!isNaN(curLat) && !isNaN(curLng)) {
      statusEl.textContent = prevText;
      statusEl.className = prevClass;
      return;
    }
    var errMsg = e.name === 'AbortError' ? _L('查询超时，请检查网络后重试','Request timed out. Please check your network and retry.') : (_L('查询失败','Lookup failed') + _L('：', ': ') + (e.message || ''));
    statusEl.textContent = '⚠️ ' + errMsg;
    statusEl.className = 'geo-status error';
    document.getElementById(prefix + '_manual').style.display = 'block';
  }
}

function applyCityResult(prefix, lat, lng, tz, displayName, statusEl) {
  document.getElementById(prefix + '_lat').value = lat.toFixed(4);
  document.getElementById(prefix + '_lng').value = lng.toFixed(4);
  var tzSelect = document.getElementById(prefix + '_tz');
  var found = false;
  for (var i = 0; i < tzSelect.options.length; i++) {
    if (parseFloat(tzSelect.options[i].value) === tz) { tzSelect.selectedIndex = i; found = true; break; }
  }
  if (!found) tzSelect.value = String(tz);
  if (displayName) {
    var ns = lat >= 0 ? 'N' : 'S';
    var ew = lng >= 0 ? 'E' : 'W';
    var tzSign = tz >= 0 ? '+' : '';
    statusEl.textContent = '✅ ' + displayName + ' · ' + Math.abs(lat).toFixed(2) + '°' + ns + ', ' + Math.abs(lng).toFixed(2) + '°' + ew + ' · UTC' + tzSign + tz;
  }
  statusEl.className = 'geo-status success';
}

function toggleP2() {
  const content = document.getElementById('p2Content');
  const icon = document.getElementById('p2ToggleIcon');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▼';
    if (window._fillPartnerRandom) window._fillPartnerRandom();  // 展开时随机填充对方数据
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
  }
}

function toggleManual(prefix) {
  var manual = document.getElementById(prefix + '_manual');
  if (!manual) return;
  var isVisible = manual.style.display === 'block';
  manual.style.display = isVisible ? 'none' : 'block';
  // Update toggle arrow text
  var toggles = document.querySelectorAll('.manual-toggle');
  for (var t = 0; t < toggles.length; t++) {
    var id = toggles[t].getAttribute('onclick') || '';
    if (id.indexOf("'" + prefix + "'") !== -1 || id.indexOf('"' + prefix + '"') !== -1) {
      toggles[t].textContent = isVisible ? _L('📍 手动输入经纬度 ▼','📍 Enter coords manually ▼') : _L('📍 手动输入经纬度 ▲','📍 Enter coords manually ▲');
    }
  }
}

function getInputValues(prefix) {
  const dateVal = document.getElementById(prefix + '_date').value;
  const timeVal = document.getElementById(prefix + '_time').value;
  const tzVal = parseFloat(document.getElementById(prefix + '_tz').value);
  // Manual entry takes priority, then auto-generated hidden fields
  var lat = parseFloat(document.getElementById(prefix + '_lat_m').value);
  var lng = parseFloat(document.getElementById(prefix + '_lng_m').value);
  if (isNaN(lat) || isNaN(lng)) {
    lat = parseFloat(document.getElementById(prefix + '_lat').value);
    lng = parseFloat(document.getElementById(prefix + '_lng').value);
  }

  // Fallback to p1 coordinates for p2 (most couples share a location)
  if (prefix === 'p2' && (isNaN(lat) || isNaN(lng)) && chartData1) {
    lat = _birthInput1 ? _birthInput1.lat : NaN;
    lng = _birthInput1 ? _birthInput1.lng : NaN;
  }

  if (!dateVal || !timeVal || isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) { alert(_L('纬度需在-90到90之间，经度需在-180到180之间','Latitude must be -90~90, longitude -180~180')); return null; }

  const [y, m, d] = dateVal.split('-').map(Number);
  const [hh, mm] = timeVal.split(':').map(Number);
  const localH = hh + mm / 60;
  const utcH = localH - tzVal;

  return { y, m, d, utcH, lat, lng };
}

// ── 记忆本人星盘：只存本机浏览器，不上传 ────────────────────────────
var MYCHART_KEY = 'lva_mychart_v1';

function _saveMyChart() {
  // 只在用户真正改过本人信息时才记忆；纯看随机示例不留痕迹
  if (!window._p1Edited) return;
  try {
    function v(id) { var el = document.getElementById(id); return el ? el.value : ''; }
    var addr = document.getElementById('p1_addr');
    var status = document.getElementById('p1_geo_status');
    var data = {
      date: v('p1_date'), time: v('p1_time'), tz: v('p1_tz'),
      addr: addr ? addr.value : '',
      cityCn: addr ? (addr.getAttribute('data-city-cn') || '') : '',
      cityEn: addr ? (addr.getAttribute('data-city-en') || '') : '',
      geoStatus: status ? status.textContent : '',
      lat: v('p1_lat'), lng: v('p1_lng'),
      latM: v('p1_lat_m'), lngM: v('p1_lng_m'),
      job: v('p1_job'), email: v('p1_email')
    };
    localStorage.setItem(MYCHART_KEY, JSON.stringify(data));
  } catch (e) { /* localStorage 不可用则静默跳过 */ }
}

function clearMyChart() {
  try { localStorage.removeItem(MYCHART_KEY); } catch (e) {}
  location.reload();
}


let chartData1 = null;
let chartData2 = null;
let _birthInput1 = null;

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
      phraseEl.textContent = _L('✦ 星盘已就绪✦','✦ Chart Ready✦');
      phraseEl.style.opacity = '1';
    }, 250);

    setTimeout(function() {
      if (_ritualCallback) _ritualCallback();
    }, 800);
  }

async function calculateAll() {
  try {
    const d1 = getInputValues('p1');
    if (!d1) { alert(_t('error.fillInfo')); return; }
    _saveMyChart();   // 记住本人星盘，下次打开免重填（仅存本机）

    // Show overlay and build progress ring
    const overlay = document.getElementById('ritualOverlay');
    overlay.style.display = 'flex';
    _buildProgressRing();

    // Lazy-load heavy modules while ritual animation plays
    if (!window._modulesLoaded) {
      try {
        await loadScript(DATA_JS);
        await Promise.all([
          loadScript('js/reports.js?v=20260715'),
          loadScript('js/tarot.js?v=20260712')
        ]);
        window._modulesLoaded = true;
      } catch(e) {
        overlay.style.display = 'none';
        alert(_L('模块加载失败，请刷新页面后重试。','Module loading failed. Please refresh and try again.'));
        console.error('Module load error:', e);
        return;
      }
    }

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
    setTimeout(async function() {
      try {
        chartData1 = computeChart(d1);
        _birthInput1 = d1;
        // 合盘对方为选填项：仅当用户主动展开对方卡片时才读取，
        // 避免浏览器自动填充等把空表当成已填、误跳到合盘缘分。
        var p2Open = document.getElementById('p2Content').style.display !== 'none';
        if (p2Open) {
          // Auto-geocode p2 if address filled but coordinates missing
          var p2AddrEl = document.getElementById('p2_addr');
          var p2LatRaw = parseFloat(document.getElementById('p2_lat').value);
          var p2LngRaw = parseFloat(document.getElementById('p2_lng').value);
          if (p2AddrEl && p2AddrEl.value.trim() && (isNaN(p2LatRaw) || isNaN(p2LngRaw))) {
            await geocode('p2');
          }
        }
        var d2 = p2Open ? getInputValues('p2') : null;
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

  // ═══ Special Day Reading — auto-detect ═══
  if (_birthInput1) {
    var specialDays = detectSpecialDays(_birthInput1.y, _birthInput1.m, _birthInput1.d, d.jd, d.positions);
    if (specialDays.length > 0) {
      html += '<div id="specialDayReading">';
      html += generateSpecialDayReading(d, _birthInput1, specialDays);
      html += '</div>';
    }
  }

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
  // Tarot tab: skip re-render if already has content (preserves card state)
  if (idx === 4) {
    if (!document.getElementById('tab4').innerHTML.trim()) renderTab4();
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
  card.style.opacity = '0';
  card.style.transition = 'opacity 0.3s';
  setTimeout(function() { card.style.display = 'none'; }, 300);
}

function showInputCard() {
  document.getElementById('resultsCard').style.display = 'none';
  var c = document.getElementById('inputCard');
  c.style.display = 'block';
  c.style.maxHeight = 'none';
  c.style.overflow = '';
  c.style.border = '';
  c.style.padding = '';
  c.style.marginBottom = '';
  c.style.opacity = '0';
  c.style.transition = 'opacity 0.35s ease';
  requestAnimationFrame(function() {
    c.style.opacity = '1';
    c.scrollIntoView({behavior: 'smooth'});
  });
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

  // Special day reading in PDF export
  if (_birthInput1) {
    var pdfSpecialDays = detectSpecialDays(_birthInput1.y, _birthInput1.m, _birthInput1.d, d.jd, d.positions);
    if (pdfSpecialDays.length > 0) {
      r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + _L('你的宇宙时钟','Your Cosmic Clock') + '</h3>';
      r += generateSpecialDayReading(d, _birthInput1, pdfSpecialDays);
    }
  }

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
    var isSyn = tarotState.mode === 'synastry';
    r += '<h3 style="border-bottom:1px solid #ccc;padding-bottom:6px;margin-top:24px;">✦ ' + (isSyn ? _L('合盘塔罗解读','Synastry Tarot Reading') : _L('塔罗占卜','Tarot Reading')) + '</h3>';
    r += '<p style="color:#666;">' + _L('问题：','Question: ') + (tarotState.question || (isSyn ? _L('关系指引','Relationship Guidance') : _L('综合运势','General Fortune'))) + '</p>';
    var posLabelsPdf;
    if (isSyn && typeof getSynastryPositionLabels === 'function') {
      posLabelsPdf = getSynastryPositionLabels(tarotState.spread);
    } else if (tarotState.spread === 'three') {
      posLabelsPdf = [_L('过去','Past'),_L('现在','Present'),_L('未来','Future')];
    } else {
      posLabelsPdf = [_L('指引','Guidance')];
    }
    for (let i = 0; i < tarotState.drawn.length; i++) {
      const card = tarotState.drawn[i];
      const posLabel = posLabelsPdf[i] || '';
      r += '<p><strong>' + posLabel + _L('：', ': ') + card.name + '</strong>' + (card.isReversed ? _L('（', ' (') + _L('逆位','Reversed') + _L('）', ')') : '') + '<br>';
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
    r += '<tr><td>' + p.name + '</td><td>' + getSignNamePure(si) + ' ' + dd + '°' + String(m).padStart(2,'0') + '′</td><td>' + _L('第','House ') + h + _L('宫','') + '</td><td>' + _L(ELEMENTS[si], ELEMENTS_EN[ELEMENTS[si]]) + '</td><td>' + _L(MODES[si], MODES_EN[MODES[si]]) + '</td></tr>';
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

function mailContact() {
  var user = 'lunarveilastro';
  var domain = 'outlook.com';
  var addr = user + '@' + domain;
  var subject = encodeURIComponent(_L('占星咨询', 'Astrology Consultation'));
  window.location.href = 'mailto:' + addr + '?subject=' + subject;
}

