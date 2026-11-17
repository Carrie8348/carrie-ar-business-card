# Validation record — 2026-11-17

## Automated / desktop evidence

Tested in installed desktop Google Chrome using an actual fake MediaStream containing perspective-transformed copies of the final full PNGs, with blank frames between sides. This exercises MindAR feature matching and tracking, rather than only calling scene events. Test fixtures are not deployed and the source targets were not changed.

- Compiled targets re-imported successfully: exactly **two**, front index 0 / back index 1, both 1530 × 990. File size **779,048 bytes**.
- Front PNG matches the previously working image byte-for-byte. Back is the exact supplied final PNG. MP4 and all nine popup PNGs match their original source bytes.
- Existing QR decoded to **https://ar.carrieqian.com**; not regenerated.
- Synthetic sequence correctly recognized front → lost → back → lost → front → lost → back. Front and back acquired twice each in one session. No simultaneous experiences; lost scenes hidden and video paused.
- Stock matcher initially misidentified back frames as front due to shared character features. With the documented strongest-valid-match adjustment, the full dual-target regression passed twice.
- Original front geometry verified: width 1, height 11/17, position [0,0,0]. Starts muted and playing on recognition; speaker unmutes the existing media.
- Tested a **real HTMLMediaElement completion** by seeking near its end and allowing playback to finish. The genuine ended event showed the flip prompt and restarted playback. Loss did not create a completion. Back recognition hid the prompt.
- Nine true textured PlaneGeometry objects verified, with separate transforms and bottom hinges. No opaque card/floor boxes. Back root transform and printed-foot positions verified. Desktop camera screenshots inspected.
- Event-level tests additionally repeated loss/reacquisition five times, verified short-loss continuation and long-loss popup replay. These are simulated state transitions, not five physical-card scans.
- Three complete Home/Start cycles reused exactly one controller, worker and renderer, two anchors, one camera video and one canvas. Only one live capture track remained. Four rapid alternating Home/Start cycles also passed.
- Actual desktop input events opened exactly one new tab from the front video and from the Portfolio link. Sound did not navigate. Returning to the AR tab offered Restart, which restored tracking.
- Simulated camera permission denial returned to the landing with a clear error. Portrait 390 × 844 and landscape 844 × 390 had no horizontal overflow. Lower controls were separate and Start remained visible on the mobile landing.
- No uncaught JavaScript errors in the completed browser regression. Canvas pointer listeners did not duplicate after restart.
- JavaScript syntax, explicit local runtime references, required files, original-file preservation, CNAME and archive contents checked before packaging.

## Asset identity (SHA-256)

| File | SHA-256 |
| --- | --- |
| card-front.png | 5afb52397656e66834c502fa489cae087e6ec9c8a3cba36fb837e71784c3b7ee |
| card-back.png | f4a472bf198a5e9d4dfacaadf5596dc6c6381e28b96aa5d84db9c5005aaad7f2 |
| portfolio.mp4 | 530b5d2f5293a282cff4dd7da8c76f0a9c0dc609a8924178175290c566c3eaae |

## Not verified on hardware

No iPhone, Android phone or physical card was tested during V2 packaging. Actual Safari media permissions, audibility, printed alignment, tracking under motion/glare, smartphone performance, safe areas under real browser toolbars and production-domain delivery require the manual checklist. Desktop mute state verification does not prove sound through a phone's speaker. Synthetic images have no autofocus, sensor noise, print texture or screen moiré.

Recognition quality concerns and paper-plane visual limitations are described in README.md. The matcher fix reduces the observed ambiguity; it cannot certify every partial view. No GitHub repository, deployment, DNS or previous source files were modified.
