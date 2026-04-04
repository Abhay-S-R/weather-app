import "./ErrorBoundary.css";
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // 1. Initialize state: hasError tracks if a crash happened,
    this.state = { hasError: false, error: null };
  }

  // This static method is called by React during the "render" phase
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // This is called after the error has been caught.
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // A helper function to let the user "reset" the error state
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    // If a crash happened, show our custom fallback UI
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

    // If everything is fine, just render the child components normally
    return this.props.children;
  }
}

export default ErrorBoundary;
