import React, { useRef, useEffect, useState } from 'react';
import { Upload, RefreshCw, Camera, Grid3X3, Eye } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera sensor. Please ensure permissions are granted for clinical capture.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
        onCapture(dataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in flex-1 justify-center">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl md:text-5xl text-slate-900 tracking-tight">Clinical Capture</h2>
        <p className="text-slate-400 text-[11px] uppercase tracking-[0.3em] mt-3 font-black">Biometric Symmetry Sensor</p>
      </div>
      
      <div className="relative w-full aspect-[4/5] md:aspect-video bg-slate-200 overflow-hidden shadow-2xl group border-[1px] border-slate-100 rounded-[2.5rem] ring-1 ring-slate-200/50">
        {!stream && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <div className="w-10 h-10 border-[3px] border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <span className="text-[10px] uppercase tracking-widest font-black">Synchronizing Sensor...</span>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-50 p-12 text-center">
            <p className="mb-8 font-serif text-2xl italic leading-relaxed">{error}</p>
            <button 
              onClick={startCamera}
              className="px-12 py-5 bg-slate-800 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-slate-700 transition shadow-xl rounded-2xl"
            >
              Retry Sensor
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
        )}
        
        {!error && stream && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="absolute top-[38%] w-full border-t border-amber-600/20 flex justify-between px-6">
                  <span className="text-[9px] text-amber-600/40 uppercase font-black -mt-5">Interpupillary Horizon</span>
                </div>

                <div className="absolute left-1/2 h-full border-l border-amber-600/20 -translate-x-1/2 flex flex-col justify-end pb-10">
                  <span className="text-[9px] text-amber-600/40 uppercase font-black vertical-text ml-1 mb-2">Facial Midline</span>
                </div>

                <div className="absolute top-[58%] left-1/2 -translate-x-1/2 w-[45%] h-[25%] border-[1px] border-dashed border-white/30 rounded-[100%/50%]"></div>

                <div className="absolute top-6 right-6 bg-white/40 backdrop-blur-xl text-slate-800 px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest border border-white/50 flex items-center gap-3 shadow-sm">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   Calibrated
                </div>
            </div>
        )}
        
        <div className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center items-center gap-10 md:gap-16 z-20">
          <label className="group flex flex-col items-center gap-3 cursor-pointer text-white/80 hover:text-white transition-all">
            <div className="p-5 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 group-hover:bg-amber-600 transition-colors shadow-lg">
                <Upload className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-black drop-shadow-md">Import</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
          
          <button 
            onClick={takePhoto}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-transparent border-[6px] border-white/80 flex items-center justify-center hover:scale-105 transition shadow-2xl active:scale-90"
          >
            <div className="w-14 h-14 md:w-18 md:h-18 rounded-full bg-white shadow-inner" />
          </button>
          
          <button 
            onClick={startCamera}
            className="group flex flex-col items-center gap-3 text-white/80 hover:text-white transition-all">
            <div className="p-5 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 group-hover:bg-amber-600 transition-colors shadow-lg">
                <RefreshCw className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-black drop-shadow-md">Sync</span>
          </button>
        </div>
      </div>
      
      <p className="text-slate-400 text-[11px] md:text-xs uppercase tracking-[0.25em] text-center max-w-xl mt-12 font-medium px-6 leading-relaxed">
        Align your eyes with the interpupillary line and center your features for optimal biometric analysis.
      </p>
      
      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
};