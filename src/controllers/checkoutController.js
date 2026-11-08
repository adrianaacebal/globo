// Logica del flujo de pedido de la web: /order, /order/total y /orders (historial del usuario conectado)
const store = require("../data/store");
const { userFromRequest } = require("../sessions");
const { ORDER_TYPES } = require("../constants");
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

  // 2) Despues, el descuento sobre comida + envio. Vale un cupon activo de /api/coupons
  //    (si es para ese tipo de pedido) o el codigo de bienvenida del propio usuario (10%)
  let discount = 0;
  let discountError;
  let usedWelcomeCode = false;
  if (discountCode) {
    const code = String(discountCode).trim().toUpperCase();
    const coupon = store.coupons.find(
      (c) => c.code === code && c.active && (c.orderType === "all" || c.orderType === type)
    );
    if (coupon) {
      discount = ((subtotal + deliveryFee) * coupon.percent) / 100;
    } else if (isValidCode(code, user)) {
      discount = ((subtotal + deliveryFee) * DISCOUNT_PERCENT) / 100;
      usedWelcomeCode = true;
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
    usedWelcomeCode,
  };
}

// POST /order/total — solo calcula, no guarda nada (el login es opcional: hace falta para el codigo)
function calculateTotal(req, res) {
  const price = computePrice(req.body, userFromRequest(req));
  if (price.error) return res.status(price.status).json({ error: price.error });
  const { usedWelcomeCode, ...breakdown } = price;
  res.json(breakdown);
}

// POST /orders — confirma el pedido y lo guarda en el historial (requireUser va antes).
// Hay que volver a escribir la contrasena.
function saveOrder(req, res) {
  const user = req.user;
  const { password, restaurant, location, type, items, payment } = req.body;
  if (password !== user.password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const price = computePrice(req.body, user);
  if (price.error) return res.status(price.status).json({ error: price.error });

  const order = {
    id: Date.now(),
    date: new Date().toISOString(),
    restaurant,
    location,
    type,
    payment,
    items: items.map(({ dish, quantity }) => ({ dish, quantity: Number(quantity) })),
    subtotal: price.subtotal,
    discount: price.discount,
    deliveryFee: price.deliveryFee,
    deliveryFeePercent: price.deliveryFeePercent,
    total: price.total,
  };

  store.users.update(user.id, {
    orders: [...(user.orders || []), order],
    // El codigo de bienvenida solo vale una vez (los cupones se pueden repetir)
    discountUsed: Boolean(user.discountUsed || price.usedWelcomeCode),
  });

  // Tambien se guarda en el recurso /api/orders para poder gestionarlo (estado, repartidor...)
  const brand = brandKeyFromName(restaurant);
  const local = store.restaurants.find((r) => r.brand === brand && normalize(r.area) === normalize(location));
  if (local) {
    store.orders.create({
      customer: user.name,
      restaurantId: local.id,
      riderId: null,
      type: pickOption(ORDER_TYPES, type) || "delivery",
      status: "pending",
      total: price.total,
      paid: payment === "card",
    });
  }

  res.status(201).json({ message: "Order placed", order });
}

// GET /orders — historial del usuario conectado (el mas nuevo primero)
function listOrders(req, res) {
  res.json((req.user.orders || []).slice().reverse());
}

module.exports = { createOrder, calculateTotal, saveOrder, listOrders };
