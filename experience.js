// Exclusive scene ownership and once-per-AR-session bidirectional guidance.
export function createExperience({video, frontMesh, popup, flip, resumeButton, announce, placePrompt = ()=>true}) {
  let session = false, side = -1, lastSide = -1, backTime = 0, lostBackAt = -Infinity;
  let playTicket = 0, promptTimer, completions = 0, pendingPrompt = null, livePrompt = null;
  const visited = new Set(), shown = new Set();
  const copy = [
    ["There's more on the other side!", 'Flip the card to discover more.'],
    ['Want to see what I create?', 'Flip the card over!']
  ];
  video.muted = true;
  // Native loop suppresses `ended`; repeat only from a genuine completion.
  video.loop = false;
  function hideFlip() {
    clearTimeout(promptTimer); flip.hidden = true;
    pendingPrompt = livePrompt = null;
  }
  function beginSession() {
    hideFlip(); visited.clear(); shown.clear();
  }
  function offerPrompt(from) {
    if (!session || side !== from || document.hidden || shown.has(from) || visited.has(1-from)) return;
    pendingPrompt = from;
  }
  function updatePrompt() {
    if (livePrompt !== null) {
      // If the user fills the screen with artwork, never cover it with guidance.
      if (!placePrompt()) hideFlip();
      return;
    }
    const from = pendingPrompt;
    if (from === null || !session || side !== from || document.hidden) return;
    if (shown.has(from) || visited.has(1-from)) { pendingPrompt = null; return; }
    flip.querySelector('strong').textContent = copy[from][0];
    flip.querySelector('span').textContent = copy[from][1];
    // Keep the completion pending until there is a free screen strip.
    if (!placePrompt()) return;
    pendingPrompt = null; livePrompt = from; shown.add(from);
    flip.dataset.direction = from === 0 ? 'front-to-back' : 'back-to-front';
    flip.hidden = false;
    promptTimer = setTimeout(hideFlip, 10000);
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
    hideFlip(); side = next; ++playTicket;
    frontMesh.visible = false; popup.group.visible = false;
    resumeButton.hidden = true;
    if (next !== 0) video.pause();
    if (next === 0) {
      visited.add(0); frontMesh.visible = true;
      announce('Front found. Tap the video to explore the portfolio.');
      playFront(); lastSide = 0;
    } else if (next === 1) {
      visited.add(1);
      if (lastSide !== 1 || now - lostBackAt > 1200) {
        backTime = 0; popup.resetPresentation();
      }
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
    if (!video.ended || !Number.isFinite(video.duration) || video.currentTime < video.duration - .1) return;
    ++completions;
    if (session && side === 0 && !document.hidden) offerPrompt(0);
    video.currentTime = 0;
    if (session && side === 0 && !document.hidden) playFront();
  }
  video.addEventListener('ended', ended);
  resumeButton.addEventListener('click', playFront);
  return {
    selectSide, setSessionActive, beginSession, playFront, hideFlip,
    update(delta) {
      if (session && side === 1 && !document.hidden) {
        backTime = Math.min(popup.duration, backTime + delta); popup.setTime(backTime);
        if (backTime >= popup.duration) offerPrompt(1);
      }
      if (session && side !== -1 && !document.hidden) updatePrompt();
    },
    get side() { return side; }, get backTime() { return backTime; },
    get completions() { return completions; }
  };
}
