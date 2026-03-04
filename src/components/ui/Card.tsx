export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-border-custom rounded-xl p-6 transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}
