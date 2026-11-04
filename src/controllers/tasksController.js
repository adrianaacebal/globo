// Handler logic for /tasks. Placeholder data until Session 22 adds a database.
const tasks = [
  { id: 1, title: "Write the API skeleton", done: false, userId: 1 },
  { id: 2, title: "Add a logger middleware", done: true, userId: 1 },
  { id: 3, title: "Register the error handler", done: false, userId: 2 },
];

// GET /tasks
function listTasks(req, res) {
  res.json(tasks);
}

// POST /tasks — echoes the parsed body back
function createTask(req, res) {
  res.status(201).json(req.body);
}

module.exports = { listTasks, createTask };

// src/controllers/tasksController.js
//Handler logic for dishes 

let dishes = [
  {id:1 , name: "Pizza", price: 10.99, category: "Italian"},
  {id:2 , name: "Burger", price: 8.99, category: "American"},
  {id:3 , name: "Pasta", price: 12.99, category: "Italian"},

];
let nextId = 4;

// GET /dishes
function listDishes(req, res) {
  res.json(dishes);
}

// Handler logic for restaurants

let restaurants = [
  { id:1, name: 'burgerking', area: 'Chamartín', type: 'burger', lat: 40.4721547, lon: -3.6827027 },
  { id:2, name: 'burgerking', area: 'Tetuán', type: 'burger', lat: 40.4606115, lon: -3.69986 },
  { id:3, name: 'burgerking', area: 'Tetuán', type: 'burger', lat: 40.4582009, lon: -3.7009311 },
  { id:4, name: "mcdonalds", area: 'Centro', type: 'fast', lat: 40.4217486, lon: -3.7082893 },
  { id:5, name: "mcdonalds", area: 'Moncloa', type: 'fast', lat: 40.4250027, lon: -3.7126422 },
  { id:6, name: "mcdonalds", area: 'Chamberí', type: 'fast', lat: 40.4323068, lon: -3.7055092 },
  { id:7, name: "mcdonalds Atocha", area: 'Retiro', type: 'fast', lat: 40.4096453, lon: -3.6927171 },
  { id:8, name: "mcdonalds Montecarmelo", area: 'Fuencarral', type: 'fast', lat: 40.5014306, lon: -3.6971944 }
];

// GET /restaurants            -> todos
// GET /restaurants?area=Centro -> solo los de esa zona
function listRestaurants(req, res) {
  const { area } = req.query;
  if (!area) {
    return res.json(restaurants);
  }

  const found = restaurants.filter(
    (r) => r.area.toLowerCase() === area.toLowerCase()
  );

  if (found.length === 0) {
    return res.status(404).json({ error: "Location not available" });
  }

  res.json(found);
}

// Handler logic for users 
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' , password: 'password123'},
  { id: 2, name: 'Bob', email: 'bob@example.com' , password: 'password456'}
];

// GET /users
function listUsers(req, res) {
  res.json(users);
}

function login(req, res) {
  const { name, email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (user && user.password !== password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  if (user) {
    return res.json({ name: user.name });
  }
  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);
  res.status(201).json({ name: newUser.name });
}

module.exports.login = login;

module.exports.listDishes = listDishes;
module.exports.listRestaurants = listRestaurants;
module.exports.listUsers = listUsers;

const brands = {
  burgerking: {
    name: 'burgerking',
    contact: { phone: '900 000 001', email: 'info@burgerking.es' },
    menu: [
      { name: 'Whopper', price: 6.5 },
      { name: 'Patatas', price: 2.5 }
    ]

  },
  mcdonalds: {
    name: "mcdonalds",
    contact: { phone: '900 000 002', email: 'info@mcdonalds.es' },
    menu: [
      { name: 'Big Mac', price: 6.2 },
      { name: 'McNuggets', price: 5 },
      { name: 'Patatas', price: 2.5 },
      { name: 'McFlurry', price: 3.5 },
      { name: 'McWrap', price: 4.5 },
      { name: 'Veggie Burger', price: 5.0 },
      { name: 'Long Chicken', price: 5.5 },
      
    ]
  }
};

module.exports.brands = brands;

// Normaliza texto para comparar: minusculas, sin tildes, sin espacios ni apostrofes
// ("McDonald's" -> "mcdonalds", "Chamberí" -> "chamberi")
function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// POST /order — comprueba que el restaurante tiene local en esa ubicacion
function createOrder(req, res) {
  const { name, email, type, restaurant, location } = req.body;

  if (!restaurant || !location) {
    return res.status(400).json({ error: "Restaurant and location are required" });
  }

  const brandLocals = restaurants.filter((r) => {
    const brand = r.name.split(" ")[0];
    return normalize(brand) === normalize(restaurant) || normalize(r.name) === normalize(restaurant);
  });

  if (brandLocals.length === 0) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const local = brandLocals.find((r) => normalize(r.area) === normalize(location));

  if (!local) {
    const allowed = [...new Set(brandLocals.map((r) => r.area))];
    return res.status(400).json({
      error: `The location ${location} does not exist for ${restaurant}. Available locations: ${allowed.join(", ")}`,
    });
  }

  res.status(201).json({ message: "Order created", order: { name, email, type, restaurant: local.name, area: local.area } });
}

module.exports.createOrder = createOrder;

// POST /order/total
// Recibe { restaurant, items: [{ dish, quantity }, ...] } y devuelve { total }
function calculateTotal(req, res) {
  // req.body ya es un objeto gracias a express.json()
  const { restaurant, items } = req.body;

  // "McDonald's Atocha" -> "mcdonalds"
  const brandKey = Object.keys(brands).find((key) => normalize(restaurant).startsWith(key));
  if (!brandKey) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Choose at least one dish" });
  }

  let total = 0;
  for (const { dish, quantity } of items) {
    const menuItem = brands[brandKey].menu.find((d) => d.name === dish);
    if (!menuItem) {
      return res.status(404).json({ error: `Dish not found: ${dish}` });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: "Quantity must be 1 or more" });
    }

    total += menuItem.price * qty;
  }

  // res.json: objeto -> texto JSON en la respuesta
  res.json({ total: total });
}

module.exports.calculateTotal = calculateTotal;

// GET /menu?restaurant=McDonald's -> [{ name, price }, ...] (el menu completo de la marca)
function getMenu(req, res) {
  const { restaurant } = req.query;
  const brandKey = Object.keys(brands).find((key) => normalize(restaurant).startsWith(key));
  if (!brandKey) {
    return res.status(404).json({ error: "Restaurant not found" });
  }
  res.json(brands[brandKey].menu);
}

module.exports.getMenu = getMenu;
