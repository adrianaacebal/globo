// Validator del recurso messages: esquema del body (POST/PUT/PATCH) y de los filtros (GET /api/messages?...)
const { MESSAGE_SUBJECTS, MESSAGE_STATUSES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const messageSchema = {
  name: { type: "text", min: 2, max: 60 },
  email: { type: "email" },
  subject: { type: "option", options: MESSAGE_SUBJECTS },
  message: { type: "text", min: 10, max: 1000 },
  // El cliente no lo manda desde contact.html: todo mensaje nuevo empieza "new"
  status: { type: "option", options: MESSAGE_STATUSES, default: "new" },
};

const messageQuerySchema = {
  q: { type: "text", min: 1, max: 60 },
  subject: messageSchema.subject,
  status: { type: "option", options: MESSAGE_STATUSES },
};

// options = { partial: true } en PATCH
const validateMessage = (body, options) => validateBody(messageSchema, body, options);

function validateMessageQuery(query) {
  const { value, errors } = validateQuery(messageQuerySchema, query);
  return { value, errors: Object.keys(errors).length ? errors : null };
}

module.exports = { validateMessage, validateMessageQuery };
