# V2.1 — targeted spatial and guidance correction

## Back-side spatial presentation

V2 adapted a horizontal-desk preview by rotating the entire popup root +90° around X. Consequently a frontal vertical image target showed the paper planes edge-on; a camera above the target could project their tops below their printed feet. The original image recognition was working: this was a presentation-coordinate issue, not a reason to alter the targets or blame the computer screen.

V2.1 keeps the root unrotated, with all hinges expressed directly in MindAR target coordinates: X right, Y toward printed top, +Z outward. Existing measured foot positions become (x, -oldZ, oldY); only each artwork plane rotates at its own bottom hinge. Attached accents retain their local positions and inherit the character hinge.

The entrance now rotates from flat (0°) to a readable outward paper lean. At the first tracked entrance frame, the camera is transformed into target-local coordinates to choose a 20–75° rest angle. It is frozen for that entrance, rather than following the camera like a billboard. A frontal target uses approximately 45°; a horizontal card viewed from its lower edge can use a more upright angle. This deliberately avoids exact 90° edge-on presentation. Short loss retains the pose; a long loss/replay chooses it again. Existing entry timing, original image proportions and genuine depth layers remain.

## Bidirectional guidance

- Added **Want to see what I create? / Flip the card over!** after the full 3.2-second back entrance, independent of front playback.
- Retained the exact front-to-back wording, triggered only by actual media completion.
- Both prompts use larger headline text, more padding, stronger contrast and a brief reduced-motion-aware entrance.
- Guidance waits for a free screen strip above/below the projected active artwork and above the existing lower controls. It does not cover the video or popup. If the artwork fills the view, completion stays pending until space becomes available. Loss hides guidance.
- Each direction can appear at most once per AR session; visiting the opposite side suppresses further guidance once both are explored. Camera recovery after switching tabs keeps that history. Home → Start begins a new guidance session.

## Scope preserved

No changes to landing design/copy, speaker behavior/placement, Portfolio links, video/audio, any PNG, back-layout measurements, targets.mind, vendor dependencies, QR, CNAME or .nojekyll. Only the popup transforms, guidance logic, associated prompt markup/styles/cache suffixes and documentation changed. V2/V1 originals remain untouched. No deployment was performed.
