import * as THREE from "three";

const origin = new THREE.Vector3(0, 0, 3);
const sinkFocus = new THREE.Vector3(14, -3, -24);
const target = new THREE.Vector3();

export function updateTopologyCamera(camera, progress, reducedMotion, compact) {
  const lateral = reducedMotion ? 0 : Math.sin(progress * Math.PI) * 1.15;
  const distance = compact ? 42 : 34;
  const approach = compact ? 36 : 35;
  camera.position.set(lateral, 1.8 - progress * 2.6, distance - progress * approach);
  target.lerpVectors(origin, sinkFocus, THREE.MathUtils.smoothstep(progress, 0.45, 1));
  camera.lookAt(target);
}
