// Logica del checkout: /order, /order/total y /orders (pedidos del usuario conectado).
// Los pedidos se guardan en la coleccion orders, la misma que gestiona /api/orders.
const store = require("../store");
const { userFromRequest } = require("../sessions");
const { ORDER_TYPES, AREAS, PAYMENTS } = require("../constants");
const { normalize, pickOption, brandKeyFromName, round2 } = require("../utils");
const { DISCOUNT_PERCENT, deliveryFeePercent, isValidCode } = require("../pricing");

// Respuesta 400 con todos los errores: "error" (texto para el cliente actual) + "errors" por campo
const badRequest = (res, errors) => res.status(400).json({ error: Object.values(errors).join(". "), errors });

// POST /order — comprueba que la marca tiene local en esa zona (requireUser va antes)
function createOrder(req, res) {
  const { name, email } = req.user;
  const { restaurant, location } = req.body;
  const type = pickOption(ORDER_TYPES, req.body.type);

  const errors = {};
  if (!restaurant) errors.restaurant = "Restaurant is required";
  if (!location) errors.location = "Location is required";
  if (!type) errors.type = `type must be one of: ${ORDER_TYPES.join(", ")}`;
  if (Object.keys(errors).length) return badRequest(res, errors);

  const brand = brandKeyFromName(restaurant);
  const brandLocals = brand ? store.restaurants.all().filter((r) => r.brand === brand) : [];
  if (brandLocals.length === 0) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const local = brandLocals.find((r) => normalize(r.area) === normalize(location));
  if (!local) {
    const allowed = [...new Set(brandLocals.map((r) => r.area))];
    return badRequest(res, {
      location: `The location ${location} does not exist for ${restaurant}. Available locations: ${allowed.join(", ")}`,
    });
  }

  res.status(201).json({ message: "Order created", order: { name, email, type, restaurant: local.name, area: local.area } });
}

// Calcula el precio de un pedido. Lo usan /order/total y /orders.
// Devuelve { status, error } si algo esta mal, o el desglose del precio.
function computePrice({ restaurant, items, type, travelMinutes, discountCode }, user) {
  const brand = brandKeyFromName(restaurant);
  if (!brand) return { status: 404, error: "Restaurant not found" };

  if (!Array.isArray(items) || items.length === 0) {
    return { status: 400, error: "Choose at least one dish" };
  }

  const menu = store.dishes.all().filter((d) => d.brand === brand);
  let subtotal = 0;
  for (const item of items) {
    const menuItem = menu.find((d) => d.name === item?.dish);
    if (!menuItem) return { status: 404, error: `Dish not found: ${item?.dish}` };

    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return { status: 400, error: "Quantity must be 1 or more" };
    }
    subtotal += menuItem.price * qty;
  }

  // 1) Envio a domicilio: % sobre el precio de la comida
  const feePercent = deliveryFeePercent(type, travelMinutes);
  const deliveryFee = (subtotal * feePercent) / 100;

  // 2) Despues, el codigo de bienvenida: 10% menos sobre comida + envio (solo el del propio usuario)
  let discount = 0;
  let discountError;
  if (discountCode) {
    if (isValidCode(discountCode, user)) {
      discount = ((subtotal + deliveryFee) * DISCOUNT_PERCENT) / 100;
    } else {
      discountError = "This discount code is not valid or has already been used";
    }
  }

  return {
    // Importes redondeados a centimos
    subtotal: round2(subtotal),
    discount: round2(discount),
    deliveryFee: round2(deliveryFee),
    deliveryFeePercent: feePercent,
    total: round2(subtotal + deliveryFee - discount),
    discountError,
  };
}

// POST /order/total — solo calcula, no guarda nada (el login es opcional: hace falta para el codigo)
function calculateTotal(req, res) {
  const price = computePrice(req.body, userFromRequest(req));
  if (price.error) return res.status(price.status).json({ error: price.error });
  res.json(price);
}

// POST /orders — confirma el pedido y lo guarda en el historial (requireUser va antes).
// Hay que volver a escribir la contrasena.
function saveOrder(req, res) {
  const user = req.user;
  const { password, restaurant, location, items } = req.body;
  if (password !== user.password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // Zona, tipo y forma de pago tienen que ser de las listas fijas (todos los errores a la vez)
  const area = pickOption(AREAS, location);
  const type = pickOption(ORDER_TYPES, req.body.type);
  const payment = pickOption(PAYMENTS, req.body.payment);
  const errors = {};
  if (!area) errors.location = `location must be one of: ${AREAS.join(", ")}`;
  if (!type) errors.type = `type must be one of: ${ORDER_TYPES.join(", ")}`;
  if (!payment) errors.payment = `payment must be one of: ${PAYMENTS.join(", ")}`;
  if (Object.keys(errors).length) return badRequest(res, errors);

  const price = computePrice({ ...req.body, type }, user);
  if (price.error) return res.status(price.status).json({ error: price.error });

  const order = store.orders.create({
    email: user.email,
    brand: brandKeyFromName(restaurant),
    area,
    type,
    payment,
    status: "pending",
    items: items.map(({ dish, quantity }) => ({ dish, quantity: Number(quantity) })),
    subtotal: price.subtotal,
    discount: price.discount,
    deliveryFee: price.deliveryFee,
    deliveryFeePercent: price.deliveryFeePercent,
    total: price.total,
    date: new Date().toISOString(),
    userId: user.id,
  });

  // El codigo de descuento solo vale una vez
  if (price.discount > 0) store.users.update(user.id, { discountUsed: true });

  res.status(201).json({ message: "Order placed", order });
}

// GET /orders — historial del usuario conectado (el mas nuevo primero)
function listOrders(req, res) {
  const mine = store.orders.all().filter((o) => o.userId === req.user.id);
  res.json(mine.reverse());
}

module.exports = { createOrder, calculateTotal, saveOrder, listOrders };
