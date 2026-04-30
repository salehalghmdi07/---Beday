import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  useImage?: boolean;
}

export default function Logo({ className = '', size = 32, showText = true, useImage = false }: LogoProps) {
  const [imgError, setImgError] = React.useState(false);

  const fallbackIcon = (
    <div 
      className="rounded-2xl tech-gradient flex items-center justify-center text-on-primary-container shadow-xl shadow-primary/20"
      style={{ width: size, height: size }}
    >
      <span className="font-black text-xl leading-none">B</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!imgError ? (
        <div style={{ height: size }} className="flex items-center">
          <img 
            src={useImage ? "/logo.png" : "/favicon.png"} 
            alt="Beday-Tech" 
            style={{ height: size, width: useImage ? 'auto' : size }}
            className={`object-contain ${!useImage ? 'rounded-xl shadow-sm' : ''}`}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : fallbackIcon}
      
      {showText && (
        <span className="text-xl font-black tracking-tight flex items-center gap-1">
          <span className="text-on-surface">بدايــــ</span> <span className="text-primary">تك</span>
        </span>
      )}
    </div>
  );
}
