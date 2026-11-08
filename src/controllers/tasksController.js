// Handler logic for /tasks. In-memory store until Session 22 adds a database.
// The route file only calls these five functions (stable public API); it never touches the data directly.
let tasks = [
  { id: 1, title: "Write the API skeleton", done: true, userId: 1 },
  { id: 2, title: "Add a request logger", done: false, userId: 1 },
  { id: 3, title: "Split handlers into a controller", done: false, userId: 2 },
];
let nextId = 4;

// Builds a full task from the body. Optional fields that are omitted get their default,
// which is why PUT replaces the whole resource (PATCH would keep the old values).
// Returns { value } or { error }.
function parseTask(body) {
  const { title, done = false, userId = null } = body || {};
  if (typeof title !== "string" || title.trim() === "") {
    return { error: "title is required" };
  }
  if (typeof done !== "boolean") return { error: "done must be true or false" };
  if (userId !== null && !(Number.isInteger(userId) && userId > 0)) {
    return { error: "userId must be a positive integer" };
  }
  return { value: { title: title.trim(), done, userId } };
}

const findTask = (id) => tasks.find((t) => t.id === Number(id));
const notFound = (res) => res.status(404).json({ error: "Task not found" });

// GET /tasks -> 200 + all tasks
function listTasks(req, res) {
  res.json(tasks);
}

// GET /tasks/:id -> 200 + the task · 404
function getTask(req, res) {
  const task = findTask(req.params.id);
  if (!task) return notFound(res);
  res.json(task);
}

// POST /tasks -> 201 + Location + the created task · 400
function createTask(req, res) {
  const { value, error } = parseTask(req.body);
  if (error) return res.status(400).json({ error });
  const task = { id: nextId++, ...value };
  tasks.push(task);
  res.status(201).location(`/tasks/${task.id}`).json(task);
}

// PUT /tasks/:id -> 200 + the fully-replaced task · 404 · 400
function updateTask(req, res) {
  const task = findTask(req.params.id);
  if (!task) return notFound(res);
  const { value, error } = parseTask(req.body);
  if (error) return res.status(400).json({ error });
  const replaced = { id: task.id, ...value };
  tasks = tasks.map((t) => (t.id === task.id ? replaced : t));
  res.json(replaced);
}

// DELETE /tasks/:id -> 204 (empty body) · 404
function deleteTask(req, res) {
  const task = findTask(req.params.id);
  if (!task) return notFound(res);
  tasks = tasks.filter((t) => t.id !== task.id);
  res.status(204).end();
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
