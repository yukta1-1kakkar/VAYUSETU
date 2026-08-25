import React, { useState, useEffect } from 'react';
import { soundFx } from '../../utils/sound';
import { formatINR, formatDelta } from '../../utils/geo';
import {
  Activity,
  AlertTriangle,
  RotateCw,
  Compass,
  Radio,
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Plane
} from 'lucide-react';

export interface StateNode {
  id: string;
  name: string;
  hubCode: string;
  region: 'North' | 'West' | 'South' | 'East' | 'Central' | 'NE';
  avgFare: number;
  deltaPercent: number;
  activeRoutes: number;
  tier: 1 | 2;
  isAnomaly: boolean;
  anomalyText?: string;
  dailyCapacity: number;
  connections: string[]; // Connected hub codes
}

export const INDIAN_STATES_NETWORK: StateNode[] = [
  {
    id: 'st-delhi',
    name: 'Delhi NCR',
    hubCode: 'DEL',
    region: 'North',
    avgFare: 5680,
    deltaPercent: +5.2,
    activeRoutes: 84,
    tier: 1,
    isAnomaly: true,
    anomalyText: 'DEL-BOM corridor yield spike (+38.7%)',
    dailyCapacity: 1420,
    connections: ['BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'PNQ', 'AMD', 'GAU', 'SXR', 'JAI']
  },
  {
    id: 'st-punjab',
    name: 'Punjab / Chd',
    hubCode: 'IXC',
    region: 'North',
    avgFare: 5150,
    deltaPercent: +3.9,
    activeRoutes: 22,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 190,
    connections: ['DEL', 'BOM', 'BLR', 'HYD']
  },
  {
    id: 'st-jk',
    name: 'Jammu & Kashmir',
    hubCode: 'SXR',
    region: 'North',
    avgFare: 6780,
    deltaPercent: +14.2,
    activeRoutes: 18,
    tier: 2,
    isAnomaly: true,
    anomalyText: 'High seasonal tourism demand pressure',
    dailyCapacity: 140,
    connections: ['DEL', 'BOM', 'IXC']
  },
  {
    id: 'st-rajasthan',
    name: 'Rajasthan',
    hubCode: 'JAI',
    region: 'North',
    avgFare: 4920,
    deltaPercent: +2.8,
    activeRoutes: 24,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 210,
    connections: ['DEL', 'BOM', 'BLR', 'HYD', 'AMD']
  },
  {
    id: 'st-up',
    name: 'Uttar Pradesh',
    hubCode: 'LKO',
    region: 'North',
    avgFare: 4840,
    deltaPercent: +4.1,
    activeRoutes: 36,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 280,
    connections: ['DEL', 'BOM', 'BLR', 'CCU', 'HYD']
  },
  {
    id: 'st-assam',
    name: 'Assam & NE',
    hubCode: 'GAU',
    region: 'NE',
    avgFare: 6450,
    deltaPercent: +7.1,
    activeRoutes: 28,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 160,
    connections: ['DEL', 'CCU', 'BLR']
  },
  {
    id: 'st-bengal',
    name: 'West Bengal',
    hubCode: 'CCU',
    region: 'East',
    avgFare: 5350,
    deltaPercent: +6.8,
    activeRoutes: 46,
    tier: 1,
    isAnomaly: true,
    anomalyText: 'Pre-Durga Puja surge on DEL-CCU (+24.2%)',
    dailyCapacity: 410,
    connections: ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'GAU', 'BBI']
  },
  {
    id: 'st-odisha',
    name: 'Odisha',
    hubCode: 'BBI',
    region: 'East',
    avgFare: 5080,
    deltaPercent: +2.2,
    activeRoutes: 20,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 150,
    connections: ['DEL', 'CCU', 'BLR', 'HYD']
  },
  {
    id: 'st-telangana',
    name: 'Telangana',
    hubCode: 'HYD',
    region: 'South',
    avgFare: 4890,
    deltaPercent: +1.9,
    activeRoutes: 56,
    tier: 1,
    isAnomaly: false,
    dailyCapacity: 540,
    connections: ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'PNQ', 'COK', 'GOI']
  },
  {
    id: 'st-tamilnadu',
    name: 'Tamil Nadu',
    hubCode: 'MAA',
    region: 'South',
    avgFare: 4950,
    deltaPercent: +2.4,
    activeRoutes: 52,
    tier: 1,
    isAnomaly: false,
    dailyCapacity: 490,
    connections: ['DEL', 'BOM', 'BLR', 'HYD', 'CCU', 'COK']
  },
  {
    id: 'st-kerala',
    name: 'Kerala',
    hubCode: 'COK',
    region: 'South',
    avgFare: 4600,
    deltaPercent: +0.8,
    activeRoutes: 32,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 210,
    connections: ['DEL', 'BOM', 'BLR', 'HYD', 'MAA']
  },
  {
    id: 'st-karnataka',
    name: 'Karnataka',
    hubCode: 'BLR',
    region: 'South',
    avgFare: 5240,
    deltaPercent: +3.1,
    activeRoutes: 68,
    tier: 1,
    isAnomaly: false,
    dailyCapacity: 780,
    connections: ['DEL', 'BOM', 'HYD', 'MAA', 'CCU', 'PNQ', 'AMD', 'COK', 'GOI']
  },
  {
    id: 'st-goa',
    name: 'Goa',
    hubCode: 'GOI',
    region: 'West',
    avgFare: 5890,
    deltaPercent: +11.4,
    activeRoutes: 30,
    tier: 2,
    isAnomaly: true,
    anomalyText: 'Weekend leisure demand tightening',
    dailyCapacity: 240,
    connections: ['BOM', 'DEL', 'BLR', 'HYD']
  },
  {
    id: 'st-maharashtra',
    name: 'Maharashtra',
    hubCode: 'BOM',
    region: 'West',
    avgFare: 6120,
    deltaPercent: +8.4,
    activeRoutes: 112,
    tier: 1,
    isAnomaly: true,
    anomalyText: 'Severe trunk slot consolidation (BOM/PNQ)',
    dailyCapacity: 1270,
    connections: ['DEL', 'BLR', 'HYD', 'MAA', 'CCU', 'AMD', 'COK', 'GOI', 'JAI', 'LKO']
  },
  {
    id: 'st-gujarat',
    name: 'Gujarat',
    hubCode: 'AMD',
    region: 'West',
    avgFare: 4720,
    deltaPercent: -1.2,
    activeRoutes: 38,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 260,
    connections: ['DEL', 'BOM', 'BLR', 'HYD', 'JAI']
  },
  {
    id: 'st-mp',
    name: 'Madhya Pradesh',
    hubCode: 'IDR',
    region: 'Central',
    avgFare: 4650,
    deltaPercent: +1.4,
    activeRoutes: 26,
    tier: 2,
    isAnomaly: false,
    dailyCapacity: 170,
    connections: ['DEL', 'BOM', 'BLR', 'HYD']
  }
];

export const CircularStateRadar: React.FC<{
  onSelectRouteId?: (routeId: string) => void;
}> = ({ onSelectRouteId }) => {
  const [hoveredNode, setHoveredNode] = useState<StateNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<StateNode>(INDIAN_STATES_NETWORK[0]);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [filterTier, setFilterTier] = useState<'ALL' | 'TIER1' | 'ANOMALY'>('ALL');

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const filteredNodes = INDIAN_STATES_NETWORK.filter((node) => {
    if (filterTier === 'TIER1') return node.tier === 1;
    if (filterTier === 'ANOMALY') return node.isAnomaly;
    return true;
  });

  const totalCount = filteredNodes.length;
  const radius = 280;
  const center = 340;

  return (
    <div className="tech-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>RADIAL SUB-CONTINENT RADAR // 360° ORBITAL STATE MATRIX</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-sans text-white mt-1">
            All-States Radial Intelligence Network
          </h3>
        </div>

        {/* Filter Pills & Auto-Rotate Switcher */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
            {(['ALL', 'TIER1', 'ANOMALY'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  soundFx.playClick();
                  setFilterTier(t);
                }}
                className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                  filterTier === t
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'ALL 16 STATES' : t === 'TIER1' ? 'METRO HUBS' : 'ANOMALIES'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setAutoRotate(!autoRotate);
            }}
            className={`p-2 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              autoRotate
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Orbital Sweep Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span>{autoRotate ? 'SCANNING' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: SVG Circular Constellation on Left + Selected State Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: The 360° Circular Radar Diagram */}
        <div className="lg:col-span-8 flex items-center justify-center relative min-h-[480px] sm:min-h-[580px]">
          <div className="relative w-full max-w-[620px] aspect-square flex items-center justify-center">
            {/* SVG Radar Graphics */}
            <svg
              viewBox="0 0 680 680"
              className="w-full h-full select-none overflow-visible"
            >
              <defs>
                {/* Center Core Glow */}
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#2563EB" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                </radialGradient>

                {/* Radar Sweep Gradient */}
                <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Concentric Range Rings */}
              <circle cx={center} cy={center} r="90" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" fill="none" strokeDasharray="3 3" />
              <circle cx={center} cy={center} r="180" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" fill="none" />
              <circle cx={center} cy={center} r={radius} stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
              <circle cx={center} cy={center} r={radius + 32} stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" fill="none" />

              {/* Axis Crosshairs */}
              <line x1={center - radius - 20} y1={center} x2={center + radius + 20} y2={center} stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
              <line x1={center} y1={center - radius - 20} x2={center} y2={center + radius + 20} stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />

              {/* Rotating Radar Sweep Cone */}
              <g transform={`rotate(${rotationAngle} ${center} ${center})`}>
                <line x1={center} y1={center} x2={center + radius + 25} y2={center} stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.8" />
                <path
                  d={`M ${center} ${center} L ${center + radius + 25} ${center} A ${radius + 25} ${radius + 25} 0 0 0 ${center + (radius + 25) * Math.cos(-Math.PI / 6)} ${center + (radius + 25) * Math.sin(-Math.PI / 6)} Z`}
                  fill="url(#sweepGrad)"
                />
              </g>

              {/* Laser Connector Rays */}
              {filteredNodes.map((node, i) => {
                const angle = (i * (2 * Math.PI)) / totalCount - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                const isHovered = hoveredNode?.id === node.id;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <line
                    key={`ray-${node.id}`}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke={
                      node.isAnomaly
                        ? 'rgba(244, 63, 94, 0.4)'
                        : isSelected || isHovered
                        ? 'rgba(59, 130, 246, 0.8)'
                        : 'rgba(148, 163, 184, 0.1)'
                    }
                    strokeWidth={isSelected || isHovered ? 1.8 : 1}
                    strokeDasharray={isSelected ? 'none' : '2 2'}
                  />
                );
              })}

              {/* Inter-state Route Arcs */}
              {filteredNodes.map((node, i) => {
                const targetNode = hoveredNode || selectedNode;
                if (!targetNode || !targetNode.connections.includes(node.hubCode)) return null;

                const angle1 = (filteredNodes.findIndex((n) => n.id === targetNode.id) * (2 * Math.PI)) / totalCount - Math.PI / 2;
                const x1 = center + radius * Math.cos(angle1);
                const y1 = center + radius * Math.sin(angle1);

                const angle2 = (i * (2 * Math.PI)) / totalCount - Math.PI / 2;
                const x2 = center + radius * Math.cos(angle2);
                const y2 = center + radius * Math.sin(angle2);

                return (
                  <path
                    key={`arc-${node.id}`}
                    d={`M ${x1} ${y1} Q ${center} ${center} ${x2} ${y2}`}
                    fill="none"
                    stroke={targetNode.isAnomaly ? '#F43F5E' : '#3B82F6'}
                    strokeWidth="1.6"
                    strokeOpacity="0.6"
                    strokeDasharray="4 2"
                  />
                );
              })}

              {/* Central Core Circle */}
              <circle cx={center} cy={center} r="65" fill="url(#coreGlow)" />
              <circle cx={center} cy={center} r="45" fill="#0D1424" stroke="#3B82F6" strokeWidth="1.5" />
              <circle cx={center} cy={center} r="38" fill="none" stroke="rgba(59,130,246,0.25)" strokeWidth="1" strokeDasharray="3 3" />
            </svg>

            {/* Central Core HTML Typography Overlay */}
            <div
              onClick={() => {
                soundFx.playClick();
                setSelectedNode(INDIAN_STATES_NETWORK[0]);
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center cursor-pointer pointer-events-auto group select-none"
            >
              <span className="text-[9px] font-mono tracking-wider text-blue-400 font-semibold uppercase">
                VAYUSETU
              </span>
              <span className="text-2xl font-bold font-mono text-white group-hover:text-blue-300 transition-colors">
                113.6
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-medium">
                SOVEREIGN
              </span>
            </div>

            {/* Circular HTML State Nodes on the Orbit Periphery */}
            {filteredNodes.map((node, i) => {
              const angle = (i * (2 * Math.PI)) / totalCount - Math.PI / 2;
              const leftPercent = 50 + (radius / 340) * 50 * Math.cos(angle);
              const topPercent = 50 + (radius / 340) * 50 * Math.sin(angle);

              const isHovered = hoveredNode?.id === node.id;
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => {
                    setHoveredNode(node);
                    soundFx.playHover();
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedNode(node);
                    if (node.hubCode === 'DEL' || node.hubCode === 'BOM') {
                      if (onSelectRouteId) onSelectRouteId('DEL-BOM');
                    }
                  }}
                  className={`absolute z-30 cursor-pointer transition-all duration-150 select-none ${
                    isSelected || isHovered ? 'scale-110 z-40' : 'scale-95 hover:scale-105'
                  }`}
                >
                  {/* Node Capsule */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono tracking-wide shadow-md backdrop-blur-md transition-all ${
                      node.isAnomaly
                        ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/40'
                        : isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/30'
                        : isHovered
                        ? 'bg-slate-800 border-blue-400 text-white'
                        : 'bg-[#0E1626]/90 border-slate-700/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        node.isAnomaly
                          ? 'bg-rose-400 animate-pulse'
                          : isSelected
                          ? 'bg-white'
                          : node.tier === 1
                          ? 'bg-blue-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-bold text-white">{node.hubCode}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">{node.name.split(' ')[0]}</span>
                  </div>

                  {/* Micro Delta Pill below node */}
                  <div className="text-center mt-0.5">
                    <span
                      className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded ${
                        node.deltaPercent >= 10
                          ? 'text-rose-400 bg-rose-950/70 border border-rose-800/50'
                          : node.deltaPercent >= 0
                          ? 'text-blue-400 bg-blue-950/70 border border-blue-800/50'
                          : 'text-emerald-400 bg-emerald-950/70 border border-emerald-800/50'
                      }`}
                    >
                      {formatDelta(node.deltaPercent)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected State Detailed Dossier Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5" /> REGIONAL TELEMETRY DOSSIER
            </span>
            <span className="text-slate-400">{selectedNode.region} ZONE</span>
          </div>

          <div
            className={`p-6 rounded-xl border transition-all ${
              selectedNode.isAnomaly ? 'tech-panel-alert' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-2xl font-bold font-sans text-white flex items-center gap-2">
                  <span>{selectedNode.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    {selectedNode.hubCode}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Tier-{selectedNode.tier} Aviation Corridor // {selectedNode.activeRoutes} Monitored Routes
                </div>
              </div>

              <span
                className={`text-sm font-mono font-bold px-2 py-1 rounded ${
                  selectedNode.deltaPercent >= 10
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                }`}
              >
                {formatDelta(selectedNode.deltaPercent)}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">AVERAGE FARE</span>
                <span className="text-xl font-bold text-white">{formatINR(selectedNode.avgFare)}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">DAILY TRAFFIC</span>
                <span className="text-xl font-bold text-blue-300">{selectedNode.dailyCapacity} flights</span>
              </div>
            </div>

            {/* Anomaly Notice */}
            {selectedNode.isAnomaly && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">ACTIVE YIELD ANOMALY</span>
                  <span className="text-[11px] text-rose-300/80">{selectedNode.anomalyText}</span>
                </div>
              </div>
            )}

            {/* Connected Hubs Chips */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">
                CONNECTED CORRIDORS ({selectedNode.connections.length})
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {selectedNode.connections.map((c) => (
                  <span
                    key={c}
                    onClick={() => {
                      const matched = INDIAN_STATES_NETWORK.find((n) => n.hubCode === c);
                      if (matched) {
                        soundFx.playClick();
                        setSelectedNode(matched);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-blue-500 hover:text-white cursor-pointer transition-colors"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Inspect Route Action */}
            {(selectedNode.hubCode === 'DEL' || selectedNode.hubCode === 'BOM' || selectedNode.hubCode === 'CCU') && (
              <button
                onClick={() => {
                  soundFx.playAlert();
                  if (onSelectRouteId) {
                    onSelectRouteId(selectedNode.hubCode === 'CCU' ? 'DEL-CCU' : 'DEL-BOM');
                  }
                }}
                className="w-full mt-4 py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all cursor-pointer shadow-sm"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>INSPECT {selectedNode.hubCode} CORRIDORS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
