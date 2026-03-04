
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface SceneBackgroundProps {
  isTransitioned?: boolean;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ isTransitioned = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // ===== SCENE & CAMERA =====
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // Camera distance at 14 for a cinematic view
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    
    containerRef.current.appendChild(renderer.domElement);

    // ===== LIGHTING =====
    const purpleSun = new THREE.DirectionalLight(0xa855f7, 2.5);
    purpleSun.position.set(8, 4, 6);
    scene.add(purpleSun);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0x111111);
    scene.add(ambient);

    // ===== TEXTURES =====
    const loader = new THREE.TextureLoader();
    const earthMap = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
    );
    const bumpMap = loader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_bump_2048.jpg"
    );

    // ===== STAR GLOW TEXTURE (Custom Gradient) =====
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

    // ===== PLANET MATERIAL (Custom Shader Enhanced) =====
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: earthMap,
      bumpMap: bumpMap,
      bumpScale: 0.8,
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

        float oceanFactor = smoothstep(0.05, 0.25, baseColor.b - baseColor.r);
        oceanFactor = pow(oceanFactor, 2.0);

        vec3 oceanColor = vec3(0.07, 0.07, 0.09);
        vec3 landColor = vec3(0.6, 0.18, 0.85);

        vec3 litColor = mix(landColor, oceanColor, oceanFactor);
        litColor = pow(litColor, vec3(1.1));

        vec3 finalColor = mix(vec3(0.02, 0.02, 0.03), litColor, shadowMask);

        gl_FragColor.rgb = finalColor;

        #include <dithering_fragment>
        `
      );
    };

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(6, 128, 128),
      planetMaterial
    );
    planetRef.current = planet;
    scene.add(planet);

    // ===== ATMOSPHERE GLOW =====
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

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(6.5, 128, 128),
      atmosphereMaterial
    );
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);

    // ===== STAR SYSTEM (6000 STARS) =====
    const starCount = 6000;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 9 + Math.random() * 1.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      transparent: true,
      size: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    scene.add(stars);

    // ===== ANIMATION =====
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Continuous planet rotation
      if (planetRef.current) planetRef.current.rotation.y += 0.0015;
      if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.0015;
      
      // Rotate stars only if not transitioned
      if (!triggeredRef.current && starsRef.current) {
        starsRef.current.rotation.y += 0.004;
      }
      
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

  // ===== HANDLE TRANSITION (DOTTED SYMBOL MORPHING) =====
  useEffect(() => {
    if (isTransitioned && planetRef.current && atmosphereRef.current && starsRef.current) {
      triggeredRef.current = true;
      const tl = gsap.timeline();
      
      // Planet movement
      tl.to([planetRef.current.rotation, atmosphereRef.current.rotation], {
        y: planetRef.current.rotation.y + Math.PI * 4,
        duration: 1.2,
        ease: "power2.inOut"
      });

      tl.to([planetRef.current.scale, atmosphereRef.current.scale], {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        duration: 1.2,
        ease: "power2.inOut"
      }, 0);

      tl.to([planetRef.current.position, atmosphereRef.current.position], {
        x: -6,
        duration: 1.2,
        ease: "power2.inOut"
      }, 0);

      // Stop star rotation and morph
      gsap.to(starsRef.current.rotation, {
        y: 0,
        duration: 1,
        ease: "power2.inOut"
      });

      const starCount = 6000;
      const symbolStarCount = 1200; // Only use 1200 stars for the symbol
      const positions = starsRef.current.geometry.attributes.position.array as Float32Array;

      // ==== DEFINE PERFECTED </> SHAPE ====
      const shape = new THREE.Shape();
      const size = 1.2; 
      const gap = 1.6;

      // <
      shape.moveTo(-gap, size);
      shape.lineTo(-gap - 0.8, 0);
      shape.lineTo(-gap, -size);

      // /
      shape.moveTo(0.4, size);
      shape.lineTo(-0.4, -size);

      // >
      shape.moveTo(gap, size);
      shape.lineTo(gap + 0.8, 0);
      shape.lineTo(gap, -size);

      // Get points for the symbol
      const symbolPoints = shape.getSpacedPoints(symbolStarCount); 
      const centerX = 4.0; 
      const centerY = 5.2; 

      for (let i = 0; i < starCount; i++) {
        let targetX, targetY, targetZ;

        if (i < symbolStarCount) {
          // Stars that form the symbol
          const p = symbolPoints[i];
          targetX = p.x + centerX;
          targetY = p.y + centerY;
          targetZ = (Math.random() - 0.5) * 0.2; // Slight depth for 3D feel
        } else {
          // Remaining stars scattered around
          const a = Math.random() * Math.PI * 2;
          const r = 8 + Math.random() * 8; // Larger radius for background
          targetX = Math.cos(a) * r;
          targetY = Math.sin(a) * r;
          targetZ = (Math.random() - 0.5) * 5; // Deep starfield effect
        }

        gsap.to(positions, {
          [i * 3]: targetX,
          [i * 3 + 1]: targetY,
          [i * 3 + 2]: targetZ,
          duration: 1.8 + Math.random() * 0.4,
          ease: "power3.inOut",
          onUpdate: () => {
            if (starsRef.current) {
              starsRef.current.geometry.attributes.position.needsUpdate = true;
            }
          }
        });
      }
    }
  }, [isTransitioned]);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
