// =====================================================================
// ROUTER DE /api/messages  (archivo: src/routes/messages.js)
// =====================================================================
// Que es este archivo?
//   Es un "router" de Express: una lista de rutas (metodo HTTP + URL) y, para cada
//   una, la funcion del controlador que la atiende. Es un router "fino": aqui NO hay
//   logica (ni validar datos ni calcular nada); solo dice "esta URL -> esta funcion".
//   La logica esta en src/controllers/messagesController.js y los datos en src/data/store.js.
//
// Donde se "monta"?
//   En src/app.js:  app.use("/api/messages", messagesRouter);
//   Eso significa que todas las rutas de este archivo empiezan por /api/messages.
//   Por eso aqui escribimos "/" o "/:id" y la URL completa es /api/messages o /api/messages/:id.
//
// Para que sirve?  Gestiona todos los mensajes de contacto.
//   Lo usa contact.html (crear) y messages.html (gestionar).
//
// Flujo de una peticion:
//   navegador -> app.js (middlewares: express.json, logger) -> ESTE router
//   -> validateId (si la URL lleva :id) -> controlador -> store -> respuesta JSON
//
// Resumen CRUD (Create, Read, Update, Delete = Crear, Leer, Actualizar, Borrar):
//   GET    /api/messages         -> Read   (listar)
//   GET    /api/messages/stats   -> Read   (estadisticas)
//   GET    /api/messages/:id     -> Read   (ver uno)
//   POST   /api/messages         -> Create (crear)
//   PUT    /api/messages/:id     -> Update (sustituir entero)
//   PATCH  /api/messages/:id     -> Update (cambiar solo algunos campos)
//   DELETE /api/messages/:id     -> Delete (borrar)
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
const c = require("../controllers/messagesController");

// Creamos el Router: es como una "mini aplicacion" de Express que solo contiene
// rutas. Luego app.js lo engancha bajo /api/messages. Asi cada recurso tiene su
// propio archivo de rutas y app.js queda corto y ordenado.
const router = express.Router();

// router.param("id", validateId): cada vez que una ruta de ESTE router tenga
// el parametro :id en la URL, Express ejecuta antes validateId con su valor.
//   - /api/messages/abc -> responde 400 (Bad Request) y el controlador ni se ejecuta.
//   - /api/messages/7   -> guarda req.id = 7 (ya como numero) y sigue (next()).
// Ventaja: se escribe una sola vez y vale para GET, PUT, PATCH y DELETE con :id,
// asi los controladores no tienen que repetir esa comprobacion.
router.param("id", validateId);

// GET /api/messages -> listar los mensajes (CRUD: Read).
// Admite filtros por query string, p. ej. /api/messages?search=...
// Responde 200 con un array JSON. Funcion: listMessages del controlador.
router.get("/", c.listMessages);
// GET /api/messages/stats -> estadisticas de los mensajes: totales, medias, agrupados... (CRUD: Read).
// IMPORTANTE: esta ruta va ANTES de "/:id". Express revisa las rutas en orden
// y usa la primera que encaja. ":id" encaja con cualquier texto, asi que si
// "/:id" estuviera antes, "/stats" se trataria como id = "stats" y validateId
// responderia 400 ("id must be a positive integer"). Funcion: messageStats.
router.get("/stats", c.messageStats); // antes de /:id para que "stats" no se lea como id
// GET /api/messages/:id -> ver un mensaje concreto por su id (CRUD: Read).
// ":id" es un parametro: en /api/messages/3 vale "3". 200 si existe, 404 si no.
// Funcion: getMessage.
router.get("/:id", c.getMessage);
// POST /api/messages -> crear un mensaje nuevo (CRUD: Create).
// Los datos llegan en el body como JSON, p. ej. { "name": "Pedro", "email": "...", "subject": "order", "message": "..." }
// El controlador los valida (validator) y, si estan bien, el store los guarda y
// les pone el id. Responde 201 (Created); si hay errores, 400. Funcion: createMessage.
router.post("/", c.createMessage);
// PUT /api/messages/:id -> sustituir el mensaje ENTERO (CRUD: Update).
// Hay que mandar todos los campos obligatorios: lo que no se mande se pierde.
// 200 si va bien, 400 si los datos no son validos, 404 si no existe. Funcion: replaceMessage.
router.put("/:id", c.replaceMessage);
// PATCH /api/messages/:id -> modificar solo ALGUNOS campos (CRUD: Update).
// Ej.: { "status": "answered" } cambia ese campo y deja el resto igual.
// Diferencia con PUT: PUT reemplaza todo, PATCH solo lo que envias. Funcion: updateMessage.
router.patch("/:id", c.updateMessage);
// DELETE /api/messages/:id -> borrar un mensaje (CRUD: Delete).
// Responde 204 (No Content: ha ido bien pero no hay nada que devolver) o 404.
// Funcion: deleteMessage.
router.delete("/:id", c.deleteMessage);

// Exportamos el router para que app.js pueda importarlo con require(...)
// y montarlo con app.use("/api/messages", ...).
module.exports = router;
