/// <reference types="@react-three/fiber" />
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Define custom R3F elements
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const DirectionalLight = 'directionalLight' as any;
const ScenePrimitive = 'primitive' as any;

function Statue({ color }: { color: string }) {
  const mesh = useRef<THREE.Group>(null);
  const { scene } = useGLTF('models/model.glb');
  
  // Detect if color is white (top of page) to trigger the red shadow effect
  const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white';

  useMemo(() => {
    const toonMaterial = new THREE.MeshToonMaterial({
      color: color,
      emissive: isWhite ? '#ff0000' : color, // Red glow when white
      emissiveIntensity: isWhite ? 0.3 : 0.1,
    });

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = toonMaterial;
      }
    });
  }, [scene, color, isWhite]);

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
    <group>
      <ScenePrimitive 
        ref={mesh} 
        object={scene} 
        scale={2.8} 
        position={[0, -1.2, 0]} 
      />
      {/* Dynamic Red Shadow when white */}
      {isWhite && (
        <ContactShadows 
          position={[0, -1.2, 0]} 
          opacity={0.8} 
          scale={10} 
          blur={2.5} 
          far={4} 
          color="#ff0000" 
        />
      )}
    </group>
  );
}

export default function StatueBackground({ color }: { color: string }) {
  const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white';

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

      {/* Thicker Manga Dot (Halftone) Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.25]" 
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1.5px, transparent 1.5px)`,
          backgroundSize: '6px 6px',
          color: isWhite ? '#ff0000' : color, // Dots turn red when white to match the shadow request
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
        }}
      />
      
      {/* Depth Shadow */}
      <div className="absolute inset-0 shadow-[inner_0_0_150px_rgba(0,0,0,0.15)] pointer-events-none" />
    </div>
  );
}
