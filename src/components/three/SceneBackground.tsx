
"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Transformation values based on scroll
  const cameraZ = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [5, 2, -5, -15]);
  const rotationY = useTransform(scrollYProgress, [0, 1], [0, Math.PI]);
  const particleScale = useTransform(scrollYProgress, [0, 0.1, 0.4, 1], [0.1, 1, 1.2, 0.5]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Particle System
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color("#C41BFD");

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Grid / Network Structures (Scene 2)
    const gridCount = 3;
    const grids: THREE.Group[] = [];
    for (let i = 0; i < gridCount; i++) {
      const group = new THREE.Group();
      const geometry = new THREE.IcosahedronGeometry(3 + i * 2, 1);
      const wireframe = new THREE.WireframeGeometry(geometry);
      const line = new THREE.LineSegments(wireframe);
      line.material = new THREE.LineBasicMaterial({
        color: "#A38AFF",
        transparent: true,
        opacity: 0.1,
      });
      group.add(line);
      group.position.z = -10 - i * 10;
      grids.push(group);
      scene.add(group);
    }

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      // Manual animation updates
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      grids.forEach((grid, idx) => {
        grid.rotation.y += 0.002 * (idx + 1);
        grid.rotation.x += 0.001 * (idx + 1);
      });

      // Update from scroll transforms
      camera.position.z = cameraZ.get();
      particles.rotation.y = rotationY.get();
      particles.scale.setScalar(particleScale.get());

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
  }, [cameraZ, rotationY, particleScale]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
