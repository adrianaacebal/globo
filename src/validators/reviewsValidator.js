// Validator de reviews (opiniones): body de POST/PUT/PATCH y filtros de GET /api/reviews?...
// Que restaurantId exista de verdad lo comprueba el controlador (el validator no mira datos).
const { validateBody, validateQuery } = require("./common");

const reviewSchema = {
  restaurantId: { type: "number", min: 1, max: 1e9, integer: true },
  author: { type: "text", min: 2, max: 40 },
  rating: { type: "number", min: 1, max: 5, integer: true },   // de 1 a 5 estrellas
  comment: { type: "text", min: 3, max: 300 },
  verified: { type: "boolean" },                               // true si GLOBO comprobo que pidio alli
};

const reviewQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  restaurantId: reviewSchema.restaurantId,
  rating: reviewSchema.rating,
  verified: reviewSchema.verified,
};

const validateReview = (body, options) => validateBody(reviewSchema, body, options);
const validateReviewQuery = (query) => validateQuery(reviewQuerySchema, query);

module.exports = { validateReview, validateReviewQuery };
