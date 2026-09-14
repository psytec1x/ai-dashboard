import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children }: { children: ReactNode }) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    setMount(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!mount) return null;
  return createPortal(children, mount);
}
