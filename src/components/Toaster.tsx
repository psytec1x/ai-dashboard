import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-success/30 text-success',
  error: 'border-error/30 text-error',
  warning: 'border-warning/30 text-warning',
  info: 'border-accent-primary/30 text-accent-hover',
};

export function Toaster() {
  const { notifications, removeNotification } = useAppStore();

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[500] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]"
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((n) => {
        const Icon = icons[n.type];
        return (
          <div
            key={n.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg',
              'bg-bg-elevated border shadow-dialog animate-slide-up',
              colors[n.type]
            )}
            role="alert"
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm text-text-primary">{n.message}</p>
            <button
              type="button"
              onClick={() => removeNotification(n.id)}
              className="text-text-subtle hover:text-text-primary transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
