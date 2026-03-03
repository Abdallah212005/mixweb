
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Cinematic scroll mapping - Orbital Descent to NYC Infiltration
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [15, 6, 2.5, 1.2]);
  const cameraY = useTransform(scrollYProgress, [0.4, 1], [0, -1.8]);
  const planetOpacity = useTransform(scrollYProgress, [0.4, 0.6], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1.2, 4.0]);
  const cityOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const cityY = useTransform(scrollYProgress, [0.4, 0.9], [60, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020205");
    scene.fog = new THREE.FogExp2("#020205", 0.012);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Physical Rendering Setup
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMappingExposure = 1.4;
    
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Starfield (Deep Space Resonance) ---
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

    // --- 2. TEXTURED REALISTIC EARTH (Purple Topography) ---
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

    planetMat.onBeforeCompile = (shader) => {
      shader.uniforms.planetOpacity = { value: 1.0 };
      planetMat.userData.shader = shader;

      shader.fragmentShader = `
        uniform float planetOpacity;
        ${shader.fragmentShader}
      `.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec4 texelColor = texture2D( map, vMapUv );
          float oceanMask = smoothstep(0.0, 0.35, texelColor.b - texelColor.r);
          
          // Dark Grey realistic oceans
          vec3 oceanColor = vec3(0.08, 0.08, 0.1); 
          
          // Purple Land with details
          vec3 purpleTint = vec3(0.55, 0.1, 0.8);
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

    // Fresnel Atmospheric Glow
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

    // --- 3. NYC CINEMATIC MATRIX (The Landing Zone) ---
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Ground Plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 1, transparent: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -50;
    cityGroup.add(ground);

    // River Flow
    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 300),
      new THREE.MeshStandardMaterial({ color: 0x08080f, metalness: 0.6, roughness: 0.2, transparent: true })
    );
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -49.8, -200);
    cityGroup.add(river);

    // Bridge Structure
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(500, 10, 25),
      new THREE.MeshStandardMaterial({ color: 0x15151a, metalness: 0.5, transparent: true })
    );
    bridge.position.set(0, -40, -200);
    cityGroup.add(bridge);

    // Building Generator (Manhattan Density)
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.3, transparent: true });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const createNYCBuilding = (x: number, z: number, dist: number) => {
      const height = 120 + (600 - dist) / 3 + Math.random() * 80;
      if (height < 60) return;

      const width = 15 + Math.random() * 25;
      const depth = 15 + Math.random() * 25;

      const building = new THREE.Mesh(boxGeo, buildingMat);
      building.scale.set(width, height, depth);
      building.position.set(x, height / 2 - 50, z);
      cityGroup.add(building);

      // Procedural Window Clusters (Orange + Purple mix)
      const winCount = 30;
      const winGeo = new THREE.BufferGeometry();
      const winPos = new Float32Array(winCount * 3);
      const winColors = new Float32Array(winCount * 3);
      
      const pColor = new THREE.Color("#C41BFD");
      const wColor = new THREE.Color("#ffc48c");

      for (let j = 0; j < winCount; j++) {
        winPos[j * 3] = (Math.random() - 0.5) * (width + 0.2);
        winPos[j * 3 + 1] = (Math.random() - 0.5) * height;
        winPos[j * 3 + 2] = (Math.random() - 0.5) > 0 ? (depth / 2 + 0.1) : (-depth / 2 - 0.1);
        
        const c = Math.random() > 0.7 ? wColor : pColor;
        winColors[j * 3] = c.r;
        winColors[j * 3 + 1] = c.g;
        winColors[j * 3 + 2] = c.b;
      }
      
      winGeo.setAttribute('position', new THREE.BufferAttribute(winPos, 3));
      winGeo.setAttribute('color', new THREE.BufferAttribute(winColors, 3));
      
      const winPoints = new THREE.Points(winGeo, new THREE.PointsMaterial({ 
        size: 0.35, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.7,
        blending: THREE.AdditiveBlending 
      }));
      building.add(winPoints);
    };

    // Populate Manhattan Density
    for (let i = -500; i <= 500; i += 70) {
      for (let j = -100; j <= 400; j += 70) {
        const dist = Math.sqrt(i * i + j * j);
        createNYCBuilding(i, j, dist);
      }
    }

    // Iconic Center Tower
    const centerTower = new THREE.Mesh(boxGeo, buildingMat);
    centerTower.scale.set(40, 350, 40);
    centerTower.position.set(0, 125, 100);
    cityGroup.add(centerTower);

    // --- 4. CINEMATIC LIGHTING ---
    const sun = new THREE.DirectionalLight(0xffffff, 4);
    sun.position.set(10, 5, 10);
    scene.add(sun);

    const purpleWash = new THREE.DirectionalLight(0x9D00FF, 3);
    purpleWash.position.set(400, 700, -200);
    cityGroup.add(purpleWash);

    const blueFill = new THREE.PointLight(0x3a4cff, 100, 1500);
    blueFill.position.set(-300, 200, 300);
    cityGroup.add(blueFill);

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
      
      if (planetMat.userData.shader) {
        planetMat.userData.shader.uniforms.planetOpacity.value = pOp;
      }
      atmoMat.uniforms.opacity.value = pOp;
      atmoMat.uniforms.viewVector.value = camera.position;

      // City Animation
      cityGroup.position.y = cY;
      buildingMat.opacity = cOp;
      ground.material.opacity = cOp;
      river.material.opacity = cOp;
      bridge.material.opacity = cOp;
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
      ground.geometry.dispose();
      river.geometry.dispose();
      bridge.geometry.dispose();
    };
  }, [cameraZ, cameraY, planetOpacity, planetScale, cityOpacity, cityY, starOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
