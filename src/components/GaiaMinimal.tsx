'use client';

import { useState, useRef, useEffect } from 'react';
import { useGaia } from '@/lib/hooks/useGaia';
import { useGaiaChat } from '@/lib/hooks/useGaiaChat';
import { Phone, PhoneCall, Loader2, MessageCircle, Send, X } from 'lucide-react';

interface GaiaMinimalProps {
  isChatActive: boolean;
  onVoiceToggle: (isActive: boolean) => void;
  onChatToggle: (isActive: boolean) => void;
}

export default function GaiaMinimal({ isChatActive, onVoiceToggle, onChatToggle }: GaiaMinimalProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useGaia();

  const {
    messages,
    isConnected: chatConnected,
    isLoading: chatLoading,
    error: chatError,
    connect: connectChat,
    disconnect: disconnectChat,
    sendMessage,
  } = useGaiaChat();

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceToggle = async () => {
    if (isProcessing || isChatActive) return; // No permitir si está procesando o chat activo
    setIsProcessing(true);

    try {
      if (isConnected) {
        // Si ya está conectado por voz, desconectar
        disconnect();
        onVoiceToggle(false);
      } else {
        // Solo conectar si no hay chat activo
        await connect();
        onVoiceToggle(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatToggle = async () => {
    if (isProcessing || isConnected) return; // No permitir si está procesando o voz activa
    setIsProcessing(true);

    try {
      if (isChatActive) {
        // Si el chat está activo, desactivar
        disconnectChat();
        onChatToggle(false);
      } else {
        // Solo activar si no hay voz activa
        await connectChat();
        onChatToggle(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
                : 'ring-4 ring-blue-400 ring-opacity-20'
            }`} />
            
            {/* Main Voice Button */}
            <button
              onClick={handleVoiceToggle}
              disabled={isConnecting || isProcessing || isChatActive}
              className={`relative w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${
                isProcessing || isChatActive
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : isConnected
                  ? 'bg-green-500 hover:bg-green-400 shadow-green-500/50'
                  : error
                  ? 'bg-red-500 hover:bg-red-400 shadow-red-500/50'
                  : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/50 text-white'
              } ${isConnecting || isProcessing ? 'animate-pulse scale-95' : !isChatActive && 'hover:scale-105'}`}
            >
              {isConnecting ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : isConnected ? (
                <PhoneCall className={`w-6 h-6 ${isConnected ? 'text-white' : 'text-white'}`} />
              ) : (
                <Phone className={`w-6 h-6 ${isConnected ? 'text-white' : 'text-white'}`} />
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
                : 'bg-blue-400'
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
              isConnected 
                ? 'text-green-400' 
                : isConnecting
                ? 'text-yellow-400'
                : isChatActive
                ? 'text-gray-400'
                : 'text-blue-400'
            }`}>
              {isConnected 
                ? '🎙️ Escuchando...' 
                : isConnecting
                ? 'Conectando...'
                : isChatActive
                ? 'Cambiar a voz'
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
              disabled={isProcessing || isConnected}
              className={`relative w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${
                isProcessing || isConnected
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : isChatActive
                  ? 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/50'
                  : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/50 text-white'
              } ${isProcessing ? 'animate-pulse scale-95' : !isConnected && 'hover:scale-105'}`}
            >
              <MessageCircle className={`w-6 h-6 ${
                isChatActive ? 'text-white' : isConnected ? 'text-gray-500' : 'text-white'
              }`} />
            </button>

            {/* Status Dot para Chat */}
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
              isChatActive 
                ? 'bg-blue-400 animate-pulse' 
                : isConnected
                ? 'bg-gray-300'
                : 'bg-blue-400'
            }`} />
          </div>
          
          {/* Chat Label */}
          <div className="text-center">
            <div className={`text-sm font-medium transition-all duration-300 ${
              isChatActive
                ? 'text-blue-400'
                : isConnected
                ? 'text-gray-400'
                : 'text-blue-400'
            }`}>
              {isChatActive
                ? '💬 Chat activo'
                : isConnected
                ? 'Cambiar a chat'
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

      {/* Ventana de Chat */}
      {isChatActive && (
        <div className="absolute bottom-full mb-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${chatConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                <h3 className="font-semibold text-sm">Chat con GAIA</h3>
              </div>
              <button
                onClick={handleChatToggle}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 rounded-2xl
                    ${message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }
                  `}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 opacity-70 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin text-gray-500" />
                    <p className="text-sm text-gray-500">GAIA está escribiendo...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {chatError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-red-600 text-sm">{chatError}</p>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={chatLoading || !chatConnected}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading || !chatConnected}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
