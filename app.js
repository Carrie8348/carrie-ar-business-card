const $ = id => document.getElementById(id);
const video = $('portfolio-video'), start = $('start'), sound = $('sound'), play = $('play');
video.muted = true;
let ar, mesh, anchor, tracked = false, running = false, busy = false;
const status = text => { $('status').textContent = text; };
function soundLabel() { sound.textContent = video.muted ? 'Sound off' : 'Sound on'; sound.setAttribute('aria-pressed', String(!video.muted)); }
async function resume() {
  if (!tracked || document.hidden) return;
  try { await video.play(); if (!tracked || document.hidden) video.pause(); else play.hidden = true; }
  catch { if (tracked) { play.hidden = false; status('Tap Resume video to continue.'); } }
}
function hide() { tracked = false; if (mesh) mesh.visible = false; video.pause(); play.hidden = true; }
function errorText(e) {
  if (e?.name === 'NotAllowedError' || /permission|denied/i.test(String(e))) return 'Camera access was denied. Allow camera access in your browser settings, then try again.';
  if (e?.name === 'NotFoundError') return 'No camera was found. Open this page on a phone with a camera.';
  if (e?.name === 'NotReadableError') return 'The camera is busy. Close other camera apps and try again.';
  return 'AR could not start. Use an up-to-date Safari or Chrome browser over HTTPS, then try again.';
}
async function setup() {
  const THREE = await import('three');
  const { MindARThree } = await import('./vendor/mindar-image-three.prod.js');
  ar = new MindARThree({container: $('ar'), imageTargetSrc: './assets/targets.mind', uiLoading: 'no', uiScanning: 'no', uiError: 'no', maxTrack: 1, missTolerance: 1, warmupTolerance: 3});
  ar.cssRenderer.domElement.style.pointerEvents = 'none';
  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 11 / 17), new THREE.MeshBasicMaterial({map: texture, toneMapped: false}));
  mesh.visible = false;
  anchor = ar.addAnchor(0);
  anchor.group.add(mesh);
  anchor.onTargetFound = () => { tracked = true; mesh.visible = true; status('Card found · tap the video to explore'); resume(); };
  anchor.onTargetLost = () => { hide(); status('Point the camera at the card'); };
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let down;
  ar.renderer.domElement.addEventListener('pointerdown', e => { down = {x:e.clientX,y:e.clientY}; });
  ar.renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX-down.x,e.clientY-down.y)>12) { down=null; return; }
    down=null;
    if (!tracked || !mesh.visible || !anchor.group.visible) return;
    const rect = ar.renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1, -(e.clientY-rect.top)/rect.height*2+1);
    ar.scene.updateMatrixWorld(true); ar.camera.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, ar.camera);
    if (raycaster.intersectObject(mesh).length) window.location.assign('https://carrieqian.com/');
  });
  ar.renderer.domElement.addEventListener('pointercancel',()=>{down=null;});
}
start.addEventListener('click', async () => {
  if (busy || running) return;
  if (!window.isSecureContext) { status('Camera access needs HTTPS. Open the secure testing URL.'); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.WebGLRenderingContext) { status('This browser does not support the required camera or graphics features. Please use Safari or Chrome.'); return; }
  busy = true; start.disabled = true; status('Starting camera…');
  // Unlock media inside the explicit start gesture; it stays invisible until tracking succeeds.
  video.muted = true; soundLabel();
  video.play().then(()=>{if(!tracked)video.pause();}).catch(()=>{});
  try {
    if (!ar) await setup();
    await ar.start(); running = true;
    ar.renderer.setAnimationLoop(()=>ar.renderer.render(ar.scene, ar.camera));
    $('intro').hidden = true; sound.hidden = false;
    if (!tracked) status('Point the camera at the card');
  } catch (e) {
    console.error(e); hide();
    if (ar) { ar.video?.srcObject?.getTracks().forEach(track=>track.stop()); ar.video?.remove(); ar.controller?.stopProcessVideo(); ar.renderer.setAnimationLoop(null); }
    status(errorText(e)); start.textContent = 'Try again';
  } finally { busy = false; start.disabled = false; }
});
sound.addEventListener('click', () => {
  video.muted = !video.muted; soundLabel();
  if (tracked) resume();
  else if (!video.muted) {
    // Authorize audible playback in this gesture, then pause while the target is absent.
    video.play().then(()=>{if(!tracked)video.pause();}).catch(()=>{video.muted=true;soundLabel();});
  }
});
play.addEventListener('click', resume);
video.addEventListener('error', () => { hide(); status('The portfolio video could not load. Check your connection and reload the page.'); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hide();
  else if (running) { status('Point the camera at the card'); if (anchor?.group.visible) { tracked=true;mesh.visible=true;resume(); } }
});
window.addEventListener('pagehide', () => { hide(); if (ar) { ar.stop(); ar.renderer.setAnimationLoop(null); } running=false; });
window.addEventListener('pageshow', e => { if (e.persisted) { $('intro').hidden=false; sound.hidden=true; start.textContent='Start camera'; status(''); } });
