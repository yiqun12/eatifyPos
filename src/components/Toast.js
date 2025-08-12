import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose }) => {
  return (
    <div className={`toast ${type} show`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

// Toast container to manage multiple toasts
export const ToastContainer = ({ children }) => {
  return (
    <div className="toast-container">
      {children}
    </div>
  );
};

// Hook to manage toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (message, type = 'error', duration = 5000) => {
    const id = Date.now() + Math.random();
    const expiresAt = duration > 0 ? Date.now() + duration : null;
    const newToast = { id, message, type, expiresAt };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      // Auto remove after duration (primary)
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  };

  // Sweeper (secondary safety) to remove any expired toasts in case timers were cleared by remounts/reloads
  useEffect(() => {
    const sweep = () => {
      const now = Date.now();
      setToasts(prev => prev.filter(t => !t.expiresAt || t.expiresAt > now));
    };
    const interval = setInterval(sweep, 800);
    return () => clearInterval(interval);
  }, []);

  const ToastList = () => (
    <ToastContainer>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContainer>
  );

  return { showToast, removeToast, ToastList };
};

export default Toast;
