// Pantalla de gestion (restaurants.html y dishes.html): lista + filtros + estadisticas + formulario.
// Todo pasa por el API: los filtros se aplican en el servidor, no aqui.
//
// La pagina llama a setupCrud({ endpoint, label, plural, describe, renderStats }) y tiene estos elementos:
//   #filters (form) · #filters-reset · #stats · #list-state · #items · #item-form · #form-title
//   #form-message · #cancel-edit · y un <p class="field-error" data-error-for="campo"> por campo
function setupCrud(cfg) {
    var filters = document.getElementById("filters");
    var stats = document.getElementById("stats");
    var state = document.getElementById("list-state");
    var list = document.getElementById("items");
    var form = document.getElementById("item-form");
    var formTitle = document.getElementById("form-title");
    var formMessage = document.getElementById("form-message");
    var cancelBtn = document.getElementById("cancel-edit");
    var submitBtn = form.querySelector("button[type=submit]");
    var editingId = null;   // null = crear · numero = editar ese id
    var lastLoad = 0;       // para ignorar respuestas viejas si se escribe rapido

    // ---------- Peticiones ----------
    // Devuelve { ok, status, data }. Si no hay servidor lanza un error.
    async function api(method, url, body) {
        var response = await fetch(url, {
            method: method,
            headers: body ? { "Content-Type": "application/json" } : {},
            body: body ? JSON.stringify(body) : undefined
        });
        var data = response.status === 204 ? null : await response.json();
        return { ok: response.ok, status: response.status, data: data };
    }

    // Solo los filtros con valor: { area: "Centro" } -> "?area=Centro"
    function queryString() {
        var params = new URLSearchParams();
        new FormData(filters).forEach(function (value, key) {
            if (String(value).trim() !== "") params.append(key, String(value).trim());
        });
        var text = params.toString();
        return text ? "?" + text : "";
    }

    // ---------- Errores junto a cada campo ----------
    function clearErrors(box) {
        box.querySelectorAll(".field-error").forEach(function (p) { p.textContent = ""; });
        box.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    }

    // errors = [ { field, message }, ... ] (lo que manda el servidor en un 400).
    // Cada mensaje sale debajo de su campo; lo que no tiene sitio (p. ej. "body") se devuelve como texto
    function showErrors(box, errors) {
        var rest = [];
        errors.forEach(function (error) {
            var slot = box.querySelector('[data-error-for="' + error.field + '"]');
            if (slot) {
                slot.textContent = error.message;
                var input = box.querySelector('[name="' + error.field + '"]');
                if (input) input.setAttribute("aria-invalid", "true");
            } else {
                rest.push(error.message);
            }
        });
        return rest.join(" ");
    }

    // Comprobacion en el navegador ANTES de mandar nada (el servidor vuelve a validarlo todo).
    // Mira los campos con required y los min/max/maxlength del HTML. Devuelve la misma forma que el servidor.
    function clientErrors() {
        var errors = [];
        Array.prototype.forEach.call(form.elements, function (el) {
            if (!el.name || el.type === "checkbox") return;
            var value = el.value.trim();
            if (value === "") {
                if (el.required) errors.push({ field: el.name, message: el.name + " is required" });
                return;
            }
            if (el.type === "number") {
                var n = Number(value);
                if (el.min !== "" && n < Number(el.min) || el.max !== "" && n > Number(el.max)) {
                    errors.push({ field: el.name, message: el.name + " must be between " + el.min + " and " + el.max });
                }
            }
            if (el.minLength > 0 && value.length < el.minLength) {
                errors.push({ field: el.name, message: el.name + " must have at least " + el.minLength + " characters" });
            }
        });
        return errors;
    }

    // Lee el formulario: los checkbox se mandan como true/false y los campos vacios no se mandan
    function formBody() {
        var body = {};
        Array.prototype.forEach.call(form.elements, function (el) {
            if (!el.name) return;
            if (el.type === "checkbox") body[el.name] = el.checked;
            else if (el.value.trim() !== "") body[el.name] = el.value.trim();
        });
        return body;
    }

    function setMessage(text, kind) {
        formMessage.textContent = text;
        formMessage.className = kind === "ok" ? "form-ok" : "login-error";
        formMessage.hidden = !text;
    }

    function setState(text) {
        state.textContent = text;
        state.hidden = !text;
    }

    // ---------- Lista + estadisticas ----------
    async function load() {
        var id = ++lastLoad;
        var qs = queryString();
        clearErrors(filters);
        setState("Loading...");
        list.replaceChildren();
        stats.replaceChildren();

        try {
            var results = await Promise.all([api("GET", cfg.endpoint + qs), api("GET", cfg.endpoint + "/stats" + qs)]);
            if (id !== lastLoad) return;   // ya hay una busqueda mas nueva
            var items = results[0];
            var summary = results[1];

            if (!items.ok) {
                var other = items.data.errors ? showErrors(filters, items.data.errors) : items.data.error;
                setState("Please check the filters. " + (other || ""));
                return;
            }
            renderStats(summary.ok ? summary.data : null);
            renderItems(items.data);
        } catch (err) {
            if (id !== lastLoad) return;
            setState("Could not connect to the server. Start it with npm start and try again.");
        }
    }

    // Una "chip" por dato de GET <endpoint>/stats, todas de golpe con replaceChildren
    function renderStats(data) {
        if (!data) return;
        stats.replaceChildren.apply(stats, cfg.renderStats(data).map(function (text) {
            var li = document.createElement("li");
            li.textContent = text;
            return li;
        }));
    }

    function renderItems(items) {
        var plural = cfg.plural || cfg.label + "s";   // "dish" -> "dishes"
        if (items.length === 0) {
            setState("No " + plural + " match these filters.");
            return;
        }
        setState(items.length + " " + (items.length === 1 ? cfg.label : plural) + " found.");

        // Se construye un <li> por elemento y se ponen todos de golpe con replaceChildren
        list.replaceChildren.apply(list, items.map(function (item) {
            var info = cfg.describe(item);   // { icon, title, subtitle }
            var li = document.createElement("li");

            var icon = document.createElement("span");
            icon.className = "cat-icon";
            icon.textContent = info.icon;

            var text = document.createElement("div");
            var title = document.createElement("strong");
            title.textContent = info.title;
            var subtitle = document.createElement("small");
            subtitle.textContent = info.subtitle;
            text.appendChild(title);
            text.appendChild(subtitle);

            var actions = document.createElement("div");
            actions.className = "admin-actions";
            var edit = document.createElement("button");
            edit.type = "button";
            edit.textContent = "Edit";
            edit.addEventListener("click", function () { startEdit(item); });
            var del = document.createElement("button");
            del.type = "button";
            del.className = "danger";
            del.textContent = "Delete";
            del.addEventListener("click", function () { remove(item, del); });
            actions.appendChild(edit);
            actions.appendChild(del);

            li.appendChild(icon);
            li.appendChild(text);
            li.appendChild(actions);
            return li;
        }));
    }

    // ---------- Borrar ----------
    async function remove(item, button) {
        if (!confirm('Delete "' + cfg.describe(item).title + '"?')) return;
        button.disabled = true;
        try {
            var result = await api("DELETE", cfg.endpoint + "/" + item.id);
            if (!result.ok && result.status !== 404) {
                alert(result.data.error || "Could not delete it.");
                button.disabled = false;
                return;
            }
            if (editingId === item.id) resetForm();
            load();
        } catch (err) {
            alert("Could not connect to the server.");
            button.disabled = false;
        }
    }

    // ---------- Formulario crear / editar ----------
    function startEdit(item) {
        resetForm();
        editingId = item.id;
        Array.prototype.forEach.call(form.elements, function (el) {
            if (!el.name || item[el.name] === undefined) return;
            if (el.type === "checkbox") el.checked = item[el.name] === true;
            else el.value = item[el.name] === null ? "" : item[el.name];
        });
        formTitle.textContent = "Edit " + cfg.label + " #" + item.id;
        submitBtn.textContent = "Save changes";
        cancelBtn.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        form.querySelector("input, select").focus({ preventScroll: true });
    }

    function resetForm() {
        editingId = null;
        form.reset();
        clearErrors(form);
        setMessage("");
        formTitle.textContent = (/^[aeiou]/.test(cfg.label) ? "Add an " : "Add a ") + cfg.label;
        submitBtn.textContent = "Add " + cfg.label;
        cancelBtn.hidden = true;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearErrors(form);
        setMessage("");

        // 1) Primero se comprueba en el navegador; si hay errores no se llama al servidor
        var local = clientErrors();
        if (local.length) {
            var otherLocal = showErrors(form, local);
            setMessage(otherLocal || "Please fix the fields marked in red.", "error");
            return;
        }

        // 2) Despues se manda al servidor (POST para crear, PUT para editar)
        var body = formBody();
        var method = editingId ? "PUT" : "POST";
        var url = editingId ? cfg.endpoint + "/" + editingId : cfg.endpoint;

        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";
        try {
            var result = await api(method, url, body);
            if (!result.ok) {
                var other = result.data.errors ? showErrors(form, result.data.errors) : result.data.error;
                setMessage(other || "Please fix the fields marked in red.", "error");
                return;
            }
            var saved = result.data;
            resetForm();
            setMessage('"' + cfg.describe(saved).title + '" was ' + (method === "PUT" ? "updated" : "added") + " (id " + saved.id + ").", "ok");
            load();
        } catch (err) {
            setMessage("Could not connect to the server. Please try again.", "error");
        } finally {
            submitBtn.disabled = false;
            if (submitBtn.textContent === "Saving...") {
                submitBtn.textContent = editingId ? "Save changes" : "Add " + cfg.label;
            }
        }
    });

    cancelBtn.addEventListener("click", resetForm);

    // ---------- Filtros: se vuelve a pedir al servidor al cambiar algo ----------
    var timer;
    filters.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(load, 300);   // espera a que se deje de escribir
    });
    filters.addEventListener("submit", function (event) {
        event.preventDefault();
        load();
    });
    document.getElementById("filters-reset").addEventListener("click", function () {
        filters.reset();
        load();
    });

    resetForm();
    load();
}
