// =====================================================================================
// CONTROLADOR DE RECLAMACIONES (complaintsController.js)
// =====================================================================================
// Logica de /api/complaints (reclamaciones). complaint.html crea las nuevas y complaints.html las gestiona.
//
// Un CONTROLADOR contiene las funciones que se ejecutan cuando llega una peticion HTTP.
// El router (src/routes/complaints.js) une cada ruta con su funcion, por ejemplo:
//   GET /api/complaints -> listComplaints · POST /api/complaints -> createComplaint ...
// Aqui esta el CRUD completo: Create (POST), Read (GET), Update (PUT/PATCH) y Delete (DELETE).
//
// Cada funcion recibe:
//   - req: la peticion. req.body (datos JSON enviados), req.query (filtros tras "?" en la URL)
//          y req.id (el numero de /api/complaints/5, ya comprobado y convertido a numero por
//          el middleware validateId; si no es un numero valido ya se respondio 400 antes).
//   - res: la respuesta. res.status(codigo).json(datos). Si no se pone status -> 200 OK.
//
// Codigos HTTP usados: 200 OK · 201 Created · 204 No Content · 400 Bad Request · 404 Not Found
// =====================================================================================
// store = capa de datos (all, findById, create, replace, update, remove). Nunca tocamos los arrays.
const store = require("../data/store");
// Validators: comprueban que los datos del formulario o de la URL son correctos.
// Devuelven siempre { valid, value, errors } (ver src/validators/common.js).
const { validateComplaint, validateComplaintQuery } = require("../validators/complaintsValidator");
// normalize: texto en minusculas y sin tildes para comparar · countBy: cuenta por valor
const { normalize, countBy } = require("../utils");

// Funcion auxiliar (no es un endpoint): filtra la lista con los filtros de la URL.
// ?search=&brand=&type=&status=  (search busca en el nombre, el email y el texto)
// Para cada filtro: si no se ha pedido, vale todo; si se ha pedido, tiene que coincidir.
function filterComplaints(list, filters) {
  // Texto de busqueda normalizado ("Pizza Fría" -> "pizzafria") para comparar sin fallos
  const search = normalize(filters.search);
  return list.filter(
    (c) =>
      (!filters.brand || c.brand === filters.brand) &&
      (!filters.type || c.type === filters.type) &&
      (!filters.status || c.status === filters.status) &&
      // Juntamos nombre + email + mensaje y miramos si contiene el texto buscado
      (!search || normalize(c.name + c.email + c.message).includes(search))
  );
}

// Atajo para responder 404 (no encontrada) siempre igual
const notFound = (res) => res.status(404).json({ error: "Complaint not found" });

// -------------------------------------------------------------------------------------
// GET /api/complaints -> 200 [ ... ] (la mas nueva primero)
// Operacion: LEER la lista de reclamaciones, con filtros opcionales.
//   Ejemplo: GET /api/complaints?brand=telepizza&status=open
// Respuestas:
//   200 -> array JSON con las reclamaciones (puede ser [])
//   400 -> algun filtro no es valido -> { errors: [ { field, message } ] }
// -------------------------------------------------------------------------------------
function listComplaints(req, res) {
  // Validamos req.query. El validator devuelve:
  //   valid (true/false), value (los filtros ya limpios, aqui renombrado "filters")
  //   y errors (lista de { field, message })
  const { valid, value: filters, errors } = validateComplaintQuery(req.query);
  // "return" hace que la funcion termine aqui y no se intente responder dos veces
  if (!valid) return res.status(400).json({ errors });
  // Las nuevas se guardan al final, asi que reverse() las pone primero. res.json -> 200
  res.json(filterComplaints(store.complaints.all(), filters).reverse());
}

// -------------------------------------------------------------------------------------
// GET /api/complaints/stats
// Operacion: LEER un resumen (estadisticas). Acepta los mismos filtros que la lista.
// Respuestas:
//   200 -> { total, byStatus, byType, byBrand }
//   400 -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function complaintStats(req, res) {
  const { valid, value: filters, errors } = validateComplaintQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = filterComplaints(store.complaints.all(), filters);
  res.json({
    // Cuantas reclamaciones hay
    total: list.length,
    // Cuantas de cada estado, ej: { open: 4, resolved: 2 }
    byStatus: countBy(list, "status"),
    // Cuantas de cada tipo de problema
    byType: countBy(list, "type"),
    // Cuantas de cada marca de restaurante
    byBrand: countBy(list, "brand"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/complaints/:id
// Operacion: LEER una reclamacion concreta (ej: GET /api/complaints/3).
// Respuestas:
//   200 -> la reclamacion en JSON
//   400 -> id no valido (lo responde validateId)
//   404 -> no existe ninguna con ese id
// -------------------------------------------------------------------------------------
function getComplaint(req, res) {
  // req.id lo ha dejado preparado el middleware validateId
  const complaint = store.complaints.findById(req.id);
  // findById devuelve null si no la encuentra
  if (!complaint) return notFound(res);
  res.json(complaint);
}

// -------------------------------------------------------------------------------------
// POST /api/complaints -> 201 + Location (status empieza en "open")
// Operacion: CREAR una reclamacion nueva con los datos de req.body (formulario complaint.html).
//   Body: { name, email, brand, type, date, message } (status es opcional: por defecto "open")
// Respuestas:
//   201 -> reclamacion creada (con id y createdAt) + cabecera Location con su URL
//   400 -> faltan datos o estan mal (email no valido, fecha futura, mensaje corto...)
// -------------------------------------------------------------------------------------
function createComplaint(req, res) {
  // 1) Validar el body: value tiene solo los campos conocidos y ya limpios
  const { valid, value, errors } = validateComplaint(req.body);
  if (!valid) return res.status(400).json({ errors });
  // 2) Guardar. La fecha de creacion (createdAt) la pone el SERVIDOR con la hora actual,
  //    no el cliente, para que nadie pueda inventarsela. El store le pone el id.
  const created = store.complaints.create({ ...value, createdAt: new Date().toISOString() });
  // 3) Responder 201 Created con la URL del recurso nuevo en la cabecera Location
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/complaints/:id -> sustituye todos los campos (createdAt se conserva)
// Operacion: MODIFICAR la reclamacion entera (hay que mandar todos los campos).
// Respuestas:
//   200 -> la reclamacion modificada
//   400 -> id o datos no validos
//   404 -> no existe ninguna con ese id
// -------------------------------------------------------------------------------------
function replaceComplaint(req, res) {
  // Necesitamos la actual para no perder su fecha de creacion
  const current = store.complaints.findById(req.id);
  if (!current) return notFound(res);
  // Validacion completa (todos los campos obligatorios)
  const { valid, value, errors } = validateComplaint(req.body);
  if (!valid) return res.status(400).json({ errors });
  // Sustituimos los datos pero mantenemos el createdAt original -> 200
  res.json(store.complaints.replace(req.id, { ...value, createdAt: current.createdAt }));
}

// -------------------------------------------------------------------------------------
// PATCH /api/complaints/:id (p. ej. solo { "status": "resolved" })
// Operacion: MODIFICAR solo algunos campos (lo usa complaints.html para cambiar el estado).
// Respuestas:
//   200 -> la reclamacion modificada
//   400 -> id o datos no validos, o body sin ningun campo
//   404 -> no existe ninguna con ese id
// -------------------------------------------------------------------------------------
function updateComplaint(req, res) {
  if (!store.complaints.findById(req.id)) return notFound(res);
  // partial: true -> los campos que no llegan no son obligatorios
  const { valid, value, errors } = validateComplaint(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // update solo cambia los campos recibidos y devuelve la reclamacion completa -> 200
  res.json(store.complaints.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/complaints/:id -> 204
// Operacion: BORRAR una reclamacion.
// Respuestas:
//   204 -> borrada (sin cuerpo en la respuesta)
//   400 -> id no valido
//   404 -> no existe ninguna con ese id
// -------------------------------------------------------------------------------------
function deleteComplaint(req, res) {
  // remove devuelve false si no existia -> 404
  if (!store.complaints.remove(req.id)) return notFound(res);
  // 204 No Content: .end() cierra la respuesta sin mandar JSON
  res.status(204).end();
}

// Exportamos las funciones para usarlas en el router (src/routes/complaints.js)
module.exports = {
  listComplaints,
  complaintStats,
  getComplaint,
  createComplaint,
  replaceComplaint,
  updateComplaint,
  deleteComplaint,
};
