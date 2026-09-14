import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { SetupScreen } from './components/SetupScreen';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const hasKey = !!publishableKey && !publishableKey.includes('XXXX') && publishableKey.startsWith('pk_');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {hasKey ? (
      <ClerkProvider publishableKey={publishableKey!}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <SetupScreen />
    )}
  </StrictMode>,
);
