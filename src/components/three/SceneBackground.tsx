
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
    
    const distance = 20;
    camera.position.set(0, 0, distance);

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

    // ===== PLANET MATERIAL =====
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

    // ===== ANIMATION =====
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isTransitioned) {
        planet.rotation.y += 0.0015;
        atmosphere.rotation.y += 0.0015;
      }
      renderer.render(scene, camera);
    };
    animate();

    // ===== RESIZE =====
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
      planet.geometry.dispose();
      atmosphere.geometry.dispose();
    };
  }, []);

  // ===== HANDLE TRANSITION =====
  useEffect(() => {
    if (isTransitioned && planetRef.current && atmosphereRef.current) {
      const tl = gsap.timeline();
      
      tl.to([planetRef.current.rotation, atmosphereRef.current.rotation], {
        y: planetRef.current.rotation.y + Math.PI * 4,
        duration: 1.5,
        ease: "power2.inOut"
      });

      tl.to([planetRef.current.scale, atmosphereRef.current.scale], {
        x: 0.4,
        y: 0.4,
        z: 0.4,
        duration: 1.5,
        ease: "power2.inOut"
      }, 0);

      tl.to([planetRef.current.position, atmosphereRef.current.position], {
        x: -12,
        duration: 1.5,
        ease: "power2.inOut"
      }, 0);
    }
  }, [isTransitioned]);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};
