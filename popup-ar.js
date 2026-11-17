import * as THREE from 'three';

// Legacy layout inputs are meters: X across, Z toward printed bottom, Y outward.
// The returned scene uses MindAR target coordinates: X right, Y top, Z outward.
export const CARD = Object.freeze({ width: 0.085, depth: 0.055, thickness: 0.0006 });
export const DURATION = 3.2;
const hingeAxis = new THREE.Vector3(1, 0, 0);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function sample(keys, time) {
  if (time <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (time <= keys[i][0]) {
      const [a, av] = keys[i - 1], [b, bv] = keys[i];
      return THREE.MathUtils.lerp(av, bv, ease(clamp((time - a) / (b - a))));
    }
  }
  return keys.at(-1)[1];
}

export async function createPopupScene() {
  const response = await fetch(new URL('./assets/back-layout.json', import.meta.url));
  if (!response.ok) throw new Error('Back layout could not load');
  const layout = await response.json();
  const group = new THREE.Group();
  group.name = 'Carrie_Pixel_Popup_AR_V2_1';
  let restTilt = Math.PI / 4, viewLocked = false, currentTime = 0;
  const elements = {}, textures = [];
  const loader = new THREE.TextureLoader();
  const files = ['carrie', 'cat', 'carrie_accent', 'cat_accent', 'laptop', 'camera', 'design_palette', 'code_window', 'film_strip'];
  const maps = await Promise.all(files.map(async name => {
    const texture = await loader.loadAsync(new URL(`./assets/${name}.png`, import.meta.url).href);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = 1;
    textures.push(texture);
    return [name, texture];
  }));
  const images = Object.fromEntries(maps);
  function cutout(name, image, height, x, z, y = .00018) {
    if (layout[name]) { ({height, x, z, y} = layout[name]); }
    const texture = images[image];
    const width = height * texture.image.width / texture.image.height;
    const geometry = new THREE.PlaneGeometry(width, height);
    // Translate the actual geometry so origin is the bottom edge: a real hinge, not center rotation.
    geometry.translate(0, height / 2, 0);
    const material = new THREE.MeshBasicMaterial({
      map: texture, transparent: true, alphaTest: .035,
      side: THREE.DoubleSide, depthWrite: true, toneMapped: false
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.name = `${name}_Artwork`;
    plane.castShadow = false;
    const pivot = new THREE.Group();
    pivot.name = `${name}_Bottom_Hinge`;
    // MindAR anchor: X right, Y printed top, +Z outward. Keep all feet
    // in the image plane; rotate only the cutout at its own bottom edge.
    pivot.position.set(x, -z, y);
    pivot.add(plane); group.add(pivot);
    const entry = { pivot, plane, material, width, height, final: pivot.position.clone(), image, attached: false };
    elements[name] = entry;
    return entry;
  }

  // Source proportions are preserved; measured printed bounds override these defaults.
  const pixel = .041 / 329;
  const carrie = cutout('Carrie', 'carrie', 329 * pixel, -.007, .014);
  const cat = cutout('Cat', 'cat', 119 * pixel, .012, .019);
  // Original accent components are attached at their original pixel offsets.
  function sourceAccent(entry, name, image, characterBounds, accentBounds) {
    const pixel = entry.height / (characterBounds[3] - characterBounds[1]);
    const h = (accentBounds[3] - accentBounds[1]) * pixel;
    const w = (accentBounds[2] - accentBounds[0]) * pixel;
    const a = cutout(name, image, h, 0, 0, 0);
    entry.pivot.add(a.pivot);
    a.pivot.position.set(
      ((accentBounds[0] + accentBounds[2]) / 2 - (characterBounds[0] + characterBounds[2]) / 2) * pixel,
      (characterBounds[3] - accentBounds[3]) * pixel,
      .000015
    );
    a.final.copy(a.pivot.position); a.attached = true;
    return a;
  }
  sourceAccent(carrie, 'CarrieAccent', 'carrie_accent', [35, 16, 190, 345], [179, 114, 222, 166]);
  sourceAccent(cat, 'CatAccent', 'cat_accent', [165, 226, 287, 345], [275, 245, 308, 276]);
  cutout('Laptop', 'laptop', .015, -.028, -.002);
  cutout('Camera', 'camera', .0135, .030, -.003);
  cutout('Design', 'design_palette', .0075, -.030, .013, .0002);
  cutout('Code', 'code_window', .010, -.011, -.016, .010);
  cutout('Film', 'film_strip', .009, .026, -.017, .013);

  function setTime(seconds) {
    const time = clamp(Number.isFinite(seconds) ? seconds : 0, 0, DURATION);
    currentTime = time;
    // Flat is 0 in the IMAGE plane. The entrance rises toward +anchor Z.
    for (const entry of Object.values(elements)) {
      if (!entry.attached) entry.pivot.quaternion.setFromAxisAngle(hingeAxis, restTilt);
    }
    carrie.pivot.quaternion.setFromAxisAngle(hingeAxis, sample([[0, 0], [.18, 0], [1.30, restTilt + .025], [1.55, restTilt]], time));
    cat.pivot.quaternion.setFromAxisAngle(hingeAxis, sample([[0, 0], [.50, 0], [1.70, restTilt + .018], [1.95, restTilt]], time));
    carrie.material.opacity = cat.material.opacity = 1;
    elements.CarrieAccent.material.opacity = elements.CatAccent.material.opacity = 1;
    for (const [name, sign, start, arrival, end] of [
      ['Laptop', -1, 1.50, 2.35, 2.62],
      ['Camera', 1, 1.72, 2.58, 2.85]
    ]) {
      const e = elements[name];
      e.pivot.position.copy(e.final);
      e.pivot.position.x = sample([[0, sign * .069], [start, sign * .069], [arrival, e.final.x - sign * .0015], [end, e.final.x]], time);
      e.material.opacity = sample([[0, 0], [start, 0], [start + .22, 1]], time);
      e.pivot.visible = e.material.opacity > 0;
    }
    for (const [name, start, end, sign] of [['Design', 2.05, 2.62, -1], ['Code', 2.20, 2.91, -1], ['Film', 2.34, 3.10, 1]]) {
      const e = elements[name];
      e.pivot.position.copy(e.final);
      const factor = sample([[0, 0], [start, 0], [end, 1]], time);
      e.pivot.position.x += sign * .006 * (1 - factor);
      e.material.opacity = factor;
      e.pivot.visible = factor > 0;
    }
    group.updateMatrixWorld(true);
    return time;
  }
  setTime(0);
  return {
    group, elements, duration: DURATION, setTime,
    resetPresentation() { viewLocked = false; },
    prepareView(camera, anchor) {
      if (viewLocked) return;
      anchor.updateWorldMatrix(true, false);
      // Express the camera in target coordinates, not world/gravity coordinates.
      const eye = anchor.worldToLocal(camera.getWorldPosition(new THREE.Vector3()));
      const approach = Math.atan2(-eye.y, Math.max(eye.z, .0001));
      // An exact 90-degree stand is edge-on for a frontal vertical target.
      // Set a readable paper lean ONCE per entrance, not a camera-facing billboard.
      restTilt = THREE.MathUtils.clamp(approach + Math.PI / 4, Math.PI / 9, 5 * Math.PI / 12);
      viewLocked = true; setTime(currentTime);
    },
    get restTilt() { return restTilt; },

    dispose() {
      group.traverse(o => { o.geometry?.dispose(); if (o.material) o.material.dispose(); });
      textures.forEach(t => t.dispose());
      group.removeFromParent();
    }
  };
}
