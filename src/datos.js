
const restaurants = [
  { name: "Burger King Chamartín", brand: "burgerking", area: "Chamartín", type: "burger", lat: 40.4721547, lon: -3.6827027 },
  { name: "Burger King Tetuán", brand: "burgerking", area: "Tetuán", type: "burger", lat: 40.4606115, lon: -3.69986 },
  { name: "Burger King Cuatro Caminos", brand: "burgerking", area: "Tetuán", type: "burger", lat: 40.4582009, lon: -3.7009311 },
  { name: "McDonald's Gran Vía", brand: "mcdonalds", area: "Centro", type: "burger", lat: 40.4217486, lon: -3.7082893 },
  { name: "McDonald's Princesa", brand: "mcdonalds", area: "Moncloa", type: "burger", lat: 40.4250027, lon: -3.7126422 },
  { name: "McDonald's Chamberí", brand: "mcdonalds", area: "Chamberí", type: "burger", lat: 40.4323068, lon: -3.7055092 },
  { name: "McDonald's Atocha", brand: "mcdonalds", area: "Retiro", type: "burger", lat: 40.4096453, lon: -3.6927171 },
  { name: "McDonald's Montecarmelo", brand: "mcdonalds", area: "Fuencarral", type: "burger", lat: 40.5014306, lon: -3.6971944 },
  { name: "Sushita Chamartín", brand: "sushita", area: "Chamartín", type: "sushi", lat: 40.4721547, lon: -3.6827027 },
  { name: "Sushita Tetuán", brand: "sushita", area: "Tetuán", type: "sushi", lat: 40.4606115, lon: -3.69986 },
  { name: "Sushita Cuatro Caminos", brand: "sushita", area: "Tetuán", type: "sushi", lat: 40.4582009, lon: -3.7009311 },
  { name: "Sushita Gran Vía", brand: "sushita", area: "Centro", type: "sushi", lat: 40.4217486, lon: -3.7082893 },
  { name: "Sushita Princesa", brand: "sushita", area: "Moncloa", type: "sushi", lat: 40.4250027, lon: -3.7126422 },
  { name: "Sushita Chamberí", brand: "sushita", area: "Chamberí", type: "sushi", lat: 40.4323068, lon: -3.7055092 },
  { name: "Sushita Atocha", brand: "sushita", area: "Retiro", type: "sushi", lat: 40.4096453, lon: -3.6927171 },
  { name: "Sushita Montecarmelo", brand: "sushita", area: "Fuencarral", type: "sushi", lat: 40.5014306, lon: -3.6971944 },
  { name: "Telepizza Chamartín", brand: "telepizza", area: "Chamartín", type: "pizza", lat: 40.4721547, lon: -3.6827027 },
  { name: "Telepizza Tetuán", brand: "telepizza", area: "Tetuán", type: "pizza", lat: 40.4606115, lon: -3.69986 },
  { name: "Telepizza Cuatro Caminos", brand: "telepizza", area: "Tetuán", type: "pizza", lat: 40.4582009, lon: -3.7009311 },
  { name: "Telepizza Gran Vía", brand: "telepizza", area: "Centro", type: "pizza", lat: 40.4217486, lon: -3.7082893 },
  { name: "Telepizza Princesa", brand: "telepizza", area: "Moncloa", type: "pizza", lat: 40.4250027, lon: -3.7126422 },
  { name: "Telepizza Chamberí", brand: "telepizza", area: "Chamberí", type: "pizza", lat: 40.4323068, lon: -3.7055092 },
  { name: "Telepizza Atocha", brand: "telepizza", area: "Retiro", type: "pizza", lat: 40.4096453, lon: -3.6927171 },
  { name: "Telepizza Montecarmelo", brand: "telepizza", area: "Fuencarral", type: "pizza", lat: 40.5014306, lon: -3.6971944 },
  { name: "Honest Greens Chamartín", brand: "honestgreens", area: "Chamartín", type: "vegan", lat: 40.4721547, lon: -3.6827027 },
  { name: "Honest Greens Tetuán", brand: "honestgreens", area: "Tetuán", type: "vegan", lat: 40.4606115, lon: -3.69986 },
  { name: "Honest Greens Cuatro Caminos", brand: "honestgreens", area: "Tetuán", type: "vegan", lat: 40.4582009, lon: -3.7009311 },
  { name: "Honest Greens Gran Vía", brand: "honestgreens", area: "Centro", type: "vegan", lat: 40.4217486, lon: -3.7082893 },
  { name: "Honest Greens Princesa", brand: "honestgreens", area: "Moncloa", type: "vegan", lat: 40.4250027, lon: -3.7126422 },
  { name: "Honest Greens Chamberí", brand: "honestgreens", area: "Chamberí", type: "vegan", lat: 40.4323068, lon: -3.7055092 },
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

// Pedidos de ejemplo. Los que se hacen desde order.html llevan ademas userId (el usuario conectado)
const orders = [
  {
    email: "alice@example.com", brand: "telepizza", area: "Centro", type: "delivery", payment: "card", status: "delivered",
    items: [{ dish: "Pepperoni Pizza", quantity: 2 }], subtotal: 18, discount: 0, deliveryFee: 0.9, deliveryFeePercent: 5,
    total: 18.9, date: "2026-11-01T13:30:00.000Z", userId: 1,
  },
  {
    email: "bob@example.com", brand: "sushita", area: "Chamberí", type: "pickup", payment: "cash", status: "pending",
    items: [{ dish: "California Roll", quantity: 1 }], subtotal: 8, discount: 0, deliveryFee: 0, deliveryFeePercent: 0,
    total: 8, date: "2026-11-05T20:10:00.000Z", userId: 2,
  },
  {
    email: "ana@example.com", brand: "burgerking", area: "Tetuán", type: "delivery", payment: "card", status: "on the way",
    items: [{ dish: "Whopper", quantity: 2 }], subtotal: 13, discount: 0, deliveryFee: 0.91, deliveryFeePercent: 7,
    total: 13.91, date: "2026-11-07T21:00:00.000Z", userId: 3,
  },
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

// Valoraciones de ejemplo. restaurantId apunta a un restaurante de la lista de arriba
const reviews = [
  { restaurantId: 1, author: "Alice", rating: 5, comment: "Fast service and the Whopper was perfect.", createdAt: "2026-11-01T14:00:00.000Z" },
  { restaurantId: 1, author: "Bob", rating: 3, comment: "Good food but a long queue.", createdAt: "2026-11-02T13:00:00.000Z" },
  { restaurantId: 4, author: "Ana", rating: 4, comment: "Clean and quick, right in Gran Vía.", createdAt: "2026-11-03T20:00:00.000Z" },
  { restaurantId: 12, author: "Carlos", rating: 5, comment: "Best California rolls in Madrid.", createdAt: "2026-11-04T21:00:00.000Z" },
  { restaurantId: 20, author: "Lucia", rating: 2, comment: "The pizza was cold when it arrived.", createdAt: "2026-11-05T22:00:00.000Z" },
];

module.exports = { restaurants, dishes, users, orders, complaints, messages, reviews };
