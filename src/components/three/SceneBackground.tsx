
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Cinematic scroll mapping
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [15, 8, 3, 1.5]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.45, 0.55], [1, 1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1, 4.5]);
  const cityOpacity = useTransform(scrollYProgress, [0.4, 0.6, 1], [0, 1, 1]);
  const cityY = useTransform(scrollYProgress, [0.4, 0.75], [40, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020204");
    scene.fog = new THREE.FogExp2("#020204", 0.012);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Realistic Starfield ---
    const starCount = 12000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2500;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2500;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2500;
      const b = 0.4 + Math.random() * 0.6;
      starColors[i * 3] = b * 0.9;
      starColors[i * 3 + 1] = b * 0.8;
      starColors[i * 3 + 2] = b * 1.4;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- 2. High-Fidelity Earth Rendering ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Realistic Dark Oceans
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Continent drawing helper
      const drawContinent = (path: number[][], color: string) => {
        ctx.fillStyle = color;
        ctx.shadowBlur = 50;
        ctx.shadowColor = color;
        ctx.beginPath();
        path.forEach(([x, y], i) => {
          const px = x * canvas.width;
          const py = y * canvas.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();

        // Neural Grid overlay for digital agency look
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 0.5;
        for(let i=0; i<40; i++) {
          const start = path[Math.floor(Math.random()*path.length)];
          const end = path[Math.floor(Math.random()*path.length)];
          ctx.beginPath();
          ctx.moveTo(start[0]*canvas.width, start[1]*canvas.height);
          ctx.lineTo(end[0]*canvas.width, end[1]*canvas.height);
          ctx.stroke();
        }
      };

      // Recognizeable Earth-like topography
      const americas = [[0.12, 0.15], [0.32, 0.22], [0.38, 0.45], [0.28, 0.85], [0.15, 0.55], [0.08, 0.3]];
      const eurasia = [[0.45, 0.1], [0.85, 0.15], [0.95, 0.4], [0.7, 0.5], [0.55, 0.45], [0.48, 0.25]];
      const africa = [[0.42, 0.4], [0.6, 0.45], [0.58, 0.8], [0.48, 0.78], [0.4, 0.55]];
      const australia = [[0.78, 0.65], [0.92, 0.7], [0.9, 0.88], [0.75, 0.85]];

      [americas, eurasia, africa, australia].forEach(c => drawContinent(c, "#C41BFD"));

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();
    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(5, 128, 128);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 1.5,
      transparent: true,
      roughness: 0.15,
      metalness: 0.3
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Fresnel Atmospheric Atmosphere
    const atmoGeo = new THREE.SphereGeometry(5.3, 128, 128);
    const atmoMat = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);

    // Rotating Clouds
    const cloudGeo = new THREE.SphereGeometry(5.15, 128, 128);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    planetGroup.add(clouds);

    scene.add(planetGroup);

    // --- 3. Cinematic Urban Matrix ---
    const cityGroup = new THREE.Group();
    const buildingCount = 1000;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    
    for (let i = 0; i < buildingCount; i++) {
      const h = 2 + Math.random() * 20;
      const w = 0.5 + Math.random() * 3;
      const d = 0.5 + Math.random() * 3;
      
      const building = new THREE.Mesh(
        boxGeo,
        new THREE.MeshStandardMaterial({ color: "#050508", roughness: 0.02, metalness: 0.98, transparent: true })
      );
      
      building.scale.set(w, h, d);
      building.position.set((Math.random() - 0.5) * 200, h / 2 - 15, (Math.random() - 0.5) * 200);
      
      // Neon Command Lights
      const winCount = Math.floor(h * 5);
      for(let j = 0; j < winCount; j++) {
        if (Math.random() > 0.4) continue;
        const light = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: "#C41BFD" }));
        const face = Math.floor(Math.random() * 4);
        const ly = (j / winCount - 0.5) * h;
        if (face === 0) light.position.set(w/2 + 0.01, ly, (Math.random()-0.5)*d);
        else if (face === 1) light.position.set(-w/2 - 0.01, ly, (Math.random()-0.5)*d);
        else if (face === 2) light.position.set((Math.random()-0.5)*w, ly, d/2 + 0.01);
        else light.position.set((Math.random()-0.5)*w, ly, -d/2 - 0.01);
        building.add(light);
      }
      cityGroup.add(building);
    }

    const cityGrid = new THREE.GridHelper(600, 300, "#C41BFD", "#0a0a0c");
    cityGrid.position.y = -15;
    cityGrid.material.transparent = true;
    cityGrid.material.opacity = 0.1;
    cityGroup.add(cityGrid);

    scene.add(cityGroup);

    // Dynamic Lighting
    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(50, 60, 50);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x050510, 1.5));

    const animate = () => {
      requestAnimationFrame(animate);

      const z = cameraZ.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.lookAt(0, -cY * 0.1, 0);

      planetGroup.rotation.y += 0.0006;
      clouds.rotation.y += 0.0002;
      planetGroup.scale.set(pSc, pSc, pSc);
      planetMat.opacity = pOp;
      atmoMat.opacity = pOp * 0.2;
      cloudMat.opacity = pOp * 0.08;

      cityGroup.position.y = cY;
      cityGroup.children.forEach(c => {
        if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) c.material.opacity = cOp;
      });
      starMaterial.opacity = starOpacity.get();

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [cameraZ, planetOpacity, planetScale, cityOpacity, cityY, starOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
