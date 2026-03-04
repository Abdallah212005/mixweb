
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

export const SceneBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Static state for now since we are on the first slide
  const cameraZ = 40;
  const cameraY = 10;
  const cameraX = 0;
  
  const planetOpacity = 1;
  const planetScale = 1.8;
  const starOpacity = 0.8;

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
      opacity: starOpacity, 
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
        shader.uniforms.uOpacity = { value: planetOpacity };
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

      // Sharper Atmosphere Glow
      const atmoGeo = new THREE.SphereGeometry(6.75, 128, 128);
      const atmoMat = new THREE.ShaderMaterial({
        uniforms: { 
          glowColor: { value: new THREE.Color("#C41BFD") }, 
          uOpacity: { value: planetOpacity },
          sunDirection: { value: new THREE.Vector3(1.0, 0.25, 0.5).normalize() }
        },
        vertexShader: `
          varying float vIntensity;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize( normalMatrix * normal );
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vIntensity = pow( 0.85 - dot(vNormal, vec3(0,0,1.0)), 6.0 );
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
            float directionalFactor = 0.1 + 4.5 * pow(sunBias, 4.0);
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

    const sunLight = new THREE.DirectionalLight(0xffffff, 4.0);
    sunLight.position.set(400, 100, 200); 
    scene.add(sunLight);

    const subtleFill = new THREE.AmbientLight(0x050511, 0.1); 
    scene.add(subtleFill);

    const animate = () => {
      requestAnimationFrame(animate);
      
      camera.position.set(cameraX, cameraY, cameraZ);
      camera.lookAt(0, 0, 0);

      if (planetGroup) {
        planetGroup.rotation.y += 0.0015;
        planetGroup.scale.set(planetScale, planetScale, planetScale);
      }
      
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
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};
