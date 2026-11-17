# Carrie AR Business Card — V2

One static, self-contained dual-sided WebAR website for **https://ar.carrieqian.com**. No build step, CDN, backend, iframe or deployment automation. Extract the ZIP and upload its **contents**, not the enclosing folder. See DEPLOY_CHECKLIST.md.

## Run locally

From this folder, run `python3 -m http.server 8000`, then open http://localhost:8000 on the same computer. Camera access works on localhost. Do not open index.html with file://.

For a phone, use the existing HTTPS GitHub Pages domain after manually uploading. A phone accessing a computer's plain HTTP LAN address cannot normally use the camera. A trusted HTTPS tunnel to port 8000 is an alternative; no tunnel or deployment was created for you.

## Use

1. Press **Start AR Experience**, allow the rear camera, and show either complete card side.
2. Front (index 0): the original portfolio video occupies the same centered **1 × 11/17** plane. Playback starts muted; the lower-left speaker toggles its original audio without seeking. Tracking loss pauses it; reacquisition resumes its playhead.
3. On actual media `ended`, the flip prompt appears for 8.5 seconds and the video repeats. Native `loop` is deliberately disabled because it suppresses `ended`. Losing tracking never creates a completion. Back detection hides the prompt.
4. Back (index 1): original transparent pixel sprites hinge upward from their bottom edges, then the laptop, camera and creative graphics enter at distinct depths. The sequence settles at 3.2 seconds. A brief loss under 1.2 seconds resumes; a longer loss or switching back from the front replays it.
5. Tap the front video or **Explore Portfolio** to open carrieqian.com in a new tab. Sound and Home are separate controls. Home stops the camera and returns here. Switching tabs pauses capture; use **Restart camera** on return. A rejected media play shows **Resume video**.

## Files

```
index.html              Landing and camera controls; local import map
style.css               Responsive layout and safe-area controls
app.js                  Camera lifecycle, two anchors and video tap
experience.js           Exclusive side activation, playback and flip prompt
popup-ar.js             Original popup adapted to a transparent AR anchor
assets/
  card-front.png        Exact final front, target 0 (1530 × 990)
  card-back.png         Exact final back, target 1 (1530 × 990)
  targets.mind          Compiled two-target MindAR file
  portfolio.mp4         Original video, byte-for-byte unchanged
  back-layout.json      Printed character footprint measurements
  *.png                 Nine original popup sprites
vendor/                 Local Three.js 0.160.1 and MindAR 1.2.5 dependencies
licenses/               Third-party license notices and matcher patch note
CNAME                   ar.carrieqian.com
.nojekyll               Keep GitHub Pages static file behavior
README.md
CHANGELOG.md
DEPLOY_CHECKLIST.md
VALIDATION.md
```

## Coordinate alignment and real parallax

The card is 85 × 55 mm. Printed Carrie bounds are x326–658 / y282–985; cat x603–864 / y730–985 in the final back PNG. Their bottom hinges are mapped to those printed feet, preserving each transparent sprite's aspect ratio. The popup uses local X across the card, Z toward its lower edge and +Y upward. Its root rotates +90° about X and scales by 1/0.085 to MindAR's unit-card-width image anchor.

Nine separate textured Three.js planes at different positions produce spatial occlusion and parallax; the planes do not billboard toward the camera. There is no opaque virtual card, floor, OrbitControls or preview scenery. Nearest-neighbor sampling preserves original pixels. The physical printed characters remain visible in the live camera image as the paper cutouts rise: this prototype does not erase real print. Upright paper layers appear thin when viewed directly along their edges, and their backs mirror the artwork. View the card at a moderate tilt.

## Recognition and limitations

Both complete, unmodified final PNGs were compiled in front/back order. targets.mind is **779,048 bytes**, re-imported and confirmed to hold exactly two entries. Matching features at original resolution: front 64 maxima + 99 minima; back 47 + 115. Tracking features at 396 × 256 / 198 × 128 are front 22 / 23 and back 25 / 23. Counts do not guarantee physical tracking quality.

The large blank white areas provide little tracking detail. The two sides share character details, and the QR has repetitive structures. Stock MindAR can accept the first matching target, causing a back frame to be labeled front. The bundled matching worker is narrowly patched to evaluate all candidate targets and choose the valid pose with the most geometrically consistent feature matches; see licenses/MindAR-MATCHER-PATCH.md. This corrected the observed synthetic-camera misclassification. It cannot guarantee discrimination if only the shared face/cat is visible: keep the **whole side**, including front text or back QR, in view. Avoid glare, small distant cards, very steep angles and screen moiré. No printed artwork or QR was replaced. The original QR decoded to https://ar.carrieqian.com.

All runtime dependencies are local. Initial loading includes the original 24.27 MB video; network speed affects startup. The front's manual repeat can introduce a tiny playback gap at the boundary. This is a lightweight pixel-paper scene, not a volumetric character model. A camera resolution change may require the explicit Restart button. Browser chrome and translation banners remain outside page control.

**Desktop Chrome synthetic-camera tests are not iPhone or Android tests.** Physical-card alignment, tracking robustness, sound behavior and Safari permissions still require the real-phone checklist in DEPLOY_CHECKLIST.md. No phone compatibility certification is claimed.

## Updating later

Keep the two target indices stable. Recompile only when the printed targets change; keep the full images and compile front first/back second. If changing sprite positions, update back-layout.json and verify printed hinge registration. The local MindAR lifecycle adapter uses its version-pinned `_startAR()` API; retest camera exit/restart and the matcher patch before upgrading MindAR. Existing front-side projects and standalone popup files were not edited.
