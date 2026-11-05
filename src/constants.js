// Listas fijas que usan los validadores (y que deben coincidir con los <select> del cliente).

// Marcas: clave interna -> nombre que se muestra
const BRANDS = {
  burgerking: "Burger King",
  mcdonalds: "McDonald's",
  sushita: "Sushita",
  telepizza: "Telepizza",
  honestgreens: "Honest Greens",
};
const BRAND_KEYS = Object.keys(BRANDS);

const AREAS = ["Centro", "Chamartín", "Chamberí", "Fuencarral", "Moncloa", "Retiro", "Tetuán"];
const TYPES = ["burger", "pizza", "sushi", "vegan"];
const CATEGORIES = ["main", "side", "drink", "dessert"];
const ORDER_TYPES = ["delivery", "pickup"];

module.exports = { BRANDS, BRAND_KEYS, AREAS, TYPES, CATEGORIES, ORDER_TYPES };
