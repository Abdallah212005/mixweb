
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

  // Cinematic Camera Path - Improved for "Entry" feel
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [35, 12, 5, 2.0, 1.5]);
  const cameraY = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [8, 3, 1.5, 0.4, 0.2]);
  const cameraX = useTransform(scrollYProgress, [0.7, 0.85, 1], [0, 1.8, 0]); 
  
  const planetOpacity = useTransform(scrollYProgress, [0.55, 0.8], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.75], [1.8, 11.5]); // Increased scale for more impact
  const cityOpacity = useTransform(scrollYProgress, [0.65, 0.85], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.65, 0.95], [400, 0]);
  const starOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0.8, 0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#010103");
    scene.fog = new THREE.FogExp2("#020105", 0.012);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; // Increased for more brightness
    containerRef.current.appendChild(renderer.domElement);

    // POST PROCESSING - Controlled Bloom for "Electric Sting"
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.4, 0.15);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 1. STARFIELD
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 4000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.2, color: "#442288", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 2. TEXTURED PLANET
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
      metalness: 0.2
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
          vec3 oceanColor = vec3(0.08, 0.08, 0.1); // Visible Dark Grey Oceans
          vec3 purpleTint = vec3(0.8, 0.2, 1.0); // Bright Neon Purple Land
          vec3 landColor = mix(texelColor.rgb, purpleTint, 0.75);
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor * 1.4, uOpacity); // Brightened final output
        #endif
        `
      );
      planetMat.userData.shader = shader;
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Atmosphere Glow
    const atmoGeo = new THREE.SphereGeometry(6.8, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color("#9D00FF") }, uOpacity: { value: 1.0 } },
      vertexShader: `varying float intensity; void main() { vec3 vNormal = normalize( normalMatrix * normal ); intensity = pow( 0.6 - dot(vNormal, vec3(0,0,1)), 4.0 ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `uniform vec3 glowColor; uniform float uOpacity; varying float intensity; void main() { gl_FragColor = vec4( glowColor, intensity * uOpacity * 1.5 ); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // 3. MANHATTAN (Entry into city)
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
      const width = 25 + Math.random() * 30;
      const depth = 25 + Math.random() * 30;
      const b = new THREE.Mesh(boxGeo, buildingMat);
      b.scale.set(width, height, depth);
      b.position.set(x, height / 2 - 120, z);
      cityGroup.add(b);

      // Windows
      if (height > 100) {
        const rows = Math.min(Math.floor(height / 12), 15);
        for (let i = 0; i < rows; i++) {
          if (Math.random() > 0.4) {
            const win = new THREE.Mesh(
              new THREE.PlaneGeometry(3.5, 4.5),
              new THREE.MeshBasicMaterial({
                color: Math.random() > 0.8 ? 0xffcc88 : 0xC41BFD,
                transparent: true,
                opacity: 0.6
              })
            );
            win.position.set(x - width / 2 + (Math.random() * width), i * 12 - 120 + 20, z + depth / 2 + 0.1);
            cityGroup.add(win);
          }
        }
      }
    };

    for (let i = -1000; i <= 1000; i += 180) {
      for (let j = -1000; j <= 1000; j += 180) {
        const d = Math.sqrt(i * i + j * j);
        const h = 180 + (1000 - d) / 2.2 + Math.random() * 200;
        createBuilding(i, j, h);
      }
    }

    // GROUND
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000),
      new THREE.MeshStandardMaterial({ color: 0x020205, transparent: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -120.5;
    cityGroup.add(ground);

    // LIGHTING
    scene.add(new THREE.AmbientLight(0x111122, 1.2)); // Stronger ambient
    const purpleWash = new THREE.DirectionalLight(0x9D00FF, 2.5); // Brighter directional
    purpleWash.position.set(400, 800, 200);
    scene.add(purpleWash);

    const whiteHighlight = new THREE.PointLight(0xffffff, 1.5, 1000); // Sharp highlight
    whiteHighlight.position.set(-200, 400, 500);
    scene.add(whiteHighlight);

    const animate = () => {
      requestAnimationFrame(animate);
      const p = scrollYProgress.get();
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      camera.lookAt(0, (p < 0.6) ? 0 : -0.25, (p > 0.65) ? 0.35 : 0);

      planetGroup.rotation.y += 0.0007; // Slightly faster rotation
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
