// Capa de datos. Los controladores SOLO hablan con estas funciones, nunca con los arrays.
// Para pasar a una base de datos real basta con reescribir este archivo con la misma interfaz:
//   all() · findById(id) · find(predicate) · create(data) · replace(id, data) · update(id, changes) · remove(id)
const fs = require("fs");
const path = require("path");
const seed = require("./seed");

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

// ---------- Usuarios: se guardan en data/users.json para no perderlos al reiniciar ----------
const USERS_FILE = path.join(__dirname, "..", "..", "data", "users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return seed.users;
  }
}

function saveUsers(items) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(items, null, 2));
}

module.exports = {
  restaurants: createCollection(seed.restaurants),
  dishes: createCollection(seed.dishes),
  riders: createCollection(seed.riders),
  coupons: createCollection(seed.coupons),
  orders: createCollection(seed.orders),
  reviews: createCollection(seed.reviews),
  users: createCollection(loadUsers(), saveUsers),
};
