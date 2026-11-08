// CRUD /api/messages tested in-process with supertest (no server to start).
const request = require("supertest");
const app = require("../src/app");

const valid = {
  name: "Leo Test",
  email: "leo@example.com",
  subject: "account",
  message: "How do I change my password?",
};

describe("GET /api/messages", () => {
  test("200 + array, filtered by subject", async () => {
    const res = await request(app).get("/api/messages?subject=account");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((m) => m.subject === "account")).toBe(true);
  });

  test("q searches the text", async () => {
    const res = await request(app).get("/api/messages?q=retiro");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test("400 on an invalid filter", async () => {
    const res = await request(app).get("/api/messages?subject=spam");
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("subject");
  });

  test("stats", async () => {
    const res = await request(app).get("/api/messages/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bySubject");
  });
});

describe("POST /api/messages", () => {
  test("201 + status defaults to new", async () => {
    const res = await request(app).post("/api/messages").send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...valid, status: "new" });
    expect(res.headers.location).toBe(`/api/messages/${res.body.id}`);
  });

  test("400 with every error at once", async () => {
    const res = await request(app).post("/api/messages").send({ message: "short" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors)).toEqual(expect.arrayContaining(["name", "email", "subject", "message"]));
  });
});

describe("GET / PUT / PATCH / DELETE /api/messages/:id", () => {
  test("GET 200 and 404", async () => {
    expect((await request(app).get("/api/messages/1")).status).toBe(200);
    expect((await request(app).get("/api/messages/9999")).status).toBe(404);
  });

  test("PUT 200 and 404", async () => {
    const res = await request(app).put("/api/messages/1").send({ ...valid, status: "answered" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, ...valid, status: "answered" });
    expect((await request(app).put("/api/messages/9999").send(valid)).status).toBe(404);
  });

  test("PATCH 400 if the body has no known field", async () => {
    const res = await request(app).patch("/api/messages/2").send({ foo: "bar" });
    expect(res.status).toBe(400);
  });

  test("DELETE 204 then 404", async () => {
    const created = await request(app).post("/api/messages").send(valid);
    expect((await request(app).delete(created.headers.location)).status).toBe(204);
    expect((await request(app).delete(created.headers.location)).status).toBe(404);
  });
});
