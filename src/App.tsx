import { useEffect, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { Layout } from './components/layout';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Workflows } from './pages/Workflows';
import { CodePlayground } from './pages/CodePlayground';
import { ApiPlayground } from './pages/ApiPlayground';
import { Plugins } from './pages/Plugins';
import { Settings } from './pages/Settings';
import { CommandPalette } from './components/CommandPalette';
import { Toaster } from './components/Toaster';
import { useAppStore } from './store';
import { BUILTIN_PLUGINS } from './plugins/registry';

function PrivateRoute({ children }: { children: ReactNode }) {
  return <SignedIn>{children}</SignedIn>;
}

export function App() {
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);
  const registerPlugin = useAppStore((s) => s.registerPlugin);

  useEffect(() => {
    for (const p of BUILTIN_PLUGINS) registerPlugin(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleCommandPalette]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="code" element={<CodePlayground />} />
          <Route path="api" element={<ApiPlayground />} />
          <Route path="plugins" element={<Plugins />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route
          path="/sign-in"
          element={
            <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
              <SignIn routing="hash" />
            </div>
          }
        />
        <Route
          path="*"
          element={
            <>
              <SignedIn>
                <Navigate to="/" replace />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>

      {commandPaletteOpen && <CommandPalette onClose={toggleCommandPalette} />}
      <Toaster />
    </div>
  );
}
