
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Scroll mapping for the transition
  // 0.0 -> 0.3: Space/Planet focus
  // 0.3 -> 0.5: Zooming into Planet (Transition)
  // 0.5 -> 1.0: City focus
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [15, 6, 2, 1]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.5], [1, 3]);
  const cityOpacity = useTransform(scrollYProgress, [0.35, 0.55, 1], [0, 1, 1]);
  const cityY = useTransform(scrollYProgress, [0.3, 0.6], [50, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020204");

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Starfield ---
    const starCount = 6000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 1500;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1500;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1500;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.7, color: 0xffffff, transparent: true });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- 2. Earth-Like Planet ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawLand = (x: number, y: number, w: number, h: number, complexity: number) => {
        ctx.fillStyle = '#C41BFD';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#C41BFD';
        for(let i = 0; i < complexity; i++) {
          const rx = x + (Math.random() - 0.5) * w;
          const ry = y + (Math.random() - 0.5) * h;
          ctx.beginPath();
          ctx.ellipse(rx % canvas.width, ry % canvas.height, Math.random() * (w/4), Math.random() * (h/4), Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      // Realistic-ish clusters
      drawLand(canvas.width * 0.2, canvas.height * 0.4, 400, 300, 60);  // Americas
      drawLand(canvas.width * 0.6, canvas.height * 0.3, 700, 400, 80);  // Eurasia
      drawLand(canvas.width * 0.5, canvas.height * 0.6, 300, 350, 40);  // Africa
      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();
    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(5, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 0.6,
      transparent: true,
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    const atmosphereGeo = new THREE.SphereGeometry(5.2, 64, 64);
    const atmosphereMat = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // --- 3. Realistic Dark City ---
    const cityGroup = new THREE.Group();
    const buildingCount = 400;
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    // Create detailed buildings with purple lights
    for (let i = 0; i < buildingCount; i++) {
      const h = 2 + Math.random() * 8;
      const w = 0.5 + Math.random() * 1.5;
      const d = 0.5 + Math.random() * 1.5;
      
      const building = new THREE.Mesh(
        buildingGeometry,
        new THREE.MeshStandardMaterial({ 
          color: "#0a0a0c", 
          roughness: 0.2, 
          metalness: 0.8,
          transparent: true
        })
      );
      
      building.scale.set(w, h, d);
      building.position.set(
        (Math.random() - 0.5) * 60,
        h / 2 - 10, // Sunk into ground initially
        (Math.random() - 0.5) * 60
      );
      
      // Add neon window "lights"
      const windowCount = 5 + Math.floor(Math.random() * 10);
      for(let j = 0; j < windowCount; j++) {
        const winSize = 0.05 + Math.random() * 0.1;
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(winSize, winSize, winSize),
          new THREE.MeshBasicMaterial({ color: "#C41BFD" })
        );
        // Position randomly on building face
        const face = Math.floor(Math.random() * 4);
        const wy = (Math.random() - 0.5) * (h * 0.8);
        if (face === 0) win.position.set(w/2 + 0.01, wy, (Math.random()-0.5)*d);
        else if (face === 1) win.position.set(-w/2 - 0.01, wy, (Math.random()-0.5)*d);
        else if (face === 2) win.position.set((Math.random()-0.5)*w, wy, d/2 + 0.01);
        else win.position.set((Math.random()-0.5)*w, wy, -d/2 - 0.01);
        
        building.add(win);
      }
      
      cityGroup.add(building);
    }

    // City Ground Grid
    const grid = new THREE.GridHelper(200, 100, "#C41BFD", "#111111");
    grid.position.y = -10;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    cityGroup.add(grid);

    scene.add(cityGroup);

    // Lighting
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 10, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x222222));

    const animate = () => {
      requestAnimationFrame(animate);

      // Scroll logic
      const z = cameraZ.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.lookAt(0, 0, 0);

      planetGroup.rotation.y += 0.001;
      planetGroup.scale.set(pSc, pSc, pSc);
      planetMat.opacity = pOp;
      atmosphereMat.opacity = pOp * 0.1;

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
