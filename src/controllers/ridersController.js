// Logica de /api/riders (repartidores). Solo habla con el store, nunca con los arrays.
const store = require("../data/store");
const { validateRider, validateRiderQuery } = require("../validators/ridersValidator");
const { normalize, countBy, round2 } = require("../utils");

// ?search=&vehicle=&area=&available=  (se combinan todos)
function filterRiders(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (r) =>
      (!filters.vehicle || r.vehicle === filters.vehicle) &&
      (!filters.area || r.area === filters.area) &&
      (filters.available === undefined || r.available === filters.available) &&
      (!search || normalize(r.name).includes(search))
  );
}

const notFound = (res) => res.status(404).json({ error: "Rider not found" });

// GET /api/riders -> 200 [ ... ]
function listRiders(req, res) {
  const { valid, value: filters, errors } = validateRiderQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  res.json(filterRiders(store.riders.all(), filters));
}

// GET /api/riders/stats
function riderStats(req, res) {
  const { valid, value: filters, errors } = validateRiderQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = filterRiders(store.riders.all(), filters);
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  res.json({
    total: list.length,
    available: list.filter((r) => r.available).length,
    averageRating: list.length ? round2(sum / list.length) : 0,
    byVehicle: countBy(list, "vehicle"),
  });
}

// GET /api/riders/:id
function getRider(req, res) {
  const rider = store.riders.findById(req.id);
  if (!rider) return notFound(res);
  res.json(rider);
}

// POST /api/riders -> 201 + Location
function createRider(req, res) {
  const { valid, value, errors } = validateRider(req.body);
  if (!valid) return res.status(400).json({ errors });
  const created = store.riders.create(value);
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/riders/:id -> sustituye el repartidor entero
function replaceRider(req, res) {
  if (!store.riders.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRider(req.body);
  if (!valid) return res.status(400).json({ errors });
  res.json(store.riders.replace(req.id, value));
}

// PATCH /api/riders/:id -> cambia solo los campos enviados
function updateRider(req, res) {
  if (!store.riders.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRider(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  res.json(store.riders.update(req.id, value));
}

// DELETE /api/riders/:id -> 204. Los pedidos que tenia asignados se quedan sin repartidor
function deleteRider(req, res) {
  if (!store.riders.remove(req.id)) return notFound(res);
  for (const order of store.orders.all().filter((o) => o.riderId === req.id)) {
    store.orders.update(order.id, { riderId: null });
  }
  res.status(204).end();
}

module.exports = { listRiders, riderStats, getRider, createRider, replaceRider, updateRider, deleteRider };
