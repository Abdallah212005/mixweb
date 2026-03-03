
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Scroll mapping for the transition
  // 0.0 -> 0.4: Orbital Space focus
  // 0.4 -> 0.6: Atmospheric Entry (Transition)
  // 0.6 -> 1.0: Urban Intelligence focus
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [15, 8, 3, 1.5]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.45, 0.55], [1, 1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1, 4]);
  const cityOpacity = useTransform(scrollYProgress, [0.4, 0.6, 1], [0, 1, 1]);
  const cityY = useTransform(scrollYProgress, [0.4, 0.7], [30, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020204");
    scene.fog = new THREE.FogExp2("#020204", 0.02);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Starfield ---
    const starCount = 8000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.8, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- 2. Real Earth-Like Planet ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Deep Dark Oceans
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Procedural Continent Mapping
      const drawContinent = (path: number[][], color: string) => {
        ctx.fillStyle = color;
        ctx.shadowBlur = 40;
        ctx.shadowColor = color;
        ctx.beginPath();
        path.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x * canvas.width, y * canvas.height);
          else ctx.lineTo(x * canvas.width, y * canvas.height);
        });
        ctx.closePath();
        ctx.fill();

        // Add "neural" detail nodes
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 20; i++) {
          const rx = path[0][0] + (Math.random() - 0.5) * 0.15;
          const ry = path[0][1] + (Math.random() - 0.5) * 0.15;
          ctx.beginPath();
          ctx.arc(rx * canvas.width, ry * canvas.height, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Simplified Earth Paths
      const americas = [[0.15, 0.2], [0.35, 0.25], [0.3, 0.5], [0.25, 0.8], [0.1, 0.4]];
      const eurasia = [[0.5, 0.15], [0.85, 0.2], [0.9, 0.5], [0.6, 0.4], [0.55, 0.2]];
      const africa = [[0.45, 0.4], [0.6, 0.45], [0.55, 0.75], [0.48, 0.7], [0.42, 0.5]];
      const australia = [[0.8, 0.65], [0.9, 0.7], [0.88, 0.85], [0.78, 0.8]];

      [americas, eurasia, africa, australia].forEach(path => drawContinent(path, "#C41BFD"));

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();
    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(5, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 0.8,
      transparent: true,
      roughness: 0.4,
      metalness: 0.1
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Atmospheric Fresnel Glow
    const atmosphereGeo = new THREE.SphereGeometry(5.3, 64, 64);
    const atmosphereMat = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // --- 3. Realistic Dark City ---
    const cityGroup = new THREE.Group();
    const buildingCount = 500;
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    for (let i = 0; i < buildingCount; i++) {
      const isHero = Math.random() > 0.95;
      const h = (isHero ? 12 : 2) + Math.random() * 8;
      const w = 0.6 + Math.random() * 1.5;
      const d = 0.6 + Math.random() * 1.5;
      
      const building = new THREE.Mesh(
        buildingGeometry,
        new THREE.MeshStandardMaterial({ 
          color: "#050508", 
          roughness: 0.1, 
          metalness: 0.9,
          transparent: true
        })
      );
      
      building.scale.set(w, h, d);
      building.position.set(
        (Math.random() - 0.5) * 80,
        h / 2 - 10,
        (Math.random() - 0.5) * 80
      );
      
      // Neon Windows
      const windowRows = Math.floor(h * 2);
      const windowsPerSide = Math.floor(w * 4);
      for(let r = 0; r < windowRows; r++) {
        if (Math.random() > 0.4) continue;
        const winSize = 0.04;
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(winSize, winSize, winSize),
          new THREE.MeshBasicMaterial({ color: "#C41BFD" })
        );
        // Random face placement
        const face = Math.floor(Math.random() * 4);
        const wy = (r / windowRows - 0.5) * h;
        if (face === 0) win.position.set(w/2 + 0.01, wy, (Math.random()-0.5)*d);
        else if (face === 1) win.position.set(-w/2 - 0.01, wy, (Math.random()-0.5)*d);
        else if (face === 2) win.position.set((Math.random()-0.5)*w, wy, d/2 + 0.01);
        else win.position.set((Math.random()-0.5)*w, wy, -d/2 - 0.01);
        
        building.add(win);
      }
      
      cityGroup.add(building);
    }

    // Ground Grid
    const grid = new THREE.GridHelper(300, 150, "#C41BFD", "#0a0a0c");
    grid.position.y = -10;
    grid.material.transparent = true;
    grid.material.opacity = 0.1;
    cityGroup.add(grid);

    scene.add(cityGroup);

    // Lighting
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    
    const ambient = new THREE.AmbientLight(0x1a1a1a);
    scene.add(ambient);

    const animate = () => {
      requestAnimationFrame(animate);

      const z = cameraZ.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.lookAt(0, -cY * 0.1, 0);

      planetGroup.rotation.y += 0.0008;
      planetGroup.scale.set(pSc, pSc, pSc);
      planetMat.opacity = pOp;
      atmosphereMat.opacity = pOp * 0.15;

      cityGroup.position.y = cY;
      cityGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = cOp;
        }
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
