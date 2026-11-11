// Script de messages.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
// Iconos para mostrar
var STATUS_ICONS = { "new": "🆕", read: "👀", answered: "✅" };
var SUBJECT_ICONS = { order: "🧾", restaurant: "🏪", account: "👤", other: "💬" };

setupCrud({
    endpoint: "/api/messages",
    label: "message",
    describe: function (m) {
        return {
            icon: STATUS_ICONS[m.status] || "💬",
            title: (SUBJECT_ICONS[m.subject] || "") + " " + m.subject + " — " + m.name,
            subtitle: m.message + " · " + m.email + " · " + m.status + " · #" + m.id
        };
    },
    renderStats: function (s) {
        var chips = ["Total: " + s.total];
        Object.keys(s.byStatus).forEach(function (st) { chips.push((STATUS_ICONS[st] || "") + " " + st + ": " + s.byStatus[st]); });
        Object.keys(s.bySubject).forEach(function (sub) { chips.push((SUBJECT_ICONS[sub] || "") + " " + sub + ": " + s.bySubject[sub]); });
        return chips;
    }
});
