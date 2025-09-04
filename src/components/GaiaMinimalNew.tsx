'use client';

import { useGaia } from '@/lib/hooks/useGaia';
import { Phone, PhoneCall, Loader2, MessageCircle } from 'lucide-react';

interface GaiaMinimalProps {
  isChatActive: boolean;
  onVoiceToggle: (isActive: boolean) => void;
  onChatToggle: (isActive: boolean) => void;
}

export default function GaiaMinimal({ isChatActive, onVoiceToggle, onChatToggle }: GaiaMinimalProps) {
  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useGaia();

  const handleVoiceToggle = async () => {
    if (isChatActive) {
      // Si el chat está activo, no permitir activar voz
      return;
    }

    if (isConnected) {
      disconnect();
      onVoiceToggle(false);
    } else {
      await connect();
      onVoiceToggle(true);
    }
  };

  const handleChatToggle = () => {
    if (isConnected) {
      // Si la voz está activa, no permitir activar chat
      return;
    }
    onChatToggle(!isChatActive);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Botones en línea horizontal */}
      <div className="flex items-start space-x-12 mb-4">
        {/* Botón de Voz */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            {/* Outer Glow Ring */}
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isConnected 
                ? 'ring-8 ring-green-400 ring-opacity-20 animate-pulse scale-110' 
                : isConnecting
                ? 'ring-6 ring-blue-400 ring-opacity-30 animate-spin scale-105'
                : 'ring-4 ring-white ring-opacity-20'
            }`} />
            
            {/* Main Voice Button */}
            <button
              onClick={handleVoiceToggle}
              disabled={isConnecting || isChatActive}
              className={`relative w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${
                isChatActive
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : isConnected
                  ? 'bg-green-500 hover:bg-green-400 shadow-green-500/50'
                  : error
                  ? 'bg-red-500 hover:bg-red-400 shadow-red-500/50'
                  : 'bg-white hover:bg-gray-50 shadow-black/20'
              } ${isConnecting ? 'animate-pulse scale-95' : !isChatActive && 'hover:scale-105'}`}
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
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-6 bg-green-400 rounded-full animate-pulse opacity-70" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse opacity-90" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse opacity-80" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Voice Label */}
          <div className="text-center">
            <div className={`text-sm font-medium transition-all duration-300 ${
              isChatActive
                ? 'text-gray-400'
                : isConnected 
                ? 'text-green-400' 
                : isConnecting
                ? 'text-yellow-400'
                : 'text-white'
            }`}>
              {isChatActive
                ? 'Chat activo'
                : isConnected 
                ? '🎙️ Escuchando...' 
                : isConnecting
                ? 'Conectando...'
                : 'Hablar con GAIA'
              }
            </div>
          </div>
        </div>

        {/* Botón de Chat */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            {/* Anillos de estado para chat */}
            {isChatActive && (
              <>
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-pulse opacity-30"></div>
              </>
            )}
            
            {/* Main Chat Button */}
            <button
              onClick={handleChatToggle}
              disabled={isConnected}
              className={`relative w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${
                isConnected
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : isChatActive
                  ? 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/50'
                  : 'bg-white hover:bg-gray-50 shadow-black/20'
              } ${!isConnected && 'hover:scale-105'}`}
            >
              <MessageCircle className={`w-6 h-6 ${
                isChatActive ? 'text-white' : isConnected ? 'text-gray-500' : 'text-gray-700'
              }`} />
            </button>

            {/* Status Dot para Chat */}
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
              isChatActive 
                ? 'bg-blue-400 animate-pulse' 
                : isConnected
                ? 'bg-gray-300'
                : 'bg-gray-400'
            }`} />
          </div>
          
          {/* Chat Label */}
          <div className="text-center">
            <div className={`text-sm font-medium transition-all duration-300 ${
              isConnected
                ? 'text-gray-400'
                : isChatActive
                ? 'text-blue-400'
                : 'text-white'
            }`}>
              {isConnected
                ? 'Voz activa'
                : isChatActive
                ? '💬 Chat activo'
                : 'Chatear con GAIA'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Error Display - Centrado debajo de ambos botones */}
      {error && (
        <div className="text-xs text-red-400 mt-2 max-w-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}
