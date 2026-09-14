import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn, formatTime, generateId } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScrollArea } from '../components/ui/ScrollArea';
import { Avatar } from '../components/ui/Badge';
import { Badge } from '../components/ui/Badge';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from '../components/ui/Dropdown';
import { Tooltip } from '../components/ui/Tooltip';
import { useAppStore } from '../store';
import { chatComplete } from '../lib/api';
import type { ChatMessage } from '../types';
import {
  Send,
  Paperclip,
  Settings,
  ChevronDown,
  Loader2,
  StopCircle,
  Copy,
  Check,
  RefreshCw,
  Brain,
  Plus,
  MessageSquare,
  X,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export function Chat() {
  const {
    chatSessions,
    activeChatSession,
    isStreaming,
    createChatSession,
    setActiveChatSession,
    addChatMessage,
    updateChatMessage,
    deleteChatSession,
    setStreaming,
    pluginInstances,
    activePluginInstance,
    setActivePluginInstance,
    addNotification,
  } = useAppStore();

  const { user } = useUser();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const session = chatSessions.find((s) => s.id === activeChatSession);
  const messages = session?.messages ?? [];
  const llmInstances = pluginInstances.filter(
    (p) => p.enabled && (p.pluginId === 'builtin-openai' || p.pluginId === 'builtin-anthropic')
  );
  const activePlugin = pluginInstances.find((p) => p.id === activePluginInstance) ?? llmInstances[0];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (activePlugin && activePluginInstance !== activePlugin.id) {
      setActivePluginInstance(activePlugin.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureSession = (): string => {
    if (activeChatSession) return activeChatSession;
    const s = createChatSession(activePlugin?.id ?? 'builtin-openai', 'New Chat');
    setActiveChatSession(s.id);
    return s.id;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;

    if (!activePlugin) {
      addNotification({ message: 'No LLM configured — add an OpenAI or Anthropic key under Plugins first.', type: 'warning' });
      navigate('/plugins');
      return;
    }
    const apiKey = String(activePlugin.config.apiKey ?? '');
    if (!apiKey) {
      addNotification({ message: `Instance "${activePlugin.name}" has no API key. Open Plugins to add it.`, type: 'warning' });
      navigate('/plugins');
      return;
    }

    const sessionId = ensureSession();
    const model = String(activePlugin.config.model ?? 'gpt-4o-mini');
    const systemPrompt = String(activePlugin.config.systemPrompt ?? 'You are a helpful assistant.');
    const temperature = Number(activePlugin.config.temperature ?? 0.7);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(sessionId, userMsg);
    if (messages.length === 0) {
      const title = text.slice(0, 42) + (text.length > 42 ? '…' : '');
      useAppStore.setState((st) => ({
        chatSessions: st.chatSessions.map((s) => (s.id === sessionId ? { ...s, name: title } : s)),
      }));
    }
    setInput('');
    setStreaming(true);

    const assistantId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      metadata: { pluginId: activePlugin.id, model },
    };
    addChatMessage(sessionId, assistantMsg);

    const controller = new AbortController();
    abortRef.current = controller;
    let streamed = '';
    try {
      const history = [...messages, userMsg].slice(-20).map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : m.role === 'system' ? ('system' as const) : ('user' as const),
        content: m.content,
      }));
      const full = await chatComplete(apiKey, {
        model,
        temperature,
        signal: controller.signal,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        onToken: (t) => {
          streamed += t;
          updateChatMessage(sessionId, assistantId, { content: streamed });
        },
      });
      updateChatMessage(sessionId, assistantId, { content: full || streamed || '(empty response)' });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        updateChatMessage(sessionId, assistantId, { content: streamed || '(stopped)' });
      } else {
        const msg = err instanceof Error ? err.message : 'Request failed';
        updateChatMessage(sessionId, assistantId, { content: `⚠️ ${msg}` });
        addNotification({ message: msg, type: 'error' });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } catch {
      addNotification({ message: 'Copy failed', type: 'error' });
    }
  };

  const handleRegenerate = (sessionId: string, assistantId: string) => {
    const sess = chatSessions.find((s) => s.id === sessionId);
    if (!sess) return;
    const idx = sess.messages.findIndex((m) => m.id === assistantId);
    const prevUser = [...sess.messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
    if (prevUser) {
      setInput(prevUser.content);
      addNotification({ message: 'Last prompt restored — press Enter to resend.', type: 'info' });
    }
  };

  const handleNewChat = () => {
    const s = createChatSession(activePlugin?.id ?? 'builtin-openai', 'New Chat');
    setActiveChatSession(s.id);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-7.5rem)] animate-fade-in">
      {/* Session sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col gap-2 overflow-hidden">
        <Button variant="primary" size="sm" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={handleNewChat}>
          New Chat
        </Button>
        <ScrollArea className="flex-1 space-y-1 pr-1">
          {chatSessions.length === 0 && (
            <p className="text-sm text-text-subtle px-2 py-4 text-center">No chats yet</p>
          )}
          {chatSessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                s.id === activeChatSession
                  ? 'bg-white/[0.05] text-text-primary'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
              )}
              onClick={() => setActiveChatSession(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveChatSession(s.id)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-sm truncate">{s.name}</span>
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 text-text-subtle hover:text-error transition-all"
                onClick={(e) => { e.stopPropagation(); deleteChatSession(s.id); }}
                aria-label={`Delete ${s.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Main chat panel */}
      <div className="flex-1 flex flex-col min-w-0 card overflow-hidden">
        {/* Model bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-panel/50 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Dropdown>
              <DropdownTrigger className="gap-2">
                <Brain className="w-4 h-4 text-accent-hover shrink-0" />
                <span className="text-sm-med text-text-secondary truncate max-w-[176px]">
                  {activePlugin?.name ?? 'Select model'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-subtle shrink-0" />
              </DropdownTrigger>
              <DropdownContent align="start" className="min-w-[220px]">
                <DropdownLabel>LLM Instances</DropdownLabel>
                {llmInstances.map((p) => (
                  <DropdownItem key={p.id} onSelect={() => setActivePluginInstance(p.id)}>
                    {p.name}
                    <span className="ml-auto text-xs text-text-subtle">{String(p.config.model ?? '')}</span>
                  </DropdownItem>
                ))}
                {llmInstances.length === 0 && <DropdownItem disabled>No LLM instances yet</DropdownItem>}
                <DropdownSeparator />
                <DropdownItem icon={<Plus className="w-4 h-4" />} onSelect={() => navigate('/plugins')}>
                  Configure in Plugins
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
            {activePlugin && (
              <Badge variant="accent" size="sm">{String(activePlugin.config.model ?? activePlugin.pluginId)}</Badge>
            )}
          </div>
          <Tooltip content="Chat settings">
            <Button variant="icon" size="sm" onClick={() => navigate('/settings')} aria-label="Chat settings">
              <Settings className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Card padding="lg" className="max-w-md w-full text-center">
                <Brain className="w-12 h-12 mx-auto text-accent-hover mb-4" />
                <h2 className="text-h2 text-text-primary mb-2">Start chatting</h2>
                <p className="text-sm text-text-muted mb-6">
                  {activePlugin
                    ? `Connected to ${activePlugin.name} (${String(activePlugin.config.model ?? '')}). Ask anything.`
                    : 'Add your OpenAI or Anthropic API key under Plugins to begin.'}
                </p>
                {!activePlugin && (
                  <Link to="/plugins">
                    <Button variant="primary" size="md">Open Plugins</Button>
                  </Link>
                )}
              </Card>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={cn('flex gap-3 animate-slide-up', isUser && 'flex-row-reverse')}>
                    <Avatar
                      size="sm"
                      name={isUser ? (user?.firstName ?? 'You') : 'AI'}
                      src={isUser ? (user?.imageUrl ?? null) : null}
                      className="shrink-0 mt-1"
                    />
                    <div className={cn('flex-1 min-w-0 max-w-[85%]', isUser && 'flex flex-col items-end')}>
                      <div
                        className={cn(
                          'inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                          isUser
                            ? 'bg-accent-primary text-white rounded-tr-sm'
                            : 'bg-white/[0.03] border border-border-standard text-text-primary rounded-tl-sm'
                        )}
                      >
                        {m.content || <span className="text-text-subtle">…</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-1">
                        <span className="text-xs text-text-subtle">{formatTime(m.timestamp)}</span>
                        {m.metadata?.model && (
                          <span className="text-xs text-text-subtle font-mono">{m.metadata.model}</span>
                        )}
                        {!isUser && m.content && (
                          <div className="flex items-center gap-1">
                            <Tooltip content="Copy">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void handleCopy(m.id, m.content)} aria-label="Copy message">
                                {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              </Button>
                            </Tooltip>
                            <Tooltip content="Reuse prompt">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleRegenerate(session!.id, m.id)} aria-label="Reuse prompt">
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {isStreaming && (
          <div className="px-4 py-2 border-t border-border-subtle bg-bg-panel/50">
            <div className="flex items-center gap-2 text-sm text-text-muted max-w-3xl mx-auto">
              <Loader2 className="w-4 h-4 animate-spin text-accent-hover" />
              <span>AI is typing...</span>
              <Button variant="ghost" size="sm" onClick={handleStop} leftIcon={<StopCircle className="w-4 h-4" />}>
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={(e) => void handleSend(e)} className="p-4 border-t border-border-subtle bg-bg-panel/50">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e as unknown as React.FormEvent);
                  }
                }}
                placeholder={activePlugin ? 'Message AI... (Enter to send)' : 'Configure an LLM in Plugins first...'}
                className="w-full bg-white/[0.02] border border-border-standard rounded-lg px-4 py-3 text-body text-text-secondary placeholder:text-text-subtle resize-none focus:border-accent-hover focus:outline-none focus:shadow-[0_0_0_2px_rgba(94,106,210,0.2)] transition-all min-h-[48px] max-h-[200px]"
                rows={1}
                disabled={isStreaming}
              />
            </div>
            <Tooltip content="Attach (soon)">
              <Button variant="icon" size="sm" type="button" aria-label="Attach file" disabled>
                <Paperclip className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Button type="submit" variant="primary" size="sm" disabled={!input.trim() || isStreaming} aria-label="Send message">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
