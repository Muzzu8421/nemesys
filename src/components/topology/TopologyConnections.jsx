import * as THREE from "three";

const EDGES = [["input", "function"], ["function", "module"], ["module", "api"], ["api", "database"], ["database", "sink"], ["function", "api"], ["module", "database"]];
const VULNERABLE_EDGES = new Set(["input:function", "function:module", "module:api", "api:database", "database:sink"]);

function makeCurve(from, to, index) {
  const start = from.position.clone();
  const end = to.position.clone();
  const middle = start.clone().lerp(end, 0.5);
  middle.y += index % 2 ? 0.8 : -0.8;
  middle.z += 1.2;
  return { start, middle, end };
}

function curveGeometry(curves) {
  const positions = [];
  curves.forEach(({ start, middle, end }) => {
    let previous = start;
    for (let step = 1; step <= 12; step += 1) {
      const t = step / 12;
      const inverse = 1 - t;
      const current = new THREE.Vector3(
        inverse * inverse * start.x + 2 * inverse * t * middle.x + t * t * end.x,
        inverse * inverse * start.y + 2 * inverse * t * middle.y + t * t * end.y,
        inverse * inverse * start.z + 2 * inverse * t * middle.z + t * t * end.z
      );
      positions.push(previous.x, previous.y, previous.z, current.x, current.y, current.z);
      previous = current;
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function placeOnCurve(mesh, curve, t) {
  const inverse = 1 - t;
  mesh.position.set(
    inverse * inverse * curve.start.x + 2 * inverse * t * curve.middle.x + t * t * curve.end.x,
    inverse * inverse * curve.start.y + 2 * inverse * t * curve.middle.y + t * t * curve.end.y,
    inverse * inverse * curve.start.z + 2 * inverse * t * curve.middle.z + t * t * curve.end.z
  );
}

export function createTopologyConnections(nodeMap) {
  const normalEdges = EDGES.filter(([from, to]) => !VULNERABLE_EDGES.has(`${from}:${to}`));
  const vulnerableEdges = EDGES.filter(([from, to]) => VULNERABLE_EDGES.has(`${from}:${to}`));
  const normalCurves = normalEdges.map(([from, to], index) => makeCurve(nodeMap.get(from), nodeMap.get(to), index));
  const vulnerableCurves = vulnerableEdges.map(([from, to], index) => makeCurve(nodeMap.get(from), nodeMap.get(to), index));
  const normalGeometry = curveGeometry(normalCurves);
  const vulnerableGeometry = curveGeometry(vulnerableCurves);
  const normalMaterial = new THREE.LineBasicMaterial({ color: 0x77736b, transparent: true, opacity: 0, depthTest: true });
  const normalGlowMaterial = new THREE.LineBasicMaterial({ color: 0x35bfff, transparent: true, opacity: 0, depthTest: true });
  const vulnerableMaterial = new THREE.LineBasicMaterial({ color: 0xd92c24, transparent: true, opacity: 0.08, depthTest: true });
  const vulnerableGlowMaterial = new THREE.LineBasicMaterial({ color: 0xd92c24, transparent: true, opacity: 0, depthTest: true });
  const normal = new THREE.LineSegments(normalGeometry, normalMaterial);
  const normalGlow = new THREE.LineSegments(normalGeometry, normalGlowMaterial);
  const vulnerable = new THREE.LineSegments(vulnerableGeometry, vulnerableMaterial);
  const vulnerableGlow = new THREE.LineSegments(vulnerableGeometry, vulnerableGlowMaterial);

  const pulseGeometry = new THREE.SphereGeometry(0.16, 10, 10);
  const normalPulseMaterial = new THREE.MeshBasicMaterial({ color: 0x35bfff, transparent: true, opacity: 0.7 });
  const vulnerablePulseMaterial = new THREE.MeshBasicMaterial({ color: 0xd92c24, transparent: true, opacity: 0.95 });
  const normalPulses = normalCurves.map(() => new THREE.Mesh(pulseGeometry, normalPulseMaterial));
  const vulnerablePulses = vulnerableCurves.map(() => new THREE.Mesh(pulseGeometry, vulnerablePulseMaterial));
  normalGeometry.setDrawRange(0, 0);
  vulnerableGeometry.setDrawRange(0, 0);

  return {
    objects: [normal, normalGlow, vulnerable, vulnerableGlow, ...normalPulses, ...vulnerablePulses],
    update(progress) {
      const relationshipReveal = THREE.MathUtils.smoothstep(progress, 0.1, 0.48);
      const vulnerableReveal = THREE.MathUtils.smoothstep(progress, 0.38, 0.76);
      const normalVertexCount = Math.floor((normalGeometry.attributes.position.count * relationshipReveal) / 2) * 2;
      const vulnerableVertexCount = Math.floor((vulnerableGeometry.attributes.position.count * vulnerableReveal) / 2) * 2;
      normalGeometry.setDrawRange(0, normalVertexCount);
      vulnerableGeometry.setDrawRange(0, vulnerableVertexCount);
      normalMaterial.opacity = relationshipReveal * 0.28;
      normalGlowMaterial.opacity = relationshipReveal * 0.09;
      vulnerableMaterial.opacity = 0.06 + vulnerableReveal * 0.82;
      vulnerableGlowMaterial.opacity = vulnerableReveal * 0.19;

      normalPulses.forEach((pulse, index) => {
        pulse.visible = relationshipReveal > (index + 1) / (normalPulses.length + 1);
        placeOnCurve(pulse, normalCurves[index], (progress * 1.1 + index * 0.38) % 1);
      });
      vulnerablePulses.forEach((pulse, index) => {
        const stage = index / vulnerablePulses.length;
        const travel = THREE.MathUtils.clamp((vulnerableReveal - stage) * vulnerablePulses.length, 0, 1);
        pulse.visible = vulnerableReveal > stage;
        placeOnCurve(pulse, vulnerableCurves[index], travel);
      });
    },
    dispose() {
      normalGeometry.dispose();
      vulnerableGeometry.dispose();
      pulseGeometry.dispose();
      normalMaterial.dispose();
      normalGlowMaterial.dispose();
      vulnerableMaterial.dispose();
      vulnerableGlowMaterial.dispose();
      normalPulseMaterial.dispose();
      vulnerablePulseMaterial.dispose();
    },
  };
}
