
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface SceneBackgroundProps {
  scene: number;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ scene }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  
  const startPositionsRef = useRef<Float32Array | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  
  const transitionRef = useRef({ progress: 1 });
  const timeRef = useRef(0);
  const starCount = 6000;

  useEffect(() => {
    if (!containerRef.current) return;

    const sceneThree = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const purpleSun = new THREE.DirectionalLight(0xa855f7, 2.5);
    purpleSun.position.set(8, 4, 6);
    sceneThree.add(purpleSun);
    sceneThree.add(new THREE.AmbientLight(0x111111));

    const loader = new THREE.TextureLoader();
    const earthMap = loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg");
    const planetMaterial = new THREE.MeshStandardMaterial({ map: earthMap, roughness: 0.9, metalness: 0.1 });
    
    planetMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        vec3 baseColor = gl_FragColor.rgb;
        vec3 lightDir = normalize(vec3(8.0, 4.0, 6.0));
        float lightPower = dot(normalize(vNormal), lightDir);
        lightPower = clamp(lightPower, 0.0, 1.0);
        float shadowMask = smoothstep(0.0, 0.45, lightPower);
        vec3 litColor = mix(vec3(0.5, 0.1, 0.8), vec3(0.05, 0.05, 0.1), smoothstep(0.05, 0.25, baseColor.b - baseColor.r));
        gl_FragColor.rgb = mix(vec3(0.01, 0.01, 0.02), litColor, shadowMask);
        #include <dithering_fragment>
        `
      );
    };

    const planet = new THREE.Mesh(new THREE.SphereGeometry(6, 128, 128), planetMaterial);
    planetRef.current = planet;
    sceneThree.add(planet);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.7, 0.4, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(6.4, 128, 128), atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    sceneThree.add(atmosphere);

    const starCanvas = document.createElement("canvas");
    starCanvas.width = 64; starCanvas.height = 64;
    const ctx = starCanvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
      gradient.addColorStop(0, "white");
      gradient.addColorStop(0.3, "#d8b4fe");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 9 + Math.random() * 2;
      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      posArray[i * 3 + 2] = Math.sin(angle) * radius;
    }

    startPositionsRef.current = new Float32Array(posArray);
    targetPositionsRef.current = new Float32Array(posArray);

    starGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArray), 3));
    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      transparent: true,
      size: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    sceneThree.add(stars);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      if (planetRef.current) planetRef.current.rotation.y += 0.002;
      if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.002;

      if (starsRef.current && startPositionsRef.current && targetPositionsRef.current) {
        const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
        const start = startPositionsRef.current;
        const target = targetPositionsRef.current;
        const p = transitionRef.current.progress;

        for (let i = 0; i < starCount; i++) {
          const ix = i * 3;
          
          // Smooth Interpolation from CURRENT state to TARGET
          let baseX = start[ix] + (target[ix] - start[ix]) * p;
          let baseY = start[ix + 1] + (target[ix + 1] - start[ix + 1]) * p;
          let baseZ = start[ix + 2] + (target[ix + 2] - start[ix + 2]) * p;

          // Add Orbital Rotation specifically for scene 1 or as a subtle drift
          if (scene === 1 && p > 0.8) {
            const orbitSpeed = 0.1;
            const angle = timeRef.current * orbitSpeed + (i * 0.01);
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const r = Math.sqrt(baseX * baseX + baseZ * baseZ);
            baseX = Math.cos(angle) * r;
            baseZ = Math.sin(angle) * r;
          }

          // Subtle Breathing
          positions[ix] = baseX + Math.sin(timeRef.current * 0.5 + i) * 0.05;
          positions[ix + 1] = baseY + Math.cos(timeRef.current * 0.4 + i * 0.5) * 0.05;
          positions[ix + 2] = baseZ + Math.sin(timeRef.current * 0.3 + i * 0.2) * 0.05;
        }
        starsRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(sceneThree, camera);
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
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!planetRef.current || !atmosphereRef.current || !starsRef.current || !targetPositionsRef.current || !startPositionsRef.current) return;

    // STEP 1: CAPTURE CURRENT POSITIONS AS THE NEW START
    const currentAttr = starsRef.current.geometry.attributes.position.array as Float32Array;
    startPositionsRef.current.set(currentAttr);

    // STEP 2: CALCULATE NEW TARGETS
    const nextTargets = new Float32Array(starCount * 3);
    let index = 0;
    const thickness = 0.25;

    function drawThickLine(x1: number, y1: number, x2: number, y2: number, count: number, xOff: number, yOff: number) {
      for (let i = 0; i < count; i++) {
        if (index >= starCount) break;
        const t = i / count;
        let x = x1 + (x2 - x1) * t;
        let y = y1 + (y2 - y1) * t;
        const offset = (Math.random() - 0.5) * thickness;
        const dx = y2 - y1;
        const dy = -(x2 - x1);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        x += (dx / len) * offset;
        y += (dy / len) * offset;
        nextTargets[index * 3] = x + xOff;
        nextTargets[index * 3 + 1] = y + yOff;
        nextTargets[index * 3 + 2] = (Math.random() - 0.5) * 0.5;
        index++;
      }
    }

    if (scene === 1) {
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 0, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 1, y: 1, z: 1, duration: 1.5, ease: "power3.inOut" });

      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 9 + Math.random() * 2;
        nextTargets[i * 3] = Math.cos(angle) * radius;
        nextTargets[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        nextTargets[i * 3 + 2] = Math.sin(angle) * radius;
      }
    } else if (scene === 2) {
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: -6, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 0.5, y: 0.5, z: 0.5, duration: 1.5, ease: "power3.inOut" });

      const sCount = 1400;
      drawThickLine(-1.8, 1.5, -2.8, 0, sCount / 6, 4, 5.2);
      drawThickLine(-2.8, 0, -1.8, -1.5, sCount / 6, 4, 5.2);
      drawThickLine(0.6, 1.5, -0.6, -1.5, sCount / 4, 4, 5.2);
      drawThickLine(1.8, 1.5, 2.8, 0, sCount / 6, 4, 5.2);
      drawThickLine(2.8, 0, 1.8, -1.5, sCount / 6, 4, 5.2);

      for (let i = index; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 10 + Math.random() * 20;
        nextTargets[i * 3] = Math.cos(a) * r;
        nextTargets[i * 3 + 1] = Math.sin(a) * r;
        nextTargets[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
      }
    } else if (scene === 3) {
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 6, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 0.45, y: 0.45, z: 0.45, duration: 1.5, ease: "power3.inOut" });
      gsap.to(planetRef.current.rotation, { y: planetRef.current.rotation.y + Math.PI * 4, duration: 1.5, ease: "power2.inOut" });

      const sCount = 2000;
      // Drawing "P"
      drawThickLine(-3, 1.5, -3, -1.5, sCount / 6, -4, 5.2);
      drawThickLine(-3, 1.5, -1.5, 1.5, sCount / 10, -4, 5.2);
      drawThickLine(-1.5, 1.5, -1.5, 0, sCount / 10, -4, 5.2);
      drawThickLine(-1.5, 0, -3, 0, sCount / 10, -4, 5.2);
      
      // Drawing "S"
      drawThickLine(3, 1.5, 1, 1.5, sCount / 10, -4, 5.2);
      drawThickLine(1, 1.5, 1, 0, sCount / 10, -4, 5.2);
      drawThickLine(1, 0, 3, 0, sCount / 10, -4, 5.2);
      drawThickLine(3, 0, 3, -1.5, sCount / 10, -4, 5.2);
      drawThickLine(3, -1.5, 1, -1.5, sCount / 10, -4, 5.2);

      for (let i = index; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 15 + Math.random() * 30;
        nextTargets[i * 3] = Math.cos(a) * r;
        nextTargets[i * 3 + 1] = Math.sin(a) * r;
        nextTargets[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
      }
    }

    targetPositionsRef.current.set(nextTargets);
    
    // STEP 3: RESET AND RUN ANIMATION
    transitionRef.current.progress = 0;
    gsap.to(transitionRef.current, { 
      progress: 1, 
      duration: 1.8, 
      ease: "power2.inOut",
      onComplete: () => {
        // Stabilize start for next movement
        startPositionsRef.current?.set(targetPositionsRef.current!);
      }
    });

  }, [scene]);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
