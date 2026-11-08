/*
  Starter — src/routes/tasks.js
  Session 15 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 5 · Session 15 · Practice (AF2) · Pair work

  Paste this file into src/routes/tasks.js.

  Keep this file THIN — it only maps paths to controller functions; the
  logic lives in the controller. Do NOT change the export.

  This router is mounted at "/tasks" in app.js, so a path of "/" here
  means "/tasks", and "/:id" (a later lab) would mean "/tasks/:id".
*/

const express = require("express");
const { listTasks, createTask } = require("../controllers/tasksController");

const router = express.Router();

// TODO: wire GET  "/" -> listTasks
// TODO: wire POST "/" -> createTask

module.exports = router;
