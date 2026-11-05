const { BRAND_KEYS } = require("./constants");

// Normaliza texto para comparar: minusculas, sin tildes, sin espacios ni apostrofes
// ("McDonald's" -> "mcdonalds", "Chamberí" -> "chamberi")
function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Busca un valor en una lista fija sin importar mayusculas/tildes y devuelve el valor oficial
// pickOption(AREAS, "chamberi") -> "Chamberí"   ·   pickOption(AREAS, "Paris") -> undefined
function pickOption(options, value) {
  const wanted = normalize(value);
  return options.find((option) => normalize(option) === wanted);
}

// Marca a partir de un nombre de local: "Telepizza Gran Vía" -> "telepizza"
function brandKeyFromName(name) {
  const clean = normalize(name);
  return clean ? BRAND_KEYS.find((key) => clean.startsWith(key)) : undefined;
}

const round2 = (n) => Math.round(n * 100) / 100;

module.exports = { normalize, pickOption, brandKeyFromName, round2 };
