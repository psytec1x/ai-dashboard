import { useEffect, useRef, useId, type ReactNode, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { Portal } from './Portal';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Dialog({ open, onOpenChange, children, title, description, size = 'md' }: DialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const titleId = title ? `dialog-title-${autoId}` : undefined;
  const descriptionId = description ? `dialog-description-${autoId}` : undefined;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sizeStyles = {
    sm: 'max-w-[320px]',
    md: 'max-w-[480px]',
    lg: 'max-w-[640px]',
    xl: 'max-w-[800px]',
    full: 'max-w-[90vw]',
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div
          className="fixed inset-0 bg-black/85 animate-fade-in"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
        <div
          ref={contentRef}
          className={cn(
            'relative w-full bg-bg-elevated border border-border-standard rounded-xl shadow-dialog',
            'animate-scale-in',
            'max-h-[90vh] flex flex-col',
            sizeStyles[size]
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || description) && (
            <div className="flex items-start justify-between p-6 border-b border-border-subtle">
              <div>
                {title && (
                  <h2 id={titleId} className="text-h3 text-text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-text-muted">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn-icon hover:bg-white/[0.05]"
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
}

export interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn('btn-ghost', className)}
      {...props}
    >
      {children}
    </button>
  )
);

DialogTrigger.displayName = 'DialogTrigger';

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);

DialogContent.displayName = 'DialogContent';

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
);

DialogHeader.displayName = 'DialogHeader';

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-h3 text-text-primary', className)} {...props}>
      {children}
    </h2>
  )
);

DialogTitle.displayName = 'DialogTitle';

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('mt-1 text-sm text-text-muted', className)} {...props}>
      {children}
    </p>
  )
);

DialogDescription.displayName = 'DialogDescription';

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-6 flex items-center justify-end gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
);

DialogFooter.displayName = 'DialogFooter';

export interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> {}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn('btn-ghost', className)}
      {...props}
    >
      {children}
    </button>
  )
);

DialogClose.displayName = 'DialogClose';