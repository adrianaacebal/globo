// Validacion comun de body y query (la usan los validators de cada recurso). Devuelve TODOS los errores a la vez: { value, errors }
// - value: solo los campos conocidos y ya limpios (los desconocidos y el id se ignoran)
// - errors: { campo: "mensaje" } o null si todo esta bien
const { pickOption, round2 } = require("../utils");

// ---------- Reglas por tipo de campo ----------
function checkField(field, rule, raw) {
  if (Array.isArray(raw)) return { error: `${field} must be a single value` };

  if (rule.type === "text") {
    if (typeof raw !== "string") return { error: `${field} must be text` };
    const text = raw.trim();
    if (text.length < rule.min || text.length > rule.max) {
      return { error: `${field} must be between ${rule.min} and ${rule.max} characters` };
    }
    return { value: text };
  }

  if (rule.type === "number") {
    // Se aceptan numeros y textos numericos ("7.5"), porque los formularios mandan texto
    const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return { error: `${field} must be a number` };
    if (n < rule.min || n > rule.max) return { error: `${field} must be between ${rule.min} and ${rule.max}` };
    return { value: rule.decimals !== undefined ? round2(n) : n };
  }

  if (rule.type === "option") {
    const option = typeof raw === "string" ? pickOption(rule.options, raw) : undefined;
    if (!option) return { error: `${field} must be one of: ${rule.options.join(", ")}` };
    return { value: option };
  }

  throw new Error(`Unknown rule type ${rule.type}`);
}

const isEmpty = (raw) => raw === null || (typeof raw === "string" && raw.trim() === "");
const isPlainObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

// partial = true en PATCH: los campos que no vienen no son obligatorios
function validateBody(schema, body, { partial = false } = {}) {
  if (!isPlainObject(body)) return { value: {}, errors: { body: "Body must be a JSON object" } };

  const value = {};
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const raw = body[field];
    if (raw === undefined && partial) continue;
    if (raw === undefined || isEmpty(raw)) {
      errors[field] = `${field} is required`;
      continue;
    }
    const result = checkField(field, rule, raw);
    if (result.error) errors[field] = result.error;
    else value[field] = result.value;
  }

  if (partial && Object.keys(value).length === 0 && Object.keys(errors).length === 0) {
    errors.body = `Send at least one of: ${Object.keys(schema).join(", ")}`;
  }
  return { value, errors: Object.keys(errors).length ? errors : null };
}

// En la query todo es opcional; los parametros desconocidos se ignoran
function validateQuery(schema, query) {
  const value = {};
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const raw = query[field];
    if (raw === undefined || raw === "") continue;
    const result = checkField(field, rule, raw);
    if (result.error) errors[field] = result.error;
    else value[field] = result.value;
  }
  return { value, errors };
}

module.exports = { validateBody, validateQuery };
