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

    // Comprobacion en el navegador ANTES de mandar nada (el servidor vuelve a validarlo todo).
    // Usa los atributos del HTML: required, minlength, type="email" y max en las fechas.
    // Devuelve la misma forma que el servidor: [ { field, message } ]
    function clientErrors() {
        var errors = [];
        Array.prototype.forEach.call(form.elements, function (el) {
            if (!el.name) return;
            var value = el.value.trim();
            if (value === "") {
                if (el.required) errors.push({ field: el.name, message: el.name + " is required" });
                return;
            }
            if (el.minLength > 0 && value.length < el.minLength) {
                errors.push({ field: el.name, message: el.name + " must have at least " + el.minLength + " characters" });
            } else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push({ field: el.name, message: el.name + " must be a valid email" });
            } else if (el.type === "date" && el.max && value > el.max) {
                errors.push({ field: el.name, message: el.name + " cannot be in the future" });
            }
        });
        return errors;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearErrors();

        var local = clientErrors();
        if (local.length > 0) {
            showFieldErrors(local);
            showError("Please fix the fields marked in red.");
            return;   // no se manda nada al servidor
        }

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
