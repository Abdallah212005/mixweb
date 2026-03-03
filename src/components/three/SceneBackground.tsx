
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Camera and scene transforms based on scroll
  const cameraZ = useTransform(scrollYProgress, [0, 0.5, 1], [15, 5, -10]);
  const sceneRotation = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 0.5]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1, 1, 0.2, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050508");

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- Starfield ---
    const starCount = 8000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      const brightness = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = brightness;
      starColors[i * 3 + 1] = brightness;
      starColors[i * 3 + 2] = 1; // Slight blue tint
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

    // --- The Planet ---
    const planetGroup = new THREE.Group();
    
    // Main Body
    const planetGeometry = new THREE.SphereGeometry(5, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: "#1a1a2e",
      roughness: 0.8,
      metalness: 0.2,
      emissive: "#0a0a1f",
      emissiveIntensity: 0.5,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planet);

    // Atmosphere Glow
    const atmosphereGeometry = new THREE.SphereGeometry(5.2, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: "#C41BFD",
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planetGroup.add(atmosphere);

    // Subtle Night Lights/Glow
    const wireframePlanet = new THREE.Mesh(
      new THREE.SphereGeometry(5.05, 32, 32),
      new THREE.MeshBasicMaterial({
        color: "#C41BFD",
        wireframe: true,
        transparent: true,
        opacity: 0.05,
      })
    );
    planetGroup.add(wireframePlanet);

    scene.add(planetGroup);
    planetGroup.position.set(0, 0, 0);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 10, 10);
    scene.add(sunLight);

    const purpleGlow = new THREE.PointLight("#C41BFD", 2, 50);
    purpleGlow.position.set(-10, -5, 5);
    scene.add(purpleGlow);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);

      // Constant rotations
      stars.rotation.y += 0.0001;
      planetGroup.rotation.y += 0.0005;
      wireframePlanet.rotation.y -= 0.0002;

      // Update from scroll
      camera.position.z = cameraZ.get();
      scene.rotation.y = sceneRotation.get();
      planetGroup.scale.setScalar(planetOpacity.get());
      planetMaterial.opacity = planetOpacity.get();
      atmosphereMaterial.opacity = planetOpacity.get() * 0.15;

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
