---
name: run-globo
description: Run, serve, screenshot, smoke-test or check the GLOBO static restaurant website (index/login/search/menu pages). Use when asked to run globo, start or preview the site, take a screenshot of a page (desktop or mobile), test the login form or sidebar menu, or find broken links.
---

# run-globo

GLOBO is a plain static site (HTML + `styles.css` + one inline `<script>` in
`login.html`). There's no build step and no package.json at the repo root. You drive it with
`.claude/skills/run-globo/driver.mjs`. The driver serves the repo from a
built-in Node HTTP server on a random port and controls the **system Chrome/Edge**
through `playwright-core`, so you don't need to download a browser.

All paths below are relative to the repo root (`globo/`).

## Prerequisites (one time)

Node 18+ (verified on 24) and an installed Chrome or Edge. The driver checks the
standard Windows/Linux/macOS install paths. You can override that with `CHROME_PATH=...`.

```bash
cd .claude/skills/run-globo && npm install && cd ../../..
```

This installs only `playwright-core`. `node_modules/` and `shots/` are gitignored.

## Run (agent path)

```bash
node .claude/skills/run-globo/driver.mjs smoke              # everything; exit 1 on local problems
node .claude/skills/run-globo/driver.mjs shot index.html    # one full-page screenshot
node .claude/skills/run-globo/driver.mjs shot index.html mobile   # 390x844 phone emulation
node .claude/skills/run-globo/driver.mjs login Maria        # login -> reload -> logout flow, prints JSON
node .claude/skills/run-globo/driver.mjs serve 8123         # plain server for curl / manual browsing
```

Screenshots land in `.claude/skills/run-globo/shots/` (`<page>.png`,
`login-welcome.png`, `index-menu-closed.png`, `<page>_html-mobile.png`). **Open
them with Read and look at them.**

`smoke` does the following on every `*.html` in the repo root:
- Prints the page title.
- Lists **broken local links** (hrefs to files that don't exist).
- Lists **stray `#...` text**, meaning `#` "comments" that render as visible text, because HTML has no `#` comments.
- Lists **local** HTTP 4xx and JS errors.
- Saves a full-page screenshot.

After the pages, it clicks the ☰ label and checks that the sidebar hides. Then it runs the login flow.
Only broken links, local errors, or a failed login make it exit 1. Stray text is a warning.

To check a server that's already running with `serve`:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8123/            # 200
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8123/contact.html # 404 (missing page)
```

## Run (human path)

Double-click `index.html`, or run `serve` and open http://127.0.0.1:8000/. There's
nothing to build.

## Gotchas

- **The smoke test currently fails on purpose.** `contact.html` is linked from
  the footer of 5 pages (index, burgers, pizza, sushi, vegan) but doesn't exist. It also
  flags `login.html` and `prueba.html` for stray `#para que...` / `#menu toggle...`
  text that renders at the top of the page.
- **Menu pages iframe third-party sites** (burgerking.es, glovoapp.com,
  stoglobo.es, docs.google.com). Those sites refuse framing (CSP
  `frame-ancestors`) or return 403, and they vary from run to run. The driver
  prints them as `(external, ignored: ...)` and never fails on them. Don't expect
  the menu iframes to show content in screenshots. The Google Maps iframe on
  `search.html` loads, but its tiles stay grey in headless screenshots.
- **Titles are copy-pasted.** pizza/sushi/vegan are all titled "GLOBO - Burger
  King Menu", and complaint.html is titled "Search for restaurants". `smoke`
  prints titles so you can spot this.
- **`index.html` has no `<meta name="viewport">`.** `shot index.html mobile`
  renders at 980px CSS width, not 390px. That's the page's fault, not the
  driver's: real phones do the same. Pages that have the meta (search, login)
  render at true phone width.
- **The sidebar is a pure-CSS checkbox hack** (`#menu-toggle` + `label.menu-btn`).
  It's `checked` = open on load. Click the label, not the hidden input. The button
  text changes between "Hide menu" and "Show menu".
- **Login is fake.** It stores the name in `localStorage.globoUser` and never checks the
  password. Each driver command uses a fresh browser context, so state doesn't
  leak between runs.
- **Use HTTP, not `file://`.** The driver always serves over HTTP so that localStorage
  and 404 detection behave the same way as on a real host.
- **Chrome console 404s don't name the URL** ("Failed to load resource...").
  The driver drops those messages and logs the actual failing response URL instead.

## Troubleshooting

- `Error: No Chrome/Edge found; set CHROME_PATH`: no browser at the standard
  paths. Run `CHROME_PATH="/path/to/chrome" node .claude/skills/run-globo/driver.mjs smoke`.
- `Cannot find package 'playwright-core'`: you skipped `npm install` in the
  skill directory.
