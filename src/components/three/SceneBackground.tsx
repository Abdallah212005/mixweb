
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const cameraZ = useTransform(scrollYProgress, [0, 0.35, 0.65, 0.85, 1], [35, 12, 5, 2.2, 1.8]);
  const cameraY = useTransform(scrollYProgress, [0, 0.35, 0.65, 0.85, 1], [8, 3, 1.2, 0.3, 0.2]);
  const cameraX = useTransform(scrollYProgress, [0.7, 0.85, 1], [0, 1.2, 0]); 
  
  const planetOpacity = useTransform(scrollYProgress, [0.5, 0.75], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.75], [1.8, 11.5]);
  const cityOpacity = useTransform(scrollYProgress, [0.6, 0.85], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.65, 0.95], [350, 0]);
  const starOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0.8, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#010103");
    scene.fog = new THREE.FogExp2("#010105", 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; 
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.85);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Stars
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 5000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 5000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 5000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.2, color: "#7744FF", transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Planet Textures
    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");
    const roughness = loader.load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(6.5, 256, 256);
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 0.8, 
      roughnessMap: roughness,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      emissive: new THREE.Color("#4400aa"),
      emissiveIntensity: 0.2 // تقليل الـ Emissive عشان يظهر الليل
    });

    planetMat.onBeforeCompile = (shader) => {
      shader.uniforms.uOpacity = { value: 1.0 };
      shader.fragmentShader = `uniform float uOpacity;\n${shader.fragmentShader}`;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 texelColor = texture2D( map, vMapUv );
          float oceanMask = smoothstep(0.0, 0.35, texelColor.b - texelColor.r);
          vec3 oceanColor = vec3(0.01, 0.01, 0.03);
          vec3 purpleTint = vec3(0.55, 0.1, 0.8);
          vec3 landColor = mix(texelColor.rgb * 1.5, purpleTint, 0.6);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor, uOpacity);
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Atmosphere Glow (Crescent Effect)
    const atmoGeo = new THREE.SphereGeometry(6.7, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { 
        glowColor: { value: new THREE.Color("#6600ff") }, 
        uOpacity: { value: 1.0 },
        sunPosition: { value: new THREE.Vector3(20, 10, 20).normalize() }
      },
      vertexShader: `
        varying float vIntensity;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize( normalMatrix * normal );
          vIntensity = pow( 0.7 - dot(vNormal, vec3(0,0,1)), 6.0 );
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
          // هلال يتبع الشمس
          float sunDot = max(0.0, dot(vNormal, sunPosition));
          float atmosphere = vIntensity * uOpacity * (sunDot + 0.1);
          gl_FragColor = vec4( glowColor, atmosphere * 1.5 );
        }
      `,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // City Group (Foreground)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const buildingMat = new THREE.MeshStandardMaterial({ 
      color: 0x050508, 
      metalness: 0.9, 
      roughness: 0.1,
      transparent: true 
    });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const createBuilding = (x: number, z: number, height: number) => {
      const width = 20 + Math.random() * 35;
      const depth = 20 + Math.random() * 35;
      const b = new THREE.Mesh(boxGeo, buildingMat);
      b.scale.set(width, height, depth);
      b.position.set(x, height / 2 - 120, z);
      cityGroup.add(b);
    };

    for (let i = -1200; i <= 1200; i += 200) {
      for (let j = -1200; j <= 1200; j += 200) {
        const d = Math.sqrt(i * i + j * j);
        const h = 150 + (1200 - d) / 2.5 + Math.random() * 250;
        createBuilding(i, j, h);
      }
    }

    // Lights
    scene.add(new THREE.AmbientLight(0x050510, 0.1)); // تقليل الضوء المحيطي جداً لإظهار الليل
    
    // الشمس - ضوء جانبي قوي لخلق ليل ونهار
    const sun = new THREE.DirectionalLight(0xffffff, 3.5);
    sun.position.set(20, 10, 20);
    scene.add(sun);

    const purpleFill = new THREE.PointLight(0x6600ff, 1.0, 50);
    purpleFill.position.set(-20, 10, -20);
    scene.add(purpleFill);

    const animate = () => {
      requestAnimationFrame(animate);
      const p = scrollYProgress.get();
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      camera.lookAt(0, (p < 0.6) ? 0 : -0.2, (p > 0.7) ? 0.4 : 0);

      planetGroup.rotation.y += 0.0012;
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
  }, [cameraZ, cameraY, cameraX, planetOpacity, planetScale, cityOpacity, cityY, starOpacity, scrollYProgress]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
