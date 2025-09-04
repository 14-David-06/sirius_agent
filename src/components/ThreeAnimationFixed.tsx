'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function ThreeAnimation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
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

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Colores especificados
  const colors = ['#00B602', '#0154AC', '#00A3FF'];
  const currentColorIndexRef = useRef(Math.floor(Math.random() * colors.length)); // Usar useRef para persistir el valor

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

  // Función para obtener parámetros responsivos
  const getResponsiveParams = (isMobile: boolean) => ({
    radius: isMobile ? 1.2 : 1.5, // Esfera más pequeña en móvil
    widthSegments: isMobile ? 32 : 64, // Menos segmentos en móvil para mejor rendimiento
    heightSegments: isMobile ? 32 : 64,
    noiseScale: 1.2,
    noiseStrength: 0.05, // Mucho menos deformación
    timeFactorX: 0.02,
    timeFactorY: 0.03,
    timeFactorZ: 0.015,
    colorChangeSpeed: isMobile ? 0.008 : 0.002, // Mucho más rápido en móvil para que sea visible
    bloomStrength: isMobile ? 0.4 : 0.6, // Reducido significativamente el bloom
    bloomRadius: 0.3, // Reducido el radio del bloom
    bloomThreshold: 0.3, // Aumentado el threshold para menos brillo
    useFresnel: false,
    fresnelBias: 0.1,
    fresnelScale: 1.0,
    fresnelPower: 2.0,
    fresnelOpacity: 0.25,
  });

  // Implementación del noise más orgánico y fluido
  const noise = {
    noise: (x: number, y: number, z: number) => {
      // Múltiples capas para movimiento más orgánico
      const n1 = Math.sin(x * 0.5 + y * 0.3 + z * 0.2) * 0.5;
      const n2 = Math.sin(x * 1.1 + y * 0.7 + z * 0.4) * 0.3;
      const n3 = Math.sin(x * 2.3 + y * 1.4 + z * 0.8) * 0.15;
      const n4 = Math.sin(x * 4.7 + y * 2.8 + z * 1.6) * 0.05;
      return (n1 + n2 + n3 + n4) * 0.8;
    }
  };

  // Función de animación personalizada para transiciones ultra suaves
  const smoothTransition = (current: number, target: number, speed: number = 0.005) => {
    return current + (target - current) * speed;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const { current: mount } = mountRef;
    const params = getResponsiveParams(isMobile);
    
    console.log('isMobile:', isMobile, 'colorChangeSpeed:', params.colorChangeSpeed); // Debug
    const {
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(isMobile ? 70 : 75, mount.clientWidth / mount.clientHeight, 0.1, 1000),
      renderer = new THREE.WebGLRenderer({ antialias: true }),
      clock
    } = sceneRef.current;

    // Setup scene
    scene.background = new THREE.Color(0x050505);
    
    // Setup camera con mejor responsividad
    camera.position.z = isMobile ? 6 : 5; // Más lejos en móviles
    
    // Setup renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 2 : 3)); // Limitar pixel ratio en móvil
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Optimizaciones para móvil
    if (isMobile) {
      controls.enableZoom = false; // Deshabilitar zoom en móvil
      controls.maxPolarAngle = Math.PI * 0.7; // Limitar rotación vertical
      controls.minPolarAngle = Math.PI * 0.3;
      controls.enablePan = false; // Deshabilitar paneo en móvil
    }

    // Setup lighting más suave
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Reducido de 1.5 a 1.0
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2); // Reducido de 2.0 a 1.2
    directionalLight1.position.set(2, 2, 1).normalize();
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x8888ff, 0.5); // Reducido de 0.8 a 0.5
    directionalLight2.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight2);

    // Luz adicional para crear más atmósfera
    const hemisphereLight = new THREE.HemisphereLight(0x404040, 0x080808, 0.3); // Reducido de 0.5 a 0.3
    scene.add(hemisphereLight);

    // Setup materials
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(colors[currentColorIndexRef.current]), // Usar color aleatorio inicial
      specular: 0xffffff,
      shininess: 100,
      flatShading: false,
    });

    const fresnelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(colors[currentColorIndexRef.current]) }, // Usar color aleatorio inicial
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

    // Variables para animación fluida
    let colorTransition = 0;
    let targetParams = { ...params };
    let isTransitioning = false;
    let nextColorIndex = (currentColorIndexRef.current + 1) % colors.length;

    // Auto-variación sutil cada cierto tiempo
    let lastVariationTime = 0;
    const variationInterval = 45000; // 45 segundos

    // Animation function
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      sceneRef.current.animationId = animationId;

      const elapsedTime = clock.getElapsedTime();
      
      // Actualizar parámetros dinámicamente cada frame para asegurar responsividad
      const currentParams = getResponsiveParams(isMobile);
      params.colorChangeSpeed = currentParams.colorChangeSpeed;
      
      const positionAttribute = geometry.getAttribute('position');
      const { originalPositions } = geometry.userData;

      // Suavizar transiciones de parámetros
      if (isTransitioning) {
        params.noiseScale = smoothTransition(params.noiseScale, targetParams.noiseScale);
        params.noiseStrength = smoothTransition(params.noiseStrength, targetParams.noiseStrength);
        params.timeFactorX = smoothTransition(params.timeFactorX, targetParams.timeFactorX);
        params.timeFactorY = smoothTransition(params.timeFactorY, targetParams.timeFactorY);
        params.timeFactorZ = smoothTransition(params.timeFactorZ, targetParams.timeFactorZ);
        params.colorChangeSpeed = smoothTransition(params.colorChangeSpeed, targetParams.colorChangeSpeed);
        params.bloomStrength = smoothTransition(params.bloomStrength, targetParams.bloomStrength);
        params.bloomRadius = smoothTransition(params.bloomRadius, targetParams.bloomRadius);
        params.bloomThreshold = smoothTransition(params.bloomThreshold, targetParams.bloomThreshold);

        // Actualizar bloom
        if (bloomPass) {
          bloomPass.strength = params.bloomStrength;
          bloomPass.radius = params.bloomRadius;
          bloomPass.threshold = params.bloomThreshold;
        }

        // Verificar si la transición ha terminado
        const tolerance = 0.01;
        if (Math.abs(params.noiseScale - targetParams.noiseScale) < tolerance &&
            Math.abs(params.noiseStrength - targetParams.noiseStrength) < tolerance) {
          isTransitioning = false;
        }
      }

      // Apply noise distortion - más controlada
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = originalPositions[i * 3];
        const y = originalPositions[i * 3 + 1];
        const z = originalPositions[i * 3 + 2];

        const nx = x * params.noiseScale + elapsedTime * params.timeFactorX;
        const ny = y * params.noiseScale + elapsedTime * params.timeFactorY;
        const nz = z * params.noiseScale + elapsedTime * params.timeFactorZ;

        const distortion = noise.noise(nx, ny, nz) * params.noiseStrength;
        const originalVector = new THREE.Vector3(x, y, z);
        const normalizedVector = originalVector.clone().normalize();

        // Aplicar distorsión más suave y controlada
        const newPosition = originalVector.clone().add(
          normalizedVector.multiplyScalar(distortion)
        );

        positionAttribute.setXYZ(i, newPosition.x, newPosition.y, newPosition.z);
      }

      positionAttribute.needsUpdate = true;
      geometry.computeVertexNormals();

      // Rotación fluida y orgánica
      mesh.rotation.x += 0.002 * Math.sin(elapsedTime * 0.3);
      mesh.rotation.y += 0.003 * Math.cos(elapsedTime * 0.2);
      mesh.rotation.z += 0.001 * Math.sin(elapsedTime * 0.5);

      // Gradiente elegante con transiciones ultra suaves entre los 3 colores
      colorTransition += params.colorChangeSpeed;
      
      if (colorTransition >= 1) {
        colorTransition = 0;
        currentColorIndexRef.current = nextColorIndex;
        nextColorIndex = (currentColorIndexRef.current + 1) % colors.length;
        console.log('Color changed to:', colors[currentColorIndexRef.current], 'isMobile:', isMobile); // Debug
      }
      
      // Transición ultra suave y continua entre colores usando curva sinusoidal suavizada
      const currentColor = new THREE.Color(colors[currentColorIndexRef.current]);
      const nextColor = new THREE.Color(colors[nextColorIndex]);
      
      // Usar una curva más suave con múltiples funciones sinusoidales para transición ultra gradual
      const smoothProgress1 = 0.5 * (1 + Math.sin((colorTransition - 0.5) * Math.PI));
      const smoothProgress2 = smoothProgress1 * smoothProgress1 * (3 - 2 * smoothProgress1); // Smoothstep
      const ultraSmoothProgress = smoothProgress1 * 0.7 + smoothProgress2 * 0.3; // Combinación para máxima suavidad
      
      const finalColor = currentColor.clone().lerp(nextColor, ultraSmoothProgress);

      // Aplicar color con gradiente sutil
      if (params.useFresnel) {
        fresnelMaterial.uniforms.color.value.copy(finalColor);
      } else {
        material.color.copy(finalColor);
      }

      // Auto-variación sutil para mantener vida en la animación
      if (elapsedTime * 1000 - lastVariationTime > variationInterval && !isTransitioning) {
        lastVariationTime = elapsedTime * 1000;
        
        targetParams = {
          ...params,
          noiseScale: THREE.MathUtils.randFloat(isMobile ? 1.2 : 1.5, isMobile ? 2.0 : 2.5),
          noiseStrength: THREE.MathUtils.randFloat(0.06, isMobile ? 0.10 : 0.12),
          timeFactorX: THREE.MathUtils.randFloat(0.01, isMobile ? 0.020 : 0.025),
          timeFactorY: THREE.MathUtils.randFloat(0.015, isMobile ? 0.030 : 0.035),
          timeFactorZ: THREE.MathUtils.randFloat(0.008, 0.018),
          colorChangeSpeed: THREE.MathUtils.randFloat(isMobile ? 0.003 : 0.001, isMobile ? 0.006 : 0.003), // Mayor velocidad en móvil
          bloomStrength: THREE.MathUtils.randFloat(isMobile ? 0.3 : 0.4, isMobile ? 0.6 : 0.8), // Reducido el rango del bloom
          bloomRadius: THREE.MathUtils.randFloat(0.2, 0.5), // Reducido el rango del radio
        };
        
        isTransitioning = true;
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

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      window.removeEventListener('resize', handleResize);
      
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      fresnelMaterial.dispose();
      renderer.dispose();
    };
  }, [isMobile]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-screen bg-black"
      style={{ margin: 0, overflow: 'hidden' }}
    />
  );
}
