// Logica de /api/reviews: valoraciones (1 a 5 estrellas) de cada restaurante.
// Cada valoracion apunta a un restaurante con restaurantId.
const store = require("../store");
const { validateReview, validateReviewQuery } = require("../validators/reviews");
const { normalize, round2, countBy } = require("../utils");

// Aplica los filtros de la query: ?q=&restaurantId=&minRating=
// q busca en el autor y en el comentario
function filterReviews(list, f) {
  const q = normalize(f.q);
  return list.filter(
    (r) =>
      (f.restaurantId === undefined || r.restaurantId === f.restaurantId) &&
      (f.minRating === undefined || r.rating >= f.minRating) &&
      (!q || normalize(r.author + r.comment).includes(q))
  );
}

const average = (list) => (list.length ? round2(list.reduce((sum, r) => sum + r.rating, 0) / list.length) : 0);

// Valida el body y ademas comprueba que el restaurante exista. Devuelve todos los errores juntos.
function checkReview(body, options) {
  const { value, errors } = validateReview(body, options);
  if (value.restaurantId !== undefined && !store.restaurants.findById(value.restaurantId)) {
    return { value, errors: { ...errors, restaurantId: `No restaurant has id ${value.restaurantId}` } };
  }
  return { value, errors };
}

const notFound = (res) => res.status(404).json({ error: "Review not found" });

// GET /api/reviews -> 200 [ ... ] (la mas nueva primero)
function listReviews(req, res) {
  const { value: filters, errors } = validateReviewQuery(req.query);
  if (errors) return res.status(400).json({ errors });
  res.json(filterReviews(store.reviews.all(), filters).reverse());
}

// GET /api/reviews/stats (acepta los mismos filtros)
function reviewStats(req, res) {
  const { value: filters, errors } = validateReviewQuery(req.query);
  if (errors) return res.status(400).json({ errors });

  const list = filterReviews(store.reviews.all(), filters);

  // { "4": { restaurant: "McDonald's Gran Vía", count: 1, averageRating: 4 } }
  const byRestaurant = {};
  for (const id of new Set(list.map((r) => r.restaurantId))) {
    const ofThis = list.filter((r) => r.restaurantId === id);
    const restaurant = store.restaurants.findById(id);
    byRestaurant[id] = { restaurant: restaurant ? restaurant.name : null, count: ofThis.length, averageRating: average(ofThis) };
  }

  res.json({
    total: list.length,
    averageRating: average(list),
    byRating: countBy(list, "rating"),
    byRestaurant,
  });
}

// GET /api/reviews/:id
function getReview(req, res) {
  const review = store.reviews.findById(req.id);
  if (!review) return notFound(res);
  res.json(review);
}

// POST /api/reviews -> 201 (400 si el restaurante no existe)
function createReview(req, res) {
  const { value, errors } = checkReview(req.body);
  if (errors) return res.status(400).json({ errors });
  const created = store.reviews.create({ ...value, createdAt: new Date().toISOString() });
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/reviews/:id -> sustituye todos los campos (createdAt se conserva)
function replaceReview(req, res) {
  const current = store.reviews.findById(req.id);
  if (!current) return notFound(res);
  const { value, errors } = checkReview(req.body);
  if (errors) return res.status(400).json({ errors });
  res.json(store.reviews.replace(req.id, { ...value, createdAt: current.createdAt }));
}

// PATCH /api/reviews/:id -> cambia solo los campos enviados
function updateReview(req, res) {
  if (!store.reviews.findById(req.id)) return notFound(res);
  const { value, errors } = checkReview(req.body, { partial: true });
  if (errors) return res.status(400).json({ errors });
  res.json(store.reviews.update(req.id, value));
}

// DELETE /api/reviews/:id -> 204
function deleteReview(req, res) {
  if (!store.reviews.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listReviews, reviewStats, getReview, createReview, replaceReview, updateReview, deleteReview };
