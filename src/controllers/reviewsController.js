// Logica de /api/reviews (opiniones de los clientes sobre un restaurante)
const store = require("../data/store");
const { validateReview, validateReviewQuery } = require("../validators/reviewsValidator");
const { normalize, countBy, round2 } = require("../utils");

// ?search=&restaurantId=&rating=&verified=  (search busca en el autor y en el comentario)
function filterReviews(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (r) =>
      (filters.restaurantId === undefined || r.restaurantId === filters.restaurantId) &&
      (filters.rating === undefined || r.rating === filters.rating) &&
      (filters.verified === undefined || r.verified === filters.verified) &&
      (!search || normalize(r.author + r.comment).includes(search))
  );
}

// La opinion tiene que ser de un restaurante que existe
function relationErrors(review) {
  if (store.restaurants.findById(review.restaurantId)) return [];
  return [{ field: "restaurantId", message: `There is no restaurant with id ${review.restaurantId}` }];
}

const notFound = (res) => res.status(404).json({ error: "Review not found" });

// GET /api/reviews -> 200 [ ... ]
function listReviews(req, res) {
  const { valid, value: filters, errors } = validateReviewQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  res.json(filterReviews(store.reviews.all(), filters));
}

// GET /api/reviews/stats
function reviewStats(req, res) {
  const { valid, value: filters, errors } = validateReviewQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = filterReviews(store.reviews.all(), filters);
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  res.json({
    total: list.length,
    verified: list.filter((r) => r.verified).length,
    averageRating: list.length ? round2(sum / list.length) : 0,
    byRating: countBy(list, "rating"),
  });
}

// GET /api/reviews/:id
function getReview(req, res) {
  const review = store.reviews.findById(req.id);
  if (!review) return notFound(res);
  res.json(review);
}

// POST /api/reviews -> 201 + Location
function createReview(req, res) {
  const { valid, value, errors } = validateReview(req.body);
  if (!valid) return res.status(400).json({ errors });
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  const created = store.reviews.create(value);
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/reviews/:id
function replaceReview(req, res) {
  if (!store.reviews.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateReview(req.body);
  if (!valid) return res.status(400).json({ errors });
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  res.json(store.reviews.replace(req.id, value));
}

// PATCH /api/reviews/:id
function updateReview(req, res) {
  const current = store.reviews.findById(req.id);
  if (!current) return notFound(res);
  const { valid, value, errors } = validateReview(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  const related = relationErrors({ ...current, ...value });
  if (related.length) return res.status(400).json({ errors: related });
  res.json(store.reviews.update(req.id, value));
}

// DELETE /api/reviews/:id -> 204
function deleteReview(req, res) {
  if (!store.reviews.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listReviews, reviewStats, getReview, createReview, replaceReview, updateReview, deleteReview };
