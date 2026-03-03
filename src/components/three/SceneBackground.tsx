
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

  // Cinematic Slow Entry Logic
  // 0.0 - 0.6: Space/Earth Orbit (Slow)
  // 0.6 - 0.75: Atmosphere Entry (Infiltration)
  // 0.75 - 0.95: Manhattan Glide (City View)
  // 0.95 - 1.0: Final Landing
  
  const cameraZ = useTransform(scrollYProgress, [0, 0.6, 0.75, 0.9, 1], [35, 12, 4, 1.2, 0.8]);
  const cameraY = useTransform(scrollYProgress, [0, 0.6, 0.75, 0.9, 1], [8, 3, 0.8, 0.1, -0.5]);
  const cameraX = useTransform(scrollYProgress, [0.75, 0.9, 1], [0, 1.5, 0]); 
  
  const planetOpacity = useTransform(scrollYProgress, [0.65, 0.8], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.8], [1, 8]);
  const cityOpacity = useTransform(scrollYProgress, [0.7, 0.82], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.7, 0.95], [600, 0]);
  const starOpacity = useTransform(scrollYProgress, [0.5, 0.8], [1, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020205");
    scene.fog = new THREE.FogExp2("#0a0015", 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    containerRef.current.appendChild(renderer.domElement);

    // POST PROCESSING (BLOOM)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.1);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 1. STARFIELD
    const starCount = 5000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 5000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 5000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 5000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.5, color: "#C41BFD", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 2. REALISTIC EARTH
    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");
    const roughness = loader.load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(4.5, 256, 256);
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 0.05,
      roughnessMap: roughness,
      roughness: 0.9,
      transparent: true
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
          vec3 oceanColor = vec3(0.08, 0.08, 0.1); 
          vec3 purpleTint = vec3(0.55, 0.1, 0.8); 
          vec3 landColor = mix(texelColor.rgb, purpleTint, 0.6);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor, uOpacity);
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // ATMOSPHERE GLOW
    const atmoGeo = new THREE.SphereGeometry(4.65, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#C41BFD") }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); intensity = pow( 0.6 - dot(vNormal, vec3(0,0,1)), 4.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // 3. MANHATTAN CITY (CINEMATIC)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const buildingMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a22, 
      metalness: 0.7, 
      roughness: 0.3,
      transparent: true 
    });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const createBuilding = (x: number, z: number, height: number) => {
      const width = 30 + Math.random() * 20;
      const depth = 30 + Math.random() * 20;

      const b = new THREE.Mesh(boxGeo, buildingMat);
      b.scale.set(width, height, depth);
      b.position.set(x, height / 2 - 100, z);
      cityGroup.add(b);

      // Windows (Mix Aura Colors)
      const rows = Math.floor(height / 10);
      const cols = Math.floor(width / 8);
      
      const winCount = rows * cols;
      if (winCount > 100) return; // Performance cap

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (Math.random() > 0.4) {
            const win = new THREE.Mesh(
              new THREE.PlaneGeometry(3, 4),
              new THREE.MeshBasicMaterial({
                color: Math.random() > 0.7 ? 0xffc48c : 0x9D00FF,
                transparent: true,
                opacity: Math.random() * 0.4 + 0.3
              })
            );
            win.position.set(
              x - width / 2 + j * 8 + 4,
              i * 10 - 100 + 5,
              z + depth / 2 + 0.5
            );
            cityGroup.add(win);
          }
        }
      }
    };

    // Manhattan Grid
    for (let i = -1000; i <= 1000; i += 200) {
      for (let j = -400; j <= 800; j += 200) {
        const d = Math.sqrt(i * i + j * j);
        const h = 150 + (1000 - d) / 3 + Math.random() * 150;
        createBuilding(i, j, h);
      }
    }

    // Iconic Tower
    createBuilding(0, 200, 800);

    // Water & Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000),
      new THREE.MeshStandardMaterial({ color: 0x0a0a12, transparent: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -100.5;
    cityGroup.add(ground);

    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 600),
      new THREE.MeshStandardMaterial({ color: 0x111118, metalness: 0.6, roughness: 0.2, transparent: true })
    );
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -100, -300);
    cityGroup.add(river);

    // LIGHTING
    scene.add(new THREE.AmbientLight(0x221533, 1.1));
    const purpleWash = new THREE.DirectionalLight(0x9D00FF, 2.8);
    purpleWash.position.set(400, 700, -200);
    scene.add(purpleWash);

    const animate = () => {
      requestAnimationFrame(animate);
      
      const p = scrollYProgress.get();
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      camera.lookAt(0, (p < 0.6) ? 0 : -0.5, 0);

      planetGroup.rotation.y += 0.0002;
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
