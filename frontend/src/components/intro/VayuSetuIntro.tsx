import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Radio } from 'lucide-react';
import { VayuSetuLogo } from '../common/VayuSetuLogo';

interface VayuSetuIntroProps { onComplete: () => void }

/** Brand-only intro: measured values are deliberately not shown before API load. */
export const VayuSetuIntro = ({ onComplete }: VayuSetuIntroProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#F8FAFC]">
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative flex flex-col items-center text-center">
        <VayuSetuLogo variant="full" size="lg" />
        <div className="mt-7 flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1769AA] shadow-sm">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Connecting to live airfare intelligence
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B]"><Database className="h-3.5 w-3.5" /> PostgreSQL-backed observations</div>
        <button onClick={onComplete} className="mt-7 text-xs font-bold text-[#64748B] hover:text-[#1769AA]">Continue</button>
      </motion.div>
    </motion.div>
  );
};
