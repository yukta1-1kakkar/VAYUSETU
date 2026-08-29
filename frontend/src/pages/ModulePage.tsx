import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock3, Database, ShieldCheck } from 'lucide-react';

interface ModulePageProps {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
}

export function ModulePage({ title, eyebrow, description, icon: Icon }: ModulePageProps) {
  return (
    <div className="space-y-8 pb-16">
      <header className="border-b border-[#E2E8F0] pb-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769AA]">
          <Icon className="h-4 w-4" /> {eyebrow}
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">{description}</p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          { icon: ShieldCheck, label: 'Access status', value: 'Authorized', tone: 'text-[#16A34A] bg-green-50' },
          { icon: Database, label: 'Data environment', value: 'Government workspace', tone: 'text-[#1769AA] bg-blue-50' },
          { icon: Clock3, label: 'System status', value: 'Operational', tone: 'text-[#0F8B8D] bg-teal-50' },
        ].map((item) => (
          <div key={item.label} className="intel-card p-5">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{item.label}</div>
            <div className="mt-1 font-heading text-lg font-bold text-[#172033]">{item.value}</div>
          </div>
        ))}
      </div>

      <section className="intel-card flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-[#1769AA]" />
        <h2 className="mt-4 font-heading text-xl font-bold text-[#172033]">Secure module workspace</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748B]">
          Your role has been verified. This workspace is ready for connection to the corresponding government data service.
        </p>
      </section>
    </div>
  );
}

