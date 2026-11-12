// =====================================================================================
// couponsValidator.js  ->  reglas de los CUPONES DE DESCUENTO (coupons)
// =====================================================================================
// Validator de coupons (cupones de descuento): body de POST/PUT/PATCH y filtros de GET /api/coupons?...
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/couponsController.js en estos endpoints:
//   - POST   /api/coupons       -> crear un cupon
//   - PUT    /api/coupons/:id   -> reemplazarlo entero (todos los campos obligatorios)
//   - PATCH  /api/coupons/:id   -> cambiar solo algunos campos (modo partial), p. ej. active
//   - GET    /api/coupons?...   y   GET /api/coupons/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
// (Que no haya dos cupones con el mismo codigo NO lo mira el validator, porque tendria que
//  consultar los datos guardados: lo comprueba el controlador y responde 409.)
//
// Constante que viene de src/constants.js:
//   - COUPON_ORDER_TYPES: all, delivery, pickup  (a que tipo de pedido se aplica el cupon)
const { COUPON_ORDER_TYPES } = require("../constants");
// Las dos funciones genericas de validacion (ver common.js)
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// Describe cada campo de un cupon. El id no aparece: lo pone el servidor. Todos son obligatorios.
const couponSchema = {
  // code: texto de 3 a 20 caracteres que se guarda en MAYUSCULAS (uppercase)
  code: { type: "text", min: 3, max: 20, uppercase: true },          // "globo20" se guarda como "GLOBO20"
  // percent: numero ENTERO entre 1 y 90 (no se permite un 100% de descuento)
  percent: { type: "number", min: 1, max: 90, integer: true },       // % de descuento
  // active: true o false (si el cupon se puede usar ahora mismo o no)
  active: { type: "boolean" },
  // orderType: uno de COUPON_ORDER_TYPES (para todos los pedidos, solo a domicilio o solo para recoger)
  orderType: { type: "option", options: COUPON_ORDER_TYPES },        // all | delivery | pickup
};

// ---------- Schema de la QUERY (filtros de GET /api/coupons y /stats) ----------
// Todos los filtros son opcionales y se pueden combinar: ?active=true&orderType=pickup
const couponQuerySchema = {
  // search: texto de 1 a 20 caracteres; el controlador lo busca dentro del codigo del cupon
  search: { type: "text", min: 1, max: 20 },
  // active: en la URL llega como texto "true"/"false" y se convierte a booleano
  active: couponSchema.active,
  // orderType: misma regla que en el body
  orderType: couponSchema.orderType,
};

// Funciones que llama el controlador. options = { partial: true } en PATCH.
// Las dos devuelven { valid, value, errors }.
const validateCoupon = (body, options) => validateBody(couponSchema, body, options);
const validateCouponQuery = (query) => validateQuery(couponQuerySchema, query);

// Se exportan para poder usarlas en couponsController.js
module.exports = { validateCoupon, validateCouponQuery };
