// Logica de /api/orders: gestion de todos los pedidos (pagina orders.html).
// Los pedidos de los clientes llegan desde el checkout (checkoutController -> POST /orders).
const store = require("../store");
const { validateOrder, validateOrderQuery } = require("../validators/orders");
const { normalize, round2, countBy } = require("../utils");

// Campos que pone el servidor y no se pueden cambiar desde /api/orders
const SERVER_FIELDS = ["userId", "date", "items", "subtotal", "discount", "deliveryFee", "deliveryFeePercent"];

function serverFields(order) {
  return Object.fromEntries(SERVER_FIELDS.filter((f) => order[f] !== undefined).map((f) => [f, order[f]]));
}

// Aplica los filtros de la query: ?q=&brand=&area=&type=&payment=&status=&minTotal=&maxTotal=
// q busca en el email del cliente
function filterOrders(list, f) {
  const q = normalize(f.q);
  return list.filter(
    (o) =>
      (!f.brand || o.brand === f.brand) &&
      (!f.area || o.area === f.area) &&
      (!f.type || o.type === f.type) &&
      (!f.payment || o.payment === f.payment) &&
      (!f.status || o.status === f.status) &&
      (f.minTotal === undefined || o.total >= f.minTotal) &&
      (f.maxTotal === undefined || o.total <= f.maxTotal) &&
      (!q || normalize(o.email).includes(q))
  );
}

const notFound = (res) => res.status(404).json({ error: "Order not found" });

// GET /api/orders -> 200 [ ... ] (el mas nuevo primero)
function listOrders(req, res) {
  const { value: filters, errors } = validateOrderQuery(req.query);
  if (errors) return res.status(400).json({ errors });
  res.json(filterOrders(store.orders.all(), filters).reverse());
}

// GET /api/orders/stats (acepta los mismos filtros)
function orderStats(req, res) {
  const { value: filters, errors } = validateOrderQuery(req.query);
  if (errors) return res.status(400).json({ errors });

  const list = filterOrders(store.orders.all(), filters);
  const revenue = round2(list.reduce((sum, o) => sum + o.total, 0));
  res.json({
    total: list.length,
    revenue,
    averageTotal: list.length ? round2(revenue / list.length) : 0,
    byStatus: countBy(list, "status"),
    byBrand: countBy(list, "brand"),
    byType: countBy(list, "type"),
    byPayment: countBy(list, "payment"),
  });
}

// GET /api/orders/:id
function getOrder(req, res) {
  const order = store.orders.findById(req.id);
  if (!order) return notFound(res);
  res.json(order);
}

// POST /api/orders -> 201 (pedido hecho por telefono, sin lista de platos)
function createOrder(req, res) {
  const { value, errors } = validateOrder(req.body);
  if (errors) return res.status(400).json({ errors });
  const created = store.orders.create({ ...value, items: [], date: new Date().toISOString(), userId: null });
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/orders/:id -> sustituye los campos editables; los del servidor se conservan
function replaceOrder(req, res) {
  const current = store.orders.findById(req.id);
  if (!current) return notFound(res);
  const { value, errors } = validateOrder(req.body);
  if (errors) return res.status(400).json({ errors });
  res.json(store.orders.replace(req.id, { ...value, ...serverFields(current) }));
}

// PATCH /api/orders/:id -> cambia solo los campos enviados (p. ej. { "status": "delivered" })
function updateOrder(req, res) {
  if (!store.orders.findById(req.id)) return notFound(res);
  const { value, errors } = validateOrder(req.body, { partial: true });
  if (errors) return res.status(400).json({ errors });
  res.json(store.orders.update(req.id, value));
}

// DELETE /api/orders/:id -> 204
function deleteOrder(req, res) {
  if (!store.orders.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listOrders, orderStats, getOrder, createOrder, replaceOrder, updateOrder, deleteOrder };
