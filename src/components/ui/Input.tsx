import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`h-10 px-3 bg-surface border border-border-custom rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-border-focus transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
}
