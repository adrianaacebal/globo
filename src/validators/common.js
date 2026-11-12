// =====================================================================================
// common.js  ->  VALIDACION COMUN (el "motor" que usan todos los validators)
// =====================================================================================
//
// ¿Que es validar?
//   Cuando alguien manda datos al servidor (por ejemplo, al rellenar un formulario o
//   desde Postman), el servidor NO se puede fiar de ellos. Validar es comprobar que los
//   datos tienen la forma correcta ANTES de guardarlos: que el nombre no este vacio,
//   que el precio sea un numero, que la marca sea una de las que existen, etc.
//
// ¿Por que no basta con la validacion del navegador (required, min, max en el HTML)?
//   Porque el navegador esta en manos del usuario: se puede saltar quitando atributos con
//   las herramientas de desarrollador, o mandando la peticion directamente con Postman,
//   curl o fetch, sin pasar por el formulario. Por eso el servidor SIEMPRE vuelve a validar.
//   La validacion del navegador es para comodidad del usuario; la del servidor es la de verdad.
//
// ¿De donde llegan los datos? (en Express)
//   - req.body  -> los datos que se envian en el "cuerpo" de la peticion, en formato JSON.
//                  Se usa al CREAR (POST), REEMPLAZAR (PUT) o MODIFICAR (PATCH).
//                  Ej.: { "name": "Whopper", "price": 7.5 }
//   - req.query -> los parametros que van en la URL despues del "?". Se usan en GET para
//                  FILTRAR. Ej.: /api/dishes?brand=telepizza&maxPrice=10
//                  Ojo: en la query TODO llega como texto ("10", "true"), nunca como numero.
//
// ¿Que es un "schema" (esquema)?
//   Es un objeto JavaScript que describe como debe ser cada campo: su tipo y sus limites.
//   Cada recurso (dishes, orders, riders...) tiene el suyo en su archivo xxxValidator.js.
//   Ejemplo:  { name: { type: "text", min: 2, max: 60 }, price: { type: "number", min: 0.1, max: 500 } }
//   Este archivo recorre el schema campo a campo y comprueba los datos recibidos.
//
// Validacion comun de body y query (la usan los validators de cada recurso).
// Devuelve TODOS los problemas a la vez: { valid, value, errors }
// - valid:  true si no hay ningun error
// - value:  solo los campos conocidos y ya limpios (los desconocidos y el id se ignoran)
// - errors: [ { field, message }, ... ]  (vacio si todo esta bien)
//
// ¿Por que se devuelven TODOS los errores a la vez y no solo el primero?
//   Para que el usuario pueda corregir todo de una vez. Si solo dijeramos el primer error,
//   tendria que enviar el formulario muchas veces, descubriendo los fallos de uno en uno.
//
// ¿Que hace el controlador con este resultado?
//   Si valid es false, responde con el codigo HTTP 400 ("Bad Request" = peticion incorrecta,
//   el fallo es del cliente) y manda la lista de errores en JSON: res.status(400).json({ errors }).
//   Si valid es true, guarda "value" (los datos ya limpios), NUNCA req.body tal cual.
//
// ¿Por que se ignoran los campos desconocidos y el id?
//   - Solo se copian a "value" los campos que aparecen en el schema. Si alguien manda un campo
//     inventado (por ejemplo "admin": true) simplemente se descarta y no llega a guardarse.
//   - El id NO esta en ningun schema a proposito: lo pone el servidor al crear (el store) y
//     va en la URL (/api/dishes/5). Asi nadie puede cambiar el id de un elemento desde el body.
//
// Tipos de regla: text (min, max, uppercase) · number (min, max, integer, decimals)
//                 boolean · option (options) · email · date (notFuture)
// Cualquier regla puede llevar optional: true, o default: valor (se usa si el campo no llega en POST/PUT)
//
// Resumen de cada tipo y sus opciones:
//   - text:    texto. min/max = numero minimo y maximo de caracteres (se quitan antes los
//              espacios del principio y del final). uppercase: true = se guarda en MAYUSCULAS.
//   - number:  numero. min/max = valor minimo y maximo permitido. integer: true = tiene que
//              ser entero (sin decimales). decimals = el valor se redondea con round2 (a 2 decimales
//              como mucho), para evitar cosas como 7.499999999.
//   - boolean: verdadero o falso (true / false).
//   - option:  tiene que ser uno de los valores de una lista fija (options), por ejemplo las
//              marcas o las areas, que vienen de src/constants.js.
//   - email:   un correo con forma valida (algo@algo.algo), maximo 100 caracteres.
//   - date:    una fecha con formato "AAAA-MM-DD". notFuture: true = no puede ser posterior a hoy.
//   - optional: true  -> el campo puede no enviarse; entonces se guarda como null.
//   - default: valor  -> si el campo no se envia, se guarda ese valor (p. ej. status "open").
//
// Importamos dos funciones de ayuda de src/utils.js:
//   - pickOption: busca un valor en una lista sin importar mayusculas ni tildes
//                 ("chamberi" -> "Chamberí") y devuelve el valor "oficial" de la lista.
//   - round2: redondea un numero a 2 decimales.
const { pickOption, round2 } = require("../utils");

// Expresiones regulares (patrones de texto) para comprobar formatos:
// EMAIL_RE: algo sin espacios + "@" + algo + "." + algo   (ej.: ana@mail.com)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// DATE_RE: 4 cifras - 2 cifras - 2 cifras   (ej.: 2026-11-08)
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------- Reglas por tipo de campo ----------
// Devuelve { value } si el dato es correcto o { error: "mensaje" } si no
// Parametros:
//   - field: el nombre del campo (p. ej. "price"), para poder escribir el mensaje de error
//   - rule:  la regla del schema para ese campo (p. ej. { type: "number", min: 0.1, max: 500 })
//   - raw:   el valor "en bruto", tal y como ha llegado del cliente
//   - fromQuery: true si el dato viene de la URL (req.query), donde todo es texto
// Los mensajes de error estan en ingles porque es el idioma de la API (los tests los comprueban).
function checkField(field, rule, raw, { fromQuery = false } = {}) {
  // Si en la URL se repite un parametro (?brand=a&brand=b), Express lo convierte en una lista.
  // No lo permitimos: cada campo tiene que tener un unico valor.
  if (Array.isArray(raw)) return { error: `${field} must be a single value` };

  // ----- TEXTO -----
  if (rule.type === "text") {
    // Tiene que ser un string (no un numero, ni un objeto...)
    if (typeof raw !== "string") return { error: `${field} must be text` };
    // trim() quita los espacios del principio y del final: "  Ana " -> "Ana"
    const text = raw.trim();
    // Comprobamos la longitud minima y maxima
    if (text.length < rule.min || text.length > rule.max) {
      return { error: `${field} must be between ${rule.min} and ${rule.max} characters` };
    }
    // Si la regla dice uppercase, lo pasamos a mayusculas (lo usan los codigos de cupon)
    return { value: rule.uppercase ? text.toUpperCase() : text };
  }

  // ----- NUMERO -----
  if (rule.type === "number") {
    // Se aceptan numeros y textos numericos ("7.5"), porque los formularios mandan texto
    // Si llega un numero se usa tal cual; si llega un texto no vacio se convierte con Number();
    // cualquier otra cosa se convierte en NaN ("Not a Number" = no es un numero).
    const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
    // Number.isFinite descarta NaN e Infinity: "abc" no es un numero valido
    if (!Number.isFinite(n)) return { error: `${field} must be a number` };
    // integer: true -> no se permiten decimales (p. ej. 4.5 estrellas no vale si es entero)
    if (rule.integer && !Number.isInteger(n)) return { error: `${field} must be a whole number` };
    // Comprobamos que este dentro del rango [min, max]
    if (n < rule.min || n > rule.max) return { error: `${field} must be between ${rule.min} and ${rule.max}` };
    // Si la regla tiene "decimals", redondeamos con round2 (2 decimales como mucho)
    return { value: rule.decimals !== undefined ? round2(n) : n };
  }

  // ----- BOOLEANO (verdadero / falso) -----
  if (rule.type === "boolean") {
    // En el body solo vale true o false. En la query todo llega como texto: "true" / "false"
    // Por eso en la query convertimos el texto "true" en el booleano true (y "false" en false).
    // En el body NO aceptamos "true" como texto: el JSON ya permite mandar true de verdad.
    if (typeof raw === "boolean") return { value: raw };
    if (fromQuery && (raw === "true" || raw === "false")) return { value: raw === "true" };
    return { error: `${field} must be true or false` };
  }

  // ----- OPCION de una lista fija -----
  if (rule.type === "option") {
    // pickOption busca el valor en la lista ignorando mayusculas y tildes,
    // y devuelve la version "oficial" (p. ej. "CHAMBERI" -> "Chamberí").
    // Si no esta en la lista, devuelve undefined y damos error.
    const option = typeof raw === "string" ? pickOption(rule.options, raw) : undefined;
    // El mensaje de error dice que valores estan permitidos, para ayudar al usuario
    if (!option) return { error: `${field} must be one of: ${rule.options.join(", ")}` };
    return { value: option };
  }

  // ----- EMAIL -----
  // Email: se guarda en minusculas para que Ana@Mail.com y ana@mail.com sean el mismo
  if (rule.type === "email") {
    const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    // Maximo 100 caracteres y que cumpla el patron EMAIL_RE
    if (email.length > 100 || !EMAIL_RE.test(email)) return { error: `${field} must be a valid email` };
    return { value: email };
  }

  // ----- FECHA -----
  // Fecha "AAAA-MM-DD" (lo que manda <input type="date">). notFuture: no puede ser despues de hoy
  if (rule.type === "date") {
    const text = typeof raw === "string" ? raw.trim() : "";
    // Creamos una fecha de JavaScript a partir del texto (a las 00:00 en hora UTC)
    const date = new Date(text + "T00:00:00Z");
    // Tres comprobaciones:
    //  1) que tenga el formato AAAA-MM-DD (DATE_RE)
    //  2) que JavaScript la entienda como fecha (si no, getTime() da NaN)
    //  3) que sea una fecha que existe de verdad: "2026-02-30" se convertiria en otro dia,
    //     asi que al volver a pasarla a texto ya no coincide con lo que se envio
    if (!DATE_RE.test(text) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
      return { error: `${field} must be a date like 2026-11-08` };
    }
    // notFuture: comparamos con la fecha de hoy (como los dos textos son AAAA-MM-DD,
    // compararlos como texto funciona igual que compararlos como fechas)
    if (rule.notFuture && text > new Date().toISOString().slice(0, 10)) {
      return { error: `${field} cannot be in the future` };
    }
    return { value: text };
  }

  // Si un schema usa un tipo que no existe, es un fallo del programador (no del usuario),
  // asi que lanzamos un error para darnos cuenta enseguida.
  throw new Error(`Unknown rule type ${rule.type}`);
}

// ---------- Pequenas funciones de ayuda ----------
// isEmpty: el campo "no ha llegado" si es undefined, null o un texto solo con espacios
const isEmpty = (raw) => raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "");
// isPlainObject: comprueba que el body sea un objeto JSON normal { ... } (no una lista, ni null)
const isPlainObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
// result: construye la respuesta { valid, value, errors }; valid es true si no hay errores
const result = (value, errors) => ({ valid: errors.length === 0, value, errors });

// ---------- Validar el BODY (POST, PUT y PATCH) ----------
// Recibe el schema del recurso, el req.body y las opciones.
//   - POST  (crear)      y PUT (reemplazar entero): partial = false -> todos los campos
//     obligatorios tienen que llegar.
//   - PATCH (modificar solo una parte): partial = true -> solo se validan los campos que
//     llegan; los que no vienen se dejan como estaban. Ej.: PATCH { "price": 9 } solo cambia el precio.
// partial = true en PATCH: los campos que no vienen no son obligatorios
function validateBody(schema, body, { partial = false } = {}) {
  // Si el body no es un objeto JSON (p. ej. una lista o nada), no seguimos
  if (!isPlainObject(body)) return result({}, [{ field: "body", message: "Body must be a JSON object" }]);

  // value: aqui iremos guardando los datos ya limpios
  const value = {};
  // errors: aqui iremos acumulando TODOS los errores (no paramos en el primero)
  const errors = [];
  // Recorremos cada campo DEL SCHEMA (no del body): asi los campos desconocidos y el id
  // nunca se miran ni se copian a value.
  for (const [field, rule] of Object.entries(schema)) {
    const raw = body[field];
    // En PATCH, si el campo no viene, lo saltamos (no es obligatorio)
    if (raw === undefined && partial) continue;
    // Si el campo esta vacio decidimos que hacer segun la regla:
    if (isEmpty(raw)) {
      // Un campo opcional vacio se guarda como null (p. ej. un pedido para recoger no tiene repartidor)
      // 1) si tiene valor por defecto, se usa ese valor
      // 2) si es opcional, se guarda null
      // 3) si no, es obligatorio y se anade el error "... is required"
      if (rule.default !== undefined) value[field] = rule.default;   // p. ej. status "open"
      else if (rule.optional) value[field] = null;
      else errors.push({ field, message: `${field} is required` });
      continue;
    }
    // Si el campo tiene valor, comprobamos su tipo y limites con checkField
    const check = checkField(field, rule, raw);
    // Si hay error lo apuntamos; si no, guardamos el valor limpio
    if (check.error) errors.push({ field, message: check.error });
    else value[field] = check.value;
  }

  // En PATCH hay que mandar al menos UN campo valido: un PATCH vacio {} no tiene sentido
  if (partial && Object.keys(value).length === 0 && errors.length === 0) {
    errors.push({ field: "body", message: `Send at least one of: ${Object.keys(schema).join(", ")}` });
  }
  return result(value, errors);
}

// ---------- Validar la QUERY (filtros de GET /api/...?) ----------
// Se usa en los GET de listado y de estadisticas (/stats). Ej.: GET /api/riders?area=Retiro&available=true
// En la query todo es opcional; los parametros desconocidos se ignoran
// (si no mandas ningun filtro, se devuelve la lista entera)
function validateQuery(schema, query) {
  const value = {};
  const errors = [];
  for (const [field, rule] of Object.entries(schema)) {
    const raw = query[field];
    // Si el filtro no viene (o viene vacio, ?brand=), simplemente no se filtra por el
    if (raw === undefined || raw === "") continue;
    // fromQuery: true para que "true"/"false" (texto) se acepten como booleanos
    const check = checkField(field, rule, raw, { fromQuery: true });
    if (check.error) errors.push({ field, message: check.error });
    else value[field] = check.value;
  }
  return result(value, errors);
}

// Exportamos las dos funciones para que los validators de cada recurso puedan usarlas
module.exports = { validateBody, validateQuery };
