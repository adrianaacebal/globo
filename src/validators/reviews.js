// Validator del recurso reviews: esquema del body (POST/PUT/PATCH) y de los filtros (GET /api/reviews?...)
// Que restaurantId exista de verdad lo comprueba el controlador (necesita mirar el store).
const { validateBody, validateQuery } = require("./common");

const reviewSchema = {
  restaurantId: { type: "number", integer: true, min: 1, max: 1000000 },
  author: { type: "text", min: 2, max: 60 },
  rating: { type: "number", integer: true, min: 1, max: 5 },
  comment: { type: "text", min: 2, max: 500 },
};

const reviewQuerySchema = {
  q: { type: "text", min: 1, max: 60 },
  restaurantId: reviewSchema.restaurantId,
  minRating: reviewSchema.rating,
};

// options = { partial: true } en PATCH
const validateReview = (body, options) => validateBody(reviewSchema, body, options);

function validateReviewQuery(query) {
  const { value, errors } = validateQuery(reviewQuerySchema, query);
  return { value, errors: Object.keys(errors).length ? errors : null };
}

module.exports = { validateReview, validateReviewQuery };
