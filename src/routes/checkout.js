// =====================================================================
// ROUTER DEL FLUJO DE LA WEB  (archivo: src/routes/checkout.js)
// =====================================================================
// Que es este archivo?
//   Es un "router" de Express: una lista de rutas (metodo HTTP + URL) y, para cada
//   una, la funcion del controlador que la atiende. Aqui estan las rutas que usa la
//   web (login.html, order.html, burgers.html...) para: entrar (login), ver la carta
//   de un restaurante y hacer un pedido.
//
// Donde se "monta"?
//   En src/app.js:  app.use("/", checkoutRouter);
//   OJO: a diferencia de los otros routers (que van bajo /api/<recurso>), este se
//   monta en la raiz "/". Por eso las URLs completas son /login, /menu, /order...
//   (sin /api delante).
//
// Diferencia con /api/orders:
//   - /api/orders (routes/orders.js) es el CRUD "de administracion" de pedidos.
//   - Este router es el flujo del CLIENTE: login -> carta -> calcular precio -> confirmar.
//     Cuando el cliente confirma (POST /orders), el pedido se guarda en su historial
//     y TAMBIEN se crea en /api/orders para poder gestionarlo.
//
// Resumen de rutas:
//   POST /login        -> entrar o registrarse            (devuelve un token)
//   GET  /menu         -> ver la carta de una marca        (Read)
//   POST /order        -> comprobar restaurante + zona     (necesita login)
//   POST /order/total  -> calcular el precio, sin guardar
//   POST /orders       -> confirmar y guardar el pedido    (Create, necesita login)
//   GET  /orders       -> historial de pedidos del usuario (Read, necesita login)
// =====================================================================
// Importamos Express, el framework (libreria) con el que hacemos el servidor web.
const express = require("express");
// requireUser es un middleware (src/middleware/requireUser.js). Un middleware es una
// funcion que se ejecuta ANTES del controlador y decide si la peticion sigue o no.
// requireUser mira la cabecera "Authorization: Bearer <token>" (el token se recibe
// al hacer login). Si el token es valido, guarda el usuario en req.user y llama a
// next() para que siga el controlador. Si no hay token o no es valido, corta y
// responde 401 (Unauthorized) con { needLogin: true }, y la web manda a login.html.
const requireUser = require("../middleware/requireUser");
// Funciones de los controladores (la logica de verdad). Con { ... } cogemos solo
// las funciones que necesitamos de cada archivo (desestructuracion).
// login -> src/controllers/authController.js
const { login } = require("../controllers/authController");
// getMenu -> src/controllers/dishesController.js (la carta sale de los platos del store)
const { getMenu } = require("../controllers/dishesController");
// Funciones del flujo de pedido -> src/controllers/checkoutController.js
const { createOrder, calculateTotal, saveOrder, listOrders } = require("../controllers/checkoutController");

// Creamos el Router: una "mini aplicacion" de Express que solo contiene rutas.
// app.js lo engancha en "/" con app.use("/", checkoutRouter).
const router = express.Router();

// POST /login -> entrar o registrarse.
// Body JSON: { "name": "...", "email": "...", "password": "..." }
// Si el email ya existe, comprueba nombre y contrasena (401 si no coinciden).
// Si no existe, crea el usuario (CRUD: Create, se guarda en data/users.json),
// le regala un codigo de descuento y responde 201.
// En ambos casos devuelve un "token" que el navegador guardara para las siguientes peticiones.
// No lleva requireUser: logicamente, para hacer login todavia no estas conectado.
router.post("/login", login);
// GET /menu?restaurant=McDonald's -> la carta completa de esa marca (CRUD: Read).
// Lo usa order.html para pintar los platos. No hace falta estar conectado para mirarla.
// 400 si falta ?restaurant, 404 si la marca no existe.
router.get("/menu", getMenu);
// POST /order -> primer paso del pedido: comprueba que la marca tiene un local en la
// zona elegida (y que el tipo sea "delivery" o "pickup"). Todavia no guarda nada.
// Aqui requireUser va ENTRE la ruta y el controlador: Express ejecuta las funciones
// en orden (primero requireUser, y solo si llama a next(), despues createOrder).
// Asi createOrder ya puede usar req.user (nombre y email del usuario conectado).
router.post("/order", requireUser, createOrder);   // comprueba restaurante + zona
// POST /order/total -> calcula el precio: subtotal + envio - descuento.
// Solo calcula, NO guarda nada. Body: { restaurant, items: [{ dish, quantity }], type, travelMinutes, discountCode }
// No lleva requireUser: se puede calcular sin login (el login solo hace falta para
// usar el codigo de bienvenida del usuario; el controlador lo mira por su cuenta).
router.post("/order/total", calculateTotal);       // calcula el precio
// POST /orders -> confirmar el pedido (CRUD: Create). Necesita login (requireUser)
// y ademas volver a escribir la contrasena en el body, por seguridad (401 si no coincide).
// Guarda el pedido en el historial del usuario (data/users.json) y tambien lo crea
// en /api/orders. Responde 201 (Created).
router.post("/orders", requireUser, saveOrder);    // confirmar pedido (pide la contrasena)
// GET /orders -> historial de pedidos del usuario conectado, el mas nuevo primero
// (CRUD: Read). Necesita login: requireUser deja el usuario en req.user y el
// controlador devuelve req.user.orders. Cada usuario solo ve SUS pedidos.
router.get("/orders", requireUser, listOrders);    // historial de pedidos

// Exportamos el router para que app.js lo importe con require(...) y lo monte en "/".
module.exports = router;
