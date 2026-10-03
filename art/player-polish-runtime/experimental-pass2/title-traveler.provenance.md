# Title traveler layer

- Generated: October 2, 2026
- Method: built-in `image_gen` tool, transparent_background=true. No CLI fallback; no post-generation image edits.
- Reference: `docs/design/player-polish-2026-10-01/01-arrival-and-identity.png`, upper-left desktop title traveler.
- Selected master: `title-traveler.png`, 1024 x 1536 RGBA.
- Original: `D:/repos/.codex/generated_images/01a10016-7c01-7841-a5ed-618502103f2e/exec-2df5fad5-ee6e-44e9-bf67-476c3d1c5cc2.png`.
- Inspection: full hood, cloak and boots in frame; traveler faces three-quarter away toward the right. Alpha range 0-254; 871653 fully transparent pixels, 654874 pixels at alpha 240-254. All sampled canvas edge points transparent. Generated alpha preserved unchanged.
- Scope: decorative title traveler matching the approved concept; not a canonical playable character or equipment binding.

## Generation prompt

Use case: background-extraction. Asset type: transparent full-body character layer for the AshenSpire title screen. Input image is the approved arrival-and-identity reference board; match ONLY the hooded traveler standing in the lower-left of the upper-left desktop title screenshot. Recreate that same traveler faithfully as one isolated high-resolution full-body cutout, facing three-quarter away from camera toward the right, hood concealing face, weathered dark charcoal long ragged cloak, brown compact travel backpack with straps and rolls, straight sword sheathed across back with hilt projecting above the right shoulder, leather gloves and boots. Preserve the reference's realistic painterly dark-fantasy cloth, worn leather and subdued warm edge lighting. Tall portrait canvas preferably 1024x1536. Complete head-to-boots silhouette fully within frame with a little transparent padding, cloak tips intact. Intended displayed subject approximately 280x520 pixels, foreground left quarter of a 1440x900 composition. Truly transparent background with alpha. Remove all environment, ground, landscape, tower, text, UI and any rectangular backdrop. No extra character, no square shadow, no new objects.
