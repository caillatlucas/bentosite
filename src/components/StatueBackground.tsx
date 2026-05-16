/// <reference types="@react-three/fiber" />
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Define custom R3F elements for total compatibility
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const DirectionalLight = 'directionalLight' as any;
const ScenePrimitive = 'primitive' as any;
const Mesh = 'mesh' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

function DebugCube() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = ref.current.rotation.y += 0.01;
    }
  });
  return (
    <Mesh ref={ref} position={[-2, 0, 0]}>
      <BoxGeometry args={[0.5, 0.5, 0.5]} />
      <MeshStandardMaterial color="red" />
    </Mesh>
  );
}

function Statue({ color }: { color: string }) {
  const mesh = useRef<THREE.Group>(null);
  // Using relative path
  const { scene } = useGLTF('models/model.glb');
  
  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.1,
          metalness: 0.5,
          emissive: color,
          emissiveIntensity: 0.2,
        });
      }
    });
  }, [scene, color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.2;
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      mesh.current.rotation.y += scrollY * 0.002;
    }
  });

  return (
    <ScenePrimitive 
      ref={mesh} 
      object={scene} 
      scale={2.5} 
      position={[0, -1, 0]} 
    />
  );
}

export default function StatueBackground({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ background: 'transparent' }}>
      <Canvas 
        shadows={false} 
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ pointerEvents: 'none' }}
      >
        <AmbientLight intensity={1} />
        <PointLight position={[10, 10, 10]} intensity={1.5} />
        <DirectionalLight position={[-10, 5, 10]} intensity={1} />
        
        <React.Suspense fallback={null}>
          <Statue color={color} />
          {/* Debugging element */}
          <DebugCube />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
