import { useState } from 'react';
import api from '../Utils/axios';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            return null;
        }
    });

    const login = async (email, password) => {
        try { 
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            if (error.response?.data?.needsVerification) throw error.response.data;
            throw error.response?.data?.message || 'Login failed';
        }
    };

const register = async (userName, email, password) => {
   try{ const { data } = await api.post('/auth/registration', {
        userName,
        email,
        password,
    });
            return data; // Returns { message, email 
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verifyOtp', { email, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'OTP verification failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOTP, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
