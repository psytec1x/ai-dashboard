import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Input } from './ui/Input';
import {
  LayoutDashboard,
  MessageSquare,
  GitBranch,
  Code,
  Globe,
  Plug,
  Settings,
  Search,
  CornerDownLeft,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store';

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { createChatSession, setActiveChatSession } = useAppStore();

  const commands = useMemo(() => [
    { group: 'Navigate', name: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/') },
    { group: 'Navigate', name: 'Go to Chat', icon: MessageSquare, action: () => navigate('/chat') },
    { group: 'Navigate', name: 'Go to Workflows', icon: GitBranch, action: () => navigate('/workflows') },
    { group: 'Navigate', name: 'Go to Code Playground', icon: Code, action: () => navigate('/code') },
    { group: 'Navigate', name: 'Go to API Playground', icon: Globe, action: () => navigate('/api') },
    { group: 'Navigate', name: 'Go to Plugins', icon: Plug, action: () => navigate('/plugins') },
    { group: 'Navigate', name: 'Go to Settings', icon: Settings, action: () => navigate('/settings') },
    {
      group: 'Actions', name: 'New Chat', icon: MessageSquare,
      action: () => { const s = createChatSession('builtin-openai', 'New Chat'); setActiveChatSession(s.id); navigate('/chat'); },
    },
    {
      group: 'Actions', name: 'New Workflow', icon: GitBranch,
      action: () => navigate('/workflows'),
    },
    {
      group: 'Actions', name: 'Browse Plugin Store', icon: Zap,
      action: () => navigate('/plugins'),
    },
  ], [navigate, createChatSession, setActiveChatSession]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [commands, query]);

  const onQueryChange = (v: string) => {
    setQuery(v);
    setSelected(0);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[selected];
        if (cmd) { cmd.action(); onClose(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [filtered, selected, onClose]);

  return (
    <div className="fixed inset-0 z-[400] flex items-start justify-center pt-24 px-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="fixed inset-0 bg-black/85" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl cmd-palette overflow-hidden animate-scale-in">
        <div className="flex items-center gap-2 px-4 border-b border-border-subtle">
          <Search className="w-4 h-4 text-text-subtle shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 bg-transparent focus:shadow-none px-0"
            aria-label="Command search"
          />
          <kbd className="text-xs text-text-subtle font-mono border border-border-subtle rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-text-muted">No results for “{query}”</p>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.name}
                type="button"
                role="option"
                aria-selected={i === selected}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  i === selected ? 'bg-white/[0.05] text-text-primary' : 'text-text-secondary'
                )}
                onMouseEnter={() => setSelected(i)}
                onClick={() => { cmd.action(); onClose(); }}
              >
                <Icon className="w-4 h-4 text-text-muted shrink-0" />
                <span className="flex-1 text-left">{cmd.name}</span>
                <span className="text-xs text-text-subtle">{cmd.group}</span>
                {i === selected && <CornerDownLeft className="w-3.5 h-3.5 text-text-subtle" />}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-2 border-t border-border-subtle flex items-center gap-4 text-xs text-text-subtle">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
