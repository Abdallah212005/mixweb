
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    if (!containerRef.current) return;

    // ================= SCENE =================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // ================= LIGHTING (High Reality) =================
    // Sun light from the side
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 5, 5);
    scene.add(sunLight);

    // Subtle ambient light for dark side visibility
    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    // ================= REAL EARTH =================
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
    );

    const planetGeo = new THREE.SphereGeometry(5, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 1,
      metalness: 0,
    });

    const planet = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planet);

    // ================= DUST PARTICLES (Magnetic Interaction) =================
    const count = 1500;
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const basePositions: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      const r = 7 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      basePositions.push(new THREE.Vector3(x, y, z));
    }

    dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ================= MOUSE =================
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ================= ANIMATION =================
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      planet.rotation.y += 0.002;
      dust.rotation.y += 0.0005;

      const posAttribute = dustGeo.attributes.position;
      const positionsArray = posAttribute.array as Float32Array;

      // Approximate 3D point from mouse
      const mouse3D = new THREE.Vector3(
        mouse.current.x * 10,
        mouse.current.y * 7,
        0
      );

      for (let i = 0; i < count; i++) {
        const index = i * 3;
        const base = basePositions[i];
        
        const currentPos = new THREE.Vector3(
          positionsArray[index],
          positionsArray[index + 1],
          positionsArray[index + 2]
        );

        const dist = currentPos.distanceTo(mouse3D);

        if (dist < 4) {
          // Magnetic pull
          currentPos.lerp(mouse3D, 0.04);
        } else {
          // Gentle return
          currentPos.lerp(base, 0.015);
        }

        positionsArray[index] = currentPos.x;
        positionsArray[index + 1] = currentPos.y;
        positionsArray[index + 2] = currentPos.z;
      }

      posAttribute.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // ================= RESIZE =================
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
