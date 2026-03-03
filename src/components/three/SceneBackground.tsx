
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Scroll mapping for cinematic transition
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [15, 8, 3, 1.2]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.45, 0.55], [1, 1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1, 4]);
  const cityOpacity = useTransform(scrollYProgress, [0.4, 0.6, 1], [0, 1, 1]);
  const cityY = useTransform(scrollYProgress, [0.4, 0.7], [35, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020204");
    scene.fog = new THREE.FogExp2("#020204", 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Realistic Starfield ---
    const starCount = 10000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
      const brightness = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = brightness;
      starColors[i * 3 + 1] = brightness * 0.9;
      starColors[i * 3 + 2] = brightness * 1.2; // Slight blue tint
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- 2. Realistic Earth-Like Planet ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Deep Dark Oceans
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Procedural Continental Detail
      const drawLand = (path: number[][], color: string) => {
        ctx.fillStyle = color;
        ctx.shadowBlur = 60;
        ctx.shadowColor = color;
        ctx.beginPath();
        path.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x * canvas.width, y * canvas.height);
          else ctx.lineTo(x * canvas.width, y * canvas.height);
        });
        ctx.closePath();
        ctx.fill();

        // Add Neural Network Grid on Land
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 50; i++) {
          const start = path[Math.floor(Math.random() * path.length)];
          const end = path[Math.floor(Math.random() * path.length)];
          ctx.beginPath();
          ctx.moveTo(start[0] * canvas.width, start[1] * canvas.height);
          ctx.lineTo(end[0] * canvas.width, end[1] * canvas.height);
          ctx.stroke();
        }

        // Add bioluminescent "Digital Nodes" (City Lights)
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 150; i++) {
          const rx = path[0][0] + (Math.random() - 0.5) * 0.3;
          const ry = path[0][1] + (Math.random() - 0.5) * 0.3;
          ctx.beginPath();
          ctx.arc(rx * canvas.width, ry * canvas.height, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Realistic Continental Polygons (Simplified)
      const americas = [[0.1, 0.15], [0.35, 0.2], [0.4, 0.45], [0.3, 0.85], [0.15, 0.5], [0.08, 0.25]];
      const eurasia = [[0.45, 0.1], [0.85, 0.15], [0.95, 0.4], [0.75, 0.5], [0.55, 0.45], [0.48, 0.2]];
      const africa = [[0.42, 0.35], [0.6, 0.4], [0.58, 0.8], [0.48, 0.75], [0.4, 0.5]];
      const australia = [[0.78, 0.6], [0.92, 0.65], [0.9, 0.85], [0.75, 0.8]];

      [americas, eurasia, africa, australia].forEach(p => drawLand(p, "#C41BFD"));

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();
    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(5, 128, 128);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 0.9,
      transparent: true,
      roughness: 0.2,
      metalness: 0.1
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Fresnel Atmospheric Glow
    const atmosphereGeo = new THREE.SphereGeometry(5.2, 128, 128);
    const atmosphereMat = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    planetGroup.add(atmosphere);

    // Subtle Rotating Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(5.1, 128, 128);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    planetGroup.add(clouds);

    scene.add(planetGroup);

    // --- 3. High-Fidelity Urban Grid ---
    const cityGroup = new THREE.Group();
    const buildingCount = 600;
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    for (let i = 0; i < buildingCount; i++) {
      const h = 2 + Math.random() * 15;
      const w = 0.5 + Math.random() * 2;
      const d = 0.5 + Math.random() * 2;
      
      const building = new THREE.Mesh(
        buildingGeometry,
        new THREE.MeshStandardMaterial({ 
          color: "#050508", 
          roughness: 0.05, 
          metalness: 0.95,
          transparent: true
        })
      );
      
      building.scale.set(w, h, d);
      building.position.set(
        (Math.random() - 0.5) * 120,
        h / 2 - 12,
        (Math.random() - 0.5) * 120
      );
      
      // Neon Command Windows
      const windowRows = Math.floor(h * 3);
      for(let r = 0; r < windowRows; r++) {
        if (Math.random() > 0.4) continue;
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, 0.06),
          new THREE.MeshBasicMaterial({ color: "#C41BFD" })
        );
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

    // Volumetric Grid Base
    const grid = new THREE.GridHelper(400, 200, "#C41BFD", "#0a0a0c");
    grid.position.y = -12;
    grid.material.transparent = true;
    grid.material.opacity = 0.05;
    cityGroup.add(grid);

    scene.add(cityGroup);

    // Cinematic Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(20, 30, 20);
    scene.add(keyLight);
    
    const fillLight = new THREE.AmbientLight(0x0a0a0f, 0.8);
    scene.add(fillLight);

    const animate = () => {
      requestAnimationFrame(animate);

      const z = cameraZ.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.lookAt(0, -cY * 0.15, 0);

      // Planet Rotation
      planetGroup.rotation.y += 0.0006;
      clouds.rotation.y += 0.0002;
      planetGroup.scale.set(pSc, pSc, pSc);
      planetMat.opacity = pOp;
      atmosphereMat.opacity = pOp * 0.2;
      cloudMat.opacity = pOp * 0.05;

      // City Hover
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
