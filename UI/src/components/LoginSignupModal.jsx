import React, { useState } from 'react';
import { X } from 'lucide-react';

const LoginSignupModal = ({ isOpen, onClose, onSuccessfulLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [userID, setUserId] = useState(null);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [resetUsername, setResetUsername] = useState('');
    const [resetRequested, setResetRequested] = useState(false);

    // New state variables for OTP handling
    const [requireOTP, setRequireOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpUsername, setOtpUsername] = useState('');

    if (!isOpen) return null;

    const resetModalState = () => {
        setUsername('');
        setPassword('');
        setEmail('');
        setError(null);
        setMessage(null);
        setRequireOTP(false);
        setOtp('');
        setOtpUsername('');
        setIsLogin(true);
        setShowPasswordReset(false);
        setResetUsername('');
        setResetRequested(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            resetModalState();
            onClose();
        }
    };

    // Handle form submission prevention
    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (requireOTP) {
            handleVerifyOTP();
        } else if (isLogin) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    const handleRegister = async () => {
        try {
            const response = await fetch('http://localhost:5173/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Response Data:', data);

                if (data.message) {
                    setMessage(data.message);
                    setError(null);

                    setTimeout(() => {
                        setIsLogin(true);
                        setMessage(null);
                    }, 2000);
                } else {
                    setError('Unexpected error occurred.');
                }
            } else {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                setError('An error occurred while registering. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while registering. Please try again.');
        }
    };

    // Modified login handler to check for OTP requirements
    const handleLogin = async () => {
        try {
            setError(null);
            setMessage("Logging in...");

            const response = await fetch('http://localhost:5173/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.requireOTP) {
                // Server requires OTP verification
                setMessage(data.message || "Please enter the verification code");
                setRequireOTP(true);
                setOtpUsername(data.username);
                setError(null);
            } else if (data.message) {
                // Regular login success (should not happen with OTP implementation)
                setMessage(data.message);
                setUserId(data.user.userid);
                onSuccessfulLogin(username, data.user.userid, data.user.role);
                setTimeout(() => {
                    resetModalState();
                    onClose();
                }, 1000);
            } else if (data.error) {
                setError(data.error);
                setMessage(null);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred while logging in. Please try again.');
            setMessage(null);
        }
    };

    // New handler for OTP verification
    const handleVerifyOTP = async () => {
        if (!otp) {
            setError('Please enter the verification code');
            return;
        }

        try {
            setError(null);
            setMessage("Verifying code...");

            const response = await fetch('http://localhost:5173/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: otpUsername,
                    otp: otp
                }),
            });

            const data = await response.json();

            if (data.message && data.user) {
                // OTP verification successful
                setMessage(data.message);
                setUserId(data.user.userid);
                onSuccessfulLogin(data.user.username, data.user.userid, data.user.role);
                setTimeout(() => {
                    resetModalState();
                    onClose();
                }, 1000);
            } else if (data.error) {
                setError(data.error);
                setMessage(null);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred during verification. Please try again.');
            setMessage(null);
        }
    };

    // Go back to login from OTP screen
    const goBackToLogin = () => {
        if (requireOTP) {
            setRequireOTP(false);
            setOtp('');
            setOtpUsername('');
        } else {
            setShowPasswordReset(false);
            setResetRequested(false);
            setResetUsername('');
        }
        setError(null);
        setMessage(null);
    };

    const handlePasswordResetRequest = async () => {
        if (!resetUsername) {
            setError('Please enter your username');
            return;
        }

        try {
            setError(null);
            setMessage("Checking username...");

            const response = await fetch('http://localhost:8080/api/users/get-email-by-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: resetUsername }),
            });

            setMessage(null);

            if (response.ok) {
                const data = await response.json();
                setResetRequested(true);
                setError(null);
                setMessage(`Email found: ${data.email}`);
            } else {
                try {
                    const errorData = await response.json();
                    setError(errorData.error || 'Username not found');
                } catch (e) {
                    setError('Failed to process response from server');
                }
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Connection error. Please check if the server is running.');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg w-[400px] max-w-[90%] p-6 relative"
                 onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => {
                        resetModalState();
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                    <X size={24}/>
                </button>

                {requireOTP ? (
                    // OTP Verification UI
                    <>
                        <h2 className="text-xl font-bold text-center mb-6 border-b pb-3">Two-Factor Authentication</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-6">
                                <p className="text-gray-600 mb-4">
                                    A verification code has been generated for your account. Please enter the 6-digit code to continue. It can be found in the server's logs.
                                </p>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                                    Verification Code
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    className="text-gray-600 hover:text-gray-900"
                                    onClick={goBackToLogin}
                                >
                                    Back to Login
                                </button>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={handleVerifyOTP}
                                >
                                    Verify
                                </button>
                            </div>
                            {message && <p className="text-green-600 mt-2">{message}</p>}
                            {error && <p className="text-red-600 mt-2">{error}</p>}
                        </form>
                    </>
                ) : !showPasswordReset ? (
                    <>
                        {/* Tab Switcher */}
                        <div className="flex mb-6 border-b">
                            <button
                                className={`py-2 px-4 ${isLogin ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            <button
                                className={`py-2 px-4 ${!isLogin ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Login Form */}
                        {isLogin ? (
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                        Username
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="username"
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                        id="password"
                                        type="password"
                                        placeholder="******************"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <p
                                        className="text-sm text-blue-500 hover:underline cursor-pointer"
                                        onClick={() => setShowPasswordReset(true)}
                                    >
                                        Forgot your password?
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        onClick={handleLogin}
                                    >
                                        Sign In
                                    </button>
                                </div>
                                {message && <p className="text-green-600 mt-2">{message}</p>}
                                {error && <p className="text-red-600 mt-2">{error}</p>}
                            </form>
                        ) : (
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                        Username
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="username"
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="password"
                                        type="password"
                                        placeholder="******************"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRegister();
                                        }}
                                    >
                                        Create Account
                                    </button>
                                </div>
                                {message && <p className="text-green-600 mt-2">{message}</p>}
                                {error && <p className="text-red-600 mt-2">{error}</p>}
                            </form>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-center mb-6 border-b pb-3">Password Reset</h2>

                        {!resetRequested ? (
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-6">
                                    <p className="text-gray-600 mb-4">
                                        Enter your username and we'll send a password reset link to your registered email address.
                                    </p>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="resetUsername">
                                        Username
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="resetUsername"
                                        type="text"
                                        placeholder="Username"
                                        value={resetUsername}
                                        onChange={(e) => setResetUsername(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        className="text-gray-600 hover:text-gray-900"
                                        onClick={goBackToLogin}
                                    >
                                        Back to Login
                                    </button>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        onClick={handlePasswordResetRequest}
                                    >
                                        Send Reset Link
                                    </button>
                                </div>
                                {message && <p className="text-green-600 mt-2">{message}</p>}
                                {error && <p className="text-red-600 mt-2">{error}</p>}
                            </form>
                        ) : (
                            <div className="text-center">
                                {message && (
                                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                        {message}
                                    </div>
                                )}
                                <p className="text-gray-600 mb-6">
                                    This is just showing the associated email for demonstration purposes.
                                    In a real implementation, a reset link would be sent to this email address.
                                </p>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={goBackToLogin}
                                >
                                    Return to Login
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginSignupModal;