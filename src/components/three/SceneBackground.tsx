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
    scene.fog = new THREE.FogExp2(0x0a0015, 0.03);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // ================= LIGHT =================
    const light = new THREE.PointLight(0xaa55ff, 3, 200);
    light.position.set(20, 20, 20);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x220044);
    scene.add(ambient);

    // ================= PLANET =================
    const planetGeo = new THREE.SphereGeometry(6, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x6d28d9,
      emissive: 0x4c1d95,
      roughness: 0.5,
      metalness: 0.6,
    });

    const planet = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planet);

    // ================= PARTICLES =================
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 10 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions.push(new THREE.Vector3(x, y, z));
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ================= MOUSE =================
    const raycaster = new THREE.Raycaster();

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

      // Project mouse to 3D space
      const mouse3D = new THREE.Vector3(mouse.current.x, mouse.current.y, 0.5);
      mouse3D.unproject(camera);
      // Determine the direction from camera to mouse3D to find where it hits the plane at z=0
      const dir = mouse3D.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const posAtZ0 = camera.position.clone().add(dir.multiplyScalar(distance));

      const posAttribute = particleGeo.attributes.position;
      const positionsArray = posAttribute.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        const original = originalPositions[i];

        const currentPos = new THREE.Vector3(
          positionsArray[index],
          positionsArray[index + 1],
          positionsArray[index + 2]
        );

        const distToMouse = currentPos.distanceTo(posAtZ0);

        if (distToMouse < 6) {
          // Magnetic pull
          currentPos.lerp(posAtZ0, 0.08);
        } else {
          // Return to orbit
          currentPos.lerp(original, 0.03);
        }

        positionsArray[index] = currentPos.x;
        positionsArray[index + 1] = currentPos.y;
        positionsArray[index + 2] = currentPos.z;
      }

      posAttribute.needsUpdate = true;

      // Cinematic camera movement
      camera.position.x = Math.sin(Date.now() * 0.0003) * 2;
      camera.lookAt(scene.position);

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

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-[#050010]" />;
};
