// const   Es solo la palabra que sirve para crear una variable. Con const puedes guardar cualquier cosa, no solo listas
// const , crea una variable que no puede cambiar de valor , y que pertenece al servidor (backend)
// Marcas que tenemos en la aplicación, con su nombre completo para mostrar en el cliente
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


// en Node cada archivo es un módulo (module) y exports es para que las constantes se 'saquen a fuera' y otros modulos puedan usarlas.
module.exports = { BRANDS, BRAND_KEYS, AREAS, TYPES, CATEGORIES, ORDER_TYPES };
