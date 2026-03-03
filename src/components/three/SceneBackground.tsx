
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

  // Cinematic scroll mapping
  // Slower descent: we spread the Z-axis change over a larger range
  const cameraZ = useTransform(scrollYProgress, [0, 0.45, 0.75, 1], [15, 8, 1.5, 0.8]);
  const cameraY = useTransform(scrollYProgress, [0, 0.45, 0.75, 1], [2, 1.2, -0.5, -1.5]);
  const cameraX = useTransform(scrollYProgress, [0.6, 0.85, 1], [0, 1.2, 0]); 
  
  const planetOpacity = useTransform(scrollYProgress, [0.4, 0.6], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1, 4]);
  const cityOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.45, 0.8], [200, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020205");
    scene.fog = new THREE.FogExp2("#050010", 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    containerRef.current.appendChild(renderer.domElement);

    // POST PROCESSING
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.5, 0.2);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 1. Starfield
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 3000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.0, color: "#9D00FF", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 2. Realistic Textured Earth
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
      roughness: 0.85,
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
          vec3 purpleTint = vec3(0.55, 0.1, 0.85); 
          vec3 landColor = mix(texelColor.rgb, purpleTint, 0.65);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor, uOpacity);
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Fresnel Atmospheric Glow
    const atmoGeo = new THREE.SphereGeometry(4.65, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#9D00FF") }, viewVector: { value: camera.position }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); vec3 vNormel = normalize( normalMatrix * vec3(0,0,1) ); intensity = pow( 0.65 - dot(vNormal, vNormel), 5.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // 3. Cinematic Manhattan
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Ground & River
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x05050a, roughness: 1 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -50;
    cityGroup.add(ground);

    const riverMat = new THREE.MeshStandardMaterial({ color: 0x080812, metalness: 0.8, roughness: 0.2 });
    const river = new THREE.Mesh(new THREE.PlaneGeometry(5000, 400), riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -49.5, -400);
    cityGroup.add(river);

    // Bridge
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1000, 15, 40), new THREE.MeshStandardMaterial({ color: 0x1a1a25 }));
    bridge.position.set(0, -35, -400);
    cityGroup.add(bridge);

    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x08080f, roughness: 0.4, metalness: 0.3, transparent: true });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const createNYCBuilding = (x: number, z: number, dist: number) => {
      const height = 80 + (1000 - dist) / 4 + Math.random() * 120;
      if (height < 40) return;

      const width = 25 + Math.random() * 20;
      const depth = 25 + Math.random() * 20;

      const building = new THREE.Mesh(boxGeo, buildingMat);
      building.scale.set(width, height, depth);
      building.position.set(x, height / 2 - 50, z);
      cityGroup.add(building);

      // Windows (High Density)
      const winCount = 40;
      const winGeo = new THREE.BufferGeometry();
      const winPos = new Float32Array(winCount * 3);
      const winColors = new Float32Array(winCount * 3);
      const pColor = new THREE.Color("#9D00FF");
      const wColor = new THREE.Color("#ffc48c");

      for (let j = 0; j < winCount; j++) {
        winPos[j * 3] = (Math.random() - 0.5) * (width + 0.5);
        winPos[j * 3 + 1] = (Math.random() - 0.5) * height;
        winPos[j * 3 + 2] = (Math.random() - 0.5) > 0 ? (depth / 2 + 0.2) : (-depth / 2 - 0.2);
        const c = Math.random() > 0.7 ? wColor : pColor;
        winColors[j * 3] = c.r;
        winColors[j * 3 + 1] = c.g;
        winColors[j * 3 + 2] = c.b;
      }
      winGeo.setAttribute('position', new THREE.BufferAttribute(winPos, 3));
      winGeo.setAttribute('color', new THREE.BufferAttribute(winColors, 3));
      const winPoints = new THREE.Points(winGeo, new THREE.PointsMaterial({ 
        size: 0.8, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending 
      }));
      building.add(winPoints);
    };

    // Manhattan Grid
    for (let i = -800; i <= 800; i += 120) {
      for (let j = -400; j <= 800; j += 120) {
        const dist = Math.sqrt(i * i + j * j);
        createNYCBuilding(i, j, dist);
      }
    }

    // Iconic Center Tower
    const centerTower = new THREE.Mesh(boxGeo, buildingMat);
    centerTower.scale.set(45, 650, 45);
    centerTower.position.set(0, 275, 100);
    cityGroup.add(centerTower);

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 5, 10);
    scene.add(sunLight);

    const purpleWash = new THREE.DirectionalLight(0x9D00FF, 3.5);
    purpleWash.position.set(300, 600, -200);
    cityGroup.add(purpleWash);

    scene.add(new THREE.AmbientLight(0x151525, 1.8));

    const animate = () => {
      requestAnimationFrame(animate);
      
      const z = cameraZ.get();
      const y = cameraY.get();
      const x = cameraX.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.set(x, y, z);
      
      // Dynamic look at based on camera stage
      const lookAtY = (scrollYProgress.get() < 0.5) ? 0 : -0.5;
      camera.lookAt(0, lookAtY, 0);

      planetGroup.rotation.y += 0.0004;
      planetGroup.scale.set(pSc, pSc, pSc);
      if (planetMat.userData.shader) {
        planetMat.userData.shader.uniforms.uOpacity.value = pOp;
      }
      atmoMat.uniforms.uOpacity.value = pOp;
      
      cityGroup.position.y = cY - 50;
      buildingMat.opacity = cOp;
      groundMat.opacity = cOp;
      riverMat.opacity = cOp;
      starMaterial.opacity = pOp;

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
  }, [cameraZ, cameraY, cameraX, planetOpacity, planetScale, cityOpacity, cityY, scrollYProgress]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
