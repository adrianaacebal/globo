// =====================================================================================
// CONTROLADOR DE PLATOS (dishes)
// Logica de /api/dishes (platos de la carta de cada marca) y de /menu
//
// Que es un controlador: es el archivo que tiene la "logica" de un recurso. El router
// (src/routes/dishes.js) solo dice "si llega GET /api/dishes, llama a listDishes"; aqui
// dentro esta lo que se hace de verdad con esa peticion.
//
// Cada funcion recibe dos objetos que le pasa Express:
//   - req (request / peticion): lo que manda el cliente (navegador, Postman, tests...).
//       req.body  -> los datos en JSON que vienen en POST/PUT/PATCH
//       req.query -> los filtros de la URL, lo que va despues de "?" (?brand=burgerking&maxPrice=10)
//       req.id    -> el :id de la URL ya convertido a numero. Lo pone el middleware
//                    validateId (router.param("id", validateId)); si el id no es un numero
//                    entero positivo, ese middleware ya responde 400 y aqui no se llega.
//   - res (response / respuesta): lo que usamos para contestar (codigo HTTP + JSON).
//
// Flujo tipico de cada funcion:
//   1. Validar los datos con el validator (dishesValidator.js), que devuelve { valid, value, errors }.
//   2. Aplicar reglas de negocio (por ejemplo, no repetir nombre de plato en la misma marca -> 409).
//   3. Leer/escribir datos SOLO a traves del store (src/data/store.js).
//   4. Responder con el codigo HTTP adecuado.
//
// Operaciones CRUD que cubre: Create (POST), Read (GET), Update (PUT/PATCH) y Delete (DELETE).
// =====================================================================================
// store: la "base de datos" en memoria. store.dishes tiene las funciones
// all, findById, find, create, replace, update y remove.
const store = require("../data/store");
// Funciones que comprueban si los datos que llegan son correctos (body y query)
const { validateDish, validateDishQuery } = require("../validators/dishesValidator");
// Utilidades:
//   normalize(texto)        -> pasa a minusculas y quita tildes/espacios/simbolos para comparar textos
//   brandKeyFromName(nombre) -> convierte "McDonald's" en la clave de marca ("mcdonalds")
//   round2(n)               -> redondea un numero a 2 decimales
const { normalize, brandKeyFromName, round2 } = require("../utils");

// Aplica los filtros de la query: ?search=&brand=&category=&minPrice=&maxPrice=
// list.filter(...) recorre todos los platos y se queda solo con los que cumplen la condicion.
// Cada linea de la condicion se lee asi: "si NO hay filtro de X, vale cualquiera (true);
// si SI hay filtro, el plato tiene que coincidir". Todas van unidas con && (Y logico),
// asi que el plato tiene que cumplir TODOS los filtros que se hayan enviado a la vez.
// Para los precios se usa "=== undefined" en vez de "!" porque un precio 0 es un filtro valido.
// En search se usa normalize para que "pollo" encuentre "Pollo" o "POLLO" (sin importar mayusculas/tildes).
function filterDishes(list, f) {
  return list.filter(
    (d) =>
      (!f.brand || d.brand === f.brand) &&
      (!f.category || d.category === f.category) &&
      (f.minPrice === undefined || d.price >= f.minPrice) &&
      (f.maxPrice === undefined || d.price <= f.maxPrice) &&
      (!f.search || normalize(d.name).includes(normalize(f.search)))
  );
}

// REGLA DE NEGOCIO: una marca no puede tener dos platos con el mismo nombre.
// exceptId: el id del plato que se esta editando. Al editar (PUT/PATCH) hay que excluirlo,
// porque si no el plato "chocaria consigo mismo" y siempre parecerian duplicados.
// store.dishes.find(condicion) devuelve el primer plato que cumpla la condicion o null.
// Boolean(...) lo convierte en true (hay duplicado) o false (no lo hay).
function isDuplicate({ brand, name }, exceptId) {
  return Boolean(
    store.dishes.find((d) => d.id !== exceptId && d.brand === brand && normalize(d.name) === normalize(name))
  );
}

// Respuestas que se repiten mucho, guardadas en funciones pequenas para no escribirlas cada vez:
// 404 Not Found -> el plato con ese id no existe.
const notFound = (res) => res.status(404).json({ error: "Dish not found" });
// 409 Conflict -> los datos son correctos, pero chocan con algo que ya existe (nombre repetido).
const duplicate = (res) =>
  res.status(409).json({ errors: [{ field: "name", message: "This brand already has a dish with that name" }] });

// Calcula { count, averagePrice } de una lista de platos.
// reduce recorre la lista acumulando un valor: empieza en 0 y en cada plato suma su precio.
// Al final "sum" es la suma de todos los precios. La media es suma / cantidad.
// Si la lista esta vacia se devuelve 0 para no dividir entre 0.
function priceSummary(list) {
  const sum = list.reduce((acc, d) => acc + d.price, 0);
  return { count: list.length, averagePrice: list.length ? round2(sum / list.length) : 0 };
}

// Agrupa los platos por un campo ("brand" o "category") y calcula el resumen de cada grupo.
// Ejemplo: groupSummary(platos, "brand") -> { burgerking: { count: 5, averagePrice: 7.2 }, ... }
// Paso 1: el bucle for mete cada plato en el grupo de su valor. "||= []" significa
//         "si ese grupo todavia no existe, crealo como lista vacia" y luego .push anade el plato.
// Paso 2: Object.entries convierte el objeto en pares [clave, platos], .map calcula
//         priceSummary de cada grupo y Object.fromEntries lo vuelve a convertir en objeto.
function groupSummary(list, field) {
  const groups = {};
  for (const dish of list) (groups[dish[field]] ||= []).push(dish);
  return Object.fromEntries(Object.entries(groups).map(([key, items]) => [key, priceSummary(items)]));
}

// -------------------------------------------------------------------------------------
// GET /api/dishes -> 200 [ ... ]
// CRUD: Read (leer la lista de platos, con filtros opcionales en la query)
// Ejemplo: GET /api/dishes?brand=burgerking&maxPrice=10
// Respuestas:
//   200 OK          -> array JSON con los platos que cumplen los filtros (puede ser [] vacio)
//   400 Bad Request -> algun filtro no es valido (p. ej. minPrice mayor que maxPrice)
// -------------------------------------------------------------------------------------
function listDishes(req, res) {
  // Validamos req.query (los filtros). El validator devuelve un objeto con 3 cosas:
  //   valid  -> true si todo esta bien, false si hay algun error
  //   value  -> los filtros ya limpios (aqui lo renombramos a "filters")
  //   errors -> lista de errores [{ field, message }] para explicar al cliente que fallo
  const { valid, value: filters, errors } = validateDishQuery(req.query);
  // Si algo esta mal respondemos 400. El "return" es importante: corta la funcion aqui,
  // para que no siga ejecutando y no intente enviar una segunda respuesta.
  if (!valid) return res.status(400).json({ errors });
  // Cogemos todos los platos del store, los filtramos y los enviamos.
  // res.json(...) sin res.status(...) responde con 200 OK por defecto.
  res.json(filterDishes(store.dishes.all(), filters));
}

// -------------------------------------------------------------------------------------
// GET /api/dishes/stats (acepta los mismos filtros)
// CRUD: Read (no devuelve platos sueltos, sino estadisticas calculadas sobre ellos)
// Ejemplo: GET /api/dishes/stats?brand=telepizza
// Respuestas:
//   200 OK          -> { total, averagePrice, minPrice, maxPrice, byBrand, byCategory }
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function dishStats(req, res) {
  // Mismos filtros que en listDishes: se validan igual
  const { valid, value: filters, errors } = validateDishQuery(req.query);
  // Filtro incorrecto -> 400 y "return" para terminar aqui
  if (!valid) return res.status(400).json({ errors });

  // Lista de platos que cumplen los filtros (las estadisticas se calculan solo sobre ellos)
  const list = filterDishes(store.dishes.all(), filters);
  // map transforma cada plato en su precio: [ {name, price: 5}, ... ] -> [ 5, ... ]
  const prices = list.map((d) => d.price);
  // Respondemos 200 (por defecto) con un objeto de estadisticas:
  //   total        -> cuantos platos hay
  //   averagePrice -> precio medio (calculado con reduce en priceSummary)
  //   minPrice / maxPrice -> precio mas bajo y mas alto. "...prices" pasa cada precio como
  //                  argumento separado a Math.min/Math.max. Si no hay platos, null.
  //   byBrand / byCategory -> cantidad y precio medio agrupados por marca y por categoria
  res.json({
    total: list.length,
    averagePrice: priceSummary(list).averagePrice,
    minPrice: list.length ? Math.min(...prices) : null,
    maxPrice: list.length ? Math.max(...prices) : null,
    byBrand: groupSummary(list, "brand"),
    byCategory: groupSummary(list, "category"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/dishes/:id   (ejemplo: GET /api/dishes/3)
// CRUD: Read (leer UN plato concreto)
// Respuestas:
//   200 OK          -> el plato en JSON
//   400 Bad Request -> el id no es un numero valido (lo responde el middleware validateId)
//   404 Not Found   -> no existe ningun plato con ese id
// -------------------------------------------------------------------------------------
function getDish(req, res) {
  // req.id ya es un numero (lo puso validateId). Buscamos el plato en el store.
  // findById devuelve el plato o null si no existe.
  const dish = store.dishes.findById(req.id);
  // Si no existe -> 404, y "return" para no seguir
  if (!dish) return notFound(res);
  // Si existe -> 200 (por defecto) con el plato
  res.json(dish);
}

// -------------------------------------------------------------------------------------
// POST /api/dishes -> 201 (409 si la marca ya tiene un plato con ese nombre)
// CRUD: Create (crear un plato nuevo)
// Body de ejemplo: { "name": "Whopper", "brand": "burgerking", "category": "main", "price": 6.5 }
// Respuestas:
//   201 Created     -> el plato creado (con su id nuevo) + cabecera Location
//   400 Bad Request -> faltan campos o tienen valores incorrectos
//   409 Conflict    -> esa marca ya tiene un plato con ese nombre
// -------------------------------------------------------------------------------------
function createDish(req, res) {
  // Validamos req.body (los datos del plato nuevo). En POST todos los campos son obligatorios.
  // value contiene solo los campos conocidos y ya limpios (sin espacios sobrantes, etc.)
  const { valid, value, errors } = validateDish(req.body);
  // Datos incorrectos -> 400 con la lista de errores
  if (!valid) return res.status(400).json({ errors });
  // Regla de negocio: nombre repetido en la misma marca -> 409
  if (isDuplicate(value)) return duplicate(res);
  // Guardamos el plato. El store le asigna el id automaticamente (el cliente no lo elige)
  const created = store.dishes.create(value);
  // Respondemos:
  //   status(201)  -> 201 Created: "se ha creado algo nuevo"
  //   location(...) -> anade la cabecera HTTP "Location" con la URL del recurso nuevo,
  //                    por ejemplo /api/dishes/12 (req.baseUrl vale "/api/dishes")
  //   json(created) -> en el cuerpo enviamos el plato creado, ya con su id
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/dishes/:id
// CRUD: Update (reemplazo COMPLETO: hay que enviar todos los campos del plato)
// Respuestas:
//   200 OK          -> el plato ya actualizado
//   400 Bad Request -> id no valido (validateId) o datos incorrectos / incompletos
//   404 Not Found   -> no existe el plato con ese id
//   409 Conflict    -> el nuevo nombre ya lo tiene otro plato de la misma marca
// -------------------------------------------------------------------------------------
function replaceDish(req, res) {
  // Primero comprobamos que el plato existe; si no, 404 y terminamos
  if (!store.dishes.findById(req.id)) return notFound(res);
  // Validamos el body completo (como en POST: todos los campos obligatorios)
  const { valid, value, errors } = validateDish(req.body);
  if (!valid) return res.status(400).json({ errors });
  // Comprobamos duplicados, pero excluyendo este mismo plato (req.id)
  if (isDuplicate(value, req.id)) return duplicate(res);
  // replace sustituye todos los campos del plato y devuelve el plato nuevo -> 200 por defecto
  res.json(store.dishes.replace(req.id, value));
}

// -------------------------------------------------------------------------------------
// PATCH /api/dishes/:id
// CRUD: Update (actualizacion PARCIAL: solo se envian los campos que se quieren cambiar)
// Ejemplo: PATCH /api/dishes/3  con body { "price": 7.99 }
// Respuestas:
//   200 OK          -> el plato con los cambios aplicados
//   400 Bad Request -> id no valido, datos incorrectos o body vacio
//   404 Not Found   -> no existe el plato con ese id
//   409 Conflict    -> el nombre resultante choca con otro plato de la misma marca
// -------------------------------------------------------------------------------------
function updateDish(req, res) {
  // Guardamos el plato actual porque lo necesitamos para comprobar duplicados
  const current = store.dishes.findById(req.id);
  if (!current) return notFound(res);
  // { partial: true } le dice al validator que los campos que no vienen NO son obligatorios
  const { valid, value, errors } = validateDish(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // { ...current, ...value } mezcla el plato actual con los cambios (los cambios ganan).
  // Asi, si solo se cambia la marca o solo el nombre, se comprueba el resultado final.
  if (isDuplicate({ ...current, ...value }, req.id)) return duplicate(res);
  // update cambia solo los campos recibidos y devuelve el plato actualizado -> 200
  res.json(store.dishes.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/dishes/:id -> 204
// CRUD: Delete (borrar un plato)
// Respuestas:
//   204 No Content  -> borrado correctamente
//   400 Bad Request -> id no valido (validateId)
//   404 Not Found   -> no existe el plato con ese id
// -------------------------------------------------------------------------------------
function deleteDish(req, res) {
  // remove devuelve true si lo ha borrado y false si no existia -> en ese caso 404
  if (!store.dishes.remove(req.id)) return notFound(res);
  // 204 No Content: "todo ha ido bien, pero no hay nada que devolver" (el plato ya no existe).
  // Por eso no se usa .json(...): .end() termina la respuesta sin cuerpo.
  res.status(204).end();
}

// -------------------------------------------------------------------------------------
// GET /menu?restaurant=McDonald's -> carta completa de la marca (la usa order.html)
// CRUD: Read (devuelve todos los platos de una marca)
// OJO: esta ruta NO esta bajo /api/dishes, se define en src/routes/checkout.js
// Respuestas:
//   200 OK          -> array con los platos de esa marca
//   400 Bad Request -> no se ha enviado ?restaurant=
//   404 Not Found   -> el nombre no corresponde a ninguna marca conocida
// -------------------------------------------------------------------------------------
function getMenu(req, res) {
  // Leemos el parametro "restaurant" de la query (lo que va despues de ?restaurant=)
  const { restaurant } = req.query;
  // Si no llega, no es texto o esta vacio -> 400 (aqui se valida a mano, sin validator)
  if (typeof restaurant !== "string" || !restaurant.trim()) {
    return res.status(400).json({ errors: [{ field: "restaurant", message: "restaurant is required" }] });
  }
  // Convertimos el nombre que ve el usuario ("McDonald's") en la clave interna de marca
  const brand = brandKeyFromName(restaurant);
  // Si no corresponde a ninguna marca -> 404
  if (!brand) return res.status(404).json({ error: "Restaurant not found" });
  // Devolvemos (200) solo los platos de esa marca, usando filter
  res.json(store.dishes.all().filter((d) => d.brand === brand));
}

// Exportamos las funciones para que el router (src/routes/dishes.js y checkout.js) pueda usarlas
module.exports = { listDishes, dishStats, getDish, createDish, replaceDish, updateDish, deleteDish, getMenu };
