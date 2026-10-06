'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const formatPrice = (value) => `${value.toLocaleString('ru-RU')} ₸`;

const SYRUP_PRICE = 250;
const ALT_MILK_PRICE = 690;
const FREE_DRINK_THRESHOLD = 5;
const QR_GENERATION_SECONDS = 4;
const STORAGE_KEY = 'kofeynya5.state.v8';
const CART_KEY = 'kofeynya5.cart.v8';


const ICONS = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  menu: '<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 9h2a2 2 0 0 1 0 5h-2M8 2v3M12 2v3"/>',
  cart: '<path d="M3 4h2l2.4 11h10.2L20 7H6.5"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
  places: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4M14 18h2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8C9 8 8 4 10 4s2 4 2 4 0-4 2-4 1 4-2 4"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  iced: '<path d="M7 7h10l-1.2 12a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8z"/><path d="M12 3l1 4M9 11h6"/>',
  signature: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
  tea: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/>',
  dessert: '<path d="M4 20h16v-6H4zM6 14v-3h12v3M12 11V7"/>',
  bakery: '<path d="M4 15c1-5 5-8 8-8s7 3 8 8l-3 1-2-3-3 1-3-1-2 3z"/>',
  kids: '<circle cx="12" cy="12" r="8"/><path d="M9 10h.01M15 10h.01M8.5 14c1 1.8 5.9 1.8 7 0"/>'
};

const CATEGORY_ICONS = {
  all: 'grid', hot: 'menu', ice: 'iced', cold: 'signature', tea: 'tea', dess: 'dessert', bake: 'bakery', kids: 'kids'
};

const TAB_BAR = [
  { route: 'home', label: 'Главная', icon: 'home' },
  { route: 'menu', label: 'Меню', icon: 'menu' },
  { route: 'loyalty', label: '', icon: 'qr', center: true, ariaLabel: 'QR и лояльность' },
  { route: 'cart', label: 'Корзина', icon: 'cart', badge: true },
  { route: 'profile', label: 'Профиль', icon: 'profile' }
];

const SCENES = {
  home: 'home', menu: 'menu', product: 'menu', loyalty: 'qr', profile: 'profile', places: 'places', cart: 'cart'
};

const icon = (name, extraClass = '') => `<svg class="icon ${extraClass}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const logoMark = (extraClass = '') => `<svg class="logo-mark ${extraClass}" aria-hidden="true"><use href="#logo-symbol" width="100%" height="100%"/></svg>`;

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    return;
  }
}

function createDefaultState() {
  return {
    cups: 1,
    totalDrinks: 1,
    freeDrinks: 0,
    cardId: `N5-${Math.floor(1000 + Math.random() * 9000)}`,
    history: [{ time: Date.now() - 2 * 86400000, text: 'Напиток №1 зачтён' }]
  };
}

let state = Object.assign(createDefaultState(), readStorage(STORAGE_KEY, {}));
if (state.cups > FREE_DRINK_THRESHOLD) state.cups = 0;
let cart = readStorage(CART_KEY, []);
let menuCategory = 'all';
let menuQuery = '';
let cupSequence = 0;
let currentTab = '';
const routeHistory = [];
const timers = { qr: null, qrTick: null, cupReset: null };

const view = $('#view');
const saveState = () => writeStorage(STORAGE_KEY, state);
const saveCart = () => writeStorage(CART_KEY, cart);
const remainingDrinks = () => Math.max(0, FREE_DRINK_THRESHOLD - state.cups);

function setupLogoSymbol() {
  const symbol = $('#logo-symbol');
  symbol.setAttribute('viewBox', LOGO.vb.join(' '));
  symbol.innerHTML = `<path d="${LOGO.d}"/>`;
}

/* Cart */

const findProduct = (id) => ALL_PRODUCTS.find((product) => product.id === id);

function cartLinePrice(line) {
  const product = findProduct(line.productId);
  return product.sizes[line.sizeIndex].price
    + (line.syrupIndex >= 0 ? SYRUP_PRICE : 0)
    + (line.altMilk ? ALT_MILK_PRICE : 0);
}

const cartCount = () => cart.reduce((sum, line) => sum + line.quantity, 0);
const cartTotal = () => cart.reduce((sum, line) => sum + cartLinePrice(line) * line.quantity, 0);

function addToCart(productId, options = {}, sourceElement = null) {
  const { sizeIndex = 0, syrupIndex = -1, altMilk = false } = options;
  const existing = cart.find((line) => line.productId === productId
    && line.sizeIndex === sizeIndex && line.syrupIndex === syrupIndex && line.altMilk === altMilk);
  if (existing) existing.quantity += 1;
  else cart.push({ productId, sizeIndex, syrupIndex, altMilk, quantity: 1 });
  saveCart();
  flyToCart(sourceElement);
  window.setTimeout(() => updateCartBadge(true), 600);
  showToast(`Добавлено: ${findProduct(productId).name}`);
}

function flyToCart(sourceElement) {
  const target = $('.tab-center');
  if (!sourceElement || !target) return;
  const from = sourceElement.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'fly-dot';
  dot.style.left = `${from.left + from.width / 2 - 8}px`;
  dot.style.top = `${from.top + from.height / 2 - 8}px`;
  document.body.appendChild(dot);
  const shiftX = to.left + to.width / 2 - from.left - from.width / 2;
  const shiftY = to.top + to.height / 2 - from.top - from.height / 2;
  dot.animate(
    [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${shiftX}px,${shiftY}px) scale(.3)`, opacity: 0.4 }],
    { duration: 700, easing: 'cubic-bezier(.5,-.3,.7,1)' }
  ).onfinish = () => dot.remove();
}

function updateCartBadge(pulse = false) {
  const badge = $('#cartBadge');
  if (!badge) return;
  badge.textContent = cartCount();
  badge.style.display = cartCount() ? '' : 'none';
  if (pulse) {
    badge.classList.remove('is-pulsing');
    void badge.offsetWidth;
    badge.classList.add('is-pulsing');
  }
}

let toastTimer = null;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

/* Modal */

let modalTimer = null;

function openModal(html, variant = '') {
  const modal = $('#modal');
  window.clearTimeout(modalTimer);
  modal.innerHTML = `<div class="modal-card ${variant}" role="dialog" aria-modal="true">${html}</div>`;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  void modal.offsetWidth;
  modal.classList.add('is-open');
}

function closeModal(immediately = false) {
  const modal = $('#modal');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  window.clearTimeout(modalTimer);
  modalTimer = window.setTimeout(() => { modal.innerHTML = ''; }, immediately ? 0 : 360);
}

$('#modal').addEventListener('click', (event) => {
  if (event.target.id === 'modal') closeModal();
});

function openPromotion(promotionId) {
  const promotion = PROMOTIONS.find((item) => item.id === promotionId);
  const badge = promotion.badge === 'BOX' ? '' : ` ${promotion.badge}`;
  openModal(`
    <img class="modal-cover" src="assets/${promotion.image}.jpg" alt="">
    <div class="modal-body">
      <h3>${promotion.title}${badge}</h3>
      <p>${promotion.details}</p>
      <button class="btn" id="promotionAction" type="button">${promotion.actionLabel}</button>
      <button class="btn btn-glass" data-close type="button">Закрыть</button>
    </div>`, 'modal-promo');
  $('#promotionAction').addEventListener('click', () => {
    closeModal();
    location.hash = `#${promotion.route}`;
  });
  $('[data-close]').addEventListener('click', () => closeModal());
}

/* Sound and effects */

function playTone(frequency, duration) {
  try {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    window.sharedAudio = window.sharedAudio || new AudioCtor();
    const audio = window.sharedAudio;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.2, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration + 0.1);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration + 0.12);
  } catch (error) {
    return;
  }
}

function celebrate() {
  const canvas = $('#celebration');
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const palette = ['#f7d99a', '#e4b055', '#2fd29a', '#ffffff', '#1c8a64'];
  const confetti = [];
  const sparks = [];

  for (let index = 0; index < 150; index += 1) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.6,
      driftX: (Math.random() - 0.5) * 2,
      fall: 2 + Math.random() * 3.5,
      angle: Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.3,
      size: 5 + Math.random() * 6,
      color: palette[index % palette.length]
    });
  }

  const burst = () => {
    const originX = canvas.width * (0.15 + Math.random() * 0.7);
    const originY = canvas.height * (0.1 + Math.random() * 0.32);
    const golden = Math.random() < 0.5;
    for (let index = 0; index < 80; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 260;
      sparks.push({
        x: originX, y: originY, previousX: originX, previousY: originY,
        velocityX: Math.cos(angle) * speed, velocityY: Math.sin(angle) * speed,
        age: 0, life: 900 + Math.random() * 900,
        colors: golden ? ['247,217,154', '228,176,85'] : ['47,210,154', '190,255,225']
      });
    }
  };
  [0, 450, 950, 1500, 2100, 2800, 3400].forEach((delay) => window.setTimeout(burst, delay));

  const startedAt = performance.now();
  let previousTime = startedAt;
  (function draw(now) {
    const delta = Math.min(0.05, (now - previousTime) / 1000);
    previousTime = now;
    context.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((piece) => {
      piece.x += piece.driftX;
      piece.y += piece.fall;
      piece.angle += piece.spin;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
      context.restore();
    });
    context.globalCompositeOperation = 'lighter';
    for (let index = sparks.length - 1; index >= 0; index -= 1) {
      const spark = sparks[index];
      spark.age += delta * 1000;
      if (spark.age > spark.life) {
        sparks.splice(index, 1);
        continue;
      }
      const progress = spark.age / spark.life;
      const drag = Math.pow(0.35, delta);
      spark.previousX = spark.x;
      spark.previousY = spark.y;
      spark.velocityX *= drag;
      spark.velocityY = spark.velocityY * drag + 200 * delta;
      spark.x += spark.velocityX * delta;
      spark.y += spark.velocityY * delta;
      context.strokeStyle = `rgba(${spark.colors[progress < 0.5 ? 0 : 1]},${1 - progress})`;
      context.lineWidth = 2.2 * (1 - progress * 0.6);
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(spark.previousX, spark.previousY);
      context.lineTo(spark.x, spark.y);
      context.stroke();
    }
    context.globalCompositeOperation = 'source-over';
    if (now - startedAt < 5800) requestAnimationFrame(draw);
    else context.clearRect(0, 0, canvas.width, canvas.height);
  }(startedAt));
}

/* Shared templates */

function sectionHead(eyebrow, title, aside = '') {
  return `<div class="section-head reveal"><div><small class="eyebrow">${eyebrow}</small><h2>${title}</h2></div>${aside}</div>`;
}

function renderFeed(itemsHtml) {
  return `
    <div class="feed-wrap reveal">
      <button class="feed-arrow feed-arrow-prev" data-direction="-1" type="button" aria-label="Назад">${icon('back')}</button>
      <div class="feed">${itemsHtml}</div>
      <button class="feed-arrow feed-arrow-next" data-direction="1" type="button" aria-label="Вперёд">${icon('chevron')}</button>
    </div>`;
}

const productBadge = (product) => (product.badge
  ? `<span class="badge badge-${product.badge}">${product.badge === 'hit' ? 'HIT' : 'NEW'}</span>`
  : '');

const priceLabel = (product) => `${product.sizes.length > 1 ? 'от ' : ''}${formatPrice(product.sizes[0].price)}`;

function renderCup({ status = 'empty', animate = false, plusOne = false } = {}) {
  cupSequence += 1;
  const id = cupSequence;
  const filled = status === 'filled' || status === 'gift';
  const golden = status === 'gift' || status === 'ready';
  const outline = filled ? (golden ? '#ffd27d' : '#bdfbe3') : (golden ? '#e4b055' : '#7d8b85');
  const body = 'M14 30h72l-8 90a6 6 0 0 1-6 5H28a6 6 0 0 1-6-5z';
  const wave = 'M0 6Q12.5 0 25 6T50 6T75 6T100 6T125 6T150 6T175 6T200 6V130H0Z';
  const liquidStart = filled && !animate ? 42 : 134;
  const checkScale = filled && animate ? 0 : 1;
  const topColor = golden ? '#ffd27d' : '#f0b45b';
  const bottomColor = golden ? '#c96a12' : '#9a5718';
  const checkMark = filled
    ? `<path class="cup-check" d="M40 84l7 7 14-15" fill="none" stroke="${golden ? '#b9701a' : '#0a7a52'}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" style="transform-origin:50px 84px;transform:scale(${animate ? 0 : 1})"/>`
    : (plusOne ? `<text x="50" y="92" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="22" fill="${outline}">+1</text>` : '');

  return `
    <svg class="cup cup-${status}" viewBox="0 0 100 128" aria-hidden="true">
      <defs>
        <clipPath id="cupClip${id}"><path d="${body}"/></clipPath>
        <linearGradient id="cupLiquid${id}" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="${bottomColor}"/><stop offset="1" stop-color="${topColor}"/>
        </linearGradient>
      </defs>
      <path d="${body}" fill="#0c1814"/>
      <g clip-path="url(#cupClip${id})">
        <g class="cup-liquid" style="transform:translateY(${liquidStart}px)">
          <g><path class="cup-wave cup-wave-foam" d="${wave}" fill="#f6e7c6"/></g>
          <g transform="translate(0 7)"><path class="cup-wave cup-wave-body" d="${wave}" fill="url(#cupLiquid${id})"/></g>
          <circle cx="22" cy="3.5" r="1.7" fill="#fff" opacity=".7"/>
          <circle cx="48" cy="2.5" r="1.3" fill="#fff" opacity=".6"/>
          <circle cx="71" cy="4" r="1.9" fill="#fff" opacity=".7"/>
        </g>
      </g>
      <path d="${body}" fill="none" stroke="${outline}" stroke-width="3.2" stroke-linejoin="round"/>
      <rect x="9" y="17" width="82" height="15" rx="6" fill="${filled ? '#0b2a20' : '#121d18'}" stroke="${outline}" stroke-width="2.6"/>
      ${animate ? '<rect class="cup-stream" x="48.5" y="-18" width="3" height="78" rx="1.5" fill="#c98a46"/>' : ''}
      <circle class="cup-check" cx="50" cy="84" r="19" fill="${filled ? '#fff' : 'none'}" stroke="${filled ? 'none' : outline}" stroke-width="2" ${filled ? '' : 'stroke-dasharray="4 4"'} style="transform-origin:50px 84px;transform:scale(${checkScale})"/>
      ${checkMark}
    </svg>`;
}

function buildQrSvg(token, animated) {
  let seed = 0;
  for (const character of token) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const size = 29;
  const revealDelay = (row) => (animated
    ? ` class="qr-module" style="animation-delay:${(row / size * 1.9 + Math.random() * 0.5).toFixed(2)}s"`
    : '');
  let markup = '';

  const finder = (x, y) => {
    markup += `<g${revealDelay(y)}>
      <rect x="${x}" y="${y}" width="7" height="7" rx="1.8" fill="#0b2a20"/>
      <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.2" fill="#fff"/>
      <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="1" fill="#0b2a20"/></g>`;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
      const inCenter = Math.abs(x - 14) < 5.6 && Math.abs(y - 14) < 5.6;
      if (inFinder || inCenter) continue;
      if (random() > 0.5) {
        markup += `<rect${revealDelay(y)} x="${x + 0.08}" y="${y + 0.08}" width=".84" height=".84" rx=".3" fill="#0b2a20"/>`;
      }
    }
  }
  finder(0, 0);
  finder(22, 0);
  finder(0, 22);

  return `<svg viewBox="0 0 29 29">${markup}
    <g${animated ? ' class="qr-module" style="animation-delay:1.1s"' : ''}>
      <circle cx="14.5" cy="14.5" r="4.9" fill="#07130e" stroke="#e4b055" stroke-width=".25"/>
      <use href="#logo-symbol" x="10.7" y="10.7" width="7.6" height="7.6" fill="#f7d99a" fill-rule="evenodd"/>
    </g></svg>`;
}

/* Views */

function renderHome() {
  const newProducts = ALL_PRODUCTS.filter((product) => product.badge === 'new');
  const mainLocation = LOCATIONS[0];
  const progress = Math.min(100, state.cups / FREE_DRINK_THRESHOLD * 100);
  const atmosphereCards = [
    { type: 'video', source: 'video-extra' },
    { type: 'video', source: 'v2' },
    { type: 'video', source: 'v3' },
    ...ATMOSPHERE_IMAGES.map((source) => ({ type: 'image', source }))
  ].map((item) => `
    <div class="atmosphere-card">${item.type === 'video'
    ? `<video src="assets/${item.source}.mp4" poster="assets/${item.source}.jpg" autoplay muted loop playsinline></video>`
    : `<img loading="lazy" src="assets/${item.source}.jpg" alt="">`}</div>`).join('');

  return `
    <div class="page">
      <section class="hero">
        <h1>Не просто<br><em>кофе</em></h1>
        <p>Авторские напитки, свежая выпечка и десерты. Каждый 6-й напиток — в подарок.</p>
        <div class="hero-actions">
          <a class="btn" href="#/menu">Смотреть меню</a>
          <a class="btn btn-glass" href="#/places">Адреса</a>
        </div>
      </section>

      <a class="card loyalty-teaser reveal" href="#/loyalty">
        <div class="teaser-cup">${renderCup({ status: state.cups > 0 ? 'filled' : 'empty' })}</div>
        <div class="teaser-text">
          <h3>Карта гостя 5+1</h3>
          <p>${state.cups < FREE_DRINK_THRESHOLD ? `До бесплатного напитка: ${remainingDrinks()}` : 'Следующий напиток — бесплатно'}</p>
          <div class="progress"><i style="width:${progress}%"></i></div>
        </div>
      </a>

      ${sectionHead('Предложения', 'Акции')}
      ${renderFeed(PROMOTIONS.map((promotion) => `
        <button class="promo-card" data-promotion="${promotion.id}" style="--accent:${promotion.accent}" type="button">
          <img src="assets/${promotion.image}.jpg" alt="${promotion.title}">
          <i class="promo-shine"></i>
          <span class="promo-badge">${promotion.badge}</span>
          <div class="promo-body"><b>${promotion.title}</b><small>${promotion.subtitle}</small></div>
        </button>`).join(''))}

      ${sectionHead('Выбирайте', 'Категории')}
      <div class="tile-grid reveal">
        ${HOME_TILES.map((tile, index) => `
          <a class="tile tile-${index + 1}" href="#/menu/${tile.category}">
            <img src="assets/${tile.image}.jpg" alt=""><span>${tile.label}</span>${icon('chevron')}
          </a>`).join('')}
      </div>

      ${sectionHead('Только что в меню', 'Новинки', '<a class="section-link" href="#/menu">Всё меню</a>')}
      ${renderFeed(newProducts.map((product) => `
        <div class="feed-product" data-href="#/product/${product.id}">
          <div class="feed-product-media">
            <img src="assets/${product.image}.jpg" alt="${product.name}">${productBadge(product)}
            <button class="add-button" data-add="${product.id}" type="button" aria-label="Добавить">${icon('plus')}</button>
          </div>
          <b>${product.name}</b><small>${priceLabel(product)}</small>
        </div>`).join(''))}

      ${sectionHead('Заходите', 'Адреса')}
      ${renderLocationCard(mainLocation)}
      <a class="btn btn-glass reveal" href="#/places">${icon('places')}Все адреса и режим работы</a>

      ${sectionHead('Живая атмосфера', 'Атмосфера')}
      ${renderFeed(atmosphereCards)}
    </div>`;
}

function renderProductList() {
  const query = menuQuery.trim().toLowerCase();
  const categories = (menuCategory === 'all'
    ? MENU_CATEGORIES
    : MENU_CATEGORIES.filter((category) => category.id === menuCategory))
    .map((category) => ({
      ...category,
      products: category.products.filter((product) => !query || product.name.toLowerCase().includes(query))
    }))
    .filter((category) => category.products.length);

  if (!categories.length) return '<p class="empty-note">Ничего не найдено</p>';

  return categories.map((category) => `
    ${sectionHead(`${category.products.length} поз.`, category.name)}
    <div class="product-grid">
      ${category.products.map((product) => `
        <div class="product-card reveal" data-href="#/product/${product.id}">
          <div class="product-media">
            <img loading="lazy" src="assets/${product.image}.jpg" alt="${product.name}">
            ${productBadge(product)}
            <span class="price-tag">${priceLabel(product)}</span>
            <button class="add-button" data-add="${product.id}" type="button" title="+ Добавить" aria-label="Добавить">${icon('plus')}</button>
          </div>
          <div class="product-info"><b>${product.name}</b><small>${product.sizes.map((size) => size.label).join(' · ')}</small></div>
        </div>`).join('')}
    </div>`).join('');
}

function renderMenu() {
  const categories = [{ id: 'all', name: 'Всё' }, ...MENU_CATEGORIES];
  return `
    <div class="page">
      ${sectionHead('Всё для вас', 'Меню')}
      <label class="search">${icon('search')}<input id="menuSearch" type="search" placeholder="Поиск по меню" value="${menuQuery}"></label>
      <div class="category-bar"><div class="category-track" id="categoryTrack">
        ${categories.map((category) => `
          <button class="category ${category.id === menuCategory ? 'is-active' : ''}" data-category="${category.id}" type="button">
            <span class="category-icon">${icon(CATEGORY_ICONS[category.id])}</span>
            <span class="category-name">${category.name}</span>
          </button>`).join('')}
      </div></div>
      <div id="menuList">${renderProductList()}</div>
      <p class="note">Если у вас есть аллергия — предупредите кассира.</p>
    </div>`;
}

function renderProduct(productId) {
  const product = findProduct(productId);
  if (!product) return '<div class="page"><p class="empty-note">Позиция не найдена</p></div>';
  const drinkOptions = product.isDrink ? `
    <div class="option-label">Сироп +${SYRUP_PRICE} ₸</div>
    <div class="option-row" id="syrupOptions">
      <button class="pill is-active" data-index="-1" type="button">Без сиропа</button>
      ${SYRUPS.map((name, index) => `<button class="pill" data-index="${index}" type="button">${name}</button>`).join('')}
    </div>
    <div class="option-label">Молоко</div>
    <div class="option-row" id="milkOptions">
      <button class="pill is-active" data-index="0" type="button">Обычное</button>
      <button class="pill" data-index="1" type="button">Альтернативное +${ALT_MILK_PRICE} ₸</button>
    </div>` : '';

  return `
    <div class="page product-page">
      <div class="product-cover"><img src="assets/${product.image}.jpg" alt="${product.name}"></div>
      <div class="product-sheet">
        <h1>${product.name}</h1>
        <p>${product.description || product.categoryName}</p>
        <div class="option-label">${product.sizes.length > 1 ? 'Объём' : 'Порция'}</div>
        <div class="option-row" id="sizeOptions">
          ${product.sizes.map((size, index) => `<button class="pill ${index ? '' : 'is-active'}" data-index="${index}" type="button">${size.label} · ${formatPrice(size.price)}</button>`).join('')}
        </div>
        ${drinkOptions}
        <div class="buy-bar">
          <div class="buy-total"><small>Итого</small><b id="productTotal"></b></div>
          <button class="btn" id="addProduct" type="button">${icon('cart')}В корзину</button>
        </div>
      </div>
    </div>`;
}

function renderCart() {
  const head = sectionHead('Ваш заказ', 'Корзина');
  if (!cart.length) {
    return `<div class="page">${head}<div class="empty-state">${icon('cart')}<h3>Корзина пуста</h3><p>Добавьте напитки и выпечку из меню</p><a class="btn" href="#/menu">Перейти в меню</a></div></div>`;
  }
  return `
    <div class="page">
      ${head}
      <div class="card glass reveal">
        ${cart.map((line, index) => {
    const product = findProduct(line.productId);
    const extras = [
      product.sizes[line.sizeIndex].label,
      line.syrupIndex >= 0 ? SYRUPS[line.syrupIndex] : '',
      line.altMilk ? 'альт. молоко' : ''
    ].filter(Boolean).join(' · ');
    return `
          <div class="cart-line">
            <img src="assets/${product.image}.jpg" alt="">
            <div class="cart-line-info">
              <b>${product.name}</b><small>${extras}</small>
              <div class="stepper">
                <button data-line="${index}" data-step="-1" type="button" aria-label="Меньше">−</button>
                <span>${line.quantity}</span>
                <button data-line="${index}" data-step="1" type="button" aria-label="Больше">+</button>
              </div>
            </div>
            <em>${formatPrice(cartLinePrice(line) * line.quantity)}</em>
          </div>`;
  }).join('')}
      </div>
      <div class="card glass reveal cart-summary">
        <div class="row"><span>Позиций</span><b>${cartCount()}</b></div>
        <div class="cart-total"><span>Итого</span><b>${formatPrice(cartTotal())}</b></div>
      </div>
      <button class="btn reveal" id="checkoutButton" type="button">${icon('lock')}Оформить и оплатить</button>
      <button class="btn btn-glass reveal" id="clearCartButton" type="button">Очистить корзину</button>
    </div>`;
}

function renderLocationCard(location) {
  return `
    <div class="location-card reveal">
      <img src="assets/${location.image}.jpg" alt="${location.title}" loading="lazy">
      <div class="location-info">
        <h3>${location.title}</h3>
        ${location.note ? `<div class="location-note">${location.note}</div>` : ''}
        <div class="location-hours">${icon('clock')}<span>${location.hours}</span></div>
      </div>
      <a class="map-link" target="_blank" rel="noopener" href="${location.mapUrl}" aria-label="Открыть в 2GIS">2GIS</a>
    </div>`;
}

const renderPlaces = () => `<div class="page">${sectionHead('Режим работы', 'Адреса')}${LOCATIONS.map(renderLocationCard).join('')}</div>`;

function renderLoyalty() {
  return `
    <div class="page">
      ${sectionHead('Покажите бариста', 'Ваш QR-код')}
      <div class="card glass qr-card reveal">
        <div class="qr-logo">${logoMark()}</div>
        <div id="qrSlot"></div>
        <div class="qr-actions">
          <button class="btn" id="scanButton" type="button">${icon('qr')}[Демо] Сканировать у бариста</button>
          <button class="btn btn-glass" id="refreshQrButton" type="button">${icon('refresh')}Обновить QR</button>
        </div>
      </div>

      ${sectionHead('Купи 5 — 6-й в подарок', 'Карта 5+1', '<div class="counter" id="cupsCounter"></div>')}
      <div class="card glass reveal">
        <div class="cups-grid" id="cupsGrid"></div>
        <p class="cups-caption" id="cupsCaption"></p>
        <button class="btn reward-button" id="openRewardButton" type="button" hidden>Бесплатный напиток доступен — показать купон</button>
      </div>

      <div class="card glass reveal info-card">
        <div class="row"><span>Регистрация карты</span><b>бесплатно, на кассе</b></div>
        <div class="row"><span>Бонусы</span><b>10% с выпечки и десертов</b></div>
        <div class="row"><span>Накопления</span><b>не сгорают</b></div>
      </div>
    </div>`;
}

function renderProfile() {
  const history = state.history.slice(0, 12).map((entry) => `
    <div class="row"><span>${new Date(entry.time).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><b>${entry.text}</b></div>`).join('');
  return `
    <div class="page profile-page">
      ${sectionHead('Личный кабинет', 'Профиль')}
      <div class="profile-hero glass-gradient entrance" style="--delay:.05s">
        <div class="avatar"><img id="avatarImage" alt="Полина"></div>
        <h3>Полина</h3>
        <span class="status-pill">Постоянный гость</span>
      </div>
      <div class="stat-grid">
        <div class="stat-tile glass-gradient entrance" style="--delay:.2s"><span class="stat-icon">${icon('menu')}</span><b data-count="${state.totalDrinks}">0</b><small>напиток</small></div>
        <div class="stat-tile glass-gradient entrance" style="--delay:.3s"><span class="stat-icon">${icon('gift')}</span><b data-count="${state.freeDrinks}">0</b><small>бесплатных напитков</small></div>
        <div class="stat-tile glass-gradient entrance" style="--delay:.4s"><span class="stat-icon">${icon('qr')}</span><b data-count="${remainingDrinks()}">0</b><small>до бесплатного напитка</small></div>
      </div>
      ${sectionHead('Последние начисления', 'История заказов')}
      <div class="glass-gradient history-card entrance" style="--delay:.5s">${history || '<p class="empty-note">Пока пусто</p>'}</div>
    </div>`;
}

/* Loyalty logic */

function updateLoyaltySummary() {
  const counter = $('#cupsCounter');
  if (!counter) return;
  counter.innerHTML = `<b>${Math.min(state.cups, FREE_DRINK_THRESHOLD)}</b><span>/5</span>`;
  $('#cupsCaption').innerHTML = state.cups >= FREE_DRINK_THRESHOLD
    ? 'Следующий напиток — <b>бесплатно!</b>'
    : `До бесплатного напитка осталось: <b>${remainingDrinks()}</b>`;
  $('#openRewardButton').hidden = state.cups !== FREE_DRINK_THRESHOLD;
}

function fillCup(cupElement) {
  cupElement.querySelector('.cup-liquid').style.transform = 'translateY(42px)';
  cupElement.querySelectorAll('.cup-check').forEach((element) => { element.style.transform = 'scale(1)'; });
  const stream = cupElement.querySelector('.cup-stream');
  if (stream) {
    stream.animate([
      { opacity: 0, transform: 'scaleY(0)' },
      { opacity: 1, transform: 'scaleY(1)', offset: 0.1 },
      { opacity: 1, transform: 'scaleY(1)', offset: 0.85 },
      { opacity: 0, transform: 'scaleY(1)' }
    ], { duration: 3300, fill: 'forwards' });
  }
}

function renderCups(animateIndex = null) {
  const grid = $('#cupsGrid');
  if (!grid) return;
  grid.innerHTML = [0, 1, 2, 3, 4, 5].map((index) => {
    let status = 'empty';
    if (index < 5) status = index < state.cups ? 'filled' : 'empty';
    else if (state.cups > FREE_DRINK_THRESHOLD) status = 'gift';
    else if (state.cups === FREE_DRINK_THRESHOLD) status = 'ready';
    const active = status === 'filled' || status === 'gift';
    return `
      <div class="cup-slot">${renderCup({ status, animate: index === animateIndex, plusOne: index === 5 })}
        <small class="${active ? 'is-active' : ''}">${index === 5 ? 'Бесплатный' : `${index + 1}-й`}</small>
      </div>`;
  }).join('');
  updateLoyaltySummary();

  if (animateIndex !== null) {
    window.setTimeout(() => {
      const cupElement = $$('#cupsGrid .cup')[animateIndex];
      if (!cupElement) return;
      fillCup(cupElement);
      cupElement.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
        { duration: 3600, easing: 'ease-in-out' }
      );
    }, 80);
  }
}

function setQrControlsDisabled(disabled) {
  ['#scanButton', '#refreshQrButton'].forEach((selector) => {
    const button = $(selector);
    if (button) button.disabled = disabled;
  });
}

function generateQr(caption, onDone) {
  const slot = $('#qrSlot');
  if (!slot) return;
  window.clearInterval(timers.qrTick);
  window.clearTimeout(timers.qr);
  setQrControlsDisabled(true);

  let secondsLeft = QR_GENERATION_SECONDS;
  slot.innerHTML = `
    <div class="qr-frame is-generating" id="qrFrame">${buildQrSvg(`${state.cardId}${Date.now()}`, true)}<div class="qr-beam"></div></div>
    <p class="qr-caption" id="qrCaption"><span>${caption}</span><b id="qrTimer">${secondsLeft}</b></p>`;

  timers.qrTick = window.setInterval(() => {
    secondsLeft -= 1;
    const timer = $('#qrTimer');
    if (timer && secondsLeft >= 0) timer.textContent = secondsLeft;
  }, 1000);

  timers.qr = window.setTimeout(() => {
    window.clearInterval(timers.qrTick);
    const captionElement = $('#qrCaption');
    if (!captionElement) return;
    $('#qrFrame').classList.remove('is-generating');
    captionElement.innerHTML = `Покажите код бариста · карта ${state.cardId}`;
    setQrControlsDisabled(false);
    if (onDone) onDone();
  }, QR_GENERATION_SECONDS * 1000);
}

function creditDrink() {
  state.cups += 1;
  state.totalDrinks += 1;
  state.history.unshift({ time: Date.now(), text: `Напиток №${state.cups} зачтён` });
  saveState();
  renderCups(state.cups - 1);
  setQrControlsDisabled(true);
  window.setTimeout(() => {
    setQrControlsDisabled(false);
    const frame = $('#qrFrame');
    if (frame) frame.classList.remove('is-success');
  }, 3600);
  if (state.cups >= FREE_DRINK_THRESHOLD) window.setTimeout(showReward, 3900);
}

function scanDemo() {
  const frame = $('#qrFrame');
  if (!frame || frame.classList.contains('is-generating')) return;
  generateQr('Сканирование…', () => {
    $('#qrFrame').classList.add('is-success');
    playTone(880, 0.15);
    window.setTimeout(() => playTone(1320, 0.25), 130);
    if (navigator.vibrate) navigator.vibrate([60, 40, 150]);
    if (state.cups >= FREE_DRINK_THRESHOLD) {
      window.setTimeout(showReward, 700);
      return;
    }
    creditDrink();
  });
}

function showReward() {
  if (!$('#cupsGrid')) return;
  celebrate();
  openModal(`
    <div class="reward-glow"></div>
    <div class="reward-cup">${renderCup({ status: 'gift', animate: true })}</div>
    <h3>Вам доступен бесплатный напиток!</h3>
    <p>Оплачивать не нужно — просто покажите этот экран или QR-код бариста на кассе!</p>
    <div class="coupon-wrap">
      <div class="coupon">
        <div class="coupon-title">${logoMark()}<span>КУПОН · КАРТА ${state.cardId}</span></div>
        <div class="coupon-discount">100% СКИДКА</div>
        <div class="coupon-price">0 ₸</div>
        <i class="coupon-shine"></i>
      </div>
    </div>
    <button class="btn btn-big" id="claimButton" type="button">Забрать бесплатный кофе</button>`, 'modal-reward');
  window.setTimeout(() => {
    const cupElement = $('.reward-cup .cup');
    if (cupElement) fillCup(cupElement);
  }, 350);
  $('#claimButton').addEventListener('click', claimFreeDrink);
}

function claimFreeDrink() {
  closeModal();
  celebrate();
  state.cups = FREE_DRINK_THRESHOLD + 1;
  state.freeDrinks += 1;
  state.history.unshift({ time: Date.now(), text: 'Бесплатный напиток получен' });
  saveState();
  renderCups(FREE_DRINK_THRESHOLD);
  setQrControlsDisabled(true);
  timers.cupReset = window.setTimeout(() => {
    state.cups = 0;
    saveState();
    renderCups();
    setQrControlsDisabled(false);
  }, 4000);
}

/* Mounting */

function animateCount(element, target, delay) {
  const startAt = performance.now() + delay;
  (function step(now) {
    const progress = Math.min(1, Math.max(0, (now - startAt) / 900));
    element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(step);
  }(performance.now()));
}

function mountProfile() {
  const image = $('#avatarImage');
  const sources = ['assets/photo-avatar.jpg', 'assets/avatar.jpg'];
  let attempt = 0;
  image.addEventListener('error', () => {
    attempt += 1;
    if (attempt < sources.length) {
      image.src = sources[attempt];
    } else {
      image.replaceWith(Object.assign(document.createElement('div'), { innerHTML: logoMark('avatar-logo') }).firstChild);
    }
  });
  image.src = sources[0];
  $$('[data-count]').forEach((element, index) => animateCount(element, Number(element.dataset.count), 300 + index * 100));
}

function mountLoyalty() {
  renderCups();
  generateQr('Генерация защищённого QR-кода…');
  $('#refreshQrButton').addEventListener('click', () => generateQr('Генерация защищённого QR-кода…'));
  $('#scanButton').addEventListener('click', scanDemo);
  $('#openRewardButton').addEventListener('click', showReward);
}

function mountProduct(productId) {
  const product = findProduct(productId);
  if (!product) return;
  const selection = { sizeIndex: 0, syrupIndex: -1, altMilk: false };
  const refreshTotal = () => {
    $('#productTotal').textContent = formatPrice(
      product.sizes[selection.sizeIndex].price
      + (selection.syrupIndex >= 0 ? SYRUP_PRICE : 0)
      + (selection.altMilk ? ALT_MILK_PRICE : 0)
    );
  };
  const bindOptions = (selector, onSelect) => {
    const container = $(selector);
    if (!container) return;
    container.addEventListener('click', (event) => {
      const pill = event.target.closest('.pill');
      if (!pill) return;
      $$('.pill', container).forEach((item) => item.classList.toggle('is-active', item === pill));
      onSelect(Number(pill.dataset.index));
      refreshTotal();
    });
  };
  bindOptions('#sizeOptions', (index) => { selection.sizeIndex = index; });
  bindOptions('#syrupOptions', (index) => { selection.syrupIndex = index; });
  bindOptions('#milkOptions', (index) => { selection.altMilk = index === 1; });
  refreshTotal();
  $('#addProduct').addEventListener('click', (event) => addToCart(productId, selection, event.currentTarget));
}

function bindProductCards(root) {
  $$('[data-href]', root).forEach((card) => {
    card.addEventListener('click', (event) => {
      const addButton = event.target.closest('[data-add]');
      if (addButton) {
        event.stopPropagation();
        addToCart(addButton.dataset.add, {}, addButton);
        addButton.classList.add('is-done');
        window.setTimeout(() => addButton.classList.remove('is-done'), 900);
        return;
      }
      location.hash = card.dataset.href;
    });
  });
}

function mountMenu() {
  const refreshList = () => {
    const list = $('#menuList');
    list.innerHTML = renderProductList();
    bindProductCards(list);
    observeReveals(list);
  };
  $('#menuSearch').addEventListener('input', (event) => {
    menuQuery = event.target.value;
    refreshList();
  });
  $$('.category').forEach((button) => button.addEventListener('click', () => {
    menuCategory = button.dataset.category;
    $$('.category').forEach((item) => item.classList.toggle('is-active', item === button));
    button.parentNode.scrollTo({ left: button.offsetLeft - 60, behavior: 'smooth' });
    refreshList();
  }));
}

function mountCart() {
  if (!cart.length) return;
  $$('[data-line]').forEach((button) => button.addEventListener('click', () => {
    const line = cart[Number(button.dataset.line)];
    line.quantity += Number(button.dataset.step);
    if (line.quantity < 1) cart.splice(Number(button.dataset.line), 1);
    saveCart();
    const offset = window.scrollY;
    renderRoute();
    window.scrollTo(0, offset);
  }));
  $('#clearCartButton').addEventListener('click', () => {
    cart = [];
    saveCart();
    renderRoute();
  });
  $('#checkoutButton').addEventListener('click', () => {
    openModal(`
      <div class="modal-body modal-center">
        <div class="modal-icon">${icon('lock')}</div>
        <h3>Демо-режим</h3>
        <p>Оплата будет доступна в официальном мобильном приложении iOS / Android</p>
        <button class="btn" data-close type="button">Понятно</button>
      </div>`, 'modal-info');
    $('[data-close]').addEventListener('click', () => closeModal());
  });
}

function mountHome() {
  $$('[data-promotion]').forEach((card) => card.addEventListener('click', () => {
    card.classList.add('is-pressed');
    window.setTimeout(() => {
      card.classList.remove('is-pressed');
      openPromotion(card.dataset.promotion);
    }, 150);
  }));
}

/* Feeds with mouse dragging */

let dragFeed = null;
let dragStartX = 0;
let dragStartScroll = 0;
let dragDistance = 0;

window.addEventListener('pointerdown', (event) => {
  const feed = event.target.closest && event.target.closest('.feed');
  if (!feed || event.pointerType !== 'mouse') return;
  dragFeed = feed;
  dragStartX = event.clientX;
  dragStartScroll = feed.scrollLeft;
  dragDistance = 0;
});

window.addEventListener('pointermove', (event) => {
  if (!dragFeed) return;
  const offset = event.clientX - dragStartX;
  dragDistance = Math.max(dragDistance, Math.abs(offset));
  if (dragDistance > 5) dragFeed.classList.add('is-dragging');
  dragFeed.scrollLeft = dragStartScroll - offset;
});

window.addEventListener('pointerup', () => {
  if (!dragFeed) return;
  const feed = dragFeed;
  dragFeed = null;
  window.setTimeout(() => feed.classList.remove('is-dragging'), 0);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

function observeReveals(root) {
  $$('.reveal:not(.is-visible)', root).forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
    revealObserver.observe(element);
  });
}

/* Router */

const TAB_ORDER = ['home', 'menu', 'loyalty', 'cart', 'profile'];
const tabIndex = (tab) => (tab === 'places' ? TAB_ORDER.length : TAB_ORDER.indexOf(tab));

function parseHash() {
  const [, name = 'home', param = ''] = (location.hash.slice(1) || '/home').split('/');
  return { name, param };
}

function setBackdropScene(routeName) {
  const scene = SCENES[routeName] || 'home';
  document.body.dataset.scene = scene;
  $$('#backdrop .backdrop-layer').forEach((layer) => {
    const active = layer.dataset.scene === scene;
    layer.classList.toggle('is-active', active);
    if (layer.tagName === 'VIDEO') {
      if (active) layer.play().catch(() => {});
      else layer.pause();
    }
  });
}

function renderTabBar(activeTab) {
  $('#tabBar').innerHTML = TAB_BAR.map((tab) => `
    <a href="#/${tab.route}" class="tab ${tab.center ? 'tab-center' : ''} ${tab.route === activeTab ? 'is-active' : ''}" ${tab.ariaLabel ? `aria-label="${tab.ariaLabel}"` : ''}>
      ${icon(tab.icon)}${tab.label}${tab.badge ? '<span class="tab-badge" id="cartBadge"></span>' : ''}
    </a>`).join('');
  updateCartBadge();
}

function renderRoute() {
  Object.values(timers).forEach((timer) => { window.clearTimeout(timer); window.clearInterval(timer); });
  closeModal(true);

  const { name, param } = parseHash();
  const knownRoutes = ['home', 'menu', 'product', 'loyalty', 'cart', 'profile', 'places'];
  const routeName = knownRoutes.includes(name) ? name : 'home';
  const hash = location.hash.slice(1) || '/home';
  if (routeName === 'menu' && MENU_CATEGORIES.some((category) => category.id === param)) {
    menuCategory = param;
    menuQuery = '';
  }

  const activeTab = routeName === 'product' ? 'menu' : routeName;
  const previousEntry = routeHistory[routeHistory.length - 2];
  const goingBack = previousEntry === hash
    || (routeName !== 'product' && currentTab !== 'product' && tabIndex(activeTab) < tabIndex(currentTab));
  if (previousEntry === hash) routeHistory.pop();
  else if (routeHistory[routeHistory.length - 1] !== hash) routeHistory.push(hash);
  document.body.dataset.direction = goingBack ? 'back' : 'forward';

  const views = {
    home: renderHome,
    menu: renderMenu,
    product: () => renderProduct(param),
    loyalty: renderLoyalty,
    cart: renderCart,
    profile: renderProfile,
    places: renderPlaces
  };
  view.innerHTML = views[routeName]();
  window.scrollTo(0, 0);
  currentTab = routeName === 'product' ? 'product' : activeTab;

  $('#appHeader').classList.toggle('has-back', routeName !== 'home');
  $('#appHeader').classList.remove('is-scrolled');
  setBackdropScene(routeName);
  renderTabBar(activeTab);

  if (routeName === 'home') mountHome();
  if (routeName === 'menu') mountMenu();
  if (routeName === 'product') mountProduct(param);
  if (routeName === 'loyalty') mountLoyalty();
  if (routeName === 'cart') mountCart();
  if (routeName === 'profile') mountProfile();

  bindProductCards(view);
  $$('.feed-arrow', view).forEach((arrow) => arrow.addEventListener('click', () => {
    arrow.parentNode.querySelector('.feed').scrollBy({ left: Number(arrow.dataset.direction) * 260, behavior: 'smooth' });
  }));
  observeReveals(view);
}

function initialize() {
  setupLogoSymbol();
  $('#backButton').innerHTML = icon('back');
  $('#refreshButton').innerHTML = icon('refresh');
  $('#backButton').addEventListener('click', () => {
    if (routeHistory.length > 1) history.back();
    else location.hash = '#/home';
  });
  $('#refreshButton').addEventListener('click', () => location.reload());
  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('scroll', () => {
    $('#appHeader').classList.toggle('is-scrolled', window.scrollY > 30);
  }, { passive: true });
  renderRoute();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

initialize();
