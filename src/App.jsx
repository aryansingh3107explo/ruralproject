import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintStatus from './pages/ComplaintStatus';
import Schemes from './pages/Schemes';
import VillageResources from './pages/VillageResources';
import VillageMap from './pages/VillageMap';
import EmergencyContacts from './pages/EmergencyContacts';
import SurveyAnalytics from './pages/SurveyAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import { translations } from './utils/translations';
import { Heart, Bell, X, Globe, MessageSquare, Send, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react';
import { API_URL } from './utils/config';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState('en'); // 'en' | 'mr' | 'hi'
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (initial = false) => {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      
      setNotifications(prev => {
        if (!initial && prev.length > 0 && data.length > prev.length) {
          const newNotifs = data.filter(n => !prev.some(p => p.id === n.id));
          const latest = newNotifs[0];
          if (latest && latest.type === 'In-App') {
            showToast(`Notification: ${latest.message}`, 'info');
            setUnreadCount(u => u + newNotifs.filter(n => n.type === 'In-App').length);
          }
        } else if (initial) {
          const inAppCount = data.filter(n => n.type === 'In-App').length;
          setUnreadCount(inAppCount > 3 ? 3 : inAppCount);
        }
        return data;
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 8000);
    return () => clearInterval(interval);
  }, []);

  // GramAI Floating Chatbot / Voice Assistant states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Namaskar! I am GramAI, your village assistant. Ask me about local schools, clinics, emergency contacts, or how to register complaints!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isChatListening, setIsChatListening] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  // Speaks text using Web Speech Synthesis API
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Map voices based on the selected language
      if (lang === 'mr') {
        utterance.lang = 'mr-IN';
      } else if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN'; // Indian English accent fits well
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech-to-text voice listener for the chat input field
  const startChatListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (showToast) showToast('Speech recognition not supported in this browser. Try Chrome.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    if (lang === 'mr') recognition.lang = 'mr-IN';
    else if (lang === 'hi') recognition.lang = 'hi-IN';
    else recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsChatListening(true);
      if (showToast) showToast('GramAI Voice Input active. Speak now...', 'info');
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsChatListening(false);
      if (showToast) showToast('Audio capture failed.', 'error');
    };

    recognition.onend = () => {
      setIsChatListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      if (showToast) showToast('Voice captured!', 'success');
    };

    recognition.start();
  };

  const handleSendChat = async (textToSend = null) => {
    const messageText = textToSend || chatInput.trim();
    if (!messageText) return;

    if (!textToSend) setChatInput('');

    // Append user message
    const updatedMessages = [...chatMessages, { role: 'user', content: messageText }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: chatMessages
        })
      });
      if (!response.ok) throw new Error('Failed to get chat response');
      const result = await response.json();
      
      // Append assistant message
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
      
      // Auto-read response out loud
      speakText(result.response);
      
    } catch (err) {
      console.error(err);
      const fallbackMsg = 'Connecting... I am running on simulated responses right now.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg }]);
      speakText(fallbackMsg);
    } finally {
      setIsChatTyping(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} lang={lang} t={t} />;
      case 'submit':
        return <SubmitComplaint showToast={showToast} lang={lang} t={t} />;
      case 'status':
        return <ComplaintStatus showToast={showToast} lang={lang} t={t} />;
      case 'schemes':
        return <Schemes showToast={showToast} lang={lang} t={t} />;
      case 'resources':
        return <VillageResources lang={lang} t={t} />;
      case 'map':
        return <VillageMap lang={lang} t={t} />;
      case 'emergency':
        return <EmergencyContacts showToast={showToast} lang={lang} t={t} />;
      case 'analytics':
        return <SurveyAnalytics lang={lang} t={t} />;
      case 'admin':
        return <AdminDashboard showToast={showToast} lang={lang} t={t} />;
      default:
        return <Home setActiveTab={setActiveTab} lang={lang} t={t} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfaf6] to-[#f4eee6] flex flex-col justify-between relative">
      <div>
        {/* Navigation Bar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          lang={lang} 
          setLang={setLang}
          t={t}
          notifications={notifications}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
        />
        
        {/* Main Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce sm:animate-none">
          <div className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold max-w-sm ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'info'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-250 text-emerald-800'
          }`}>
            <Bell className={`h-5 w-5 ${
              toast.type === 'error' ? 'text-red-500' : toast.type === 'info' ? 'text-amber-500' : 'text-emerald-500'
            }`} />
            <span className="flex-grow">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-gray-150 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Chatbot Button */}
      <button
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) {
            // Read out loud welcoming speech on open
            setTimeout(() => speakText(chatMessages[0].content), 500);
          }
        }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-pasture-500 to-pasture-600 hover:from-pasture-600 hover:to-pasture-750 text-white p-4 rounded-full shadow-2xl shadow-pasture-600/30 hover:scale-105 transition-all flex items-center justify-center border border-white/10"
        title="Chat with GramAI Voice Assistant"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1.5 -right-1.5 bg-clay-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white animate-bounce">
          AI
        </span>
      </button>

      {/* Chat Window Panel */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-3xl border border-orange-100 shadow-2xl overflow-hidden flex flex-col h-[500px] animate-float">
          {/* Header */}
          <div className="bg-gradient-to-r from-pasture-500 to-pasture-600 px-5 py-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/15 rounded-lg border border-white/10">
                <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight">GramAI Voice Assistant</h4>
                <p className="text-[10px] text-pasture-100 font-semibold uppercase tracking-wider leading-none">Smart Village Guide</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsChatOpen(false);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-orange-50/5">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-1.5`}
              >
                {msg.role !== 'user' && (
                  <button 
                    onClick={() => speakText(msg.content)}
                    className="p-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-lg text-clay-650 transition-all flex-shrink-0"
                    title="Speak message"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                )}
                
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed font-medium ${
                  msg.role === 'user'
                    ? 'bg-clay-500 text-white rounded-br-none shadow-md shadow-clay-500/10'
                    : 'bg-white border border-orange-100 text-gray-850 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isChatTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-orange-100 rounded-2xl rounded-bl-none p-3.5 flex items-center space-x-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-pasture-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-pasture-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-pasture-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="px-4 py-2 border-t border-orange-50 bg-gray-50/50 flex flex-wrap gap-1.5">
            {[
              "Who is the Sarpanch?",
              "Primary Health Centre?",
              "How to track complaint?"
            ].map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(promptText)}
                className="text-[10px] font-bold text-pasture-700 bg-white border border-pasture-100 hover:bg-pasture-50 px-2.5 py-1 rounded-full transition-all"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
            className="p-3 border-t border-orange-50 flex items-center space-x-2 bg-white"
          >
            {/* SPEECH-TO-TEXT BUTTON IN CHAT FOOTER */}
            <button
              type="button"
              onClick={startChatListening}
              className={`p-2 rounded-xl transition-all border flex-shrink-0 ${
                isChatListening
                  ? 'bg-red-500 border-red-500 text-white animate-pulse'
                  : 'bg-orange-50 border-orange-100 text-clay-700 hover:bg-orange-100/50'
              }`}
              title="Speak message (Speech-to-text)"
            >
              <Mic className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask GramAI anything..."
              className="flex-grow px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pasture-400 focus:border-transparent text-xs"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 bg-pasture-500 text-white hover:bg-pasture-600 disabled:bg-gray-250 rounded-xl transition-all shadow-md shadow-pasture-500/15"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Footer Area */}
      <footer className="bg-white border-t border-orange-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
          <div className="flex items-center space-x-1">
            <span>&copy; {new Date().getFullYear()} GramConnect. Developed for Rural Development Internship.</span>
          </div>
          <div className="flex items-center space-x-1 text-clay-650">
            <span>Designed with</span>
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>for Village Self-Reliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
