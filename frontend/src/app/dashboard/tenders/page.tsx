'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  FileCheck2, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  FileText, 
  Loader2, 
  X, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { API_URL } from '@/config/api';

interface Tender {
  id: number;
  title: string;
  department: string;
  value: number;
  submission_deadline: string;
  status: 'draft' | 'submitted' | 'awarded' | 'lost' | 'cancelled';
  emd_value: number;
  emd_status: 'pending' | 'paid' | 'refunded';
  documents: string[];
}

export default function TendersPage() {
  const { token, user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected tender drawer panel state
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);
  const [tenderDetail, setTenderDetail] = useState<{ tender: Tender; documents: any[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add/Edit Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    department: '',
    value: '',
    submission_deadline: new Date().toISOString().split('T')[0],
    status: 'draft' as 'draft' | 'submitted' | 'awarded' | 'lost' | 'cancelled',
    emd_value: '',
    emd_status: 'pending' as 'pending' | 'paid' | 'refunded'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/tenders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve tenders');
      const data = await res.json();
      setTenders(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenderDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setSelectedTenderId(id);
      const res = await fetch(`${API_URL}/tenders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setTenderDetail(data);
    } catch (err: any) {
      console.error(err);
      setTenderDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`${API_URL}/tenders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          value: parseFloat(formData.value),
          submission_deadline: formData.submission_deadline,
          status: formData.status,
          emd_value: parseFloat(formData.emd_value),
          emd_status: formData.emd_status
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add tender');
      }

      await fetchTenders();
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`${API_URL}/tenders/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          value: parseFloat(formData.value),
          submission_deadline: formData.submission_deadline,
          status: formData.status,
          emd_value: parseFloat(formData.emd_value),
          emd_status: formData.emd_status
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update tender details');
      }

      await fetchTenders();
      if (selectedTenderId === formData.id) {
        await fetchTenderDetail(formData.id);
      }
      setIsEditOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tender?')) return;

    try {
      const res = await fetch(`${API_URL}/tenders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete tender');
      
      if (selectedTenderId === id) {
        setSelectedTenderId(null);
        setTenderDetail(null);
      }
      fetchTenders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (tender: Tender) => {
    setFormData({
      id: tender.id,
      title: tender.title,
      department: tender.department,
      value: tender.value.toString(),
      submission_deadline: tender.submission_deadline ? new Date(tender.submission_deadline).toISOString().split('T')[0] : '',
      status: tender.status,
      emd_value: tender.emd_value.toString(),
      emd_status: tender.emd_status
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      title: '',
      department: '',
      value: '',
      submission_deadline: new Date().toISOString().split('T')[0],
      status: 'draft',
      emd_value: '',
      emd_status: 'pending'
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'awarded':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'submitted':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'draft':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      case 'lost':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-850 text-slate-500 border border-slate-800';
    }
  };

  const filteredTenders = tenders.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tender Pipeline Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">Review government procurement filings, NIT (Notice Inviting Tender) details, win rates, and EMD return dates.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span>Submit Bid File</span>
        </button>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search tenders by title or department name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 outline-none transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-850 rounded-2xl">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Auditing Bid logs...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-xs">
              {error}
            </div>
          ) : filteredTenders.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-850 rounded-2xl text-xs text-slate-500">
              No tenders filed.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTenders.map((tender) => (
                <div
                  key={tender.id}
                  onClick={() => fetchTenderDetail(tender.id)}
                  className={`bg-slate-900 border p-5 rounded-2xl transition-all cursor-pointer hover:border-slate-700 flex flex-col justify-between h-48 ${selectedTenderId === tender.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-850'}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-500 font-bold">Ref NIT: #{tender.id}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${getStatusStyle(tender.status)}`}>
                        {tender.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{tender.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-medium">{tender.department}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">Bid Valuation</span>
                      <span className="text-xs font-extrabold text-white mt-0.5 block">{formatCurrency(tender.value)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">Deadline Date</span>
                      <span className="text-xs font-semibold text-slate-350 mt-0.5 block">
                        {tender.submission_deadline ? new Date(tender.submission_deadline).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right drawer logs */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 min-h-[400px]">
          {!selectedTenderId ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center space-y-2">
              <FileCheck2 className="w-12 h-12 text-slate-700" />
              <p className="text-xs font-semibold uppercase">No Tender Selected</p>
              <p className="text-[10px] max-w-[200px] text-slate-600 font-light">Select a tender file card to inspect compliance status and EMD refund ledger details.</p>
            </div>
          ) : detailLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Opening file ledger...</span>
            </div>
          ) : !tenderDetail ? (
            <p className="text-xs text-slate-500">Failed to load detailed record.</p>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{tenderDetail.tender.title}</h3>
                  <span className="text-[10px] uppercase text-blue-400 font-bold block mt-1">{tenderDetail.tender.department}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => openEditModal(tenderDetail.tender)}
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-450 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(tenderDetail.tender.id)}
                      className="p-1 rounded bg-slate-950 border border-slate-850 text-rose-455 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedTenderId(null);
                      setTenderDetail(null);
                    }}
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status details display card */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bidding Status:</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${getStatusStyle(tenderDetail.tender.status)}`}>
                    {tenderDetail.tender.status}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-850/60 pt-3">
                  <span className="text-slate-500">Tender Estimate Value:</span>
                  <span className="font-semibold text-white">{formatCurrency(tenderDetail.tender.value)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">EMD Value Required:</span>
                  <span className="font-semibold text-white">{formatCurrency(tenderDetail.tender.emd_value)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">EMD Payment status:</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                    tenderDetail.tender.emd_status === 'refunded' 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : tenderDetail.tender.emd_status === 'paid' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {tenderDetail.tender.emd_status}
                  </span>
                </div>
              </div>

              {/* Deadline & documents panel */}
              <div className="space-y-4 pt-2 border-t border-slate-850">
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Submission Deadline Target: <strong className="text-white">{new Date(tenderDetail.tender.submission_deadline).toLocaleDateString()}</strong></span>
                </div>

                {/* Linked NIT Drawings */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-450 block">Linked Specifications (NIT)</span>
                  {tenderDetail.documents.length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic block">No blueprints uploaded for this tender.</span>
                  ) : (
                    <div className="space-y-2">
                      {tenderDetail.documents.map(doc => (
                        <div key={doc.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs text-slate-300">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate">{doc.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              <h3 className="font-bold text-white text-base">Submit Tender Bid File</h3>
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
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tender Title Description</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Rural Electrification for 11 villages in Sirsa Circle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Issuing Department / Board</label>
                <input 
                  type="text" 
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g. Dakshin Haryana Bijli Vitran Nigam (DHBVN)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Bid Value Estimate (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="e.g. 15000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">EMD Amount Required (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.emd_value}
                    onChange={(e) => setFormData({...formData, emd_value: e.target.value})}
                    placeholder="e.g. 300000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Submission Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={formData.submission_deadline}
                    onChange={(e) => setFormData({...formData, submission_deadline: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Bid Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="draft">Draft NIT</option>
                    <option value="submitted">Submitted</option>
                    <option value="awarded">Awarded / Won</option>
                    <option value="lost">Lost</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">EMD Status</label>
                  <select 
                    value={formData.emd_status}
                    onChange={(e) => setFormData({...formData, emd_status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Deposited / Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddOpen(false)}
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
                  Initialize Bid File
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
              <h3 className="font-bold text-white text-base">Edit Bid File Details</h3>
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
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tender Title Description</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Issuing Department / Board</label>
                <input 
                  type="text" 
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Bid Value Estimate (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">EMD Amount Required (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.emd_value}
                    onChange={(e) => setFormData({...formData, emd_value: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Submission Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={formData.submission_deadline}
                    onChange={(e) => setFormData({...formData, submission_deadline: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Bid Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="draft">Draft NIT</option>
                    <option value="submitted">Submitted</option>
                    <option value="awarded">Awarded / Won</option>
                    <option value="lost">Lost</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">EMD Status</label>
                  <select 
                    value={formData.emd_status}
                    onChange={(e) => setFormData({...formData, emd_status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Deposited / Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
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
