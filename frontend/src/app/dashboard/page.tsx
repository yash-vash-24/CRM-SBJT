'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Briefcase, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  MapPin, 
  User, 
  ArrowUpRight, 
  FileText, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  FileCheck,
  Building2,
  Phone,
  Mail
import { API_URL } from '@/config/api';

interface DashboardStats {
  projects: { total: number; active: number; completed: number; planning: number };
  finances: { total_revenue: number; collected: number; pending: number };
  inventory: { low_stock_count: number; categories: { category: string; items_count: string; total_quantity: string }[] };
  tenders: { total: number; total_value: number; awarded: number; total_emd: number };
  activities: any[];
  charts: { budgets: any[] };
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client/Worker specific data
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [docsList, setDocsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user?.role === 'admin' || user?.role === 'supervisor') {
          // Fetch analytics dashboard statistics
          const res = await fetch(`${API_URL}/reports/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
          const data = await res.json();
          setStats(data);
        } else {
          // Fetch specific items for client/worker
          const [projRes, invRes, docRes] = await Promise.all([
            fetch(`${API_URL}/projects`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/invoices`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/documents`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);

          if (projRes.ok) setProjectsList(await projRes.json());
          if (invRes.ok && user?.role === 'client') setInvoicesList(await invRes.json());
          if (docRes.ok) setDocsList(await docRes.json());
        }
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Error occurred while loading data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, token, API_URL]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900 rounded-xl"></div>
          <div className="h-96 bg-slate-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400">
        <h3 className="font-bold text-lg">Error loading dashboard</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  // Formatting utility
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Render Admin/Supervisor Dashboard
  if (user?.role === 'admin' || user?.role === 'supervisor') {
    if (!stats) return null;

    // Custom SVG Bar Chart Calculation
    const budgetsData = stats.charts.budgets || [];
    const maxBudget = Math.max(...budgetsData.map(b => parseFloat(b.budget)), 1);

    return (
      <div className="space-y-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Operations Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">Real-time status overview of project budgets, inventory materials, and active tenders.</p>
          </div>
          <div className="flex space-x-3 text-xs font-semibold text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>DB Pool Online</span>
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Projects Managed</span>
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{stats.projects.total}</span>
              <span className="text-xs text-emerald-400 font-semibold">{stats.projects.active} Active</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>{stats.projects.completed} completed, {stats.projects.planning} planning</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Revenue Collected</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white truncate max-w-full">
                {formatCurrency(stats.finances.collected)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center ml-1">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                <span>68% of billed</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-medium">
              Out of {formatCurrency(stats.finances.total_revenue)} total billed
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Outstanding Invoices</span>
              <div className="w-10 h-10 rounded-lg bg-yellow-600/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white truncate max-w-full">
                {formatCurrency(stats.finances.pending)}
              </span>
              {stats.finances.pending > 0 && (
                <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">
                  Pending
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-medium">
              Requires supervisor follow-up
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Low Stock Warnings</span>
              <div className="w-10 h-10 rounded-lg bg-rose-600/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{stats.inventory.low_stock_count}</span>
              {stats.inventory.low_stock_count > 0 ? (
                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-bold animate-pulse">
                  CRITICAL
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-semibold">Stock healthy</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-medium">
              Materials below threshold values
            </div>
          </div>
        </div>

        {/* Charts & Tenders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom SVG Budget Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-white text-sm">Project Budget Allocation</h3>
                <p className="text-[10px] text-slate-400">Top project bids and their implementation progression.</p>
              </div>
              <Link 
                href="/dashboard/projects"
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>View Projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-5 pt-2">
              {budgetsData.map((project, idx) => {
                const percent = (parseFloat(project.budget) / maxBudget) * 100;
                return (
                  <div key={project.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold truncate max-w-[60%]">{project.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 font-semibold">{formatCurrency(parseFloat(project.budget))}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[9px] border border-blue-500/20">
                          {project.progress_percent}%
                        </span>
                      </div>
                    </div>
                    {/* SVG Progress Bar */}
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tender Portfolio Highlights */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm mb-4">Tender Pipeline Summary</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Tenders Submitted</span>
                      <span className="font-bold text-xs text-white block mt-0.5">{stats.tenders.total} bids</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Contracts Awarded</span>
                      <span className="font-bold text-xs text-white block mt-0.5">{stats.tenders.awarded} won</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Win Pipeline</span>
                      <span className="font-bold text-xs text-white block mt-0.5">{formatCurrency(stats.tenders.total_value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link 
              href="/dashboard/tenders"
              className="mt-6 w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl text-center transition-all block"
            >
              Open Bid Tracker
            </Link>
          </div>
        </div>

        {/* Inventory Split & Recent Activity Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Material Category Allocation */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
            <h3 className="font-bold text-white text-sm mb-4">Inventory Materials Category</h3>
            <div className="space-y-4">
              {stats.inventory.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-850/60 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span className="text-slate-300 font-bold capitalize">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-200 block font-semibold">{cat.items_count} items</span>
                    <span className="text-[10px] text-slate-500 block">Total Qty: {cat.total_quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/inventory"
              className="mt-6 w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl text-center transition-all block"
            >
              Adjust Materials Stock
            </Link>
          </div>

          {/* Activity Logs */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">System Audit Activity Logs</h3>
              <Activity className="w-4 h-4 text-slate-500 animate-pulse" />
            </div>

            <div className="flow-root">
              <ul className="-mb-8">
                {stats.activities.map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== stats.activities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center ring-8 ring-slate-900 text-blue-400">
                            <Clock className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-slate-300 font-medium">
                              {log.action} — <span className="font-semibold text-white">{log.details}</span>
                            </p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-slate-500">
                            <span>{log.user_name || 'System'}</span>
                            <span className="block mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Client Dashboard
  if (user?.role === 'client') {
    const activeProjects = projectsList.filter(p => p.status === 'active' || p.status === 'planning');
    const pastProjects = projectsList.filter(p => p.status === 'completed' || p.status === 'cancelled');

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Client Project Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Monitor high-tension erection timelines, field inspection approvals, and outstanding billing statements.</p>
        </div>

        {/* Client Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Project Contracts</span>
            <span className="text-3xl font-extrabold text-white block mt-2">{projectsList.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1">{activeProjects.length} active, {pastProjects.length} completed</span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Total Invoices</span>
            <span className="text-3xl font-extrabold text-white block mt-2">{invoicesList.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Outstanding billing: {invoicesList.filter(i => i.status === 'pending').length} pending</span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Shared Documents</span>
            <span className="text-3xl font-extrabold text-white block mt-2">{docsList.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Work agreements, inspector clearances</span>
          </div>
        </div>

        {/* Projects detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-850 pb-3">Active Works Progress</h3>

            {activeProjects.length === 0 ? (
              <p className="text-xs text-slate-500">No active projects found at the moment.</p>
            ) : (
              <div className="space-y-6 pt-2">
                {activeProjects.map(proj => (
                  <div key={proj.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{proj.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Supervisor: {proj.supervisor_name || 'N/A'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20 uppercase text-[9px]">
                        {proj.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Progress Status: {proj.progress_percent}%</span>
                      <span>Budget: {formatCurrency(parseFloat(proj.budget))}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${proj.progress_percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-850 pb-3">Billing & Payments</h3>

            {invoicesList.length === 0 ? (
              <p className="text-xs text-slate-500">No invoice records found.</p>
            ) : (
              <div className="space-y-4">
                {invoicesList.slice(0, 4).map(inv => (
                  <div key={inv.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{inv.invoice_number}</span>
                      <span className="text-[10px] text-slate-500">Issued: {new Date(inv.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-200 block">{formatCurrency(parseFloat(inv.amount))}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase font-bold mt-1 ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Worker Dashboard
  if (user?.role === 'worker') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Site Assignments Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Review active site clearances, poles layout coordinates, and daily assignments.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active assignments */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-850 pb-3">Assigned Work Sites</h3>

            {projectsList.length === 0 ? (
              <p className="text-xs text-slate-500">No active site assignments at the moment.</p>
            ) : (
              <div className="space-y-5 pt-2">
                {projectsList.map(proj => (
                  <div key={proj.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{proj.name}</h4>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{proj.site_location || 'Coordinates Pending'}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20 text-[9px] uppercase">
                        {proj.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-850/60 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[9px] font-bold uppercase">Supervisor Contact</span>
                        <span className="text-slate-300 font-semibold mt-0.5 block">{proj.supervisor_name || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] font-bold uppercase">Completion Target</span>
                        <span className="text-slate-300 font-semibold mt-0.5 block">
                          {proj.completion_date ? new Date(proj.completion_date).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files repository quick link */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-850 pb-3">Shared Drawings & Guidelines</h3>
            
            {docsList.length === 0 ? (
              <p className="text-xs text-slate-500">No blueprints shared yet.</p>
            ) : (
              <div className="space-y-3">
                {docsList.slice(0, 5).map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">{doc.name}</span>
                        <span className="text-[10px] text-slate-500 capitalize">{doc.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
