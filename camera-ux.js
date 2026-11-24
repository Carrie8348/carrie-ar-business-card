// Screen-space guidance only. No camera, tracking, media playback or anchor ownership.
export function promptTop({sceneTop, sceneBottom, upper, lower, height}) {
  if (![sceneTop, sceneBottom, upper, lower, height].every(Number.isFinite)) return null;
  if (Math.min(lower, sceneTop - 12) - upper >= height) return upper;
  if (lower - Math.max(upper, sceneBottom + 12) >= height) return lower - height;
  return null;
}

export function createCameraUX({video, sound, scan, home, message, controls, recovery,
  schedule = setTimeout, cancel = clearTimeout}) {
  let stage = 'stopped', seen = false, side = -1, lossTimer, visibleMode = null;
  const title = scan.querySelector('[data-scan-title]');
  const detail = scan.querySelector('[data-scan-detail]');
  function clearLoss() { cancel(lossTimer); lossTimer = undefined; }
  function syncSound() {
    const silent = video.muted || video.volume === 0;
    const label = video.muted ? 'Unmute video' : 'Mute video';
    sound.setAttribute('aria-label', label); sound.title = label;
    sound.setAttribute('aria-pressed', String(!silent));
    // SVGElement.hidden is not an HTML hidden-property reflection. Set attributes.
    sound.querySelector('[data-muted]').toggleAttribute('hidden', !silent);
    sound.querySelector('[data-audible]').toggleAttribute('hidden', silent);
  }
  function layout() {
    if (visibleMode === null) return;
    scan.hidden = false;
    const top = Math.max(home.getBoundingClientRect().bottom,
      message.textContent ? message.getBoundingClientRect().bottom : 0) + 12;
    const bottom = Math.min(controls.getBoundingClientRect().top,
      ...recovery.filter(e => !e.hidden).map(e => e.getBoundingClientRect().top)) - 12;
    scan.style.top = `${top}px`;
    scan.classList.remove('scan-compact');
    if (scan.getBoundingClientRect().height > bottom - top) scan.classList.add('scan-compact');
    if (scan.getBoundingClientRect().height > bottom - top) scan.hidden = true;
  }
  function show(mode) {
    visibleMode = mode;
    scan.dataset.mode = mode;
    title.textContent = mode === 'starting' ? 'Starting camera...' : 'Point your camera at the card';
    detail.textContent = mode === 'scanning' ? 'Either side works!' : '';
    scan.hidden = false; layout();
  }
  function hide() { visibleMode = null; scan.hidden = true; }
  function pause() { clearLoss(); stage = 'stopped'; side = -1; hide(); syncSound(); }
  function starting(fresh = false) {
    clearLoss(); if (fresh) seen = false;
    stage = 'starting'; side = -1; show('starting'); syncSound();
  }
  function setTarget(next) {
    if (stage !== 'ready' || next === side) return;
    side = next; clearLoss(); syncSound();
    if (next === 0 || next === 1) { seen = true; hide(); return; }
    hide();
    if (!seen) show('scanning');
    else lossTimer = schedule(() => {
      if (stage === 'ready' && side === -1) show('reminder');
    }, 3500);
  }
  function ready() { stage = 'ready'; side = -2; setTarget(-1); syncSound(); }
  video.addEventListener('volumechange', syncSound);
  // These do not change playback; they only reconcile visible state.
  for (const event of ['play', 'pause', 'ended', 'loadedmetadata', 'emptied']) video.addEventListener(event, syncSound);
  syncSound();
  return {starting, ready, setTarget, pause, layout, syncSound};
}
