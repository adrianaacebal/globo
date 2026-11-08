// Script de reviews.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
setupCrud({
    endpoint: "/api/reviews",
    label: "review",
    describe: function (r) {
        return {
            icon: r.verified ? "✅" : "💬",
            title: "⭐".repeat(r.rating) + " " + r.author,
            subtitle: "“" + r.comment + "” · restaurant #" + r.restaurantId + " · #" + r.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total, "✅ Verified: " + s.verified, "⭐ Average: " + s.averageRating];
        Object.keys(s.byRating).forEach(function (n) { chips.push("⭐".repeat(Number(n)) + ": " + s.byRating[n]); });
        return chips;
    }
});
