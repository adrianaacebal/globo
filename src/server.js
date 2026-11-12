// =====================================================================================
// server.js  ->  PUNTO DE ENTRADA del servidor (es lo primero que se ejecuta).
// =====================================================================================
// Cuando escribimos "npm start" (o "node src/server.js"), Node empieza por este archivo.
// Su unico trabajo es: 1) traer la aplicacion de Express ya montada (app.js) y
// 2) ponerla a "escuchar" en un puerto, es decir, esperar peticiones HTTP del navegador.
//
// Recorrido de una peticion en este proyecto:
//   server.js (arranca)  ->  app.js (configura Express)  ->  middleware (json, logger...)
//   ->  routes/ (que URL va a que funcion)  ->  controllers/ (la logica de cada peticion)
//   ->  validators/ (comprueban que los datos que llegan son correctos)
//   ->  data/store.js (donde se guardan y leen los datos)  ->  respuesta JSON al cliente.
//
// Por que separar server.js y app.js: los tests (carpeta tests/, con supertest) importan
// app.js directamente y hacen peticiones sin abrir un puerto de verdad.
// =====================================================================================
//
// require("./app") carga el archivo app.js (la extension .js se puede omitir) y nos da
// lo que ese archivo exporta con module.exports: en este caso, la aplicacion de Express.
const app = require("./app");

// Puerto donde escucha el servidor. process.env son las "variables de entorno" del sistema:
// si alguien define PORT (por ejemplo un servidor en la nube) se usa ese; si no, el 3000.
// El operador || significa "si lo de la izquierda no tiene valor, usa lo de la derecha".
const PORT = process.env.PORT || 3000;

// app.listen arranca el servidor HTTP en ese puerto. La funcion flecha () => { ... } es un
// "callback": Express la llama cuando el servidor ya esta listo, y entonces escribimos en la
// terminal la direccion donde abrir la web (las comillas invertidas permiten meter ${PORT}).
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
