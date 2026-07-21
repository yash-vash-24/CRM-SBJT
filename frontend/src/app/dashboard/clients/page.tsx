'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Briefcase,
  Receipt,
  User
} from 'lucide-react';
import { API_URL } from '@/config/api';

interface Client {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

export default function ClientsPage() {
  const { token, user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected client detail panel
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientDetail, setClientDetail] = useState<{ client: Client; projects: any[]; invoices: any[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add/Edit Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve clients list');
      const data = await res.json();
      setClients(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setSelectedClientId(id);
      const res = await fetch(`${API_URL}/clients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch client details');
      const data = await res.json();
      setClientDetail(data);
    } catch (err: any) {
      console.error(err);
      setClientDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create client');
      }

      await fetchClients();
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`${API_URL}/clients/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update client');
      }

      await fetchClients();
      // If updating the currently viewed details, reload panel
      if (selectedClientId === formData.id) {
        fetchClientDetail(formData.id);
      }
      setIsEditOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this client? All projects and invoices linked to this client will be affected.')) return;

    try {
      const res = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete client');
      }

      if (selectedClientId === id) {
        setSelectedClientId(null);
        setClientDetail(null);
      }
      fetchClients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (client: Client) => {
    setFormData({
      id: client.id,
      company_name: client.company_name,
      contact_name: client.contact_name,
      email: client.email,
      phone: client.phone,
      address: client.address || '',
      status: client.status
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    });
  };

  // Filter clients on search
  const filteredClients = clients.filter(c => 
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Client Management (CRM)</h1>
          <p className="text-xs text-slate-400 mt-1">Manage private utility accounts, telecom partners, load clearances, and contact lists.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/15 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Main Grid View: Left client list, Right Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Client Listing */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search clients by company name, contact person or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 outline-none transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-850 rounded-2xl">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Retrieving Accounts list...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-xs">
              {error}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-850 rounded-2xl text-xs text-slate-500">
              No clients found matching search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredClients.map((client) => (
                <div 
                  key={client.id}
                  onClick={() => fetchClientDetail(client.id)}
                  className={`bg-slate-900 border p-5 rounded-2xl transition-all cursor-pointer hover:border-slate-700 flex flex-col justify-between h-44 ${selectedClientId === client.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-850'}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        {client.status}
                      </span>
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => openEditModal(client)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-950/60 border border-slate-850 hover:border-slate-700 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => handleDelete(client.id)}
                            className="p-1.5 text-rose-400 hover:text-white bg-slate-950/60 border border-slate-850 hover:border-rose-950/50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{client.company_name}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium flex items-center">
                      <User className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                      <span>{client.contact_name}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850/60 text-[10px] text-slate-400 space-y-1">
                    <p className="flex items-center">
                      <Mail className="w-3 h-3 mr-1.5 text-slate-500" />
                      <span className="truncate">{client.email}</span>
                    </p>
                    <p className="flex items-center">
                      <Phone className="w-3 h-3 mr-1.5 text-slate-500" />
                      <span>{client.phone}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details View */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 min-h-[400px]">
          {!selectedClientId ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center space-y-2">
              <Users className="w-12 h-12 text-slate-700" />
              <p className="text-xs font-semibold uppercase">No Client Selected</p>
              <p className="text-[10px] max-w-[200px] text-slate-600 font-light">Select a card to view active contract records and billing accounts.</p>
            </div>
          ) : detailLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Querying Ledger database...</span>
            </div>
          ) : !clientDetail ? (
            <p className="text-xs text-slate-500">Failed to load detailed record.</p>
          ) : (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{clientDetail.client.company_name}</h3>
                  <span className="text-xs text-slate-400 mt-1 block">Contact: {clientDetail.client.contact_name}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedClientId(null);
                    setClientDetail(null);
                  }}
                  className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Physical details cards */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5 text-xs text-slate-300">
                <p className="flex items-start">
                  <MapPin className="w-4 h-4 text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{clientDetail.client.address || 'Address not listed'}</span>
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                  <span className="truncate">{clientDetail.client.email}</span>
                </p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                  <span>{clientDetail.client.phone}</span>
                </p>
              </div>

              {/* Linked Projects */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Projects History ({clientDetail.projects.length})</span>
                </h4>
                {clientDetail.projects.length === 0 ? (
                  <p className="text-[10px] text-slate-500">No projects found for this client.</p>
                ) : (
                  <div className="space-y-2.5">
                    {clientDetail.projects.map(proj => (
                      <div key={proj.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                        <div className="truncate max-w-[70%]">
                          <span className="font-bold text-slate-200 block truncate">{proj.name}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">Budget: ₹{(proj.budget/100000).toFixed(1)}L — Progress: {proj.progress_percent}%</span>
                        </div>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${proj.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {proj.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Invoices */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <span>Invoices & Billing ({clientDetail.invoices.length})</span>
                </h4>
                {clientDetail.invoices.length === 0 ? (
                  <p className="text-[10px] text-slate-500">No invoices generated yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {clientDetail.invoices.map(inv => (
                      <div key={inv.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-200 block">{inv.invoice_number}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">Due: {new Date(inv.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-200 block">₹{(inv.amount/100000).toFixed(1)}L</span>
                          <span className={`inline-flex px-1 py-0.5 rounded text-[8px] font-bold mt-1 uppercase ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Add New Corporate Account</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <p className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs">{formError}</p>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="e.g. DHBVN Sirsa Division"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Contact Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    placeholder="e.g. Er. Sunil Dutt"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 99888-77665"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Billing Address</label>
                <textarea 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street details, Division, District name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Account Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center"
                >
                  {formSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Edit Client Details</h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <p className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs">{formError}</p>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="e.g. Reliance Jio Infocomm"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Contact Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Billing Address</label>
                <textarea 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Account Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center"
                >
                  {formSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
