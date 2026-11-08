// Script de riders.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
// Iconos para mostrar
var VEHICLE_ICONS = { bike: "🚲", motorbike: "🛵", car: "🚗" };

setupCrud({
    endpoint: "/api/riders",
    label: "rider",
    describe: function (r) {
        return {
            icon: VEHICLE_ICONS[r.vehicle] || "🛵",
            title: r.name,
            subtitle: r.area + " · ⭐ " + r.rating + " · " + (r.available ? "✅ available" : "⛔ not available") + " · #" + r.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total, "✅ Available: " + s.available, "⭐ Average rating: " + s.averageRating];
        Object.keys(s.byVehicle).forEach(function (v) { chips.push((VEHICLE_ICONS[v] || "") + " " + v + ": " + s.byVehicle[v]); });
        return chips;
    }
});
