// Logica de /api/restaurants (locales de cada marca)
const store = require("../data/store");
const { validateRestaurant, validateRestaurantQuery } = require("../validators/restaurantsValidator");
const { normalize, countBy } = require("../utils");

// Aplica los filtros de la query: ?search=&brand=&area=&type=&delivery=  (se combinan todos)
// search busca en el nombre y en la zona sin mayusculas ni tildes ("retiro" encuentra "Telepizza Atocha")
function filterRestaurants(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (r) =>
      (!filters.brand || r.brand === filters.brand) &&
      (!filters.area || r.area === filters.area) &&
      (!filters.type || r.type === filters.type) &&
      (filters.delivery === undefined || r.delivery === filters.delivery) &&
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
    byBrand: countBy(list, "brand"),
    byArea: countBy(list, "area"),
    byType: countBy(list, "type"),
  });
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

// PUT /api/restaurants/:id -> sustituye el restaurante entero (todos los campos obligatorios)
function replaceRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRestaurant(req.body);
  if (!valid) return res.status(400).json({ errors });
  res.json(store.restaurants.replace(req.id, value));
}

// PATCH /api/restaurants/:id -> cambia solo los campos enviados
function updateRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateRestaurant(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  res.json(store.restaurants.update(req.id, value));
}

// DELETE /api/restaurants/:id -> 204 sin body
function deleteRestaurant(req, res) {
  if (!store.restaurants.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = {
  listRestaurants,
  restaurantStats,
  getRestaurant,
  createRestaurant,
  replaceRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
