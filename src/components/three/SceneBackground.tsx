
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
    renderer.toneMappingExposure = 1.0; // Adjusted for less overall brightness
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    // Reduced bloom strength from 1.2 to 0.6 for a subtle look
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Stars
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

    // Planet
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
      roughness: 0.6,
      metalness: 0.8,
      emissive: new THREE.Color("#220055"), // Darker emissive for less glow
      emissiveIntensity: 0.4 // Reduced intensity
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
          vec3 oceanColor = vec3(0.01, 0.005, 0.02); 
          vec3 purpleTint = vec3(0.4, 0.1, 0.6); 
          vec3 landColor = mix(texelColor.rgb * 1.5, purpleTint, 0.5);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor, uOpacity); 
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Atmosphere
    const atmoGeo = new THREE.SphereGeometry(6.75, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#4400aa") }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); intensity = pow( 0.7 - dot(vNormal, vec3(0,0,1)), 6.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity * 1.2 ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // City Group
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
                color: Math.random() > 0.8 ? 0xffbb66 : 0x881BFD,
                transparent: true,
                opacity: 0.5
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

    // Lights
    scene.add(new THREE.AmbientLight(0x0a0a15, 0.8));
    const purpleWash = new THREE.DirectionalLight(0x4400aa, 1.5);
    purpleWash.position.set(300, 700, 200);
    scene.add(purpleWash);

    const animate = () => {
      requestAnimationFrame(animate);
      const p = scrollYProgress.get();
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      camera.lookAt(0, (p < 0.6) ? 0 : -0.2, (p > 0.7) ? 0.4 : 0);

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
  }, [cameraZ, cameraY, cameraX, planetOpacity, planetScale, cityOpacity, cityY, starOpacity, scrollYProgress]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
