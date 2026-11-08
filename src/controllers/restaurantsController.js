const store = require("../data/store");
const { validateRestaurant, validateRestaurantQuery } = require("../validators/restaurantsValidator");
const { normalize, countBy, round2 } = require("../utils");

const notFound = (res) => res.status(404).json({ error: "Restaurant not found" });

// GET /api/restaurants/stats
function restaurantStats(req, res) {
  const { valid, value: filters, errors } = validateRestaurantQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = store.restaurants.all().filter(
    (r) =>
      (!filters.brand || r.brand === filters.brand) &&
      (!filters.area || r.area === filters.area) &&
      (!filters.type || r.type === filters.type) &&
      (filters.delivery === undefined || r.delivery === filters.delivery) &&
      (!filters.search || normalize(r.name).includes(normalize(filters.search)))
  );
  res.json({
    total: list.length,
    withDelivery: list.filter((r) => r.delivery).length,
    byBrand: countBy(list, "brand"),
    byArea: countBy(list, "area"),
    byType: countBy(list, "type"),
  });
}

// GET /api/restaurants -> 200 [ ... ]
function listRestaurants(req, res) {
  const { valid, value: filters, errors } = validateRestaurantQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const result = store.restaurants.all().filter(
    (r) =>
      (!filters.brand || r.brand === filters.brand) &&
      (!filters.area || r.area === filters.area) &&
      (!filters.type || r.type === filters.type) &&
      (filters.delivery === undefined || r.delivery === filters.delivery) &&
      (!filters.search || normalize(r.name).includes(normalize(filters.search)))
  );
  res.json(result);
}

// GET /api/restaurants/:id
function getRestaurant(req, res) {
  const restaurant = store.restaurants.findById(req.id);
  if (!restaurant) return notFound(res);
  res.json(restaurant);
}

// POST /api/restaurants -> 201
function createRestaurant(req, res) {
  const { valid, value, errors } = validateRestaurant(req.body);
  if (!valid) return res.status(400).json({ errors });
  const created = store.restaurants.create(value);
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/restaurants/:id -> 200
function replaceRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRestaurant(req.body);
  if (!valid) return res.status(400).json({ errors });
  res.json(store.restaurants.replace(req.id, value));
}

// PATCH /api/restaurants/:id -> 200
function updateRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRestaurant(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  res.json(store.restaurants.update(req.id, value));
}

// DELETE /api/restaurants/:id -> 204
function deleteRestaurant(req, res) {
  if (!store.restaurants.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listRestaurants, restaurantStats, getRestaurant, createRestaurant, replaceRestaurant, updateRestaurant, deleteRestaurant };
