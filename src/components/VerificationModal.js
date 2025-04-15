import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/index';
import bcrypt from 'bcryptjs';

const VerificationModal = ({ isOpen, onClose, storeId, userId, onVerify }) => {
  const [adminPasswordHash, setAdminPasswordHash] = useState(null);
  const [employeePasswordHash, setEmployeePasswordHash] = useState(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHashes = async () => {
      if (!isOpen) return; // Don't fetch if modal is not open
      // Reset state when modal opens
      setError('');
      setEnteredPassword('');

      if (!storeId || !userId) {
        setError("Store ID or User ID is missing. Cannot verify password.");
        setAdminPasswordHash(null);
        setEmployeePasswordHash(null);
        return;
      }

      setIsLoading(true);
      try {
        const docRef = doc(db, "stripe_customers", userId, "TitleLogoNameContent", storeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAdminPasswordHash(docSnap.data().adminPasswordHash || null);
          setEmployeePasswordHash(docSnap.data().employeePasswordHash || null);
        } else {
          // Document doesn't exist, treat as no hashes set
          setAdminPasswordHash(null);
          setEmployeePasswordHash(null);
          console.log("Store document not found for password verification.");
        }
      } catch (err) {
        console.error("Error fetching password hashes:", err);
        setError("Could not fetch verification data. Please try again.");
        setAdminPasswordHash(null); // Reset on error
        setEmployeePasswordHash(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Reset state and fetch hashes when modal opens
    if (isOpen) {
      console.log(789789)
      fetchHashes(); // Fetch hashes when modal becomes visible
    }
  }, [isOpen, storeId, userId]); // Dependencies ensure fetch runs when these change while modal is open

  const handleVerify = async (e) => {
    e.preventDefault();
    // Verification logic will go here
    if (!enteredPassword) {
        setError("Please enter a password.");
        return;
    }
    setError('');
    setIsLoading(true);

    try {
        let isAdmin = false;
        if (adminPasswordHash) {
            isAdmin = await bcrypt.compare(enteredPassword, adminPasswordHash);
        }

        if (isAdmin) {
            onVerify('admin');
            onClose(); // Close modal on success
            return;
        }

        // If not admin, check if employee
        let isEmployee = false;
        if (employeePasswordHash) {
            isEmployee = await bcrypt.compare(enteredPassword, employeePasswordHash);
        }

        if (isEmployee) {
            onVerify('employee');
            onClose(); // Close modal on success
            return;
        }

        // If neither matched
        setError("Invalid password.");
        onVerify('invalid'); // Inform parent, but don't close modal

    } catch (err) {
        console.error("Error during password verification:", err);
        setError("An error occurred during verification. Please try again.");
        onVerify('invalid'); // Inform parent on error
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    // Apply inline style for semi-transparent background
    <div 
      className="fixed inset-0 overflow-y-auto h-full w-full z-[9998] flex justify-center items-center"
      style={{ backgroundColor: 'rgba(107, 114, 128, 0.75)' }} // Use gray-600 equivalent with 75% opacity
    >
      <div className="relative mx-auto p-6 border w-full max-w-sm shadow-xl rounded-lg bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 text-center">Enter Password for Verification</h3>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label htmlFor="verificationPassword" className="sr-only">Password</label>
            <input
              type="password"
              id="verificationPassword"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
            />
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={onClose} // Use the passed onClose prop
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationModal; 