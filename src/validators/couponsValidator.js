// Validator de coupons (cupones de descuento): body de POST/PUT/PATCH y filtros de GET /api/coupons?...
const { COUPON_ORDER_TYPES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const couponSchema = {
  code: { type: "text", min: 3, max: 20, uppercase: true },          // "globo20" se guarda como "GLOBO20"
  percent: { type: "number", min: 1, max: 90, integer: true },       // % de descuento
  active: { type: "boolean" },
  orderType: { type: "option", options: COUPON_ORDER_TYPES },        // all | delivery | pickup
};

const couponQuerySchema = {
  search: { type: "text", min: 1, max: 20 },
  active: couponSchema.active,
  orderType: couponSchema.orderType,
};

const validateCoupon = (body, options) => validateBody(couponSchema, body, options);
const validateCouponQuery = (query) => validateQuery(couponQuerySchema, query);

module.exports = { validateCoupon, validateCouponQuery };
