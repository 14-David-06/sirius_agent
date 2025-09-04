'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2, 
  Mic, 
  MicOff, 
  Download, 
  Trash2, 
  MoreVertical,
  FileText,
  Volume2
} from 'lucide-react';
import { useGaiaChat } from '../lib/hooks/useGaiaChat';

interface GaiaChatProps {
  isVoiceActive: boolean;
  onChatToggle: (isActive: boolean) => void;
}

export default function GaiaChat({ isVoiceActive, onChatToggle }: GaiaChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages
  } = useGaiaChat();

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (isVoiceActive) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      await connect();
      onChatToggle(true);
    } else {
      disconnect();
      onChatToggle(false);
      setShowMenu(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  // Grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Aquí puedes procesar la grabación
      setTimeout(() => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          // Enviar mensaje indicando que se envió una nota de audio
          sendMessage('🎵 Nota de audio enviada');
          setAudioChunks([]);
        }
      }, 100);
    }
  };

  // Exportar conversación
  const exportConversation = () => {
    const conversationText = messages.map(msg => {
      const time = msg.timestamp.toLocaleString('es-ES');
      const sender = msg.role === 'user' ? 'Usuario' : 'GAIA';
      return `[${time}] ${sender}: ${msg.content}`;
    }).join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion-gaia-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // Limpiar conversación
  const handleClearConversation = () => {
    clearMessages();
    setShowMenu(false);
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
                ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95' 
                : 'bg-slate-600 hover:bg-slate-700 active:scale-95'
            }
          `}
        >
          {/* Anillos de estado */}
          {isConnected && !isVoiceActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse opacity-30"></div>
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

      {/* Ventana de Chat Mejorada */}
      {isOpen && (
        <div className="absolute bottom-full mb-4 bg-white rounded-xl shadow-2xl border border-gray-200/50 w-96 h-[500px] flex flex-col overflow-hidden backdrop-blur-sm">
          {/* Header Minimalista */}
          <div className="bg-gray-50/80 backdrop-blur-sm p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
                <h3 className="font-medium text-gray-700 text-sm">GAIA Assistant</h3>
                {messages.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-200/60 px-2 py-1 rounded-full">
                    {messages.length} mensajes
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Menú de opciones */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-gray-200/60 rounded-full transition-colors"
                  >
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                      <button
                        onClick={exportConversation}
                        disabled={messages.length === 0}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Download size={14} />
                        <span>Exportar conversación</span>
                      </button>
                      <button
                        onClick={handleClearConversation}
                        disabled={messages.length === 0}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        <span>Limpiar conversación</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleToggle}
                  className="p-1.5 hover:bg-gray-200/60 rounded-full transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Mensajes con diseño minimalista */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">¡Hola! Soy GAIA, tu asistente especializado en palmicultura.</p>
                <p className="text-gray-400 text-xs mt-1">Escribe un mensaje para comenzar</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] p-3 rounded-2xl text-sm
                      ${message.role === 'user'
                        ? 'bg-slate-700 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }
                    `}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1.5 opacity-60 ${message.role === 'user' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={14} className="animate-spin text-gray-500" />
                    <p className="text-sm text-gray-600">Procesando...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error minimalista */}
          {error && (
            <div className="px-4 py-2 bg-red-50/80 border-t border-red-100">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          {/* Input mejorado */}
          <div className="p-4 border-t border-gray-200/50 bg-gray-50/30">
            <form onSubmit={handleSendMessage} className="flex space-x-2 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 text-sm placeholder-gray-400 text-gray-700"
                  disabled={isLoading || !isConnected}
                />
              </div>
              
              {/* Botón de grabación de audio */}
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                disabled={isLoading || !isConnected}
                className={`p-3 rounded-xl transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Mantén presionado para grabar audio"
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              
              {/* Botón de enviar */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading || !isConnected}
                className="p-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
            
            {isRecording && (
              <div className="flex items-center justify-center mt-2">
                <div className="flex items-center space-x-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Grabando audio...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
