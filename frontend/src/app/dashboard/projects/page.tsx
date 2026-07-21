'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Trash2, 
  Sliders, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { API_URL } from '@/config/api';

interface Project {
  id: number;
  name: string;
  client_id: number;
  client_name: string;
  supervisor_id: number | null;
  supervisor_name: string | null;
  description: string;
  start_date: string | null;
  completion_date: string | null;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'lost' | 'cancelled';
  progress_percent: number;
  site_location: string;
}

interface Client {
  id: number;
  company_name: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  designation: string;
  status: string;
}

export default function ProjectsPage() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auxiliary data lists
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Selected project details state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetail, setProjectDetail] = useState<{
    project: Project;
    workers: any[];
    documents: any[];
    invoices: any[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit progress/status state
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editProgress, setEditProgress] = useState<number>(0);

  // Add Project state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    supervisor_id: '',
    description: '',
    start_date: '',
    completion_date: '',
    budget: '',
    status: 'planning',
    progress_percent: 0,
    site_location: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Assign worker state
  const [assigningWorkerId, setAssigningWorkerId] = useState<string>('');
  const [assigningLoading, setAssigningLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'admin' || user?.role === 'supervisor') {
      fetchClients();
      fetchEmployees();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve projects');
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setClients(await res.json());
    } catch (err) {
      console.error('Clients fetch error:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setEmployees(await res.json());
    } catch (err) {
      console.error('Employees fetch error:', err);
    }
  };

  const fetchProjectDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setSelectedProjectId(id);
      const res = await fetch(`${API_URL}/projects/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setProjectDetail(data);
      setEditStatus(data.project.status);
      setEditProgress(data.project.progress_percent);
    } catch (err: any) {
      console.error(err);
      setProjectDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    if (!formData.client_id) {
      setFormError('Please select a client account.');
      setFormSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          client_id: parseInt(formData.client_id),
          supervisor_id: formData.supervisor_id ? parseInt(formData.supervisor_id) : null,
          description: formData.description,
          start_date: formData.start_date || null,
          completion_date: formData.completion_date || null,
          budget: parseFloat(formData.budget),
          status: formData.status,
          progress_percent: formData.progress_percent,
          site_location: formData.site_location
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create project');
      }

      await fetchProjects();
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!projectDetail) return;
    setUpdatingProgress(true);

    try {
      const currentProj = projectDetail.project;
      const res = await fetch(`${API_URL}/projects/${currentProj.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: currentProj.name,
          client_id: currentProj.client_id,
          supervisor_id: currentProj.supervisor_id,
          description: currentProj.description,
          start_date: currentProj.start_date,
          completion_date: currentProj.completion_date,
          budget: currentProj.budget,
          status: editStatus,
          progress_percent: editProgress,
          site_location: currentProj.site_location
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update progress');
      }

      await fetchProjects();
      await fetchProjectDetail(currentProj.id);
      alert('Project status updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !assigningWorkerId) return;
    setAssigningLoading(true);

    try {
      const res = await fetch(`${API_URL}/projects/${selectedProjectId}/assign-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ employee_id: parseInt(assigningWorkerId) })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to assign worker');
      }

      setAssigningWorkerId('');
      await fetchProjectDetail(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleRemoveWorker = async (workerId: number) => {
    if (!selectedProjectId || !window.confirm('Remove this worker assignment from the site?')) return;

    try {
      const res = await fetch(`${API_URL}/projects/${selectedProjectId}/remove-worker/${workerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to remove worker');
      }

      await fetchProjectDetail(selectedProjectId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project? All assignments, invoices, and documents linked to it will be lost.')) return;

    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete project');
      setSelectedProjectId(null);
      setProjectDetail(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client_id: '',
      supervisor_id: '',
      description: '',
      start_date: '',
      completion_date: '',
      budget: '',
      status: 'planning',
      progress_percent: 0,
      site_location: ''
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Get only workers from the employees list for assign option dropdown
  const fieldWorkers = employees.filter(emp => 
    emp.status === 'active' && 
    (emp.designation.toLowerCase().includes('worker') || 
     emp.designation.toLowerCase().includes('lineman') || 
     emp.designation.toLowerCase().includes('electrician'))
  );

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Project Work Sites</h1>
          <p className="text-xs text-slate-400 mt-1">Review transformer clearances, line distribution targets, daily labor deployments, and BOQ values.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <button
            onClick={() => {
              resetForm();
              setFormError(null);
              setIsAddOpen(true);
            }}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/15 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Create Project Site</span>
          </button>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Projects Listing */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-850 rounded-2xl">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Loading project registries...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-xs">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-850 rounded-2xl text-xs text-slate-500">
              No active site files assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => fetchProjectDetail(proj.id)}
                  className={`bg-slate-900 border p-5 rounded-2xl transition-all cursor-pointer hover:border-slate-700 flex flex-col justify-between h-48 ${selectedProjectId === proj.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-850'}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{proj.client_name}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${
                        proj.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : proj.status === 'active' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{proj.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1 mt-0.5" />
                      <span className="truncate">{proj.site_location || 'Coordinates pending'}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850/60">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                      <span>Value: <strong className="text-slate-200">{formatCurrency(proj.budget)}</strong></span>
                      <span className="font-bold">{proj.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${proj.progress_percent}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details Drawer Panel */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 min-h-[450px]">
          {!selectedProjectId ? (
            <div className="flex flex-col items-center justify-center py-28 text-slate-500 text-center space-y-2">
              <Briefcase className="w-12 h-12 text-slate-700" />
              <p className="text-xs font-semibold uppercase">No Site Selected</p>
              <p className="text-[10px] max-w-[200px] text-slate-600 font-light">Select a project card to inspect supervisor logs, site layouts, and workforce tables.</p>
            </div>
          ) : detailLoading ? (
            <div className="flex flex-col items-center justify-center py-28">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Syncing field telemetry...</span>
            </div>
          ) : !projectDetail ? (
            <p className="text-xs text-slate-500">Failed to load detailed record.</p>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{projectDetail.project.name}</h3>
                  <span className="text-[10px] uppercase text-blue-400 font-bold block mt-1">{projectDetail.project.client_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteProject(projectDetail.project.id)}
                      className="p-1 rounded bg-slate-950 border border-slate-850 text-rose-400 hover:text-white"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedProjectId(null);
                      setProjectDetail(null);
                    }}
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Tracker Widget */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">Site Status & Progress</span>
                  <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{projectDetail.project.status}</span>
                </div>

                {(user?.role === 'admin' || user?.role === 'supervisor') ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progress Slider</span>
                        <span>{editProgress}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={editProgress}
                        onChange={(e) => setEditProgress(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Update Status</label>
                      <select 
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none"
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="lost">Lost</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <button
                      onClick={handleUpdateProgress}
                      disabled={updatingProgress}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center"
                    >
                      {updatingProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                      Save Progress Details
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Status Value</span>
                      <span>{projectDetail.project.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${projectDetail.project.progress_percent}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Site Details Cards */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Site Location:</span>
                  <span className="font-semibold text-slate-200 text-right">{projectDetail.project.site_location || 'Coordinates pending'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Supervisor Assigned:</span>
                  <span className="font-semibold text-slate-200">{projectDetail.project.supervisor_name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-500">BOQ Budget Valuation:</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(projectDetail.project.budget)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Work Commencement:</span>
                  <span className="font-semibold text-slate-200">
                    {projectDetail.project.start_date ? new Date(projectDetail.project.start_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Assigned workforce */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  <span>Assigned Field Workers ({projectDetail.workers.length})</span>
                  {(user?.role === 'admin' || user?.role === 'supervisor') && <Sliders className="w-3.5 h-3.5 text-slate-500" />}
                </h4>

                {/* Assign new worker form */}
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                  <form onSubmit={handleAssignWorker} className="flex space-x-2">
                    <select
                      value={assigningWorkerId}
                      required
                      onChange={(e) => setAssigningWorkerId(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="">Select Field Worker...</option>
                      {fieldWorkers.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.designation})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={assigningLoading || !assigningWorkerId}
                      className="px-3 bg-slate-950 border border-slate-850 hover:border-slate-700 hover:bg-slate-850 text-white rounded-lg flex items-center justify-center"
                    >
                      {assigningLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </form>
                )}

                {projectDetail.workers.length === 0 ? (
                  <p className="text-[10px] text-slate-500">No field labor workers assigned to this site file.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {projectDetail.workers.map(worker => (
                      <div key={worker.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-200 block">{worker.name}</span>
                          <span className="text-[9px] text-slate-500">{worker.designation}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-slate-400 font-semibold">{worker.phone}</span>
                          {(user?.role === 'admin' || user?.role === 'supervisor') && (
                            <button
                              onClick={() => handleRemoveWorker(worker.id)}
                              className="text-rose-400 hover:text-rose-300 p-0.5 hover:bg-rose-500/10 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Blueprints / Invoices linked */}
              <div className="space-y-4 pt-2 border-t border-slate-850">
                {/* Documents */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Site Documents</span>
                  {projectDetail.documents.length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic block">No documents uploaded.</span>
                  ) : (
                    <div className="space-y-1.5">
                      {projectDetail.documents.map(doc => (
                        <div key={doc.id} className="flex items-center space-x-2 text-xs text-slate-300">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate flex-1">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invoices */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Project Billings</span>
                  {projectDetail.invoices.length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic block">No invoice history.</span>
                  ) : (
                    <div className="space-y-1.5">
                      {projectDetail.invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between text-xs text-slate-300">
                          <div className="flex items-center space-x-2">
                            <Receipt className="w-3.5 h-3.5 text-slate-500" />
                            <span>{inv.invoice_number}</span>
                          </div>
                          <span className="font-semibold text-slate-200">{formatCurrency(parseFloat(inv.amount))}</span>
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

      {/* CREATE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Setup Project Site File</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Project Name / Description</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. 11KV Overhead Line Erection - Hisar Bypass"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Client Account</label>
                  <select 
                    value={formData.client_id}
                    required
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Select Account...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Supervisor-in-Charge</label>
                  <select 
                    value={formData.supervisor_id}
                    onChange={(e) => setFormData({...formData, supervisor_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Leave Unassigned...</option>
                    {employees.filter(emp => emp.designation.toLowerCase().includes('supervisor') || emp.designation.toLowerCase().includes('engineer')).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Valuation Budget (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="e.g. 4500000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Site Map / Coordinates</label>
                  <input 
                    type="text" 
                    value={formData.site_location}
                    onChange={(e) => setFormData({...formData, site_location: e.target.value})}
                    placeholder="e.g. Sector-10 Bypass, Hisar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Commencement Date</label>
                  <input 
                    type="date" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Completion Date</label>
                  <input 
                    type="date" 
                    value={formData.completion_date}
                    onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Scope description details</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Details of transformer configurations, conductor reels quantity..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                ></textarea>
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
                  Initialize Site File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
