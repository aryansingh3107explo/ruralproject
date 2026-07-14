import React, { useState } from 'react';
import { Landmark, HelpCircle, CheckCircle2, CircleDot, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Schemes({ showToast, t }) {
  // Questionnaire state
  const [age, setAge] = useState(25);
  const [occupation, setOccupation] = useState('Farmer');
  const [isLandowner, setIsLandowner] = useState(true);
  const [houseType, setHouseType] = useState('Kutcha');
  const [income, setIncome] = useState(90000);

  // Application simulator state
  const [applyingFor, setApplyingFor] = useState(null);
  const [appliedSchemes, setAppliedSchemes] = useState({});

  const schemes = [
    {
      id: 'pm-kisan',
      name: 'PM Kisan Samman Nidhi',
      category: 'Agriculture',
      benefit: '₹6,000 / year in 3 equal installments directly to bank accounts.',
      description: 'Central sector scheme that provides income support to all landholding farmer families across the country to supplement their financial needs.',
      eligibility: {
        occupation: 'Farmer',
        isLandowner: true,
        maxIncome: 200000
      }
    },
    {
      id: 'ayushman-bharat',
      name: 'Ayushman Bharat (PM-JAY)',
      category: 'Healthcare',
      benefit: 'Free health cover of up to ₹5 Lakhs per family per year.',
      description: 'Provides cashless and paperless access to healthcare services for secondary and tertiary care hospitalization in empaneled hospitals.',
      eligibility: {
        maxIncome: 120000
      }
    },
    {
      id: 'pm-awas',
      name: 'PM Awas Yojana (Gramin)',
      category: 'Housing',
      benefit: 'Financial assistance of up to ₹1.2 Lakhs for building a pucca house.',
      description: 'Social welfare program to provide pucca houses with basic amenities like toilets, water, and electricity to rural families living in kutcha structures.',
      eligibility: {
        houseType: 'Kutcha'
      }
    },
    {
      id: 'skill-india',
      name: 'Skill India (PMKVY)',
      category: 'Vocational Training',
      benefit: 'Free skill training, assessment, and government certification.',
      description: 'Enables rural youth to take up industry-relevant skill training to secure better livelihoods and entrepreneurship opportunities.',
      eligibility: {
        minAge: 15,
        maxAge: 35,
        occupations: ['Youth', 'Unemployed', 'Student', 'Farmer']
      }
    }
  ];

  // Helper to check if a scheme matches the user profile
  const checkEligibility = (scheme) => {
    const el = scheme.eligibility;

    if (el.minAge && age < el.minAge) return false;
    if (el.maxAge && age > el.maxAge) return false;
    if (el.occupation && occupation !== el.occupation) return false;
    if (el.isLandowner !== undefined && isLandowner !== el.isLandowner) return false;
    if (el.houseType && houseType !== el.houseType) return false;
    if (el.maxIncome && income > el.maxIncome) return false;
    if (el.occupations && !el.occupations.includes(occupation)) return false;

    return true;
  };

  const handleApply = (schemeId) => {
    setApplyingFor(schemeId);
    setTimeout(() => {
      setAppliedSchemes(prev => ({ ...prev, [schemeId]: `APP-${Math.floor(100000 + Math.random() * 900000)}` }));
      setApplyingFor(null);
      if (showToast) showToast('Application submitted successfully!', 'success');
    }, 1500);
  };

  const eligibleSchemes = schemes.filter(checkEligibility);
  const otherSchemes = schemes.filter(s => !checkEligibility(s));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
      {/* Questionnaire Sidebar */}
      <div className="lg:col-span-4 bg-white border border-orange-100 p-6 rounded-3xl shadow-sm space-y-6 h-fit">
        <div>
          <h3 className="text-xl font-extrabold text-gray-950 flex items-center">
            <Landmark className="h-5.5 w-5.5 mr-2 text-clay-500" />
            Eligibility Profile
          </h3>
          <p className="text-xs text-gray-500 mt-1">Adjust details to find government schemes you qualify for.</p>
        </div>

        <div className="space-y-4 text-sm">
          {/* Age Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-gray-700 text-xs">
              <span>Age</span>
              <span className="font-bold text-clay-650">{age} years</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="70" 
              value={age} 
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full accent-clay-500"
            />
          </div>

          {/* Occupation Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Occupation</label>
            <select 
              value={occupation} 
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent text-sm bg-white font-medium text-gray-700"
            >
              <option value="Farmer">Farmer / Agriculture</option>
              <option value="Youth">Youth / Student</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Laborer">Manual Laborer</option>
              <option value="Businessman">Micro-business / Shop owner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Landowner Radio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">Do you own agricultural land?</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsLandowner(true)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${isLandowner ? 'bg-clay-500 border-clay-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Yes, Landowner
              </button>
              <button 
                onClick={() => setIsLandowner(false)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${!isLandowner ? 'bg-clay-500 border-clay-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                No Land
              </button>
            </div>
          </div>

          {/* House Type Radio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">Current House Structure</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setHouseType('Kutcha')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${houseType === 'Kutcha' ? 'bg-clay-500 border-clay-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Kutcha (Mud/Thatch)
              </button>
              <button 
                onClick={() => setHouseType('Pucca')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${houseType === 'Pucca' ? 'bg-clay-500 border-clay-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Pucca (Concrete)
              </button>
            </div>
          </div>

          {/* Income Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-gray-700 text-xs">
              <span>Annual Family Income</span>
              <span className="font-bold text-clay-650">₹{income.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="20000" 
              max="300000" 
              step="5000"
              value={income} 
              onChange={(e) => setIncome(parseInt(e.target.value))}
              className="w-full accent-clay-500"
            />
          </div>
        </div>
      </div>

      {/* Main Schemes List */}
      <div className="lg:col-span-8 space-y-6">
        <div>
          <h2 className="text-3xl font-black text-gray-950">Schemes Recommended for You</h2>
          <p className="text-gray-500 text-sm mt-0.5">Based on your active eligibility profile, you qualify for the following programs:</p>
        </div>

        {/* Recommended Schemes */}
        {eligibleSchemes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {eligibleSchemes.map((scheme) => {
              const isApplied = !!appliedSchemes[scheme.id];
              return (
                <div key={scheme.id} className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {scheme.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-clay-50 text-clay-700 border border-clay-200 flex items-center">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Eligible
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900">{scheme.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{scheme.description}</p>
                    
                    <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-3 text-xs font-semibold text-gray-700">
                      <span className="text-[10px] font-bold text-clay-500 uppercase tracking-widest block mb-1">Key Benefit</span>
                      {scheme.benefit}
                    </div>
                  </div>

                  <div className="flex flex-col justify-end items-stretch md:items-end md:min-w-44 gap-2">
                    {isApplied ? (
                      <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-2xl text-center space-y-1">
                        <div className="text-emerald-700 text-xs font-bold flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 mr-1 stroke-[3]" />
                          Applied
                        </div>
                        <div className="text-[9px] text-emerald-800 font-mono font-bold">
                          ID: {appliedSchemes[scheme.id]}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(scheme.id)}
                        disabled={applyingFor !== null}
                        className="w-full px-5 py-3 bg-clay-500 hover:bg-clay-600 disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center"
                      >
                        {applyingFor === scheme.id ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        ) : (
                          <>
                            <span>Apply Online</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-orange-100 p-8 text-center shadow-sm text-gray-500">
            <HelpCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold">No schemes recommended.</p>
            <p className="text-xs text-gray-400 mt-0.5">Try widening your income or selecting other profile parameters.</p>
          </div>
        )}

        {/* Other Schemes (Not Eligible) */}
        {otherSchemes.length > 0 && (
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-700">Other Schemes</h3>
              <p className="text-xs text-gray-400 mt-0.5">Programs you do not currently qualify for based on profile variables:</p>
            </div>

            <div className="grid grid-cols-1 gap-4 opacity-75">
              {otherSchemes.map((scheme) => (
                <div key={scheme.id} className="bg-gray-55/30 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-55/50">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-100 text-gray-500">
                        {scheme.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-50 text-red-500 border border-red-100 flex items-center">
                        <CircleDot className="h-2.5 w-2.5 mr-1" /> Ineligible
                      </span>
                    </div>
                    <h5 className="text-base font-bold text-gray-700">{scheme.name}</h5>
                    <p className="text-xs text-gray-500">{scheme.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
