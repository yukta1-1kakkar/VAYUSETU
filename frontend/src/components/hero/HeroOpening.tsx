import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeScene } from '../globe/GlobeScene';
import { MagneticButton } from '../common/MagneticButton';
import { ArrowRight, Sparkles, Compass, ShieldAlert, Cpu, Eye, ChevronDown, FastForward } from 'lucide-react';
import { soundFx } from '../../utils/sound';

interface HeroOpeningProps {
  onEnterPlatform: () => void;
  onExploreRoutes: () => void;
}

export const HeroOpening: React.FC<HeroOpeningProps> = ({
  onEnterPlatform,
  onExploreRoutes,
}) => {
  const [phase, setPhase] = useState<number>(0);
  const [activeCityIndex, setActiveCityIndex] = useState<number>(0);

  const citySequence = ['DELHI', 'MUMBAI', 'BENGALURU', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE'];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3000);
    const t4 = setTimeout(() => setPhase(4), 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    if (phase === 3) {
      const interval = setInterval(() => {
        setActiveCityIndex((prev) => (prev + 1) % citySequence.length);
        soundFx.playHover();
      }, 300);
      return () => clearInterval(interval);
    }
  }, [phase, citySequence.length]);

  const handleSkipIntro = () => {
    soundFx.playClick();
    setPhase(4);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#05070B] overflow-hidden flex items-center justify-center">
      {/* 3D WebGL Canvas Layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 z-10 ${
          phase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <GlobeScene
          cameraPreset={phase < 4 ? 'cinematic_intro' : 'india_focus'}
        />
      </div>

      {/* Atmospheric Vignette and Depth Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-[#05070B]/80 z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#05070B_80%)] z-20 pointer-events-none" />
      <div className="scanline-effect z-20" />

      {/* Skip Intro Button when in intro phase */}
      {phase < 4 && (
        <button
          onClick={handleSkipIntro}
          className="absolute top-20 right-6 z-50 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
        >
          <span>SKIP INTRO</span>
          <FastForward className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      )}

      {/* PHASE 0 & 1: The Initial Glowing Seed & Pre-title */}
      <AnimatePresence>
        {phase < 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.8 }}
            onClick={handleSkipIntro}
            className="absolute inset-0 flex flex-col items-center justify-center z-40 text-center px-4 cursor-pointer"
          >
            {/* Glowing Singularity Point */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{
                scale: [0.1, 1.8, 1],
                opacity: [0, 1, 0.9],
                boxShadow: [
                  '0 0 0 0 rgba(0,242,254,0)',
                  '0 0 40px 15px rgba(0,242,254,0.8)',
                  '0 0 20px 8px rgba(0,242,254,0.6)',
                ],
              }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="w-3 h-3 rounded-full bg-cyan-300 mb-8"
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="font-syne font-extrabold tracking-[0.35em] text-sm sm:text-base text-cyan-400 space-y-1"
            >
              <div>INDIA</div>
              <div>AIRFARE</div>
              <div className="text-white">INTELLIGENCE</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
              className="text-[11px] font-mono text-slate-500 mt-6 tracking-widest"
            >
              INITIALIZING TELEMETRY NODES... [CLICK TO SKIP]
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE 3: Cities Route Inscription Overlay */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleSkipIntro}
            className="absolute inset-0 flex flex-col items-center justify-center z-30 text-center cursor-pointer"
          >
            <div className="text-[10px] font-mono text-cyan-400 tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              CONNECTING AIRWAYS
            </div>
            <motion.div
              key={activeCityIndex}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-4xl sm:text-6xl font-black font-syne text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 tracking-widest"
            >
              {citySequence[activeCityIndex]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE 4: Main Cinematic Hero Typography & Experience */}
      {phase >= 4 && (
        <div className="relative z-40 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center pointer-events-auto">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs tracking-wider mb-6 backdrop-blur-md shadow-lg shadow-cyan-950/40"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>NATIONAL AIRFARE INTELLIGENCE & PRICE INDEXING</span>
          </motion.div>

          {/* Large Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-syne tracking-tight leading-[0.98] mb-6 text-white"
          >
            UNDERSTANDING
            <br />
            <span className="text-gradient-cyan">THE MOVEMENT</span>
            <br />
            OF AIRFARES.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl text-base sm:text-xl text-slate-300 font-sans font-light leading-relaxed mb-10"
          >
            "From millions of observations to one intelligent picture of India’s airfare market."
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative z-50"
          >
            <MagneticButton
              size="lg"
              variant="cyan"
              onClick={onEnterPlatform}
              className="w-full sm:w-auto font-syne font-bold tracking-wider group text-base shadow-2xl"
            >
              <span>ENTER VAYUSETU</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </MagneticButton>

            <MagneticButton
              size="lg"
              variant="ghost"
              onClick={onExploreRoutes}
              className="w-full sm:w-auto text-sm"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>EXPLORE LIVE NETWORK</span>
            </MagneticButton>
          </motion.div>

          {/* Real-time Telemetry Metrics Quick Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 border-t border-slate-800/80 pt-8 max-w-4xl w-full text-left"
          >
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AIRFARE INDEX</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white flex items-baseline gap-1">
                113.6
                <span className="text-xs font-sans text-rose-400 font-bold">+4.82%</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Base 100 benchmark</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OBSERVATIONS</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
                24,850
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Daily flight tariffs</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">DATA CONFIDENCE</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                91%
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Multi-carrier verified</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ACTIVE ANOMALIES</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                2 ROUTES
              </div>
              <div className="text-[10px] text-slate-400 font-mono">DEL-BOM deviation +38.7%</div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};
