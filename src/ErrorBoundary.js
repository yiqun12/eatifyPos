import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      isKiosk: false,
      kioskHash: ""
    };
  }

  componentDidMount() {
    // Function to check the URL format
    const checkUrlFormat = () => {
      try {
        // Assuming you want to check the current window's URL
        const url = new URL(window.location.href);

        // Check if hash matches the specific pattern
        // This pattern matches hashes like #string-string-string
        const hashPattern = /^#(\w+)-(\w+)-(\w+)$/;
        // Update state with hash and kiosk status
        this.setState({
          kioskHash: url.hash,
          isKiosk: hashPattern.test(url.hash)
        });

        console.log("URL format check result:", hashPattern.test(url.hash));
      } catch (error) {
        // Handle potential errors, e.g., invalid URL
        console.error("Invalid URL:", error);
        this.setState({
          isKiosk: false
        });
      }
    };

    // Call the checkUrlFormat function
    checkUrlFormat();
  }

  componentDidCatch(error, errorInfo) {
    // Log the error or perform other error-handling actions here
    console.error(error, errorInfo);
    this.setState({ hasError: true });

    // Refresh the page after a set delay
    setTimeout(() => {
      if (window.location.hostname === 'localhost') {
        console.log("Running on localhost, no reload.");
      } else {
        if (this.state.isKiosk) {
          console.log("Kiosk mode detected. Clearing storage...");
          localStorage.clear();
          sessionStorage.clear();
        }
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
