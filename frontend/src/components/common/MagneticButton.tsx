import React, { useRef, useState } from 'react';
import { soundFx } from '../../utils/sound';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cyan' | 'alert' | 'ghost' | 'outline';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  variant = 'cyan',
  className = '',
  size = 'md',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;

    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base font-semibold tracking-wide',
  };

  const variantClasses = {
    cyan: 'bg-cyan-500/15 border border-cyan-400/80 text-cyan-300 hover:bg-cyan-400 hover:text-black shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40',
    alert: 'bg-rose-500/15 border border-rose-400/80 text-rose-300 hover:bg-rose-500 hover:text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40',
    ghost: 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white',
    outline: 'border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10',
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => soundFx.playHover()}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        soundFx.playClick();
        if (onClick) onClick();
      }}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: 'transform 0.18s ease-out',
      }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-lg font-mono transition-colors duration-200 cursor-pointer select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
