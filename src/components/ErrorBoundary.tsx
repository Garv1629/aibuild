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
  public declare state: State;
  public declare props: Props;
  public declare setState: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;

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
      localStorage.removeItem('ai_build_projects_v3');
      localStorage.removeItem('ai_build_projects_v2');
      localStorage.removeItem('ai_build_content_v2');
      localStorage.removeItem('ai_build_reviews_v2');
      localStorage.removeItem('ai_build_messages_v2');
      localStorage.removeItem('ai_build_quotes_v2');
      localStorage.removeItem('ai_build_estimator_settings_v2');
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#FFFFFF] text-[#202526] flex items-center justify-center p-6 font-['Manrope',sans-serif]">
          <div className="max-w-lg w-full bg-[#F4F5F4] border border-[#E5E7EB] rounded-3xl p-8 shadow-xl text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#D8A9A8]/20 flex items-center justify-center text-[#202526] mb-5">
              <span className="w-3 h-3 rounded-full bg-[#D8A9A8] animate-ping" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#202526] mb-2 font-['Instrument_Sans',sans-serif]">
              Studio Application Notice
            </h1>
            
            <p className="text-sm text-[#596769] mb-6 leading-relaxed">
              A runtime issue occurred while rendering the page. You can try refreshing or resetting the stored cache.
            </p>

            {this.state.error && (
              <div className="w-full bg-white/80 border border-[#E5E7EB] rounded-xl p-3.5 mb-6 text-left overflow-x-auto text-xs font-mono text-[#D8A9A8]">
                <p className="font-semibold text-[#202526] mb-1 font-sans">Error Details:</p>
                <code>{this.state.error.toString()}</code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 px-5 py-3 rounded-full bg-[#202526] text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-all cursor-pointer shadow-md"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleResetAndReload}
                className="flex-1 px-5 py-3 rounded-full bg-white border border-[#E5E7EB] text-[#202526] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-all cursor-pointer shadow-xs"
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
