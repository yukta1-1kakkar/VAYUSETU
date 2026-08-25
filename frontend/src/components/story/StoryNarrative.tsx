import React from 'react';
import { NetworkSection } from './NetworkSection';
import { SignalSection } from './SignalSection';
import { IndexSection } from './IndexSection';
import { MarketSection } from './MarketSection';
import { AnomalySection } from './AnomalySection';
import { CpiSection } from './CpiSection';
import { TrustSection } from './TrustSection';
import { FinalStatementSection } from './FinalStatementSection';

interface StoryNarrativeProps {
  onOpenCommandCenter: () => void;
  onSelectRoute: (routeId: string) => void;
}

export const StoryNarrative: React.FC<StoryNarrativeProps> = ({
  onOpenCommandCenter,
  onSelectRoute,
}) => {
  return (
    <div className="w-full bg-[#05070B] text-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 bg-radar-grid pointer-events-none opacity-40" />

      <NetworkSection onSelectRoute={onSelectRoute} />
      <SignalSection />
      <IndexSection />
      <MarketSection />
      <AnomalySection onSelectRoute={onSelectRoute} />
      <CpiSection />
      <TrustSection />
      <FinalStatementSection onOpenCommandCenter={onOpenCommandCenter} />
    </div>
  );
};
