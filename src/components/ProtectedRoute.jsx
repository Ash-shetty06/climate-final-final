import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';

const ProtectedRoute = ({ children, role }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (role) {
        const user = getCurrentUser();
        if (user.role !== role) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
