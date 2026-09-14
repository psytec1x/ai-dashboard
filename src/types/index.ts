/**
 * Core types for the AI Dashboard plugin system
 */

export type PluginCategory = 
  | 'llm'           // LLM providers (OpenAI, Anthropic, etc.)
  | 'agent'         // Autonomous agents (LangGraph, AutoGPT, etc.)
  | 'chatbot'       // Chat interfaces
  | 'api'           // API integrations
  | 'tool'          // Utility tools
  | 'workflow'      // Workflow/orchestration
  | 'data'          // Data processing
  | 'custom';       // User-created custom plugins

export type PluginCapability = 
  | 'chat'          // Can chat/complete
  | 'stream'        // Supports streaming
  | 'function_call' // Supports function calling
  | 'vision'        // Supports image input
  | 'audio'         // Supports audio
  | 'code_exec'     // Can execute code
  | 'file_read'     // Can read files
  | 'file_write'    // Can write files
  | 'web_search'    // Can search web
  | 'api_call';     // Can make API calls

export interface PluginConfigField {
  key: string;
  label: string;
  type: 'string' | 'password' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json' | 'code';
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: (value: unknown) => string | null;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  capabilities: PluginCapability[];
  icon: string; // Lucide icon name or SVG
  configFields: PluginConfigField[];
  entryPoint: string; // Component name or path
  permissions: string[]; // Required permissions
  tags: string[];
  homepage?: string;
  repository?: string;
  license?: string;
}

export interface PluginInstance {
  id: string;
  pluginId: string;
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  position?: { x: number; y: number }; // For dashboard layout
  size?: { w: number; h: number }; // Grid size
}

export interface PluginContext {
  userId: string;
  apiKeys: Record<string, string>;
  plugins: PluginInstance[];
  getPlugin: (id: string) => PluginInstance | undefined;
  callPlugin: (pluginId: string, action: string, payload: unknown) => Promise<unknown>;
  store: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    delete: (key: string) => void;
  };
  notify: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  metadata?: {
    pluginId?: string;
    model?: string;
    tokens?: number;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: string;
  error?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  pluginId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  pluginId: string;
}

export interface CodeExecution {
  id: string;
  language: 'python' | 'javascript' | 'typescript' | 'bash';
  code: string;
  output?: string;
  error?: string;
  executionTime?: number;
  timestamp: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chat' | 'workflow' | 'api' | 'code' | 'metric' | 'custom';
  pluginInstanceId?: string;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: Record<string, unknown>;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  autoSave: boolean;
  notifications: boolean;
  compactMode: boolean;
  sidebarCollapsed: boolean;
}

export interface ApiKey {
  id: string;
  provider: string;
  name: string;
  key: string; // Encrypted
  createdAt: string;
  lastUsed?: string;
}

export type ViewMode = 'dashboard' | 'chat' | 'workflow' | 'api' | 'code' | 'plugins' | 'settings';