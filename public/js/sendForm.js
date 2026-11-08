// setupSendForm(cfg): formulario publico que crea UN elemento con POST (complaint.html y contact.html).
// Las peticiones pasan por apiRequest (js/api.js). Si el servidor devuelve 400, cada error sale debajo de su campo.
//
//   cfg = { form, endpoint, errorBox, success, againButton, sendingText, onCreated(item) }
function setupSendForm(cfg) {
    var form = cfg.form;
    var submitBtn = form.querySelector("button[type=submit]");
    var buttonText = submitBtn.textContent;

    function clearErrors() {
        form.querySelectorAll(".field-error").forEach(function (p) { p.textContent = ""; });
        form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
        cfg.errorBox.hidden = true;
    }

    function showError(text) {
        cfg.errorBox.textContent = text;
        cfg.errorBox.hidden = false;
    }

    // errors = [ { field, message }, ... ] (lo que manda el servidor en un 400)
    function showFieldErrors(errors) {
        errors.forEach(function (error) {
            var slot = form.querySelector('[data-error-for="' + error.field + '"]');
            var input = form.querySelector('[name="' + error.field + '"]');
            if (slot) slot.textContent = error.message;
            if (input) input.setAttribute("aria-invalid", "true");
        });
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearErrors();
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
        try {
            var result = await apiRequest("POST", cfg.endpoint, Object.fromEntries(new FormData(form)));
            if (!result.ok) {
                if (result.data && result.data.errors) showFieldErrors(result.data.errors);
                showError((result.data && result.data.error) || "Please fix the fields marked in red.");
                return;
            }
            if (cfg.onCreated) cfg.onCreated(result.data);
            form.reset();
            form.hidden = true;
            cfg.success.hidden = false;
        } catch (err) {
            showError("Could not connect to the server. Please try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = buttonText;
        }
    });

    // Volver a ensenar el formulario para enviar otro
    cfg.againButton.addEventListener("click", function () {
        cfg.success.hidden = true;
        form.hidden = false;
    });
}
