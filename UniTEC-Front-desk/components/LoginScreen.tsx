
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { BusinessConfig } from '../types';
import { loginWithCredentials, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface LoginScreenProps {
  config: BusinessConfig;
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onLogin();
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await loginWithCredentials(email, password);
    } catch (err: any) {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
        <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 bg-brand-900 rounded-2xl flex items-center justify-center text-accent-500 mb-4 shadow-lg">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Admin Secure Access</h2>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Management Controls Required</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold uppercase text-center rounded-xl flex items-center justify-center gap-2">
                        <Lock size={12} /> {error}
                    </div>
                )}
                <div className="space-y-3 pb-2">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Admin Email" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        required
                    />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                    {isLoading ? 'Authenticating...' : 'Sign in'}
                </button>
            </form>
        </div>
        <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">© UNITEC USA DESIGN • SECURE GATEWAY</p>
    </div>
  );
};

export default LoginScreen;
