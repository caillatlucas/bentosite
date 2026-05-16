/// <reference types="@react-three/fiber" />
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Define custom R3F elements to bypass JSX IntrinsicElements check
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;
const PointLight = 'pointLight' as any;
const ScenePrimitive = 'primitive' as any;

function Statue({ color }: { color: string }) {
  const mesh = useRef<THREE.Group>(null);
  // Using relative path to be compatible with both local and GitHub Pages
  const { scene } = useGLTF('models/model.glb');
  
  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.1,
          metalness: 0.5,
          emissive: color,
          emissiveIntensity: 0.5, // Increased glow
        });
      }
    });
  }, [scene, color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.15;
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      mesh.current.rotation.y += scrollY * 0.001;
      mesh.current.position.y = Math.sin(t) * 0.1;
    }
  });

  return (
    <ScenePrimitive 
      ref={mesh} 
      object={scene} 
      scale={2.8} 
      position={[0, -1.5, 0]} 
    />
  );
}

// Preload using relative path
useGLTF.preload('models/model.glb');

export default function StatueBackground({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <AmbientLight intensity={1.5} /> {/* Increased ambient light */}
        <SpotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <PointLight position={[-10, -10, -10]} intensity={1.5} />
        
        <React.Suspense fallback={null}>
          <Float speed={3} rotationIntensity={0.8} floatIntensity={1}>
            <Statue color={color} />
          </Float>
        </React.Suspense>
        
        <Environment preset="city" />
      </Canvas>
      {/* Subtle Noise Effect Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
    </div>
  );
}
