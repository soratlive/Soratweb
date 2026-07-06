import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('sorat_auth_session');
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
          <div className="w-full max-w-lg bg-slate-900 border border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Application Error Detected</h2>
                <p className="text-slate-400 text-sm">The React component tree failed to render safely.</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto border border-slate-800 text-xs font-mono text-red-300">
              <p className="font-bold mb-2">{this.state.error?.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="whitespace-pre-wrap text-[10px] leading-relaxed text-slate-500">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              This issue could be due to invalid/missing credentials, state mismatch, or outdated cache storage. 
              You can reset the local app data state to load in **Sandbox/Offline Playback** mode.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 hover:text-white rounded-xl font-medium text-sm transition-all duration-150 border border-slate-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl font-medium text-sm transition-all duration-150 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Data & Play Offline
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
