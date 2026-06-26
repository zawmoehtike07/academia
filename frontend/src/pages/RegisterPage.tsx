import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authApi.register({ username, email, password });
      login({ username: response.username, email: response.email }, response.token);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4 text-slate-900">
      <div className="bg-white p-8 rounded shadow-sm w-full max-w-[400px]">
        <h2 className="text-[28px] font-bold text-center text-[#0f766e] mb-6">Register</h2>
        
        {error && (
          <div className="bg-[#FFEAEA] text-[#B91C1C] p-4 mb-6 rounded text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#475569] mb-1">Username</label>
            <input 
              type="text" 
              className="w-full border border-gray-200 rounded px-3 py-2.5 focus:outline-none focus:border-teal-500 transition text-slate-900 bg-white"
              value={username} onChange={(e) => setUsername(e.target.value)} required 
              placeholder="testuser"
            />
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-200 rounded px-3 py-2.5 focus:outline-none focus:border-teal-500 transition text-slate-900 bg-white"
              value={email} onChange={(e) => setEmail(e.target.value)} required 
              placeholder="testuser@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border border-gray-200 rounded px-3 py-2.5 focus:outline-none focus:border-teal-500 transition tracking-widest text-slate-900 bg-white"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
              placeholder="••••••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-[#0f766e] text-white py-2.5 rounded font-medium mt-2 hover:bg-teal-800 transition">
            Register
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-[#475569]">
          Already have an account? <Link to="/login" className="text-[#0f766e] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
