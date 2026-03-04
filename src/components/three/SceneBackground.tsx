
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
    
    // 🎬 Dark Cinematic Tone Mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.75;
    
    containerRef.current.appendChild(renderer.domElement);

    // ===== LIGHTING =====
    // Purple Sun (Main Light)
    const purpleSun = new THREE.DirectionalLight(0xa855f7, 3.0);
    purpleSun.position.set(8, 4, 6);
    scene.add(purpleSun);

    // Purple Rim Light
    const purpleRim = new THREE.DirectionalLight(0x7c3aed, 1.8);
    purpleRim.position.set(-10, -5, -6);
    scene.add(purpleRim);

    // Deep Ambient Light
    const ambient = new THREE.AmbientLight(0x050505);
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
      bumpScale: 0.7,
      roughness: 0.95,
      metalness: 0.02,
    });

    // 🎨 Custom Shader: Separate Oceans and Land
    planetMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        vec3 color = gl_FragColor.rgb;

        // Mask oceans based on blue channel dominance
        float oceanMask = smoothstep(0.15, 0.35, color.b - color.r);

        // Define colors
        vec3 darkOcean = vec3(0.12, 0.12, 0.14);
        vec3 purpleLand = vec3(0.35, 0.08, 0.55);

        // Mix based on mask
        vec3 finalColor = mix(purpleLand, darkOcean, oceanMask);

        // Apply deeper contrast
        finalColor = pow(finalColor, vec3(1.15));

        gl_FragColor.rgb = finalColor;

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
          float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.8, 0.3, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(7.5, 128, 128),
      atmosphereMaterial
    );
    scene.add(atmosphere);

    // ===== ANIMATION =====
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      planet.rotation.y += 0.0015;
      atmosphere.rotation.y += 0.0015;
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
