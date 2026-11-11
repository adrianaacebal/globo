// Script de complaint.html: envia la reclamacion a POST /api/complaints (con setupSendForm, js/sendForm.js)

// No se puede elegir una fecha futura (el servidor tambien lo comprueba)
document.getElementById("incident-date").max = new Date().toISOString().slice(0, 10);

setupSendForm({
    form: document.getElementById("complaint-form"),
    endpoint: "/api/complaints",
    errorBox: document.getElementById("complaint-error"),
    success: document.getElementById("report-success"),
    againButton: document.getElementById("new-complaint-btn"),
    onCreated: function (complaint) {
        document.getElementById("complaint-ref").textContent = "#" + complaint.id;
    }
});
