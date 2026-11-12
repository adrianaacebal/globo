// =====================================================================================
// CONTROLADOR DE LOGIN Y REGISTRO (authController.js)
// =====================================================================================
// Logica de /login
//
// La pagina login.html manda un formulario con nombre, email y contrasena a POST /login.
// Este mismo endpoint sirve para DOS cosas:
//   - LOGIN (iniciar sesion): si el email YA esta registrado, se comprueba que el nombre y la
//     contrasena coinciden con los guardados.
//   - REGISTRO (crear cuenta): si el email NO existe todavia, se crea un usuario nuevo.
//
// En los dos casos la respuesta incluye un TOKEN: un texto aleatorio (lo crea sessions.js)
// que funciona como un "pase" o "pulsera". El navegador lo guarda y lo manda en las siguientes
// peticiones (cabecera Authorization: Bearer <token>) para demostrar quien es sin tener que
// mandar la contrasena cada vez. El middleware requireUser usa ese token para saber quien pide.
//
// Ademas, a cada usuario nuevo se le regala un CODIGO DE DESCUENTO DE BIENVENIDA
// (ej: "GLOBO-3F9A1C", un 10%) que puede usar UNA sola vez al hacer un pedido.
//
// Los usuarios se guardan con store.users, que ademas escribe data/users.json para no
// perderlos si se reinicia el servidor.
// =====================================================================================
// store = capa de datos (aqui usamos store.users)
const store = require("../data/store");
// newSession(usuario) crea un token nuevo y lo apunta en memoria asociado al email del usuario
const { newSession } = require("../sessions");
// DISCOUNT_PERCENT = 10 (% del codigo de bienvenida) · newDiscountCode() genera "GLOBO-XXXXXX"
const { DISCOUNT_PERCENT, newDiscountCode } = require("../pricing");

// Expresion regular (patron) para comprobar que un email tiene forma "algo@algo.algo"
// (sin espacios y con una @ y un punto despues)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Funcion auxiliar: comprueba los datos del registro.
// Errores del registro, todos a la vez
// (asi el usuario ve todos los fallos juntos y no uno por uno).
// Devuelve un objeto { campo: "mensaje" } si hay errores, o null si todo esta bien.
function registrationErrors({ name, email, password }) {
  const errors = {};
  // Nombre obligatorio y como maximo 60 letras
  if (!name) errors.name = "name is required";
  else if (name.length > 60) errors.name = "name must be at most 60 characters";
  // Email obligatorio y con formato valido
  if (!email) errors.email = "email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "email is not valid";
  // Contrasena obligatoria y de al menos 6 caracteres
  if (!password) errors.password = "password is required";
  else if (password.length < 6) errors.password = "password must be at least 6 characters";
  // Object.keys(errors).length es el numero de errores: si hay alguno devolvemos el objeto
  return Object.keys(errors).length ? errors : null;
}

// -------------------------------------------------------------------------------------
// POST /login — si el email existe comprueba nombre y contrasena; si no, registra al usuario nuevo
// Operacion: iniciar sesion (login) o crear cuenta (registro).
//   Body: { "name": "Ana", "email": "ana@mail.com", "password": "secreto" }
// Respuestas:
//   200 -> login correcto: { name, email, token } (+ discountCode y discountPercent si aun
//          no ha usado su codigo de bienvenida)
//   201 -> registro correcto (usuario creado): { name, email, token, firstTime: true,
//          discountCode, discountPercent }
//   400 -> registro con datos no validos (falta el nombre, email mal escrito, contrasena corta...)
//   401 -> el email ya existe pero el nombre o la contrasena no coinciden
// -------------------------------------------------------------------------------------
function login(req, res) {
  // Leemos los datos del body. "?? ''" pone texto vacio si el campo no llega,
  // y String(...) asegura que es texto. trim() quita espacios al principio y al final.
  const name = String(req.body.name ?? "").trim();
  // El email se pasa a minusculas para guardarlo y compararlo siempre igual
  const email = String(req.body.email ?? "").trim().toLowerCase();
  // La contrasena NO se recorta ni se pasa a minusculas: tiene que ser exacta
  const password = String(req.body.password ?? "");

  // Buscamos si ya hay un usuario con ese email.
  // El email no distingue mayusculas (Ana@Mail.com es el mismo que ana@mail.com)
  // Si no han mandado email, no buscamos (user = null).
  const user = email ? store.users.find((u) => u.email.toLowerCase() === email) : null;

  // ---------- CASO 1: LOGIN (el email ya esta registrado) ----------
  if (user) {
    // El nombre tambien se compara sin importar mayusculas ("ana" = "Ana")
    const sameName = user.name.trim().toLowerCase() === name.toLowerCase();
    // Si el nombre o la contrasena no coinciden -> 401 Unauthorized (no autorizado).
    // "return" termina la funcion aqui para no seguir con el resto.
    if (!sameName || user.password !== password) {
      return res.status(401).json({ error: "This email is already registered. Incorrect name or password" });
    }
    // Si todavia no ha usado su codigo de bienvenida, se le vuelve a dar
    // (para que la web se lo pueda recordar).
    const pending = user.discountCode && !user.discountUsed;
    // Login correcto: res.json sin status -> 200 OK.
    // Los campos con valor undefined no aparecen en el JSON final.
    return res.json({
      name: user.name,
      email: user.email,
      // Token nuevo para esta sesion: el navegador lo mandara en las siguientes peticiones
      token: newSession(user),
      discountCode: pending ? user.discountCode : undefined,
      discountPercent: pending ? DISCOUNT_PERCENT : undefined,
    });
  }

  // ---------- CASO 2: REGISTRO (el email no existe) ----------
  // Antes de crear la cuenta comprobamos que los datos son validos
  const errors = registrationErrors({ name, email, password });
  if (errors) {
    // 400 Bad Request. "error" junta todos los mensajes en un texto (para mostrarlo en la web)
    // y "errors" los da separados por campo.
    return res.status(400).json({ error: Object.values(errors).join(". "), errors });
  }

  // Primera vez: se crea la cuenta y se le regala un codigo de descuento
  // store.users.create le pone un id y lo guarda (tambien en data/users.json).
  // (Nota: es un proyecto de practica y la contrasena se guarda tal cual; en una app real
  //  se guardaria cifrada con un "hash", por ejemplo con la libreria bcrypt.)
  const newUser = store.users.create({
    name,
    email,
    password,
    // Codigo de bienvenida unico, ej: "GLOBO-3F9A1C"
    discountCode: newDiscountCode(),
    // Todavia no lo ha usado (pasara a true cuando haga un pedido con el)
    discountUsed: false,
  });
  // 201 Created porque se ha creado un recurso nuevo (el usuario).
  // Devolvemos tambien el token, asi queda conectado directamente sin hacer login otra vez.
  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
    token: newSession(newUser),
    // firstTime: true le dice a la web que es un usuario nuevo (para darle la bienvenida)
    firstTime: true,
    discountCode: newUser.discountCode,
    discountPercent: DISCOUNT_PERCENT,
  });
}

// Exportamos login para que el router (src/routes/checkout.js) lo use en POST /login
module.exports = { login };
