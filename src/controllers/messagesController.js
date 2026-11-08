// Logica de /api/messages (formulario de contacto). contact.html crea los nuevos y messages.html los gestiona.
const store = require("../data/store");
const { validateMessage, validateMessageQuery } = require("../validators/messagesValidator");
const { normalize, countBy } = require("../utils");

// ?search=&subject=&status=  (search busca en el nombre, el email y el texto)
function filterMessages(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (m) =>
      (!filters.subject || m.subject === filters.subject) &&
      (!filters.status || m.status === filters.status) &&
      (!search || normalize(m.name + m.email + m.message).includes(search))
  );
}

const notFound = (res) => res.status(404).json({ error: "Message not found" });

// GET /api/messages -> 200 [ ... ] (el mas nuevo primero)
function listMessages(req, res) {
  const { valid, value: filters, errors } = validateMessageQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  res.json(filterMessages(store.messages.all(), filters).reverse());
}

// GET /api/messages/stats
function messageStats(req, res) {
  const { valid, value: filters, errors } = validateMessageQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
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

// POST /api/messages -> 201 + Location (status empieza en "new")
function createMessage(req, res) {
  const { valid, value, errors } = validateMessage(req.body);
  if (!valid) return res.status(400).json({ errors });
  const created = store.messages.create({ ...value, createdAt: new Date().toISOString() });
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/messages/:id -> sustituye todos los campos (createdAt se conserva)
function replaceMessage(req, res) {
  const current = store.messages.findById(req.id);
  if (!current) return notFound(res);
  const { valid, value, errors } = validateMessage(req.body);
  if (!valid) return res.status(400).json({ errors });
  res.json(store.messages.replace(req.id, { ...value, createdAt: current.createdAt }));
}

// PATCH /api/messages/:id (p. ej. solo { "status": "answered" })
function updateMessage(req, res) {
  if (!store.messages.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateMessage(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  res.json(store.messages.update(req.id, value));
}

// DELETE /api/messages/:id -> 204
function deleteMessage(req, res) {
  if (!store.messages.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = { listMessages, messageStats, getMessage, createMessage, replaceMessage, updateMessage, deleteMessage };
