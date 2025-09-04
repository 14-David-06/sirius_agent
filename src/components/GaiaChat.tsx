'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { useGaiaChat } from '../lib/hooks/useGaiaChat';

interface GaiaChatProps {
  isVoiceActive: boolean;
  onChatToggle: (isActive: boolean) => void;
}

export default function GaiaChat({ isVoiceActive, onChatToggle }: GaiaChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    sendMessage,
  } = useGaiaChat();

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = async () => {
    if (isVoiceActive) {
      // Si la voz está activa, no permitir abrir chat
      return;
    }

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      await connect();
      onChatToggle(true);
    } else {
      disconnect();
      onChatToggle(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

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
    <div className="flex flex-col items-center mt-4">
      {/* Botón de Chat */}
      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={isVoiceActive}
          className={`
            relative group
            w-12 h-12 rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-in-out
            shadow-lg hover:shadow-xl
            ${isVoiceActive 
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : isConnected 
                ? 'bg-green-500 hover:bg-green-600 active:scale-95' 
                : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }
          `}
        >
          {/* Anillos de estado */}
          {isConnected && !isVoiceActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-30"></div>
            </>
          )}
          
          <MessageCircle 
            size={20} 
            className="text-white" 
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isVoiceActive 
              ? 'Desactiva modo voz'
              : isConnected 
                ? 'Cerrar chat'
                : 'Chat con GAIA'
            }
          </div>
        </button>
      </div>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="absolute bottom-full mb-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                <h3 className="font-semibold text-sm">Chat con GAIA</h3>
              </div>
              <button
                onClick={handleToggle}
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
            
            {isLoading && (
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
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-red-600 text-sm">{error}</p>
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
                disabled={isLoading || !isConnected}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading || !isConnected}
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
