// =====================================================================================
// complaintsValidator.js  ->  reglas de las RECLAMACIONES (complaints)
// =====================================================================================
// Validator de complaints (reclamaciones): body de POST/PUT/PATCH y filtros de GET /api/complaints?...
//
// Este archivo solo DESCRIBE como tienen que ser los datos (los "schemas"). El trabajo de
// comprobarlos lo hace common.js (validateBody y validateQuery). Lo usa
// src/controllers/complaintsController.js en estos endpoints:
//   - POST   /api/complaints       -> crear una reclamacion (la manda complaint.html)
//   - PUT    /api/complaints/:id   -> reemplazarla entera (todos los campos obligatorios)
//   - PATCH  /api/complaints/:id   -> cambiar solo algunos campos (modo partial), p. ej. el status
//   - GET    /api/complaints?...   y   GET /api/complaints/stats?...  -> filtros de la query
// Si algo esta mal, el controlador responde 400 con la lista de errores.
// Recordatorio: aunque complaint.html ya valida en el navegador, el servidor vuelve a validar,
// porque cualquiera puede mandar la peticion sin pasar por el formulario.
//
// Constantes que vienen de src/constants.js (listas fijas de valores permitidos):
//   - BRAND_KEYS:         burgerking, mcdonalds, sushita, telepizza, honestgreens
//   - COMPLAINT_TYPES:    delivery, food, payment, other  (los mismos del <select> de complaint.html)
//   - COMPLAINT_STATUSES: open, in progress, resolved
const { BRAND_KEYS, COMPLAINT_TYPES, COMPLAINT_STATUSES } = require("../constants");
// Las dos funciones genericas de validacion (ver common.js)
const { validateBody, validateQuery } = require("./common");

// ---------- Schema del BODY (POST / PUT / PATCH) ----------
// Describe cada campo de una reclamacion. El id no aparece: lo pone el servidor.
const complaintSchema = {
  // name: texto de 2 a 60 caracteres (nombre de quien reclama). Obligatorio.
  name: { type: "text", min: 2, max: 60 },
  // email: un correo valido; se guarda en minusculas. Obligatorio.
  email: { type: "email" },
  // brand: una de las marcas de BRAND_KEYS (p. ej. "telepizza"). Obligatorio.
  brand: { type: "option", options: BRAND_KEYS },
  // type: tipo de problema, uno de COMPLAINT_TYPES (delivery, food, payment, other). Obligatorio.
  type: { type: "option", options: COMPLAINT_TYPES },
  // date: fecha del problema en formato AAAA-MM-DD y que NO sea futura (notFuture). Obligatorio.
  date: { type: "date", notFuture: true },
  // message: texto de 10 a 1000 caracteres explicando el problema. Obligatorio.
  message: { type: "text", min: 10, max: 1000 },
  // status: estado, uno de COMPLAINT_STATUSES. Si no se manda, vale "open" (default).
  // complaint.html no lo manda: toda reclamacion nueva empieza "open"
  // Despues, la pagina de gestion (complaints.html) lo cambia con PATCH a "in progress" o "resolved".
  status: { type: "option", options: COMPLAINT_STATUSES, default: "open" },
};

// ---------- Schema de la QUERY (filtros de GET /api/complaints y /stats) ----------
// Todos los filtros son opcionales y se pueden combinar: ?brand=sushita&status=open
const complaintQuerySchema = {
  // search: texto de 1 a 60 caracteres; el controlador lo busca en el nombre, el email y el mensaje
  search: { type: "text", min: 1, max: 60 },
  // brand y type: se reutilizan las mismas reglas del body (misma lista de valores)
  brand: complaintSchema.brand,
  type: complaintSchema.type,
  // status: uno de COMPLAINT_STATUSES. Aqui SIN default: si no se filtra, salen todos los estados
  status: { type: "option", options: COMPLAINT_STATUSES },
};

// Funciones que llama el controlador. options = { partial: true } en PATCH.
// Las dos devuelven { valid, value, errors }.
const validateComplaint = (body, options) => validateBody(complaintSchema, body, options);
const validateComplaintQuery = (query) => validateQuery(complaintQuerySchema, query);

// Se exportan para poder usarlas en complaintsController.js
module.exports = { validateComplaint, validateComplaintQuery };
