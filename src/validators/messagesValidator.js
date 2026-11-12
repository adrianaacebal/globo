// =====================================================================================
// messagesValidator.js  ->  reglas de los MENSAJES del formulario de contacto (messages)
// =====================================================================================
// Validator de messages (formulario de contacto): body de POST/PUT/PATCH y filtros de GET /api/messages?...
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/messagesController.js en estos endpoints:
//   - POST   /api/messages       -> crear un mensaje (lo manda contact.html)
//   - PUT    /api/messages/:id   -> reemplazarlo entero (todos los campos obligatorios)
//   - PATCH  /api/messages/:id   -> cambiar solo algunos campos (modo partial), p. ej. el status
//   - GET    /api/messages?...   y   GET /api/messages/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
// Recordatorio: aunque contact.html ya valida en el navegador, el servidor vuelve a validar,
// porque cualquiera puede mandar la peticion sin pasar por el formulario.
//
// Constantes que vienen de src/constants.js:
//   - MESSAGE_SUBJECTS: order, restaurant, account, other  (tema del mensaje)
//   - MESSAGE_STATUSES: new, read, answered                 (estado del mensaje)
const { MESSAGE_SUBJECTS, MESSAGE_STATUSES } = require("../constants");
// Las dos funciones genericas de validacion (ver common.js)
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// Describe cada campo de un mensaje. El id no aparece: lo pone el servidor.
const messageSchema = {
  // name: texto de 2 a 60 caracteres (nombre de quien escribe). Obligatorio.
  name: { type: "text", min: 2, max: 60 },
  // email: un correo valido; se guarda en minusculas. Obligatorio.
  email: { type: "email" },
  // subject: tema, uno de MESSAGE_SUBJECTS. Obligatorio.
  subject: { type: "option", options: MESSAGE_SUBJECTS },
  // message: texto de 10 a 1000 caracteres. Obligatorio.
  message: { type: "text", min: 10, max: 1000 },
  // status: uno de MESSAGE_STATUSES. Si no se manda, vale "new" (default).
  // contact.html no lo manda: todo mensaje nuevo empieza "new"
  // Despues, la pagina de gestion (messages.html) lo cambia con PATCH a "read" o "answered".
  status: { type: "option", options: MESSAGE_STATUSES, default: "new" },
};

// ---------- Schema de la QUERY (filtros de GET /api/messages y /stats) ----------
// Todos los filtros son opcionales y se pueden combinar: ?subject=order&status=new
const messageQuerySchema = {
  // search: texto de 1 a 60 caracteres; el controlador lo busca en el nombre, el email y el texto
  search: { type: "text", min: 1, max: 60 },
  // subject: misma regla que en el body
  subject: messageSchema.subject,
  // status: uno de MESSAGE_STATUSES. Aqui SIN default: si no se filtra, salen todos los estados
  status: { type: "option", options: MESSAGE_STATUSES },
};

// Funciones que llama el controlador. options = { partial: true } en PATCH.
// Las dos devuelven { valid, value, errors }.
const validateMessage = (body, options) => validateBody(messageSchema, body, options);
const validateMessageQuery = (query) => validateQuery(messageQuerySchema, query);

// Se exportan para poder usarlas en messagesController.js
module.exports = { validateMessage, validateMessageQuery };
