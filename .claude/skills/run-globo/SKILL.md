---
name: run-globo
description: Run, start, serve, screenshot, smoke-test, or drive the GLOBO static restaurant website (index/login/order/search/menu pages). Use when asked to open the site, check a page renders, take a screenshot (desktop or mobile), test the login flow or the search map, or confirm an HTML/CSS change works in a real browser.
---

GLOBO is a static HTML/CSS site with no build step. A future agent drives it with
`.claude/skills/run-globo/driver.py`. The driver serves the repo over HTTP on a
random local port and runs headless Microsoft Edge through Playwright for Python.
There's no server to start or stop.

All paths below are relative to the repo root (`globo/`). Verified on Windows 11
with Git Bash, Python 3.14 and Edge 154.

## Prerequisites

```bash
python -m pip install --user playwright
```

You don't need `playwright install`. The driver uses `channel="msedge"`, which is
the Edge that already comes with Windows. If Edge is missing, it falls back to
Playwright's bundled Chromium. That fallback is untested and needs
`python -m playwright install chromium`.

## Run (agent path)

```bash
python .claude/skills/run-globo/driver.py smoke
```

`smoke` does the following and takes about 30–60 s:
1. Loads all 10 pages. For each it prints the title and the first `<h1>`, takes a screenshot, and gathers local links for a dead-link check.
2. Clicks ☰ and checks that the sidebar hides. This is a CSS-only checkbox hack.
3. Logs in on `login.html` (name/email/password), checks `Welcome, Smoke Tester!`, reloads to confirm the login persisted in localStorage, then logs out.
4. Waits for the Leaflet map on `search.html` to load its markers and reports how many.

Exit codes: 0 means no local errors. 1 means a JS `pageerror` or a console error from a local file. Broken links and third-party errors print `WARN` and don't change the exit code.

Screenshot a single page, e.g. after a CSS change:

```bash
python .claude/skills/run-globo/driver.py shot index.html --mobile        # 390x844
python .claude/skills/run-globo/driver.py shot order.html --wait 6000     # let the iframe paint
python .claude/skills/run-globo/driver.py shot search.html --full         # full-page
```

Screenshots go to `.claude/skills/run-globo/shots/<page>[-mobile].png`, which is gitignored. The smoke run also writes `menu-closed.png`, `login-welcome.png` and `search-map.png`. Open the PNGs and look at them. A page can pass smoke and still show a blank iframe.

For a new flow, `import driver` and reuse `driver.serve()` and `driver.launch(p)`. See `smoke()` for the pattern.

## Run (human path)

Double-click `index.html`, or run `python -m http.server 8000` and open
http://localhost:8000. Stop it with Ctrl-C.

## Test

No test suite exists. `driver.py smoke` is the test.

## Gotchas

- **Smoke screenshots of iframe pages are blank.** All the iframes use `loading="lazy"` and load third-party sites, and smoke captures right at `load`. Use `shot <page> --wait 6000`. Burger King needs about 8 s.
- **pizza.html can never show its menu.** glovoapp.com sends `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`. It's not a timing problem.
- **sushi.html's iframe is sometimes blank.** stoglobo.es sometimes returns 403 inside the frame (seen once in three runs). It shows up as `WARN external`.
- **The search map's result depends on a public API.** The page POSTs to `overpass-api.de`. When that works you get about 120 markers ("120 restaurants in this area"). When it 504s, which happened in 2 of 4 runs, the page uses its hard-coded list and shows 8 markers ("Showing some of our restaurants…"). Either is a pass. Leaflet and the map tiles also come from unpkg/OSM, so the map needs internet.
- **Login is localStorage only** (key `globoUser`, password never checked). Each driver run uses a fresh browser context, so no logged-in state carries over between runs.
- **Copy-pasted `<title>`s:** sushi/pizza/vegan are all titled "GLOBO - Burger King Menu", and complaint.html is titled "Search for restaurants". The smoke output shows this.
- **`/favicon.ico` 404:** the site has no favicon. The driver ignores that request.

## Troubleshooting

- **`UnicodeEncodeError: 'charmap' codec can't encode character '\U0001f354'`**: the Windows console defaults to cp1252 and page headings contain emoji. The driver already reconfigures stdout to UTF-8. Do the same in any script that prints page text.
- **`ModuleNotFoundError: No module named 'playwright'`**: run the pip line under Prerequisites.
