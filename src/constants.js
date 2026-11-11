// const   Es solo la palabra que sirve para crear una variable. Con const puedes guardar cualquier cosa, no solo listas
// const , crea una variable que no puede cambiar de valor , y que pertenece al servidor (backend)
// Marcas que tenemos en la aplicación, con su nombre completo para mostrar en el cliente
<<<<<<< HEAD
=======

>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
const BRANDS = {
  burgerking: "Burger King",
  mcdonalds: "McDonald's",
  sushita: "Sushita",
  telepizza: "Telepizza",
  honestgreens: "Honest Greens",
};

const BRAND_KEYS = Object.keys(BRANDS);
// Areas 
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
// A que pedidos se aplica un cupon
const COUPON_ORDER_TYPES = ["all", ...ORDER_TYPES];

<<<<<<< HEAD
// en Node cada archivo es un módulo (module) y exports es para que las constantes se 'saquen a fuera' y otros modulos puedan usarlas.
module.exports = { BRANDS, BRAND_KEYS, AREAS, TYPES, CATEGORIES, ORDER_TYPES, VEHICLES, ORDER_STATUSES, COUPON_ORDER_TYPES };
=======
// Tipos de reclamacion (los mismos que el <select> de complaint.html)
const COMPLAINT_TYPES = ["delivery", "food", "payment", "other"];
// Estados de una reclamacion
const COMPLAINT_STATUSES = ["open", "in progress", "resolved"];
// Temas de un mensaje de contacto
const MESSAGE_SUBJECTS = ["order", "restaurant", "account", "other"];
// Estados de un mensaje de contacto
const MESSAGE_STATUSES = ["new", "read", "answered"];

// en Node cada archivo es un módulo (module) y exports es para que las constantes se 'saquen a fuera' y otros modulos puedan usarlas.
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
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
