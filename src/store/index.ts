import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PluginManifest,
  PluginInstance,
  ChatMessage,
  ChatSession,
  Workflow,
  DashboardWidget,
  UserSettings,
  ApiKey,
  CodeExecution,
  ViewMode,
} from '../types';

interface AppState {
  // UI State
  viewMode: ViewMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  
  // Plugin System
  plugins: PluginManifest[];
  pluginInstances: PluginInstance[];
  activePluginInstance: string | null;
  
  // Chat
  chatSessions: ChatSession[];
  activeChatSession: string | null;
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  
  // Workflows
  workflows: Workflow[];
  activeWorkflow: string | null;
  
  // Dashboard
  widgets: DashboardWidget[];
  editMode: boolean;
  
  // Code Execution
  codeExecutions: CodeExecution[];
  
  // Settings
  settings: UserSettings;
  apiKeys: ApiKey[];
  
  // Notifications
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
  }>;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  
  // Plugin actions
  registerPlugin: (plugin: PluginManifest) => void;
  unregisterPlugin: (pluginId: string) => void;
  createPluginInstance: (pluginId: string, name: string, config: Record<string, unknown>) => PluginInstance;
  updatePluginInstance: (id: string, updates: Partial<PluginInstance>) => void;
  deletePluginInstance: (id: string) => void;
  setActivePluginInstance: (id: string | null) => void;
  
  // Chat actions
  createChatSession: (pluginId: string, name?: string) => ChatSession;
  setActiveChatSession: (id: string | null) => void;
  addChatMessage: (sessionId: string, message: ChatMessage) => void;
  updateChatMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteChatSession: (id: string) => void;
  setStreaming: (streaming: boolean) => void;
  
  // Workflow actions
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveWorkflow: (id: string | null) => void;
  
  // Dashboard actions
  addWidget: (widget: Omit<DashboardWidget, 'id'>) => DashboardWidget;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  setEditMode: (enabled: boolean) => void;
  
  // Code execution actions
  addCodeExecution: (execution: Omit<CodeExecution, 'id' | 'timestamp'>) => CodeExecution;
  clearCodeExecutions: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  addApiKey: (key: Omit<ApiKey, 'id' | 'createdAt'>) => ApiKey;
  removeApiKey: (id: string) => void;
  
  // Notification actions
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Hydration
  hydrate: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'en',
  autoSave: true,
  notifications: true,
  compactMode: false,
  sidebarCollapsed: false,
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      viewMode: 'dashboard',
      sidebarOpen: true,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      
      plugins: [],
      pluginInstances: [],
      activePluginInstance: null,
      
      chatSessions: [],
      activeChatSession: null,
      chatMessages: [],
      isStreaming: false,
      
      workflows: [],
      activeWorkflow: null,
      
      widgets: [],
      editMode: false,
      
      codeExecutions: [],
      
      settings: defaultSettings,
      apiKeys: [],
      
      notifications: [],
      
      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      
      // Plugin actions
      registerPlugin: (plugin) => set((state) => ({
        plugins: [...state.plugins.filter(p => p.id !== plugin.id), plugin],
      })),
      
      unregisterPlugin: (pluginId) => set((state) => ({
        plugins: state.plugins.filter(p => p.id !== pluginId),
        pluginInstances: state.pluginInstances.filter(p => p.pluginId !== pluginId),
      })),
      
      createPluginInstance: (pluginId, name, config) => {
        const instance: PluginInstance = {
          id: generateId(),
          pluginId,
          name,
          config,
          enabled: true,
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ pluginInstances: [...state.pluginInstances, instance] }));
        return instance;
      },
      
      updatePluginInstance: (id, updates) => set((state) => ({
        pluginInstances: state.pluginInstances.map(p => 
          p.id === id ? { ...p, ...updates, updatedAt: now() } : p
        ),
      })),
      
      deletePluginInstance: (id) => set((state) => ({
        pluginInstances: state.pluginInstances.filter(p => p.id !== id),
        activePluginInstance: state.activePluginInstance === id ? null : state.activePluginInstance,
      })),
      
      setActivePluginInstance: (id) => set({ activePluginInstance: id }),
      
      // Chat actions
      createChatSession: (pluginId, name) => {
        const session: ChatSession = {
          id: generateId(),
          name: name || 'New Chat',
          pluginId,
          messages: [],
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ 
          chatSessions: [session, ...state.chatSessions],
          activeChatSession: session.id,
        }));
        return session;
      },
      
      setActiveChatSession: (id) => set({ activeChatSession: id }),
      
      addChatMessage: (sessionId, message) => set((state) => ({
        chatSessions: state.chatSessions.map(s => 
          s.id === sessionId 
            ? { ...s, messages: [...s.messages, message], updatedAt: now() }
            : s
        ),
        chatMessages: state.activeChatSession === sessionId 
          ? [...state.chatMessages, message]
          : state.chatMessages,
      })),
      
      updateChatMessage: (sessionId, messageId, updates) => set((state) => ({
        chatSessions: state.chatSessions.map(s => 
          s.id === sessionId
            ? { ...s, messages: s.messages.map(m => m.id === messageId ? { ...m, ...updates } : m), updatedAt: now() }
            : s
        ),
        chatMessages: state.activeChatSession === sessionId
          ? state.chatMessages.map(m => m.id === messageId ? { ...m, ...updates } : m)
          : state.chatMessages,
      })),
      
      deleteChatSession: (id) => set((state) => ({
        chatSessions: state.chatSessions.filter(s => s.id !== id),
        activeChatSession: state.activeChatSession === id ? null : state.activeChatSession,
      })),
      
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      
      // Workflow actions
      createWorkflow: (workflow) => {
        const newWorkflow: Workflow = {
          ...workflow,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ workflows: [newWorkflow, ...state.workflows] }));
        return newWorkflow;
      },
      
      updateWorkflow: (id, updates) => set((state) => ({
        workflows: state.workflows.map(w => 
          w.id === id ? { ...w, ...updates, updatedAt: now() } : w
        ),
      })),
      
      deleteWorkflow: (id) => set((state) => ({
        workflows: state.workflows.filter(w => w.id !== id),
        activeWorkflow: state.activeWorkflow === id ? null : state.activeWorkflow,
      })),
      
      setActiveWorkflow: (id) => set({ activeWorkflow: id }),
      
      // Dashboard actions
      addWidget: (widget) => {
        const newWidget: DashboardWidget = {
          ...widget,
          id: generateId(),
        };
        set((state) => ({ widgets: [...state.widgets, newWidget] }));
        return newWidget;
      },
      
      updateWidget: (id, updates) => set((state) => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, ...updates } : w),
      })),
      
      removeWidget: (id) => set((state) => ({
        widgets: state.widgets.filter(w => w.id !== id),
      })),
      
      setEditMode: (enabled) => set({ editMode: enabled }),
      
      // Code execution actions
      addCodeExecution: (execution) => {
        const newExecution: CodeExecution = {
          ...execution,
          id: generateId(),
          timestamp: now(),
        };
        set((state) => ({ codeExecutions: [newExecution, ...state.codeExecutions].slice(0, 100) }));
        return newExecution;
      },
      
      clearCodeExecutions: () => set({ codeExecutions: [] }),
      
      // Settings actions
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings },
      })),
      
      addApiKey: (key) => {
        const newKey: ApiKey = {
          ...key,
          id: generateId(),
          createdAt: now(),
        };
        set((state) => ({ apiKeys: [...state.apiKeys, newKey] }));
        return newKey;
      },
      
      removeApiKey: (id) => set((state) => ({
        apiKeys: state.apiKeys.filter(k => k.id !== id),
      })),
      
      // Notification actions
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: generateId(),
          timestamp: now(),
        };
        set((state) => ({ notifications: [newNotification, ...state.notifications].slice(0, 50) }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, 5000);
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      hydrate: () => {}, // Persist handles this
    }),
    {
      name: 'ai-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pluginInstances: state.pluginInstances,
        chatSessions: state.chatSessions,
        workflows: state.workflows,
        widgets: state.widgets,
        settings: state.settings,
        apiKeys: state.apiKeys,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrate old data if needed
          state.hydrate();
        }
      },
    }
  )
);