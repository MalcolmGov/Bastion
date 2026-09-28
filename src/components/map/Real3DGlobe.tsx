'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Operation } from '@/lib/types';
import { RotateCw, ZoomIn, ZoomOut, Compass, Sparkles, MapPin, Eye } from 'lucide-react';

interface Real3DGlobeProps {
  operations: Operation[];
  selectedOpId: string;
  onSelectOp: (id: string) => void;
  onOpenAssistantWithContext?: (prompt: string, context: string) => void;
}

export const Real3DGlobe: React.FC<Real3DGlobeProps> = ({
  operations,
  selectedOpId,
  onSelectOp,
  onOpenAssistantWithContext,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Synchronized refs to avoid rebuilding WebGL scene on prop changes
  const onSelectOpRef = useRef(onSelectOp);
  onSelectOpRef.current = onSelectOp;

  const operationsRef = useRef(operations);
  operationsRef.current = operations;

  const selectedOpIdRef = useRef(selectedOpId);
  selectedOpIdRef.current = selectedOpId;

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Pause ambient auto-rotation when user clicks or drags so they can inspect comfortably
  const pauseAutoRotateUntilRef = useRef<number>(0);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // References to floating HTML label elements for high-performance direct 60fps transform
  const labelElementsRef = useRef<{ [opId: string]: HTMLButtonElement | null }>({});
  const markerPositionsRef = useRef<{ [opId: string]: THREE.Vector3 }>({});

  const GLOBE_RADIUS = 5;

  // Convert lat/lng to 3D Cartesian coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Precompute 3D marker base vectors
  useMemo(() => {
    operations.forEach((op) => {
      markerPositionsRef.current[op.id] = latLngToVector3(
        op.coordinates.lat,
        op.coordinates.lng,
        GLOBE_RADIUS + 0.05
      );
    });
  }, [operations]);

  // Helper to generate procedural world texture with vivid turquoise and gold accents
  const createWorldTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Deep midnight ocean background
    ctx.fillStyle = '#061D32';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bright glowing turquoise latitude and longitude grid
    ctx.strokeStyle = 'rgba(0, 229, 192, 0.22)';
    ctx.lineWidth = 1.2;
    for (let x = 0; x <= canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Stylized continents in corporate navy/slate with bright turquoise shorelines
    ctx.fillStyle = '#0B3356';
    ctx.strokeStyle = '#00E5C0'; // Bright vivid turquoise shoreline
    ctx.lineWidth = 2.0;

    // Helper to draw normalized path
    const drawLand = (coords: [number, number][]) => {
      if (coords.length < 3) return;
      ctx.beginPath();
      ctx.moveTo((coords[0][0] / 360 + 0.5) * canvas.width, (-coords[0][1] / 180 + 0.5) * canvas.height);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo((coords[i][0] / 360 + 0.5) * canvas.width, (-coords[i][1] / 180 + 0.5) * canvas.height);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // North America
    drawLand([
      [-168, 65], [-140, 70], [-100, 75], [-60, 60], [-60, 45],
      [-75, 30], [-80, 25], [-90, 18], [-100, 20], [-115, 30],
      [-125, 38], [-130, 50], [-165, 55], [-168, 65]
    ]);
    // South America
    drawLand([
      [-80, 10], [-60, 10], [-35, -5], [-40, -22], [-55, -35],
      [-65, -55], [-75, -50], [-70, -30], [-80, -5], [-80, 10]
    ]);
    // Europe & Asia
    drawLand([
      [-10, 36], [0, 45], [10, 55], [30, 70], [70, 72],
      [120, 75], [170, 65], [160, 45], [140, 35], [120, 25],
      [105, 10], [90, 22], [75, 10], [60, 25], [45, 15],
      [35, 32], [25, 37], [15, 40], [-5, 43], [-10, 36]
    ]);
    // Africa
    drawLand([
      [-15, 30], [10, 37], [30, 32], [42, 12], [50, 10],
      [40, -10], [35, -25], [20, -35], [15, -30], [10, -5],
      [-15, 12], [-15, 30]
    ]);
    // Australia
    drawLand([
      [115, -20], [130, -12], [145, -15], [152, -25], [150, -38],
      [135, -35], [115, -35], [113, -25], [115, -20]
    ]);

    // Dot matrix fill over landmasses with bright mineral gold highlights
    ctx.fillStyle = 'rgba(200, 160, 100, 0.35)';
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      const pixel = ctx.getImageData(rx, ry, 1, 1).data;
      if (pixel[0] === 11 && pixel[1] === 51) {
        ctx.fillRect(rx, ry, 2, 2);
      }
    }

    return new THREE.CanvasTexture(canvas);
  };

  // Re-orient globe to face a target operation
  const rotateToOperation = (opId: string) => {
    const op = operationsRef.current.find((o) => o.id === opId);
    if (!op || !globeGroupRef.current) return;

    // Pause auto-rotation for 8s so user can examine the target
    pauseAutoRotateUntilRef.current = Date.now() + 8000;

    // Exact analytical rotation to point target coordinate at the camera (+Z)
    // When globeGroup.rotation.order = 'YXZ':
    const targetY = -Math.PI / 2 - (op.coordinates.lng * Math.PI) / 180;
    const targetX = (op.coordinates.lat * Math.PI) / 180;

    const currentY = globeGroupRef.current.rotation.y;
    // Calculate shortest angular difference (modulo 2PI)
    let diffY = (targetY - (currentY % (2 * Math.PI))) % (2 * Math.PI);
    if (diffY > Math.PI) diffY -= 2 * Math.PI;
    if (diffY < -Math.PI) diffY += 2 * Math.PI;

    targetRotationRef.current = {
      y: currentY + diffY,
      x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetX)),
    };
  };

  // Re-orient when selectedOpId prop changes
  useEffect(() => {
    rotateToOperation(selectedOpId);
  }, [selectedOpId]);

  // Main Three.js Scene Setup — Runs ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 650;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera — Centered vertically to accommodate bottom asset card
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, -0.4, 13.5);
    camera.lookAt(0, -0.4, 0);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
    sunLight.position.set(12, 10, 10);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00E5C0, 1.2);
    rimLight.position.set(-12, -8, -10);
    scene.add(rimLight);

    // Globe Group with YXZ rotation order
    const globeGroup = new THREE.Group();
    globeGroup.rotation.order = 'YXZ';
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Initial orientation to face South Africa
    globeGroup.rotation.y = -2.06;
    globeGroup.rotation.x = -0.45;

    // Sphere Geometry & Texture
    const texture = createWorldTexture();
    const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.15,
      bumpScale: 0.05,
    });
    const globeMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globeMesh);

    // 1. Atmosphere Outer Luminous Turquoise Glow
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00E5C0, // Vivid electric turquoise glow
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 2. Atmospheric Inner Rim Glow (Soft turquoise additive halo)
    const innerRimGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.01, 64, 64);
    const innerRimMat = new THREE.MeshBasicMaterial({
      color: 0x00B398,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const innerRimMesh = new THREE.Mesh(innerRimGeo, innerRimMat);
    globeGroup.add(innerRimMesh);

    // 3. Equatorial / Orbit Ring in Vivid Turquoise
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.18, GLOBE_RADIUS * 1.205, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00E5C0,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2.3;
    globeGroup.add(orbitRing);

    // Markers Group
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Add 3D Pin Markers for all operations
    operationsRef.current.forEach((op) => {
      const pos = latLngToVector3(op.coordinates.lat, op.coordinates.lng, GLOBE_RADIUS + 0.05);

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(pos);
      pinGroup.userData = { opId: op.id, opName: op.name, country: op.country };

      // Normal vector pointing outwards from globe center
      const normal = pos.clone().normalize();
      pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // Pin stem (Gold cylinder)
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
      stemGeo.translate(0, 0.22, 0);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0xc8a064,
        metalness: 0.8,
        roughness: 0.2,
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      pinGroup.add(stem);

      // Pin head (Glowing sphere)
      const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
      headGeo.translate(0, 0.45, 0);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xb79855,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      pinGroup.add(head);

      // Surface pulse disc (Bright luminous turquoise beacon ring)
      const discGeo = new THREE.RingGeometry(0.08, 0.24, 24);
      discGeo.rotateX(-Math.PI / 2);
      const discMat = new THREE.MeshBasicMaterial({
        color: 0x00E5C0,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      pinGroup.add(disc);

      markersGroup.add(pinGroup);
    });

    // Mouse and Touch Drag Controls
    const onMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking buttons
      if ((e.target as HTMLElement)?.closest('button, a')) return;
      isDraggingRef.current = true;
      targetRotationRef.current = null;
      pauseAutoRotateUntilRef.current = Date.now() + 8000;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;

      // Limit pitch to prevent tumbling
      globeGroupRef.current.rotation.x = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, globeGroupRef.current.rotation.x)
      );

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        if ((e.target as HTMLElement)?.closest('button, a')) return;
        isDraggingRef.current = true;
        targetRotationRef.current = null;
        pauseAutoRotateUntilRef.current = Date.now() + 8000;
        previousMousePosition.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;
      globeGroupRef.current.rotation.x = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, globeGroupRef.current.rotation.x)
      );

      previousMousePosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Raycaster for direct 3D pin selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('button, a')) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (!markersGroupRef.current) return;

      const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);
      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        while (parent && !parent.userData.opId && parent !== markersGroupRef.current) {
          parent = parent.parent;
        }
        if (parent && parent.userData.opId) {
          onSelectOpRef.current(parent.userData.opId);
        }
      }
    };

    container.addEventListener('click', onClick);

    // Vector reusable scratchpad for 60fps label projection
    const tempVec = new THREE.Vector3();

    // 60FPS Render & Projection Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 1. Smooth interpolation to target rotation when navigating
      if (targetRotationRef.current && globeGroupRef.current) {
        const diffY = targetRotationRef.current.y - globeGroupRef.current.rotation.y;
        const diffX = targetRotationRef.current.x - globeGroupRef.current.rotation.x;

        globeGroupRef.current.rotation.y += diffY * 0.08;
        globeGroupRef.current.rotation.x += diffX * 0.08;

        if (Math.abs(diffY) < 0.001 && Math.abs(diffX) < 0.001) {
          globeGroupRef.current.rotation.y = targetRotationRef.current.y;
          globeGroupRef.current.rotation.x = targetRotationRef.current.x;
          targetRotationRef.current = null;
        }
      } else if (
        autoRotateRef.current &&
        Date.now() > pauseAutoRotateUntilRef.current &&
        !isDraggingRef.current &&
        globeGroupRef.current
      ) {
        // Slow ambient rotation
        globeGroupRef.current.rotation.y += 0.0015;
      }

      // 2. Pulse pin beacon discs
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((pinGroup) => {
          const isSelected = pinGroup.userData.opId === selectedOpIdRef.current;
          const disc = pinGroup.children[2] as THREE.Mesh;
          if (disc) {
            const scale = isSelected
              ? 1 + Math.sin(elapsedTime * 5) * 0.45
              : 1 + Math.sin(elapsedTime * 2) * 0.2;
            disc.scale.set(scale, scale, scale);
          }
        });
      }

      // 3. Project 3D Location Names onto 2D Screen Space
      if (globeGroupRef.current && cameraRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const cam = cameraRef.current;
        const globe = globeGroupRef.current;

        operationsRef.current.forEach((op) => {
          const el = labelElementsRef.current[op.id];
          if (!el) return;

          const basePos = markerPositionsRef.current[op.id];
          if (!basePos) return;

          // Compute world position with globe rotation
          tempVec.copy(basePos).applyEuler(globe.rotation);

          // Occlusion test: only show labels on front hemisphere facing camera (+Z)
          const isFacingCamera = tempVec.z > 0.45;

          if (!isFacingCamera) {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            return;
          }

          // Project to 2D screen coordinates
          tempVec.project(cam);
          const screenX = (tempVec.x * 0.5 + 0.5) * containerWidth;
          const screenY = (-tempVec.y * 0.5 + 0.5) * containerHeight;

          // Position floating label directly above pin
          el.style.transform = `translate3d(${screenX}px, ${screenY - 26}px, 0) translate(-50%, -100%)`;
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window resize handler
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('click', onClick);
      renderer.dispose();
      texture.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
    };
  }, []); // Run ONCE on mount

  // Zoom controls
  const handleZoom = (inOut: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const step = inOut === 'in' ? -1.5 : 1.5;
    cameraRef.current.position.z = Math.max(8.5, Math.min(22, cameraRef.current.position.z + step));
  };

  const handleResetOrientation = () => {
    rotateToOperation('south-deep');
    if (cameraRef.current) {
      cameraRef.current.position.set(0, -0.4, 13.5);
      cameraRef.current.lookAt(0, -0.4, 0);
    }
  };

  const activeOp = operations.find((o) => o.id === selectedOpId) || operations[0];

  return (
    <div className="relative w-full h-[520px] sm:h-[650px] md:h-[680px] bg-navy-dark rounded-2xl overflow-hidden border border-turquoise/30 shadow-[0_0_40px_rgba(0,179,152,0.18)] flex flex-col select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 2D Projected Location Labels directly on the Globe */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {operations.map((op) => {
          const isSelected = op.id === selectedOpId;
          return (
            <button
              key={op.id}
              ref={(el) => {
                labelElementsRef.current[op.id] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectOp(op.id);
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                opacity: 0,
                pointerEvents: 'none',
                transform: 'translate3d(0, 0, 0)',
                transition: 'opacity 0.25s ease-out, transform 0.05s linear',
              }}
              className={`pointer-events-auto flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold shadow-elevated cursor-pointer select-none transition-all ${
                isSelected
                  ? 'bg-turquoise-bright text-navy-dark border-2 border-white scale-110 shadow-[0_0_20px_rgba(0,229,192,0.85)] z-30'
                  : 'bg-navy-dark/90 hover:bg-navy text-white hover:text-turquoise-bright border border-turquoise/40 hover:border-turquoise-bright hover:scale-105 z-10 backdrop-blur-md'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  isSelected ? 'bg-navy-dark animate-ping' : 'bg-turquoise-bright'
                }`}
              />
              <span className="whitespace-nowrap font-display tracking-tight">{op.name}</span>
              <span
                className={`text-[8px] sm:text-[9px] uppercase px-1 py-0.2 rounded font-semibold ${
                  isSelected ? 'bg-navy-dark/20 text-navy-dark' : 'bg-white/10 text-mist'
                }`}
              >
                {op.country.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating 3D Interaction Badge & Instructions */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-navy/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-xl border border-turquoise/40 text-xs text-white shadow-card flex items-center gap-2 z-20">
        <span className="w-2 h-2 rounded-full bg-turquoise-bright animate-ping shrink-0" />
        <div>
          <span className="font-bold text-[11px] sm:text-xs text-white flex items-center gap-1.5 font-display">
            Interactive 3D Earth
            <span className="text-[8px] sm:text-[9px] uppercase px-1 sm:px-1.5 py-0.5 rounded bg-turquoise/25 text-turquoise-bright border border-turquoise/40 font-bold">
              WebGL
            </span>
          </span>
          <span className="text-[10px] text-mist/75 hidden sm:block">
            Click any location tag or drag to rotate in 3D
          </span>
        </div>
      </div>

      {/* Quick 3D Controls Bar */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1 sm:gap-1.5 bg-navy/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-turquoise/30 shadow-card z-20">
        <button
          onClick={() => {
            const next = !autoRotate;
            setAutoRotate(next);
            if (next) pauseAutoRotateUntilRef.current = 0;
          }}
          className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            autoRotate
              ? 'bg-gradient-to-r from-turquoise to-turquoise-bright text-navy-dark font-extrabold shadow-[0_0_12px_rgba(0,229,192,0.4)]'
              : 'text-mist hover:text-white hover:bg-navy-surface'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden md:inline">Auto-Spin</span>
        </button>

        <button
          onClick={() => handleZoom('in')}
          className="p-1.5 sm:p-2 rounded-lg text-mist hover:text-white hover:bg-navy-surface transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="p-1.5 sm:p-2 rounded-lg text-mist hover:text-white hover:bg-navy-surface transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleResetOrientation}
          className="p-1.5 sm:p-2 rounded-lg text-mist hover:text-white hover:bg-navy-surface transition-colors"
          title="Reset to South Deep"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Operation Quick Pin Selector Overlay — Anchored at bottom */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 bg-navy-dark/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-turquoise/40 shadow-[0_0_30px_rgba(0,179,152,0.22)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-turquoise/15 border border-turquoise/40 flex items-center justify-center text-turquoise-bright shadow-[0_0_15px_rgba(0,229,192,0.3)] shrink-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-turquoise-bright">
                {activeOp.country} • {activeOp.type}
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-mist">
                {activeOp.status}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white leading-tight font-display">
              {activeOp.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href={`/operations/${activeOp.slug}`}
            className="flex-1 md:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 hover:brightness-110 text-navy-dark text-xs font-extrabold transition-all text-center inline-flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(0,229,192,0.45)]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Asset Details</span>
          </a>

          {onOpenAssistantWithContext && (
            <button
              onClick={() =>
                onOpenAssistantWithContext(
                  `Tell me about ${activeOp.name} production, geology, and ESG performance`,
                  `${activeOp.name} Profile`
                )
              }
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg bg-navy-surface hover:bg-navy text-white text-xs font-semibold border border-turquoise/30 hover:border-turquoise transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-turquoise-bright" />
              <span>Ask AI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
