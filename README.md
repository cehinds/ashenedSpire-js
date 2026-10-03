# ashenedSpire-js

Independent JavaScript edition of AshenSpire, starting from the `experimental`
working snapshot of [cehinds/AshenSpire](https://github.com/cehinds/AshenSpire).
The experimental UI changes are included and remain work in progress. No merge
or release approval is implied by this repository.

## Run locally with full-resolution art

Use Node.js 22 or newer. No npm installation is required.

```sh
node tools/launch.mjs --full-art
```

For an external-art build (smaller HTML, art loaded alongside it):

```sh
node tools/bundle.mjs --external-art --out build/web
python -m http.server 4180 --directory build/web
```

Open http://localhost:4180/AshenSpire.html. The `?shot=title` preview route uses
an isolated demonstration save. Motion should be reviewed without the old
`shotSettings={"reducedMotion":true}` override.

## Artwork provenance

The full-resolution runtime art is vendored in `assets/`. Its 5,410 upstream
files were downloaded from and verified against
[AshenSpire-art hd-assets-v3](https://github.com/cehinds/AshenSpire-art/releases/tag/hd-assets-v3),
including the release ZIP SHA-256 and every file hash. This snapshot also keeps
105 experimental artwork additions and the existing lightweight twins.
Original artwork credits and licenses remain in the repository.

The immutable upstream manifest, release checksums and credits live under
`art/upstream-hd-assets-v3/`. Verify the high-resolution files locally with:

```sh
node tools/verify-upstream-art.mjs
node tools/art-manifest.mjs --check
```

`art-release.json` and the inherited strict fetch/CI workflows describe the older
upstream game's complete pack contract. They are retained as historical tooling;
they do not describe this fork's combined experimental art set. GitHub Actions
are disabled initially so inherited deployment workflows cannot publish a build.
Use the vendored trees and the commands above for this fork.

## Origin and status

This repository starts a new Git history from the current working snapshot on
`experimental`, based on upstream commit
[`a99aa51b91b1f824dda315feb0256993cbb6d743`](https://github.com/cehinds/AshenSpire/commit/a99aa51b91b1f824dda315feb0256993cbb6d743).
Upstream history remains in the original repository. `fork-origin.json` records
the snapshot and artwork provenance. The original checkout and PRs are unchanged.

Full effects and visual acceptance testing are still pending. This is a working
experiment, not an accepted replacement for the reference artwork.
The [upstream README](docs/UPSTREAM-README.md), [developer guide](DEVELOPER.md),
[credits](CREDITS.md), and [license](LICENSE) are retained for reference.
