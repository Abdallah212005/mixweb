
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
  const transitionRef = useRef({ progress: 1 });
  const timeRef = useRef(0);
  const starCount = 4000;

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

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vNormal; void main() { float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(0.7, 0.4, 1.0, 1.0) * intensity; }`,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(6.4, 64, 64), atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    atmosphere.scale.set(0, 0, 0);
    sceneThree.add(atmosphere);

    // Moon Logo Placeholder
    const moon = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    moonRef.current = moon;
    sceneThree.add(moon);

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
    const starMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xa855f7, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    sceneThree.add(stars);

    gsap.to([planet.scale, atmosphere.scale], { x: 1, y: 1, z: 1, duration: 2, ease: "expo.out" });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
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
          positions[ix] = start[ix] + (target[ix] - start[ix]) * p;
          positions[ix + 1] = start[ix + 1] + (target[ix + 1] - start[ix + 1]) * p;
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
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!planetRef.current || !atmosphereRef.current || !starsRef.current || !targetPositionsRef.current || !startPositionsRef.current) return;

    const isMobile = window.innerWidth < 768;
    startPositionsRef.current.set(targetPositionsRef.current);
    const nextTargets = new Float32Array(starCount * 3);

    if (scene === 1) {
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 0, y: isMobile ? 3 : 0, z: 0, duration: 1.5 });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: isMobile ? 0.6 : 1, y: isMobile ? 0.6 : 1, z: isMobile ? 0.6 : 1, duration: 1.5 });
      for (let i = 0; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 9 + Math.random() * 2;
        nextTargets[i * 3] = Math.cos(a) * r;
        nextTargets[i * 3 + 1] = (Math.random() - 0.5) * 2;
        nextTargets[i * 3 + 2] = Math.sin(a) * r;
      }
    } else if (scene === 9) {
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: 0, y: isMobile ? 12 : 10, z: -5, duration: 1.5 });
    } else {
      const isEven = scene % 2 === 0;
      const xPos = isMobile ? 0 : (isEven ? -6 : 6);
      const yPos = isMobile ? -8 : 0;
      gsap.to([planetRef.current.position, atmosphereRef.current.position], { x: xPos, y: yPos, z: 0, duration: 1.5 });
      gsap.to([planetRef.current.scale, atmosphereRef.current.scale], { x: isMobile ? 0.5 : 0.6, y: isMobile ? 0.5 : 0.6, z: isMobile ? 0.5 : 0.6, duration: 1.5 });
      
      for (let i = 0; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 15 + Math.random() * 10;
        nextTargets[i * 3] = Math.cos(a) * r;
        nextTargets[i * 3 + 1] = Math.sin(a) * r;
        nextTargets[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }

    targetPositionsRef.current.set(nextTargets);
    transitionRef.current.progress = 0;
    gsap.to(transitionRef.current, { progress: 1, duration: 1.8, ease: "power2.inOut" });

  }, [scene]);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
