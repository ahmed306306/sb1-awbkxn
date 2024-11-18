import React, { useState } from 'react';
import { getUserByEmail, storeResetCode, verifyResetCode, updatePassword } from '../utils/db';
import { v4 as uuidv4 } from 'uuid';

interface PasswordResetProps {
  onClose: () => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ onClose }) => {
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const user = await getUserByEmail(email);
      if (!user) {
        setError('No account found with this email');
        return;
      }

      const resetCode = uuidv4().slice(0, 6).toUpperCase();
      await storeResetCode(email, resetCode);
      
      // In a real application, you would send this code via email
      // For demo purposes, we'll show it in the UI
      setSuccess(`Reset code: ${resetCode}`);
      setStep('code');
    } catch (err) {
      setError('Failed to process request');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const isValid = await verifyResetCode(email, code);
      if (!isValid) {
        setError('Invalid or expired code');
        return;
      }
      setStep('newPassword');
    } catch (err) {
      setError('Failed to verify code');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await updatePassword(email, newPassword);
      setSuccess('Password updated successfully');
      setTimeout(onClose, 2000);
    } catch (err) {
      setError('Failed to update password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Reset Password</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Send Code
              </button>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Reset Code
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Verify Code
            </button>
          </form>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};