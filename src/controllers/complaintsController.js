// Logica de /api/complaints: reclamaciones de los clientes.
// complaint.html crea las nuevas (POST) y complaints.html las gestiona (todas las operaciones).
const store = require("../store");
const { validateComplaint, validateComplaintQuery } = require("../validators/complaints");
const { normalize, countBy } = require("../utils");

// Aplica los filtros de la query: ?q=&brand=&type=&status=
// q busca en el nombre, el email y el texto de la reclamacion
function filterComplaints(list, f) {
  const q = normalize(f.q);
  return list.filter(
    (c) =>
      (!f.brand || c.brand === f.brand) &&
      (!f.type || c.type === f.type) &&
      (!f.status || c.status === f.status) &&
      (!q || normalize(c.name + c.email + c.message).includes(q))
  );
}

const notFound = (res) => res.status(404).json({ error: "Complaint not found" });

// GET /api/complaints -> 200 [ ... ] (la mas nueva primero)
function listComplaints(req, res) {
  const { value: filters, errors } = validateComplaintQuery(req.query);
  if (errors) return res.status(400).json({ errors });
  res.json(filterComplaints(store.complaints.all(), filters).reverse());
}

// GET /api/complaints/stats (acepta los mismos filtros)
function complaintStats(req, res) {
  const { value: filters, errors } = validateComplaintQuery(req.query);
  if (errors) return res.status(400).json({ errors });

  const list = filterComplaints(store.complaints.all(), filters);
  res.json({
    total: list.length,
    byStatus: countBy(list, "status"),
    byType: countBy(list, "type"),
    byBrand: countBy(list, "brand"),
  });
}

// GET /api/complaints/:id
function getComplaint(req, res) {
  const complaint = store.complaints.findById(req.id);
  if (!complaint) return notFound(res);
  res.json(complaint);
}

// POST /api/complaints -> 201 (status empieza en "open" si no se manda)
function createComplaint(req, res) {
  const { value, errors } = validateComplaint(req.body);
  if (errors) return res.status(400).json({ errors });
  const created = store.complaints.create({ ...value, createdAt: new Date().toISOString() });
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/complaints/:id -> sustituye todos los campos (createdAt se conserva)
function replaceComplaint(req, res) {
  const current = store.complaints.findById(req.id);
  if (!current) return notFound(res);
  const { value, errors } = validateComplaint(req.body);
  if (errors) return res.status(400).json({ errors });
  res.json(store.complaints.replace(req.id, { ...value, createdAt: current.createdAt }));
}

// PATCH /api/complaints/:id -> cambia solo los campos enviados (p. ej. { "status": "resolved" })
function updateComplaint(req, res) {
  if (!store.complaints.findById(req.id)) return notFound(res);
  const { value, errors } = validateComplaint(req.body, { partial: true });
  if (errors) return res.status(400).json({ errors });
  res.json(store.complaints.update(req.id, value));
}

// DELETE /api/complaints/:id -> 204
function deleteComplaint(req, res) {
  if (!store.complaints.remove(req.id)) return notFound(res);
  res.status(204).end();
}

module.exports = {
  listComplaints,
  complaintStats,
  getComplaint,
  createComplaint,
  replaceComplaint,
  updateComplaint,
  deleteComplaint,
};
