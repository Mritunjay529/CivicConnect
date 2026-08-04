import React from 'react';

export default function Badge({
  children,
  variant = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary'
  className = '',
}) {
  const styles = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-error-container text-error border border-error-container',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    primary: 'bg-surface-container text-primary border border-surface-container',
    secondary: 'bg-surface-low text-secondary border border-border-custom',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-custom-sm ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
