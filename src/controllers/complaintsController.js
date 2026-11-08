// Logica de /api/complaints (reclamaciones). complaint.html crea las nuevas y complaints.html las gestiona.
const store = require("../data/store");
const { validateComplaint, validateComplaintQuery } = require("../validators/complaintsValidator");
const { normalize, countBy } = require("../utils");

// ?search=&brand=&type=&status=  (search busca en el nombre, el email y el texto)
function filterComplaints(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (c) =>
      (!filters.brand || c.brand === filters.brand) &&
      (!filters.type || c.type === filters.type) &&
      (!filters.status || c.status === filters.status) &&
      (!search || normalize(c.name + c.email + c.message).includes(search))
  );
}

const notFound = (res) => res.status(404).json({ error: "Complaint not found" });

// GET /api/complaints -> 200 [ ... ] (la mas nueva primero)
function listComplaints(req, res) {
  const { valid, value: filters, errors } = validateComplaintQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  res.json(filterComplaints(store.complaints.all(), filters).reverse());
}

// GET /api/complaints/stats
function complaintStats(req, res) {
  const { valid, value: filters, errors } = validateComplaintQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
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

// POST /api/complaints -> 201 + Location (status empieza en "open")
function createComplaint(req, res) {
  const { valid, value, errors } = validateComplaint(req.body);
  if (!valid) return res.status(400).json({ errors });
  const created = store.complaints.create({ ...value, createdAt: new Date().toISOString() });
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// PUT /api/complaints/:id -> sustituye todos los campos (createdAt se conserva)
function replaceComplaint(req, res) {
  const current = store.complaints.findById(req.id);
  if (!current) return notFound(res);
  const { valid, value, errors } = validateComplaint(req.body);
  if (!valid) return res.status(400).json({ errors });
  res.json(store.complaints.replace(req.id, { ...value, createdAt: current.createdAt }));
}

// PATCH /api/complaints/:id (p. ej. solo { "status": "resolved" })
function updateComplaint(req, res) {
  if (!store.complaints.findById(req.id)) return notFound(res);
  const { valid, value, errors } = validateComplaint(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
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
