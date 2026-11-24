// No camera startup here: return checks can continue a healthy session or offer a user action.
export function cameraUsable(s) {
  return s.desired && s.active && !s.busy && s.live && !s.muted &&
    s.videoReady && !s.paused && !s.contextLost && s.processing;
}

export function createReturnGuard({read,onContinue,onNeedsResume,schedule=setTimeout,cancel=clearTimeout}) {
  let timer;
  function reset(){cancel(timer);timer=undefined;}
  function visible(){
    reset();const before=read();
    if(!before.desired || before.hidden)return;
    if(!cameraUsable(before)){onNeedsResume();return;}
    onContinue();
    // Live flags alone don't prove Safari is still delivering camera/tracking frames.
    timer=schedule(()=>{
      timer=undefined;const after=read();
      if(!after.desired || after.hidden || after.generation!==before.generation)return;
      if(!cameraUsable(after) || after.frames<=before.frames || after.cameraTime<=before.cameraTime)onNeedsResume();
    },2200);
  }
  return {visible,reset};
}
