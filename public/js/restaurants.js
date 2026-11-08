// Script de restaurants.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
// Nombres e iconos para mostrar
var BRAND_NAMES = { burgerking: "Burger King", mcdonalds: "McDonald's", sushita: "Sushita", telepizza: "Telepizza", honestgreens: "Honest Greens" };
var TYPE_ICONS = { burger: "🍔", pizza: "🍕", sushi: "🍣", vegan: "🥗" };

setupCrud({
    endpoint: "/api/restaurants",
    label: "restaurant",
    describe: function (r) {
        return {
            icon: TYPE_ICONS[r.type] || "📍",
            title: r.name,
            subtitle: (BRAND_NAMES[r.brand] || r.brand) + " · " + r.area + " · " + (r.delivery ? "🛵 delivery" : "🏪 pickup only") + " · #" + r.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total, "🛵 Delivery: " + s.withDelivery, "🏪 Pickup only: " + s.pickupOnly];
        Object.keys(s.byType).forEach(function (t) { chips.push((TYPE_ICONS[t] || "") + " " + t + ": " + s.byType[t]); });
        Object.keys(s.byArea).forEach(function (a) { chips.push("📍 " + a + ": " + s.byArea[a]); });
        return chips;
    }
});
