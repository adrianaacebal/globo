// Logica de /api/orders (CRUD de pedidos). Los pedidos que se confirman en order.html tambien acaban aqui.
// (checkoutController.js es el flujo de la web: /order, /order/total y el historial /orders del usuario)
const store = require("../data/store");
const { validateOrder, validateOrderQuery } = require("../validators/ordersValidator");
const { normalize, countBy, round2 } = require("../utils");

// ?search=&type=&status=&paid=  (search busca en el nombre del cliente)
function filterOrders(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (o) =>
      (!filters.type || o.type === filters.type) &&
      (!filters.status || o.status === filters.status) &&
      (filters.paid === undefined || o.paid === filters.paid) &&
      (!search || normalize(o.customer).includes(search))
  );
}

// El restaurante y el repartidor tienen que existir. Un pedido para recoger no lleva repartidor.
function relationErrors(order) {
  const errors = [];
  if (!store.restaurants.findById(order.restaurantId)) {
    errors.push({ field: "restaurantId", message: `There is no restaurant with id ${order.restaurantId}` });
  }
  if (order.riderId && !store.riders.findById(order.riderId)) {
    errors.push({ field: "riderId", message: `There is no rider with id ${order.riderId}` });
  }
  if (order.type === "pickup" && order.riderId) {
    errors.push({ field: "riderId", message: "A pickup order cannot have a rider" });
  }
  return errors;
}

const notFound = (res) => res.status(404).json({ error: "Order not found" });

// GET /api/orders -> 200 [ ... ]
function listOrders(req, res) {
  const { valid, value: filters, errors } = validateOrderQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  res.json(filterOrders(store.orders.all(), filters));
}

// GET /api/orders/stats
function orderStats(req, res) {
  const { valid, value: filters, errors } = validateOrderQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = filterOrders(store.orders.all(), filters);
  const revenue = list.reduce((acc, o) => acc + o.total, 0);
  res.json({
    total: list.length,
    paid: list.filter((o) => o.paid).length,
    revenue: round2(revenue),
    averageTotal: list.length ? round2(revenue / list.length) : 0,
    byStatus: countBy(list, "status"),
    byType: countBy(list, "type"),
  });
}

// GET /api/orders/:id
function getOrder(req, res) {
  const order = store.orders.findById(req.id);
  if (!order) return notFound(res);
  res.json(order);
}

// POST /api/orders -> 201 + Location
function createOrder(req, res) {
  const { valid, value, errors } = validateOrder(req.body);
  if (!valid) return res.status(400).json({ errors });
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  const created = store.orders.create(value);
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/orders/:id
function replaceOrder(req, res) {
  if (!store.orders.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateOrder(req.body);
  if (!valid) return res.status(400).json({ errors });
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  res.json(store.orders.replace(req.id, value));
}

// PATCH /api/orders/:id (p. ej. solo { "status": "delivered" })
function updateOrder(req, res) {
  const current = store.orders.findById(req.id);
  if (!current) return notFound(res);
  const { valid, value, errors } = validateOrder(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  const related = relationErrors({ ...current, ...value });
  if (related.length) return res.status(400).json({ errors: related });
  res.json(store.orders.update(req.id, value));
}

// DELETE /api/orders/:id -> 204
function deleteOrder(req, res) {
  if (!store.orders.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listOrders, orderStats, getOrder, createOrder, replaceOrder, updateOrder, deleteOrder };
