import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-800">هەڵەیەک ڕوویدا</h1>
              <p className="text-slate-500">ببورە، کێشەیەک لە سیستەمەکەدا دروست بوو. تکایە پەڕەکە نوێ بکەرەوە یان دواتر هەوڵ بدەرەوە.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-left overflow-auto max-h-32 text-xs text-slate-600 font-mono border border-slate-200">
              {this.state.error?.message || 'Unknown error'}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all"
            >
              <RefreshCw size={20} />
              <span>نوێکردنەوەی پەڕە</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
