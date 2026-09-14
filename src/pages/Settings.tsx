import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '../components/ui/Dropdown';
import { useAppStore } from '../store';
import { KeyRound, Plus, Trash2, Bell, Moon, Sun, Save, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { formatRelativeTime } from '../lib/utils';

const PROVIDERS = ['OpenAI', 'Anthropic', 'Custom'];

export function Settings() {
  const { settings, updateSettings, apiKeys, addApiKey, removeApiKey, addNotification } = useAppStore();
  const [keyName, setKeyName] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [keyProvider, setKeyProvider] = useState('OpenAI');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const saveKey = () => {
    if (!keyName.trim() || !keyValue.trim()) {
      addNotification({ message: 'Name and key are required.', type: 'warning' });
      return;
    }
    addApiKey({ provider: keyProvider, name: keyName.trim(), key: keyValue.trim() });
    addNotification({ message: `Key "${keyName.trim()}" saved locally.`, type: 'success' });
    setKeyName('');
    setKeyValue('');
  };

  const mask = (key: string) => (key.length <= 8 ? '••••••••' : `${key.slice(0, 4)}••••••••${key.slice(-4)}`);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Tabs defaultValue="general" variant="pills">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="keys">API Keys ({apiKeys.length})</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card variant="panel" padding="md">
            <CardHeader>
              <CardTitle subtitle="Stored locally in your browser">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm-med text-text-primary">Theme</p>
                  <p className="text-sm text-text-muted">Dark is the native look.</p>
                </div>
                <div className="flex gap-1.5">
                  {(['dark', 'light'] as const).map((t) => (
                    <Button key={t} variant={settings.theme === t ? 'primary' : 'ghost'} size="sm"
                      onClick={() => updateSettings({ theme: t })}
                      leftIcon={t === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}>
                      {t === 'dark' ? 'Dark' : 'Light'}
                    </Button>
                  ))}
                </div>
              </div>

              <ToggleRow label="Notifications" hint="Toast alerts for runs, errors and saves."
                checked={settings.notifications} onChange={(v) => updateSettings({ notifications: v })} />
              <ToggleRow label="Auto-save" hint="Persist chats, workflows and instances automatically."
                checked={settings.autoSave} onChange={(v) => updateSettings({ autoSave: v })} />
              <ToggleRow label="Compact mode" hint="Denser spacing for small screens."
                checked={settings.compactMode} onChange={(v) => updateSettings({ compactMode: v })} />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm-med text-text-primary">Language</p>
                  <p className="text-sm text-text-muted">UI language.</p>
                </div>
                <Dropdown>
                  <DropdownTrigger className="w-32 justify-between">
                    {settings.language.toUpperCase()} <ChevronDown className="w-3.5 h-3.5" />
                  </DropdownTrigger>
                  <DropdownContent align="end">
                    {['en', 'de', 'fr', 'es'].map((l) => (
                      <DropdownItem key={l} onSelect={() => updateSettings({ language: l })}>{l.toUpperCase()}</DropdownItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys">
          <Card variant="panel" padding="md">
            <CardHeader>
              <CardTitle subtitle="Keys never leave your browser — sent directly to the provider API.">API Keys</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Key name (e.g. Personal GPT)" aria-label="Key name" />
                <div className="flex gap-2">
                  <Dropdown>
                    <DropdownTrigger className="shrink-0">
                      {keyProvider} <ChevronDown className="w-3.5 h-3.5" />
                    </DropdownTrigger>
                    <DropdownContent align="start">
                      {PROVIDERS.map((p) => (
                        <DropdownItem key={p} onSelect={() => setKeyProvider(p)}>{p}</DropdownItem>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>
                <div className="sm:col-span-3 flex gap-2">
                  <Input value={keyValue} onChange={(e) => setKeyValue(e.target.value)} type="password" placeholder="sk-..." className="font-mono" aria-label="API key value" />
                  <Button variant="primary" size="sm" onClick={saveKey} leftIcon={<Plus className="w-4 h-4" />} className="shrink-0">
                    Save
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {apiKeys.map((k) => (
                  <div key={k.id} className="flex items-center gap-3 border border-border-subtle rounded-lg px-3 py-2.5">
                    <KeyRound className="w-4 h-4 text-text-subtle shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm-med text-text-primary truncate">{k.name}</p>
                        <Badge variant="subtle" size="sm">{k.provider}</Badge>
                      </div>
                      <p className="text-xs text-text-subtle font-mono">
                        {showKeys[k.id] ? k.key : mask(k.key)} • added {formatRelativeTime(k.createdAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowKeys((s) => ({ ...s, [k.id]: !s[k.id] }))} aria-label="Toggle key visibility">
                      {showKeys[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeApiKey(k.id)} aria-label="Delete key">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <p className="text-sm text-text-subtle text-center py-6">
                    No keys yet. Prefer per-instance keys? Add them directly in Plugins instead.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card variant="panel" padding="md">
            <CardHeader>
              <CardTitle>AI Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm text-text-secondary">
              <p>Modular hub for LLMs, agents, APIs, chatbots, code and your own HTML apps.</p>
              <ul className="space-y-1.5 text-text-muted">
                <li>• <Save className="w-3.5 h-3.5 inline" /> Everything persists in localStorage — no backend required.</li>
                <li>• <Bell className="w-3.5 h-3.5 inline" /> BYOK: API keys stay in your browser.</li>
                <li>• <KeyRound className="w-3.5 h-3.5 inline" /> Static build — deployable to Cloudflare Pages.</li>
              </ul>
              <div className="flex gap-2 pt-2">
                <Badge variant="subtle" size="sm">React 19</Badge>
                <Badge variant="subtle" size="sm">Vite</Badge>
                <Badge variant="subtle" size="sm">Tailwind v4</Badge>
                <Badge variant="subtle" size="sm">Clerk</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm-med text-text-primary">{label}</p>
        <p className="text-sm text-text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${checked ? 'bg-accent-primary' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
