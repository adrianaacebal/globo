// =====================================================================================
// CONTROLADOR DE RESTAURANTES (restaurants)
// Logica de /api/restaurants (los locales de cada marca: nombre, zona, si hacen delivery...)
//
// Que es un controlador: el router (src/routes/restaurants.js) solo conecta cada URL con
// una funcion; aqui esta lo que hace cada funcion con la peticion.
//
// Cada funcion recibe:
//   - req (peticion): req.body (datos JSON en POST/PUT/PATCH), req.query (filtros de la URL
//     despues de "?") y req.id (el :id de la URL ya como numero; lo pone el middleware
//     validateId, que responde 400 si el id no es un entero positivo).
//   - res (respuesta): para contestar con un codigo HTTP y un JSON.
//
// Pasos tipicos: validar con restaurantsValidator.js -> usar el store (src/data/store.js)
// -> responder con el codigo adecuado. Cubre todo el CRUD: Create, Read, Update y Delete.
// =====================================================================================
// store: la "base de datos" en memoria. store.restaurants tiene all, findById, create, replace, update, remove
const store = require("../data/store");
// Validators: comprueban el body (validateRestaurant) y los filtros de la query (validateRestaurantQuery)
const { validateRestaurant, validateRestaurantQuery } = require("../validators/restaurantsValidator");
// Utilidades:
//   normalize -> pasa un texto a minusculas sin tildes ni simbolos, para comparar textos
//   countBy   -> cuenta cuantos hay de cada valor: countBy(lista, "area") -> { Centro: 4, Retiro: 2 }
//   round2    -> redondea a 2 decimales (aqui no se llega a usar)
const { normalize, countBy, round2 } = require("../utils");

// Respuesta 404 Not Found reutilizable: el restaurante con ese id no existe
const notFound = (res) => res.status(404).json({ error: "Restaurant not found" });

// -------------------------------------------------------------------------------------
// GET /api/restaurants/stats
// CRUD: Read (estadisticas calculadas sobre los restaurantes, acepta los mismos filtros que la lista)
// Ejemplo: GET /api/restaurants/stats?area=Centro
// Respuestas:
//   200 OK          -> { total, withDelivery, byBrand, byArea, byType }
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function restaurantStats(req, res) {
  // Validamos los filtros de req.query. El validator devuelve:
  //   valid (true/false), value (filtros limpios, renombrado a "filters") y errors (lista de fallos)
  const { valid, value: filters, errors } = validateRestaurantQuery(req.query);
  // Filtros incorrectos -> 400. "return" corta la funcion para no seguir ni responder dos veces
  if (!valid) return res.status(400).json({ errors });
  // filter se queda solo con los restaurantes que cumplen TODOS los filtros enviados.
  // Cada linea: "si no hay filtro de X, vale cualquiera; si lo hay, tiene que coincidir".
  // delivery se compara con "=== undefined" porque false es un filtro valido (?delivery=false).
  // search busca el texto dentro del nombre, sin importar mayusculas ni tildes (normalize).
  const list = store.restaurants.all().filter(
    (r) =>
      (!filters.brand || r.brand === filters.brand) &&
      (!filters.area || r.area === filters.area) &&
      (!filters.type || r.type === filters.type) &&
      (filters.delivery === undefined || r.delivery === filters.delivery) &&
      (!filters.search || normalize(r.name).includes(normalize(filters.search)))
  );
  // Respondemos 200 (res.json sin status = 200 por defecto) con:
  //   total        -> cuantos restaurantes hay
  //   withDelivery -> cuantos hacen delivery (filtramos los que tienen delivery = true y contamos)
  //   byBrand / byArea / byType -> cuantos hay de cada marca, zona y tipo de comida (countBy)
  res.json({
    total: list.length,
    withDelivery: list.filter((r) => r.delivery).length,
    byBrand: countBy(list, "brand"),
    byArea: countBy(list, "area"),
    byType: countBy(list, "type"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/restaurants -> 200 [ ... ]
// CRUD: Read (lista de restaurantes, con filtros opcionales)
// Ejemplo: GET /api/restaurants?brand=telepizza&delivery=true
// Respuestas:
//   200 OK          -> array JSON con los restaurantes que cumplen los filtros (puede ser [])
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function listRestaurants(req, res) {
  // Validamos los filtros de la query ({ valid, value, errors })
  const { valid, value: filters, errors } = validateRestaurantQuery(req.query);
  // Si hay errores -> 400 y terminamos con return
  if (!valid) return res.status(400).json({ errors });
  // Mismo filtrado que en restaurantStats: solo pasan los que cumplen todos los filtros
  const result = store.restaurants.all().filter(
    (r) =>
      (!filters.brand || r.brand === filters.brand) &&
      (!filters.area || r.area === filters.area) &&
      (!filters.type || r.type === filters.type) &&
      (filters.delivery === undefined || r.delivery === filters.delivery) &&
      (!filters.search || normalize(r.name).includes(normalize(filters.search)))
  );
  // 200 OK por defecto con la lista filtrada
  res.json(result);
}

// -------------------------------------------------------------------------------------
// GET /api/restaurants/:id   (ejemplo: GET /api/restaurants/2)
// CRUD: Read (un restaurante concreto)
// Respuestas:
//   200 OK          -> el restaurante
//   400 Bad Request -> id no valido (lo responde validateId antes de llegar aqui)
//   404 Not Found   -> no existe un restaurante con ese id
// -------------------------------------------------------------------------------------
function getRestaurant(req, res) {
  // Buscamos por id en el store: devuelve el restaurante o null
  const restaurant = store.restaurants.findById(req.id);
  // No existe -> 404 (return para parar aqui)
  if (!restaurant) return notFound(res);
  // Existe -> 200 con el restaurante
  res.json(restaurant);
}

// -------------------------------------------------------------------------------------
// POST /api/restaurants -> 201
// CRUD: Create (crear un restaurante nuevo)
// Body: { name, brand, delivery, area, type, lat, lon } (todos obligatorios)
// Respuestas:
//   201 Created     -> el restaurante creado (ya con id) + cabecera Location
//   400 Bad Request -> faltan campos o tienen valores incorrectos
// -------------------------------------------------------------------------------------
function createRestaurant(req, res) {
  // Validamos req.body. value tiene solo los campos conocidos y ya limpios
  const { valid, value, errors } = validateRestaurant(req.body);
  // Datos incorrectos -> 400 con la lista de errores
  if (!valid) return res.status(400).json({ errors });
  // Lo guardamos en el store, que le pone un id nuevo automaticamente
  const created = store.restaurants.create(value);
  // 201 Created + cabecera "Location" con la URL del nuevo recurso (p. ej. /api/restaurants/9)
  // req.baseUrl es la parte de la URL donde esta montado el router: "/api/restaurants"
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/restaurants/:id -> 200
// CRUD: Update (reemplazo COMPLETO: se envian todos los campos)
// Respuestas:
//   200 OK          -> el restaurante actualizado
//   400 Bad Request -> id no valido o datos incorrectos / incompletos
//   404 Not Found   -> no existe un restaurante con ese id
// -------------------------------------------------------------------------------------
function replaceRestaurant(req, res) {
  // Primero comprobamos que existe; si no, 404
  if (!store.restaurants.findById(req.id)) return notFound(res);
  // Validamos el body completo (todos los campos obligatorios, como en POST)
  const { valid, value, errors } = validateRestaurant(req.body);
  if (!valid) return res.status(400).json({ errors });
  // replace sustituye todos los campos (el id se mantiene) y devuelve el resultado -> 200
  res.json(store.restaurants.replace(req.id, value));
}

// -------------------------------------------------------------------------------------
// PATCH /api/restaurants/:id -> 200
// CRUD: Update (actualizacion PARCIAL: solo los campos que se quieren cambiar)
// Ejemplo: PATCH /api/restaurants/2  con body { "delivery": false }
// Respuestas:
//   200 OK          -> el restaurante con los cambios
//   400 Bad Request -> id no valido, datos incorrectos o body sin ningun campo conocido
//   404 Not Found   -> no existe un restaurante con ese id
// -------------------------------------------------------------------------------------
function updateRestaurant(req, res) {
  // Si no existe -> 404
  if (!store.restaurants.findById(req.id)) return notFound(res);
  // { partial: true }: los campos que no se envian no son obligatorios
  const { valid, value, errors } = validateRestaurant(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // update cambia solo los campos recibidos y devuelve el restaurante actualizado -> 200
  res.json(store.restaurants.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/restaurants/:id -> 204
// CRUD: Delete (borrar un restaurante)
// Respuestas:
//   204 No Content  -> borrado correctamente (respuesta sin cuerpo)
//   400 Bad Request -> id no valido
//   404 Not Found   -> no existe un restaurante con ese id
// -------------------------------------------------------------------------------------
function deleteRestaurant(req, res) {
  // remove devuelve true si lo borro y false si no existia -> 404
  if (!store.restaurants.remove(req.id)) return notFound(res);
  // 204 No Content: ha ido bien pero no hay nada que devolver, por eso .end() sin JSON
  res.status(204).end();
}

// Exportamos las funciones para que el router (src/routes/restaurants.js) las use
module.exports = { listRestaurants, restaurantStats, getRestaurant, createRestaurant, replaceRestaurant, updateRestaurant, deleteRestaurant };
