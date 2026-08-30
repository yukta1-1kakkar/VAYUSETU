import React from 'react';
import { MagneticButton } from '../common/MagneticButton';
import { Cpu } from 'lucide-react';

export const FinalStatementSection: React.FC<{ onOpenCommandCenter: () => void }> = ({ onOpenCommandCenter }) => {
  return (
    <section id="foundation-final" className="relative py-36 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-slate-900">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs tracking-widest uppercase">
          // SECTION 08 - THE FINAL STATEMENT
        </div>

        <h2 className="text-5xl sm:text-7xl font-black font-syne text-white tracking-tight leading-tight">
          VAYUSETU
          <br />
          <span className="text-gradient-cyan">"See the market behind the fare."</span>
        </h2>

        <p className="text-base sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
          A continuous sovereign index powering transparent economic analysis, route health analytics, and fare volatility intelligence for India.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <MagneticButton
            size="lg"
            variant="cyan"
            onClick={onOpenCommandCenter}
            className="w-full sm:w-auto font-syne font-bold"
          >
            <Cpu className="w-5 h-5" />
            <span>LAUNCH LIVE COMMAND CENTER</span>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};
