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
      window.location.reload();
    }, 2000); // 5000 milliseconds = 5 seconds
  }

  render() {
    if (this.state.hasError) {
      // Render an error message or fallback UI
      return (
        <div>
          Something went wrong. The page will refresh in 2 seconds.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
