import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AIRPORTS, FLIGHT_ROUTES } from '../../mock/airfareData';
import { createFlightArc } from '../../utils/geo';

interface FlightArcsProps {
  radius?: number;
  highlightRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
}

export const FlightArcs: React.FC<FlightArcsProps> = ({
  radius = 2,
  highlightRouteId = null,
  onSelectRoute,
}) => {
  const particlesRef = useRef<THREE.Points>(null);

  // Pre-calculate arcs
  const routeData = useMemo(() => {
    return FLIGHT_ROUTES.map((route) => {
      const orig = AIRPORTS[route.origin];
      const dest = AIRPORTS[route.destination];
      if (!orig || !dest) return null;

      const { curve, points } = createFlightArc(
        orig.lat,
        orig.lng,
        dest.lat,
        dest.lng,
        radius,
        0.28
      );

      const isAnomaly = route.isAnomaly;
      const isHighlighted = highlightRouteId === route.id;
      const arcColor = isAnomaly ? '#F43F5E' : isHighlighted ? '#FFFFFF' : '#00F2FE';

      return {
        ...route,
        curve,
        points,
        arcColor,
        isAnomaly,
        isHighlighted,
      };
    }).filter(Boolean);
  }, [radius, highlightRouteId]);

  // Particle positions
  const particlesCount = routeData.length * 3;
  const { particleGeometry, particleProgress } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const progress = new Float32Array(particlesCount);

    let idx = 0;
    routeData.forEach((r, rIdx) => {
      for (let i = 0; i < 3; i++) {
        progress[idx] = (i / 3) + (rIdx * 0.15);
        const col = r?.isAnomaly ? new THREE.Color('#FB7185') : new THREE.Color('#FFFFFF');
        colors[idx * 3] = col.r;
        colors[idx * 3 + 1] = col.g;
        colors[idx * 3 + 2] = col.b;
        idx++;
      }
    });

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { particleGeometry: geo, particleProgress: progress };
  }, [routeData, particlesCount]);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

    let pIdx = 0;
    routeData.forEach((r) => {
      if (!r) return;
      for (let i = 0; i < 3; i++) {
        particleProgress[pIdx] = (particleProgress[pIdx] + delta * 0.18) % 1;
        const pt = r.curve.getPointAt(particleProgress[pIdx]);
        positions[pIdx * 3] = pt.x;
        positions[pIdx * 3 + 1] = pt.y;
        positions[pIdx * 3 + 2] = pt.z;
        pIdx++;
      }
    });

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Flight trajectory lines */}
      {routeData.map((route) => {
        if (!route) return null;
        const lineGeo = new THREE.BufferGeometry().setFromPoints(route.points);
        return (
          <primitive
            key={route.id}
            object={
              new THREE.Line(
                lineGeo,
                new THREE.LineBasicMaterial({
                  color: route.arcColor,
                  transparent: true,
                  opacity: route.isAnomaly ? 0.95 : 0.6,
                  blending: THREE.AdditiveBlending,
                })
              )
            }
            onClick={(e: any) => {
              e.stopPropagation();
              if (onSelectRoute) onSelectRoute(route.id);
            }}
          />
        );
      })}

      {/* Moving aircraft particles */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
