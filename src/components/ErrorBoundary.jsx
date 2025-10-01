// ErrorBoundary.jsx - Place in /src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home, FileText } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to console with styling
    console.log(
      '%c🔴 Error Boundary Caught an Error',
      'color: red; font-weight: bold; font-size: 16px;'
    );
    console.log('%cError:', 'color: red; font-weight: bold;', error);
    console.log('%cComponent Stack:', 'color: orange; font-weight: bold;', errorInfo.componentStack);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Optional: Send to error tracking service
    // if (window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // If we have a recovery function from props, use it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Check if this is a critical error (too many errors)
      const isCritical = this.state.errorCount > 3;
      
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              {/* Icon and Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {isCritical ? 'Critical Error Detected' : 'Oops! Something went wrong'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isCritical 
                    ? 'The application encountered multiple errors and needs to restart.'
                    : 'We encountered an unexpected error. The details have been logged.'}
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6">
                  <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <summary className="cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FileText size={16} />
                      Error Details (Development Mode)
                    </summary>
                    <div className="mt-3 space-y-2">
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <p className="text-xs font-mono text-red-600 dark:text-red-400">
                          {this.state.error.toString()}
                        </p>
                      </div>
                      {this.state.errorInfo && (
                        <div className="bg-white dark:bg-gray-800 rounded p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Component Stack:</p>
                          <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={20} />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Home size={20} />
                  Go to Dashboard
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  If this error persists, please contact support with error code: 
                  <span className="font-mono font-semibold ml-2">
                    ERR_{Date.now().toString(36).toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;