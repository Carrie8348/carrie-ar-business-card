# Carrie AR Business Card — V2.5

A dual-sided WebAR business card for **Carrie Qian — Design · Code · Film**. Scan either side of the physical card to watch a portfolio video or discover an interactive pixel-art Creative Studio.

- AR entry: [ar.carrieqian.com](https://ar.carrieqian.com)
- Portfolio: [carrieqian.com](https://carrieqian.com/)
- Contact: [qian.yilu.carrie@gmail.com](mailto:qian.yilu.carrie@gmail.com)

This README describes the delivered source through **V2.5**, including the Contact UI and V2.4 patches. It does not confirm which version is currently published. Updating this README alone does not install the runtime patches.

## Experience

### Start and scan

1. Tap **Start AR Experience** and allow camera access.
2. **Starting camera...** appears while the camera and tracking initialize.
3. Once ready, a small phone/card illustration accompanies **Point your camera at the card** and **Either side works!**
4. Point the camera at a complete card side. The scanning guide hides immediately when either target is recognized.

After the first recognition, brief tracking loss does not replay the full scanning illustration. A text-only reminder may appear after **3.5 seconds** without a target. Home → Start begins a fresh camera session; recovery retains the session's guidance history.

The landing page keeps Start AR Experience as the primary action. **Email me** and **Portfolio** are equal-sized, rounded secondary buttons with 16px text and at least 48px touch height. Camera mode retains Home, sound, Email me and Portfolio controls with safe-area spacing.

### Front — Target 0

The original portfolio video appears on the front of the card. It starts muted, pauses when the front target is lost or another side is active, and resumes its playhead on reacquisition. Tapping the video opens the main portfolio in a new tab.

The speaker shows **X when silent** and **sound waves when audible**. Its attributes follow the video's actual mute/volume state and media events; accessible action labels are **Unmute video** and **Mute video**. The original soundtrack and volume values are preserved. Starting or explicitly recovering the camera retains the original mute-on-start behavior.

On a genuine video completion, the video repeats and may show this animated flip-card prompt:

> **There's more on the other side!**  
> Flip the card to discover more.

Native video looping is intentionally disabled so the real `ended` event can trigger the prompt. Tracking loss never counts as video completion.

### Back — Target 1

The Creative Studio shows Carrie at the computer, the sleeping calico cat and desktop details as one transparent studio cutout, plus four separate creative icon planes. The studio rises about its registered desk-bottom hinge; icons enter at different depths. The complete entrance settles at **4.2 seconds**.

The scene is **2.5D layered artwork**, with genuine perspective/parallax rather than a volumetric character model. The original composition, positions and entrance animation are retained. Once settled, icons do not have continuous idle movement. A short back-target loss of up to approximately **1.2 seconds** continues the entrance; longer loss or switching back from the front replays it.

For back-first visitors, completion of the full entrance may show:

> **Want to see what I create?**  
> Flip the card over!

Both directional prompts include a small illustration of the physical card turning over. Each direction can appear at most once per camera session, lasts up to 10 seconds, hides when the opposite target is recognized and is suppressed once both sides have been explored. Prompts wait for clear screen space outside the projected artwork and controls. Reduce Motion replaces the animated cues with static illustrations.

### Interactive creative icons

After the complete entrance, these existing icons become interactive:

| Icon | Collection |
| --- | --- |
| Design | [Design projects](https://carrieqian.com/design) |
| Code | [Code projects](https://carrieqian.com/code) |
| Film | [Film projects](https://carrieqian.com/film) |

The fourth **Image** icon remains decorative. Invisible hit-test meshes enlarge touch regions without changing visible icons or adding rendered scene objects. Exact icon hits take priority; overlapping expanded regions choose the nearest icon center. Drag, long-press, multi-touch and cancelled gestures do not activate a link.

**Tap an icon to explore my work** appears once per session for 4.5 seconds when a clear strip is available. It waits if necessary and never displaces the existing flip guidance.

Tapping an icon opens a confirmation dialog, for example:

> **Explore my Code projects?**  
> View my interactive websites and creative coding projects.
>
> **Cancel** · **Open Portfolio ↗**
>
> Opens in a new tab. Return here to continue AR.

Cancel, the close button and native Escape dismiss the dialog without navigation or scene reset. Open Portfolio is a native new-tab link activated directly by the visitor's tap. The dialog supports accessible labels and focus containment; keyboard/screen-reader collection controls are available once icons are ready.

### Return to AR

The original AR tab remains open when a collection opens in another tab.

- If camera capture and tracking remain healthy, returning continues the existing session without a new camera request or scene reset.
- If capture or tracking stopped, paused or froze, **Resume AR** offers explicit recovery. Camera access is requested again only after the visitor taps it.
- A healthy return is checked using camera playback/track state, graphics context and controller state, followed by camera-time and tracking-frame progress over 2.2 seconds.
- Actual page navigation/BFCache restoration uses conservative explicit recovery. A camera-resolution change can also require recovery.
- **Resume video** is a separate existing control for rejected portfolio-video playback.

Home stops capture and returns to the landing page. Startup and recovery use the existing serialized lifecycle and generation cancellation to avoid duplicate camera streams, controllers, scene objects or event listeners. No full-page refresh is used for recovery.

## Runtime files

All JS modules listed here belong at the publishing root, beside index.html.

| Repository path | Purpose |
| --- | --- |
| `index.html` | Landing page, camera controls, guidance, confirmation dialog and local import map. |
| `style.css` | Responsive layout, safe areas, guidance animations and interaction UI. |
| `app.js` | Camera lifecycle, exclusive target selection, tap wiring and return/recovery integration. |
| `experience.js` | Front playback, back entrance progress and once-per-session flip guidance. |
| `popup-ar.js` | Creative Studio planes, registration and original entrance animation. |
| `camera-ux.js` | V2.4 scanning guidance, speaker-state reconciliation and prompt-placement calculation. |
| `icon-interactions.js` | V2.5 collection mapping, invisible icon hit testing, tap recognition and confirmation/hint UI. |
| `ar-return.js` | V2.5 camera/tracker health checks; does not start camera access itself. |
| `assets/targets.mind` | Existing compiled targets: front 0, back 1. |
| `assets/card-front.png` | Original front tracking artwork. |
| `assets/card-back.png` | Approved V2.2 back tracking artwork. |
| `assets/portfolio.mp4` | Original portfolio video and soundtrack. |
| `assets/studio.png` | Transparent Creative Studio cutout. |
| `assets/studio-layout.json` | Studio proportions and printed desk-bottom registration. |
| `assets/studio_icons/design.png` | Original Design icon. |
| `assets/studio_icons/code.png` | Original Code icon. |
| `assets/studio_icons/film.png` | Original Film icon. |
| `assets/studio_icons/image.png` | Decorative Image icon. |
| `assets/carrie.png`, `assets/cat.png` | Existing landing-page artwork. |
| `assets/ui/card-front-thumb.png` | V2.4 decorative front thumbnail, 255 × 165. |
| `assets/ui/card-back-thumb.png` | V2.4 decorative back thumbnail, 255 × 165. |
| `vendor/` | Bundled Three.js r160, MindAR 1.2.5 and supporting runtime files. |
| `licenses/` | Third-party notices and MindAR matcher-patch documentation. |
| `CNAME` | Existing ar.carrieqian.com configuration. |
| `.nojekyll` | Existing GitHub Pages static-file behavior. |

Older unused sprites/layout files may remain for rollback. Do not delete them merely because this table focuses on current runtime assets. No CSS, image or script files from separate 3D modeling experiments are required.

## Running and applying updates

This is a static HTML/CSS/JavaScript site with local runtime dependencies. No npm build, backend or API key is required.

For local development, serve the **complete website folder**:

```sh
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) on the same computer. Do not open index.html through file://. A phone needs a trusted HTTPS address for camera access; a plain HTTP LAN address is not a substitute for localhost.

The existing publishing setup is GitHub Pages with the custom domain. Preserve its branch/path, CNAME, DNS and other settings. This documentation update performs no deployment or push.

Partial patches are cumulative, not complete websites:

| Starting point | Required update |
| --- | --- |
| Working V2.1 dual-sided site | Apply the V2.2 back-side patch and its complete matching asset set. |
| V2.2 | Apply the Contact UI patch, then V2.4. |
| V2.4 | Apply V2.5. |
| V2.5 | Replace only README.md for this documentation update. |

For V2.5, replace `index.html`, `style.css` and `app.js`; add `icon-interactions.js` and `ar-return.js` at the root. Keep V2.4's camera-ux.js and both assets/ui thumbnails. Use the corresponding patch's PATCH_CHECKLIST.md for exact replacement and rollback instructions.

Back up the current commit/files before applying a patch. Upload changed files into their existing repository paths, not into an extra version folder. Never replace the complete repository with a partial patch or upload the ZIP itself as the website. If the repository contains newer changes, merge the relevant edits rather than overwrite them.

Cache suffixes are intentionally mixed: the V2.5 app/styles and new modules coexist with unchanged V2.4 camera UX, V2.1 experience logic and V2.2 popup/target imports. Do not force all suffixes to the same number.

## Alignment and maintenance

The physical card is **85 × 55 mm**. MindAR target coordinates are X right, Y toward the printed top and +Z outward. The popup root uses uniform scale 1/0.085. The studio's bottom-edge hinge is registered to the existing printed desk; the layout preserves image proportions.

The view at entrance selects an outward tilt between 30° and 90°, then locks it for that presentation. The cutouts do not continuously billboard toward the camera. The raised studio and four icon planes provide depth while leaving the real camera feed visible. The physical printed pixels remain visible behind the lifted scene; the app does not erase the print. Extreme edge views can make flat layers appear thin.

Keep Target 0/Target 1 mapping stable. V2.4 and V2.5 do not modify targets.mind, original card/QR artwork, video/audio, anchor transforms or the Creative Studio entrance. UI thumbnails are decorative copies and must never replace tracking artwork.

The bundled matcher chooses the strongest valid candidate match; see `licenses/MindAR-MATCHER-PATCH.md`. Do not casually replace vendor files or upgrade MindAR: the lifecycle adapter relies on its version-pinned `_startAR()` integration and requires dedicated regression testing.

## Validation and limits

V2.5 validation passed **35 automated test groups**: 12 interaction/return groups, 10 application-integration groups and all 13 V2.4 regression groups. Tests use simulated DOM/media/clock/controller behavior plus actual Three.js mathematics and the unchanged production popup/experience modules.

Coverage includes correct collection dialogs/links, Cancel/close, settled-state gating, hint history, healthy and interrupted returns, explicit recovery, stale event handling, rapid double Resume, one live camera and one set of listeners. Both target-selection paths, original front playback, sound-state updates and flip-guidance guards passed simulated-state checks.

**36 icon-center raycasts** passed across four mobile viewport sizes and three camera views; expanded touch areas and the noninteractive Image icon were also checked. These are mathematical tests, not rendered phone screenshots or optical tracking tests.

Preservation checks found the 46 original baseline source/resource files unchanged. This is scoped to the original files, not a claim that the V2.5 replacement files are identical to V2.4.

The patch environment could not run a local preview server, and browser policy blocked local-file previews. V2.5 therefore has no claimed rendered-browser, actual new-tab, real-camera or physical-iPhone validation. Earlier desktop synthetic-camera reports remain historical evidence, not phone certification.

Before considering a published update verified, check on physical iPhone Safari:

- [ ] Both complete printed targets, front video/audio, back entrance and repeated loss/reacquisition.
- [ ] Startup/scanning guide, animated flip guidance, speaker state and Reduce Motion.
- [ ] All three icon confirmations, Cancel/close, correct new-tab URLs and comfortable mobile hit areas.
- [ ] Healthy return, interrupted/frozen capture, Resume AR, app/tab switching, lock/unlock and repeated recovery.
- [ ] Portrait/landscape, Safari toolbar changes, safe areas, VoiceOver, modal focus and all existing controls.

Keep the whole card side visible, use moderate viewing angles and avoid glare or a very distant target. Network speed affects initial video/asset loading. Actual tracking, touch accuracy, Safari suspension, sound output and performance still require physical-device checks.

## Version history

| Update | Main change |
| --- | --- |
| V1 / V1.1 | Front video AR, sound/video navigation and repeated-session recovery fixes. |
| V2 / V2.1 | Dual-sided targets, exclusive scenes and corrected 2.5D alignment. |
| V2.2 | Approved back artwork/target and seated Creative Studio with four icons; 4.2-second entrance. |
| Contact UI | Email me and Portfolio buttons on landing and in camera mode. |
| V2.4 | Startup/scanning instructions, animated flip cues and actual-state speaker icons. |
| V2.5 | Design/Code/Film confirmations and collection navigation, interaction hint and conservative return to AR. |

Documentation updated: **2026-11-24**. Runtime patches and this README were prepared without deploying, pushing or editing the portfolio/Lovable project.
