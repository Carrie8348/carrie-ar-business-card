const $ = id => document.getElementById(id);
const video = $('portfolio-video'), start = $('start'), sound = $('sound');
const home = $('home'), play = $('play'), restart = $('restart');
let ar, mesh, anchor, active = false, tracked = false, desired = false;
let generation = 0, queue = Promise.resolve(), stream, frameActive = false, frameDone;
const status = text => { $('status').textContent = text; };
video.muted = true;
function soundLabel() {
  sound.setAttribute('aria-label', video.muted ? 'Enable sound' : 'Mute sound');
  sound.title = video.muted ? 'Enable sound' : 'Mute sound';
  sound.setAttribute('aria-pressed', String(!video.muted));
  sound.querySelector('[data-muted]').hidden = !video.muted;
  sound.querySelector('[data-audible]').hidden = video.muted;
}
function hide() { tracked = false; if (mesh) mesh.visible = false; video.pause(); play.hidden = true; }
function controls(on) { home.hidden = sound.hidden = !on; }
function resetAnchor() {
  if (!anchor) return;
  anchor.visible = false; anchor.group.visible = false;
  anchor.group.matrix.elements.fill(0);
}
async function resume() {
  if (!active || !tracked || document.hidden) return;
  const token = generation;
  try {
    await video.play();
    if (token !== generation || !active || !tracked || document.hidden) video.pause();
    else play.hidden = true;
  } catch { if (token === generation && active && tracked) { play.hidden = false; status('Tap Resume video to continue.'); } }
}
function syncTarget() {
  if (!active || document.hidden || !desired) return;
  const visible = anchor.group.visible;
  if (visible && !tracked) { tracked = true; mesh.visible = true; status('Card found · tap the video to explore'); resume(); }
  else if (!visible && tracked) { hide(); status('Point the camera at the card'); }
}
function serialize(task) {
  queue = queue.then(task).catch(e => { console.error(e); status('Camera stopped. Tap Restart camera to try again.'); restart.hidden = false; });
  return queue;
}
function errorText(e) {
  if (e?.name === 'NotAllowedError') return 'Camera access was denied. Allow camera access in browser settings, then try again.';
  if (e?.name === 'NotFoundError') return 'No camera was found. Open this page on a phone with a camera.';
  if (e?.name === 'NotReadableError') return 'The camera is busy. Close other camera apps and try again.';
  return 'Camera could not start. Use Safari or Chrome over HTTPS, then try again.';
}
async function setup() {
  if (ar) return;
  const THREE = await import('three');
  const { MindARThree } = await import('./vendor/mindar-image-three.prod.js');
  ar = new MindARThree({container:$('ar'), imageTargetSrc:'./assets/targets.mind', uiLoading:'no', uiScanning:'no', uiError:'no', maxTrack:1, missTolerance:1, warmupTolerance:3});
  ar.cssRenderer.domElement.style.pointerEvents = 'none';
  const texture = new THREE.VideoTexture(video); texture.colorSpace = THREE.SRGBColorSpace;
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(1,11/17),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
  mesh.visible = false; anchor = ar.addAnchor(0); anchor.group.add(mesh);
  anchor.onTargetFound = syncTarget; anchor.onTargetLost = syncTarget;
  // MindAR only emits found/lost on transitions. Matrix updates also reconcile app state after suspension.
  anchor.onTargetUpdate = syncTarget;
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let down;
  const canvas = ar.renderer.domElement;
  canvas.addEventListener('pointerdown', e => { down = {id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()}; });
  canvas.addEventListener('pointercancel', () => { down = null; });
  canvas.addEventListener('pointerup', e => {
    const tap = down; down = null;
    if (!tap || tap.id !== e.pointerId || performance.now()-tap.time>700 || Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>12) return;
    if (!active || !tracked || !mesh.visible || !anchor.group.visible) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    ar.scene.updateMatrixWorld(true); ar.camera.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer,ar.camera);
    // Direct synchronous call within the tap; never await before opening.
    if (raycaster.intersectObject(mesh).length) {
      window.open('https://carrieqian.com/','_blank','noopener,noreferrer');
      status('Portfolio opened separately. If blocked, use Explore Portfolio below.');
    }
  });
}
// Adapter for the bundled MindAR 1.2.5 controller. Reuse one worker/renderer across sessions.
// Its public stopProcessVideo() sets a flag but does not await the current asynchronous frame.
function observeFrames(controller) {
  frameActive = controller.processingVideo;
  const load = controller.inputLoader.loadInput.bind(controller.inputLoader);
  controller.inputLoader.loadInput = (...args) => { frameActive = true; return load(...args); };
  const update = controller.onUpdate;
  controller.onUpdate = event => {
    update?.(event);
    if (event.type === 'processDone') { frameActive = false; frameDone?.(); frameDone = undefined; }
  };
}
async function stopSession() {
  active = false; hide();
  ar?.renderer.setAnimationLoop(null);
  if (ar?.controller) {
    const controller = ar.controller;
    controller.stopProcessVideo();
    // Do not start another processVideo loop before the old frame has finished.
    if (frameActive) await new Promise(resolve => { frameDone = resolve; });
    // Let the old loop exit its final tf.nextFrame continuation before restarting.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  stream?.getTracks().forEach(track => track.stop()); stream = undefined;
  if (ar?.video) { ar.video.pause(); ar.video.srcObject = null; }
  resetAnchor();
}
async function startSession(token) {
  if (!desired || token !== generation || document.hidden) return;
  start.disabled = true; restart.disabled = true;
  status('Starting camera…');
  try {
    await setup();
    if (!desired || token !== generation || document.hidden) return;
    const nextStream = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'}}});
    if (!desired || token !== generation || document.hidden) { nextStream.getTracks().forEach(track=>track.stop()); return; }
    stream = nextStream;
    if (!ar.video) {
      ar.video = document.createElement('video');
      ar.video.autoplay = true; ar.video.muted = true; ar.video.playsInline = true;
      ar.video.setAttribute('playsinline',''); ar.video.setAttribute('muted','');
      Object.assign(ar.video.style,{position:'absolute',top:'0',left:'0',zIndex:'-2'});
      $('ar').append(ar.video);
    }
    const cameraVideo = ar.video;
    await new Promise((resolve,reject) => {
      const timer = setTimeout(()=>finish(new Error('Camera metadata timed out')),12000);
      function finish(e) { clearTimeout(timer); cameraVideo.removeEventListener('loadedmetadata',loaded); cameraVideo.removeEventListener('error',failed); e ? reject(e) : resolve(); }
      const loaded = () => finish(); const failed = () => finish(new Error('Camera failed'));
      cameraVideo.addEventListener('loadedmetadata',loaded,{once:true}); cameraVideo.addEventListener('error',failed,{once:true});
      cameraVideo.srcObject = stream;
    });
    await cameraVideo.play();
    if (!desired || token !== generation || document.hidden) { await stopSession(); return; }
    cameraVideo.width = cameraVideo.videoWidth; cameraVideo.height = cameraVideo.videoHeight;
    if (!ar.controller) {
      // The bundled _startAR builds the camera projection, loads targets and starts its loop.
      // Keep this controller alive for reuse; no accumulating workers or resize listeners.
      await ar._startAR(); observeFrames(ar.controller);
    } else {
      if (ar.controller.inputWidth !== cameraVideo.videoWidth || ar.controller.inputHeight !== cameraVideo.videoHeight) {
        ar.controller.dispose(); ar.controller.worker.terminate(); ar.controller = undefined;
        await ar._startAR(); observeFrames(ar.controller);
      }
      ar.resize(); resetAnchor(); if (!ar.controller.processingVideo) ar.controller.processVideo(cameraVideo);
    }
    if (!desired || token !== generation || document.hidden) { await stopSession(); return; }
    active = true; $('intro').hidden = true; controls(true); restart.hidden = true;
    ar.renderer.setAnimationLoop(()=>{syncTarget(); ar.renderer.render(ar.scene,ar.camera);});
    status('Point the camera at the card'); syncTarget();
    stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{
      if (active && desired) suspend('Camera interrupted. Tap Restart camera.');
    },{once:true}));
  } catch(e) {
    console.error(e); await stopSession();
    status(errorText(e)); restart.hidden = false; start.textContent = 'Try again';
  } finally { start.disabled = false; restart.disabled = false; }
}
function requestStart() {
  if (desired && (active || start.disabled)) return;
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.WebGLRenderingContext) { status('AR requires HTTPS and a camera-enabled Safari or Chrome browser.'); return; }
  desired = true; const token = ++generation;
  video.muted = true; soundLabel();
  video.play().then(()=>{if(!tracked)video.pause();}).catch(()=>{});
  serialize(async()=>{await stopSession();await startSession(token);});
}
function suspend(message) {
  ++generation; active = false; hide();
  // Stop capture immediately, even when the browser suspends animation frames.
  stream?.getTracks().forEach(track=>track.stop());
  ar?.renderer.setAnimationLoop(null); ar?.controller?.stopProcessVideo();
  status(message); restart.hidden = false;
}
start.addEventListener('click',requestStart);
restart.addEventListener('click',()=>{ desired = false; requestStart(); });
home.addEventListener('click',()=>{
  desired = false; ++generation; active = false; hide();
  stream?.getTracks().forEach(track=>track.stop());
  controls(false); restart.hidden = true; $('intro').hidden = false; start.textContent = 'Start camera'; status('');
  serialize(stopSession);
});
sound.addEventListener('click',()=>{
  video.muted = !video.muted; soundLabel();
  if (tracked) resume();
  // If the card is absent, keep playback paused; reacquisition handles browser policy.
});
play.addEventListener('click',resume);
video.addEventListener('error',()=>{hide();status('The portfolio video could not load. Check your connection.');});
document.addEventListener('visibilitychange',()=>{
  if (document.hidden && desired) suspend('Camera paused. Return here to restart.');
  else if (desired) { status('Tap Restart camera to continue scanning.'); restart.hidden = false; }
});
window.addEventListener('pagehide',()=>{if(desired)suspend('Camera paused. Tap Restart camera.');});
window.addEventListener('pageshow',e=>{if(e.persisted && desired){restart.hidden=false;status('Tap Restart camera to continue scanning.');}});
soundLabel();
