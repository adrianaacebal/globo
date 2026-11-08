// Capa de datos. Los controladores SOLO hablan con estas funciones, nunca con los arrays.
// Para pasar a una base de datos real basta con reescribir este archivo con la misma interfaz:
//   all() · findById(id) · find(predicate) · create(data) · replace(id, data) · update(id, changes) · remove(id)
// Colecciones: restaurants, dishes, users, orders, complaints, messages, reviews
const fs = require("fs");
const path = require("path");
const seed = require("./datos");

const copy = (item) => structuredClone(item);

// Crea una coleccion en memoria. onChange(items) se llama tras cada escritura (para guardar en disco).
function createCollection(initial = [], onChange = () => {}) {
  let nextId = initial.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  const items = initial.map((item) => (item.id ? copy(item) : { id: nextId++, ...copy(item) }));

  const indexOf = (id) => items.findIndex((item) => item.id === id);

  return {
    all() {
      return items.map(copy);
    },

    findById(id) {
      const item = items.find((i) => i.id === id);
      return item ? copy(item) : null;
    },

    find(predicate) {
      const item = items.find(predicate);
      return item ? copy(item) : null;
    },

    // El id siempre lo pone el servidor, aunque venga uno en data
    create(data) {
      const { id: _ignored, ...fields } = data;
      const item = { id: nextId++, ...copy(fields) };
      items.push(item);
      onChange(items);
      return copy(item);
    },

    // PUT: sustituye todos los campos (menos el id)
    replace(id, data) {
      const index = indexOf(id);
      if (index === -1) return null;
      const { id: _ignored, ...fields } = data;
      items[index] = { id, ...copy(fields) };
      onChange(items);
      return copy(items[index]);
    },

    // PATCH: cambia solo los campos recibidos
    update(id, changes) {
      const index = indexOf(id);
      if (index === -1) return null;
      const { id: _ignored, ...fields } = changes;
      items[index] = { ...items[index], ...copy(fields) };
      onChange(items);
      return copy(items[index]);
    },

    remove(id) {
      const index = indexOf(id);
      if (index === -1) return false;
      items.splice(index, 1);
      onChange(items);
      return true;
    },
  };
}

// ---------- Usuarios y pedidos: se guardan en data/*.json para no perderlos al reiniciar ----------
// En los tests (NODE_ENV=test) no se lee ni se escribe en disco: siempre se empieza con los datos de ejemplo.
const DATA_DIR = path.join(__dirname, "..", "data");
const USE_DISK = process.env.NODE_ENV !== "test";

function loadFile(name, fallback) {
  if (!USE_DISK) return fallback;
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
  } catch {
    return fallback;
  }
}

function saveFile(name) {
  if (!USE_DISK) return () => {};
  return (items) => {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(items, null, 2));
  };
}

module.exports = {
  restaurants: createCollection(seed.restaurants),
  dishes: createCollection(seed.dishes),
  users: createCollection(loadFile("users.json", seed.users), saveFile("users.json")),
  orders: createCollection(loadFile("orders.json", seed.orders), saveFile("orders.json")),
  complaints: createCollection(seed.complaints),
  messages: createCollection(seed.messages),
  reviews: createCollection(seed.reviews),
};
