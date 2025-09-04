'use client';

import { useState } from 'react';
import { useGaia } from '@/lib/hooks/useGaia';
import { Mic, MicOff, Power, PowerOff, Volume2, VolumeX, X } from 'lucide-react';

interface GaiaSimpleProps {
  className?: string;
  onClose?: () => void;
}

export default function GaiaSimple({ className = '', onClose }: GaiaSimpleProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    isConnected,
    isConnecting,
    isListening,
    error,
    connect,
    disconnect,
    startListening,
    stopListening,
    clearError,
  } = useGaia({
    onLog: (message) => {
      setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    },
  });

  const toggleListening = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${isMuted ? '🔊 Audio activado' : '🔇 Audio silenciado'}`]);
  };

  if (isMinimized) {
    return (
      <div className={`bg-blue-500 hover:bg-blue-600 rounded-full p-3 shadow-lg cursor-pointer transition-all duration-200 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-white"
        >
          <span className="text-lg">🤖</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-lg">🤖</span>
            <div>
              <h3 className="text-white font-semibold">GAIA</h3>
              <p className="text-blue-100 text-xs">Asistente Palmicultor</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="2" y="5" width="8" height="2" />
              </svg>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="mt-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-100 text-xs">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              Conectado y listo
            </div>
          ) : isConnecting ? (
            <div className="flex items-center gap-1 text-yellow-100 text-xs">
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-spin"></div>
              Conectando...
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-200 text-xs">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Desconectado
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3">
          <div className="flex justify-between items-start">
            <p className="text-red-700 text-xs">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Connect/Disconnect */}
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isConnected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isConnected ? <PowerOff size={14} /> : <Power size={14} />}
            {isConnecting ? 'Conectando...' : isConnected ? 'Desconectar' : 'Conectar'}
          </button>

          {/* Voice Control */}
          <button
            onClick={toggleListening}
            disabled={!isConnected}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isListening
                ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? <Mic size={14} /> : <MicOff size={14} />}
            {isListening ? 'Escuchando' : 'Hablar'}
          </button>
        </div>

        {/* Audio Control */}
        <button
          onClick={toggleMute}
          disabled={!isConnected}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isMuted
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {isMuted ? 'Audio Silenciado' : 'Audio Activo'}
        </button>

        {/* Quick Info */}
        {isConnected && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 leading-relaxed">
              💬 <strong>Prueba preguntar:</strong><br />
              &quot;¿Qué es GUAICARAMO?&quot;<br />
              &quot;Cuéntame sobre SIRIUS&quot;<br />
              &quot;¿Qué productos tiene Del Llano?&quot;
            </p>
          </div>
        )}
      </div>

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {logs.slice(-3).map((log, index) => (
              <p key={index} className="text-xs text-gray-600 font-mono">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
