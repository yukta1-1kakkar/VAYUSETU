import React, { useState } from 'react';
import { GlobeScene } from '../globe/GlobeScene';
import { IndiaGeoMapRadar } from '../command-center/IndiaGeoMapRadar';
import { CircularStateRadar } from '../command-center/CircularStateRadar';
import { Globe, MapPin, Radio, Sparkles, Layers, Maximize2, RotateCw } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const Part2_InteractiveGeospatialMatrix: React.FC<{
  onSelectRouteId?: (routeId: string) => void;
}> = ({ onSelectRouteId }) => {
  const [matrixMode, setMatrixMode] = useState<'3d_globe' | 'india_map' | 'circular_radar'>('3d_globe');

  return (
    <section id="part2-geospatial" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>PART 02 // 3-IN-1 GEOSPATIAL & NATIONAL AVIATION MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-space text-white tracking-tight">
            Sub-Continent Flight Network Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Switch between 3D Spherical Cosmos, Complete 28-State Geographic Vector Map, and 360° Orbital State Radar.
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              soundFx.playClick();
              setMatrixMode('3d_globe');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              matrixMode === '3d_globe'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3D GLOBE</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setMatrixMode('india_map');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              matrixMode === 'india_map'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>INDIA GEO MAP</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setMatrixMode('circular_radar');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              matrixMode === 'circular_radar'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>360° ORBIT RADAR</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {matrixMode === '3d_globe' && (
        <div className="tech-panel p-4 rounded-2xl relative overflow-hidden h-96 sm:h-[540px] w-full border border-indigo-500/20">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-300 font-mono text-[11px] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>3D SUB-CONTINENT TELEMETRY GLOBE</span>
          </div>

          <div className="absolute top-4 right-4 z-20 font-mono text-[11px] text-slate-400 hidden sm:block bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
            DRAG TO ROTATE 360° // HOVER HUBS FOR LIVE HUD
          </div>

          <div className="w-full h-full">
            <GlobeScene
              cameraPreset="india_focus"
              onSelectRoute={(id) => {
                soundFx.playAlert();
                if (onSelectRouteId) onSelectRouteId(id);
              }}
            />
          </div>
        </div>
      )}

      {matrixMode === 'india_map' && (
        <IndiaGeoMapRadar onSelectRouteId={onSelectRouteId} />
      )}

      {matrixMode === 'circular_radar' && (
        <CircularStateRadar onSelectRouteId={onSelectRouteId} />
      )}
    </section>
  );
};
