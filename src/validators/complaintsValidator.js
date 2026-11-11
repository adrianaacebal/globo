// Validator de complaints (reclamaciones): body de POST/PUT/PATCH y filtros de GET /api/complaints?...
const { BRAND_KEYS, COMPLAINT_TYPES, COMPLAINT_STATUSES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const complaintSchema = {
  name: { type: "text", min: 2, max: 60 },
  email: { type: "email" },
  brand: { type: "option", options: BRAND_KEYS },
  type: { type: "option", options: COMPLAINT_TYPES },
  date: { type: "date", notFuture: true },
  message: { type: "text", min: 10, max: 1000 },
  // complaint.html no lo manda: toda reclamacion nueva empieza "open"
  status: { type: "option", options: COMPLAINT_STATUSES, default: "open" },
};

const complaintQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  brand: complaintSchema.brand,
  type: complaintSchema.type,
  status: { type: "option", options: COMPLAINT_STATUSES },
};

const validateComplaint = (body, options) => validateBody(complaintSchema, body, options);
const validateComplaintQuery = (query) => validateQuery(complaintQuerySchema, query);

module.exports = { validateComplaint, validateComplaintQuery };
