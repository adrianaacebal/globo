// Validator del recurso restaurants: esquema del body (POST/PUT/PATCH) y de los filtros (GET /api/restaurants?...)
const { BRAND_KEYS, AREAS, TYPES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const restaurantSchema = {
  name: { type: "text", min: 2, max: 60 },
  brand: { type: "option", options: BRAND_KEYS },
  area: { type: "option", options: AREAS },
  type: { type: "option", options: TYPES },
  lat: { type: "number", min: -90, max: 90 },
  lon: { type: "number", min: -180, max: 180 },
};

const restaurantQuerySchema = {
  q: { type: "text", min: 1, max: 60 },
  brand: restaurantSchema.brand,
  area: restaurantSchema.area,
  type: restaurantSchema.type,
};

// options = { partial: true } en PATCH
const validateRestaurant = (body, options) => validateBody(restaurantSchema, body, options);

function validateRestaurantQuery(query) {
  const { value, errors } = validateQuery(restaurantQuerySchema, query);
  return { value, errors: Object.keys(errors).length ? errors : null };
}

module.exports = { validateRestaurant, validateRestaurantQuery };
