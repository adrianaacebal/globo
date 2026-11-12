// =====================================================================================
// reviewsValidator.js  ->  reglas de las OPINIONES de los clientes (reviews)
// =====================================================================================
// Validator de reviews (opiniones): body de POST/PUT/PATCH y filtros de GET /api/reviews?...
// Que restaurantId exista de verdad lo comprueba el controlador (el validator no mira datos).
// (El validator solo mira que sea un numero entero positivo; relationErrors() en
//  reviewsController.js busca el restaurante y, si no existe, responde 400.)
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/reviewsController.js en estos endpoints:
//   - POST   /api/reviews       -> crear una opinion
//   - PUT    /api/reviews/:id   -> reemplazarla entera (todos los campos obligatorios)
//   - PATCH  /api/reviews/:id   -> cambiar solo algunos campos (modo partial)
//   - GET    /api/reviews?...   y   GET /api/reviews/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
// Este validator no necesita ninguna constante de constants.js (no tiene campos tipo option).
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// Describe cada campo de una opinion. El id no aparece: lo pone el servidor. Todos son obligatorios.
const reviewSchema = {
  // restaurantId: numero ENTERO desde 1 (1e9 = 1.000.000.000 es solo un tope muy alto)
  restaurantId: { type: "number", min: 1, max: 1e9, integer: true },
  // author: texto de 2 a 40 caracteres (quien escribe la opinion)
  author: { type: "text", min: 2, max: 40 },
  // rating: numero ENTERO entre 1 y 5
  rating: { type: "number", min: 1, max: 5, integer: true },   // de 1 a 5 estrellas
  // comment: texto de 3 a 300 caracteres
  comment: { type: "text", min: 3, max: 300 },
  // verified: true o false
  verified: { type: "boolean" },                               // true si GLOBO comprobo que pidio alli
};

// ---------- Schema de la QUERY (filtros de GET /api/reviews y /stats) ----------
// Todos los filtros son opcionales y se pueden combinar: ?restaurantId=3&rating=5
const reviewQuerySchema = {
  // search: texto de 1 a 60 caracteres; el controlador lo busca en el autor y en el comentario
  search: { type: "text", min: 1, max: 60 },
  // restaurantId, rating y verified: se reutilizan las reglas del body
  // (en la URL llegan como texto, "3" o "true", y common.js los convierte a numero o booleano)
  restaurantId: reviewSchema.restaurantId,
  rating: reviewSchema.rating,
  verified: reviewSchema.verified,
};

// Funciones que llama el controlador. options = { partial: true } en PATCH.
// Las dos devuelven { valid, value, errors }.
const validateReview = (body, options) => validateBody(reviewSchema, body, options);
const validateReviewQuery = (query) => validateQuery(reviewQuerySchema, query);

// Se exportan para poder usarlas en reviewsController.js
module.exports = { validateReview, validateReviewQuery };
