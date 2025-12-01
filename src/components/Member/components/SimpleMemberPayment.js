import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { MemberPaymentAPI } from '../memberUtils';
import { t } from '../translations';

/**
 * SimpleMemberPayment - Simplified member payment component
 * One modal solution: Search phone → Enter 1111 verification code → Set amount → Complete
 */
const SimpleMemberPayment = ({ 
    isOpen, 
    onClose, 
    totalAmount,
    orderItems,
    storeId,
    tableNum,
    onPaymentComplete,
    verifiedMemberPhone,
    onVerifiedPhoneChange,
    currentBalanceUsage // Current balance usage state
}) => {
    const [step, setStep] = useState('search'); // search, member_info, verify, amount
    
    // Debug: Track step changes
    useEffect(() => {
        console.log('📍 Step changed to:', step);
    }, [step]);
    const [phone, setPhone] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [memberData, setMemberData] = useState(null);
    const [balanceToUse, setBalanceToUse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Only skip verification if current balance usage > 0
    useEffect(() => {
        if (!isOpen) return; // Don't do anything if modal is closed
        
        if (verifiedMemberPhone && currentBalanceUsage && parseFloat(currentBalanceUsage.balanceToUse) > 0) {
            // Only skip verification if current balance usage > 0
            console.log('🔄 Skipping verification - current balance usage:', parseFloat(currentBalanceUsage.balanceToUse));
            const loadVerifiedMember = async () => {
                try {
                    setIsLoading(true);
                    const member = await MemberPaymentAPI.searchMember(verifiedMemberPhone, storeId);
                    setMemberData(member);
                    setPhone(verifiedMemberPhone);
                    setBalanceToUse(currentBalanceUsage.balanceToUse); // Pre-fill current amount
                    setStep('amount'); // Jump directly to amount setting
                } catch (error) {
                    // If search fails, member info may have changed, clear verification state
                    setMemberData(null);
                    onVerifiedPhoneChange(null);
                    setStep('search');
                    showError(t('Member not found') + ' - ' + t('Please search again'));
                } finally {
                    setIsLoading(false);
                }
            };
            loadVerifiedMember();
        } else {
            // Only reset to search step when modal first opens
            // Don't reset during verification process or after successful verification
            if (step !== 'verify' && step !== 'amount') {
                console.log('🔍 Starting from search - no current balance usage or usage is 0');
                setStep('search');
            } else {
                console.log('🔒 Preserving current step:', step, '- not resetting');
            }
        }
    }, [isOpen, currentBalanceUsage, storeId]); // Removed verifiedMemberPhone from dependencies

    // Reset state
    const resetState = () => {
        setStep('search');
        setPhone('');
        setVerifyCode('');
        setMemberData(null);
        setBalanceToUse('');
        setIsLoading(false);
        setError('');
    };

    // Show error
    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(''), 3000);
    };

    // Search member
    const searchMember = async () => {
        if (!phone.trim()) {
            showError(t('Please enter phone number'));
            return;
        }

        // If searched phone number differs from verified one, clear verification state
        if (verifiedMemberPhone && phone.trim() !== verifiedMemberPhone) {
            onVerifiedPhoneChange(null);
        }

        setIsLoading(true);
        try {
            const member = await MemberPaymentAPI.searchMember(phone.trim(), storeId);
            setMemberData(member);
            setStep('member_info'); // Show member info first
        } catch (error) {
            // Reset states on search failure
            setMemberData(null);
            setStep('search');
            showError(error.message || t('Member not found'));
        } finally {
            setIsLoading(false);
        }
    };

    // Send verification code
    const sendVerificationCode = async () => {
        setIsLoading(true);
        try {
            const requestCode = firebase.functions().httpsCallable('requestVerificationCode');
            await requestCode({ phone: memberData.phone, purpose: 'confirm_payment' });
            setStep('verify');
        } catch (error) {
            showError(error.message || t('Failed to send verification code'));
        } finally {
            setIsLoading(false);
        }
    };

    // Verify identity (simplified version, supports 1111 test code)
    const verifyIdentity = async () => {
        if (!verifyCode.trim()) {
            showError(t('Please enter verification code'));
            return;
        }

        // Test code 1111 passes directly
        if (verifyCode.trim() === '1111') {
            console.log('✅ Test code 1111 verified, moving to amount step');
            // Save verification state
            onVerifiedPhoneChange(memberData.phone);
            setStep('amount');
            return;
        }

        setIsLoading(true);
        try {
            // Validate verification code
            const validate = firebase.functions().httpsCallable('validateVerificationCode');
            await validate({ 
                phone: memberData.phone, 
                code: verifyCode.trim(), 
                purpose: 'confirm_payment' 
            });

            console.log('✅ SMS verification successful, moving to amount step');
            // Save verification state
            onVerifiedPhoneChange(memberData.phone);
            setStep('amount');
        } catch (error) {
            showError(error.message || t('Invalid verification code'));
        } finally {
            setIsLoading(false);
        }
    };

    // Confirm balance usage (no deduction, record only)
    const confirmBalanceUsage = () => {
        const amount = parseFloat(balanceToUse);
        if (!amount || amount <= 0) {
            showError(t('Please enter valid amount'));
            return;
        }

        if (amount > memberData.balance) {
            showError(t('Insufficient balance'));
            return;
        }

        // Only return balance usage info, no deduction
        const balanceUsageData = {
            memberPhone: memberData.phone,
            memberName: memberData.name || 'Member',
            balanceToUse: amount,
            memberBalance: memberData.balance,
            type: 'balance_usage' // Identify this as balance usage, not actual payment
        };

        onPaymentComplete(balanceUsageData);
        onClose();
        resetState();
    };

    // Close modal
    const handleClose = () => {
        onClose();
        resetState();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                {/* Header */}
                <div className="bg-white text-black px-6 py-4 rounded-t-lg relative border-b">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-black hover:text-gray-600"
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                    <h2 className="text-lg font-semibold text-black">{t('Member Balance Payment')}</h2>
                    <p className="text-gray-600 text-sm">
                        {step === 'search' ? t('Enter phone number') : 
                         step === 'member_info' ? t('Member Information') : 
                         step === 'verify' ? t('Enter verification code') : 
                         t('Enter amount to use')}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm text-center">
                            ❌ {error}
                        </div>
                    )}

                    {/* Step 1: Search Member */}
                    {step === 'search' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Phone Number')}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('Enter phone number')}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                onClick={searchMember}
                                disabled={isLoading || !phone.trim()}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                    isLoading || !phone.trim()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isLoading ? t('Searching') + '...' : t('Search Member')}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Member Information */}
                    {step === 'member_info' && (!memberData && !isLoading) && (
                        <div className="text-center py-8">
                            <div className="text-gray-500">
                                <p>{t('No member data available')}</p>
                                <button
                                    onClick={() => setStep('search')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    ← {t('Back to Search')}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {step === 'member_info' && isLoading && (
                        <div className="text-center py-8">
                            <div className="text-gray-500">
                                <div className="animate-pulse">
                                    <p>{t('Loading member information')}...</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {step === 'member_info' && memberData && !isLoading && (
                        <div className="space-y-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <h3 className="text-lg font-semibold text-green-800">{memberData.name}</h3>
                                <p className="text-sm text-gray-600 notranslate mt-1">{memberData.phone}</p>
                                <div className="mt-3">
                                    <p className="text-lg font-bold text-green-600">
                                        {t('Available Balance')}: <span className="notranslate">${memberData.balance?.toFixed(2)}</span>
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        {t('Order Total')}: <span className="notranslate">${totalAmount?.toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-center text-sm text-gray-600">
                                <p>{t('Do you want to use balance for this order?')}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setStep('search')}
                                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        disabled={isLoading}
                                    >
                                        ← {t('Back')}
                                    </button>
                                    <button
                                        onClick={sendVerificationCode}
                                        disabled={isLoading}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                            isLoading
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {isLoading ? t('Sending') + '...' : t('Send Code')}
                                    </button>
                                </div>
                                
                                {/* Test direct verify button */}
                                <button
                                    onClick={() => setStep('verify')}
                                    className="w-full py-2 px-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg hover:bg-yellow-100 text-sm"
                                    disabled={isLoading}
                                >
                                    🧪 {t('Direct Verify (Test)')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Verify Identity */}
                    {step === 'verify' && memberData && (
                        <div className="space-y-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <h3 className="font-medium">{memberData.name}</h3>
                                <p className="text-sm text-gray-600 notranslate">{memberData.phone}</p>
                                <p className="text-sm text-green-600">{t('Balance')}: <span className="notranslate">${memberData.balance?.toFixed(2)}</span></p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Verification Code')}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('Enter verification code')}
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setStep('member_info')}
                                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={isLoading}
                                >
                                    ← {t('Back')}
                                </button>
                                <button
                                    onClick={verifyIdentity}
                                    disabled={isLoading || !verifyCode.trim()}
                                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                        isLoading || !verifyCode.trim()
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {isLoading ? t('Verifying') + '...' : t('Verify')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Enter Amount */}
                    {step === 'amount' && memberData && (
                        <div className="space-y-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <h3 className="font-medium">{memberData.name}</h3>
                                <p className="text-sm text-green-600">{t('Available Balance')}: <span className="notranslate">${memberData.balance?.toFixed(2)}</span></p>
                                <p className="text-sm text-blue-600">{t('Order Total')}: <span className="notranslate">${totalAmount?.toFixed(2)}</span></p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('Amount to Use')}
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={balanceToUse}
                                        onChange={(e) => setBalanceToUse(e.target.value)}
                                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 notranslate"
                                        disabled={isLoading}
                                        step="0.01"
                                        min="0"
                                        max={Math.min(memberData.balance, totalAmount)}
                                    />
                                    <button
                                        onClick={() => setBalanceToUse(Math.min(memberData.balance, totalAmount).toString())}
                                        className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                                        disabled={isLoading}
                                    >
                                        {t('Use Max')}
                                    </button>
                                </div>
                                {parseFloat(balanceToUse) > 0 && (
                                    <div className="mt-2 text-sm">
                                        <p className="text-gray-600">
                                            {parseFloat(balanceToUse) >= totalAmount ? (
                                                <span className="text-green-600">✅ {t('Full payment with balance')}</span>
                                            ) : (
                                                <span className="text-orange-600">⚡ {t('Mixed payment')} - {t('Still need')}: <span className="notranslate">${(totalAmount - parseFloat(balanceToUse)).toFixed(2)}</span></span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setStep('verify')}
                                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        disabled={isLoading}
                                    >
                                        ← {t('Back')}
                                    </button>
                                    <button
                                        onClick={confirmBalanceUsage}
                                        disabled={isLoading || !balanceToUse || parseFloat(balanceToUse) <= 0}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                            isLoading || !balanceToUse || parseFloat(balanceToUse) <= 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {isLoading ? t('Processing') + '...' : t('Confirm Use Balance')}
                                    </button>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                                    disabled={isLoading}
                                >
                                    {t('Cancel and use other payment')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimpleMemberPayment;