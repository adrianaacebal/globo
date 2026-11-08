// Validacion comun de body y query (la usan los validators de cada recurso). Devuelve TODOS los errores a la vez: { value, errors }
// - value: solo los campos conocidos y ya limpios (los desconocidos y el id se ignoran)
// - errors: { campo: "mensaje" } o null si todo esta bien
const { pickOption, round2 } = require("../utils");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
    if (rule.integer && !Number.isInteger(n)) return { error: `${field} must be a whole number` };
    if (n < rule.min || n > rule.max) return { error: `${field} must be between ${rule.min} and ${rule.max}` };
    return { value: rule.decimals !== undefined ? round2(n) : n };
  }

  if (rule.type === "option") {
    const option = typeof raw === "string" ? pickOption(rule.options, raw) : undefined;
    if (!option) return { error: `${field} must be one of: ${rule.options.join(", ")}` };
    return { value: option };
  }

  // Email: se guarda en minusculas para que Ana@Mail.com y ana@mail.com sean el mismo
  if (rule.type === "email") {
    const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (email.length > 100 || !EMAIL_RE.test(email)) return { error: `${field} must be a valid email` };
    return { value: email };
  }

  // Fecha "AAAA-MM-DD" (lo que manda <input type="date">). notFuture: no puede ser despues de hoy
  if (rule.type === "date") {
    const text = typeof raw === "string" ? raw.trim() : "";
    const date = new Date(text + "T00:00:00Z");
    if (!DATE_RE.test(text) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
      return { error: `${field} must be a date like 2026-11-08` };
    }
    if (rule.notFuture && text > new Date().toISOString().slice(0, 10)) {
      return { error: `${field} cannot be in the future` };
    }
    return { value: text };
  }

  throw new Error(`Unknown rule type ${rule.type}`);
}

const isEmpty = (raw) => raw === null || (typeof raw === "string" && raw.trim() === "");
const isPlainObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

// partial = true en PATCH: los campos que no vienen no son obligatorios
// rule.default: si el campo no llega en POST/PUT se usa ese valor (p. ej. status "open")
function validateBody(schema, body, { partial = false } = {}) {
  if (!isPlainObject(body)) return { value: {}, errors: { body: "Body must be a JSON object" } };

  const value = {};
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const raw = body[field];
    if (raw === undefined && partial) continue;
    if ((raw === undefined || isEmpty(raw)) && rule.default !== undefined) {
      value[field] = rule.default;
      continue;
    }
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
