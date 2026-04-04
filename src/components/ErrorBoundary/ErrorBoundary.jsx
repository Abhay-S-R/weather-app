import "./ErrorBoundary.css";
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // 1. Initialize state: hasError tracks if a crash happened,
    // and error stores the actual error message.
    this.state = { hasError: false, error: null };
  }

  // 2. This static method is called by React during the "render" phase
  // after a child component throws an error. It returns the new state.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // 3. This is called after the error has been caught.
  // It's the best place to log errors to a service (like Sentry) or the console.
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // 4. A helper function to let the user "reset" the error state
  // and try to render the children again.
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    // 5. If a crash happened, show our custom fallback UI
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Component Crashed</h3>
          <p className="error-text">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button className="retry-btn" onClick={this.handleRetry}>
            Try Again
          </button>
        </div>
      );
    }

    // 6. If everything is fine, just render the child components normally
    return this.props.children;
  }
}

export default ErrorBoundary;
