// =====================================================================================
// CONTROLADOR DE REPARTIDORES (riders)
// Logica de /api/riders (las personas que llevan los pedidos: nombre, vehiculo, zona,
// si estan disponibles y su valoracion media de 0 a 5).
//
// Que es un controlador: el router (src/routes/riders.js) solo conecta cada URL con una
// funcion; aqui esta lo que se hace con cada peticion.
//
// Cada funcion recibe:
//   - req (peticion): req.body (datos JSON en POST/PUT/PATCH), req.query (filtros de la URL
//     despues de "?") y req.id (el :id de la URL ya como numero; lo pone el middleware
//     validateId, que responde 400 si el id no es un entero positivo).
//   - res (respuesta): para contestar con un codigo HTTP y un JSON.
//
// Pasos tipicos: validar con ridersValidator.js -> usar el store (src/data/store.js)
// -> responder con el codigo adecuado. Cubre todo el CRUD: Create, Read, Update y Delete.
// Relacion con otro recurso: los pedidos (orders) tienen un riderId. Si se borra un
// repartidor, sus pedidos se quedan sin repartidor (ver deleteRider).
// =====================================================================================

// store: la "base de datos" en memoria (store.riders y store.orders)
const store = require("../data/store");
// Validators: comprueban el body (validateRider) y los filtros de la query (validateRiderQuery)
const { validateRider, validateRiderQuery } = require("../validators/ridersValidator");
// Utilidades:
//   normalize -> texto en minusculas sin tildes ni simbolos, para comparar textos
//   countBy   -> cuenta cuantos hay de cada valor: countBy(lista, "vehicle") -> { bike: 3, car: 1 }
//   round2    -> redondea a 2 decimales
const { normalize, countBy, round2 } = require("../utils");


// Aplica los filtros de la query: ?search=&vehicle=&area=&available=
// filter recorre la lista y se queda solo con los repartidores que cumplen TODOS los filtros.
// Cada linea: "si no hay filtro de X, vale cualquiera; si lo hay, tiene que coincidir".
// available se compara con "=== undefined" porque false es un filtro valido (?available=false).
// search se normaliza una sola vez al principio; normalize(undefined) devuelve "" (sin filtro).
function filterRiders(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (r) =>
      (!filters.vehicle || r.vehicle === filters.vehicle) &&
      (!filters.area || r.area === filters.area) &&
      (filters.available === undefined || r.available === filters.available) &&
      (!search || normalize(r.name).includes(search))
  );
}

// Respuesta 404 Not Found reutilizable: el repartidor con ese id no existe
const notFound = (res) => res.status(404).json({ error: "Rider not found" });

// -------------------------------------------------------------------------------------
// GET /api/riders -> 200 [ ... ]
// CRUD: Read (lista de repartidores, con filtros opcionales)
// Ejemplo: GET /api/riders?vehicle=bike&available=true
// Respuestas:
//   200 OK          -> array JSON con los repartidores que cumplen los filtros (puede ser [])
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function listRiders(req, res) {
  // Validamos req.query. El validator devuelve { valid, value, errors }:
  //   valid -> true/false, value -> filtros limpios (aqui "filters"), errors -> lista de fallos
  const { valid, value: filters, errors } = validateRiderQuery(req.query);
  // Filtros incorrectos -> 400. "return" corta la funcion para no seguir ni responder dos veces
  if (!valid) return res.status(400).json({ errors });
  // Todos los repartidores del store, filtrados -> 200 por defecto (res.json sin status)
  res.json(filterRiders(store.riders.all(), filters));
}

// -------------------------------------------------------------------------------------
// GET /api/riders/stats
// CRUD: Read (estadisticas de los repartidores; acepta los mismos filtros que la lista)
// Respuestas:
//   200 OK          -> { total, available, averageRating, byVehicle }
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function riderStats(req, res) {
  // Validacion de filtros igual que en listRiders
  const { valid, value: filters, errors } = validateRiderQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  // Repartidores que cumplen los filtros
  const list = filterRiders(store.riders.all(), filters);
  // reduce suma todas las valoraciones: empieza en 0 y en cada repartidor anade su rating
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  // Respondemos 200 con:
  //   total         -> cuantos repartidores hay
  //   available     -> cuantos estan disponibles (filtramos available = true y contamos)
  //   averageRating -> media de valoraciones (suma / cantidad, redondeada). 0 si no hay ninguno,
  //                    para no dividir entre 0
  //   byVehicle     -> cuantos hay de cada vehiculo (countBy)
  res.json({
    total: list.length,
    available: list.filter((r) => r.available).length,
    averageRating: list.length ? round2(sum / list.length) : 0,
    byVehicle: countBy(list, "vehicle"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/riders/:id   (ejemplo: GET /api/riders/1)
// CRUD: Read (un repartidor concreto)
// Respuestas:
//   200 OK          -> el repartidor
//   400 Bad Request -> id no valido (lo responde validateId)
//   404 Not Found   -> no existe un repartidor con ese id
// -------------------------------------------------------------------------------------
function getRider(req, res) {
  // findById devuelve el repartidor o null si no existe
  const rider = store.riders.findById(req.id);
  // No existe -> 404 y return para parar
  if (!rider) return notFound(res);
  // Existe -> 200 con el repartidor
  res.json(rider);
}

// -------------------------------------------------------------------------------------
// POST /api/riders -> 201 + Location
// CRUD: Create (dar de alta un repartidor)
// Body: { name, vehicle, area, available, rating } (todos obligatorios)
// Respuestas:
//   201 Created     -> el repartidor creado (con su id) + cabecera Location
//   400 Bad Request -> faltan campos o tienen valores incorrectos
// -------------------------------------------------------------------------------------
function createRider(req, res) {
  // Validamos req.body; value tiene solo los campos conocidos y limpios
  const { valid, value, errors } = validateRider(req.body);
  // Datos incorrectos -> 400 con la lista de errores
  if (!valid) return res.status(400).json({ errors });
  // Guardamos en el store, que le asigna un id nuevo
  const created = store.riders.create(value);
  // 201 Created + cabecera "Location" con la URL del nuevo repartidor (p. ej. /api/riders/7)
  // y en el cuerpo el repartidor creado. req.baseUrl vale "/api/riders"
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/riders/:id -> sustituye el repartidor entero
// CRUD: Update (reemplazo COMPLETO: hay que enviar todos los campos)
// Respuestas:
//   200 OK          -> el repartidor actualizado
//   400 Bad Request -> id no valido o datos incorrectos / incompletos
//   404 Not Found   -> no existe un repartidor con ese id
// -------------------------------------------------------------------------------------
function replaceRider(req, res) {
  // Si no existe -> 404
  if (!store.riders.findById(req.id)) return notFound(res);
  // Validamos el body completo (todos los campos obligatorios)
  const { valid, value, errors } = validateRider(req.body);
  if (!valid) return res.status(400).json({ errors });
  // replace sustituye todos los campos y devuelve el repartidor nuevo -> 200
  res.json(store.riders.replace(req.id, value));
}

// -------------------------------------------------------------------------------------
// PATCH /api/riders/:id -> cambia solo los campos enviados
// CRUD: Update (actualizacion PARCIAL)
// Ejemplo: PATCH /api/riders/1  con body { "available": false }
// Respuestas:
//   200 OK          -> el repartidor con los cambios
//   400 Bad Request -> id no valido, datos incorrectos o body sin ningun campo conocido
//   404 Not Found   -> no existe un repartidor con ese id
// -------------------------------------------------------------------------------------
function updateRider(req, res) {
  // Si no existe -> 404
  if (!store.riders.findById(req.id)) return notFound(res);
  // { partial: true }: los campos que no llegan no son obligatorios
  const { valid, value, errors } = validateRider(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // update cambia solo esos campos y devuelve el repartidor actualizado -> 200
  res.json(store.riders.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/riders/:id -> 204. Los pedidos que tenia asignados se quedan sin repartidor
// CRUD: Delete (borrar un repartidor)
// Respuestas:
//   204 No Content  -> borrado correctamente (sin cuerpo)
//   400 Bad Request -> id no valido
//   404 Not Found   -> no existe un repartidor con ese id
// -------------------------------------------------------------------------------------
function deleteRider(req, res) {
  // remove devuelve true si lo borro y false si no existia -> 404
  if (!store.riders.remove(req.id)) return notFound(res);
  // REGLA DE NEGOCIO (relacion con pedidos): buscamos los pedidos que tenian a este repartidor
  // (filter por riderId) y a cada uno le ponemos riderId: null con update. Asi ningun pedido
  // queda apuntando a un repartidor que ya no existe.
  for (const order of store.orders.all().filter((o) => o.riderId === req.id)) {
    store.orders.update(order.id, { riderId: null });
  }
  // 204 No Content: todo bien pero no hay nada que devolver, por eso .end() sin JSON
  res.status(204).end();
}

// Exportamos las funciones para que el router (src/routes/riders.js) las use
module.exports = { listRiders, riderStats, getRider, createRider, replaceRider, updateRider, deleteRider };
