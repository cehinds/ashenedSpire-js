# Card studio v2 QA

final result: passed

Scope: visual and core editing gate passed. Native browser file-transfer automation is a documented residual verification gap, not reported as passed.

## Visual target and evidence

The user explicitly replaced the prior crop-fragment design with a natural transparent-PNG layer editor. `public/wireframe.html` was shown first, then implemented. Visual truth is the approved AshenSpire illustration style, the unlettered supplied master paintings and the generated blank PNG cutouts in `public/assets/v2/`.

Source PNGs and final browser captures were opened together for comparison. The base-card master is 1024×1536; browser card composition is 360×540 logical units, fitted to its stage. This is a layered new composition, not a claimed pixel-identical whole-board reproduction.

- `qa/studio-v2-desktop.png`: 1280×720 browser viewport; full card including bottom tags, bottom component strip and independently scrolling side panels.
- `qa/studio-v2-phone.png`: 390×844 browser viewport; full initial card with tags, no horizontal page overflow, native preset selector.
- `qa/studio-v2-flag-solo.png`: standalone natural flag cutout isolated in the editor.
- `qa/studio-v2-health-desktop.png`: corrected red painted health fill with live name and numeric text.
- `qa/studio-v2-health-phone.png`: mobile component switch/layout evidence.

Same-density browser captures were used. No whole-board image was stretched into the editor. Focused inspection covered frame alpha, panel silhouette, flag isolation, cost icons, editable type, clipping boundary and generated PNG preview.

## Browser checks

Parent and component agent completed complementary checks through CUA:

- Edited title visibly changed; X-position field moved selected layer.
- Save, temporary title change, then Load restored the saved title.
- Mana value changed to 3 independently of the blue PNG symbol.
- Drag moved artwork from (-75,15) to approximately (-104.67,29.84); Undo restored it. Oversized art remained clipped inside the card.
- Flag visibility removed only the flag. Solo selected showed the flag alone; Show all restored the composition.
- Mobile preset selector switched Card → Health → Card; no horizontal document overflow or broken images.
- Export PNG produced an actual 720×1080 image preview including the edited value and transparent surroundings.
- Export JSON produced an Export ready dialog with a portable document Blob link.
- Final captured warning/error logs were empty.

File transfer limitation: browser download-event and media-download waits timed out. The file chooser opened, but setting a local PNG was explicitly rejected because the Chrome extension lacked “Allow access to file URLs.” Permissions were not changed. Browser-native import/download completion is therefore not claimed.

## Automated document checks

`node --test tests/studio-document.test.mjs`: 3 tests passed.

1. All 17 editable preset documents validate; every image reference is an actual PNG asset.
2. Portable JSON embeds all PNG bytes. JSON serialization/parsing retains edited title, rules, mana value, artwork position and layer order; decoded PNG bytes match original files exactly. Fixture saved to `qa/import-fixture.json`.
3. Invalid dimensions, unsupported image sources and disguised non-PNG files are rejected; a valid PNG is accepted by the upload conversion path.

Production Vite build passed. No game integration or CI claim.

## Fidelity surfaces

- Typography: all labels/numbers use editable text overlays. Card serif text, rules and tags remain legible; editor chrome uses system sans-serif. No screenshot-baked words or numbers remain in current components.
- Spacing/layout: base → clipped oversized artwork → shaped text panel → editable text and PNG symbols. Hanging flag is independent. Cards fit initial desktop/phone views; strip remains visible on desktop.
- Colors: worn brass, soot and parchment match illustration direction; independent blue mana, green stamina and gold energy symbols. Health now uses a dedicated red PNG instead of a tinted parchment approximation.
- Image quality: natural PNG silhouettes and alpha verified. Blank frame/panel/flag have no rectangular opaque background. Original full paintings are reused rather than board fragments. Transparency bounds are applied consistently in canvas display and exported PNG.
- Copy/content: title, rules, cost values, tags, turn banners, navigation labels and footer values are editable. Source metadata and compare/source-index UI are gone.

## Iteration history

1. Previous fragment viewer rejected; archived and replaced with wireframe-first editor.
2. Initial editor exceeded desktop height; changed to viewport-height fit and independent side-panel scrolling.
3. Native automatic download lacked inspectable feedback; added Export ready preview and explicit link.
4. Mobile stage minimum height left tags below the fold; reduced mobile fit bound and removed the stage minimum.
5. Health fill was pale due to a parchment substitute; replaced with dedicated unlettered red painted PNG.

No remaining actionable P0/P1/P2 visual findings. Remaining coverage gap is native file-transfer automation, documented above. Future asset/layout refinement remains user-directed.

## Group editing iteration

Implemented resize handles, group movement/resizing, marquee and Shift selection, context menu, keyboard commands, grid/guide snapping and group-safe alignment/distribution. Default costs use supplied Footer Atelier PNGs and independent values inside the shapes. Turn banners use the same configurable red treatment in the preview and export. Eight focused document/geometry checks passed before the final group-safe alignment adjustment; the parent will run the final integrated tests and browser QA. Existing screenshots above document the previous version; current-version screenshots will be captured by the parent in the integrated repository preview.

## Repository integration - October 3, 2026

Integrated under ashenedSpire-js/card-studio. Production build and 12 Node checks pass. Tests no longer depend on a pre-existing qa directory or write a large fixture; PNG-byte and document round-trip assertions remain intact.

Repository preview: http://127.0.0.1:4191/. Verified grouped mana drag (X285 to238, Y129 to160), resize (47 square to72 by70), context ungroup, Ctrl+G regroup, save/load restoring geometry, marquee selecting seven cost layers, and zoom-to-selection/Fit. Both turn banners have the same adjustable subtle red treatment. The actual Player Turn PNG preview preserves it. Native download/upload automation limitation described above remains.

Reference masters are byte-for-byte copies; paths and hashes are in public/assets/v2/reference-components.json. Source manifest and prompts are included. No game runtime source changed in this integration.
