import React, { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { t, formatCurrency } from './translations';
import { getStoreGroup, generateFirebaseTimestamp } from './memberUtils';


/**
 * Member recharge component with packages and custom options
 * Admin can select predefined packages or input custom amounts
 */
const MemberRecharge = ({ member, onSuccess, onCancel, storeId, showToast }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined recharge packages
  const rechargePackages = [
    { 
      id: 1, 
      pay: 50, 
      bonus: 5, 
      name: t('Basic Package'), 
      description: t('Recharge $50 Get $5 Bonus'),
      color: '#28a745'
    },
    { 
      id: 2, 
      pay: 100, 
      bonus: 15, 
      name: t('Popular Package'), 
      description: t('Recharge $100 Get $15 Bonus'), 
      popular: true,
      color: '#007bff'
    },
    { 
      id: 3, 
      pay: 200, 
      bonus: 40, 
      name: t('Premium Package'), 
      description: t('Recharge $200 Get $40 Bonus'),
      color: '#fd7e14'
    },
    { 
      id: 4, 
      pay: 500, 
      bonus: 120, 
      name: t('VIP Package'), 
      description: t('Recharge $500 Get $120 Bonus'),
      color: '#6f42c1'
    },
  ];

  // Calculate total received amount
  const getTotalReceived = () => {
    if (selectedPackage && !customMode) {
      return selectedPackage.pay + selectedPackage.bonus;
    } else {
      return parseFloat(payAmount || 0) + parseFloat(bonusAmount || 0);
    }
  };

  const getPayAmount = () => {
    if (selectedPackage && !customMode) {
      return selectedPackage.pay;
    } else {
      return parseFloat(payAmount || 0);
    }
  };

  const getBonusAmount = () => {
    if (selectedPackage && !customMode) {
      return selectedPackage.bonus;
    } else {
      return parseFloat(bonusAmount || 0);
    }
  };

  const newBalance = member.balance + getTotalReceived();

  // Handle package selection
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCustomMode(false);
    setPayAmount('');
    setBonusAmount('');
    setError('');
  };

  // Handle custom mode toggle
  const handleCustomMode = () => {
    setCustomMode(true);
    setSelectedPackage(null);
    setError('');
  };

  // Handle amount input change
  const handleAmountChange = (value, field) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    if (field === 'pay') {
      setPayAmount(cleanValue);
    } else {
      setBonusAmount(cleanValue);
    }
    setError('');
  };

  // Handle recharge submission
  const handleRecharge = async (e) => {
    e.preventDefault();

    const finalPayAmount = getPayAmount();
    const finalBonusAmount = getBonusAmount();
    const totalReceived = getTotalReceived();

    if (finalPayAmount <= 0) {
      setError(t('Please enter valid amount'));
      return;
    }
    if (totalReceived <= 0) {
      setError(t('Total received amount must be greater than zero'));
      return;
    }
    if (finalPayAmount > 100000 || finalBonusAmount > 100000) { // Arbitrary large limit
      setError(t('Amount too large'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Use the member's original store or passed storeId as fallback
      const targetStoreId = member.sourceStore || storeId;
      const memberRef = firebase.firestore()
        .collection('stripe_customers')
        .doc(currentUserId)
        .collection('TitleLogoNameContent')
        .doc(targetStoreId)
        .collection('members')
        .doc(member.phone);

      // For group sharing, we need to update balance in ALL stores where member exists
      // but also ensure we're not double-charging
      
      // Get all stores that need to be updated
      let storesToUpdate = [targetStoreId]; // Always include the primary store
      
      // If member has sourceStores (from group sharing), update all of them
      if (member.sourceStores && member.sourceStores.length > 1) {
        storesToUpdate = member.sourceStores;
      } else {
        // Check if current store belongs to a group, update all stores in the group
        const storeGroupInfo = await getStoreGroup(targetStoreId);
        if (storeGroupInfo && storeGroupInfo.stores.length > 1) {
          storesToUpdate = storeGroupInfo.stores;
        }
      }

      console.log(`Processing recharge for member ${member.phone} in stores:`, storesToUpdate);

      // For each store where the member exists, update their data
      const batch = firebase.firestore().batch();
      
      for (const updateStoreId of storesToUpdate) {
        const updateMemberRef = firebase.firestore()
          .collection('stripe_customers')
          .doc(currentUserId)
          .collection('TitleLogoNameContent')
          .doc(updateStoreId)
          .collection('members')
          .doc(member.phone);

        // Check if member exists in this store
        const memberDoc = await updateMemberRef.get();
        if (memberDoc.exists) {
          const currentData = memberDoc.data();
          
          // Update member balance and recharge total
          batch.update(updateMemberRef, {
            balance: currentData.balance + totalReceived,
            totalRecharge: (currentData.totalRecharge || 0) + finalPayAmount,
            totalBonus: (currentData.totalBonus || 0) + finalBonusAmount,
            lastUsed: generateFirebaseTimestamp(storeId)
          });

          // Record transaction in this store
          const receiptData = {
            name: selectedPackage ? selectedPackage.name : t('Custom Recharge'),
            pay: finalPayAmount,
            bonus: finalBonusAmount,
            total: totalReceived,
            note: note,
            packageId: selectedPackage ? selectedPackage.id : 'custom'
          };

          batch.set(updateMemberRef.collection('payments').doc(), {
            store: updateStoreId,
            payment_method: 'admin_recharge',
            currency: 'usd',
            amount: totalReceived,
            payAmount: finalPayAmount,
            bonusAmount: finalBonusAmount,
            beforeBalance: currentData.balance,
            afterBalance: currentData.balance + totalReceived,
            status: 'succeeded',
            receipt: JSON.stringify([receiptData]),
            timestamp: generateFirebaseTimestamp(storeId),
            dateTime: new Date().toISOString().slice(0, 10) + '-' + new Date().toISOString().slice(11, 13) + '-' + new Date().toISOString().slice(14, 16) + '-' + new Date().toISOString().slice(17, 19) + '-' + new Date().toISOString().slice(20, 22),
            user_email: 'admin@system.com',
            uid: member.id,
            isDinein: t("Recharge"),
            tableNum: t("Admin Panel"),
            memberPhone: member.phone,
            note: note,
            sourceStore: updateStoreId
          });
        }
      }

      await batch.commit();

      // Calculate new balance for display
      const newBalance = member.balance + totalReceived;

      showToast && showToast(
        t('Recharge successful') + `!\n${t('Payment Amount')}: ${formatCurrency(finalPayAmount)}\n${t('Bonus Amount')}: ${formatCurrency(finalBonusAmount)}\n${t('Total Received')}: ${formatCurrency(totalReceived)}\n${t('New Balance')}: ${formatCurrency(newBalance)}`,
        'success'
      );

      // Notify parent to refresh with recharge result
      onSuccess && onSuccess({
        action: 'recharged',
        phone: member.phone,
        payAmount: finalPayAmount,
        bonusAmount: finalBonusAmount,
        totalReceived: totalReceived,
        newBalance: newBalance
      });

    } catch (err) {
      console.error('Recharge failed:', err);
      setError(t('Operation failed') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

    // Get level badge info for preview
    const getMemberLevelBadge = (level) => {
      const levels = {
        normal: { name: t('Normal Member'), color: '#6c757d' },
        vip: { name: t('VIP Member'), color: '#ffc107' }
      };
      return levels[level] || levels.normal;
    };
  
    const levelInfo = getMemberLevelBadge(member.memberLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">{t('Member Recharge')}</h3>
          <button 
            onClick={onCancel} 
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Content - Left Right Layout */}
        <div className="flex h-[calc(90vh-80px)] overflow-hidden">
          {/* Left Side - Form */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200">
            {/* Package Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('Select Recharge Package')}</h4>
              <div className="flex flex-wrap gap-4">
                {rechargePackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPackage?.id === pkg.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ flexBasis: 'calc(50% - 8px)' }}
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="package" 
                        checked={selectedPackage?.id === pkg.id}
                        readOnly
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <strong className="text-gray-900">{pkg.name}</strong>
                          {pkg.popular && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">热门</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">支付 {formatCurrency(pkg.pay)}</span>
                          <span className="text-green-600">赠送 +{formatCurrency(pkg.bonus)}</span>
                          <span className="text-blue-600 font-semibold">到账 {formatCurrency(pkg.pay + pkg.bonus)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    customMode 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{ flexBasis: 'calc(50% - 8px)' }}
                  onClick={handleCustomMode}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="package" 
                      checked={customMode}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="mb-2">
                        <strong className="text-gray-900">{t('Custom Amount')}</strong>
                      </div>
                      <div className="text-sm text-gray-600">
                        自定义充值金额
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Amount Form */}
            {customMode && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('Custom Recharge Amount')}</h4>
                <div className="flex flex-wrap gap-4">
                  <div style={{ flexBasis: 'calc(50% - 8px)' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('Payment Amount')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={payAmount}
                      onChange={(e) => handleAmountChange(e.target.value, 'pay')}
                      placeholder={t('Enter the amount customer paid')}
                      className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        error && error.includes(t('amount')) 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ 
                        border: '2px solid #6B7280',
                        backgroundColor: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div style={{ flexBasis: 'calc(50% - 8px)' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('Bonus Amount')} <span className="text-gray-500">({t('Optional')})</span>
                    </label>
                    <input
                      type="text"
                      value={bonusAmount}
                      onChange={(e) => handleAmountChange(e.target.value, 'bonus')}
                      placeholder={t('Extra bonus amount for promotion')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400"
                      style={{ 
                        border: '2px solid #6B7280',
                        backgroundColor: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Note Section */}
            {/* <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('Note')} <span className="text-gray-500">({t('Optional')})</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('Add a note for this recharge')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y hover:border-gray-400"
                style={{ 
                  border: '2px solid #6B7280',
                  backgroundColor: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
                rows="3"
              />
            </div> */}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
                <span className="text-red-500 text-lg">⚠️</span>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onCancel} 
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                onClick={handleRecharge}
                disabled={loading || (customMode ? getPayAmount() <= 0 : !selectedPackage)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('Processing')}...
                  </>
                ) : (
                  t('Save')
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="w-96 p-6 bg-gray-50 overflow-y-auto">
            {/* Member Info */}
            <div className="mb-6 notranslate">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('Member Info')}</h4>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Phone')}:</span>
                    <span className="text-gray-900 font-medium">{member.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Current Balance')}:</span>
                    <span className="text-blue-600 font-bold">{formatCurrency(member.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Member Level')}:</span>
                    <span 
                      className="text-gray-900 font-medium"
                      style={{ color: levelInfo.color }}
                    >
                      {levelInfo.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharge Summary */}
            {(selectedPackage || customMode) && (
              <div className="mb-6 notranslate">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('Recharge Summary')}</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="space-y-3">
                    {selectedPackage && !customMode && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('Package')}:</span>
                          <span className="text-gray-900 font-medium">{selectedPackage.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('Payment Amount')}:</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(selectedPackage.pay)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('Bonus Amount')}:</span>
                          <span className="text-green-600 font-medium">+{formatCurrency(selectedPackage.bonus)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-900 font-semibold">{t('Total Received')}:</span>
                          <span className="text-blue-600 font-bold">{formatCurrency(selectedPackage.pay + selectedPackage.bonus)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-900 font-semibold">{t('New Balance')}:</span>
                          <span className="text-blue-600 font-bold">{formatCurrency(member.balance + selectedPackage.pay + selectedPackage.bonus)}</span>
                        </div>
                      </>
                    )}
                    {customMode && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('Payment Amount')}:</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(getPayAmount())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('Bonus Amount')}:</span>
                          <span className="text-green-600 font-medium">+{formatCurrency(getBonusAmount())}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-900 font-semibold">{t('Total Received')}:</span>
                          <span className="text-blue-600 font-bold">{formatCurrency(getTotalReceived())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-900 font-semibold">{t('New Balance')}:</span>
                          <span className="text-blue-600 font-bold">{formatCurrency(newBalance)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No Selection Placeholder */}
            {!selectedPackage && !customMode && (
              <div className="mb-6">
                <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-gray-600 font-medium mb-2">{t('Please select a package')}</p>
                  <small className="text-gray-500">{t('After selecting a package, recharge details will be displayed here')}</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberRecharge;