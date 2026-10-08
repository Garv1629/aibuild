import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#FFFFFF] text-[#202526] flex items-center justify-center p-6 font-body">
          <div className="max-w-lg w-full bg-[#F4F5F4] border border-[#E5E7EB] rounded-3xl p-8 shadow-xl text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#D8A9A8]/20 flex items-center justify-center text-[#202526] mb-5">
              <span className="w-3 h-3 rounded-full bg-[#D8A9A8] animate-ping" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#202526] mb-2 font-sans-clean">
              Studio Application Notice
            </h1>
            
            <p className="text-sm text-[#596769] mb-6 leading-relaxed">
              A runtime issue occurred while rendering the page. You can try refreshing or resetting the stored cache.
            </p>

            {this.state.error && (
              <div className="w-full bg-white/95 border border-[#E5E7EB] rounded-xl p-4 mb-6 text-left overflow-x-auto text-xs font-mono text-[#D8A9A8]">
                <p className="font-semibold text-[#202526] mb-1 font-sans-clean">Error Details:</p>
                <div className="text-red-600 font-bold mb-2">{this.state.error.toString()}</div>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-200">
                    {this.state.error.stack}
                  </pre>
                )}
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-gray-500 whitespace-pre-wrap max-h-32 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-200 mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-primary flex-1"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="btn-secondary flex-1"
              >
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
