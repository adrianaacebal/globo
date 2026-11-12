// =====================================================================================
// ridersValidator.js  ->  reglas de los REPARTIDORES (riders)
// =====================================================================================
// Validator de riders (repartidores): body de POST/PUT/PATCH y filtros de GET /api/riders?...
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/ridersController.js en estos endpoints:
//   - POST   /api/riders       -> crear un repartidor
//   - PUT    /api/riders/:id   -> reemplazarlo entero (todos los campos obligatorios)
//   - PATCH  /api/riders/:id   -> cambiar solo algunos campos (modo partial), p. ej. available
//   - GET    /api/riders?...   y   GET /api/riders/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
//
// Constantes que vienen de src/constants.js:
//   - AREAS:    Centro, Chamartín, Chamberí, Fuencarral, Moncloa, Retiro, Tetuán
//   - VEHICLES: bike, motorbike, car
const { AREAS, VEHICLES } = require("../constants");
// Las dos funciones genericas de validacion (ver common.js)
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// Describe cada campo de un repartidor. El id no aparece: lo pone el servidor. Todos son obligatorios.
const riderSchema = {
  // name: texto de 2 a 60 caracteres
  name: { type: "text", min: 2, max: 60 },
  // vehicle: uno de VEHICLES (bike, motorbike, car)
  vehicle: { type: "option", options: VEHICLES },
  // area: una de AREAS; da igual mayusculas o tildes ("chamberi" se guarda como "Chamberí")
  area: { type: "option", options: AREAS },
  // available: true o false (si ahora mismo puede repartir)
  available: { type: "boolean" },
  // rating: numero entre 0 y 5 con decimales (p. ej. 4.7). Como lleva "decimals", common.js
  // lo redondea con round2 (a 2 decimales como mucho)
  rating: { type: "number", min: 0, max: 5, decimals: 1 },
};

// ---------- Schema de la QUERY (filtros de GET /api/riders y /stats) ----------
// Todos los filtros son opcionales y se pueden combinar: ?area=Retiro&available=true
const riderQuerySchema = {
  // search: texto de 1 a 60 caracteres; el controlador lo busca en el nombre del repartidor
  search: { type: "text", min: 1, max: 60 },
  // vehicle, area y available: se reutilizan las reglas del body
  // (available llega como texto "true"/"false" en la URL y se convierte a booleano)
  vehicle: riderSchema.vehicle,
  area: riderSchema.area,
  available: riderSchema.available,
};

// Funciones que llama el controlador. options = { partial: true } en PATCH.
// Las dos devuelven { valid, value, errors }.
const validateRider = (body, options) => validateBody(riderSchema, body, options);
const validateRiderQuery = (query) => validateQuery(riderQuerySchema, query);

// Se exportan para poder usarlas en ridersController.js
module.exports = { validateRider, validateRiderQuery };
