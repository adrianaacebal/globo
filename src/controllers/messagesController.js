// =====================================================================================
// CONTROLADOR DE MENSAJES DE CONTACTO (messagesController.js)
// =====================================================================================
// Logica de /api/messages (formulario de contacto). contact.html crea los nuevos y messages.html los gestiona.
//
// Un CONTROLADOR contiene las funciones que se ejecutan cuando llega una peticion HTTP.
// El router (src/routes/messages.js) une cada ruta con su funcion, por ejemplo:
//   GET /api/messages -> listMessages · POST /api/messages -> createMessage ...
// Aqui esta el CRUD completo: Create (POST), Read (GET), Update (PUT/PATCH) y Delete (DELETE).
//
// Cada funcion recibe:
//   - req: la peticion. req.body (datos JSON enviados), req.query (filtros tras "?" en la URL)
//          y req.id (el numero de /api/messages/5, ya comprobado y convertido a numero por
//          el middleware validateId; si no es un numero valido ya se respondio 400 antes).
//   - res: la respuesta. res.status(codigo).json(datos). Si no se pone status -> 200 OK.
//
// Codigos HTTP usados: 200 OK · 201 Created · 204 No Content · 400 Bad Request · 404 Not Found
// =====================================================================================
// store = capa de datos (all, findById, create, replace, update, remove). Nunca tocamos los arrays.
const store = require("../data/store");
// Validators: comprueban que los datos del formulario o de la URL son correctos.
// Devuelven siempre { valid, value, errors } (ver src/validators/common.js).
const { validateMessage, validateMessageQuery } = require("../validators/messagesValidator");
// normalize: texto en minusculas y sin tildes para comparar · countBy: cuenta por valor
const { normalize, countBy } = require("../utils");

// Funcion auxiliar (no es un endpoint): filtra la lista con los filtros de la URL.
// ?search=&subject=&status=  (search busca en el nombre, el email y el texto)
// Para cada filtro: si no se ha pedido, vale todo; si se ha pedido, tiene que coincidir.
function filterMessages(list, filters) {
  // Texto de busqueda normalizado para comparar sin importar mayusculas ni tildes
  const search = normalize(filters.search);
  return list.filter(
    (m) =>
      (!filters.subject || m.subject === filters.subject) &&
      (!filters.status || m.status === filters.status) &&
      // Juntamos nombre + email + mensaje y miramos si contiene el texto buscado
      (!search || normalize(m.name + m.email + m.message).includes(search))
  );
}

// Atajo para responder 404 (no encontrado) siempre igual
const notFound = (res) => res.status(404).json({ error: "Message not found" });

// -------------------------------------------------------------------------------------
// GET /api/messages -> 200 [ ... ] (el mas nuevo primero)
// Operacion: LEER la lista de mensajes, con filtros opcionales.
//   Ejemplo: GET /api/messages?status=new
// Respuestas:
//   200 -> array JSON con los mensajes (puede ser [])
//   400 -> algun filtro no es valido -> { errors: [ { field, message } ] }
// -------------------------------------------------------------------------------------
function listMessages(req, res) {
  // Validamos req.query. El validator devuelve:
  //   valid (true/false), value (los filtros ya limpios, aqui renombrado "filters")
  //   y errors (lista de { field, message })
  const { valid, value: filters, errors } = validateMessageQuery(req.query);
  // "return" hace que la funcion termine aqui y no se intente responder dos veces
  if (!valid) return res.status(400).json({ errors });
  // Los nuevos se guardan al final, asi que reverse() los pone primero. res.json -> 200
  res.json(filterMessages(store.messages.all(), filters).reverse());
}

// -------------------------------------------------------------------------------------
// GET /api/messages/stats
// Operacion: LEER un resumen (estadisticas). Acepta los mismos filtros que la lista.
// Respuestas:
//   200 -> { total, byStatus, bySubject }
//   400 -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function messageStats(req, res) {
  const { valid, value: filters, errors } = validateMessageQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = filterMessages(store.messages.all(), filters);
  res.json({
    // Cuantos mensajes hay
    total: list.length,
    // Cuantos de cada estado, ej: { new: 3, answered: 1 }
    byStatus: countBy(list, "status"),
    // Cuantos de cada asunto
    bySubject: countBy(list, "subject"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/messages/:id
// Operacion: LEER un mensaje concreto (ej: GET /api/messages/2).
// Respuestas:
//   200 -> el mensaje en JSON
//   400 -> id no valido (lo responde validateId)
//   404 -> no existe ninguno con ese id
// -------------------------------------------------------------------------------------
function getMessage(req, res) {
  // req.id lo ha dejado preparado el middleware validateId
  const message = store.messages.findById(req.id);
  // findById devuelve null si no lo encuentra
  if (!message) return notFound(res);
  res.json(message);
}

// -------------------------------------------------------------------------------------
// POST /api/messages -> 201 + Location (status empieza en "new")
// Operacion: CREAR un mensaje nuevo con los datos de req.body (formulario contact.html).
//   Body: { name, email, subject, message } (status es opcional: por defecto "new")
// Respuestas:
//   201 -> mensaje creado (con id y createdAt) + cabecera Location con su URL
//   400 -> faltan datos o estan mal (email no valido, asunto que no existe, texto corto...)
// -------------------------------------------------------------------------------------
function createMessage(req, res) {
  // 1) Validar el body: value tiene solo los campos conocidos y ya limpios
  const { valid, value, errors } = validateMessage(req.body);
  if (!valid) return res.status(400).json({ errors });
  // 2) Guardar. La fecha de creacion (createdAt) la pone el SERVIDOR con la hora actual,
  //    asi nadie puede inventarsela. El store le pone el id.
  const created = store.messages.create({ ...value, createdAt: new Date().toISOString() });
  // 3) Responder 201 Created con la URL del recurso nuevo en la cabecera Location
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/messages/:id -> sustituye todos los campos (createdAt se conserva)
// Operacion: MODIFICAR el mensaje entero (hay que mandar todos los campos).
// Respuestas:
//   200 -> el mensaje modificado
//   400 -> id o datos no validos
//   404 -> no existe ninguno con ese id
// -------------------------------------------------------------------------------------
function replaceMessage(req, res) {
  // Necesitamos el actual para no perder su fecha de creacion
  const current = store.messages.findById(req.id);
  if (!current) return notFound(res);
  // Validacion completa (todos los campos obligatorios)
  const { valid, value, errors } = validateMessage(req.body);
  if (!valid) return res.status(400).json({ errors });
  // Sustituimos los datos pero mantenemos el createdAt original -> 200
  res.json(store.messages.replace(req.id, { ...value, createdAt: current.createdAt }));
}

// -------------------------------------------------------------------------------------
// PATCH /api/messages/:id (p. ej. solo { "status": "answered" })
// Operacion: MODIFICAR solo algunos campos (lo usa messages.html para cambiar el estado).
// Respuestas:
//   200 -> el mensaje modificado
//   400 -> id o datos no validos, o body sin ningun campo
//   404 -> no existe ninguno con ese id
// -------------------------------------------------------------------------------------
function updateMessage(req, res) {
  if (!store.messages.findById(req.id)) return notFound(res);
  // partial: true -> los campos que no llegan no son obligatorios
  const { valid, value, errors } = validateMessage(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // update solo cambia los campos recibidos y devuelve el mensaje completo -> 200
  res.json(store.messages.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/messages/:id -> 204
// Operacion: BORRAR un mensaje.
// Respuestas:
//   204 -> borrado (sin cuerpo en la respuesta)
//   400 -> id no valido
//   404 -> no existe ninguno con ese id
// -------------------------------------------------------------------------------------
function deleteMessage(req, res) {
  // remove devuelve false si no existia -> 404
  if (!store.messages.remove(req.id)) return notFound(res);
  // 204 No Content: .end() cierra la respuesta sin mandar JSON
  res.status(204).end();
}

// Exportamos las funciones para usarlas en el router (src/routes/messages.js)
module.exports = { listMessages, messageStats, getMessage, createMessage, replaceMessage, updateMessage, deleteMessage };
