import * as THREE from "three";

const COLORS = {
  input: 0x35bfff,
  function: 0xf2efe6,
  module: 0x77736b,
  api: 0x35bfff,
  database: 0xf2efe6,
  sink: 0xd92c24,
};

export const TOPOLOGY_NODES = [
  { id: "input", label: "INPUT", type: "input", position: [-13, 5, 16] },
  { id: "function", label: "FUNCTION", type: "function", position: [-7, -3, 8] },
  { id: "module", label: "MODULE", type: "module", position: [-2, 4, 1] },
  { id: "api", label: "API", type: "api", position: [4, -2, -7] },
  { id: "database", label: "DATABASE", type: "database", position: [9, 3, -15] },
  { id: "sink", label: "SINK", type: "sink", position: [14, -3, -24] },
];

export function createNodeResources() {
  const coreGeometry = new THREE.OctahedronGeometry(0.62, 2);
  const kernelGeometry = new THREE.SphereGeometry(0.23, 12, 12);
  const shellGeometry = new THREE.IcosahedronGeometry(1.08, 1);
  const ringGeometry = new THREE.TorusGeometry(0.86, 0.022, 6, 24);
  const coreMaterials = new Map();
  const kernelMaterials = new Map();
  const shellMaterials = new Map();
  const ringMaterials = new Map();

  Object.entries(COLORS).forEach(([type, color]) => {
    coreMaterials.set(type, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: type === "sink" ? 0.55 : 0.18, roughness: 0.34, metalness: 0.62 }));
    kernelMaterials.set(type, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: type === "sink" ? 0.95 : 0.72 }));
    shellMaterials.set(type, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: type === "sink" ? 0.32 : 0.12, wireframe: true }));
    ringMaterials.set(type, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: type === "sink" ? 0.68 : 0.28 }));
  });

  return { coreGeometry, kernelGeometry, shellGeometry, ringGeometry, coreMaterials, kernelMaterials, shellMaterials, ringMaterials };
}

export function createTopologyNodes(resources) {
  const group = new THREE.Group();
  const nodeMap = new Map();

  TOPOLOGY_NODES.forEach((node, index) => {
    const pivot = new THREE.Group();
    pivot.position.set(...node.position);
    pivot.userData = { node, index, baseScale: node.type === "sink" ? 1.16 : 1 };

    const core = new THREE.Mesh(resources.coreGeometry, resources.coreMaterials.get(node.type));
    const kernel = new THREE.Mesh(resources.kernelGeometry, resources.kernelMaterials.get(node.type));
    const shell = new THREE.Mesh(resources.shellGeometry, resources.shellMaterials.get(node.type));
    const ring = new THREE.Mesh(resources.ringGeometry, resources.ringMaterials.get(node.type));
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = index * 0.6;
    pivot.add(core, kernel, shell, ring);
    group.add(pivot);
    nodeMap.set(node.id, pivot);
  });

  return { group, nodeMap };
}

export function disposeNodeResources(resources) {
  resources.coreGeometry.dispose();
  resources.kernelGeometry.dispose();
  resources.shellGeometry.dispose();
  resources.ringGeometry.dispose();
  resources.coreMaterials.forEach((material) => material.dispose());
  resources.kernelMaterials.forEach((material) => material.dispose());
  resources.shellMaterials.forEach((material) => material.dispose());
  resources.ringMaterials.forEach((material) => material.dispose());
}
