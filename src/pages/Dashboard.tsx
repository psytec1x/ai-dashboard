import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store';
import {
  MessageSquare,
  GitBranch,
  Globe,
  Plug,
  Plus,
  ArrowUpRight,
  Brain,
  Terminal,
  Zap,
  Code,
} from 'lucide-react';

const stats = [
  { label: 'Total Chats', value: '247', change: '+12%', icon: MessageSquare, tint: 'bg-accent-primary/10 text-accent-hover' },
  { label: 'Workflows', value: '18', change: '+3', icon: GitBranch, tint: 'bg-success/10 text-success' },
  { label: 'Code Runs', value: '1.2k', change: '+8%', icon: Terminal, tint: 'bg-warning/10 text-warning' },
  { label: 'API Calls', value: '45.3k', change: '+23%', icon: Globe, tint: 'bg-error/10 text-error' },
];

const recentActivity = [
  { id: 1, type: 'chat', title: 'Chat with GPT-4o', description: 'React architecture patterns', time: '2 min ago', plugin: 'OpenAI' },
  { id: 2, type: 'workflow', title: 'Data Processing Pipeline', description: 'Completed successfully', time: '15 min ago', plugin: 'Chain Agent' },
  { id: 3, type: 'code', title: 'JS Snippet', description: 'Array transform benchmark', time: '1 hour ago', plugin: 'JS Runner' },
  { id: 4, type: 'api', title: 'REST API Call', description: 'POST /api/v1/analyze', time: '3 hours ago', plugin: 'REST Caller' },
  { id: 5, type: 'chat', title: 'Chat with Claude', description: 'Code review session', time: '5 hours ago', plugin: 'Anthropic' },
];

const quickActions = [
  { name: 'New Chat', icon: MessageSquare, href: '/chat', tint: 'bg-accent-primary/10 text-accent-hover' },
  { name: 'Create Workflow', icon: GitBranch, href: '/workflows', tint: 'bg-success/10 text-success' },
  { name: 'Run Code', icon: Code, href: '/code', tint: 'bg-warning/10 text-warning' },
  { name: 'Test API', icon: Globe, href: '/api', tint: 'bg-error/10 text-error' },
  { name: 'Browse Plugins', icon: Plug, href: '/plugins', tint: 'bg-purple-600/10 text-purple-400' },
];

const activePlugins = [
  { name: 'OpenAI GPT-4o', category: 'llm', status: 'connected', icon: Brain, tint: 'bg-accent-primary/10' },
  { name: 'Anthropic Claude', category: 'llm', status: 'connected', icon: Brain, tint: 'bg-orange-500/10' },
  { name: 'Chain Agent', category: 'agent', status: 'idle', icon: Zap, tint: 'bg-success/10' },
  { name: 'JS Runner', category: 'tool', status: 'idle', icon: Terminal, tint: 'bg-warning/10' },
  { name: 'REST Caller', category: 'api', status: 'connected', icon: Globe, tint: 'bg-error/10' },
];

export function Dashboard() {
  const { pluginInstances, chatSessions, workflows } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="panel" padding="md" hover>
              <CardContent className="pt-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-caption text-text-muted">{stat.label}</p>
                    <p className="mt-1 text-3xl font-medium text-text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium text-success">{stat.change}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.tint)}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card variant="panel" padding="md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm-med transition-all duration-150 hover:bg-white/[0.03] text-text-secondary hover:text-text-primary"
                  >
                    <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', action.tint)}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>{action.name}</span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card variant="panel" padding="md">
            <CardHeader>
              <CardTitle>Active Plugins</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {activePlugins.map((plugin) => {
                const Icon = plugin.icon;
                return (
                  <div key={plugin.name} className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', plugin.tint)}>
                      <Icon className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm-med text-text-primary truncate">{plugin.name}</p>
                      <p className="text-xs text-text-muted capitalize">{plugin.category}</p>
                    </div>
                    <Badge
                      variant={plugin.status === 'connected' ? 'success' : 'subtle'}
                      size="sm"
                      dot
                    >
                      {plugin.status}
                    </Badge>
                  </div>
                );
              })}
              {pluginInstances.length > 0 && (
                <div className="pt-2 border-t border-border-subtle">
                  <p className="text-xs text-text-muted mb-2">Your Instances ({pluginInstances.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pluginInstances.slice(0, 5).map((instance) => (
                      <div key={instance.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.02]">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-white/[0.05] shrink-0">
                          <Zap className="w-3.5 h-3.5 text-text-muted" />
                        </div>
                        <span className="text-sm text-text-secondary truncate flex-1">{instance.name}</span>
                        <Badge variant="subtle" size="sm">{instance.enabled ? 'On' : 'Off'}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card variant="panel" padding="md">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Recent Activity</CardTitle>
              <Link to="/chat">
                <Button variant="ghost" size="sm">
                  View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0">
                {recentActivity.map((activity) => {
                  const typeIcons = { chat: MessageSquare, workflow: GitBranch, code: Terminal, api: Globe };
                  const typeColors = {
                    chat: 'text-accent-hover bg-accent-primary/10',
                    workflow: 'text-success bg-success/10',
                    code: 'text-warning bg-warning/10',
                    api: 'text-error bg-error/10',
                  };
                  const Icon = typeIcons[activity.type as keyof typeof typeIcons];
                  return (
                    <div key={activity.id} className="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.02] rounded-lg transition-colors">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', typeColors[activity.type as keyof typeof typeColors])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm-med text-text-primary truncate">{activity.title}</p>
                        <p className="text-xs text-text-muted truncate">{activity.description}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-xs text-text-subtle shrink-0">
                        <Badge variant="subtle" size="sm">{activity.plugin}</Badge>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="panel" padding="md">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {[
                  { label: 'CPU Usage', value: '23%', width: '23%', bar: 'bg-accent-primary' },
                  { label: 'Memory', value: '1.2 / 4 GB', width: '30%', bar: 'bg-warning' },
                  { label: 'Storage', value: '15 / 50 GB', width: '30%', bar: 'bg-success' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">{row.label}</span>
                      <span className="text-sm-med text-text-primary">{row.value}</span>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-300', row.bar)} style={{ width: row.width }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-medium text-text-primary">{chatSessions.length}</p>
                    <p className="text-xs text-text-muted">Chat Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-text-primary">{workflows.length}</p>
                    <p className="text-xs text-text-muted">Workflows</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="panel" padding="md">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ol className="space-y-3 text-sm text-text-secondary list-none">
                  {[
                    'Add your OpenAI or Anthropic API key under Plugins.',
                    'Create an LLM instance and start chatting.',
                    'Build a multi-step workflow with the Chain Agent.',
                    'Embed your own HTML apps as Custom HTML plugins.',
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent-primary/15 text-accent-hover text-xs font-medium flex items-center justify-center shrink-0">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <Link to="/plugins" className="block mt-4">
                  <Button variant="primary" size="sm" fullWidth leftIcon={<Plus className="w-4 h-4" />}>
                    Open Plugin Store
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
