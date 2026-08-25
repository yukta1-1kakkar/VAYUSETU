import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EarthGlobe } from './EarthGlobe';
import { FlightArcs } from './FlightArcs';
import { CityNodes } from './CityNodes';
import { StarField } from './StarField';
import { CameraRig, type CameraPreset } from './CameraRig';

interface GlobeSceneProps {
  cameraPreset?: CameraPreset;
  highlightRouteId?: string | null;
  selectedCity?: string | null;
  onSelectCity?: (code: string) => void;
  onSelectRoute?: (routeId: string) => void;
}

export const GlobeScene: React.FC<GlobeSceneProps> = ({
  cameraPreset = 'india_focus',
  highlightRouteId = null,
  selectedCity = null,
  onSelectCity,
  onSelectRoute,
}) => {
  return (
    <div className="w-full h-full relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <CameraRig preset={cameraPreset} />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          {/* Key light illuminating India from top-front-right */}
          <directionalLight position={[4, 5, 4]} intensity={1.8} color="#ffffff" />
          {/* Subtle cyan backlight for atmospheric rim effect */}
          <directionalLight position={[-5, -2, -3]} intensity={0.8} color="#00f2fe" />
          {/* Violet fill light */}
          <pointLight position={[0, -4, 2]} intensity={0.5} color="#8a2be2" />

          {/* 3D Cosmos and Earth system */}
          <StarField count={1000} />
          <EarthGlobe radius={1.9} />
          <FlightArcs
            radius={1.9}
            highlightRouteId={highlightRouteId}
            onSelectRoute={onSelectRoute}
          />
          <CityNodes
            radius={1.9}
            selectedCity={selectedCity}
            onSelectCity={onSelectCity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
