// Handler logic for /orders. Placeholder data until we add a database.
const orders = [
  {
    id: 1,
    restaurant: "Burger King",
    dishes: [{ name: "Whopper", quantity: 2 }, { name: "Fries", quantity: 1 }],
    status: "pending",
    userId: 1,
  },
  {
    id: 2,
    restaurant: "Sushi",
    dishes: [{ name: "California roll", quantity: 1 }],
    status: "delivered",
    userId: 1,
  },
  {
    id: 3,
    restaurant: "Pizza",
    dishes: [{ name: "Margherita", quantity: 1 }],
    status: "pending",
    userId: 2,
  },
];

// GET /orders
function listOrders(req, res) {
  res.json(orders);
}

// POST /orders — echoes the parsed body back
function createOrder(req, res) {
  res.status(201).json(req.body);
}

module.exports = { listOrders, createOrder };
