// =============================================================
// Filü · CATÁLOGO DE PRODUCTOS
// Para agregar una referencia, copia un bloque { ... } y cambia
// sus datos. Las fotos van en la carpeta assets/productos/.
//
//  id              → código único, sin espacios (se usa en el enlace)
//  nombre          → nombre que se muestra
//  tipo            → "carro" o "moto"
//  subtipo         → Camioneta, Buggy, Deportivo, Moto, Cuatrimoto…
//  precio          → número sin puntos (1899000). null = "Consultar precio"
//  precioAntes     → precio tachado si está en descuento (o null)
//  etiqueta        → "Nuevo", "Más vendido", "Oferta"… (o null)
//  destacado       → true para mostrarlo en la página de inicio
//  edad, puestos, bateria → datos rápidos de la tarjeta (o null)
//  colores         → lista de colores disponibles (o [])
//  fotos           → lista de fotos; la primera es la principal
//  resumen         → frase corta
//  descripcion     → lista de párrafos
//  caracteristicas → lista de viñetas
//  especificaciones→ lista de pares ["Dato", "Valor"]
// =============================================================

// Número de WhatsApp de la tienda (código de país + número, sin "+" ni espacios)
const WHATSAPP = "570000000000";

const PRODUCTS = [
  {
    id: "utv-809",
    nombre: "UTV 4x4 Modelo 809",
    tipo: "carro",
    subtipo: "Camioneta",
    precio: null,
    precioAntes: null,
    etiqueta: "Nuevo",
    destacado: true,
    edad: "1 a 8 años",
    puestos: null,
    bateria: "12V",
    colores: [],
    fotos: ["assets/productos/809-1.jpg"],
    resumen: "Camioneta todo terreno con 4 motores, pantalla MP4 táctil y control por app.",
    descripcion: [
      "El UTV 4x4 Modelo 809 está diseñado para ofrecer una experiencia de conducción emocionante y segura para los más pequeños de la casa. Con batería de 12V, es perfecto para niños y niñas desde 1 año, con horas de diversión y aventura al aire libre.",
      "Permite control total con pedal independiente, control remoto y aplicación móvil, para que papá y mamá puedan supervisar y dirigir la actividad de sus hijos. Su velocidad máxima de 10 km/h y su capacidad de hasta 70 kg lo hacen ideal para pequeños aventureros, y con 31 kg de peso es fácil de mover.",
      "Incluye manual de ensamblado. Aventura, diversión y seguridad en un solo producto para que los niños disfruten de sus primeros viajes de manera inolvidable.",
    ],
    caracteristicas: [
      "Para niños y niñas de 1 a 8 años",
      "4 motores",
      "Pantalla MP4 táctil",
      "Control remoto para padres y app para el celular (escaneando el código QR del carro)",
      "Reproduce USB, micro SD, MP3 y videos",
      "Batería de 12 voltios",
      "Cinturón de seguridad",
      "Amortiguación en las 4 llantas",
      "Luces LED con control de luces",
      "Sonidos musicales y medidor de batería",
      "Freno automático, marcha adelante y reversa",
      "Incluye batería recargable y cargador",
      "Límite de peso: 70 kg",
    ],
    especificaciones: [
      ["Modelo", "809"],
      ["Clasificación", "Camioneta"],
      ["Alimentación", "Batería recargable"],
      ["Voltaje de la batería", "12V"],
      ["Voltaje del cargador", "110V"],
      ["Velocidad máxima", "10 km/h"],
      ["Tipos de control", "Pedal independiente, control remoto, app para el celular"],
      ["Peso máximo soportado", "70 kg"],
      ["Peso del carro", "31 kg"],
      ["Dimensiones del carro", "130 × 84 × 78 cm (largo × ancho × alto)"],
      ["Dimensiones de la silla", "52 × 42 × 21 cm"],
      ["Edad recomendada", "1 a 8 años"],
      ["Incluye manual de ensamblado", "Sí"],
    ],
  },
];
