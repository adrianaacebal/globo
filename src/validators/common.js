// Validacion comun de body y query (la usan los validators de cada recurso).
// Devuelve TODOS los problemas a la vez: { valid, value, errors }
// - valid:  true si no hay ningun error
// - value:  solo los campos conocidos y ya limpios (los desconocidos y el id se ignoran)
// - errors: [ { field, message }, ... ]  (vacio si todo esta bien)
//
// Tipos de regla: text (min, max, uppercase) · number (min, max, integer, decimals)
//                 boolean · option (options). Cualquier regla puede llevar optional: true
const { pickOption, round2 } = require("../utils");

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
      if (rule.optional) value[field] = null;
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
