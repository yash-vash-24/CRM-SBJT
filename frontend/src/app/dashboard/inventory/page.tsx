'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Layers, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  X, 
  Loader2, 
  AlertTriangle, 
  TrendingUp, 
  History, 
  Trash2,
  Edit3
} from 'lucide-react';

interface InventoryItem {
  id: number;
  item_name: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  low_stock_threshold: number;
  unit_price: number;
  is_low_stock: boolean;
}

interface StockLog {
  id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reference_id: string | null;
  logged_at: string;
  logged_by_name: string | null;
}

export default function InventoryPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected item logs drawer panel state
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemDetail, setItemDetail] = useState<{ item: InventoryItem; logs: StockLog[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Stock log movement form state
  const [movementForm, setMovementForm] = useState({
    type: 'IN' as 'IN' | 'OUT',
    quantity: '',
    reference_id: ''
  });
  const [logSubmitting, setLogSubmitting] = useState(false);

  // Add/Edit item modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    item_name: '',
    description: '',
    category: 'Poles',
    unit: 'Pcs',
    quantity: '0',
    low_stock_threshold: '5',
    unit_price: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve inventory list');
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setSelectedItemId(id);
      const res = await fetch(`${API_URL}/inventory/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setItemDetail(data);
    } catch (err: any) {
      console.error(err);
      setItemDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;
    setLogSubmitting(true);

    const qty = parseInt(movementForm.quantity);
    if (!qty || qty <= 0) {
      alert('Please enter a valid positive quantity.');
      setLogSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/inventory/${selectedItemId}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: movementForm.type,
          quantity: qty,
          reference_id: movementForm.reference_id
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit log');
      }

      setMovementForm({ type: 'IN', quantity: '', reference_id: '' });
      await fetchInventory();
      await fetchItemDetail(selectedItemId);
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setLogSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_name: formData.item_name,
          description: formData.description,
          category: formData.category,
          unit: formData.unit,
          quantity: parseInt(formData.quantity),
          low_stock_threshold: parseInt(formData.low_stock_threshold),
          unit_price: parseFloat(formData.unit_price)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add item');
      }

      await fetchInventory();
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
      const res = await fetch(`${API_URL}/inventory/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_name: formData.item_name,
          description: formData.description,
          category: formData.category,
          unit: formData.unit,
          low_stock_threshold: parseInt(formData.low_stock_threshold),
          unit_price: parseFloat(formData.unit_price)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update item details');
      }

      await fetchInventory();
      if (selectedItemId === formData.id) {
        await fetchItemDetail(formData.id);
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
    if (!window.confirm('Are you sure you want to delete this inventory item? Historical transaction logs will be affected.')) return;

    try {
      const res = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete item');
      
      if (selectedItemId === id) {
        setSelectedItemId(null);
        setItemDetail(null);
      }
      fetchInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setFormData({
      id: item.id,
      item_name: item.item_name,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      quantity: item.quantity.toString(),
      low_stock_threshold: item.low_stock_threshold.toString(),
      unit_price: item.unit_price.toString()
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      item_name: '',
      description: '',
      category: 'Poles',
      unit: 'Pcs',
      quantity: '0',
      low_stock_threshold: '5',
      unit_price: ''
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredItems = items.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Materials & Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">Track high-voltage conductors, concrete poles, step-down transformers, insulators, and project consumption logs.</p>
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
          <span>Add New Material</span>
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
              placeholder="Search inventory by item name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 outline-none transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-850 rounded-2xl">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Auditing Material Registers...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-xs">
              {error}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-850 rounded-2xl text-xs text-slate-500">
              No material records found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => fetchItemDetail(item.id)}
                  className={`bg-slate-900 border p-5 rounded-2xl transition-all cursor-pointer hover:border-slate-700 flex flex-col justify-between h-44 ${selectedItemId === item.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-850'}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        {item.is_low_stock && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                            Low Stock
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-medium">Ref ID: #{item.id}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{item.item_name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description || 'No description provided.'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Qty Available</span>
                      <span className="text-sm font-extrabold text-white mt-0.5 block">{item.quantity} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span></span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Rate/Unit</span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5 block">{formatCurrency(item.unit_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right drawer logs */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 min-h-[400px]">
          {!selectedItemId ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center space-y-2">
              <Layers className="w-12 h-12 text-slate-700" />
              <p className="text-xs font-semibold uppercase">No Material Selected</p>
              <p className="text-[10px] max-w-[200px] text-slate-600 font-light">Select a material card to log Stock In / Stock Out and view audit history.</p>
            </div>
          ) : detailLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Syncing store records...</span>
            </div>
          ) : !itemDetail ? (
            <p className="text-xs text-slate-500">Failed to load detailed record.</p>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{itemDetail.item.item_name}</h3>
                  <span className="text-[10px] uppercase text-blue-400 font-bold block mt-1">{itemDetail.item.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => openEditModal(itemDetail.item)}
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-450 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(itemDetail.item.id)}
                      className="p-1 rounded bg-slate-950 border border-slate-850 text-rose-455 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedItemId(null);
                      setItemDetail(null);
                    }}
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Adjust Stock Form */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
                <span className="text-xs font-bold text-slate-400 block uppercase">Log Stock movement</span>
                <form onSubmit={handleLogSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMovementForm({...movementForm, type: 'IN'})}
                      className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                        movementForm.type === 'IN' 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Stock In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMovementForm({...movementForm, type: 'OUT'})}
                      className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                        movementForm.type === 'OUT' 
                          ? 'bg-rose-600 text-white shadow-lg' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Stock Out</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Quantity ({itemDetail.item.unit})</label>
                      <input 
                        type="number" 
                        required
                        value={movementForm.quantity}
                        onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})}
                        placeholder="e.g. 50"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Reference / Work Order</label>
                      <input 
                        type="text" 
                        value={movementForm.reference_id}
                        onChange={(e) => setMovementForm({...movementForm, reference_id: e.target.value})}
                        placeholder="e.g. WO-11KV-BYPASS"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none" 
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={logSubmitting || !movementForm.quantity}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-805 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center"
                  >
                    {logSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Submit Stock Journal Log
                  </button>
                </form>
              </div>

              {/* Movement Logs History */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center space-x-2">
                  <History className="w-4 h-4 text-slate-450" />
                  <span>Transaction History</span>
                </h4>
                {itemDetail.logs.length === 0 ? (
                  <p className="text-[10px] text-slate-500">No stock movement logged for this material.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {itemDetail.logs.map(log => (
                      <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            log.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'
                          }`}>
                            {log.type === 'IN' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block">{log.quantity} {itemDetail.item.unit}</span>
                            <span className="text-[8px] text-slate-500 block">{log.reference_id || 'Initial Load'}</span>
                          </div>
                        </div>

                        <div className="text-right text-[8px] text-slate-500">
                          <span className="block font-semibold">{log.logged_by_name || 'System'}</span>
                          <span className="block mt-0.5">{new Date(log.logged_at).toLocaleDateString()}</span>
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

      {/* ADD ITEM MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Setup Store Inventory Item</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  placeholder="e.g. 11KV Step-Down Transformer 100KVA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Poles">Poles & Erection Structures</option>
                    <option value="Transformers">Transformers & Bays</option>
                    <option value="Conductors">Conductors & Cables</option>
                    <option value="Insulators">Insulators & Clamps</option>
                    <option value="Switchgears">Distribution Panels & Switchgear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Measuring Unit</label>
                  <input 
                    type="text" 
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="e.g. Pcs, Meters, Reels"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Initial Qty</label>
                  <input 
                    type="number" 
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Low Stock Limit</label>
                  <input 
                    type="number" 
                    required
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Unit Rate (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.unit_price}
                    onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                    placeholder="e.g. 150000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Material description</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Material specs, IS code certifications..."
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
                  Initialize Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-bold text-white text-base">Edit Material Details</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Poles">Poles & Erection Structures</option>
                    <option value="Transformers">Transformers & Bays</option>
                    <option value="Conductors">Conductors & Cables</option>
                    <option value="Insulators">Insulators & Clamps</option>
                    <option value="Switchgears">Distribution Panels & Switchgear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Measuring Unit</label>
                  <input 
                    type="text" 
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Low Stock Limit</label>
                  <input 
                    type="number" 
                    required
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Unit Rate (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.unit_price}
                    onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Material description</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                ></textarea>
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
