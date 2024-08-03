import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error or perform other error-handling actions here
    console.error(error, errorInfo);
    this.setState({ hasError: true });

    // Refresh the page after a set delay
    setTimeout(() => {
      if (window.location.hostname === 'localhost') {
      } else {
        window.location.reload();
      }
    }, 1); // 5000 milliseconds = 5 seconds
  }

  render() {
    if (this.state.hasError) {
      // Render an error message or fallback UI
      return (
        <div>
          Loading...
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
