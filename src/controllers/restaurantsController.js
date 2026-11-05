// Logica de /restaurants (locales de cada marca)
const store = require("../store");
const { validateRestaurant, validateRestaurantQuery } = require("../validators");
const { normalize } = require("../utils");

// Aplica los filtros de la query: ?q=&brand=&area=&type=
// q busca en el nombre y en la zona ("retiro" encuentra "Telepizza Atocha", que esta en Retiro)
function filterRestaurants(list, filters) {
  const q = normalize(filters.q);
  return list.filter(
    (r) =>
      (!filters.brand || r.brand === filters.brand) &&
      (!filters.area || r.area === filters.area) &&
      (!filters.type || r.type === filters.type) &&
      (!q || normalize(r.name + r.area).includes(q))
  );
}

// { Centro: 4, Retiro: 2, ... }
function countBy(list, field) {
  return list.reduce((acc, item) => {
    acc[item[field]] = (acc[item[field]] || 0) + 1;
    return acc;
  }, {});
}

const notFound = (res) => res.status(404).json({ error: "Restaurant not found" });

// GET /restaurants  (?q=&brand=&area=&type=) -> 200 [ ... ] (lista vacia si no hay coincidencias)
function listRestaurants(req, res) {
  const { value: filters, errors } = validateRestaurantQuery(req.query);
  if (errors) return res.status(400).json({ errors });
  res.json(filterRestaurants(store.restaurants.all(), filters));
}

// GET /restaurants/stats  (acepta los mismos filtros)
function restaurantStats(req, res) {
  const { value: filters, errors } = validateRestaurantQuery(req.query);
  if (errors) return res.status(400).json({ errors });

  const list = filterRestaurants(store.restaurants.all(), filters);
  res.json({
    total: list.length,
    byBrand: countBy(list, "brand"),
    byArea: countBy(list, "area"),
    byType: countBy(list, "type"),
  });
}

// GET /restaurants/:id
function getRestaurant(req, res) {
  const restaurant = store.restaurants.findById(req.id);
  if (!restaurant) return notFound(res);
  res.json(restaurant);
}

// POST /restaurants -> 201
function createRestaurant(req, res) {
  const { value, errors } = validateRestaurant(req.body);
  if (errors) return res.status(400).json({ errors });
  res.status(201).json(store.restaurants.create(value));
}

// PUT /restaurants/:id -> sustituye el restaurante entero (todos los campos obligatorios)
function replaceRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { value, errors } = validateRestaurant(req.body);
  if (errors) return res.status(400).json({ errors });
  res.json(store.restaurants.replace(req.id, value));
}

// PATCH /restaurants/:id -> cambia solo los campos enviados
function updateRestaurant(req, res) {
  if (!store.restaurants.findById(req.id)) return notFound(res);
  const { value, errors } = validateRestaurant(req.body, { partial: true });
  if (errors) return res.status(400).json({ errors });
  res.json(store.restaurants.update(req.id, value));
}

// DELETE /restaurants/:id -> 204 sin body
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
