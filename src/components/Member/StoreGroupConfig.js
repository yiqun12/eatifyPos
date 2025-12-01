import React, { useState, useEffect, useCallback, useRef } from 'react';
import firebase from 'firebase/compat/app';
import { t } from './translations';
import { initializeStoreNames, getStoreNameSync, generateFirebaseTimestamp } from './memberUtils';
import './StoreGroupConfig.css';

/**
 * Store group configuration component
 * Allows users to configure which stores share members
 */
const StoreGroupConfig = ({ showToast }) => {
  const [groups, setGroups] = useState({});
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [storeNames, setStoreNames] = useState(new Map());
  
  // Use ref to avoid recreating callbacks when showToast changes
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  // Set up real-time listeners for configuration
  const setupConfigurationListener = useCallback(async () => {
    try {
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Set up real-time listener for store groups configuration
      const unsubscribe = firebase
        .firestore()
        .collection('stripe_customers')
        .doc(currentUserId)
        .collection('system_config')
        .doc('store_groups')
        .onSnapshot(
          (configDoc) => {
            console.log('Real-time store group configuration update');
            if (configDoc.exists) {
              setGroups(configDoc.data().groups || {});
            } else {
              setGroups({});
            }
          },
          (error) => {
            console.error('Error in store group configuration listener:', error);
            setLoading(false);
          }
        );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up configuration listener:', error);
      setLoading(false);
      return null;
    }
  }, []); // Remove showToast dependency to avoid recreating listener

  // Save configuration to Firebase
  const saveConfiguration = useCallback(async () => {
    setSaving(true);
    try {
      const currentUserId = firebase.auth().currentUser?.uid;
      await firebase
        .firestore()
        .collection('stripe_customers')
        .doc(currentUserId)
        .collection('system_config')
        .doc('store_groups')
        .set({
          groups: groups,
          lastUpdated: generateFirebaseTimestamp(),
          updatedBy: firebase.auth().currentUser?.uid || 'anonymous'
        });

      
      showToastRef.current && showToastRef.current(t('Configuration saved successfully'), 'success');
    } catch (error) {
      console.error('Error saving configuration:', error);
      showToastRef.current && showToastRef.current(t('Operation failed') + ': ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [groups]);

  // Add new group
  const addGroup = () => {
    if (!newGroupName.trim()) {
      showToastRef.current && showToastRef.current(t('Please enter group name'), 'error');
      return;
    }

    const groupId = `group_${newGroupName.toLowerCase().replace(/\s+/g, '_')}`;
    if (groups[groupId]) {
      showToastRef.current && showToastRef.current(t('Group already exists'), 'error');
      return;
    }

    setGroups(prev => ({
      ...prev,
      [groupId]: []
    }));
    setNewGroupName('');
    setShowAddGroup(false);
  };

  // Delete group
  const deleteGroup = (groupId) => {
    if (window.confirm(t('Are you sure to delete this group?'))) {
      setGroups(prev => {
        const newGroups = { ...prev };
        delete newGroups[groupId];
        return newGroups;
      });
    }
  };

  // Add store to group
  const addStoreToGroup = (groupId, storeId) => {
    // Remove store from other groups first
    setGroups(prev => {
      const newGroups = { ...prev };
      Object.keys(newGroups).forEach(gId => {
        newGroups[gId] = newGroups[gId].filter(s => s !== storeId);
      });
      
      // Add to target group
      if (!newGroups[groupId].includes(storeId)) {
        newGroups[groupId] = [...newGroups[groupId], storeId];
      }
      
      return newGroups;
    });
  };

  // Remove store from group
  const removeStoreFromGroup = (groupId, storeId) => {
    setGroups(prev => ({
      ...prev,
      [groupId]: prev[groupId].filter(s => s !== storeId)
    }));
  };

  // Get unassigned stores
  const getUnassignedStores = () => {
    const assignedStores = new Set();
    Object.values(groups).forEach(storeList => {
      storeList.forEach(store => assignedStores.add(store));
    });
    return stores.filter(store => !assignedStores.has(store));
  };

  // Load initial data once
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Load store names and IDs
        const storeNamesMap = await initializeStoreNames();
        setStoreNames(storeNamesMap);

        // Get all store IDs from the loaded store names
        const storeIds = Array.from(storeNamesMap.keys()).sort();
        setStores(storeIds);

        setLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        showToastRef.current && showToastRef.current(t('Database Error') + ': ' + error.message, 'error');
        setLoading(false);
      }
    };
    
    initData();
  }, []); // Only run once on mount

  // Set up listener once
  useEffect(() => {
    console.log('Setting up store group configuration listener...');
    let unsubscribe = null;
    
    const initializeListener = async () => {
      unsubscribe = await setupConfigurationListener();
    };
    
    initializeListener();
    
    // Cleanup function to unsubscribe from the listener
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        console.log('Cleaning up store group configuration listener...');
        unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return (
      <div className="store-group-config loading">
        <div className="loading-spinner"></div>
        <span>{t('Loading')}...</span>
      </div>
    );
  }

  return (
    <div className="store-group-config">
      <div className="config-header">
        <h2>{t('Store Group Configuration')}</h2>
        <p>{t('Configure which stores share member accounts')}</p>
        <div className="header-actions">
          <button onClick={() => setShowAddGroup(true)} className="add-group-btn">
            ➕ {t('Add Group')}
          </button>
          <button onClick={saveConfiguration} disabled={saving} className="save-btn">
            {saving ? t('Saving') + '...' : '💾 ' + t('Save Configuration')}
          </button>
        </div>
      </div>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="modal-overlay">
          <div className="add-group-modal">
            <h3>{t('Add New Group')}</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder={t('Enter group name')}
              className="group-name-input"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={addGroup} className="confirm-btn">
                {t('Add')}
              </button>
              <button onClick={() => {
                setShowAddGroup(false);
                setNewGroupName('');
              }} className="cancel-btn">
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="groups-container">
        {Object.keys(groups).length === 0 ? (
          <div className="no-groups">
            <span>{t('No groups configured')}</span>
            <p>{t('Add groups to share members between stores')}</p>
          </div>
        ) : (
          Object.entries(groups).map(([groupId, storeList]) => (
            <div key={groupId} className="group-card">
              <div className="group-header notranslate">
                <h3>{groupId.replace('group_', '').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</h3>
                <button 
                  onClick={() => deleteGroup(groupId)}
                  className="delete-group-btn"
                  title={t('Delete Group')}
                >
                  🗑️
                </button>
              </div>
              
              <div className="group-stores">
                {storeList.length === 0 ? (
                  <div className="empty-group">
                    <span>{t('No stores in this group')}</span>
                  </div>
                ) : (
                  storeList.map(storeId => (
                    <div key={storeId} className="store-tag">
                      <span className="notranslate">{getStoreNameSync(storeId)}</span>
                      <button
                        onClick={() => removeStoreFromGroup(groupId, storeId)}
                        className="remove-store-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add store dropdown */}
              <div className="add-store-section">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addStoreToGroup(groupId, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="store-select"
                >
                  <option value="">{t('Add store to group')}</option>
                  {getUnassignedStores().map(storeId => (
                                          <option key={storeId} value={storeId} className="notranslate">{getStoreNameSync(storeId)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Unassigned Stores */}
      {getUnassignedStores().length > 0 && (
        <div className="unassigned-stores">
                      <h3>{t('Independent Stores')} (<span className="notranslate">{getUnassignedStores().length}</span>)</h3>
          <p>{t('These stores have separate member systems')}</p>
          <div className="store-list">
            {getUnassignedStores().map(storeId => (
              <div key={storeId} className="independent-store">
                                        <span className="notranslate">{getStoreNameSync(storeId)}</span>
                <span className="independent-badge">{t('Independent')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Info */}
      <div className="config-info">
        <h4>{t('How it works')}:</h4>
        <ul>
          <li>{t('Stores in the same group share member accounts')}</li>
          <li>{t('Members can use their balance in any store within the group')}</li>
          <li>{t('Independent stores have separate member systems')}</li>
          <li>{t('Changes take effect immediately after saving')}</li>
        </ul>
      </div>
    </div>
  );
};

export default StoreGroupConfig;