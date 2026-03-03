
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

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
    renderer.toneMappingExposure = 1.3;
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.15);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const starCount = 4000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 5000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 5000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 5000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.0, color: "#5533AA", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(6.5, 128, 128);
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 0.15,
      transparent: true,
      roughness: 0.4,
      metalness: 0.8,
      emissive: new THREE.Color("#4400aa"),
      emissiveIntensity: 0.5
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
          vec3 oceanColor = vec3(0.02, 0.01, 0.05); 
          vec3 purpleTint = vec3(0.8, 0.1, 1.0); 
          vec3 landColor = mix(texelColor.rgb * 3.0, purpleTint, 0.8);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor * 2.0, uOpacity); 
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    const atmoGeo = new THREE.SphereGeometry(6.75, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#9D00FF") }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); intensity = pow( 0.7 - dot(vNormal, vec3(0,0,1)), 4.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity * 2.5 ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    const ringGroup = new THREE.Group();
    planetGroup.add(ringGroup);

    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      const symbols = ["{", "}", "<", ">", "/", "#", "Ps", "Ai", "Ae", "Pr"];
      for (let i = 0; i < 40; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const textGeo = new TextGeometry(symbol, {
          font: font,
          size: 0.5,
          height: 0.1,
        });
        const textMat = new THREE.MeshStandardMaterial({
          color: symbol.length > 1 ? 0xffffff : 0xC41BFD,
          emissive: 0xC41BFD,
          emissiveIntensity: 3.0,
          transparent: true
        });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        const angle = (i / 40) * Math.PI * 2;
        const radius = 8 + Math.random() * 2;
        textMesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius);
        textMesh.lookAt(0, 0, 0);
        ringGroup.add(textMesh);
      }
    });

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

      if (height > 120) {
        const rows = Math.min(Math.floor(height / 15), 12);
        for (let i = 0; i < rows; i++) {
          if (Math.random() > 0.45) {
            const win = new THREE.Mesh(
              new THREE.PlaneGeometry(3, 4),
              new THREE.MeshBasicMaterial({
                color: Math.random() > 0.8 ? 0xffbb66 : 0xC41BFD,
                transparent: true,
                opacity: 0.7
              })
            );
            win.position.set(x - width / 2 + (Math.random() * width), i * 15 - 120 + 30, z + depth / 2 + 0.1);
            cityGroup.add(win);
          }
        }
      }
    };

    for (let i = -1200; i <= 1200; i += 200) {
      for (let j = -1200; j <= 1200; j += 200) {
        const d = Math.sqrt(i * i + j * j);
        const h = 150 + (1200 - d) / 2.5 + Math.random() * 250;
        createBuilding(i, j, h);
      }
    }

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000),
      new THREE.MeshStandardMaterial({ color: 0x010103, transparent: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -120.5;
    cityGroup.add(ground);

    scene.add(new THREE.AmbientLight(0x0a0a15, 1.0));
    const purpleWash = new THREE.DirectionalLight(0x9D00FF, 3.0);
    purpleWash.position.set(300, 700, 200);
    scene.add(purpleWash);

    const spotLight = new THREE.PointLight(0xC41BFD, 2.0, 1500);
    spotLight.position.set(0, 500, 500);
    scene.add(spotLight);

    const animate = () => {
      requestAnimationFrame(animate);
      const p = scrollYProgress.get();
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      camera.lookAt(0, (p < 0.6) ? 0 : -0.2, (p > 0.7) ? 0.4 : 0);

      planetGroup.rotation.y += 0.001;
      ringGroup.rotation.y += 0.005;
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
