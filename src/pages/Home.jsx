import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import heroImage from '../assets/village_hero.png';
import { API_URL } from '../utils/config';

export default function Home({ setActiveTab }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    in_progress: 0
  });
  const [healthScore, setHealthScore] = useState({
    overall: 82,
    water: 75,
    roads: 90,
    electricity: 88,
    healthcare: 70,
    sanitation: 85,
    rating: 'Good'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch statistics");
        return res.json();
      })
      .then((data) => {
        setStats({
          total: data.total,
          pending: data.pending,
          resolved: data.resolved,
          in_progress: data.in_progress
        });
        if (data.health_score) {
          setHealthScore(data.health_score);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
        // Fail-safe seed stats if backend is starting or offline
        setStats({
          total: 4,
          pending: 2,
          resolved: 1,
          in_progress: 1
        });
      });
  }, []);

  const steps = [
    {
      step: "01",
      title: "File Complaint",
      desc: "Fill in the details, select a category, and upload a photo of the issue.",
      color: "bg-clay-100 text-clay-700"
    },
    {
      step: "02",
      title: "Track Status",
      desc: "Get a unique Complaint ID to check progress at any time.",
      color: "bg-mustard-100 text-mustard-850"
    },
    {
      step: "03",
      title: "Quick Resolution",
      desc: "Panchayat administrators address the issue and post resolution updates.",
      color: "bg-pasture-100 text-pasture-750"
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-10 lg:p-12 border border-orange-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-clay-100 border border-clay-200 px-3 py-1 rounded-full text-xs font-semibold text-clay-700">
              <span className="flex h-2 w-2 rounded-full bg-clay-500 animate-pulse"></span>
              <span>Panchayat Digital Initiative</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Empowering Villages through <span className="bg-gradient-to-r from-clay-500 to-clay-700 bg-clip-text text-transparent">Digital Connectivity</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              GramConnect is a smart portal for rural residents. Report local infrastructure issues directly to your Gram Panchayat and explore verified local resources instantly.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setActiveTab('submit')}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-clay-500 hover:bg-clay-600 text-white font-semibold rounded-2xl shadow-lg shadow-clay-500/20 transition-all duration-200 hover:translate-y-[-2px]"
              >
                Submit Complaint
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-orange-50/50 text-clay-700 font-semibold rounded-2xl border border-clay-200 shadow-sm transition-all duration-200 hover:translate-y-[-2px]"
              >
                View Resources
                <BookOpen className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-2 bg-white/70 backdrop-blur rounded-3xl border border-orange-100 shadow-xl max-w-md animate-float">
              <img
                src={heroImage}
                alt="GramConnect Smart Village Illustration"
                className="rounded-2xl object-cover shadow-inner w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">Grievance Portal Statistics</h2>
          <p className="text-gray-500 mt-1">Real-time status of reported complaints in the village sector</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm shadow-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>Currently using offline sample database. Run the backend to view live data.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Complaints */}
          <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-orange-50 text-orange-600">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Grievances</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                {loading ? '...' : stats.total}
              </h3>
            </div>
          </div>

          {/* Pending Complaints */}
          <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-red-50 text-red-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1 text-red-650">
                {loading ? '...' : stats.pending}
              </h3>
            </div>
          </div>

          {/* In Progress Complaints */}
          <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-amber-50 text-amber-500">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1 text-amber-650">
                {loading ? '...' : stats.in_progress}
              </h3>
            </div>
          </div>

          {/* Resolved Complaints */}
          <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-500">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1 text-emerald-600">
                {loading ? '...' : stats.resolved}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Village Health Score Section */}
      <section className="bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-float">
        <div className="md:col-span-4 flex flex-col items-center text-center space-y-3 p-4 bg-orange-50/20 border border-orange-100 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Village Health Score</span>
          <div className="relative flex items-center justify-center">
            {/* Circular Ring Score */}
            <div className="w-32 h-32 rounded-full border-8 border-orange-100 flex flex-col items-center justify-center bg-white shadow-inner relative">
              <span className="text-4xl font-black text-gray-900">{loading ? '...' : healthScore.overall}</span>
              <span className="text-[10px] font-bold text-gray-400 mt-0.5">/ 100</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 font-bold text-sm">
            <span className={`w-3 h-3 rounded-full ${healthScore.rating === 'Good' ? 'bg-emerald-500 animate-pulse' : healthScore.rating === 'Average' ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
            <span className={healthScore.rating === 'Good' ? 'text-emerald-700' : healthScore.rating === 'Average' ? 'text-amber-700' : 'text-red-700'}>
              {healthScore.rating} Rating
            </span>
          </div>
        </div>

        <div className="md:col-span-8 space-y-4">
          <div>
            <h3 className="text-xl font-extrabold text-gray-950">Dynamic Sector Health Indicators</h3>
            <p className="text-gray-550 text-xs mt-0.5 leading-relaxed text-gray-500">
              Computed live by tracking category-specific resolved vs. pending grievances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* Water */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Water Supply</span>
                <span className="font-bold text-clay-650">{loading ? '...' : healthScore.water}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${healthScore.water}%` }}></div>
              </div>
            </div>

            {/* Roads */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Road Infrastructure</span>
                <span className="font-bold text-clay-650">{loading ? '...' : healthScore.roads}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${healthScore.roads}%` }}></div>
              </div>
            </div>

            {/* Electricity */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Electrical Grid</span>
                <span className="font-bold text-clay-650">{loading ? '...' : healthScore.electricity}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${healthScore.electricity}%` }}></div>
              </div>
            </div>

            {/* Sanitation */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Sanitation & Hygiene</span>
                <span className="font-bold text-clay-650">{loading ? '...' : healthScore.sanitation}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${healthScore.sanitation}%` }}></div>
              </div>
            </div>

            {/* Healthcare */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between">
                <span>Public Healthcare Access</span>
                <span className="font-bold text-clay-650">{loading ? '...' : healthScore.healthcare}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full rounded-full transition-all duration-500" style={{ width: `${healthScore.healthcare}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="bg-white rounded-3xl border border-orange-100 p-8 sm:p-10 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">How villagers can submit complaints</h2>
          <p className="text-gray-500 mt-1">Submit, monitor and get resolution of issues in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative group p-4 space-y-4 rounded-2xl hover:bg-orange-50/20 transition-all duration-200 border border-transparent hover:border-orange-50">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${item.color}`}>
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
