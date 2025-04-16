import React, { useState, useEffect } from 'react';

const EmailVerificationModal = ({
  isOpen,
  onClose,
  email, // Email address where the code was sent
  onSubmit, // Function to call when user submits the code
  isLoading, // Loading state for the submission process
  error, // Error message to display
  success, // Success message (e.g., "Code sent successfully")
}) => {
  const [codeInput, setCodeInput] = useState('');

  // Reset input when modal opens/closes or relevant props change
  useEffect(() => {
    if (isOpen) {
      setCodeInput(''); // Clear input when modal opens
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading && codeInput.length === 6) {
      onSubmit(codeInput); // Pass the entered code to the onSubmit handler
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto h-full w-full z-[9998] flex justify-center items-center"
      style={{ backgroundColor: 'rgba(107, 114, 128, 0.75)' }} // Semi-transparent background
    >
      <div className="relative mx-auto p-6 border w-full max-w-sm shadow-xl rounded-lg bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 text-center">Enter Verification Code</h3>

        {success && <div className="mb-3 p-2 bg-blue-100 text-blue-700 rounded text-sm text-center">{success}</div>}
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}

        <p className="text-sm text-gray-600 mb-3 text-center">
          A verification code was sent to <strong className="font-medium">{email || 'your email'}</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="verificationCodeInputModal" className="sr-only">Verification Code</label>
            <input
              type="text"
              inputMode="numeric" // Hint for numeric keyboard on mobile
              id="verificationCodeInputModal"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, ''))} // Allow only digits
              required
              maxLength="6"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg tracking-widest" // Centered, larger font, letter spacing
              placeholder="------" // Placeholder for 6 digits
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || codeInput.length !== 6}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-blue-300"
            >
              {isLoading ? 'Verifying & Saving...' : 'Verify & Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationModal; 