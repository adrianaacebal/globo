// Script de contact.html: envia el mensaje a POST /api/messages (con setupSendForm, js/sendForm.js)
setupSendForm({
    form: document.getElementById("message-form"),
    endpoint: "/api/messages",
    errorBox: document.getElementById("message-error"),
    success: document.getElementById("message-success"),
    againButton: document.getElementById("new-message-btn")
});
