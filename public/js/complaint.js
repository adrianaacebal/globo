<<<<<<< HEAD
// Script de complaint.html
// No hay servidor: al enviar, se oculta el formulario y se ensena
// el mensaje de exito en vez de recargar la pagina.
var complaintForm = document.getElementById("complaint-form");
var success = document.getElementById("report-success");

complaintForm.addEventListener("submit", function (event) {
    event.preventDefault();
    complaintForm.reset();
    complaintForm.hidden = true;
    success.hidden = false;
});

// Volver a ensenar el formulario para enviar otra queja
document.getElementById("new-complaint-btn").addEventListener("click", function () {
    success.hidden = true;
    complaintForm.hidden = false;
=======
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
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
});
