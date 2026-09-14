/**
 * Unified LLM client: OpenAI + Anthropic via BYOK keys.
 * All calls run client-side (static hosting on Cloudflare Pages).
 */

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMsg[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
}

function providerOf(model: string): 'openai' | 'anthropic' {
  if (model.startsWith('claude')) return 'anthropic';
  return 'openai';
}

export async function chatComplete(
  apiKey: string,
  opts: ChatOptions
): Promise<string> {
  const provider = providerOf(opts.model);
  if (provider === 'anthropic') return anthropicChat(apiKey, opts);
  return openAIChat(apiKey, opts);
}

async function openAIChat(apiKey: string, opts: ChatOptions): Promise<string> {
  const stream = typeof opts.onToken === 'function';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
      stream,
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 300)}`);
  }
  if (!stream || !res.body) {
    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? '';
  }
  return readOpenAIStream(res.body, opts.onToken);
}

async function readOpenAIStream(
  body: ReadableStream<Uint8Array>,
  onToken?: (t: string) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const payload = t.slice(5).trim();
      if (payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload) as { choices: Array<{ delta: { content?: string } }> };
        const token = json.choices[0]?.delta?.content ?? '';
        if (token) { full += token; onToken?.(token); }
      } catch { /* keep-alive */ }
    }
  }
  return full;
}

async function anthropicChat(apiKey: string, opts: ChatOptions): Promise<string> {
  const stream = typeof opts.onToken === 'function';
  const system = opts.messages.find((m) => m.role === 'system')?.content;
  const messages = opts.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
      system,
      messages,
      stream,
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 300)}`);
  }
  if (!stream || !res.body) {
    const data = (await res.json()) as { content: Array<{ text?: string }> };
    return data.content.map((b) => b.text ?? '').join('');
  }
  return readAnthropicStream(res.body, opts.onToken);
}

async function readAnthropicStream(
  body: ReadableStream<Uint8Array>,
  onToken?: (t: string) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const events = buf.split('\n\n');
    buf = events.pop() ?? '';
    for (const ev of events) {
      const line = ev.split('\n').find((l) => l.startsWith('data:'));
      if (!line) continue;
      try {
        const json = JSON.parse(line.slice(5).trim()) as { type: string; delta?: { text?: string } };
        if (json.type === 'content_block_delta' && json.delta?.text) {
          full += json.delta.text;
          onToken?.(json.delta.text);
        }
      } catch { /* keep-alive */ }
    }
  }
  return full;
}

export const OPENAI_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'o1-mini',
];

export const ANTHROPIC_MODELS = [
  'claude-sonnet-4-20250514',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
];
