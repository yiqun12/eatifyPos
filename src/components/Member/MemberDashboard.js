import React, { useState, useEffect } from 'react';
import { t } from './translations';
import AdminLogin from './AdminLogin';
import MemberList from './MemberList';
import MemberAdd from './MemberAdd';
import MemberRecharge from './MemberRecharge';

/**
 * Member management dashboard component
 * Container for member management using modular components
 */
const MemberDashboard = ({ storeId }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('members'); // 'members' or 'config'
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [StoreGroupConfig, setStoreGroupConfig] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger data refresh
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Check authentication status on component mount
  useEffect(() => {
    
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem('memberAdminAuth');
      const loginTime = sessionStorage.getItem('memberAdminLoginTime');
      
      if (authStatus === 'true' && loginTime) {
        const now = Date.now();
        const timeDiff = now - parseInt(loginTime);
        const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        
        if (timeDiff < twoHours) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('memberAdminAuth');
          sessionStorage.removeItem('memberAdminLoginTime');
        }
      } else {
        console.log('❌ MemberDashboard: No valid session');
      }
    };

    checkAuth();
  }, []);

  // Handle authentication success
  const handleLoginSuccess = () => {
    console.log('✅ MemberDashboard: Login successful');
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    console.log('🚪 MemberDashboard: Logging out');
    sessionStorage.removeItem('memberAdminAuth');
    sessionStorage.removeItem('memberAdminLoginTime');
    setIsAuthenticated(false);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRechargeModal(false);
    setSelectedMember(null);
  };

  // Handle edit member
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  // Handle recharge member
  const handleRechargeMember = (member) => {
    setSelectedMember(member);
    setShowRechargeModal(true);
  };

  // Handle add new member
  const handleAddMember = () => {
    setSelectedMember(null);
    setShowAddModal(true);
  };

  // Handle member operation success
  const handleMemberSuccess = (result) => {
    if (result.action === 'created') {
      showToast(
        `${t('Member created successfully')}!\n${t('Phone')}: ${result.phone}`,
        'success'
      );
      setShowAddModal(false);
    } else if (result.action === 'updated') {
      showToast(
        `${t('Member updated successfully')}!\n${t('Phone')}: ${result.phone}`,
        'success'
      );
      setShowEditModal(false);
    } else if (result.action === 'recharged') {
      // Recharge success - alert already shown in MemberRecharge component
      setShowRechargeModal(false);
    } else {
      // Fallback for any other success case
      setShowRechargeModal(false);
    }
    
    setSelectedMember(null);
    // Trigger data refresh by incrementing counter
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle cancel operation
  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRechargeModal(false);
    setSelectedMember(null);
  };

  // Load StoreGroupConfig component
  useEffect(() => {
    if (currentTab === 'config') {
      import('./StoreGroupConfig').then(module => {
        setStoreGroupConfig(() => module.default);
      });
    }
  }, [currentTab]);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{t('Member Management')}</h1>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
            >
              🚪 {t('Logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button 
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === 'members' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
              setCurrentTab('members');
              // Trigger data refresh when switching back to members tab
              setRefreshTrigger(prev => prev + 1);
            }}
            >
              👥 {t('Member Management')}
            </button>
            <button 
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === 'config' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setCurrentTab('config')}
            >
              ⚙️ {t('Store Group Configuration')}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'members' ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={handleAddMember} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ {t('Add New Member')}
              </button>
            </div>
            <div className="bg-white rounded-lg shadow">
              <MemberList
                onEditMember={handleEditMember}
                onRechargeMember={handleRechargeMember}
                refreshTrigger={refreshTrigger}
                storeId={storeId}
                showToast={showToast}
              />
            </div>
          </div>
        ) : currentTab === 'config' ? (
          <div className="bg-white rounded-lg shadow p-6">
            {StoreGroupConfig ? (
              React.createElement(StoreGroupConfig, { showToast })
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <span className="text-gray-600">{t('Loading')}...</span>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <MemberAdd
          onSuccess={handleMemberSuccess}
          onCancel={handleCancel}
          storeId={storeId}
        />
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <MemberAdd
          editingMember={selectedMember}
          onSuccess={handleMemberSuccess}
          onCancel={handleCancel}
          storeId={storeId}
        />
      )}

      {/* Recharge Member Modal */}
      {showRechargeModal && selectedMember && (
        <MemberRecharge
          member={selectedMember}
          onSuccess={handleMemberSuccess}
          onCancel={handleCancel}
          storeId={storeId}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border-l-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'border-green-400' : 
          toast.type === 'error' ? 'border-red-400' : 'border-blue-400'
        }`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <div className="w-5 h-5 text-green-400">✅</div>
                )}
                {toast.type === 'error' && (
                  <div className="w-5 h-5 text-red-400">❌</div>
                )}
                {toast.type === 'info' && (
                  <div className="w-5 h-5 text-blue-400">ℹ️</div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {toast.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setToast({ show: false, message: '', type: 'success' })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;