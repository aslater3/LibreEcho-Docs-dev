# LibreEcho website

Static GitHub Pages site for **LibreEcho**, an open operating system and hardware-enablement project for Amazon Echo Gen 2.

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for upstream credits,
third-party licensing boundaries, the Amazon non-affiliation notice, and the
experimental-use disclaimer. The website's MIT licence applies only to the
original website source and artwork in this repository.

## Publish

1. Create an empty GitHub repository.
2. Extract this archive and copy its contents into the repository root.
3. This is the development site and browser demo for the current LibreEcho PRD line.
4. Commit and push to the `dev` branch.
5. In **Settings → Pages**, select **GitHub Actions** as the source.

The included workflow publishes the dev site on every push to `dev`. It also
refreshes every six hours by rendering the latest LibreEcho-UI source into the
current Control Centre captures. Add the fine-grained `UI_REPOSITORY_TOKEN`
Actions secret with read-only Contents access to the private UI repository to
enable source checkout; otherwise the last committed captures remain in place.

## Content parity with the public site

`index.html` carries the full content of the public site
([`LibreEcho-Docs`](https://github.com/aslater3/LibreEcho-Docs) → `libreecho.org`)
plus the sections that only exist here: the development-site banner, the
in-flight "In action" proof-of-life placeholders, the current UI captures, the
architecture stack and the capability roadmap. Section numbering runs straight
through both sets.

The production stylesheets and `assets/js/site.js` are copied from the public
site so the two pages render identically; development-only classes live in
`assets/css/dev-extras.css`. When the public site changes, re-sync by taking
those files again and re-checking that every production section is still present
here.

## Browser installer preview

`install/` is the browser one-shot installer: it verifies a published release,
takes USB access through WebUSB, and runs the install stages with a terminal
progress monitor. See [`install/README.md`](install/README.md) for the design
constraints and [`install/NOTES.html`](install/NOTES.html) for the operator
notes. It is published here as a preview; the intended home is its own hostname
(`install.dev.libreecho.org`), and every path inside it is relative so it can
move without changes.

## Browser demo

The dependency-free control-centre demonstration is served from `demo/`. It uses
the production UI with a browser-local implementation of `/api/v1`, so GitHub
Pages can demonstrate settings, state transitions, JSON backup/restore and the
interactive Swagger console without running the native device daemon.

Demo settings persist in `localStorage`; the **Reset demo** control restores the
deterministic defaults. No passwords, tokens or uploaded configuration files are
sent off-device by the demo.

## Custom domain

Add a file named `CNAME` to the repository root containing only the domain, for example:

```text
libreecho.org
```

Then configure the DNS records GitHub documents for Pages. A custom domain is optional; the site works at the standard `github.io` address.

## Replacing artwork

The repository-native SVG artwork lives in `assets/images/`. It is deliberately referenced through stable filenames. To use the original generated PNG image pack later, either replace the corresponding SVG files and update the extensions in `index.html`, or export the generated images to these names:

- `echo-hero.svg` — main product image
- `open-device.svg` — contribution section artwork
- `social-card.svg` — social preview image
- `mark.svg` — project mark

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Project status language

The current product story is deliberately broader than hardware bring-up:
LibreEcho is active Linux 6.1 development on MT8163 ARM32. The PRD baseline has
been built, independently verified, and deployed for real-world validation.
The duplicated-stereo AirPlay transport is accepted, while post-deployment fixes
and broader service integration remain active. This is not yet a stable public
OTA release. Do not publish device identifiers, private run manifests, serials,
MAC addresses, or local paths here.

The progress cards are intentionally high-level. Update their wording in
`index.html` as hardware enablement advances.
