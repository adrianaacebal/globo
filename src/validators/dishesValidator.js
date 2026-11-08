// Validator de dishes: body de POST/PUT/PATCH y filtros de GET /api/dishes?...
const { BRAND_KEYS, CATEGORIES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const dishSchema = {
  name: { type: "text", min: 2, max: 60 },
  brand: { type: "option", options: BRAND_KEYS },
  category: { type: "option", options: CATEGORIES },
  price: { type: "number", min: 0.1, max: 500, decimals: 2 },
};

const dishQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  brand: dishSchema.brand,
  category: dishSchema.category,
  minPrice: { type: "number", min: 0, max: 500 },
  maxPrice: { type: "number", min: 0, max: 500 },
};

// options = { partial: true } en PATCH. Devuelve { valid, value, errors: [{ field, message }] }
const validateDish = (body, options) => validateBody(dishSchema, body, options);

function validateDishQuery(query) {
  const check = validateQuery(dishQuerySchema, query);
  const { minPrice, maxPrice } = check.value;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    check.errors.push({ field: "minPrice", message: "minPrice cannot be greater than maxPrice" });
    check.valid = false;
  }
  return check;
}

module.exports = { validateDish, validateDishQuery };
