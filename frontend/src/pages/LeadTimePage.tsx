import { Clock3 } from 'lucide-react';
import { LeadTimeElasticityChart } from '../components/dashboard/LeadTimeElasticityChart';

export function LeadTimePage() {
  return (
    <div className="space-y-8 pb-16">
      <header className="border-b border-[#E2E8F0] pb-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]">
          <Clock3 className="h-4 w-4" /> Demand analytics
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">Lead-Time Elasticity</h1>
        <p className="mt-2 text-sm text-[#64748B]">Analyze fare response across booking horizons for the national route basket.</p>
      </header>
      <LeadTimeElasticityChart />
    </div>
  );
}
