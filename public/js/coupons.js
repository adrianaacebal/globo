// Script de coupons.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
var ORDER_TYPE_NAMES = { all: "all orders", delivery: "delivery orders", pickup: "pickup orders" };

setupCrud({
    endpoint: "/api/coupons",
    label: "coupon",
    describe: function (c) {
        return {
            icon: c.active ? "🏷️" : "⛔",
            title: c.code,
            subtitle: c.percent + "% off · " + ORDER_TYPE_NAMES[c.orderType] + " · " + (c.active ? "active" : "inactive") + " · #" + c.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total, "✅ Active: " + s.active, "Average discount: " + s.averagePercent + "%"];
        Object.keys(s.byOrderType).forEach(function (t) { chips.push(ORDER_TYPE_NAMES[t] + ": " + s.byOrderType[t]); });
        return chips;
    }
});
