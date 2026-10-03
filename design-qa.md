# Experimental pass 3 — footer restoration and chapel layers

Final result: passed for this iteration's scope: the original combat footer, chapel foreground, recovery preview, and associated input behavior. Complete parity across the twelve concept boards remains outside this pass.

## Branch and build

- Approved build 807 (`a2af6a4a`) was promoted by creating and pushing `dev`, which did not previously exist in this independent repository.
- `experimental` was rebased onto that `dev` baseline; Git reported it already up to date. No history rewrite or upstream game merge was needed.
- The user approved this pass and the Dodge Roll chevron follow-up for promotion to `dev`.
- Build 809, source `1bdff1bbc9`, high-resolution external artwork with light fallback.

## Findings fixed

- P1: the pass-2 footer moved End Turn to the far edge and separated the controls. Removed its grid-column and width overrides, restoring the original shared five-control model: Actions, Draw, End Turn, Discard/Exhaust, Potions. Short landscape retains the original side rails. Restored the original button appearance as requested.
- P2: the footer row could clip tall controls on desktop. Its host now reserves 64 physical pixels. All controls stay in the viewport at 1440x900 and 390x844.
- P2: outer fan cards dipped below the short-landscape viewport. Lifted the rendered cards by 12 physical pixels; measured bottoms remain below 390 at 844x390.
- P1: the rest scene lacked the reference's seated traveler and fire foreground. Added a transparent, generated 1536x1024 master and high/light WebPs, placed over the existing high-resolution chapel painting. Entry reveal respects reduced motion.
- P2: recovery information was buried in service text. Added a visible ledger computed from the same live rest plan, before the choices on phone and beside them on desktop. Availability details remain expandable.
- P2: Rest lacked an explicit accessible button role and direct focused-key activation. Added role, focusability, disabled semantics and guarded Enter/Space activation.

## Visual comparison

Reference: upper rest scene in `docs/design/player-polish-2026-10-01/09-rest-and-rewards.png`. The footer target is the original game's shared layout, per the user's correction, rather than board 05's right-aligned desktop button.

`docs/qa/experimental-pass3/comparison.html` and `rest-comparison.png` place the reference and actual desktop/phone captures in the same view. The source is a composite board with a different crop ratio, so this is a comparison of scene composition and hierarchy, not a claim of pixel equality. Full-size screenshots were also inspected for text and control readability.

- Typography: retained the game's heading/body fonts and readable live values; no text baked into the new foreground.
- Layout: foreground clears the HUD and meets the lower tray. Recovery precedes the phone actions. Desktop/footer controls remain aligned by the original layout model.
- Color: retained charcoal/gold frames and the original semantic button colors; warm foreground firelight fits the chapel palette.
- Images: foreground alpha edges and full silhouette inspected, no missing image elements observed. Master, exact prompt, hashes and encoder options are under `art/player-polish-runtime/experimental-pass3/`.
- Content: canonical location names, six service options, actual recovery and inventory remain authoritative. The concept's selected-card panel, different title treatment and two-option service list are not substituted for the live game's services.

## Runtime and automated evidence

- Phone End Turn immediately enters Enemy Turn, disables during resolution, then returns to Player Turn. Repeated against packaged build 809.
- Discard opens Card piles; Potions opens the live flask/consumable list.
- Wounded arrival: preview HP 42 to 66 (+24), mana 0 to 1 (+1). Clicking Rest and separately pressing Enter both apply exactly those values; Space was also verified against packaged build 809. Rest then disables and the ledger shows no further gain.
- `shotRestState=wounded` affects only the isolated screenshot/test save.
- 72 focused Node tests pass: player polish, location presentation/scenes, formation, card targeting, and market behavior.
- Artwork manifest: 5,663 checks passed. External package: 316 checks passed.
- Packaged rest: 1536-pixel foreground loaded, zero broken images, and reduced-motion animation is `none`.
- No captured browser warnings/errors in the packaged combat check.
- Local validation only; Actions remains disabled. Network co-op and full campaign completion were not tested.

## Remaining scope

Other reference-board screens and missing item/card illustrations remain future work. This iteration does not claim full twelve-board visual acceptance. Previous pass evidence is preserved in `docs/archive/design-qa-pass2.md`.

## Approved follow-up

Removed the floating truncated-text chevron from Dodge Roll in combat, including its reserved title padding. Normal card selection still exposes the full rules and Information opens the detailed Dodge Roll dialog; both were verified in the browser at 844x390. No mechanics changed.

Packaged build 810 (`5363d038f5`) passes all 316 external-package checks. The rebuilt combat preview confirms the Dodge chevron is hidden, with no captured console errors. Screenshot: `docs/qa/experimental-pass3/dodge-no-chevron.png`.
