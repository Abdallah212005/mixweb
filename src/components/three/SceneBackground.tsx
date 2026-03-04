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
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(10, 5, 5);
    scene.add(sun);

    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    // ===== EARTH =====
    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
    );

    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 1,
      metalness: 0,
    });

    // Purple color grading via Shader injection
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.5, 0.2, 0.7), 0.25);
        #include <dithering_fragment>
        `
      );
    };

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // ===== CODE SYMBOL SPRITES =====
    function createTextSprite(text: string, color: string = "#ffffff") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.Group();

      canvas.width = 256;
      canvas.height = 256;

      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, 256, 256);

      ctx.font = "bold 120px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(text, 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });

      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.5, 1.5, 1.5);
      return sprite;
    }

    const symbols = ["{ }", "< />", "#", ";", "()", "Ps", "Ai", "Ae", "Pr"];
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    for (let i = 0; i < 40; i++) {
      const text = symbols[Math.floor(Math.random() * symbols.length)];
      const color = text.length <= 2 ? "#a855f7" : "#ffffff";
      const sprite = createTextSprite(text, color) as THREE.Sprite;

      const radius = 9 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      sprite.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      orbitGroup.add(sprite);
    }

    // ===== ANIMATION =====
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      earth.rotation.y += 0.002;
      orbitGroup.rotation.y += 0.001;
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
