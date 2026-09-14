import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '../components/ui/Dropdown';
import { useAppStore } from '../store';
import { Send, Loader2, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface HeaderRow {
  key: string;
  value: string;
}

interface HistoryEntry {
  method: Method;
  url: string;
  status: number | null;
  ms: number;
  ok: boolean;
}

const METHOD_COLORS: Record<Method, string> = {
  GET: 'text-success',
  POST: 'text-accent-hover',
  PUT: 'text-warning',
  DELETE: 'text-error',
  PATCH: 'text-purple-400',
};

export function ApiPlayground() {
  const { addNotification, apiKeys } = useAppStore();
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<HeaderRow[]>([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('{\n  "title": "Hello",\n  "body": "world"\n}');
  const [authKeyId, setAuthKeyId] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{ status: number; statusText: string; ms: number; headers: Record<string, string>; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const send = async () => {
    if (!url.trim()) {
      addNotification({ message: 'Enter a URL first.', type: 'warning' });
      return;
    }
    setSending(true);
    setResponse(null);
    const started = performance.now();
    try {
      const h: Record<string, string> = {};
      for (const row of headers) {
        if (row.key.trim()) h[row.key.trim()] = row.value;
      }
      const authKey = apiKeys.find((k) => k.id === authKeyId);
      if (authKey) h.Authorization = `Bearer ${authKey.key}`;
      const init: RequestInit = { method, headers: h };
      if (method !== 'GET' && body.trim()) {
        init.body = body;
        if (!h['Content-Type']) h['Content-Type'] = 'application/json';
      }
      const res = await fetch(url, init);
      const text = await res.text();
      const ms = Math.round(performance.now() - started);
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      setResponse({ status: res.status, statusText: res.statusText, ms, headers: resHeaders, text: text.slice(0, 50000) });
      setHistory((hist) => [{ method, url, status: res.status, ms, ok: res.ok }, ...hist].slice(0, 20));
      if (!res.ok) addNotification({ message: `Request returned ${res.status}`, type: 'warning' });
    } catch (err) {
      const ms = Math.round(performance.now() - started);
      const msg = err instanceof Error ? err.message : 'Request failed (CORS blocks many browser-side calls — use a public CORS-friendly API).';
      setResponse({ status: 0, statusText: 'Network error', ms, headers: {}, text: msg });
      setHistory((hist) => [{ method, url, status: null, ms, ok: false }, ...hist].slice(0, 20));
      addNotification({ message: msg, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const pretty = (text: string): string => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-fade-in">
      <Card padding="md" className="lg:col-span-3">
        <CardHeader>
          <CardTitle subtitle="Browser-side fetch • CORS applies">Request Builder</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger className={cn('w-28 justify-center font-mono font-medium', METHOD_COLORS[method])}>
                {method} <ChevronDown className="w-3.5 h-3.5" />
              </DropdownTrigger>
              <DropdownContent align="start">
                {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as Method[]).map((m) => (
                  <DropdownItem key={m} onSelect={() => setMethod(m)}>
                    <span className={cn('font-mono font-medium', METHOD_COLORS[m])}>{m}</span>
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="font-mono text-sm" aria-label="Request URL" />
            <Button variant="primary" onClick={() => void send()} disabled={sending} leftIcon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}>
              {sending ? '...' : 'Send'}
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm-med text-text-secondary">Headers</span>
              <Button variant="ghost" size="sm" onClick={() => setHeaders((h) => [...h, { key: '', value: '' }])} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {headers.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={row.key} onChange={(e) => setHeaders((h) => h.map((r, j) => (j === i ? { ...r, key: e.target.value } : r)))} placeholder="Header" className="font-mono text-sm" aria-label="Header name" />
                  <Input value={row.value} onChange={(e) => setHeaders((h) => h.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))} placeholder="Value" className="font-mono text-sm" aria-label="Header value" />
                  <Button variant="ghost" size="sm" onClick={() => setHeaders((h) => h.filter((_, j) => j !== i))} aria-label="Remove header">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {method !== 'GET' && (
            <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-sm min-h-[128px]" spellCheck={false} />
          )}

          {apiKeys.length > 0 && (
            <div>
              <span className="text-sm-med text-text-secondary block mb-2">Auth Key (from Settings)</span>
              <Dropdown>
                <DropdownTrigger className="w-full justify-between">
                  <span className="truncate">{apiKeys.find((k) => k.id === authKeyId)?.name ?? 'None'}</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                </DropdownTrigger>
                <DropdownContent align="start" className="w-full">
                  <DropdownItem onSelect={() => setAuthKeyId('')}>None</DropdownItem>
                  {apiKeys.map((k) => (
                    <DropdownItem key={k.id} onSelect={() => setAuthKeyId(k.id)}>{k.name} ({k.provider})</DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
        <Card padding="md">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle subtitle={response ? `${response.status} ${response.statusText} • ${response.ms}ms` : 'No response yet'}>Response</CardTitle>
            {response && (
              <Badge variant={response.status >= 200 && response.status < 300 ? 'success' : response.status === 0 ? 'error' : 'warning'} size="sm">
                {response.status === 0 ? 'FAILED' : response.status}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {!response ? (
              <p className="text-sm text-text-subtle text-center py-6">Send a request to see the response.</p>
            ) : (
              <pre className="code-block max-h-96 overflow-auto">{pretty(response.text) || '(empty body)'}</pre>
            )}
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle subtitle={`${history.length} recent`}>History</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5 max-h-56 overflow-y-auto">
            {history.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setMethod(h.method); setUrl(h.url); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-white/[0.02] text-left transition-colors"
              >
                <span className={cn('font-mono text-xs font-medium w-14 shrink-0', METHOD_COLORS[h.method])}>{h.method}</span>
                <span className="text-xs text-text-secondary truncate flex-1 font-mono">{h.url}</span>
                <Badge variant={h.ok ? 'success' : 'error'} size="sm">{h.status ?? 'ERR'}</Badge>
              </button>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-text-subtle text-center py-4">Requests appear here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
