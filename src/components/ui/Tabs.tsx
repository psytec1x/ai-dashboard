import { useState, createContext, useContext, type ReactNode, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
}

export interface TabsProps {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({ children, defaultValue, value, onChange, orientation = 'horizontal', variant = 'default', className }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : uncontrolledValue;
  const handleChange = isControlled ? onChange! : setUncontrolledValue;

  return (
    <TabsContext.Provider value={{ value: activeValue, onChange: handleChange, orientation, variant }}>
      <div className={cn('flex flex-col', orientation === 'vertical' && 'flex-row', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, variant } = useTabsContext();

    const variantStyles = {
      default: '',
      pills: 'bg-white/[0.02] p-1 rounded-lg',
      underline: '',
    };

    const orientationStyles = {
      horizontal: 'flex flex-row',
      vertical: 'flex flex-col',
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'inline-flex items-center gap-1',
          variantStyles[variant],
          orientationStyles[orientation],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const { value: activeValue, onChange, orientation, variant } = useTabsContext();
    const isActive = activeValue === value;

    const variantStyles = {
      default: isActive
        ? 'bg-white/[0.05] text-text-primary border-border-standard'
        : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]',
      pills: isActive
        ? 'bg-white/[0.05] text-text-primary shadow-subtle'
        : 'text-text-muted hover:text-text-secondary',
      underline: isActive
        ? 'text-text-primary border-b-2 border-accent-hover -mb-px'
        : 'text-text-muted hover:text-text-secondary border-b-2 border-transparent',
    };

    const orientationStyles = {
      horizontal: 'px-4 py-2',
      vertical: 'px-3 py-2 w-full justify-start',
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabs-panel-${value}`}
        id={`tabs-trigger-${value}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 text-sm-med font-medium rounded-md',
          'transition-all duration-150',
          'focus-visible:shadow-focus focus-visible:outline-none',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variantStyles[variant],
          orientationStyles[orientation],
          className
        )}
        onClick={() => !disabled && onChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue, orientation } = useTabsContext();
    const isActive = activeValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabs-panel-${value}`}
        aria-labelledby={`tabs-trigger-${value}`}
        tabIndex={0}
        className={cn(
          'mt-4 animate-fade-in',
          orientation === 'vertical' ? 'mt-0 ml-4' : '',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';