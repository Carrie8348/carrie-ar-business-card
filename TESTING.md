# Verification and phone test checklist

## Completed on 2026-11-15

- Original PNG and delivered PNG have identical SHA-256: `5afb52397656e66834c502fa489cae087e6ec9c8a3cba36fb837e71784c3b7ee`.
- Original MP4 and delivered MP4 have identical SHA-256: `530b5d2f5293a282cff4dd7da8c76f0a9c0dc609a8924178175290c566c3eaae`.
- ffprobe confirmed 1530 × 990 H.264 video and AAC stereo audio; duration about 19.13 s.
- MindAR 1.2.5 browser compiler successfully generated one target from the original PNG: 395,676 bytes.
- app.js passes Node syntax checking.
- Headless desktop Chrome with a simulated camera containing the supplied card acquired the target, displayed the AR canvas and reached “Card found”. Playback was active, muted, loop enabled, and currentTime advanced to 14.58 s. Clicking the sound control set muted=false and displayed “Sound on”. No uncaught browser errors or console errors occurred in this final run.
- This simulated camera check does not validate physical screen recognition, perspective alignment, audible output, real camera movement or smartphone browser policies.

## Required actual device testing — not yet performed

Test separately in iPhone Safari and Android Chrome. Record phone model, OS/browser version, date and result. No mobile compatibility certification is claimed.

- [ ] Open the HTTPS URL; camera is requested only after Start camera.
- [ ] Deny permission: helpful message and portfolio link remain available. Enable permission and retry successfully.
- [ ] Scan the full static PNG on the Mac screen; card is recognized.
- [ ] Video covers the card edge-to-edge, centered, with no stretching or cropping.
- [ ] Move phone left/right, tilt and vary distance; video stays aligned.
- [ ] Wait longer than 20 s; muted video loops without leaving the card.
- [ ] Tap Sound off; hear existing music/effects. Tap again; audio stops.
- [ ] Move away from the target: overlay disappears and audio/video pause.
- [ ] Return to target: video resumes at the previous position, without reload. Repeat three times, with sound enabled and disabled.
- [ ] Tap inside video: current tab navigates to https://carrieqian.com/. Tap outside: no navigation.
- [ ] Explore Portfolio works while no target is visible and after an error.
- [ ] Rotate phone; alignment and controls remain usable.
- [ ] Background and return to browser; playback and camera recover, or Start camera is offered after browser back navigation.
- [ ] Test printed card when available, at 85 × 55 mm with full artwork visible.

If tracking is unreliable on-screen, first reduce glare, keep the entire card visible and use a moderate image size. Target quality and physical tracking stability are unverified until these checks pass.
