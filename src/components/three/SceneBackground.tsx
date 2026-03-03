
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
    scene.fog = new THREE.FogExp2("#020204", 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduced for performance
    containerRef.current.appendChild(renderer.domElement);

    // --- 1. Optimized Starfield ---
    const starCount = 3000; // Reduced from 10k
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

    // --- 2. Recognizable Earth Rendering ---
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048; // Reduced resolution for speed
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#010103';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawContinent = (path: number[][], color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        path.forEach(([x, y], i) => {
          const px = x * canvas.width;
          const py = y * canvas.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        
        // Glow effect
        ctx.strokeStyle = "rgba(196, 27, 253, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      // Earth-like continents
      const nAmerica = [[0.1, 0.2], [0.3, 0.2], [0.35, 0.4], [0.2, 0.45], [0.1, 0.3]];
      const sAmerica = [[0.25, 0.5], [0.35, 0.55], [0.3, 0.85], [0.2, 0.6]];
      const eurasia = [[0.45, 0.1], [0.85, 0.1], [0.9, 0.4], [0.55, 0.4], [0.5, 0.2]];
      const africa = [[0.4, 0.4], [0.6, 0.45], [0.55, 0.75], [0.45, 0.7]];
      const australia = [[0.75, 0.65], [0.9, 0.7], [0.85, 0.85], [0.75, 0.8]];

      [nAmerica, sAmerica, eurasia, africa, australia].forEach(c => drawContinent(c, "#C41BFD"));

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createEarthTexture();
    const planetGroup = new THREE.Group();
    const planetGeo = new THREE.SphereGeometry(5, 64, 64); // Reduced segments
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      emissive: new THREE.Color("#C41BFD"),
      emissiveIntensity: 1.2,
      transparent: true,
      roughness: 0.5,
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Fresnel Atmospheric Glow
    const atmoGeo = new THREE.SphereGeometry(5.2, 64, 64);
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
          intensity = pow( 0.5 - dot(vNormal, vNormel), 2.0 );
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

    // --- 3. Optimized Urban Grid ---
    const cityGroup = new THREE.Group();
    const buildingCount = 400; // Significantly reduced
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    
    // Batch material creation
    const buildingMat = new THREE.MeshStandardMaterial({ color: "#050508", transparent: true });

    for (let i = 0; i < buildingCount; i++) {
      const h = 5 + Math.random() * 20;
      const w = 2 + Math.random() * 4;
      const d = 2 + Math.random() * 4;
      
      const building = new THREE.Mesh(boxGeo, buildingMat);
      building.scale.set(w, h, d);
      building.position.set((Math.random() - 0.5) * 200, h / 2 - 20, (Math.random() - 0.5) * 200);
      cityGroup.add(building);

      // Simple Points for windows instead of thousands of individual meshes
      const winCount = 15;
      const winGeo = new THREE.BufferGeometry();
      const winPos = new Float32Array(winCount * 3);
      for(let j = 0; j < winCount; j++) {
          winPos[j*3] = (Math.random() - 0.5) * (w + 0.1);
          winPos[j*3+1] = (Math.random() - 0.5) * h;
          winPos[j*3+2] = (Math.random() - 0.5) > 0 ? (d/2 + 0.05) : (-d/2 - 0.05);
      }
      winGeo.setAttribute('position', new THREE.BufferAttribute(winPos, 3));
      const winPoints = new THREE.Points(winGeo, new THREE.PointsMaterial({ color: "#C41BFD", size: 0.2 }));
      building.add(winPoints);
    }

    scene.add(cityGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x101025, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);

      const z = cameraZ.get();
      const pOp = planetOpacity.get();
      const pSc = planetScale.get();
      const cOp = cityOpacity.get();
      const cY = cityY.get();

      camera.position.z = z;
      camera.lookAt(0, -cY * 0.1, 0);

      planetGroup.rotation.y += 0.0005;
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
      boxGeo.dispose();
      buildingMat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [cameraZ, planetOpacity, planetScale, cityOpacity, cityY, starOpacity]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
