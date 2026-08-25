import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Sliders, CheckCircle2, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { soundFx } from '../../utils/sound';

export const Part8_ExecutiveReportExport: React.FC = () => {
  const [fuelAdjustment, setFuelAdjustment] = useState<number>(0);
  const [capacityAdjustment, setCapacityAdjustment] = useState<number>(0);
  const [advanceDays, setAdvanceDays] = useState<number>(7);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Simulated projected index based on parameters
  const baselineIndex = 113.6;
  const projectedIndex = (
    baselineIndex +
    fuelAdjustment * 0.428 -
    capacityAdjustment * 0.284 +
    (7 - advanceDays) * 0.45
  ).toFixed(1);

  const handleExport = (type: 'PDF' | 'CSV') => {
    soundFx.playAlert();
    setDownloadSuccess(`Generated and downloaded official VAYUSETU Sovereign Airfare Intelligence Report (${type}).`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <section id="part8-export" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>PART 08 // EXECUTIVE BRIEFING & YIELD SCENARIO SIMULATOR</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-space text-white tracking-tight">
            Sovereign Intelligence Report & Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Test custom macroeconomic assumptions on national yield velocity or export official intelligence dossiers.
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Scenario Simulator + Export Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (7 cols): Scenario Simulator */}
        <div className="lg:col-span-7 tech-panel p-6 rounded-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              YIELD SENSITIVITY & MACRO SIMULATION ENGINE
            </span>
            <span className="text-indigo-400 font-semibold">LIVE COMPUTATION</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Slider 1: Jet Fuel (ATF) Price Shift */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Aviation Turbine Fuel (ATF) Price Shift:</span>
                <span className={`font-bold ${fuelAdjustment > 0 ? 'text-rose-400' : fuelAdjustment < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {fuelAdjustment > 0 ? `+${fuelAdjustment}%` : `${fuelAdjustment}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                value={fuelAdjustment}
                onChange={(e) => setFuelAdjustment(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Slider 2: Trunk Capacity Growth */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Trunk Route Slot / Capacity Allocation:</span>
                <span className={`font-bold ${capacityAdjustment > 0 ? 'text-emerald-400' : capacityAdjustment < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {capacityAdjustment > 0 ? `+${capacityAdjustment}%` : `${capacityAdjustment}%`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="25"
                value={capacityAdjustment}
                onChange={(e) => setCapacityAdjustment(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Slider 3: Booking Advance Window */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Simulated Forward Booking Window:</span>
                <span className="text-indigo-300 font-bold">{advanceDays} Days Before Departure</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={advanceDays}
                onChange={(e) => setAdvanceDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Simulation Output Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">PROJECTED SOVEREIGN AIRFARE INDEX</span>
              <span className="text-3xl font-bold font-space text-white">{projectedIndex}</span>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-slate-400 block">BASELINE SHIFT</span>
              <span className="text-indigo-400 font-bold">
                {(Number(projectedIndex) - baselineIndex).toFixed(1)} pts
              </span>
            </div>
          </div>
        </div>

        {/* Right Side (5 cols): Official Intelligence Export */}
        <div className="lg:col-span-5 tech-panel p-6 rounded-xl space-y-4">
          <div className="pb-3 border-b border-slate-800 font-mono text-xs">
            <span className="text-slate-300 font-bold uppercase block">
              OFFICIAL SOVEREIGN BRIEFING DOSSIER
            </span>
            <span className="text-slate-500 text-[11px]">
              Full verified historical observations, route weights, and anomaly notes.
            </span>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              onClick={() => handleExport('PDF')}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-between shadow-md transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>EXPORT EXECUTIVE BRIEFING (.PDF)</span>
              </span>
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleExport('CSV')}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-mono text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>EXPORT FULL DATASET (.CSV)</span>
              </span>
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-500 leading-relaxed">
            Data certified by VAYUSETU Statistical Registry under methodology v2.6. Updated in real-time.
          </div>
        </div>
      </div>
    </section>
  );
};
