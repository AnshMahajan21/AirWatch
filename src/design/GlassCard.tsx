import React from 'react';
import { useAtmosphericTheme } from './ThemeProvider.tsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  const { theme } = useAtmosphericTheme();

  return (
    <div
      onClick={onClick}
      className={`
        relative backdrop-blur-2xl rounded-[28px] p-6 
        shadow-2xl transition-all duration-500 isolate
        ${hoverEffect ? 'hover:scale-[1.01] hover:brightness-105 cursor-pointer' : ''}
        ${className}
      `}
      style={{
        backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.12)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: theme?.cardBorder || 'rgba(255, 255, 255, 0.25)',
        boxShadow: theme?.cardGlow || '0 20px 40px -15px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
      }}
    >
      {/* Subtle top light highlight reflecting on glass surface */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[28px] opacity-70"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
        }}
      />
      {children}
    </div>
  );
};
