
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
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouse3DRef = useRef(new THREE.Vector3(0, 0, 0));
  
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
    planet.scale.set(0, 0, 0); // Start at scale 0 for intro
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
    atmosphere.scale.set(0, 0, 0); // Start at scale 0 for intro
    sceneThree.add(atmosphere);

    // Planet & Atmosphere Cinematic Intro
    gsap.to([planet.scale, atmosphere.scale], {
      x: 1,
      y: 1,
      z: 1,
      duration: 3,
      ease: "expo.out",
      delay: 0.5
    });

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
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
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
      depthWrite: false,
      opacity: 0
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    sceneThree.add(stars);

    // Stars Intro
    gsap.to(starMaterial, {
      opacity: 1,
      duration: 2,
      delay: 0.2
    });

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      const vector = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      mouse3DRef.current.copy(camera.position).add(dir.multiplyScalar(distance));
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      if (planetRef.current) planetRef.current.rotation.y += 0.003;
      if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.003;

      if (starsRef.current && startPositionsRef.current && targetPositionsRef.current) {
        const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
        const start = startPositionsRef.current;
        const target = targetPositionsRef.current;
        const p = transitionRef.current.progress;
        const mouse3D = mouse3DRef.current;

        for (let i = 0; i < starCount; i++) {
          const ix = i * 3;
          
          let baseX = start[ix] + (target[ix] - start[ix]) * p;
          let baseY = start[ix + 1] + (target[ix + 1] - start[ix + 1]) * p;
          let baseZ = start[ix + 2] + (target[ix + 2] - start[ix + 2]) * p;

          const dx = baseX - mouse3D.x;
          const dy = baseY - mouse3D.y;
          const dz = baseZ - mouse3D.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          const threshold = 16;
          
          let scatterX = 0;
          let scatterY = 0;
          let scatterZ = 0;

          if (distSq < threshold) {
            const force = (threshold - distSq) / threshold;
            const power = force * 2.5;
            scatterX = (dx / Math.sqrt(distSq)) * power;
            scatterY = (dy / Math.sqrt(distSq)) * power;
            scatterZ = (dz / Math.sqrt(distSq)) * power;
          }

          positions[ix] = baseX + scatterX + Math.sin(timeRef.current * 0.6 + i * 0.1) * 0.15;
          positions[ix + 1] = baseY + scatterY + Math.cos(timeRef.current * 0.5 + i * 0.15) * 0.15;
          positions[ix + 2] = baseZ + scatterZ + Math.sin(timeRef.current * 0.4 + i * 0.05) * 0.1;
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
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!planetRef.current || !atmosphereRef.current || !starsRef.current || !targetPositionsRef.current || !startPositionsRef.current) return;

    startPositionsRef.current.set(targetPositionsRef.current);

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
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 0, y: 0, z: 0, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 1, y: 1, z: 1, duration: 1.5, ease: "power3.inOut" });

      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 9 + Math.random() * 2;
        nextTargets[i * 3] = Math.cos(angle) * radius;
        nextTargets[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        nextTargets[i * 3 + 2] = Math.sin(angle) * radius;
      }
    } else if (scene === 2) {
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: -6, y: 0, z: 0, duration: 1.5, ease: "power3.inOut" });
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
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 6, y: 0, z: 0, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 0.45, y: 0.45, z: 0.45, duration: 1.5, ease: "power3.inOut" });
      gsap.to(planetRef.current.rotation, { y: planetRef.current.rotation.y + Math.PI * 4, duration: 1.5, ease: "power2.inOut" });

      const sCount = 2000;
      drawThickLine(-3, 1.5, -3, -1.5, sCount / 6, -4, 5.2);
      drawThickLine(-3, 1.5, -1.5, 1.5, sCount / 10, -4, 5.2);
      drawThickLine(-1.5, 1.5, -1.5, 0, sCount / 10, -4, 5.2);
      drawThickLine(-1.5, 0, -3, 0, sCount / 10, -4, 5.2);
      
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
        nextTargets[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    } else if (scene === 4) {
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 0, y: 10, z: -10, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 1.5, y: 1.5, z: 1.5, duration: 1.5, ease: "power3.inOut" });

      // Envelope Shape
      const sCount = 2500;
      drawThickLine(-3.5, 2, 3.5, 2, sCount / 10, 0, -2);
      drawThickLine(3.5, 2, 3.5, -2, sCount / 10, 0, -2);
      drawThickLine(3.5, -2, -3.5, -2, sCount / 10, 0, -2);
      drawThickLine(-3.5, -2, -3.5, 2, sCount / 10, 0, -2);
      drawThickLine(-3.5, 2, 0, 0, sCount / 10, 0, -2);
      drawThickLine(0, 0, 3.5, 2, sCount / 10, 0, -2);

      for (let i = index; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 20 + Math.random() * 40;
        nextTargets[i * 3] = Math.cos(a) * r;
        nextTargets[i * 3 + 1] = Math.sin(a) * r;
        nextTargets[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }

    targetPositionsRef.current.set(nextTargets);
    
    transitionRef.current.progress = 0;
    gsap.to(transitionRef.current, { 
      progress: 1, 
      duration: 1.8, 
      ease: "power2.inOut",
      onComplete: () => {
        startPositionsRef.current?.set(targetPositionsRef.current!);
      }
    });

  }, [scene]);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
