// =============================
// Filü · Lógica de la tienda
// (los productos están en js/productos.js)
// =============================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n) => "$" + n.toLocaleString("es-CO");
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
const productUrl = (p) => `producto.html?id=${encodeURIComponent(p.id)}`;
const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const TIPO = { carro: "Carro", moto: "Moto" };

function badgeClass(label) {
  const l = (label || "").toLowerCase();
  if (l.includes("%") || l.includes("oferta")) return "sale";
  if (l.includes("nuevo")) return "new";
  return "hot";
}

// ---------- Tarjeta de producto ----------
function productCard(p) {
  const tags = [p.edad, p.puestos, p.bateria].filter(Boolean).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const price = p.precio
    ? `<div class="product__price"><strong>${money(p.precio)}</strong>${p.precioAntes ? `<s>${money(p.precioAntes)}</s>` : ""}</div>
       <p class="product__cuotas">🚚 Envío gratis</p>`
    : `<div class="product__price"><strong class="consult">Consultar precio</strong></div>`;
  const action = p.precio
    ? `<button class="btn btn--terra" data-add="${p.id}">Agregar al carrito</button>`
    : `<a class="btn btn--terra" href="${productUrl(p)}">Ver detalles</a>`;
  return `
    <article class="product reveal">
      <a class="product__media" href="${productUrl(p)}">
        <img src="${p.fotos[0]}" alt="${esc(p.nombre)}" loading="lazy" />
        ${p.etiqueta ? `<span class="badge badge--${badgeClass(p.etiqueta)}">${esc(p.etiqueta)}</span>` : ""}
        <span class="product__type">${TIPO[p.tipo] || ""}</span>
      </a>
      <div class="product__body">
        ${tags ? `<div class="product__meta">${tags}</div>` : ""}
        <h3><a href="${productUrl(p)}">${esc(p.nombre)}</a></h3>
        ${p.resumen ? `<p class="product__summary">${esc(p.resumen)}</p>` : ""}
        ${price}
        ${action}
      </div>
    </article>`;
}

// ---------- Inicio: destacados ----------
const featuredGrid = $("[data-featured]");
if (featuredGrid) {
  const list = PRODUCTS.filter((p) => p.destacado).slice(0, 8);
  featuredGrid.innerHTML = (list.length ? list : PRODUCTS.slice(0, 8)).map(productCard).join("");
  $$("[data-count]").forEach((el) => {
    const n = PRODUCTS.filter((p) => p.tipo === el.dataset.count).length;
    el.textContent = `${n} ${n === 1 ? "referencia" : "referencias"}`;
  });
}

// ---------- Catálogo completo ----------
const catalogGrid = $("[data-catalog]");
if (catalogGrid) {
  const params = new URLSearchParams(location.search);
  const state = { tipo: params.get("tipo") || "todos", q: params.get("q") || "", orden: "destacados" };
  const searchBox = $("[data-catalog-search]");
  searchBox.value = state.q;

  function renderCatalog() {
    const q = state.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (state.tipo === "todos" || p.tipo === state.tipo) &&
      (!q || [p.nombre, p.subtipo, p.tipo, p.resumen].join(" ").toLowerCase().includes(q))
    );
    if (state.orden === "menor") list.sort((a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity));
    if (state.orden === "mayor") list.sort((a, b) => (b.precio ?? -1) - (a.precio ?? -1));
    if (state.orden === "destacados") list.sort((a, b) => (b.destacado === true) - (a.destacado === true));
    catalogGrid.innerHTML = list.map(productCard).join("");
    $("[data-empty]").hidden = list.length > 0;
    $("[data-result-count]").textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`;
    $$("[data-filter]").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === state.tipo));
    $("[data-catalog-title]").textContent = state.tipo === "carro" ? "Carros" : state.tipo === "moto" ? "Motos" : "Todo el catálogo";
    observeReveals();
  }

  $$("[data-filter]").forEach((chip) => chip.addEventListener("click", () => {
    state.tipo = chip.dataset.filter;
    history.replaceState(null, "", state.tipo === "todos" ? "catalogo.html" : `catalogo.html?tipo=${state.tipo}`);
    renderCatalog();
  }));
  $("[data-sort]").addEventListener("change", (e) => { state.orden = e.target.value; renderCatalog(); });
  searchBox.addEventListener("input", (e) => { state.q = e.target.value; renderCatalog(); });
  renderCatalog();
}

// ---------- Página de producto ----------
const detail = $("[data-product-detail]");
if (detail) {
  const p = findProduct(new URLSearchParams(location.search).get("id"));
  if (!p) {
    detail.innerHTML = `<div class="not-found"><p style="font-size:3rem;margin:0">🙈</p><h1>No encontramos este carrito</h1><a class="btn btn--dark" href="catalogo.html">Ver catálogo</a></div>`;
  } else {
    document.title = `${p.nombre} · Filü`;
    const chips = [
      p.edad && ["🧒", p.edad],
      p.bateria && ["🔋", `Batería ${p.bateria}`],
      p.puestos && ["💺", p.puestos],
      ...p.especificaciones.filter(([k]) => /velocidad/i.test(k)).map(([, v]) => ["⚡", v]),
    ].filter(Boolean);
    const priceHtml = p.precio
      ? `<div class="pd__price"><strong>${money(p.precio)}</strong>${p.precioAntes ? `<s>${money(p.precioAntes)}</s>` : ""}</div>
         <p class="pd__cuotas">🚚 Envío gratis a todo el país · Paga con tarjeta a cuotas, PSE, Nequi o Bre-B</p>`
      : `<div class="pd__price"><strong>Consultar precio</strong></div><p class="pd__cuotas">Escríbenos y te enviamos el precio y la disponibilidad.</p>`;

    detail.innerHTML = `
      <nav class="crumbs container"><a href="index.html">Inicio</a> / <a href="catalogo.html?tipo=${p.tipo}">${TIPO[p.tipo]}s</a> / <span>${esc(p.nombre)}</span></nav>
      <section class="container pd">
        <div class="pd__gallery">
          <div class="pd__main">
            <img src="${p.fotos[0]}" alt="${esc(p.nombre)}" data-main-photo />
            ${p.etiqueta ? `<span class="badge badge--${badgeClass(p.etiqueta)}">${esc(p.etiqueta)}</span>` : ""}
          </div>
          ${p.fotos.length > 1 ? `<div class="pd__thumbs">${p.fotos.map((f, i) => `<button class="${i ? "" : "is-active"}" data-photo="${f}"><img src="${f}" alt="Foto ${i + 1}" /></button>`).join("")}</div>` : ""}
        </div>
        <div class="pd__info">
          <span class="pill">${esc(p.subtipo || TIPO[p.tipo])}</span>
          <h1>${esc(p.nombre)}</h1>
          ${p.resumen ? `<p class="pd__summary">${esc(p.resumen)}</p>` : ""}
          ${priceHtml}
          <div class="pd__chips">${chips.map(([i, t]) => `<span><b>${i}</b>${esc(t)}</span>`).join("")}</div>
          ${p.colores.length ? `<div class="pd__colors"><p>Color:</p>${p.colores.map((c, i) => `<button class="chip ${i ? "" : "is-active"}" data-color="${esc(c)}">${esc(c)}</button>`).join("")}</div>` : ""}
          <div class="pd__actions">
            ${p.precio ? `<button class="btn btn--terra" data-add="${p.id}">Agregar al carrito</button>` : ""}
            <a class="btn btn--whatsapp" data-wa-product target="_blank" rel="noopener">${p.precio ? "Comprar por WhatsApp" : "Consultar por WhatsApp"}</a>
          </div>
          <ul class="pd__trust">
            <li>🚚 Envío gratis con Servientrega</li>
            <li>📡 Control remoto para papás</li>
            <li>🛡️ Garantía Filü</li>
          </ul>
        </div>
      </section>

      <section class="container pd__more">
        <div class="pd__block">
          <h2>Descripción</h2>
          ${p.descripcion.map((t) => `<p>${esc(t)}</p>`).join("")}
          ${p.caracteristicas.length ? `<h3>Características</h3><ul class="checks">${p.caracteristicas.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="pd__block pd__block--specs">
          <h2>Especificaciones</h2>
          <table class="specs">${p.especificaciones.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>
        </div>
      </section>`;

    let color = p.colores[0] || "";
    const updateWa = () => {
      const txt = `¡Hola Filü! 👋 Me interesa el ${p.nombre}${color ? ` en color ${color}` : ""}.\n${location.href}`;
      $("[data-wa-product]").href = waLink(txt);
    };
    updateWa();
    $$("[data-color]").forEach((b) => b.addEventListener("click", () => {
      color = b.dataset.color;
      $$("[data-color]").forEach((x) => x.classList.toggle("is-active", x === b));
      updateWa();
    }));
    $$("[data-photo]").forEach((b) => b.addEventListener("click", () => {
      $("[data-main-photo]").src = b.dataset.photo;
      $$("[data-photo]").forEach((x) => x.classList.toggle("is-active", x === b));
    }));

    const related = PRODUCTS.filter((x) => x.tipo === p.tipo && x.id !== p.id).slice(0, 4);
    if (related.length) {
      $("[data-related]").innerHTML = related.map(productCard).join("");
      $("[data-related-section]").hidden = false;
    }
  }
}

// ---------- Búsqueda del encabezado ----------
const searchBar = $("[data-search]");
const searchInput = $("[data-search-input]");
$("[data-open-search]").addEventListener("click", () => {
  searchBar.classList.toggle("is-open");
  if (searchBar.classList.contains("is-open")) searchInput.focus();
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    location.href = `catalogo.html?q=${encodeURIComponent(searchInput.value.trim())}`;
  }
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

function cartItems() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ ...findProduct(id), qty }))
    .filter((i) => i.id && i.precio);
}

function renderCart() {
  const items = cartItems();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.precio, 0);
  const countEl = $("[data-cart-count]");
  countEl.textContent = count;
  countEl.classList.remove("bump"); void countEl.offsetWidth; countEl.classList.add("bump");
  $("[data-cart-total]").textContent = money(total);
  $("[data-cart-items]").innerHTML = items.length
    ? items.map((i) => `
      <div class="cart-item">
        <img src="${i.fotos[0]}" alt="${esc(i.nombre)}" />
        <div>
          <h4>${esc(i.nombre)}</h4>
          <div class="cart-item__price">${money(i.precio)}</div>
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
    toast(`🚗 ${findProduct(add).nombre} agregado al carrito`);
  }
  if (inc) cart[inc]++;
  if (dec) { cart[dec]--; if (cart[dec] <= 0) delete cart[dec]; }
  if (remove) delete cart[remove];
  renderCart();
});

$("[data-checkout]").addEventListener("click", () => {
  const items = cartItems();
  if (!items.length) return toast("Tu carrito está vacío");
  const lines = items.map((i) => `• ${i.qty} x ${i.nombre} — ${money(i.precio * i.qty)}`);
  const total = items.reduce((s, i) => s + i.qty * i.precio, 0);
  window.open(waLink(`¡Hola Filü! 👋 Quiero hacer este pedido:\n\n${lines.join("\n")}\n\nTotal: ${money(total)} (envío incluido)\n\nMi ciudad es: \nPrefiero pagar con: (link de pago / transferencia / Nequi / Bre-B)`), "_blank", "noopener");
});

// ---------- WhatsApp general ----------
$$("[data-wa]").forEach((a) => { a.href = waLink("Hola Filü, quiero información de los carritos"); });

// ---------- Newsletter ----------
const newsletter = $("[data-newsletter]");
if (newsletter) newsletter.addEventListener("submit", (e) => {
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
// (se crea al primer uso, porque las páginas llaman observeReveals antes de llegar aquí)
var io;
function observeReveals() {
  if (io === undefined) {
    io = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
        }), { threshold: 0.12 })
      : null;
  }
  $$(".reveal:not(.is-visible)").forEach((el) => io ? io.observe(el) : el.classList.add("is-visible"));
}
$$(".cat, .feature, .review, .section__head").forEach((el) => el.classList.add("reveal"));
observeReveals();

$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
renderCart();
