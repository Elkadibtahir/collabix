import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, LayoutGrid } from 'lucide-react';
import { AuthLayout } from '../layout/AuthLayout';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AuthLayout>
          <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
              <AlertTriangle className="h-9 w-9" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-display font-bold text-text-primary tracking-tight">Unexpected Error</h2>
              <p className="text-body text-text-secondary leading-relaxed max-w-sm">
                Something went wrong while rendering this page. Please try again.
              </p>
              {this.state.error && (
                <details className="mt-3 max-w-md text-left">
                  <summary className="cursor-pointer text-caption text-text-tertiary hover:text-text-secondary">
                    Technical details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-lg bg-surface-2 p-3 text-2xs text-danger-500">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex w-full flex-col gap-2.5 mt-2">
              <Button
                size="lg"
                fullWidth
                leftIcon={<RefreshCw />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                size="lg"
                fullWidth
                variant="outline"
                leftIcon={<LayoutGrid />}
                onClick={() => { this.handleReset(); window.location.href = '/app/dashboard'; }}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </AuthLayout>
      );
    }

    return this.props.children;
  }
}
