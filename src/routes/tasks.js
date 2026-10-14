<<<<<<< HEAD
// Thin router: only maps paths to controller functions.
const express = require("express");
const { listTasks, createTask } = require("../controllers/tasksController");

const router = express.Router();

router.get("/", listTasks);
router.post("/", createTask);
=======
const express = require("express");

const router = express.Router();

// In-memory store (resets every time the server restarts).
let tasks = [
  { id: 1, title: "Learn Express", done: false },
  { id: 2, title: "Write middleware", done: true },
];
let nextId = 3;

// GET /tasks -> list all tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id -> one task or 404
router.get("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// POST /tasks -> create a task from { title }
router.post("/", (req, res) => {
  const { title } = req.body || {};
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

// DELETE /tasks/:id -> remove a task
router.delete("/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  tasks.splice(index, 1);
  res.status(204).end();
});
>>>>>>> 9eda3b9fbd17ea6cb1a28d6bf045855c73526414

module.exports = router;
