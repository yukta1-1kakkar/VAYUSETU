import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { AIRPORTS } from '../../mock/airfareData';
import { latLngToVector3, formatINR } from '../../utils/geo';
import { soundFx } from '../../utils/sound';

interface CityNodesProps {
  radius?: number;
  selectedCity?: string | null;
  onSelectCity?: (cityCode: string) => void;
}

export const CityNodes: React.FC<CityNodesProps> = ({
  radius = 2,
  selectedCity = null,
  onSelectCity,
}) => {
  return (
    <group>
      {Object.values(AIRPORTS).map((apt) => {
        const basePos = latLngToVector3(apt.lat, apt.lng, radius);
        const stalkHeight = 0.16;
        const topPos = latLngToVector3(apt.lat, apt.lng, radius + stalkHeight);
        const isSelected = selectedCity === apt.code;

        const stalkGeo = new THREE.BufferGeometry().setFromPoints([basePos, topPos]);

        return (
          <group key={apt.code}>
            {/* Elevation Laser Stalk */}
            <primitive
              object={
                new THREE.Line(
                  stalkGeo,
                  new THREE.LineBasicMaterial({
                    color: isSelected ? '#FFFFFF' : '#00F2FE',
                    transparent: true,
                    opacity: 0.7,
                    blending: THREE.AdditiveBlending,
                  })
                )
              }
            />

            {/* Base Surface Ring */}
            <mesh position={basePos}>
              <ringGeometry args={[0.015, 0.03, 16]} />
              <meshBasicMaterial
                color="#00F2FE"
                side={THREE.DoubleSide}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Top Elevated Node Beacon */}
            <mesh
              position={topPos}
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                if (onSelectCity) onSelectCity(apt.code);
              }}
            >
              <sphereGeometry args={[0.022, 16, 16]} />
              <meshStandardMaterial
                color="#00F2FE"
                emissive="#00F2FE"
                emissiveIntensity={1.2}
              />
            </mesh>

            {/* Holographic 2D Tag Overlay */}
            <Html
              position={topPos}
              center
              distanceFactor={10}
              className="pointer-events-none select-none"
            >
              <div className="flex flex-col items-center -translate-y-6">
                <div className="px-2 py-0.5 rounded bg-[#05070B]/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold">{apt.code}</span>
                  <span className="text-slate-400 font-normal">{formatINR(apt.avgFare)}</span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
