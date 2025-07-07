import React from 'react';

interface WidgetProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Widget = ({ children, className = '', onClick }: WidgetProps) => {
  return (
    <div 
      className={`bg-transparent border border-white/20 rounded-lg p-4 transition-all duration-300 ease-out 
                  hover:scale-[1.02] hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.1),0_0_40px_rgba(255,255,255,0.05)] 
                  ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Widget;