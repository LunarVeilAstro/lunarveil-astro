// lodge.js — Spiritual lodge games (answer book, magic 8-ball, zodiac match)
// Depends on: astronomy.js (shuffle, escHtml), data.js
function openAnswerBook() {
  const answers = BOOK_ANSWERS();
  const answer = answers[Math.floor(Math.random() * answers.length)];
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
  const answers = BOOK_ANSWERS();
  return answers[Math.floor(Math.random() * answers.length)];
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
    const answers = BALL_ANSWERS();
    const answer = answers[Math.floor(Math.random() * answers.length)];
    win.textContent = answer;
    win.style.fontSize = answer.length > 6 ? '0.6em' : '0.7em';
  }, 500);
}

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

  const s1 = getZodiacSignName(i1);
  const s2 = getZodiacSignName(i2);
  let clr = score >= 80 ? '#7ab87a' : score >= 60 ? '#c9a96e' : '#c87070';
  let html = '<div class="match-score-ring" style="border-color:' + clr + ';color:' + clr + ';">' + score + '%</div>';
  html += '<div class="match-tagline">' + tagline + '</div>';
  html += '<div class="match-detail">' + s1 + ' × ' + s2 + '</div>';

  document.getElementById('matchResult').innerHTML = html;
}


