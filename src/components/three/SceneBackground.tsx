
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

    // ===== PLANET MATERIAL (Custom Shader) =====
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

        // Light direction calculation
        vec3 lightDir = normalize(vec3(8.0, 4.0, 6.0));
        float lightPower = dot(normalize(vNormal), lightDir);
        lightPower = clamp(lightPower, 0.0, 1.0);

        // Soft shadow mask
        float shadowMask = smoothstep(0.0, 0.45, lightPower);

        // Ocean vs Land Separation
        float oceanFactor = smoothstep(0.05, 0.25, baseColor.b - baseColor.r);
        oceanFactor = pow(oceanFactor, 2.0);

        // Charcoal ocean
        vec3 oceanColor = vec3(0.07, 0.07, 0.09);

        // Vibrant purple land
        vec3 landColor = vec3(0.6, 0.18, 0.85);

        vec3 litColor = mix(landColor, oceanColor, oceanFactor);

        // Balanced contrast
        litColor = pow(litColor, vec3(1.1));

        // Blend with shadow (not absolute black)
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

    // ===== STAR SYSTEM (3000 STARS) =====
    const starCount = 3000;
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
    
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 64;
    starCanvas.height = 64;
    const ctx = starCanvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
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
      if (!triggeredRef.current) {
        planet.rotation.y += 0.0015;
        atmosphere.rotation.y += 0.0015;
        stars.rotation.y += 0.004;
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

  // ===== HANDLE TRANSITION (3000 STAR MORPHING) =====
  useEffect(() => {
    if (isTransitioned && planetRef.current && atmosphereRef.current && starsRef.current) {
      triggeredRef.current = true;
      const tl = gsap.timeline();
      
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

      gsap.to(starsRef.current.rotation, {
        y: 0,
        duration: 1,
        ease: "power2.inOut"
      });

      const starCount = 3000;
      const positions = starsRef.current.geometry.attributes.position.array as Float32Array;

      function spread(v: number) {
        return v + (Math.random() - 0.5) * 0.06;
      }

      for (let i = 0; i < starCount; i++) {
        let section = i % 3;
        let progress = ((i / starCount) * 2); // Normalized 0 to 2 range for better math coverage

        let targetX = 0;
        let targetY = 0;
        let targetZ = 0;

        const offsetX = 4.5; // Offset to the right
        const offsetY = 1.8; // Align with text

        if (section === 0) {
          // <
          targetX = -1.5 + progress * 0.8;
          targetY = 1 - progress * 1.2;
        } else if (section === 1) {
          // /
          targetX = -0.2 + progress * 0.6;
          targetY = 1 - progress * 2;
        } else {
          // >
          targetX = 1.5 - progress * 0.8;
          targetY = -1 + progress * 1.2;
        }

        targetX = spread(targetX) + offsetX;
        targetY = spread(targetY) + offsetY;

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
