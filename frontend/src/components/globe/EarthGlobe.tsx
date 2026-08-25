import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const EarthGlobe: React.FC<{
  radius?: number;
  highlightIndia?: boolean;
}> = ({ radius = 2, highlightIndia = true }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  // Generate procedural dark blueprint texture with glowing cyan grid & India aura
  const globeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Deep luxury space darkness
    ctx.fillStyle = '#05070B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Latitude & Longitude grid lines
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // India regional bounding box on UV (Lat: 8° to 35°N, Lng: 68° to 97°E)
    const indiaX = ((78 + 180) / 360) * canvas.width;
    const indiaY = ((90 - 22) / 180) * canvas.height;

    // Glowing cyan aura around India
    const radialGrad = ctx.createRadialGradient(indiaX, indiaY, 10, indiaX, indiaY, 180);
    radialGrad.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
    radialGrad.addColorStop(0.3, 'rgba(79, 172, 254, 0.2)');
    radialGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(indiaX, indiaY, 180, 0, Math.PI * 2);
    ctx.fill();

    // High density telemetry micro-dots around Indian subcontinent
    ctx.fillStyle = 'rgba(0, 242, 254, 0.9)';
    for (let i = 0; i < 450; i++) {
      const px = indiaX + (Math.random() - 0.5) * 200;
      const py = indiaY + (Math.random() - 0.5) * 180;
      ctx.fillRect(px, py, 2, 2);
    }

    // Global scatter micro-dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 1000; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      ctx.fillRect(rx, ry, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Subtle continuous rotation
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.02;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.025;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.008;
    }
  });

  return (
    <group>
      {/* Main Dark Tech Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={globeTexture}
          roughness={0.7}
          metalness={0.4}
          color="#080F1E"
          emissive="#020814"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Atmospheric Outer Corona Halo */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.05, 48, 48]} />
        <meshBasicMaterial
          color="#00f2fe"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Fine Orbital Wireframe Shell */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[radius * 1.015, 32, 32]} />
        <meshStandardMaterial
          color="#4facfe"
          wireframe
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
