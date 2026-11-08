
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

module.exports = { restaurants, dishes, users };
