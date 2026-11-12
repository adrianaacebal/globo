// =====================================================================================
// dishesValidator.js  ->  reglas de los PLATOS de la carta (dishes)
// =====================================================================================
// Validator de dishes: body de POST/PUT/PATCH y filtros de GET /api/dishes?...
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/dishesController.js en estos endpoints:
//   - POST   /api/dishes       -> crear un plato
//   - PUT    /api/dishes/:id   -> reemplazarlo entero (todos los campos obligatorios)
//   - PATCH  /api/dishes/:id   -> cambiar solo algunos campos (modo partial), p. ej. el precio
//   - GET    /api/dishes?...   y   GET /api/dishes/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
// (Que una marca no tenga dos platos con el mismo nombre NO lo mira el validator: lo
//  comprueba el controlador mirando los datos guardados y responde 409.)
//
// Constantes que vienen de src/constants.js:
//   - BRAND_KEYS: burgerking, mcdonalds, sushita, telepizza, honestgreens
//   - CATEGORIES: main, side, drink, dessert  (principal, acompanamiento, bebida, postre)
const { BRAND_KEYS, CATEGORIES } = require("../constants");
// Las dos funciones genericas de validacion (ver common.js)
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// Describe cada campo de un plato. El id no aparece: lo pone el servidor. Todos son obligatorios.
const dishSchema = {
  // name: texto de 2 a 60 caracteres (nombre del plato)
  name: { type: "text", min: 2, max: 60 },
  // brand: una de las marcas de BRAND_KEYS (a que marca pertenece el plato)
  brand: { type: "option", options: BRAND_KEYS },
  // category: una de CATEGORIES (main, side, drink, dessert)
  category: { type: "option", options: CATEGORIES },
  // price: numero entre 0.1 y 500 euros, redondeado a 2 decimales (p. ej. 7.5 o 12.99)
  price: { type: "number", min: 0.1, max: 500, decimals: 2 },
};

// ---------- Schema de la QUERY (filtros de GET /api/dishes y /stats) ----------
// Todos los filtros son opcionales y se pueden combinar: ?brand=telepizza&maxPrice=10
const dishQuerySchema = {
  // search: texto de 1 a 60 caracteres; el controlador lo busca en el nombre del plato
  search: { type: "text", min: 1, max: 60 },
  // brand y category: se reutilizan las mismas reglas del body
  brand: dishSchema.brand,
  category: dishSchema.category,
  // minPrice / maxPrice: numeros entre 0 y 500 para filtrar por rango de precio
  // (llegan como texto en la URL, p. ej. "10", y common.js los convierte a numero)
  minPrice: { type: "number", min: 0, max: 500 },
  maxPrice: { type: "number", min: 0, max: 500 },
};

// Funcion que llama el controlador para el body.
// options = { partial: true } en PATCH. Devuelve { valid, value, errors: [{ field, message }] }
const validateDish = (body, options) => validateBody(dishSchema, body, options);

// Funcion que llama el controlador para la query. Ademas de las reglas normales, hace una
// comprobacion extra que mira DOS campos a la vez (eso no se puede expresar en el schema):
// el precio minimo no puede ser mayor que el maximo (?minPrice=20&maxPrice=5 no tiene sentido).
function validateDishQuery(query) {
  // Primero la validacion normal de common.js
  const check = validateQuery(dishQuerySchema, query);
  // Cogemos los dos precios ya convertidos a numero (pueden ser undefined si no se mandaron)
  const { minPrice, maxPrice } = check.value;
  // Solo comparamos si han llegado los dos
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    // Anadimos el error a la lista y marcamos el resultado como no valido
    check.errors.push({ field: "minPrice", message: "minPrice cannot be greater than maxPrice" });
    check.valid = false;
  }
  // Devolvemos el mismo formato { valid, value, errors }
  return check;
}

// Se exportan para poder usarlas en dishesController.js
module.exports = { validateDish, validateDishQuery };
