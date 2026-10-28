'use strict';
// Палыч: Продержись! — чистый canvas, без сборки.
(function () {
  var W = 360, H = 640, HOR = 170, PY = 500, PZ = .9;
  var Q = location.search;
  var wrap = document.getElementById('wrap'), cv = document.getElementById('c'), ctx = cv.getContext('2d');
  var $ = function (id) { return document.getElementById(id); };
  var FONT = '"Rubik","Trebuchet MS",Verdana,sans-serif';

  // ---------- отмазки (id = индекс) ----------
  var EXCUSES = [
    'Это не я, это ботинок сам пошёл. Я его просто сопровождал.',
    'Люд, я не пил. Я проводил дегустацию в интересах науки.',
    'Кум сказал: «Один глоток». Я человек вежливый, не отказываю куму.',
    'Это был не повод, а профилактика. Врач рекомендовал, просто не мне.',
    'Я в завязке. Просто сегодня пятница, а пятница в завязку не входит.',
    'С понедельника — точно. А сегодня вторник, подготовительный.',
    'Я считал дни, но сбился. Пришлось начать заново, так честнее.',
    'Не срыв, а техническая пауза. Сейчас перезагружусь.',
    'У соседа день рождения. Отказать человеку в праздник — это уже хамство.',
    'Я только понюхал. Нюхать не запрещено, Огурец подтвердит.',
    'Это не пиво, это хмелевой квас с самоуважением.',
    'Михалыч сказал: хорошо не будет. Я решил проверить, как будет весело.',
    'Люд, это социальный эксперимент: заметит ли жена перемены в муже.',
    'Меня ларёк сам позвал. Я с ним даже не здоровался.',
    'Я шёл чинить кран и по дороге заблудился в ларьке.',
    'Мне приснилось, что можно. Сон — вещь серьёзная, надо уважать.',
    'Это был рассол. Просто без огурцов и с градусами.',
    'Я не падал, я резко присел поближе к земле, чтобы послушать землю.',
    'Огурец не осуждает. Он молчит. Значит, разрешил.',
    'Бросил я, Люд, бросил. Просто чуть-чуть уронил обратно.',
    'Я тренировал силу воли. Сегодня она сдала экзамен на тройку.',
    'Лёха, ну я же не за рулём. Я вообще пешком и на бровях.',
    'Жизнь как рассол: мутная, но спасает. Вот я и спасался.',
    'Настя звонила, я так обрадовался, что отметил. Это ж радость, а не повод!',
    'Я бы удержался, но табличка «Пятница!» светилась так убедительно.',
    'Баба Зина всё равно всем расскажет, так хоть будет за что.',
    'Записываю, пока помню: сегодня не считается.',
    'Это не срыв, а плановое обнуление. Счётчик-то остался!',
    'Рука сама потянулась. Руки у меня золотые, им виднее.',
    'Я кота спрашивал: можно? Он зевнул. Я принял это за «да».'
  ];
  var LEGEND = [12, 22, 26], RARE = [0, 4, 7, 13, 17, 19, 23, 27];
  function rarity(i) { return LEGEND.indexOf(i) >= 0 ? 3 : (RARE.indexOf(i) >= 0 ? 2 : 1); }
  var RNAME = { 1: 'Обычная', 2: 'Редкая', 3: 'Легендарная' }, RCOL = { 1: '#7b8794', 2: '#2f7fe0', 3: '#e0a000' };

  // ---------- сохранение ----------
  var SAVE_KEY = 'palych_save_v2';
  var P = { best: 0, cuc: 0, up: { shield: 0, will: 0, magnet: 0 }, costumes: { bomzh: 1, classic: 1 }, costume: 'classic', v: 3, ex: {}, q: { date: '', id: '', p: 0, done: 0 }, tut: 0, runs: 0 };
  try {
    var raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (raw) { for (var k in raw) P[k] = raw[k]; }
    else P.best = parseInt(localStorage.getItem('palych_best') || '0', 10) || 0;
  } catch (e) {}
  // миграция старых сохранений (скины v2 -> костюмы v3): купленное не теряется
  if (P.skins || P.skin || !P.v || P.v < 3) {
    var oldMap = { stripes: 'tel', wedding: 'groom', boots: 'fish', mask: 'welder' };
    P.costumes = { bomzh: 1, classic: 1 };
    if (P.skins) for (var sk in P.skins) if (oldMap[sk]) P.costumes[oldMap[sk]] = 1;
    P.costume = (P.skin && oldMap[P.skin]) || 'classic'; delete P.skins; delete P.skin; P.v = 3;
  }
  // магнит убран (игра становилась бесконечной): возвращаем огурцы за купленные уровни
  if (P.up && P.up.magnet) { var mc = [40, 80, 150]; for (var ml0 = 0; ml0 < P.up.magnet; ml0++) P.cuc += mc[ml0]; P.up.magnet = 0; }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(P)); localStorage.setItem('palych_best', String(P.best)); } catch (e) {} }

  var SHIELD_T = [5, 6.5, 8, 10], WILL0 = [70, 80, 90, 100];
  var UPS = [
    { id: 'shield', name: 'Взгляд Огурца', desc: 'Щит кота держится дольше', cost: [30, 60, 120], eff: function (l) { return SHIELD_T[l] + ' с'; } },
    { id: 'will', name: 'Крепкая закалка', desc: 'Старт с большей силой воли', cost: [25, 50, 100], eff: function (l) { return WILL0[l] + '%'; } }
  ];
  var COSTUMES = [
    { id: 'bomzh', art: 1, name: 'Бомж', cost: 0, bonus: 'Находит лишнее: каждый 4-й огурец двойной', b: { cucx: 1 } },
    { id: 'classic', art: 1, name: 'Классика', cost: 0, bonus: 'Майка, треники, тапки. Без бонусов, зато родной', b: {} },
    { id: 'tel', art: 1, name: 'Тельняшка и кепка', cost: 60, bonus: '+10% силы воли на старте', b: { will: 10 } },
    { id: 'welder', art: 1, name: 'Сварщик', cost: 120, bonus: 'Щит Кота Огурца дольше на 1 с', b: { shield: 1 } },
    { id: 'fish', art: 1, name: 'Рыбак', cost: 200, bonus: 'Улов: каждый 3-й огурец двойной', b: { cucx: 1, cucN: 3 } },
    { id: 'dacha', art: 1, name: 'Дачник', cost: 320, bonus: 'Дела лечат силу воли сильнее (+8)', b: { heal: 8 } },
    { id: 'sport', art: 1, name: 'Спортсмен «С понедельника»', cost: 500, bonus: 'Прыжок выше и без паузы', b: { jumpH: 96, jumpCd: 0 } },
    { id: 'groom', art: 1, name: 'Жених', cost: 800, bonus: 'Near-miss даёт +3 дня', b: { near: 2 } },
    { id: 'deputy', art: 1, name: 'Депутат', cost: 1300, bonus: 'Связи: бонус ×2 от Зины длится 20 с', b: { x2: 20 } },
    { id: 'cosmo', art: 1, name: 'Космонавт', cost: 2000, bonus: 'Прыжок как на Луне, +15% силы воли', b: { jumpH: 130, jumpD: .85, will: 15 } }
  ];
  function costume() { for (var i = 0; i < COSTUMES.length; i++) if (COSTUMES[i].id === P.costume) return COSTUMES[i]; return COSTUMES[1]; }
  function cb() { return costume().b; }
  var TITLES = [[0, 'Новичок'], [7, 'Держится'], [30, 'Кремень'], [100, 'Легенда двора']];
  var MILES = [[7, 'Неделя!', 'Огурец впервые мурлыкнул.'], [30, 'Месяц!', 'Люда передала борщ без записки.'], [100, 'Сто дней!', 'Баба Зина лично пожала руку.'], [365, 'ГОД!', 'Лёха снял с учёта. Легенда двора!']];
  function titleOf(d) { var t = TITLES[0][1]; TITLES.forEach(function (x) { if (d >= x[0]) t = x[1]; }); return t; }
  var QUESTS = [
    { id: 'cuc50', t: 'Собери 50 огурцов', st: 'cuc', n: 50, r: 40 },
    { id: 'deeds8', t: 'Сделай 8 полезных дел', st: 'deeds', n: 8, r: 40 },
    { id: 'near5', t: 'Проскочи впритык 5 раз', st: 'near', n: 5, r: 35 },
    { id: 'zina2', t: 'Успокой Зину 2 раза', st: 'zina', n: 2, r: 50 },
    { id: 'noshield30', t: 'Продержись 30 дней без щита', st: 'noshield', n: 1, r: 60 },
    { id: 'days60', t: 'Набери 60 дней за один забег', st: 'days60', n: 1, r: 45 }
  ];
  var MON_PHRASES = ['С понедельника — точно!', 'Новая жизнь, версия 52.0!', 'Записываю, пока помню: начинаю с нуля.', 'Понедельник — день тяжёлый, но я тяжелее.'];
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var IS_MON = new Date().getDay() === 1 || /monday=1/.test(Q);
  function ensureQuest() {
    var t = todayStr();
    if (P.q.date !== t) {
      var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 9973;
      P.q = { date: t, id: QUESTS[h % QUESTS.length].id, p: 0, done: 0 }; save();
    }
    return QUESTS.filter(function (q) { return q.id === P.q.id; })[0];
  }

  // ---------- геометрия ----------
  function qOf(p) { return p > 0 ? Math.pow(p, 1.5) : 0; }
  function yOf(p) { return HOR + (PY - HOR) * qOf(p); }
  function sOf(p) { return 0.22 + 0.78 * qOf(p); }
  function laneW(p) { return 38 + 72 * qOf(p); }
  function laneX(l, p) { return W / 2 + (l - 1) * laneW(p); }

  // ---------- звук ----------
  var ac = null;
  function beep(f, d, type, vol, slide) {
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || 'square'; o.frequency.value = f;
      if (slide) o.frequency.linearRampToValueAtTime(slide, ac.currentTime + d);
      g.gain.value = vol || 0.05; g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
    } catch (e) {}
  }
  var sfx = {
    pick: function () { beep(660, .08, 'square', .04); setTimeout(function () { beep(990, .1, 'square', .04); }, 60); },
    bonus: function () { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { beep(f, .12, 'triangle', .07); }, i * 70); }); },
    cat: function () { beep(400, .35, 'sine', .08, 900); },
    hit: function () { beep(220, .5, 'sawtooth', .07, 60); },
    ouch: function () { beep(300, .25, 'sawtooth', .06, 120); },
    move: function () { beep(300, .04, 'triangle', .03); },
    jump: function () { beep(300, .18, 'triangle', .05, 700); },
    near: function () { beep(880, .15, 'sine', .06, 440); },
    zina: function () { beep(180, .5, 'sawtooth', .07, 330); setTimeout(function () { beep(200, .4, 'sawtooth', .07, 380); }, 300); },
    medal: function () { [659, 784, 988, 1319].forEach(function (f, i) { setTimeout(function () { beep(f, .2, 'triangle', .07); }, i * 110); }); }
  };

  // ---------- графические помощники ----------
  var OUT = '#2b1d14', SC = 3, SPR = {}, IMG = { cos: {} };
  function rrp(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function grad(c, x0, y0, x1, y1, a, b, m) { var g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); if (m) g.addColorStop(.5, m); g.addColorStop(1, b); return g; }
  function fs(c, fill, lw, col) { c.fillStyle = fill; c.fill(); c.lineWidth = lw || 2.5; c.strokeStyle = col || OUT; c.lineJoin = 'round'; c.stroke(); }
  function el(c, x, y, rx, ry, fill, lw) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); if (lw === 0) { c.fillStyle = fill; c.fill(); } else fs(c, fill, lw); }
  function soft(c, x, y, w, a) { c.save(); c.translate(x, y); c.scale(1, .3); var g = c.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, 'rgba(20,10,30,' + (a || .5) + ')'); g.addColorStop(1, 'rgba(20,10,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, w, 0, 7); c.fill(); c.restore(); }
  function tx(c, s, x, y, size, fill, stroke, wt) {
    c.font = (wt || 800) + ' ' + size + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (stroke) { c.lineWidth = Math.max(2, size / 4.5); c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = fill; c.fillText(s, x, y);
  }
  function mk(w, h, ox, oy, fn) {
    var cc = document.createElement('canvas'); cc.width = w * SC; cc.height = h * SC;
    var x = cc.getContext('2d'); x.scale(SC, SC); x.translate(ox, oy); fn(x); return { c: cc, w: w, h: h, ox: ox, oy: oy };
  }
  function put(sp, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(s, s);
    ctx.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
  }
  function glowBadge(c, cy) { var g = c.createRadialGradient(0, cy, 4, 0, cy, 34); g.addColorStop(0, 'rgba(255,240,170,.85)'); g.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, cy, 34, 0, 7); c.fill(); }
  function sparkle(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = i % 2 ? r * .3 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }

  // ---------- иконки ----------
  function bottle(c, x, y, col, lab) {
    rrp(c, x - 5, y - 22, 10, 22, 3); fs(c, grad(c, x - 5, 0, x + 5, 0, col[0], col[1]), 1.8);
    rrp(c, x - 2.5, y - 32, 5, 12, 2); fs(c, grad(c, x - 3, 0, x + 3, 0, col[0], col[1]), 1.8);
    if (lab) { c.fillStyle = '#f7efd0'; c.fillRect(x - 5, y - 15, 10, 8); }
    c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - 3, y - 20, 1.6, 14);
  }
  function iKiosk(c) {
    soft(c, 0, 2, 56);
    rrp(c, -42, -82, 84, 82, 5); fs(c, grad(c, -42, 0, 42, 0, '#f0d9a6', '#b8925a', '#ddc189'));
    rrp(c, -31, -62, 62, 38, 5); fs(c, grad(c, 0, -62, 0, -24, '#ffe9a0', '#e58a24'), 2.5);
    bottle(c, -18, -26, ['#3fae4f', '#1d6b2c'], 1); bottle(c, -2, -26, ['#e7a53a', '#9a5a10'], 1); bottle(c, 14, -26, ['#3fae4f', '#1d6b2c'], 1);
    rrp(c, -36, -26, 72, 9, 3); fs(c, grad(c, 0, -26, 0, -17, '#a8723c', '#6b4220'), 2);
    c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(30, -80, 11, 78);
    for (var k = 0; k < 6; k++) {
      c.beginPath(); c.moveTo(-45 + k * 15, -92); c.lineTo(-30 + k * 15, -92); c.lineTo(-30 + k * 15, -76); c.arc(-37.5 + k * 15, -76, 7.5, 0, Math.PI); c.closePath();
      fs(c, k % 2 ? '#fff6e2' : grad(c, 0, -92, 0, -70, '#ef4b4b', '#c42424'), 2);
    }
    rrp(c, -46, -122, 92, 30, 7); fs(c, grad(c, 0, -122, 0, -92, '#3a55b5', '#1c2c73'), 3);
    tx(c, 'ПИВО', 0, -106, 22, '#ffe066', '#3a1d00');
    c.fillStyle = '#ffe9a0'; [-38, -19, 0, 19, 38].forEach(function (x) { c.beginPath(); c.arc(x, -124, 2.2, 0, 7); c.fill(); });
  }
  function iKum(c) {
    soft(c, 0, 2, 38);
    rrp(c, -17, -46, 14, 46, 5); fs(c, grad(c, 0, -46, 0, 0, '#4a4f6a', '#2a2d40')); rrp(c, 3, -46, 14, 46, 5); fs(c, grad(c, 0, -46, 0, 0, '#4a4f6a', '#2a2d40'));
    rrp(c, -21, -6, 20, 9, 4); fs(c, '#2a1b12', 2); rrp(c, 1, -6, 20, 9, 4); fs(c, '#2a1b12', 2);
    // рука с бутылкой
    c.save(); c.translate(24, -88); c.rotate(-.55); rrp(c, -6, -2, 12, 34, 6); fs(c, grad(c, -6, 0, 6, 0, '#c04545', '#8c2626')); el(c, 0, -3, 7, 7, '#f0b497'); c.restore();
    c.save(); c.translate(38, -112); c.scale(1.35, 1.35); bottle(c, 0, 0, ['#46b957', '#1a6a2b'], 1); c.restore();
    // тело
    c.beginPath(); c.ellipse(0, -66, 27, 33, 0, 0, 7); fs(c, grad(c, -27, 0, 27, 0, '#d65050', '#8f2323', '#c23a3a'));
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -92); c.lineTo(0, -38); c.stroke();
    c.fillStyle = '#ffe08a'; [-76, -62, -48].forEach(function (y) { c.beginPath(); c.arc(0, y, 2.3, 0, 7); c.fill(); });
    c.save(); c.translate(-24, -88); c.rotate(.25); rrp(c, -6, -2, 12, 30, 6); fs(c, grad(c, -6, 0, 6, 0, '#c04545', '#8c2626')); el(c, 0, 29, 7, 7, '#f0b497'); c.restore();
    // голова
    el(c, 0, -108, 21, 20, grad(c, -20, -125, 20, -92, '#ffd2b4', '#e6a07f'));
    el(c, -3, -98, 8, 6, '#ee8a78', 1.8);
    // кепка
    c.beginPath(); c.arc(0, -118, 20, Math.PI, 0); c.closePath(); fs(c, grad(c, 0, -138, 0, -118, '#7a7f8e', '#4d515e'));
    rrp(c, -6, -121, 28, 6, 3); fs(c, '#3e414c', 2);
    // глаза, улыбка, усы
    el(c, -8, -112, 4.6, 5.4, '#fff', 1.6); el(c, 8, -112, 4.6, 5.4, '#fff', 1.6); el(c, -7, -111, 2, 2.6, '#222', 0); el(c, 9, -111, 2, 2.6, '#222', 0);
    c.beginPath(); c.moveTo(-6, -97); c.quadraticCurveTo(0, -88, 8, -97); c.lineWidth = 2.2; c.strokeStyle = OUT; c.stroke();
    c.beginPath(); c.moveTo(0, -100); c.quadraticCurveTo(-12, -104, -17, -97); c.quadraticCurveTo(-9, -96, 0, -96); c.quadraticCurveTo(9, -96, 17, -97); c.quadraticCurveTo(12, -104, 0, -100); fs(c, '#5a3a22', 1.6);
    // реплика
    rrp(c, -52, -168, 104, 22, 10); fs(c, '#fffdf2', 2.2); c.beginPath(); c.moveTo(-8, -146); c.lineTo(-2, -137); c.lineTo(4, -146); c.fillStyle = '#fffdf2'; c.fill();
    tx(c, 'ну по одной!', 0, -157, 13, '#7a1f1f', null, 800);
  }
  function iFriday(c) {
    soft(c, 0, 2, 38);
    rrp(c, -4, -90, 8, 90, 3); fs(c, grad(c, -4, 0, 4, 0, '#9aa3ad', '#555d66'), 2);
    rrp(c, -56, -148, 112, 66, 12); fs(c, grad(c, 0, -148, 0, -82, '#ffe770', '#f2a91c'), 4);
    rrp(c, -49, -141, 98, 52, 8); c.lineWidth = 2; c.strokeStyle = '#b8480f'; c.setLineDash([2, 6]); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
    tx(c, 'Пятница!', 0, -116, 25, '#e2281c', '#fff6c8');
    c.fillStyle = '#7ad94a'; c.beginPath(); c.moveTo(-50, -150); c.lineTo(-30, -158); c.lineTo(-24, -146); c.fill(); c.fillStyle = '#4aa3ff'; c.beginPath(); c.moveTo(50, -150); c.lineTo(30, -158); c.lineTo(24, -146); c.fill();
    bottle(c, 0, -90, ['#46b957', '#1a6a2b'], 0);
  }
  function iBday(c) {
    soft(c, 0, 2, 46);
    var cols = [['#ff6a5c', '#c52a1e'], ['#5bd06a', '#1f8f33'], ['#59a8ff', '#1c5fc0']];
    for (var q = 0; q < 3; q++) {
      var bx = -34 + q * 34, by = -112 + (q === 1 ? -8 : 0);
      c.strokeStyle = '#7a7a7a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-14 + q * 14, -52); c.quadraticCurveTo(bx, -80, bx, by + 14); c.stroke();
      c.beginPath(); c.ellipse(bx, by, 12, 15, 0, 0, 7); fs(c, grad(c, bx - 8, by - 12, bx + 8, by + 14, cols[q][0], cols[q][1]), 2);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(bx - 4, by - 6, 3, 5, -.4, 0, 7); c.fill();
    }
    rrp(c, -38, -36, 76, 36, 7); fs(c, grad(c, 0, -36, 0, 0, '#9a7ad6', '#5b3f9c'));
    rrp(c, -30, -56, 60, 26, 7); fs(c, grad(c, 0, -56, 0, -30, '#fff0f6', '#f7b6d0'));
    c.fillStyle = '#e0497f'; for (var i = 0; i < 6; i++) { c.beginPath(); c.arc(-25 + i * 10, -30, 4.5, 0, Math.PI); c.fill(); }
    [-14, 0, 14].forEach(function (x, i) { rrp(c, x - 2, -70, 4, 14, 1); fs(c, ['#ffd84a', '#59a8ff', '#ff6a5c'][i], 1.4); el(c, x, -74, 3, 5, grad(c, 0, -79, 0, -69, '#fff3a0', '#ff7a1a'), 0); });
    rrp(c, -33, -22, 66, 15, 5); fs(c, grad(c, 0, -22, 0, -7, '#ffd84a', '#e0a010'), 2);
    tx(c, 'ДР у соседа', 0, -14.5, 11.5, '#5a2d00', null, 800);
  }
  function iCuc(c) {
    soft(c, 0, 0, 20, .35); glowBadge(c, -30);
    c.save(); c.translate(0, -30); c.rotate(-.5);
    rrp(c, -10, -23, 20, 46, 10); fs(c, grad(c, -10, 0, 10, 0, '#8be04a', '#2f8a1c', '#55b92c'), 2.6);
    c.fillStyle = '#2a7016'; for (var d = -17; d < 18; d += 8) { el(c, -5, d, 1.3, 1.3, '#2a7016', 0); el(c, 5, d + 4, 1.3, 1.3, '#2a7016', 0); }
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-4.5, -6, 2.2, 11, 0, 0, 7); c.fill();
    rrp(c, -3, -28, 6, 6, 2); fs(c, '#6b8f2c', 1.8);
    c.restore(); sparkle(c, 16, -52, 5, '#fff7b0');
  }
  function iWrench(c) {
    soft(c, 0, 0, 20, .35); glowBadge(c, -30);
    c.save(); c.translate(0, -30); c.rotate(.75);
    c.beginPath(); c.moveTo(-5, 4); c.lineTo(-5, 26); c.arc(0, 26, 5, Math.PI, 0); c.lineTo(5, 4); c.closePath(); fs(c, grad(c, -5, 0, 5, 0, '#e8eef2', '#7d8b95', '#b6c3cb'), 2.4);
    c.beginPath(); c.moveTo(-6, 6); c.lineTo(-13, -4); c.lineTo(-12, -20); c.lineTo(-5, -26); c.lineTo(-3, -14); c.lineTo(3, -14); c.lineTo(5, -26); c.lineTo(12, -20); c.lineTo(13, -4); c.lineTo(6, 6); c.closePath();
    fs(c, grad(c, -13, 0, 13, 0, '#f4f8fa', '#7d8b95', '#c4d0d7'), 2.4);
    c.restore(); sparkle(c, -16, -52, 5, '#fff7b0');
    tx(c, '+3', 18, -6, 11, '#ffe066', '#3a1d00');
  }
  function iPhone(c) {
    soft(c, 0, 0, 20, .35); glowBadge(c, -30);
    c.save(); c.translate(0, -30); c.rotate(.12);
    rrp(c, -13, -24, 26, 48, 6); fs(c, grad(c, -13, 0, 13, 0, '#4a5560', '#1c232a'), 2.6);
    rrp(c, -10, -20, 20, 38, 3); fs(c, grad(c, 0, -20, 0, 18, '#ffb3d0', '#ff5a8a'), 1.4);
    c.fillStyle = '#fff'; c.font = '800 15px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥', 0, -8);
    el(c, 0, 8, 5.5, 5.5, '#4cd964', 1.6); c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 8, 2.2, .3, 3.4); c.stroke();
    c.restore(); sparkle(c, 16, -52, 5, '#fff7b0');
    tx(c, '+5', -18, -6, 11, '#ffe066', '#3a1d00');
  }
  function iCucSmall(c) { c.save(); c.translate(0, 28); iCuc(c); c.restore(); }

  // ---------- Зина (рисованная) ----------
  function drawZina(x, y, s, t, swing) {
    // Зина гонится сзади: мы видим её спину
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    var b = Math.sin(t * 9) * 3;
    // ноги в тапках
    [-22, 22].forEach(function (lx, i) { var k = Math.sin(t * 9 + i * Math.PI) * 6; rrp(ctx, lx - 11, -6 + k, 22, 44, 8); fs(ctx, '#e8b99c', 3); el(ctx, lx, 40 + k, 17, 8, '#7a4a8c', 2.5); });
    // халат сзади
    ctx.beginPath(); ctx.moveTo(-72, 4); ctx.quadraticCurveTo(-84, -120, -44, -150 + b); ctx.lineTo(44, -150 + b); ctx.quadraticCurveTo(84, -120, 72, 4); ctx.closePath();
    fs(ctx, grad(ctx, -72, 0, 72, 0, '#9a6fc6', '#5e3a8a', '#8a58b8'), 3.5);
    ctx.fillStyle = 'rgba(255,220,240,.85)'; [[-40, -60], [-20, -100], [30, -70], [48, -110], [0, -40], [-55, -110], [14, -125], [-30, -25], [40, -30]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, 7); ctx.fill(); });
    ctx.strokeStyle = 'rgba(40,10,60,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -148 + b); ctx.lineTo(0, -4); ctx.stroke();
    // пояс с бантом
    rrp(ctx, -50, -78, 100, 10, 4); fs(ctx, '#ffd84a', 2.5); ctx.beginPath(); ctx.moveTo(0, -73); ctx.lineTo(-18, -88); ctx.lineTo(-18, -60); ctx.closePath(); fs(ctx, '#ffd84a', 2); ctx.beginPath(); ctx.moveTo(0, -73); ctx.lineTo(18, -88); ctx.lineTo(18, -60); ctx.closePath(); fs(ctx, '#ffd84a', 2);
    // левая рука на боку
    ctx.save(); ctx.translate(-62, -122 + b); ctx.rotate(.5); rrp(ctx, -11, 0, 22, 62, 11); fs(ctx, '#8458b3', 3); el(ctx, 0, 64, 10, 10, '#f3b79a', 2.5); ctx.restore();
    // шея и голова со спины
    el(ctx, 0, -150 + b, 17, 13, '#e8a584', 3);
    el(ctx, -41, -188 + b, 7, 10, '#f0b497', 2.5); el(ctx, 41, -188 + b, 7, 10, '#f0b497', 2.5);
    el(ctx, 0, -190 + b, 42, 40, grad(ctx, -40, -230, 40, -150, '#d4cfdc', '#9d97ab'), 3.5);
    ctx.fillStyle = '#b9b3c4'; [[-36, -170], [-22, -156], [0, -152], [22, -156], [36, -170]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1] + b, 11, 0, 7); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke(); });
    // косынка и узел
    ctx.beginPath(); ctx.moveTo(-43, -185 + b); ctx.quadraticCurveTo(0, -246 + b, 43, -185 + b); ctx.quadraticCurveTo(0, -170 + b, -43, -185 + b); fs(ctx, grad(ctx, 0, -246, 0, -170, '#ff6a5c', '#c4281e'), 3);
    ctx.fillStyle = '#ffe9e0'; [[-22, -200], [8, -214], [26, -194], [-6, -184]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1] + b, 3.2, 0, 7); ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(0, -176 + b); ctx.lineTo(-16, -158 + b); ctx.lineTo(-4, -154 + b); ctx.closePath(); fs(ctx, '#d9382a', 2.5); ctx.beginPath(); ctx.moveTo(0, -176 + b); ctx.lineTo(16, -158 + b); ctx.lineTo(4, -154 + b); ctx.closePath(); fs(ctx, '#d9382a', 2.5);
    // правая рука поднята вверх-вбок, скалка в кулаке над головой
    ctx.save(); ctx.translate(58, -136 + b); ctx.rotate(Math.PI + .55 + Math.sin(t * 8) * .3 + (swing || 0)); rrp(ctx, -11, 0, 22, 60, 11); fs(ctx, '#8458b3', 3);
    ctx.translate(0, 62); ctx.rotate(-1.15);
    rrp(ctx, -9, -44, 18, 88, 9); fs(ctx, grad(ctx, -9, 0, 9, 0, '#e9c58a', '#a8743c', '#d4a35e'), 3); rrp(ctx, -4, -60, 8, 18, 4); fs(ctx, '#a8743c', 2.5); rrp(ctx, -4, 42, 8, 18, 4); fs(ctx, '#a8743c', 2.5);
    el(ctx, 0, 0, 12, 12, '#f3b79a', 2.5);
    ctx.restore();
    // реплика
    ctx.save(); ctx.translate(-70, -262 + b); rrp(ctx, -50, -16, 100, 32, 12); fs(ctx, '#fffdf2', 2.5); ctx.beginPath(); ctx.moveTo(20, 15); ctx.lineTo(34, 30); ctx.lineTo(36, 14); ctx.fillStyle = '#fffdf2'; ctx.fill(); tx(ctx, 'ПАЛЫЧ!!', 0, 0, 20, '#c1121f', null, 900); ctx.restore();
    ctx.restore();
  }

  // ---------- декорации ----------
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function iHouse(c, v) {
    var pal = [['#f1d8b0', '#c79a68'], ['#e9b9a0', '#b9755a'], ['#cdd3dc', '#8f9bb0']][v], fl = [5, 4, 5][v], w = 62, h = fl * 44 + 14;
    soft(c, 0, 2, 78, .45);
    rrp(c, -w, -h, w * 2, h, 3); fs(c, grad(c, -w, 0, w, 0, pal[1], pal[0], pal[0]), 2.5);
    c.fillStyle = 'rgba(60,20,60,.18)'; c.fillRect(-w, -h, 14, h);
    c.strokeStyle = 'rgba(80,50,30,.25)'; c.lineWidth = 1; for (var s = 1; s < 4; s++) { c.beginPath(); c.moveTo(-w + s * w / 2, -h); c.lineTo(-w + s * w / 2, 0); c.stroke(); }
    for (var y = 1; y < fl; y++) { c.beginPath(); c.moveTo(-w, -y * 44 - 14); c.lineTo(w, -y * 44 - 14); c.stroke(); }
    rrp(c, -w - 4, -h - 9, w * 2 + 8, 11, 3); fs(c, grad(c, 0, -h - 9, 0, -h + 2, '#6b5560', '#40303a'), 2.5);
    for (var r = 0; r < fl; r++) for (var q = 0; q < 4; q++) {
      var wx = -w + 9 + q * 31, wy = -h + 12 + r * 44, lit = rnd() < .62;
      rrp(c, wx, wy, 22, 28, 2); fs(c, lit ? grad(c, 0, wy, 0, wy + 28, '#fff2a8', '#ffa93a') : grad(c, 0, wy, 0, wy + 28, '#6a8bb5', '#33466b'), 1.8, '#f7f1e6');
      c.strokeStyle = '#f7f1e6'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(wx + 11, wy); c.lineTo(wx + 11, wy + 28); c.stroke();
      if (lit && rnd() < .5) { c.fillStyle = 'rgba(210,70,70,.55)'; c.fillRect(wx + 2, wy + 2, 6, 14); }
      if (rnd() < .22) { rrp(c, wx - 3, wy + 24, 28, 7, 1.5); fs(c, '#7a8088', 1.4); }
    }
    rrp(c, -12, -34, 24, 34, 3); fs(c, grad(c, -12, 0, 12, 0, '#7a4a26', '#4a2a12'), 2.2);
    rrp(c, -18, -40, 36, 8, 2); fs(c, '#5a4a55', 2);
  }
  function iTree(c, v) {
    soft(c, 0, 2, 40, .45);
    rrp(c, -5, -52, 10, 52, 3); fs(c, grad(c, -5, 0, 5, 0, '#8a5a30', '#4e2f16'), 2);
    var blobs = v ? [[0, -84, 30], [-22, -66, 22], [22, -68, 22], [-8, -108, 22], [12, -100, 20]] : [[0, -80, 32], [-24, -64, 24], [24, -62, 24], [0, -104, 24]];
    blobs.forEach(function (b) { var g = c.createRadialGradient(b[0] + 8, b[1] - 8, 3, b[0], b[1], b[2]); g.addColorStop(0, v ? '#e5c24a' : '#a6d85a'); g.addColorStop(1, v ? '#a8741c' : '#2f7a2a'); c.fillStyle = g; c.beginPath(); c.arc(b[0], b[1], b[2], 0, 7); c.fill(); });
    c.strokeStyle = 'rgba(20,50,20,.35)'; c.lineWidth = 2; blobs.forEach(function (b) { c.beginPath(); c.arc(b[0], b[1], b[2], .4, 2.4); c.stroke(); });
  }
  function iLamp(c) {
    soft(c, 0, 2, 12, .4);
    rrp(c, -3, -112, 6, 112, 2); fs(c, grad(c, -3, 0, 3, 0, '#5a6068', '#2c3036'), 1.6);
    c.beginPath(); c.moveTo(0, -112); c.quadraticCurveTo(0, -126, -16, -124); c.lineWidth = 4; c.strokeStyle = '#3a3f46'; c.stroke();
    c.beginPath(); c.ellipse(-18, -122, 9, 5, 0, 0, 7); fs(c, '#fff2b0', 2);
  }
  function iBush(c) { soft(c, 0, 2, 30, .4); [[-14, -12, 14], [4, -16, 17], [20, -10, 12]].forEach(function (b) { var g = c.createRadialGradient(b[0] + 4, b[1] - 5, 2, b[0], b[1], b[2]); g.addColorStop(0, '#9ccf52'); g.addColorStop(1, '#2d6e28'); c.fillStyle = g; c.beginPath(); c.arc(b[0], b[1], b[2], 0, 7); c.fill(); }); }

  function buildFar() {
    var cs = 2, cw = 520;
    function layer(h, fn) { var c = document.createElement('canvas'); c.width = cw * cs; c.height = h * cs; var x = c.getContext('2d'); x.scale(cs, cs); fn(x); return { c: c, w: cw, h: h }; }
    SPR.sky = layer(HOR + 10, function (c) {
      var g = c.createLinearGradient(0, 0, 0, HOR + 10);
      g.addColorStop(0, '#3a3b85'); g.addColorStop(.35, '#8f5aa0'); g.addColorStop(.62, '#ee7f6c'); g.addColorStop(.86, '#ffbd7a'); g.addColorStop(1, '#ffdca4');
      c.fillStyle = g; c.fillRect(0, 0, cw, HOR + 10);
      var s = c.createRadialGradient(330, HOR - 10, 4, 330, HOR - 10, 130); s.addColorStop(0, 'rgba(255,250,200,1)'); s.addColorStop(.25, 'rgba(255,224,150,.8)'); s.addColorStop(1, 'rgba(255,170,100,0)');
      c.fillStyle = s; c.fillRect(0, 0, cw, HOR + 10);
      c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(330, HOR - 10, 22, 0, 7); c.fill();
    });
    SPR.far1 = layer(HOR + 4, function (c) {
      seed = 11; for (var x = 0; x < cw; x += 34) { var hh = 60 + rnd() * 70; c.fillStyle = 'rgba(120,80,140,.88)'; c.fillRect(x, HOR - hh, 36, hh + 4);
        c.fillStyle = 'rgba(255,214,140,.7)'; for (var y = HOR - hh + 8; y < HOR - 6; y += 13) for (var xx = x + 5; xx < x + 31; xx += 9) if (rnd() < .45) c.fillRect(xx, y, 4, 6); }
    });
    SPR.far2 = layer(HOR + 4, function (c) {
      seed = 5; for (var x = -10; x < cw; x += 78) { var hh = 52 + rnd() * 26; var g = c.createLinearGradient(x, 0, x + 70, 0); g.addColorStop(0, '#b7766f'); g.addColorStop(1, '#8c5360');
        c.fillStyle = g; c.fillRect(x, HOR - hh, 70, hh + 4); c.fillStyle = '#5c3a4c'; c.fillRect(x - 2, HOR - hh - 4, 74, 6);
        for (var y = HOR - hh + 9; y < HOR - 6; y += 15) for (var xx = x + 6; xx < x + 64; xx += 15) { c.fillStyle = rnd() < .6 ? '#ffd27a' : '#4a3a5e'; c.fillRect(xx, y, 8, 9); } }
    });
  }
  function buildSprites() {
    SPR.kiosk = mk(140, 160, 70, 150, iKiosk); SPR.kum = mk(150, 190, 75, 180, iKum); SPR.friday = mk(140, 170, 70, 160, iFriday); SPR.bday = mk(130, 150, 65, 140, iBday);
    SPR.cuc = mk(70, 80, 35, 70, iCuc); SPR.wrench = mk(70, 80, 35, 70, iWrench); SPR.phone = mk(70, 80, 35, 70, iPhone); SPR.cucS = mk(30, 40, 15, 30, function (c) { c.scale(.5, .5); c.translate(0, 30); iCuc(c); });
    seed = 3; SPR.house = [0, 1, 2].map(function (v) { return mk(180, 250, 90, 240, function (c) { iHouse(c, v); }); });
    SPR.tree = [0, 1].map(function (v) { return mk(120, 150, 60, 140, function (c) { iTree(c, v); }); });
    SPR.lamp = mk(60, 140, 30, 130, iLamp); SPR.bush = mk(80, 50, 40, 44, iBush);
    buildFar();
  }

  // ---------- состояние ----------
  var S = {}, OBST = ['kiosk', 'kum', 'friday', 'bday'], JUMPABLE = { bday: 1 };
  var overAt = 0, last = 0, tipTimer = null;
  function monMult() { return IS_MON ? 2 : 1; }
  function newRun(mode) {
    S = {
      mode: mode, t: 0, lane: 1, laneF: 1, speed: 1, dayAcc: 0, bonus: 0, days: 0, cuc: 0, deeds: 0, near: 0, zinaOK: 0,
      will: Math.min(100, WILL0[P.up.will] + (cb().will || 0)), objs: [], scen: [], parts: [], texts: [], spawnT: .6, shield: 0, shieldMax: 5, usedShield: false,
      offs: 0, scenT: 0, shake: 0, flash: 0, dieT: 0, stepT: 0, inv: 0, jumpT: -1, jumpH: 0, jumpCd: 0, squash: 0, stagger: 0,
      slow: 0, nearCd: 0, zina: null, zinaNext: 22, x2: 0, ms: {}, ban: null, hurt: 0, lastMove: -9, prevLane: 1, tut: 0, rt: 0, moved: false
    };
    for (var i = 0; i < 9; i++) addScen(Math.random() * 1.2, true);
  }
  function addScen(z, init) {
    var side = Math.random() < .5 ? -1 : 1, r = Math.random();
    var type = r < .38 ? 'house' : (r < .65 ? 'tree' : (r < .85 ? 'lamp' : 'bush'));
    S.scen.push({ z: z, side: side, type: type, v: Math.floor(Math.random() * 3), tv: Math.floor(Math.random() * 2), w: Math.random() });
  }
  function mult() { return (S.x2 > 0 ? 2 : 1) * monMult(); }
  function curDays() { return Math.floor(S.dayAcc + S.bonus); }
  function dayWord(n) { return n % 10 === 1 && n % 100 !== 11 ? 'день' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'дня' : 'дней'); }
  function addText(s, lane, col, big) {
    for (var i = 0; i < S.texts.length; i++) if (S.texts[i].s === s) return;
    if (S.texts.length >= 2) S.texts.shift();
    S.texts.push({ s: s, x: Math.max(110, Math.min(250, laneX(lane, PZ))), y: 430, life: 1.0, color: col || '#fff', big: big });
  }
  function addDays(n, why) { S.bonus += n * mult(); addText('+' + n * mult() + ' ' + dayWord(n * mult()) + ' · ' + why, S.lane, '#ffe66a'); }
  function burst(x, y, col, n, kind) {
    for (var i = 0; i < n; i++) S.parts.push({ x: x, y: y, vx: (Math.random() - .5) * 260, vy: -Math.random() * 240 - 40, life: .6 + Math.random() * .5, max: 1.1, col: col, r: 2 + Math.random() * 3.5, star: kind === 'star' || Math.random() < .3 });
  }
  function banner(title, sub, kind) { S.ban = { title: title, sub: sub, life: 1.9, kind: kind || 'medal' }; }
  function heal(n) { S.will = Math.min(100, S.will + n); }

  function spawn() {
    var nObst = S.t < 8 ? 1 : (Math.random() < Math.min(.55, .15 + S.t / 120) ? 2 : 1), i;
    var lanes = [0, 1, 2].sort(function () { return Math.random() - .5; });
    for (i = 0; i < nObst; i++) S.objs.push({ kind: OBST[Math.floor(Math.random() * 4)], obst: true, lane: lanes[i], lx: lanes[i], z: 0, hit: false });
    var free = lanes.slice(nObst), chase = !!S.zina;
    if (free.length && (chase || Math.random() < .85)) {
      var r = Math.random(), kind;
      if (chase && Math.random() < .7) kind = Math.random() < .5 ? 'wrench' : 'phone';
      else if (r < .07 && S.shield <= 0) kind = 'cat';
      else if (r < .22) kind = 'wrench'; else if (r < .34) kind = 'phone'; else kind = 'cuc';
      var n = kind === 'cuc' ? 3 : 1;
      for (i = 0; i < n; i++) S.objs.push({ kind: kind, obst: false, lane: free[0], lx: free[0], z: -i * .07, got: false });
    }
  }

  function startRun() {
    hideAll(); newRun('play'); sfx.bonus();
    S.shieldMax = SHIELD_T[P.up.shield] + (cb().shield || 0);
    if (IS_MON) banner('Новая жизнь!', MON_PHRASES[Math.floor(Math.random() * MON_PHRASES.length)] + ' · ×2 дней', 'mon');
    if (!P.tut) { S.tut = 1; }
  }
  function hurt(n, why) {
    S.will -= n; S.inv = 1.3; S.shake = .35; S.flash = .25; S.hurt = .9; S.stagger = .7; S.squash = .18; sfx.ouch();
    addText(why || ('−' + n + ' силы воли'), S.lane, '#ff8a7a', true);
    if (S.will <= 0) { S.will = 0; fail(); }
  }
  function fail() {
    S.mode = 'dead'; S.dieT = 0; S.shake = .5; S.flash = .4; sfx.hit();
    var n = curDays(); S.finalDays = n; S.isNew = n > P.best; if (S.isNew) P.best = n;
    // отмазка
    var r = Math.random(), rar = r < .06 ? 3 : (r < .3 ? 2 : 1), pool = [];
    EXCUSES.forEach(function (e, i) { if (rarity(i) === rar) pool.push(i); });
    S.exId = pool[Math.floor(Math.random() * pool.length)]; S.exNew = !P.ex[S.exId]; P.ex[S.exId] = (P.ex[S.exId] || 0) + 1;
    // кошелёк и задание
    P.cuc += S.cuc; P.runs++; S.qMsg = '';
    var q = ensureQuest(), add = 0;
    if (q.st === 'noshield') add = (n >= 30 && !S.usedShield) ? 1 : 0; else if (q.st === 'days60') add = n >= 60 ? 1 : 0;
    else add = { cuc: S.cuc, deeds: S.deeds, near: S.near, zina: S.zinaOK }[q.st] || 0;
    if (!P.q.done) { P.q.p = Math.min(q.n, P.q.p + add); if (P.q.p >= q.n) { P.q.done = 1; P.cuc += q.r; S.qMsg = 'Задание выполнено! +' + q.r + ' огурцов'; } }
    save();
    setTimeout(showOver, 900);
  }

  // ---------- управление ----------
  function move(d) {
    if (S.mode !== 'play') return;
    var nl = Math.max(0, Math.min(2, S.lane + d));
    if (nl === S.lane) return;
    var old = S.lane; S.lane = nl; S.moved = true; sfx.move(); S.lastMove = S.t;
    // near-miss: ушёл из полосы прямо перед соблазном
    if (S.nearCd <= 0) for (var i = 0; i < S.objs.length; i++) {
      var o = S.objs[i];
      if (o.obst && !o.fly && o.lane === old && o.z > .62 && o.z < .84) { nearMiss(o); break; }
    }
  }
  function nearMiss(o) {
    S.nearCd = 1.2; S.slow = .55; S.near++; S.bonus += 1 + (cb().near || 0);
    addText('Ох, чуть не… +' + (1 + (cb().near || 0)), S.lane, '#fff08a', true); sfx.near();
    heal(3);
  }
  function jump() {
    if (S.mode !== 'play' || S.jumpT >= 0 || S.jumpCd > 0) return;
    S.jumpT = 0; S.squash = -.12; S.moved = true; sfx.jump();
  }
  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { move(-1); e.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { move(1); e.preventDefault(); }
    else if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') { jump(); if (S.mode === 'play') e.preventDefault(); }
    if (k === 'Enter' || (k === ' ' && S.mode !== 'play')) {
      if (S.mode === 'menu' && $('start').classList.contains('show')) startRun(); else if (S.mode === 'over' && $('over').classList.contains('show') && Date.now() - overAt > 400) startRun();
      e.preventDefault();
    }
  });
  var tx0 = 0, ty0 = 0, tdown = false;
  wrap.addEventListener('pointerdown', function (e) { tdown = true; tx0 = e.clientX; ty0 = e.clientY; });
  wrap.addEventListener('pointerup', function (e) {
    if (!tdown) return; tdown = false; if (S.mode !== 'play') return;
    var dx = e.clientX - tx0, dy = e.clientY - ty0;
    if (dy < -34 && Math.abs(dy) > Math.abs(dx)) jump();
    else if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1);
    else if (Math.abs(dx) < 20 && Math.abs(dy) < 20) { var r = wrap.getBoundingClientRect(); move(e.clientX < r.left + r.width / 2 ? -1 : 1); }
  });
  wrap.addEventListener('touchmove', function (e) { if (!e.target.closest('.scroll')) e.preventDefault(); }, { passive: false });
  document.addEventListener('visibilitychange', function () { last = 0; });

  // ---------- обновление ----------
  function update(dtr) {
    var dt = dtr;
    if (S.slow > 0) { S.slow -= dtr; dt = dtr * .4; }
    S.rt += dtr;
    var i, o, play = S.mode === 'play';
    if (play || S.mode === 'dead') S.t += dt;
    if (S.mode === 'dead') S.dieT += dtr;
    var sp = play ? S.speed : (S.mode === 'dead' ? Math.max(0, S.speed * (1 - S.dieT * 2)) : (S.mode === 'menu' ? .35 : .1));
    if (play) S.speed = Math.min(2.6, 1 + S.t * 0.012);
    S.offs += dt * sp * .9;
    S.laneF += (S.lane - S.laneF) * Math.min(1, dtr * 16);
    S.shake = Math.max(0, S.shake - dtr); S.flash = Math.max(0, S.flash - dtr); S.hurt = Math.max(0, S.hurt - dtr); S.stagger = Math.max(0, S.stagger - dtr);
    S.inv = Math.max(0, S.inv - dt); S.nearCd = Math.max(0, S.nearCd - dtr); S.jumpCd = Math.max(0, S.jumpCd - dtr);
    S.squash += (0 - S.squash) * Math.min(1, dtr * 11);
    S.stepT += dt * (6 + sp * 4);
    if (S.jumpT >= 0) { S.jumpT += dt; var jd = cb().jumpD || .62; if (S.jumpT >= jd) { S.jumpT = -1; S.jumpH = 0; S.squash = .16; S.jumpCd = cb().jumpCd !== undefined ? cb().jumpCd : .15; } else S.jumpH = (cb().jumpH || 78) * Math.sin(Math.PI * S.jumpT / jd); }
    if (play) {
      S.dayAcc += dt * 1.2 * mult(); S.x2 = Math.max(0, S.x2 - dt);
      S.spawnT -= dt; if (S.spawnT <= 0) { spawn(); S.spawnT = Math.max(.55, 1.25 - S.t * .008) / Math.sqrt(S.speed); }
      S.shield = Math.max(0, S.shield - dt);
      // Зина
      if (!S.zina && S.t >= S.zinaNext && S.shield <= 0 && S.t > 5) { S.zina = { left: 11, need: 3, got: 0, t: 0 }; sfx.zina(); S.shake = .3; banner('ПАЛЫЧ!', 'Собери 3 полезных дела, пока Зина не догнала!', 'zina'); }
      if (S.zina) {
        S.zina.t += dt; S.zina.left -= dt;
        if (S.zina.got >= S.zina.need) { S.zina = null; S.x2 = cb().x2 || 10; S.zinaOK++; S.zinaNext = S.t + 26 + Math.random() * 10; heal(15); banner('Зина смягчилась', 'Бонус ×2 дней на 10 секунд', 'good'); sfx.bonus(); }
        else if (S.zina.left <= 0) { S.zina = null; S.zinaNext = S.t + 26 + Math.random() * 10; S.fail = false; hurt(25, 'Зина догнала! −25'); }
      }
      // вехи
      MILES.forEach(function (m) { if (!S.ms[m[0]] && curDays() >= m[0]) { S.ms[m[0]] = 1; banner(m[1] + ' · ' + titleOf(m[0]), m[2], 'medal'); sfx.medal(); heal(20); } });
      S.days = curDays();
      tutorial();
    }
    S.scenT -= dt * sp; if (S.scenT <= 0) { addScen(0); S.scenT = .2; }
    for (i = S.scen.length - 1; i >= 0; i--) { S.scen[i].z += dt * sp * .45; if (S.scen[i].z > 1.45) S.scen.splice(i, 1); }
    for (i = S.objs.length - 1; i >= 0; i--) {
      o = S.objs[i];
      if (o.fly) { o.fx += o.vx * dt; o.fy += o.vy * dt; o.vy += 600 * dt; o.rot += dt * 10; o.life -= dt; if (o.life <= 0) S.objs.splice(i, 1); continue; }
      o.z += dt * sp * .45;
      if (o.lx !== undefined) o.lx += (o.lane - o.lx) * Math.min(1, dt * 9);
      if (play && o.z > .82 && o.z < 1.02 && o.lane === S.lane && !o.hit && !o.got) {
        var px = laneX(S.lane, PZ), py = yOf(PZ) - 70;
        if (o.obst) {
          if (JUMPABLE[o.kind] && S.jumpH > 22) { o.hit = true; if (S.nearCd <= 0) nearMiss(o); }
          else if (S.shield > 0) { launch(o); S.bonus += 1; addText('+1 · Огурец смотрит!', S.lane, '#ffb36a'); sfx.near(); }
          else if (S.inv > 0) { /* неуязвимость после удара */ }
          else { launch(o); hurt(30); }
        } else {
          o.got = true;
          if (o.kind === 'cuc') { S.cuc++; if (cb().cucx && S.cuc % (cb().cucN || 4) === 0) S.cuc++; heal(2); burst(px, py, '#7ee04a', 10); sfx.pick(); if (S.cuc % 5 === 0) addDays(1, 'пять огурцов'); }
          else if (o.kind === 'wrench') { S.deeds++; addDays(3, 'починил кран'); heal(15 + (cb().heal || 0)); burst(px, py, '#dfe8ee', 14, 'star'); sfx.bonus(); if (S.zina) S.zina.got++; }
          else if (o.kind === 'phone') { S.deeds++; addDays(5, 'позвонил дочке'); heal(20 + (cb().heal || 0)); burst(px, py, '#ff8ab5', 14, 'star'); sfx.bonus(); if (S.zina) S.zina.got++; }
          else if (o.kind === 'cat') { S.shield = S.shieldMax; S.usedShield = true; addText('Кот Огурец! Щит ' + S.shieldMax + ' с', S.lane, '#ffd84a', true); burst(px, py, '#ffb347', 24, 'star'); sfx.cat(); }
        }
      }
      if (o.z > 1.3) S.objs.splice(i, 1);
    }
    for (i = S.parts.length - 1; i >= 0; i--) { var p = S.parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; p.life -= dt; if (p.life <= 0) S.parts.splice(i, 1); }
    for (i = S.texts.length - 1; i >= 0; i--) { var t = S.texts[i]; t.y -= 38 * dtr; t.life -= dtr; if (t.life <= 0) S.texts.splice(i, 1); }
    if (S.ban) { S.ban.life -= dtr; if (S.ban.life <= 0) S.ban = null; }
    cv.style.filter = (S.hurt > 0 || (play && S.will < 28)) ? 'blur(' + (S.hurt > 0 ? 2.2 * S.hurt : 1.1) + 'px)' : '';
  }
  function launch(o) {
    o.fly = true; o.hit = true; o.fx = laneX(o.lane, o.z); o.fy = yOf(o.z);
    o.vx = (o.lane === 0 ? -1 : (o.lane === 2 ? 1 : (Math.random() < .5 ? -1 : 1))) * 340; o.vy = -430; o.rot = 0; o.life = 1;
  }
  function tutorial() {
    if (!S.tut) return;
    var t = S.rt, el_ = $('tip'), msg = '';
    if (t > .4 && t < 4.4) msg = 'Свайпай или тапай влево/вправо. Свайп вверх: прыжок через торт.';
    else if (t > 5.4 && t < 9.4) msg = 'Огурцы и полезные дела лечат шкалу «Силы воли». Соблазны её бьют.';
    else if (t > 10.4 && t < 14.4) msg = 'Кот Огурец даёт щит. А если кричит «ПАЛЫЧ!», хватай дела!';
    if (t > 14.5) { S.tut = 0; P.tut = 1; save(); }
    el_.textContent = msg; el_.classList.toggle('show', !!msg); S.tipOn = !!msg;
  }

  // ---------- рисование ----------
  function drawPalych(px, py) {
    var st = S.stepT, play = S.mode === 'play', fr = (play && Math.sin(st) < 0) ? 1 : 0;
    var cs = IMG.cos[P.costume]; if (!cs || !cs.ok) cs = IMG.cos.classic; if (!cs) return; var img = cs.b[cs.b.length > 1 ? fr : 0];
    var h = img.height * 135 / 560, w = img.width * 135 / 560, jump = S.jumpH;
    var bob = play ? Math.abs(Math.sin(st)) * 7 : 0, lean = (S.lane - S.laneF) * .3, sway = play ? Math.sin(st) * .05 : 0;
    var stag = S.stagger > 0 ? Math.sin(S.stagger * 30) * .16 * (S.stagger / .7) : 0;
    var sx = 1 + .035 * Math.sin(st * 2) * (play ? 1 : 0) + S.squash, sy = 1 - .035 * Math.sin(st * 2) * (play ? 1 : 0) - S.squash;
    soft(ctx, px, py, 46 * (1 - jump / 150), .5 * (1 - jump / 200));
    ctx.save(); ctx.translate(px + stag * 90, py - jump - bob);
    var dead = S.mode === 'dead' || S.mode === 'over';
    ctx.rotate(dead ? Math.min(S.dieT, .5) * 2.6 : sway + lean + stag);
    ctx.scale(sx, sy);
    if (S.inv > 0 && !dead && Math.floor(S.rt * 16) % 2) ctx.globalAlpha = .5;
    ctx.drawImage(img, -w * .5, -h, w, h);
    ctx.restore();
  }
  function drawObj(o, x, y, s, rot) {
    var sp = SPR[o.kind]; if (!sp) return;
    var bob = (!o.obst && o.kind !== 'cat') ? Math.sin(S.rt * 5 + o.lane) * 3 : 0;
    put(sp, x, y + bob * s, s, rot);
  }
  function drawCatImg(x, y, h, glow) {
    var im = IMG.cat; if (!im) return; var w = h * im.width / im.height, b = Math.sin(S.rt * 6) * 2;
    soft(ctx, x, y, w * .45, .5);
    if (glow) { var g = ctx.createRadialGradient(x, y - h * .5, 4, x, y - h * .5, h * .9); g.addColorStop(0, 'rgba(255,230,120,.7)'); g.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - h * .5, h * .9, 0, 7); ctx.fill(); }
    ctx.drawImage(im, x - w / 2, y - h + b, w, h);
  }
  function drawScen(e) {
    if (!SPR.house) return;
    var p = e.z, q = qOf(p), y = yOf(p), s = sOf(p);
    var x = W / 2 + e.side * ((38 + 72 * q) * 1.5 + 34 + 96 * s * (.6 + e.w * .5));
    var sp = e.type === 'house' ? SPR.house[e.v] : (e.type === 'tree' ? SPR.tree[e.tv] : (e.type === 'lamp' ? SPR.lamp : SPR.bush));
    if (!sp) return;
    if (e.type === 'lamp') { x = W / 2 + e.side * ((38 + 72 * q) * 1.5 + 14 + 10 * s); }
    if (e.type === 'bush') { x = W / 2 + e.side * ((38 + 72 * q) * 1.5 + 28 + 30 * s * e.w); }
    var flip = e.side > 0 && e.type === 'lamp' ? -1 : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s); ctx.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h);
    if (e.type === 'lamp') { var g = ctx.createRadialGradient(-18, -122, 2, -18, -122, 46); g.addColorStop(0, 'rgba(255,230,150,.75)'); g.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-18, -122, 46, 0, 7); ctx.fill(); }
    ctx.restore();
  }

  var roadG, specks = [], VIG;
  function initBg() {
    roadG = ctx.createLinearGradient(0, HOR, 0, H); roadG.addColorStop(0, '#6a5a6e'); roadG.addColorStop(.35, '#555664'); roadG.addColorStop(1, '#3b3d48');
    for (var i = 0; i < 90; i++) specks.push({ u: (Math.random() - .5) * 3, z: Math.random() * 1.3, r: .6 + Math.random() * 1.4, a: .15 + Math.random() * .25 });
  }
  function drawBg() {
    var sh = (S.laneF - 1), sk = SPR.sky;
    if (sk) {
      ctx.drawImage(sk.c, -80, 0, sk.w, sk.h);
      // облака
      var cx = (S.rt * 4) % 560;
      [[40, 38, 70, 9], [210, 70, 90, 11], [330, 28, 60, 8]].forEach(function (c) { var x = ((c[0] + cx) % 560) - 100; var g = ctx.createLinearGradient(0, c[1] - 10, 0, c[1] + 10); g.addColorStop(0, 'rgba(255,200,200,.8)'); g.addColorStop(1, 'rgba(255,140,150,.35)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, c[1], c[2], c[3], 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + c[2] * .4, c[1] - c[3] * .6, c[2] * .55, c[3] * .8, 0, 0, 7); ctx.fill(); });
      ctx.drawImage(SPR.far1.c, -80 - sh * 8, 0, SPR.far1.w, SPR.far1.h);
      ctx.drawImage(SPR.far2.c, -80 - sh * 18, 0, SPR.far2.w, SPR.far2.h);
    } else { ctx.fillStyle = '#c87'; ctx.fillRect(0, 0, W, HOR); }
    // двор
    var gg = ctx.createLinearGradient(0, HOR, 0, H); gg.addColorStop(0, '#a3a15a'); gg.addColorStop(1, '#4f7a38'); ctx.fillStyle = gg; ctx.fillRect(0, HOR, W, H - HOR);
    var wA = 38 * 1.5, wB = (38 + 72 * 1.424) * 1.5, c = W / 2;
    // бордюр/тротуар
    [-1, 1].forEach(function (sd) {
      ctx.beginPath(); ctx.moveTo(c + sd * (wA + 22), HOR); ctx.lineTo(c + sd * wA, HOR); ctx.lineTo(c + sd * wB, H); ctx.lineTo(c + sd * (wB + 150), H); ctx.closePath();
      ctx.fillStyle = grad(ctx, 0, HOR, 0, H, '#d9c4b0', '#b0a294'); ctx.fill();
      // плитка
      ctx.strokeStyle = 'rgba(90,70,60,.22)'; ctx.lineWidth = 1;
      for (var k = 0; k < 14; k++) { var p = ((k + S.offs % 1) / 14) * 1.3; if (p < .02) continue; var l = 38 + 72 * qOf(p), y = yOf(p); ctx.beginPath(); ctx.moveTo(c + sd * l * 1.5, y); ctx.lineTo(c + sd * (l * 1.5 + 22 + 150 * qOf(p)), y); ctx.stroke(); }
      // грань бордюра
      ctx.beginPath(); ctx.moveTo(c + sd * wA, HOR); ctx.lineTo(c + sd * (wA - 2), HOR); ctx.lineTo(c + sd * (wB - 7), H); ctx.lineTo(c + sd * wB, H); ctx.closePath(); ctx.fillStyle = '#efe3d6'; ctx.fill();
    });
    // асфальт
    ctx.beginPath(); ctx.moveTo(c - wA, HOR); ctx.lineTo(c + wA, HOR); ctx.lineTo(c + wB, H); ctx.lineTo(c - wB, H); ctx.closePath(); ctx.fillStyle = roadG; ctx.fill();
    ctx.save(); ctx.clip();
    specks.forEach(function (s) { var z = (s.z + S.offs * .45) % 1.3; if (z < .02) return; var q = qOf(z); ctx.fillStyle = 'rgba(' + (s.a > .3 ? '210,190,200' : '20,15,25') + ',' + s.a + ')'; ctx.beginPath(); ctx.ellipse(c + s.u * laneW(z), yOf(z), s.r * (.3 + q * 2.4), s.r * (.3 + q * 2.4) * .4, 0, 0, 7); ctx.fill(); });
    // трещина/пятна
    ctx.strokeStyle = 'rgba(15,10,20,.35)'; ctx.lineWidth = 1.4; [[-.7, .35], [.8, .75], [.1, 1.0]].forEach(function (cr) { var z = (cr[1] + S.offs * .45) % 1.3; if (z < .1) return; var q = qOf(z), x = c + cr[0] * laneW(z), y = yOf(z), s = .4 + q * 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14 * s, y + 3 * s); ctx.lineTo(x + 20 * s, y - 2 * s); ctx.lineTo(x + 34 * s, y + 4 * s); ctx.stroke(); });
    ctx.restore();
    // разметка
    var N = 9, off = S.offs % 1; ctx.fillStyle = '#f5efe0';
    for (var k = -1; k < N; k++) {
      var p1 = (k + off) / N * 1.3, p2 = p1 + .5 / N * 1.3; if (p2 <= .02) continue; p1 = Math.max(p1, .001);
      [-.5, .5].forEach(function (b) { var l1 = laneW(p1), l2 = laneW(p2), c1 = c + b * l1, c2 = c + b * l2, t1 = 1.5 + 3.2 * qOf(p1), t2 = 1.5 + 3.2 * qOf(p2); ctx.beginPath(); ctx.moveTo(c1 - t1 / 2, yOf(p1)); ctx.lineTo(c1 + t1 / 2, yOf(p1)); ctx.lineTo(c2 + t2 / 2, yOf(p2)); ctx.lineTo(c2 - t2 / 2, yOf(p2)); ctx.fill(); });
    }
  }
  function drawLight() {
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,120,150,.10)'); g.addColorStop(.5, 'rgba(255,150,70,.12)'); g.addColorStop(1, 'rgba(60,20,80,.22)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (!VIG) { VIG = ctx.createRadialGradient(W / 2, H * .5, H * .35, W / 2, H * .5, H * .75); VIG.addColorStop(0, 'rgba(20,0,30,0)'); VIG.addColorStop(1, 'rgba(20,0,30,.45)'); }
    ctx.fillStyle = VIG; ctx.fillRect(0, 0, W, H);
  }
  function drawHUD() {
    ctx.save();
    rrp(ctx, 10, 10, 150, 56, 14); ctx.fillStyle = 'rgba(30,15,40,.62)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,216,74,.7)'; ctx.lineWidth = 1.5; ctx.stroke();
    tx(ctx, 'СЧЁТЧИК ДНЕЙ', 85, 23, 10, '#ffd84a', null, 700);
    tx(ctx, String(curDays()), 85, 46, 28, '#fff', '#2a1138', 900);
    if (mult() > 1) { rrp(ctx, 112, 40, 40, 20, 10); ctx.fillStyle = '#ff7a2a'; ctx.fill(); tx(ctx, '×' + mult(), 132, 50, 13, '#fff', null, 900); }
    // сила воли
    var wp = S.will / 100, col = wp > .6 ? ['#8be04a', '#4fb531'] : (wp > .3 ? ['#ffd84a', '#e0a010'] : ['#ff6a5a', '#c42a1e']);
    rrp(ctx, 10, 72, 150, 20, 10); ctx.fillStyle = 'rgba(30,15,40,.62)'; ctx.fill();
    ctx.save(); rrp(ctx, 12, 74, 146, 16, 8); ctx.clip(); ctx.fillStyle = grad(ctx, 0, 74, 0, 90, col[0], col[1]); ctx.fillRect(12, 74, 146 * wp, 16); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(12, 74, 146 * wp, 6); ctx.restore();
    if (wp < .3 && Math.floor(S.rt * 5) % 2) { rrp(ctx, 10, 72, 150, 20, 10); ctx.strokeStyle = '#ff5a4a'; ctx.lineWidth = 2; ctx.stroke(); }
    tx(ctx, 'Сила воли ' + Math.ceil(S.will) + '%', 85, 82.5, 10.5, '#fff', 'rgba(0,0,0,.55)', 700);
    // огурцы / рекорд
    rrp(ctx, W - 112, 10, 102, 30, 14); ctx.fillStyle = 'rgba(30,15,40,.62)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,216,74,.7)'; ctx.stroke();
    if (SPR.cucS) put(SPR.cucS, W - 94, 36, 1);
    tx(ctx, String(S.cuc), W - 52, 26, 17, '#fff', '#2a1138', 800);
    tx(ctx, titleOf(curDays()), W - 61, 54, 10.5, '#ffd84a', 'rgba(0,0,0,.6)', 700);
    tx(ctx, 'рекорд ' + P.best, W - 61, 68, 10.5, '#fff', 'rgba(0,0,0,.6)', 600);
    if (S.shield > 0) { rrp(ctx, 70, 100, 220, 17, 9); ctx.fillStyle = 'rgba(30,15,40,.62)'; ctx.fill(); ctx.save(); rrp(ctx, 72, 102, 216, 13, 7); ctx.clip(); ctx.fillStyle = grad(ctx, 0, 102, 0, 115, '#ffd070', '#f08a1a'); ctx.fillRect(72, 102, 216 * S.shield / S.shieldMax, 13); ctx.restore(); tx(ctx, 'Кот Огурец осуждает', 180, 108.5, 10, '#3a1d00', null, 800); }
    if (S.zina) { var z = S.zina, y0 = S.shield > 0 ? 124 : 102; rrp(ctx, 50, y0, 260, 38, 12); ctx.fillStyle = 'rgba(120,20,40,.82)'; ctx.fill(); ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 2; ctx.stroke(); tx(ctx, 'Зина! Дела: ' + z.got + ' / ' + z.need, 180, y0 + 13, 14, '#fff', 'rgba(0,0,0,.5)', 800); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(66, y0 + 26, 228, 5); ctx.fillStyle = '#ffd84a'; ctx.fillRect(66, y0 + 26, 228 * Math.max(0, z.left / 11), 5); }
    if (S.x2 > 0) tx(ctx, '×2 ещё ' + Math.ceil(S.x2) + ' с', 180, 160, 12, '#fff08a', 'rgba(0,0,0,.6)', 800);
    ctx.restore();
  }
  function drawBanner() {
    var b = S.ban; if (!b) return; var T = 1.9, a = Math.min(1, b.life * 4, (T - b.life) * 8) * .85;
    var y = S.tipOn ? 520 : 584, h = 46, w = 296;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(180, y);
    var col = b.kind === 'zina' ? ['#c93a52', '#7a1030'] : (b.kind === 'good' ? ['#4fc04a', '#1f7a2a'] : (b.kind === 'lvl' ? ['#5aa6ff', '#2a58b8'] : ['#f0b92a', '#a8690f']));
    rrp(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = grad(ctx, 0, -h / 2, 0, h / 2, col[0], col[1]); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(30,15,20,.75)'; ctx.stroke();
    var off = 0;
    if (b.kind === 'medal') { ctx.beginPath(); ctx.arc(-w / 2 + 24, 0, 14, 0, 7); fs(ctx, grad(ctx, 0, -14, 0, 14, '#fff2a0', '#e0a010'), 2); tx(ctx, '★', -w / 2 + 24, 1, 16, '#c9461a', null, 900); off = 16; }
    var sub = b.sub || ''; if (sub.length > 46) sub = sub.slice(0, 45) + '…';
    tx(ctx, b.title, off, sub ? -9 : 0, 15, '#fff', 'rgba(20,10,20,.7)', 800);
    if (sub) tx(ctx, sub, off, 11, 11, '#fff', 'rgba(0,0,0,.4)', 500);
    ctx.restore();
  }
  function drawPart(p) {
    ctx.globalAlpha = Math.max(0, p.life / p.max * 1.4); ctx.globalCompositeOperation = 'lighter';
    if (p.star) sparkle(ctx, p.x, p.y, p.r * 2.2, p.col); else { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  function draw() {
    ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    ctx.save();
    var wob = (S.mode === 'play' && S.will < 40) ? (1 - S.will / 40) : 0;
    if (S.shake > 0) ctx.translate((Math.random() - .5) * 20 * S.shake, (Math.random() - .5) * 20 * S.shake);
    if (wob > 0 || S.hurt > 0) { var k = Math.max(wob * .012, S.hurt * .015); ctx.translate(W / 2, H / 2); ctx.rotate(Math.sin(S.rt * 3.1) * k); ctx.scale(1 + Math.sin(S.rt * 2.3) * k * 2, 1); ctx.translate(-W / 2, -H / 2); }
    drawBg();
    var list = [], i;
    S.scen.forEach(function (e) { list.push({ z: e.z, f: function () { drawScen(e); } }); });
    S.objs.forEach(function (o) {
      if (o.got || (o.z < 0 && !o.fly)) return;
      list.push({ z: o.fly ? 1.1 : o.z, f: function () {
        if (o.fly) { ctx.globalAlpha = Math.max(0, o.life); drawObj(o, o.fx, o.fy, .95, o.rot); ctx.globalAlpha = 1; }
        else if (o.kind === 'cat') { var s = sOf(o.z); drawCatImg(laneX(o.lx, o.z), yOf(o.z), 80 * s + 8, true); sparkle(ctx, laneX(o.lx, o.z) + 20 * s, yOf(o.z) - 85 * s, 8 * s + 3, '#fff3a0'); }
        else drawObj(o, laneX(o.lx !== undefined ? o.lx : o.lane, o.z), yOf(o.z), sOf(o.z));
      } });
    });
    if (S.mode !== 'menu') list.push({ z: PZ, f: function () {
      var px = W / 2 + (S.laneF - 1) * laneW(PZ), py = yOf(PZ);
      if (S.shield > 0) { var g = ctx.createRadialGradient(px, py - 80, 10, px, py - 80, 100); g.addColorStop(0, 'rgba(255,225,120,' + (.35 + .1 * Math.sin(S.rt * 10)) + ')'); g.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py - 80, 100, 0, 7); ctx.fill(); }
      drawPalych(px, py);
      if (S.shield > 0) drawCatImg(px + 66, py + 2, 86, false);
    } });
    list.sort(function (a, b) { return a.z - b.z; });
    for (i = 0; i < list.length; i++) list[i].f();
    // Зина сзади
    if (S.zina) { var zp = Math.min(1, S.zina.t / 1.2), sc = .6 + (1 - S.zina.left / 11) * .4; drawZina(W / 2 + Math.sin(S.rt * 4) * 14, H + 30 - 50 * zp, sc, S.rt, 0); }
    S.parts.forEach(drawPart);
    S.texts.forEach(function (t) { ctx.globalAlpha = Math.min(1, t.life * 2); tx(ctx, t.s, t.x, t.y, t.big ? 14 : 11.5, t.color, '#1a0d20', 800); }); ctx.globalAlpha = 1;
    ctx.restore();
    drawLight();
    if (S.mode === 'play' && S.will < 30) { var a = (1 - S.will / 30) * (.25 + .12 * Math.sin(S.rt * 7)); var rg = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .7); rg.addColorStop(0, 'rgba(200,20,20,0)'); rg.addColorStop(1, 'rgba(200,20,20,' + (a * 2) + ')'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
    if (S.mode === 'play' || S.mode === 'dead') { drawHUD(); drawBanner(); }
    if (S.flash > 0) { ctx.fillStyle = 'rgba(255,60,40,' + S.flash * 1.4 + ')'; ctx.fillRect(0, 0, W, H); }
    if (S.slow > 0) { ctx.fillStyle = 'rgba(120,160,255,.10)'; ctx.fillRect(0, 0, W, H); }
  }

  // ---------- экраны ----------
  function hideAll() { ['start', 'over', 'shop', 'album'].forEach(function (i) { $(i).classList.remove('show'); }); $('tip').classList.remove('show'); }
  function show(id) { hideAll(); $(id).classList.add('show'); if (id === 'start' || id === 'over') heroUpdate(); }
  var from = 'start';
  function heroUpdate() {
    var cs = IMG.cos[P.costume]; if (!cs || !cs.ok) cs = IMG.cos.classic; if (!cs) return;
    $('heroImg').src = 'assets/costumes/' + (IMG.cos[P.costume] && IMG.cos[P.costume].ok ? P.costume : 'classic') + '_front.png';
    $('overImg').src = $('heroImg').src;
  }
  function showStart() {
    heroUpdate();
    show('start'); from = 'start'; newRun('menu'); cv.style.filter = '';
    var q = ensureQuest(), pct = Math.round(100 * P.q.p / q.n);
    $('quest').innerHTML = '<b>Задание дня:</b> ' + q.t + (P.q.done ? ' — <b>выполнено</b>' : ' (' + P.q.p + '/' + q.n + ', награда ' + q.r + ' огурцов)') + '<div class="bar"><i style="width:' + (P.q.done ? 100 : pct) + '%"></i></div>' +
      '<div style="margin-top:4px">Копилка: <b>' + P.cuc + '</b> огурцов · Рекорд: <b>' + P.best + '</b> · Звание: <b>' + titleOf(P.best) + '</b></div>';
    $('monday').textContent = IS_MON ? 'ПОНЕДЕЛЬНИК: «Новая жизнь» — все дни ×2!' : 'Обходи соблазны, собирай огурцы. Кот Огурец всё видит.';
    $('bAlbum').textContent = 'Альбом отмазок ' + Object.keys(P.ex).length + '/' + EXCUSES.length;
  }
  function showOver() {
    if (S.mode !== 'dead') return;
    S.mode = 'over'; overAt = Date.now(); from = 'over'; cv.style.filter = '';
    var n = S.finalDays, ex = EXCUSES[S.exId], r = rarity(S.exId);
    $('days').textContent = 'Счётчик дней: 0';
    $('excuse').style.borderColor = RCOL[r];
    $('excuse').innerHTML = '<span class="rar" style="background:' + RCOL[r] + '">' + RNAME[r] + ' отмазка' + (S.exNew ? ' · НОВАЯ!' : '') + '</span>«' + ex + '»<small>— Палыч, #ОтмазкаДня · в альбоме ' + Object.keys(P.ex).length + ' из ' + EXCUSES.length + '</small>';
    $('rec').textContent = 'Продержался: ' + n + ' ' + dayWord(n) + ' · ' + titleOf(n) + ' · Рекорд: ' + P.best + (S.isNew && n > 0 ? ' (новый!)' : '');
    $('extra').textContent = '+' + S.cuc + ' огурцов в копилку (всего ' + P.cuc + ')' + (S.qMsg ? ' · ' + S.qMsg : '');
    show('over');
  }
  function renderShop() {
    $('wallet').innerHTML = 'Копилка: <b style="color:#ffd84a;font-size:calc(var(--u)*16)">' + P.cuc + '</b> огурцов';
    var h = '';
    UPS.forEach(function (u) {
      var l = P.up[u.id], max = l >= 3, cost = max ? 0 : u.cost[l];
      h += '<div class="item"><div><b>' + u.name + ' · ур. ' + l + '/3</b>' + u.desc + '<br>Сейчас: ' + u.eff(l) + (max ? '' : ' → ' + u.eff(l + 1)) + '</div>' +
        (max ? '<span>MAX</span>' : '<button class="btn" data-up="' + u.id + '"' + (P.cuc < cost ? ' disabled' : '') + '>' + cost + '</button>') + '</div>';
    });
    var g = '';
    COSTUMES.forEach(function (c) {
      var cs = IMG.cos[c.id], ok = cs && cs.ok, own = P.costumes[c.id], on = P.costume === c.id;
      g += '<div class="cc' + (on ? ' on' : '') + (own ? '' : ' locked') + '">' +
        (ok ? '<img src="assets/costumes/' + c.id + '_front.png" alt="' + c.name + '" class="' + (own ? 'dance' : '') + '">' : '<div class="soon">скоро</div>') +
        (own ? '' : '<span class="lock"></span>') +
        '<b>' + c.name + '</b><small>' + c.bonus + '</small>' +
        (!ok ? '<button class="btn" disabled>Скоро</button>' : (on ? '<span class="onl">Надето</span>' : (own ? '<button class="btn" data-wear="' + c.id + '">Надеть</button>' : '<button class="btn" data-buy="' + c.id + '"' + (P.cuc < c.cost ? ' disabled' : '') + '>Купить · ' + c.cost + '</button>'))) + '</div>';
    });
    h = '<div class="sub">Костюмы Палыча</div><div class="cgrid">' + g + '</div><div class="sub" style="margin-top:10px">Улучшения</div>' + h;
    $('shopList').innerHTML = h;
  }
  $('shopList').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.up) { var u = UPS.filter(function (x) { return x.id === b.dataset.up; })[0], l = P.up[u.id]; if (l < 3 && P.cuc >= u.cost[l]) { P.cuc -= u.cost[l]; P.up[u.id]++; sfx.bonus(); } }
    else if (b.dataset.buy) { var s = COSTUMES.filter(function (x) { return x.id === b.dataset.buy; })[0]; if (P.cuc >= s.cost) { P.cuc -= s.cost; P.costumes[s.id] = 1; P.costume = s.id; sfx.bonus(); } }
    else if (b.dataset.wear) { P.costume = b.dataset.wear; sfx.pick(); }
    save(); renderShop(); heroUpdate();
  });
  function renderAlbum() {
    $('albumCnt').textContent = 'Открыто ' + Object.keys(P.ex).length + ' из ' + EXCUSES.length + ' · редкие выпадают реже';
    var h = '';
    EXCUSES.forEach(function (e, i) {
      var r = rarity(i);
      h += P.ex[i] ? '<div class="ec r' + r + '"><em style="color:' + RCOL[r] + '">' + RNAME[r] + (P.ex[i] > 1 ? ' ×' + P.ex[i] : '') + '</em>' + e + '</div>' : '<div class="ec lock r' + r + '">?<small style="display:block;font-size:calc(var(--u)*9)">&nbsp;' + RNAME[r] + '</small></div>';
    });
    $('albumGrid').innerHTML = h;
  }
  function openShop() { show('shop'); renderShop(); }
  function openAlbum() { show('album'); renderAlbum(); }
  function back() { if (from === 'over') show('over'); else showStart(); }
  $('bShop').onclick = $('bShop2').onclick = openShop; $('bAlbum').onclick = $('bAlbum2').onclick = openAlbum;
  document.querySelectorAll('[data-back]').forEach(function (b) { b.onclick = back; });
  $('bStart').onclick = startRun;
  $('bAgain').onclick = function () { if (Date.now() - overAt > 400) showStartRun(); };
  function showStartRun() { startRun(); }
  $('bShare').onclick = share;
  function share() {
    var n = S.finalDays || 0, text = 'Я продержался ' + n + ' ' + dayWord(n) + '! А ты?', url = location.href.split('#')[0].split('?')[0];
    if (window.IN_VK && window.vkBridge) { vkBridge.send('VKWebAppShowWallPostBox', { message: text + ' 🥒 Играй в приложении «Палыч: Продержись!»' }).catch(function () {}); return; }
    if (navigator.share) navigator.share({ title: 'Палыч: Продержись!', text: text, url: url }).catch(function () {});
    else { var full = text + ' ' + url; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(full).then(function () { toast('Текст скопирован'); }, function () { prompt('Скопируй:', full); }); else prompt('Скопируй:', full); }
  }
  function toast(m) { var b = $('bShare'), o = b.textContent; b.textContent = m; setTimeout(function () { b.textContent = o; }, 1500); }

  // ---------- размеры и цикл ----------
  var dpr = 1;
  function resize() {
    var vw = window.innerWidth, vh = window.innerHeight, w = Math.min(vw, vh * 9 / 16), h = w * 16 / 9;
    wrap.style.width = w + 'px'; wrap.style.height = h + 'px'; wrap.style.setProperty('--u', (w / 360) + 'px');
    dpr = Math.min(window.devicePixelRatio || 1, 3); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  }
  window.addEventListener('resize', resize); resize();
  function frame(ts) {
    if (!last) last = ts; var dt = Math.min(.05, (ts - last) / 1000); last = ts;
    if (!window.__paused) update(dt);
    draw(); requestAnimationFrame(frame);
  }
  function load(src) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; }); }
  newRun('menu'); initBg(); showStart();
  var fontP = (document.fonts && document.fonts.load) ? Promise.race([document.fonts.load('800 20px Rubik'), new Promise(function (r) { setTimeout(r, 1500); })]) : Promise.resolve();
  var cosLoads = COSTUMES.map(function (c) {
    if (!c.art) { IMG.cos[c.id] = { ok: false, b: [] }; return Promise.resolve(); }
    return Promise.all([load('assets/costumes/' + c.id + '_front.png'), load('assets/costumes/' + c.id + '_back.png'), c.id === 'classic' ? load('assets/costumes/classic_back2.png') : Promise.resolve(null)]).then(function (r) {
      IMG.cos[c.id] = { f: r[0], b: [r[1]].concat(r[2] ? [r[2]] : []), ok: !!(r[0] && r[1]) };
    });
  });
  Promise.all(cosLoads.concat([load('assets/cat.png').then(function (i) { IMG.cat = i; }), fontP])).then(function () { buildSprites(); heroUpdate(); });
  requestAnimationFrame(frame);

  window.__game = {
    state: function () { return S; }, save: function () { return P; }, spawn: function (kind, lane, z) { S.objs.push({ kind: kind, obst: OBST.indexOf(kind) >= 0, lane: lane, lx: lane, z: z || 0 }); },
    curDays: curDays, zina: function () { S.zinaNext = S.t; S.shield = 0; }, setDays: function (n) { S.dayAcc = n; }, EXCUSES: EXCUSES
  };
})();
