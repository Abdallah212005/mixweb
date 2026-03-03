
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

  // Cinematic Camera Path - Much more deliberate
  const cameraZ = useTransform(scrollYProgress, [0, 0.5, 0.7, 0.9, 1], [40, 15, 6, 2, 1.5]);
  const cameraY = useTransform(scrollYProgress, [0, 0.5, 0.7, 0.9, 1], [10, 4, 1.5, 0.3, 0.1]);
  const cameraX = useTransform(scrollYProgress, [0.7, 0.85, 1], [0, 2, 0]); 
  
  const planetOpacity = useTransform(scrollYProgress, [0.6, 0.75], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.75], [1, 10]);
  const cityOpacity = useTransform(scrollYProgress, [0.65, 0.8], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.65, 0.9], [400, 0]);
  const starOpacity = useTransform(scrollYProgress, [0.4, 0.7], [1, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#010103"); // Deepest black
    scene.fog = new THREE.FogExp2("#05000a", 0.012); // Less dense, more depth

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1; // Reduced exposure to avoid burnout
    containerRef.current.appendChild(renderer.domElement);

    // POST PROCESSING (Controlled Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.3, 0.2);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 1. STARFIELD (Dimmer)
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 4000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.2, color: "#4422aa", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 2. TEXTURED PLANET (Shader Fix)
    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(4.5, 128, 128);
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 0.08,
      transparent: true,
      roughness: 0.8,
      metalness: 0.1
    });

    planetMat.onBeforeCompile = (shader) => {
      shader.uniforms.uOpacity = { value: 1.0 };
      shader.fragmentShader = `uniform float uOpacity;\n${shader.fragmentShader}`;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 texelColor = texture2D( map, vMapUv );
          float oceanMask = smoothstep(0.0, 0.38, texelColor.b - texelColor.r);
          vec3 oceanColor = vec3(0.05, 0.05, 0.07); // Dark Gray Oceans
          vec3 purpleTint = vec3(0.6, 0.1, 0.9); // Electric Purple Land
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

    // Atmosphere Glow (Reduced intensity)
    const atmoGeo = new THREE.SphereGeometry(4.65, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#9D00FF") }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); intensity = pow( 0.5 - dot(vNormal, vec3(0,0,1)), 5.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // 3. MANHATTAN (Cinematic Build)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const buildingMat = new THREE.MeshStandardMaterial({ 
      color: 0x08080c, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true 
    });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const createBuilding = (x: number, z: number, height: number) => {
      const width = 25 + Math.random() * 20;
      const depth = 25 + Math.random() * 20;
      const b = new THREE.Mesh(boxGeo, buildingMat);
      b.scale.set(width, height, depth);
      b.position.set(x, height / 2 - 80, z);
      cityGroup.add(b);

      // Random Windows (High Contrast)
      if (height > 100) {
        const rows = Math.min(Math.floor(height / 12), 15);
        const cols = Math.min(Math.floor(width / 10), 4);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (Math.random() > 0.6) {
              const win = new THREE.Mesh(
                new THREE.PlaneGeometry(2.5, 3.5),
                new THREE.MeshBasicMaterial({
                  color: Math.random() > 0.7 ? 0xffbb88 : 0xC41BFD,
                  transparent: true,
                  opacity: 0.6
                })
              );
              win.position.set(x - width / 2 + j * 10 + 5, i * 12 - 80 + 10, z + depth / 2 + 0.1);
              cityGroup.add(win);
            }
          }
        }
      }
    };

    for (let i = -600; i <= 600; i += 120) {
      for (let j = -300; j <= 600; j += 120) {
        const d = Math.sqrt(i * i + j * j);
        const h = 100 + (600 - d) / 2 + Math.random() * 100;
        createBuilding(i, j, h);
      }
    }

    // GROUND / WATER
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(3000, 3000),
      new THREE.MeshStandardMaterial({ color: 0x020205, transparent: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -80.5;
    cityGroup.add(ground);

    // LIGHTING (Darker, more directional)
    scene.add(new THREE.AmbientLight(0x101015, 0.5));
    const purpleWash = new THREE.DirectionalLight(0x9D00FF, 1.8);
    purpleWash.position.set(200, 500, -100);
    scene.add(purpleWash);

    const blueRim = new THREE.PointLight(0x3a4cff, 200, 1000);
    blueRim.position.set(-300, 100, 300);
    scene.add(blueRim);

    const animate = () => {
      requestAnimationFrame(animate);
      const p = scrollYProgress.get();
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      camera.lookAt(0, (p < 0.6) ? 0 : -0.2, (p > 0.7) ? 0.2 : 0);

      planetGroup.rotation.y += 0.0001;
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
