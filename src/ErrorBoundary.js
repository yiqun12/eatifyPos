import React, { Component } from 'react';
import {
  createErrorReloadDecision,
  ERROR_RELOAD_GUARD_KEY,
  LAST_ERROR_BOUNDARY_KEY,
  recordErrorReloadAttempt,
  shouldReloadAfterError,
} from './errorReloadGuard';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      isKiosk: false,
      kioskHash: "",
      blockedReload: false,
      errorMessage: ""
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
    const reloadDecision = createErrorReloadDecision({
      storage: window.localStorage,
      pathname: window.location.pathname,
    });
    const shouldReload = shouldReloadAfterError(reloadDecision);

    try {
      window.localStorage.setItem(
        LAST_ERROR_BOUNDARY_KEY,
        JSON.stringify({
          componentStack: errorInfo && errorInfo.componentStack,
          href: window.location.href,
          message: error && error.message,
          stack: error && error.stack,
          timestamp: new Date().toISOString(),
          userAgent: window.navigator && window.navigator.userAgent,
          viewport: {
            height: window.innerHeight,
            width: window.innerWidth,
          },
        })
      );
    } catch (storageError) {
      console.error('Unable to store ErrorBoundary report:', storageError);
    }

    this.setState({
      hasError: true,
      blockedReload: !shouldReload,
      errorMessage: error && error.message ? error.message : "Unexpected error",
    });

    // Refresh the page after a set delay
    setTimeout(() => {
      if (window.location.hostname === 'localhost') {
        console.log("Running on localhost, no reload.");
        return;
      }

      if (!shouldReload) {
        console.error('ErrorBoundary reload loop blocked.', {
          href: window.location.href,
          message: error && error.message,
        });
        return;
      }

      recordErrorReloadAttempt(reloadDecision);

      if (this.state.isKiosk) {
        console.log("Kiosk mode detected. Clearing storage...");
        const reloadGuard = localStorage.getItem(ERROR_RELOAD_GUARD_KEY);
        const lastError = localStorage.getItem(LAST_ERROR_BOUNDARY_KEY);
        localStorage.clear();
        sessionStorage.clear();
        if (reloadGuard) localStorage.setItem(ERROR_RELOAD_GUARD_KEY, reloadGuard);
        if (lastError) localStorage.setItem(LAST_ERROR_BOUNDARY_KEY, lastError);
      }
      window.location.reload();
    }, 1); // 5000 milliseconds = 5 seconds
  }

  render() {
    if (this.state.hasError) {
      // Render an error message or fallback UI
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          {this.state.blockedReload ? (
            <>
              <h2>Something went wrong.</h2>
              <p>Automatic reload was stopped to avoid a reload loop.</p>
              <p style={{ wordBreak: 'break-word' }}>{this.state.errorMessage}</p>
              <button onClick={() => window.location.reload()}>Reload</button>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
