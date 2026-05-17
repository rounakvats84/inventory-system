import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Admin' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    try {
      const res = await api.post(endpoint, formData);
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {isRegister ? 'Create an account' : 'Sign in to SmartInv'}
        </h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="glass-panel py-8 px-4 sm:rounded-2xl sm:px-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300">Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    className="block w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  className="block w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  className="block w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            
            {isRegister && (
               <div>
                 <label className="block text-sm font-medium text-slate-300">Role</label>
                 <select 
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                 >
                    <option value="Admin" className="bg-slate-800">Admin</option>
                    <option value="Customer" className="bg-slate-800">Customer</option>
                 </select>
               </div>
            )}

            {error && <p className="text-rose-400 text-sm text-center font-bold bg-rose-500/10 border border-rose-500/20 py-2.5 rounded-xl">{error}</p>}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 text-sm font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all transform hover:scale-[1.02]"
              >
                {isRegister ? 'Register' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm relative">
             <button 
                type="button" 
                onClick={() => setIsRegister(!isRegister)}
                className="text-slate-400 py-1 transition-colors hover:text-indigo-400 font-medium"
             >
                {isRegister ? 'Already have an account? Sign In.' : "Don't have an account? Register."}
             </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
