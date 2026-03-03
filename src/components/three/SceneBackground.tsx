
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Cinematic scroll mapping - perfectly synchronized
  const cameraZ = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [15, 8, 3, 1.2]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1, 4.5]);
  const cityOpacity = useTransform(scrollYProgress, [0.4, 0.6, 1], [0, 1, 1]);
  const cityY = useTransform(scrollYProgress, [0.4, 0.8], [40, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020204");
    scene.fog = new THREE.FogExp2("#020204", 0.01);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Realistic Starfield ---
    const starCount = 10000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
      const b = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = b * 0.9;
      starColors[i * 3 + 1] = b * 0.85;
      starColors[i * 3 + 2] = b * 1.3;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.1, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- 2. Recognizable Earth Rendering ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Realistic Dark Oceans
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Continent drawing helper with "jagged" realism
      const drawContinent = (path: number[][], color: string) => {
        ctx.fillStyle = color;
        ctx.shadowBlur = 40;
        ctx.shadowColor = color;
        ctx.beginPath();
        path.forEach(([x, y], i) => {
          const px = x * canvas.width;
          const py = y * canvas.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();

        // High-tech neural noise
        ctx.globalCompositeOperation = 'overlay';
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 0.5;
        for(let i=0; i<30; i++) {
          const start = path[Math.floor(Math.random()*path.length)];
          const end = path[Math.floor(Math.random()*path.length)];
          ctx.beginPath();
          ctx.moveTo(start[0]*canvas.width, start[1]*canvas.height);
          ctx.lineTo(end[0]*canvas.width, end[1]*canvas.height);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      };

      // Real World Topography approximate mapping
      const northAmerica = [[0.12, 0.22], [0.28, 0.2], [0.35, 0.3], [0.3, 0.45], [0.25, 0.45], [0.1, 0.35]];
      const southAmerica = [[0.28, 0.48], [0.38, 0.52], [0.32, 0.85], [0.25, 0.65]];
      const eurasia = [[0.45, 0.15], [0.85, 0.1], [0.92, 0.35], [0.75, 0.45], [0.55, 0.35], [0.48, 0.2]];
      const africa = [[0.42, 0.38], [0.58, 0.42], [0.55, 0.75], [0.48, 0.72], [0.42, 0.52]];
      const australia = [[0.78, 0.62], [0.9, 0.65], [0.88, 0.85], [0.75, 0.82]];

      [northAmerica, southAmerica, eurasia, africa, australia].forEach(c => drawContinent(c, "#C41BFD"));

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();
    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(5, 128, 128);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissiveMap: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 1.8,
      transparent: true,
      roughness: 0.2,
      metalness: 0.4
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Fresnel Atmospheric Glow
    const atmoGeo = new THREE.SphereGeometry(5.35, 128, 128);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color("#C41BFD") },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * vec3(0,0,1) );
          intensity = pow( 0.6 - dot(vNormal, vNormel), 2.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, intensity * 0.4 );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);

    scene.add(planetGroup);

    // --- 3. Dense Urban Grid ---
    const cityGroup = new THREE.Group();
    const buildingCount = 1200;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    
    for (let i = 0; i < buildingCount; i++) {
      const h = 4 + Math.random() * 25;
      const w = 1 + Math.random() * 3;
      const d = 1 + Math.random() * 3;
      
      const building = new THREE.Mesh(
        boxGeo,
        new THREE.MeshStandardMaterial({ color: "#050508", roughness: 0.05, metalness: 0.95, transparent: true })
      );
      
      building.scale.set(w, h, d);
      building.position.set((Math.random() - 0.5) * 250, h / 2 - 20, (Math.random() - 0.5) * 250);
      
      // Neon Window Clusters
      const winCount = Math.floor(h * 6);
      for(let j = 0; j < winCount; j++) {
        if (Math.random() > 0.3) continue;
        const light = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: "#C41BFD" }));
        const ly = (j / winCount - 0.5) * h;
        const side = Math.floor(Math.random() * 4);
        if (side === 0) light.position.set(w/2+0.05, ly, (Math.random()-0.5)*d);
        else if (side === 1) light.position.set(-w/2-0.05, ly, (Math.random()-0.5)*d);
        else if (side === 2) light.position.set((Math.random()-0.5)*w, ly, d/2+0.05);
        else light.position.set((Math.random()-0.5)*w, ly, -d/2-0.05);
        building.add(light);
      }
      cityGroup.add(building);
    }

    const cityGrid = new THREE.GridHelper(800, 400, "#C41BFD", "#0a0a0c");
    cityGrid.position.y = -20;
    cityGrid.material.transparent = true;
    cityGrid.material.opacity = 0.08;
    cityGroup.add(cityGrid);

    scene.add(cityGroup);

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(60, 80, 60);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight(0x101025, 1.8));

    const animate = () => {
      requestAnimationFrame(animate);

      const z = cameraZ.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.lookAt(0, -cY * 0.15, 0);

      planetGroup.rotation.y += 0.0005;
      planetGroup.scale.set(pSc, pSc, pSc);
      planetMat.opacity = pOp;
      atmoMat.uniforms.viewVector.value = camera.position;

      cityGroup.position.y = cY;
      cityGroup.children.forEach(c => {
        if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) c.material.opacity = cOp;
      });
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
    };
  }, [cameraZ, planetOpacity, planetScale, cityOpacity, cityY, starOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
