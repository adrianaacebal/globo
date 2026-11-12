// =====================================================================
// ROUTER DE /api/restaurants  (archivo: src/routes/restaurants.js)
// =====================================================================
// Que es este archivo?
//   Es un "router" de Express: una lista de rutas (metodo HTTP + URL) y, para cada
//   una, la funcion del controlador que la atiende. Es un router "fino": aqui NO hay
//   logica (ni validar datos ni calcular nada); solo dice "esta URL -> esta funcion".
//   La logica esta en src/controllers/restaurantsController.js y los datos en src/data/store.js.
//
// Donde se "monta"?
//   En src/app.js:  app.use("/api/restaurants", restaurantsRouter);
//   Eso significa que todas las rutas de este archivo empiezan por /api/restaurants.
//   Por eso aqui escribimos "/" o "/:id" y la URL completa es /api/restaurants o /api/restaurants/:id.
//
// Para que sirve?  Gestiona todos los restaurantes (locales de cada marca: Burger King, McDonald's...).
//   Lo usa restaurants.html y el buscador del mapa.
//
// Flujo de una peticion:
//   navegador -> app.js (middlewares: express.json, logger) -> ESTE router
//   -> validateId (si la URL lleva :id) -> controlador -> store -> respuesta JSON
//
// Resumen CRUD (Create, Read, Update, Delete = Crear, Leer, Actualizar, Borrar):
//   GET    /api/restaurants         -> Read   (listar)
//   GET    /api/restaurants/stats   -> Read   (estadisticas)
//   GET    /api/restaurants/:id     -> Read   (ver uno)
//   POST   /api/restaurants         -> Create (crear)
//   PUT    /api/restaurants/:id     -> Update (sustituir entero)
//   PATCH  /api/restaurants/:id     -> Update (cambiar solo algunos campos)
//   DELETE /api/restaurants/:id     -> Delete (borrar)
// =====================================================================
// Importamos Express, el framework (libreria) con el que hacemos el servidor web.
// require(...) es la forma de Node de "traer" codigo de otro archivo o paquete.
const express = require("express");
// Importamos el controlador de este recurso y lo llamamos "c" para abreviar.
// "c" es un objeto con todas sus funciones: c.list..., c.get..., c.create..., etc.
// Cada funcion del controlador recibe (req, res): req = la peticion que llega
// (URL, query, body...), res = la respuesta que vamos a devolver (res.json(...)).
const c = require("../controllers/restaurantsController");
// validateId es un middleware nuestro (src/middleware/validateId.js).
// Un middleware es una funcion que se ejecuta ANTES del controlador y puede
// dejar pasar la peticion (next()) o cortarla respondiendo un error.
// Este comprueba que el :id de la URL sea un numero entero positivo.
const validateId = require("../middleware/validateId");

// Creamos el Router: es como una "mini aplicacion" de Express que solo contiene
// rutas. Luego app.js lo engancha bajo /api/restaurants. Asi cada recurso tiene su
// propio archivo de rutas y app.js queda corto y ordenado.
const router = express.Router();
// router.param("id", validateId): cada vez que una ruta de ESTE router tenga
// el parametro :id en la URL, Express ejecuta antes validateId con su valor.
//   - /api/restaurants/abc -> responde 400 (Bad Request) y el controlador ni se ejecuta.
//   - /api/restaurants/7   -> guarda req.id = 7 (ya como numero) y sigue (next()).
// Ventaja: se escribe una sola vez y vale para GET, PUT, PATCH y DELETE con :id,
// asi los controladores no tienen que repetir esa comprobacion.
router.param("id", validateId);

// GET /api/restaurants -> listar los restaurantes (CRUD: Read).
// Admite filtros por query string, p. ej. /api/restaurants?search=...
// Responde 200 con un array JSON. Funcion: listRestaurants del controlador.
router.get("/", c.listRestaurants);
// GET /api/restaurants/stats -> estadisticas de los restaurantes: totales, medias, agrupados... (CRUD: Read).
// IMPORTANTE: esta ruta va ANTES de "/:id". Express revisa las rutas en orden
// y usa la primera que encaja. ":id" encaja con cualquier texto, asi que si
// "/:id" estuviera antes, "/stats" se trataria como id = "stats" y validateId
// responderia 400 ("id must be a positive integer"). Funcion: restaurantStats.
router.get("/stats", c.restaurantStats); // antes de /:id para que "stats" no se lea como id
// GET /api/restaurants/:id -> ver un restaurante concreto por su id (CRUD: Read).
// ":id" es un parametro: en /api/restaurants/3 vale "3". 200 si existe, 404 si no.
// Funcion: getRestaurant.
router.get("/:id", c.getRestaurant);
// POST /api/restaurants -> crear un restaurante nuevo (CRUD: Create).
// Los datos llegan en el body como JSON, p. ej. { "name": "...", "brand": "mcdonalds", "area": "Centro", ... }
// El controlador los valida (validator) y, si estan bien, el store los guarda y
// les pone el id. Responde 201 (Created); si hay errores, 400. Funcion: createRestaurant.
router.post("/", c.createRestaurant);
// PUT /api/restaurants/:id -> sustituir el restaurante ENTERO (CRUD: Update).
// Hay que mandar todos los campos obligatorios: lo que no se mande se pierde.
// 200 si va bien, 400 si los datos no son validos, 404 si no existe. Funcion: replaceRestaurant.
router.put("/:id", c.replaceRestaurant);
// PATCH /api/restaurants/:id -> modificar solo ALGUNOS campos (CRUD: Update).
// Ej.: { "delivery": false } cambia ese campo y deja el resto igual.
// Diferencia con PUT: PUT reemplaza todo, PATCH solo lo que envias. Funcion: updateRestaurant.
router.patch("/:id", c.updateRestaurant);
// DELETE /api/restaurants/:id -> borrar un restaurante (CRUD: Delete).
// Responde 204 (No Content: ha ido bien pero no hay nada que devolver) o 404.
// Funcion: deleteRestaurant.
router.delete("/:id", c.deleteRestaurant);

// Exportamos el router para que app.js pueda importarlo con require(...)
// y montarlo con app.use("/api/restaurants", ...).
module.exports = router;
