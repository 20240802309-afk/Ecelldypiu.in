import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { User, Mail, Lock, Phone, GraduationCap, Calendar, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const BRANCH_OPTIONS = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'Other'];
const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th'];

const Register = () => {
    const { register, currentUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        branch: 'CSE',
        year: '1st',
        agreeTerms: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (currentUser) {
        return <Navigate to="/profile" replace />;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim() || formData.name.trim().length < 2) {
            return 'Full name must be at least 2 characters.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            return 'Please enter a valid email address.';
        }

        if (formData.password.length < 6) {
            return 'Password must be at least 6 characters.';
        }

        if (formData.password !== formData.confirmPassword) {
            return 'Passwords do not match.';
        }

        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return 'Please enter a valid 10-digit phone number.';
        }

        if (!formData.agreeTerms) {
            return 'You must agree to join the E-Cell DYPIU community.';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register(formData.email.trim(), formData.password, {
                name: formData.name.trim(),
                phone: formData.phone.replace(/\D/g, ''),
                branch: formData.branch,
                year: formData.year,
                college: 'DYPIU'
            });

            navigate('/profile', { replace: true });
        } catch (err) {
            console.error('Registration error:', err);
            let userMessage = 'Failed to create account. Please try again.';
            if (err.code === 'auth/email-already-in-use') {
                userMessage = 'This email is already registered. Please log in.';
            } else if (err.code === 'auth/weak-password') {
                userMessage = 'Password is too weak. Please choose a stronger password.';
            } else if (err.code === 'auth/invalid-email') {
                userMessage = 'Invalid email format.';
            }
            setError(userMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 py-16">
            <div className="max-w-xl w-full bg-zinc-900 border-4 border-white p-6 md:p-10 rounded-3xl shadow-[8px_8px_0px_#FFB22C] my-8">
                {/* Logo & Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="flex items-center space-x-3 mb-4 select-none">
                        <img
                            src="/logonew.png"
                            alt="E-Cell DYPIU Logo"
                            className="h-12 w-auto object-contain"
                        />
                        <span className="text-white font-bold text-2xl tracking-wide">
                            ECELL DYPIU
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black uppercase text-white mb-2">
                        Join the <span className="text-brand-yellow">E-Cell Community</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        Become part of India's most driven student entrepreneurs
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-900/40 border-2 border-red-500 text-red-300 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                            Full Name <span className="text-brand-yellow">*</span>
                        </label>
                        <div className="relative">
                            <User className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                autoComplete="name"
                                className="w-full bg-black border-2 border-zinc-700 pl-11 pr-4 py-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                            Email Address <span className="text-brand-yellow">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@dypiu.ac.in"
                                required
                                autoComplete="email"
                                className="w-full bg-black border-2 border-zinc-700 pl-11 pr-4 py-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                            Phone Number <span className="text-brand-yellow">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                required
                                autoComplete="tel"
                                className="w-full bg-black border-2 border-zinc-700 pl-11 pr-4 py-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Branch & Year Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                                Branch <span className="text-brand-yellow">*</span>
                            </label>
                            <div className="relative">
                                <GraduationCap className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className="w-full bg-black border-2 border-zinc-700 pl-11 pr-4 py-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none text-sm appearance-none"
                                >
                                    {BRANCH_OPTIONS.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                                Year of Study <span className="text-brand-yellow">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full bg-black border-2 border-zinc-700 pl-11 pr-4 py-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none text-sm appearance-none"
                                >
                                    {YEAR_OPTIONS.map(y => (
                                        <option key={y} value={y}>{y} Year</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                                Password <span className="text-brand-yellow">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                    className="w-full bg-black border-2 border-zinc-700 pl-11 pr-4 py-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                                Confirm Password <span className="text-brand-yellow">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                    className="w-full bg-black border-2 border-zinc-700 pl-11 pr-4 py-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                required
                                className="mt-1 w-4 h-4 accent-brand-yellow cursor-pointer"
                            />
                            <span className="text-xs text-gray-300 font-medium">
                                I want to join the <strong className="text-white">E-Cell DYPIU</strong> community and agree to participate in entrepreneurial activities.
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-yellow text-black font-black py-4 rounded-xl uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-[4px_4px_0px_#000000]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Create My Account
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-gray-400 text-sm">
                        Already a member?{' '}
                        <Link to="/login" className="text-brand-yellow font-bold uppercase hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
