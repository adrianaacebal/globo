
const restaurants = [
  { name: "Burger King Chamartín", brand: "burgerking", area: "Chamartín", type: "burger", delivery: true, lat: 40.4721547, lon: -3.6827027 },
  { name: "Burger King Tetuán", brand: "burgerking", area: "Tetuán", type: "burger", delivery: true, lat: 40.4606115, lon: -3.69986 },
  { name: "Burger King Cuatro Caminos", brand: "burgerking", area: "Tetuán", type: "burger", delivery: false, lat: 40.4582009, lon: -3.7009311 },
  { name: "McDonald's Gran Vía", brand: "mcdonalds", area: "Centro", type: "burger", delivery: true, lat: 40.4217486, lon: -3.7082893 },
  { name: "McDonald's Princesa", brand: "mcdonalds", area: "Moncloa", type: "burger", delivery: true, lat: 40.4250027, lon: -3.7126422 },
  { name: "McDonald's Chamberí", brand: "mcdonalds", area: "Chamberí", type: "burger", delivery: true, lat: 40.4323068, lon: -3.7055092 },
  { name: "McDonald's Atocha", brand: "mcdonalds", area: "Retiro", type: "burger", delivery: true, lat: 40.4096453, lon: -3.6927171 },
  { name: "McDonald's Montecarmelo", brand: "mcdonalds", area: "Fuencarral", type: "burger", delivery: false, lat: 40.5014306, lon: -3.6971944 },
  { name: "Sushita Chamartín", brand: "sushita", area: "Chamartín", type: "sushi", delivery: true, lat: 40.4721547, lon: -3.6827027 },
  { name: "Sushita Tetuán", brand: "sushita", area: "Tetuán", type: "sushi", delivery: true, lat: 40.4606115, lon: -3.69986 },
  { name: "Sushita Cuatro Caminos", brand: "sushita", area: "Tetuán", type: "sushi", delivery: false, lat: 40.4582009, lon: -3.7009311 },
  { name: "Sushita Gran Vía", brand: "sushita", area: "Centro", type: "sushi", delivery: true, lat: 40.4217486, lon: -3.7082893 },
  { name: "Sushita Princesa", brand: "sushita", area: "Moncloa", type: "sushi", delivery: true, lat: 40.4250027, lon: -3.7126422 },
  { name: "Sushita Chamberí", brand: "sushita", area: "Chamberí", type: "sushi", delivery: true, lat: 40.4323068, lon: -3.7055092 },
  { name: "Sushita Atocha", brand: "sushita", area: "Retiro", type: "sushi", delivery: true, lat: 40.4096453, lon: -3.6927171 },
  { name: "Sushita Montecarmelo", brand: "sushita", area: "Fuencarral", type: "sushi", delivery: false, lat: 40.5014306, lon: -3.6971944 },
  { name: "Telepizza Chamartín", brand: "telepizza", area: "Chamartín", type: "pizza", delivery: true, lat: 40.4721547, lon: -3.6827027 },
  { name: "Telepizza Tetuán", brand: "telepizza", area: "Tetuán", type: "pizza", delivery: true, lat: 40.4606115, lon: -3.69986 },
  { name: "Telepizza Cuatro Caminos", brand: "telepizza", area: "Tetuán", type: "pizza", delivery: false, lat: 40.4582009, lon: -3.7009311 },
  { name: "Telepizza Gran Vía", brand: "telepizza", area: "Centro", type: "pizza", delivery: true, lat: 40.4217486, lon: -3.7082893 },
  { name: "Telepizza Princesa", brand: "telepizza", area: "Moncloa", type: "pizza", delivery: true, lat: 40.4250027, lon: -3.7126422 },
  { name: "Telepizza Chamberí", brand: "telepizza", area: "Chamberí", type: "pizza", delivery: true, lat: 40.4323068, lon: -3.7055092 },
  { name: "Telepizza Atocha", brand: "telepizza", area: "Retiro", type: "pizza", delivery: true, lat: 40.4096453, lon: -3.6927171 },
  { name: "Telepizza Montecarmelo", brand: "telepizza", area: "Fuencarral", type: "pizza", delivery: false, lat: 40.5014306, lon: -3.6971944 },
  { name: "Honest Greens Chamartín", brand: "honestgreens", area: "Chamartín", type: "vegan", delivery: true, lat: 40.4721547, lon: -3.6827027 },
  { name: "Honest Greens Tetuán", brand: "honestgreens", area: "Tetuán", type: "vegan", delivery: true, lat: 40.4606115, lon: -3.69986 },
  { name: "Honest Greens Cuatro Caminos", brand: "honestgreens", area: "Tetuán", type: "vegan", delivery: false, lat: 40.4582009, lon: -3.7009311 },
  { name: "Honest Greens Gran Vía", brand: "honestgreens", area: "Centro", type: "vegan", delivery: true, lat: 40.4217486, lon: -3.7082893 },
  { name: "Honest Greens Princesa", brand: "honestgreens", area: "Moncloa", type: "vegan", delivery: true, lat: 40.4250027, lon: -3.7126422 },
  { name: "Honest Greens Chamberí", brand: "honestgreens", area: "Chamberí", type: "vegan", delivery: true, lat: 40.4323068, lon: -3.7055092 },
];


const dishes = [
  { name: "Whopper", brand: "burgerking", category: "main", price: 6.5 },
  { name: "Patatas", brand: "burgerking", category: "side", price: 2.5 },

  { name: "Big Mac", brand: "mcdonalds", category: "main", price: 6.2 },
  { name: "McNuggets", brand: "mcdonalds", category: "main", price: 5 },
  { name: "Patatas", brand: "mcdonalds", category: "side", price: 2.5 },
  { name: "McFlurry", brand: "mcdonalds", category: "dessert", price: 3.5 },
  { name: "McWrap", brand: "mcdonalds", category: "main", price: 4.5 },
  { name: "Veggie Burger", brand: "mcdonalds", category: "main", price: 5 },
  { name: "Long Chicken", brand: "mcdonalds", category: "main", price: 5.5 },

  { name: "Salmon Maki", brand: "sushita", category: "main", price: 6.5 },
  { name: "Tuna Maki", brand: "sushita", category: "main", price: 5.5 },
  { name: "Veggie Maki", brand: "sushita", category: "main", price: 4.5 },
  { name: "California Roll", brand: "sushita", category: "main", price: 7 },
  { name: "water", brand: "sushita", category: "drink", price: 1 },
  { name: "Soy sauce", brand: "sushita", category: "side", price: 0.5 },
  { name: "Japanese Green Tea", brand: "sushita", category: "drink", price: 2 },
  { name: "Herbal Tea", brand: "sushita", category: "drink", price: 2.5 },
  { name: "Nigiri with Salmon", brand: "sushita", category: "main", price: 7 },
  { name: "Nigiri with Tuna", brand: "sushita", category: "main", price: 6.5 },
  { name: "Nigiri with Vegetables", brand: "sushita", category: "main", price: 5.5 },

  { name: "Hawaiian Pizza", brand: "telepizza", category: "main", price: 8.5 },
  { name: "Pepperoni Pizza", brand: "telepizza", category: "main", price: 9 },
  { name: "Veggie Pizza", brand: "telepizza", category: "main", price: 7.5 },
  { name: "Cheese Pizza", brand: "telepizza", category: "main", price: 7 },
  { name: "Margarita Pizza", brand: "telepizza", category: "main", price: 7.5 },
  { name: "Chicken Pizza", brand: "telepizza", category: "main", price: 9.5 },
  { name: "Meat Lovers Pizza", brand: "telepizza", category: "main", price: 10 },
  { name: "Tuna Pizza", brand: "telepizza", category: "main", price: 9 },
  { name: "water", brand: "telepizza", category: "drink", price: 1 },
  { name: "Coca-Cola", brand: "telepizza", category: "drink", price: 1.5 },
  { name: "Beer", brand: "telepizza", category: "drink", price: 2.5 },

  { name: "Quinoa Salad", brand: "honestgreens", category: "main", price: 8 },
  { name: "Vegan Burger", brand: "honestgreens", category: "main", price: 9 },
  { name: "Green Smoothie", brand: "honestgreens", category: "drink", price: 5 },
  { name: "Avocado Toast", brand: "honestgreens", category: "main", price: 7 },
  { name: "water", brand: "honestgreens", category: "drink", price: 1 },
  { name: "Kombucha", brand: "honestgreens", category: "drink", price: 2 },
  { name: "Herbal Tea", brand: "honestgreens", category: "drink", price: 2.5 },
];

const users = [
  { id: 1, name: "Alice", email: "alice@example.com", password: "password123" },
  { id: 2, name: "Bob", email: "bob@example.com", password: "password456" },
  { id:3, name: "Ana", email: "ana@example.com", password: "password789" },
  { id:4, name: "Carlos", email: "carlos@example.com", password: "password012" }
];

// Repartidores. vehicle y area son listas cerradas (src/constants.js)
const riders = [
  { name: "Lucía Gómez", vehicle: "motorbike", area: "Centro", available: true, rating: 4.8 },
  { name: "Javier Ruiz", vehicle: "bike", area: "Chamberí", available: true, rating: 4.5 },
  { name: "Marta López", vehicle: "car", area: "Chamartín", available: false, rating: 4.2 },
  { name: "Pablo Sanz", vehicle: "motorbike", area: "Tetuán", available: true, rating: 3.9 },
  { name: "Sara Martín", vehicle: "bike", area: "Retiro", available: false, rating: 4.9 },
];

// Cupones de descuento que se pueden escribir al pedir (order.html)
const coupons = [
  { code: "GLOBO20", percent: 20, active: true, orderType: "all" },
  { code: "PICKUP15", percent: 15, active: true, orderType: "pickup" },
  { code: "SUMMER30", percent: 30, active: false, orderType: "delivery" },
];

// Pedidos. restaurantId -> restaurants.id · riderId -> riders.id (null si es para recoger)
const orders = [
  { customer: "Alice", restaurantId: 4, riderId: 1, type: "delivery", status: "delivered", total: 18.6, paid: true },
  { customer: "Bob", restaurantId: 20, riderId: null, type: "pickup", status: "preparing", total: 16.5, paid: true },
  { customer: "Ana", restaurantId: 14, riderId: 2, type: "delivery", status: "on-the-way", total: 21, paid: false },
];

// Opiniones de los clientes sobre un restaurante. restaurantId -> restaurants.id
const reviews = [
  { restaurantId: 4, author: "Alice", rating: 5, comment: "Fast and hot, the Big Mac was perfect.", verified: true },
  { restaurantId: 4, author: "Carlos", rating: 3, comment: "Good food but the delivery took a while.", verified: true },
  { restaurantId: 12, author: "Ana", rating: 4, comment: "Fresh sushi and friendly staff.", verified: false },
  { restaurantId: 20, author: "Bob", rating: 2, comment: "The pizza arrived cold.", verified: true },
  { restaurantId: 29, author: "Lucía", rating: 5, comment: "Best vegan burger in Madrid!", verified: false },
];

// Reclamaciones de ejemplo (las nuevas llegan desde complaint.html)
const complaints = [
  { name: "Alice", email: "alice@example.com", brand: "telepizza", type: "delivery", date: "2026-11-01", message: "The pizza arrived 40 minutes late and cold.", status: "resolved", createdAt: "2026-11-01T15:00:00.000Z" },
  { name: "Bob", email: "bob@example.com", brand: "mcdonalds", type: "food", date: "2026-11-03", message: "My burger was missing the cheese I paid for.", status: "in progress", createdAt: "2026-11-03T19:20:00.000Z" },
  { name: "Ana", email: "ana@example.com", brand: "sushita", type: "payment", date: "2026-11-06", message: "I was charged twice for the same order.", status: "open", createdAt: "2026-11-06T12:45:00.000Z" },
];

// Mensajes de contacto de ejemplo (los nuevos llegan desde contact.html)
const messages = [
  { name: "Carlos", email: "carlos@example.com", subject: "account", message: "How can I change the email of my account?", status: "answered", createdAt: "2026-11-02T10:00:00.000Z" },
  { name: "Lucia", email: "lucia@example.com", subject: "restaurant", message: "Will you add more restaurants in Retiro soon?", status: "read", createdAt: "2026-11-04T17:30:00.000Z" },
  { name: "Pedro", email: "pedro@example.com", subject: "order", message: "Can I schedule an order for tomorrow at lunch time?", status: "new", createdAt: "2026-11-07T09:15:00.000Z" },
];

module.exports = { restaurants, dishes, users, riders, coupons, orders, reviews, complaints, messages };
