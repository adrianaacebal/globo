// Script de search.html. Las peticiones al servidor pasan por apiRequest (js/api.js).
// Icono y carta de cada tipo de restaurante (los mismos tipos que valida el servidor)
var kinds = {
    burger: { icon: '🍔', menu: 'burgers.html' },
    pizza:  { icon: '🍕', menu: 'pizza.html' },
    sushi:  { icon: '🍣', menu: 'sushi.html' },
    vegan:  { icon: '🥗', menu: 'vegan.html' }
};
var defaultKind = { icon: '📍', menu: 'order.html' };

// Mapa centrado en Madrid
var map = L.map('map').setView([40.45, -3.70], 12);

// Los dibujos del mapa (calles, plazas...) los pone OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var searchForm = document.getElementById('search-form');
var input = document.getElementById('search-input');
var info = document.getElementById('map-info');
var list = document.getElementById('results');
var layer = L.featureGroup().addTo(map);
var lastSearch = 0;   // para ignorar respuestas viejas si se escribe rapido

// Hace el cartelito que sale al pinchar una chincheta
function makePopup(place) {
    var box = document.createElement('div');
    var name = document.createElement('strong');
    name.textContent = place.name;
    box.appendChild(name);
    box.appendChild(document.createElement('br'));
    box.appendChild(document.createTextNode(place.area));
    box.appendChild(document.createElement('br'));
    var link = document.createElement('a');
    link.href = (kinds[place.type] || defaultKind).menu;
    link.textContent = 'View menu';
    box.appendChild(link);
    return box;
}

// Chincheta con emoji para un restaurante
function makeMarker(place) {
    return L.marker([place.lat, place.lon], {
        title: place.name,
        icon: L.divIcon({
            className: 'globo-pin',
            html: (kinds[place.type] || defaultKind).icon,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        })
    }).bindPopup(makePopup(place));
}

// Pinta la lista y las chinchetas de los restaurantes que ha devuelto el servidor
function showResults(found) {
    layer.clearLayers();
    list.innerHTML = '';
    found.forEach(function (place) {
        var marker = makeMarker(place).addTo(layer);
        var item = document.createElement('li');
        var button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = '<span class="cat-icon"></span><strong></strong><small></small>';
        button.querySelector('.cat-icon').textContent = (kinds[place.type] || defaultKind).icon;
        button.querySelector('strong').textContent = place.name;
        button.querySelector('small').textContent = place.area;
        button.addEventListener('click', function () {
            map.setView([place.lat, place.lon], 16);
            marker.openPopup();
            document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        item.appendChild(button);
        list.appendChild(item);
    });

    if (found.length === 0) {
        info.textContent = 'No restaurants found. Try another name, area or type.';
    } else {
        info.textContent = found.length + (found.length === 1 ? ' restaurant' : ' restaurants') + ' found.';
        map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 16 });
    }
}

// Pide al servidor los restaurantes que coinciden: GET /api/restaurants?search=&area=&type=
async function search() {
    var id = ++lastSearch;
    var params = new URLSearchParams();
    new FormData(searchForm).forEach(function (value, key) {
        if (String(value).trim() !== '') params.append(key, String(value).trim());
    });

    info.textContent = 'Searching...';
    try {
        var result = await apiRequest('GET', '/api/restaurants?' + params.toString());
        var data = result.data;
        if (id !== lastSearch) return;   // ya hay una busqueda mas nueva
        if (!result.ok) {
            var errors = data.errors ? data.errors.map(function (e) { return e.message; }).join(' ') : data.error;
            info.textContent = 'Please check your search. ' + errors;
            layer.clearLayers();
            list.innerHTML = '';
            return;
        }
        showResults(data);
    } catch (err) {
        if (id !== lastSearch) return;
        info.textContent = 'Could not connect to the server. Please try again later.';
    }
}

// Se busca al escribir (esperando a que se deje de teclear) y al cambiar un filtro
var timer;
searchForm.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(search, 300);
});
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    search();
});
search();

// Boton "Near me": centra el mapa donde esta el usuario
document.getElementById('near-me').addEventListener('click', function () {
    if (!navigator.geolocation) {
        info.textContent = 'Your browser cannot share your location.';
        return;
    }
    info.textContent = 'Looking for your location...';
    navigator.geolocation.getCurrentPosition(function (pos) {
        var here = [pos.coords.latitude, pos.coords.longitude];
        L.circleMarker(here, { radius: 9, color: '#0d5f49', fillColor: '#eec32c', fillOpacity: 1 })
            .addTo(map).bindPopup('You are here').openPopup();
        map.setView(here, 14);
        info.textContent = 'This is you. Restaurants near you are on the map.';
    }, function () {
        info.textContent = 'We could not get your location.';
    });
});
