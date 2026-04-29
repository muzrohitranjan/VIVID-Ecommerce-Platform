import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mic, RotateCcw, Wand2, Globe, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

const SellerUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: 1
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [aiDesc, setAiDesc] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // ML Features via Proxy (Node -> Python)
  const generateAIDesc = async () => {
    if (!formData.name || !formData.category || !formData.price) return;
    try {
      const res = await axios.post('/api/seller/ml/generate-desc', formData, { timeout: 10000 });
      setAiDesc(res.data.description);
    } catch (err) {
      alert('AI generation failed. Using mock: Premium ' + formData.category + ' - ' + formData.name);
      setAiDesc(`Premium ${formData.category}: ${formData.name} - ₹${formData.price}. Handcrafted with love!`);
    }
  };

  const translateText = async () => {
    try {
      const text = formData.description || voiceText;
      const res = await axios.post('/api/seller/ml/translate', { text, lang: 'ta' });
      setTranslatedText(res.data.translated);
      setFormData(prev => ({ ...prev, description: res.data.translated }));
    } catch (err) {
      alert('Translation failed. Using original text.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const formDataSTT = new FormData();
        formDataSTT.append('audio', audioBlob, 'voice.wav');
        
        try {
          const res = await axios.post('/api/seller/ml/stt', formDataSTT, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 15000
          });
          setVoiceText(res.data.text);
          setFormData(prev => ({ ...prev, description: res.data.text }));
        } catch (err) {
          alert('STT failed. Mock transcription used.');
          setVoiceText('Handcrafted product description from voice');
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = null;
      if (image) {
        const imageForm = new FormData();
        imageForm.append('file', image);
        const imgRes = await axios.post('/api/seller/upload-image', imageForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = imgRes.data.image_url;
      }

      const token = localStorage.getItem('token');
      await axios.post('/api/seller/products', { 
        ...formData, 
        image_url: imageUrl 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Product uploaded successfully!');
      navigate('/seller-dashboard');
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🚀 Add Product with AI Magic
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload, speak, translate, AI enhance - all in one place!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12">
          {/* Product Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
              <input name="name" onChange={handleInputChange} required className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <input name="category" onChange={handleInputChange} required className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
              <input name="price" type="number" step="0.01" onChange={handleInputChange} required className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
              <input name="stock" type="number" min="0" onChange={handleInputChange} value={formData.stock} className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon size={24} /> Product Image
            </label>
            <div className="border-4 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-indigo-400 transition-all bg-gradient-to-b from-gray-50 to-white">
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer block">
                {image ? (
                  <div className="space-y-2">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-32 h-32 mx-auto object-cover rounded-2xl shadow-lg" />
                    <p className="text-sm text-gray-600">{image.name}</p>
                    <button type="button" onClick={() => setImage(null)} className="text-red-500 hover:text-red-700 flex mx-auto items-center gap-1">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={48} className="mx-auto text-gray-400" />
                    <p className="text-lg font-semibold text-gray-700">Click to upload product photo</p>
                    <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Description & AI Tools */}
          <div className="mb-12">
            <label className="block text-lg font-bold text-gray-800 mb-4">✨ Description (Voice/AI/Translate)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter description manually, or use AI/Voice/Translate below..."
              className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 resize-vertical min-h-[120px] text-lg"
            />
            
            {/* AI Magic Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-indigo-100">
              <button
                type="button"
                onClick={generateAIDesc}
                disabled={!formData.name || !formData.category || !formData.price}
                className="group p-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 size={28} className="group-hover:rotate-12 transition-transform" />
                <span>AI Description</span>
              </button>
              
              <button
                type="button"
                onClick={translateText}
                className="p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex flex-col items-center gap-2"
              >
                <Globe size={28} className="animate-spin-slow" />
                <span>Translate</span>
                <small className="text-xs opacity-90">(TA→EN)</small>
              </button>

              <div className={`p-6 rounded-2xl shadow-xl border-2 transition-all ${recording ? 'border-red-400 bg-red-50' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'} flex flex-col items-center gap-2 cursor-pointer group hover:shadow-2xl hover:-translate-y-1`}
                   onClick={recording ? stopRecording : startRecording}>
                <Mic size={28} className={`transition-all ${recording ? 'text-red-500 animate-pulse scale-110' : 'text-blue-500 group-hover:scale-110'}`} />
                <span className={`font-semibold ${recording ? 'text-red-600' : 'text-blue-600'}`}>
                  {recording ? 'Recording...' : 'Voice Input'}
                </span>
                {recording && <div className="w-20 h-2 bg-red-400 rounded-full animate-pulse" />}
              </div>

              <button
                type="button"
                onClick={() => navigate('/seller-dashboard')}
                className="p-6 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex flex-col items-center gap-2"
              >
                <RotateCcw size={24} />
                <span>My Products</span>
              </button>
            </div>

            {/* Results Preview */}
            <div className="mt-8 space-y-4">
              {aiDesc && (
                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
                      <Wand2 size={20} className="text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-green-800">AI Generated Description</h4>
                  </div>
                  <p className="text-green-900 leading-relaxed">{aiDesc}</p>
                </div>
              )}
              {voiceText && (
                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                      <Mic size={20} className="text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-blue-800">Voice Transcription</h4>
                  </div>
                  <p className="text-blue-900 leading-relaxed">{voiceText}</p>
                </div>
              )}
              {translatedText && (
                <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-2xl flex items-center justify-center">
                      <Globe size={20} className="text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-purple-800">Translated Text</h4>
                  </div>
                  <p className="text-purple-900 leading-relaxed">{translatedText}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-4 border-indigo-100">
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.category || !formData.price}
              className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-6 px-8 rounded-3xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload size={28} />
                  Publish to Marketplace
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/seller-dashboard')}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-6 px-8 rounded-3xl text-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              View My Products
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerUpload;

