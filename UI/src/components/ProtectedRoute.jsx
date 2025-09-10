import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');

    console.log('Protected Route Check:', {
        isLoggedIn,
        userRole,
        allowedRoles
    });
    if (!isLoggedIn) {
        console.log('User not logged in, redirecting to home');
        return <Navigate to="/" />;
    }
    if (!allowedRoles.includes(userRole)) {
        console.log('User role not authorized, redirecting to home');
        return <Navigate to="/" />;
    }
    return children;
};

export default ProtectedRoute;

