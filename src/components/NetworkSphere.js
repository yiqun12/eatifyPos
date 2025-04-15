import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const NetworkSphere = ({ size = 500, color = '#FF9900' }) => {
  const containerRef = useRef(null);
  const sphereRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    
    containerRef.current.appendChild(renderer.domElement);
    
    const geometry = new THREE.IcosahedronGeometry(1, 4);
    
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphereRef.current = sphere;
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#FFFFFF'),
      transparent: true,
      opacity: 0.5
    });
    
    const positions = geometry.attributes.position;
    const pointsArray = [];
    
    for (let i = 0; i < positions.count; i++) {
      pointsArray.push(new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      ));
    }
    
    const connectionsCount = Math.floor(pointsArray.length * 0.1);
    for (let i = 0; i < connectionsCount; i++) {
      const p1 = Math.floor(Math.random() * pointsArray.length);
      const p2 = Math.floor(Math.random() * pointsArray.length);
      
      if (p1 !== p2) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          pointsArray[p1],
          pointsArray[p2]
        ]);
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    }
    
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (sphereRef.current) {
        sphereRef.current.rotation.x += 0.002;
        sphereRef.current.rotation.y += 0.003;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [color]);
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        position: 'absolute',
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)'
      }}
    />
  );
};

export default NetworkSphere; 