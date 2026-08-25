import React, { useState, useMemo } from 'react';
import { INDIAN_STATES_NETWORK, type StateNode } from './CircularStateRadar';
import { formatINR, formatDelta } from '../../utils/geo';
import { soundFx } from '../../utils/sound';
import {
  Compass,
  Radio,
  AlertTriangle,
  Plane,
  RotateCw,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';

const SVG_WIDTH = 920;
const SVG_HEIGHT = 1020;
const PADDING = 45;

export interface ExtendedStateNode extends StateNode {
  lat: number;
  lng: number;
  x: number;
  y: number;
  stateCode: string;
}

export const ALL_INDIAN_STATES_DATA: Array<Omit<ExtendedStateNode, 'x' | 'y'>> = [
  // NORTH
  { id: 'st-del', name: 'Delhi NCR', hubCode: 'DEL', stateCode: 'DL', region: 'North', lat: 28.5562, lng: 77.1000, avgFare: 5680, deltaPercent: +5.2, activeRoutes: 84, tier: 1, isAnomaly: true, anomalyText: 'DEL-BOM slot yield anomaly (+38.7%)', dailyCapacity: 1420, connections: ['BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'PNQ', 'AMD', 'GAU', 'SXR', 'IXL', 'JAI', 'LKO', 'PAT', 'DED'] },
  { id: 'st-jk', name: 'Jammu & Kashmir', hubCode: 'SXR', stateCode: 'JK', region: 'North', lat: 34.0058, lng: 74.7741, avgFare: 6780, deltaPercent: +14.2, activeRoutes: 18, tier: 2, isAnomaly: true, anomalyText: 'Peak seasonal valley demand surge', dailyCapacity: 140, connections: ['DEL', 'BOM', 'IXC', 'IXL'] },
  { id: 'st-ladakh', name: 'Ladakh (Leh)', hubCode: 'IXL', stateCode: 'LA', region: 'North', lat: 34.1359, lng: 77.5465, avgFare: 7420, deltaPercent: +8.9, activeRoutes: 12, tier: 2, isAnomaly: false, dailyCapacity: 80, connections: ['DEL', 'SXR', 'IXC'] },
  { id: 'st-punjab', name: 'Punjab & Chandigarh', hubCode: 'IXC', stateCode: 'PB', region: 'North', lat: 30.6735, lng: 76.7885, avgFare: 5150, deltaPercent: +3.9, activeRoutes: 22, tier: 2, isAnomaly: false, dailyCapacity: 190, connections: ['DEL', 'BOM', 'BLR', 'HYD', 'SXR'] },
  { id: 'st-uk', name: 'Uttarakhand (Dehradun)', hubCode: 'DED', stateCode: 'UK', region: 'North', lat: 30.1897, lng: 78.1803, avgFare: 4950, deltaPercent: +4.4, activeRoutes: 16, tier: 2, isAnomaly: false, dailyCapacity: 120, connections: ['DEL', 'BOM', 'BLR', 'LKO'] },
  { id: 'st-hp', name: 'Himachal Pradesh', hubCode: 'DHM', stateCode: 'HP', region: 'North', lat: 32.1651, lng: 76.2634, avgFare: 5890, deltaPercent: +6.1, activeRoutes: 10, tier: 2, isAnomaly: false, dailyCapacity: 60, connections: ['DEL', 'IXC'] },
  { id: 'st-up', name: 'Uttar Pradesh (Lucknow)', hubCode: 'LKO', stateCode: 'UP', region: 'North', lat: 26.7606, lng: 80.8893, avgFare: 4840, deltaPercent: +4.1, activeRoutes: 36, tier: 2, isAnomaly: false, dailyCapacity: 280, connections: ['DEL', 'BOM', 'BLR', 'CCU', 'HYD', 'PAT', 'VNS'] },
  { id: 'st-up-vns', name: 'Uttar Pradesh (Varanasi)', hubCode: 'VNS', stateCode: 'UP', region: 'North', lat: 25.4524, lng: 82.8593, avgFare: 4910, deltaPercent: +5.0, activeRoutes: 20, tier: 2, isAnomaly: false, dailyCapacity: 160, connections: ['DEL', 'BOM', 'CCU', 'HYD', 'LKO'] },
  { id: 'st-raj', name: 'Rajasthan (Jaipur)', hubCode: 'JAI', stateCode: 'RJ', region: 'North', lat: 26.8242, lng: 75.8122, avgFare: 4920, deltaPercent: +2.8, activeRoutes: 24, tier: 2, isAnomaly: false, dailyCapacity: 210, connections: ['DEL', 'BOM', 'BLR', 'HYD', 'AMD', 'GOI'] },

  // WEST
  { id: 'st-mah-bom', name: 'Maharashtra (Mumbai)', hubCode: 'BOM', stateCode: 'MH', region: 'West', lat: 19.0896, lng: 72.8656, avgFare: 6120, deltaPercent: +8.4, activeRoutes: 112, tier: 1, isAnomaly: true, anomalyText: 'Severe trunk slot consolidation (+38.7%)', dailyCapacity: 1050, connections: ['DEL', 'BLR', 'HYD', 'MAA', 'CCU', 'AMD', 'COK', 'GOI', 'PNQ', 'IXC', 'PAT', 'GAU', 'JAI', 'IDR'] },
  { id: 'st-mah-pnq', name: 'Maharashtra (Pune)', hubCode: 'PNQ', stateCode: 'MH', region: 'West', lat: 18.5821, lng: 73.9197, avgFare: 5120, deltaPercent: +4.0, activeRoutes: 34, tier: 2, isAnomaly: false, dailyCapacity: 220, connections: ['DEL', 'BLR', 'HYD', 'MAA', 'CCU', 'AMD', 'GOI'] },
  { id: 'st-guj', name: 'Gujarat (Ahmedabad)', hubCode: 'AMD', stateCode: 'GJ', region: 'West', lat: 23.0772, lng: 72.6347, avgFare: 4720, deltaPercent: -1.2, activeRoutes: 38, tier: 2, isAnomaly: false, dailyCapacity: 260, connections: ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'JAI'] },
  { id: 'st-goa', name: 'Goa', hubCode: 'GOI', stateCode: 'GA', region: 'West', lat: 15.3808, lng: 73.8313, avgFare: 5890, deltaPercent: +11.4, activeRoutes: 30, tier: 2, isAnomaly: true, anomalyText: 'Weekend coastal leisure surge', dailyCapacity: 240, connections: ['BOM', 'DEL', 'BLR', 'HYD', 'MAA', 'AMD'] },

  // SOUTH
  { id: 'st-kar', name: 'Karnataka (Bengaluru)', hubCode: 'BLR', stateCode: 'KA', region: 'South', lat: 13.1986, lng: 77.7066, avgFare: 5240, deltaPercent: +3.1, activeRoutes: 68, tier: 1, isAnomaly: false, dailyCapacity: 780, connections: ['DEL', 'BOM', 'HYD', 'MAA', 'CCU', 'PNQ', 'AMD', 'COK', 'GOI', 'VTZ', 'GAU', 'LKO', 'PAT'] },
  { id: 'st-tel', name: 'Telangana (Hyderabad)', hubCode: 'HYD', stateCode: 'TS', region: 'South', lat: 17.2403, lng: 78.4294, avgFare: 4890, deltaPercent: +1.9, activeRoutes: 56, tier: 1, isAnomaly: false, dailyCapacity: 540, connections: ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'PNQ', 'COK', 'GOI', 'VTZ', 'BBI', 'IDR'] },
  { id: 'st-tn', name: 'Tamil Nadu (Chennai)', hubCode: 'MAA', stateCode: 'TN', region: 'South', lat: 12.9941, lng: 80.1709, avgFare: 4950, deltaPercent: +2.4, activeRoutes: 52, tier: 1, isAnomaly: false, dailyCapacity: 490, connections: ['DEL', 'BOM', 'BLR', 'HYD', 'CCU', 'COK', 'VTZ', 'GOI', 'AMD'] },
  { id: 'st-ker', name: 'Kerala (Kochi)', hubCode: 'COK', stateCode: 'KL', region: 'South', lat: 10.1556, lng: 76.3906, avgFare: 4600, deltaPercent: +0.8, activeRoutes: 32, tier: 2, isAnomaly: false, dailyCapacity: 210, connections: ['DEL', 'BOM', 'BLR', 'HYD', 'MAA'] },
  { id: 'st-ap', name: 'Andhra Pradesh (Vizag)', hubCode: 'VTZ', stateCode: 'AP', region: 'South', lat: 17.7215, lng: 83.2245, avgFare: 4820, deltaPercent: +1.6, activeRoutes: 24, tier: 2, isAnomaly: false, dailyCapacity: 170, connections: ['HYD', 'BLR', 'DEL', 'MAA', 'CCU', 'BOM'] },

  // EAST & CENTRAL
  { id: 'st-wb', name: 'West Bengal (Kolkata)', hubCode: 'CCU', stateCode: 'WB', region: 'East', lat: 22.6547, lng: 88.4467, avgFare: 5350, deltaPercent: +6.8, activeRoutes: 46, tier: 1, isAnomaly: true, anomalyText: 'Pre-Durga Puja surge on DEL-CCU (+24.2%)', dailyCapacity: 410, connections: ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'GAU', 'BBI', 'PAT', 'IXR', 'IXA', 'IMF', 'IXZ'] },
  { id: 'st-odi', name: 'Odisha (Bhubaneswar)', hubCode: 'BBI', stateCode: 'OD', region: 'East', lat: 20.2444, lng: 85.8178, avgFare: 5080, deltaPercent: +2.2, activeRoutes: 20, tier: 2, isAnomaly: false, dailyCapacity: 150, connections: ['DEL', 'CCU', 'BLR', 'HYD', 'BOM'] },
  { id: 'st-bih', name: 'Bihar (Patna)', hubCode: 'PAT', stateCode: 'BR', region: 'East', lat: 25.5913, lng: 85.0880, avgFare: 5210, deltaPercent: +5.3, activeRoutes: 24, tier: 2, isAnomaly: false, dailyCapacity: 180, connections: ['DEL', 'BOM', 'BLR', 'CCU', 'HYD', 'LKO'] },
  { id: 'st-jhk', name: 'Jharkhand (Ranchi)', hubCode: 'IXR', stateCode: 'JH', region: 'East', lat: 23.3143, lng: 85.3217, avgFare: 4980, deltaPercent: +3.0, activeRoutes: 18, tier: 2, isAnomaly: false, dailyCapacity: 130, connections: ['DEL', 'CCU', 'BOM', 'BLR', 'HYD'] },
  { id: 'st-mp-idr', name: 'Madhya Pradesh (Indore)', hubCode: 'IDR', stateCode: 'MP', region: 'Central', lat: 22.7217, lng: 75.8011, avgFare: 4650, deltaPercent: +1.4, activeRoutes: 26, tier: 2, isAnomaly: false, dailyCapacity: 170, connections: ['DEL', 'BOM', 'BLR', 'HYD', 'AMD', 'GOI', 'LKO'] },
  { id: 'st-cg', name: 'Chhattisgarh (Raipur)', hubCode: 'RPR', stateCode: 'CG', region: 'Central', lat: 21.1804, lng: 81.7388, avgFare: 4790, deltaPercent: +2.1, activeRoutes: 16, tier: 2, isAnomaly: false, dailyCapacity: 120, connections: ['DEL', 'BOM', 'BLR', 'HYD', 'CCU'] },

  // NORTH-EAST & ISLANDS
  { id: 'st-ne-gau', name: 'Assam & North-East (Guwahati)', hubCode: 'GAU', stateCode: 'AS', region: 'NE', lat: 26.1061, lng: 91.5859, avgFare: 6450, deltaPercent: +7.1, activeRoutes: 28, tier: 2, isAnomaly: false, dailyCapacity: 160, connections: ['DEL', 'CCU', 'BLR', 'BOM', 'IXA', 'IMF'] },
  { id: 'st-ne-tri', name: 'Tripura (Agartala)', hubCode: 'IXA', stateCode: 'TR', region: 'NE', lat: 23.8869, lng: 91.2405, avgFare: 5410, deltaPercent: +4.2, activeRoutes: 12, tier: 2, isAnomaly: false, dailyCapacity: 90, connections: ['CCU', 'GAU', 'DEL'] },
  { id: 'st-ne-man', name: 'Manipur (Imphal)', hubCode: 'IMF', stateCode: 'MN', region: 'NE', lat: 24.7600, lng: 93.8967, avgFare: 6150, deltaPercent: +6.5, activeRoutes: 10, tier: 2, isAnomaly: false, dailyCapacity: 70, connections: ['CCU', 'GAU', 'DEL'] },
  { id: 'st-andaman', name: 'Andaman & Nicobar (Port Blair)', hubCode: 'IXZ', stateCode: 'AN', region: 'South', lat: 11.6410, lng: 92.7297, avgFare: 7890, deltaPercent: +9.8, activeRoutes: 14, tier: 2, isAnomaly: false, dailyCapacity: 85, connections: ['CCU', 'MAA', 'DEL', 'BLR', 'HYD'] },
];

function projectCoordinates(lat: number, lng: number): { x: number; y: number } {
  const minLng = 68.0;
  const maxLng = 97.4;
  const minLat = 8.0;
  const maxLat = 37.0;

  const usableWidth = SVG_WIDTH - 2 * PADDING;
  const usableHeight = SVG_HEIGHT - 2 * PADDING;

  const x = PADDING + ((lng - minLng) / (maxLng - minLng)) * usableWidth;
  const y = PADDING + ((maxLat - lat) / (maxLat - minLat)) * usableHeight;

  return { x, y };
}

export const IndiaGeoMapRadar: React.FC<{
  onSelectRouteId?: (routeId: string) => void;
}> = ({ onSelectRouteId }) => {
  const [selectedNode, setSelectedNode] = useState<ExtendedStateNode>(() => {
    const raw = ALL_INDIAN_STATES_DATA[0];
    const { x, y } = projectCoordinates(raw.lat, raw.lng);
    return { ...raw, x, y };
  });
  const [hoveredNode, setHoveredNode] = useState<ExtendedStateNode | null>(null);
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'METROS' | 'ANOMALIES' | 'NORTH' | 'SOUTH' | 'WEST' | 'EAST'>('ALL');
  const [showTrafficArcs, setShowTrafficArcs] = useState<boolean>(true);

  // Compute all state coordinates
  const allProjectedNodes = useMemo<ExtendedStateNode[]>(() => {
    return ALL_INDIAN_STATES_DATA.map((node) => {
      const { x, y } = projectCoordinates(node.lat, node.lng);
      return {
        ...node,
        x,
        y,
      };
    });
  }, []);

  const activeFocusNode = hoveredNode || selectedNode;

  const filteredNodes = allProjectedNodes.filter((node) => {
    if (regionFilter === 'METROS') return node.tier === 1;
    if (regionFilter === 'ANOMALIES') return node.isAnomaly;
    if (regionFilter === 'NORTH') return node.region === 'North';
    if (regionFilter === 'SOUTH') return node.region === 'South';
    if (regionFilter === 'WEST') return node.region === 'West';
    if (regionFilter === 'EAST') return node.region === 'East' || node.region === 'NE';
    return true;
  });

  return (
    <div className="tech-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>SOVEREIGN MAP OF INDIA // 28 STATES & MAJOR CORRIDORS</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-sans text-white mt-1">
            Complete Indian Airfare & Flight Network Map
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto">
            {(['ALL', 'METROS', 'ANOMALIES', 'NORTH', 'SOUTH', 'WEST', 'EAST'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  soundFx.playClick();
                  setRegionFilter(r);
                }}
                className={`px-2.5 py-1 rounded-md cursor-pointer transition-all whitespace-nowrap ${
                  regionFilter === r
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'ALL' ? 'ALL 28 HUBS' : r}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowTrafficArcs(!showTrafficArcs);
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              showTrafficArcs
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>{showTrafficArcs ? 'ARCS VISIBLE' : 'ARCS MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Map Canvas + State Intelligence Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Full India Map Viewport */}
        <div className="lg:col-span-8 relative bg-[#090E1A]/95 rounded-xl border border-slate-800 p-4 min-h-[580px] sm:min-h-[720px] flex items-center justify-center overflow-hidden shadow-xl">
          <div className="scanline-effect opacity-30" />

          {/* Floating HUD Badges */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-blue-300 font-mono text-[11px] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>GEOGRAPHIC TELEMETRY PROJECTION // EPSG:4326</span>
          </div>

          <div className="absolute bottom-4 left-4 z-20 font-mono text-[10px] text-slate-400 hidden sm:block bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800">
            CLICK TO PIN HUB // HOVER FOR DIRECT TRAJECTORY RAYS
          </div>

          {/* Authentic Detailed Vector Map of India */}
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-full max-h-[720px] select-none overflow-visible"
          >
            <defs>
              <radialGradient id="geoStateGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#2563EB" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="geoAnomalyGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.65" />
                <stop offset="60%" stopColor="#E11D48" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#9F1239" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Latitude & Longitude Coordinate Telemetry Grid */}
            {[10, 14, 18, 22, 26, 30, 34].map((lat) => {
              const { y } = projectCoordinates(lat, 78);
              return (
                <g key={`geo-lat-${lat}`}>
                  <line x1={PADDING} y1={y} x2={SVG_WIDTH - PADDING} y2={y} stroke="rgba(148, 163, 184, 0.06)" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={PADDING - 6} y={y + 3} fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="end">{lat}°N</text>
                </g>
              );
            })}

            {[70, 74, 78, 82, 86, 90, 94].map((lng) => {
              const { x } = projectCoordinates(22, lng);
              return (
                <g key={`geo-lng-${lng}`}>
                  <line x1={x} y1={PADDING} x2={x} y2={SVG_HEIGHT - PADDING} stroke="rgba(148, 163, 184, 0.06)" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={x} y={SVG_HEIGHT - PADDING + 16} fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">{lng}°E</text>
                </g>
              );
            })}

            {/* Complete Realistic India Sovereign Border Path */}
            <path
              d="
                M 230 100
                C 240 85, 270 80, 290 85
                C 310 90, 335 120, 340 145
                C 345 170, 320 185, 300 200
                C 285 210, 280 240, 260 255
                C 235 275, 215 315, 195 350
                C 180 375, 155 410, 140 440
                C 125 470, 150 490, 185 490
                C 210 490, 215 520, 205 550
                C 195 580, 215 620, 225 660
                C 235 700, 250 760, 280 810
                C 295 835, 315 850, 325 845
                C 335 840, 355 805, 375 765
                C 405 705, 430 645, 445 585
                C 460 525, 495 480, 530 450
                C 565 420, 555 385, 520 395
                C 485 405, 470 365, 465 330
                C 460 295, 500 280, 545 270
                C 590 260, 650 245, 715 220
                C 745 210, 765 235, 755 265
                C 745 295, 715 320, 680 330
                C 650 340, 630 365, 605 385
                C 580 405, 545 400, 520 385
                C 485 365, 445 320, 395 270
                C 355 230, 315 190, 290 145
                Z
              "
              fill="rgba(59, 130, 246, 0.02)"
              stroke="rgba(59, 130, 246, 0.35)"
              strokeWidth="1.6"
              strokeDasharray="4 2"
            />

            {/* Andaman & Nicobar Islands */}
            <g transform="translate(735, 740)">
              <ellipse cx="0" cy="0" rx="9" ry="26" fill="rgba(59, 130, 246, 0.04)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3 2" />
              <text x="14" y="4" fill="#64748b" fontSize="8" fontFamily="monospace">A&N (IXZ)</text>
            </g>

            {/* Lakshadweep Islands */}
            <g transform="translate(195, 770)">
              <ellipse cx="0" cy="0" rx="7" ry="18" fill="rgba(59, 130, 246, 0.04)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3 2" />
              <text x="-12" y="24" fill="#64748b" fontSize="8" fontFamily="monospace">LAKSHADWEEP</text>
            </g>

            {/* Flight Route Corridor Arcs */}
            {showTrafficArcs &&
              allProjectedNodes.map((fromNode) => {
                const isOriginActive = activeFocusNode.id === fromNode.id;

                return fromNode.connections.map((targetHub) => {
                  const toNode = allProjectedNodes.find((n) => n.hubCode === targetHub);
                  if (!toNode) return null;

                  const isConnectedToFocus =
                    isOriginActive || activeFocusNode.hubCode === targetHub;

                  if (!isConnectedToFocus && Math.random() > 0.35) return null;

                  const midX = (fromNode.x + toNode.x) / 2 - (fromNode.y - toNode.y) * 0.12;
                  const midY = (fromNode.y + toNode.y) / 2 - (toNode.x - fromNode.x) * 0.12;

                  const isAnomalyArc =
                    (fromNode.hubCode === 'DEL' && toNode.hubCode === 'BOM') ||
                    (fromNode.hubCode === 'BOM' && toNode.hubCode === 'DEL') ||
                    (fromNode.hubCode === 'DEL' && toNode.hubCode === 'CCU');

                  return (
                    <path
                      key={`geo-route-${fromNode.id}-${toNode.id}`}
                      d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`}
                      fill="none"
                      stroke={
                        isAnomalyArc
                          ? '#F43F5E'
                          : isConnectedToFocus
                          ? '#3B82F6'
                          : 'rgba(148, 163, 184, 0.15)'
                      }
                      strokeWidth={isAnomalyArc ? 2.2 : isConnectedToFocus ? 1.8 : 0.8}
                      strokeOpacity={isConnectedToFocus ? 0.95 : 0.25}
                      strokeDasharray={isConnectedToFocus ? 'none' : '3 3'}
                    />
                  );
                });
              })}

            {/* State Hub Beacons on SVG */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isHovered = hoveredNode?.id === node.id;

              return (
                <g key={`geo-beacon-${node.id}`}>
                  {(node.isAnomaly || isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 26 : node.isAnomaly ? 22 : 16}
                      fill={node.isAnomaly ? 'url(#geoAnomalyGlow)' : 'url(#geoStateGlow)'}
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.tier === 1 ? 7 : 4.5}
                    fill="none"
                    stroke={node.isAnomaly ? '#F43F5E' : isSelected ? '#FFFFFF' : '#3B82F6'}
                    strokeWidth={isSelected ? 1.8 : 1}
                    opacity={isSelected || isHovered ? 1 : 0.6}
                  />

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.tier === 1 ? 3 : 1.8}
                    fill={node.isAnomaly ? '#F43F5E' : isSelected ? '#3B82F6' : '#FFFFFF'}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive HTML Badges */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            const leftPercent = (node.x / SVG_WIDTH) * 100;
            const topPercent = (node.y / SVG_HEIGHT) * 100;

            return (
              <div
                key={node.id}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -130%)',
                }}
                onMouseEnter={() => {
                  setHoveredNode(node);
                  soundFx.playHover();
                }}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedNode(node);
                  if (node.hubCode === 'DEL' || node.hubCode === 'BOM' || node.hubCode === 'CCU') {
                    if (onSelectRouteId) {
                      onSelectRouteId(node.hubCode === 'CCU' ? 'DEL-CCU' : 'DEL-BOM');
                    }
                  }
                }}
                className={`absolute z-30 cursor-pointer transition-all duration-150 select-none ${
                  isSelected || isHovered ? 'scale-110 z-40' : 'scale-90 opacity-90 hover:opacity-100 hover:scale-105'
                }`}
              >
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-mono text-[10px] tracking-wider shadow-md backdrop-blur-md transition-all ${
                    node.isAnomaly
                      ? 'bg-rose-950/90 border-rose-500/80 text-rose-200'
                      : isSelected
                      ? 'bg-blue-600 border-blue-400 text-white'
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
                  <span className="font-bold">{node.hubCode}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected State Dossier Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5" /> GEOGRAPHIC REGION INTELLIGENCE
            </span>
            <span className="text-slate-400">{selectedNode.region} SECTOR</span>
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
                  State Code: {selectedNode.stateCode} // {selectedNode.activeRoutes} Active Monitored Corridors
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
                <span className="text-[10px] text-slate-400 uppercase block">AVG CORRIDOR FARE</span>
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
                DIRECT CONNECTED HUBS ({selectedNode.connections.length})
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {selectedNode.connections.map((c) => (
                  <span
                    key={c}
                    onClick={() => {
                      const matched = allProjectedNodes.find((n) => n.hubCode === c);
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

            {/* Action to Inspect Trunk Route */}
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
