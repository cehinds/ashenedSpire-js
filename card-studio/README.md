# Ashen Spire card studio

[Open the studio](http://localhost:4191/) · [Wireframe](http://localhost:4191/wireframe.html) · [PNG asset kit](illustrated-png-kit.zip)

Illustrated authoring tool included in the ashenedSpire-js repository. Documents remain separate from game runtime layouts.

## Editing

Choose a component and select a layer from the canvas, left panel or bottom component strip. Drag unlocked parts or use X/Y, width/height, rotation and opacity fields. Arrow keys nudge a selected canvas layer; Shift moves ten units. Forward/Backward change the layer order. Hide and Lock are independent. Solo selected isolates a part for preview; Show all clears isolation without changing saved visibility or export contents.

Every word and number is editable text with font, size, color, weight and alignment. PNG assets contain no labels or numbers. The card has 14 layers: blank base, oversized clipped artwork, shaped text panel, hanging flag, title, rules, three separate cost icons plus a separate stamina harness, three separate cost values, and bottom tags. Artwork X/Y and scale are independent of the card silhouette. Clipping can be toggled per image.

Replace PNG changes the selected image. Add PNG and Add text create more layers; Duplicate and Remove support composition edits. Undo/Redo cover editing changes. Save/Load persist all components in this browser. Export JSON embeds the current component's PNG bytes and editable layer data. Import JSON replaces the current component. Export PNG opens a visible 2× composed preview with a download link. Each selected image also has a PNG download link.

The 17 presets include three cards, health, cost symbols, Player Turn, Enemy Turn, intent, Armoury, Menu and footer controls. All retained preset words and numbers are live text overlays. Source links and source comparisons were removed from the product UI.

## Artwork

`public/assets/v2/` holds real transparent PNG cutouts. Blank base, shaped panel, hanging flag, energy/mana/stamina symbols, navigation symbols, flasks and health fill were produced with built-in imagegen. The unlettered attack, guard and ember paintings reuse the supplied high-resolution masters from the AshenSpire illustration kit. The artwork is clipped by the editor; it is not a screenshot fragment.

The renderer trims transparent PNG padding to each asset's measured visible bounds, and PNG export applies the same bounds. Original PNG bytes are retained. Tiny low-alpha fringes exist on some generated cutouts; inspection over the studio canvas confirmed no opaque rectangular background. Full prompts and alpha measurements are in `public/assets/v2/card-and-resource-provenance.md`, `card-and-resource-alpha.json` and `navigation-provenance.md`. The kit ZIP includes the PNG masters and provenance.

## Validation and practical limits

Desktop and phone editing, layer isolation, card clipping/dragging, live text/value changes, save/load, component switching and composed PNG preview were browser-verified. Three document tests pass, including all 17 preset assets, portable JSON round-trip with byte-for-byte PNG preservation, malformed document rejection and PNG upload validation.

Automated native file transfer remains unverified: the browser connector timed out waiting for downloads, and PNG/JSON file selection was blocked because its Chrome extension lacked file-URL access. Export-ready JSON and the actual 720×1080 composed PNG preview were verified. No browser permission was changed. This limitation concerns automation coverage, not an asserted successful download/import in the browser. See `design-qa.md` for evidence and exact coverage.

## Develop

```powershell
npm ci
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4191 --strictPort
npm run build
npm test
```

Production files are in `dist/client`. Source is `src/App.jsx`, `src/studio-data.js`, `src/studio-export.js` and `src/styles.css`. The previous fragment explorer is archived; it is not the current editor.

## Group editing update

Canvas clicks select a whole group. Double-click a canvas part or choose a layer row to edit the individual image/text. Shift-click toggles membership of the selection. Drag on blank stage space for marquee selection; any selected group member includes its whole group. Right-click opens Group/Ungroup, Duplicate, Delete unlocked, Lock/Unlock, ordering and alignment/distribution actions. Ctrl+G groups; Ctrl+Shift+G ungroups; Delete removes unlocked layers; arrows nudge (Shift = 10); Ctrl+Z and Ctrl+Shift+Z undo/redo. Text inputs retain their normal keyboard behavior.

Corner handles resize any unlocked layer or selection. Shift preserves aspect ratio. Group resizing preserves relative positions and scales text. Snap aligns edges/centers to the grid, canvas and other parts; Alt temporarily bypasses it while moving. Grid visibility and spacing are independent controls. Group membership persists through local saves and portable JSON; PNG export uses the ordinary flat layer order.

Default costs now use the supplied Footer Atelier action sigil, mana diamond and stamina orb/harness. Values are editable text inside their icons. The resource component includes its connector. Player/Enemy Turn plates have a subtle Red hue slider; the shared filter is applied in the canvas preview and composed PNG export. Source PNGs are untouched. Provenance and hashes are in `public/assets/v2/reference-components.json`.

Focused verification: `npm test tests/studio-geometry.test.mjs`. The geometry tests cover group selection/transforms, snapping, aspect-preserving resize, marquee and distribution. Parent agent owns integrated browser verification and repository merge.

Zoom selection fits the current group or layer in the canvas. Fit restores the whole composition.
