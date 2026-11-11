// Script de complaints.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
// Nombres e iconos para mostrar
var BRAND_NAMES = { burgerking: "Burger King", mcdonalds: "McDonald's", sushita: "Sushita", telepizza: "Telepizza", honestgreens: "Honest Greens" };
var STATUS_ICONS = { open: "🔴", "in progress": "🟡", resolved: "🟢" };
var TYPE_NAMES = { delivery: "Delivery issue", food: "Food quality", payment: "Payment issue", other: "Other" };

// No se puede elegir una fecha futura (el servidor tambien lo comprueba)
document.getElementById("c-date").max = new Date().toISOString().slice(0, 10);

setupCrud({
    endpoint: "/api/complaints",
    label: "complaint",
    describe: function (c) {
        return {
            icon: STATUS_ICONS[c.status] || "📋",
            title: TYPE_NAMES[c.type] + " — " + (BRAND_NAMES[c.brand] || c.brand),
            subtitle: c.message + " · " + c.name + " (" + c.email + ") · " + c.date + " · " + c.status + " · #" + c.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total];
        Object.keys(s.byStatus).forEach(function (st) { chips.push((STATUS_ICONS[st] || "") + " " + st + ": " + s.byStatus[st]); });
        Object.keys(s.byType).forEach(function (t) { chips.push((TYPE_NAMES[t] || t) + ": " + s.byType[t]); });
        return chips;
    }
});
