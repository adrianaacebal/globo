const {BRAND_KEYS, TYPES,  AREAS} = require("../constants");
const { validateBody, validateQuery } = require("./common");

// sirve para crear o cambiar una variable (POST,PUT,Patch)
const restaurantSchema = {
    name: {type: "text", min:2 , max:60},
    brand: {type: "option", options: BRAND_KEYS},
    delivery: {type: "boolean"},
    area: {type: "option", options: AREAS},
    type: {type: "option", options: TYPES},
    lat: {type: "number", min:-90, max:90},
    lon: {type: 'number', min:-180, max:180}
 }
// sirve para filtrar (GET /api/restaurants?...)
const restaurantQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  brand: restaurantSchema.brand,
  area: restaurantSchema.area,
  delivery: restaurantSchema.delivery,
  type: restaurantSchema.type
};

const validateRestaurant = (body, options) => validateBody(restaurantSchema, body, options);
const validateRestaurantQuery = (query) => validateQuery(restaurantQuerySchema, query);

module.exports = { validateRestaurant, validateRestaurantQuery };

