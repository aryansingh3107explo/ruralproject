import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, Search, Filter, 
  Eye, RefreshCw, X, User, Phone, MapPin, Tag, Calendar, MessageSquare, 
  AlertCircle, ShieldQuestion, Download, CalendarDays
} from 'lucide-react';
import { exportComplaintToPDF, exportComplaintsListToPDF } from '../utils/pdfExport';
import { API_URL } from '../utils/config';

export default function AdminDashboard({ showToast, t }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    in_progress: 0,
    category_distribution: {
      "Water Supply": 0,
      "Roads": 0,
      "Electricity": 0,
      "Sanitation": 0
    }
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Selected Complaint for Modal View
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalPriority, setModalPriority] = useState('');
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalOfficer, setModalOfficer] = useState('');
  const [modalCompletion, setModalCompletion] = useState('');
  const [modalProgress, setModalProgress] = useState(0);
  
  // Dialog confirmation states
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchStatsAndComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const complaintsRes = await fetch(`${API_URL}/complaints`);
      if (!complaintsRes.ok) throw new Error("Could not fetch complaints database");
      const complaintsData = await complaintsRes.json();
      setComplaints(complaintsData);

      const statsRes = await fetch(`${API_URL}/stats`);
      if (!statsRes.ok) throw new Error("Could not fetch statistics");
      const statsData = await statsRes.json();
      setStats({
        total: statsData.total,
        pending: statsData.pending,
        resolved: statsData.resolved,
        in_progress: statsData.in_progress,
        category_distribution: statsData.category_distribution
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load database. Ensure FastAPI backend is running.");
      if (showToast) showToast("Database offline", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndComplaints();
  }, []);

  const handleOpenComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalPriority(complaint.priority || 'Medium');
    setModalRemarks(complaint.resolution_notes || '');
    setModalOfficer(complaint.officer_assigned || 'Unassigned');
    setModalCompletion(complaint.estimated_completion || '');
    setModalProgress(complaint.progress_percentage || 0);
  };
 
  const handleCloseModal = () => {
    setSelectedComplaint(null);
    setModalStatus('');
    setModalPriority('');
    setModalRemarks('');
    setModalOfficer('');
    setModalCompletion('');
    setModalProgress(0);
    setShowConfirmSave(false);
  };

  const handlePreSaveResolution = (e) => {
    e.preventDefault();
    setShowConfirmSave(true);
  };

  const handleConfirmSaveResolution = async () => {
    if (!selectedComplaint) return;
    
    setShowConfirmSave(false);
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: modalStatus,
          priority: modalPriority,
          resolution_notes: modalRemarks.trim() || null,
          officer_assigned: modalOfficer.trim() || null,
          estimated_completion: modalCompletion || null,
          progress_percentage: parseInt(modalProgress)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update complaint status");
      }

      if (showToast) showToast('Complaint updated successfully!', 'success');
      await fetchStatsAndComplaints();
      handleCloseModal();
    } catch (err) {
      alert(err.message || "Something went wrong.");
      if (showToast) showToast(err.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Export filtered complaints list to CSV
  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) {
      if (showToast) showToast('No complaints to export.', 'info');
      return;
    }

    const headers = ['Complaint ID', 'Citizen Name', 'Mobile Number', 'Village Name', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Resolution Notes', 'Date Filed'];
    
    const rows = filteredComplaints.map(item => [
      item.id,
      `"${item.citizen_name.replace(/"/g, '""')}"`,
      item.mobile_number,
      item.village_name,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      item.category,
      item.status,
      item.priority,
      `"${(item.resolution_notes || '').replace(/"/g, '""')}"`,
      new Date(item.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GramConnect_Complaints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (showToast) showToast('CSV file downloaded!', 'success');
  };

  // Filter logic on client side for responsive instant searching
  const filteredComplaints = complaints.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.citizen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.village_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    
    // Date filter matches complaints submitted on or after the selected date
    const itemDateString = new Date(item.created_at).toISOString().split('T')[0];
    const matchesDate = dateFilter === '' || itemDateString >= dateFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-50 text-red-700 border-red-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Medium': return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'Emergency': return 'bg-red-50 text-red-750 border-red-250 animate-pulse font-extrabold';
      default: return 'bg-gray-50 text-gray-655 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-950">Administrator Command Center</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage reported civic issues, review photographs, and submit resolutions.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2.5 bg-pasture-500 hover:bg-pasture-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-pasture-500/10"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('exportBtn')}
          </button>
          <button 
            onClick={() => exportComplaintsListToPDF(filteredComplaints, stats)}
            className="flex items-center px-4 py-2.5 bg-clay-500 hover:bg-clay-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-clay-500/10"
          >
            <FileText className="h-4 w-4 mr-2" />
            {t('exportPdfBtn')}
          </button>
          <button 
            onClick={fetchStatsAndComplaints}
            className="flex items-center px-4 py-2.5 bg-white text-clay-700 border border-clay-200 hover:bg-orange-50/50 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-gray-50 text-gray-500 rounded-xl"><FileText className="h-6 w-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Tickets</p><h4 className="text-2xl font-extrabold text-gray-900 mt-0.5">{stats.total}</h4></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl"><AlertTriangle className="h-6 w-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending</p><h4 className="text-2xl font-extrabold text-red-650 mt-0.5">{stats.pending}</h4></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Clock className="h-6 w-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">In Progress</p><h4 className="text-2xl font-extrabold text-amber-650 mt-0.5">{stats.in_progress}</h4></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
          <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Resolved</p><h4 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{stats.resolved}</h4></div>
        </div>
      </div>

      {/* Visual Charts (CSS bars) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-950">Category-wise Statistics</h3>
          <div className="space-y-4">
            {Object.entries(stats.category_distribution).map(([cat, val], idx) => {
              const pct = stats.total > 0 ? (val / stats.total) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>{cat}</span>
                    <span className="font-bold">{val} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-clay-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolved vs Pending doughnut replacement */}
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-gray-950">Resolution Metrics</h3>
          <div className="py-2 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>Resolution Rate</span>
              <span className="font-extrabold text-emerald-600">
                {stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(0) : 0}%
              </span>
            </div>
            
            <div className="w-full h-8 bg-gray-150 rounded-xl overflow-hidden flex shadow-inner">
              <div 
                className="bg-emerald-500 h-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                title={`Resolved: ${stats.resolved}`}
              ></div>
              <div 
                className="bg-amber-400 h-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.in_progress / stats.total) * 100 : 0}%` }}
                title={`In Progress: ${stats.in_progress}`}
              ></div>
              <div 
                className="bg-red-400 h-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                title={`Pending: ${stats.pending}`}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold tracking-wider pt-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">Resolved: {stats.resolved}</div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">In Progress: {stats.in_progress}</div>
              <div className="p-2 rounded-lg bg-red-50 text-red-700">Pending: {stats.pending}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Management Table */}
      <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
        {/* Controls header */}
        <div className="p-6 border-b border-orange-50 bg-orange-50/10 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <h3 className="text-xl font-bold text-gray-950 flex-shrink-0">Grievance Ledger</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-grow max-w-4xl justify-end items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-grow max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, Title, Villager, Village..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-sm bg-white"
              />
            </div>
            
            {/* Category Filter */}
            <div className="grid grid-cols-3 gap-2 flex-grow sm:flex-grow-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-xs bg-white font-semibold text-gray-650"
              >
                <option value="">All Categories</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Roads">Roads</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation">Sanitation</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-xs bg-white font-semibold text-gray-650"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              {/* Date Filter */}
              <div className="relative flex items-center">
                <CalendarDays className="absolute left-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-8 pr-2 py-2 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-xs bg-white font-semibold text-gray-600"
                  title="Filing date on/after"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table representation */}
        {loading ? (
          <div className="text-center py-20">
            <span className="animate-spin rounded-full h-10 w-10 border-4 border-clay-500 border-t-transparent inline-block"></span>
            <p className="text-gray-500 text-sm mt-3">Fetching grievances...</p>
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-orange-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Villager & Location</th>
                  <th className="px-6 py-4">Title & Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Filed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50/50 text-sm text-gray-700">
                {filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-clay-800 tracking-wider">
                      {item.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.citizen_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.village_name}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-gray-800 truncate" title={item.title}>{item.title}</div>
                      <div className="inline-block px-2 py-0.5 bg-orange-50 text-clay-650 text-[10px] font-bold rounded-md mt-1 border border-orange-100">
                        {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityBadge(item.priority)}`}>
                        {t(item.priority || 'Medium')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                        {t(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenComplaint(item)}
                        className="inline-flex items-center px-3 py-1.5 bg-clay-500 hover:bg-clay-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-clay-500/10 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 border-t border-orange-50">
            <p className="font-bold">No complaint entries found.</p>
            <p className="text-xs text-gray-400 mt-1">Try relaxing filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Detail / Edit Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-orange-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-clay-500 to-clay-600 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-clay-100 tracking-wider">Ticket Management</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <h4 className="text-2xl font-black font-mono tracking-wider">{selectedComplaint.id}</h4>
                  <button
                    onClick={() => exportComplaintToPDF(selectedComplaint)}
                    className="p-1.5 bg-white/15 hover:bg-white/30 text-white rounded-lg transition-all border border-white/20 flex items-center justify-center shadow-sm"
                    title="Download Receipt PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              {/* Villager Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-orange-50/20 border border-orange-100 rounded-2xl text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Resident</span>
                  <div className="font-bold text-gray-800 flex items-center"><User className="h-4 w-4 mr-1 text-clay-500" />{selectedComplaint.citizen_name}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Contact</span>
                  <div className="font-bold text-gray-800 flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-clay-500" />
                    <a href={`tel:${selectedComplaint.mobile_number}`} className="hover:underline">{selectedComplaint.mobile_number}</a>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Village Location</span>
                  <div className="font-bold text-gray-800 flex items-center"><MapPin className="h-4 w-4 mr-1 text-clay-500" />{selectedComplaint.village_name}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Date Logged</span>
                  <div className="font-bold text-gray-800 flex items-center"><Calendar className="h-4 w-4 mr-1 text-clay-500" />{new Date(selectedComplaint.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Text Description */}
              <div className="space-y-2">
                <h5 className="text-lg font-bold text-gray-950">{selectedComplaint.title}</h5>
                <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 p-4 rounded-xl leading-relaxed whitespace-pre-line">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Image Viewer */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Complaint Photo Attachment</h5>
                {selectedComplaint.image_path ? (
                  <div className="border border-gray-250 p-2 bg-gray-50 rounded-2xl max-w-md shadow-inner">
                    <img 
                      src={selectedComplaint.image_path.startsWith('http') ? selectedComplaint.image_path : `${API_URL}${selectedComplaint.image_path}`} 
                      alt="Grievance photograph" 
                      className="rounded-xl w-full max-h-64 object-contain"
                    />
                    <div className="text-center pt-2 text-[10px] text-gray-450">
                      <a href={selectedComplaint.image_path.startsWith('http') ? selectedComplaint.image_path : `${API_URL}${selectedComplaint.image_path}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline hover:text-clay-600">
                        Open image in new window
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-xl h-28 flex flex-col items-center justify-center bg-gray-50/50 text-gray-400 text-xs">
                    <FileText className="h-6 w-6 mb-1 text-gray-300" />
                    <span>No image uploaded for this complaint.</span>
                  </div>
                )}
              </div>

              {/* Status Update Form */}
              <div className="border-t border-gray-150 pt-5 space-y-4">
                <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Administration Action</h5>
                
                {/* Status Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <label className="text-xs font-bold text-gray-605">Update Ticket Status</label>
                  <div className="sm:col-span-2">
                    <div className="flex gap-2">
                      {['Pending', 'In Progress', 'Resolved'].map((stat) => (
                        <button
                          key={stat}
                          type="button"
                          onClick={() => setModalStatus(stat)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            modalStatus === stat
                              ? stat === 'Resolved' ? 'bg-emerald-500 border-emerald-500 text-white'
                                : stat === 'In Progress' ? 'bg-amber-500 border-amber-500 text-white'
                                : 'bg-red-500 border-red-500 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t(stat)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <label className="text-xs font-bold text-gray-605">{t('priority')}</label>
                  <div className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {['Low', 'Medium', 'High', 'Emergency'].map((prio) => (
                        <button
                          key={prio}
                          type="button"
                          onClick={() => setModalPriority(prio)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                            modalPriority === prio
                              ? prio === 'Low' ? 'bg-blue-500 border-blue-500 text-white'
                                : prio === 'Medium' ? 'bg-gray-500 border-gray-500 text-white'
                                : prio === 'High' ? 'bg-orange-500 border-orange-500 text-white'
                                : 'bg-red-650 border-red-650 text-white animate-pulse'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t(prio)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Officer Assigned */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <label className="text-xs font-bold text-gray-605">Officer Assigned</label>
                  <div className="sm:col-span-2">
                    <input 
                      type="text"
                      value={modalOfficer}
                      onChange={(e) => setModalOfficer(e.target.value)}
                      placeholder="Enter assigned officer name..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-sm bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Estimated Completion */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <label className="text-xs font-bold text-gray-605">Estimated Completion</label>
                  <div className="sm:col-span-2">
                    <input 
                      type="date"
                      value={modalCompletion}
                      onChange={(e) => setModalCompletion(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-sm bg-white font-semibold text-gray-700"
                    />
                  </div>
                </div>

                {/* Progress Percentage */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-605">Progress Percentage</label>
                    <span className="text-[10px] text-gray-400 font-bold">{modalProgress}%</span>
                  </div>
                  <div className="sm:col-span-2">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={modalProgress}
                      onChange={(e) => setModalProgress(parseInt(e.target.value))}
                      className="w-full accent-clay-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="text-xs font-bold text-gray-605 pt-2 flex items-start">
                    <MessageSquare className="h-4 w-4 mr-1 text-clay-500" />
                    Resolution Notes
                  </label>
                  <div className="sm:col-span-2">
                    <textarea
                      value={modalRemarks}
                      onChange={(e) => setModalRemarks(e.target.value)}
                      rows="3"
                      placeholder="Add notes detailing actions taken, staff dispatched, or timeline to completion..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-sm resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 mr-2"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handlePreSaveResolution}
                    className="px-6 py-2.5 bg-clay-500 hover:bg-clay-600 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Dialog Overlay */}
      {showConfirmSave && (
        <div className="fixed inset-0 z-[60] bg-gray-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-orange-100 shadow-2xl space-y-4 animate-float">
            <div className="flex items-center space-x-3 text-clay-700">
              <div className="p-2 bg-clay-50 rounded-xl border border-clay-100">
                <ShieldQuestion className="h-6 w-6 text-clay-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t('saveConfirmTitle')}</h3>
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed">
              Are you sure you want to update the status to <span className="font-bold text-clay-600">"{t(modalStatus)}"</span>, priority to <span className="font-bold text-clay-600">"{t(modalPriority)}"</span>, and publish the resolution notes?
            </p>

            <div className="border-t border-gray-100 pt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmSave(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                {t('goBack')}
              </button>
              <button
                onClick={handleConfirmSaveResolution}
                disabled={updating}
                className="px-5 py-2.5 bg-clay-500 hover:bg-clay-600 text-white font-bold rounded-xl shadow-md text-sm transition-all"
              >
                {updating ? 'Updating...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
