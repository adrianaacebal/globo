// Validator del recurso dishes: esquema del body (POST/PUT/PATCH) y de los filtros (GET /api/dishes?...)
const { BRAND_KEYS, CATEGORIES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const dishSchema = {
  name: { type: "text", min: 2, max: 60 },
  brand: { type: "option", options: BRAND_KEYS },
  category: { type: "option", options: CATEGORIES },
  price: { type: "number", min: 0.1, max: 500, decimals: 2 },
};

const dishQuerySchema = {
  q: { type: "text", min: 1, max: 60 },
  brand: dishSchema.brand,
  category: dishSchema.category,
  minPrice: { type: "number", min: 0, max: 500 },
  maxPrice: { type: "number", min: 0, max: 500 },
};

// options = { partial: true } en PATCH
const validateDish = (body, options) => validateBody(dishSchema, body, options);

function validateDishQuery(query) {
  const { value, errors } = validateQuery(dishQuerySchema, query);
  if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) {
    errors.minPrice = "minPrice cannot be greater than maxPrice";
  }
  return { value, errors: Object.keys(errors).length ? errors : null };
}

module.exports = { validateDish, validateDishQuery };
