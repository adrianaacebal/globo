// Reglas de precio compartidas: codigo de bienvenida y gastos de envio
const crypto = require("crypto");
const store = require("./store");

const DISCOUNT_PERCENT = 10; // % de descuento del codigo de bienvenida

// Gastos de envio segun lo que tarda la moto (sin contar la cocina):
//   hasta 15 min -> 5% del precio de la comida · mas de 15 min -> 7%
const SHORT_TRIP_MAX_MINUTES = 15;
const SHORT_TRIP_FEE_PERCENT = 5;
const LONG_TRIP_FEE_PERCENT = 7;

// Porcentaje de envio para un pedido (0 si es para recoger)
function deliveryFeePercent(type, travelMinutes) {
  if (type !== "delivery") return 0;
  const mins = Number(travelMinutes);
  if (Number.isFinite(mins) && mins <= SHORT_TRIP_MAX_MINUTES) return SHORT_TRIP_FEE_PERCENT;
  return LONG_TRIP_FEE_PERCENT;
}

// "GLOBO-3F9A1C" (se repite si por casualidad ya existe)
function newDiscountCode() {
  let code;
  do {
    code = "GLOBO-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  } while (store.users.find((u) => u.discountCode === code));
  return code;
}

// true si el codigo es el de este usuario y todavia no lo ha usado
function isValidCode(code, user) {
  const clean = String(code || "").trim().toUpperCase();
  return Boolean(user && clean && user.discountCode === clean && !user.discountUsed);
}

module.exports = { DISCOUNT_PERCENT, deliveryFeePercent, newDiscountCode, isValidCode };
