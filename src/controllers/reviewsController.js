// =====================================================================================
// CONTROLADOR DE OPINIONES (reviews)
// Logica de /api/reviews (opiniones de los clientes sobre un restaurante)
//
// Cada opinion tiene: restaurantId (a que restaurante se refiere), author, rating (1 a 5
// estrellas), comment y verified (true si GLOBO comprobo que el cliente pidio alli).
//
// Que es un controlador: el router (src/routes/reviews.js) solo conecta cada URL con una
// funcion; aqui esta lo que se hace con cada peticion.
//
// Cada funcion recibe:
//   - req (peticion): req.body (datos JSON en POST/PUT/PATCH), req.query (filtros de la URL
//     despues de "?") y req.id (el :id de la URL ya como numero; lo pone el middleware
//     validateId, que responde 400 si el id no es un entero positivo).
//   - res (respuesta): para contestar con un codigo HTTP y un JSON.
//
// Pasos tipicos: validar con reviewsValidator.js -> comprobar la relacion con restaurantes
// (el restaurante tiene que existir, si no -> 400) -> usar el store -> responder. Cubre todo el CRUD.
// =====================================================================================
// store: la "base de datos" en memoria (store.reviews y store.restaurants)
const store = require("../data/store");
// Validators: comprueban el body (validateReview) y los filtros de la query (validateReviewQuery)
const { validateReview, validateReviewQuery } = require("../validators/reviewsValidator");
// Utilidades:
//   normalize -> texto en minusculas sin tildes ni simbolos, para comparar textos
//   countBy   -> cuenta cuantos hay de cada valor: countBy(lista, "rating") -> { 5: 3, 4: 1 }
//   round2    -> redondea a 2 decimales
const { normalize, countBy, round2 } = require("../utils");

// ?search=&restaurantId=&rating=&verified=  (search busca en el autor y en el comentario)
// filter se queda solo con las opiniones que cumplen TODOS los filtros enviados.
// Cada linea: "si no hay filtro de X, vale cualquiera; si lo hay, tiene que coincidir".
// Aqui se usa "=== undefined" porque son numeros o booleanos (false es un filtro valido).
// Para search se juntan autor + comentario en un solo texto y se busca dentro.
function filterReviews(list, filters) {
  const search = normalize(filters.search);
  return list.filter(
    (r) =>
      (filters.restaurantId === undefined || r.restaurantId === filters.restaurantId) &&
      (filters.rating === undefined || r.rating === filters.rating) &&
      (filters.verified === undefined || r.verified === filters.verified) &&
      (!search || normalize(r.author + r.comment).includes(search))
  );
}

// REGLA DE NEGOCIO (relacion con otro recurso): la opinion tiene que ser de un restaurante que existe.
// El validator solo comprueba que restaurantId sea un numero; aqui miramos en el store si existe.
// Devuelve [] (lista vacia = sin errores) o una lista con el error, con el mismo formato
// { field, message } que usan los validators. Si hay error, el controlador responde 400.
function relationErrors(review) {
  if (store.restaurants.findById(review.restaurantId)) return [];
  return [{ field: "restaurantId", message: `There is no restaurant with id ${review.restaurantId}` }];
}

// Respuesta 404 Not Found reutilizable: la opinion con ese id no existe
const notFound = (res) => res.status(404).json({ error: "Review not found" });

// -------------------------------------------------------------------------------------
// GET /api/reviews -> 200 [ ... ]
// CRUD: Read (lista de opiniones, con filtros opcionales)
// Ejemplo: GET /api/reviews?restaurantId=3&verified=true
// Respuestas:
//   200 OK          -> array JSON con las opiniones que cumplen los filtros (puede ser [])
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function listReviews(req, res) {
  // Validamos req.query. El validator devuelve { valid, value, errors }:
  //   valid -> true/false, value -> filtros limpios (aqui "filters"), errors -> lista de fallos
  const { valid, value: filters, errors } = validateReviewQuery(req.query);
  // Filtros incorrectos -> 400. "return" corta la funcion para no seguir ni responder dos veces
  if (!valid) return res.status(400).json({ errors });
  // Todas las opiniones del store, filtradas -> 200 por defecto (res.json sin status)
  res.json(filterReviews(store.reviews.all(), filters));
}

// -------------------------------------------------------------------------------------
// GET /api/reviews/stats
// CRUD: Read (estadisticas de las opiniones; acepta los mismos filtros que la lista)
// Ejemplo: GET /api/reviews/stats?restaurantId=3  -> nota media de ese restaurante
// Respuestas:
//   200 OK          -> { total, verified, averageRating, byRating }
//   400 Bad Request -> algun filtro no es valido
// -------------------------------------------------------------------------------------
function reviewStats(req, res) {
  // Validacion de filtros igual que en listReviews
  const { valid, value: filters, errors } = validateReviewQuery(req.query);
  if (!valid) return res.status(400).json({ errors });
  // Opiniones que cumplen los filtros
  const list = filterReviews(store.reviews.all(), filters);
  // reduce suma todas las estrellas: empieza en 0 y en cada opinion anade su rating
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  // Respondemos 200 con:
  //   total         -> cuantas opiniones hay
  //   verified      -> cuantas estan verificadas (filtramos verified = true y contamos)
  //   averageRating -> nota media (suma / cantidad, redondeada). 0 si no hay opiniones
  //   byRating      -> cuantas opiniones hay de cada numero de estrellas (countBy)
  res.json({
    total: list.length,
    verified: list.filter((r) => r.verified).length,
    averageRating: list.length ? round2(sum / list.length) : 0,
    byRating: countBy(list, "rating"),
  });
}

// -------------------------------------------------------------------------------------
// GET /api/reviews/:id   (ejemplo: GET /api/reviews/4)
// CRUD: Read (una opinion concreta)
// Respuestas:
//   200 OK          -> la opinion
//   400 Bad Request -> id no valido (lo responde validateId)
//   404 Not Found   -> no existe una opinion con ese id
// -------------------------------------------------------------------------------------
function getReview(req, res) {
  // findById devuelve la opinion o null si no existe
  const review = store.reviews.findById(req.id);
  // No existe -> 404 y return para parar
  if (!review) return notFound(res);
  // Existe -> 200 con la opinion
  res.json(review);
}

// -------------------------------------------------------------------------------------
// POST /api/reviews -> 201 + Location
// CRUD: Create (publicar una opinion nueva)
// Body: { restaurantId, author, rating, comment, verified } (todos obligatorios)
// Respuestas:
//   201 Created     -> la opinion creada (con su id) + cabecera Location
//   400 Bad Request -> datos incorrectos, o el restaurantId no corresponde a ningun restaurante
// -------------------------------------------------------------------------------------
function createReview(req, res) {
  // 1) Validamos el formato de req.body (tipos, longitudes, rango de 1 a 5...)
  const { valid, value, errors } = validateReview(req.body);
  if (!valid) return res.status(400).json({ errors });
  // 2) Comprobamos la relacion: el restaurante tiene que existir. Si no -> 400
  //    (es 400 y no 404 porque lo que esta mal es un dato que ha enviado el cliente)
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  // 3) Guardamos en el store, que le asigna un id nuevo
  const created = store.reviews.create(value);
  // 4) 201 Created + cabecera "Location" con la URL de la nueva opinion (p. ej. /api/reviews/8)
  //    y en el cuerpo la opinion creada. req.baseUrl vale "/api/reviews"
  res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);
}

// -------------------------------------------------------------------------------------
// PUT /api/reviews/:id
// CRUD: Update (reemplazo COMPLETO: hay que enviar todos los campos)
// Respuestas:
//   200 OK          -> la opinion actualizada
//   400 Bad Request -> id no valido, datos incorrectos o restaurante inexistente
//   404 Not Found   -> no existe una opinion con ese id
// -------------------------------------------------------------------------------------
function replaceReview(req, res) {
  // Si la opinion no existe -> 404
  if (!store.reviews.findById(req.id)) return notFound(res);
  // Validamos el body completo
  const { valid, value, errors } = validateReview(req.body);
  if (!valid) return res.status(400).json({ errors });
  // El restaurante indicado tiene que existir -> si no, 400
  const related = relationErrors(value);
  if (related.length) return res.status(400).json({ errors: related });
  // replace sustituye todos los campos y devuelve la opinion nueva -> 200
  res.json(store.reviews.replace(req.id, value));
}

// -------------------------------------------------------------------------------------
// PATCH /api/reviews/:id
// CRUD: Update (actualizacion PARCIAL: solo los campos que se quieren cambiar)
// Ejemplo: PATCH /api/reviews/4  con body { "rating": 4 }
// Respuestas:
//   200 OK          -> la opinion con los cambios
//   400 Bad Request -> id no valido, datos incorrectos, body vacio o restaurante inexistente
//   404 Not Found   -> no existe una opinion con ese id
// -------------------------------------------------------------------------------------
function updateReview(req, res) {
  // Guardamos la opinion actual porque la necesitamos para comprobar la relacion
  const current = store.reviews.findById(req.id);
  if (!current) return notFound(res);
  // { partial: true }: los campos que no llegan no son obligatorios
  const { valid, value, errors } = validateReview(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  // { ...current, ...value } mezcla la opinion actual con los cambios (los cambios ganan),
  // asi tenemos el restaurantId final (el nuevo si se envio, o el que ya tenia) y lo comprobamos
  const related = relationErrors({ ...current, ...value });
  if (related.length) return res.status(400).json({ errors: related });
  // update cambia solo los campos recibidos y devuelve la opinion actualizada -> 200
  res.json(store.reviews.update(req.id, value));
}

// -------------------------------------------------------------------------------------
// DELETE /api/reviews/:id -> 204
// CRUD: Delete (borrar una opinion)
// Respuestas:
//   204 No Content  -> borrada correctamente (sin cuerpo)
//   400 Bad Request -> id no valido
//   404 Not Found   -> no existe una opinion con ese id
// -------------------------------------------------------------------------------------
function deleteReview(req, res) {
  // remove devuelve true si la borro y false si no existia -> 404
  if (!store.reviews.remove(req.id)) return notFound(res);
  // 204 No Content: todo bien pero no hay nada que devolver, por eso .end() sin JSON
  res.status(204).end();
}

// Exportamos las funciones para que el router (src/routes/reviews.js) las use
module.exports = { listReviews, reviewStats, getReview, createReview, replaceReview, updateReview, deleteReview };
