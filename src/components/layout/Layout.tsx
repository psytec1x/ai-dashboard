import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store';

export function Layout() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <div className={cn('transition-all duration-200', sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <Header>
          <h1 className="text-h2 text-text-primary truncate max-w-[400px]">
            {getPageTitle(location.pathname)}
          </h1>
        </Header>
        <main className="pt-14">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/chat')) return 'Chat';
  if (pathname.startsWith('/workflows')) return 'Workflows';
  if (pathname.startsWith('/code')) return 'Code Playground';
  if (pathname.startsWith('/api')) return 'API Playground';
  if (pathname.startsWith('/plugins')) return 'Plugins';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Dashboard';
}
