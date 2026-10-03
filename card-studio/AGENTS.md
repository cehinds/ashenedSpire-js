# Prototype Instructions

## User direction — October 3, 2026

The illustrated card studio must use natural-silhouette transparent PNG cutouts, never rectangular screenshot fragments. No baked words or digits: labels and numeric values are independently editable text. Card stack is base PNG, oversized movable artwork clipped to inner card silhouette, shaped text-box PNG, editable title/rules/numbers and PNG icons, with tags at the bottom. A hanging flag/ribbon is a standalone movable PNG. Multiple independent energy/mana/stamina costs are supported. Keep the bottom component strip. Remove Source metadata, Source links, source comparisons and source-index controls from the UI. Support layer selection, position/size/rotation/opacity, font/text/color/alignment, hide/lock/reorder, artwork clip/position/scale, PNG replacement, local save/load and JSON import/export. Keep the authoring package isolated under card-studio; the user authorized its inclusion and merge into the fork on October 3, 2026. Do not apply saved layouts to game runtime without an explicit integration request.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## October 3 editor upgrades

Use supplied Footer Atelier PNGs for the antique brass stamina harness, green stamina orb, green action sigil and blue mana diamond. Put editable values inside their icons and group their image/text layers by default. Support marquee and Shift selection, right-click grouping, group drag/resize, snap/grid, alignment and keyboard editing. Keep groups in local saves and portable JSON. Turn banners have a subtle adjustable red hue and outline treatment shared by preview and PNG export. Root agent owns authorized game-repository integration; this editor output remains the implementation workspace.
