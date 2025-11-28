import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import { t, formatCurrency } from './translations';
import { getStoreGroup, generateFirebaseTimestamp } from './memberUtils';


/**
 * Add/Edit member component
 * Simple form to create new member account or edit existing member
 */
const MemberAdd = ({ editingMember = null, onSuccess, onCancel, storeId }) => {
  const [formData, setFormData] = useState({
    phone: editingMember?.phone || '',
    memberLevel: editingMember?.memberLevel || 'normal',
    isActive: editingMember?.isActive !== false,
    notes: editingMember?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user types
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone || formData.phone.length < 6) {
      setError(t('Please enter valid phone number'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Use the member's original store for editing, or current storeId for new members
      const targetStoreId = editingMember?.sourceStore || storeId;
      const memberRef = firebase.firestore()
        .collection('stripe_customers')
        .doc(currentUserId)
        .collection('TitleLogoNameContent')
        .doc(targetStoreId)
        .collection('members')
        .doc(formData.phone);

      if (editingMember) {
        // Update existing member in ALL stores where they exist (for group sharing)
        const updateData = {
          memberLevel: formData.memberLevel,
          isActive: formData.isActive,
          notes: formData.notes,
          lastUsed: generateFirebaseTimestamp(storeId),
          updatedBy: 'admin',
          updatedAt: generateFirebaseTimestamp(storeId)
        };

        // For old members without createdAt, add it during update
        if (!editingMember.createdAt) {
          updateData.createdAt = generateFirebaseTimestamp(storeId);
          console.log(`Adding createdAt field to existing member: ${formData.phone}`);
        }

        // Get all stores that need to be updated
        let storesToUpdate = [targetStoreId]; // Always include the primary store
        
        // If member has sourceStores (from group sharing), update all of them
        if (editingMember.sourceStores && editingMember.sourceStores.length > 1) {
          storesToUpdate = editingMember.sourceStores;
        } else {
          // Check if current store belongs to a group, update all stores in the group
          const storeGroupInfo = await getStoreGroup(targetStoreId);
          if (storeGroupInfo && storeGroupInfo.stores.length > 1) {
            storesToUpdate = storeGroupInfo.stores;
          }
        }

        console.log(`Updating member ${formData.phone} in stores:`, storesToUpdate);

        // Update member data in all relevant stores
        const batch = firebase.firestore().batch();
        for (const updateStoreId of storesToUpdate) {
          const updateMemberRef = firebase.firestore()
            .collection('stripe_customers')
            .doc(currentUserId)
            .collection('TitleLogoNameContent')
            .doc(updateStoreId)
            .collection('members')
            .doc(formData.phone);
          
          batch.update(updateMemberRef, updateData);
        }
        
        await batch.commit();
        
        // Call success callback
        onSuccess && onSuccess({
          ...editingMember,
          memberLevel: formData.memberLevel,
          isActive: formData.isActive,
          action: 'updated'
        });
        
      } else {
        // Check if member already exists (only for new members)
        const existingDoc = await memberRef.get();
        if (existingDoc.exists) {
          setError(t("Member already exists") + ': ' + formData.phone);
          return;
        }

        // Create new member
        const memberData = {
          phone: formData.phone,
  
          storeId: storeId,
          isMember: true,
          isActive: formData.isActive,
          balance: 0,
          totalRecharge: 0,
          totalConsume: 0,
          totalBonus: 0,
          memberLevel: formData.memberLevel,
          notes: formData.notes,
          createdAt: generateFirebaseTimestamp(storeId),
          lastUsed: generateFirebaseTimestamp(storeId),
          createdBy: 'admin',
          createdSource: 'admin_panel'
        };
        console.log(memberData)

        await memberRef.set(memberData);
        
                            // Reset form for adding mode
                    setFormData({
                      phone: '',
                
                      memberLevel: 'normal',
                      isActive: true,
                      notes: ''
                    });
        
        // Call success callback
        onSuccess && onSuccess({
          phone: formData.phone,
          memberLevel: formData.memberLevel,
          isActive: formData.isActive,
          action: 'created'
        });
      }
      
    } catch (error) {
      console.error('Save member failed:', error);
      setError(t('Operation failed') + ': ' + error.message);
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

  const levelInfo = getMemberLevelBadge(formData.memberLevel);

        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingMember ? t('Edit Member') : t('Add New Member')}
              </h3>
              <button 
                onClick={onCancel} 
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('Phone Number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\s/g, ''))}
                    placeholder={t('Enter phone number')}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      error && error.includes(t('Phone')) 
                        ? 'border-red-500 bg-red-50' 
                        : editingMember
                        ? 'border-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                    style={{ 
                      border: '2px solid #6B7280',
                      backgroundColor: editingMember ? '#F3F4F6' : 'white',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                    required
                    disabled={editingMember}
                    readOnly={editingMember}
                  />
                </div>



                {/* Member Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('Member Level')}
                  </label>
                  <div className="flex items-center gap-4">
                    <select
                      value={formData.memberLevel}
                      onChange={(e) => handleInputChange('memberLevel', e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer hover:border-gray-500"
                      style={{ 
                        border: '2px solid #6B7280',
                        backgroundColor: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="normal">{t('Normal Member')}</option>
                      <option value="vip">{t('VIP Member')}</option>
                    </select>
                    <div className="flex-shrink-0">
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold"
                        style={{ backgroundColor: levelInfo.color }}
                      >
                        {levelInfo.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-400 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {t('Active Status')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {t('Member can use balance')}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('Notes')} <span className="text-gray-500">({t('Optional')})</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={t('Add any notes about this member')}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y hover:border-gray-500"
                    style={{ 
                      border: '2px solid #6B7280',
                      backgroundColor: 'white',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                    rows="3"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-gray-400 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.phone || formData.phone.length < 6}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('Saving')}...
                      </>
                    ) : (
                      t('Save')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
};

export default MemberAdd;