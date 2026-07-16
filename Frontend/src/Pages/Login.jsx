import { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContextValue';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                const data = await login(email, password);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            } else {
                const data = await verifyOTP(email, otp);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setError('Account not verified. A new OTP has been sent to your email.');
            } else {
                setError(err.message || err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-700">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400">Sign in to your SparkSpire account</p>
            </div>

            {error && <div className="bg-red-950/30 text-red-600 p-3 rounded-lg mb-6 text-center shadow-inner border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {!showOTP ? (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Verification Code (OTP)</label>
                        <input
                            type="text"
                            required
                            placeholder="6-digit code"
                            className="w-full px-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-slate-500 transition shadow-sm font-bold tracking-widest text-center text-lg"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                        />
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-950 text-white font-bold py-3 rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition shadow-md"
                >
                    {loading ? 'Processing...' : (showOTP ? 'Verify OTP & Log In' : 'Sign In')}
                </button>
            </form>

            <p className="text-center mt-8 text-slate-400">
                Don't have an account? <Link to="/register" className="text-white font-bold hover:underline">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
