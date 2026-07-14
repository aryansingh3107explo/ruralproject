import React, { useState, useRef } from 'react';
import { insforge } from '../utils/insforge';
import { 
  Upload, X, Check, Copy, AlertCircle, Sparkles, User, Phone, MapPin, 
  Tag, AlignLeft, Heading, ShieldQuestion, Mic, MicOff, Printer 
} from 'lucide-react';
import { exportComplaintToPDF } from '../utils/pdfExport';
import { API_URL } from '../utils/config';

export default function SubmitComplaint({ showToast, lang, t }) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    villageName: '',
    title: '',
    category: '',
    description: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [submittedId, setSubmittedId] = useState('');
  const [copied, setCopied] = useState(false);
  
  // GramAI states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedDept, setSuggestedDept] = useState('');

  const analyzeWithAI = async () => {
    if (!formData.description.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/ai/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description.trim() })
      });
      if (!response.ok) throw new Error('AI analysis failed');
      const result = await response.json();
      
      // Auto populate fields
      setFormData(prev => ({
        ...prev,
        category: result.category || prev.category,
        title: result.summary || prev.title || result.category
      }));
      setSuggestedDept(result.department || '');
      
      if (showToast) {
        showToast(`GramAI: Automatically classified and summarized!`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('GramAI analysis completed with defaults.', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileInputRef = useRef(null);
  const categories = ['Water Supply', 'Roads', 'Electricity', 'Sanitation'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB');
        if (showToast) showToast('Image file size should be less than 5MB', 'error');
        return;
      }
      setPhoto(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(submittedId);
    setCopied(true);
    if (showToast) showToast(t('copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const tempComplaint = {
      id: submittedId,
      citizen_name: formData.fullName,
      mobile_number: formData.mobileNumber,
      village_name: formData.villageName,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      image_path: photoPreview || null,
      created_at: new Date().toISOString()
    };
    exportComplaintToPDF(tempComplaint);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (showToast) showToast('Speech recognition not supported in this browser. Try Chrome.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    // Maps active language to speech input locale
    if (lang === 'mr') recognition.lang = 'mr-IN';
    else if (lang === 'hi') recognition.lang = 'hi-IN';
    else recognition.lang = 'en-US';

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      if (showToast) showToast('Recording started. Speak now...', 'info');
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
      if (showToast) showToast('Audio capturing failed. Try again.', 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setFormData(prev => ({
        ...prev,
        description: prev.description ? prev.description + " " + speechToText : speechToText
      }));
      if (showToast) showToast('Speech captured successfully!', 'success');
    };

    recognition.start();
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      errors.mobileNumber = 'Must be a 10-digit number';
    }
    if (!formData.villageName.trim()) errors.villageName = 'Village name is required';
    if (!formData.title.trim()) errors.title = 'Complaint title is required';
    if (!formData.category) errors.category = 'Please select a category';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (validateForm()) {
      setShowConfirm(true);
    } else {
      if (showToast) showToast('Please correct validation errors', 'error');
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('citizen_name', formData.fullName.trim());
      payload.append('mobile_number', formData.mobileNumber.trim());
      payload.append('village_name', formData.villageName.trim());
      payload.append('title', formData.title.trim());
      payload.append('category', formData.category);
      payload.append('description', formData.description.trim());
      
      if (photo) {
        const { data: uploadData, error: uploadError } = await insforge.storage
          .from('uploads')
          .uploadAuto(photo);
        
        if (uploadError) {
          throw new Error(`InsForge Storage Upload failed: ${uploadError.message || uploadError}`);
        }
        
        if (uploadData) {
          payload.append('image_path', uploadData.url);
          payload.append('image_key', uploadData.key);
        }
      }

      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        body: payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit complaint');
      }

      const result = await response.json();
      setSubmittedId(result.id);
      if (showToast) showToast('Complaint registered!', 'success');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
      if (showToast) showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      mobileNumber: '',
      villageName: '',
      title: '',
      category: '',
      description: ''
    });
    setPhoto(null);
    setPhotoPreview(null);
    setSubmittedId('');
    setError('');
    setValidationErrors({});
  };

  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="bg-white border border-pasture-100 rounded-3xl p-8 text-center shadow-xl space-y-6 animate-float">
          <div className="mx-auto w-16 h-16 bg-pasture-50 border border-pasture-100 text-pasture-600 rounded-2xl flex items-center justify-center shadow-md">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('successTitle')}</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">{t('successDesc')}</p>
          </div>

          <div className="bg-gradient-to-r from-clay-50 to-orange-50/50 p-6 rounded-2xl border border-clay-100 max-w-md mx-auto space-y-3">
            <p className="text-xs font-semibold text-clay-700 tracking-wider uppercase">Your Unique Complaint ID</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl font-black text-clay-800 font-mono tracking-wider">{submittedId}</span>
              <button 
                onClick={copyIdToClipboard}
                className="p-2 hover:bg-clay-100 text-clay-600 hover:text-clay-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="h-5 w-5 text-pasture-600" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-3 bg-white hover:bg-orange-50/50 text-clay-700 font-bold rounded-xl border border-clay-200 shadow-sm transition-all flex items-center justify-center"
            >
              <Printer className="h-4.5 w-4.5 mr-2" />
              Download Receipt PDF
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-clay-500 hover:bg-clay-600 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center"
            >
              Submit Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 relative">
      <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-clay-500 to-clay-600 px-6 py-8 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="h-6 w-6 text-mustard-300 animate-pulse" />
            <h2 className="text-2xl font-black tracking-tight">{t('submit')}</h2>
          </div>
          <p className="text-clay-100 text-sm">
            Report civic, water, electricity, or road issues directly to the administration.
          </p>
        </div>

        <form onSubmit={handlePreSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl flex items-center space-x-2 text-sm shadow-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <User className="h-3.5 w-3.5 mr-1 text-clay-500" />
                {t('fullName')}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationErrors.fullName ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-clay-400'
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              />
              {validationErrors.fullName && (
                <p className="text-xs text-red-650 flex items-center font-semibold">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1 text-clay-500" />
                {t('mobileNumber')}
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                maxLength="10"
                placeholder="10-digit mobile number"
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationErrors.mobileNumber ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-clay-400'
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              />
              {validationErrors.mobileNumber && (
                <p className="text-xs text-red-650 flex items-center font-semibold">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.mobileNumber}
                </p>
              )}
            </div>

            {/* Village Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-clay-500" />
                {t('villageName')}
              </label>
              <input
                type="text"
                name="villageName"
                value={formData.villageName}
                onChange={handleInputChange}
                placeholder="Enter village name"
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationErrors.villageName ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-clay-400'
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              />
              {validationErrors.villageName && (
                <p className="text-xs text-red-650 flex items-center font-semibold">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.villageName}
                </p>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1 text-clay-500" />
                {t('category')}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  validationErrors.category ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-clay-400'
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="text-xs text-red-650 flex items-center font-semibold">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.category}
                </p>
              )}
            </div>
          </div>

          {/* Complaint Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
              <Heading className="h-3.5 w-3.5 mr-1 text-clay-500" />
              {t('compTitle')}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief summary of the issue"
              className={`w-full px-4 py-3 rounded-xl border ${
                validationErrors.title ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-clay-400'
              } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {validationErrors.title && (
              <p className="text-xs text-red-650 flex items-center font-semibold">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Description with Voice Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <AlignLeft className="h-3.5 w-3.5 mr-1 text-clay-500" />
                {t('compDesc')}
              </label>
              
              <div className="flex items-center space-x-2">
                {/* MICROPHONE BUTTON FOR VOICE INPUT */}
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-orange-50 border border-orange-100 hover:bg-orange-100/50 text-clay-700'
                  }`}
                  title="Voice Input (Speech-to-text)"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 mr-1" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 mr-1" />
                      Voice Input
                    </>
                  )}
                </button>

                {/* GramAI CLASSIFICATION BUTTON */}
                <button
                  type="button"
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing || !formData.description.trim()}
                  className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isAnalyzing
                      ? 'bg-pasture-500 border-pasture-500 text-white animate-pulse'
                      : 'bg-pasture-50 border-pasture-100 hover:bg-pasture-100/50 text-pasture-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  title="Scan text with GramAI to auto-classify and summarize"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-pasture-600 group-hover:text-pasture-800" />
                  {isAnalyzing ? 'Scanning...' : 'Scan with GramAI'}
                </button>
              </div>
            </div>
            
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Explain the problem in detail (or tap microphone to speak)..."
              className={`w-full px-4 py-3 rounded-xl border ${
                validationErrors.description ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-clay-400'
              } focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
            ></textarea>
            
            {validationErrors.description && (
              <p className="text-xs text-red-650 flex items-center font-semibold">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.description}
              </p>
            )}

            <p className="text-[10px] font-semibold text-gray-400 italic mt-0.5">
              💡 {t('voiceAlert')}
            </p>

            {suggestedDept && (
              <div className="bg-pasture-50/70 border border-pasture-100 rounded-2xl p-4 flex items-center space-x-3 mt-3 animate-float text-xs font-semibold text-pasture-800">
                <Sparkles className="h-5 w-5 text-pasture-550 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-pasture-500 tracking-wider">GramAI Routing Suggestion</p>
                  <p className="text-gray-805 font-bold mt-0.5">{suggestedDept}</p>
                </div>
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
              <Upload className="h-3.5 w-3.5 mr-1 text-clay-500" />
              {t('uploadPhoto')} ({t('optional')})
            </label>
            
            {photoPreview ? (
              <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-2 max-w-sm">
                <img src={photoPreview} alt="Complaint preview" className="rounded-xl max-h-48 object-contain w-full" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-4 right-4 bg-gray-900/70 hover:bg-gray-950 text-white p-1.5 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-clay-400 hover:bg-clay-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-clay-500 hover:bg-clay-600 disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-lg shadow-clay-500/10 hover:shadow-clay-500/20 transition-all text-center flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                  <span>{t('loading')}</span>
                </>
              ) : (
                <span>{t('submitBtn')}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-gray-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-orange-100 shadow-2xl space-y-4 animate-float">
            <div className="flex items-center space-x-3 text-clay-700">
              <div className="p-2 bg-clay-50 rounded-xl border border-clay-100">
                <ShieldQuestion className="h-6 w-6 text-clay-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Grievance Submission</h3>
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed">
              Are you sure you want to submit this complaint to the Gram Panchayat authority? Please ensure your contact details and description are accurate.
            </p>

            <div className="border-t border-gray-100 pt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                {t('goBack')}
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 bg-clay-500 hover:bg-clay-600 text-white font-bold rounded-xl shadow-md text-sm transition-all"
              >
                {t('confirmSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
