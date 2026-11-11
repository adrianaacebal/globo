<<<<<<< HEAD
// Logica de /api/restaurants (locales de cada marca)
const store = require("../data/store");
const { validateRestaurant, validateRestaurantQuery } = require("../validators/restaurantsValidator");
const { normalize, countBy } = require("../utils");

// Aplica los filtros de la query: ?search=&brand=&area=&type=&delivery=  (se combinan todos)
// search busca en el nombre y en la zona sin mayusculas ni tildes ("retiro" encuentra "Telepizza Atocha")
function filterRestaurants(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
=======
const store = require("../data/store");
const { validateRestaurant, validateRestaurantQuery } = require("../validators/restaurantsValidator");
const { normalize, countBy, round2 } = require("../utils");

const notFound = (res) => res.status(404).json({ error: "Restaurant not found" });

// GET /api/restaurants/stats
function restaurantStats(req, res) {
  const { valid, value: filters, errors } = validateRestaurantQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = store.restaurants.all().filter(
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
    (r) =>
      (!filters.brand || r.brand === filters.brand) &&
      (!filters.area || r.area === filters.area) &&
      (!filters.type || r.type === filters.type) &&
      (filters.delivery === undefined || r.delivery === filters.delivery) &&
<<<<<<< HEAD
      (!search || normalize(r.name + r.area).includes(search))
  );
}

const notFound = (res) => res.status(404).json({ error: "Restaurant not found" });

// GET /api/restaurants  (?search=&brand=&area=&type=&delivery=) -> 200 [ ... ] (lista vacia si no hay coincidencias)
function listRestaurants(req, res) {
  const { valid, value: filters, errors } = validateRestaurantQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  res.json(filterRestaurants(store.restaurants.all(), filters));
}

// GET /api/restaurants/stats  (acepta los mismos filtros). Se calcula en cada peticion, nunca se guarda
function restaurantStats(req, res) {
  const { valid, value: filters, errors } = validateRestaurantQuery(req.query);
  if (!valid) return res.status(400).json({ errors });

  const list = filterRestaurants(store.restaurants.all(), filters);
  res.json({
    total: list.length,
    withDelivery: list.filter((r) => r.delivery).length,
    pickupOnly: list.filter((r) => !r.delivery).length,
=======
      (!filters.search || normalize(r.name).includes(normalize(filters.search)))
  );
  res.json({
    total: list.length,
    withDelivery: list.filter((r) => r.delivery).length,
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
    byBrand: countBy(list, "brand"),
    byArea: countBy(list, "area"),
    byType: countBy(list, "type"),
  });
}

<<<<<<< HEAD
=======
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

>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
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

<<<<<<< HEAD
// PUT /api/restaurants/:id -> sustituye el restaurante entero (todos los campos obligatorios)
=======
// PUT /api/restaurants/:id -> 200
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
function replaceRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRestaurant(req.body);
  if (!valid) return res.status(400).json({ errors });
  res.json(store.restaurants.replace(req.id, value));
}

<<<<<<< HEAD
// PATCH /api/restaurants/:id -> cambia solo los campos enviados
=======
// PATCH /api/restaurants/:id -> 200
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
function updateRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRestaurant(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  res.json(store.restaurants.update(req.id, value));
}

<<<<<<< HEAD
// DELETE /api/restaurants/:id -> 204 sin body
=======
// DELETE /api/restaurants/:id -> 204
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
function deleteRestaurant(req, res) {
  if (!store.restaurants.remove(req.id)) return notFound(res);
  res.status(204).end();
}

<<<<<<< HEAD
module.exports = {
  listRestaurants,
  restaurantStats,
  getRestaurant,
  createRestaurant,
  replaceRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
=======
module.exports = { listRestaurants, restaurantStats, getRestaurant, createRestaurant, replaceRestaurant, updateRestaurant, deleteRestaurant };
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
