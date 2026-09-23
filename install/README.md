# Browser installer preview (`/install/`)

The browser one-shot installer for LibreEcho: it verifies a published release,
takes USB access through the browser's own WebUSB permission prompt, and drives
the install stages with a terminal-style progress monitor.

Published from this repository at `/install/` for now (`https://dev.libreecho.org/install/`).
It is written to be origin-independent — every asset path is relative — so the
same directory can be served from its own hostname (`install.dev.libreecho.org`)
without changes.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | Installer page and stage controls |
| `NOTES.html` | Operator notes: route, limitations, browser requirements, mirror configuration |
| `css/installer.css` | Page styles (shares the LibreEcho palette, denser layout) |
| `js/app.js` | UI wiring and run orchestration |
| `js/stages.js` | Install stages: identity, unlock, recovery, staging, install, verify |
| `js/transports.js` | The single adapter for the `lib/` protocol modules |
| `js/release.js` | Release index, `SHA256SUMS` parsing, verification, asset fetch |
| `js/device.js` | WebUSB support checks, mode filters, serial masking |
| `js/profiles.js` | Declared device profiles and payload map |
| `js/sha256.js` | Incremental SHA-256 (used to hash large payloads without buffering them) |
| `js/terminal.js` | Terminal renderer with in-place progress rows |
| `lib/fastboot.js`, `lib/webusb-fastboot-transport.js` | Fastboot protocol + WebUSB transport |
| `lib/adb.js`, `lib/webusb-adb-transport.js` | ADB protocol (shell, sync push) + WebUSB transport |

## Design constraints

* **No build step, no dependencies.** Native ES modules loaded directly by the
  browser, so the site stays a static Pages deployment.
* **Hash before use.** Payloads are verified against the release's own
  `SHA256SUMS` in the browser; pushed files are re-hashed on the device with its
  own `sha256sum`.
* **No silent guesses.** Device compatibility comes from `fastboot getvar`, not
  from a product name in a URL. The unlock payload is selected by the device's
  LK build description and must be operator-supplied.
* **Never retry an unknown outcome.** A `flash brick` timeout stops the run.
* **Writes stay inside the reviewed allowlist.** `boot_a`, `boot_b` and
  `userdata` (via the recovery installer). Everything else is out of reach by
  construction.

## Why payloads are operator-supplied

A page cannot read `github.com/.../releases/download/...`: the redirect response
has no `Access-Control-Allow-Origin`, so `fetch()` fails before the body is
readable (verified from `https://dev.libreecho.org`). Metadata
(`api.github.com`) and raw repository files are readable. The installer therefore
takes the release bundle from a local file/folder selection by default, and can
use a CORS-enabled mirror when one is configured:

```html
<script>window.LIBREECHO_INSTALLER_CONFIG = { mirrorBase: "https://mirror.example/libreecho" };</script>
```

or `?mirror=https://mirror.example/libreecho`. A mirror is served as
`<mirrorBase>/<release-tag>/<asset-name>`.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000/install/
```

WebUSB requires a secure context; `localhost` counts as one. USB device access
itself cannot be exercised without the hardware attached.

## Verification status

* Protocol layers: unit-tested in Node against scripted fastboot and adbd peers
  (`node --test lib/test_fastboot.mjs`, `node --test lib/test_adb.mjs`).
* SHA-256: verified against Node's `crypto` over empty, boundary-length and
  randomised inputs.
* Stage orchestration and UI: exercised in a Chromium browser.
* Hardware: **not yet run from a browser.** Treat every install claim on this
  page as unvalidated until that happens.
