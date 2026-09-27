"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { createNodeResources, createTopologyNodes, disposeNodeResources } from "./TopologyNode";
import { createTopologyConnections } from "./TopologyConnections";
import { updateTopologyCamera } from "./TopologyCamera";

export const TopologyScene = forwardRef(function TopologyScene(_, ref) {
  const mountRef = useRef(null);
  const progressRef = useRef(0);

  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      progressRef.current = Math.max(0, Math.min(1, progress));
    },
  }), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.028);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, reducedMotion ? 1 : 1.5));
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0x35bfff, 0x000000, 0.72));

    const resources = createNodeResources();
    const { group, nodeMap } = createTopologyNodes(resources);
    const connections = createTopologyConnections(nodeMap);
    scene.add(group, ...connections.objects);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(150 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      particlePositions[index] = (Math.random() - 0.5) * 55;
      particlePositions[index + 1] = (Math.random() - 0.5) * 34;
      particlePositions[index + 2] = (Math.random() - 0.5) * 65;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0x35bfff, size: 0.16, transparent: true, opacity: 0.36 });
    scene.add(new THREE.Points(particleGeometry, particleMaterial));

    let width = 0;
    let height = 0;
    let frameId;
    let currentProgress = 0;
    const resize = () => {
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const render = () => {
      currentProgress += (progressRef.current - currentProgress) * (reducedMotion ? 0.25 : 0.11);
      updateTopologyCamera(camera, currentProgress, reducedMotion);
      connections.update(currentProgress);
      nodeMap.forEach((node, id) => {
        const reveal = THREE.MathUtils.smoothstep(currentProgress, node.userData.index * 0.1, node.userData.index * 0.1 + 0.28);
        const focus = id === "sink" ? THREE.MathUtils.smoothstep(currentProgress, 0.7, 1) : 0;
        const depthScale = THREE.MathUtils.clamp(1.25 - camera.position.distanceTo(node.position) * 0.016, 0.48, 1.15);
        const scale = (node.userData.baseScale + focus * 0.32) * depthScale * (0.08 + reveal * 0.92);
        node.scale.setScalar(scale);
      });
      const sinkFocus = THREE.MathUtils.smoothstep(currentProgress, 0.7, 1);
      resources.coreMaterials.get("sink").emissiveIntensity = 0.55 + sinkFocus * 0.72;
      resources.shellMaterials.get("sink").opacity = 0.32 + sinkFocus * 0.24;
      const sink = nodeMap.get("sink");
      sink.children[3].scale.setScalar(1 + sinkFocus * 0.32);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      connections.dispose();
      disposeNodeResources(resources);
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />;
});
