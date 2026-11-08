// Script de login.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
// Login: el servidor (POST /login) comprueba la contrasena.
// Si es correcta, el nombre se guarda en el navegador (localStorage).
var form = document.getElementById("login-form");
var welcome = document.getElementById("login-welcome");
var userText = document.getElementById("login-user");
var errorText = document.getElementById("login-error");

// Ensena el formulario o la bienvenida segun si hay alguien conectado
function showState() {
    var user = localStorage.getItem("globoUser");
    if (user) {
        userText.textContent = user;
        // Codigo de bienvenida (se guarda al crear la cuenta y se borra al usarlo)
        var code = localStorage.getItem("globoDiscountCode");
        document.getElementById("login-discount").hidden = !code;
        if (code) {
            document.getElementById("login-discount-code").textContent = code;
            document.getElementById("login-discount-percent").textContent =
                localStorage.getItem("globoDiscountPercent") || "10";
        }
        form.hidden = true;
        welcome.hidden = false;
        loadHistory();
    } else {
        form.hidden = false;
        welcome.hidden = true;
        historyBox.hidden = true;
    }
}

// Borra todo lo que se guarda en el navegador al cerrar sesion
function logout() {
    ["globoUser", "globoEmail", "globoToken", "globoDiscountCode", "globoDiscountPercent"]
        .forEach(function (key) { localStorage.removeItem(key); });
    showState();
}

// ---------- Historial de pedidos ----------
var historyBox = document.getElementById("order-history");
var historyList = document.getElementById("history-list");
var historyEmpty = document.getElementById("history-empty");

function euros(n) { return n.toFixed(2) + " €"; }

async function loadHistory() {
    historyBox.hidden = false;
    historyList.innerHTML = "<li>Loading...</li>";
    historyEmpty.hidden = true;
    try {
        // apiRequest manda el token de la sesion en la cabecera Authorization
        var response = await apiRequest("GET", "/orders");
        if (response.status === 401) {
            // La sesion ya no vale (p. ej. se reinicio el servidor): hay que entrar otra vez
            logout();
            errorText.textContent = "Your session has expired. Please log in again.";
            errorText.hidden = false;
            return;
        }
        showHistory(response.data);
    } catch (err) {
        historyList.innerHTML = "<li>Could not load your orders (server not running).</li>";
    }
}

function showHistory(orders) {
    historyList.innerHTML = "";
    historyEmpty.hidden = orders.length > 0;
    orders.forEach(function (order) {
        var li = document.createElement("li");

        var title = document.createElement("p");
        var date = new Date(order.date).toLocaleString("en-GB",
            { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        title.innerHTML = "<strong></strong> · ";
        title.firstChild.textContent = order.restaurant + " (" + order.location + ")";
        title.appendChild(document.createTextNode(
            date + " · " + (order.type === "pickup" ? "Pick up" : "Delivery") +
            " · " + (order.payment === "cash" ? "Cash" : "Card")));

        var dishes = document.createElement("p");
        dishes.textContent = order.items.map(function (i) {
            return i.quantity + " × " + i.dish;
        }).join(", ");

        var total = document.createElement("p");
        var extras = [];
        if (order.deliveryFee > 0) extras.push("delivery fee" +
            (order.deliveryFeePercent ? " " + order.deliveryFeePercent + "%" : "") +
            " " + euros(order.deliveryFee));
        if (order.discount > 0) extras.push("discount -" + euros(order.discount));
        total.innerHTML = "<strong></strong>";
        total.firstChild.textContent = "Total: " + euros(order.total);
        if (extras.length) total.appendChild(document.createTextNode(" (" + extras.join(", ") + ")"));

        li.appendChild(title);
        li.appendChild(dishes);
        li.appendChild(total);
        historyList.appendChild(li);
    });
}

// Si hay un error: se vacia el formulario, se ensena el mensaje
// y se deja listo para volver a rellenarlo
function showLoginError(message) {
    form.reset();
    errorText.textContent = message;
    errorText.hidden = false;
    document.getElementById("login-name").focus();
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorText.hidden = true;

    var data = {
        name: document.getElementById("login-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
    };

    try {
        var response = await apiRequest("POST", "/login", data);
        var result = response.data;

        // Contrasena incorrecta: ensena el error y no entra
        if (!response.ok) {
            showLoginError(result.error);
            return;
        }

        localStorage.setItem("globoUser", result.name);
        localStorage.setItem("globoEmail", result.email);
        localStorage.setItem("globoToken", result.token);   // para saber quien pide
        // Primera vez que entra el servidor le da un codigo de descuento
        // (y lo vuelve a mandar en cada login hasta que lo use)
        if (result.discountCode) {
            localStorage.setItem("globoDiscountCode", result.discountCode);
            localStorage.setItem("globoDiscountPercent", result.discountPercent);
        } else {
            localStorage.removeItem("globoDiscountCode");
            localStorage.removeItem("globoDiscountPercent");
        }
        form.reset();
        showState();
    } catch (err) {
        // Pasa si la pagina no se abre desde el servidor de Node (p. ej. con Live Server)
        showLoginError("Could not connect to the server. Run \"npm start\" and open http://localhost:3000/login.html");
    }
});

document.getElementById("logout-btn").addEventListener("click", logout);

showState();
