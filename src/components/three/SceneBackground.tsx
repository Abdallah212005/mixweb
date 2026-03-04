
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 15,
    damping: 40,
    restDelta: 0.001
  });

  const cameraZ = useTransform(smoothProgress, [0, 0.35, 0.65, 0.85, 1], [40, 15, 6, 2.5, 2.0]);
  const cameraY = useTransform(smoothProgress, [0, 0.35, 0.65, 0.85, 1], [10, 4, 1.5, 0.5, 0.3]);
  const cameraX = useTransform(smoothProgress, [0.7, 0.85, 1], [0, 1.5, 0]); 
  
  const planetOpacity = useTransform(smoothProgress, [0.5, 0.75], [1, 0]);
  const planetScale = useTransform(smoothProgress, [0, 0.75], [1.8, 12]);
  const cityOpacity = useTransform(smoothProgress, [0.6, 0.85], [0, 1]);
  const cityY = useTransform(smoothProgress, [0.65, 0.95], [400, 0]);
  
  const starOpacity = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 0.65, 1], [0.8, 0.8, 0, 0, 0.1, 0.1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    scene.fog = new THREE.FogExp2("#000000", 0.012);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 15000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Stars
    const starCount = 6000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 8000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 8000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 8000;
      
      const mixedColor = new THREE.Color().setHSL(0.75 + Math.random() * 0.1, 1.0, 0.6);
      starColors[i * 3] = mixedColor.r;
      starColors[i * 3 + 1] = mixedColor.g;
      starColors[i * 3 + 2] = mixedColor.b;
    }
    
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({ 
      size: 1.5, 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.6, 
      blending: THREE.AdditiveBlending 
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Planet Group
    const planetGroup = new THREE.Group();
    const loader = new THREE.TextureLoader();
    
    loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      const planetMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1.0,
        metalness: 0.0,
        transparent: true
      });

      planetMat.onBeforeCompile = (shader) => {
        shader.uniforms.uOpacity = { value: 1.0 };
        shader.fragmentShader = `uniform float uOpacity;\n${shader.fragmentShader}`;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `
          vec4 texColor = texture2D(map, vMapUv);
          float brightness = (texColor.r + texColor.g + texColor.b)/3.0;

          if(brightness < 0.4){
            texColor.rgb *= vec3(0.08, 0.06, 0.15);
          } else {
            texColor.rgb = mix(texColor.rgb, vec3(0.4, 0.0, 0.7), 0.65);
          }

          diffuseColor *= texColor;
          diffuseColor.a *= uOpacity;
          `
        );
        planetMat.userData.shader = shader;
      };

      const planet = new THREE.Mesh(new THREE.SphereGeometry(6.5, 128, 128), planetMat);
      planetGroup.add(planet);

      // Sharp Atmosphere Glow
      const atmoGeo = new THREE.SphereGeometry(6.7, 128, 128);
      const atmoMat = new THREE.ShaderMaterial({
        uniforms: { 
          glowColor: { value: new THREE.Color("#9D00FF") }, 
          uOpacity: { value: 1.0 },
          sunDirection: { value: new THREE.Vector3(1.0, 0.25, 0.5).normalize() }
        },
        vertexShader: `
          varying float vIntensity;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize( normalMatrix * normal );
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vIntensity = pow( 0.7 - dot(vNormal, vec3(0,0,1.0)), 6.0 );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float uOpacity;
          uniform vec3 sunDirection;
          varying float vIntensity;
          varying vec3 vNormal;
          void main() {
            float sunBias = max(0.0, dot(vNormal, sunDirection));
            float directionalFactor = 0.0 + 3.5 * pow(sunBias, 3.5);
            gl_FragColor = vec4( glowColor, vIntensity * uOpacity * directionalFactor );
          }
        `,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
      });
      const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
      planetGroup.add(atmosphere);
      scene.add(planetGroup);
      
      planetGroup.userData.atmoMat = atmoMat;
      planetGroup.userData.planetMat = planetMat;
    });

    const sunGeo = new THREE.SphereGeometry(30, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(1000, 250, 500);
    scene.add(sunMesh);

    const cityGroup = new THREE.Group();
    scene.add(cityGroup);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x020205, metalness: 0.9, roughness: 0.1, transparent: true });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    for (let i = -1500; i <= 1500; i += 250) {
      for (let j = -1500; j <= 1500; j += 250) {
        const d = Math.sqrt(i * i + j * j);
        const h = 200 + (1500 - d) / 2 + Math.random() * 300;
        const b = new THREE.Mesh(boxGeo, buildingMat);
        b.scale.set(30 + Math.random() * 40, h, 30 + Math.random() * 40);
        b.position.set(i, h / 2 - 150, j);
        cityGroup.add(b);
      }
    }

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.set(400, 100, 200); 
    scene.add(sunLight);

    const subtleFill = new THREE.AmbientLight(0x050511, 0.1); 
    scene.add(subtleFill);

    const animate = () => {
      requestAnimationFrame(animate);
      
      camera.position.set(cameraX.get(), cameraY.get(), cameraZ.get());
      const p = smoothProgress.get();
      camera.lookAt(0, (p < 0.6) ? 0 : -0.25, (p > 0.75) ? 0.5 : 0);

      if (planetGroup) {
        planetGroup.rotation.y += 0.0015;
        planetGroup.scale.set(planetScale.get(), planetScale.get(), planetScale.get());
        
        const pMat = planetGroup.userData.planetMat;
        const aMat = planetGroup.userData.atmoMat;
        
        if (pMat && pMat.userData.shader) {
          pMat.userData.shader.uniforms.uOpacity.value = planetOpacity.get();
        }
        if (aMat) {
          aMat.uniforms.uOpacity.value = planetOpacity.get();
        }
      }
      
      cityGroup.position.y = cityY.get();
      buildingMat.opacity = cityOpacity.get();
      starMaterial.opacity = starOpacity.get();

      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
    };
  }, [cameraZ, cameraY, cameraX, planetOpacity, planetScale, cityOpacity, cityY, starOpacity, smoothProgress]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
