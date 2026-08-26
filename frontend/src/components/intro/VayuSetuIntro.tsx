import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VayuSetuLogo } from '../common/VayuSetuLogo';
import {
  INDIA_STATES_PATHS,
  INDIA_SVG_WIDTH,
  INDIA_SVG_HEIGHT,
  AVIATION_HUBS,
  TOP_6_ROUTES,
  projectLngLatToMap,
} from '../india-map/mapData';
import { TrendingUp, ShieldCheck, Database, Layers, ArrowRight, Plane } from 'lucide-react';

interface VayuSetuIntroProps {
  onComplete: () => void;
}

export const VayuSetuIntro: React.FC<VayuSetuIntroProps> = ({ onComplete }) => {
  // Scene stages: 1 (Logo) -> 2 (India Map & Hubs) -> 3 (Routes) -> 4 (Metrics & APIx) -> 5 (Final Lockup & Exit)
  const [scene, setScene] = useState<number>(1);
  const [countValues, setCountValues] = useState({
    apix: 0,
    routes: 0,
    records: 0,
    confidence: 0,
  });

  useEffect(() => {
    // Stage 1: Brand Initialization (0 - 1.4s)
    const t1 = setTimeout(() => setScene(2), 1400);

    // Stage 2: India Map & Hubs Ignition (1.4s - 3.0s)
    const t2 = setTimeout(() => setScene(3), 3000);

    // Stage 3: Dynamic Route Network Arcs (3.0s - 4.6s)
    const t3 = setTimeout(() => setScene(4), 4600);

    // Stage 4: Live Data Telemetry & APIx Surge (4.6s - 6.2s)
    const t4 = setTimeout(() => setScene(5), 6200);

    // Stage 5: Grand Resolution & Transition to Dashboard (7.4s)
    const t5 = setTimeout(() => {
      onComplete();
    }, 7400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  // Numbers Count-up when Scene 4 starts
  useEffect(() => {
    if (scene >= 4) {
      const duration = 1200;
      const startTime = performance.now();

      const animateCounts = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        setCountValues({
          apix: Math.round((108.4 * ease) * 10) / 10,
          routes: Math.round(24 * ease),
          records: Math.round(24850 * ease),
          confidence: Math.round(91 * ease),
        });

        if (progress < 1) {
          requestAnimationFrame(animateCounts);
        }
      };

      requestAnimationFrame(animateCounts);
    }
  }, [scene]);

  // Project the 6 primary hubs using the EXACT SAME projection as Dashboard
  const primaryHubs = AVIATION_HUBS.filter(h => h.isTop6).map(hub => {
    const { x, y } = projectLngLatToMap(hub.lng, hub.lat);
    return { ...hub, x, y };
  });

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="w-full h-full bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-100/50 via-sky-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Header: System Status & Skip Button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#E2E8F0] shadow-xs text-[11px] font-semibold text-[#1769AA]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="tracking-wider uppercase">VAYUSETU INTELLIGENCE // INITIALIZING</span>
        </div>

        <button
          onClick={onComplete}
          className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 hover:bg-[#1769AA] text-[#172033] hover:text-white border border-[#CBD5E1] hover:border-[#1769AA] text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <span>SKIP INTRO</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* CENTER CINEMATIC STAGE */}
      <div className="relative w-full max-w-4xl h-[520px] sm:h-[580px] flex items-center justify-center px-4">
        
        {/* SCENE 1: INITIAL LOGO REVEAL (0s - 1.4s) */}
        <AnimatePresence>
          {scene === 1 && (
            <motion.div
              key="scene1-logo"
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10, transition: { duration: 0.5 } }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center z-20"
            >
              <VayuSetuLogo variant="full" size="xl" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 text-xs text-[#64748B] font-medium tracking-widest uppercase"
              >
                National Airfare Intelligence Platform
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENES 2, 3, 4, 5: GEOGRAPHIC INDIA MAP, HUBS, ROUTES, DATA */}
        {scene >= 2 && scene <= 4 && (
          <motion.div
            key="scene-map-stage"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.6 } }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* SVG Map of India with authentic state boundaries (Identical Shared Geometry) */}
            <svg
              viewBox={`0 0 ${INDIA_SVG_WIDTH} ${INDIA_SVG_HEIGHT}`}
              className="w-full h-full max-h-[500px] select-none overflow-visible filter drop-shadow-xs"
            >
              {/* India States Geometry */}
              <g className="states-paths">
                {INDIA_STATES_PATHS.map((st, i) => (
                  <motion.path
                    key={st.name}
                    d={st.path}
                    initial={{ opacity: 0, fill: '#FFFFFF', stroke: '#CBD5E1' }}
                    animate={{
                      opacity: 1,
                      fill: '#E8EEF5',
                      stroke: '#CBD5E1',
                    }}
                    transition={{ duration: 0.6, delay: i * 0.008 }}
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                  />
                ))}
              </g>

              {/* SCENE 3 & 4: Route Arcs */}
              {scene >= 3 && (
                <g className="route-arcs">
                  {TOP_6_ROUTES.slice(0, 7).map((route, idx) => {
                    const from = primaryHubs.find(h => h.code === route.originCode);
                    const to = primaryHubs.find(h => h.code === route.destCode);
                    if (!from || !to) return null;

                    const midX = (from.x + to.x) / 2 - (from.y - to.y) * 0.16;
                    const midY = (from.y + to.y) / 2 - (to.x - from.x) * 0.16;
                    const pathD = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

                    return (
                      <g key={route.id}>
                        {/* Animated Route Line */}
                        <motion.path
                          d={pathD}
                          fill="none"
                          stroke={route.status === 'anomaly' ? '#DC2626' : '#1769AA'}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.85 }}
                          transition={{ duration: 1.1, delay: idx * 0.15, ease: 'easeInOut' }}
                        />

                        {/* Moving Pulse Particle along the route */}
                        <motion.circle
                          r="3"
                          fill={route.status === 'anomaly' ? '#DC2626' : '#0284C7'}
                          initial={{ offsetDistance: '0%', opacity: 0 }}
                          animate={{
                            offsetDistance: '100%',
                            opacity: [0, 1, 1, 0],
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            delay: idx * 0.25,
                            ease: 'linear',
                          }}
                          style={{
                            offsetPath: `path("${pathD}")`,
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Hub Beacons (Pulsing at coordinates) */}
              <g className="hub-nodes">
                {primaryHubs.map((hub, idx) => (
                  <g key={hub.id}>
                    <motion.circle
                      cx={hub.x}
                      cy={hub.y}
                      r="16"
                      fill="#1769AA"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: idx * 0.2 }}
                    />
                    <motion.circle
                      cx={hub.x}
                      cy={hub.y}
                      r="5.5"
                      fill="#FFFFFF"
                      stroke={hub.anomalyStatus === 'Critical Anomaly' ? '#DC2626' : '#1769AA'}
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.1, type: 'spring' }}
                    />
                    <motion.circle
                      cx={hub.x}
                      cy={hub.y}
                      r="2.5"
                      fill={hub.anomalyStatus === 'Critical Anomaly' ? '#DC2626' : '#1769AA'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                    />
                  </g>
                ))}
              </g>
            </svg>

            {/* City Badges */}
            {primaryHubs.map((hub, idx) => {
              const leftPercent = (hub.x / INDIA_SVG_WIDTH) * 100;
              const topPercent = (hub.y / INDIA_SVG_HEIGHT) * 100;

              return (
                <motion.div
                  key={`badge-${hub.id}`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -140%)',
                  }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.12 }}
                  className="absolute z-20 pointer-events-none"
                >
                  <div className="px-2 py-0.5 rounded-md bg-white/95 border border-[#CBD5E1] text-[10px] font-bold text-[#172033] shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1769AA]" />
                    <span>{hub.city.toUpperCase()}</span>
                  </div>
                </motion.div>
              );
            })}

            {/* SCENE 4: Floating Live Telemetry Cards around the Map */}
            {scene >= 4 && (
              <>
                {/* Card 1: APIx Live Surge */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-12 left-2 sm:left-6 z-30 p-3.5 rounded-2xl bg-white/95 border border-blue-200 shadow-lg backdrop-blur-sm space-y-1 min-w-[150px]"
                >
                  <div className="text-[10px] font-bold text-[#1769AA] uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#1769AA]" />
                    <span>NATIONAL APIx INDEX</span>
                  </div>
                  <div className="text-2xl font-black font-heading text-[#172033]">
                    {countValues.apix}
                  </div>
                  <div className="text-[10px] font-semibold text-[#DC2626]">
                    +3.2% MoM Benchmark
                  </div>
                </motion.div>

                {/* Card 2: Monitored Corridors */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="absolute top-12 right-2 sm:right-6 z-30 p-3.5 rounded-2xl bg-white/95 border border-[#CBD5E1] shadow-lg backdrop-blur-sm space-y-1 min-w-[150px]"
                >
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#1769AA]" />
                    <span>BASKET CORRIDORS</span>
                  </div>
                  <div className="text-2xl font-black font-heading text-[#172033]">
                    {countValues.routes} Pairs
                  </div>
                  <div className="text-[10px] text-[#16A34A] font-semibold">
                    100% Ingestion Active
                  </div>
                </motion.div>

                {/* Card 3: Ingested Records */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute bottom-6 left-2 sm:left-6 z-30 p-3.5 rounded-2xl bg-white/95 border border-[#CBD5E1] shadow-lg backdrop-blur-sm space-y-1 min-w-[150px]"
                >
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-3 h-3 text-[#0F8B8D]" />
                    <span>DAILY RECORD FEEDS</span>
                  </div>
                  <div className="text-2xl font-black font-heading text-[#0F8B8D]">
                    {countValues.records.toLocaleString()}+
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    5 Airlines Monitored
                  </div>
                </motion.div>

                {/* Card 4: Verified Carriers */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="absolute bottom-6 right-2 sm:right-6 z-30 p-3.5 rounded-2xl bg-white/95 border border-purple-200 shadow-lg backdrop-blur-sm space-y-1 min-w-[150px]"
                >
                  <div className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1">
                    <Plane className="w-3 h-3 text-[#8B5CF6]" />
                    <span>VERIFIED AIRLINES</span>
                  </div>
                  <div className="text-2xl font-black font-heading text-[#8B5CF6]">
                    5 Carriers
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Direct NDC / GDS Feeds
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* SCENE 5: GRAND FINALE RESOLUTION (6.2s - 7.4s) */}
        <AnimatePresence>
          {scene === 5 && (
            <motion.div
              key="scene5-resolution"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center z-30 max-w-xl px-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <VayuSetuLogo variant="full" size="xl" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-6 space-y-2"
              >
                <div className="text-xs font-bold text-[#1769AA] uppercase tracking-widest">
                  SOVEREIGN AIRFARE INTELLIGENCE & PRICE INDEXING
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] italic max-w-md mx-auto">
                  “Understanding the movement of sovereign airfares with mathematical precision.”
                </p>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-[#1769AA] to-transparent mt-6 max-w-xs"
              />

              <div className="mt-3 text-[11px] text-[#94A3B8] font-mono">
                Launching Intelligence Console...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Progress Pulse Indicator */}
      <div className="absolute bottom-6 flex items-center gap-2 z-20">
        <div className="w-24 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#1769AA] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(scene / 5) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono font-medium">STAGE 0{scene} // 05</span>
      </div>
    </motion.div>
  );
};
