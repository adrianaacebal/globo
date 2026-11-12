// =====================================================================
// ROUTER DE /api/reviews  (archivo: src/routes/reviews.js)
// =====================================================================
// Que es este archivo?
//   Es un "router" de Express: una lista de rutas (metodo HTTP + URL) y, para cada
//   una, la funcion del controlador que la atiende. Es un router "fino": aqui NO hay
//   logica (ni validar datos ni calcular nada); solo dice "esta URL -> esta funcion".
//   La logica esta en src/controllers/reviewsController.js y los datos en src/data/store.js.
//
// Donde se "monta"?
//   En src/app.js:  app.use("/api/reviews", reviewsRouter);
//   Eso significa que todas las rutas de este archivo empiezan por /api/reviews.
//   Por eso aqui escribimos "/" o "/:id" y la URL completa es /api/reviews o /api/reviews/:id.
//
// Para que sirve?  Gestiona todas las opiniones de los clientes.
//   Lo usa las opiniones sobre cada restaurante.
//
// Flujo de una peticion:
//   navegador -> app.js (middlewares: express.json, logger) -> ESTE router
//   -> validateId (si la URL lleva :id) -> controlador -> store -> respuesta JSON
//
// Resumen CRUD (Create, Read, Update, Delete = Crear, Leer, Actualizar, Borrar):
//   GET    /api/reviews         -> Read   (listar)
//   GET    /api/reviews/stats   -> Read   (estadisticas)
//   GET    /api/reviews/:id     -> Read   (ver uno)
//   POST   /api/reviews         -> Create (crear)
//   PUT    /api/reviews/:id     -> Update (sustituir entero)
//   PATCH  /api/reviews/:id     -> Update (cambiar solo algunos campos)
//   DELETE /api/reviews/:id     -> Delete (borrar)
// =====================================================================
// Importamos Express, el framework (libreria) con el que hacemos el servidor web.
// require(...) es la forma de Node de "traer" codigo de otro archivo o paquete.
const express = require("express");
// validateId es un middleware nuestro (src/middleware/validateId.js).
// Un middleware es una funcion que se ejecuta ANTES del controlador y puede
// dejar pasar la peticion (next()) o cortarla respondiendo un error.
// Este comprueba que el :id de la URL sea un numero entero positivo.
const validateId = require("../middleware/validateId");
// Importamos el controlador de este recurso y lo llamamos "c" para abreviar.
// "c" es un objeto con todas sus funciones: c.list..., c.get..., c.create..., etc.
// Cada funcion del controlador recibe (req, res): req = la peticion que llega
// (URL, query, body...), res = la respuesta que vamos a devolver (res.json(...)).
const c = require("../controllers/reviewsController");

// Creamos el Router: es como una "mini aplicacion" de Express que solo contiene
// rutas. Luego app.js lo engancha bajo /api/reviews. Asi cada recurso tiene su
// propio archivo de rutas y app.js queda corto y ordenado.
const router = express.Router();

// router.param("id", validateId): cada vez que una ruta de ESTE router tenga
// el parametro :id en la URL, Express ejecuta antes validateId con su valor.
//   - /api/reviews/abc -> responde 400 (Bad Request) y el controlador ni se ejecuta.
//   - /api/reviews/7   -> guarda req.id = 7 (ya como numero) y sigue (next()).
// Ventaja: se escribe una sola vez y vale para GET, PUT, PATCH y DELETE con :id,
// asi los controladores no tienen que repetir esa comprobacion.
router.param("id", validateId); // /api/reviews/abc -> 400 antes de llegar al controlador

// GET /api/reviews -> listar las opiniones (CRUD: Read).
// Admite filtros por query string, p. ej. /api/reviews?search=...
// Responde 200 con un array JSON. Funcion: listReviews del controlador.
router.get("/", c.listReviews);
// GET /api/reviews/stats -> estadisticas de las opiniones: totales, medias, agrupados... (CRUD: Read).
// IMPORTANTE: esta ruta va ANTES de "/:id". Express revisa las rutas en orden
// y usa la primera que encaja. ":id" encaja con cualquier texto, asi que si
// "/:id" estuviera antes, "/stats" se trataria como id = "stats" y validateId
// responderia 400 ("id must be a positive integer"). Funcion: reviewStats.
router.get("/stats", c.reviewStats); // antes de /:id para que "stats" no se lea como id
// GET /api/reviews/:id -> ver una opinion concreto por su id (CRUD: Read).
// ":id" es un parametro: en /api/reviews/3 vale "3". 200 si existe, 404 si no.
// Funcion: getReview.
router.get("/:id", c.getReview);
// POST /api/reviews -> crear una opinion nuevo (CRUD: Create).
// Los datos llegan en el body como JSON, p. ej. { "restaurantId": 4, "author": "Alice", "rating": 5, ... }
// El controlador los valida (validator) y, si estan bien, el store los guarda y
// les pone el id. Responde 201 (Created); si hay errores, 400. Funcion: createReview.
router.post("/", c.createReview);
// PUT /api/reviews/:id -> sustituir la opinion ENTERO (CRUD: Update).
// Hay que mandar todos los campos obligatorios: lo que no se mande se pierde.
// 200 si va bien, 400 si los datos no son validos, 404 si no existe. Funcion: replaceReview.
router.put("/:id", c.replaceReview);
// PATCH /api/reviews/:id -> modificar solo ALGUNOS campos (CRUD: Update).
// Ej.: { "verified": true } cambia ese campo y deja el resto igual.
// Diferencia con PUT: PUT reemplaza todo, PATCH solo lo que envias. Funcion: updateReview.
router.patch("/:id", c.updateReview);
// DELETE /api/reviews/:id -> borrar una opinion (CRUD: Delete).
// Responde 204 (No Content: ha ido bien pero no hay nada que devolver) o 404.
// Funcion: deleteReview.
router.delete("/:id", c.deleteReview);

// Exportamos el router para que app.js pueda importarlo con require(...)
// y montarlo con app.use("/api/reviews", ...).
module.exports = router;
