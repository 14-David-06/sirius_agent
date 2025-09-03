'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function ThreeAnimation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: OrbitControls;
    geometry?: THREE.SphereGeometry;
    material?: THREE.MeshPhongMaterial;
    fresnelMaterial?: THREE.ShaderMaterial;
    mesh?: THREE.Mesh;
    composer?: EffectComposer;
    bloomPass?: UnrealBloomPass;
    clock: THREE.Clock;
    animationId?: number;
  }>({ clock: new THREE.Clock() });

  // Colores especificados
  const colors = ['#00B602', '#0154AC', '#00A3FF'];
  let currentColorIndex = 0;

  // Fresnel Shader Code
  const fresnelVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewDirection;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalMatrix * normal;
      vViewDirection = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fresnelFragmentShader = `
    uniform vec3 color;
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    uniform float opacity;

    varying vec3 vNormal;
    varying vec3 vViewDirection;

    void main() {
      float f = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(vViewDirection), normalize(vNormal)), fresnelPower);
      gl_FragColor = vec4(color * f, opacity);
    }
  `;

  const params = {
    radius: 1.5,
    widthSegments: 128,
    heightSegments: 128,
    noiseScale: 0.5,
    noiseStrength: 0.5,
    timeFactorX: 0.2,
    timeFactorY: 0.3,
    timeFactorZ: 0.1,
    colorChangeSpeed: 0.01,
    bloomStrength: 0.8,
    bloomRadius: 0.5,
    bloomThreshold: 0.0,
    useFresnel: false,
    fresnelBias: 0.1,
    fresnelScale: 1.0,
    fresnelPower: 2.0,
    fresnelOpacity: 0.25,
  };

  // Implementación del noise (simplificada)
  const noise = {
    noise: (x: number, y: number, z: number) => {
      return (Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453123) % 1;
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const { current: mount } = mountRef;
    const {
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000),
      renderer = new THREE.WebGLRenderer({ antialias: true }),
      clock
    } = sceneRef.current;

    // Setup scene
    scene.background = new THREE.Color(0x050505);
    
    // Setup camera
    camera.position.z = 5;
    
    // Setup renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight1.position.set(1, 1, 1).normalize();
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight2.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight2);

    // Setup materials
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(colors[0]),
      specular: 0xffffff,
      shininess: 100,
      flatShading: false,
    });

    const fresnelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(colors[0]) },
        fresnelBias: { value: params.fresnelBias },
        fresnelScale: { value: params.fresnelScale },
        fresnelPower: { value: params.fresnelPower },
        opacity: { value: params.fresnelOpacity }
      },
      vertexShader: fresnelVertexShader,
      fragmentShader: fresnelFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    // Create geometry and mesh
    const geometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments);
    const originalPositions = new Float32Array(geometry.getAttribute('position').array);
    geometry.userData = { originalPositions };

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Setup post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      params.bloomStrength,
      params.bloomRadius,
      params.bloomThreshold
    );
    composer.addPass(bloomPass);

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      geometry,
      material,
      fresnelMaterial,
      mesh,
      composer,
      bloomPass,
      clock
    };

    // Animation function
    let colorTransition = 0;
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      sceneRef.current.animationId = animationId;

      const elapsedTime = clock.getElapsedTime();
      const positionAttribute = geometry.getAttribute('position');
      const { originalPositions } = geometry.userData;

      // Apply noise distortion
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = originalPositions[i * 3];
        const y = originalPositions[i * 3 + 1];
        const z = originalPositions[i * 3 + 2];

        const nx = x * params.noiseScale + elapsedTime * params.timeFactorX;
        const ny = y * params.noiseScale + elapsedTime * params.timeFactorY;
        const nz = z * params.noiseScale + elapsedTime * params.timeFactorZ;

        const distortion = noise.noise(nx, ny, nz) * params.noiseStrength;
        const originalVector = new THREE.Vector3(x, y, z).normalize();

        positionAttribute.setXYZ(
          i,
          x + originalVector.x * distortion,
          y + originalVector.y * distortion,
          z + originalVector.z * distortion
        );
      }

      positionAttribute.needsUpdate = true;
      geometry.computeVertexNormals();

      // Rotation
      mesh.rotation.x += 0.0005 * Math.sin(elapsedTime * 0.1);
      mesh.rotation.y += 0.0007 * Math.cos(elapsedTime * 0.08);
      mesh.rotation.z += 0.0003 * Math.sin(elapsedTime * 0.15);

      // Color cycling between the 3 specified colors
      colorTransition += params.colorChangeSpeed;
      if (colorTransition >= 1) {
        colorTransition = 0;
        currentColorIndex = (currentColorIndex + 1) % colors.length;
      }

      const currentColor = new THREE.Color(colors[currentColorIndex]);
      const nextColor = new THREE.Color(colors[(currentColorIndex + 1) % colors.length]);
      const interpolatedColor = currentColor.lerp(nextColor, colorTransition);

      if (params.useFresnel) {
        fresnelMaterial.uniforms.color.value.copy(interpolatedColor);
      } else {
        material.color.copy(interpolatedColor);
      }

      controls.update();
      composer.render();
    };

    // Handle resize
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Handle double click for randomization
    const handleDoubleClick = async () => {
      const targetParams = {
        radius: THREE.MathUtils.randFloat(1.0, 2.5),
        noiseScale: THREE.MathUtils.randFloat(0.3, 1.5),
        noiseStrength: THREE.MathUtils.randFloat(0.2, 0.8),
        timeFactorX: THREE.MathUtils.randFloat(-0.5, 0.5),
        timeFactorY: THREE.MathUtils.randFloat(-0.5, 0.5),
        timeFactorZ: THREE.MathUtils.randFloat(-0.5, 0.5),
        colorChangeSpeed: THREE.MathUtils.randFloat(0.005, 0.02),
        bloomStrength: THREE.MathUtils.randFloat(0.3, 2.5),
        bloomRadius: THREE.MathUtils.randFloat(0.1, 0.8),
        bloomThreshold: THREE.MathUtils.randFloat(0.0, 0.6),
      };

      try {
        // Usar importación dinámica con type assertion
        const animeModule = await import('animejs');
        const animeFunction = (animeModule as never as { default: (...args: unknown[]) => unknown }).default;
        
        animeFunction({
          targets: params,
          ...targetParams,
          easing: 'easeOutSine',
          duration: 2000,
          update: () => {
            if (bloomPass) {
              bloomPass.strength = params.bloomStrength;
              bloomPass.radius = params.bloomRadius;
              bloomPass.threshold = params.bloomThreshold;
            }
          }
        });
      } catch {
        console.warn('Anime.js not available, skipping animation');
        // Fallback: apply changes immediately
        Object.assign(params, targetParams);
        if (bloomPass) {
          bloomPass.strength = params.bloomStrength;
          bloomPass.radius = params.bloomRadius;
          bloomPass.threshold = params.bloomThreshold;
        }
      }
    };

    mount.addEventListener('dblclick', handleDoubleClick);

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('dblclick', handleDoubleClick);
      
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      fresnelMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-screen bg-black"
      style={{ margin: 0, overflow: 'hidden' }}
    />
  );
}
