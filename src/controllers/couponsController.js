// Logica de /api/coupons (cupones de descuento que se usan al pedir en order.html)
const store = require("../data/store");
const { validateCoupon, validateCouponQuery } = require("../validators/couponsValidator");
const { countBy, round2 } = require("../utils");

// ?search=&active=&orderType=  (se combinan todos)
function filterCoupons(list, filters) {
  const search = (filters.search || "").toUpperCase();
  return list.filter(
    (c) =>
      (filters.active === undefined || c.active === filters.active) &&
      (!filters.orderType || c.orderType === filters.orderType) &&
      (!search || c.code.includes(search))
  );
}

// Dos cupones no pueden tener el mismo codigo (exceptId: el que se esta editando)
<<<<<<< HEAD
const isDuplicate = (code, exceptId) => Boolean(store.coupons.find((c) => c.id !== exceptId && c.code === code));
=======
const isDuplicate = (code, exceptId) => Boolean(store.coupons.all().find((c) => c.id !== exceptId && c.code === code));
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c

const notFound = (res) => res.status(404).json({ error: "Coupon not found" });
const duplicate = (res) =>
  res.status(409).json({ errors: [{ field: "code", message: "A coupon with that code already exists" }] });

// GET /api/coupons -> 200 [ ... ]
function listCoupons(req, res) {
  const { valid, value: filters, errors } = validateCouponQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  res.json(filterCoupons(store.coupons.all(), filters));
}

// GET /api/coupons/stats
function couponStats(req, res) {
  const { valid, value: filters, errors } = validateCouponQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = filterCoupons(store.coupons.all(), filters);
  const sum = list.reduce((acc, c) => acc + c.percent, 0);
  res.json({
    total: list.length,
    active: list.filter((c) => c.active).length,
    averagePercent: list.length ? round2(sum / list.length) : 0,
    byOrderType: countBy(list, "orderType"),
  });
}

// GET /api/coupons/:id
function getCoupon(req, res) {
  const coupon = store.coupons.findById(req.id);
  if (!coupon) return notFound(res);
  res.json(coupon);
}

// POST /api/coupons -> 201 + Location (409 si el codigo ya existe)
function createCoupon(req, res) {
  const { valid, value, errors } = validateCoupon(req.body);
  if (!valid) return res.status(400).json({ errors });
  if (isDuplicate(value.code)) return duplicate(res);
  const created = store.coupons.create(value);
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/coupons/:id
function replaceCoupon(req, res) {
  if (!store.coupons.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateCoupon(req.body);
  if (!valid) return res.status(400).json({ errors });
  if (isDuplicate(value.code, req.id)) return duplicate(res);
  res.json(store.coupons.replace(req.id, value));
}

// PATCH /api/coupons/:id
function updateCoupon(req, res) {
  if (!store.coupons.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateCoupon(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  if (value.code && isDuplicate(value.code, req.id)) return duplicate(res);
  res.json(store.coupons.update(req.id, value));
}

// DELETE /api/coupons/:id -> 204
function deleteCoupon(req, res) {
  if (!store.coupons.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listCoupons, couponStats, getCoupon, createCoupon, replaceCoupon, updateCoupon, deleteCoupon };
