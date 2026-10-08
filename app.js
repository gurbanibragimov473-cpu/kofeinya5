'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const formatPrice = (value) => `${value.toLocaleString('ru-RU')} ₸`;

const FREE_DRINK_AT = 5;
const SYRUP_PRICE = 250;
const ALT_MILK_PRICE = 690;
const QR_DELAY_SECONDS = 4;
const STATE_KEY = 'kofeynya5.state';
const CART_KEY = 'kofeynya5.cart';

const ICONS = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  menu: '<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 9h2a2 2 0 0 1 0 5h-2M8 2v3M12 2v3"/>',
  qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4M14 18h2"/>',
  pin: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cart: '<path d="M3 4h2l2.4 11h10.2L20 7H6.5"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
  route: '<path d="M12 2.6l9.4 9.4-9.4 9.4L2.6 12z"/><path d="M8.5 14v-2.2a1.8 1.8 0 0 1 1.8-1.8H15m0 0l-2-2m2 2l-2 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  history: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  play: '<path d="M8 5l11 7-11 7z"/>'
};

const TABS = [
  { route: 'home', label: 'Главная', icon: 'home' },
  { route: 'menu', label: 'Меню', icon: 'menu' },
  { route: 'loyalty', label: '', icon: 'qr', center: true },
  { route: 'cafes', label: 'Кофейни', icon: 'pin' },
  { route: 'profile', label: 'Профиль', icon: 'user' }
];

const PAGE_TITLES = { menu: 'Меню', cafes: 'Кофейни', loyalty: 'Оплата', profile: 'Настройки', cart: 'Корзина', product: 'Меню' };

const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const logoMark = (className = '') => `<svg class="logo-mark ${className}" aria-hidden="true"><use href="#logo-symbol" width="100%" height="100%"/></svg>`;

/* Storage */

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
    // storage may be unavailable in private mode
  }
}

function defaultState() {
  return {
    cups: 1,
    totalDrinks: 1,
    freeDrinks: 0,
    cardId: `N5-${Math.floor(1000 + Math.random() * 9000)}`,
    history: [{ time: Date.now() - 2 * 86400000, text: 'Напиток №1 зачтён' }]
  };
}

let state = Object.assign(defaultState(), readStorage(STATE_KEY, {}));
if (state.cups > FREE_DRINK_AT) state.cups = 0;
let cart = readStorage(CART_KEY, []);
let menuCategory = 'all';
let menuQuery = '';
let currentRoute = 'home';
let qrTimer = null;
let qrCountdown = null;
let toastTimer = null;

const view = $('#view');
const saveState = () => writeStorage(STATE_KEY, state);
const saveCart = () => writeStorage(CART_KEY, cart);
const drinksLeft = () => Math.max(0, FREE_DRINK_AT - state.cups);

/* Cart */

const findProduct = (id) => ALL_PRODUCTS.find((product) => product.id === id);
const cartCount = () => cart.reduce((sum, line) => sum + line.quantity, 0);

function linePrice(line) {
  const product = findProduct(line.productId);
  return product.sizes[line.sizeIndex].price
    + (line.syrupIndex >= 0 ? SYRUP_PRICE : 0)
    + (line.altMilk ? ALT_MILK_PRICE : 0);
}

const cartTotal = () => cart.reduce((sum, line) => sum + linePrice(line) * line.quantity, 0);

function addToCart(productId, options = {}) {
  const { sizeIndex = 0, syrupIndex = -1, altMilk = false } = options;
  const line = cart.find((item) => item.productId === productId
    && item.sizeIndex === sizeIndex && item.syrupIndex === syrupIndex && item.altMilk === altMilk);
  if (line) line.quantity += 1;
  else cart.push({ productId, sizeIndex, syrupIndex, altMilk, quantity: 1 });
  saveCart();
  updateCartCount();
  showToast(`Добавлено: ${findProduct(productId).name}`);
}

function updateCartCount() {
  $('#cartCount').textContent = cartCount() || '';
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

/* Modal */

let modalTimer = null;

function openModal(html) {
  const modal = $('#modal');
  clearTimeout(modalTimer);
  modal.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">${html}</div>`;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  void modal.offsetWidth;
  modal.classList.add('is-open');
  $$('[data-close]', modal).forEach((button) => button.addEventListener('click', closeModal));
}

function closeModal() {
  const modal = $('#modal');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  clearTimeout(modalTimer);
  modalTimer = setTimeout(() => { modal.innerHTML = ''; }, 250);
}

$('#modal').addEventListener('click', (event) => {
  if (event.target.id === 'modal') closeModal();
});

/* Templates */

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Доброе утро';
  if (hour >= 11 && hour < 17) return 'Добрый день';
  if (hour >= 17 && hour < 23) return 'Добрый вечер';
  return 'Спокойной ночи';
}

const priceLabel = (product) => `${product.sizes.length > 1 ? 'от ' : ''}${formatPrice(product.sizes[0].price)}`;
const badgeLabel = (product) => (product.badge ? `<span class="badge">${product.badge === 'hit' ? 'HIT' : 'NEW'}</span>` : '');

function renderProductRow(product) {
  return `
    <div class="item-row" data-product="${product.id}">
      <img src="assets/${product.image}.jpg" alt="${product.name}" loading="lazy">
      <div class="item-info">
        <b>${product.name}${badgeLabel(product)}</b>
        <small>${product.sizes.map((size) => size.label).join(' · ')}</small>
        <span class="item-price">${priceLabel(product)}</span>
      </div>
      <button class="add-button" data-add="${product.id}" type="button" aria-label="Добавить в корзину">${icon('plus')}</button>
    </div>`;
}

function renderRing() {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const progress = Math.min(state.cups, FREE_DRINK_AT) / FREE_DRINK_AT;
  const common = `cx="75" cy="75" r="${radius}" fill="none" stroke-width="12" stroke-linecap="round" transform="rotate(135 75 75)"`;
  return `
    <div class="ring">
      <svg class="ring-arc" viewBox="0 0 150 150" aria-hidden="true">
        <circle ${common} stroke="#555" stroke-dasharray="${arc} ${circumference}"/>
        <circle ${common} stroke="#46a468" stroke-dasharray="${arc * progress} ${circumference}"/>
      </svg>
      <svg class="ring-cup" aria-hidden="true"><use href="#cup-symbol" width="100%" height="100%"/></svg>
      <div class="ring-label">${Math.min(state.cups, FREE_DRINK_AT)} / ${FREE_DRINK_AT}</div>
    </div>`;
}

/* Views */

function renderHome() {
  const novelties = ALL_PRODUCTS.filter((product) => product.badge === 'new');
  const banners = PROMOTIONS.map((promotion) => `
    <button class="banner" data-promotion="${promotion.id}" type="button">
      <img src="assets/${promotion.image}.jpg" alt="${promotion.title}">
      <div><b>${promotion.title}</b><span>${promotion.subtitle}</span></div>
    </button>`).join('');
  const videos = HOME_VIDEOS.map((item) => `
    <div class="video-card" data-video>
      <video src="assets/${item.source}.mp4" poster="assets/${item.source}.jpg" preload="none" loop playsinline></video>
      <button class="play-button" type="button" aria-label="Смотреть видео">${icon('play')}</button>
      <div class="video-caption">${item.title}</div>
    </div>`).join('');
  const dots = (count) => `<div class="dots">${Array.from({ length: count }, (_, index) => `<i class="${index ? '' : 'is-active'}"></i>`).join('')}</div>`;

  return `
    <div class="home-top">
      <div class="balance">
        <div>
          <small>Накоплено напитков</small>
          <strong>${state.cups}</strong>
          <p>${state.cups < FREE_DRINK_AT ? `До бесплатного напитка: ${drinksLeft()}` : 'Следующий напиток — бесплатно'}</p>
        </div>
        ${renderRing()}
      </div>
    </div>
    <div class="sheet">
      <div class="section-row"><h2>Видео</h2></div>
      <div class="carousel" data-carousel>${videos}</div>
      ${dots(HOME_VIDEOS.length)}

      <div class="section-row"><h2>Акции</h2></div>
      <div class="carousel" data-carousel>${banners}</div>
      ${dots(PROMOTIONS.length)}

      <div class="section-row"><h2>Новинки</h2><a href="#/menu">Все ${icon('arrow')}</a></div>
      <div class="circles">
        ${novelties.map((product) => `
          <a class="circle-item" href="#/product/${product.id}">
            <img src="assets/${product.image}.jpg" alt="${product.name}" loading="lazy">
            <span>${product.name}</span>
          </a>`).join('')}
      </div>
    </div>`;
}

function renderProductList() {
  const query = menuQuery.trim().toLowerCase();
  const categories = (menuCategory === 'all' ? MENU_CATEGORIES : MENU_CATEGORIES.filter((category) => category.id === menuCategory))
    .map((category) => ({ ...category, products: category.products.filter((product) => !query || product.name.toLowerCase().includes(query)) }))
    .filter((category) => category.products.length);
  if (!categories.length) return '<p class="empty-note">Ничего не найдено</p>';
  return categories.map((category) => `
    <h2 class="list-title">${category.name}</h2>
    ${category.products.map(renderProductRow).join('')}`).join('');
}

function renderMenu() {
  const categories = [{ id: 'all', name: 'Все' }, ...MENU_CATEGORIES];
  return `
    <div class="chips">
      ${categories.map((category) => `<button class="chip ${category.id === menuCategory ? 'is-active' : ''}" data-category="${category.id}" type="button">${category.name}</button>`).join('')}
    </div>
    <label class="search">${icon('search')}<input id="menuSearch" type="search" placeholder="Поиск" value="${menuQuery}"></label>
    <div id="menuList">${renderProductList()}</div>
    <p class="pad" style="margin-top:22px;color:#8a8a8a;font-size:14px">Если у вас есть аллергия — предупредите кассира.</p>`;
}

function renderProduct(productId) {
  const product = findProduct(productId);
  if (!product) return '<p class="empty-note">Позиция не найдена</p>';
  const drinkOptions = product.isDrink ? `
    <div class="option-title">Сироп +${SYRUP_PRICE} ₸</div>
    <div class="options" id="syrupOptions">
      <button class="option is-active" data-index="-1" type="button">Без сиропа</button>
      ${SYRUPS.map((name, index) => `<button class="option" data-index="${index}" type="button">${name}</button>`).join('')}
    </div>
    <div class="option-title">Молоко</div>
    <div class="options" id="milkOptions">
      <button class="option is-active" data-index="0" type="button">Обычное</button>
      <button class="option" data-index="1" type="button">Альтернативное +${ALT_MILK_PRICE} ₸</button>
    </div>` : '';
  return `
    <img class="product-photo" src="assets/${product.image}.jpg" alt="${product.name}">
    <div class="product-body">
      <h2>${product.name}</h2>
      <p>${product.description || product.categoryName}</p>
      <div class="option-title">${product.sizes.length > 1 ? 'Объём' : 'Порция'}</div>
      <div class="options" id="sizeOptions">
        ${product.sizes.map((size, index) => `<button class="option ${index ? '' : 'is-active'}" data-index="${index}" type="button">${size.label} · ${formatPrice(size.price)}</button>`).join('')}
      </div>
      ${drinkOptions}
    </div>
    <div class="buy-bar"><button class="btn" id="buyButton" type="button"></button></div>`;
}

function renderCart() {
  if (!cart.length) {
    return `<div class="empty-state"><h2>Корзина пуста</h2><p>Добавьте напитки и выпечку из меню</p><a class="btn" href="#/menu">Перейти в меню</a></div>`;
  }
  const rows = cart.map((line, index) => {
    const product = findProduct(line.productId);
    const extras = [product.sizes[line.sizeIndex].label, line.syrupIndex >= 0 ? SYRUPS[line.syrupIndex] : '', line.altMilk ? 'альт. молоко' : '']
      .filter(Boolean).join(' · ');
    return `
      <div class="cart-row">
        <img src="assets/${product.image}.jpg" alt="">
        <div class="item-info">
          <b>${product.name}</b>
          <small>${extras}</small>
          <div class="stepper">
            <button type="button" data-line="${index}" data-step="-1" aria-label="Меньше">−</button>
            <span>${line.quantity}</span>
            <button type="button" data-line="${index}" data-step="1" aria-label="Больше">+</button>
          </div>
        </div>
        <div class="cart-sum">${formatPrice(linePrice(line) * line.quantity)}</div>
      </div>`;
  }).join('');
  return `
    ${rows}
    <div class="total-row"><span>Итого</span><span>${formatPrice(cartTotal())}</span></div>
    <div class="pad">
      <button class="btn" id="checkoutButton" type="button">Оформить и оплатить</button>
      <button class="link-button" id="clearCartButton" type="button">Очистить корзину</button>
    </div>`;
}

function renderCafe(location, index) {
  return `
    <div class="cafe-row">
      <div class="cafe-info">
        <h3>${location.title}</h3>
        <div class="hours">${location.hours}</div>
        <div class="address">${location.address}</div>
      </div>
      <div class="cafe-actions">
        <a class="round-icon" target="_blank" rel="noopener" href="${routeUrl(location)}" aria-label="Проложить маршрут">${icon('route')}</a>
        <button class="round-icon" type="button" data-cafe="${index}" aria-label="Подробнее">${icon('info')}</button>
      </div>
    </div>`;
}

const routeUrl = (location) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;

function renderCafeList() {
  const query = menuQuery.trim().toLowerCase();
  const items = LOCATIONS.map((location, index) => ({ location, index }))
    .filter(({ location }) => !query || `${location.title} ${location.address}`.toLowerCase().includes(query));
  return items.length ? items.map(({ location, index }) => renderCafe(location, index)).join('') : '<p class="empty-note">Ничего не найдено</p>';
}

function renderCafes() {
  return `
    <iframe class="map-frame" title="Карта Павлодара" loading="lazy"
      src="https://www.openstreetmap.org/export/embed.html?bbox=76.92%2C52.26%2C77.02%2C52.31&amp;layer=mapnik"></iframe>
    <label class="search">${icon('search')}<input id="cafeSearch" type="search" placeholder="Поиск кофейни"></label>
    <div id="cafeList">${renderCafeList()}</div>`;
}

/* Loyalty */

function renderStamp(filled, last) {
  return `
    <div class="stamp ${filled ? 'is-filled' : ''}">
      <svg viewBox="0 0 40 52" aria-hidden="true">
        <path d="M6 14h28l-3.4 34a3 3 0 0 1-3 2.7H12.4a3 3 0 0 1-3-2.7z"/>
        <rect x="3" y="8" width="34" height="7" rx="3"/>
        <path class="tick" d="M14 31l5 5 9-10"/>
      </svg>
      ${last ? 'Бесплатный' : ''}
    </div>`;
}

function renderLoyalty() {
  return `
    <div class="pass">
      <div class="pass-logo">${logoMark()}</div>
      <div class="pass-text"><small>Карта гостя</small><b>${state.cardId}</b></div>
    </div>
    <div class="pass-score" id="passScore"></div>
    <span class="pill-note">Каждый 6-й напиток — бесплатно</span>
    <div class="qr-area" id="qrArea"></div>
    <div class="pad">
      <button class="btn btn-outline" id="refreshQr" type="button">Сгенерировать код</button>
      <button class="btn" id="scanQr" type="button" style="margin-top:18px">Сканировать QR</button>
    </div>
    <div class="cups-panel">
      <div class="cups-head"><h3>Карта 5+1</h3><span id="cupsCounter"></span></div>
      <div class="stamps" id="stamps"></div>
      <p class="cups-caption" id="cupsCaption"></p>
      <button class="btn" id="showReward" type="button" style="margin-top:16px" hidden>Показать купон</button>
    </div>
    <div class="rules">
      <div class="rule-row"><span>Регистрация карты</span><b>бесплатно, на кассе</b></div>
      <div class="rule-row"><span>Бонусы</span><b>10% с выпечки и десертов</b></div>
      <div class="rule-row"><span>Накопления</span><b>не сгорают</b></div>
    </div>`;
}

function renderProfile() {
  return `
    <div class="profile-head">
      <div class="avatar"><img id="avatarImage" alt="Полина"></div>
      <div><h2>Полина</h2><p>Постоянный гость</p></div>
    </div>
    <div class="stats">
      <div class="stat"><b>${state.totalDrinks}</b><span>напиток</span></div>
      <div class="stat"><b>${state.freeDrinks}</b><span>бесплатных напитков</span></div>
      <div class="stat"><b>${drinksLeft()}</b><span>до бесплатного напитка</span></div>
    </div>
    <h2 class="section-title pad">Моя учётная запись</h2>
    <button class="menu-row" id="historyRow" type="button">${icon('history')}<span>История заказов</span>${icon('chevron')}</button>
    <a class="menu-row" href="#/loyalty">${icon('qr')}<span>Карта лояльности</span>${icon('chevron')}</a>
    <a class="menu-row" href="#/cafes">${icon('pin')}<span>Адреса кофеен</span>${icon('chevron')}</a>
    <h2 class="section-title pad">Свяжитесь с нами</h2>
    <a class="menu-row" href="tel:${CHAIN_PHONE.tel}">${icon('phone')}<span>${CHAIN_PHONE.label}</span>${icon('chevron')}</a>
    <a class="menu-row" target="_blank" rel="noopener" href="https://instagram.com/pekarnya_n5">${icon('instagram')}<span>Instagram</span>${icon('chevron')}</a>
    <div class="pad" style="margin-top:28px"><button class="btn" id="resetDemo" type="button">Сбросить демо-данные</button></div>
    <p class="version">Кофейня №5 · версия 1.0</p>`;
}

function buildQr(token) {
  let seed = 0;
  for (const character of token) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const size = 29;
  let cells = '';
  const finder = (x, y) => {
    cells += `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const reserved = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
      if (!reserved && next() > 0.5) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  finder(0, 0);
  finder(22, 0);
  finder(0, 22);
  return `<svg viewBox="0 0 29 29" shape-rendering="crispEdges" fill="#000" aria-label="QR-код">${cells}</svg>`;
}

function updateLoyalty() {
  if (!$('#stamps')) return;
  $('#passScore').innerHTML = `${Math.min(state.cups, FREE_DRINK_AT)} <span>из ${FREE_DRINK_AT}</span>`;
  $('#cupsCounter').textContent = `${Math.min(state.cups, FREE_DRINK_AT)} / ${FREE_DRINK_AT}`;
  $('#stamps').innerHTML = [0, 1, 2, 3, 4, 5].map((index) => renderStamp(index < state.cups || (index === 5 && state.cups > FREE_DRINK_AT), index === 5)).join('');
  $('#cupsCaption').innerHTML = state.cups >= FREE_DRINK_AT
    ? 'Следующий напиток — <b>бесплатно</b>'
    : `До бесплатного напитка осталось: <b>${drinksLeft()}</b>`;
  $('#showReward').hidden = state.cups !== FREE_DRINK_AT;
}

function setQrBusy(busy) {
  $('#refreshQr').disabled = busy;
  $('#scanQr').disabled = busy;
}

function generateQr(label, onDone) {
  const area = $('#qrArea');
  if (!area) return;
  clearTimeout(qrTimer);
  clearInterval(qrCountdown);
  setQrBusy(true);
  let seconds = QR_DELAY_SECONDS;
  area.innerHTML = `<div class="qr-wait"><div class="spinner spinner-dark"></div><p>${label} <b id="qrSeconds">${seconds}</b> с</p></div>`;
  qrCountdown = setInterval(() => {
    seconds -= 1;
    const element = $('#qrSeconds');
    if (element && seconds >= 0) element.textContent = seconds;
  }, 1000);
  qrTimer = setTimeout(() => {
    clearInterval(qrCountdown);
    if (!$('#qrArea')) return;
    $('#qrArea').innerHTML = buildQr(`${state.cardId}${Date.now()}`);
    setQrBusy(false);
    if (onDone) onDone();
  }, QR_DELAY_SECONDS * 1000);
}

function creditDrink() {
  if (state.cups >= FREE_DRINK_AT) {
    showReward();
    return;
  }
  state.cups += 1;
  state.totalDrinks += 1;
  state.history.unshift({ time: Date.now(), text: `Напиток №${state.cups} зачтён` });
  saveState();
  updateLoyalty();
  if (state.cups >= FREE_DRINK_AT) setTimeout(showReward, 900);
}

function showReward() {
  if (!$('#stamps')) return;
  openModal(`
    <div class="dialog-body dialog-center">
      <h3>Вам доступен бесплатный напиток!</h3>
      <p>Оплачивать не нужно — просто покажите этот экран или QR-код бариста на кассе!</p>
      <div class="coupon">
        <small>Купон · карта ${state.cardId}</small>
        <strong>100% СКИДКА</strong>
        <span>0 ₸</span>
      </div>
      <button class="btn" id="claimReward" type="button">Забрать бесплатный кофе</button>
    </div>`);
  $('#claimReward').addEventListener('click', () => {
    closeModal();
    state.cups = 0;
    state.freeDrinks += 1;
    state.history.unshift({ time: Date.now(), text: 'Бесплатный напиток получен' });
    saveState();
    updateLoyalty();
  });
}

function openCafe(index) {
  const location = LOCATIONS[index];
  const today = (new Date().getDay() + 6) % 7;
  const phone = location.phone || CHAIN_PHONE;
  const week = DAY_NAMES.map((day, dayIndex) => `<div class="${dayIndex === today ? 'is-today' : ''}"><span>${day}</span><span>${location.week[dayIndex]}</span></div>`).join('');
  openModal(`
    <img class="dialog-cover" src="assets/${location.image}.jpg" alt="${location.title}">
    <div class="dialog-body">
      <h3>${location.title}</h3>
      <div class="detail"><small>Адрес</small><b>${location.address}</b></div>
      ${location.landmark ? `<div class="detail"><small>Ориентир</small><b>${location.landmark}</b></div>` : ''}
      <div class="detail"><small>График работы</small></div>
      <div class="week">${week}</div>
      <a class="btn" target="_blank" rel="noopener" href="${routeUrl(location)}">Проложить маршрут</a>
      <div class="dialog-actions">
        <a class="btn btn-dark" href="tel:${phone.tel}">Позвонить</a>
        <a class="btn btn-dark" target="_blank" rel="noopener" href="${location.mapUrl}">2GIS</a>
      </div>
      <button class="link-button" data-close type="button">Закрыть</button>
    </div>`);
}

function openPromotion(promotionId) {
  const promotion = PROMOTIONS.find((item) => item.id === promotionId);
  openModal(`
    <img class="dialog-cover" src="assets/${promotion.image}.jpg" alt="">
    <div class="dialog-body">
      <h3>${promotion.title}</h3>
      <p>${promotion.details}</p>
      <button class="btn" id="promotionAction" type="button">${promotion.actionLabel}</button>
      <button class="link-button" data-close type="button">Закрыть</button>
    </div>`);
  $('#promotionAction').addEventListener('click', () => {
    closeModal();
    location.hash = `#${promotion.route}`;
  });
}

function openHistory() {
  const rows = state.history.slice(0, 20).map((entry) => `
    <div class="history-row"><b>${entry.text}</b><span>${new Date(entry.time).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>`).join('');
  openModal(`<div class="dialog-body"><h3>История заказов</h3>${rows || '<p>Пока пусто</p>'}<button class="link-button" data-close type="button">Закрыть</button></div>`);
}

/* Mounting */

function mountCarousels() {
  $$('[data-carousel]').forEach((carousel) => {
    const dots = $$('i', carousel.nextElementSibling);
    carousel.addEventListener('scroll', () => {
      const step = carousel.firstElementChild.getBoundingClientRect().width + 14;
      const active = Math.round(carousel.scrollLeft / step);
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === active));
    }, { passive: true });
  });
  $$('[data-video]').forEach((card) => {
    const video = $('video', card);
    card.addEventListener('click', () => {
      if (video.paused) {
        $$('[data-video] video').forEach((other) => other.pause());
        $$('[data-video]').forEach((other) => other.classList.remove('is-playing'));
        video.play();
        card.classList.add('is-playing');
      } else {
        video.pause();
        card.classList.remove('is-playing');
      }
    });
  });
  $$('[data-promotion]').forEach((banner) => banner.addEventListener('click', () => openPromotion(banner.dataset.promotion)));
}

function bindProductRows(root) {
  $$('[data-product]', root).forEach((row) => row.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add]');
    if (addButton) {
      addToCart(addButton.dataset.add);
      return;
    }
    location.hash = `#/product/${row.dataset.product}`;
  }));
}

function mountMenu() {
  const list = $('#menuList');
  bindProductRows(list);
  $('#menuSearch').addEventListener('input', (event) => {
    menuQuery = event.target.value;
    list.innerHTML = renderProductList();
    bindProductRows(list);
  });
  $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
    menuCategory = chip.dataset.category;
    $$('.chip').forEach((item) => item.classList.toggle('is-active', item === chip));
    list.innerHTML = renderProductList();
    bindProductRows(list);
  }));
}

function mountProduct(productId) {
  const product = findProduct(productId);
  if (!product) return;
  const selection = { sizeIndex: 0, syrupIndex: -1, altMilk: false };
  const buyButton = $('#buyButton');
  const refresh = () => {
    const total = product.sizes[selection.sizeIndex].price
      + (selection.syrupIndex >= 0 ? SYRUP_PRICE : 0)
      + (selection.altMilk ? ALT_MILK_PRICE : 0);
    buyButton.textContent = `В корзину · ${formatPrice(total)}`;
  };
  const bind = (selector, apply) => {
    const group = $(selector);
    if (!group) return;
    group.addEventListener('click', (event) => {
      const option = event.target.closest('.option');
      if (!option) return;
      $$('.option', group).forEach((item) => item.classList.toggle('is-active', item === option));
      apply(Number(option.dataset.index));
      refresh();
    });
  };
  bind('#sizeOptions', (index) => { selection.sizeIndex = index; });
  bind('#syrupOptions', (index) => { selection.syrupIndex = index; });
  bind('#milkOptions', (index) => { selection.altMilk = index === 1; });
  buyButton.addEventListener('click', () => addToCart(productId, selection));
  refresh();
}

function mountCart() {
  if (!cart.length) return;
  $$('[data-line]').forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.line);
    cart[index].quantity += Number(button.dataset.step);
    if (cart[index].quantity < 1) cart.splice(index, 1);
    saveCart();
    const offset = window.scrollY;
    render();
    window.scrollTo(0, offset);
  }));
  $('#clearCartButton').addEventListener('click', () => {
    cart = [];
    saveCart();
    render();
  });
  $('#checkoutButton').addEventListener('click', () => openModal(`
    <div class="dialog-body dialog-center">
      <h3>Демо-режим</h3>
      <p>Оплата будет доступна в официальном мобильном приложении iOS / Android</p>
      <button class="btn" data-close type="button">Понятно</button>
    </div>`));
}

function mountCafes() {
  const list = $('#cafeList');
  const bind = () => $$('[data-cafe]', list).forEach((button) => button.addEventListener('click', () => openCafe(Number(button.dataset.cafe))));
  bind();
  $('#cafeSearch').addEventListener('input', (event) => {
    menuQuery = event.target.value;
    list.innerHTML = renderCafeList();
    bind();
  });
}

function mountLoyalty() {
  updateLoyalty();
  generateQr('Генерация защищённого QR-кода…');
  $('#refreshQr').addEventListener('click', () => generateQr('Генерация защищённого QR-кода…'));
  $('#scanQr').addEventListener('click', () => generateQr('Сканирование…', creditDrink));
  $('#showReward').addEventListener('click', showReward);
}

function mountProfile() {
  const image = $('#avatarImage');
  image.addEventListener('error', () => {
    image.replaceWith(Object.assign(document.createElement('div'), { innerHTML: icon('user') }).firstChild);
  });
  image.src = 'assets/photo-avatar.jpg';
  $('#historyRow').addEventListener('click', openHistory);
  $('#resetDemo').addEventListener('click', () => {
    state = defaultState();
    saveState();
    render();
  });
}

/* Router */

const ROUTES = {
  home: { render: renderHome, mount: () => mountCarousels() },
  menu: { render: renderMenu, mount: mountMenu },
  product: { render: (param) => renderProduct(param), mount: (param) => mountProduct(param) },
  cart: { render: renderCart, mount: mountCart },
  cafes: { render: renderCafes, mount: mountCafes },
  loyalty: { render: renderLoyalty, mount: mountLoyalty },
  profile: { render: renderProfile, mount: mountProfile }
};

function parseHash() {
  const [, name = 'home', param = ''] = (location.hash.slice(1) || '/home').split('/');
  return { name: ROUTES[name] ? name : 'home', param };
}

function renderTabBar(activeRoute) {
  const active = activeRoute === 'product' ? 'menu' : activeRoute;
  $('#tabBar').innerHTML = TABS.map((tab) => `
    <a class="tab ${tab.center ? 'tab-center' : ''} ${tab.route === active ? 'is-active' : ''}" href="#/${tab.route}" ${tab.center ? 'aria-label="QR и лояльность"' : ''}>
      ${icon(tab.icon)}${tab.label}
    </a>`).join('');
}

function render() {
  clearTimeout(qrTimer);
  clearInterval(qrCountdown);
  closeModal();
  const { name, param } = parseHash();
  if (name === 'menu' && MENU_CATEGORIES.some((category) => category.id === param)) menuCategory = param;
  if (name === 'cafes') menuQuery = '';
  currentRoute = name;
  view.innerHTML = ROUTES[name].render(param);
  view.style.animation = 'none';
  void view.offsetWidth;
  view.style.animation = '';
  window.scrollTo(0, 0);
  $('#pageTitle').textContent = name === 'home' ? greeting() : PAGE_TITLES[name];
  $('#appBar').classList.toggle('has-back', name === 'product' || name === 'cart');
  renderTabBar(name);
  ROUTES[name].mount(param);
  if (name === 'home') bindProductRows(view);
}

function hideSplash() {
  const splash = $('#splash');
  splash.classList.add('is-hidden');
  document.body.classList.remove('is-loading');
  setTimeout(() => splash.remove(), 450);
}

function init() {
  const symbol = $('#logo-symbol');
  symbol.setAttribute('viewBox', LOGO.vb.join(' '));
  symbol.innerHTML = `<path d="${LOGO.d}"/>`;
  $('#backButton').innerHTML = icon('back');
  $('#refreshButton').innerHTML = icon('refresh');
  $('#cartButton').insertAdjacentHTML('afterbegin', icon('cart'));
  $('#backButton').addEventListener('click', () => (history.length > 1 ? history.back() : (location.hash = '#/menu')));
  $('#refreshButton').addEventListener('click', () => location.reload());
  window.addEventListener('hashchange', render);
  updateCartCount();
  render();
  setTimeout(hideSplash, 1800);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
