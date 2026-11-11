// Carta de una marca (burgers.html, pizza.html, sushi.html, vegan.html).
// Uso: <script src="menu.js" data-brand="telepizza"></script>
// Pide GET /menu?restaurant=<marca> y pinta los platos:
//   - principales y postres en #menu-main
//   - bebidas y complementos en #menu-extras (si la pagina tiene esa lista; si no, todo en #menu-main)
<<<<<<< HEAD
// Si el servidor no esta arrancado, se queda la carta escrita en el HTML.
=======
// La carta viene SIEMPRE del API: el HTML no tiene platos escritos a mano.
// Estados: "Loading..." mientras llega, mensaje si no hay platos, y error si el servidor falla.
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
(function () {
    var brand = document.currentScript.dataset.brand;
    var mainList = document.getElementById("menu-main");
    var extrasList = document.getElementById("menu-extras");
    var status = document.getElementById("menu-status");

    // Foto de cada plato (por nombre, tal y como lo guarda el servidor)
    var IMAGES = {
        "Whopper": "images/whopper.jpg",
        "Patatas": "images/patatas_burger.jpg",
        "Big Mac": "images/burger.jpg",
        "McNuggets": "images/nuggets.jpg",
        "McFlurry": "images/mcflurry.jpg",
        "Veggie Burger": "images/veggie_burger.jpg",
        "Long Chicken": "images/long_chicken.jpg",
        "Salmon Maki": "images/maki_salmon.jpg",
        "Tuna Maki": "images/maki_tuna.jpg",
        "Veggie Maki": "images/maki_vegan.jpg",
        "California Roll": "images/california_roll.jpg",
        "Nigiri with Salmon": "images/niguiri_salmon.jpg",
        "Nigiri with Tuna": "images/nigiri_tuna.jpg",
        "Nigiri with Vegetables": "images/nigiri_vegan.jpg",
        "Soy sauce": "images/soy_sauce.jpg",
        "Herbal Tea": "images/herbal_tea.jpg",
<<<<<<< HEAD
=======
        "Japanese Green Tea": "images/herbal_tea.jpg",
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
        "water": "images/water.jpg",
        "Hawaiian Pizza": "images/hawaiana.jpg",
        "Pepperoni Pizza": "images/peperoni.jpg",
        "Veggie Pizza": "images/veggie.jpg",
        "Cheese Pizza": "images/cheese.jpg",
        "Margarita Pizza": "images/margarita.jpg",
        "Chicken Pizza": "images/chicken_pizza.jpg",
        "Meat Lovers Pizza": "images/meat_lover_pizza.jpg",
        "Tuna Pizza": "images/tuna_pizza.jpg",
        "Coca-Cola": "images/coca_cola.jpg",
        "Beer": "images/beer.jpg",
        "Quinoa Salad": "images/quinoa_salad.jpg",
        "Vegan Burger": "images/vegan_burger.jpg",
        "Green Smoothie": "images/green_smoothie.jpg",
        "Avocado Toast": "images/avocado_toast.jpg",
        "Kombucha": "images/kombucha.jpg"
    };

    function setStatus(text) {
        status.textContent = text;
        status.hidden = !text;
    }

    function dishItem(dish) {
        var li = document.createElement("li");
        if (IMAGES[dish.name]) {
            var img = document.createElement("img");
            img.src = IMAGES[dish.name];
            img.alt = dish.name;
            img.width = 180;
            img.height = 180;
            li.appendChild(img);
        }
        var name = document.createElement("span");
        name.className = "dish-name";
        name.textContent = dish.name.charAt(0).toUpperCase() + dish.name.slice(1);
        var price = document.createElement("span");
        price.className = "dish-price";
        price.textContent = dish.price.toFixed(2) + " €";
        li.appendChild(name);
        li.appendChild(price);
        return li;
    }

    async function load() {
        setStatus("Loading the menu...");
<<<<<<< HEAD
        try {
            var result = await apiRequest("GET", "/menu?restaurant=" + encodeURIComponent(brand));
            if (!result.ok) throw new Error("HTTP " + result.status);
=======
        mainList.replaceChildren();
        if (extrasList) extrasList.replaceChildren();
        try {
            var result = await apiRequest("GET", "/menu?restaurant=" + encodeURIComponent(brand));
            // fetch no lanza error con un 404 o un 500: lo miramos con result.ok
            if (!result.ok) {
                setStatus("Could not load the menu (error " + result.status + "). Please try again later.");
                return;
            }
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
            var menu = result.data;

            if (menu.length === 0) {
                setStatus("This restaurant has no dishes yet.");
<<<<<<< HEAD
                mainList.innerHTML = "";
                if (extrasList) extrasList.innerHTML = "";
                return;
            }

            mainList.innerHTML = "";
            if (extrasList) extrasList.innerHTML = "";
            menu.forEach(function (dish) {
                var isExtra = dish.category === "drink" || dish.category === "side";
                var target = isExtra && extrasList ? extrasList : mainList;
                target.appendChild(dishItem(dish));
            });
            setStatus("");
        } catch (err) {
            // Sin servidor: se queda la carta del HTML
            setStatus("Could not load the latest menu. Showing the saved menu.");
=======
                return;
            }

            // Bebidas y complementos van a #menu-extras (si existe); el resto a #menu-main
            var main = [];
            var extras = [];
            menu.forEach(function (dish) {
                var isExtra = dish.category === "drink" || dish.category === "side";
                (isExtra && extrasList ? extras : main).push(dishItem(dish));
            });
            mainList.replaceChildren.apply(mainList, main);
            if (extrasList) extrasList.replaceChildren.apply(extrasList, extras);
            setStatus("");
        } catch (err) {
            // fetch SI lanza error si el servidor no esta arrancado
            setStatus("Could not connect to the server. Start it with npm start and try again.");
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
        }
    }

    load();
})();
