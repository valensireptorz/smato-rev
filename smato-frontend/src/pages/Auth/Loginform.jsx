import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Moon, Sun, User, Lock, Sparkles } from 'lucide-react';
import './Loginform.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const navigate = useNavigate();

    // Initialize dark mode from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(savedTheme ? savedTheme === 'dark' : systemPrefersDark);
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/loginFE', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Simpan data ke sessionStorage
                sessionStorage.setItem('userId', data.userId);
                sessionStorage.setItem('level', data.level);
                sessionStorage.setItem('username', data.username || '');
                sessionStorage.setItem('foto_users', data.foto_users || '');

                // Redirect berdasarkan level pengguna
                if (data.level === 'guru') {
                    navigate('/Users/mega');
                } else if (data.level === 'admin') {
                    navigate('/dashboard-admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setErrorMessage(data.message || 'Login gagal. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Terjadi kesalahan koneksi. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`login-premium-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="login-premium-background">
                
                {/* Animated Background Elements */}
                <div className="bg-elements">
                    <div className="bg-element bg-element-1"></div>
                    <div className="bg-element bg-element-2"></div>
                    <div className="bg-element bg-element-3"></div>
                </div>

                {/* Floating Particles */}
                <div className="floating-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}></div>
                    ))}
                </div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="theme-toggle"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Main Login Container */}
                <div className="login-card-wrapper">
                    
                    {/* Premium Badge */}
                    <div className="premium-badge">
                        ✨ AKSES GURU
                    </div>
                    
                    {/* Glassmorphism Card */}
                    <div className="login-card">
                        
                        {/* Premium Glow Effect */}
                        <div className="card-glow"></div>
                        
                        <div className="card-content">
                            {/* Header with Premium Icon */}
                            <div className="login-header">
                                <div className="premium-icon">
                                    <Sparkles size={24} />
                                </div>
                                <h1 className="login-title">Selamat Datang,</h1>
                                <p className="login-subtitle">Sign in to your teacher account</p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="login-form">
                                
                                {/* Username Field */}
                                <div className="input-group">
                                    <div className={`input-icon ${focusedField === 'username' ? 'focused' : ''}`}>
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField('')}
                                        required
                                        disabled={isLoading}
                                        placeholder="Enter your username"
                                        className={`premium-input ${focusedField === 'username' ? 'focused' : ''}`}
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="input-group">
                                    <div className={`input-icon ${focusedField === 'password' ? 'focused' : ''}`}>
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        required
                                        disabled={isLoading}
                                        placeholder="Enter your password"
                                        className={`premium-input ${focusedField === 'password' ? 'focused' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="error-message">
                                        <p>{errorMessage}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`premium-button ${isLoading ? 'loading' : ''}`}
                                >
                                    {isLoading ? (
                                        <div className="loading-content">
                                            <div className="loading-spinner"></div>
                                            <span>Signing In...</span>
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                {/* Additional Options */}
                                <div className="login-options">
                                    {/* <a href="#" className="forgot-password">
                                        Forgot your password?
                                    </a>
                                    
                                    <div className="signup-link">
                                        Don't have an account? 
                                        <a href="#" className="signup-link-text">Sign up now</a>
                                    </div> */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;