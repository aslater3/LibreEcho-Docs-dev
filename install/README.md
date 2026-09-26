# Browser installer preview (`/install/`)

The browser one-shot installer for LibreEcho: it verifies a published release,
takes USB access through the browser's own WebUSB permission prompt, and drives
the install stages with a terminal-style progress monitor.

Published from this repository at `/install/` (`https://dev.libreecho.org/install/`)
and from its own publication repository at `install.dev.libreecho.org`. The app is
origin-independent — every asset path is relative — so the same directory is
served by both without changes.

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
| `lib/fastboot/` | Fastboot protocol + WebUSB transport + unit tests + README |
| `lib/adb/` | ADB protocol (shell, sync push) + WebUSB transport + unit tests + README |

## Design constraints

* **No build step, no dependencies.** Native ES modules loaded directly by the
  browser, so the site stays a static Pages deployment.
* **Hash before any device use.** Both normal and TWRP checksum inventories
  must match their GitHub release API asset digests; every required file,
  including `libreecho-install.zip` and `bundle.manifest`, must then match the
  correct inventory and API digest. Files are re-hashed on the device after push.
* **No silent guesses.** Product, LK build, lock state and full serial are read
  from fastboot; the serial is masked in UI/logs but used to bind TWRP. The
  build-selected, operator-supplied unlock image must match a pinned size and
  SHA-256 before `flash:brick`.
* **No retry after uncertain submission.** A hashed per-device/payload unlock
  attempt is persisted across tabs before USB transmission; a timeout or
  disconnect is unknown. A separate persisted record blocks a second recovery
  ZIP attempt for the same device/release/phase. Only an operator who has
  classified the resulting hardware and receipt may plan a new transaction.
* **Marker safety is a release gate.** A verified bundle alone cannot qualify
  a boot image. Radar images can run experimentally on the Dot because the
  core hardware is shared; that is not a qualified, supported one-shot install.
  No available Biscuit image has positive marker-safe hardware qualification,
  so Run remains disabled. Development images and fastboot
  reboot-request paths can write `FASTBOOT_PLEASE` over Kaeru in `expdb`.
  TWRP staging/install additionally requires a matching serial and an intact
  Kaeru header before and after each recovery phase. The fastbrick unlock
  payload itself writes critical boot-chain partitions; its write set is NOT
  limited to boot slots and userdata.
* **Rehearse is truly no-write.** It may review selected release/identity state
  but never submits a fastboot image, pushes files or invokes TWRP.

## Why payloads are operator-supplied

A page cannot read `github.com/.../releases/download/...`: the redirect response
has no `Access-Control-Allow-Origin`, so `fetch()` fails before the body is
readable (verified from `https://dev.libreecho.org`). Metadata
(`api.github.com`) and raw repository files are readable. The installer therefore
takes the release bundle from a local file/folder selection. An optional
CORS-enabled mirror may serve checksum listings; it does not replace the local
bundle selection, API digest checks or board/marker qualification. Configure it
with `window.LIBREECHO_INSTALLER_CONFIG.mirrorBase` or the `?mirror=` query
parameter.

## Amonet unlock archive acquisition

The community Biscuit v2 archive is distributed as an XDA attachment, not a
GitHub release asset. A direct anonymous host HEAD request returned 403 with no
CORS header, so this page does **not** promise a direct XDA browser download or
embed the binary. After the read-only device query, select the pinned
`amonet-biscuit-v2.0.0.zip` once: the page verifies the whole archive SHA-256,
extracts only `amonet/bin/fastbrick-20221007.img` for the reported LK build,
and separately verifies that member's size and SHA-256. The raw image picker
remains an advanced pinned fallback.

An operator may configure a CORS-enabled HTTPS mirror with
`window.LIBREECHO_INSTALLER_CONFIG.amonetMirrorBase` or `?amonetMirror=`. Then
**Fetch pinned ZIP from configured mirror** automatically downloads the declared
archive filename and applies the same two hashes. Loopback HTTP is permitted for
local tests only. No mirror is configured by default; do not substitute an
unverified third-party mirror or strip the digest check after a failed fetch.
A verified payload is **not** permission to unlock: the marker-safe release and
separate hardware authorization gates still apply.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000/install/
```

WebUSB requires a secure context; `localhost` counts as one. USB device access
itself cannot be exercised without the hardware attached.

## Verification status

* Protocol layers: run `node --test install/lib/fastboot/test_fastboot.mjs
  install/lib/adb/test_adb.mjs` from the repository root. These are scripted
  peers, not a real LK/adbd acceptance test; the large push case is optional.
* Browser state machine and safety gates: run `node --test install/js/test_*.mjs`.
  These device-free cases cover no-write rehearsal, wrong-board refusal,
  release/API digests, single-submission state, serial continuity and Kaeru
  header rejection. A passing fake transport does not prove the whole-image
  WebUSB fastbrick transfer or recovery protocol on actual hardware.
* Site checks: parse every JS module, check links and run `git diff --check`.
* Hardware: the **read-only Query Device** path was exercised on an Echo Dot 2
  in local Chrome on 2026-09-26. WebUSB returned the fastboot product, lock
  state, LK/preloader builds, security/RPMB fields, download limit and full
  serial in the local panel; the log masked the serial. A post-query host
  read still showed the unit locked. This did not exercise raw fastbrick,
  recovery ADB, the ZIP, a reboot, or any device write. **Run remains disabled**
  until the exact board image has positive marker-safe qualification and a
  separately authorised live phase can test those paths.
