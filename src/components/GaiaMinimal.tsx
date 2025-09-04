'use client';

import { useState } from 'react';
import { useGaia } from '@/lib/hooks/useGaia';
import { Phone, PhoneCall, Loader2, X } from 'lucide-react';

export default function GaiaMinimal() {
  const [showDetails, setShowDetails] = useState(false);

  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useGaia();

  const handleToggleConnection = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Main Call Button - Centrado */}
      <div className="relative mb-4">
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isConnected 
            ? 'ring-8 ring-green-400 ring-opacity-20 animate-pulse scale-110' 
            : isConnecting
            ? 'ring-6 ring-blue-400 ring-opacity-30 animate-spin scale-105'
            : 'ring-4 ring-white ring-opacity-20'
        }`} />
        
        {/* Main Button */}
        <button
          onClick={handleToggleConnection}
          disabled={isConnecting}
          className={`relative w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${
            isConnected
              ? 'bg-green-500 hover:bg-green-400 shadow-green-500/50'
              : error
              ? 'bg-red-500 hover:bg-red-400 shadow-red-500/50'
              : 'bg-white hover:bg-gray-50 shadow-black/20'
          } ${isConnecting ? 'animate-pulse scale-95' : 'hover:scale-105'}`}
        >
          {isConnecting ? (
            <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
          ) : isConnected ? (
            <PhoneCall className={`w-6 h-6 ${isConnected ? 'text-white' : 'text-gray-700'}`} />
          ) : (
            <Phone className={`w-6 h-6 ${isConnected ? 'text-white' : 'text-gray-700'}`} />
          )}
        </button>

        {/* Status Dot */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
          isConnected 
            ? 'bg-green-400 animate-pulse' 
            : isConnecting
            ? 'bg-yellow-400 animate-bounce'
            : error
            ? 'bg-red-400'
            : 'bg-gray-400'
        }`} />

        {/* Voice Activity Bars */}
        {isConnected && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse opacity-80"></div>
              <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse opacity-90" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse opacity-80" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Label/Status Text */}
      <div className="text-center mb-2">
        <div className={`text-sm font-medium transition-all duration-300 ${
          isConnected 
            ? 'text-green-400' 
            : isConnecting
            ? 'text-yellow-400'
            : 'text-white'
        }`}>
          {isConnected 
            ? '🎙️ Escuchando...' 
            : isConnecting
            ? 'Conectando con GAIA...'
            : 'Hablar con GAIA'
          }
        </div>
        
        {!isConnected && !isConnecting && (
          <div className="text-xs text-gray-400 mt-1">
            Toca el teléfono para comenzar
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-xs text-red-400 mt-2 max-w-xs">
            {error}
          </div>
        )}
      </div>

      {/* Info Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-white/60 hover:text-white text-xs transition-colors mb-2"
      >
        ¿Qué puedo preguntarle a GAIA?
      </button>

      {/* Elegant Info Panel */}
      {showDetails && (
        <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-black bg-opacity-60 text-white rounded-2xl p-4 max-w-72 backdrop-blur-md border border-white/10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium">🤖 GAIA</h3>
                <p className="text-xs text-gray-300">Especialista Palmicultor</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Topics */}
            <div className="text-xs text-gray-400">
              <p className="mb-2 text-gray-300">Pregunta sobre:</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>GUAICARAMO S.A.S</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>SIRIUS Regenerative Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Del Llano Alto Oleico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span>FEDEPALMA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
