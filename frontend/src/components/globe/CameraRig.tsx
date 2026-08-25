import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export type CameraPreset = 'cinematic_intro' | 'india_focus' | 'market_overview' | 'anomaly_spotlight';

export const CameraRig: React.FC<{
  preset?: CameraPreset;
}> = ({ preset = 'india_focus' }) => {
  const targetPos = useRef(new THREE.Vector3(0, 0.4, 4.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.2, 0));

  useFrame(({ camera, pointer }) => {
    // Determine preset positions
    switch (preset) {
      case 'cinematic_intro':
        targetPos.current.set(0, 0.2, 6.5);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'india_focus':
        // Centered nicely on the Indian subcontinent
        targetPos.current.set(0.1, 0.35, 3.8);
        targetLookAt.current.set(0, 0.1, 0);
        break;
      case 'market_overview':
        // Tilted slightly to the right to leave space for asymmetric data panels on the left
        targetPos.current.set(1.2, 0.4, 4.4);
        targetLookAt.current.set(0.2, 0, 0);
        break;
      case 'anomaly_spotlight':
        // Zoom closer into trunk route corridor
        targetPos.current.set(-0.2, 0.45, 3.2);
        targetLookAt.current.set(-0.1, 0.2, 0);
        break;
    }

    // Subtle mouse parallax tilt
    const parallaxX = pointer.x * 0.35;
    const parallaxY = pointer.y * 0.25;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPos.current.x + parallaxX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPos.current.y + parallaxY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPos.current.z, 0.05);

    camera.lookAt(targetLookAt.current);
  });

  return null;
};
