# V2.2 — manual back-side patch

Apply to the existing working **V2.1** website (the latest successful V2 revision), at the same GitHub Pages publishing root as index.html. This is a patch, not a complete website. Do not replace the repository with this folder or delete its other files. No deployment has been performed.

## 1. Back up first

Download your currently published files or record the current commit so you can revert. In particular retain index.html, app.js, popup-ar.js, assets/card-back.png and assets/targets.mind together. Keep the existing Pages branch/path and custom-domain setting.

## 2. Upload exactly these files

Extract the ZIP and upload its contents into the existing publishing root, preserving these exact paths:

| File in ZIP / destination path | Action |
| --- | --- |
| index.html | Replace; only app.js cache suffix changes to v=2.2. Landing/copy/layout unchanged. |
| app.js | Replace; only popup module and targets cache suffixes change to v=2.2. |
| popup-ar.js | Replace; new studio and four spatial icon planes. |
| assets/card-back.png | Replace with exact new Canva PNG, 1530 × 990. |
| assets/targets.mind | Replace; two targets, original front 0 / new back 1. |
| assets/studio.png | Add; studio cutout from supplied Image B. |
| assets/studio-layout.json | Add; desk-bottom registration and original aspect ratio. |
| assets/studio_icons/design.png | Add; palette/brush cutout. |
| assets/studio_icons/code.png | Add; generic code window cutout. |
| assets/studio_icons/film.png | Add; generic clapperboard/play cutout. |
| assets/studio_icons/image.png | Add; picture-frame cutout. |
| PATCH_CHECKLIST.md | Add this deployment guide. |
| PATCH_VALIDATION.md | Add test record and limitations. |

Upload the set together. Do not nest it under a new V2_2 folder. Do not upload the ZIP itself as the website.

## 3. Files to remove

**No removals are required.** Old back-only props and back-layout.json are no longer loaded by the new popup. Leaving them in place is harmless and preserves rollback. Keep carrie.png and cat.png: they are still used by the unchanged landing. Do not delete shared assets or previous local project folders.

## 4. Intentionally unchanged / not included

- assets/card-front.png and Target 0's decoded tracking/matching data.
- assets/portfolio.mp4, front video size/placement/playback/audio.
- experience.js (including both flip prompts and once-per-session logic).
- style.css, speaker/Portfolio controls, landing design/copy, responsive layout.
- vendor/ and licenses/; the existing unbiased strongest-valid-match behavior remains. No target is forced to take precedence.
- CNAME (`ar.carrieqian.com`), .nojekyll, DNS, Pages settings and repository workflow files.

The entry-file cache suffixes are necessary to prevent an old popup/targets combination after replacement; no website redesign or camera rewrite is included.

## 5. Verify after your manual upload

Wait for your existing Pages job to finish. Open https://ar.carrieqian.com in a fresh tab; close older AR tabs if needed. Confirm the new files did not land in an extra folder. No build or DNS step is needed.

- [ ] Landing and sound/Portfolio controls look exactly as before.
- [ ] Front alone recognizes Target 0 and plays the original video at the original size; mute/unmute and genuine-ending prompt still work.
- [ ] In a new session, back alone recognizes Target 1 and shows the seated studio, not waving Carrie. It starts flat, rises about the printed desk bottom, then four icons enter from different directions. Back-to-front prompt waits for the complete 4.2-second entrance.
- [ ] Test the horizontal printed card from an oblique angle: the studio stands perpendicular at 90° when acquired from the lower/front edge. Feet/desk bottom do not drift away from their printed location.
- [ ] Test the target upright on a Mac screen: a view-dependent lean selected once at entrance keeps it readable. It intentionally avoids an edge-on 90° stand in a frontal vertical view. Sideways movement reveals real parallax; the scene does not billboard.
- [ ] Repeat front → lost → front and back → lost → back at least five times; then repeatedly flip front/back. Never both scenes, never audio on back/loss, no stale video.
- [ ] Test back-first → prompt → front and front-first → video completion → back. Existing once-per-session prompt behavior remains.
- [ ] Home/Start three times, rapid Home/Start, tab-return Restart, video/Portfolio new-tab navigation and speaker behavior remain correct.
- [ ] Test on physical iPhone Safari and a printed card. Repeat on Android Chrome if available. Record OS/browser and glare/distance/angle issues. Desktop tests are not phone certification.

Printed pixels remain visible behind lifted paper layers; the page does not erase real print. Image A and Image B have slightly different internal proportions. The desk footprint is registered while Image B keeps its original aspect ratio, so every face/plant pixel cannot coincide with Image A when flat. See PATCH_VALIDATION.md.

## 6. Revert

Restore the five backed-up replacement files together: index.html, app.js, popup-ar.js, assets/card-back.png and assets/targets.mind. The added studio files may remain unused, or remove assets/studio.png, assets/studio-layout.json and assets/studio_icons/. Keep all original landing/video/vendor/domain files. Reopen the site in a fresh tab after your Pages job completes. Your previous V2.1 deployment ZIP is also a complete rollback source.
