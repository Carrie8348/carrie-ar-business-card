import * as THREE from 'three';

// MindAR: X right, Y printed top, +Z out of the target. Dimensions are meters.
export const CARD = Object.freeze({width:.085,depth:.055,thickness:.0006});
export const DURATION = 4.2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const progress=(time,start,end)=>smooth(clamp((time-start)/(end-start)));

export async function createPopupScene(){
  const response=await fetch(new URL('./assets/studio-layout.json?v=2.2',import.meta.url));
  if(!response.ok)throw new Error('Studio registration could not load');
  const layout=await response.json(),group=new THREE.Group(),elements={},textures=[];
  group.name='Creative_Studio_Popup_V2_2';
  const loader=new THREE.TextureLoader();
  const sources={Studio:'studio.png',Design:'studio_icons/design.png',Code:'studio_icons/code.png',Film:'studio_icons/film.png',Image:'studio_icons/image.png'};
  const maps=Object.fromEntries(await Promise.all(Object.entries(sources).map(async([name,file])=>{
    const t=await loader.loadAsync(new URL(`./assets/${file}?v=2.2`,import.meta.url).href);
    t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.anisotropy=1;textures.push(t);return[name,t];
  })));
  const base=new THREE.Vector3(layout.Studio.x,layout.Studio.y,layout.Studio.z);
  const iconField=new THREE.Group();iconField.name='Creative_Icons_Depth_Field';iconField.position.copy(base);group.add(iconField);
  function cutout(name,height,parent,position,offsetX=0){
    const map=maps[name],width=height*map.image.width/map.image.height;
    const geometry=new THREE.PlaneGeometry(width,height);geometry.translate(offsetX,height/2,0);
    const material=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.035,side:THREE.DoubleSide,depthWrite:true,toneMapped:false});
    const plane=new THREE.Mesh(geometry,material);plane.name=`${name}_Original_Pixels`;
    const pivot=new THREE.Group();pivot.name=`${name}_Bottom_Edge`;pivot.position.copy(position);pivot.add(plane);parent.add(pivot);
    return elements[name]={plane,pivot,material,width,height,final:position.clone()};
  }
  const studio=cutout('Studio',layout.Studio.height,group,base,layout.Studio.geometryOffsetX);
  const icons=[
    ['Design',.012,new THREE.Vector3(.020,.047,-.003),'left',2.05],
    ['Code',.011,new THREE.Vector3(.037,.037,.003),'right',2.25],
    ['Film',.010,new THREE.Vector3(.022,.026,.007),'top',2.45],
    ['Image',.009,new THREE.Vector3(.040,.019,.011),'bottom',2.65]
  ];
  for(const[name,h,p,direction,start]of icons){const e=cutout(name,h,iconField,p);e.direction=direction;e.start=start;}
  let restTilt=Math.PI/2,viewLocked=false,currentTime=0;
  function setTime(seconds){
    const t=clamp(Number.isFinite(seconds)?seconds:0,0,DURATION);currentTime=t;
    // Geometry starts in the print plane, with its desk bottom fixed throughout.
    studio.pivot.rotation.x=restTilt*progress(t,.12,1.95);
    iconField.rotation.x=restTilt;
    for(const[name]of icons){
      const e=elements[name],v=progress(t,e.start,e.start+.85);e.pivot.position.copy(e.final);
      if(e.direction==='left')e.pivot.position.x-=.022*(1-v);
      if(e.direction==='right')e.pivot.position.x+=.022*(1-v);
      if(e.direction==='top')e.pivot.position.y+=.018*(1-v);
      if(e.direction==='bottom')e.pivot.position.y-=.014*(1-v);
      e.pivot.position.z+=.003*(1-v);
      e.material.opacity=v;e.pivot.visible=v>0;
    }
    group.updateMatrixWorld(true);return t;
  }
  setTime(0);
  return{
    group,elements,duration:DURATION,setTime,
    resetPresentation(){viewLocked=false;},
    prepareView(camera,anchor){
      if(viewLocked)return;
      anchor.updateWorldMatrix(true,false);
      const eye=anchor.worldToLocal(camera.getWorldPosition(new THREE.Vector3()));
      eye.sub(base.clone().multiplyScalar(1/CARD.width));
      const approach=Math.atan2(-eye.y,Math.max(eye.z,.0001));
      // A horizontally placed card viewed obliquely stands at 90 degrees.
      // For a frontal vertical target, a readable outward lean avoids edge-on strips.
      // Lock ONCE per entrance: lateral motion still reveals actual 3D parallax.
      restTilt=clamp(approach+Math.PI/3,Math.PI/6,Math.PI/2);
      viewLocked=true;setTime(currentTime);
    },
    get restTilt(){return restTilt;},
    dispose(){group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});textures.forEach(t=>t.dispose());group.removeFromParent();}
  };
}
