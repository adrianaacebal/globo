// Validator del recurso complaints: esquema del body (POST/PUT/PATCH) y de los filtros (GET /api/complaints?...)
const { BRAND_KEYS, COMPLAINT_TYPES, COMPLAINT_STATUSES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const complaintSchema = {
  name: { type: "text", min: 2, max: 60 },
  email: { type: "email" },
  brand: { type: "option", options: BRAND_KEYS },
  type: { type: "option", options: COMPLAINT_TYPES },
  date: { type: "date", notFuture: true },
  message: { type: "text", min: 10, max: 1000 },
  // El cliente no lo manda desde complaint.html: toda reclamacion nueva empieza "open"
  status: { type: "option", options: COMPLAINT_STATUSES, default: "open" },
};

const complaintQuerySchema = {
  q: { type: "text", min: 1, max: 60 },
  brand: complaintSchema.brand,
  type: complaintSchema.type,
  status: { type: "option", options: COMPLAINT_STATUSES },
};

// options = { partial: true } en PATCH
const validateComplaint = (body, options) => validateBody(complaintSchema, body, options);

function validateComplaintQuery(query) {
  const { value, errors } = validateQuery(complaintQuerySchema, query);
  return { value, errors: Object.keys(errors).length ? errors : null };
}

module.exports = { validateComplaint, validateComplaintQuery };
