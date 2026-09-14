import { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store';
import { Play, Trash2, Terminal, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const STARTER = `// Sandboxed JS runner — console.log output is captured below.\nconst data = [3, 1, 4, 1, 5, 9, 2, 6];\nconst sorted = [...data].sort((a, b) => a - b);\nconsole.log('sorted:', sorted.join(', '));\nconsole.log('sum:', sorted.reduce((a, b) => a + b, 0));\n`;

interface RunResult {
  logs: string[];
  error: string | null;
  ms: number;
}

export function CodePlayground() {
  const { addCodeExecution, codeExecutions, clearCodeExecutions, addNotification } = useAppStore();
  const [code, setCode] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [copied, setCopied] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const run = () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    const started = performance.now();

    try {
      workerRef.current?.terminate();
    } catch { /* noop */ }

    const workerSrc = `
      const logs = [];
      const origLog = console.log.bind(console);
      console.log = (...args) => { logs.push(args.map(String).join(' ')); };
      console.error = (...args) => { logs.push('[error] ' + args.map(String).join(' ')); };
      self.onmessage = (e) => {
        try {
          const fn = new Function(e.data);
          const out = fn();
          if (out !== undefined) logs.push(String(out));
          self.postMessage({ ok: true, logs });
        } catch (err) {
          self.postMessage({ ok: false, logs, error: String(err && err.message || err) });
        }
      };
    `;
    const worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' })));
    workerRef.current = worker;

    const timeout = setTimeout(() => {
      worker.terminate();
      const ms = Math.round(performance.now() - started);
      setResult({ logs: [], error: 'Timed out after 10s (possible infinite loop).', ms });
      setRunning(false);
    }, 10000);

    worker.onmessage = (e: MessageEvent<{ ok: boolean; logs: string[]; error?: string }>) => {
      clearTimeout(timeout);
      const ms = Math.round(performance.now() - started);
      const res: RunResult = { logs: e.data.logs, error: e.data.ok ? null : (e.data.error ?? 'Failed'), ms };
      setResult(res);
      addCodeExecution({ language: 'javascript', code, output: res.logs.join('\n'), error: res.error ?? undefined, executionTime: ms });
      if (!e.data.ok) addNotification({ message: e.data.error ?? 'Execution failed', type: 'error' });
      worker.terminate();
      setRunning(false);
    };
    worker.onerror = () => {
      clearTimeout(timeout);
      const ms = Math.round(performance.now() - started);
      setResult({ logs: [], error: 'Worker error — check syntax.', ms });
      setRunning(false);
    };
    worker.postMessage(code);
  };

  const copyOutput = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.logs.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addNotification({ message: 'Copy failed', type: 'error' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in h-[calc(100vh-7.5rem)]">
      <Card padding="md" className="flex flex-col min-h-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle subtitle="Sandboxed Web Worker • 10s timeout">JavaScript Runner</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="subtle" size="sm">JS</Badge>
            <Button variant="primary" size="sm" onClick={run} disabled={running} leftIcon={running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}>
              {running ? 'Running' : 'Run'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0 flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 min-h-[256px] w-full code-block resize-none focus:border-accent-hover focus:outline-none"
            aria-label="JavaScript code"
          />
          <p className="mt-2 text-xs text-text-subtle">
            Python runs server-side only — connect a REST backend or paste Python into a Custom HTML plugin (Pyodide) to run it in-browser.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
        <Card padding="md">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle subtitle={result ? `${result.ms}ms` : 'Press Run to execute'}>Output</CardTitle>
            {result && (
              <Button variant="ghost" size="sm" onClick={() => void copyOutput()} leftIcon={copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}>
                Copy
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {!result ? (
              <div className="flex items-center gap-2 text-sm text-text-subtle py-6 justify-center">
                <Terminal className="w-4 h-4" /> No output yet
              </div>
            ) : (
              <div className="space-y-2">
                {result.logs.map((log, i) => (
                  <pre key={i} className="text-sm text-text-secondary bg-black/30 border border-border-subtle rounded-md px-3 py-2 whitespace-pre-wrap break-words">{log}</pre>
                ))}
                {result.error && (
                  <pre className="text-sm text-error bg-error-bg border border-error/30 rounded-md px-3 py-2 whitespace-pre-wrap break-words">{result.error}</pre>
                )}
                {result.logs.length === 0 && !result.error && (
                  <p className="text-sm text-text-subtle">No console output.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle subtitle={`${codeExecutions.length} saved`}>History</CardTitle>
            {codeExecutions.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCodeExecutions} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0 space-y-2 max-h-64 overflow-y-auto">
            {codeExecutions.slice(0, 10).map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setCode(ex.code)}
                className={cn('w-full text-left border border-border-subtle rounded-lg px-3 py-2 hover:bg-white/[0.02] transition-colors')}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={ex.error ? 'error' : 'success'} size="sm">{ex.error ? 'error' : 'ok'}</Badge>
                  <span className="text-xs text-text-subtle font-mono">{ex.executionTime}ms</span>
                  <span className="text-xs text-text-subtle truncate flex-1">{ex.code.split('\n')[0]}</span>
                </div>
              </button>
            ))}
            {codeExecutions.length === 0 && (
              <p className="text-sm text-text-subtle text-center py-4">Runs are saved here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
