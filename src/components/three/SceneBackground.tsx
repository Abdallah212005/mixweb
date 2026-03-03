
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

  // Cinematic Slow Entry (Slower than before)
  // Space stage: 0 - 0.55 (Very slow orbit)
  // Atmospheric Entry: 0.55 - 0.75 (Smooth glide)
  // Manhattan Infiltration: 0.75 - 1.0 (City depth)
  
  const cameraZ = useTransform(scrollYProgress, [0, 0.55, 0.75, 0.88, 1], [22, 12, 4.5, 2.2, 1.5]);
  const cameraY = useTransform(scrollYProgress, [0, 0.55, 0.75, 0.88, 1], [4, 2, 0.5, -0.2, -1.2]);
  const cameraX = useTransform(scrollYProgress, [0.75, 0.9, 1], [0, 2.5, 0]); 
  
  const planetOpacity = useTransform(scrollYProgress, [0.6, 0.8], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.8], [1, 6]);
  const cityOpacity = useTransform(scrollYProgress, [0.65, 0.8], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.65, 0.95], [500, 0]);
  const starOpacity = useTransform(scrollYProgress, [0.5, 0.75], [1, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020205");
    scene.fog = new THREE.FogExp2("#0a0015", 0.012);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    containerRef.current.appendChild(renderer.domElement);

    // POST PROCESSING
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.5, 0.1);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 1. Cinematic Starfield
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 4000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.0, color: "#9D00FF", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 2. Realistic Earth (Shader from User Code)
    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");
    const roughness = loader.load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(4.5, 128, 128);
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 0.1,
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
          vec3 oceanColor = vec3(0.06, 0.06, 0.08); 
          vec3 purpleTint = vec3(0.6, 0.1, 0.9); 
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

    // Atmos Glow
    const atmoGeo = new THREE.SphereGeometry(4.65, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#9D00FF") }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); intensity = pow( 0.6 - dot(vNormal, vec3(0,0,1)), 4.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // 3. Manhattan City (User Layout Spacing: 250)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const groundMat = new THREE.MeshStandardMaterial({ color: 0x080812, roughness: 1, transparent: true });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -50;
    cityGroup.add(ground);

    const riverMat = new THREE.MeshStandardMaterial({ color: 0x050510, metalness: 0.8, roughness: 0.1, transparent: true });
    const river = new THREE.Mesh(new THREE.PlaneGeometry(5000, 600), riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -49.5, -500);
    cityGroup.add(river);

    const buildingMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a22, 
      metalness: 0.7, 
      roughness: 0.3,
      transparent: true 
    });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const createBuilding = (x: number, z: number, dist: number) => {
      const height = 150 + (1200 - dist) / 4 + Math.random() * 200;
      const width = 35 + Math.random() * 30;
      const depth = 35 + Math.random() * 30;

      const b = new THREE.Mesh(boxGeo, buildingMat);
      b.scale.set(width, height, depth);
      b.position.set(x, height / 2 - 50, z);
      cityGroup.add(b);

      // Window Points (Heavenly Lights)
      const winCount = 40;
      const winGeo = new THREE.BufferGeometry();
      const winPos = new Float32Array(winCount * 3);
      const winCols = new Float32Array(winCount * 3);
      const pColor = new THREE.Color("#9D00FF");
      const wColor = new THREE.Color("#ffc48c");

      for (let j = 0; j < winCount; j++) {
        winPos[j * 3] = (Math.random() - 0.5) * (width + 0.5);
        winPos[j * 3 + 1] = (Math.random() - 0.5) * (height - 10);
        winPos[j * 3 + 2] = (Math.random() > 0.5 ? 1 : -1) * (depth / 2 + 0.5);
        const c = Math.random() > 0.8 ? wColor : pColor;
        winCols[j * 3] = c.r; winCols[j * 3 + 1] = c.g; winCols[j * 3 + 2] = c.b;
      }
      winGeo.setAttribute('position', new THREE.BufferAttribute(winPos, 3));
      winGeo.setAttribute('color', new THREE.BufferAttribute(winCols, 3));
      const winPoints = new THREE.Points(winGeo, new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
      b.add(winPoints);
    };

    // Dense Manhattan Grid (Using User Spacing Concept)
    for (let i = -1000; i <= 1000; i += 180) {
      for (let j = -400; j <= 800; j += 180) {
        const d = Math.sqrt(i * i + j * j);
        createBuilding(i, j, d);
      }
    }

    // Iconic Center
    const centerT = new THREE.Mesh(boxGeo, buildingMat);
    centerT.scale.set(65, 850, 65);
    centerT.position.set(0, 375, 200);
    cityGroup.add(centerT);

    // LIGHTING
    scene.add(new THREE.AmbientLight(0x111122, 1.5));
    
    const purpleMain = new THREE.DirectionalLight(0x9D00FF, 3.5);
    purpleMain.position.set(300, 600, 200);
    scene.add(purpleMain);

    const bluePoint = new THREE.PointLight(0x3a4cff, 60, 2500);
    bluePoint.position.set(-400, 300, 400);
    scene.add(bluePoint);

    const animate = () => {
      requestAnimationFrame(animate);
      
      const p = scrollYProgress.get();
      const z = cameraZ.get();
      const y = cameraY.get();
      const x = cameraX.get();
      
      camera.position.set(x, y, z);
      camera.lookAt(0, (p < 0.6) ? 0 : -0.8, 0);

      planetGroup.rotation.y += 0.0002;
      planetGroup.scale.set(planetScale.get(), planetScale.get(), planetScale.get());
      if (planetMat.userData.shader) {
        planetMat.userData.shader.uniforms.uOpacity.value = planetOpacity.get();
      }
      atmoMat.uniforms.uOpacity.value = planetOpacity.get();
      
      cityGroup.position.y = cityY.get() - 50;
      buildingMat.opacity = cityOpacity.get();
      groundMat.opacity = cityOpacity.get();
      riverMat.opacity = cityOpacity.get();
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
