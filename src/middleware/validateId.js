// =====================================================================================
// middleware/validateId.js  ->  COMPRUEBA el :id de la URL antes de llegar al controlador.
// =====================================================================================
// Se usa en los routers con router.param("id", validateId): Express ejecuta esta funcion
// automaticamente en cualquier ruta del router que tenga :id (por ejemplo GET /:id,
// PUT /:id, PATCH /:id, DELETE /:id). Asi no repetimos la comprobacion en cada controlador.
// "/restaurants/abc" -> 400 · "/restaurants/7" -> req.id = 7
// =====================================================================================
//
// Ademas de req, res y next, router.param pasa un cuarto valor: value, el texto del :id
// tal como viene en la URL (siempre es texto, por ejemplo "7").
function validateId(req, res, next, value) {
  // Expresion regular: ^ inicio, [1-9] un primer digito del 1 al 9, \d* cero o mas digitos,
  // $ final. Solo acepta enteros positivos: rechaza "abc", "0", "-3", "1.5" o "07".
  // ! = "no": si NO cumple el patron, respondemos 400 Bad Request (dato del cliente incorrecto),
  // con el mismo formato { errors: [{ field, message }] } que usan los validators.
  if (!/^[1-9]\d*$/.test(value)) {
    return res.status(400).json({ errors: [{ field: "id", message: "id must be a positive integer" }] });
  }
  // El id es valido: lo convertimos de texto a numero y lo guardamos en req.id.
  // Los controladores usan req.id (por ejemplo store.restaurants.findById(req.id)).
  req.id = Number(value);
  // Pasamos a la siguiente pieza: el controlador de la ruta.
  next();
}

// Se exporta para usarla en los archivos de src/routes/.
module.exports = validateId;
