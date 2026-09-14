import { Link } from 'react-router-dom';
import { SignInButton } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Zap,
  MessageSquare,
  GitBranch,
  Code,
  Globe,
  Plug,
  ArrowRight,
  ArrowUpRight,
  Check,
  Brain,
  Terminal,
} from 'lucide-react';
import { cn } from '../lib/utils';

/* TODO: eigene Profile verlinken */
const SOCIALS = [
  { name: 'Instagram', href: 'https://instagram.com/' },
  { name: 'X', href: 'https://x.com/' },
  { name: 'GitHub', href: 'https://github.com/' },
];

const FEATURES = [
  {
    icon: MessageSquare,
    tint: 'bg-accent-primary/10 text-accent-hover',
    title: 'Chat mit GPT-4o & Claude',
    text: 'Echte Streaming-Antworten über deine eigenen API-Keys. Sessions, Verlauf, Model-Switch per Klick.',
  },
  {
    icon: GitBranch,
    tint: 'bg-success/10 text-success',
    title: 'Workflows als Prompt-Ketten',
    text: 'Verkette Prompts mit {{prev}}-Piping: Recherche → Entwurf → Review — wiederholbar per Knopfdruck.',
  },
  {
    icon: Terminal,
    tint: 'bg-warning/10 text-warning',
    title: 'Code-Runner & API-Tester',
    text: 'JS-Snippets sandboxed ausführen, REST-Endpoints mit Headern, Body und Auth testen.',
  },
  {
    icon: Plug,
    tint: 'bg-purple-600/10 text-purple-400',
    title: 'Plugin-System',
    text: 'Eigene HTML-Apps einbetten, REST-APIs anbinden, Agenten verketten — ganz ohne Backend.',
  },
];

const STEPS = [
  { n: '1', title: 'Key eintragen', text: 'OpenAI- oder Anthropic-Key in den Plugins hinterlegen — bleibt im Browser.' },
  { n: '2', title: 'Instanz anlegen', text: 'Modell wählen, System-Prompt setzen, fertig konfiguriert.' },
  { n: '3', title: 'Losarbeiten', text: 'Chatten, Workflows bauen, eigene Tools einbetten.' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary animate-fade-in">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-bg-primary/90 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </span>
            <span className="text-h3 font-medium tracking-tight">AI Dash</span>
          </span>
          <div className="flex items-center gap-2">
            <a href="#features" className="hidden sm:block text-sm text-text-muted hover:text-text-primary px-3 py-2 transition-colors">Features</a>
            <a href="#how" className="hidden sm:block text-sm text-text-muted hover:text-text-primary px-3 py-2 transition-colors">So geht's</a>
            <SignInButton mode="modal">
              <Button variant="primary" size="sm">Anmelden <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
            </SignInButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <Badge variant="accent" size="sm" dot dotColor="#10b981" className="mb-5">
          OpenAI · Claude · Agents · APIs
        </Badge>
        <h1 className="text-display-xl text-text-primary max-w-3xl mx-auto">
          Alle KI-Tools.<br />Ein Dashboard.
        </h1>
        <p className="mt-5 text-body-lg text-text-muted max-w-xl mx-auto">
          Chatte mit GPT-4o und Claude, baue Prompt-Workflows, teste APIs —
          und bette eigene Tools per Plugin-System ein. Ohne Backend, mit deinen Keys.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <SignInButton mode="modal">
            <Button variant="primary" size="lg">Kostenlos starten <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </SignInButton>
          <a href="#features">
            <Button variant="ghost" size="lg">Features ansehen</Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-text-subtle flex items-center justify-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-success" /> Keine Kreditkarte
          <span className="mx-1">·</span>
          <Check className="w-3.5 h-3.5 text-success" /> Keys bleiben im Browser
        </p>

        {/* CSS product mock */}
        <div className="mt-14 max-w-4xl mx-auto card-panel overflow-hidden text-left" aria-hidden="true">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="ml-3 text-xs font-mono text-text-subtle">ai-dashboard — chat</span>
          </div>
          <div className="flex">
            <div className="hidden sm:flex w-40 shrink-0 flex-col gap-2 p-3 border-r border-border-subtle">
              {['Dashboard', 'Chat', 'Workflows', 'Code', 'API', 'Plugins'].map((item, i) => (
                <div key={item} className={cn('h-8 rounded-md flex items-center px-2.5', i === 1 ? 'bg-white/[0.06]' : 'bg-transparent')}>
                  <div className={cn('h-2 rounded-full', i === 1 ? 'w-16 bg-accent-hover/70' : 'w-12 bg-white/10')} />
                </div>
              ))}
            </div>
            <div className="flex-1 p-4 space-y-3">
              <div className="flex justify-end">
                <div className="bg-accent-primary rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[70%]">
                  <div className="h-2 w-44 bg-white/70 rounded-full" />
                  <div className="h-2 w-28 bg-white/50 rounded-full mt-1.5" />
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-accent-primary/40 shrink-0" />
                <div className="bg-white/[0.04] border border-border-standard rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] space-y-1.5">
                  <div className="h-2 w-56 max-w-full bg-white/15 rounded-full" />
                  <div className="h-2 w-48 max-w-full bg-white/15 rounded-full" />
                  <div className="h-2 w-36 max-w-full bg-white/15 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-10 rounded-lg bg-white/[0.02] border border-border-standard" />
                <div className="w-10 h-10 rounded-lg bg-accent-primary/80 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
        <p className="text-caption-lg text-accent-hover uppercase tracking-widest text-center">Features</p>
        <h2 className="text-display text-text-primary text-center mt-2">Ein Hub für alles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} variant="panel" padding="lg" hover>
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4', f.tint)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-h3 text-text-primary">{f.title}</h3>
                <p className="mt-2 text-body text-text-muted">{f.text}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border-subtle bg-bg-panel/50 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <p className="text-caption-lg text-accent-hover uppercase tracking-widest text-center">So geht's</p>
          <h2 className="text-display text-text-primary text-center mt-2">In 3 Schritten startklar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {STEPS.map((s) => (
              <Card key={s.n} padding="lg" className="text-center">
                <span className="w-9 h-9 rounded-full bg-accent-primary/15 text-accent-hover font-medium inline-flex items-center justify-center">{s.n}</span>
                <h3 className="text-h3 text-text-primary mt-4">{s.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{s.text}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <SignInButton mode="modal">
              <Button variant="primary" size="lg">Jetzt starten <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Model strip */}
      <section className="max-w-6xl mx-auto px-4 py-14 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Brain className="w-4 h-4 text-text-subtle" />
          {['GPT-4o', 'GPT-4o mini', 'o1-mini', 'Claude Sonnet', 'Claude Haiku', 'Eigene REST-APIs'].map((m) => (
            <Badge key={m} variant="subtle" size="sm">{m}</Badge>
          ))}
          <Code className="w-4 h-4 text-text-subtle" />
          <Globe className="w-4 h-4 text-text-subtle" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-accent-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </span>
            <span className="text-sm-med text-text-secondary">AI Dash — alle KI-Tools an einem Ort</span>
          </span>
          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1"
              >
                {s.name} <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/sign-in" className="text-text-muted hover:text-text-primary transition-colors">Anmelden</Link>
            <span className="text-text-subtle">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
