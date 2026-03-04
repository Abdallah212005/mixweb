"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ===== SCENE =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // ===== LIGHT =====
    // White sun light
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(10, 5, 5);
    scene.add(sun);

    // Purple rim light from the back
    const purpleLight = new THREE.DirectionalLight(0x7c3aed, 1);
    purpleLight.position.set(-10, -5, -5);
    scene.add(purpleLight);

    // Ambient fill
    scene.add(new THREE.AmbientLight(0x222222));

    // ===== EARTH =====
    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
    );

    const earthGeometry = new THREE.SphereGeometry(6, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 1,
      metalness: 0,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // ===== SYMBOL SPRITES =====
    function createSymbol(text: string) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.Group();

      canvas.width = 128;
      canvas.height = 128;

      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(text, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.8, 0.8, 0.8);
      return sprite;
    }

    // ===== ORBIT RINGS =====
    const symbols = ["{ }", "< />", "#", ";", "()"];

    function createRing(radius: number, count: number, tiltX: number, tiltZ: number) {
      const group = new THREE.Group();

      for (let i = 0; i < count; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const sprite = createSymbol(symbol) as THREE.Sprite;

        const angle = (i / count) * Math.PI * 2;
        sprite.position.x = Math.cos(angle) * radius;
        sprite.position.z = Math.sin(angle) * radius;
        sprite.position.y = 0;

        group.add(sprite);
      }

      group.rotation.x = tiltX;
      group.rotation.z = tiltZ;
      scene.add(group);
      return group;
    }

    const ring1 = createRing(9, 40, 0.2, 0);
    const ring2 = createRing(11, 50, -0.4, 0.3);
    const ring3 = createRing(13, 60, 0.6, -0.2);

    // ===== ANIMATION =====
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      earth.rotation.y += 0.002;

      ring1.rotation.y += 0.002;
      ring2.rotation.y -= 0.0015;
      ring3.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // ===== RESIZE =====
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
