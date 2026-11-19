// =============================
// Filü · Tienda de carros montables
// =============================

// Número de WhatsApp de la tienda (código de país + número, sin "+" ni espacios)
const WHATSAPP = "570000000000";

// Catálogo — edita aquí nombres, precios, categorías e imágenes.
const PRODUCTS = [
  { id: "buggy-rodeo", name: "Buggy Rodeo 4x4", cat: "buggy", price: 1899000, old: 2190000, badge: ["sale", "-13%"], age: "3 a 8 años", seats: "2 puestos", rating: 5, reviews: 128, img: "assets/buggy-azul.webp" },
  { id: "buggy-explorer", name: "Buggy Explorer 12V", cat: "buggy", price: 1499000, badge: ["hot", "Más vendido"], age: "3 a 6 años", seats: "1 puesto", rating: 5, reviews: 96, img: "assets/buggy-azul.webp" },
  { id: "camioneta-safari", name: "Camioneta Safari 24V", cat: "camioneta", price: 2290000, old: 2490000, badge: ["sale", "-8%"], age: "3 a 8 años", seats: "2 puestos", rating: 5, reviews: 74, img: "assets/buggy-azul.webp" },
  { id: "camioneta-city", name: "Camioneta City 12V", cat: "camioneta", price: 1690000, badge: ["new", "Nuevo"], age: "2 a 6 años", seats: "1 puesto", rating: 4, reviews: 41, img: "assets/buggy-azul.webp" },
  { id: "moto-turbo", name: "Moto Turbo 6V", cat: "moto", price: 690000, age: "2 a 5 años", seats: "1 puesto", rating: 5, reviews: 58, img: "assets/buggy-azul.webp" },
  { id: "mini-filu", name: "Mini Filü Primeros Pasos", cat: "bebe", price: 1299000, badge: ["new", "Nuevo"], age: "1 a 3 años", seats: "1 puesto", rating: 5, reviews: 33, img: "assets/buggy-azul.webp" },
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n) => "$" + n.toLocaleString("es-CO");

// ---------- Render de productos ----------
const grid = $("[data-products]");
const emptyMsg = $("[data-empty]");
let currentFilter = "todos";
let query = "";

function renderProducts() {
  const q = query.trim().toLowerCase();
  const list = PRODUCTS.filter((p) =>
    (currentFilter === "todos" || p.cat === currentFilter) &&
    (!q || `${p.name} ${p.cat}`.toLowerCase().includes(q))
  );
  emptyMsg.hidden = list.length > 0;
  grid.innerHTML = list.map((p) => `
    <article class="product reveal">
      <div class="product__media">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.badge ? `<span class="badge badge--${p.badge[0]}">${p.badge[1]}</span>` : ""}
      </div>
      <div class="product__body">
        <div class="product__meta"><span class="tag">${p.age}</span><span class="tag">${p.seats}</span></div>
        <h3>${p.name}</h3>
        <div class="product__rating">${"★".repeat(p.rating)}${"☆".repeat(5 - p.rating)}<span>(${p.reviews})</span></div>
        <div class="product__price"><strong>${money(p.price)}</strong>${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
        <p class="product__cuotas">o 12 cuotas de ${money(Math.round(p.price / 12))}</p>
        <button class="btn btn--terra" data-add="${p.id}">Agregar al carrito</button>
      </div>
    </article>`).join("");
  observeReveals();
}

$$("[data-filter]").forEach((chip) =>
  chip.addEventListener("click", () => setFilter(chip.dataset.filter))
);
$$("[data-filter-link]").forEach((link) =>
  link.addEventListener("click", () => setFilter(link.dataset.filterLink))
);
function setFilter(f) {
  currentFilter = f;
  $$("[data-filter]").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === f));
  renderProducts();
}

// ---------- Búsqueda ----------
const searchBar = $("[data-search]");
const searchInput = $("[data-search-input]");
$("[data-open-search]").addEventListener("click", () => {
  searchBar.classList.toggle("is-open");
  if (searchBar.classList.contains("is-open")) searchInput.focus();
});
searchInput.addEventListener("input", (e) => {
  query = e.target.value;
  renderProducts();
  if (query) $("#catalogo").scrollIntoView({ behavior: "smooth" });
});

// ---------- Menú móvil ----------
const menuBtn = $(".menu-toggle");
const nav = $(".nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", open);
});
$$(".nav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

// ---------- Carrito ----------
let cart = {};
try { cart = JSON.parse(localStorage.getItem("filu-cart")) || {}; } catch { cart = {}; }
const saveCart = () => { try { localStorage.setItem("filu-cart", JSON.stringify(cart)); } catch {} };

const cartEl = $("[data-cart]");
const overlay = $("[data-overlay]");
const openCart = () => { cartEl.classList.add("is-open"); overlay.classList.add("is-open"); };
const closeCart = () => { cartEl.classList.remove("is-open"); overlay.classList.remove("is-open"); };
$("[data-open-cart]").addEventListener("click", openCart);
$("[data-close-cart]").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

function renderCart() {
  const items = Object.entries(cart).map(([id, qty]) => ({ ...PRODUCTS.find((p) => p.id === id), qty })).filter((i) => i.id);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const countEl = $("[data-cart-count]");
  countEl.textContent = count;
  countEl.classList.remove("bump"); void countEl.offsetWidth; countEl.classList.add("bump");
  $("[data-cart-total]").textContent = money(total);
  $("[data-cart-items]").innerHTML = items.length
    ? items.map((i) => `
      <div class="cart-item">
        <img src="${i.img}" alt="${i.name}" />
        <div>
          <h4>${i.name}</h4>
          <div class="cart-item__price">${money(i.price)}</div>
          <div class="qty">
            <button data-dec="${i.id}" aria-label="Quitar uno">−</button>
            <span>${i.qty}</span>
            <button data-inc="${i.id}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${i.id}">Quitar</button>
      </div>`).join("")
    : `<div class="cart__empty"><p style="font-size:2.5rem;margin:0">🛒</p><p>Tu carrito está vacío.<br/>¡Elige su primer carrito!</p></div>`;
  saveCart();
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-add],[data-inc],[data-dec],[data-remove]");
  if (!t) return;
  const { add, inc, dec, remove } = t.dataset;
  if (add) {
    cart[add] = (cart[add] || 0) + 1;
    toast(`🚗 ${PRODUCTS.find((p) => p.id === add).name} agregado al carrito`);
  }
  if (inc) cart[inc]++;
  if (dec) { cart[dec]--; if (cart[dec] <= 0) delete cart[dec]; }
  if (remove) delete cart[remove];
  renderCart();
});

$("[data-checkout]").addEventListener("click", () => {
  const items = Object.entries(cart).map(([id, qty]) => ({ ...PRODUCTS.find((p) => p.id === id), qty }));
  if (!items.length) return toast("Tu carrito está vacío");
  const lines = items.map((i) => `• ${i.qty} x ${i.name} — ${money(i.price * i.qty)}`);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const msg = `¡Hola Filü! 👋 Quiero hacer este pedido:\n\n${lines.join("\n")}\n\nTotal: ${money(total)}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

// ---------- Newsletter ----------
$("[data-newsletter]").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.hidden = true;
  $("[data-newsletter-ok]").hidden = false;
});

// ---------- Toast ----------
const toastEl = $("[data-toast]");
let toastTimer;
function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
}

// ---------- Animaciones al hacer scroll ----------
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    }), { threshold: 0.12 })
  : null;
function observeReveals() {
  $$(".reveal:not(.is-visible)").forEach((el) => io ? io.observe(el) : el.classList.add("is-visible"));
}
$$(".cat, .feature, .review, .section__head").forEach((el) => el.classList.add("reveal"));

$("[data-year]").textContent = new Date().getFullYear();
renderProducts();
renderCart();
