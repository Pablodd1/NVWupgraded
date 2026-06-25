import React, { useState, useEffect } from 'react';
import { ShieldAlert, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface ApiHealthMonitorProps {
  language: Language;
  isConnected?: boolean;
  isReconnecting?: boolean;
}

const ApiHealthMonitor: React.FC<ApiHealthMonitorProps> = ({ 
  language, 
  isConnected = true,
  isReconnecting = false 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Validate API Key presence
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    setHasApiKey(!!key);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatus = () => {
    if (!hasApiKey) return 'no-key';
    if (!isOnline) return 'offline';
    if (isReconnecting) return 'reconnecting';
    if (!isConnected) return 'disconnected';
    return 'healthy';
  };

  const status = getStatus();

  const getContent = () => {
    switch (status) {
      case 'no-key':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          dotColor: 'bg-red-500',
          text: language === 'en' ? 'API Key Missing' : 'Falta API Key',
          icon: <ShieldAlert size={12} className="text-red-500 animate-pulse" />
        };
      case 'offline':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          dotColor: 'bg-red-500',
          text: language === 'en' ? 'Network Offline' : 'Sin Internet',
          icon: <WifiOff size={12} className="text-red-500" />
        };
      case 'reconnecting':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dotColor: 'bg-amber-500 animate-pulse',
          text: language === 'en' ? 'Reconnecting...' : 'Reconectando...',
          icon: <Loader2 size={12} className="text-amber-500 animate-spin" />
        };
      case 'disconnected':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dotColor: 'bg-amber-500',
          text: language === 'en' ? 'Connection Lost' : 'Conexión Perdida',
          icon: <WifiOff size={12} className="text-amber-500" />
        };
      case 'healthy':
      default:
        return {
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500',
          text: language === 'en' ? 'API Active' : 'Conexión Activa',
          icon: <Wifi size={12} className="text-emerald-600" />
        };
    }
  };

  const ui = getContent();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm ${ui.color}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        {status === 'healthy' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${ui.dotColor}`}></span>
      </span>
      {ui.icon}
      <span>{ui.text}</span>
    </div>
  );
};

export default ApiHealthMonitor;
