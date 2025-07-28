import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const AnimatedSphere = () => {
  const sphereRef = useRef();
  const wireframeRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (sphereRef.current) {
      // More interesting rotation animation
      sphereRef.current.rotation.y = time * 0.5;
      sphereRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }
    
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = time * -0.3;
      wireframeRef.current.rotation.x = Math.cos(time * 0.2) * 0.1;
    }
  });

  return (
    <group>
      {/* Glowing core sphere */}
      <Sphere ref={sphereRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#ff6b35"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive="#ff4500"
          emissiveIntensity={0.3}
        />
      </Sphere>
      
      {/* Outer wireframe sphere */}
      <Sphere ref={wireframeRef} args={[2.3, 32, 32]}>
        <meshBasicMaterial
          color="#ffffff"
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </Sphere>
      
      {/* Larger outer wireframe */}
      <Sphere args={[2.8, 16, 16]}>
        <meshBasicMaterial
          color="#ffaa00"
          wireframe={true}
          transparent={true}
          opacity={0.1}
        />
      </Sphere>
    </group>
  );
};

const NetworkSphere = () => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        dpr={[1, 2]}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.3} />
        
        {/* Main light source - from top right */}
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={2} 
          color="#ffffff"
        />
        
        {/* Fill light - orange tone */}
        <pointLight 
          position={[-5, -5, 5]} 
          intensity={1} 
          color="#ff8800"
        />
        
        {/* Background light */}
        <pointLight 
          position={[0, 0, -10]} 
          intensity={0.5} 
          color="#4444ff"
        />
        
        <AnimatedSphere />
      </Canvas>
    </div>
  );
};

export default NetworkSphere;
