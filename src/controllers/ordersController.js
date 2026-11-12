// =====================================================================================
// CONTROLADOR DE PEDIDOS (ordersController.js)
// =====================================================================================
// Logica de /api/orders (CRUD de pedidos). Los pedidos que se confirman en order.html tambien acaban aqui.
// (checkoutController.js es el flujo de la web: /order, /order/total y el historial /orders del usuario)
//
// ¿Que es un CONTROLADOR? Es el archivo con las funciones que se ejecutan cuando llega una
// peticion HTTP a una ruta. El "router" (src/routes/orders.js) solo dice "si llega GET /api/orders,
// llama a listOrders"; el trabajo de verdad (validar, buscar datos, responder) se hace aqui.
//
// Cada funcion recibe dos objetos que le da Express:
//   - req (request = peticion): lo que manda el navegador o el cliente. Por ejemplo:
//       req.body  -> los datos en JSON que vienen en el cuerpo (en POST, PUT y PATCH)
//       req.query -> los filtros que van en la URL despues de "?" (ej: ?status=pending)
//       req.id    -> el numero de la URL /api/orders/7 ya convertido a numero (lo pone el
//                    middleware validateId; si el id no es valido responde 400 y no llega aqui)
//   - res (response = respuesta): lo que usamos para contestar.
//       res.status(codigo) pone el codigo HTTP y res.json(objeto) manda el objeto como JSON.
//       Si no ponemos status, res.json responde con 200 (OK) por defecto.
//
// CRUD = Create (crear, POST), Read (leer, GET), Update (modificar, PUT/PATCH), Delete (borrar, DELETE).
//
// Codigos HTTP que usa este archivo:
//   200 OK · 201 Created (creado) · 204 No Content (borrado, sin cuerpo)
//   400 Bad Request (datos mal enviados) · 404 Not Found (no existe ese pedido)
// =====================================================================================
// "store" es la capa de datos: guarda las colecciones (pedidos, restaurantes, repartidores...)
// y nos da funciones como all(), findById(), create(), replace(), update() y remove().
// El controlador nunca toca los arrays directamente, siempre pasa por estas funciones.
const store = require("../data/store");
// Los "validators" comprueban que los datos que llegan son correctos (tipos, longitudes, opciones).
// validateOrder revisa el body de un pedido y validateOrderQuery revisa los filtros de la URL.
const { validateOrder, validateOrderQuery } = require("../validators/ordersValidator");
// Funciones de ayuda: normalize (texto en minusculas y sin tildes para comparar),
// countBy (cuenta cuantos hay de cada valor) y round2 (redondea a 2 decimales, es decir, a centimos).
const { normalize, countBy, round2 } = require("../utils");

// Funcion auxiliar (no es un endpoint): filtra la lista de pedidos segun los filtros de la URL.
// ?search=&type=&status=&paid=  (search busca en el nombre del cliente)
// Cada condicion es "si no hay filtro, vale cualquiera; si lo hay, tiene que coincidir".
// Un pedido se queda en la lista solo si cumple TODAS las condiciones (por eso se usa &&).
function filterOrders(list, filters) {
  // Normalizamos el texto buscado para que "ANA" y "ana" o "Jose" y "José" coincidan
  const search = normalize(filters.search);
  return list.filter(
    (o) =>
      (!filters.type || o.type === filters.type) &&
      (!filters.status || o.status === filters.status) &&
      // paid es true/false, por eso se compara con undefined (false tambien es un filtro valido)
      (filters.paid === undefined || o.paid === filters.paid) &&
      (!search || normalize(o.customer).includes(search))
  );
}

// Funcion auxiliar con REGLAS DE NEGOCIO (cosas que el validator no puede saber porque
// necesitan mirar otros datos guardados):
// El restaurante y el repartidor tienen que existir. Un pedido para recoger no lleva repartidor.
// Devuelve una lista de errores con el mismo formato que los validators: [{ field, message }].
// Si la lista esta vacia, todo esta bien.
function relationErrors(order) {
  const errors = [];
  // Regla 1: el restaurantId tiene que ser de un restaurante que exista en el store
  if (!store.restaurants.findById(order.restaurantId)) {
    errors.push({ field: "restaurantId", message: `There is no restaurant with id ${order.restaurantId}` });
  }
  // Regla 2: si el pedido trae repartidor (riderId), ese repartidor tiene que existir
  if (order.riderId && !store.riders.findById(order.riderId)) {
    errors.push({ field: "riderId", message: `There is no rider with id ${order.riderId}` });
  }
  // Regla 3: un pedido "pickup" (lo recoge el cliente en el local) no puede tener repartidor
  if (order.type === "pickup" && order.riderId) {
    errors.push({ field: "riderId", message: "A pickup order cannot have a rider" });
  }
  return errors;
}

// Atajo para responder 404 (no encontrado) siempre con el mismo mensaje.
// Asi no repetimos esta linea en cada funcion.
const notFound = (res) => res.status(404).json({ error: "Order not found" });

// -------------------------------------------------------------------------------------
// GET /api/orders -> 200 [ ... ]
// Operacion: LEER la lista de pedidos (la R de CRUD), con filtros opcionales en la URL.
//   Ejemplo: GET /api/orders?status=pending&paid=true
// Respuestas:
//   200 -> array JSON con los pedidos que cumplen los filtros (puede estar vacio: [])
//   400 -> algun filtro no es valido (ej: ?status=xyz) -> { errors: [ { field, message } ] }
// -------------------------------------------------------------------------------------
function listOrders(req, res) {
  // Validamos los filtros de req.query. Todos los validators devuelven { valid, value, errors }:
  //   valid  -> true si no hay errores
  //   value  -> los datos ya limpios (aqui lo renombramos a "filters")
  //   errors -> lista de errores [{ field, message }] (vacia si todo esta bien)
  const { valid, value: filters, errors } = validateOrderQuery(req.query);
  // Si algo esta mal respondemos 400. Se pone "return" para que la funcion TERMINE aqui:
  // sin el return seguiria ejecutandose e intentaria responder dos veces (y Express da error).
  if (!valid) return res.status(400).json({ errors });
  // Cogemos todos los pedidos del store, los filtramos y los mandamos. Sin status -> 200.
  res.json(filterOrders(store.orders.all(), filters));
}

// -------------------------------------------------------------------------------------
// GET /api/orders/stats
// Operacion: LEER estadisticas (resumen) de los pedidos. Acepta los mismos filtros que la lista.
// Respuestas:
//   200 -> { total, paid, revenue, averageTotal, byStatus, byType }
//   400 -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function orderStats(req, res) {
  // Mismos pasos que listOrders: validar filtros y responder 400 si estan mal
  const { valid, value: filters, errors } = validateOrderQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  const list = filterOrders(store.orders.all(), filters);
  // reduce recorre la lista sumando el total de cada pedido: es lo que se ha facturado (revenue)
  const revenue = list.reduce((acc, o) => acc + o.total, 0);
  // Respondemos con un objeto resumen (200 por defecto)
  res.json({
    // Numero de pedidos
    total: list.length,
    // Cuantos estan pagados
    paid: list.filter((o) => o.paid).length,
    // Dinero total, redondeado a centimos
    revenue: round2(revenue),
    // Precio medio por pedido. Si no hay pedidos ponemos 0 para no dividir entre 0
    averageTotal: list.length ? round2(revenue / list.length) : 0,
    // Cuantos pedidos hay de cada estado, ej: { pending: 3, delivered: 5 }
    byStatus: countBy(list, "status"),
    // Cuantos hay de cada tipo, ej: { delivery: 6, pickup: 2 }
    byType: countBy(list, "type"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/orders/:id
// Operacion: LEER un pedido concreto por su id (ej: GET /api/orders/7).
// Respuestas:
//   200 -> el pedido en JSON
//   400 -> el id no es un numero positivo (lo responde el middleware validateId)
//   404 -> no hay ningun pedido con ese id
// -------------------------------------------------------------------------------------
function getOrder(req, res) {
  // req.id ya es un numero valido gracias al middleware validateId
  const order = store.orders.findById(req.id);
  // findById devuelve null si no existe -> 404 (con return para terminar aqui)
  if (!order) return notFound(res);
  res.json(order);
}

// -------------------------------------------------------------------------------------
// POST /api/orders -> 201 + Location
// Operacion: CREAR un pedido nuevo (la C de CRUD) con los datos de req.body.
//   Ejemplo de body: { "customer": "Ana", "restaurantId": 1, "riderId": 2, "type": "delivery",
//                      "status": "pending", "total": 25.5, "paid": true }
// Respuestas:
//   201 -> pedido creado (con el id que le pone el servidor) + cabecera Location con su URL
//   400 -> datos incorrectos, o el restaurante/repartidor no existe, o pickup con repartidor
// -------------------------------------------------------------------------------------
function createOrder(req, res) {
  // 1) Validar el formato de los datos del body (tipos, campos obligatorios, opciones validas)
  const { valid, value, errors } = validateOrder(req.body);
  if (!valid) return res.status(400).json({ errors });
  // 2) Comprobar las reglas de negocio (que existan restaurante y repartidor, etc.)
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  // 3) Guardar en el store. Usamos "value" (datos limpios), no req.body, para no guardar
  //    campos extra o sin limpiar. El store le asigna un id nuevo.
  const created = store.orders.create(value);
  // 4) Responder 201 (Created). La cabecera Location dice la URL del nuevo pedido,
  //    ej: /api/orders/12 (req.baseUrl es "/api/orders").
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/orders/:id
// Operacion: MODIFICAR un pedido SUSTITUYENDO todos sus campos (la U de CRUD).
//   Con PUT hay que mandar el pedido completo, igual que en el POST.
// Respuestas:
//   200 -> el pedido ya modificado
//   400 -> id no valido, datos incorrectos o reglas de negocio no cumplidas
//   404 -> no existe ningun pedido con ese id
// -------------------------------------------------------------------------------------
function replaceOrder(req, res) {
  // Primero comprobamos que el pedido existe; si no, 404
  if (!store.orders.findById(req.id)) return notFound(res);
  // Validamos el body completo (todos los campos obligatorios)
  const { valid, value, errors } = validateOrder(req.body);
  if (!valid) return res.status(400).json({ errors });
  // Reglas de negocio
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  // replace sustituye todos los campos (el id se mantiene) y devuelve el pedido nuevo -> 200
  res.json(store.orders.replace(req.id, value));
}

// -------------------------------------------------------------------------------------
// PATCH /api/orders/:id (p. ej. solo { "status": "delivered" })
// Operacion: MODIFICAR SOLO ALGUNOS campos del pedido (la U de CRUD, pero parcial).
//   Diferencia con PUT: en PATCH solo se mandan los campos que cambian.
// Respuestas:
//   200 -> el pedido ya modificado
//   400 -> id no valido, datos incorrectos, body vacio o reglas de negocio no cumplidas
//   404 -> no existe ningun pedido con ese id
// -------------------------------------------------------------------------------------
function updateOrder(req, res) {
  // Guardamos el pedido actual porque lo necesitamos para revisar las reglas de negocio
  const current = store.orders.findById(req.id);
  if (!current) return notFound(res);
  // { partial: true } le dice al validator que los campos que no vienen NO son obligatorios
  const { valid, value, errors } = validateOrder(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // Las reglas se comprueban con el pedido como quedaria: lo actual + los cambios.
  // Ej: si solo mandan { "type": "pickup" } pero el pedido ya tenia repartidor, es un error.
  const related = relationErrors({ ...current, ...value });
  if (related.length) return res.status(400).json({ errors: related });
  // update cambia solo los campos recibidos y devuelve el pedido completo -> 200
  res.json(store.orders.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/orders/:id -> 204
// Operacion: BORRAR un pedido (la D de CRUD).
// Respuestas:
//   204 -> borrado correctamente (No Content: la respuesta no lleva cuerpo)
//   400 -> el id no es valido
//   404 -> no existe ningun pedido con ese id
// -------------------------------------------------------------------------------------
function deleteOrder(req, res) {
  // remove devuelve true si lo ha borrado y false si no existia -> en ese caso 404
  if (!store.orders.remove(req.id)) return notFound(res);
  // .end() termina la respuesta sin mandar nada (por eso no usamos .json)
  res.status(204).end();
}

// Exportamos las funciones para que el router (src/routes/orders.js) pueda usarlas
module.exports = { listOrders, orderStats, getOrder, createOrder, replaceOrder, updateOrder, deleteOrder };
