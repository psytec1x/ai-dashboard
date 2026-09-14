import { type HTMLAttributes, forwardRef, Children, cloneElement, isValidElement, type ReactElement } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'subtle' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, dotColor, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-transparent text-text-secondary border border-border-solid',
      success: 'bg-success text-white border-transparent rounded-full',
      warning: 'bg-warning-bg text-warning border-transparent',
      error: 'bg-error-bg text-error border-transparent',
      subtle: 'bg-white/[0.05] text-text-primary border border-border-subtle rounded-[2px]',
      accent: 'bg-accent-primary/10 text-accent-hover border border-accent-primary/20',
    };

    const sizeStyles = {
      sm: 'text-[0.625rem] font-medium px-2.5 py-0.5 gap-1',
      md: 'text-[0.625rem] font-medium px-3 py-0.5 gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center',
          'rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor || 'currentColor' }}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', status, ...props }, ref) => {
    const sizeStyles = {
      xs: 'w-6 h-6 text-[0.5rem]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    const statusStyles = {
      online: 'bg-success',
      offline: 'bg-border-solid',
      busy: 'bg-error',
      away: 'bg-warning',
    };

    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    const bgColors = [
      'bg-accent-primary',
      'bg-success',
      'bg-warning',
      'bg-error',
      'bg-blue-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-orange-600',
    ];
    const colorIndex = name ? name.charCodeAt(0) % bgColors.length : 0;

    return (
      <div ref={ref} className={cn('relative inline-flex shrink-0', className)} {...props}>
        <div
          className={cn(
            'rounded-full overflow-hidden bg-white/[0.05] border border-border-subtle flex items-center justify-center',
            sizeStyles[size],
            bgColors[colorIndex]
          )}
          aria-label={name || alt}
        >
          {src ? (
            <img src={src} alt={alt || name || ''} className="w-full h-full object-cover" />
          ) : (
            <span className="font-medium text-white">{initials}</span>
          )}
        </div>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-bg-primary',
              statusStyles[status],
              statusSizes[size]
            )}
            aria-label={status}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 5, size = 'md', ...props }, ref) => {
    const kids = Children.toArray(children);
    const visible = kids.slice(0, max);
    const remaining = kids.length - max;
    const groupSizes = {
      xs: 'w-6 h-6 text-[0.5rem]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visible.map((child, index) => (
          <div key={index} className="relative z-10">
            {isValidElement(child)
              ? cloneElement(child as ReactElement<{ size?: AvatarProps['size'] }>, { size })
              : child}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              'relative z-0 rounded-full bg-white/[0.05] border-2 border-bg-primary flex items-center justify-center font-medium text-text-muted',
              groupSizes[size ?? 'md']
            )}
            aria-label={`${remaining} more`}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';