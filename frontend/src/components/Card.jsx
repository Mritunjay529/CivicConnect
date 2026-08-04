import React from 'react';

export default function Card({
  children,
  className = '',
  onClick,
}) {
  const isClickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-border-custom rounded-custom-lg p-6 ${
        isClickable ? 'cursor-pointer hover:bg-surface-low/30 transition-colors duration-200 active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
