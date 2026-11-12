// =====================================================================================
// CONTROLADOR DEL FLUJO DE PEDIDO DE LA WEB (checkoutController.js)
// =====================================================================================
// Logica del flujo de pedido de la web: /order, /order/total y /orders (historial del usuario conectado)
//
// Asi es el recorrido completo de un pedido en la web (order.html):
//   0) POST /login (authController.js): el usuario entra y recibe un token.
//   1) POST /order: el usuario elige restaurante, zona (location) y tipo (delivery = a domicilio,
//      pickup = recoger en el local). El servidor comprueba que esa marca tiene un local en esa zona.
//   2) POST /order/total: el usuario elige platos y cantidades (y si quiere, un codigo de
//      descuento). El servidor calcula el precio: subtotal, envio, descuento y total.
//      Solo calcula, no guarda nada. Se puede llamar tantas veces como se quiera.
//   3) POST /orders: el usuario confirma escribiendo otra vez su contrasena. El servidor vuelve
//      a calcular el precio, guarda el pedido en el historial del usuario y ademas lo da de alta
//      en /api/orders (para que se pueda gestionar: estado, repartidor...).
//   4) GET /orders: el usuario ve su historial de pedidos.
//
// ¿Por que el PRECIO se calcula en el SERVIDOR y no en el navegador?
//   Por SEGURIDAD. Todo lo que pasa en el navegador lo puede cambiar el usuario (por ejemplo
//   con las herramientas de desarrollador). Si el navegador mandara "total: 1 €", alguien podria
//   pagar menos. Por eso el navegador solo manda QUE platos quiere y CUANTOS, y el servidor busca
//   los precios en su propia carta (store.dishes) y hace las cuentas. Lo mismo con los descuentos:
//   el servidor comprueba que el codigo existe y que se puede usar.
//
// req.user: en las rutas protegidas (router.post("/order", requireUser, createOrder)) el
//   middleware requireUser se ejecuta ANTES del controlador. Lee el token de la cabecera
//   Authorization; si no hay token valido responde 401 y el controlador ni se ejecuta.
//   Si es valido, deja el usuario conectado en req.user.
// =====================================================================================
// store = capa de datos (restaurants, dishes, coupons, users, orders)
const store = require("../data/store");
// userFromRequest(req) devuelve el usuario del token, o null si no hay sesion
const { userFromRequest } = require("../sessions");
// ORDER_TYPES = ["delivery", "pickup"]
const { ORDER_TYPES } = require("../constants");
// normalize: comparar textos sin mayusculas/tildes · pickOption: busca en una lista fija y
// devuelve el valor oficial · brandKeyFromName: "Telepizza Gran Vía" -> "telepizza" ·
// round2: redondea a 2 decimales (centimos)
const { normalize, pickOption, brandKeyFromName, round2 } = require("../utils");
// Reglas de precio (pricing.js): DISCOUNT_PERCENT (10% del codigo de bienvenida),
// deliveryFeePercent (% de envio) e isValidCode (si el codigo de bienvenida se puede usar)
const { DISCOUNT_PERCENT, deliveryFeePercent, isValidCode } = require("../pricing");

// Respuesta 400 con todos los errores: "error" (texto para el cliente actual) + "errors" por campo
// Ej: { error: "Restaurant is required. Location is required", errors: { restaurant: ..., location: ... } }
const badRequest = (res, errors) => res.status(400).json({ error: Object.values(errors).join(". "), errors });

// -------------------------------------------------------------------------------------
// POST /order — comprueba que la marca tiene local en esa zona (requireUser va antes)
// Operacion: PASO 1 del pedido. Comprueba restaurante + zona + tipo. No guarda nada.
//   Body: { "restaurant": "Telepizza", "location": "Chamberí", "type": "delivery" }
// Respuestas:
//   201 -> { message: "Order created", order: { name, email, type, restaurant, area } }
//   400 -> falta algun dato, el tipo no es valido, o esa marca no tiene local en esa zona
//   401 -> no ha hecho login (lo responde requireUser)
//   404 -> no existe ningun restaurante de esa marca
// -------------------------------------------------------------------------------------
function createOrder(req, res) {
  // Datos del usuario conectado (los ha puesto requireUser en req.user)
  const { name, email } = req.user;
  // Datos que manda el formulario
  const { restaurant, location } = req.body;
  // pickOption acepta "Delivery", "DELIVERY"... y devuelve "delivery"; si no vale, undefined
  const type = pickOption(ORDER_TYPES, req.body.type);

  // Juntamos todos los errores en un objeto para responderlos todos a la vez
  const errors = {};
  if (!restaurant) errors.restaurant = "Restaurant is required";
  if (!location) errors.location = "Location is required";
  if (!type) errors.type = `type must be one of: ${ORDER_TYPES.join(", ")}`;
  // Si hay algun error -> 400 (con return para no seguir)
  if (Object.keys(errors).length) return badRequest(res, errors);

  // Sacamos la marca del nombre ("Telepizza Gran Vía" -> "telepizza")
  const brand = brandKeyFromName(restaurant);
  // Todos los locales de esa marca (si la marca no se reconoce, lista vacia)
  const brandLocals = brand ? store.restaurants.all().filter((r) => r.brand === brand) : [];
  // Ningun local de esa marca -> 404 Not Found
  if (brandLocals.length === 0) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  // Buscamos el local de esa marca que esta en la zona pedida (sin importar tildes/mayusculas)
  const local = brandLocals.find((r) => normalize(r.area) === normalize(location));
  if (!local) {
    // La marca existe pero no en esa zona: 400 y le decimos las zonas disponibles.
    // new Set(...) quita las zonas repetidas.
    const allowed = [...new Set(brandLocals.map((r) => r.area))];
    return badRequest(res, {
      location: `The location ${location} does not exist for ${restaurant}. Available locations: ${allowed.join(", ")}`,
    });
  }

  // Todo correcto: 201 con los datos del pedido ya "oficiales" (nombre y zona tal y como estan guardados)
  res.status(201).json({ message: "Order created", order: { name, email, type, restaurant: local.name, area: local.area } });
}

// -------------------------------------------------------------------------------------
// Funcion auxiliar (NO es un endpoint).
// Calcula el precio de un pedido. Lo usan /order/total y /orders.
// Devuelve { status, error } si algo esta mal, o el desglose del precio.
//
// Recibe los datos del body: restaurant, items (lista de { dish, quantity }), type,
// travelMinutes (minutos que tarda la moto) y discountCode; y el usuario (o null).
//
// Formula:  subtotal   = suma de (precio del plato en la carta x cantidad)
//           envio      = subtotal x % de envio (0% si es para recoger, 5% o 7% a domicilio)
//           descuento  = (subtotal + envio) x % del cupon o del codigo de bienvenida
//           total      = subtotal + envio - descuento     (todo redondeado a centimos)
// -------------------------------------------------------------------------------------
function computePrice({ restaurant, items, type, travelMinutes, discountCode }, user) {
  // La marca tiene que existir; si no, error 404
  const brand = brandKeyFromName(restaurant);
  if (!brand) return { status: 404, error: "Restaurant not found" };

  // items tiene que ser una lista con al menos un plato; si no, error 400
  if (!Array.isArray(items) || items.length === 0) {
    return { status: 400, error: "Choose at least one dish" };
  }

  // La carta de esa marca (los precios salen de AQUI, del servidor, nunca del navegador)
  const menu = store.dishes.all().filter((d) => d.brand === brand);
  // ---- SUBTOTAL: precio de la comida ----
  let subtotal = 0;
  for (const item of items) {
    // Buscamos el plato por su nombre en la carta. item?.dish evita un fallo si item es null
    const menuItem = menu.find((d) => d.name === item?.dish);
    // Si el plato no esta en la carta de ese restaurante -> 404
    if (!menuItem) return { status: 404, error: `Dish not found: ${item?.dish}` };

    // La cantidad tiene que ser un numero entero de 1 o mas (no vale 0, -2 ni 1.5) -> si no, 400
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return { status: 400, error: "Quantity must be 1 or more" };
    }
    // Sumamos precio x cantidad
    subtotal += menuItem.price * qty;
  }

  // ---- GASTOS DE ENVIO ----
  // 1) Envio a domicilio: % sobre el precio de la comida
  // deliveryFeePercent (pricing.js): 0% si es pickup; si es delivery, 5% si la moto tarda
  // 15 minutos o menos, y 7% si tarda mas.
  const feePercent = deliveryFeePercent(type, travelMinutes);
  const deliveryFee = (subtotal * feePercent) / 100;

  // ---- DESCUENTO ----
  // 2) Despues, el descuento sobre comida + envio. Vale un cupon activo de /api/coupons
  //    (si es para ese tipo de pedido) o el codigo de bienvenida del propio usuario (10%)
  let discount = 0;
  // Mensaje si el codigo no vale (no es un error que pare el pedido: solo no hay descuento)
  let discountError;
  // Apuntamos si se ha usado el codigo de bienvenida para marcarlo como gastado al confirmar
  let usedWelcomeCode = false;
  if (discountCode) {
    // Limpiamos el codigo: sin espacios y en mayusculas ("globo-3f9a1c " -> "GLOBO-3F9A1C")
    const code = String(discountCode).trim().toUpperCase();
    // Opcion A: un cupon de /api/coupons que exista, este activo y sirva para este tipo de pedido
    const coupon = store.coupons.find(
      (c) => c.code === code && c.active && (c.orderType === "all" || c.orderType === type)
    );
    if (coupon) {
      // Descuento = (comida + envio) x porcentaje del cupon
      discount = ((subtotal + deliveryFee) * coupon.percent) / 100;
    } else if (isValidCode(code, user)) {
      // Opcion B: el codigo de bienvenida de ESTE usuario, si todavia no lo ha usado.
      // Por eso hace falta estar conectado para usarlo (sin user, isValidCode da false).
      discount = ((subtotal + deliveryFee) * DISCOUNT_PERCENT) / 100;
      usedWelcomeCode = true;
    } else {
      // Ni cupon ni codigo de bienvenida valido: no hay descuento y avisamos
      discountError = "This discount code is not valid or has already been used";
    }
  }

  // Devolvemos el desglose del precio
  return {
    // Importes redondeados a centimos
    // (round2 evita cosas como 12.300000000000001 por como el ordenador guarda los decimales)
    subtotal: round2(subtotal),
    discount: round2(discount),
    deliveryFee: round2(deliveryFee),
    deliveryFeePercent: feePercent,
    total: round2(subtotal + deliveryFee - discount),
    discountError,
    usedWelcomeCode,
  };
}

// -------------------------------------------------------------------------------------
// POST /order/total — solo calcula, no guarda nada (el login es opcional: hace falta para el codigo)
// Operacion: PASO 2 del pedido. Calcula el precio para ensenarselo al usuario antes de confirmar.
//   Body: { "restaurant": "Telepizza", "type": "delivery", "travelMinutes": 12,
//           "items": [ { "dish": "Pizza Barbacoa", "quantity": 2 } ], "discountCode": "GLOBO-3F9A1C" }
// Respuestas:
//   200 -> { subtotal, discount, deliveryFee, deliveryFeePercent, total, discountError? }
//   400 -> no hay platos, o alguna cantidad no es valida
//   404 -> el restaurante o algun plato no existe
// -------------------------------------------------------------------------------------
function calculateTotal(req, res) {
  // Esta ruta NO lleva requireUser, asi que miramos el token "a mano": si hay usuario
  // conectado se lo pasamos (para poder aplicar su codigo de bienvenida); si no, null.
  const price = computePrice(req.body, userFromRequest(req));
  // Si computePrice devolvio un error, respondemos con su codigo (400 o 404)
  if (price.error) return res.status(price.status).json({ error: price.error });
  // Quitamos usedWelcomeCode (es interno, el navegador no lo necesita) y el resto va en "breakdown"
  const { usedWelcomeCode, ...breakdown } = price;
  // 200 OK con el desglose
  res.json(breakdown);
}

// -------------------------------------------------------------------------------------
// POST /orders — confirma el pedido y lo guarda en el historial (requireUser va antes).
// Hay que volver a escribir la contrasena.
// (es una comprobacion extra de seguridad: confirma que quien paga es de verdad el usuario)
// Operacion: PASO 3 del pedido. Confirmar y guardar.
//   Body: { password, restaurant, location, type, items, payment, travelMinutes?, discountCode? }
// Respuestas:
//   201 -> { message: "Order placed", order: { id, date, restaurant, ..., total } }
//   400 -> no hay platos o alguna cantidad no es valida
//   401 -> no ha hecho login (requireUser) o la contrasena es incorrecta
//   404 -> el restaurante o algun plato no existe
// -------------------------------------------------------------------------------------
function saveOrder(req, res) {
  // Usuario conectado (lo pone requireUser)
  const user = req.user;
  const { password, restaurant, location, type, items, payment } = req.body;
  // La contrasena escrita tiene que ser la del usuario; si no -> 401 Unauthorized
  if (password !== user.password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // Volvemos a calcular el precio en el servidor (no nos fiamos de ningun total que
  // pudiera mandar el navegador). Si hay error -> 400 o 404.
  const price = computePrice(req.body, user);
  if (price.error) return res.status(price.status).json({ error: price.error });

  // Montamos el pedido que se guarda en el historial del usuario
  const order = {
    // Date.now() = milisegundos desde 1970: sirve como id unico y sencillo
    id: Date.now(),
    // Fecha y hora actual en formato texto estandar (ISO)
    date: new Date().toISOString(),
    restaurant,
    location,
    type,
    payment,
    // Guardamos solo el nombre del plato y la cantidad (como numero) de cada linea
    items: items.map(({ dish, quantity }) => ({ dish, quantity: Number(quantity) })),
    // Los importes salen del calculo del servidor
    subtotal: price.subtotal,
    discount: price.discount,
    deliveryFee: price.deliveryFee,
    deliveryFeePercent: price.deliveryFeePercent,
    total: price.total,
  };

  // Guardamos en el usuario: anadimos el pedido a su lista "orders" (historial).
  // [...lista, nuevo] crea una lista nueva con lo que habia mas el pedido nuevo.
  store.users.update(user.id, {
    orders: [...(user.orders || []), order],
    // El codigo de bienvenida solo vale una vez (los cupones se pueden repetir)
    // Si ya estaba usado o se acaba de usar, queda en true para siempre.
    discountUsed: Boolean(user.discountUsed || price.usedWelcomeCode),
  });

  // Tambien se guarda en el recurso /api/orders para poder gestionarlo (estado, repartidor...)
  // Para eso necesitamos el id del local: lo buscamos por marca + zona.
  const brand = brandKeyFromName(restaurant);
  const local = store.restaurants.find((r) => r.brand === brand && normalize(r.area) === normalize(location));
  // Solo si encontramos el local (si no, el pedido queda solo en el historial del usuario)
  if (local) {
    store.orders.create({
      customer: user.name,
      restaurantId: local.id,
      // Aun no tiene repartidor asignado: se pone despues desde la gestion de pedidos
      riderId: null,
      // Tipo oficial ("delivery"/"pickup"); si no se reconoce, "delivery" por defecto
      type: pickOption(ORDER_TYPES, type) || "delivery",
      // Todo pedido nuevo empieza "pending" (pendiente)
      status: "pending",
      total: price.total,
      // Si se paga con tarjeta ya esta pagado; en efectivo se paga al recibirlo
      paid: payment === "card",
    });
  }

  // 201 Created con el pedido guardado
  res.status(201).json({ message: "Order placed", order });
}

// -------------------------------------------------------------------------------------
// GET /orders — historial del usuario conectado (el mas nuevo primero)
// Operacion: PASO 4. LEER los pedidos del usuario que ha hecho login.
// Respuestas:
//   200 -> array con sus pedidos (o [] si todavia no tiene ninguno)
//   401 -> no ha hecho login (lo responde requireUser)
// -------------------------------------------------------------------------------------
function listOrders(req, res) {
  // req.user.orders puede no existir si nunca ha pedido -> usamos [] .
  // slice() hace una copia para que reverse() no cambie la lista original.
  // reverse() pone el mas nuevo primero. res.json -> 200.
  res.json((req.user.orders || []).slice().reverse());
}

// Exportamos las funciones para el router (src/routes/checkout.js)
module.exports = { createOrder, calculateTotal, saveOrder, listOrders };
