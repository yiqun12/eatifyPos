import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { t, formatCurrency } from './translations';
import { getStoreGroup, loadStoreNames, getStoreNameSync } from './memberUtils';


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
    totalRecharge: 0
  });

  // Load members from Firebase (including group members)
  const loadMembers = async () => {
    try {
      setLoading(true);
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) {
        console.error('User not authenticated');
        showToast && showToast(t('User not authenticated, please refresh and try again'), 'error');
        return;
      }

      console.log('Loading members for user:', currentUserId, 'store:', storeId);
      
      // Load store names for display
      await loadStoreNames();
      
      // Check if current store belongs to a group
      const storeGroupInfo = await getStoreGroup(storeId);
      const storesToQuery = storeGroupInfo ? storeGroupInfo.stores : [storeId];
      
      console.log('Querying members from stores:', storesToQuery);
      
      const allMembers = new Map(); // Use Map to avoid duplicates by phone
      let totalSnapshots = 0;

      // Load members from all stores in the group (or just current store)
      for (const queryStoreId of storesToQuery) {
        try {
          const snapshot = await firebase
            .firestore()
            .collection('stripe_customers')
            .doc(currentUserId)
            .collection('TitleLogoNameContent')
            .doc(queryStoreId)
            .collection('members')
            .orderBy('totalRecharge', 'desc')
            .get();

          totalSnapshots += snapshot.size;
          
          snapshot.forEach(doc => {
            const memberData = { id: doc.id, ...doc.data() };
            memberData.sourceStore = queryStoreId; // Mark which store this member comes from
            
            // If member already exists from another store, merge the data
            const existingMember = allMembers.get(memberData.phone);
            if (existingMember) {
              // Combine balances and recharge amounts from different stores
              existingMember.balance = (existingMember.balance || 0) + (memberData.balance || 0);
              existingMember.totalRecharge = (existingMember.totalRecharge || 0) + (memberData.totalRecharge || 0);
              existingMember.sourceStores = existingMember.sourceStores || [];
              if (!existingMember.sourceStores.includes(queryStoreId)) {
                existingMember.sourceStores.push(queryStoreId);
              }
            } else {
              memberData.sourceStores = [queryStoreId];
              allMembers.set(memberData.phone, memberData);
            }
          });
        } catch (error) {
          console.warn(`Failed to load members from store ${queryStoreId}:`, error);
        }
      }

      console.log(`Loaded ${totalSnapshots} total records, ${allMembers.size} unique members`);

      // Convert Map to Array and calculate statistics
      const membersList = Array.from(allMembers.values());
      let totalMembers = 0;
      let activeMembers = 0;
      let totalBalance = 0;
      let totalRecharge = 0;

      membersList.forEach((member) => {
        totalMembers++;
        if (member.isActive !== false) activeMembers++;
        totalBalance += (member.balance || 0);
        totalRecharge += (member.totalRecharge || 0);
      });

      console.log('Stats calculated:', { totalMembers, activeMembers, totalBalance, totalRecharge });

      setMembers(membersList);
      setStats({
        totalMembers,
        activeMembers,
        totalBalance,
        totalRecharge
      });

      if (totalMembers === 0) {
        console.log('No members found. Try adding some members first.');
      }

    } catch (error) {
      console.error('Error loading members:', error);
      showToast && showToast(t('Operation failed') + ': ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [refreshTrigger]); // Re-load when refreshTrigger changes

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
              {/* Statistics Cards */}
        <div className="flex flex-wrap gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">👥</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
              <div className="text-sm text-gray-600">{t('Total Members')}</div>
            </div>
          </div>
        </div>
        
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">✅</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeMembers}</div>
              <div className="text-sm text-gray-600">{t('Active Members')}</div>
            </div>
          </div>
        </div>
        
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">💰</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalBalance)}</div>
              <div className="text-sm text-gray-600">{t('Total Balance Pool')}</div>
            </div>
          </div>
        </div>
        
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-48">
          <div className="flex items-center gap-4">
            <div className="text-3xl">💳</div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRecharge)}</div>
              <div className="text-sm text-gray-600">{t('Total Recharge')}</div>
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
            <button 
              onClick={loadMembers} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 {t('Refresh')}
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredMembers.length} {t('members found')}
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
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 1fr 1.5fr' }}>
              <div>{t('Phone')}</div>
              <div>{t('Level')}</div>
              <div>{t('Balance')}</div>
              <div>{t('Total Recharge')}</div>
              <div>{t('Status')}</div>
              <div>{t('Actions')}</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredMembers.map(member => {
                const levelInfo = getMemberLevelBadge(member.memberLevel);
                
                return (
                  <div key={member.id} className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 1fr 1.5fr' }}>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">{member.phone}</span>
                      {member.sourceStores && member.sourceStores.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.sourceStores.map(sourceStore => (
                            <span 
                              key={sourceStore}
                              className="inline-block px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              title={`Member also exists in store: ${getStoreNameSync(sourceStore)}`}
                            >
                              {sourceStore === storeId ? t('Current') : getStoreNameSync(sourceStore)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: levelInfo.color }}
                      >
                        {levelInfo.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-blue-600 font-semibold">{formatCurrency(member.balance)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-900">{formatCurrency(member.totalRecharge)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.isActive ? t('Active') : t('Inactive')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditMember && onEditMember(member)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                        title={t('Edit Member')}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onRechargeMember && onRechargeMember(member)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                        title={t('Recharge')}
                      >
                        💰
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberList;