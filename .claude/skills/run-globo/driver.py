"""Drive the GLOBO static site in headless Edge via Playwright (Python).

Serves the repo root over http://127.0.0.1:<free port> in a background
thread, so there is no separate server to start or kill.

Usage (from the repo root):
    python .claude/skills/run-globo/driver.py smoke
    python .claude/skills/run-globo/driver.py shot <page.html> [--mobile] [--full] [--wait MS]

Screenshots land in .claude/skills/run-globo/shots/ (gitignored).
"""
import functools
import http.server
import pathlib
import sys
import threading
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[3]
SHOTS = pathlib.Path(__file__).resolve().parent / "shots"
PAGES = ["index.html", "login.html", "order.html", "search.html", "complaint.html",
         "burgers.html", "sushi.html", "pizza.html", "vegan.html", "contact.html"]
DESKTOP = {"width": 1280, "height": 800}
MOBILE = {"width": 390, "height": 844}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def launch(p):
    # channel="msedge" uses the Edge already installed on Windows - no
    # `playwright install` download needed. Fall back to bundled chromium.
    try:
        return p.chromium.launch(channel="msedge")
    except Exception:
        return p.chromium.launch()


def watch(page, base, problems, external):
    """Local errors -> problems (fail). Errors from third-party sites -> external (warn)."""
    def on_console(m):
        if m.type != "error":
            return
        src = m.location.get("url", "")
        if src.endswith("/favicon.ico"):  # site has no favicon; browser asks anyway
            return
        msg = f"[{page.url[len(base):]}] {m.text} <- {src}"
        (problems if src.startswith(base) else external).append(msg)
    page.on("console", on_console)
    page.on("pageerror", lambda e: problems.append(f"pageerror: {e}"))


def smoke():
    SHOTS.mkdir(exist_ok=True)
    httpd, base = serve()
    problems, external, broken = [], [], set()
    with sync_playwright() as p:
        browser = launch(p)
        ctx = browser.new_context(viewport=DESKTOP)
        page = ctx.new_page()
        watch(page, base, problems, external)

        # 1. Every page renders; collect local links for a dead-link check.
        links = set()
        for name in PAGES:
            page.goto(base + name, wait_until="load")
            title = page.title().strip()
            h1 = page.locator("h1").first.inner_text() if page.locator("h1").count() else "-"
            print(f"ok   {name:16} title={title!r} h1={h1!r}")
            page.screenshot(path=str(SHOTS / name.replace(".html", ".png")))
            for href in page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))"):
                url = urljoin(base + name, href)
                if url.startswith(base):
                    links.add((name, urlparse(url).path.lstrip("/")))
        for src, target in sorted(links):
            if not (ROOT / target).is_file():
                broken.add(f"{src} -> {target}")

        # 2. Sidebar toggle (CSS-only checkbox hack): clicking ☰ hides the nav.
        page.goto(base + "index.html")
        assert page.locator("nav.sidebar").is_visible()
        page.click("label.menu-btn")
        page.wait_for_timeout(400)  # sidebar has a CSS transition
        assert not page.locator("nav.sidebar").is_visible(), "sidebar still visible after ☰ click"
        print("ok   menu toggle: ☰ hides the sidebar")
        page.screenshot(path=str(SHOTS / "menu-closed.png"))

        # 3. Login flow (localStorage-only, no server).
        page.goto(base + "login.html")
        page.fill("#login-name", "Smoke Tester")
        page.fill("#login-email", "smoke@example.com")
        page.fill("#login-password", "secret")
        page.click("button[type=submit]")
        page.wait_for_selector("#login-welcome:not([hidden])")
        user = page.inner_text("#login-user")
        assert user == "Smoke Tester", user
        page.screenshot(path=str(SHOTS / "login-welcome.png"))
        page.reload()
        assert page.is_visible("#login-welcome"), "login did not persist across reload"
        page.click("#logout-btn")
        assert page.is_visible("#login-form")
        print(f"ok   login flow: welcomed {user!r}, persisted on reload, logged out")

        # 4. Search map: Leaflet from unpkg + Overpass API (or backup list).
        page.goto(base + "search.html")
        page.wait_for_function(
            "!document.getElementById('map-info').textContent.startsWith('Loading')", timeout=40000)
        markers = page.locator(".leaflet-marker-icon").count()
        print(f"ok   search map: {markers} markers, info={page.inner_text('#map-info')!r}")
        page.wait_for_timeout(1500)  # let OSM tiles paint
        page.screenshot(path=str(SHOTS / "search-map.png"))

        browser.close()
    httpd.shutdown()

    for b in sorted(broken):
        print(f"WARN broken link: {b}")
    for e in external:
        print(f"WARN external: {e}")
    for pr in problems:
        print(f"FAIL {pr}")
    print(f"screenshots: {SHOTS}")
    return 1 if problems else 0


def shot(name, mobile=False, full=False, wait=1000):
    SHOTS.mkdir(exist_ok=True)
    httpd, base = serve()
    out = SHOTS / f"{name.replace('.html', '')}{'-mobile' if mobile else ''}.png"
    with sync_playwright() as p:
        browser = launch(p)
        page = browser.new_page(viewport=MOBILE if mobile else DESKTOP)
        page.goto(base + name, wait_until="load")
        page.wait_for_timeout(wait)  # iframes are loading=lazy and third-party
        page.screenshot(path=str(out), full_page=full)
        browser.close()
    httpd.shutdown()
    print(out)
    return 0


if __name__ == "__main__":
    # Windows consoles default to cp1252; page headings contain emoji.
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    args = sys.argv[1:]
    if args[:1] == ["smoke"]:
        sys.exit(smoke())
    if args[:1] == ["shot"] and len(args) >= 2:
        wait = int(args[args.index("--wait") + 1]) if "--wait" in args else 1000
        sys.exit(shot(args[1], "--mobile" in args, "--full" in args, wait))
    print(__doc__)
    sys.exit(2)
