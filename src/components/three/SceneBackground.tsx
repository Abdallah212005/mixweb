
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
  const basePositionsRef = useRef<Float32Array | null>(null);
  const timeRef = useRef(0);
  const starCount = 6000;

  useEffect(() => {
    if (!containerRef.current) return;

    const sceneThree = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const purpleSun = new THREE.DirectionalLight(0xa855f7, 2.5);
    purpleSun.position.set(8, 4, 6);
    sceneThree.add(purpleSun);

    const ambient = new THREE.AmbientLight(0x111111);
    sceneThree.add(ambient);

    // Planet Setup
    const loader = new THREE.TextureLoader();
    const earthMap = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
    );

    const planetMaterial = new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 0.9,
      metalness: 0.05,
    });

    planetMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        vec3 baseColor = gl_FragColor.rgb;
        vec3 lightDir = normalize(vec3(8.0, 4.0, 6.0));
        float lightPower = dot(normalize(vNormal), lightDir);
        lightPower = clamp(lightPower, 0.0, 1.0);
        float shadowMask = smoothstep(0.0, 0.45, lightPower);
        vec3 litColor = mix(vec3(0.6, 0.18, 0.85), vec3(0.07, 0.07, 0.09), smoothstep(0.05, 0.25, baseColor.b - baseColor.r));
        gl_FragColor.rgb = mix(vec3(0.02, 0.02, 0.03), litColor, shadowMask);
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
          float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.8, 0.3, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(6.5, 128, 128), atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    sceneThree.add(atmosphere);

    // Stars
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 64;
    starCanvas.height = 64;
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
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 9 + Math.random() * 1.5;
      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      starPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
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

    basePositionsRef.current = new Float32Array(starPositions);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (planetRef.current) planetRef.current.rotation.y += 0.0015;
      if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.0015;

      if (starsRef.current && basePositionsRef.current) {
        timeRef.current += 0.01;
        const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
        const base = basePositionsRef.current;
        for (let i = 0; i < starCount; i++) {
          const ix = i * 3;
          positions[ix] = base[ix] + Math.sin(timeRef.current * 0.5 + i * 0.1) * 0.04;
          positions[ix + 1] = base[ix + 1] + Math.cos(timeRef.current * 0.4 + i * 0.15) * 0.04;
          positions[ix + 2] = base[ix + 2] + Math.sin(timeRef.current * 0.3 + i * 0.2) * 0.05;
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
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planetMaterial.dispose();
      atmosphereMaterial.dispose();
      starMaterial.dispose();
    };
  }, []);

  useEffect(() => {
    if (!planetRef.current || !atmosphereRef.current || !starsRef.current) return;

    const tl = gsap.timeline();
    const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
    const targetPositions = new Float32Array(starCount * 3);
    const thickness = 0.25;
    let symbolIndex = 0;

    function drawThickLine(x1: number, y1: number, x2: number, y2: number, count: number, xOff: number, yOff: number) {
      for (let i = 0; i < count; i++) {
        if (symbolIndex >= starCount) break;
        const t = i / count;
        let x = x1 + (x2 - x1) * t;
        let y = y1 + (y2 - y1) * t;

        const offset = (Math.random() - 0.5) * thickness;
        const dx = y2 - y1;
        const dy = -(x2 - x1);
        const len = Math.sqrt(dx * dx + dy * dy);

        x += (dx / len) * offset;
        y += (dy / len) * offset;

        targetPositions[symbolIndex * 3] = x + xOff;
        targetPositions[symbolIndex * 3 + 1] = y + yOff;
        targetPositions[symbolIndex * 3 + 2] = (Math.random() - 0.5) * 0.3;
        symbolIndex++;
      }
    }

    if (scene === 1) {
      // Return to center orbit
      tl.to([planetRef.current.position, atmosphereRef.current.position], { x: 0, duration: 1.5, ease: "power3.inOut" });
      tl.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 1, y: 1, z: 1, duration: 1.5, ease: "power3.inOut" });

      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 9 + Math.random() * 1.5;
        targetPositions[i * 3] = Math.cos(angle) * radius;
        targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
        targetPositions[i * 3 + 2] = Math.sin(angle) * radius;
      }
    } else if (scene === 2) {
      // Web Dev </> Symbol
      tl.to([planetRef.current.position, atmosphereRef.current.position], { x: -6, duration: 1.5, ease: "power3.inOut" });
      tl.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 0.5, y: 0.5, z: 0.5, duration: 1.5, ease: "power3.inOut" });

      const symbolStarCount = 1400;
      drawThickLine(-1.8, 1.5, -2.8, 0, symbolStarCount / 6, 4, 5.2);
      drawThickLine(-2.8, 0, -1.8, -1.5, symbolStarCount / 6, 4, 5.2);
      drawThickLine(0.6, 1.5, -0.6, -1.5, symbolStarCount / 4, 4, 5.2);
      drawThickLine(1.8, 1.5, 2.8, 0, symbolStarCount / 6, 4, 5.2);
      drawThickLine(2.8, 0, 1.8, -1.5, symbolStarCount / 6, 4, 5.2);

      for (let i = symbolIndex; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 8 + Math.random() * 5;
        targetPositions[i * 3] = Math.cos(a) * r;
        targetPositions[i * 3 + 1] = Math.sin(a) * r;
        targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
    } else if (scene === 3) {
      // Digital Marketing "PS" Symbol
      tl.to([planetRef.current.position, atmosphereRef.current.position], { x: 6, duration: 1.5, ease: "power3.inOut" });
      tl.to([planetRef.current.scale, atmosphereRef.current.scale], { x: 0.5, y: 0.5, z: 0.5, duration: 1.5, ease: "power3.inOut" });

      const symbolStarCount = 1800;
      // Drawing a thick "P"
      drawThickLine(-3, 1.5, -3, -1.5, symbolStarCount / 6, -4, 5.2);
      drawThickLine(-3, 1.5, -1.5, 1.5, symbolStarCount / 10, -4, 5.2);
      drawThickLine(-1.5, 1.5, -1.5, 0, symbolStarCount / 10, -4, 5.2);
      drawThickLine(-1.5, 0, -3, 0, symbolStarCount / 10, -4, 5.2);
      
      // Drawing a thick "S"
      drawThickLine(3, 1.5, 1, 1.5, symbolStarCount / 10, -4, 5.2);
      drawThickLine(1, 1.5, 1, 0, symbolStarCount / 10, -4, 5.2);
      drawThickLine(1, 0, 3, 0, symbolStarCount / 10, -4, 5.2);
      drawThickLine(3, 0, 3, -1.5, symbolStarCount / 10, -4, 5.2);
      drawThickLine(3, -1.5, 1, -1.5, symbolStarCount / 10, -4, 5.2);

      for (let i = symbolIndex; i < starCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 8 + Math.random() * 5;
        targetPositions[i * 3] = Math.cos(a) * r;
        targetPositions[i * 3 + 1] = Math.sin(a) * r;
        targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
    }

    // Animate stars to new formation
    for (let i = 0; i < starCount; i++) {
      gsap.to(positions, {
        [i * 3]: targetPositions[i * 3],
        [i * 3 + 1]: targetPositions[i * 3 + 1],
        [i * 3 + 2]: targetPositions[i * 3 + 2],
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => {
          if (starsRef.current) starsRef.current.geometry.attributes.position.needsUpdate = true;
        },
        onComplete: () => {
          if (i === starCount - 1) basePositionsRef.current = new Float32Array(targetPositions);
        }
      });
    }

  }, [scene]);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
