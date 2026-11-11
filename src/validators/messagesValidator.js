// Validator de messages (formulario de contacto): body de POST/PUT/PATCH y filtros de GET /api/messages?...
const { MESSAGE_SUBJECTS, MESSAGE_STATUSES } = require("../constants");
const { validateBody, validateQuery } = require("./common");

const messageSchema = {
  name: { type: "text", min: 2, max: 60 },
  email: { type: "email" },
  subject: { type: "option", options: MESSAGE_SUBJECTS },
  message: { type: "text", min: 10, max: 1000 },
  // contact.html no lo manda: todo mensaje nuevo empieza "new"
  status: { type: "option", options: MESSAGE_STATUSES, default: "new" },
};

const messageQuerySchema = {
  search: { type: "text", min: 1, max: 60 },
  subject: messageSchema.subject,
  status: { type: "option", options: MESSAGE_STATUSES },
};

const validateMessage = (body, options) => validateBody(messageSchema, body, options);
const validateMessageQuery = (query) => validateQuery(messageQuerySchema, query);

module.exports = { validateMessage, validateMessageQuery };
