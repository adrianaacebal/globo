// Handler logic for /tasks. Placeholder data until Session 22 adds a database.
const tasks = [
  { id: 1, title: "Write the API skeleton", done: false, userId: 1 },
  { id: 2, title: "Add a logger middleware", done: true, userId: 1 },
  { id: 3, title: "Register the error handler", done: false, userId: 2 },
];

// GET /tasks
function listTasks(req, res) {
  res.json(tasks);
}

// POST /tasks — echoes the parsed body back
function createTask(req, res) {
  res.status(201).json(req.body);
}

module.exports = { listTasks, createTask };
