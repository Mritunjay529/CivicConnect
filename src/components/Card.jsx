export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest border border-outline-variant rounded-lg p-6 ${
        onClick ? 'cursor-pointer hover:border-primary transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
