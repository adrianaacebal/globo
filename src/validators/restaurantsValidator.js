<<<<<<< HEAD
// Validator de restaurants (el recurso PRINCIPAL): body de POST/PUT/PATCH y filtros de GET /api/restaurants?...
const { BRAND_KEYS, AREAS, TYPES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const restaurantSchema = {
  name: { type: "text", min: 2, max: 60 },          // texto obligatorio con limite
  brand: { type: "option", options: BRAND_KEYS },  // lista cerrada
  area: { type: "option", options: AREAS },        // lista cerrada
  type: { type: "option", options: TYPES },        // lista cerrada
  delivery: { type: "boolean" },                   // booleano: true = reparte a domicilio
  lat: { type: "number", min: -90, max: 90 },      // numero con rango
  lon: { type: "number", min: -180, max: 180 },
};

// ?search= busca en nombre y zona · el resto son filtros que se combinan
=======
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
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
const restaurantQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  brand: restaurantSchema.brand,
  area: restaurantSchema.area,
<<<<<<< HEAD
  type: restaurantSchema.type,
  delivery: restaurantSchema.delivery,
};

// options = { partial: true } en PATCH. Devuelve { valid, value, errors: [{ field, message }] }
=======
  delivery: restaurantSchema.delivery,
  type: restaurantSchema.type
};

>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
const validateRestaurant = (body, options) => validateBody(restaurantSchema, body, options);
const validateRestaurantQuery = (query) => validateQuery(restaurantQuerySchema, query);

module.exports = { validateRestaurant, validateRestaurantQuery };
<<<<<<< HEAD
=======

>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
