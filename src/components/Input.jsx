export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  as = 'input',
  rows = 3,
  icon,
}) {
  const fieldClass =
    'w-full min-h-[48px] px-3.5 rounded border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-on-surface-variant mb-1.5">{label}</span>
      )}
      <div className="relative">
        {as === 'textarea' ? (
          <textarea
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${fieldClass} py-3`}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${fieldClass} ${icon ? 'pl-10' : ''}`}
          />
        )}
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            {icon}
          </span>
        )}
      </div>
    </label>
  )
}
