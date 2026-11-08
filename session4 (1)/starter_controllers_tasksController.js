/*
  Starter — src/controllers/tasksController.js
  Session 15 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 5 · Session 15 · Practice (AF2) · Pair work

  Paste this file into src/controllers/tasksController.js.

  Do NOT rename the exports (listTasks, createTask) and do NOT change their
  (req, res, next) signatures — routes/tasks.js imports them by name.

  This module is a PLACEHOLDER on purpose. Today the data is a hard-coded
  array; Session 18 turns these handlers into full CRUD, and Session 22
  swaps the array for a real database model. Keep the seam clean: the route
  file should only ever call these functions, never touch data directly.
  The object shape matches the users + tasks schema you meet in Session 18.
*/

// Placeholder data — pretend this came from a database.
const tasks = [
  { id: 1, title: "Write the API skeleton", done: true, userId: 1 },
  { id: 2, title: "Add a request logger", done: false, userId: 1 },
  { id: 3, title: "Split handlers into a controller", done: false, userId: 2 },
];

// GET /tasks
function listTasks(req, res, next) {
  // TODO: respond with the tasks array as JSON (status 200 is the default).
}

// POST /tasks
function createTask(req, res, next) {
  // TODO (Lab 1): echo the parsed request body back as JSON with status 201.
  //   Because app.js registers express.json() first, req.body is already a
  //   JS object. Send back something like { received: req.body }.
  //   (Lab 2 will instead push a new task onto the array and return it.)
}

module.exports = { listTasks, createTask };
