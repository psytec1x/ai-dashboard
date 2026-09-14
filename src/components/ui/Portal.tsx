import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children }: { children: ReactNode }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mountRef.current = document.createElement('div');
    document.body.appendChild(mountRef.current);
    return () => {
      if (mountRef.current) {
        document.body.removeChild(mountRef.current);
      }
    };
  }, []);

  if (!mountRef.current) return null;

  return createPortal(children, mountRef.current);
}