/// <reference types="@react-three/fiber" />
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Define custom R3F elements
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const DirectionalLight = 'directionalLight' as any;
const ScenePrimitive = 'primitive' as any;

function Statue({ color }: { color: string }) {
  const mesh = useRef<THREE.Group>(null);
  const { scene } = useGLTF('models/model.glb');
  
  useMemo(() => {
    // Create a Toon Material for Manga look
    const toonMaterial = new THREE.MeshToonMaterial({
      color: color,
      gradientMap: null, // Three.js will provide default 3-tone gradient
      emissive: color,
      emissiveIntensity: 0.1,
    });

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = toonMaterial;
      }
    });
  }, [scene, color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.15;
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      mesh.current.rotation.y += scrollY * 0.0015;
      mesh.current.position.y = Math.sin(t * 0.5) * 0.1 - 1.2;
    }
  });

  return (
    <ScenePrimitive 
      ref={mesh} 
      object={scene} 
      scale={2.8} 
      position={[0, -1.2, 0]} 
    />
  );
}

export default function StatueBackground({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ background: 'transparent' }}>
      <Canvas 
        shadows={false} 
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ pointerEvents: 'none' }}
      >
        <AmbientLight intensity={0.8} />
        <PointLight position={[10, 10, 10]} intensity={1} />
        <DirectionalLight position={[-5, 5, 5]} intensity={1.5} />
        
        <React.Suspense fallback={null}>
          <Statue color={color} />
        </React.Suspense>
      </Canvas>

      {/* Manga Dot (Halftone) Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15]" 
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
          color: color === '#ffffff' ? '#000000' : color,
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
        }}
      />
      
      {/* Light Inner Shadow for depth */}
      <div className="absolute inset-0 shadow-[inner_0_0_100px_rgba(0,0,0,0.1)] pointer-events-none" />
    </div>
  );
}
