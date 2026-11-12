// =====================================================================
// SEED: DATOS INICIALES  (archivo: src/data/seed.js)
// =====================================================================
// Que es un "seed" (semilla)?
//   Son los datos de ejemplo con los que arranca la aplicacion, para que al abrir
//   la web ya haya restaurantes, platos, pedidos... y no salga todo vacio.
//
// Como se usan?
//   src/data/store.js importa este archivo y crea una coleccion en memoria con cada
//   array:  createCollection(seed.restaurants), createCollection(seed.dishes)...
//   Cada vez que se reinicia el servidor, las colecciones vuelven a empezar con
//   ESTOS datos (los cambios hechos con POST/PUT/PATCH/DELETE se pierden).
//   Excepcion: los usuarios se leen de data/users.json si existe; seed.users solo
//   se usa si ese archivo no existe todavia.
//
// Los ids:
//   Casi ningun dato lleva "id": se lo pone el store al arrancar, por orden
//   (el primero 1, el segundo 2...). Por eso el orden de los arrays importa:
//   p. ej. el restaurante con id 4 es el 4.o de la lista (McDonald's Gran Via).
//   Los usuarios si traen su id escrito a mano.
//
// Valores de listas cerradas (brand, area, type, category, vehicle, status...):
//   tienen que ser uno de los permitidos en src/constants.js, igual que lo que
//   comprueban los validators cuando llega un POST/PUT/PATCH.
//
// Formato: cada elemento es un objeto JavaScript { campo: valor, ... }, que es
// practicamente lo mismo que un objeto JSON (lo que devuelve la API).
// =====================================================================

// ---------- RESTAURANTES (coleccion store.restaurants -> /api/restaurants) ----------
// Cada objeto es un LOCAL concreto de una marca. Campos:
//   name     -> nombre del local que se ve en la web
//   brand    -> clave de la marca: burgerking, mcdonalds, sushita, telepizza, honestgreens
//               (sirve para unir el local con los platos de su carta)
//   area     -> barrio de Madrid (Centro, Chamartin, Tetuan...). Al pedir se comprueba
//               que la marca tenga local en la zona elegida
//   type     -> tipo de comida: burger, sushi, pizza o vegan
//   delivery -> true si hace envio a domicilio, false si solo se puede recoger
//   lat, lon -> coordenadas (latitud y longitud) para colocar el local en el mapa
// Sin id: el store les pone 1, 2, 3... en este mismo orden.
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


// ---------- PLATOS (coleccion store.dishes -> /api/dishes y /menu) ----------
// La carta de cada MARCA (no de cada local: todos los McDonald's tienen la misma).
// Campos:
//   name     -> nombre del plato
//   brand    -> marca a la que pertenece (misma clave que en restaurants)
//   category -> main (principal), side (acompanamiento), drink (bebida) o dessert (postre)
//   price    -> precio en euros (numero, con decimales: 6.5 = 6,50 EUR)
// Una misma marca no puede repetir nombre de plato, pero marcas distintas si
// (por eso hay "Patatas" o "water" en varias). Estan agrupados por marca.
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

// ---------- USUARIOS (coleccion store.users -> POST /login) ----------
// Usuarios de ejemplo para poder hacer login nada mas instalar el proyecto.
// Solo se usan si todavia no existe data/users.json (ver loadUsers en store.js);
// a partir de ahi los usuarios se leen y se guardan en ese archivo.
// Campos:
//   id       -> estos SI llevan id escrito a mano
//   name     -> nombre (en el login se comprueba junto con el email)
//   email    -> identifica al usuario (no puede haber dos iguales)
//   password -> contrasena. OJO: en texto plano porque es una practica; en una app
//               real se guardaria cifrada (hash), nunca tal cual.
// Los usuarios que se registran despues tienen ademas discountCode, discountUsed
// y orders (su historial de pedidos).
const users = [
  { id: 1, name: "Alice", email: "alice@example.com", password: "password123" },
  { id: 2, name: "Bob", email: "bob@example.com", password: "password456" },
  { id:3, name: "Ana", email: "ana@example.com", password: "password789" },
  { id:4, name: "Carlos", email: "carlos@example.com", password: "password012" }
];

// ---------- REPARTIDORES (coleccion store.riders -> /api/riders) ----------
// vehicle y area son listas cerradas (src/constants.js). Campos:
//   name      -> nombre del repartidor (rider)
//   vehicle   -> bike (bici), motorbike (moto) o car (coche)
//   area      -> barrio en el que reparte
//   available -> true si esta libre ahora mismo para llevar pedidos
//   rating    -> valoracion media de 0 a 5
const riders = [
  { name: "Lucía Gómez", vehicle: "motorbike", area: "Centro", available: true, rating: 4.8 },
  { name: "Javier Ruiz", vehicle: "bike", area: "Chamberí", available: true, rating: 4.5 },
  { name: "Marta López", vehicle: "car", area: "Chamartín", available: false, rating: 4.2 },
  { name: "Pablo Sanz", vehicle: "motorbike", area: "Tetuán", available: true, rating: 3.9 },
  { name: "Sara Martín", vehicle: "bike", area: "Retiro", available: false, rating: 4.9 },
];

// ---------- CUPONES (coleccion store.coupons -> /api/coupons) ----------
// Cupones de descuento que se pueden escribir al pedir (order.html). Campos:
//   code      -> el codigo que escribe el cliente (en mayusculas, no se repite)
//   percent   -> porcentaje de descuento (20 = 20%)
//   active    -> si esta en false, el cupon existe pero ya no se puede usar
//   orderType -> a que pedidos se aplica: all (todos), delivery (a domicilio) o pickup (recoger)
const coupons = [
  { code: "GLOBO20", percent: 20, active: true, orderType: "all" },
  { code: "PICKUP15", percent: 15, active: true, orderType: "pickup" },
  { code: "SUMMER30", percent: 30, active: false, orderType: "delivery" },
];

// ---------- PEDIDOS (coleccion store.orders -> /api/orders) ----------
// Pedidos de ejemplo para la gestion de pedidos. Los que se confirman en la web
// (POST /orders) tambien se anaden aqui. Campos:
//   customer     -> nombre del cliente
//   restaurantId -> id del restaurante ("relacion": apunta a restaurants.id; 4 = McDonald's Gran Via)
//   riderId      -> id del repartidor (apunta a riders.id), o null si es para recoger
//   type         -> delivery (a domicilio) o pickup (recoger en el local)
//   status       -> pending, preparing, on-the-way, delivered o cancelled
//   total        -> importe total en euros
//   paid         -> true si ya esta pagado
const orders = [
  { customer: "Alice", restaurantId: 4, riderId: 1, type: "delivery", status: "delivered", total: 18.6, paid: true },
  { customer: "Bob", restaurantId: 20, riderId: null, type: "pickup", status: "preparing", total: 16.5, paid: true },
  { customer: "Ana", restaurantId: 14, riderId: 2, type: "delivery", status: "on-the-way", total: 21, paid: false },
];

// ---------- OPINIONES (coleccion store.reviews -> /api/reviews) ----------
// Opiniones de los clientes sobre un restaurante. Campos:
//   restaurantId -> id del restaurante opinado (apunta a restaurants.id; tiene que existir)
//   author       -> quien escribe la opinion
//   rating       -> nota de 1 a 5
//   comment      -> texto de la opinion
//   verified     -> true si se ha comprobado que el autor de verdad pidio alli
const reviews = [
  { restaurantId: 4, author: "Alice", rating: 5, comment: "Fast and hot, the Big Mac was perfect.", verified: true },
  { restaurantId: 4, author: "Carlos", rating: 3, comment: "Good food but the delivery took a while.", verified: true },
  { restaurantId: 12, author: "Ana", rating: 4, comment: "Fresh sushi and friendly staff.", verified: false },
  { restaurantId: 20, author: "Bob", rating: 2, comment: "The pizza arrived cold.", verified: true },
  { restaurantId: 29, author: "Lucía", rating: 5, comment: "Best vegan burger in Madrid!", verified: false },
];

// ---------- RECLAMACIONES (coleccion store.complaints -> /api/complaints) ----------
// Reclamaciones de ejemplo (las nuevas llegan desde complaint.html). Campos:
//   name, email -> datos de contacto de quien reclama
//   brand       -> marca a la que se reclama
//   type        -> motivo: delivery (envio), food (comida), payment (pago) u other (otro)
//   date        -> dia del problema (texto AAAA-MM-DD)
//   message     -> explicacion del cliente
//   status      -> open (abierta), in progress (en curso) o resolved (resuelta)
//   createdAt   -> fecha y hora en que se creo (formato ISO, lo pone el servidor)
const complaints = [
  { name: "Alice", email: "alice@example.com", brand: "telepizza", type: "delivery", date: "2026-11-01", message: "The pizza arrived 40 minutes late and cold.", status: "resolved", createdAt: "2026-11-01T15:00:00.000Z" },
  { name: "Bob", email: "bob@example.com", brand: "mcdonalds", type: "food", date: "2026-11-03", message: "My burger was missing the cheese I paid for.", status: "in progress", createdAt: "2026-11-03T19:20:00.000Z" },
  { name: "Ana", email: "ana@example.com", brand: "sushita", type: "payment", date: "2026-11-06", message: "I was charged twice for the same order.", status: "open", createdAt: "2026-11-06T12:45:00.000Z" },
];

// ---------- MENSAJES DE CONTACTO (coleccion store.messages -> /api/messages) ----------
// Mensajes de contacto de ejemplo (los nuevos llegan desde contact.html). Campos:
//   name, email -> datos de quien escribe
//   subject     -> tema: order (pedido), restaurant, account (cuenta) u other
//   message     -> texto del mensaje
//   status      -> new (nuevo), read (leido) o answered (respondido)
//   createdAt   -> fecha y hora en que se creo (formato ISO)
const messages = [
  { name: "Carlos", email: "carlos@example.com", subject: "account", message: "How can I change the email of my account?", status: "answered", createdAt: "2026-11-02T10:00:00.000Z" },
  { name: "Lucia", email: "lucia@example.com", subject: "restaurant", message: "Will you add more restaurants in Retiro soon?", status: "read", createdAt: "2026-11-04T17:30:00.000Z" },
  { name: "Pedro", email: "pedro@example.com", subject: "order", message: "Can I schedule an order for tomorrow at lunch time?", status: "new", createdAt: "2026-11-07T09:15:00.000Z" },
];

// Exportamos todos los arrays en un objeto para que store.js los use con
// require("./seed") -> seed.restaurants, seed.dishes, seed.users...
module.exports = { restaurants, dishes, users, riders, coupons, orders, reviews, complaints, messages };
