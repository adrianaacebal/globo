// =====================================================================================
// ordersValidator.js  ->  reglas de los PEDIDOS (orders)
// =====================================================================================
// Validator de orders (pedidos): body de POST/PUT/PATCH y filtros de GET /api/orders?...
// Que restaurantId y riderId existan de verdad lo comprueba el controlador (el validator no mira datos).
// (El validator solo mira la FORMA del dato: que sea un numero entero positivo. Si existe un
//  restaurante o repartidor con ese id, y que un pedido "pickup" no lleve repartidor, lo
//  comprueba relationErrors() en ordersController.js, que tambien responde 400.)
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/ordersController.js en estos endpoints:
//   - POST   /api/orders       -> crear un pedido
//   - PUT    /api/orders/:id   -> reemplazarlo entero (todos los campos obligatorios salvo riderId)
//   - PATCH  /api/orders/:id   -> cambiar solo algunos campos (modo partial), p. ej. el status
//   - GET    /api/orders?...   y   GET /api/orders/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
//
// Constantes que vienen de src/constants.js:
//   - ORDER_TYPES:    delivery, pickup  (a domicilio o para recoger)
//   - ORDER_STATUSES: pending, preparing, on-the-way, delivered, cancelled
const { ORDER_TYPES, ORDER_STATUSES } = require("../constants");
// Las dos funciones genericas de validacion (ver common.js)
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// Describe cada campo de un pedido. El id no aparece: lo pone el servidor.
const orderSchema = {
  // customer: texto de 2 a 60 caracteres (nombre del cliente). Obligatorio.
  customer: { type: "text", min: 2, max: 60 },
  // restaurantId: numero ENTERO desde 1 (1e9 = 1.000.000.000 es solo un tope muy alto). Obligatorio.
  restaurantId: { type: "number", min: 1, max: 1e9, integer: true },
  // riderId: igual que restaurantId pero OPCIONAL: si no se manda se guarda null
  riderId: { type: "number", min: 1, max: 1e9, integer: true, optional: true }, // null si es para recoger
  // type: uno de ORDER_TYPES (delivery o pickup). Obligatorio.
  type: { type: "option", options: ORDER_TYPES },
  // status: uno de ORDER_STATUSES (pending, preparing, on-the-way, delivered, cancelled). Obligatorio.
  status: { type: "option", options: ORDER_STATUSES },
  // total: numero entre 0 y 1000 euros, redondeado a 2 decimales. Obligatorio.
  total: { type: "number", min: 0, max: 1000, decimals: 2 },
  // paid: true o false (si el pedido esta pagado). Obligatorio.
  paid: { type: "boolean" },
};

// ---------- Schema de la QUERY (filtros de GET /api/orders y /stats) ----------
// Todos los filtros son opcionales y se pueden combinar: ?type=delivery&paid=false
const orderQuerySchema = {
  // search: texto de 1 a 60 caracteres; el controlador lo busca en el nombre del cliente
  search: { type: "text", min: 1, max: 60 },
  // type, status y paid: se reutilizan las reglas del body
  // (paid llega como texto "true"/"false" en la URL y se convierte a booleano)
  type: orderSchema.type,
  status: orderSchema.status,
  paid: orderSchema.paid,
};

// Funciones que llama el controlador. options = { partial: true } en PATCH.
// Las dos devuelven { valid, value, errors }.
const validateOrder = (body, options) => validateBody(orderSchema, body, options);
const validateOrderQuery = (query) => validateQuery(orderQuerySchema, query);

// Se exportan para poder usarlas en ordersController.js
module.exports = { validateOrder, validateOrderQuery };
