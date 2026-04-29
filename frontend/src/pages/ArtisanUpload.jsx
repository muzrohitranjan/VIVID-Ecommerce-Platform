import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, Languages, Wand2 } from 'lucide-react';
import AudioRecorder from '../components/AudioRecorder';

export default function ArtisanUpload() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('kannada'); // 'tamil' or 'kannada'
  const [photo, setPhoto] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'kannada' ? 'tamil' : 'kannada'));
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const img = URL.createObjectURL(e.target.files[0]);
      setPhoto(img);
    }
  };

  const handlePublish = async () => {
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: aiResult.title,
          description: aiResult.description,
          price: 0, // Default price, can be updated later
          stock: 1, // Default stock
          category: 'crafts',
          images: photo ? [photo] : []
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Product successfully published to marketplace!');
        setPhoto(null);
        setAiResult(null);
        setIsFlipped(false);
        navigate('/seller-dashboard');
      } else {
        alert('Failed to publish product: ' + result.message);
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      alert('Error publishing product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRecordingComplete = (data) => {
    setAiResult(data);
    // Execute dramatic 3D flip 
    setIsFlipped(true);
  };

  const LangContent = {
    kannada: {
      headline: 'ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಮಾರಾಟ ಮಾಡಿ',
      subhead: 'ಉತ್ಪನ್ನದ ಫೋಟೋ ಸೇರಿಸಿ ಮತ್ತು ಅದರ ಬಗ್ಗೆ ಮಾತನಾಡಿ.',
      toggle: 'ಸ್ವಿಚ್ ಭಾಷೆ (Switch to Tamil)',
      uploadPhoto: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      changePhoto: 'ಫೋಟೋ ಬದಲಾಯಿಸಿ'
    },
    tamil: {
      headline: 'உங்கள் தயாரிப்பை விற்கவும்',
      subhead: 'தயாரிப்பின் புகைப்படத்தைச் சேர்த்து, அதைப் பற்றி பேசுங்கள்.',
      toggle: 'மொழியை மாற்று (Switch to Kannada)',
      uploadPhoto: 'புகைப்படத்தை பதிவேற்றவும்',
      changePhoto: 'புகைப்படத்தை மாற்றவும்'
    }
  };

  const content = LangContent[language];

  return (
    <div className="container animate-fade-up" style={{ maxWidth: '800px' }}>
      <header className="flex-col items-center justify-center text-center stagger-1" style={{ marginBottom: '3rem' }}>
        <button 
          onClick={toggleLanguage}
          className="btn btn-secondary"
          style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-full)' }}
        >
          <Languages size={18} />
          {content.toggle}
        </button>
        <h2 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>{content.headline}</h2>
        <p className="text-muted" style={{ fontSize: '1.2rem' }}>{content.subhead}</p>
      </header>

      <div className="glass-panel stagger-2 animate-fade-up" style={{ padding: '2rem', marginBottom: '3rem', transformStyle: 'preserve-3d' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ImageIcon /> 1. {content.uploadPhoto}
        </h3>
        
        <label style={{
          display: 'block',
          width: '100%',
          height: photo ? 'auto' : '280px',
          border: '2px dashed #cbd5e1',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          background: 'var(--color-surface)',
          overflow: 'hidden',
          transition: 'all 0.3s ease-out',
          boxShadow: photo ? 'var(--shadow-lg)' : 'none'
        }}>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          {photo ? (
            <div style={{ position: 'relative' }}>
              <img src={photo} alt="Preview" style={{ width: '100%', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', backdropFilter: 'blur(10px)' }}>
                {content.changePhoto}
              </div>
            </div>
          ) : (
            <div className="flex-col items-center justify-center" style={{ height: '100%', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              <Upload size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Click or tap to upload photo from your phone</p>
            </div>
          )}
        </label>
      </div>

      <div className="stagger-3 animate-fade-up perspective-container" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wand2 /> 2. Describe with GenAI
        </h3>
        
        <div className="flip-container">
          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
            
            {/* FRONT SIDE: Recording UI */}
            <div className="flip-face flip-front" style={{ background: 'var(--color-surface)', padding: '0.5rem' }}>
               <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            </div>

            {/* BACK SIDE: AI Result UI */}
            <div className="flip-face flip-back" style={{ background: 'var(--color-surface)', padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-success)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wand2 size={24} /> English Listing Generated!
                </p>
                <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-full)' }} onClick={() => { setAiResult(null); setIsFlipped(false); }}>
                  Redo Voice Note
                </button>
              </div>
              
              {aiResult && (
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Translated Title</p>
                    <h4 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary)' }}>{aiResult.title}</h4>
                  </div>

                  <div>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Enhanced Description</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.6 }}>{aiResult.description}</p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      <div className="stagger-4 animate-fade-up" style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
        <button 
          className="btn btn-primary w-full" 
          disabled={!photo || !aiResult || uploading}
          onClick={handlePublish}
          style={{ 
            padding: '1.5rem', 
            fontSize: '1.5rem', 
            opacity: (!photo || !aiResult) ? 0.5 : 1,
            boxShadow: (!photo || !aiResult) ? 'none' : 'var(--shadow-lg)'
          }}
        >
          {uploading ? 'Publishing...' : 'Publish to Marketplace'}
        </button>
      </div>
    </div>
  );
}
