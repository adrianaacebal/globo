// Logica de /api/messages: mensajes del formulario de contacto.
// contact.html crea los nuevos (POST) y messages.html los gestiona (todas las operaciones).
const store = require("../store");
const { validateMessage, validateMessageQuery } = require("../validators/messages");
const { normalize, countBy } = require("../utils");

// Aplica los filtros de la query: ?q=&subject=&status=
// q busca en el nombre, el email y el texto del mensaje
function filterMessages(list, f) {
  const q = normalize(f.q);
  return list.filter(
    (m) =>
      (!f.subject || m.subject === f.subject) &&
      (!f.status || m.status === f.status) &&
      (!q || normalize(m.name + m.email + m.message).includes(q))
  );
}

const notFound = (res) => res.status(404).json({ error: "Message not found" });

// GET /api/messages -> 200 [ ... ] (el mas nuevo primero)
function listMessages(req, res) {
  const { value: filters, errors } = validateMessageQuery(req.query);
  if (errors) return res.status(400).json({ errors });
  res.json(filterMessages(store.messages.all(), filters).reverse());
}

// GET /api/messages/stats (acepta los mismos filtros)
function messageStats(req, res) {
  const { value: filters, errors } = validateMessageQuery(req.query);
  if (errors) return res.status(400).json({ errors });

  const list = filterMessages(store.messages.all(), filters);
  res.json({
    total: list.length,
    byStatus: countBy(list, "status"),
    bySubject: countBy(list, "subject"),
  });
}

// GET /api/messages/:id
function getMessage(req, res) {
  const message = store.messages.findById(req.id);
  if (!message) return notFound(res);
  res.json(message);
}

// POST /api/messages -> 201 (status empieza en "new" si no se manda)
function createMessage(req, res) {
  const { value, errors } = validateMessage(req.body);
  if (errors) return res.status(400).json({ errors });
  const created = store.messages.create({ ...value, createdAt: new Date().toISOString() });
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/messages/:id -> sustituye todos los campos (createdAt se conserva)
function replaceMessage(req, res) {
  const current = store.messages.findById(req.id);
  if (!current) return notFound(res);
  const { value, errors } = validateMessage(req.body);
  if (errors) return res.status(400).json({ errors });
  res.json(store.messages.replace(req.id, { ...value, createdAt: current.createdAt }));
}

// PATCH /api/messages/:id -> cambia solo los campos enviados (p. ej. { "status": "answered" })
function updateMessage(req, res) {
  if (!store.messages.findById(req.id)) return notFound(res);
  const { value, errors } = validateMessage(req.body, { partial: true });
  if (errors) return res.status(400).json({ errors });
  res.json(store.messages.update(req.id, value));
}

// DELETE /api/messages/:id -> 204
function deleteMessage(req, res) {
  if (!store.messages.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listMessages, messageStats, getMessage, createMessage, replaceMessage, updateMessage, deleteMessage };
