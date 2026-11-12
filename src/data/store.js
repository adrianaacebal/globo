// =====================================================================
// STORE: LA CAPA DE DATOS  (archivo: src/data/store.js)
// =====================================================================
// Que es el "store"?
//   Es el "almacen" de la aplicacion: el unico sitio donde se guardan y se leen los
//   datos (restaurantes, platos, repartidores, cupones, pedidos, opiniones,
//   reclamaciones, mensajes y usuarios).
//
// Donde se guardan los datos?
//   En MEMORIA: cada coleccion es un array de JavaScript dentro del proceso de Node.
//   Es rapido y sencillo, pero al reiniciar el servidor esos arrays se vuelven a
//   crear desde seed.js (los datos iniciales) y se pierden los cambios.
//   Excepcion: los USUARIOS se guardan tambien en el archivo data/users.json para no
//   perder las cuentas (ni su historial de pedidos) al reiniciar.
//
// Regla importante:
//   Los controladores SOLO hablan con estas funciones, nunca tocan los arrays.
//   Todas las colecciones tienen la misma "interfaz" (las mismas funciones):
//     all()               -> todos los elementos                 (Read)
//     findById(id)        -> uno por id, o null                  (Read)
//     find(predicate)     -> el primero que cumpla una condicion (Read)
//     create(data)        -> crea uno nuevo con id nuevo         (Create)
//     replace(id, data)   -> sustituye uno entero (PUT)          (Update)
//     update(id, changes) -> cambia algunos campos (PATCH)       (Update)
//     remove(id)          -> borra uno (true/false)              (Delete)
//   Ejemplo en un controlador: store.dishes.findById(3)
//
// Por que asi?
//   Para pasar a una base de datos real (MongoDB, MySQL...) basta con reescribir
//   ESTE archivo manteniendo esa misma interfaz. Los controladores y las rutas no
//   tendrian que cambiar nada, porque siguen llamando a las mismas funciones.
// =====================================================================
// fs (file system): modulo de Node para leer y escribir archivos (lo usamos para users.json).
const fs = require("fs");
// path: modulo de Node para construir rutas de carpetas/archivos que funcionen en cualquier sistema.
const path = require("path");
// seed: los datos iniciales de ejemplo (ver src/data/seed.js).
const seed = require("./seed");

// copy(item) devuelve una COPIA completa del objeto (structuredClone copia tambien
// los objetos y arrays que lleva dentro: "copia profunda").
// Por que copias? Si devolvieramos el objeto original, un controlador podria hacer
// por error  dish.price = 0  y estaria cambiando el dato guardado sin pasar por
// update(). Con copias, la UNICA forma de cambiar datos es usar las funciones del store.
// Tambien copiamos al guardar, para que quien nos pasa los datos no pueda cambiarlos despues.
const copy = (item) => structuredClone(item);

// createCollection crea UNA coleccion en memoria (por ejemplo, la de platos) y
// devuelve un objeto con sus funciones (all, findById, create...).
//   - initial: los datos con los que empieza (normalmente un array de seed.js).
//   - onChange(items): se llama tras cada escritura (create, replace, update, remove).
//     Por defecto no hace nada; en usuarios la usamos para guardar en disco.
// CLOSURE (clausura): las variables "items" y "nextId" se crean dentro de esta funcion.
// Las funciones que devolvemos las "recuerdan" y pueden usarlas siempre, pero desde
// fuera nadie puede acceder a ellas directamente: estan "escondidas" (privadas).
// Y cada llamada a createCollection crea su propio "items" y su propio "nextId",
// por eso los restaurantes y los platos no se mezclan.
function createCollection(initial = [], onChange = () => {}) {
  // nextId: el siguiente id libre = el id mas alto que ya exista + 1 (o 1 si no hay ninguno).
  // reduce recorre el array quedandose con el maximo.
  let nextId = initial.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  // items: el array "privado" con los datos. A los datos iniciales que no traen id
  // (como los restaurantes de seed.js) se les pone uno: 1, 2, 3... en orden.
  // Los que ya traen id (como los usuarios) lo conservan.
  const items = initial.map((item) => (item.id ? copy(item) : { id: nextId++, ...copy(item) }));

  // Funcion auxiliar: posicion (indice) en el array del elemento con ese id, o -1 si no esta.
  const indexOf = (id) => items.findIndex((item) => item.id === id);

  // Devolvemos un objeto con las funciones publicas de la coleccion.
  return {
    // all(): devuelve TODOS los elementos (copias). Lo usan los GET de listado y /stats.
    all() {
      return items.map(copy);
    },

    // findById(id): devuelve el elemento con ese id (copia), o null si no existe.
    // Lo usan GET /:id, PUT, PATCH... (el controlador responde 404 si es null).
    findById(id) {
      const item = items.find((i) => i.id === id);
      return item ? copy(item) : null;
    },

    // find(predicate): devuelve el PRIMER elemento que cumpla la condicion, o null.
    // "predicate" es una funcion que devuelve true/false, p. ej.:
    //   store.users.find((u) => u.email === "ana@example.com")
    find(predicate) {
      const item = items.find(predicate);
      return item ? copy(item) : null;
    },

    // create(data): crea un elemento nuevo (POST -> CRUD Create).
    // El id siempre lo pone el servidor, aunque venga uno en data.
    // Por que? Para que los ids sean unicos y seguidos: si el cliente pudiera elegirlo,
    // podria repetir uno que ya existe y "pisar" otro dato, o inventarse ids raros.
    // { id: _ignored, ...fields } = separa el id (que tiramos) del resto de campos.
    create(data) {
      const { id: _ignored, ...fields } = data;
      // nextId++ usa el id actual y luego lo suma 1 para el siguiente.
      const item = { id: nextId++, ...copy(fields) };
      items.push(item);
      // Avisamos de que ha habido un cambio (en usuarios: se guarda en users.json).
      onChange(items);
      return copy(item);
    },

    // replace(id, data): PUT -> sustituye TODOS los campos (menos el id).
    // El elemento queda exactamente con los campos de data: si un campo no viene, desaparece.
    // Devuelve el elemento nuevo, o null si no existe ese id.
    replace(id, data) {
      const index = indexOf(id);
      if (index === -1) return null;
      const { id: _ignored, ...fields } = data;
      items[index] = { id, ...copy(fields) };
      onChange(items);
      return copy(items[index]);
    },

    // update(id, changes): PATCH -> cambia SOLO los campos recibidos.
    // { ...items[index], ...fields } = primero todos los campos que ya tenia y encima
    // los nuevos (si un campo esta en los dos, gana el nuevo). El resto no cambia.
    // Ej.: { status: "delivered" } cambia solo el estado del pedido.
    update(id, changes) {
      const index = indexOf(id);
      if (index === -1) return null;
      const { id: _ignored, ...fields } = changes;
      items[index] = { ...items[index], ...copy(fields) };
      onChange(items);
      return copy(items[index]);
    },

    // remove(id): DELETE -> borra el elemento. Devuelve true si lo borro, false si no existia.
    // splice(index, 1) quita 1 elemento del array en esa posicion.
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
// Por que solo los usuarios? Porque son las cuentas de la gente (con su contrasena,
// su codigo de descuento y su historial de pedidos): seria muy molesto perderlas.
// El resto de colecciones son datos de practica y se pueden volver a crear desde seed.js.
// Ruta del archivo: desde src/data/ subimos dos carpetas (..  ..) hasta la raiz del
// proyecto y entramos en data/users.json.
const USERS_FILE = path.join(__dirname, "..", "..", "data", "users.json");

// Lee los usuarios del archivo al arrancar el servidor.
// JSON.parse convierte el texto JSON del archivo en un array de objetos de JavaScript.
// Si el archivo no existe o esta roto (catch), usamos los usuarios de ejemplo de seed.js.
function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return seed.users;
  }
}

// Guarda todos los usuarios en el archivo. Se usa como onChange de la coleccion de
// usuarios, asi que se ejecuta despues de cada create/replace/update/remove.
function saveUsers(items) {
  // Crea la carpeta data/ si no existe (recursive: true = no da error si ya existe).
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  // JSON.stringify convierte el array en texto JSON; null, 2 = con sangria de 2 espacios para que se lea bien.
  fs.writeFileSync(USERS_FILE, JSON.stringify(items, null, 2));
}

// Exportamos una coleccion por cada recurso. Los controladores hacen
// const store = require("../data/store")  y luego  store.dishes.all(), store.orders.create(...)...
// Todas salen de seed.js y viven solo en memoria (sin onChange: no se guardan en disco).
// La de usuarios sale de users.json (o de seed.users) y lleva saveUsers para guardarse en disco.
module.exports = {
  restaurants: createCollection(seed.restaurants),
  dishes: createCollection(seed.dishes),
  riders: createCollection(seed.riders),
  coupons: createCollection(seed.coupons),
  orders: createCollection(seed.orders),
  reviews: createCollection(seed.reviews),
  complaints: createCollection(seed.complaints),
  messages: createCollection(seed.messages),
  users: createCollection(loadUsers(), saveUsers),
};
