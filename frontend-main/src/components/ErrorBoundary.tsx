import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#1a1a2e',
          color: 'white',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#e94560', marginBottom: '20px' }}>🎬 CineVerse Error</h1>
          <h2>Something went wrong!</h2>
          <details style={{ 
            marginTop: '20px', 
            textAlign: 'left', 
            backgroundColor: '#16213e', 
            padding: '20px', 
            borderRadius: '8px' 
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Error Details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.toString()}
              {'\n'}
              {this.state.error?.stack}
            </pre>
          </details>
          <div style={{ marginTop: '30px' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '12px 24px',
                backgroundColor: '#e94560',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Reload Page
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              style={{
                padding: '12px 24px',
                backgroundColor: '#0f3460',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '10px'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;