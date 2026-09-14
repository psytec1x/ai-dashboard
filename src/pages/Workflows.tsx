import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { ScrollArea } from '../components/ui/ScrollArea';
import { useAppStore } from '../store';
import { generateId } from '../lib/utils';
import { Plus, Play, Trash2, GitBranch, X, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { chatComplete } from '../lib/api';
import type { Workflow } from '../types';

const STEP_TYPES = [
  { id: 'prompt', name: 'LLM Prompt', description: 'Send a prompt to the LLM, pass {{prev}} for previous output' },
  { id: 'transform', name: 'Transform', description: 'Prefix/suffix wrapper around previous output' },
];

interface Step {
  id: string;
  type: string;
  name: string;
  prompt: string;
}

export function Workflows() {
  const { workflows, createWorkflow, updateWorkflow, deleteWorkflow, pluginInstances, addNotification } = useAppStore();
  const [showNew, setShowNew] = useState(false);
  const [wfName, setWfName] = useState('');
  const [wfDesc, setWfDesc] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [runLog, setRunLog] = useState<Array<{ step: string; output: string; ok: boolean }>>([]);

  const active: Workflow | undefined = workflows.find((w) => w.id === activeId);
  const llmInstances = pluginInstances.filter(
    (p) => p.enabled && (p.pluginId === 'builtin-openai' || p.pluginId === 'builtin-anthropic')
  );

  const openWorkflow = (id: string) => {
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;
    setActiveId(id);
    const loaded: Step[] = wf.nodes.map((n) => ({
      id: n.id,
      type: String(n.data.kind ?? 'prompt'),
      name: String(n.data.name ?? 'Step'),
      prompt: String(n.data.prompt ?? ''),
    }));
    setSteps(loaded);
    setRunLog([]);
  };

  const handleCreate = () => {
    if (!wfName.trim()) {
      addNotification({ message: 'Give the workflow a name first.', type: 'warning' });
      return;
    }
    const wf = createWorkflow({ name: wfName.trim(), description: wfDesc.trim(), nodes: [], edges: [] });
    setWfName('');
    setWfDesc('');
    setShowNew(false);
    openWorkflow(wf.id);
  };

  const addStep = (type: string) => {
    const def = STEP_TYPES.find((t) => t.id === type);
    setSteps((s) => [...s, { id: generateId(), type, name: def?.name ?? type, prompt: '' }]);
  };

  const persist = (next: Step[]) => {
    setSteps(next);
    if (active) {
      updateWorkflow(active.id, {
        nodes: next.map((s, i) => ({
          id: s.id,
          type: s.type,
          position: { x: 0, y: i * 120 },
          data: { kind: s.type, name: s.name, prompt: s.prompt },
        })),
        edges: next.slice(1).map((s, i) => ({ id: `${next[i].id}-${s.id}`, source: next[i].id, target: s.id })),
      });
    }
  };

  const runWorkflow = async () => {
    if (steps.length === 0) {
      addNotification({ message: 'Add at least one step first.', type: 'warning' });
      return;
    }
    const llm = llmInstances[0];
    if (!llm) {
      addNotification({ message: 'Configure an LLM instance in Plugins first.', type: 'warning' });
      return;
    }
    const apiKey = String(llm.config.apiKey ?? '');
    if (!apiKey) {
      addNotification({ message: `Instance "${llm.name}" has no API key.`, type: 'warning' });
      return;
    }
    setRunning(true);
    setRunLog([]);
    let prev = '';
    const model = String(llm.config.model ?? 'gpt-4o-mini');
    try {
      for (const step of steps) {
        let out: string;
        if (step.type === 'transform') {
          out = `${step.prompt.replace('{{prev}}', prev)}`;
        } else {
          const prompt = step.prompt.replace('{{prev}}', prev);
          out = await chatComplete(apiKey, {
            model,
            messages: [{ role: 'user', content: prompt }],
          });
        }
        prev = out;
        setRunLog((l) => [...l, { step: step.name, output: out, ok: true }]);
      }
      addNotification({ message: `Workflow "${active?.name}" finished.`, type: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Run failed';
      setRunLog((l) => [...l, { step: 'error', output: msg, ok: false }]);
      addNotification({ message: msg, type: 'error' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-7.5rem)] animate-fade-in">
      <aside className="hidden md:flex w-60 shrink-0 flex-col gap-2">
        <Button variant="primary" size="sm" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNew(true)}>
          New Workflow
        </Button>
        <ScrollArea className="flex-1 space-y-1">
          {workflows.map((w) => (
            <div
              key={w.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                w.id === activeId ? 'bg-white/[0.05] text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
              )}
              onClick={() => openWorkflow(w.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openWorkflow(w.id)}
            >
              <GitBranch className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-sm truncate">{w.name}</span>
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 text-text-subtle hover:text-error"
                onClick={(e) => { e.stopPropagation(); deleteWorkflow(w.id); if (activeId === w.id) { setActiveId(null); setSteps([]); } }}
                aria-label={`Delete ${w.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {workflows.length === 0 && (
            <p className="text-sm text-text-subtle px-2 py-4 text-center">No workflows yet</p>
          )}
        </ScrollArea>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
        {!active ? (
          <Card padding="lg" className="text-center max-w-md mx-auto mt-16">
            <GitBranch className="w-12 h-12 mx-auto text-success mb-4" />
            <h2 className="text-h2 text-text-primary mb-2">Chain workflows</h2>
            <p className="text-sm text-text-muted mb-6">Link LLM prompts and transforms into repeatable pipelines. Use {'{{prev}}'} to pipe step output forward.</p>
            <Button variant="primary" onClick={() => setShowNew(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Create Workflow
            </Button>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-h2 text-text-primary">{active.name}</h2>
                {active.description && <p className="text-sm text-text-muted">{active.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="subtle" size="sm">{steps.length} steps</Badge>
                <Button variant="primary" size="sm" onClick={() => void runWorkflow()} disabled={running || steps.length === 0} leftIcon={running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}>
                  {running ? 'Running...' : 'Run'}
                </Button>
              </div>
            </div>

            <Card padding="md">
              <CardHeader>
                <CardTitle>Steps</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {steps.map((step, i) => (
                  <div key={step.id} className="border border-border-standard rounded-lg p-3 bg-white/[0.01]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-accent-primary/15 text-accent-hover text-xs font-medium flex items-center justify-center shrink-0">{i + 1}</span>
                      <Input
                        value={step.name}
                        onChange={(e) => persist(steps.map((s) => (s.id === step.id ? { ...s, name: e.target.value } : s)))}
                        className="py-1.5"
                        aria-label="Step name"
                      />
                      <Badge variant="subtle" size="sm">{step.type}</Badge>
                      <button
                        type="button"
                        className="text-text-subtle hover:text-error shrink-0"
                        onClick={() => persist(steps.filter((s) => s.id !== step.id))}
                        aria-label="Remove step"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Textarea
                      value={step.prompt}
                      onChange={(e) => persist(steps.map((s) => (s.id === step.id ? { ...s, prompt: e.target.value } : s)))}
                      placeholder={step.type === 'prompt' ? 'Summarize this: {{prev}}' : 'Prefix: {{prev}}'}
                      className="min-h-[80px]"
                      aria-label="Step prompt"
                    />
                    {i < steps.length - 1 && (
                      <div className="flex justify-center py-1 text-text-subtle">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
                {steps.length === 0 && (
                  <p className="text-sm text-text-subtle text-center py-4">No steps yet — add one below.</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {STEP_TYPES.map((t) => (
                    <Button key={t.id} variant="ghost" size="sm" onClick={() => addStep(t.id)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                      {t.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {runLog.length > 0 && (
              <Card padding="md">
                <CardHeader>
                  <CardTitle>Run Output</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {runLog.map((entry, i) => (
                    <div key={i} className={cn('border rounded-lg p-3', entry.ok ? 'border-border-standard' : 'border-error/40')}>
                      <div className="flex items-center gap-2 mb-1">
                        {entry.ok ? <CheckCircle2 className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />}
                        <span className="text-sm-med text-text-primary">{entry.step}</span>
                      </div>
                      <pre className="text-sm text-text-secondary whitespace-pre-wrap break-words max-h-60 overflow-y-auto">{entry.output}</pre>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew} title="New Workflow" description="Pipelines chain LLM prompts with {{prev}} placeholders.">
        <div className="space-y-4">
          <Input label="Name" value={wfName} onChange={(e) => setWfName(e.target.value)} placeholder="e.g. Blog post pipeline" />
          <Textarea label="Description" value={wfDesc} onChange={(e) => setWfDesc(e.target.value)} placeholder="What does it do?" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
