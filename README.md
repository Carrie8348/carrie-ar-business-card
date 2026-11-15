# Carrie AR Business Card — Front V1

Standalone MindAR + Three.js image-tracking prototype. No changes to carrieqian.com. No build or npm install required. Runtime dependencies are included locally.

## Files

- index.html / style.css / app.js — interface and AR application source
- assets/target video cover.png — original unmodified tracking image, 1530 × 990
- assets/Web AR.mp4 — original unmodified H.264 video and AAC stereo audio, approximately 19.13 seconds
- assets/targets.mind — compiled MindAR image target, index 0
- vendor/ — MindAR 1.2.5 and Three.js 0.160.1 runtime and browser compiler
- compile.html — optional browser target compiler, uses the original PNG
- licenses/ — upstream license notices
- TESTING.md — verification status and device checklist

The video plane is exactly 1 × 11/17 tracking units, centered on the card. This matches 85 × 55 mm. Neither original asset is cropped, re-encoded, stretched or redesigned. The supplied files had “(1)” suffixes; copies use the requested filenames with identical bytes.

## Install at your requested Mac location

Unzip the delivered archive, then move its Carrie_AR_Business_Card folder into:

`/Users/hicarrie/Desktop/portfolio/`

Do not replace an existing project folder without backing it up. All required files are inside this subfolder.

## Run locally on the Mac

In Terminal:

```sh
cd /Users/hicarrie/Desktop/portfolio/Carrie_AR_Business_Card
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://localhost:8080/ for a desktop smoke test. Do not double-click index.html. A phone cannot use the Mac's localhost URL.

## Practical smartphone HTTPS testing

Install Cloudflare's cloudflared using its official instructions:
https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/

Keep the local server above running. In another Terminal:

```sh
cloudflared tunnel --url http://localhost:8080
```

Open the printed `https://…trycloudflare.com` address on your phone in Safari or Chrome. It is a temporary HTTPS address, accessible while both processes are running. Anyone with this URL can access the prototype and its assets. Stop both with Ctrl+C after testing. No existing portfolio site is involved.

Cloudflare Quick Tunnel documentation:
https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/

On the Mac, open assets/target video cover.png in Preview. Display the entire image, without cropping, on a plain background at roughly 12–20 cm wide. Avoid reflections; reduce screen brightness if glare occurs. On the phone, tap Start camera and allow permission. Aim at the static image, initially straight on, with the whole card visible. The phone should show the portfolio video directly on the card.

## Deploy independently

Upload the entire folder contents to an HTTPS static host, preserving paths and filenames. index.html must be at the deployment root. No server application or secrets are required. The host must serve .js as JavaScript, .mp4 as video/mp4, and .mind as binary data; byte-range support for MP4 is recommended. Avoid placing the experience inside an iframe; if necessary, its parent must explicitly allow camera access and autoplay. Deploy separately from carrieqian.com.

## Behavior

Start camera is an explicit user gesture. Video starts muted and loops. Tracking acquisition shows/resumes the video; loss hides and pauses it without resetting the playhead. Sound off/on changes only the muted flag, retaining original audio. Tap the tracked video to navigate in the current tab to https://carrieqian.com/. Explore Portfolio remains available without tracking. If autoplay is blocked, Resume video provides a user gesture fallback. Returning from a background tab pauses media until tracking is available. Browser back navigation offers Start camera again.

Use Safari directly on iPhone and Chrome directly on Android. These are intended test targets, not verified device compatibility claims. Screen-target recognition and physical camera alignment still require actual phone tests.

If camera access is denied, allow it in the browser's site settings and retry. A busy camera, missing camera, insecure origin, failed asset load or unsupported graphics/browser gets a text message with the portfolio link still available. Browser permission prompts can remain pending until the user makes a choice.

## Recompile later

Open /compile.html through the local server. It compiles only the supplied PNG with bundled MindAR 1.2.5. Once complete, download targets.mind and replace assets/targets.mind. The delivered file is already compiled; this is unnecessary for V1 testing. Changing the PNG requires recompilation. Front target index is 0; a later back target should use a separately planned index and asset path.

## References

MindAR source and documentation: https://github.com/hiukim/mind-ar-js
Three.js: https://threejs.org/docs/
