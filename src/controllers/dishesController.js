// Logica de /api/dishes (platos de la carta de cada marca) y de /menu
const store = require("../store");
const { validateDish, validateDishQuery } = require("../validators/dishes");
const { normalize, brandKeyFromName, round2 } = require("../utils");

// Aplica los filtros de la query: ?q=&brand=&category=&minPrice=&maxPrice=
function filterDishes(list, f) {
  return list.filter(
    (d) =>
      (!f.brand || d.brand === f.brand) &&
      (!f.category || d.category === f.category) &&
      (f.minPrice === undefined || d.price >= f.minPrice) &&
      (f.maxPrice === undefined || d.price <= f.maxPrice) &&
      (!f.q || normalize(d.name).includes(normalize(f.q)))
  );
}

// Una marca no puede tener dos platos con el mismo nombre (exceptId: el plato que se edita)
function isDuplicate({ brand, name }, exceptId) {
  return Boolean(
    store.dishes.find((d) => d.id !== exceptId && d.brand === brand && normalize(d.name) === normalize(name))
  );
}

const notFound = (res) => res.status(404).json({ error: "Dish not found" });
const duplicate = (res) =>
  res.status(409).json({ errors: { name: "This brand already has a dish with that name" } });

// { count, averagePrice } de una lista de platos
function priceSummary(list) {
  const sum = list.reduce((acc, d) => acc + d.price, 0);
  return { count: list.length, averagePrice: list.length ? round2(sum / list.length) : 0 };
}

function groupSummary(list, field) {
  const groups = {};
  for (const dish of list) (groups[dish[field]] ||= []).push(dish);
  return Object.fromEntries(Object.entries(groups).map(([key, items]) => [key, priceSummary(items)]));
}

// GET /api/dishes -> 200 [ ... ]
function listDishes(req, res) {
  const { value: filters, errors } = validateDishQuery(req.query);
  if (errors) return res.status(400).json({ errors });
  res.json(filterDishes(store.dishes.all(), filters));
}

// GET /api/dishes/stats (acepta los mismos filtros)
function dishStats(req, res) {
  const { value: filters, errors } = validateDishQuery(req.query);
  if (errors) return res.status(400).json({ errors });

  const list = filterDishes(store.dishes.all(), filters);
  const prices = list.map((d) => d.price);
  res.json({
    total: list.length,
    averagePrice: priceSummary(list).averagePrice,
    minPrice: list.length ? Math.min(...prices) : null,
    maxPrice: list.length ? Math.max(...prices) : null,
    byBrand: groupSummary(list, "brand"),
    byCategory: groupSummary(list, "category"),
  });
}

// GET /api/dishes/:id
function getDish(req, res) {
  const dish = store.dishes.findById(req.id);
  if (!dish) return notFound(res);
  res.json(dish);
}

// POST /api/dishes -> 201 (409 si la marca ya tiene un plato con ese nombre)
function createDish(req, res) {
  const { value, errors } = validateDish(req.body);
  if (errors) return res.status(400).json({ errors });
  if (isDuplicate(value)) return duplicate(res);
  const created = store.dishes.create(value);
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/dishes/:id
function replaceDish(req, res) {
  if (!store.dishes.findById(req.id)) return notFound(res);
  const { value, errors } = validateDish(req.body);
  if (errors) return res.status(400).json({ errors });
  if (isDuplicate(value, req.id)) return duplicate(res);
  res.json(store.dishes.replace(req.id, value));
}

// PATCH /api/dishes/:id
function updateDish(req, res) {
  const current = store.dishes.findById(req.id);
  if (!current) return notFound(res);
  const { value, errors } = validateDish(req.body, { partial: true });
  if (errors) return res.status(400).json({ errors });
  if (isDuplicate({ ...current, ...value }, req.id)) return duplicate(res);
  res.json(store.dishes.update(req.id, value));
}

// DELETE /api/dishes/:id -> 204
function deleteDish(req, res) {
  if (!store.dishes.remove(req.id)) return notFound(res);
  res.status(204).end();
}

// GET /menu?restaurant=McDonald's -> carta completa de la marca (la usa order.html)
function getMenu(req, res) {
  const { restaurant } = req.query;
  if (typeof restaurant !== "string" || !restaurant.trim()) {
    return res.status(400).json({ errors: { restaurant: "restaurant is required" } });
  }
  const brand = brandKeyFromName(restaurant);
  if (!brand) return res.status(404).json({ error: "Restaurant not found" });
  res.json(store.dishes.all().filter((d) => d.brand === brand));
}

module.exports = { listDishes, dishStats, getDish, createDish, replaceDish, updateDish, deleteDish, getMenu };
