
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
    scene.background = new THREE.Color("#020204");

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- Starfield ---
    const starCount = 10000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      const brightness = 0.4 + Math.random() * 0.6;
      starColors[i * 3] = brightness;
      starColors[i * 3 + 1] = brightness;
      starColors[i * 3 + 2] = 1; 
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- Procedural Planet Texture ---
    const createPlanetTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Deep Ocean Base
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Procedural Landmasses
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 50 + Math.random() * 150;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(196, 27, 253, 0.8)'); // Purple glow core
        gradient.addColorStop(0.3, 'rgba(120, 15, 180, 0.4)');
        gradient.addColorStop(0.7, 'rgba(50, 5, 80, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Neural Net Land Detail (Earth-like veins)
      ctx.strokeStyle = 'rgba(196, 27, 253, 0.2)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 100; i++) {
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
    
    // Main Body (Earth with Purple Land)
    const planetGeometry = new THREE.SphereGeometry(5, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 0.4,
      roughness: 0.7,
      metalness: 0.3,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planet);

    // Cloud Layer
    const cloudGeometry = new THREE.SphereGeometry(5.1, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planetGroup.add(clouds);

    // Atmosphere Glow
    const atmosphereGeometry = new THREE.SphereGeometry(5.4, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planetGroup.add(atmosphere);

    scene.add(planetGroup);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(15, 10, 10);
    scene.add(sunLight);

    const purpleFill = new THREE.PointLight("#C41BFD", 1.5, 50);
    purpleFill.position.set(-10, -5, 5);
    scene.add(purpleFill);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);

      // Constant rotations
      stars.rotation.y += 0.00008;
      planetGroup.rotation.y += 0.0004;
      clouds.rotation.y += 0.00015; // Clouds move slower
      clouds.rotation.x += 0.00005;

      // Update from scroll
      camera.position.z = cameraZ.get();
      scene.rotation.y = sceneRotation.get();
      
      const opacity = planetOpacity.get();
      planetGroup.scale.setScalar(opacity);
      planetMaterial.opacity = opacity;
      cloudMaterial.opacity = opacity * 0.1;
      atmosphereMaterial.opacity = opacity * 0.12;

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
    };
  }, [cameraZ, sceneRotation, planetOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
