'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  FolderClosed, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Download, 
  Calendar, 
  X, 
  Loader2, 
  AlertTriangle,
  Briefcase,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { API_URL, BACKEND_BASE_URL } from '@/config/api';

interface Document {
  id: number;
  name: string;
  type: 'contract' | 'blueprint' | 'clearance' | 'other';
  file_path: string;
  project_id: number | null;
  project_name: string | null;
  tender_id: number | null;
  tender_title: string | null;
  uploaded_at: string;
}

interface Project {
  id: number;
  name: string;
}

interface Tender {
  id: number;
  title: string;
}

export default function DocumentsPage() {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Add Document Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'blueprint' as 'contract' | 'blueprint' | 'clearance' | 'other',
    project_id: '',
    tender_id: '',
    file_name: '' // Simulated file selection
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    if (user?.role === 'admin' || user?.role === 'supervisor') {
      fetchProjects();
      fetchTenders();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve document list');
      const data = await res.json();
      setDocuments(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProjects(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTenders = async () => {
    try {
      const res = await fetch(`${API_URL}/tenders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTenders(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    if (!formData.name) {
      setFormError('Please enter a document name.');
      setFormSubmitting(false);
      return;
    }

    try {
      // Mock path generator
      const mockFileName = formData.file_name || `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
      const file_path = `/uploads/${mockFileName}`;

      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          file_path: file_path,
          project_id: formData.project_id ? parseInt(formData.project_id) : null,
          tender_id: formData.tender_id ? parseInt(formData.tender_id) : null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to index document');
      }

      await fetchDocuments();
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this document from the vault?')) return;

    try {
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete document');
      fetchDocuments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'blueprint',
      project_id: '',
      tender_id: '',
      file_name: ''
    });
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'blueprint':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'contract':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'clearance':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (doc.project_name && doc.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.tender_title && doc.tender_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Document Vault</h1>
          <p className="text-xs text-slate-400 mt-1">Access structure site blueprints, government inspector safety clearances, tenders specification booklets, and client SLAs.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <button
            onClick={() => {
              resetForm();
              setFormError(null);
              setIsAddOpen(true);
            }}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search vault by document name, linked project or tender title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 outline-none transition-all"
          />
        </div>

        <div className="flex space-x-2 bg-slate-900 border border-slate-850 p-1 rounded-xl w-full sm:w-auto">
          {['all', 'blueprint', 'contract', 'clearance', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide flex-1 sm:flex-none ${
                typeFilter === type ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-850 rounded-2xl">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Opening vault files...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-455 text-xs">
          {error}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-850 rounded-2xl text-xs text-slate-500">
          No records indexed in this folder.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between h-48 hover:border-slate-750 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${getDocTypeColor(doc.type)}`}>
                    {doc.type}
                  </span>
                  
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-rose-455 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs leading-snug line-clamp-2">{doc.name}</h3>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between text-[10px]">
                {/* Linked scope */}
                <div className="truncate max-w-[65%] text-slate-400">
                  {doc.project_name ? (
                    <span className="flex items-center" title={`Project: ${doc.project_name}`}>
                      <Briefcase className="w-3 h-3 text-slate-500 mr-1 flex-shrink-0" />
                      <span className="truncate">{doc.project_name}</span>
                    </span>
                  ) : doc.tender_title ? (
                    <span className="flex items-center" title={`Tender: ${doc.tender_title}`}>
                      <FileCheck2 className="w-3 h-3 text-slate-500 mr-1 flex-shrink-0" />
                      <span className="truncate">{doc.tender_title}</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Generic Document</span>
                  )}
                </div>

                {/* Simulated file download link */}
                <a
                  href={`${BACKEND_BASE_URL}${doc.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded font-bold text-[9px] transition-all"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Index Document File</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Document Name / Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. 100KVA Substation Layout Blueprint"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">File Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="blueprint">Site Drawing / Blueprint</option>
                    <option value="contract">Corporate SLA / Contract</option>
                    <option value="clearance">Inspector Safety Clearance</option>
                    <option value="other">General Estimate / Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Local File (Simulated)</label>
                  <input 
                    type="file" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({...formData, file_name: file.name});
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-400 outline-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-900 file:text-white file:hover:bg-slate-800" 
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Associate Document scope</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-1 uppercase">Link Project Site</label>
                    <select 
                      value={formData.project_id}
                      onChange={(e) => setFormData({...formData, project_id: e.target.value, tender_id: ''})}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none"
                    >
                      <option value="">None / Unlinked...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 mb-1 uppercase">Link Tender Bid</label>
                    <select 
                      value={formData.tender_id}
                      onChange={(e) => setFormData({...formData, tender_id: e.target.value, project_id: ''})}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none"
                    >
                      <option value="">None / Unlinked...</option>
                      {tenders.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
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
                  Index Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
