import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, maxHeight, children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-y-auto overflow-x-hidden', className)}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {children}
    </div>
  )
);

ScrollArea.displayName = 'ScrollArea';
