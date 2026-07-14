import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Grid, School, HeartPulse, Droplets, Landmark, Bus, Search } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function VillageResources() {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/resources`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch resources");
        return res.json();
      })
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Using fallback mock resources database:", err);
        // Fallback seed data if backend server is starting/offline
        setResources([
          {
            "id": 1,
            "category": "Schools",
            "name": "Zilla Parishad School",
            "description": "Primary and upper primary co-educational school providing quality education in local languages.",
            "address": "Main Road, Near Panchayat Hall, Gram Village",
            "contact": "+91 98765 43210",
            "image_url": "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 2,
            "category": "Schools",
            "name": "Government High School",
            "description": "Secondary educational institution with science labs, computer rooms, and sports ground.",
            "address": "School Para, East Ward, Gram Village",
            "contact": "+91 98765 43211",
            "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 3,
            "category": "Hospitals",
            "name": "Primary Health Center",
            "description": "24/7 basic medical care facility, maternal services, vaccination drives, and free medicine distribution.",
            "address": "Hospital Road, Gram Village Center",
            "contact": "+91 98765 43212",
            "image_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 4,
            "category": "Hospitals",
            "name": "Rural Hospital",
            "description": "Multi-specialty community hospital with ICU, inpatient ward, emergency trauma unit, and ambulance service.",
            "address": "Bypass Road, Outer Gram Village",
            "contact": "+91 98765 43213",
            "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 5,
            "category": "Water Infrastructure",
            "name": "Main Water Tank",
            "description": "Overhead distribution reservoir supplying purified drinking water twice daily to all households.",
            "address": "Water Works Complex, North Ward, Gram Village",
            "contact": "+91 98765 43214",
            "image_url": "https://images.unsplash.com/photo-1508433957232-3107a5efae5c?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 6,
            "category": "Water Infrastructure",
            "name": "Borewell Locations",
            "description": "Community borewells fitted with hand pumps and solar-powered taps for continuous water access.",
            "address": "Multiple spots (West Ward, Harijan Basti, Temple Square)",
            "contact": "+91 98765 43215",
            "image_url": "https://images.unsplash.com/photo-1582560475093-b668a6f2d5c6?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 7,
            "category": "Panchayat",
            "name": "Gram Panchayat Office",
            "description": "Administrative head office for village governance, certificates issuing, and local dispute resolutions.",
            "address": "Panchayat Chowk, Central Gram Village",
            "contact": "+91 98765 43216",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 8,
            "category": "Panchayat",
            "name": "Contact Information",
            "description": "Direct directory for Sarpanch, Gram Sevak, and Talathi for public grievances and administration.",
            "address": "Panchayat Chowk, Central Gram Village",
            "contact": "+91 98765 43217",
            "image_url": "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 9,
            "category": "Transportation",
            "name": "Bus Stops",
            "description": "State transport bus stand connecting the village to block headquarters and district center hourly.",
            "address": "State Highway Corner, Main Entrance, Gram Village",
            "contact": "+91 98765 43218",
            "image_url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600"
          },
          {
            "id": 10,
            "category": "Transportation",
            "name": "Local Transport Points",
            "description": "Shared auto-rickshaws, jeeps, and shuttle services terminal available round the clock.",
            "address": "Market Junction, Gram Village",
            "contact": "+91 98765 43219",
            "image_url": "https://images.unsplash.com/photo-1566838217578-1903568a76d9?auto=format&fit=crop&q=80&w=600"
          }
        ]);
        setLoading(false);
      });
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Schools': return School;
      case 'Hospitals': return HeartPulse;
      case 'Water Infrastructure': return Droplets;
      case 'Panchayat': return Landmark;
      case 'Transportation': return Bus;
      default: return Grid;
    }
  };

  // Dynamically obtain category list from data
  const uniqueCategories = ['Schools', 'Hospitals', 'Water Infrastructure', 'Panchayat', 'Transportation'];

  const filteredItems = resources.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-clay-500 to-clay-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Village Resources Directory</h2>
          <p className="text-clay-100 text-sm mt-1">
            Access essential information, contact details, and locations of local resources.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-clay-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-mustard-300 text-sm text-gray-800 placeholder-gray-400 bg-white/10 backdrop-blur text-white placeholder-clay-100"
          />
        </div>
      </div>

      {/* Tabs / Filter Pills */}
      <div className="flex flex-wrap gap-2 border-b border-orange-100 pb-4">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selectedCategory === 'All'
              ? 'bg-clay-500 text-white shadow-md shadow-clay-500/10'
              : 'bg-white text-gray-600 hover:bg-clay-50 border border-orange-100/50'
          }`}
        >
          <Grid className="h-4 w-4 mr-1.5" />
          All Resources
        </button>
        
        {uniqueCategories.map((categoryName, idx) => {
          const Icon = getCategoryIcon(categoryName);
          const isSelected = selectedCategory === categoryName;
          return (
            <button
              key={idx}
              onClick={() => setSelectedCategory(categoryName)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-clay-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-clay-50 border border-orange-100/50'
              }`}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {categoryName}
            </button>
          );
        })}
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="text-center py-20">
          <span className="animate-spin rounded-full h-10 w-10 border-4 border-clay-500 border-t-transparent inline-block"></span>
          <p className="text-gray-500 text-sm mt-3">Loading directory items...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const CatIcon = getCategoryIcon(item.category);
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 group"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-44 bg-gray-50 overflow-hidden shadow-inner">
                    <img 
                      src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`}
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback image in case backend port is blocked/loading
                        e.target.src = "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-clay-700 flex items-center shadow-sm">
                      <CatIcon className="h-3.5 w-3.5 mr-1" />
                      {item.category}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-clay-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-505 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Info (Address, Contact) */}
                <div className="px-5 pb-5 pt-3 border-t border-orange-50 bg-orange-50/10 space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-clay-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-clay-500 flex-shrink-0" />
                    <a href={`tel:${item.contact}`} className="font-bold hover:underline hover:text-clay-650 transition-colors">
                      {item.contact}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty-state screen */
        <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center text-gray-500 shadow-sm">
          <p className="text-lg font-semibold">No resource listings match your filters.</p>
          <p className="text-sm text-gray-400 mt-1">Try resetting the search box or selecting 'All Resources'.</p>
        </div>
      )}
    </div>
  );
}
