
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

  // Cinematic Camera Path - Focused on the scale shift
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [35, 12, 5, 1.8, 1.2]);
  const cameraY = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [8, 3, 1.2, 0.2, 0.1]);
  const cameraX = useTransform(scrollYProgress, [0.7, 0.85, 1], [0, 1.5, 0]); 
  
  const planetOpacity = useTransform(scrollYProgress, [0.55, 0.75], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.75], [1, 8]);
  const cityOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.6, 0.9], [300, 0]);
  const starOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0.8, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#010103"); // Deep Matte Black
    scene.fog = new THREE.FogExp2("#020105", 0.015); // Very subtle fog for depth

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9; // Lower exposure for high contrast
    containerRef.current.appendChild(renderer.domElement);

    // POST PROCESSING (Controlled Bloom for "Neon Stings")
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.2, 0.1);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 1. STARFIELD (Very Dim)
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 3000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.0, color: "#331166", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 2. TEXTURED PLANET (Larger & Faster)
    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(6.5, 128, 128); // Increased size from 4.5 to 6.5
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 0.1,
      transparent: true,
      roughness: 0.9,
      metalness: 0.05
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
          vec3 oceanColor = vec3(0.02, 0.02, 0.03); // Deep Gray Oceans
          vec3 purpleTint = vec3(0.5, 0.1, 0.8); // Neon Purple Land
          vec3 landColor = mix(texelColor.rgb, purpleTint, 0.7);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor, uOpacity);
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Atmosphere Glow (Proportional to planet)
    const atmoGeo = new THREE.SphereGeometry(6.7, 64, 64); // Scaled with planet
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#7000FF") }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); intensity = pow( 0.6 - dot(vNormal, vec3(0,0,1)), 6.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // 3. MANHATTAN (High Contrast Neon)
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
      const width = 20 + Math.random() * 25;
      const depth = 20 + Math.random() * 25;
      const b = new THREE.Mesh(boxGeo, buildingMat);
      b.scale.set(width, height, depth);
      b.position.set(x, height / 2 - 100, z);
      cityGroup.add(b);

      // Windows (High Contrast Neon Purple)
      if (height > 120) {
        const rows = Math.min(Math.floor(height / 15), 12);
        const cols = 2;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (Math.random() > 0.5) {
              const win = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 4),
                new THREE.MeshBasicMaterial({
                  color: Math.random() > 0.8 ? 0xffaa66 : 0xC41BFD,
                  transparent: true,
                  opacity: 0.5
                })
              );
              win.position.set(x - width / 2 + j * 12 + 6, i * 15 - 100 + 20, z + depth / 2 + 0.1);
              cityGroup.add(win);
            }
          }
        }
      }
    };

    for (let i = -800; i <= 800; i += 150) {
      for (let j = -400; j <= 800; j += 150) {
        const d = Math.sqrt(i * i + j * j);
        const h = 150 + (800 - d) / 2.5 + Math.random() * 150;
        createBuilding(i, j, h);
      }
    }

    // GROUND
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(4000, 4000),
      new THREE.MeshStandardMaterial({ color: 0x010103, transparent: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -100.5;
    cityGroup.add(ground);

    // LIGHTING
    scene.add(new THREE.AmbientLight(0x05050a, 0.3));
    const purpleWash = new THREE.DirectionalLight(0x7000FF, 1.2);
    purpleWash.position.set(300, 600, -200);
    scene.add(purpleWash);

    const animate = () => {
      requestAnimationFrame(animate);
      const p = scrollYProgress.get();
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      camera.lookAt(0, (p < 0.5) ? 0 : -0.15, (p > 0.6) ? 0.2 : 0);

      planetGroup.rotation.y += 0.0004; // Increased rotation speed from 0.0001
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
