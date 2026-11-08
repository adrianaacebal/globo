// Script de dishes.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
// Nombres e iconos para mostrar
var BRAND_NAMES = { burgerking: "Burger King", mcdonalds: "McDonald's", sushita: "Sushita", telepizza: "Telepizza", honestgreens: "Honest Greens" };
var CATEGORY_ICONS = { main: "🍽️", side: "🍟", drink: "🥤", dessert: "🍨" };

setupCrud({
    endpoint: "/api/dishes",
    label: "dish",
    plural: "dishes",
    describe: function (d) {
        return {
            icon: CATEGORY_ICONS[d.category] || "🍽️",
            title: d.name + " — " + d.price.toFixed(2) + " €",
            subtitle: (BRAND_NAMES[d.brand] || d.brand) + " · " + d.category + " · #" + d.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total];
        if (s.total > 0) {
            chips.push("Average: " + s.averagePrice.toFixed(2) + " €");
            chips.push("Cheapest: " + s.minPrice.toFixed(2) + " €");
            chips.push("Most expensive: " + s.maxPrice.toFixed(2) + " €");
        }
        Object.keys(s.byCategory).forEach(function (c) {
            chips.push((CATEGORY_ICONS[c] || "") + " " + c + ": " + s.byCategory[c].count);
        });
        return chips;
    }
});
