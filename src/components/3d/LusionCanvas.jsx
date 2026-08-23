import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundEngine } from '../audio/SoundEngine';

export const LusionCanvas = () => {
  const mountRef = useRef(null);
  const [physicsMode, setPhysicsMode] = useState('chrome'); // 'chrome' | 'particles' | 'crystals' | 'jelly'
  const modeRef = useRef('chrome');

  useEffect(() => {
    modeRef.current = physicsMode;
  }, [physicsMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030611, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting for Metallic Chrome / Glass reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f0ff, 80, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff007f, 60, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x9d4edd, 70, 50);
    pointLight3.position.set(0, -12, -5);
    scene.add(pointLight3);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 3. Liquid Chrome Blob (Organic Softbody)
    const blobGeo = new THREE.IcosahedronGeometry(3.6, 64);
    const originalPositions = blobGeo.attributes.position.clone();

    // Metallic liquid shader material with reflections
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a142e,
      roughness: 0.12,
      metalness: 0.94,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    const blobMesh = new THREE.Mesh(blobGeo, chromeMaterial);
    rootGroup.add(blobMesh);

    const wireOverlay = new THREE.Mesh(blobGeo, wireMaterial);
    blobMesh.add(wireOverlay);

    // 4. Secondary Floating Satellites / Liquid droplets
    const droplets = [];
    const dropletCount = 8;
    const dropletGeo = new THREE.IcosahedronGeometry(0.65, 16);

    for (let i = 0; i < dropletCount; i++) {
      const dropMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0x9d4edd,
        roughness: 0.2,
        metalness: 0.88
      });
      const drop = new THREE.Mesh(dropletGeo, dropMat);
      drop.userData = {
        radius: 5.5 + Math.random() * 3.5,
        speed: 0.5 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
        yOffset: (Math.random() - 0.5) * 4
      };
      rootGroup.add(drop);
      droplets.push(drop);
    }

    // 5. Swirling Particle Vortex
    const particleCount = 750;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    const palette = [
      new THREE.Color(0x00f0ff),
      new THREE.Color(0x9d4edd),
      new THREE.Color(0xff007f),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x00ff88)
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 4.5 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 12;

      particlePositions[i * 3] = radius * Math.cos(theta);
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = radius * Math.sin(theta);

      const color = palette[Math.floor(Math.random() * palette.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;

      particleVelocities.push({
        radius,
        theta,
        speed: 0.008 + Math.random() * 0.015,
        y,
        ySpeed: (Math.random() - 0.5) * 0.01
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // 6. Interactive Physics Coordinates & Shockwaves
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let shockwavePower = 0;

    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 3;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleClick = () => {
      shockwavePower = 2.2;
      soundEngine.playChirp(1200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointerdown', handleClick);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Render Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth mouse tracking
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      rootGroup.rotation.y = elapsedTime * 0.15 + mouseX * 0.5;
      rootGroup.rotation.x = mouseY * 0.4;
      rootGroup.position.x = mouseX * 0.8;
      rootGroup.position.y = -mouseY * 0.6;

      // Dissipate shockwave
      if (shockwavePower > 0.01) {
        shockwavePower *= 0.94;
      }

      // Organic Liquid Deformation on Blob Vertices
      const pos = blobGeo.attributes.position;
      const orig = originalPositions;
      const mode = modeRef.current;

      const frequency = mode === 'jelly' ? 1.8 : 1.2;
      const amplitude = (mode === 'jelly' ? 0.65 : 0.35) + shockwavePower * 0.6;

      for (let i = 0; i < pos.count; i++) {
        const ox = orig.getX(i);
        const oy = orig.getY(i);
        const oz = orig.getZ(i);

        const wave = Math.sin(ox * frequency + elapsedTime * 2.2) * 
                     Math.cos(oy * frequency + elapsedTime * 1.8) * 
                     Math.sin(oz * frequency + elapsedTime * 2.0);

        const displacement = 1 + wave * amplitude;
        pos.setXYZ(i, ox * displacement, oy * displacement, oz * displacement);
      }
      pos.needsUpdate = true;
      blobGeo.computeVertexNormals();

      // Animate orbiting droplets
      droplets.forEach((drop) => {
        const u = drop.userData;
        const angle = elapsedTime * u.speed + u.offset;
        drop.position.x = Math.cos(angle) * u.radius;
        drop.position.z = Math.sin(angle) * u.radius;
        drop.position.y = Math.sin(elapsedTime * 1.5 + u.offset) * 2 + u.yOffset;
        drop.rotation.x = elapsedTime;
        drop.rotation.y = elapsedTime * 1.2;
      });

      // Animate particle vortex
      const partPos = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const pVel = particleVelocities[i];
        pVel.theta += pVel.speed + (shockwavePower * 0.04);
        pVel.y += pVel.ySpeed;

        if (pVel.y > 6) pVel.y = -6;
        if (pVel.y < -6) pVel.y = 6;

        const dynamicRadius = pVel.radius + (shockwavePower * 3.5);

        partPos.setXYZ(
          i,
          dynamicRadius * Math.cos(pVel.theta),
          pVel.y,
          dynamicRadius * Math.sin(pVel.theta)
        );
      }
      partPos.needsUpdate = true;

      // Mode-specific styling adjustments
      if (mode === 'particles') {
        blobMesh.visible = false;
        particles.scale.set(1.4, 1.4, 1.4);
      } else {
        blobMesh.visible = true;
        particles.scale.set(1, 1, 1);
        if (mode === 'crystals') {
          chromeMaterial.roughness = 0.05;
          chromeMaterial.metalness = 0.4;
          wireOverlay.visible = true;
        } else {
          chromeMaterial.roughness = 0.12;
          chromeMaterial.metalness = 0.94;
          wireOverlay.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handleClick);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      blobGeo.dispose();
      dropletGeo.dispose();
      particleGeo.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div 
        ref={mountRef} 
        className="w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing select-none"
        title="Interactive 3D Fluid • Click to shockwave"
      />

      {/* Lusion Physics Mode Controller HUD */}
      <div className="fixed bottom-6 left-6 z-30 pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl">
        <span className="text-[10px] font-mono text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
          3D Core:
        </span>
        {[
          { id: 'chrome', label: 'Liquid Chrome' },
          { id: 'particles', label: 'Vortex Swarm' },
          { id: 'crystals', label: 'Glass Crystal' },
          { id: 'jelly', label: 'Organic Jelly' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setPhysicsMode(m.id);
              soundEngine.playChirp(900);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              physicsMode === m.id
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold shadow-lg shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};
