import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Zap, Compass, RotateCcw } from 'lucide-react';

const COLOR_THEMES = {
  cyan: {
    primary: 0x00f0ff,
    secondary: 0x3b82f6,
    accent: 0x9d4edd,
    label: 'Cyber Cyan'
  },
  purple: {
    primary: 0x9d4edd,
    secondary: 0xff007f,
    accent: 0x00f0ff,
    label: 'Violet Flare'
  },
  emerald: {
    primary: 0x00ff88,
    secondary: 0x00f0ff,
    accent: 0xffaa00,
    label: 'Matrix Emerald'
  },
  gold: {
    primary: 0xffaa00,
    secondary: 0xff007f,
    accent: 0x00f0ff,
    label: 'Solar Flare'
  }
};

export const Hero3DCanvas = () => {
  const mountRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState('cyan');
  const themeRef = useRef(COLOR_THEMES.cyan);

  useEffect(() => {
    themeRef.current = COLOR_THEMES[activeTheme];
  }, [activeTheme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030611, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for mouse interaction
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 2. Central Morphing Torus Knot (Holographic Cyber Core)
    const knotGeo = new THREE.TorusKnotGeometry(2.4, 0.55, 120, 24, 2, 3);
    const knotWireMat = new THREE.MeshBasicMaterial({
      color: themeRef.current.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotWireMat);
    worldGroup.add(knotMesh);

    // Inner glowing sphere
    const sphereGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: themeRef.current.secondary,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    worldGroup.add(sphereMesh);

    // 3. Orbital Laser Rings
    const ring1Geo = new THREE.TorusGeometry(4.8, 0.03, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: themeRef.current.accent,
      transparent: true,
      opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    worldGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(5.8, 0.02, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: themeRef.current.primary,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 5;
    worldGroup.add(ring2);

    // 4. Undulating Cyber Grid Plane (Horizon)
    const planeGeo = new THREE.PlaneGeometry(35, 35, 30, 30);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x1a264a,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = -Math.PI / 2.2;
    planeMesh.position.y = -3.8;
    scene.add(planeMesh);

    // 5. Surrounding Quantum Particles
    const particleCount = 450;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.5 + Math.random() * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleScales[i] = Math.random();
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: themeRef.current.primary,
      size: 0.12,
      transparent: true,
      opacity: 0.75
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particles);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetMouseX = ((x / container.clientWidth) * 2 - 1) * 0.7;
      targetMouseY = (-(y / container.clientHeight) * 2 + 1) * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic color theme update
      const currentTheme = themeRef.current;
      knotWireMat.color.setHex(currentTheme.primary);
      sphereMat.color.setHex(currentTheme.secondary);
      ring1Mat.color.setHex(currentTheme.accent);
      ring2Mat.color.setHex(currentTheme.primary);
      particleMat.color.setHex(currentTheme.primary);

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      worldGroup.rotation.y = elapsedTime * 0.25 + mouseX;
      worldGroup.rotation.x = mouseY * 0.6;

      // Morphing Core rotations
      knotMesh.rotation.x = elapsedTime * 0.4;
      knotMesh.rotation.y = elapsedTime * 0.3;

      sphereMesh.rotation.y = -elapsedTime * 0.5;
      sphereMesh.rotation.z = elapsedTime * 0.2;

      ring1.rotation.z = elapsedTime * 0.3;
      ring2.rotation.z = -elapsedTime * 0.25;

      particles.rotation.y = -elapsedTime * 0.1;

      // Sine wave animation on cyber grid plane vertices
      const posAttr = planeGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = posAttr.getX(i);
        const v = posAttr.getY(i);
        const z = Math.sin(u * 0.4 + elapsedTime * 1.5) * Math.cos(v * 0.4 + elapsedTime * 1.2) * 0.4;
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      knotGeo.dispose();
      sphereGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      planeGeo.dispose();
      particleGeo.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full relative group">
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[380px] sm:min-h-[460px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Cyber 3D Theme Palette Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
        {Object.entries(COLOR_THEMES).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setActiveTheme(key)}
            className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
              activeTheme === key ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-black' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ backgroundColor: `#${item.primary.toString(16).padStart(6, '0')}` }}
            title={`3D Theme: ${item.label}`}
          />
        ))}
      </div>

      {/* Realtime 3D telemetry badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>THREE.JS GLSL CORE • 60 FPS</span>
      </div>
    </div>
  );
};
