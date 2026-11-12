// =====================================================================================
// CONTROLADOR DE CUPONES (coupons)
// Logica de /api/coupons (cupones de descuento que se usan al pedir en order.html)
//
// Cada cupon tiene: code (p. ej. "GLOBO20"), percent (% de descuento), active (si se puede
// usar) y orderType (a que pedidos se aplica: all, delivery o pickup).
//
// Que es un controlador: el router (src/routes/coupons.js) solo conecta cada URL con una
// funcion; aqui esta lo que se hace con cada peticion.
//
// Cada funcion recibe:
//   - req (peticion): req.body (datos JSON en POST/PUT/PATCH), req.query (filtros de la URL
//     despues de "?") y req.id (el :id de la URL ya como numero; lo pone el middleware
//     validateId, que responde 400 si el id no es un entero positivo).
//   - res (respuesta): para contestar con un codigo HTTP y un JSON.
//
// Pasos tipicos: validar con couponsValidator.js -> reglas de negocio (codigo repetido -> 409)
// -> usar el store (src/data/store.js) -> responder. Cubre todo el CRUD.
// =====================================================================================
// store: la "base de datos" en memoria. store.coupons tiene all, findById, create, replace, update, remove
const store = require("../data/store");
// Validators: comprueban el body (validateCoupon) y los filtros de la query (validateCouponQuery)
const { validateCoupon, validateCouponQuery } = require("../validators/couponsValidator");
// Utilidades: countBy (cuenta cuantos hay de cada valor) y round2 (redondea a 2 decimales)
const { countBy, round2 } = require("../utils");

// ?search=&active=&orderType=  (se combinan todos)
// filter se queda solo con los cupones que cumplen TODOS los filtros enviados.
// Cada linea: "si no hay filtro de X, vale cualquiera; si lo hay, tiene que coincidir".
// search se pasa a MAYUSCULAS porque los codigos se guardan en mayusculas ("globo" encuentra "GLOBO20").
// Si no hay search, (filters.search || "") lo deja como texto vacio, que significa "sin filtro".
// active se compara con "=== undefined" porque false es un filtro valido (?active=false).
function filterCoupons(list, filters) {
  const search = (filters.search || "").toUpperCase();
  return list.filter(
    (c) =>
      (filters.active === undefined || c.active === filters.active) &&
      (!filters.orderType || c.orderType === filters.orderType) &&
      (!search || c.code.includes(search))
  );
}

// REGLA DE NEGOCIO: dos cupones no pueden tener el mismo codigo (exceptId: el que se esta editando).
// Al editar se excluye el propio cupon para que no "choque consigo mismo".
// find devuelve el primer cupon que cumple la condicion (o undefined); Boolean lo pasa a true/false.
const isDuplicate = (code, exceptId) => Boolean(store.coupons.all().find((c) => c.id !== exceptId && c.code === code));

// Respuestas reutilizables:
// 404 Not Found -> no existe el cupon con ese id
const notFound = (res) => res.status(404).json({ error: "Coupon not found" });
// 409 Conflict -> los datos son validos pero el codigo ya lo usa otro cupon
const duplicate = (res) =>
  res.status(409).json({ errors: [{ field: "code", message: "A coupon with that code already exists" }] });

// -------------------------------------------------------------------------------------
// GET /api/coupons -> 200 [ ... ]
// CRUD: Read (lista de cupones, con filtros opcionales)
// Ejemplo: GET /api/coupons?active=true&orderType=delivery
// Respuestas:
//   200 OK          -> array JSON con los cupones que cumplen los filtros (puede ser [])
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function listCoupons(req, res) {
  // Validamos req.query. El validator devuelve { valid, value, errors }:
  //   valid -> true/false, value -> filtros limpios (aqui "filters"), errors -> lista de fallos
  const { valid, value: filters, errors } = validateCouponQuery(req.query);
  // Filtros incorrectos -> 400. "return" corta la funcion para no seguir ni responder dos veces
  if (!valid) return res.status(400).json({ errors });
  // Todos los cupones del store, filtrados -> 200 por defecto (res.json sin status)
  res.json(filterCoupons(store.coupons.all(), filters));
}

// -------------------------------------------------------------------------------------
// GET /api/coupons/stats
// CRUD: Read (estadisticas de los cupones; acepta los mismos filtros que la lista)
// Respuestas:
//   200 OK          -> { total, active, averagePercent, byOrderType }
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function couponStats(req, res) {
  // Validacion de filtros igual que en listCoupons
  const { valid, value: filters, errors } = validateCouponQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  // Cupones que cumplen los filtros
  const list = filterCoupons(store.coupons.all(), filters);
  // reduce suma todos los porcentajes: empieza en 0 y en cada cupon anade su percent
  const sum = list.reduce((acc, c) => acc + c.percent, 0);
  // Respondemos 200 con:
  //   total          -> cuantos cupones hay
  //   active         -> cuantos estan activos (filtramos active = true y contamos)
  //   averagePercent -> descuento medio (suma / cantidad, redondeado). 0 si no hay cupones
  //   byOrderType    -> cuantos hay de cada tipo de pedido (countBy)
  res.json({
    total: list.length,
    active: list.filter((c) => c.active).length,
    averagePercent: list.length ? round2(sum / list.length) : 0,
    byOrderType: countBy(list, "orderType"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/coupons/:id   (ejemplo: GET /api/coupons/2)
// CRUD: Read (un cupon concreto)
// Respuestas:
//   200 OK          -> el cupon
//   400 Bad Request -> id no valido (lo responde validateId)
//   404 Not Found   -> no existe un cupon con ese id
// -------------------------------------------------------------------------------------
function getCoupon(req, res) {
  // findById devuelve el cupon o null si no existe
  const coupon = store.coupons.findById(req.id);
  // No existe -> 404 y return para parar
  if (!coupon) return notFound(res);
  // Existe -> 200 con el cupon
  res.json(coupon);
}

// -------------------------------------------------------------------------------------
// POST /api/coupons -> 201 + Location (409 si el codigo ya existe)
// CRUD: Create (crear un cupon nuevo)
// Body de ejemplo: { "code": "globo20", "percent": 20, "active": true, "orderType": "all" }
// Respuestas:
//   201 Created     -> el cupon creado (con su id; el code se guarda en mayusculas) + Location
//   400 Bad Request -> faltan campos o tienen valores incorrectos
//   409 Conflict    -> ya existe un cupon con ese codigo
// -------------------------------------------------------------------------------------
function createCoupon(req, res) {
  // Validamos req.body. value trae el code ya en mayusculas (lo hace el validator)
  const { valid, value, errors } = validateCoupon(req.body);
  // Datos incorrectos -> 400
  if (!valid) return res.status(400).json({ errors });
  // Regla de negocio: codigo repetido -> 409
  if (isDuplicate(value.code)) return duplicate(res);
  // Guardamos en el store, que le asigna un id nuevo
  const created = store.coupons.create(value);
  // 201 Created + cabecera "Location" con la URL del nuevo cupon (p. ej. /api/coupons/5)
  // y en el cuerpo el cupon creado. req.baseUrl vale "/api/coupons"
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/coupons/:id
// CRUD: Update (reemplazo COMPLETO: hay que enviar todos los campos)
// Respuestas:
//   200 OK          -> el cupon actualizado
//   400 Bad Request -> id no valido o datos incorrectos / incompletos
//   404 Not Found   -> no existe un cupon con ese id
//   409 Conflict    -> el nuevo codigo ya lo tiene otro cupon
// -------------------------------------------------------------------------------------
function replaceCoupon(req, res) {
  // Si no existe -> 404
  if (!store.coupons.findById(req.id)) return notFound(res);
  // Validamos el body completo
  const { valid, value, errors } = validateCoupon(req.body);
  if (!valid) return res.status(400).json({ errors });
  // Codigo repetido en OTRO cupon (excluimos este, req.id) -> 409
  if (isDuplicate(value.code, req.id)) return duplicate(res);
  // replace sustituye todos los campos y devuelve el cupon nuevo -> 200
  res.json(store.coupons.replace(req.id, value));
}

// -------------------------------------------------------------------------------------
// PATCH /api/coupons/:id
// CRUD: Update (actualizacion PARCIAL: solo los campos que se quieren cambiar)
// Ejemplo: PATCH /api/coupons/2  con body { "active": false }
// Respuestas:
//   200 OK          -> el cupon con los cambios
//   400 Bad Request -> id no valido, datos incorrectos o body sin ningun campo conocido
//   404 Not Found   -> no existe un cupon con ese id
//   409 Conflict    -> el nuevo codigo ya lo tiene otro cupon
// -------------------------------------------------------------------------------------
function updateCoupon(req, res) {
  // Si no existe -> 404
  if (!store.coupons.findById(req.id)) return notFound(res);
  // { partial: true }: los campos que no llegan no son obligatorios
  const { valid, value, errors } = validateCoupon(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // Solo comprobamos duplicados si se esta cambiando el codigo (value.code existe)
  if (value.code && isDuplicate(value.code, req.id)) return duplicate(res);
  // update cambia solo esos campos y devuelve el cupon actualizado -> 200
  res.json(store.coupons.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/coupons/:id -> 204
// CRUD: Delete (borrar un cupon)
// Respuestas:
//   204 No Content  -> borrado correctamente (sin cuerpo)
//   400 Bad Request -> id no valido
//   404 Not Found   -> no existe un cupon con ese id
// -------------------------------------------------------------------------------------
function deleteCoupon(req, res) {
  // remove devuelve true si lo borro y false si no existia -> 404
  if (!store.coupons.remove(req.id)) return notFound(res);
  // 204 No Content: todo bien pero no hay nada que devolver, por eso .end() sin JSON
  res.status(204).end();
}

// Exportamos las funciones para que el router (src/routes/coupons.js) las use
module.exports = { listCoupons, couponStats, getCoupon, createCoupon, replaceCoupon, updateCoupon, deleteCoupon };
