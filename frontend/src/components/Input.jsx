import React, { useState } from 'react';

export default function Input({
  label,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  options = [], // For select type
  error,
  required = false,
  className = '',
  rows = 4, // For textarea
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isCheckbox = type === 'checkbox';
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';

  const inputBaseStyle = 'w-full px-4 border border-border-custom transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:bg-surface-low disabled:cursor-not-allowed';
  
  // Custom styles for 12px card-radius vs 4px small checkbox-radius
  const roundedClass = isCheckbox ? 'rounded-custom-sm h-5 w-5 accent-primary' : 'rounded-custom-lg';
  const heightClass = (isCheckbox || isTextarea || isSelect) ? '' : 'h-12';
  const paddingRightClass = isPassword ? 'pr-12' : '';

  const actualInputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && !isCheckbox && (
        <label className="text-sm font-semibold text-secondary flex items-center">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          className={`${inputBaseStyle} ${roundedClass} py-3 resize-none`}
        />
      ) : isSelect ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${inputBaseStyle} ${roundedClass} h-12 bg-white`}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : isCheckbox ? (
        <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-secondary">
          <input
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={onChange}
            required={required}
            className={`${roundedClass} border-border-custom`}
          />
          <span>{label}</span>
        </label>
      ) : (
        <div className="relative w-full">
          <input
            type={actualInputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className={`${inputBaseStyle} ${roundedClass} ${heightClass} ${paddingRightClass}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-primary transition-colors flex items-center justify-center h-8 w-8 rounded-full hover:bg-surface-low cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          )}
        </div>
      )}

      {error && <span className="text-xs text-error font-medium">{error}</span>}
    </div>
  );
}
