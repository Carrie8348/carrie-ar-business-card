import {createCameraUX, promptTop} from './camera-ux.js?v=2.4';
import {createPopupScene, CARD} from './popup-ar.js?v=2.2';
import {createExperience} from './experience.js?v=2.1';
const $ = id => document.getElementById(id);
const video = $('portfolio-video'), start = $('start'), restart = $('restart'), sound = $('sound');
const TARGETS = './assets/targets.mind?v=2.2';
let ar, frontMesh, popup, experience, anchors = [], stream;
let active = false, desired = false, busy = false, generation = 0, latestFound = 0;
let queue = Promise.resolve(), frameActive = false, frameDone, lastFrame = 0, newGuidanceSession = true;
const message = text => { $('camera-message').textContent = text; };
const announce = text => { $('tracking-status').textContent = text; };
const cameraUX = createCameraUX({video, sound, scan:$('scan-guidance'), home:$('home'),
  message:$('camera-message'), controls:document.querySelector('.bottom-controls'), recovery:[$('restart'),$('resume')]});
const soundLabel = cameraUX.syncSound;
function cameraUI(on) {
  $('landing').hidden = on; $('camera-ui').hidden = !on;
  document.body.style.overflowY = on ? 'hidden' : 'auto';
}
function resetAnchors() {
  for (const a of anchors) { a.visible = false; a.group.visible = false; a.group.matrix.elements.fill(0); }
  latestFound = 0;
}
function syncTargets() {
  if (!active || !desired || document.hidden || !experience) return;
  const front = anchors[0].group.visible, back = anchors[1].group.visible;
  const side = front && back ? latestFound : back ? 1 : front ? 0 : -1;
  experience.selectSide(side);
  cameraUX.setTarget(side);
}

function placePrompt() {
  const overlay = $('flip-prompt'), canvas = ar.renderer.domElement;
  const r = canvas.getBoundingClientRect();
  ar.scene.updateMatrixWorld(true); ar.camera.updateMatrixWorld(true);
  let minY = Infinity, maxY = -Infinity;
  const meshes = experience.side === 0 ? [frontMesh] : Object.values(popup.elements).filter(e=>e.pivot.visible && e.material.opacity > .01).map(e=>e.plane);
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingBox(); const box = mesh.geometry.boundingBox;
    for (const x of [box.min.x,box.max.x]) for (const y of [box.min.y,box.max.y]) {
      const v = mesh.position.clone().set(x,y,0).applyMatrix4(mesh.matrixWorld).project(ar.camera);
      const sy = r.top + (1-v.y)*r.height/2;
      minY = Math.min(minY,sy); maxY = Math.max(maxY,sy);
    }
  }
  const overlayParent = $('camera-ui').getBoundingClientRect();
  const visibleRecovery = [$('restart'),$('resume')].filter(e=>!e.hidden);
  const lower = Math.min(document.querySelector('.bottom-controls').getBoundingClientRect().top,
    ...visibleRecovery.map(e=>e.getBoundingClientRect().top)) - 14;
  const upper = Math.max($('home').getBoundingClientRect().bottom,
    $('camera-message').textContent ? $('camera-message').getBoundingClientRect().bottom : 0) + 12;
  const wasHidden=overlay.hidden; overlay.hidden=false;
  const height=overlay.getBoundingClientRect().height; overlay.hidden=wasHidden;
  const top = promptTop({sceneTop:minY, sceneBottom:maxY, upper, lower, height});
  if (top === null || !Number.isFinite(top)) return false;
  overlay.style.top = `${top - overlayParent.top}px`;
  return true;
}

function serial(task) {
  queue = queue.then(task).catch(e => {
    console.error(e); active = false; experience?.setSessionActive(false);cameraUX.pause();
    stream?.getTracks().forEach(t=>t.stop());
    restart.hidden = false; message('Camera stopped. Tap Restart camera.');
  });
  return queue;
}
function errorText(e) {
  if (e?.name === 'NotAllowedError') return 'Camera access was denied. Allow camera access in your browser settings, then try again.';
  if (e?.name === 'NotFoundError') return 'No camera was found. Open this page on a camera-equipped phone.';
  if (e?.name === 'NotReadableError') return 'The camera is busy. Close other camera apps and try again.';
  return 'The AR assets or camera could not start. Check your connection and use an up-to-date Safari or Chrome browser over HTTPS.';
}
function observeFrames(controller) {
  frameActive = controller.processingVideo;
  const load = controller.inputLoader.loadInput.bind(controller.inputLoader), update = controller.onUpdate;
  controller.inputLoader.loadInput = (...args) => { frameActive = true; return load(...args); };
  controller.onUpdate = event => {
    update?.(event);
    if (event.type === 'processDone') { frameActive = false; frameDone?.(); frameDone = undefined; }
  };
}
function discardController() {
  if (!ar?.controller) return;
  const c = ar.controller; c.onUpdate = ()=>{};
  try { c.dispose(); } catch {}
  c.worker?.terminate(); ar.controller = undefined; frameActive = false; frameDone = undefined;
}
async function stopSession(keepStartup = false) {
  active = false; experience?.setSessionActive(false);
  if (!keepStartup) cameraUX.pause();
  ar?.renderer.setAnimationLoop(null);
  // Stop capture immediately; an in-flight tracking frame may finish using its already-loaded tensor.
  stream?.getTracks().forEach(t=>t.stop());
  if (ar?.controller) {
    ar.controller.stopProcessVideo();
    if (frameActive) {
      let timer;
      const finished = await Promise.race([
        new Promise(resolve=>{frameDone=()=>resolve(true);}),
        new Promise(resolve=>{timer=setTimeout(()=>resolve(false),3000);})
      ]);
      clearTimeout(timer);
      if (!finished) discardController();
    }
    // The bundled processVideo loop is asynchronous; wait for its final next-frame continuation.
    if (!document.hidden) await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  }
  stream = undefined;
  if (ar?.video) { ar.video.pause(); ar.video.srcObject = null; }
  resetAnchors();
}
async function setup() {
  if (ar) return;
  const THREE = await import('three');
  const {MindARThree} = await import('./vendor/mindar-image-three.prod.js');
  const targetResponse = await fetch(TARGETS);
  if (!targetResponse.ok) throw new Error('Tracking target download failed');
  await targetResponse.arrayBuffer();
  const backPopup = await createPopupScene();
  ar = new MindARThree({container:$('ar'),imageTargetSrc:TARGETS,uiLoading:'no',uiScanning:'no',uiError:'no',maxTrack:1,missTolerance:1,warmupTolerance:3});
  ar.cssRenderer.domElement.style.pointerEvents = 'none';
  ar.cssRenderer.domElement.style.zIndex = '2'; ar.renderer.domElement.style.zIndex = '1';
  ar.renderer.setClearColor(0x000000,0); ar.scene.background = null;
  ar.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const texture = new THREE.VideoTexture(video); texture.colorSpace = THREE.SRGBColorSpace;
  // Original V1 surface: exactly one card-width by 11/17 card-width, unchanged position/scale.
  frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(1,11/17),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
  frontMesh.name = 'Front_Portfolio_Video'; frontMesh.visible = false;
  anchors = [ar.addAnchor(0),ar.addAnchor(1)]; anchors[0].group.add(frontMesh);
  popup = backPopup;
  // Popup positions are already in MindAR target XY / outward Z.
  popup.group.rotation.x = 0;
  popup.group.scale.setScalar(1 / CARD.width);
  popup.group.visible = false;
  anchors[1].group.add(popup.group);
  experience = createExperience({video,frontMesh,popup,flip:$('flip-prompt'),resumeButton:$('resume'),announce,placePrompt});
  anchors.forEach((a,index)=>{
    a.onTargetFound = ()=>{latestFound=index;syncTargets();};
    a.onTargetLost = syncTargets; a.onTargetUpdate = syncTargets;
  });
  // Retain the working front-side Three.js raycast interaction. UI controls are outside this canvas.
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let down;
  const canvas = ar.renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{down={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};});
  canvas.addEventListener('pointercancel',()=>{down=null;});
  canvas.addEventListener('pointerup',e=>{
    const tap=down;down=null;
    if (!tap || tap.id!==e.pointerId || performance.now()-tap.time>700 || Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>12) return;
    if (!active || experience.side!==0 || !frontMesh.visible || !anchors[0].group.visible) return;
    const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    ar.scene.updateMatrixWorld(true);ar.camera.updateMatrixWorld(true);raycaster.setFromCamera(pointer,ar.camera);
    if(raycaster.intersectObject(frontMesh).length) window.open('https://carrieqian.com/','_blank','noopener,noreferrer');
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(desired)suspend('Graphics were interrupted. Tap Restart camera.');});
}
async function startSession(token) {
  if (!desired || token!==generation || document.hidden) return;
  busy=true;start.disabled=restart.disabled=true;message('');cameraUX.starting();
  try {
    await setup();
    if (newGuidanceSession) { experience.beginSession(); newGuidanceSession = false; }
    if (!desired || token!==generation || document.hidden) return;
    const next = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'}}});
    if (!desired || token!==generation || document.hidden) {next.getTracks().forEach(t=>t.stop());return;}
    stream=next;
    if (!ar.video) {
      ar.video=document.createElement('video');ar.video.autoplay=true;ar.video.muted=true;ar.video.playsInline=true;
      ar.video.setAttribute('playsinline','');ar.video.setAttribute('muted','');
      Object.assign(ar.video.style,{position:'absolute',top:'0',left:'0',zIndex:'0'});$('ar').append(ar.video);
      ar.video.addEventListener('resize',()=>{
        if(active && ar.controller && (ar.video.videoWidth!==ar.controller.inputWidth || ar.video.videoHeight!==ar.controller.inputHeight)) suspend('Camera orientation changed. Tap Restart camera.');
      });
    }
    const camera = ar.video;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>finish(new Error('Camera metadata timed out')),12000);
      const loaded=()=>finish(),failed=()=>finish(new Error('Camera failed'));
      function finish(e){clearTimeout(timer);camera.removeEventListener('loadedmetadata',loaded);camera.removeEventListener('error',failed);e?reject(e):resolve();}
      camera.addEventListener('loadedmetadata',loaded,{once:true});camera.addEventListener('error',failed,{once:true});camera.srcObject=stream;
    });
    await camera.play();
    if (!desired || token!==generation || document.hidden) {await stopSession();return;}
    camera.width=camera.videoWidth;camera.height=camera.videoHeight;
    if (ar.controller && (ar.controller.inputWidth!==camera.videoWidth || ar.controller.inputHeight!==camera.videoHeight)) discardController();
    if (!ar.controller) {
      // Version-pinned MindAR 1.2.5 adapter, retained from the working V1.1 session system.
      await ar._startAR(); observeFrames(ar.controller);
    } else { ar.resize();resetAnchors();ar.controller.processVideo(camera); }
    if (!desired || token!==generation || document.hidden) {await stopSession();return;}
    active=true;experience.setSessionActive(true);restart.hidden=true;lastFrame=performance.now();
    ar.renderer.setAnimationLoop(()=>{
      const now=performance.now(),dt=Math.min((now-lastFrame)/1000,.08);lastFrame=now;
      syncTargets();
      if (experience.side === 1) popup.prepareView(ar.camera, anchors[1].group);
      experience.update(dt);ar.renderer.render(ar.scene,ar.camera);
    });
    message(''); cameraUX.ready();
    syncTargets();
    stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(active&&desired)suspend('Camera interrupted. Tap Restart camera.');},{once:true}));
  } catch(e) {
    console.warn('AR startup:',e?.name||e?.message||e);await stopSession();
    if(token===generation){desired=false;cameraUI(false);$('landing-error').textContent=errorText(e);start.textContent='Try again';}
  } finally {busy=false;start.disabled=restart.disabled=false;}
}
function requestStart(freshSession = true) {
  if (desired && (active || busy)) return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.WebGLRenderingContext) {
    $('landing-error').textContent='AR requires HTTPS and a camera-enabled Safari or Chrome browser.';return;
  }
  if (freshSession) newGuidanceSession = true;
  desired=true;const token=++generation;$('landing-error').textContent='';cameraUI(true);message('');
  cameraUX.starting(freshSession);
  video.muted=true;soundLabel();
  // Unlock media from the user's Start gesture. It remains paused until the front target is visible.
  video.play().then(()=>{if(!active||experience?.side!==0)video.pause();}).catch(()=>{});
  serial(async()=>{await stopSession(true);await startSession(token);});
}
function suspend(text) {
  ++generation;active=false;experience?.setSessionActive(false);video.pause();
  cameraUX.pause();stream?.getTracks().forEach(t=>t.stop());
  ar?.controller?.stopProcessVideo();ar?.renderer.setAnimationLoop(null);
  message(text);restart.hidden=false;
}
start.addEventListener('click',()=>requestStart());
restart.addEventListener('click',()=>{desired=false;requestStart(false);});
$('home').addEventListener('click',()=>{
  desired=false;++generation;active=false;experience?.setSessionActive(false);video.pause();
  cameraUX.pause();stream?.getTracks().forEach(t=>t.stop());
  cameraUI(false);restart.hidden=$('resume').hidden=true;message('');start.textContent='Start AR Experience';
  serial(stopSession);
});
sound.addEventListener('click',()=>{video.muted=!video.muted;soundLabel();if(experience?.side===0)experience.playFront();});
video.addEventListener('error',()=>{
  if(active&&experience?.side===0){video.pause();message('The video could not load. Check your connection; the back side and Portfolio link remain available.');}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&desired)suspend('Camera paused. Return here to restart.');
  else if(desired){message('Tap Restart camera to continue scanning.');restart.hidden=false;}
});
addEventListener('pagehide',()=>{if(desired)suspend('Camera paused. Tap Restart camera.');});
addEventListener('pageshow',e=>{if(e.persisted&&desired){message('Tap Restart camera to continue scanning.');restart.hidden=false;}});
soundLabel();

addEventListener('resize',()=>cameraUX.layout());
window.visualViewport?.addEventListener('resize',()=>cameraUX.layout());
