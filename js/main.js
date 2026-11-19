// =============================
// Filü · Lógica de la tienda
// (los productos están en js/productos.js)
// =============================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n) => "$" + n.toLocaleString("es-CO");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
const productUrl = (p) => `producto.html?id=${encodeURIComponent(p.id)}`;
const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const TIPO = { carro: "Carro", moto: "Moto" };

// Colores para los puntos y círculos de color
const HEX = {
  azul: "#3a6fb5", rojo: "#c8372d", fucsia: "#d63a8a", rosado: "#f0a6c2", negro: "#2b2b2b", blanco: "#f6f2ea", blanca: "#f6f2ea",
  gris: "#9a9ea3", "gris oscuro": "#5e6368", "gris claro": "#cdd0d2", verde: "#6ba43a", naranja: "#e8742a", arena: "#cdb48a", plateado: "#c3c7cb",
};
const hex = (c) => HEX[c.toLowerCase()] || "#ccc";

// ---------- Fotos ----------
// Folletos del proveedor: se muestran tal cual (no tienen recorte)
const FLYERS = new Set(["can-am-maverick-6", "hilux-8", "turbo-hsd-800-11", "moto-aventura-188-5", "moto-deportiva-dls01-5", "scooter-dos-puestos-1389-11", "scooter-grande-1658-8"]);
const photoName = (f) => f.split("/").pop().replace(/\.\w+$/, "");
const isFlyer = (f) => FLYERS.has(photoName(f));
// Versión recortada (fondo transparente) de cada foto
const recorte = (f) => (isFlyer(f) ? f : `assets/productos/recortes/${photoName(f)}.webp`);

// Fondo de marca según el color del carro de la foto principal, para que siempre contraste
const FOTO1 = {
  "utv-809": "azul", "can-am-maverick": "arena", hilux: "rojo", "todoterreno-22f": "rojo", "patrulla-6667": "blanco",
  "camioneta-909": "gris", "buggy-1688": "rojo", "turbo-hsd-800": "rojo", "camioneta-5599": "fucsia", "deportivo-550": "rojo",
  "rodeo-1155": "azul", "moto-aventura-188": "rojo", "moto-deportiva-dls01": "rojo", "scooter-dos-puestos-1389": "fucsia", "scooter-grande-1658": "fucsia",
};
const FONDOS = { azul: ["mustard", "terra"], rojo: ["slate", "mustard"], fucsia: ["olive", "slate"], rosado: ["olive", "slate"], blanco: ["terra", "slate"], blanca: ["terra", "slate"], gris: ["mustard", "olive"], arena: ["slate", "olive"], negro: ["mustard", "terra"], verde: ["terra", "mustard"], naranja: ["slate", "olive"] };
const colorFoto = (p) => (FOTO1[p.id] || p.colores[0] || "negro").toLowerCase();
function fondoDe(p) {
  const c = colorFoto(p);
  const lista = FONDOS[c] || FONDOS.negro;
  const i = PRODUCTS.filter((x) => colorFoto(x) === c).indexOf(p);
  return "bg-" + lista[Math.max(i, 0) % lista.length];
}

// ---------- Tarjeta de producto ----------
function dots(p) {
  if (!p.colores.length) return "";
  const n = p.colores.length;
  return `<div class="dots">${p.colores.map((c) => `<i title="${esc(c)}" style="background:${hex(c)}"></i>`).join("")}<small>${n} ${n === 1 ? "color" : "colores"}</small></div>`;
}
function productCard(p, i = 0) {
  const tilt = [-1.2, 0.8, -0.6, 1.1][i % 4];
  const meta = [p.edad, p.bateria].filter(Boolean).map(esc).join(" · ");
  return `
    <a class="card" href="${productUrl(p)}" style="--tilt:${tilt}deg">
      <div class="card__img ph ${fondoDe(p)}">
        <img src="${recorte(p.fotos[0])}" alt="${esc(p.nombre)}" loading="lazy" />
        ${p.etiqueta ? `<span class="tag">${esc(p.etiqueta)}</span>` : ""}
      </div>
      <div class="card__body">
        ${dots(p)}
        <h3>${esc(p.nombre)}</h3>
        ${meta ? `<p class="card__meta">${meta}</p>` : ""}
        <p class="card__price">${p.precio ? money(p.precio) : "Consultar precio"}</p>
      </div>
    </a>`;
}

// ---------- Inicio ----------
const featured = $("[data-featured]");
if (featured) {
  const list = PRODUCTS.filter((p) => p.destacado).slice(0, 8);
  featured.innerHTML = (list.length ? list : PRODUCTS.slice(0, 8)).map(productCard).join("");
}
$$("[data-count]").forEach((el) => {
  const n = PRODUCTS.filter((p) => p.tipo === el.dataset.count).length;
  el.textContent = `${n} ${n === 1 ? "modelo" : "modelos"}`;
});

// ---------- Catálogo ----------
const catalog = $("[data-catalog]");
if (catalog) {
  const params = new URLSearchParams(location.search);
  const state = { tipo: params.get("tipo") || "todos", q: params.get("q") || "", orden: "destacados" };
  const box = $("[data-catalog-search]");
  box.value = state.q;
  const titulos = { carro: "carros", moto: "motos", todos: "todo el catálogo" };
  const subtitulos = {
    carro: "Camionetas, UTV, buggies y deportivos para niños de 1 a 8 años",
    moto: "Motos y scooters para pequeños motociclistas",
    todos: "Carros y motos eléctricas montables para niños de 1 a 8 años",
  };

  function render() {
    const q = state.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (state.tipo === "todos" || p.tipo === state.tipo) &&
      (!q || [p.nombre, p.subtipo, p.tipo, p.resumen, p.colores.join(" ")].join(" ").toLowerCase().includes(q))
    );
    if (state.orden === "menor") list.sort((a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity));
    else if (state.orden === "mayor") list.sort((a, b) => (b.precio ?? -1) - (a.precio ?? -1));
    else list.sort((a, b) => (b.destacado === true) - (a.destacado === true));
    catalog.innerHTML = list.map(productCard).join("");
    $("[data-empty]").hidden = list.length > 0;
    $("[data-result-count]").textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`;
    $("[data-catalog-title]").textContent = titulos[state.tipo] || titulos.todos;
    $("[data-catalog-sub]").textContent = subtitulos[state.tipo] || subtitulos.todos;
    $$("[data-filter]").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === state.tipo));
    $$("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === state.tipo));
  }
  $$("[data-filter]").forEach((chip) => chip.addEventListener("click", () => {
    state.tipo = chip.dataset.filter;
    history.replaceState(null, "", state.tipo === "todos" ? "catalogo.html" : `catalogo.html?tipo=${state.tipo}`);
    render();
  }));
  $("[data-sort]").addEventListener("change", (e) => { state.orden = e.target.value; render(); });
  box.addEventListener("input", (e) => { state.q = e.target.value; render(); });
  render();
}

// ---------- Ficha de producto ----------
const detail = $("[data-product-detail]");
if (detail) {
  const p = findProduct(new URLSearchParams(location.search).get("id"));
  if (!p) {
    detail.innerHTML = `<div class="wrap not-found"><p style="font-size:3rem;margin:0">🙈</p><h1>no encontramos este carrito</h1><a class="btn btn--solid" href="catalogo.html">Ver catálogo</a></div>`;
  } else {
    document.title = `${p.nombre} · Filü`;
    const fondo = fondoDe(p);
    const phClass = (f) => (isFlyer(f) ? "ph ph--plain" : `ph ${fondo}`);
    const velocidad = p.especificaciones.find(([k]) => /velocidad/i.test(k));
    const chips = [p.edad && `🧒 ${p.edad}`, p.bateria && `🔋 ${p.bateria}`, p.puestos && `💺 ${p.puestos}`, velocidad && `⚡ ${velocidad[1]}`].filter(Boolean);
    const price = p.precio
      ? `<div class="pd__price"><strong>${money(p.precio)}</strong>${p.precioAntes ? `<s>${money(p.precioAntes)}</s>` : ""}</div>
         <p class="pd__ship">🚚 Envío gratis a todo el país · Paga con tarjeta a cuotas, PSE, Nequi o Bre-B</p>`
      : `<div class="pd__price"><strong>Consultar precio</strong></div>
         <p class="pd__ship">Escríbenos y te enviamos el precio y la disponibilidad.</p>`;

    detail.innerHTML = `
      <div class="wrap"><nav class="crumbs"><a href="index.html">Inicio</a> / <a href="catalogo.html?tipo=${p.tipo}">${TIPO[p.tipo]}s</a> / <span>${esc(p.nombre)}</span></nav></div>
      <section class="wrap pd">
        <div class="pd__gallery">
          <div class="pd__main ${phClass(p.fotos[0])}" data-main>
            <img src="${recorte(p.fotos[0])}" alt="${esc(p.nombre)}" data-main-photo />
            ${p.etiqueta ? `<span class="tag">${esc(p.etiqueta)}</span>` : ""}
          </div>
          ${p.fotos.length > 1 ? `<div class="pd__thumbs">${p.fotos.map((f, i) => `
            <button class="${phClass(f)} ${i ? "" : "is-active"}" data-photo="${i}" aria-label="Foto ${i + 1}"><img src="${recorte(f)}" alt="" loading="lazy" /></button>`).join("")}</div>` : ""}
        </div>
        <div class="pd__info">
          <span class="pill">${esc(p.subtipo || TIPO[p.tipo])}</span>
          <h1>${esc(p.nombre)}</h1>
          ${p.resumen ? `<p class="pd__summary">${esc(p.resumen)}</p>` : ""}
          ${price}
          ${chips.length ? `<div class="pd__chips">${chips.map((c) => `<span>${esc(c)}</span>`).join("")}</div>` : ""}
          ${p.colores.length ? `<div class="pd__colors">
            <p>Color: <span data-color-name>${esc(p.colores[0])}</span></p>
            <div class="swatches">${p.colores.map((c, i) => `<button class="swatch ${i ? "" : "is-active"}" data-color="${esc(c)}" title="${esc(c)}" aria-label="${esc(c)}" style="background:${hex(c)}"></button>`).join("")}</div>
          </div>` : ""}
          <div class="pd__actions">
            ${p.precio ? `<button class="btn btn--solid" data-add-detail>Agregar al carrito</button>` : ""}
            <a class="btn btn--wa" data-wa-product target="_blank" rel="noopener">${p.precio ? "Comprar por WhatsApp" : "Consultar por WhatsApp"}</a>
          </div>
          <ul class="pd__trust">
            <li>🚚 Envío gratis con Servientrega</li>
            <li>💳 Tarjeta a cuotas, PSE, Nequi o Bre-B</li>
            <li>💬 Te acompañamos por WhatsApp en el armado</li>
          </ul>
        </div>
      </section>
      <section class="wrap pd__more">
        <div class="pd__block">
          <h2 class="squiggle">descripción</h2>
          ${p.descripcion.map((t) => `<p>${esc(t)}</p>`).join("")}
          ${p.caracteristicas.length ? `<h3>características</h3><ul class="checks">${p.caracteristicas.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="pd__block">
          <h2 class="squiggle">especificaciones</h2>
          <table class="specs">${p.especificaciones.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>
        </div>
      </section>`;

    // Galería
    $$("[data-photo]").forEach((b) => b.addEventListener("click", () => {
      const f = p.fotos[+b.dataset.photo];
      $("[data-main-photo]").src = recorte(f);
      $("[data-main]").className = `pd__main ${phClass(f)}`;
      $$("[data-photo]").forEach((x) => x.classList.toggle("is-active", x === b));
    }));

    // Color elegido: se usa en el carrito y en WhatsApp
    let color = p.colores[0] || "";
    const updateWa = () => {
      $("[data-wa-product]").href = waLink(`¡Hola Filü! 👋 Me interesa el ${p.nombre}${color ? ` en color ${color}` : ""}.\n${location.href}`);
    };
    updateWa();
    $$("[data-color]").forEach((b) => b.addEventListener("click", () => {
      color = b.dataset.color;
      $("[data-color-name]").textContent = color;
      $$("[data-color]").forEach((x) => x.classList.toggle("is-active", x === b));
      updateWa();
    }));
    const addBtn = $("[data-add-detail]");
    if (addBtn) addBtn.addEventListener("click", () => {
      addToCart(p.id, color);
      toast(`🚗 ${p.nombre}${color ? ` (${color})` : ""} agregado al carrito`);
      openCart();
    });

    // Relacionados
    const related = PRODUCTS.filter((x) => x.tipo === p.tipo && x.id !== p.id).slice(0, 4);
    if (related.length) {
      $("[data-related]").innerHTML = related.map(productCard).join("");
      $("[data-related-section]").hidden = false;
    }
    $$("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === p.tipo));
  }
}

// ---------- Carrito (cada línea = producto + color) ----------
const CART_KEY = "filu-cart-v2";
let cart = {};
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { cart = {}; }
const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} };
const lineKey = (id, color) => `${id}|${color || ""}`;
function addToCart(id, color) { const k = lineKey(id, color); cart[k] = (cart[k] || 0) + 1; renderCart(); }
function cartLines() {
  return Object.entries(cart).map(([k, qty]) => {
    const [id, color] = k.split("|");
    const p = findProduct(id);
    return p && p.precio ? { key: k, p, color, qty } : null;
  }).filter(Boolean);
}

const cartEl = $("[data-cart]");
const overlay = $("[data-overlay]");
function openCart() { cartEl.classList.add("is-open"); overlay.classList.add("is-open"); }
function closeCart() { cartEl.classList.remove("is-open"); overlay.classList.remove("is-open"); }
$("[data-open-cart]").addEventListener("click", openCart);
$("[data-close-cart]").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

function renderCart() {
  const lines = cartLines();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.p.precio, 0);
  const countEl = $("[data-cart-count]");
  countEl.textContent = count;
  countEl.hidden = count === 0;
  countEl.classList.remove("bump"); void countEl.offsetWidth; countEl.classList.add("bump");
  $("[data-cart-total]").textContent = money(total);
  $("[data-cart-items]").innerHTML = lines.length
    ? lines.map((l) => `
      <div class="cart-item">
        <div class="ph ${fondoDe(l.p)}"><img src="${recorte(l.p.fotos[0])}" alt="${esc(l.p.nombre)}" /></div>
        <div>
          <h4>${esc(l.p.nombre)}</h4>
          ${l.color ? `<div class="cart-item__color">Color: ${esc(l.color)}</div>` : ""}
          <div class="cart-item__price">${money(l.p.precio)}</div>
          <div class="qty">
            <button data-dec="${esc(l.key)}" aria-label="Quitar uno">−</button>
            <span>${l.qty}</span>
            <button data-inc="${esc(l.key)}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${esc(l.key)}">Quitar</button>
      </div>`).join("")
    : `<div class="cart__empty"><p style="font-size:2.4rem;margin:0">🛒</p><p>Tu carrito está vacío.<br/>¡Elige su primer Filü!</p><a class="btn btn--line btn--sm" href="catalogo.html">Ver catálogo</a></div>`;
  saveCart();
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-inc],[data-dec],[data-remove]");
  if (!t) return;
  const { inc, dec, remove } = t.dataset;
  if (inc) cart[inc]++;
  if (dec) { cart[dec]--; if (cart[dec] <= 0) delete cart[dec]; }
  if (remove) delete cart[remove];
  renderCart();
});

$("[data-checkout]").addEventListener("click", () => {
  const lines = cartLines();
  if (!lines.length) return toast("Tu carrito está vacío");
  const txt = lines.map((l) => `• ${l.qty} x ${l.p.nombre}${l.color ? ` (${l.color})` : ""} — ${money(l.p.precio * l.qty)}`);
  const total = lines.reduce((s, l) => s + l.qty * l.p.precio, 0);
  window.open(waLink(`¡Hola Filü! 👋 Quiero hacer este pedido:\n\n${txt.join("\n")}\n\nTotal: ${money(total)} (envío incluido)\n\nMi ciudad es: \nPrefiero pagar con: (link de pago / transferencia / Nequi / Bre-B)`), "_blank", "noopener");
});

// ---------- Búsqueda del encabezado ----------
const searchBar = $("[data-search]");
const searchInput = $("[data-search-input]");
$("[data-open-search]").addEventListener("click", () => {
  searchBar.classList.toggle("is-open");
  if (searchBar.classList.contains("is-open")) searchInput.focus();
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && searchInput.value.trim()) location.href = `catalogo.html?q=${encodeURIComponent(searchInput.value.trim())}`;
});

// ---------- Menú en celular ----------
const menuBtn = $(".menu-toggle");
const nav = $(".nav");
menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
$$(".nav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

// ---------- Aviso ----------
const toastEl = $("[data-toast]");
let toastTimer;
function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
}

// ---------- Varios ----------
$$("[data-wa]").forEach((a) => (a.href = waLink("¡Hola Filü! 👋 Quiero información de los carritos")));
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
// Ver los espacios reservados para fotos: agregar ?notas a la dirección
if (new URLSearchParams(location.search).has("notas")) document.body.classList.add("show-notes");
renderCart();
