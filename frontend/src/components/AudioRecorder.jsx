import React, { useState, useEffect } from 'react';
import { Mic, Square, Loader, CheckCircle2 } from 'lucide-react';

export default function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);

    // Simulate GenAI transcription & translation pipeline (3 seconds)
    setTimeout(() => {
      setIsProcessing(false);
      onRecordingComplete({
        title: "Traditional Hand-carved Wooden Temple",
        description: "Intricately carved from aged teak wood, preserving centuries-old coastal carpentry techniques. Features traditional floral motifs and brass bells. Perfectly suited for placing idols or as a centerpiece in your living space.",
        originalAudioLength: recordingTime
      });
    }, 3000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isProcessing) {
    return (
      <div className="flex-col items-center justify-center" style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-primary)' }}>
        <Loader size={48} className="spin" color="var(--color-primary)" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--color-primary)' }}>GenAI is transcribing...</h3>
        <p className="text-muted">Translating your local language into an English listing.</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      background: isRecording ? 'rgba(230, 57, 70, 0.05)' : 'var(--color-surface)', 
      borderRadius: 'var(--radius-lg)', 
      border: `2px dashed ${isRecording ? 'var(--color-danger)' : '#cbd5e1'}`,
      textAlign: 'center',
      transition: 'all var(--transition-normal)'
    }}>
      
      {!isRecording ? (
        <>
          <div className="animated-border" style={{ 
            width: '100px', height: '100px', 
            margin: '0 auto 1.5rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%'
          }}>
            <button 
              onClick={handleStartRecording}
              style={{
                background: 'var(--color-danger)',
                color: 'white',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(230, 57, 70, 0.6)',
                transform: 'translateZ(20px)',
                position: 'relative',
                zIndex: 10
              }}
            >
              <Mic size={36} />
            </button>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Speak to Describe</h3>
          <p className="text-muted">Tap to record your product details in our supported native languages.</p>
        </>
      ) : (
        <>
          <button 
            onClick={handleStopRecording}
            style={{
              background: 'var(--color-text-dark)',
              color: 'white',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              animation: 'pulse 1.5s infinite'
            }}
          >
            <Square size={32} fill="white" />
          </button>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-danger)' }}>Recording...</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(recordingTime)}</p>

          <style>
            {`
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.7); }
                70% { box-shadow: 0 0 0 20px rgba(230, 57, 70, 0); }
                100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
              }
            `}
          </style>
        </>
      )}
    </div>
  );
}
