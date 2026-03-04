
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ===== SCENE & CAMERA =====
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Cinematic Tone Mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    
    containerRef.current.appendChild(renderer.domElement);

    // ===== LIGHTING =====
    // Sun Light
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(8, 4, 6);
    scene.add(sun);

    // Purple Rim
    const purpleRim = new THREE.DirectionalLight(0x7c3aed, 1.4);
    purpleRim.position.set(-10, -3, -6);
    scene.add(purpleRim);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(0, 0, 10);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0x111111);
    scene.add(ambient);

    // ===== TEXTURES =====
    const loader = new THREE.TextureLoader();
    const earthMap = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
    );
    const bumpMap = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_bump_2048.jpg"
    );

    // ===== PLANET MATERIAL =====
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: earthMap,
      bumpMap: bumpMap,
      bumpScale: 0.5,
      roughness: 0.85,
      metalness: 0.05,
    });

    planetMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        float brightness = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));

        // Contrast boost
        gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.92));

        // Subtle purple in shadows
        vec3 purple = vec3(0.4, 0.15, 0.65);
        gl_FragColor.rgb += purple * (1.0 - brightness) * 0.18;

        #include <dithering_fragment>
        `
      );
    };

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(7, 128, 128),
      planetMaterial
    );
    scene.add(planet);

    // ===== ATMOSPHERE GLOW =====
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.6, 0.2, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(7.3, 128, 128),
      atmosphereMaterial
    );
    scene.add(atmosphere);

    // ===== ANIMATION =====
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      planet.rotation.y += 0.002;
      atmosphere.rotation.y += 0.002;
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
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planetMaterial.dispose();
      atmosphereMaterial.dispose();
      planet.geometry.dispose();
      atmosphere.geometry.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
