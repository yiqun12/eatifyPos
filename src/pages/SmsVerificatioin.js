import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import { FaTimes } from 'react-icons/fa';

const PhoneVerificationPopup = ({ isOpen, onClose, onVerificationSuccess, users, purpose }) => {
    const [selectedPhone, setSelectedPhone] = useState(users.length > 0 ? users[0].phonenumber : '');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeRequested, setIsCodeRequested] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // 消息状态

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000); // 3 秒后清除消息
    };

    const requestVerificationCode = async () => {
        if (!selectedPhone) {
            showMessage('Please select a phone number.', 'error');
            return;
        }

        try {
            const requestCode = firebase.functions().httpsCallable('requestVerificationCode');
            await requestCode({ phone: selectedPhone, purpose });
            setIsCodeRequested(true);
            showMessage('Verification code sent successfully!', 'success');
        } catch (error) {
            console.error('Error requesting code:', error);
            showMessage(error.message || 'Failed to send verification code. Please try again.', 'error');
        }
    };

    const validateCode = async () => {
        if (!verificationCode) {
            showMessage('Please enter the verification code.', 'error');
            return;
        }

        try {
            const validate = firebase.functions().httpsCallable('validateVerificationCode');
            await validate({ phone: selectedPhone, code: verificationCode, purpose });
            showMessage('Verification successful!', 'success');

            setTimeout(() => {
                onVerificationSuccess(); // 通知父组件
                onClose(); // 关闭弹窗
            }, 1500);
        } catch (error) {
            console.error('Error validating code:', error);
            showMessage(error.message || 'Invalid verification code.', 'error');
        }
    };

    if (!isOpen) return null; // `isOpen` 为 false 时不渲染

    return (
        <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                {/* 关闭按钮 */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <FaTimes size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center">Phone Verification</h2>

                {/* 消息提示框 */}
                {message.text && (
                    <div className={`text-center p-2 mb-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* 使用单选框（Radio Button）选择手机号 */}
                <div className="mb-4">
                    <p className="text-gray-700 font-medium mb-2">Select a phone number:</p>
                    {users.map((user) => (
                        <label key={user.phonenumber} className="flex items-center space-x-2 p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100">
                            <input
                                type="radio"
                                name="selectedPhone"
                                value={user.phonenumber}
                                checked={selectedPhone === user.phonenumber}
                                onChange={() => setSelectedPhone(user.phonenumber)}
                                className="form-radio text-blue-600 w-12 p-2 border rounded"

                            />
                            <span className='notranslate'>{user.username} - {user.phonenumber}</span>
                        </label>
                    ))}
                </div>

                <button
                    onClick={requestVerificationCode}
                    className="w-full bg-blue-500 text-white py-2 rounded mb-4"
                >
                    Request Verification Code
                </button>

                {isCodeRequested && (
                    <div>
                        <input
                            type="text"
                            placeholder="Enter verification code"
                            className="w-full p-2 border rounded mb-2"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <button
                            onClick={validateCode}
                            className="w-full bg-green-500 text-white py-2 rounded"
                        >
                            Verify Code
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneVerificationPopup;
