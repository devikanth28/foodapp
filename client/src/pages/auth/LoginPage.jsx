import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate         = useNavigate();
  const { login }        = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [hint, setHint]             = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const switchToRegister = () => {
    setIsRegister(true);
    setHint('');
  };

  const switchToLogin = () => {
    setIsRegister(false);
    setHint('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHint('');
    try {
      if (isRegister) {
        const { data } = await authAPI.register({
          name: form.name, email: form.email,
          password: form.password, phone: form.phone,
        });
        login(data.user, data.token);
        toast.success(`Welcome, ${data.user.name}! 🎉`);
        navigate('/');
      } else {
        const { data } = await authAPI.login({ email: form.email, password: form.password });
        login(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        // Wrong email or password — guide them to register if not registered
        toast.error('Incorrect email or password.');
        if (!isRegister) setHint('not_registered');
      } else if (status === 400 && message?.includes('already registered')) {
        // Tried to register with existing email — switch to login
        toast.error('This email is already registered.');
        setHint('already_registered');
        setIsRegister(false);
      } else {
        toast.error(message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 text-white p-3 rounded-full mb-3">
            <UtensilsCrossed size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FoodApp</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={switchToLogin}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
              ${!isRegister ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button
            onClick={switchToRegister}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
              ${isRegister ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}
          >
            Register
          </button>
        </div>

        {/* Hint banners */}
        {hint === 'not_registered' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 text-sm">
            <p className="text-orange-700">
              Looks like you don't have an account.{' '}
              <button onClick={switchToRegister} className="font-bold underline">
                Register here
              </button>
            </p>
          </div>
        )}
        {hint === 'already_registered' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-sm">
            <p className="text-blue-700">
              This email is already registered. Please sign in below.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              name="name" type="text" placeholder="Full Name"
              value={form.name} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}

          <input
            name="email" type="email" placeholder="Email address"
            value={form.email} onChange={handleChange} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <input
            name="password" type="password"
            placeholder={isRegister ? 'Create a password' : 'Enter your password'}
            value={form.password} onChange={handleChange} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {isRegister && (
            <input
              name="phone" type="tel" placeholder="Phone number (optional)"
              value={form.phone} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold
                       py-3 rounded-xl transition disabled:opacity-50 text-sm"
          >
            {loading
              ? 'Please wait...'
              : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Bottom toggle */}
        <p className="text-center text-sm text-gray-500 mt-5">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={isRegister ? switchToLogin : switchToRegister}
            className="text-orange-500 font-semibold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;