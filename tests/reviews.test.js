// CRUD /api/reviews tested in-process with supertest (no server to start).
const request = require("supertest");
const app = require("../src/app");

const valid = { restaurantId: 4, author: "Iris Test", rating: 4, comment: "Quick and friendly." };

describe("GET /api/reviews", () => {
  test("filters by restaurant and minimum rating", async () => {
    const res = await request(app).get("/api/reviews?restaurantId=1&minRating=4");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((r) => r.restaurantId === 1 && r.rating >= 4)).toBe(true);
  });

  test("400 if minRating is out of range", async () => {
    const res = await request(app).get("/api/reviews?minRating=9");
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("minRating");
  });

  test("stats: average and per restaurant", async () => {
    const res = await request(app).get("/api/reviews/stats?restaurantId=1");
    expect(res.status).toBe(200);
    expect(res.body.averageRating).toBeGreaterThan(0);
    expect(res.body.byRestaurant["1"].restaurant).toBe("Burger King Chamartín");
  });
});

describe("POST /api/reviews", () => {
  test("201 + Location", async () => {
    const res = await request(app).post("/api/reviews").send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(valid);
    expect(res.headers.location).toBe(`/api/reviews/${res.body.id}`);
  });

  test("400 if the restaurant does not exist or the rating is not a whole number 1-5", async () => {
    const res = await request(app).post("/api/reviews").send({ ...valid, restaurantId: 9999, rating: 4.5 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("restaurantId");
    expect(res.body.errors).toHaveProperty("rating");
  });
});

describe("GET / PUT / PATCH / DELETE /api/reviews/:id", () => {
  test("GET 200 and 404", async () => {
    expect((await request(app).get("/api/reviews/1")).status).toBe(200);
    expect((await request(app).get("/api/reviews/9999")).status).toBe(404);
  });

  test("PUT replaces the review", async () => {
    const res = await request(app).put("/api/reviews/2").send(valid);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 2, ...valid });
  });

  test("PATCH changes only the rating", async () => {
    const before = (await request(app).get("/api/reviews/3")).body;
    const res = await request(app).patch("/api/reviews/3").send({ rating: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...before, rating: 1 });
  });

  test("DELETE 204 then 404", async () => {
    const created = await request(app).post("/api/reviews").send(valid);
    expect((await request(app).delete(created.headers.location)).status).toBe(204);
    expect((await request(app).get(created.headers.location)).status).toBe(404);
  });

  test("deleting a restaurant deletes its reviews", async () => {
    const restaurant = await request(app)
      .post("/api/restaurants")
      .send({ name: "Sushita Test", brand: "sushita", area: "Centro", type: "sushi", lat: 40.4, lon: -3.7 });
    const review = await request(app).post("/api/reviews").send({ ...valid, restaurantId: restaurant.body.id });
    await request(app).delete(restaurant.headers.location);
    expect((await request(app).get(review.headers.location)).status).toBe(404);
  });
});
