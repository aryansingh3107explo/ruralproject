import React, { useState, useEffect } from 'react';
import { BarChart, Users, AlertTriangle, Lightbulb, Smile, Sparkles } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function SurveyAnalytics() {
  const totalSurveyed = 250;

  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const res = await fetch(`${API_URL}/ai/analytics-insights`);
        if (!res.ok) throw new Error('Failed to fetch AI insights');
        const data = await res.json();
        setAiInsights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAIInsights();
  }, []);
  
  const ageDistribution = [
    { range: '18 - 25 years', percentage: 18, count: 45, color: 'bg-clay-400' },
    { range: '26 - 40 years', percentage: 36, count: 90, color: 'bg-pasture-500' },
    { range: '41 - 60 years', percentage: 30, count: 75, color: 'bg-clay-600' },
    { range: 'Above 60 years', percentage: 16, count: 40, color: 'bg-mustard-500' },
  ];

  const problemCategories = [
    { name: 'Water Supply', percentage: 38, count: 95, color: '#d2754f' }, // Clay
    { name: 'Roads & Access', percentage: 24, count: 60, color: '#4c9859' }, // Pasture
    { name: 'Electricity & Grid', percentage: 20, count: 50, color: '#e3be2b' }, // Mustard
    { name: 'Sanitation & Waste', percentage: 18, count: 45, color: '#a2462e' }, // Dark Clay
  ];

  const satisfactionLevels = [
    { level: 'Excellent', percentage: 15, color: 'bg-emerald-500' },
    { level: 'Good', percentage: 35, color: 'bg-emerald-400' },
    { level: 'Average', percentage: 30, color: 'bg-amber-400' },
    { level: 'Poor', percentage: 20, color: 'bg-red-400' },
  ];

  const preferredSolutions = [
    { solution: 'Community Water Filtration Plants', votes: 110, percentage: 44, color: 'bg-clay-500' },
    { solution: 'Asphalt Pavement & Culvert Construction', votes: 78, percentage: 31, color: 'bg-pasture-500' },
    { solution: 'Solar Street Lights installation', votes: 42, percentage: 17, color: 'bg-mustard-500' },
    { solution: 'Daily Solid Waste Door Pickup', votes: 20, percentage: 8, color: 'bg-red-500' },
  ];

  // Helper to compute stroke coordinates for SVG circular pie chart segments
  let accumulatedPercent = 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pasture-500 to-pasture-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Village Survey Analytics</h2>
          <p className="text-pasture-100 text-sm mt-1">
            Grievance identification and development survey conducted across 250 households in Hirapur and Sajampur.
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 hidden md:block">
          <BarChart className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-pasture-50 text-pasture-600 rounded-xl">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Villagers Surveyed</p>
            <h4 className="text-3xl font-black text-gray-900 mt-0.5">{totalSurveyed}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Core Issue Identified</p>
            <h4 className="text-2xl font-black text-gray-950 mt-0.5">Water Supply</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Smile className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg Satisfaction</p>
            <h4 className="text-2xl font-black text-emerald-650 mt-0.5">Good (50%)</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Pie Chart - Problem Categories */}
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-950 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-clay-500" />
              Major Problems Faced
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution of responses identifying the primary village issue.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* Custom SVG Pie/Donut Chart */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                {problemCategories.map((cat, idx) => {
                  const dashArray = `${cat.percentage} ${100 - cat.percentage}`;
                  const offset = 100 - accumulatedPercent;
                  accumulatedPercent += cat.percentage;
                  return (
                    <circle
                      key={idx}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="4.2"
                      strokeDasharray={dashArray}
                      strokeDashoffset={offset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-4.5 shadow-inner">
                <span className="text-xs text-gray-400 uppercase font-black tracking-widest">Primary</span>
                <span className="text-sm font-black text-clay-700">Water 38%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3.5 flex-grow max-w-xs">
              {problemCategories.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded-md flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-semibold text-gray-700">{cat.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{cat.count} ({cat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Bar Graph - Preferred Solutions */}
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-950 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-mustard-500" />
              Preferred Solutions Identified
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Solutions voted by surveyed villagers to solve major issues.</p>
          </div>

          <div className="space-y-4 py-2">
            {preferredSolutions.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-650 leading-tight">
                  <span className="truncate max-w-xs" title={item.solution}>{item.solution}</span>
                  <span className="font-bold text-gray-900">{item.votes} votes ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 3: Age Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-950 flex items-center">
            <Users className="h-5 w-5 mr-2 text-pasture-500" />
            Respondent Age Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ageDistribution.map((item, idx) => (
              <div key={idx} className="border border-orange-50/70 p-4 rounded-2xl flex flex-col justify-between bg-orange-50/5 hover:bg-orange-50/15 transition-all">
                <span className="text-xs font-bold text-gray-500">{item.range}</span>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-black text-gray-900">{item.percentage}%</span>
                  <span className="text-xs font-semibold text-gray-400">{item.count} citizens</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Satisfaction Levels */}
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-950 flex items-center">
              <Smile className="h-5 w-5 mr-2 text-emerald-500" />
              Panchayat Administration Satisfaction
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Rating of general public services and infrastructure updates.</p>
          </div>

          <div className="space-y-3.5 py-2">
            {satisfactionLevels.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4 text-xs font-semibold">
                <span className="w-16 text-gray-600">{item.level}</span>
                <div className="flex-grow bg-gray-100 h-3.5 rounded-xl overflow-hidden shadow-inner">
                  <div className={`h-full rounded-xl ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
                <span className="w-8 text-right font-bold text-gray-900">{item.percentage}%</span>
              </div>
            ))}
        </div>
      </div>
    </div>

      {/* GramAI Seasonal Forecast & Predictions */}
      <div className="bg-white p-6 rounded-3xl border border-pasture-100 shadow-sm space-y-6 mt-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-950 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-pasture-500 animate-pulse" />
              GramAI Seasonal Predictive Forecast
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Automated seasonal grievance forecasting based on active database statistics.</p>
          </div>
          <span className="bg-pasture-50 text-pasture-750 border border-pasture-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            AI Engine Live
          </span>
        </div>

        {loadingAI ? (
          <div className="text-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-pasture-500 border-t-transparent inline-block"></span>
            <p className="text-gray-400 text-xs mt-2">GramAI is calculating seasonal spikes...</p>
          </div>
        ) : aiInsights ? (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-orange-50/10 border border-orange-100 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-gray-550">Predicted Highest Peak Category</span>
                <span className="text-sm font-black text-clay-700 bg-clay-50 px-2.5 py-1 rounded-lg border border-clay-100">{aiInsights.most_common}</span>
              </div>
              <div className="bg-orange-50/10 border border-orange-100 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-gray-550">Historical Avg Resolution Rate</span>
                <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{aiInsights.average_resolution}</span>
              </div>
            </div>

            {/* Predictions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">Spike Predictions & Action Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiInsights.predictive_alerts.map((alert, idx) => (
                  <div key={idx} className="bg-orange-50/5 border border-orange-100 p-4 rounded-2xl text-xs font-semibold leading-relaxed text-gray-705 flex items-start space-x-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5 animate-bounce">💡</span>
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-455 text-xs text-center py-4">
            Could not retrieve seasonal projections.
          </div>
        )}
      </div>
    </div>
  );
}
