import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Badge';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from '../ui/Dropdown';
import { Tooltip } from '../ui/Tooltip';
import {
  LayoutDashboard,
  MessageSquare,
  GitBranch,
  Code,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  LogOut,
  Zap,
  Monitor,
  Terminal,
  Database,
  Globe,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useUser, useClerk } from '@clerk/clerk-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Code', href: '/code', icon: Code },
  { name: 'API Playground', href: '/api', icon: Globe },
  { name: 'Plugins', href: '/plugins', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const pluginCategories = [
  { name: 'LLM Providers', icon: Zap, href: '/plugins?category=llm' },
  { name: 'Agents', icon: Monitor, href: '/plugins?category=agent' },
  { name: 'Chatbots', icon: MessageSquare, href: '/plugins?category=chatbot' },
  { name: 'APIs', icon: Globe, href: '/plugins?category=api' },
  { name: 'Tools', icon: Terminal, href: '/plugins?category=tool' },
  { name: 'Workflows', icon: GitBranch, href: '/plugins?category=workflow' },
  { name: 'Data', icon: Database, href: '/plugins?category=data' },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, createChatSession, setActiveChatSession } = useAppStore();
  const { user } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const expanded = !sidebarCollapsed || hovered;

  const handleNewChat = () => {
    const s = createChatSession('builtin-openai', 'New Chat');
    setActiveChatSession(s.id);
    navigate('/chat');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-full bg-bg-panel border-r border-border-subtle',
        'transition-all duration-200 ease-out',
        'flex flex-col',
        expanded ? 'w-64' : 'w-16'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border-subtle">
        <Link to="/" className="flex items-center gap-2" aria-label="AI Dashboard Home">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {expanded && (
            <span className="text-h3 text-text-primary font-medium tracking-tight whitespace-nowrap">AI Dash</span>
          )}
        </Link>
        {expanded && !sidebarCollapsed && (
          <Tooltip content="Collapse sidebar">
            <Button variant="icon" size="sm" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse sidebar">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Tooltip key={item.name} content={!expanded ? item.name : undefined}>
              <NavLink
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'text-sm-med transition-all duration-150',
                  'focus-visible:shadow-focus focus-visible:outline-none',
                  isActive
                    ? 'bg-white/[0.05] text-text-primary'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]',
                  !expanded && 'justify-center'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-accent-hover')} aria-hidden="true" />
                {expanded && <span className="whitespace-nowrap">{item.name}</span>}
              </NavLink>
            </Tooltip>
          );
        })}
      </nav>

      {/* Plugin Categories */}
      {expanded && (
        <div className="px-3 pb-4 border-t border-border-subtle max-h-64 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-medium text-text-subtle uppercase tracking-wider">
            Plugins
          </div>
          <div className="space-y-1">
            {pluginCategories.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-text-muted hover:text-text-secondary hover:bg-white/[0.02]"
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="p-3 border-t border-border-subtle">
        {expanded ? (
          <div className="space-y-2">
            <Button variant="ghost" size="sm" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={handleNewChat}>
              New Chat
            </Button>
            <Dropdown>
              <DropdownTrigger className="w-full justify-start">
                <Avatar size="sm" name={user?.firstName ?? 'User'} src={user?.imageUrl ?? null} />
                <span className="text-sm-med text-text-secondary truncate">
                  {user?.firstName ?? 'User'}
                </span>
              </DropdownTrigger>
              <DropdownContent align="start">
                <DropdownLabel>Account</DropdownLabel>
                <DropdownItem icon={<User className="w-4 h-4" />}>Profile</DropdownItem>
                <DropdownItem icon={<Settings className="w-4 h-4" />}>Settings</DropdownItem>
                <DropdownSeparator />
                <DropdownItem icon={<LogOut className="w-4 h-4" />} destructive onSelect={() => void signOut()}>
                  Sign out
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Tooltip content="New Chat">
              <Button variant="icon" size="sm" onClick={handleNewChat} aria-label="New chat">
                <Plus className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Dropdown>
              <DropdownTrigger aria-label="User menu">
                <Avatar size="sm" name={user?.firstName ?? 'User'} src={user?.imageUrl ?? null} />
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownLabel>Account</DropdownLabel>
                <DropdownItem icon={<User className="w-4 h-4" />}>Profile</DropdownItem>
                <DropdownItem icon={<Settings className="w-4 h-4" />}>Settings</DropdownItem>
                <DropdownSeparator />
                <DropdownItem icon={<LogOut className="w-4 h-4" />} destructive onSelect={() => void signOut()}>
                  Sign out
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        )}

        {sidebarCollapsed && !hovered && (
          <Tooltip content="Expand sidebar">
            <Button
              variant="icon"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="mt-4 mx-auto"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
