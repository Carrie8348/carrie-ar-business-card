import * as THREE from 'three';

export const COLLECTIONS = Object.freeze({
  Design: Object.freeze({url:'https://carrieqian.com/design', description:'View my visual design and creative projects.'}),
  Code: Object.freeze({url:'https://carrieqian.com/code', description:'View my interactive websites and creative coding projects.'}),
  Film: Object.freeze({url:'https://carrieqian.com/film', description:'View my films, videos and moving-image projects.'})
});

// Hit-test-only meshes: never attached to the scene, so artwork/transforms stay untouched.
export function createIconPicker(popup) {
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const geometry = new THREE.PlaneGeometry(1,1);
  const material = new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
  const entries = Object.keys(COLLECTIONS).map(name => {
    const element = popup.elements[name], plane = element.plane;
    plane.geometry.computeBoundingBox();
    const box = plane.geometry.boundingBox;
    const proxy = new THREE.Mesh(geometry, material); proxy.matrixAutoUpdate = false;
    return {name,element,plane,proxy,center:box.getCenter(new THREE.Vector3()),size:box.getSize(new THREE.Vector3())};
  });
  function pick(x,y,camera,rect) {
    if (!popup.group.visible || rect.width <= 0 || rect.height <= 0 ||
      x < rect.left || x > rect.left+rect.width || y < rect.top || y > rect.top+rect.height) return null;
    pointer.set((x-rect.left)/rect.width*2-1, -(y-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const candidates = entries.filter(e=>e.element.pivot.visible && e.element.material.opacity >= .99);
    // Prefer a tap on actual artwork before considering enlarged, potentially overlapping areas.
    const image = popup.elements.Image;
    const blockers = image?.pivot.visible && image.material.opacity>=.99 ? [image.plane] : [];
    const direct = raycaster.intersectObjects([...candidates.map(e=>e.plane),...blockers],false)[0];
    if (direct) return candidates.find(e=>e.plane===direct.object)?.name ?? null;
    const hits = [];
    for (const e of candidates) {
      const corners = [-1,1].flatMap(dx=>[-1,1].map(dy=>new THREE.Vector3(
        e.center.x+dx*e.size.x/2,e.center.y+dy*e.size.y/2,0).applyMatrix4(e.plane.matrixWorld).project(camera)));
      if (corners.some(p=>p.z < -1 || p.z > 1 || !Number.isFinite(p.x+p.y))) continue;
      const width = (Math.max(...corners.map(p=>p.x))-Math.min(...corners.map(p=>p.x)))*rect.width/2;
      const height = (Math.max(...corners.map(p=>p.y))-Math.min(...corners.map(p=>p.y)))*rect.height/2;
      if (width < 1 || height < 1) continue; // Don't create giant hit zones for edge-on/vanishing icons.
      const sx = Math.max(1.25,44/width), sy = Math.max(1.25,44/height);
      e.proxy.matrixWorld.copy(e.plane.matrixWorld)
        .multiply(new THREE.Matrix4().makeTranslation(e.center.x,e.center.y,0))
        .multiply(new THREE.Matrix4().makeScale(e.size.x*sx,e.size.y*sy,1));
      if (!raycaster.intersectObject(e.proxy,false).length) continue;
      const center = e.center.clone().applyMatrix4(e.plane.matrixWorld).project(camera);
      const px=rect.left+(center.x+1)*rect.width/2, py=rect.top+(1-center.y)*rect.height/2;
      hits.push({name:e.name,distance:Math.hypot(x-px,y-py)});
    }
    // Choose the nearest visual center when enlarged touch regions overlap.
    return hits.sort((a,b)=>a.distance-b.distance)[0]?.name ?? null;
  }
  return {pick,dispose(){geometry.dispose();material.dispose();}};
}

export function createIconUI({dialog,hint,access,placeHint,now=()=>performance.now()}) {
  let interactive=false, hintShown=false, hintUntil=0, selected=null, navigating=false;
  const title=dialog.querySelector('[data-icon-title]'), description=dialog.querySelector('[data-icon-description]');
  const open=dialog.querySelector('[data-icon-open]');
  function close() { if (dialog.open) dialog.close(); selected=null; }
  function show(name) {
    if (!interactive || selected !== null || navigating || dialog.open || !COLLECTIONS[name]) return false;
    selected=name; navigating=false;
    title.textContent=`Explore my ${name} projects?`;
    description.textContent=COLLECTIONS[name].description;
    open.href=COLLECTIONS[name].url;
    open.setAttribute('aria-label',`Open ${name} portfolio in a new tab`);
    hint.hidden=true; dialog.showModal(); return true;
  }
  dialog.querySelector('[data-icon-cancel]').addEventListener('click',close);
  dialog.querySelector('[data-icon-close]').addEventListener('click',close);
  dialog.addEventListener('close',()=>{if(!dialog.open){selected=null;navigating=false;}});
  // Native dialog Escape behavior stays enabled. The native anchor opens synchronously
  // from this tap (no async window.open), and its href is retained while the dialog closes.
  open.addEventListener('click',event=>{
    if (!dialog.open || selected===null || navigating) { event.preventDefault(); return; }
    navigating=true; close();
  });
  for (const button of access.querySelectorAll('[data-collection]')) {
    button.addEventListener('click',()=>show(button.dataset.collection));
  }
  function pause() {interactive=false;hint.hidden=true;access.hidden=true;close();}
  function update(ready) {
    interactive=ready; access.hidden=!ready;
    if (!ready || dialog.open) {hint.hidden=true;return;}
    if (hintShown) {
      if (!hint.hidden && (now()>=hintUntil || !placeHint(hint))) hint.hidden=true;
      return;
    }
    hint.hidden=false;
    if (!placeHint(hint)) {hint.hidden=true;return;}
    hintShown=true;hintUntil=now()+4500;
  }
  return {show,update,pause,beginSession(){pause();hintShown=false;hintUntil=0;},get open(){return dialog.open;}};
}

// Keep the existing tap thresholds; cancel multi-touch and non-primary button gestures.
export function createTapGesture({now=()=>performance.now(),onTap}) {
  let down=null;
  return {
    down(e){
      if(e.isPrimary===false || (e.button!==undefined && e.button!==0)){down=null;return;}
      down={id:e.pointerId,x:e.clientX,y:e.clientY,time:now()};
    },
    cancel(){down=null;},
    up(e){
      const tap=down;down=null;
      if(!tap || tap.id!==e.pointerId || now()-tap.time>700 || Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>12)return;
      onTap(e.clientX,e.clientY);
    }
  };
}
