// Validator de orders (pedidos): body de POST/PUT/PATCH y filtros de GET /api/orders?...
// Que restaurantId y riderId existan de verdad lo comprueba el controlador (el validator no mira datos).
const { ORDER_TYPES, ORDER_STATUSES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const orderSchema = {
  customer: { type: "text", min: 2, max: 60 },
  restaurantId: { type: "number", min: 1, max: 1e9, integer: true },
  riderId: { type: "number", min: 1, max: 1e9, integer: true, optional: true }, // null si es para recoger
  type: { type: "option", options: ORDER_TYPES },
  status: { type: "option", options: ORDER_STATUSES },
  total: { type: "number", min: 0, max: 1000, decimals: 2 },
  paid: { type: "boolean" },
};

const orderQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  type: orderSchema.type,
  status: orderSchema.status,
  paid: orderSchema.paid,
};

const validateOrder = (body, options) => validateBody(orderSchema, body, options);
const validateOrderQuery = (query) => validateQuery(orderQuerySchema, query);

module.exports = { validateOrder, validateOrderQuery };
