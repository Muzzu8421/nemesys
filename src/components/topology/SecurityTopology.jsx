"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

/**
 * 3D Node data points in spatial coordinate space (X, Y, Z).
 * Representing architectural layers of a codebase.
 */
const TOPOLOGY_NODES = [
  { id: "input_1", name: "INPUT: req.body", type: "input", pos: [-18, 8, 20], color: 0x35bfff },
  { id: "input_2", name: "INPUT: params.id", type: "input", pos: [-12, -6, 16], color: 0x35bfff },
  { id: "auth_mod", name: "MODULE: auth.ts", type: "module", pos: [-8, 4, 10], color: 0x77736b },
  { id: "router_mod", name: "MODULE: router.ts", type: "module", pos: [-6, -4, 8], color: 0x77736b },
  { id: "api_1", name: "API: /graphql", type: "api", pos: [-2, 10, 2], color: 0x35bfff },
  { id: "api_2", name: "API: /rest/v1", type: "api", pos: [2, -8, -2], color: 0x35bfff },
  { id: "fn_sanitize", name: "FUNC: validate()", type: "function", pos: [4, 6, -6], color: 0xf2efe6 },
  { id: "fn_query", name: "FUNC: execRaw()", type: "function", pos: [8, -2, -12], color: 0xd92c24 }, // Compromised
  { id: "db_primary", name: "DB: postgres_main", type: "database", pos: [14, 4, -18], color: 0xf2efe6 },
  { id: "db_cache", name: "DB: redis_session", type: "database", pos: [12, -10, -22], color: 0x77736b },
  { id: "sink_sqli", name: "SINK: raw_sql()", type: "sink", pos: [18, -4, -28], color: 0xd92c24 }, // Detonation
];

// Structural graph edges
const CONNECTIONS = [
  ["input_1", "auth_mod"],
  ["input_2", "router_mod"],
  ["auth_mod", "api_1"],
  ["router_mod", "api_2"],
  ["api_1", "fn_sanitize"],
  ["api_2", "fn_query"],      // Insecure bypass edge
  ["fn_sanitize", "db_primary"],
  ["fn_query", "sink_sqli"],   // Direct taint connection to sink
  ["db_primary", "sink_sqli"],
  ["api_1", "db_cache"],
];

/**
 * SecurityTopology Component
 * Narrative State 03: 3D Codebase Data-Flow Topology using Three.js.
 * Provides spatial depth, depth fog, camera movement, and isolated vulnerability path.
 */
export const SecurityTopology = forwardRef(function SecurityTopology(
  {
    registerHeadlineRef,
    registerAlertRef,
    registerStatsRef,
    className = "",
    style = {},
  },
  ref
) {
  const mountRef = useRef(null);
  const internalRef = useRef({
    cameraProgress: 0,
    setCameraProgress: (p) => {},
  });

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      if (internalRef.current.setCameraProgress) {
        internalRef.current.setCameraProgress(p);
      }
    },
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // ── 1. THREE.JS SCENE, CAMERA & FOG ─────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.022);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 150);
    camera.position.set(0, 0, 36);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── 2. CREATE 3D TOPOLOGY NODES ─────────────────────────────
    const nodeMap = new Map();
    const nodeGroup = new THREE.Group();

    // Node geometries & materials
    const sphereGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const glowGeo = new THREE.SphereGeometry(1.4, 16, 16);

    TOPOLOGY_NODES.forEach((item) => {
      const isVulnerable = item.id === "fn_query" || item.id === "sink_sqli";

      // Core node mesh
      const coreMat = new THREE.MeshBasicMaterial({
        color: item.color,
      });
      const coreMesh = new THREE.Mesh(sphereGeo, coreMat);
      coreMesh.position.set(...item.pos);

      // Outer glow shell
      const glowMat = new THREE.MeshBasicMaterial({
        color: item.color,
        transparent: true,
        opacity: isVulnerable ? 0.35 : 0.12,
        wireframe: true,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      coreMesh.add(glowMesh);

      nodeGroup.add(coreMesh);
      nodeMap.set(item.id, coreMesh);
    });
    scene.add(nodeGroup);

    // ── 3. CONNECTING EDGES & VULNERABLE HIGHLIGHT PATH ──────────
    const lineMatNormal = new THREE.LineBasicMaterial({
      color: 0x77736b,
      transparent: true,
      opacity: 0.25,
    });
    const lineMatVuln = new THREE.LineBasicMaterial({
      color: 0xd92c24,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });

    const linesGroup = new THREE.Group();
    CONNECTIONS.forEach(([fromId, toId]) => {
      const fromMesh = nodeMap.get(fromId);
      const toMesh = nodeMap.get(toId);
      if (!fromMesh || !toMesh) return;

      const isVulnPath =
        (fromId === "input_2" && toId === "router_mod") ||
        (fromId === "router_mod" && toId === "api_2") ||
        (fromId === "api_2" && toId === "fn_query") ||
        (fromId === "fn_query" && toId === "sink_sqli");

      const points = [fromMesh.position, toMesh.position];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, isVulnPath ? lineMatVuln : lineMatNormal);
      linesGroup.add(line);
    });
    scene.add(linesGroup);

    // ── 4. BACKGROUND DUST PARTICLES ────────────────────────────
    const particleCount = 220;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
      particlePositions[i + 1] = (Math.random() - 0.5) * 60;
      particlePositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      color: 0x77736b,
      transparent: true,
      opacity: 0.35,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── 5. CAMERA MOTION & RENDER LOOP ──────────────────────────
    let targetProgress = 0;
    let currentProgress = 0;

    internalRef.current.setCameraProgress = (p) => {
      targetProgress = Math.max(0, Math.min(1, p));
    };

    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      // Smooth lerp for scroll progression
      currentProgress += (targetProgress - currentProgress) * 0.1;

      // Camera journey: enters deep into topology (Z moves from 36 to 8)
      camera.position.z = 36 - currentProgress * 28;
      camera.position.x = Math.sin(currentProgress * 2.2) * 5;
      camera.position.y = (currentProgress - 0.5) * -6;

      // Small artistic pan toward the vulnerable sink node at end of journey
      if (currentProgress > 0.5) {
        camera.lookAt(14 * (currentProgress - 0.5) * 2, -4 * (currentProgress - 0.5) * 2, -28);
      } else {
        camera.lookAt(0, 0, 0);
      }

      // Subtle slow node rotation
      nodeGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.08;
      linesGroup.rotation.y = nodeGroup.rotation.y;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      glowGeo.dispose();
      particleGeo.dispose();
      lineMatNormal.dispose();
      lineMatVuln.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 z-[15] hidden flex-col justify-between py-12 md:py-16 px-6 md:px-12 pointer-events-none select-none ${className}`}
      style={{ opacity: 0, ...style }}
    >
      {/* ── 3D THREE.JS WEBGL CANVAS CONTAINER ────────────────────── */}
      <div ref={mountRef} className="absolute inset-0 z-[0] pointer-events-none" />

      {/* ── TOP HEADER / NARRATIVE STATE IDENTIFIER ──────────────── */}
      <div className="relative z-[10] flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#35BFFF] animate-ping" />
          <span className="font-[family-name:var(--font-space-mono)] text-[0.68rem] tracking-[0.25em] text-[#F2EFE6] uppercase font-bold">
            03 — SECURITY TOPOLOGY // SPATIAL INTER-PROCEDURAL GRAPH
          </span>
        </div>
        <div className="flex items-center gap-6 font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] tracking-[0.15em] uppercase">
          <span>CALL GRAPH: <strong className="text-[#F2EFE6]">DEPTH 7</strong></span>
          <span>NODES: <strong className="text-[#35BFFF]">12,034 EDGES</strong></span>
          <span>TAINT VECTOR: <strong className="text-[#D92C24]">ACTIVE</strong></span>
        </div>
      </div>

      {/* ── CENTER AREA: EMBEDDED TOPOLOGY HEADLINE ──────────────── */}
      <div
        ref={registerHeadlineRef}
        className="relative z-[10] my-auto flex flex-col items-center justify-center text-center gap-4 max-w-4xl mx-auto"
      >
        <span className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#35BFFF] tracking-[0.3em] uppercase">
          DEPTH-FIRST CONTROL FLOW
        </span>
        <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.6rem,6vw,6.5rem)] text-[#F2EFE6] uppercase leading-[0.92] tracking-[-0.02em]">
          MODERN CODE MOVES FAST.<br />
          <span className="text-[#D92C24]">SECURITY CAN&apos;T BE AN AFTERTHOUGHT.</span>
        </h2>
        <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(12px,0.95vw,14px)] text-[#77736B] max-w-xl uppercase tracking-[0.06em]">
          As your codebase expands into thousands of interconnected microservices,
          isolated linters fail. NEMESYS models your complete execution topology in depth.
        </p>

        {/* 3D Detection HUD Alert */}
        <div
          ref={registerAlertRef}
          className="mt-4 px-4 py-2 border border-[#D92C24]/60 bg-[#D92C24]/10 rounded flex items-center gap-3 backdrop-blur-sm shadow-[0_0_20px_rgba(217,44,36,0.3)]"
          style={{ opacity: 0 }}
        >
          <div className="w-2 h-2 rounded-full bg-[#D92C24] animate-pulse" />
          <span className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#F2EFE6] tracking-widest uppercase font-bold">
            VULNERABILITY DETECTED: <span className="text-[#D92C24]">ISOLATING UNPROTECTED DATA-SINK</span>
          </span>
        </div>
      </div>

      {/* ── BOTTOM STATS / TECHNICAL GRID ────────────────────────── */}
      <div
        ref={registerStatsRef}
        className="relative z-[10] border-t border-white/10 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#77736B] uppercase tracking-[0.1em]"
      >
        <div className="flex flex-col gap-1">
          <span>BREACH CAUSE:</span>
          <span className="font-[family-name:var(--font-anton)] text-lg text-[#F2EFE6] leading-none">68% HUMAN ERROR</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>TIME TO DETECT:</span>
          <span className="font-[family-name:var(--font-anton)] text-lg text-[#D92C24] leading-none">26 DAYS AVERAGE</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>FALSE POSITIVE RATE:</span>
          <span className="font-[family-name:var(--font-anton)] text-lg text-[#35BFFF] leading-none">&lt; 2% DETERMINISTIC</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>INTER-PROCEDURAL:</span>
          <span className="font-[family-name:var(--font-anton)] text-lg text-[#F2EFE6] leading-none">ENABLED // ∞ DEPTH</span>
        </div>
      </div>
    </div>
  );
});
