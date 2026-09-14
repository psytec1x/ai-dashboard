import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'subtle' | 'primary' | 'icon' | 'pill' | 'toolbar';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'ghost',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-sans font-medium
      rounded-md
      transition-all duration-150 ease-out
      focus-visible:shadow-focus
      disabled:opacity-50 disabled:cursor-not-allowed
      select-none
    `;

    const variantStyles = {
      ghost: `
        bg-white/[0.02] text-text-secondary border border-border-solid
        hover:not(:disabled):bg-white/[0.04] hover:not(:disabled):text-text-primary hover:not(:disabled):border-border-standard
      `,
      subtle: `
        bg-white/[0.04] text-text-muted px-3
        hover:not(:disabled):bg-white/[0.06] hover:not(:disabled):text-text-secondary
      `,
      primary: `
        bg-accent-primary text-white
        hover:not(:disabled):bg-accent-hover
      `,
      icon: `
        w-8 h-8 p-0 rounded-full
        bg-white/[0.03] text-text-primary border border-border-standard
        hover:not(:disabled):bg-white/[0.05]
      `,
      pill: `
        bg-transparent text-text-secondary px-5 py-1.5 rounded-full border border-border-solid
        hover:not(:disabled):text-text-primary hover:not(:disabled):border-border-standard
      `,
      toolbar: `
        bg-white/[0.05] text-text-subtle text-label font-medium
        rounded-[2px] border border-border-subtle px-4
        shadow-subtle
        hover:not(:disabled):bg-white/[0.07] hover:not(:disabled):text-text-muted
      `,
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-label px-4 py-2 gap-2',
      lg: 'text-sm px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };