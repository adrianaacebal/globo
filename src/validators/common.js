// Validacion comun de body y query (la usan los validators de cada recurso).
// Devuelve TODOS los problemas a la vez: { valid, value, errors }
// - valid:  true si no hay ningun error
// - value:  solo los campos conocidos y ya limpios (los desconocidos y el id se ignoran)
// - errors: [ { field, message }, ... ]  (vacio si todo esta bien)
//
// Tipos de regla: text (min, max, uppercase) · number (min, max, integer, decimals)
//                 boolean · option (options) · email · date (notFuture)
// Cualquier regla puede llevar optional: true, o default: valor (se usa si el campo no llega en POST/PUT)
const { pickOption, round2 } = require("../utils");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------- Reglas por tipo de campo ----------
// Devuelve { value } si el dato es correcto o { error: "mensaje" } si no
function checkField(field, rule, raw, { fromQuery = false } = {}) {
  if (Array.isArray(raw)) return { error: `${field} must be a single value` };

  if (rule.type === "text") {
    if (typeof raw !== "string") return { error: `${field} must be text` };
    const text = raw.trim();
    if (text.length < rule.min || text.length > rule.max) {
      return { error: `${field} must be between ${rule.min} and ${rule.max} characters` };
    }
    return { value: rule.uppercase ? text.toUpperCase() : text };
  }

  if (rule.type === "number") {
    // Se aceptan numeros y textos numericos ("7.5"), porque los formularios mandan texto
    const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return { error: `${field} must be a number` };
    if (rule.integer && !Number.isInteger(n)) return { error: `${field} must be a whole number` };
    if (n < rule.min || n > rule.max) return { error: `${field} must be between ${rule.min} and ${rule.max}` };
    return { value: rule.decimals !== undefined ? round2(n) : n };
  }

  if (rule.type === "boolean") {
    // En el body solo vale true o false. En la query todo llega como texto: "true" / "false"
    if (typeof raw === "boolean") return { value: raw };
    if (fromQuery && (raw === "true" || raw === "false")) return { value: raw === "true" };
    return { error: `${field} must be true or false` };
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

const isEmpty = (raw) => raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "");
const isPlainObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const result = (value, errors) => ({ valid: errors.length === 0, value, errors });

// partial = true en PATCH: los campos que no vienen no son obligatorios
function validateBody(schema, body, { partial = false } = {}) {
  if (!isPlainObject(body)) return result({}, [{ field: "body", message: "Body must be a JSON object" }]);

  const value = {};
  const errors = [];
  for (const [field, rule] of Object.entries(schema)) {
    const raw = body[field];
    if (raw === undefined && partial) continue;
    if (isEmpty(raw)) {
      // Un campo opcional vacio se guarda como null (p. ej. un pedido para recoger no tiene repartidor)
      if (rule.default !== undefined) value[field] = rule.default;   // p. ej. status "open"
      else if (rule.optional) value[field] = null;
      else errors.push({ field, message: `${field} is required` });
      continue;
    }
    const check = checkField(field, rule, raw);
    if (check.error) errors.push({ field, message: check.error });
    else value[field] = check.value;
  }

  if (partial && Object.keys(value).length === 0 && errors.length === 0) {
    errors.push({ field: "body", message: `Send at least one of: ${Object.keys(schema).join(", ")}` });
  }
  return result(value, errors);
}

// En la query todo es opcional; los parametros desconocidos se ignoran
function validateQuery(schema, query) {
  const value = {};
  const errors = [];
  for (const [field, rule] of Object.entries(schema)) {
    const raw = query[field];
    if (raw === undefined || raw === "") continue;
    const check = checkField(field, rule, raw, { fromQuery: true });
    if (check.error) errors.push({ field, message: check.error });
    else value[field] = check.value;
  }
  return result(value, errors);
}

module.exports = { validateBody, validateQuery };
