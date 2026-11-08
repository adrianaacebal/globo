// Pantalla de gestion (restaurants, dishes, orders, reviews, complaints y messages.html):
// lista + filtros + estadisticas + formulario. Todo pasa por el API: los filtros se aplican en el servidor, no aqui.
//
// La pagina llama a setupCrud({ endpoint, label, plural, article, describe, renderStats }):
//   describe(item) -> { icon, title, subtitle } · renderStats(stats) -> [ "texto", ... ] · article "an" -> "Add an order"
// y tiene estos elementos:
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

    // errors = { campo: "mensaje" }. Lo que no tiene sitio (p. ej. "body") se devuelve como texto
    function showErrors(box, errors) {
        var rest = [];
        Object.keys(errors).forEach(function (field) {
            var slot = box.querySelector('[data-error-for="' + field + '"]');
            if (slot) {
                slot.textContent = errors[field];
                var input = box.querySelector('[name="' + field + '"]');
                if (input) input.setAttribute("aria-invalid", "true");
            } else {
                rest.push(errors[field]);
            }
        });
        return rest.join(" ");
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
        list.innerHTML = "";
        stats.innerHTML = "";

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

    function renderStats(data) {
        if (!data) return;
        cfg.renderStats(data).forEach(function (text) {
            var li = document.createElement("li");
            li.textContent = text;
            stats.appendChild(li);
        });
    }

    function renderItems(items) {
        var plural = cfg.plural || cfg.label + "s";   // "dish" -> "dishes"
        if (items.length === 0) {
            setState("No " + plural + " match these filters.");
            return;
        }
        setState(items.length + " " + (items.length === 1 ? cfg.label : plural) + " found.");

        items.forEach(function (item) {
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
            list.appendChild(li);
        });
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
            if (el.name && item[el.name] !== undefined) el.value = item[el.name];
        });
        formTitle.textContent = "Edit " + cfg.label + " #" + item.id;
        submitBtn.textContent = "Save changes";
        cancelBtn.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        form.querySelector("input, select, textarea").focus({ preventScroll: true });
    }

    function resetForm() {
        editingId = null;
        form.reset();
        clearErrors(form);
        setMessage("");
        formTitle.textContent = "Add " + (cfg.article || "a") + " " + cfg.label;   // "an order"
        submitBtn.textContent = "Add " + cfg.label;
        cancelBtn.hidden = true;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearErrors(form);
        setMessage("");

        var body = Object.fromEntries(new FormData(form));
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
