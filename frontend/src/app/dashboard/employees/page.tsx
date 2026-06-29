'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  UserCheck, 
  Plus, 
  Calendar, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Loader2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  AlertCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';

interface Employee {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  designation: string;
  phone: string;
  email: string;
  salary: number;
  status: 'active' | 'inactive';
  joined_date: string;
  attendance_records: any; // Record<string, 'present' | 'absent'>
}

export default function EmployeesPage() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mode state: 'ledger' or 'attendance'
  const [viewMode, setViewMode] = useState<'ledger' | 'attendance'>('ledger');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceState, setAttendanceState] = useState<Record<number, 'present' | 'absent'>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Add/Edit Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    first_name: '',
    last_name: '',
    designation: 'Lineman',
    phone: '',
    email: '',
    salary: '',
    status: 'active' as 'active' | 'inactive',
    joined_date: new Date().toISOString().split('T')[0]
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve employees roster');
      const data = await res.json();
      setEmployees(data);

      // Parse attendance state for current date
      initializeAttendanceState(data, attendanceDate);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendanceState = (employeesList: Employee[], dateKey: string) => {
    const state: Record<number, 'present' | 'absent'> = {};
    employeesList.forEach(emp => {
      let records = emp.attendance_records;
      if (typeof records === 'string') {
        try { records = JSON.parse(records); } catch { records = {}; }
      }
      state[emp.id] = (records && records[dateKey]) || 'absent';
    });
    setAttendanceState(state);
  };

  // React to date change in attendance view
  useEffect(() => {
    initializeAttendanceState(employees, attendanceDate);
  }, [attendanceDate, employees]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          designation: formData.designation,
          phone: formData.phone,
          email: formData.email,
          salary: parseFloat(formData.salary),
          status: formData.status,
          joined_date: formData.joined_date
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add employee');
      }

      await fetchEmployees();
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
      const res = await fetch(`${API_URL}/employees/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          designation: formData.designation,
          phone: formData.phone,
          email: formData.email,
          salary: parseFloat(formData.salary),
          status: formData.status,
          joined_date: formData.joined_date
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update employee details');
      }

      await fetchEmployees();
      setIsEditOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      // Save attendance for each employee individually
      for (const emp of employees) {
        let records = emp.attendance_records;
        if (typeof records === 'string') {
          try { records = JSON.parse(records); } catch { records = {}; }
        }
        if (!records) records = {};

        // Merge state
        records[attendanceDate] = attendanceState[emp.id] || 'absent';

        const res = await fetch(`${API_URL}/employees/${emp.id}/attendance`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ attendance_records: records })
        });

        if (!res.ok) throw new Error(`Failed to save attendance for employee ID ${emp.id}`);
      }

      alert(`Attendance for ${attendanceDate} saved successfully!`);
      await fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Error saving attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  const toggleAttendanceStatus = (empId: number) => {
    setAttendanceState(prev => ({
      ...prev,
      [empId]: prev[empId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this employee record? This action is permanent.')) return;

    try {
      const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete employee record');
      fetchEmployees();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (emp: Employee) => {
    setFormData({
      id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      designation: emp.designation,
      phone: emp.phone,
      email: emp.email,
      salary: emp.salary.toString(),
      status: emp.status,
      joined_date: emp.joined_date ? new Date(emp.joined_date).toISOString().split('T')[0] : ''
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      first_name: '',
      last_name: '',
      designation: 'Lineman',
      phone: '',
      email: '',
      salary: '',
      status: 'active',
      joined_date: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Employees & Site Labor</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Class-A linemen, operators, safety engineers, salaries, and daily site check-in logs.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'ledger' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Staff Ledger
            </button>
            <button
              onClick={() => setViewMode('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Site Attendance
            </button>
          </div>

          {user?.role === 'admin' && viewMode === 'ledger' && (
            <button
              onClick={() => {
                resetForm();
                setFormError(null);
                setIsAddOpen(true);
              }}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-850 rounded-2xl">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Syncing HR Database...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-xs">
          {error}
        </div>
      ) : viewMode === 'ledger' ? (
        /* LEDGER VIEW: Grid Table of Staff Details */
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search staff by name, designation, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 outline-none transition-all"
            />
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Contacts</th>
                  <th className="p-4 text-right">Monthly Salary</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  {user?.role === 'admin' && <th className="p-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-850/20 text-slate-300">
                    <td className="p-4 font-bold text-white">
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/15">
                        {emp.designation}
                      </span>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="flex items-center text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-600 mr-1.5" />
                        <span>{emp.email}</span>
                      </p>
                      <p className="flex items-center text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-600 mr-1.5" />
                        <span>{emp.phone}</span>
                      </p>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-100">
                      {formatCurrency(emp.salary)}
                    </td>
                    <td className="p-4 text-slate-400">
                      {emp.joined_date ? new Date(emp.joined_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {emp.status}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="p-4 text-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="inline-flex p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="inline-flex p-1.5 bg-slate-950 border border-slate-800 hover:border-rose-950/60 text-rose-400 hover:text-rose-300 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ATTENDANCE VIEW: Calendar checklist submission */
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Select Operational Date</span>
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white outline-none mt-1" 
                />
              </div>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={savingAttendance}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-lg transition-all flex items-center justify-center"
            >
              {savingAttendance ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <FileCheck2 className="w-4 h-4 mr-2" />}
              <span>Save Daily Attendance Logs</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {employees.filter(e => e.status === 'active').map(emp => {
              const isPresent = attendanceState[emp.id] === 'present';
              return (
                <div 
                  key={emp.id}
                  onClick={() => toggleAttendanceStatus(emp.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isPresent 
                      ? 'bg-emerald-950/15 border-emerald-500/30' 
                      : 'bg-slate-950/50 border-slate-850'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-white block">{emp.first_name} {emp.last_name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase mt-0.5">{emp.designation}</span>
                  </div>

                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isPresent 
                      ? 'bg-emerald-500 border-emerald-400 text-white' 
                      : 'border-slate-800 bg-slate-900 text-transparent'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Add New Staff Employee</h3>
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
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="First name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Last name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Designation</label>
                  <select 
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Lineman">Lineman / Electrician</option>
                    <option value="Project Supervisor">Project Supervisor</option>
                    <option value="Electrical Engineer">Electrical Engineer</option>
                    <option value="Safety Coordinator">Safety Coordinator</option>
                    <option value="Labor Foreman">Labor Foreman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Monthly Salary (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="e.g. 28000"
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
                    placeholder="name@gmail.com"
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
                    placeholder="+91 99988-77766"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date of Joining</label>
                  <input 
                    type="date" 
                    value={formData.joined_date}
                    onChange={(e) => setFormData({...formData, joined_date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Employment Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Edit Employee File</h3>
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
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Designation</label>
                  <select 
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Lineman">Lineman / Electrician</option>
                    <option value="Project Supervisor">Project Supervisor</option>
                    <option value="Electrical Engineer">Electrical Engineer</option>
                    <option value="Safety Coordinator">Safety Coordinator</option>
                    <option value="Labor Foreman">Labor Foreman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Monthly Salary (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date of Joining</label>
                  <input 
                    type="date" 
                    value={formData.joined_date}
                    onChange={(e) => setFormData({...formData, joined_date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Employment Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
