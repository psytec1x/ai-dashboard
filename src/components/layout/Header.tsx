import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Badge';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { Tooltip } from '../ui/Tooltip';
import { useUser, useClerk, SignInButton } from '@clerk/clerk-react';
import {
  Search,
  Command,
  Bell,
  Moon,
  Sun,
  Menu,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../../store';

export function Header({ children }: { children?: ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { settings, updateSettings, sidebarCollapsed, setSidebarCollapsed, toggleCommandPalette, notifications } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-14 bg-bg-panel/95 backdrop-blur-sm border-b border-border-subtle',
        'flex items-center justify-between px-4 gap-3',
        'transition-all duration-200',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Left Side */}
      <div className="flex items-center gap-3 min-w-0">
        <Tooltip content="Toggle sidebar">
          <Button
            variant="icon"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </Tooltip>

        <button
          type="button"
          onClick={toggleCommandPalette}
          className="relative hidden sm:block"
          aria-label="Open command palette"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
          <Input
            type="search"
            placeholder="Search... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 bg-white/[0.02] border-border-subtle pointer-events-none"
            aria-label="Search"
            tabIndex={-1}
            readOnly
          />
        </button>
        <Button variant="icon" size="sm" onClick={toggleCommandPalette} className="sm:hidden" aria-label="Open command palette">
          <Command className="w-4 h-4" />
        </Button>
      </div>

      {/* Center */}
      <div className="flex-1 hidden md:flex justify-center px-8 min-w-0">
        {children}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip content={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <Button
            variant="icon"
            size="sm"
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </Tooltip>

        <Tooltip content={`Notifications (${notifications.length})`}>
          <Button variant="icon" size="sm" aria-label="Notifications">
            <Bell className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div className="ml-2">
          {!isLoaded ? (
            <Button variant="ghost" size="sm" disabled>Loading...</Button>
          ) : user ? (
            <Dropdown>
              <DropdownTrigger className="gap-2 px-2">
                <Avatar size="sm" name={user.firstName ?? 'User'} src={user.imageUrl} />
                <span className="text-sm-med text-text-secondary hidden sm:block max-w-[96px] truncate">
                  {user.firstName ?? 'User'}
                </span>
              </DropdownTrigger>
              <DropdownContent align="end" className="min-w-[200px]">
                <div className="px-3 py-2 border-b border-border-subtle">
                  <p className="text-sm-med text-text-primary truncate">{user.fullName ?? user.firstName ?? 'User'}</p>
                  <p className="text-xs text-text-muted truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <DropdownItem icon={<Zap className="w-4 h-4" />}>API Keys</DropdownItem>
                <DropdownItem
                  icon={<Moon className="w-4 h-4" />}
                  onSelect={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                >
                  {settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem icon={<LogOut className="w-4 h-4" />} destructive onSelect={() => void signOut()}>
                  Sign out
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          ) : (
            <SignInButton mode="modal">
              <Button variant="primary" size="sm">Sign In</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
