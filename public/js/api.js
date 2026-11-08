// apiRequest(method, path, body): el UNICO sitio de la web que llama a fetch.
// Todas las paginas piden y envian datos al servidor a traves de esta funcion.
//
//   var result = await apiRequest("GET", "/api/restaurants?type=pizza");
//   result -> { ok: true, status: 200, data: [ ... ] }
//
// - fetch NO lanza error con un 404 o un 500: por eso devolvemos ok y status y cada pagina los mira.
// - Si el servidor no esta arrancado, fetch SI lanza un error: lo captura la pagina con try/catch.
// - Si el usuario ha iniciado sesion (login.html guarda el token), se manda en la cabecera Authorization.
async function apiRequest(method, path, body) {
    var headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";

    var token = null;
    try { token = localStorage.getItem("globoToken"); } catch (err) { /* navegador sin localStorage */ }
    if (token) headers.Authorization = "Bearer " + token;

    var response = await fetch(path, {
        method: method,
        headers: headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
    });

    // 204 (borrado) no trae body; el resto de respuestas del servidor son JSON
    var text = await response.text();
    var data = null;
    if (text) {
        try { data = JSON.parse(text); } catch (err) { data = { error: text }; }
    }
    return { ok: response.ok, status: response.status, data: data };
}
