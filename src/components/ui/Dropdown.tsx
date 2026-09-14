import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  forwardRef,
} from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

export interface DropdownProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({ children, open: controlledOpen, onOpenChange }: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current?.contains(event.target as Node) ||
        contentRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  'aria-label'?: string;
}

export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, children, 'aria-label': ariaLabel, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownContext();

    return (
      <button
        ref={(el) => {
          triggerRef.current = el;
          if (ref) {
            if (typeof ref === 'function') ref(el);
            else ref.current = el;
          }
        }}
        type="button"
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 text-sm-med text-text-secondary',
          'bg-white/[0.02] border border-border-solid rounded-md',
          'hover:bg-white/[0.04] hover:text-text-primary',
          'focus-visible:shadow-focus',
          'transition-all duration-150',
          className
        )}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>
    )
  }
);

DropdownTrigger.displayName = 'DropdownTrigger';

export interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'start' | 'end';
  sideOffset?: number;
}

export const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, children, align = 'start', sideOffset = 4, ...props }, ref) => {
    const { open, contentRef } = useDropdownContext();

    if (!open) return null;

    return (
      <div
        ref={(el) => {
          contentRef.current = el;
          if (ref) {
            if (typeof ref === 'function') ref(el);
            else ref.current = el;
          }
        }}
        className={cn(
          'absolute z-50 mt-2 min-w-[160px] bg-bg-elevated border border-border-standard rounded-lg shadow-dialog',
          'animate-slide-down',
          'py-1.5',
          align === 'end' ? 'right-0' : 'left-0',
          className
        )}
        style={{ marginTop: sideOffset }}
        role="menu"
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownContent.displayName = 'DropdownContent';

export interface DropdownItemProps extends HTMLAttributes<HTMLButtonElement> {
  shortcut?: string;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, shortcut, icon, destructive, disabled, onSelect, children, ...props }, ref) => {
    const { setOpen } = useDropdownContext();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary',
          'hover:bg-white/[0.04] hover:text-text-primary',
          'focus:bg-white/[0.04] focus:text-text-primary focus:outline-none',
          destructive && 'text-error hover:text-error focus:text-error',
          disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
        disabled={disabled}
        role="menuitem"
        tabIndex={-1}
        onClick={() => {
          if (!disabled) {
            onSelect?.();
            setOpen(false);
          }
        }}
        {...props}
      >
        {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {shortcut && (
          <span className="text-xs text-text-subtle font-mono">{shortcut}</span>
        )}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

export interface DropdownSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('h-px bg-border-subtle my-1.5', className)}
      role="separator"
      {...props}
    />
  )
);

DropdownSeparator.displayName = 'DropdownSeparator';

export interface DropdownLabelProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-3 py-1.5 text-xs font-medium text-text-subtle uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </div>
  )
);

DropdownLabel.displayName = 'DropdownLabel';

export interface DropdownCheckboxItemProps extends HTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const DropdownCheckboxItem = forwardRef<HTMLButtonElement, DropdownCheckboxItemProps>(
  ({ className, checked, onCheckedChange, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary',
          'hover:bg-white/[0.04] hover:text-text-primary',
          'focus:bg-white/[0.04] focus:text-text-primary focus:outline-none',
          className
        )}
        role="menuitemcheckbox"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          onCheckedChange?.(!checked);
        }}
        {...props}
      >
        <span className="flex items-center justify-center w-4 h-4 border border-border-standard rounded-[2px] text-text-primary">
          {checked && <Check className="w-3 h-3" />}
        </span>
        {children}
      </button>
    );
  }
);

DropdownCheckboxItem.displayName = 'DropdownCheckboxItem';