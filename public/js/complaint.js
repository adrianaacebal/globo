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
});
