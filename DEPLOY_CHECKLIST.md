# Manual GitHub Pages replacement

## Upload exactly these items to the existing Pages publishing folder

- index.html
- style.css
- app.js
- experience.js
- popup-ar.js
- assets/ (all files)
- vendor/ (all files, including the patched controller)
- licenses/ (all files)
- CNAME
- .nojekyll (a hidden, empty file)
- README.md
- CHANGELOG.md
- DEPLOY_CHECKLIST.md
- VALIDATION.md

The ZIP contents belong at the site root. Do not upload the ZIP itself or nest them in WebAR_V2_1_Final/. Keep the existing Pages branch/folder setting and repository workflow configuration. CNAME must contain exactly `ar.carrieqian.com`. Do not change DNS or the QR code.

## Before replacement

1. Download/backup the currently published website files.
2. Extract the V2.1 ZIP locally and verify the above items exist. On macOS use Command–Shift–Period to reveal .nojekyll if necessary.
3. Replace the publishing folder's runtime files together, including **assets/targets.mind** and **vendor/**. Do not mix the old one-target file or old vendor controller with V2.1 JavaScript.
4. In the dedicated published site only, remove obsolete files not referenced by this package: old compile.html, old one-target files outside the new assets folder, old `assets/Web AR.mp4`, `assets/target video cover.png`, unused scene/model/preview exports or old service worker files if present. Nothing in this package registers a service worker. Keep unrelated repository configuration such as .github/ and the existing publishing settings. Never delete your local original, standalone popup or Blender source folders as part of deployment.
5. Upload/commit these files manually using your existing process. Wait for your existing Pages job to finish. No deployment has been performed by the package author.
6. Open https://ar.carrieqian.com in a fresh tab. If necessary close an old AR tab and reopen, or clear stale site cache. The app and targets use a V2.1 URL suffix, but all files must still be uploaded as a consistent set.

## Real-phone acceptance checklist — still required

Test iPhone Safari and Chrome separately; repeat on Android Chrome if available. Record device, OS and browser versions. These steps were not performed on physical phones during V2.1 packaging. Targets and dependencies are byte-identical to V2; upload the whole package consistently.

- [ ] Landing fits portrait/landscape; Start asks for the rear camera; permission denial explains how to retry.
- [ ] Full front image on a Mac screen is recognized; then test the actual printed front. Overlay corners align to the card as the phone moves.
- [ ] Front plays muted, lower speaker unmutes/mutes without seeking, existing music intact.
- [ ] Lose/reacquire front **five times**. Overlay and audio hide/pause when lost and resume correctly; no false flip prompt.
- [ ] Let the complete video finish normally. Both flip sentences appear, video repeats; ordinary loss never displays the prompt.
- [ ] Start a fresh session **on the back first**. Before the entrance finishes, no flip prompt appears; afterward see “Want to see what I create? / Flip the card over!”. It hides on front detection and never repeats in that session.
- [ ] In a separate session start on front. Let the video genuinely finish to see the larger front-to-back prompt once. After exploring both sides, neither prompt repeats, including after tab-return Restart.
- [ ] Flip to back, keeping the entire QR/character layout visible. The back is not mistaken for front and the flip prompt hides.
- [ ] Test the back artwork upright on a Mac screen **and** on a horizontal printed card. Carrie/cat rise outward with their feet fixed to print; no below-card displacement or edge-on strips from normal viewing angles; cat follows Carrie, computer arrives from left, camera from right. Different layers show parallax when moving the phone. No beige floor or virtual card obscures the live image. Sideways motion shows parallax without the planes turning to follow the camera.
- [ ] Switch front → back → front → back repeatedly; only the corresponding experience is visible/audible. Try brief and long loss of the back.
- [ ] Home stops the camera indicator; Start works again. Repeat **three times** and try rapid Start/Home taps.
- [ ] Video tap and fixed Portfolio link each open exactly one new tab. Home and speaker never navigate.
- [ ] Return from Portfolio or another app; Restart camera is clear and restores tracking. If playback is blocked, Resume video works.
- [ ] Verify prompts do not cover artwork or lower controls. If the target fills the view, move back to allow the pending prompt room.
- [ ] Test glare, screen brightness, distance and moderate card tilt; verify no uncaught errors through available browser developer tools.

If wrong-side recognition occurs, first move back enough to show the full side: the two character regions are intentionally similar. Record which side, distance and lighting caused it. Automated evidence and known limits are in VALIDATION.md.
