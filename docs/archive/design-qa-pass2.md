# Experimental pass 2 — visual and runtime QA

Final result: blocked for complete twelve-board visual acceptance. This pass is ready for review with the scoped checks below passing. The original rejected implementation is archived in `docs/archive/design-qa-rejected-player-polish.md`; its acceptance claims remain withdrawn.

Repository: `cehinds/ashenedSpire-js`, branch `experimental`. No upstream merge or promotion.
Build: **0.7.1.807**, source **d5fbb9cbcd**, external high-resolution art with light fallback.

## Changes and gameplay behavior

- Title: full-body transparent traveler, separate landscape and foreground layers, smaller secondary buttons and engraved icons. Replay scene now animates the visible landscape and traveler. Reduced motion skips that transition.
- Combat: one scene fills the viewport behind the hand. Smaller corner HUD, compact bottom controls, larger readable hand, left-side player placement and waist-height ordinary Stitched Hounds. Boss/elite stature remains intact. The initial player column is now 1; saved explicit formation preferences still apply.
- Merchant: expandable stock drawers on desktop and a native category selector on phones. Relics open first when offered. Stock artwork and selected-item rules have separate space; prices and actual inventory still drive availability.
- Rest: the chapel painting remains visible above a lower control tray, including when smith services are present.
- End Turn, Buy and Rest commit on a normal click or keyboard activation. Save deletion and other management actions retain confirmation. Card targeting retains click-card/click-target, drag and optional hold.
- Dodge Roll has a concise resting face. Its expanded rules and actual weight-dependent costs are unchanged. Resource bars now show the proportion remaining in each pool instead of comparing unlike maximum pools by their physical widths.

## Evidence

Browser checks used the Codex in-app browser at 1440×900 and 390×844. The composite reference boards' desktop frames are not literally 1440×900 crops; comparisons use their hierarchy, subject placement, screen coverage and supplied layers, rather than stretching the whole board into the viewport.

References reviewed: 01 arrival, 05 combat, 08 merchant/forge, and 09 rest/rewards. This pass changes the title, combat, merchant and rest compositions; it does not claim a new review of every screen on all twelve boards.

Captures: `docs/qa/experimental-pass2/`.

- `title-desktop.png`, `combat-desktop.png`, `merchant-desktop.png`, `title-phone.png`, and `combat-phone.png`: packaged build 807.
- Phone merchant and desktop rest: source preview of the same changes, with final packaged interaction checks recorded in this chat.
- `entrance-0.png` through `entrance-6.png`: visible traveler reveal and landscape transition.
- `attack-0.png` through `attack-7.png`: actual attack sequence, including changed player pose and damage feedback; no reduced-motion override.

Actual interactions verified:

1. Golden Sprout purchase: 999 → 562 cinders, relic added, next 611-cinder offer disabled. Category changes still expose cards, flasks and the remaining shelves.
2. Gorefire Slash: actions 3 → 2, stamina 2 → 1, mana 1 → 0, first hound HP 16 → 8 with Bleed. Repeated against packaged build 807.
3. End Turn: immediate Enemy Turn and eventual return to play; the button is disabled during resolution. Tested on desktop and phone.
4. Rest: one click marks the visit Rested; available services fall from 4 to 3.
5. Phone: corrected clipped footer and card-tray scrollbar. All five combat footer controls remain visible.
6. Packaged title: correct build stamp, no broken image elements or document overflow, and no captured warning/error logs. Reduced-motion mode keeps both title layers visible with no animation, including after Replay scene.

## Automated checks

- 81 focused Node tests passed across player-polish, combat sprite scale, scene layers, formation layout, combat targeting, market additions, framework and title contrast suites. The framework suite also reports its 82 internal assertions.
- `art-manifest.mjs --check`: 5,662 checks passed.
- `verify-external.mjs`: 316 checks passed.
- `buildversion.mjs`: current source matches build 807 / d5fbb9cbcd.
- `git diff --check`: clean.

These are local results; GitHub Actions remains disabled in this independent repository. No campaign completion or network co-op claim.

## Remaining visual differences

The runtime still uses canonical playable-character sprites, live card costs, variable hand sizes and actual shop inventory. Some items (for example Fell Warden Brand) have no dedicated painting and retain a fallback glyph. Dodge Roll still has an icon rather than a concept painting. The rest composition does not yet include the seated traveler/campfire foreground from board 09. Other screens from the twelve-board set have not received this second pass.

Those gaps prevent claiming complete artwork parity. They do not invalidate the recorded interaction results. Keep this work experimental and unmerged.
