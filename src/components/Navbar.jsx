import React, { useState } from 'react';
import { Menu, X, Landmark, PlusCircle, Search, Map, ShieldAlert, BookOpen, Shield, BarChart, Globe, Bell, Smartphone, Mail, Award } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, lang, setLang, t, notifications = [], unreadCount = 0, setUnreadCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const navItems = [
    { id: 'home', label: t('home'), icon: Landmark },
    { id: 'submit', label: t('submit'), icon: PlusCircle },
    { id: 'status', label: t('status'), icon: Search },
    { id: 'schemes', label: lang === 'mr' ? 'सरकारी योजना' : lang === 'hi' ? 'सरकारी योजनाएं' : 'Schemes for You', icon: Award },
    { id: 'resources', label: t('resources'), icon: BookOpen },
    { id: 'map', label: t('map'), icon: Map },
    { id: 'emergency', label: t('emergency'), icon: Shield },
    { id: 'analytics', label: t('analytics'), icon: BarChart },
    { id: 'admin', label: t('admin'), icon: ShieldAlert, adminOnly: true }
  ];

  return (
    <nav className="sticky top-0 z-50 glassmorphism shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-gradient-to-br from-clay-500 to-clay-700 p-2 rounded-xl text-white mr-2.5 shadow-md shadow-clay-500/20">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-clay-600 to-clay-800 bg-clip-text text-transparent">
                {t('appName')}
              </span>
              <span className="block text-[10px] font-semibold text-pasture-600 uppercase tracking-widest leading-none">
                {t('smartVillage')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-clay-500 text-white shadow-md shadow-clay-500/15'
                      : item.adminOnly
                      ? 'text-red-650 hover:bg-red-50 hover:text-red-700'
                      : 'text-gray-600 hover:bg-clay-50 hover:text-clay-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Language Switcher, Notifications & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2">
            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) setUnreadCount(0);
                }}
                className="p-2 text-gray-500 hover:text-clay-500 hover:bg-clay-50 rounded-xl transition-all relative border border-transparent"
                title="System Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-orange-100 shadow-xl z-50 overflow-hidden text-sm max-h-[80vh] flex flex-col">
                  <div className="bg-gradient-to-r from-clay-500 to-clay-600 px-4 py-3 text-white font-extrabold flex justify-between items-center">
                    <span>Recent Notifications</span>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">SMS & Email Logs</span>
                  </div>
                  <div className="overflow-y-auto divide-y divide-orange-50/30 max-h-64">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => {
                        const isSMS = notif.type === 'SMS';
                        const isEmail = notif.type === 'Email';
                        return (
                          <div key={notif.id} className="p-3 hover:bg-orange-50/10 transition-colors flex gap-2.5">
                            <div className="flex-shrink-0 mt-0.5">
                              {isSMS ? (
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Smartphone className="h-3.5 w-3.5" /></div>
                              ) : isEmail ? (
                                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Mail className="h-3.5 w-3.5" /></div>
                              ) : (
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Bell className="h-3.5 w-3.5" /></div>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{notif.type} Alert &bull; {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              <p className="text-xs text-gray-700 leading-normal font-medium">{notif.message}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-gray-400 text-xs">
                        No recent alert notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lang Dropdown/Pills */}
            <div className="flex items-center space-x-1 bg-orange-50/50 border border-orange-100 rounded-xl p-1">
              <Globe className="h-3.5 w-3.5 text-clay-500 ml-1 mr-0.5" />
              <button 
                onClick={() => setLang('en')} 
                className={`px-1.5 py-0.5 text-[9px] font-black rounded-lg transition-all ${lang === 'en' ? 'bg-clay-500 text-white shadow-sm' : 'text-gray-500 hover:text-clay-600'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('mr')} 
                className={`px-1.5 py-0.5 text-[9px] font-black rounded-lg transition-all ${lang === 'mr' ? 'bg-clay-500 text-white shadow-sm' : 'text-gray-500 hover:text-clay-600'}`}
              >
                मराठी
              </button>
              <button 
                onClick={() => setLang('hi')} 
                className={`px-1.5 py-0.5 text-[9px] font-black rounded-lg transition-all ${lang === 'hi' ? 'bg-clay-500 text-white shadow-sm' : 'text-gray-500 hover:text-clay-600'}`}
              >
                हिंदी
              </button>
            </div>
 
             <button
               onClick={() => setIsOpen(!isOpen)}
               className="lg:hidden text-gray-500 hover:text-clay-500 focus:outline-none p-2 rounded-lg hover:bg-clay-50"
             >
               {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-orange-50 bg-white/95 backdrop-blur-md px-2 pt-2 pb-4 space-y-1 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-clay-500 text-white shadow-sm'
                    : item.adminOnly
                    ? 'text-red-650 hover:bg-red-50'
                    : 'text-gray-600 hover:bg-clay-50 hover:text-clay-600'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
