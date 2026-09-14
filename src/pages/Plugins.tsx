import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Tooltip } from '../components/ui/Tooltip';
import { useAppStore } from '../store';
import { BUILTIN_PLUGINS } from '../plugins/registry';
import type { PluginManifest, PluginCategory } from '../types';
import {
  Plug, Plus, Trash2, Power, Settings2, Brain, Bot, Terminal,
  Globe, Code2, Webhook, Sparkles, Search, X,
} from 'lucide-react';
import { cn } from '../lib/utils';

const ICONS: Record<string, typeof Plug> = {
  Sparkles, Brain, Bot, Terminal, Globe, Code2, Webhook, Plug,
};

const CATEGORIES: Array<{ id: PluginCategory | 'all'; name: string }> = [
  { id: 'all', name: 'All' },
  { id: 'llm', name: 'LLM' },
  { id: 'agent', name: 'Agents' },
  { id: 'chatbot', name: 'Chatbots' },
  { id: 'api', name: 'APIs' },
  { id: 'tool', name: 'Tools' },
  { id: 'workflow', name: 'Workflows' },
  { id: 'data', name: 'Data' },
  { id: 'custom', name: 'Custom' },
];

export function Plugins() {
  const { pluginInstances, createPluginInstance, updatePluginInstance, deletePluginInstance, addNotification } = useAppStore();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [configuring, setConfiguring] = useState<PluginManifest | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const category = (params.get('category') ?? 'all') as PluginCategory | 'all';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BUILTIN_PLUGINS.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return (p.name + p.description + p.tags.join(' ')).toLowerCase().includes(q);
    });
  }, [category, search]);

  const openConfigure = (manifest: PluginManifest) => {
    setConfiguring(manifest);
    setInstanceName(manifest.name);
    const defaults: Record<string, string> = {};
    for (const f of manifest.configFields) {
      defaults[f.key] = f.default !== undefined ? String(f.default) : '';
    }
    setFieldValues(defaults);
  };

  const saveInstance = () => {
    if (!configuring) return;
    for (const f of configuring.configFields) {
      if (f.required && !fieldValues[f.key]?.trim()) {
        addNotification({ message: `"${f.label}" is required.`, type: 'warning' });
        return;
      }
    }
    const config: Record<string, unknown> = { ...fieldValues };
    for (const f of configuring.configFields) {
      if (f.type === 'number') config[f.key] = Number(fieldValues[f.key] || 0);
      if (f.type === 'json') {
        try { config[f.key] = JSON.parse(fieldValues[f.key] || '{}'); }
        catch { addNotification({ message: `"${f.label}" is not valid JSON.`, type: 'error' }); return; }
      }
    }
    createPluginInstance(configuring.id, instanceName.trim() || configuring.name, config);
    addNotification({ message: `"${instanceName.trim() || configuring.name}" added.`, type: 'success' });
    setConfiguring(null);
  };

  const renderField = (f: PluginManifest['configFields'][number]) => {
    const val = fieldValues[f.key] ?? '';
    const set = (v: string) => setFieldValues((s) => ({ ...s, [f.key]: v }));
    if (f.type === 'select') {
      return (
        <label key={f.key} className="block">
          <span className="block text-sm-med text-text-secondary mb-2">{f.label}{f.required && ' *'}</span>
          <select value={val} onChange={(e) => set(e.target.value)} className="input">
            {(f.options ?? []).map((o) => (
              <option key={o.value} value={o.value} className="bg-bg-elevated">{o.label}</option>
            ))}
          </select>
          {f.description && <span className="block mt-1.5 text-sm text-text-subtle">{f.description}</span>}
        </label>
      );
    }
    if (f.type === 'code' || f.type === 'json') {
      return (
        <Textarea key={f.key} label={`${f.label}${f.required ? ' *' : ''}`} value={val}
          onChange={(e) => set(e.target.value)} placeholder={f.placeholder}
          hint={f.description} className="font-mono text-sm min-h-[144px]" spellCheck={false} />
      );
    }
    if (f.type === 'number') {
      return <Input key={f.key} label={`${f.label}${f.required ? ' *' : ''}`} type="number" value={val} onChange={(e) => set(e.target.value)} hint={f.description} />;
    }
    return (
      <Input key={f.key} label={`${f.label}${f.required ? ' *' : ''}`}
        type={f.type === 'password' ? 'password' : 'text'}
        value={val} onChange={(e) => set(e.target.value)}
        placeholder={f.placeholder} hint={f.description} />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Instances */}
      {pluginInstances.length > 0 && (
        <div>
          <h2 className="text-h3 text-text-primary mb-3">Your Instances ({pluginInstances.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pluginInstances.map((inst) => {
              const manifest = BUILTIN_PLUGINS.find((p) => p.id === inst.pluginId);
              const Icon = ICONS[manifest?.icon ?? 'Plug'] ?? Plug;
              return (
                <Card key={inst.id} padding="md" hover>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent-hover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm-med text-text-primary truncate">{inst.name}</p>
                      <p className="text-xs text-text-muted truncate">{manifest?.name ?? inst.pluginId}</p>
                    </div>
                    <Badge variant={inst.enabled ? 'success' : 'subtle'} size="sm" dot>{inst.enabled ? 'On' : 'Off'}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Tooltip content={inst.enabled ? 'Disable' : 'Enable'}>
                      <Button variant="ghost" size="sm" onClick={() => updatePluginInstance(inst.id, { enabled: !inst.enabled })} aria-label="Toggle instance">
                        <Power className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                    {inst.pluginId === 'builtin-html' && (
                      <Button variant="ghost" size="sm" onClick={() => setPreviewHtml(String(inst.config.html ?? ''))}>
                        Preview
                      </Button>
                    )}
                    <Tooltip content="Delete">
                      <Button variant="ghost" size="sm" onClick={() => deletePluginInstance(inst.id)} aria-label="Delete instance">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Store header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plugins..." className="pl-10" aria-label="Search plugins" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setParams(c.id === 'all' ? {} : { category: c.id })}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                category === c.id
                  ? 'bg-accent-primary text-white border-transparent'
                  : 'bg-transparent text-text-secondary border-border-solid hover:border-border-standard hover:text-text-primary'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Store grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const Icon = ICONS[p.icon] ?? Plug;
          const count = pluginInstances.filter((i) => i.pluginId === p.id).length;
          return (
            <Card key={p.id} variant="panel" padding="md" hover className="flex flex-col">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent-hover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-h3 text-text-primary truncate">{p.name}</h3>
                    {count > 0 && <Badge variant="accent" size="sm">{count}</Badge>}
                  </div>
                  <p className="text-xs text-text-subtle capitalize">{p.category} • v{p.version}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-text-muted flex-1">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.capabilities.map((c) => (
                  <Badge key={c} variant="subtle" size="sm">{c}</Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" fullWidth onClick={() => openConfigure(p)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Instance
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-sm text-text-subtle py-12">No plugins match.</p>
      )}

      {/* Configure dialog */}
      <Dialog open={configuring !== null} onOpenChange={(o) => { if (!o) setConfiguring(null); }}
        title={configuring ? `Add ${configuring.name}` : ''} description="Instances store their config locally in your browser.">
        <div className="space-y-4">
          <Input label="Instance Name" value={instanceName} onChange={(e) => setInstanceName(e.target.value)} placeholder={configuring?.name} />
          {configuring?.configFields.map(renderField)}
          {configuring && configuring.configFields.length === 0 && (
            <p className="text-sm text-text-muted flex items-center gap-2"><Settings2 className="w-4 h-4" /> No configuration needed.</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfiguring(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveInstance}>Save Instance</Button>
          </div>
        </div>
      </Dialog>

      {/* HTML preview dialog */}
      <Dialog open={previewHtml !== null} onOpenChange={(o) => { if (!o) setPreviewHtml(null); }} title="HTML Preview" size="lg">
        {previewHtml !== null && (
          <div>
            <iframe
              title="Custom HTML preview"
              sandbox="allow-scripts"
              srcDoc={previewHtml}
              className="w-full rounded-lg border border-border-standard bg-white"
              style={{ height: 480 }}
            />
            <div className="flex justify-end mt-4">
              <Button variant="ghost" size="sm" onClick={() => setPreviewHtml(null)} leftIcon={<X className="w-3.5 h-3.5" />}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
