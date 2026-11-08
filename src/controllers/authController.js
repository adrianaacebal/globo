// Logica de /login
const store = require("../store");
const { newSession } = require("../sessions");
const { DISCOUNT_PERCENT, newDiscountCode } = require("../pricing");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Errores del registro, todos a la vez
function registrationErrors({ name, email, password }) {
  const errors = {};
  if (!name) errors.name = "name is required";
  else if (name.length > 60) errors.name = "name must be at most 60 characters";
  if (!email) errors.email = "email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "email is not valid";
  if (!password) errors.password = "password is required";
  else if (password.length < 6) errors.password = "password must be at least 6 characters";
  return Object.keys(errors).length ? errors : null;
}

// POST /login — si el email existe comprueba nombre y contrasena; si no, registra al usuario nuevo
function login(req, res) {
  const name = String(req.body.name ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  // El email no distingue mayusculas (Ana@Mail.com es el mismo que ana@mail.com)
  const user = email ? store.users.find((u) => u.email.toLowerCase() === email) : null;

  if (user) {
    const sameName = user.name.trim().toLowerCase() === name.toLowerCase();
    if (!sameName || user.password !== password) {
      return res.status(401).json({ error: "This email is already registered. Incorrect name or password" });
    }
    // Si todavia no ha usado su codigo de bienvenida, se le vuelve a dar
    const pending = user.discountCode && !user.discountUsed;
    return res.json({
      name: user.name,
      email: user.email,
      token: newSession(user),
      discountCode: pending ? user.discountCode : undefined,
      discountPercent: pending ? DISCOUNT_PERCENT : undefined,
    });
  }

  const errors = registrationErrors({ name, email, password });
  if (errors) {
    return res.status(400).json({ error: Object.values(errors).join(". "), errors });
  }

  // Primera vez: se crea la cuenta y se le regala un codigo de descuento
  const newUser = store.users.create({
    name,
    email,
    password,
    discountCode: newDiscountCode(),
    discountUsed: false,
  });
  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
    token: newSession(newUser),
    firstTime: true,
    discountCode: newUser.discountCode,
    discountPercent: DISCOUNT_PERCENT,
  });
}

module.exports = { login };
