const tones = {
  success: 'bg-success-container text-success',
  warning: 'bg-warning-container text-warning',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container text-on-surface-variant',
  primary: 'bg-primary-container text-on-primary-container',
}

export default function Badge({ children, tone = 'neutral', icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  )
}
