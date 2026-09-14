import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children }: { children: ReactNode }) {
  // Detached node creation is side-effect free; attach/detach happens in the effect.
  const [mount] = useState<HTMLDivElement>(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(mount);
    return () => {
      document.body.removeChild(mount);
    };
  }, [mount]);

  return createPortal(children, mount);
}
