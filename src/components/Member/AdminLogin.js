import React, { useState, useEffect, useRef } from 'react';
import { t } from './translations';
import './AdminLogin.css';

/**
 * Admin password verification component
 * Protects member management dashboard with password authentication
 * @param {Function} onLoginSuccess - Callback when login succeeds
 * @param {Function} [onCancel] - Optional callback when user cancels (defaults to history.back())
 */
const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Fixed admin password - simple and easy to remember
  const ADMIN_PASSWORD = '1234';

  // Cleanup effect to track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle password verification
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!isMountedRef.current) {
      console.log('⚠️ AdminLogin: Component unmounted, skipping login attempt');
      return;
    }
    
    if (!password.trim()) {
      if (isMountedRef.current) {
        setError(t('Required Field'));
      }
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
      setError('');
    }

    // Immediate execution without setTimeout to avoid async mount issues
    if (password === ADMIN_PASSWORD) {
      // Store login session
      sessionStorage.setItem('memberAdminAuth', 'true');
      sessionStorage.setItem('memberAdminLoginTime', Date.now().toString());
      
      if (isMountedRef.current) {
        setLoading(false);
      }
      
      // Call success callback
      onLoginSuccess && onLoginSuccess();
    } else {
      if (isMountedRef.current) {
        setError(t('Access Denied') + ': ' + t('Invalid Input'));
        setPassword('');
        setLoading(false);
      }
    }
  };

  // Handle input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    if (isMountedRef.current) {
      setPassword(value);
      if (error) setError(''); // Clear error when user starts typing
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    console.log('❌ AdminLogin: User cancelled, handling cancellation');
    
    // Clean up component state before canceling - must check mount status
    if (isMountedRef.current) {
      setLoading(false);
      setError('');
      setPassword('');
    }
    
    // Use history.back() directly for simplicity and safety
    window.history.back();
  };

  // Component ready to render
  
  return (
    <div className="admin-login-container">
      <div className="admin-login-modal">
        <div className="login-header">
          <div className="lock-icon">🔒</div>
          <h2>{t('Admin Panel')}</h2>
          <p>{t('Password protected feature')}</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="admin-password">{t('Admin Password')}</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder={t('Enter password')}
              className={`password-input ${error ? 'error' : ''}`}
              disabled={loading}
              autoFocus
              maxLength="20"
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="button-group">
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading || !password.trim()}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  {t('Loading')}...
                </>
              ) : (
                <>
                  <span className="login-icon">🔑</span>
                  {t('Admin Login')}
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              <span className="cancel-icon">❌</span>
              {t('Cancel')}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <div className="security-notice">
            <span className="shield-icon">🛡️</span>
            <span>{t('Security Notice')}</span>
          </div>
          <p>{t('System only allows balance increase')}</p>
          <p>{t('No manual decrease allowed')}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;