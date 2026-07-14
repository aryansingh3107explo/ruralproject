import React, { useState } from 'react';
import { Search, Calendar, Tag, User, MapPin, AlertCircle, Clock, CheckCircle, FileText, ExternalLink, Inbox, Printer } from 'lucide-react';
import { exportComplaintToPDF } from '../utils/pdfExport';
import { API_URL } from '../utils/config';

export default function ComplaintStatus({ showToast }) {
  const [complaintId, setComplaintId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) {
      setError('Please enter a Complaint ID');
      setComplaint(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    const idToSearch = complaintId.trim().toUpperCase();
    setSearchId(idToSearch);

    try {
      const res = await fetch(`${API_URL}/complaints/${idToSearch}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Complaint ID "${idToSearch}" not found. Double check and try again.`);
        }
        throw new Error('Could not fetch complaint details');
      }
      const data = await res.json();
      setComplaint(data);
      if (showToast) showToast('Complaint loaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setComplaint(null);
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-red-500 bg-red-50 border-red-200';
      case 'In Progress': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'Resolved': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTimelineSteps = (currentStatus) => {
    const steps = [
      { key: 'Pending', label: 'Grievance Submitted', desc: 'The complaint was successfully logged and sent to Panchayat review.' },
      { key: 'In Progress', label: 'Review & Action In Progress', desc: 'Administrative staff has been dispatched to investigate and repair.' },
      { key: 'Resolved', label: 'Problem Resolved', desc: 'The issue has been fixed. Resolution notes uploaded by Panchayat.' }
    ];

    const currentIdx = steps.findIndex(s => s.key === currentStatus);

    return steps.map((step, idx) => {
      let state = 'future'; // past, active, future
      if (idx < currentIdx) state = 'past';
      else if (idx === currentIdx) state = 'active';
      return { ...step, state };
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8">
      {/* Search Container */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-950">Track Complaint Status</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter your unique Complaint ID (e.g. GC-1001) to verify progress and view resolution remarks.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter Complaint ID (e.g., GC-1884)"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent transition-all uppercase font-mono tracking-wider text-gray-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-clay-500 hover:bg-clay-600 disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center whitespace-nowrap"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
            ) : (
              <span>Track Status</span>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Details Container */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-orange-100 p-12 text-center shadow-sm">
          <span className="animate-spin rounded-full h-10 w-10 border-4 border-clay-500 border-t-transparent inline-block"></span>
          <p className="text-gray-505 text-sm mt-3 font-semibold">Retrieving Grievance Details...</p>
        </div>
      ) : complaint ? (
        <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden animate-float">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-clay-500 to-clay-600 px-6 py-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-clay-100">Grievance Ticket</span>
              <h3 className="text-3xl font-black font-mono tracking-wider">{complaint.id}</h3>
            </div>
             <div className="flex items-center space-x-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-inner ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
              <button
                onClick={() => exportComplaintToPDF(complaint)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 flex items-center justify-center shadow-sm"
                title="Download PDF Receipt"
              >
                <Printer className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* General Info Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-orange-50/30 border border-orange-100 rounded-2xl text-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Villager</p>
                <p className="font-bold text-gray-800 flex items-center">
                  <User className="h-4 w-4 mr-1 text-clay-500" />
                  {complaint.citizen_name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Village</p>
                <p className="font-bold text-gray-800 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-clay-500" />
                  {complaint.village_name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Category</p>
                <p className="font-bold text-gray-800 flex items-center">
                  <Tag className="h-4 w-4 mr-1 text-clay-500" />
                  {complaint.category}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Filed On</p>
                <p className="font-bold text-gray-800 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-clay-500" />
                  {new Date(complaint.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Real-time Tracking & AI Verification Widget */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-gradient-to-br from-gray-50 to-orange-50/15 border border-orange-100 rounded-3xl shadow-inner">
              {/* Left Column: Progress & Timeline */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span className="uppercase tracking-wider">Resolution Progress</span>
                  <span className="text-clay-650 text-sm font-black">{complaint.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden border border-gray-200/50 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-clay-400 to-clay-500 rounded-full transition-all duration-700" 
                    style={{ width: `${complaint.progress_percentage}%` }}
                  ></div>
                </div>
                
                {/* Officer & Est Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold block">Assigned Officer</span>
                    <span className="font-bold text-gray-800 flex items-center">
                      <User className="h-4 w-4 mr-1.5 text-clay-500" />
                      {complaint.officer_assigned || 'Assigning soon...'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold block">Est. Completion Date</span>
                    <span className="font-bold text-gray-800 flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-clay-500" />
                      {complaint.estimated_completion 
                        ? new Date(complaint.estimated_completion).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Under review'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Analysis */}
              <div className="md:col-span-5 flex flex-col justify-center bg-white border border-orange-100 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider">GramAI Image Verification</span>
                </div>
                {complaint.ai_detected_issue ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800">
                      Detected: <span className="text-clay-600 font-extrabold">{complaint.ai_detected_issue}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 font-semibold leading-normal">
                      Confidence Level: <span className="font-bold text-gray-700">{complaint.ai_confidence}%</span> &bull; Issue matches classification.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-450 font-semibold italic leading-normal">
                    No photo uploaded or issue pattern not matching automatic AI detector tags.
                  </p>
                )}
              </div>
            </div>

            {/* Description & Photo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-950">{complaint.title}</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    {complaint.description}
                  </p>
                </div>

                {complaint.resolution_notes && (
                  <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl space-y-2">
                    <h5 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center">
                      <CheckCircle className="h-4.5 w-4.5 mr-1.5" />
                      Resolution Remarks
                    </h5>
                    <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                      {complaint.resolution_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Photo Area */}
              <div className="md:col-span-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachment</p>
                {complaint.image_path ? (
                  <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner group">
                    <img
                      src={complaint.image_path.startsWith('http') ? complaint.image_path : `${API_URL}${complaint.image_path}`}
                      alt={complaint.title}
                      className="w-full object-cover max-h-48"
                    />
                    <a
                      href={complaint.image_path.startsWith('http') ? complaint.image_path : `${API_URL}${complaint.image_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-gray-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-xs font-semibold"
                    >
                      View Fullsize
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-2xl h-36 flex flex-col items-center justify-center bg-gray-50/50 text-gray-400">
                    <FileText className="h-8 w-8 mb-1.5" />
                    <span className="text-xs">No Photo Attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="pt-6 border-t border-gray-100 space-y-6">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Timeline Activity</h4>
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 relative">
                <div className="hidden md:block absolute left-6 right-6 top-6 h-0.5 bg-gray-200 z-0">
                  <div 
                    className="h-full bg-pasture-500 transition-all duration-500" 
                    style={{
                      width: complaint.status === 'Pending' ? '0%' : complaint.status === 'In Progress' ? '50%' : '100%'
                    }}
                  />
                </div>

                {getTimelineSteps(complaint.status).map((step, idx) => {
                  let circleColor = 'border-gray-200 bg-white text-gray-400';
                  let textColor = 'text-gray-500';
                  if (step.state === 'active') {
                    circleColor = complaint.status === 'Resolved' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-500/10' 
                      : complaint.status === 'In Progress'
                      ? 'border-amber-500 bg-amber-50 text-amber-600 ring-4 ring-amber-500/10'
                      : 'border-red-500 bg-red-50 text-red-650 ring-4 ring-red-500/10';
                    textColor = 'text-gray-900 font-bold';
                  } else if (step.state === 'past') {
                    circleColor = 'border-pasture-500 bg-pasture-50 text-pasture-600';
                    textColor = 'text-gray-700 font-semibold';
                  }

                  return (
                    <div key={idx} className="flex md:flex-col items-start gap-4 md:gap-3 flex-1 relative z-10">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm ${circleColor}`}>
                        {idx + 1}
                      </div>

                      <div className="space-y-1">
                        <h5 className={`text-base leading-tight ${textColor}`}>{step.label}</h5>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : searched ? (
        /* Empty-state screen */
        <div className="bg-white rounded-3xl border border-orange-100 p-12 text-center shadow-sm space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center shadow-sm">
            <Inbox className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Grievance Not Found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              We could not find any reported complaint matching the ID <span className="font-mono font-bold text-gray-800">"{searchId}"</span>.
            </p>
          </div>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Please check the spelling, hyphenation, and numbers (e.g. GC-1001) and try again.
          </p>
        </div>
      ) : null}
    </div>
  );
}
