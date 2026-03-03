
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const cameraZ = useTransform(scrollYProgress, [0, 0.5, 1], [15, 8, -5]);
  const sceneRotation = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 0.4]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [1, 1, 0.6, 0.2]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020204");

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- High-Density Starfield ---
    const starCount = 8000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      const brightness = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = brightness * 0.9;
      starColors[i * 3 + 1] = brightness * 0.9;
      starColors[i * 3 + 2] = brightness;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- Earth-Like Map Generator (Bioluminescent Land / Dark Oceans) ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 1. Deep Dark Oceans
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Continents (Roughly based on Earth)
      const drawLand = (x: number, y: number, w: number, h: number, complexity: number) => {
        ctx.fillStyle = '#C41BFD';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#C41BFD';
        
        for(let i = 0; i < complexity; i++) {
          const rx = x + (Math.random() - 0.5) * w;
          const ry = y + (Math.random() - 0.5) * h;
          const rw = Math.random() * (w / 3.5);
          const rh = Math.random() * (h / 3.5);
          
          ctx.beginPath();
          ctx.ellipse(rx % canvas.width, ry % canvas.height, rw, rh, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Realistic Continent Clusters
      drawLand(canvas.width * 0.22, canvas.height * 0.35, 450, 300, 100); // N. America
      drawLand(canvas.width * 0.28, canvas.height * 0.65, 300, 450, 70);  // S. America
      drawLand(canvas.width * 0.55, canvas.height * 0.3, 850, 400, 150); // Eurasia
      drawLand(canvas.width * 0.5, canvas.height * 0.6, 500, 400, 90);  // Africa
      drawLand(canvas.width * 0.82, canvas.height * 0.7, 280, 220, 50);  // Australia

      // 3. Neural City Lights (Fine detail)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = 'screen';
      for(let i = 0; i < 500; i++) {
        ctx.beginPath();
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() - 0.5) * 30, startY + (Math.random() - 0.5) * 30);
        ctx.stroke();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();

    // --- The Planet ---
    const planetGroup = new THREE.Group();
    
    const planetGeometry = new THREE.SphereGeometry(5, 128, 128);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 0.7,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planet);

    // Subtle Cloud Layer
    const cloudGeometry = new THREE.SphereGeometry(5.08, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planetGroup.add(clouds);

    // Atmospheric Glow (Fresnel Effect Simulation)
    const atmosphereGeometry = new THREE.SphereGeometry(5.4, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planetGroup.add(atmosphere);

    scene.add(planetGroup);

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(15, 10, 10);
    scene.add(keyLight);

    const purpleFill = new THREE.PointLight("#C41BFD", 1.2, 80);
    purpleFill.position.set(-15, -10, 5);
    scene.add(purpleFill);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);

      planetGroup.rotation.y += 0.0004;
      clouds.rotation.y += 0.0006;
      stars.rotation.y += 0.00003;

      camera.position.z = cameraZ.get();
      scene.rotation.y = sceneRotation.get();
      
      const opacityValue = planetOpacity.get();
      planetMaterial.opacity = opacityValue;
      atmosphereMaterial.opacity = opacityValue * 0.1;

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
  }, [cameraZ, sceneRotation, planetOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
