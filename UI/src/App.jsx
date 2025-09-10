import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import UserProfile from './components/UserProfile';
import CaloriePlanPage from './components/CaloriePlanPage';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import FAQPage from './components/FAQPage';
import DarkModeProvider from './components/DarkModeProvider';


const App = () => {
    return (
        <DarkModeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/calorie-plan" element={<CaloriePlanPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminPanel />
                        </ProtectedRoute>
                    }/>
                </Routes>
            </Router>
        </DarkModeProvider>
    );
};

export default App;