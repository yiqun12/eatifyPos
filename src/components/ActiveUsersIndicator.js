import React from 'react';
import './ActiveUsersIndicator.css';

/**
 * Active Users Indicator - Shows other users currently viewing the same cart
 * Displays real-time collaboration status for shared cart scenarios
 */
const ActiveUsersIndicator = ({ 
  activeUsers = [], 
  isOnline = true, 
  isSharedCart = false,
  currentUserId = null,
  style = {}
}) => {
  // Don't show anything if not a shared cart or no users
  if (!isSharedCart || activeUsers.length <= 1) {
    return null;
  }

  // Filter out current user
  const otherUsers = activeUsers.filter(user => user.userId !== currentUserId);
  
  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="active-users-indicator" style={style}>
      <div className="active-users-header">
        <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
        <span className="active-users-text">
          {otherUsers.length === 1 
            ? '1 other person viewing' 
            : `${otherUsers.length} others viewing`
          }
        </span>
      </div>
      
      <div className="active-users-list">
        {otherUsers.slice(0, 3).map((user, index) => (
          <div key={user.userId} className="user-avatar" title={`User joined ${getRelativeTime(user.joinedAt)}`}>
            <div className="avatar-circle">
              {index + 1}
            </div>
          </div>
        ))}
        {otherUsers.length > 3 && (
          <div className="more-users">
            +{otherUsers.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Get relative time string for when user joined
 */
function getRelativeTime(timestamp) {
  if (!timestamp) return 'recently';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) { // Less than 1 minute
    return 'just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
}

export default ActiveUsersIndicator;
