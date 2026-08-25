import React, { useState } from 'react';
import { MarketOverview } from './MarketOverview';
import { RouteNetworkExplorer } from './RouteNetworkExplorer';
import { AnomalyEngine } from './AnomalyEngine';
import { IndexConstructionPipeline } from './IndexConstructionPipeline';
import { DataFoundationArchitecture } from './DataFoundationArchitecture';
import { RouteIntelligenceModal } from './RouteIntelligenceModal';
import { IndiaGeoMapRadar } from './IndiaGeoMapRadar';
import { CircularStateRadar } from './CircularStateRadar';
import { GlobeScene } from '../globe/GlobeScene';
import {
  Activity,
  Globe,
  AlertTriangle,
  Cpu,
  Server,
  Layers,
  Sparkles,
  MapPin,
  Radio,
  Compass
} from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const CommandCenterView: React.FC<{
  onSwitchToStory: () => void;
}> = ({ onSwitchToStory }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'circle' | 'routes' | 'anomaly' | 'pipeline' | 'sources'>('overview');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [radarMode, setRadarMode] = useState<'3d_globe' | 'circular_circle' | 'india_map'>('3d_globe');

  const tabs = [
    { id: 'overview', label: 'MARKET OVERVIEW', icon: Activity },
    { id: 'map', label: 'INDIA GEO MAP', icon: MapPin },
    { id: 'circle', label: '360° RADAR', icon: Radio },
    { id: 'routes', label: 'ROUTE EXPLORER', icon: Globe },
    { id: 'anomaly', label: 'ANOMALY ENGINE', icon: AlertTriangle },
    { id: 'pipeline', label: 'INDEX PIPELINE', icon: Cpu },
    { id: 'sources', label: 'DATA SOURCES', icon: Server },
  ];

  return (
    <div className="w-full min-h-screen bg-[#05070B] text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Top Command Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>SOVEREIGN INTELLIGENCE COMMAND CONSOLE // NATIONAL TELEMETRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-syne text-white tracking-tight">
            VAYUSETU LIVE COMMAND CENTER
          </h1>
        </div>

        {/* Global Action Switchers (3D Globe / 360° Circular / Complete India Geo Map) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                soundFx.playClick();
                setRadarMode('3d_globe');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                radarMode === '3d_globe'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D GLOBE
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setRadarMode('india_map');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                radarMode === 'india_map'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              INDIA MAP
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setRadarMode('circular_circle');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                radarMode === 'circular_circle'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              360° RADAR
            </button>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onSwitchToStory();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>STORY MODE</span>
          </button>
        </div>
      </div>

      {/* Primary Visual Display: 3D Globe (Default) OR Complete India Geo Map OR 360° Circular Radar */}
      {radarMode === '3d_globe' && (
        <div className="tech-panel p-4 rounded-3xl relative overflow-hidden h-80 sm:h-[480px] w-full border border-cyan-500/30">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#05070B]/80 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>3D SUB-CONTINENT TELEMETRY GLOBE</span>
          </div>

          <div className="absolute top-4 right-4 z-20 font-mono text-[11px] text-slate-400 hidden sm:block bg-[#05070B]/80 px-3 py-1 rounded-full border border-slate-800">
            DRAG TO ROTATE // HOVER HUBS FOR LIVE HUD
          </div>

          <div className="w-full h-full">
            <GlobeScene
              cameraPreset="india_focus"
              onSelectRoute={(id) => {
                soundFx.playAlert();
                setSelectedRouteId(id);
              }}
            />
          </div>
        </div>
      )}

      {radarMode === 'india_map' && (
        <IndiaGeoMapRadar
          onSelectRouteId={(id) => {
            soundFx.playAlert();
            setSelectedRouteId(id);
          }}
        />
      )}

      {radarMode === 'circular_circle' && (
        <CircularStateRadar
          onSelectRouteId={(id) => {
            soundFx.playAlert();
            setSelectedRouteId(id);
          }}
        />
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 font-mono text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && <MarketOverview />}
        {activeTab === 'map' && (
          <IndiaGeoMapRadar
            onSelectRouteId={(id) => {
              soundFx.playAlert();
              setSelectedRouteId(id);
            }}
          />
        )}
        {activeTab === 'circle' && (
          <CircularStateRadar
            onSelectRouteId={(id) => {
              soundFx.playAlert();
              setSelectedRouteId(id);
            }}
          />
        )}
        {activeTab === 'routes' && (
          <RouteNetworkExplorer onSelectRoute={(id) => setSelectedRouteId(id)} />
        )}
        {activeTab === 'anomaly' && (
          <AnomalyEngine onSelectRoute={(id) => setSelectedRouteId(id)} />
        )}
        {activeTab === 'pipeline' && <IndexConstructionPipeline />}
        {activeTab === 'sources' && <DataFoundationArchitecture />}
      </div>

      {/* Modal Route Intelligence Drawer */}
      {selectedRouteId && (
        <RouteIntelligenceModal
          routeId={selectedRouteId}
          onClose={() => setSelectedRouteId(null)}
        />
      )}
    </div>
  );
};
