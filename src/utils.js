// =====================================================================================
// utils.js  ->  FUNCIONES DE AYUDA (utilidades) que se usan en varios controladores.
// =====================================================================================
// Son funciones pequenas y "puras": reciben datos y devuelven un resultado, sin tocar
// req/res ni el store. Asi no repetimos el mismo codigo en cada controlador.
// Las usan, por ejemplo, restaurantsController, dishesController, ordersController,
// checkoutController... (con const { normalize, ... } = require("../utils")).
// =====================================================================================
//
// Traemos de constants.js solo la lista de claves de marca (la necesita brandKeyFromName).
const { BRAND_KEYS } = require("./constants");

// Normaliza texto para comparar: minusculas, sin tildes, sin espacios ni apostrofes
// ("McDonald's" -> "mcdonalds", "Chamberí" -> "chamberi")
// Ejemplo de uso: buscar "chamberi" encuentra un restaurante en "Chamberí".
function normalize(text) {
  // String(...) convierte a texto lo que llegue (un numero, por ejemplo).
  // text ?? "" : si text es null o undefined se usa "" (asi nunca falla con datos vacios).
  return String(text ?? "")
    .toLowerCase()
    // "NFD" separa cada letra de su tilde: "í" pasa a ser "i" + un signo de acento aparte.
    .normalize("NFD")
    // Borra esos signos de acento sueltos (el rango Unicode U+0300 a U+036F).
    .replace(/[̀-ͯ]/g, "")
    // Borra todo lo que no sea letra a-z o numero 0-9 (espacios, apostrofes, guiones...).
    .replace(/[^a-z0-9]/g, "");
}

// Busca un valor en una lista fija sin importar mayusculas/tildes y devuelve el valor oficial
// pickOption(AREAS, "chamberi") -> "Chamberí"   ·   pickOption(AREAS, "Paris") -> undefined
// options = la lista oficial (por ejemplo AREAS de constants.js); value = lo que escribio el cliente.
function pickOption(options, value) {
  // Normalizamos lo que llega una sola vez...
  const wanted = normalize(value);
  // ...y find devuelve el primer elemento de la lista cuya version normalizada coincide
  // (o undefined si no hay ninguno). Asi guardamos siempre el valor oficial, con su tilde.
  return options.find((option) => normalize(option) === wanted);
}

// Marca a partir de un nombre de local: "Telepizza Gran Vía" -> "telepizza"
// Se usa cuando el cliente manda el nombre de un restaurante y necesitamos saber de que marca es.
function brandKeyFromName(name) {
  // Primero normalizamos: "Telepizza Gran Vía" -> "telepizzagranvia".
  const clean = normalize(name);
  // Si queda texto, buscamos la clave de marca con la que empieza (startsWith).
  // El ? : es un "if" corto: condicion ? valor_si_true : valor_si_false.
  return clean ? BRAND_KEYS.find((key) => clean.startsWith(key)) : undefined;
}

// Redondea a 2 decimales (para precios): round2(12.345) -> 12.35.
// Multiplica por 100, redondea al entero mas cercano y vuelve a dividir entre 100.
// Es una "funcion flecha" guardada en una constante: (n) => ... equivale a function (n) { return ... }.
const round2 = (n) => Math.round(n * 100) / 100;

// Cuenta cuantos hay de cada valor: countBy(restaurantes, "area") -> { Centro: 4, Retiro: 2, ... }
// Se usa en las rutas /stats de los controladores para hacer resumenes.
function countBy(list, field) {
  // reduce recorre la lista acumulando un resultado. acc (acumulador) empieza siendo {}
  // (el segundo argumento de reduce) y en cada vuelta se le suma 1 al valor de ese item.
  return list.reduce((acc, item) => {
    // (acc[...] || 0): si ese valor aun no estaba contado, empezamos desde 0.
    acc[item[field]] = (acc[item[field]] || 0) + 1;
    return acc;
  }, {});
}

// Exportamos las funciones para que otros archivos puedan usarlas con require("../utils").
module.exports = { normalize, pickOption, brandKeyFromName, round2, countBy };
