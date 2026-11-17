// Scene arbitration and media behavior. Camera ownership stays in app.js.
export function createExperience({video, frontMesh, popup, flip, resumeButton, announce}) {
  let session = false, side = -1, lastSide = -1, backTime = 0, lostBackAt = -Infinity;
  let playTicket = 0, promptTimer, completions = 0;
  video.muted = true;
  // Native loop suppresses `ended`. Repeating from that genuine event preserves looping
  // while allowing the flip prompt to be triggered by actual media completion only.
  video.loop = false;
  const hideFlip = () => { clearTimeout(promptTimer); flip.hidden = true; };
  function showFlip() {
    clearTimeout(promptTimer); flip.hidden = false;
    promptTimer = setTimeout(hideFlip, 8500);
  }
  async function playFront() {
    if (!session || side !== 0 || document.hidden) return;
    const ticket = ++playTicket;
    try {
      await video.play();
      if (ticket !== playTicket) { if (!session || side !== 0 || document.hidden) video.pause(); return; }
      if (!session || side !== 0 || document.hidden) video.pause();
      else resumeButton.hidden = true;
    } catch {
      if (ticket === playTicket && session && side === 0) {
        resumeButton.hidden = false;
        announce('Tap Resume video to continue playback.');
      }
    }
  }
  function selectSide(next, now = performance.now()) {
    if (!session || document.hidden) next = -1;
    if (next === side) return;
    if (side === 1) lostBackAt = now;
    side = next; ++playTicket;
    frontMesh.visible = false; popup.group.visible = false;
    resumeButton.hidden = true;
    if (next !== 0) video.pause();
    if (next === 0) {
      frontMesh.visible = true;
      announce('Front found. Tap the video to explore the portfolio.');
      playFront(); lastSide = 0;
    } else if (next === 1) {
      hideFlip();
      if (lastSide !== 1 || now - lostBackAt > 1200) backTime = 0;
      popup.setTime(backTime); popup.group.visible = true;
      announce('Back found. Move the phone gently to explore the layers.');
      lastSide = 1;
    } else announce('Point at either side of the card.');
  }
  function setSessionActive(on) {
    session = on;
    if (on) { side = -1; lastSide = -1; backTime = 0; lostBackAt = -Infinity; hideFlip(); }
    if (!on) {
      ++playTicket; selectSide(-1); video.pause(); frontMesh.visible = false;
      popup.group.visible = false; resumeButton.hidden = true; hideFlip();
    }
  }
  function ended() {
    // A pause or lost target never enters this path. Also guard queued events after switching.
    if (!video.ended || !Number.isFinite(video.duration) || video.currentTime < video.duration - .1) return;
    ++completions;
    if (session && side === 0 && !document.hidden) showFlip();
    video.currentTime = 0;
    if (session && side === 0 && !document.hidden) playFront();
  }
  video.addEventListener('ended', ended);
  resumeButton.addEventListener('click', playFront);
  return {
    selectSide, setSessionActive, playFront, hideFlip,
    update(delta) {
      if (session && side === 1 && !document.hidden) {
        backTime = Math.min(popup.duration, backTime + delta); popup.setTime(backTime);
      }
    },
    get side() { return side; }, get backTime() { return backTime; },
    get completions() { return completions; }
  };
}
