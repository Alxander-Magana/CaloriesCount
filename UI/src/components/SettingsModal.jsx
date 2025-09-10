import React, { useState } from 'react';
import { X, Moon, Sun, Eye as EyeIcon, EyeOff as EyeOffIcon} from 'lucide-react';
import { useDarkMode } from './DarkModeProvider';

const SettingsModal = ({ isOpen, onClose }) => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            console.log('Attempting to update password for user:', userId);
            const response = await fetch(`http://localhost:5173/api/users/${userId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update password');
            }

            setSuccess('Password updated successfully');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative z-10">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {isDarkMode ? (
                                    <Sun size={20} className="text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Moon size={20} className="text-gray-600 dark:text-gray-300" />
                                )}
                                <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isDarkMode}
                                    onChange={toggleDarkMode}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* Password Change Form */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                            {success && <div className="text-green-500 text-sm mb-4">{success}</div>}
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showOldPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showNewPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        >
                                            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
