export default function Button({
  children,
  variant = 'primary',
  icon,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded font-medium text-sm transition-colors'
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container',
    secondary: 'bg-transparent text-primary border border-primary hover:bg-surface-container-low',
    ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-low',
    danger: 'bg-error text-on-error hover:opacity-90',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {children}
    </button>
  )
}
