// =====================================================================
// ROUTER DE /api/coupons  (archivo: src/routes/coupons.js)
// =====================================================================
// Que es este archivo?
//   Es un "router" de Express: una lista de rutas (metodo HTTP + URL) y, para cada
//   una, la funcion del controlador que la atiende. Es un router "fino": aqui NO hay
//   logica (ni validar datos ni calcular nada); solo dice "esta URL -> esta funcion".
//   La logica esta en src/controllers/couponsController.js y los datos en src/data/store.js.
//
// Donde se "monta"?
//   En src/app.js:  app.use("/api/coupons", couponsRouter);
//   Eso significa que todas las rutas de este archivo empiezan por /api/coupons.
//   Por eso aqui escribimos "/" o "/:id" y la URL completa es /api/coupons o /api/coupons/:id.
//
// Para que sirve?  Gestiona todos los cupones de descuento.
//   Lo usa order.html, al escribir un codigo de descuento.
//
// Flujo de una peticion:
//   navegador -> app.js (middlewares: express.json, logger) -> ESTE router
//   -> validateId (si la URL lleva :id) -> controlador -> store -> respuesta JSON
//
// Resumen CRUD (Create, Read, Update, Delete = Crear, Leer, Actualizar, Borrar):
//   GET    /api/coupons         -> Read   (listar)
//   GET    /api/coupons/stats   -> Read   (estadisticas)
//   GET    /api/coupons/:id     -> Read   (ver uno)
//   POST   /api/coupons         -> Create (crear)
//   PUT    /api/coupons/:id     -> Update (sustituir entero)
//   PATCH  /api/coupons/:id     -> Update (cambiar solo algunos campos)
//   DELETE /api/coupons/:id     -> Delete (borrar)
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
const c = require("../controllers/couponsController");

// Creamos el Router: es como una "mini aplicacion" de Express que solo contiene
// rutas. Luego app.js lo engancha bajo /api/coupons. Asi cada recurso tiene su
// propio archivo de rutas y app.js queda corto y ordenado.
const router = express.Router();

// router.param("id", validateId): cada vez que una ruta de ESTE router tenga
// el parametro :id en la URL, Express ejecuta antes validateId con su valor.
//   - /api/coupons/abc -> responde 400 (Bad Request) y el controlador ni se ejecuta.
//   - /api/coupons/7   -> guarda req.id = 7 (ya como numero) y sigue (next()).
// Ventaja: se escribe una sola vez y vale para GET, PUT, PATCH y DELETE con :id,
// asi los controladores no tienen que repetir esa comprobacion.
router.param("id", validateId); // /api/coupons/abc -> 400 antes de llegar al controlador

// GET /api/coupons -> listar los cupones (CRUD: Read).
// Admite filtros por query string, p. ej. /api/coupons?search=...
// Responde 200 con un array JSON. Funcion: listCoupons del controlador.
router.get("/", c.listCoupons);
// GET /api/coupons/stats -> estadisticas de los cupones: totales, medias, agrupados... (CRUD: Read).
// IMPORTANTE: esta ruta va ANTES de "/:id". Express revisa las rutas en orden
// y usa la primera que encaja. ":id" encaja con cualquier texto, asi que si
// "/:id" estuviera antes, "/stats" se trataria como id = "stats" y validateId
// responderia 400 ("id must be a positive integer"). Funcion: couponStats.
router.get("/stats", c.couponStats); // antes de /:id para que "stats" no se lea como id
// GET /api/coupons/:id -> ver un cupon concreto por su id (CRUD: Read).
// ":id" es un parametro: en /api/coupons/3 vale "3". 200 si existe, 404 si no.
// Funcion: getCoupon.
router.get("/:id", c.getCoupon);
// POST /api/coupons -> crear un cupon nuevo (CRUD: Create).
// Los datos llegan en el body como JSON, p. ej. { "code": "GLOBO20", "percent": 20, "active": true, "orderType": "all" }
// El controlador los valida (validator) y, si estan bien, el store los guarda y
// les pone el id. Responde 201 (Created); si hay errores, 400. Funcion: createCoupon.
router.post("/", c.createCoupon);
// PUT /api/coupons/:id -> sustituir el cupon ENTERO (CRUD: Update).
// Hay que mandar todos los campos obligatorios: lo que no se mande se pierde.
// 200 si va bien, 400 si los datos no son validos, 404 si no existe. Funcion: replaceCoupon.
router.put("/:id", c.replaceCoupon);
// PATCH /api/coupons/:id -> modificar solo ALGUNOS campos (CRUD: Update).
// Ej.: { "active": false } cambia ese campo y deja el resto igual.
// Diferencia con PUT: PUT reemplaza todo, PATCH solo lo que envias. Funcion: updateCoupon.
router.patch("/:id", c.updateCoupon);
// DELETE /api/coupons/:id -> borrar un cupon (CRUD: Delete).
// Responde 204 (No Content: ha ido bien pero no hay nada que devolver) o 404.
// Funcion: deleteCoupon.
router.delete("/:id", c.deleteCoupon);

// Exportamos el router para que app.js pueda importarlo con require(...)
// y montarlo con app.use("/api/coupons", ...).
module.exports = router;
