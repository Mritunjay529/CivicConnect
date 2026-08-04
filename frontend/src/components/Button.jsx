import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  icon = null,
}) {
  const baseStyle = 'inline-flex items-center justify-center px-6 min-h-[48px] rounded-custom-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary text-primary-on hover:bg-primary/95 hover:shadow-sm border border-primary',
    secondary: 'bg-transparent text-primary hover:bg-primary/5 border border-primary',
    danger: 'bg-error text-white hover:bg-error/95 border border-error',
    ghost: 'bg-transparent text-secondary hover:bg-secondary/5 border border-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined mr-2 text-[20px]">{icon}</span>}
      {children}
    </button>
  );
}
