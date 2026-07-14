import React, { useState, useEffect } from 'react';
import { 
  Map, Landmark, School, HeartPulse, Droplets, Bus, AlertTriangle, 
  X, Info, Phone, MapPin, Tag, Calendar, ChevronRight, Filter, Eye
} from 'lucide-react';
import { API_URL } from '../utils/config';

export default function VillageMap() {
  const [resources, setResources] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [showSchools, setShowSchools] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showPanchayat, setShowPanchayat] = useState(true);
  const [showTransport, setShowTransport] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);

  // Selected item detail overlay
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'resource'|'complaint', data: object }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Resources
        const resResponse = await fetch(`${API_URL}/resources`);
        const resData = resResponse.ok ? await resResponse.json() : getFallbackResources();
        setResources(resData);

        // Fetch Complaints
        const compResponse = await fetch(`${API_URL}/complaints`);
        const compData = compResponse.ok ? await compResponse.json() : getFallbackComplaints();
        setComplaints(compData);

      } catch (err) {
        console.error("Using offline mock data for map:", err);
        setResources(getFallbackResources());
        setComplaints(getFallbackComplaints());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to map resources to exact pixel grid coordinates on SVG map (X and Y percentage: 0-100)
  const getResourceCoords = (name) => {
    switch (name) {
      case "Zilla Parishad School": return { x: 28, y: 22 };
      case "Government High School": return { x: 72, y: 22 };
      case "Primary Health Center": return { x: 38, y: 68 };
      case "Rural Hospital": return { x: 78, y: 68 };
      case "Main Water Tank": return { x: 50, y: 16 };
      case "Borewell Locations": return { x: 24, y: 52 };
      case "Gram Panchayat Office": return { x: 50, y: 46 };
      case "Contact Information": return { x: 58, y: 46 };
      case "Bus Stops": return { x: 16, y: 82 };
      case "Local Transport Points": return { x: 56, y: 82 };
      default: return { x: 50, y: 50 };
    }
  };

  // Helper to map complaints deterministically to a coordinate so they render in realistic spots
  const getComplaintCoords = (id, category) => {
    const num = parseInt(id.split('-')[1]) || 50;
    
    // Position complaints relative to their category centers for realism
    if (category === 'Electricity') {
      // East ward grid
      return { x: 62 + (num % 15), y: 35 + ((num * 3) % 20) };
    } else if (category === 'Water Supply') {
      // Near school or water tank
      return { x: 34 + (num % 20), y: 18 + ((num * 3) % 15) };
    } else if (category === 'Roads') {
      // Near roads
      return { x: 45 + (num % 12), y: 75 + ((num * 2) % 12) };
    } else {
      // Sanitation: near market/center
      return { x: 42 + (num % 16), y: 54 + ((num * 3) % 15) };
    }
  };

  const getResourceIcon = (category) => {
    switch (category) {
      case 'Schools': return School;
      case 'Hospitals': return HeartPulse;
      case 'Water Infrastructure': return Droplets;
      case 'Panchayat': return Landmark;
      case 'Transportation': return Bus;
      default: return Info;
    }
  };

  const getResourceColor = (category) => {
    switch (category) {
      case 'Schools': return 'bg-blue-500 text-white border-blue-600 ring-blue-500/20';
      case 'Hospitals': return 'bg-red-500 text-white border-red-600 ring-red-500/20';
      case 'Water Infrastructure': return 'bg-cyan-500 text-white border-cyan-600 ring-cyan-500/20';
      case 'Panchayat': return 'bg-clay-500 text-white border-clay-600 ring-clay-500/20';
      case 'Transportation': return 'bg-mustard-500 text-white border-mustard-600 ring-mustard-500/20';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getComplaintColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-600 text-white ring-red-600/30';
      case 'In Progress': return 'bg-amber-500 text-white ring-amber-500/30';
      case 'Resolved': return 'bg-emerald-500 text-white ring-emerald-500/30';
      default: return 'bg-red-600 text-white';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-clay-500 to-clay-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <h2 className="text-3xl font-black tracking-tight">Interactive Village Map</h2>
        <p className="text-clay-100 text-sm mt-1">
          Explore the geographical layout of Gram Village. Tap on icons to view resource profiles or trace active civic grievances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Map Display (Col span 9) */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-orange-100 p-4 shadow-sm relative overflow-hidden">
          {loading ? (
            <div className="w-full aspect-[4/3] max-h-[600px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl">
              <span className="animate-spin rounded-full h-10 w-10 border-4 border-clay-500 border-t-transparent"></span>
              <p className="text-gray-500 text-sm mt-3">Loading interactive landscape...</p>
            </div>
          ) : (
            <div className="relative w-full aspect-[4/3] bg-[#ebf5e9] border border-pasture-100 rounded-2xl overflow-hidden shadow-inner select-none">
              
              {/* CUSTOM SVG MAP BACKGROUND GRAPHIC */}
              <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Grass texture/pastures */}
                <rect width="800" height="600" fill="#f1f8e9" />
                <path d="M 0,250 C 150,220 200,280 350,240 C 500,200 600,280 800,220 L 800,0 L 0,0 Z" fill="#ebf5e9" />
                <path d="M 0,450 C 200,420 300,500 500,440 C 700,380 750,480 800,420 L 800,600 L 0,600 Z" fill="#e8f5e9" />
                
                {/* River */}
                <path d="M -20,100 C 150,110 200,80 350,180 C 500,280 520,380 620,440 C 720,500 780,560 820,580" 
                      fill="none" stroke="#bbdefb" strokeWidth="32" strokeLinecap="round" opacity="0.8" />
                <path d="M -20,100 C 150,110 200,80 350,180 C 500,280 520,380 620,440 C 720,500 780,560 820,580" 
                      fill="none" stroke="#90caf9" strokeWidth="16" strokeLinecap="round" opacity="0.9" strokeDasharray="15 5" />
                
                {/* Bridge */}
                <rect x="525" y="380" width="40" height="35" transform="rotate(-30 525 380)" fill="#d7ccc8" rx="4" />
                <line x1="510" y1="400" x2="550" y2="375" stroke="#a1887f" strokeWidth="4" />

                {/* Primary Roads */}
                {/* Highway running left to right */}
                <path d="M 0,500 L 520,400 L 800,400" fill="none" stroke="#cfd8dc" strokeWidth="24" strokeLinecap="round" />
                <path d="M 0,500 L 520,400 L 800,400" fill="none" stroke="#b0bec5" strokeWidth="2" strokeDasharray="8 6" />

                {/* Village Core Road (Main Road) */}
                <path d="M 500,410 L 500,100" fill="none" stroke="#cfd8dc" strokeWidth="20" strokeLinecap="round" />
                
                {/* Secondary Roads */}
                <path d="M 500,150 L 250,150 L 150,220" fill="none" stroke="#eceff1" strokeWidth="12" strokeLinecap="round" />
                <path d="M 500,200 L 720,200" fill="none" stroke="#eceff1" strokeWidth="12" strokeLinecap="round" />
                <path d="M 500,300 L 250,300" fill="none" stroke="#eceff1" strokeWidth="12" strokeLinecap="round" />
                <path d="M 500,350 L 750,350" fill="none" stroke="#eceff1" strokeWidth="12" strokeLinecap="round" />
                <path d="M 250,150 L 250,460" fill="none" stroke="#eceff1" strokeWidth="10" strokeLinecap="round" />

                {/* Village Forest Area */}
                <circle cx="100" cy="80" r="40" fill="#c8e6c9" opacity="0.6" />
                <circle cx="120" cy="90" r="30" fill="#a5d6a7" opacity="0.7" />
                <circle cx="90" cy="110" r="35" fill="#81c784" opacity="0.6" />

                {/* Lake/Pond */}
                <ellipse cx="650" cy="120" rx="60" ry="40" fill="#e0f2f1" stroke="#b2dfdb" strokeWidth="4" />
                
                {/* Compass and Scale */}
                <g transform="translate(730, 50)" opacity="0.5">
                  <circle cx="20" cy="20" r="20" fill="none" stroke="#78909c" strokeWidth="2" />
                  <line x1="20" y1="5" x2="20" y2="35" stroke="#78909c" strokeWidth="2" />
                  <line x1="5" y1="20" x2="35" y2="20" stroke="#78909c" strokeWidth="2" />
                  <polygon points="20,5 24,15 16,15" fill="#d2754f" />
                  <text x="17" y="0" fill="#546e7a" fontSize="10" fontWeight="bold">N</text>
                </g>
              </svg>

              {/* DYNAMIC COMPLAINT MARKERS */}
              {showComplaints && complaints.map((comp) => {
                const coords = getComplaintCoords(comp.id, comp.category);
                const color = getComplaintColor(comp.status);
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedItem({ type: 'complaint', data: comp })}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-30"
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    {/* Pulsing ring */}
                    {comp.status !== 'Resolved' && (
                      <span className="absolute -inset-2.5 rounded-full animate-ping opacity-60 bg-red-400"></span>
                    )}
                    
                    {/* Marker Badge */}
                    <div className={`p-2 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125 ${color}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 backdrop-blur text-white text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-40">
                      <span className="font-bold">{comp.id}</span>: {comp.title} ({comp.status})
                    </div>
                  </button>
                );
              })}

              {/* RESOURCE DIRECTORY MARKERS */}
              {resources.map((item) => {
                const isVisible = 
                  (item.category === 'Schools' && showSchools) ||
                  (item.category === 'Hospitals' && showHospitals) ||
                  (item.category === 'Water Infrastructure' && showWater) ||
                  (item.category === 'Panchayat' && showPanchayat) ||
                  (item.category === 'Transportation' && showTransport);

                if (!isVisible) return null;

                const coords = getResourceCoords(item.name);
                const Icon = getResourceIcon(item.category);
                const colors = getResourceColor(item.category);

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem({ type: 'resource', data: item })}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    <div className={`p-2.5 rounded-xl border border-white shadow-md transition-transform hover:scale-125 ring-4 ${colors}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 backdrop-blur text-white text-[10px] py-1.5 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-40">
                      <span className="font-extrabold uppercase text-[8px] block opacity-85">{item.category}</span>
                      <span className="font-bold">{item.name}</span>
                    </div>
                  </button>
                );
              })}

            </div>
          )}
        </div>

        {/* Filters and Details Panel (Col span 3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Map Filters Card */}
          <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-950 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-clay-500" />
              Layer Controls
            </h3>
            
            <div className="space-y-3.5">
              <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={showSchools} 
                  onChange={(e) => setShowSchools(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-400 h-4.5 w-4.5"
                />
                <span className="flex items-center">
                  <span className="w-3.5 h-3.5 rounded bg-blue-500 mr-2 flex-shrink-0"></span>
                  Schools
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={showHospitals} 
                  onChange={(e) => setShowHospitals(e.target.checked)}
                  className="rounded text-red-500 focus:ring-red-400 h-4.5 w-4.5"
                />
                <span className="flex items-center">
                  <span className="w-3.5 h-3.5 rounded bg-red-500 mr-2 flex-shrink-0"></span>
                  Hospitals
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={showWater} 
                  onChange={(e) => setShowWater(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400 h-4.5 w-4.5"
                />
                <span className="flex items-center">
                  <span className="w-3.5 h-3.5 rounded bg-cyan-500 mr-2 flex-shrink-0"></span>
                  Water Facilities
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={showPanchayat} 
                  onChange={(e) => setShowPanchayat(e.target.checked)}
                  className="rounded text-clay-500 focus:ring-clay-400 h-4.5 w-4.5"
                />
                <span className="flex items-center">
                  <span className="w-3.5 h-3.5 rounded bg-clay-500 mr-2 flex-shrink-0"></span>
                  Panchayat Office
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={showTransport} 
                  onChange={(e) => setShowTransport(e.target.checked)}
                  className="rounded text-mustard-500 focus:ring-mustard-400 h-4.5 w-4.5"
                />
                <span className="flex items-center">
                  <span className="w-3.5 h-3.5 rounded bg-mustard-500 mr-2 flex-shrink-0"></span>
                  Transportation
                </span>
              </label>

              <div className="border-t border-orange-50 pt-3">
                <label className="flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-gray-900">
                  <input 
                    type="checkbox" 
                    checked={showComplaints} 
                    onChange={(e) => setShowComplaints(e.target.checked)}
                    className="rounded text-red-650 focus:ring-red-500 h-4.5 w-4.5"
                  />
                  <span className="flex items-center">
                    <span className="w-3.5 h-3.5 rounded bg-red-600 mr-2 flex-shrink-0 animate-pulse"></span>
                    Civic Grievances
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Details Card Profile */}
          <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden min-h-[220px] flex flex-col justify-center">
            {selectedItem ? (
              <div className="animate-float">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-clay-500 to-clay-600 text-white p-4 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest block opacity-90">
                    {selectedItem.type === 'resource' ? selectedItem.data.category : 'Civic Grievance'}
                  </span>
                  <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/15 rounded-lg text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {selectedItem.type === 'resource' ? (
                    /* Resource Details */
                    <div className="space-y-3.5">
                      <h4 className="font-extrabold text-gray-900 text-base">{selectedItem.data.name}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{selectedItem.data.description}</p>
                      
                      <div className="border-t border-orange-50 pt-3 text-xs text-gray-600 space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-clay-500 flex-shrink-0 mt-0.5" />
                          <span>{selectedItem.data.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-clay-500 flex-shrink-0" />
                          <a href={`tel:${selectedItem.data.contact}`} className="font-bold hover:underline">{selectedItem.data.contact}</a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Complaint Details */
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold font-mono text-clay-800 text-sm">{selectedItem.data.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          selectedItem.data.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          selectedItem.data.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {selectedItem.data.status}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{selectedItem.data.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-4">{selectedItem.data.description}</p>
                      </div>

                      <div className="border-t border-orange-50 pt-3 text-[10px] text-gray-500 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="font-semibold uppercase tracking-wider">Reporter:</span>
                          <span className="font-bold text-gray-800">{selectedItem.data.citizen_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold uppercase tracking-wider">Village:</span>
                          <span className="font-bold text-gray-800">{selectedItem.data.village_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold uppercase tracking-wider">Filed Date:</span>
                          <span className="font-bold text-gray-800">
                            {new Date(selectedItem.data.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {selectedItem.data.resolution_notes && (
                        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-[10px] text-emerald-850">
                          <span className="font-extrabold uppercase block tracking-wider mb-0.5">Notes:</span>
                          {selectedItem.data.resolution_notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* No selection placeholder */
              <div className="text-center p-6 text-gray-400 space-y-2">
                <Map className="h-8 w-8 mx-auto text-gray-300 animate-pulse" />
                <p className="text-xs font-semibold">Select a map marker to explore details.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Fallback resources mapping in case backend goes offline
function getFallbackResources() {
  return [
    { "id": 1, "category": "Schools", "name": "Zilla Parishad School", "address": "Main Road, Near Panchayat Hall", "contact": "+91 98765 43210", "description": "Primary education." },
    { "id": 2, "category": "Schools", "name": "Government High School", "address": "School Para, East Ward", "contact": "+91 98765 43211", "description": "Secondary education." },
    { "id": 3, "category": "Hospitals", "name": "Primary Health Center", "address": "Hospital Road, Gram Village Center", "contact": "+91 98765 43212", "description": "24/7 basic medical care." },
    { "id": 4, "category": "Hospitals", "name": "Rural Hospital", "address": "Bypass Road, Outer Gram Village", "contact": "+91 98765 43213", "description": "Multi-specialty community hospital." },
    { "id": 5, "category": "Water Infrastructure", "name": "Main Water Tank", "address": "Water Works Complex, North Ward", "contact": "+91 98765 43214", "description": "Purified drinking water." },
    { "id": 6, "category": "Water Infrastructure", "name": "Borewell Locations", "address": "Multiple spots (West Ward, Harijan Basti)", "contact": "+91 98765 43215", "description": "Solar powered borewells." },
    { "id": 7, "category": "Panchayat", "name": "Gram Panchayat Office", "address": "Panchayat Chowk, Central Gram Village", "contact": "+91 98765 43216", "description": "Administrative head office." },
    { "id": 8, "category": "Panchayat", "name": "Contact Information", "address": "Panchayat Chowk, Central Gram Village", "contact": "+91 98765 43217", "description": "Sarpanch & Gram Sevak contacts." },
    { "id": 9, "category": "Transportation", "name": "Bus Stops", "address": "State Highway Corner", "contact": "+91 98765 43218", "description": "State transport bus stand." },
    { "id": 10, "category": "Transportation", "name": "Local Transport Points", "address": "Market Junction, Gram Village", "contact": "+91 98765 43219", "description": "Shared rickshaws." }
  ];
}

// Fallback complaints list in case backend goes offline
function getFallbackComplaints() {
  return [
    { "id": "GC-5021", "citizen_name": "Ramesh Kumar", "mobile_number": "9876501234", "village_name": "Hirapur", "title": "Street Light Blown out", "description": "Broken bulb.", "category": "Electricity", "status": "Pending", "created_at": "2026-07-02T01:50:00" },
    { "id": "GC-1884", "citizen_name": "Sunita Patil", "mobile_number": "9823456789", "village_name": "Hirapur", "title": "Water Pipeline Leakage near school", "description": "Water leak.", "category": "Water Supply", "status": "In Progress", "resolution_notes": "Plumbing crew at work.", "created_at": "2026-07-02T01:50:00" },
    { "id": "GC-7212", "citizen_name": "Anil Yadav", "mobile_number": "9933445566", "village_name": "Sajampur", "title": "Garbage accumulation", "description": "Dirty market road.", "category": "Sanitation", "status": "Resolved", "resolution_notes": "Garbage collected.", "created_at": "2026-07-02T01:50:00" },
    { "id": "GC-3901", "citizen_name": "Rajesh Patil", "mobile_number": "9122334455", "village_name": "Hirapur", "title": "Potholes on Main Connecting Road", "description": "Deep cracks on asphalt.", "category": "Roads", "status": "Pending", "created_at": "2026-07-02T01:50:00" }
  ];
}
