# JSON-driven illustrated cards

`src/content/card-layout.json` is the shared card structure. Every image layer has
an `href`, original image dimensions, optional transparent-padding `trim`, and
editable x/y/width/height, rotation, opacity and hue. Its `clipPolygon` masks the
oversized artwork. Array order is paint order. The bottom HUD is unchanged.

Text layers bind to `name`, `rules`, `tags`, `action`, `mana` and `stamina`.
Those values always come from the current game model, including upgrades and
combat previews; the example numbers and words in an editor export do not change
game balance. PNGs stay separate and text remains live.

Edit the shared JSON, then build normally:

```sh
node tools/bundle.mjs --external-art --out build/card-components-preview
```

The build automatically compiles the layout into a separate resolved object for
each of the 219 current card definitions. Runtime objects are embedded in the
game; inspectable copies ship as `cards/<cardId>.json` with `cards/index.json`.
All image hrefs go through the existing asset resolver, which supports external
asset builds and embedded standalone releases without runtime JSON requests.

To use a new portable Card Studio export as the shared structure:

```sh
node tools/card-components.mjs --import "D:/repo/assets/gorefire.json"
```

This preserves PNG bytes, extracts images to content-named PNG files, retains
separate text bindings, and updates the source JSON. Rebuild to publish the new
layout. Running the compiler alone also refreshes source-mode previews.

`artworkByCard` assigns an illustration href to a card ID. Equipment-created cards
continue using their actual equipment artwork. Cards without an assigned painting
retain their existing glyph; Dodge Roll's removed decorative glyph stays hidden.
This change does not claim that unique painted illustrations exist for every card.
Per-card `overrides` can change layer geometry/visibility without duplicating the
shared source. Generated `src/content/generated/cardComponents.js` is not authored.

The supplied six UI exports are also preserved in Card Studio's
`src/approved-layouts.json`. The Player Turn export intentionally has all layers
hidden; library insertion can reuse those pieces without changing the preset.

The supplied Gorefire exports define the shared layers. The latest
`gorefire (4).json` centers the mana number; `gorefire (3).json` centers the artwork and uses 41px rules in the 360px design
coordinate system.
Rules use `maxLines: 2` with an ellipsis; full rules remain in card inspection.
`equipmentArtwork` supplies an inset 260x255 area using `fit: "contain"` for
weapon and shield cards, preserving their complete silhouettes. These are
editable JSON properties.

Cost banners use the two supplied Gorefire (3) layouts. `costLayouts.staminaOnly`
uses the short flag and hides mana; `costLayouts.staminaMana` uses the longer flag
when the live mana cost is positive. Both hide the action symbol and number.
Changing a card cost during combat switches the banner on repaint. This changes
card presentation; the separately owned HUD and resource mechanics are untouched.

The latest Gorefire (3) art window is centered at x10/y40, 340x336.25,
with `fit: "contain"`. Card and hand sizing use the template width/height ratio.
Text uses `autoFit`, `minFontSize`, `maxFontSize`, `maxLines` and middle alignment;
rules default to a 30–41 design-pixel range and two lines. Card Studio exposes
these controls and expands PNG export bounds to retain protruding cost pennants.

The battlefield background is rendered by `illustratedBackground.js` using the
existing scene artwork, layers and floor-alignment model. The header HUD floats
over this artwork without container backgrounds: HP is enlarged by 22%, with
relics directly below. The illustrated Armoury and Menu controls remain functional.
The bottom HUD remains separately authored.
