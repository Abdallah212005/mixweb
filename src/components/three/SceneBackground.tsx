
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
    camera.position.z = 20;

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

    scene.add(new THREE.AmbientLight(0x222222));

    // ===== PURPLE PLANET =====
    const loader = new THREE.TextureLoader();
    const bumpMap = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_bump_2048.jpg"
    );

    const planetMaterial = new THREE.MeshStandardMaterial({
      color: 0x5b2d91,
      roughness: 0.9,
      metalness: 0.05,
      bumpMap: bumpMap,
      bumpScale: 0.4,
    });

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(6, 128, 128),
      planetMaterial
    );
    scene.add(planet);

    // ===== ORBIT RING PATH FUNCTION =====
    function createOrbit(radius: number, tiltX: number, tiltZ: number) {
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
      );

      const points = curve.getPoints(200);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );

      const material = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.15,
      });

      const orbitLine = new THREE.LineLoop(geometry, material);
      orbitLine.rotation.x = tiltX;
      orbitLine.rotation.z = tiltZ;

      scene.add(orbitLine);
      return { curve, orbitLine };
    }

    const orbit1 = createOrbit(10, 0.4, 0);
    const orbit2 = createOrbit(13, -0.5, 0.3);

    // ===== MOVING SYMBOLS =====
    const symbols = ["{ }", "< />", "#", ";", "()"];

    function createSymbol(text: string) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.Sprite();

      canvas.width = 128;
      canvas.height = 128;

      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(text, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(1, 1, 1);
      return sprite;
    }

    interface MovingObject {
      sprite: THREE.Sprite;
      orbit: { curve: THREE.EllipseCurve; orbitLine: THREE.LineLoop };
      offset: number;
    }

    const movingObjects: MovingObject[] = [];

    function addMovingSymbols(orbit: any, count: number) {
      for (let i = 0; i < count; i++) {
        const sprite = createSymbol(
          symbols[Math.floor(Math.random() * symbols.length)]
        );
        scene.add(sprite);
        movingObjects.push({
          sprite: sprite,
          orbit: orbit,
          offset: Math.random(),
        });
      }
    }

    addMovingSymbols(orbit1, 15);
    addMovingSymbols(orbit2, 20);

    // ===== ANIMATION =====
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      planet.rotation.y += 0.002;

      movingObjects.forEach(obj => {
        obj.offset += 0.0008;
        const t = obj.offset % 1;
        const point = obj.orbit.curve.getPointAt(t);
        const pos = new THREE.Vector3(point.x, 0, point.y);

        // Apply orbit tilt rotations
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), obj.orbit.orbitLine.rotation.x);
        pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), obj.orbit.orbitLine.rotation.z);

        obj.sprite.position.copy(pos);
      });

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
