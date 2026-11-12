// =====================================================================================
// app.js  ->  CONSTRUYE Y CONFIGURA la aplicacion de Express.
// =====================================================================================
// Express es una libreria de Node que facilita crear un servidor web: recibe peticiones
// HTTP (GET, POST, PUT, PATCH, DELETE) y decide que codigo responde a cada una.
//
// Aqui se registran, EN ORDEN, todas las piezas por las que pasa una peticion:
//   1) middleware generales (leer el JSON del body, poner req.body, apuntar la peticion en el log)
//   2) routers del API (/api/restaurants, /api/dishes, ...) y el router de la web (/login, /order...)
//   3) archivos estaticos de la web (carpeta public/: .html, .css, imagenes...)
//   4) 404 para rutas que no existen  y  5) manejador de errores (siempre el ultimo).
//
// POR QUE IMPORTA EL ORDEN de app.use: Express prueba las piezas de arriba a abajo, en el
// mismo orden en que se registran. Cada pieza puede RESPONDER (y ahi se acaba el recorrido)
// o llamar a next() para pasar la peticion a la siguiente. Por eso:
//   - express.json() va antes que las rutas: si no, los controladores no tendrian req.body.
//   - el 404 va despues de todas las rutas: solo debe saltar si ninguna ruta ha respondido.
//   - el manejador de errores va el ultimo: recoge los errores de cualquier pieza anterior.
//
// Este archivo NO llama a listen: eso esta en server.js (asi los tests usan la app sin
// abrir un puerto).
// =====================================================================================
//
// --- Imports ---
// require(...) trae codigo de otro modulo. Si el nombre no empieza por "./" o "../"
// (como "express" o "path") es una libreria: de node_modules o del propio Node.
// "path" es un modulo de Node para construir rutas de carpetas que funcionen en cualquier
// sistema operativo (Windows usa \ y Linux/Mac usan /).
const express = require("express");
const path = require("path");
// Nuestros propios middleware (carpeta src/middleware). En la linea de errors usamos
// "desestructuracion": { notFound, errorHandler } saca esas dos funciones del objeto exportado.
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errors");
// Los routers: cada uno agrupa las rutas de un recurso (restaurantes, platos, repartidores,
// cupones, pedidos, resenas, reclamaciones, mensajes) y las conecta con su controlador.
const restaurantsRouter = require("./routes/restaurants");
const dishesRouter = require("./routes/dishes");
const ridersRouter = require("./routes/riders");
const couponsRouter = require("./routes/coupons");
const ordersRouter = require("./routes/orders");
const reviewsRouter = require("./routes/reviews");
const complaintsRouter = require("./routes/complaints");
const messagesRouter = require("./routes/messages");
// El router "checkout" no es del API /api: tiene las rutas que usa la web para entrar y pedir.
const checkoutRouter = require("./routes/checkout");

// Creamos la aplicacion. "app" es el objeto al que le vamos anadiendo middleware y rutas.
const app = express();

// --- 1) Middleware generales: se ejecutan ANTES que las rutas, en todas las peticiones ---
// Un middleware es una funcion (req, res, next):
//   req  = la peticion que llega (URL, metodo, cabeceras, body...)
//   res  = la respuesta que vamos a enviar (res.status(...), res.json(...))
//   next = funcion para pasar la peticion a la siguiente pieza de la cadena.
//
// express.json() lee el body de la peticion cuando viene en formato JSON (texto como
// {"name":"Ana"}) y lo convierte en un objeto de JavaScript que queda en req.body.
// Si el JSON esta mal escrito, genera un error que acaba en errorHandler (400).
app.use(express.json());
// Middleware escrito aqui mismo (funcion anonima): garantiza que req.body sea siempre un objeto.
app.use((req, res, next) => {
  // Express 5 deja req.body en undefined si no llega body: asi los controladores siempre tienen un objeto
  if (req.body === undefined) req.body = {};
  // Sin este next() la peticion se quedaria "colgada" y el navegador nunca recibiria respuesta.
  next();
});
// logger escribe en la terminal una linea por peticion ("GET /api/dishes").
app.use(logger);

// --- 2) Rutas del API: cada recurso vive bajo /api/<recurso>, con su router, controlador y validator ---
// El API responde siempre con JSON (datos), no con paginas HTML.
//
// Ruta sencilla para comprobar que el servidor esta vivo: GET /api/health -> 200 {"status":"ok"}.
// res.json(...) envia un objeto convertido a JSON; si no se indica otro, el codigo es 200 (OK).
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
// app.use("/prefijo", router): todas las URLs que empiezan por ese prefijo se mandan a ese router.
// Dentro del router las rutas se escriben sin el prefijo: por ejemplo, router.get("/:id") en
// routes/restaurants.js atiende GET /api/restaurants/7.
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/dishes", dishesRouter);
app.use("/api/riders", ridersRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/messages", messagesRouter);

// --- Rutas del flujo de la web: /login, /menu, /order, /order/total y /orders (historial del usuario) ---
// Se monta en "/" porque estas URLs no llevan prefijo. Si la URL no coincide con ninguna de
// sus rutas, el router llama a next() y la peticion sigue hacia abajo (archivos estaticos).
app.use("/", checkoutRouter);

// --- 3) Archivos estaticos: la web (public/) la sirve el mismo servidor ---
// Ejemplo: http://localhost:3000/restaurants.html devuelve el archivo public/restaurants.html.
// express.static busca la URL como archivo dentro de la carpeta indicada; si no existe, llama
// a next(). __dirname es la carpeta de este archivo (src/), asi que "..", "public" = globo/public.
// Va DESPUES de las rutas del API, para que /api/... nunca se confunda con un archivo,
// y solo sirve public/: el codigo (src/) y los datos (data/) no se pueden descargar.
app.use(express.static(path.join(__dirname, "..", "public")));

// --- 4) y 5) Final de la cadena ---
// Si la peticion llega hasta aqui es que nada ha respondido -> notFound responde 404 en JSON.
// errorHandler se registra el ULTIMO: Express lo llama cuando alguna pieza anterior lanza un
// error o llama a next(error). Lo reconoce porque tiene 4 parametros (err, req, res, next).
app.use(notFound);
app.use(errorHandler);

// Exportamos la app para que la usen server.js (para arrancarla) y los tests.
module.exports = app;
