# GLOBO — Data model (Session 5, Step 0)

GLOBO is a food-ordering site for restaurant chains in Madrid (Burger King, McDonald's,
Sushita, Telepizza, Honest Greens). Users search for a restaurant near them, pick dishes
from its brand's menu and place a delivery or pickup order.

## 0.1 Pages

| Page | What the user sees | What the user can do | Data it needs |
|---|---|---|---|
| Home (`index.html`) | Brands and food types | Browse, go to a menu or to order | — |
| Menus (`burgers`, `pizza`, `sushi`, `vegan`) | Dishes of one brand | Browse | `GET /menu?restaurant=` |
| Search (`search.html`) | Map + list of restaurants | Filter by name, brand, area, type | `GET /api/restaurants?search=&brand=&area=&type=&delivery=` |
| Login (`login.html`) | Login / register form, order history | Log in, register, see past orders | `POST /login`, `GET /orders` |
| Order (`order.html`) | Restaurant, area, menu, price breakdown | Build an order, see the total, confirm it | `GET /api/restaurants`, `GET /menu`, `POST /order`, `POST /order/total`, `POST /orders` |
| Admin — restaurants (`restaurants.html`) | Table of restaurants | Create, edit, delete | `/api/restaurants` CRUD |
| Admin — dishes (`dishes.html`) | Table of dishes | Create, edit, delete | `/api/dishes` CRUD |
| Contact / Complaint | Static form | Send a message | — |

## 0.2 Entities

```
restaurants: { id: int, name: string, brand: enum, area: enum, type: enum, lat: number, lon: number }
dishes:      { id: int, name: string, brand: enum, category: enum, price: number }
users:       { id: int, name: string, email: string (unique), password: string, discountUsed: boolean }
orders:      { id: int, userId: int, restaurant: string, location: string, type: "delivery"|"pickup",
               payment: string, date: ISO string, subtotal, discount, deliveryFee, total: number }
orderItems:  { orderId: int, dish: string (→ dishes), quantity: int ≥ 1 }
```

Enums (fixed lists in `src/constants.js`, not entities because users never create them):

- `brand`: burgerking, mcdonalds, sushita, telepizza, honestgreens
- `area`: Centro, Chamartín, Chamberí, Fuencarral, Moncloa, Retiro, Tetuán
- `type`: burger, pizza, sushi, vegan
- `category`: main, side, drink, dessert

## 0.3 Relationships

```
brand (enum)  1 ───── N  restaurants     restaurants.brand
brand (enum)  1 ───── N  dishes          dishes.brand   → a brand's menu is shared by all its restaurants
users         1 ───── N  orders          orders.userId
restaurants   1 ───── N  orders          orders.restaurant + orders.location
orders        N ───── M  dishes          through orderItems (orderId, dish, quantity)
```

`orders` are their own collection (`/api/orders`, saved in `data/orders.json`) and point to the
user with `userId`; the dishes of each order are kept inside it (`items`). Practice 1 also added
`reviews` (→ `restaurants` via `restaurantId`), `complaints` and `messages`. In Session 22 orders
become `orders` and `order_items` tables with foreign keys, and `brand` can become a `brands` table.

## 0.4 CRUD build order

| # | Operation | Group | Why |
|---|---|---|---|
| 1 | `GET /api/restaurants`, `GET /api/restaurants/:id` | Seed | Search and order pages show nothing without them |
| 2 | `POST /api/restaurants` | Seed | Put real restaurants in the app |
| 3 | `GET /api/dishes`, `GET /api/dishes/:id`, `POST /api/dishes` | Seed | Menus; no dependencies |
| 4 | `POST /login` (register + log in) | Seed | Orders need a user |
| 5 | `PUT` / `PATCH` / `DELETE /api/restaurants/:id` and `/api/dishes/:id` | Complex | Admin pages; stricter validation |
| 6 | Filters `?search=&brand=&area=&type=&delivery=` and `/stats` | Complex | Search page |
| 7 | `POST /order`, `POST /order/total`, `POST /orders` | Complex | Must check restaurant (404), area and dishes exist |
| 8 | `GET /orders` | Complex | Depends on users + orders |

## REST conventions used

| Case | Status |
|---|---|
| Read / list / update | 200 |
| Create | 201 + `Location: /<collection>/:id` |
| Delete | 204, empty body |
| Invalid body, query or id | 400 with `{ errors: { field: message } }` |
| Unknown id or route | 404 |
| Duplicate (a brand already has a dish with that name) | 409 |
| Not logged in / wrong password | 401 |

`PUT` replaces the whole resource (all fields required); `PATCH` changes only the fields sent.
