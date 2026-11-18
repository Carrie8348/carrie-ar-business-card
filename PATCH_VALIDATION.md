# V2.2 validation — 2026-11-18

## Scope / identity

The patch was overlaid on the successfully delivered V2.1 site for testing. It contains only changed/additional runtime files and these two patch notes; no unchanged video or vendor files are shipped. All previous V1, V2, V2.1 and standalone popup source folders were hash-checked as unchanged before delivery.

- New back PNG is the exact final 1530 × 990 Canva export, byte-identical to the supplied file. It was compiled whole, without cropping or artwork changes.
- targets.mind was compiled and re-imported: exactly **two entries**, Front = 0 and Back = 1; **960,069 bytes**. The entire decoded Target 0 entry is identical to the previous V2.1 entry, including matching/tracking data, not merely its dimensions.
- Full-resolution feature counts: front 64 maxima / 99 minima; new back 73 / 193. Tracking points at 396 × 256 and 198 × 128: front 22 / 23; back 34 / 27 (previous back 25 / 23). More detail is encouraging, not a guarantee of physical robustness.
- Original QR decoded to **https://ar.carrieqian.com** and was not replaced.
- Studio and icons are selected original RGBA pixels extracted from Image B. No generated characters, commercial logos, recoloring or nonuniform scaling. The picture frame was masked away from its touching sticky note. Unneeded swooshes/sticky-note artwork was not added to the scene.

## Spatial correction and limits

The popup root stays in MindAR's XY image frame: X right, Y toward printed top, +Z outward. It is uniformly scaled by 1/0.085, preserving 85 × 55 mm card dimensions. A bottom-translated studio plane rotates around its own X hinge; the whole layout is not rotated away from the target. The printed desk bottom is at target y=899 px; its x extent is 73–1047 px. A measured source desk width maps there with uniform scale, and its bottom-center is the fixed hinge.

Image A and B are related but not identical illustrations/proportions. Matching the desk width and bottom while preserving Image B's aspect ratio cannot make all internal pixels match the print. The top of the supplied studio can therefore differ slightly from the printed silhouette even when flat; no character warp was used to hide that difference.

The studio rises first; icons start only after its rise has finished. Four separate PNG planes enter from left/right/top/bottom, with distinct depth offsets. All remain children of Target 1. No opaque card, floor, room, preview background, iframe, OrbitControls or video substitute is used. The sequence settles at **4.2 seconds** and has no idle bobbing.

For a horizontal card viewed obliquely from its lower/front edge, the selected final tilt is **90°**, perpendicular to the card. A frontal vertical target viewed at exactly 90° to the paper would necessarily show only its edge. V2.2 therefore selects a readable 30–90° outward tilt from the target-local view at entrance; the frontal test selected about 51°. That angle stays locked while moving sideways: this is not billboarding. Long loss/replay can select a fresh angle. Very extreme edge views can still make real paper layers thin. Printed artwork naturally remains visible in the live camera feed behind the raised layers.

## Desktop / simulated results

Installed desktop Chrome with actual MindAR matching/tracking on synthetic camera frames of the exact targets:

- Front → lost → back → lost → front → lost → back passed. Each side acquired twice in one session; correct indices, no overlap or wrong-side activation in the tested sequence. No target priority override was added. Existing best-valid-inlier comparison was retained unchanged in vendor/.
- Back-first independent run passed: seated studio recognized, no prompt before entrance completion, correct existing back-to-front copy after completion, hidden on front detection. Genuine front video completion after both sides were explored did not repeat a prompt.
- Separate 3D projection/render tests passed for a frontal vertical target and an obliquely viewed horizontal card. Studio hinge displacement was zero numerically, top vertices rose into +Z, horizontal final angle was exactly 90°, and sideways camera motion produced differential parallax with the tilt locked.
- Runtime scene contained **five separate textured planes** (studio + four icons), no opaque base/box geometry. Rendered main/side views were inspected. Test-only backgrounds/printed cards are absent from runtime AR.
- The unchanged front video plane remained 1 × 11/17 at [0,0,0], played muted, and existing audio toggling passed. Actual media completion (after a test seek near the end) showed the unchanged front prompt and repeated playback; tracking loss did not count as completion.
- Five additional event-level loss/reacquisition checks, short-loss continuation, long-loss replay, both guidance journeys and no repeated guidance passed.
- Three complete Home/Start cycles and four rapid Home/Start cycles retained one controller/worker, renderer, canvas and live camera stream; two anchors. Pointer listeners did not duplicate.
- Video tap / Portfolio opened one new tab each; sound did not navigate. Tab-return Restart and simulated permission denial passed. Portrait/landscape layout regression checks passed.
- No uncaught JavaScript errors in the completed browser tests. Updated modules parsed successfully; local asset paths and patch-overlay contents were verified.

## Still needs a physical phone

No V2.2 iPhone, Android or physical printed-card camera test was performed. Optical tracking, autofocus, motion blur, print/screen glare, moiré, real speaker output, Safari permissions and smartphone performance remain for the manual checklist. Keep the whole target visible, especially its distinct studio and QR/text regions. Recognition from tiny, partially occluded or very steep views is not guaranteed. No GitHub/DNS/deployment changes were made.
