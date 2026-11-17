# Local MindAR 1.2.5 matching worker adjustment

MindAR retains its original MIT license (MindAR.txt). The only vendor change is inside the embedded matching-worker source in controller-mGt1s8dJ.js.

Original behavior: iterate targetIndexes; on the first matchDetection result with a nonnegative keyframe index, estimate its pose and break. Because both business-card sides share character artwork, synthetic back frames could satisfy the earlier front target and lock onto index 0.

V2 behavior: evaluate every candidate, require a valid estimated pose, and retain the candidate with the largest screenCoords.length (the number of geometrically consistent feature correspondences returned by matchDetection). Ties retain original order. The compiled image targets, feature detector, pose estimator and tracking loop are unchanged. This adds matching work only while acquiring a target, not another camera session or render loop.

In pseudocode:

```js
let bestInliers = 0;
for (const target of candidateTargets) {
  const match = matchDetection(target, frameFeatures);
  if (match.keyframeIndex !== -1 && match.screenCoords.length > bestInliers) {
    const pose = estimate(match);
    if (pose) {
      selectedTarget = target;
      selectedPose = pose;
      bestInliers = match.screenCoords.length;
    }
  }
}
```

Desktop synthetic-camera regression testing corrected the observed wrong-side acquisition. Partial views containing only common character regions can remain ambiguous. Retest this behavior if upgrading or replacing MindAR. No claims about upstream MindAR releases are made.
