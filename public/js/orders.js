// Script de orders.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
var STATUS_ICONS = { pending: "🕒", preparing: "🍳", "on-the-way": "🛵", delivered: "✅", cancelled: "❌" };

setupCrud({
    endpoint: "/api/orders",
    label: "order",
    describe: function (o) {
        return {
            icon: STATUS_ICONS[o.status] || "🧾",
            title: o.customer + " · " + o.total.toFixed(2) + " €",
            subtitle: o.status + " · " + o.type + " · restaurant #" + o.restaurantId +
                (o.riderId ? " · rider #" + o.riderId : "") + " · " + (o.paid ? "paid" : "not paid") + " · #" + o.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total, "💳 Paid: " + s.paid, "Revenue: " + s.revenue.toFixed(2) + " €", "Average: " + s.averageTotal.toFixed(2) + " €"];
        Object.keys(s.byStatus).forEach(function (st) { chips.push((STATUS_ICONS[st] || "") + " " + st + ": " + s.byStatus[st]); });
        return chips;
    }
});
