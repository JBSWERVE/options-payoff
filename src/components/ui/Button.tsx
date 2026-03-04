import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base = "h-10 px-5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary: "bg-surface-elevated border border-border-custom text-text-primary hover:border-border-focus",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
