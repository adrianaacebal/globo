// Session 5 lab: CRUD /tasks tested in-process with supertest (no server to start).
const request = require("supertest");
const app = require("../src/app");

describe("GET /tasks", () => {
  test("200 + array of tasks", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /tasks/:id", () => {
  test("200 + the one task", async () => {
    const res = await request(app).get("/tasks/1");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, title: "Write the API skeleton" });
  });

  test("404 if no task has that id", async () => {
    const res = await request(app).get("/tasks/9999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /tasks", () => {
  test("201 + Location header + created task", async () => {
    const res = await request(app).post("/tasks").send({ title: "Learn REST" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Learn REST", done: false });
    expect(typeof res.body.id).toBe("number");
    expect(res.headers.location).toBe(`/tasks/${res.body.id}`);

    // The new task can be read back at its Location
    const read = await request(app).get(res.headers.location);
    expect(read.status).toBe(200);
    expect(read.body).toEqual(res.body);
  });

  test("400 if title is missing", async () => {
    const res = await request(app).post("/tasks").send({});
    expect(res.status).toBe(400);
  });

  test("400 if title is empty", async () => {
    const res = await request(app).post("/tasks").send({ title: "   " });
    expect(res.status).toBe(400);
  });
});

describe("PUT /tasks/:id", () => {
  test("200 + the fully-replaced task (omitted optional fields reset to default)", async () => {
    // Task 1 starts with done: true and userId: 1
    const res = await request(app).put("/tasks/1").send({ title: "Rewritten" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: "Rewritten", done: false, userId: null });
  });

  test("404 if not found", async () => {
    const res = await request(app).put("/tasks/9999").send({ title: "x" });
    expect(res.status).toBe(404);
  });

  test("400 if no title", async () => {
    const res = await request(app).put("/tasks/2").send({ done: true });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /tasks/:id", () => {
  test("204 with empty body, then 404 on the deleted task", async () => {
    const res = await request(app).delete("/tasks/3");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");

    const again = await request(app).get("/tasks/3");
    expect(again.status).toBe(404);
  });

  test("404 if no task has that id", async () => {
    const res = await request(app).delete("/tasks/9999");
    expect(res.status).toBe(404);
  });
});
