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
  { id:8, name: "mcdonalds Montecarmelo", area: 'Fuencarral', type: 'fast', lat: 40.5014306, lon: -3.6971944 },
  { id:9, name: "Sushita Sushi Bar", area: 'Chamartín', type: 'fast', lat: 40.4721547, lon: -3.6827027 },
  { id:10, name: "Sushita Sushi Bar", area: 'Tetuán', type: 'fast', lat: 40.4606115, lon: -3.69986 },
  { id:11, name: "Sushita Sushi Bar", area: 'Tetuán', type: 'fast', lat: 40.4582009, lon: -3.7009311 },
  { id:12, name: "Sushita Sushi Bar", area: 'Centro', type: 'fast', lat: 40.4217486, lon: -3.7082893 },
  { id:13, name: "Sushita Sushi Bar", area: 'Moncloa', type: 'fast', lat: 40.4250027, lon: -3.7126422 },
  { id:14, name: "Sushita Sushi Bar", area: 'Chamberí', type: 'fast', lat: 40.4323068, lon: -3.7055092 },
  { id:15, name: "Sushita Sushi Bar", area: 'Retiro', type: 'fast', lat: 40.4096453, lon: -3.6927171 },
  { id:16, name: "Sushita Sushi Bar", area: 'Fuencarral', type: 'fast', lat: 40.5014306, lon: -3.6971944 },
  { id:17, name: "Telepizza Chamartín", area: 'Chamartín', type: 'fast', lat: 40.4721547, lon: -3.6827027 },
  { id:18, name: "Telepizza Tetuán", area: 'Tetuán', type: 'fast', lat: 40.4606115, lon: -3.69986 },
  { id:19, name: "Telepizza Cuatro Caminos", area: 'Tetuán', type: 'fast', lat: 40.4582009, lon: -3.7009311 },
  { id:20, name: "Telepizza Gran Vía", area: 'Centro', type: 'fast', lat: 40.4217486, lon: -3.7082893 },
  { id:21, name: "Telepizza Princesa", area: 'Moncloa', type: 'fast', lat: 40.4250027, lon: -3.7126422 },
  { id:22, name: "Telepizza Chamberí", area: 'Chamberí', type: 'fast', lat: 40.4323068, lon: -3.7055092 },
  { id:23, name: "Telepizza Atocha", area: 'Retiro', type: 'fast', lat: 40.4096453, lon: -3.6927171 },
  { id:24, name: "Telepizza Montecarmelo", area: 'Fuencarral', type: 'fast', lat: 40.5014306, lon: -3.6971944 },
  { id:25, name: "Honest Greens Chamartín", area: 'Chamartín', type: 'fast', lat: 40.4721547, lon: -3.6827027 },
  { id:26, name: "Honest Greens Tetuán", area: 'Tetuán', type: 'fast', lat: 40.4606115, lon: -3.69986 },
  { id:27, name: "Honest Greens Cuatro Caminos", area: 'Tetuán', type: 'fast', lat: 40.4582009, lon: -3.7009311 },
  { id:28, name: "Honest Greens Gran Vía", area: 'Centro', type: 'fast', lat: 40.4217486, lon: -3.7082893 },
  { id:29, name: "Honest Greens Princesa", area: 'Moncloa', type: 'fast', lat: 40.4250027, lon: -3.7126422 },
  { id:30, name: "Honest Greens Chamberí", area: 'Chamberí', type: 'fast', lat: 40.4323068, lon: -3.7055092 },
]

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
// Los usuarios se guardan en data/users.json para que no se pierdan al reiniciar el servidor
const fs = require("fs");
const path = require("path");
const USERS_FILE = path.join(__dirname, "..", "..", "data", "users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    // Si el archivo aun no existe, empezamos con los usuarios de ejemplo
    return [
      { id: 1, name: 'Alice', email: 'alice@example.com', password: 'password123' },
      { id: 2, name: 'Bob', email: 'bob@example.com', password: 'password456' }
    ];
  }
}

function saveUsers() {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

let users = loadUsers();

// GET /users
function listUsers(req, res) {
  res.json(users);
}

// POST /login — si el email existe comprueba la contrasena; si no, registra al usuario nuevo
function login(req, res) {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  // El email no distingue mayusculas (Ana@Mail.com es el mismo que ana@mail.com)
  const user = users.find((u) => u.email.toLowerCase() === email);

  // Email ya usado: el nombre y la contrasena tienen que coincidir
  if (user) {
    const sameName = user.name.trim().toLowerCase() === name.toLowerCase();
    if (!sameName || user.password !== password) {
      return res.status(401).json({ error: "This email is already registered. Incorrect name or password" });
    }
  }

  if (user) {
    // Si todavia no ha usado su codigo de bienvenida, se le vuelve a dar
    const pending = user.discountCode && !user.discountUsed;
    return res.json({
      name: user.name,
      email: user.email,
      token: newSession(user),
      discountCode: pending ? user.discountCode : undefined,
      discountPercent: pending ? DISCOUNT_PERCENT : undefined
    });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  // Primera vez: se crea la cuenta y se le regala un codigo de descuento
  const nextUserId = Math.max(0, ...users.map((u) => u.id)) + 1;
  const newUser = {
    id: nextUserId, name, email, password,
    discountCode: newDiscountCode(),
    discountUsed: false,
    orders: []
  };
  users.push(newUser);
  saveUsers(); // escribe el usuario nuevo en data/users.json
  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
    token: newSession(newUser),
    firstTime: true,
    discountCode: newUser.discountCode,
    discountPercent: DISCOUNT_PERCENT
  });
}

// ---------- Sesiones ----------
// Al hacer login el servidor da un "token" (texto aleatorio) que el navegador guarda
// y manda en la cabecera Authorization: Bearer <token>. Asi sabemos quien es.
// Se guardan en memoria: si se reinicia el servidor hay que volver a hacer login.
const crypto = require("crypto");
const sessions = new Map();   // token -> email

function newSession(user) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, user.email);
  return token;
}

// Devuelve el usuario conectado, o null si no hay token valido
function userFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const email = sessions.get(token);
  return email ? users.find((u) => u.email === email) || null : null;
}

function notLoggedIn(res) {
  return res.status(401).json({ error: "You need to log in to order", needLogin: true });
}

// ---------- Codigos de descuento ----------
const DISCOUNT_PERCENT = 10;        // % de descuento del codigo de bienvenida
// Gastos de envio segun lo que tarda la moto (sin contar la cocina):
//   hasta 15 min -> 5% del precio de la comida · 20 min o mas -> 7%
const SHORT_TRIP_MAX_MINUTES = 15;
const SHORT_TRIP_FEE_PERCENT = 5;
const LONG_TRIP_FEE_PERCENT = 7;

// Porcentaje de envio para un pedido (0 si es para recoger)
function deliveryFeePercent(type, travelMinutes) {
  if (type !== "delivery") return 0;
  const mins = Number(travelMinutes);
  if (Number.isFinite(mins) && mins <= SHORT_TRIP_MAX_MINUTES) return SHORT_TRIP_FEE_PERCENT;
  return LONG_TRIP_FEE_PERCENT;
}

// "GLOBO-3F9A1C" (se repite si por casualidad ya existe)
function newDiscountCode() {
  let code;
  do {
    code = "GLOBO-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  } while (users.some((u) => u.discountCode === code));
  return code;
}

// true si el codigo es el de este usuario y todavia no lo ha usado
function isValidCode(code, user) {
  const clean = String(code || "").trim().toUpperCase();
  return Boolean(user && clean && user.discountCode === clean && !user.discountUsed);
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
  },
  sushita: {
    name: "Sushita",
    contact: {phone: '900 000 003', email: 'sushita@gmail.com'},
    menu: [
      { name: 'Salmon Maki', price: 6.5 },
      { name: 'Tuna Maki', price: 5.5 },
      { name: 'Veggie Maki', price: 4.5 },
      { name: 'California Roll', price: 7.0 },
      { name: 'water', price: 1.0 },
      { name: 'Soy sauce', price: 0.5 },
      { name: 'Japanese Green Tea', price: 2.0 },
      { name: 'Herbal Tea', price: 2.5 },
      { name: 'Nigiri with Salmon', price: 7.0 },
      { name: 'Nigiri with Tuna', price: 6.5 },
      { name: 'Nigiri with Vegetables', price: 5.5 }
    ]
  },
  telepizza: {
    name: "Telepizza",
    contact: {phone: '900 000 004', email: 'telepizza@gmail.com'},
    menu: [
      { name: 'Hawaiian Pizza', price: 8.5 },
      { name: 'Pepperoni Pizza', price: 9.0 },
      { name: 'Veggie Pizza', price: 7.5 },
      { name: 'Cheese Pizza', price: 7.0 },
      { name: 'Margarita Pizza', price: 7.5 },
      { name: 'Chicken Pizza', price: 9.5 },
      { name: 'Meat Lovers Pizza', price: 10.0 },
      { name: 'Tuna Pizza', price: 9.0 },
      { name: 'water', price: 1.0 },
      { name: 'Coca-Cola', price: 1.5 },
      { name: 'Beer', price: 2.5 },
    ]
  },
  honestgreens: {
    name: "Honest Greens",
    contact: {phone: '900 000 005', email: 'honestgreens@gmail.com'},
    menu: [
      { name: 'Quinoa Salad', price: 8.0 },
      { name: 'Vegan Burger', price: 9.0 },
      { name: 'Green Smoothie', price: 5.0 },
      { name: 'Avocado Toast', price: 7.0 },
      { name: 'water', price: 1.0 },
      { name: 'Kombucha', price: 2.0 },
      { name: 'Herbal Tea', price: 2.5 },
    ]
  }
}

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
// (hay que estar conectado)
function createOrder(req, res) {
  const user = userFromRequest(req);
  if (!user) return notLoggedIn(res);

  const { type, restaurant, location } = req.body;
  const { name, email } = user;

  if (!restaurant || !location) {
    return res.status(400).json({ error: "Restaurant and location are required" });
  }

  // "Honest Greens Chamartín" -> "honestgreenschamartin" empieza por "honestgreens"
  const brandLocals = restaurants.filter((r) => normalize(r.name).startsWith(normalize(restaurant)));

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
// Recibe { restaurant, items: [{ dish, quantity }, ...], type, travelMinutes, discountCode }
// y devuelve { subtotal, discount, deliveryFee, deliveryFeePercent, total } (+ discountError si el codigo no vale)
// Calcula el precio de un pedido. Lo usan /order/total y /orders.
// Devuelve { status, error } si algo esta mal, o el desglose del precio.
function computePrice({ restaurant, items, type, travelMinutes, discountCode }, user) {
  // "McDonald's Atocha" -> "mcdonalds"
  const brandKey = Object.keys(brands).find((key) => normalize(restaurant).startsWith(key));
  if (!brandKey) {
    return { status: 404, error: "Restaurant not found" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { status: 400, error: "Choose at least one dish" };
  }

  let subtotal = 0;
  for (const { dish, quantity } of items) {
    const menuItem = brands[brandKey].menu.find((d) => d.name === dish);
    if (!menuItem) {
      return { status: 404, error: `Dish not found: ${dish}` };
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return { status: 400, error: "Quantity must be 1 or more" };
    }

    subtotal += menuItem.price * qty;
  }

  // 1) Envio a domicilio: % sobre el precio de la comida
  //    (5% si la moto tarda hasta 15 min, 7% si tarda 20 o mas)
  const feePercent = deliveryFeePercent(type, travelMinutes);
  const deliveryFee = subtotal * feePercent / 100;

  // 2) Despues, el codigo de bienvenida: 10% menos sobre comida + envio
  //    (solo el del propio usuario)
  let discount = 0;
  let discountError;
  if (discountCode) {
    if (isValidCode(discountCode, user)) {
      discount = (subtotal + deliveryFee) * DISCOUNT_PERCENT / 100;
    } else {
      discountError = "This discount code is not valid or has already been used";
    }
  }

  return {
    subtotal,
    discount,
    deliveryFee,
    deliveryFeePercent: feePercent,
    total: subtotal + deliveryFee - discount,
    discountError
  };
}

function calculateTotal(req, res) {
  // req.body ya es un objeto gracias a express.json()
  const price = computePrice(req.body, userFromRequest(req));
  if (price.error) {
    return res.status(price.status).json({ error: price.error });
  }
  // res.json: objeto -> texto JSON en la respuesta
  res.json(price);
}

// POST /orders — confirma el pedido y lo guarda en el historial del usuario.
// Hay que estar conectado y volver a escribir la contrasena.
function saveOrder(req, res) {
  const user = userFromRequest(req);
  if (!user) return notLoggedIn(res);

  const { password, restaurant, location, type, items, payment } = req.body;
  if (password !== user.password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const price = computePrice(req.body, user);
  if (price.error) {
    return res.status(price.status).json({ error: price.error });
  }

  // El codigo de descuento solo vale una vez
  if (price.discount > 0) user.discountUsed = true;

  const order = {
    id: Date.now(),
    date: new Date().toISOString(),
    restaurant,
    location,
    type,
    payment,
    items: items.map(({ dish, quantity }) => ({ dish, quantity: Number(quantity) })),
    subtotal: price.subtotal,
    discount: price.discount,
    deliveryFee: price.deliveryFee,
    deliveryFeePercent: price.deliveryFeePercent,
    total: price.total
  };
  user.orders = user.orders || [];
  user.orders.push(order);
  saveUsers();

  res.status(201).json({ message: "Order placed", order });
}

// GET /orders — historial de pedidos del usuario conectado (el mas nuevo primero)
function listOrders(req, res) {
  const user = userFromRequest(req);
  if (!user) return notLoggedIn(res);
  res.json((user.orders || []).slice().reverse());
}

module.exports.saveOrder = saveOrder;
module.exports.listOrders = listOrders;

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
