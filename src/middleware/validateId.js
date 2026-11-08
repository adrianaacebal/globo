// Se usa con router.param("id", validateId): comprueba :id antes de llegar al controlador.
// "/restaurants/abc" -> 400 · "/restaurants/7" -> req.id = 7
function validateId(req, res, next, value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return res.status(400).json({ errors: [{ field: "id", message: "id must be a positive integer" }] });
  }
  req.id = Number(value);
  next();
}

module.exports = validateId;
