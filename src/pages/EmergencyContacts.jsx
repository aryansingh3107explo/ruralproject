import React, { useState } from 'react';
import { Shield, HeartPulse, Truck, Flame, User, Landmark, Phone, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';

export default function EmergencyContacts({ showToast }) {
  const [copiedId, setCopiedId] = useState(null);

  const emergencyServices = [
    {
      id: 'police',
      name: 'Local Police Station',
      subtitle: 'Gram Village Jurisdiction Office',
      number: '+91 2162 234100',
      altNumber: '100',
      address: 'Police Chowki, Main Road Crossroads, Gram Village',
      status: 'Active 24/7',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      icon: Shield,
      color: 'bg-blue-500 text-white'
    },
    {
      id: 'phc',
      name: 'Primary Health Centre',
      subtitle: 'Village Health & Emergency Ward',
      number: '+91 98765 43212',
      altNumber: '102',
      address: 'Hospital Road, Gram Village Center',
      status: 'Active 24/7 (Emergency)',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      icon: HeartPulse,
      color: 'bg-red-500 text-white'
    },
    {
      id: 'ambulance',
      name: 'Free Ambulance Service',
      subtitle: 'National Health Mission Vehicle',
      number: '+91 98765 43220',
      altNumber: '108',
      address: 'Parked at Primary Health Centre, Gram Village',
      status: 'Active 24/7',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      icon: Truck,
      color: 'bg-cyan-500 text-white'
    },
    {
      id: 'fire',
      name: 'Fire & Rescue Department',
      subtitle: 'Sub-District HQ Station',
      number: '+91 2162 234200',
      altNumber: '101',
      address: 'Block Headquarters Road, 8km from Gram Village',
      status: 'On-Call Response',
      statusColor: 'text-amber-600 bg-amber-50 border-amber-250',
      icon: Flame,
      color: 'bg-orange-500 text-white'
    }
  ];

  const adminContacts = [
    {
      id: 'sarpanch',
      name: 'Smt. Sunita Bhosale',
      role: 'Sarpanch (Village Head)',
      number: '+91 98789 01234',
      address: 'Office of the Sarpanch, Panchayat Chowk, Gram Village',
      status: 'Available (9 AM - 6 PM)',
      statusColor: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: Landmark,
      color: 'bg-clay-500 text-white'
    },
    {
      id: 'gramsevak',
      name: 'Shri. Vijay Patil',
      role: 'Gram Sevak (Panchayat Secretary)',
      number: '+91 98877 66554',
      address: 'Administration Block, Gram Panchayat Office, Gram Village',
      status: 'Available (10 AM - 5 PM)',
      statusColor: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: User,
      color: 'bg-pasture-500 text-white'
    }
  ];

  const handleCopy = (number, id) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    if (showToast) showToast(`Copied ${number} to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Emergency Contacts & Helpline</h2>
          <p className="text-red-100 text-sm mt-1">
            Immediate access to critical rescue services, medical centers, and local administrative representatives.
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 hidden md:block">
          <AlertCircle className="h-8 w-8 animate-pulse text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column: Quick Helplines & Rescue (Col span 8) */}
        <div className="md:col-span-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-950 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-550" />
            First Response & Medical Services
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {emergencyServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <div key={service.id} className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl shadow-inner ${service.color}`}>
                        <ServiceIcon className="h-6 w-6" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${service.statusColor}`}>
                        {service.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-900 group-hover:text-red-650 transition-colors text-base">{service.name}</h4>
                      <p className="text-[10px] font-semibold text-gray-400">{service.subtitle}</p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {service.address}
                    </p>
                  </div>

                  {/* Calling Actions */}
                  <div className="border-t border-orange-50 pt-4 mt-4 flex items-center gap-2">
                    <a 
                      href={`tel:${service.number}`}
                      className="flex-grow inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10"
                    >
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      Call {service.altNumber}
                    </a>
                    <button 
                      onClick={() => handleCopy(service.number, service.id)}
                      className="p-2.5 hover:bg-orange-50 border border-orange-100 hover:border-orange-200 text-gray-500 rounded-xl transition-all"
                      title="Copy Mobile"
                    >
                      {copiedId === service.id ? <Check className="h-4.5 w-4.5 text-emerald-600" /> : <Copy className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Local Administrative Contacts (Col span 4) */}
        <div className="md:col-span-4 space-y-6">
          <h3 className="text-lg font-bold text-gray-950 flex items-center">
            <Landmark className="h-5 w-5 mr-2 text-clay-500" />
            Gram Panchayat Leadership
          </h3>

          <div className="space-y-6">
            {adminContacts.map((contact) => {
              const ContactIcon = contact.icon;
              return (
                <div key={contact.id} className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm space-y-4 hover:shadow-md transition-all group">
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-3 rounded-xl ${contact.color}`}>
                      <ContactIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 group-hover:text-clay-650 transition-colors text-sm">{contact.name}</h4>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{contact.role}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {contact.address}
                  </p>
                  
                  <div className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${contact.statusColor}`}>
                    {contact.status}
                  </div>

                  <div className="border-t border-orange-50 pt-4 flex items-center gap-2">
                    <a 
                      href={`tel:${contact.number}`}
                      className="flex-grow inline-flex items-center justify-center px-4 py-2.5 bg-clay-500 hover:bg-clay-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-clay-500/10"
                    >
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      Call Leader
                    </a>
                    <button 
                      onClick={() => handleCopy(contact.number, contact.id)}
                      className="p-2.5 hover:bg-orange-50 border border-orange-100 hover:border-orange-200 text-gray-500 rounded-xl transition-all"
                    >
                      {copiedId === contact.id ? <Check className="h-4.5 w-4.5 text-emerald-600" /> : <Copy className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
