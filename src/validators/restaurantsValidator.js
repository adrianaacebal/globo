// =====================================================================================
// restaurantsValidator.js  ->  reglas de los RESTAURANTES (locales de cada marca)
// =====================================================================================
// Validator de restaurants: body de POST/PUT/PATCH y filtros de GET /api/restaurants?...
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/restaurantsController.js en estos endpoints:
//   - POST   /api/restaurants       -> crear un restaurante
//   - PUT    /api/restaurants/:id   -> reemplazarlo entero (todos los campos obligatorios)
//   - PATCH  /api/restaurants/:id   -> cambiar solo algunos campos (modo partial), p. ej. delivery
//   - GET    /api/restaurants?...   y   GET /api/restaurants/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
//
// Constantes que vienen de src/constants.js:
//   - BRAND_KEYS: burgerking, mcdonalds, sushita, telepizza, honestgreens
//   - TYPES:      burger, pizza, sushi, vegan  (tipo de comida)
//   - AREAS:      Centro, Chamartín, Chamberí, Fuencarral, Moncloa, Retiro, Tetuán
const {BRAND_KEYS, TYPES,  AREAS} = require("../constants");
// Las dos funciones genericas de validacion (ver common.js)
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// sirve para crear o cambiar un restaurante (POST, PUT, PATCH): describe como tiene que ser cada campo.
// El id no aparece: lo pone el servidor. Todos los campos son obligatorios (salvo en PATCH).
const restaurantSchema = {
    // name: texto de 2 a 60 caracteres (p. ej. "Telepizza Gran Vía")
    name: {type: "text", min:2 , max:60},
    // brand: una de las marcas de BRAND_KEYS
    brand: {type: "option", options: BRAND_KEYS},
    // delivery: true o false (si el local reparte a domicilio)
    delivery: {type: "boolean"},
    // area: una de AREAS; da igual mayusculas o tildes ("chamberi" se guarda como "Chamberí")
    area: {type: "option", options: AREAS},
    // type: uno de TYPES (burger, pizza, sushi, vegan)
    type: {type: "option", options: TYPES},
    // lat: latitud, numero entre -90 y 90 (posicion del local en el mapa)
    lat: {type: "number", min:-90, max:90},
    // lon: longitud, numero entre -180 y 180 (posicion del local en el mapa)
    lon: {type: 'number', min:-180, max:180}
 }
 
// ---------- Schema de la QUERY (filtros) ----------
// sirve para filtrar (GET /api/restaurants?...)  y tambien GET /api/restaurants/stats?...
// Todos los filtros son opcionales y se pueden combinar: ?area=Retiro&delivery=true
const restaurantQuerySchema = {
  // search: texto de 1 a 60 caracteres; el controlador lo busca en el nombre del restaurante
  search: { type: "text", min: 1, max: 60 },
  // brand, area, delivery y type: se reutilizan las mismas reglas del body
  // (delivery llega como texto "true"/"false" en la URL y se convierte a booleano)
  brand: restaurantSchema.brand,
  area: restaurantSchema.area,
  delivery: restaurantSchema.delivery,
  type: restaurantSchema.type
};

// Funciones que llama el controlador. options = { partial: true } en PATCH.
// Las dos devuelven { valid, value, errors }.
const validateRestaurant = (body, options) => validateBody(restaurantSchema, body, options);
const validateRestaurantQuery = (query) => validateQuery(restaurantQuerySchema, query);

// Se exportan para poder usarlas en restaurantsController.js
module.exports = { validateRestaurant, validateRestaurantQuery };

