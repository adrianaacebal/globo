// Handler logic for /tasks. Placeholder data until Session 22 adds a database.
// The route file only calls these functions; it never touches the data directly.
const tasks = [
  { id: 1, title: "Write the API skeleton", done: true, userId: 1 },
  { id: 2, title: "Add a request logger", done: false, userId: 1 },
  { id: 3, title: "Split handlers into a controller", done: false, userId: 2 },
];

// GET /tasks
function listTasks(req, res, next) {
  res.json(tasks);
}

// POST /tasks — echoes the parsed body back (express.json() already parsed it)
function createTask(req, res, next) {
  res.status(201).json(req.body);
}

module.exports = { listTasks, createTask };
