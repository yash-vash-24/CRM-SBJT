'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  UserCheck, 
  Layers, 
  FileCheck, 
  Receipt, 
  FolderClosed, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Verifying Portal Session...</span>
      </div>
    );
  }

  // Sidebar navigation options with role filters
  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['admin', 'supervisor'] },
    { name: 'Clients (CRM)', path: '/dashboard/clients', icon: <Users className="w-5 h-5" />, roles: ['admin', 'supervisor'] },
    { name: 'Projects', path: '/dashboard/projects', icon: <Briefcase className="w-5 h-5" />, roles: ['admin', 'supervisor', 'client', 'worker'] },
    { name: 'Employees', path: '/dashboard/employees', icon: <UserCheck className="w-5 h-5" />, roles: ['admin', 'supervisor'] },
    { name: 'Inventory', path: '/dashboard/inventory', icon: <Layers className="w-5 h-5" />, roles: ['admin', 'supervisor'] },
    { name: 'Tenders', path: '/dashboard/tenders', icon: <FileCheck className="w-5 h-5" />, roles: ['admin', 'supervisor'] },
    { name: 'Billing (Invoices)', path: '/dashboard/invoices', icon: <Receipt className="w-5 h-5" />, roles: ['admin', 'supervisor', 'client'] },
    { name: 'Documents', path: '/dashboard/documents', icon: <FolderClosed className="w-5 h-5" />, roles: ['admin', 'supervisor', 'client', 'worker'] },
  ];

  // Filter menu items by user role
  const allowedMenuItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-slate-850 flex-shrink-0">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-850 space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">Shree Balaji Traders</span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium">ERP & Project CRM</span>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="p-4 mx-3 my-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="font-bold text-xs text-white block truncate">{user?.name}</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {allowedMenuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-xs font-semibold rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15' 
                    : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <span className={`mr-3 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom Button */}
        <div className="p-4 border-t border-slate-850">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5 mr-3 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header / Navigation */}
        <header className="lg:hidden h-20 bg-slate-900 border-b border-slate-850 flex items-center justify-between px-6 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Shree Balaji Traders</span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">ERP & Project CRM</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 pt-20 bg-slate-950/95 backdrop-blur-sm">
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-slate-900 border border-slate-850 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">{user?.name}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block">{user?.role}</span>
                </div>
              </div>

              <nav className="space-y-1">
                {allowedMenuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3.5 text-sm font-semibold rounded-lg transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center px-4 py-3.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5 mr-3 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
