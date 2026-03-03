
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Cinematic scroll mapping - perfectly continuous
  const cameraZ = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [18, 8, 3, 1.5]);
  const planetOpacity = useTransform(scrollYProgress, [0, 0.5, 0.6], [1, 1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.6], [1, 4.5]);
  const cityOpacity = useTransform(scrollYProgress, [0.4, 0.6, 1], [0, 1, 1]);
  const cityY = useTransform(scrollYProgress, [0.4, 0.9], [60, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020205");
    scene.fog = new THREE.FogExp2("#020205", 0.012);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Realistic Starfield ---
    const starCount = 4000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 1.1, color: "#C41BFD", transparent: true, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- 2. HIGH-FIDELITY EARTH TOPOGRAPHY ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Deep Space Oceans
      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawContinent = (points: number[][], intensity: number) => {
        ctx.beginPath();
        points.forEach(([x, y], i) => {
          const px = x * canvas.width;
          const py = y * canvas.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        // Layered Glow for Realism
        ctx.shadowBlur = 40;
        ctx.shadowColor = "rgba(196, 27, 253, 0.8)";
        ctx.fillStyle = `rgba(196, 27, 253, ${intensity})`;
        ctx.fill();
        
        // Neural Grid Detail
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Topographic Texture
        for(let i=0; i<15; i++) {
          ctx.fillStyle = "rgba(255,255,255,0.02)";
          ctx.beginPath();
          ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*200, 0, Math.PI*2);
          ctx.fill();
        }
      };

      // Accurateish Continental Paths
      const nAmerica = [[0.12, 0.18], [0.38, 0.22], [0.35, 0.42], [0.25, 0.48], [0.15, 0.35]];
      const sAmerica = [[0.28, 0.52], [0.38, 0.55], [0.32, 0.88], [0.25, 0.75]];
      const africa = [[0.46, 0.45], [0.58, 0.48], [0.55, 0.82], [0.48, 0.85], [0.42, 0.65]];
      const eurasia = [[0.48, 0.12], [0.88, 0.15], [0.92, 0.38], [0.75, 0.55], [0.52, 0.48]];
      const australia = [[0.78, 0.65], [0.88, 0.72], [0.85, 0.88], [0.75, 0.82]];

      [nAmerica, sAmerica, africa, eurasia, australia].forEach(c => drawContinent(c, 0.9));

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();
    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(5, 128, 128); // Higher segment count for smoothness
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 0.6,
      transparent: true,
      roughness: 0.8,
      metalness: 0.2
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.rotation.y = -Math.PI / 3.5; 
    planetGroup.add(planet);

    // Fresnel Atmospheric Atmospheric Scattering
    const atmoGeo = new THREE.SphereGeometry(5.25, 128, 128);
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
          intensity = pow( 0.6 - dot(vNormal, vNormel), 4.5 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          gl_FragColor = vec4( glowColor, intensity );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmosphere);
    scene.add(planetGroup);

    // --- 3. REALISTIC URBAN MATRIX ---
    const cityGroup = new THREE.Group();
    const buildingCount = 450;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({ color: "#050508", transparent: true, roughness: 0.4 });

    for (let i = 0; i < buildingCount; i++) {
      const h = 8 + Math.random() * 25;
      const w = 3 + Math.random() * 5;
      const d = 3 + Math.random() * 5;
      const building = new THREE.Mesh(boxGeo, buildingMat);
      building.scale.set(w, h, d);
      building.position.set((Math.random() - 0.5) * 400, h / 2 - 40, (Math.random() - 0.5) * 400);
      cityGroup.add(building);

      // Realistic Window Clusters
      const winCount = 20;
      const winGeo = new THREE.BufferGeometry();
      const winPos = new Float32Array(winCount * 3);
      for(let j = 0; j < winCount; j++) {
        winPos[j*3] = (Math.random() - 0.5) * (w + 0.15);
        winPos[j*3+1] = (Math.random() - 0.5) * h;
        winPos[j*3+2] = (Math.random() - 0.5) > 0 ? (d/2 + 0.15) : (-d/2 - 0.15);
      }
      winGeo.setAttribute('position', new THREE.BufferAttribute(winPos, 3));
      const winPoints = new THREE.Points(winGeo, new THREE.PointsMaterial({ color: "#C41BFD", size: 0.25, transparent: true, opacity: 0.8 }));
      building.add(winPoints);
    }
    scene.add(cityGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x151525, 2.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight("#C41BFD", 100, 1000);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);

    const animate = () => {
      requestAnimationFrame(animate);

      const z = cameraZ.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.lookAt(0, -cY * 0.15, 0);

      planetGroup.rotation.y += 0.0003;
      planetGroup.scale.set(pSc, pSc, pSc);
      planetMat.opacity = pOp;
      atmoMat.uniforms.viewVector.value = camera.position;

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
  }, [cameraZ, planetOpacity, planetScale, cityOpacity, cityY, starOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
