
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 15,
    damping: 40,
    restDelta: 0.001
  });

  const cameraZ = useTransform(smoothProgress, [0, 0.35, 0.65, 0.85, 1], [40, 15, 6, 2.5, 2.0]);
  const cameraY = useTransform(smoothProgress, [0, 0.35, 0.65, 0.85, 1], [10, 4, 1.5, 0.5, 0.3]);
  const cameraX = useTransform(smoothProgress, [0.7, 0.85, 1], [0, 1.5, 0]); 
  
  const planetOpacity = useTransform(smoothProgress, [0.5, 0.75], [1, 0]);
  const planetScale = useTransform(smoothProgress, [0, 0.75], [1.8, 12]);
  const cityOpacity = useTransform(smoothProgress, [0.6, 0.85], [0, 1]);
  const cityY = useTransform(smoothProgress, [0.65, 0.95], [400, 0]);
  const starOpacity = useTransform(smoothProgress, [0.3, 0.7], [1, 0.2]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    scene.fog = new THREE.FogExp2("#000000", 0.008);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 15000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4; 
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.5, 0.6, 0.2);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const starCount = 8000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 10000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 10000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 10000;
      
      const mixedColor = new THREE.Color().setHSL(0.75 + Math.random() * 0.1, 1.0, 0.8);
      starColors[i * 3] = mixedColor.r;
      starColors[i * 3 + 1] = mixedColor.g;
      starColors[i * 3 + 2] = mixedColor.b;
    }
    
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({ 
      size: 2.0, 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.9, 
      blending: THREE.AdditiveBlending 
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const planetGroup = new THREE.Group();
    // Ultra-smooth sphere for the stone shader
    const planetGeo = new THREE.SphereGeometry(6.5, 256, 256);
    
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true
    });

    planetMat.onBeforeCompile = (shader) => {
      shader.uniforms.uOpacity = { value: 1.0 };
      shader.fragmentShader = `uniform float uOpacity;\n${shader.fragmentShader}`;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        vec3 purple1 = vec3(0.3, 0.0, 0.6);
        vec3 purple2 = vec3(0.6, 0.0, 1.0);
        vec3 dark = vec3(0.08, 0.0, 0.15);

        // Procedural Stone Noise logic from Purple Stone Planet
        float noise = fract(sin(dot(vNormal.xy ,vec2(12.9898,78.233))) * 43758.5453);

        // Smoothly blend shades based on noise and normal Y-axis (poles)
        vec3 finalColor = mix(purple1, purple2, noise);
        finalColor = mix(dark, finalColor, abs(vNormal.y));
        
        diffuseColor.rgb = finalColor;
        diffuseColor.a *= uOpacity;
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Dynamic Rim Glow Atmosphere
    const atmoGeo = new THREE.SphereGeometry(6.7, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { 
        glowColor: { value: new THREE.Color("#9D00FF") }, 
        uOpacity: { value: 1.0 }
      },
      vertexShader: `
        varying float vIntensity;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize( normalMatrix * normal );
          vIntensity = pow( 0.7 - dot(vNormal, vec3(0,0,1.0)), 5.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float uOpacity;
        varying float vIntensity;
        varying vec3 vNormal;
        void main() {
          float directionalGlow = max(0.2, dot(vNormal, vec3(1.0, 0.5, 1.0)));
          gl_FragColor = vec4( glowColor, vIntensity * uOpacity * directionalGlow * 3.0 );
        }
      `,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    const cityGroup = new THREE.Group();
    scene.add(cityGroup);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x05050a, metalness: 0.9, roughness: 0.1, transparent: true });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    for (let i = -1500; i <= 1500; i += 250) {
      for (let j = -1500; j <= 1500; j += 250) {
        const d = Math.sqrt(i * i + j * j);
        const h = 200 + (1500 - d) / 2 + Math.random() * 300;
        const b = new THREE.Mesh(boxGeo, buildingMat);
        b.scale.set(30 + Math.random() * 40, h, 30 + Math.random() * 40);
        b.position.set(i, h / 2 - 150, j);
        cityGroup.add(b);
      }
    }

    // --- UPDATED CINEMATIC LIGHTING (FROM PURPLE STONE PLANET) ---
    const sunLight = new THREE.DirectionalLight(0xffffff, 3);
    sunLight.position.set(400, 150, 200); 
    scene.add(sunLight);

    const subtleFill = new THREE.AmbientLight(0x220033, 0.6); 
    scene.add(subtleFill);

    const animate = () => {
      requestAnimationFrame(animate);
      
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      const p = smoothProgress.get();
      camera.lookAt(0, (p < 0.6) ? 0 : -0.25, (p > 0.75) ? 0.5 : 0);

      planetGroup.rotation.y += 0.002;
      planetGroup.scale.set(planetScale.get(), planetScale.get(), planetScale.get());
      
      if (planetMat.userData.shader) {
        planetMat.userData.shader.uniforms.uOpacity.value = planetOpacity.get();
      }
      atmoMat.uniforms.uOpacity.value = planetOpacity.get();
      
      cityGroup.position.y = cityY.get();
      buildingMat.opacity = cityOpacity.get();
      starMaterial.opacity = starOpacity.get();

      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
    };
  }, [cameraZ, cameraY, cameraX, planetOpacity, planetScale, cityOpacity, cityY, starOpacity, smoothProgress]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
