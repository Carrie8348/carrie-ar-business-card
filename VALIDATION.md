# V2.1 validation — 2026-11-17

## Root cause and correction

The supplied iPhone screenshot was inspected. Target 1 had recognized successfully. The V2 root transform put paper normals perpendicular to a frontal vertical target view; with a camera above the printed feet, outward character geometry could project downward. This explains the edge-on accessory strips and below-target appearance without blaming the screen or changing image recognition.

V2.1 converts the existing measured hinge locations into image-anchor XY coordinates and applies outward rotation only to individual bottom-edge hinges. An entrance-time target-local camera measurement selects a readable 20–75° rest tilt, then freezes it. This is a deliberate outward paper lean, not an exactly perpendicular 90° stand and not a continuously camera-facing sprite. All original PNGs, sprite proportions, keyframe order and target mappings remain.

## Desktop / automated testing

The tests use desktop Google Chrome, synthetic camera frames and separate projection/state checks. They do **not** constitute physical-device testing.

- The real MindAR matcher/tracker recognized a synthetic sequence front → back → front → back, with blank/lost intervals. Two acquisitions of each side in one session; no simultaneous experiences. Video paused and scenes hid on loss.
- A separate synthetic-camera **back-first** run recognized the frontal back before the front: no prompt during entrance; the exact back-to-front copy appeared after completion, outside the projected artwork and above controls. Switching to front hid it; genuinely completing the front video after both sides were explored did not show another prompt. No browser errors.
- Separate 3D projection/render tests used a frontal vertical target pose and a horizontal-card viewing pose. Selected rest angles were 45° and 75°. For both Carrie and cat, the bottom hinge had **zero numerical displacement** from its mapped printed foot position; top vertices rose outward in +target Z and upward on screen. The paper faces remained readable rather than edge-on.
- In both poses, moving the virtual camera sideways changed head-versus-foot projected positions. The selected hinge tilt stayed exactly fixed while the camera moved, confirming spatial parallax rather than billboarding. Rendered front and side views were inspected. The card texture/background used for those isolated test renders is test-only; no virtual base or opaque background was added to runtime AR.
- Guidance state checks passed: back completion waits for the full entrance; tracking loss cannot finish it; back-first shows the correct copy; front-first still requires genuine video end; prompt hides on loss/opposite recognition; neither direction repeats after both sides; tab-restart preserves history; Home/new Start resets it. Pending guidance waits if no free screen space exists.
- Actual HTMLMediaElement playback was allowed to finish after a test seek near its end: the front prompt displayed, the unchanged video repeated, and ordinary loss did not count as completion. This complements the event-level prompt tests.
- Three full Home/Start cycles and four rapid Home/Start cycles retained one renderer, one controller/worker, two anchors, one canvas and one live camera track. No duplicated canvas pointer listeners.
- Front video and fixed Portfolio link opened one new tab each via desktop input; speaker did not navigate. Returning offered Restart and restored tracking. Simulated permission denial displayed the existing error path.
- Mobile-size portrait and landscape layouts had no horizontal overflow. Existing landing content and Start visibility remained. The larger front prompt was inspected in a mobile-size screenshot; artwork-aware placement kept it above the video and away from lower controls.
- No uncaught JavaScript errors in the completed main browser regression.

## Preservation and packaging

Before ZIP creation: all source files in the original V2, V1 and standalone popup folders were checked against pre-edit hashes. All V2.1 assets, video, compiled targets, vendor files, CNAME, .nojekyll and license files are byte-identical to V2. Target count remains two, in the unchanged order front 0 / back 1; the 779,048-byte targets.mind was reused, not regenerated. Landing markup/copy and all CSS outside the prompt block are preserved. Speaker/Portfolio markup and behavior remain unchanged. JavaScript syntax, local paths, required files and ZIP root contents were checked.

## Remaining real-device checks

No new iPhone or Android V2.1 camera test was performed. The user's supplied screenshot is evidence of the prior V2 issue, not a V2.1 pass. Test both journeys on an upright screen and on a horizontal printed card, checking exact printed-foot registration and natural tracking motion. Safari permissions, real speaker output, optical noise/moiré/glare, browser safe areas and performance still require the manual DEPLOY_CHECKLIST.md.

Flat paper layers remain thin if moved to an extreme edge-on view after their entrance angle has locked. A long loss/reacquisition selects a fresh readable angle. Printed artwork naturally remains visible in the camera feed behind lifted layers; this does not erase print. If artwork fills the camera view, guidance waits for a free strip rather than covering it; move back slightly. Once a prompt has appeared, loss or subsequent overlap dismisses it without showing it a second time that session. No GitHub, domain, DNS or Pages configuration changes were made.
