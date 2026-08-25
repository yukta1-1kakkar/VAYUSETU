import React from 'react';

interface SectionHeaderProps {
  sectionNumber?: string;
  tag: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  gradient?: 'cyan' | 'violet' | 'alert' | 'none';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionNumber,
  tag,
  title,
  subtitle,
  align = 'left',
  gradient = 'cyan',
}) => {
  const gradientClass =
    gradient === 'cyan'
      ? 'text-gradient-cyan'
      : gradient === 'violet'
      ? 'text-gradient-violet'
      : gradient === 'alert'
      ? 'text-gradient-alert'
      : 'text-white';

  return (
    <div className={`mb-10 ${align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'}`}>
      <div className="flex items-center gap-2.5 mb-3 font-mono text-xs tracking-widest text-cyan-400">
        {sectionNumber && (
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            {sectionNumber}
          </span>
        )}
        <span className="uppercase text-slate-400 font-medium tracking-widest">{tag}</span>
      </div>

      <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black font-syne tracking-tight leading-[1.1] mb-4 ${gradientClass}`}>
        {title}
      </h2>

      {subtitle && (
        <p className="text-base sm:text-lg text-slate-300 font-sans font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
