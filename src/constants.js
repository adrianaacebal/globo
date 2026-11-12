// =====================================================================================
// constants.js  ->  LISTAS FIJAS de valores permitidos en la aplicacion.
// =====================================================================================
// Aqui se definen en un solo sitio las marcas, zonas, tipos, categorias, estados...
// Los usan sobre todo los validators (src/validators/) para comprobar que un dato que
// llega del cliente es uno de los valores permitidos (si no, responden 400 Bad Request),
// y tambien utils.js y checkoutController.js. Si manana hay una zona nueva, solo se
// cambia aqui y todo el proyecto la conoce.
//
// const  es la palabra que sirve para crear una variable. Con const puedes guardar cualquier
// cosa, no solo listas (textos, numeros, objetos, funciones...).
// Una variable const no se puede reasignar (no se puede hacer AREAS = otra cosa), y estas
// constantes pertenecen al servidor (backend), no al navegador.
//
// Marcas que tenemos en la aplicacion, con su nombre completo para mostrar en el cliente.
// Es un OBJETO: pares clave: valor. La clave (burgerking) es el identificador interno,
// sin espacios ni mayusculas; el valor ("Burger King") es el nombre bonito.

const BRANDS = {
  burgerking: "Burger King",
  mcdonalds: "McDonald's",
  sushita: "Sushita",
  telepizza: "Telepizza",
  honestgreens: "Honest Greens",
};

// Object.keys(BRANDS) devuelve solo las claves del objeto, como lista:
// ["burgerking", "mcdonalds", "sushita", "telepizza", "honestgreens"]
const BRAND_KEYS = Object.keys(BRANDS);
// Areas (zonas de Madrid) donde hay locales y repartidores. Llevan tildes, pero
// utils.pickOption permite que el cliente las escriba sin ellas ("chamberi").
const AREAS = ["Centro", "Chamartín", "Chamberí", "Fuencarral", "Moncloa", "Retiro", "Tetuán"];
// Tipos de comida
const TYPES = ["burger", "pizza", "sushi", "vegan"];
// Categorías de platos
const CATEGORIES = ["main", "side", "drink", "dessert"];
// Tipos de pedido
const ORDER_TYPES = ["delivery", "pickup"];

// Vehiculos de los repartidores
const VEHICLES = ["bike", "motorbike", "car"];
// Estados de un pedido
const ORDER_STATUSES = ["pending", "preparing", "on-the-way", "delivered", "cancelled"];
// "...ORDER_TYPES" (spread) copia aqui los elementos de ORDER_TYPES:
// el resultado es ["all", "delivery", "pickup"].
// A que pedidos se aplica un cupon
const COUPON_ORDER_TYPES = ["all", ...ORDER_TYPES];

// Tipos de reclamacion (los mismos que el <select> de complaint.html)
const COMPLAINT_TYPES = ["delivery", "food", "payment", "other"];
// Estados de una reclamacion
const COMPLAINT_STATUSES = ["open", "in progress", "resolved"];
// Temas de un mensaje de contacto
const MESSAGE_SUBJECTS = ["order", "restaurant", "account", "other"];
// Estados de un mensaje de contacto
const MESSAGE_STATUSES = ["new", "read", "answered"];

// En Node cada archivo es un modulo (module). module.exports es lo que el archivo "saca
// afuera": otros modulos pueden usarlo con require("./constants") o, por ejemplo,
// const { AREAS } = require("../constants"). Lo que no se exporta queda privado: por eso
// BRANDS (el objeto completo) no sale de este archivo, solo sus claves (BRAND_KEYS).
// La forma { BRAND_KEYS, AREAS, ... } es un atajo de { BRAND_KEYS: BRAND_KEYS, AREAS: AREAS, ... }.
module.exports = {
  BRAND_KEYS,
  AREAS,
  TYPES,
  CATEGORIES,
  ORDER_TYPES,
  VEHICLES,
  ORDER_STATUSES,
  COUPON_ORDER_TYPES,
  COMPLAINT_TYPES,
  COMPLAINT_STATUSES,
  MESSAGE_SUBJECTS,
  MESSAGE_STATUSES,
};
