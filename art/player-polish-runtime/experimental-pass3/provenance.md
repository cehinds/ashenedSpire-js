# Rest traveler and fire foreground

- Generated: October 3, 2026.
- Method: built-in `image_gen`, transparent_background=true. No fallback CLI; no post-generation image editing.
- Reference: `docs/design/player-polish-2026-10-01/09-rest-and-rewards.png`, upper desktop rest-site figure and campfire.
- Selected master: `rest-traveler-fire.png`, 1536 x 1024 RGBA.
- SHA256: `888BC77F9E4CEA755C00A0BFA1EC782C13B7F03FBF557B49E0970FFCFA86A194`.
- Original: `D:/repos/.codex/generated_images/01a10016-7c01-7841-a5ed-618502103f2e/exec-601fd2d2-3a7b-4155-bc5d-046819cf164a.png`.
- Inspection: full seated hooded traveler left, facing away and right toward adjacent compact campfire. Cloak, boots and firepit intact, warm firelit edges, no UI or scenery. Alpha 0-254, 961635 fully transparent pixels; all eight sampled canvas corner and edge points alpha 0. Original generated alpha preserved.
- Intended use: decorative foreground composited over existing chapel-rest-master.webp; does not bind a playable character or equipment definition.

## Generation prompt

Use case: background-extraction. Asset type: transparent foreground illustration for AshenSpire rest screen. Input image is a design reference board: use ONLY the seated hooded traveler and adjacent campfire from the upper desktop REST SITE image as visual reference. Faithfully recreate that same seated traveler plus compact campfire as one isolated illustration on truly transparent background with alpha, landscape 1536x1024. Subject composition: traveler left of center, seated on a small low rock, facing right and three-quarter away from the viewer toward the campfire immediately to their right. Dark weathered hood and ragged charcoal cloak, compact brown travel backpack with straps and rolls, sheathed straight sword hilt above shoulder, leather boots, knees drawn up and arms resting on knees, peaceful tired resting pose. Compact orange/gold fire over a few crossed logs and small stones, same ground line as traveler's boots near bottom. Entire traveler, cloak, boots and fire visible with clear transparent padding. Same realistic painterly dark-fantasy texture and warm firelit edges as reference. No scenery, sky, chapel, ruins, landscape, background rocks, ground plane or rectangular shadow. Only small immediate seated rock and firepit stones allowed. No text, lettering, UI, border, icons or other people. Do not reproduce the board. Keep silhouette clear for compositing over existing chapel background. Preserve true transparent alpha.
