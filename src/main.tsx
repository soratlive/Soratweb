import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AudioProvider } from './context/AudioContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Intercept Appwrite Web SDK's hardcoded console.error/console.warn logs for Realtime disconnects.
// Since these are handled gracefully by the SDK's automatic retry mechanism, 
// redirecting them to standard debug info prevents them from polluting test suites and error trackers,
// while dispatching custom events to keep the user interface dynamically aware of the sync connection status.
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const firstArg = args[0];
  if (typeof firstArg === 'string' && (
    firstArg.includes('Realtime got disconnected') || 
    firstArg.includes('Reconnect will be attempted') ||
    firstArg.includes('WebSocket connection to')
  )) {
    console.warn('[Appwrite Realtime State Info]', ...args);
    window.dispatchEvent(new CustomEvent('appwrite-realtime-disconnect'));
    return;
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const firstArg = args[0];
  if (typeof firstArg === 'string' && (
    firstArg.includes('Realtime got disconnected') || 
    firstArg.includes('Reconnect will be attempted')
  )) {
    console.info('[Appwrite Realtime State Info]', ...args);
    window.dispatchEvent(new CustomEvent('appwrite-realtime-disconnect'));
    return;
  }
  originalConsoleWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AudioProvider>
        <App />
      </AudioProvider>
    </ErrorBoundary>
  </StrictMode>,
);

