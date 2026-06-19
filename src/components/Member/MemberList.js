import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { t, formatCurrency } from './translations';
import { getStoreGroup, initializeStoreNames, getStoreNameSync, formatRecordTimestamp } from './memberUtils';


/**
 * Member search and list component
 * Display all members with search functionality
 */
const MemberList = ({ onSelectMember, onEditMember, onRechargeMember, refreshTrigger, storeId, showToast }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState("");
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalBalance: 0,
    totalRecharge: 0,
    totalSpent: 0
  });
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberRecords, setMemberRecords] = useState({
    rechargeRecords: [],
    consumptionRecords: []
  });
  const [recordsActiveTab, setRecordsActiveTab] = useState('recharge'); // 'recharge' or 'consumption'
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsUnsubscribers, setRecordsUnsubscribers] = useState([]); // Store unsubscribe functions for records
  
  // Control whether to show current store only or shared stores data
  const [showStoreMode, setShowStoreMode] = useState('auto'); // 'current' | 'shared' | 'auto'

  // Calculate totalSpent for members from their consumption records
  const calculateMembersTotalSpent = async (members, storesToQuery, currentUserId) => {
    try {
      const membersToUpdate = members.filter(member => !member.totalSpent || member.totalSpent === 0);
      
      if (membersToUpdate.length === 0) {
        console.log('All members already have totalSpent calculated');
        return;
      }

      console.log(`Calculating totalSpent for ${membersToUpdate.length} members`);

      for (const member of membersToUpdate) {
        let totalSpent = 0;
        
        // Check consumption records across all stores where this member exists
        const memberStores = member.sourceStores || storesToQuery;
        for (const storeId of memberStores) {
          try {
            const paymentsSnapshot = await firebase.firestore()
              .collection('stripe_customers')
              .doc(currentUserId)
              .collection('TitleLogoNameContent')
              .doc(storeId)
              .collection('members')
              .doc(member.phone)
              .collection('payments')
              .where('payment_method', '==', 'balance_consumption')
              .get();

            paymentsSnapshot.forEach(doc => {
              const data = doc.data();
              const amount = Math.abs(parseFloat(data.amount) || 0);
              totalSpent += amount;
            });
          } catch (error) {
            console.warn(`Failed to fetch consumption records for member ${member.phone} in store ${storeId}:`, error);
          }
        }

        // Update the member's totalSpent
        member.totalSpent = totalSpent;
        console.log(`Member ${member.phone}: calculated totalSpent = ${totalSpent}`);
      }
    } catch (error) {
      console.error('Error calculating members totalSpent:', error);
    }
  };

  // Set up real-time listeners for member records (recharge and consumption)
  const viewMemberRecords = async (member) => {
    try {
      // Clean up any existing listeners first
      recordsUnsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      setRecordsUnsubscribers([]);

      setSelectedMember(member);
      // Don't reset memberRecords here - let it keep previous data until new data arrives
      setRecordsActiveTab('recharge'); // Reset to recharge tab
      setRecordsLoading(true); // Start loading
      setShowRecordsModal(true);

      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) {
        showToast && showToast(t('User not authenticated, please refresh and try again'), 'error');
        setRecordsLoading(false); // Reset loading on error
        return;
      }

      const sourceStores = member.sourceStores || [storeId];
      const newUnsubscribers = [];
      const allRechargeRecordsMap = new Map(); // Use Map to merge records from multiple stores
      const allConsumptionRecordsMap = new Map(); // TODO: For consumption records

      // Function to update records data
      const updateRecordsData = () => {
        const rechargeRecords = Array.from(allRechargeRecordsMap.values())
          .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        const consumptionRecords = Array.from(allConsumptionRecordsMap.values())
          .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());

        console.log('Updating records data:', {
          rechargeCount: rechargeRecords.length,
          consumptionCount: consumptionRecords.length,
          rechargeData: rechargeRecords.slice(0, 2).map(r => ({ amount: r.amount, payment_method: r.payment_method })),
          consumptionData: consumptionRecords.slice(0, 2).map(r => ({ amount: r.amount, payment_method: r.payment_method }))
        });

        setMemberRecords({
          rechargeRecords,
          consumptionRecords
        });
        
      };

      // Set up real-time listeners for recharge records from all source stores
      for (const sourceStoreId of sourceStores) {
        try {
          // Recharge records listener
          const rechargeUnsubscribe = firebase
            .firestore()
            .collection('stripe_customers')
            .doc(currentUserId)
            .collection('TitleLogoNameContent')
            .doc(sourceStoreId)
            .collection('members')
            .doc(member.phone)
            .collection('payments')
            .orderBy('timestamp', 'desc')
            .onSnapshot(
              (snapshot) => {
                console.log(`Real-time payment records update from store ${sourceStoreId}: ${snapshot.size} records`);
                
                // Separate recharge and consumption records based on payment_method and amount
                snapshot.forEach(doc => {
                  const data = doc.data();
                  const record = { 
                    id: `${sourceStoreId}_${doc.id}`, // Unique ID across stores
                    docId: doc.id,
                    ...data, 
                    sourceStore: sourceStoreId
                  };
                  
                  // Distinguish between recharge and consumption records
                  // Consumption: payment_method is 'balance_consumption' or amount is negative
                  // Recharge: all other cases with positive amounts (typically 'stripe' payments)
                  const isConsumption = data.payment_method === 'balance_consumption' || (data.amount && parseFloat(data.amount) < 0);
                  
                  console.log(`Processing record ${doc.id}: payment_method=${data.payment_method}, amount=${data.amount}, isConsumption=${isConsumption}`);
                  
                  if (isConsumption) {
                    record.type = 'consumption';
                    allConsumptionRecordsMap.set(record.id, record);
                  } else {
                    record.type = 'recharge';
                    allRechargeRecordsMap.set(record.id, record);
                  }
                });

                // Remove deleted records for this store from both maps
                const currentStoreRecordIds = new Set(snapshot.docs.map(doc => `${sourceStoreId}_${doc.id}`));
                for (const [recordId] of allRechargeRecordsMap.entries()) {
                  if (recordId.startsWith(`${sourceStoreId}_`) && !currentStoreRecordIds.has(recordId)) {
                    allRechargeRecordsMap.delete(recordId);
                  }
                }
                for (const [recordId] of allConsumptionRecordsMap.entries()) {
                  if (recordId.startsWith(`${sourceStoreId}_`) && !currentStoreRecordIds.has(recordId)) {
                    allConsumptionRecordsMap.delete(recordId);
                  }
                }

                // Stop loading immediately when first data arrives
                setRecordsLoading(false);
                updateRecordsData();
              },
              (error) => {
                console.error(`Error in recharge records listener for store ${sourceStoreId}:`, error);
                showToast && showToast(t('Real-time update error') + ': ' + error.message, 'error');
                setRecordsLoading(false);
              }
            );

          newUnsubscribers.push(rechargeUnsubscribe);

          // Note: Consumption records are now handled in the same listener above
          // by distinguishing records based on payment_method and amount values

        } catch (error) {
          console.warn(`Failed to set up records listener for store ${sourceStoreId}:`, error);
        }
      }

      setRecordsUnsubscribers(newUnsubscribers);

      // If no stores to set up listeners for, stop loading immediately
      if (sourceStores.length === 0) {
        console.log('No source stores found, stopping loading immediately');
        setRecordsLoading(false);
      } else {
        console.log(`Set up ${newUnsubscribers.length} listeners for stores:`, sourceStores);
        // Give a small delay to ensure all listeners are established, then force stop loading
        setTimeout(() => {
          console.log('Forcing loading stop after timeout');
          setRecordsLoading(false);
        }, 1000);
      }

    } catch (error) {
      console.error('Error setting up records listeners:', error);
      showToast && showToast(t('Database Error') + ': ' + error.message, 'error');
      setRecordsLoading(false);
    }
  };

  // Set up real-time listeners for members using onSnapshot
  const setupMembersListener = async () => {
    try {
      setLoading(true);
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) {
        console.error('User not authenticated');
        showToast && showToast(t('User not authenticated, please refresh and try again'), 'error');
        setLoading(false);
        return [];
      }

      console.log('Setting up real-time listener for user:', currentUserId, 'store:', storeId);
      
      // Load store names for display
      await initializeStoreNames();
      
      // Determine which stores to query based on showStoreMode
      let storesToQuery = [storeId]; // Default: only current store
      
      if (showStoreMode === 'auto') {
        // Auto mode: check if current store belongs to a group
        const storeGroupInfo = await getStoreGroup(storeId);
        storesToQuery = storeGroupInfo ? storeGroupInfo.stores : [storeId];
      } else if (showStoreMode === 'shared') {
        // Force shared mode: always try to get group stores
        const storeGroupInfo = await getStoreGroup(storeId);
        storesToQuery = storeGroupInfo ? storeGroupInfo.stores : [storeId];
      } else if (showStoreMode === 'current') {
        // Force current store only
        storesToQuery = [storeId];
      }
      
      console.log('Setting up real-time listeners for stores:', storesToQuery);
      
      const unsubscribeFunctions = [];
      const allStoresData = new Map(); // Store data from each store
      
      // Function to merge data from all stores and update UI
      const updateMembersData = () => {
        const allMembers = new Map(); // Use Map to avoid duplicates by phone
        let totalSnapshots = 0;

        // Merge data from all stores
        for (const [queryStoreId, storeMembers] of allStoresData.entries()) {
          totalSnapshots += storeMembers.size;
          
          for (const [phone, memberData] of storeMembers.entries()) {
            // If member already exists from another store, merge the data
            const existingMember = allMembers.get(phone);
            if (existingMember) {
              // Combine balances and recharge amounts from different stores
              existingMember.balance = (existingMember.balance || 0) + (memberData.balance || 0);
              existingMember.totalRecharge = (existingMember.totalRecharge || 0) + (memberData.totalRecharge || 0);
              existingMember.totalSpent = (existingMember.totalSpent || 0) + (memberData.totalSpent || 0);
              existingMember.sourceStores = existingMember.sourceStores || [];
              if (!existingMember.sourceStores.includes(queryStoreId)) {
                existingMember.sourceStores.push(queryStoreId);
              }
            } else {
              const newMemberData = { ...memberData };
              newMemberData.sourceStores = [queryStoreId];
              newMemberData.totalSpent = newMemberData.totalSpent || 0;
              allMembers.set(phone, newMemberData);
            }
          }
        }

        console.log(`Real-time update: ${totalSnapshots} total records, ${allMembers.size} unique members`);

        // Convert Map to Array and sort by creation time (newest first)
        const membersList = Array.from(allMembers.values()).sort((a, b) => {
          // Handle cases where createdAt might not exist
          let timeA, timeB;
          
          try {
            if (a.createdAt) {
              timeA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            } else {
              timeA = new Date(0); // Very old date for members without createdAt
            }
          } catch (error) {
            console.warn(`Error parsing createdAt for member ${a.phone}:`, error);
            timeA = new Date(0);
          }
          
          try {
            if (b.createdAt) {
              timeB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            } else {
              timeB = new Date(0); // Very old date for members without createdAt
            }
          } catch (error) {
            console.warn(`Error parsing createdAt for member ${b.phone}:`, error);
            timeB = new Date(0);
          }
          
          return timeB - timeA; // Newest first (descending order)
        });
        
        console.log('Sorted members (first 3):', membersList.slice(0, 3).map(m => ({
          phone: m.phone,
          createdAt: m.createdAt ? (m.createdAt.toDate ? m.createdAt.toDate() : m.createdAt) : 'No createdAt'
        })));
        let totalMembers = 0;
        let activeMembers = 0;
        let totalBalance = 0;
        let totalRecharge = 0;
        let totalSpent = 0;

        membersList.forEach((member) => {
          totalMembers++;
          if (member.isActive !== false) activeMembers++;
          totalBalance += (member.balance || 0);
          totalRecharge += (member.totalRecharge || 0);
          totalSpent += (member.totalSpent || 0);
        });

        console.log('Real-time stats:', { totalMembers, activeMembers, totalBalance, totalRecharge, totalSpent });

        setMembers(membersList);
        setStats({
          totalMembers,
          activeMembers,
          totalBalance,
          totalRecharge,
          totalSpent
        });

        setLoading(false); // Only set loading false after first data load

        // Asynchronously calculate totalSpent for members who don't have it
        // This doesn't block UI updates
        calculateMembersTotalSpent(membersList, storesToQuery, currentUserId).then(() => {
          // Recalculate stats after totalSpent is updated
          let updatedTotalSpent = 0;
          membersList.forEach((member) => {
            updatedTotalSpent += (member.totalSpent || 0);
          });
          
          setStats(prevStats => ({
            ...prevStats,
            totalSpent: updatedTotalSpent
          }));
          
          // Re-trigger members state update to reflect new totalSpent values
          setMembers([...membersList]);
        }).catch(error => {
          console.error('Failed to calculate totalSpent:', error);
        });
      };

      // Set up real-time listeners for each store
      for (const queryStoreId of storesToQuery) {
        try {
          const unsubscribe = firebase
            .firestore()
            .collection('stripe_customers')
            .doc(currentUserId)
            .collection('TitleLogoNameContent')
            .doc(queryStoreId)
            .collection('members')
            // Note: Removed orderBy from Firebase query since some members might not have createdAt
            // Instead, we sort in the frontend after merging data from multiple stores
            .onSnapshot(
              (snapshot) => {
                console.log(`Real-time update from store ${queryStoreId}: ${snapshot.size} members`);
                
                // Update data for this specific store
                const storeMembers = new Map();
                snapshot.forEach(doc => {
                  const memberData = { id: doc.id, ...doc.data() };
                  memberData.sourceStore = queryStoreId;
                  storeMembers.set(memberData.phone, memberData);
                });
                
                // Store this store's data
                allStoresData.set(queryStoreId, storeMembers);
                
                // Update UI with merged data from all stores
                updateMembersData();
              },
              (error) => {
                console.error(`Error in real-time listener for store ${queryStoreId}:`, error);
                showToast && showToast(t('Real-time update error') + ': ' + error.message, 'error');
                setLoading(false);
              }
            );
          
          unsubscribeFunctions.push(unsubscribe);
          console.log(`Real-time listener set up for store: ${queryStoreId}`);
        } catch (error) {
          console.warn(`Failed to set up listener for store ${queryStoreId}:`, error);
        }
      }
      
      return unsubscribeFunctions;
      
    } catch (error) {
      console.error('Error setting up real-time listeners:', error);
      showToast && showToast(t('Operation failed') + ': ' + error.message, 'error');
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    let unsubscribeFunctions = [];
    
    const initializeListeners = async () => {
      unsubscribeFunctions = await setupMembersListener();
    };
    
    initializeListeners();
    
    // Cleanup function to unsubscribe from all listeners
    return () => {
      console.log('Cleaning up real-time listeners...');
      unsubscribeFunctions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      // Also clean up records listeners
      recordsUnsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [storeId, showStoreMode]); // Re-setup when storeId or showStoreMode changes

  // Filter members by phone search
  const filteredMembers = members.filter(member =>
    member.phone.includes(searchPhone)
  );

  // Get member level badge info
  const getMemberLevelBadge = (level) => {
    const levels = {
      normal: { name: t('Normal Member'), color: '#6c757d' },
      vip: { name: t('VIP Member'), color: '#ffc107' }
    };
    return levels[level] || levels.normal;
  };

  return (
    <div className="p-6">
      {/* Store Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">{t('Statistics Display Mode')}:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowStoreMode('current')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                showStoreMode === 'current'
                  ? 'bg-white text-blue-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('Current Store Only')}
            </button>
            <button
              onClick={() => setShowStoreMode('shared')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                showStoreMode === 'shared'
                  ? 'bg-white text-blue-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('Shared Stores')}
            </button>
            <button
              onClick={() => setShowStoreMode('auto')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                showStoreMode === 'auto'
                  ? 'bg-white text-blue-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('Auto')}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="flex flex-wrap gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">👥</div>
            <div>
                              <div className="text-2xl font-bold text-gray-900 notranslate">{stats.totalMembers}</div>
              <div className="text-sm text-gray-600">{t('Total Members')}</div>
            </div>
          </div>
        </div>
        
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">✅</div>
            <div>
              <div className="text-2xl font-bold text-gray-900 notranslate">{stats.activeMembers}</div>
              <div className="text-sm text-gray-600">{t('Active Members')}</div>
            </div>
          </div>
        </div>
        
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">💰</div>
            <div>
              <div className="text-2xl font-bold text-blue-600 notranslate">{formatCurrency(stats.totalBalance)}</div>
              <div className="text-sm text-gray-600">{t('Total Balance Pool')}</div>
            </div>
          </div>
        </div>
        
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">💳</div>
            <div>
              <div className="text-2xl font-bold text-green-600 notranslate">{formatCurrency(stats.totalRecharge)}</div>
              <div className="text-sm text-gray-600">{t('Total Recharge')}</div>
            </div>
          </div>
        </div>
        
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🛒</div>
            <div>
              <div className="text-2xl font-bold text-red-600 notranslate">{formatCurrency(stats.totalSpent)}</div>
              <div className="text-sm text-gray-600">{t('Total Spent')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="tel"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder={t('Enter Phone Number')}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-500"
              style={{ 
                border: '2px solid #6B7280',
                backgroundColor: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSearchPhone('')} 
              className="px-4 py-2 border-2 border-gray-400 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-colors"
            >
              {t('Clear')}
            </button>

          </div>
        </div>
        <div className="text-sm text-gray-600">
                      <span className="notranslate">{filteredMembers.length}</span> {t('members found')}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <span className="text-gray-600">{t('Loading')}...</span>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">📋</div>
            <p className="text-gray-600">{t('No members found')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header - Fixed */}
            <div className="grid px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700" style={{ gridTemplateColumns: '2.5fr 1.2fr 1.3fr 1.3fr 1.3fr 1fr 2fr' }}>
              <div className="truncate">{t('Phone')}</div>
              <div className="text-center">{t('Level')}</div>
              <div className="text-right">{t('Balance')}</div>
              <div className="text-right">{t('Total Recharge')}</div>
              <div className="text-right">{t('Total Spent')}</div>
              <div className="text-center">{t('Status')}</div>
              <div className="text-center">{t('Actions')}</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredMembers.map(member => {
                const levelInfo = getMemberLevelBadge(member.memberLevel);
                
                return (
                  <div key={member.id} className="grid px-6 py-4 hover:bg-gray-50 transition-colors" style={{ gridTemplateColumns: '2.5fr 1.2fr 1.3fr 1.3fr 1.3fr 1fr 2fr' }}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-gray-900 font-medium truncate" title={member.phone}>{member.phone}</span>
                      {member.sourceStores && member.sourceStores.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.sourceStores.map(sourceStore => (
                            <span 
                              key={sourceStore}
                              className="inline-block px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded notranslate"
                              title={`Member also exists in store: ${getStoreNameSync(sourceStore)}`}
                            >
                              {sourceStore === storeId ? t('Current') : getStoreNameSync(sourceStore)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs font-semibold text-white notranslate"
                        style={{ backgroundColor: levelInfo.color }}
                      >
                        {levelInfo.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-end">
                                              <span className="text-blue-600 font-semibold notranslate">{formatCurrency(member.balance)}</span>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <span className="text-gray-900 notranslate">{formatCurrency(member.totalRecharge)}</span>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <span className="text-red-600 font-semibold notranslate">{formatCurrency(member.totalSpent)}</span>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.isActive ? t('Active') : t('Inactive')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => onEditMember && onEditMember(member)}
                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded transition-colors"
                      >
                        {t('Edit')}
                      </button>
                      <button
                        onClick={() => onRechargeMember && onRechargeMember(member)}
                        className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded transition-colors"
                      >
                        {t('Recharge')}
                      </button>
                      <button
                        onClick={() => viewMemberRecords(member)}
                        className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded transition-colors"
                      >
                        {t('Records')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Records Modal */}
      {showRecordsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {t('Member Records')} - {selectedMember.phone}
              </h2>
              <button
                onClick={() => {
                  // Clean up records listeners when closing
                  recordsUnsubscribers.forEach(unsubscribe => {
                    if (typeof unsubscribe === 'function') {
                      unsubscribe();
                    }
                  });
                  setRecordsUnsubscribers([]);
                  setShowRecordsModal(false);
                  setRecordsLoading(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => !recordsLoading && setRecordsActiveTab('recharge')}
                disabled={recordsLoading}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  recordsActiveTab === 'recharge'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : recordsLoading
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💳 {t('Recharge Records')} {`(${memberRecords.rechargeRecords.length})`}
              </button>
              <button
                onClick={() => !recordsLoading && setRecordsActiveTab('consumption')}
                disabled={recordsLoading}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  recordsActiveTab === 'consumption'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : recordsLoading
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🛒 {t('Consumption Records')} {`(${memberRecords.consumptionRecords.length})`}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {recordsLoading ? (
                /* Loading State */
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('Loading')}...</p>
                </div>
              ) : recordsActiveTab === 'recharge' ? (
                /* Recharge Records Table */
                <div>
                  {memberRecords.rechargeRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">💳</div>
                      <p className="text-lg">{t('No recharge records found')}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
                      {/* Table Header - Fixed */}
                      <div className="grid px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 sticky top-0 z-10" 
                           style={{ gridTemplateColumns: '180px 120px 120px 120px 120px 120px 1fr' }}>
                        <div className="truncate">{t('Date & Time')}</div>
                        <div className="text-right">{t('Payment Amount')}</div>
                        <div className="text-right">{t('Bonus Amount')}</div>
                        <div className="text-right">{t('Total Amount')}</div>
                        <div className="text-right">{t('Before Balance')}</div>
                        <div className="text-right">{t('After Balance')}</div>
                        <div className="truncate">{t('Store')}</div>
                      </div>
                      {/* Table Body - Scrollable */}
                      <div className="divide-y divide-gray-200 overflow-y-auto" style={{ height: 'calc(500px - 72px)' }}>
                        {memberRecords.rechargeRecords.map(record => (
                          <div key={record.id} className="grid px-6 py-4 hover:bg-gray-50 transition-colors" 
                               style={{ gridTemplateColumns: '180px 120px 120px 120px 120px 120px 1fr' }}>
                            <div className="text-sm text-gray-900 truncate notranslate" title={formatRecordTimestamp(record.timestamp, record.sourceStore || record.store || storeId)}>
                              {formatRecordTimestamp(record.timestamp, record.sourceStore || record.store || storeId)}
                            </div>
                                                         <div className="text-sm font-medium text-blue-600 text-right notranslate">
                               {formatCurrency(record.payAmount)}
                             </div>
                            <div className="text-sm font-medium text-green-600 text-right notranslate">
                              {formatCurrency(record.bonusAmount || 0)}
                            </div>
                            <div className="text-sm font-semibold text-gray-900 text-right notranslate">
                              {formatCurrency(record.amount)}
                            </div>
                            <div className="text-sm text-gray-600 text-right notranslate">
                              {formatCurrency(record.beforeBalance || 0)}
                            </div>
                            <div className="text-sm text-gray-600 text-right notranslate">
                              {formatCurrency(record.afterBalance || 0)}
                            </div>
                            <div className="text-sm text-gray-500 truncate notranslate" title={getStoreNameSync(record.sourceStore || record.store)}>
                              {getStoreNameSync(record.sourceStore || record.store)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Consumption Records Table */
                <div>
                  {memberRecords.consumptionRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🛒</div>
                      <p className="text-lg">{t('No consumption records found')}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
                      {/* Table Header - Fixed */}
                      <div className="grid px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 sticky top-0 z-10" 
                           style={{ gridTemplateColumns: '180px 120px 200px 120px 120px 1fr' }}>
                        <div className="truncate">{t('Date & Time')}</div>
                        <div className="text-right">{t('Amount')}</div>
                        <div className="truncate">{t('Description')}</div>
                        <div className="text-right">{t('Before Balance')}</div>
                        <div className="text-right">{t('After Balance')}</div>
                        <div className="truncate">{t('Store')}</div>
                      </div>
                      {/* Table Body - Scrollable */}
                      <div className="divide-y divide-gray-200 overflow-y-auto" style={{ height: 'calc(500px - 72px)' }}>
                        {memberRecords.consumptionRecords.map(record => (
                          <div key={record.id} className="grid px-6 py-4 hover:bg-gray-50 transition-colors" 
                               style={{ gridTemplateColumns: '180px 120px 200px 120px 120px 1fr' }}>
                            <div className="text-sm text-gray-900 truncate notranslate" title={formatRecordTimestamp(record.timestamp, record.sourceStore || record.store || storeId)}>
                              {formatRecordTimestamp(record.timestamp, record.sourceStore || record.store || storeId)}
                            </div>
                            <div className="text-sm font-medium text-red-600 text-right">
                              <span className="notranslate">-{formatCurrency(Math.abs(record.amount || 0))}</span>
                            </div>
                            <div className="text-sm text-gray-700 truncate" title={record.description || t('Purchase')}>
                              {record.description || t('Purchase')}
                            </div>
                            <div className="text-sm text-gray-600 text-right notranslate">
                              {formatCurrency(record.beforeBalance || 0)}
                            </div>
                            <div className="text-sm text-gray-600 text-right notranslate">
                              {formatCurrency(record.afterBalance || 0)}
                            </div>
                            <div className="text-sm text-gray-500 truncate notranslate" title={getStoreNameSync(record.sourceStore || record.store)}>
                              {getStoreNameSync(record.sourceStore || record.store)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  // Clean up records listeners when closing
                  recordsUnsubscribers.forEach(unsubscribe => {
                    if (typeof unsubscribe === 'function') {
                      unsubscribe();
                    }
                  });
                  setRecordsUnsubscribers([]);
                  setShowRecordsModal(false);
                  setRecordsLoading(false); // Reset loading state when closing
                }}
                className="px-6 py-2 border-2 border-gray-400 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-colors"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;