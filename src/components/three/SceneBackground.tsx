
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
  const moonRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  
  const startPositionsRef = useRef<Float32Array | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouse3DRef = useRef(new THREE.Vector3(0, 0, 0));
  
  const transitionRef = useRef({ progress: 1 });
  const timeRef = useRef(0);
  const starCount = 5000; // Slightly reduced for mobile performance

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
    sceneThree.add(new THREE.AmbientLight(0x222222));

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

    const planet = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), planetMaterial);
    planetRef.current = planet;
    planet.scale.set(0, 0, 0); 
    sceneThree.add(planet);

    // Client Logo Moon
    const moonMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true,
      side: THREE.DoubleSide,
      color: 0xffffff,
      opacity: 0.8
    });
    
    // Attempt to load client logo
    loader.load("/global.jpeg", (texture) => {
      moonMaterial.map = texture;
      moonMaterial.needsUpdate = true;
    });

    const moon = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), moonMaterial);
    moonRef.current = moon;
    moon.scale.set(0, 0, 0);
    sceneThree.add(moon);

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
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(6.4, 64, 64), atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    atmosphere.scale.set(0, 0, 0);
    sceneThree.add(atmosphere);

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
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.1, "#e9d5ff");
      gradient.addColorStop(0.4, "#7e22ce");
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
      size: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    sceneThree.add(stars);

    gsap.to(starMaterial, { opacity: 1, duration: 2, delay: 0.2 });

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      if (planetRef.current) planetRef.current.rotation.y += 0.003;
      if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.003;

      if (moonRef.current && planetRef.current && planetRef.current.scale.x > 0.1) {
        const orbitRadius = 6 * planetRef.current.scale.x + 2.5; 
        const speed = 0.4;
        moonRef.current.position.x = planetRef.current.position.x + Math.cos(timeRef.current * speed) * orbitRadius;
        moonRef.current.position.z = planetRef.current.position.z + Math.sin(timeRef.current * speed) * orbitRadius;
        moonRef.current.position.y = planetRef.current.position.y + Math.sin(timeRef.current * speed * 0.7) * 1.5;
        moonRef.current.lookAt(camera.position);
      }

      if (starsRef.current && startPositionsRef.current && targetPositionsRef.current) {
        const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
        const start = startPositionsRef.current;
        const target = targetPositionsRef.current;
        const p = transitionRef.current.progress;

        for (let i = 0; i < starCount; i++) {
          const ix = i * 3;
          positions[ix] = start[ix] + (target[ix] - start[ix]) * p + Math.sin(timeRef.current * 0.6 + i * 0.1) * 0.1;
          positions[ix + 1] = start[ix + 1] + (target[ix + 1] - start[ix + 1]) * p + Math.cos(timeRef.current * 0.5 + i * 0.15) * 0.1;
          positions[ix + 2] = start[ix + 2] + (target[ix + 2] - start[ix + 2]) * p;
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
    if (!planetRef.current || !atmosphereRef.current || !starsRef.current || !targetPositionsRef.current || !startPositionsRef.current || !moonRef.current) return;

    startPositionsRef.current.set(targetPositionsRef.current);
    const nextTargets = new Float32Array(starCount * 3);
    let index = 0;
    const isMobile = window.innerWidth < 768;
    const thickness = isMobile ? 0.15 : 0.25;

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
      const yPos = isMobile ? 1 : 0;
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 0, y: yPos, z: 0, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: isMobile ? 0.7 : 1, y: isMobile ? 0.7 : 1, z: isMobile ? 0.7 : 1, duration: 1.5 });
      gsap.to(moonRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 9 + Math.random() * 2;
        nextTargets[i * 3] = Math.cos(angle) * radius;
        nextTargets[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        nextTargets[i * 3 + 2] = Math.sin(angle) * radius;
      }
    } else {
      const isEven = scene % 2 === 0;
      const xPos = isMobile ? 0 : (isEven ? -6 : 6);
      const yPos = isMobile ? (scene === 9 ? 8 : -7) : 0;
      const planetScale = isMobile ? 0.35 : 0.5;
      
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: xPos, y: yPos, z: 0, duration: 1.5, ease: "power3.inOut" });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: planetScale, y: planetScale, z: planetScale, duration: 1.5 });
      
      // Moon only in Scene 4
      gsap.to(moonRef.current.scale, { x: scene === 4 ? 1 : 0, y: scene === 4 ? 1 : 0, z: scene === 4 ? 1 : 0, duration: 1 });

      // Star Formations
      const sCount = 1500;
      const xOff = isMobile ? 0 : (isEven ? 4.5 : -4.5);
      const yOff = isMobile ? 4.5 : 5.5;
      const w = isMobile ? 1.5 : 2.5;

      if (scene === 2 || scene === 4 || scene === 6 || scene === 8) { // Arrows / Geometric
        drawThickLine(-w, 1, 0, 0, sCount / 4, xOff, yOff);
        drawThickLine(0, 0, -w, -1, sCount / 4, xOff, yOff);
        drawThickLine(w, 1, 0, 0, sCount / 4, xOff, yOff);
        drawThickLine(0, 0, w, -1, sCount / 4, xOff, yOff);
      } else if (scene === 3 || scene === 5 || scene === 7) { // Bars / Points
        drawThickLine(-w, 0, w, 0, sCount / 3, xOff, yOff);
        drawThickLine(-w, 0.5, -w, -0.5, sCount / 6, xOff, yOff);
        drawThickLine(w, 0.5, w, -0.5, sCount / 6, xOff, yOff);
      } else if (scene === 9) { // Box / Shield
        drawThickLine(-2, 2, 2, 2, sCount / 10, 0, -2);
        drawThickLine(2, 2, 2, -2, sCount / 10, 0, -2);
        drawThickLine(2, -2, -2, -2, sCount / 10, 0, -2);
        drawThickLine(-2, -2, -2, 2, sCount / 10, 0, -2);
      }

      for (let i = index; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 20 + Math.random() * 30;
        nextTargets[i * 3] = Math.cos(a) * r;
        nextTargets[i * 3 + 1] = Math.sin(a) * r;
        nextTargets[i * 3 + 2] = (Math.random() - 0.5) * 50;
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
