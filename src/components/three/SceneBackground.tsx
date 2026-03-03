
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Camera and scene transforms based on scroll
  const cameraZ = useTransform(scrollYProgress, [0, 0.5, 1], [15, 6, -12]);
  const sceneRotation = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 0.4]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1, 1, 0.3, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020203");

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- High-Fidelity Starfield ---
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
      starColors[i * 3 + 2] = brightness; // Slight blue tint
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.7,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- Realistic Earth-Like Texture Generator ---
    const createPlanetTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 1. Deep Ocean (Base)
      ctx.fillStyle = '#020208';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Continental Generation (Blob clustering)
      const drawContinent = (centerX: number, centerY: number, size: number, color: string) => {
        ctx.fillStyle = color;
        const numBlobs = 60;
        for (let i = 0; i < numBlobs; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * size;
          const r = Math.random() * (size / 2);
          const x = centerX + Math.cos(angle) * dist;
          const y = centerY + Math.sin(angle) * dist;
          
          ctx.beginPath();
          ctx.arc(x % canvas.width, y % canvas.height, r, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Create several large landmasses
      const landColor = 'rgba(196, 27, 253, 0.9)';
      const shelfColor = 'rgba(120, 15, 180, 0.4)';

      // Define approximate locations for major continents
      const continents = [
        { x: canvas.width * 0.2, y: canvas.height * 0.4, s: 300 }, // Americas-like
        { x: canvas.width * 0.5, y: canvas.height * 0.3, s: 250 }, // Eurasia-like
        { x: canvas.width * 0.5, y: canvas.height * 0.6, s: 200 }, // Africa-like
        { x: canvas.width * 0.8, y: canvas.height * 0.7, s: 150 }, // Australia-like
      ];

      continents.forEach(c => {
        // Draw shelf/coastal glow first
        drawContinent(c.x, c.y, c.s * 1.2, shelfColor);
        // Draw main landmass
        drawContinent(c.x, c.y, c.s, landColor);
      });

      // 3. Add random archipelagos/islands
      for(let i = 0; i < 30; i++) {
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        drawContinent(rx, ry, 20 + Math.random() * 40, landColor);
      }

      // 4. City Lights / Neural Networks (Land only glow)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.globalCompositeOperation = 'screen';
      for(let i = 0; i < 200; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createPlanetTexture();

    // --- The Planet ---
    const planetGroup = new THREE.Group();
    
    // Main Body
    const planetGeometry = new THREE.SphereGeometry(5, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 0.6,
      roughness: 0.8,
      metalness: 0.2,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planet);

    // Realistic Cloud Layer
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 1024;
    cloudCanvas.height = 512;
    const cloudCtx = cloudCanvas.getContext('2d');
    if (cloudCtx) {
        cloudCtx.fillStyle = 'rgba(0,0,0,0)';
        cloudCtx.fillRect(0,0,1024,512);
        for(let i=0; i<40; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const size = 50 + Math.random() * 100;
            const grad = cloudCtx.createRadialGradient(x,y,0,x,y,size);
            grad.addColorStop(0, 'rgba(255,255,255,0.2)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            cloudCtx.fillStyle = grad;
            cloudCtx.fillRect(x-size, y-size, size*2, size*2);
        }
    }
    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    const cloudGeometry = new THREE.SphereGeometry(5.08, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planetGroup.add(clouds);

    // Atmosphere Fresnel Glow
    const atmosphereGeometry = new THREE.SphereGeometry(5.3, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planetGroup.add(atmosphere);

    scene.add(planetGroup);

    // --- Cinematic Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(20, 10, 15);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight("#C41BFD", 2, 60);
    fillLight.position.set(-15, -10, 5);
    scene.add(fillLight);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);

      stars.rotation.y += 0.00005;
      planetGroup.rotation.y += 0.0003;
      clouds.rotation.y += 0.0005; 
      clouds.rotation.x += 0.0001;

      // Update from scroll
      camera.position.z = cameraZ.get();
      scene.rotation.y = sceneRotation.get();
      
      const opacity = planetOpacity.get();
      planetGroup.scale.setScalar(opacity);
      planetMaterial.opacity = opacity;
      cloudMaterial.opacity = opacity * 0.4;
      atmosphereMaterial.opacity = opacity * 0.15;

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
      planetTexture?.dispose();
      cloudTexture?.dispose();
    };
  }, [cameraZ, sceneRotation, planetOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
