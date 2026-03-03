
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

  // Smooth out the scroll progress for a cinematic "weighted" feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 25, // Lower stiffness for slower, more cinematic reaction
    damping: 40,   // High damping to prevent oscillations
    restDelta: 0.001
  });

  // Cinematic Camera Path Transforms using smoothProgress
  const cameraZ = useTransform(smoothProgress, [0, 0.35, 0.65, 0.85, 1], [40, 15, 6, 2.5, 2.0]);
  const cameraY = useTransform(smoothProgress, [0, 0.35, 0.65, 0.85, 1], [10, 4, 1.5, 0.5, 0.3]);
  const cameraX = useTransform(smoothProgress, [0.7, 0.85, 1], [0, 1.5, 0]); 
  
  const planetOpacity = useTransform(smoothProgress, [0.5, 0.75], [1, 0]);
  const planetScale = useTransform(smoothProgress, [0, 0.75], [1.8, 12]);
  const cityOpacity = useTransform(smoothProgress, [0.6, 0.85], [0, 1]);
  const cityY = useTransform(smoothProgress, [0.65, 0.95], [400, 0]);
  const starOpacity = useTransform(smoothProgress, [0.3, 0.7], [1, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#010103");
    scene.fog = new THREE.FogExp2("#010105", 0.008);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 15000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; 
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // ✨ Vast Starfield - 8000 Stars
    const starCount = 8000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 10000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 10000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 10000;
      
      const mixedColor = new THREE.Color().setHSL(Math.random() * 0.1 + 0.65, 0.9, 0.9);
      starColors[i * 3] = mixedColor.r;
      starColors[i * 3 + 1] = mixedColor.g;
      starColors[i * 3 + 2] = mixedColor.b;
    }
    
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({ 
      size: 1.8, 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.9, 
      blending: THREE.AdditiveBlending 
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 🌍 Advanced Planet (Secret Shader with Sharp Details)
    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");
    const roughness = loader.load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(6.5, 256, 256);
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 1.2, // Enhanced bump for high detail
      roughnessMap: roughness,
      roughness: 0.85,
      metalness: 0.4,
      transparent: true,
      emissive: new THREE.Color("#220055"),
      emissiveIntensity: 0.15
    });

    planetMat.onBeforeCompile = (shader) => {
      shader.uniforms.uOpacity = { value: 1.0 };
      shader.fragmentShader = `uniform float uOpacity;\n${shader.fragmentShader}`;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 texelColor = texture2D( map, vMapUv );
          // Separate water from land using blue vs red channel diff
          float oceanMask = smoothstep(0.0, 0.35, texelColor.b - texelColor.r);
          // Dark charcoal ocean
          vec3 oceanColor = vec3(0.05, 0.05, 0.08);
          // Neon Purple Land with detail retention
          vec3 purpleTint = vec3(0.5, 0.05, 0.9);
          vec3 landColor = mix(texelColor.rgb * 1.8, purpleTint, 0.7);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor, uOpacity);
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Atmospheric Glow (Crescent Effect)
    const atmoGeo = new THREE.SphereGeometry(6.75, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { 
        glowColor: { value: new THREE.Color("#7700ff") }, 
        uOpacity: { value: 1.0 },
        sunPosition: { value: new THREE.Vector3(50, 20, 50).normalize() }
      },
      vertexShader: `
        varying float vIntensity;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize( normalMatrix * normal );
          vIntensity = pow( 0.7 - dot(vNormal, vec3(0,0,1)), 5.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float uOpacity;
        uniform vec3 sunPosition;
        varying float vIntensity;
        varying vec3 vNormal;
        void main() {
          float sunDot = max(0.0, dot(vNormal, sunPosition));
          float atmosphere = vIntensity * uOpacity * (sunDot + 0.1);
          gl_FragColor = vec4( glowColor, atmosphere * 2.0 );
        }
      `,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // City Structures
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x06060c, metalness: 0.95, roughness: 0.05, transparent: true });
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

    // ☀️ Cinematic Lighting (Dramatic Day/Night Division)
    scene.add(new THREE.AmbientLight(0x050510, 0.05)); // Very low ambient for deep shadows
    const sun = new THREE.DirectionalLight(0xffffff, 5.0);
    sun.position.set(50, 20, 50); // Side lighting for clear terminator line
    scene.add(sun);

    const purpleAccent = new THREE.PointLight(0x7700ff, 2.0, 100);
    purpleAccent.position.set(-40, 20, -40); // Soft purple fill for dark side
    scene.add(purpleAccent);

    const animate = () => {
      requestAnimationFrame(animate);
      
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      const p = smoothProgress.get();
      camera.lookAt(0, (p < 0.6) ? 0 : -0.25, (p > 0.75) ? 0.5 : 0);

      planetGroup.rotation.y += 0.001;
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
