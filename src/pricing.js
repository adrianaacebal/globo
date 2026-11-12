// =====================================================================================
// pricing.js  ->  REGLAS DE PRECIO compartidas: codigo de bienvenida y gastos de envio.
// =====================================================================================
// Las usan los controladores:
//   - authController.js: al registrarse un usuario nuevo le crea un codigo de descuento.
//   - checkoutController.js: al calcular el total de un pedido (POST /order/total y POST /orders)
//     aplica los gastos de envio y comprueba si el codigo de descuento es valido.
// Tener estas reglas en un solo archivo evita que dos sitios calculen precios distintos.
// =====================================================================================
//
// "crypto" es un modulo que viene con Node para generar datos aleatorios seguros.
// store es nuestra capa de datos (src/data/store.js): aqui la usamos para mirar los usuarios.
const crypto = require("crypto");
const store = require("./data/store");

// Porcentaje de descuento del codigo de bienvenida (10%).
// Las constantes en MAYUSCULAS son un convenio: valores fijos de configuracion.
const DISCOUNT_PERCENT = 10; // % de descuento del codigo de bienvenida

// Gastos de envio segun lo que tarda la moto (sin contar la cocina):
//   hasta 15 min -> 5% del precio de la comida · mas de 15 min -> 7%
const SHORT_TRIP_MAX_MINUTES = 15;
const SHORT_TRIP_FEE_PERCENT = 5;
const LONG_TRIP_FEE_PERCENT = 7;

// Porcentaje de envio para un pedido (0 si es para recoger)
// type = "delivery" (a domicilio) o "pickup" (recoger en el local).
// travelMinutes = minutos que tarda el repartidor en llegar.
function deliveryFeePercent(type, travelMinutes) {
  // Si no es a domicilio no hay gastos de envio.
  if (type !== "delivery") return 0;
  // Number(...) convierte a numero (puede llegar como texto, por ejemplo "12").
  const mins = Number(travelMinutes);
  // Number.isFinite comprueba que es un numero de verdad (no NaN ni infinito).
  // Viaje corto (15 min o menos) -> 5%.
  if (Number.isFinite(mins) && mins <= SHORT_TRIP_MAX_MINUTES) return SHORT_TRIP_FEE_PERCENT;
  // En cualquier otro caso (viaje largo o minutos desconocidos) -> 7%.
  return LONG_TRIP_FEE_PERCENT;
}

// Crea un codigo de descuento nuevo, por ejemplo "GLOBO-3F9A1C"
// (se repite si por casualidad ya existe, para que cada usuario tenga uno distinto).
function newDiscountCode() {
  let code;
  // do { ... } while (condicion): ejecuta el bloque al menos una vez y lo repite
  // mientras la condicion sea verdadera.
  do {
    // randomBytes(3) da 3 bytes aleatorios; en hexadecimal son 6 caracteres (0-9, A-F).
    code = "GLOBO-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  // store.users.find busca un usuario que ya tenga ese codigo: si existe, se genera otro.
  } while (store.users.find((u) => u.discountCode === code));
  return code;
}

// true si el codigo es el de este usuario y todavia no lo ha usado (solo se puede usar una vez).
// Si no, false. Se llama desde checkoutController al calcular el precio.
function isValidCode(code, user) {
  // Limpiamos lo que escribio el cliente: sin espacios alrededor y en mayusculas
  // (asi " globo-3f9a1c " tambien vale). code || "" evita fallos si no llega codigo.
  const clean = String(code || "").trim().toUpperCase();
  // Todas las condiciones deben cumplirse (&& = "y"): hay usuario, hay codigo, coincide con
  // el suyo y no esta usado (! = "no"). Boolean(...) asegura devolver true o false.
  return Boolean(user && clean && user.discountCode === clean && !user.discountUsed);
}

// Exportamos la constante y las tres funciones para usarlas en los controladores.
module.exports = { DISCOUNT_PERCENT, deliveryFeePercent, newDiscountCode, isValidCode };
