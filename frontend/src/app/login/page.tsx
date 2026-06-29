'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, AlertCircle, Loader2, ArrowLeft, KeyRound, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillCredentials = (role: 'admin' | 'supervisor' | 'client') => {
    if (role === 'admin') {
      setEmail('admin@electrical.com');
      setPassword('admin123');
    } else if (role === 'supervisor') {
      setEmail('supervisor1@electrical.com');
      setPassword('super123');
    } else if (role === 'client') {
      setEmail('client1@jio.com');
      setPassword('client123');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      {/* Background glow radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Website</span>
        </Link>

        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">VoltFlow Portal</h1>
            <span className="text-xs text-slate-400 block -mt-1">Contractor ERP & Operations Dashboard</span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 sm:px-10 rounded-2xl shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl flex items-start space-x-3 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@electrical.com"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase text-slate-400">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick autofill test section */}
          <div className="mt-8 border-t border-slate-850 pt-6">
            <span className="text-xs font-bold uppercase text-slate-400 block mb-3 text-center">
              Evaluator Test Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => autofillCredentials('admin')}
                className="py-2 px-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg transition-all"
              >
                Admin
              </button>
              <button
                onClick={() => autofillCredentials('supervisor')}
                className="py-2 px-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg transition-all"
              >
                Supervisor
              </button>
              <button
                onClick={() => autofillCredentials('client')}
                className="py-2 px-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg transition-all"
              >
                Client
              </button>
            </div>
            <div className="mt-4 text-[10px] text-slate-500 text-center font-light leading-relaxed">
              Autofills demo logins (Admin handles all modules; Supervisor tracks field projects; Client views billing/history).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
