
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Cinematic scroll mapping - Space to City
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [15, 6, 2.5, 1.2]);
  const cameraY = useTransform(scrollYProgress, [0.4, 1], [0, -1.5]);
  const planetOpacity = useTransform(scrollYProgress, [0.4, 0.6], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1.2, 3.5]);
  const cityOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.4, 0.9], [50, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020205");
    scene.fog = new THREE.FogExp2("#020205", 0.015);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Realistic Lighting Setup
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Starfield (Deep Space) ---
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 1500;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1500;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1500;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.2, color: "#C41BFD", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- 2. HIGH-FIDELITY REALISTIC EARTH ---
    const loader = new THREE.TextureLoader();
    const albedo = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const bump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");
    const roughness = loader.load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg");

    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(4.5, 128, 128);
    
    const planetMat = new THREE.MeshStandardMaterial({
      map: albedo,
      bumpMap: bump,
      bumpScale: 0.15,
      roughnessMap: roughness,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true
    });

    // CUSTOM SHADER - Injected for Realistic Purple Land / Dark Ocean
    planetMat.onBeforeCompile = (shader) => {
      shader.uniforms.planetOpacity = { value: 1.0 };
      planetMat.userData.shader = shader; // Reference for animation loop

      shader.fragmentShader = `
        uniform float planetOpacity;
        ${shader.fragmentShader}
      `.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 texelColor = texture2D( map, vMapUv );
          // Define ocean by color intensity
          float oceanMask = smoothstep(0.0, 0.4, texelColor.b - texelColor.r);
          
          // Deep realistic grey/black ocean
          vec3 oceanColor = vec3(0.01, 0.01, 0.03); 
          
          // Purple tint for land
          vec3 purpleTint = vec3(0.6, 0.1, 0.9);
          vec3 landColor = mix(texelColor.rgb, purpleTint, 0.7);
          
          vec3 finalColor = mix(landColor, oceanColor, oceanMask);
          diffuseColor = vec4(finalColor, planetOpacity);
        #else
          diffuseColor = vec4(diffuse, planetOpacity);
        #endif
        `
      );
    };

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Cinematic Atmosphere (Fresnel Glow)
    const atmoGeo = new THREE.SphereGeometry(4.7, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color("#C41BFD") },
        viewVector: { value: camera.position },
        opacity: { value: 1.0 }
      },
      vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * vec3(0,0,1) );
          intensity = pow( 0.65 - dot(vNormal, vNormel), 5.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float opacity;
        varying float intensity;
        void main() {
          gl_FragColor = vec4( glowColor, intensity * opacity );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // --- 3. CINEMATIC URBAN MATRIX ---
    const cityGroup = new THREE.Group();
    const buildingCount = 400;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({ color: "#050508", transparent: true, roughness: 0.3 });

    for (let i = 0; i < buildingCount; i++) {
      const h = 10 + Math.random() * 30;
      const w = 4 + Math.random() * 6;
      const d = 4 + Math.random() * 6;
      const building = new THREE.Mesh(boxGeo, buildingMat);
      building.scale.set(w, h, d);
      building.position.set((Math.random() - 0.5) * 500, h / 2 - 50, (Math.random() - 0.5) * 500);
      cityGroup.add(building);

      // Neon Purple Window Clusters
      const winCount = 25;
      const winGeo = new THREE.BufferGeometry();
      const winPos = new Float32Array(winCount * 3);
      for(let j = 0; j < winCount; j++) {
        winPos[j*3] = (Math.random() - 0.5) * (w + 0.2);
        winPos[j*3+1] = (Math.random() - 0.5) * h;
        winPos[j*3+2] = (Math.random() - 0.5) > 0 ? (d/2 + 0.1) : (-d/2 - 0.1);
      }
      winGeo.setAttribute('position', new THREE.BufferAttribute(winPos, 3));
      const winPoints = new THREE.Points(winGeo, new THREE.PointsMaterial({ color: "#C41BFD", size: 0.25, transparent: true, opacity: 0.7 }));
      building.add(winPoints);
    }
    scene.add(cityGroup);

    // ☀️ SUN LIGHTING
    const sun = new THREE.DirectionalLight(0xffffff, 4);
    sun.position.set(10, 5, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x151525, 1.2));

    const animate = () => {
      requestAnimationFrame(animate);

      const z = cameraZ.get();
      const y = cameraY.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.position.y = y;
      camera.lookAt(0, -cY * 0.1, 0);

      // Planet Animation
      planetGroup.rotation.y += 0.0004;
      planetGroup.scale.set(pSc, pSc, pSc);
      
      // Update shader opacity uniform
      if (planetMat.userData.shader) {
        planetMat.userData.shader.uniforms.planetOpacity.value = pOp;
      }
      atmoMat.uniforms.opacity.value = pOp;
      atmoMat.uniforms.viewVector.value = camera.position;

      // City Animation
      cityGroup.position.y = cY;
      buildingMat.opacity = cOp;
      starMaterial.opacity = starOpacity.get();

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      boxGeo.dispose();
      buildingMat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [cameraZ, cameraY, planetOpacity, planetScale, cityOpacity, cityY, starOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
