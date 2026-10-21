# Verification record

October 21, 2026. Windows, Node.js 22.14.0, npm 10.9.2. Baseline source: `8d1400c5f4cd9675aca781d1d439b6c4f38e2c6a`.

## Automated checks

- Baseline: the 10 supplied route tests passed, but did not exercise Next-card progression or form edits.
- Refreshed: all 21 tests pass, including the original 10 checks and 11 new behavior/regression checks.
- Clean lockfile installation with `npm ci --ignore-scripts` passes.
- Both HTTP-client and browser-demo builds pass.
- Production dependencies: `npm audit --omit=dev` reports zero known advisories at this verification date.
- Full toolchain audit: 19 moderate advisories remain through the Jest/Babel coverage dependency chain (`sprintf-js` via `argparse`, `js-yaml`, and Istanbul). No high or critical advisories remain. These development tools are not included in the static application bundle. No claim of a comprehensive security audit is made.

## Browser walkthrough

- Local demo: created a deck, edited its name, added a card, refreshed, edited the card, and deleted it. Edits persisted through refresh; deletion updated the overview without reloading the page.
- Local study: Flip revealed the answer; Next advanced to card 2 and showed its question.
- Public demo: sample library loaded without login, study advanced to card 2, and a deck created in the live demo persisted through a direct-route refresh. Reset demo restored the two original sample decks.
- Public desktop at 1366 × 1000 and mobile at 390 × 844 were visually inspected. Document widths were 1351 and 375 respectively, with no horizontal page overflow.
- Actual live screenshots: `images/desktop.png` and `images/mobile.png`.

## Local HTTP verification

The documented HTTP-client build loaded the JSON Server deck library in a browser. An actual HTTP walkthrough against a separate temporary copy of the seed database passed deck/card creation, update, embedded read, and cascade deletion. Windows watch mode had restarted the development server on its own writes, causing connection resets; watch mode is now disabled. JSON Server still persists writes without it. Public root and study deep routes both returned HTTP 200 anonymously, with connect-src none.

## Scope of evidence

The public browser adapter is a working local-storage application, not a hosted HTTP backend. Storage isolation/persistence/failure behavior is tested separately from the original route tests. The local HTTP setup remains a development option. This is coursework and portfolio repair, not evidence of a commercial deployment or user outcomes. Accessibility checks cover labels, focus styles, control nesting, responsive reading, and a skip link; a full assistive-technology audit has not been performed.
