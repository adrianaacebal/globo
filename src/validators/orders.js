// Validator del recurso orders: esquema del body (POST/PUT/PATCH) y de los filtros (GET /api/orders?...)
const { BRAND_KEYS, AREAS, ORDER_TYPES, PAYMENTS, ORDER_STATUSES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

// Campos que se pueden editar desde la pagina de gestion (orders.html).
// Los platos, el desglose del precio, la fecha y el usuario los pone el servidor en el checkout.
const orderSchema = {
  email: { type: "email" },
  brand: { type: "option", options: BRAND_KEYS },
  area: { type: "option", options: AREAS },
  type: { type: "option", options: ORDER_TYPES },
  payment: { type: "option", options: PAYMENTS },
  status: { type: "option", options: ORDER_STATUSES, default: "pending" },
  total: { type: "number", min: 0, max: 10000, decimals: 2 },
};

const orderQuerySchema = {
  q: { type: "text", min: 1, max: 100 },
  brand: orderSchema.brand,
  area: orderSchema.area,
  type: orderSchema.type,
  payment: orderSchema.payment,
  status: { type: "option", options: ORDER_STATUSES },
  minTotal: { type: "number", min: 0, max: 10000 },
  maxTotal: { type: "number", min: 0, max: 10000 },
};

// options = { partial: true } en PATCH
const validateOrder = (body, options) => validateBody(orderSchema, body, options);

function validateOrderQuery(query) {
  const { value, errors } = validateQuery(orderQuerySchema, query);
  if (value.minTotal !== undefined && value.maxTotal !== undefined && value.minTotal > value.maxTotal) {
    errors.minTotal = "minTotal cannot be greater than maxTotal";
  }
  return { value, errors: Object.keys(errors).length ? errors : null };
}

module.exports = { validateOrder, validateOrderQuery };
