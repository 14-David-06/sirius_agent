'use client';

import { useState, useRef, useEffect } from 'react';
import { useGaia } from '@/lib/hooks/useGaia';
import { useGaiaChat } from '@/lib/hooks/useGaiaChat';
import { Phone, PhoneCall, Loader2, MessageCircle, Send, X, Mic, MicOff, Download, Trash2, MoreVertical, Play, Pause } from 'lucide-react';
import AudioMessage from './AudioMessage';

interface GaiaMinimalProps {
  isChatActive: boolean;
  onVoiceToggle: (isActive: boolean) => void;
  onChatToggle: (isActive: boolean) => void;
}

export default function GaiaMinimal({ isChatActive, onVoiceToggle, onChatToggle }: GaiaMinimalProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [audioMessages, setAudioMessages] = useState<{[key: string]: {blob: Blob, url: string, duration: number}}>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
    clearMessages,
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

  // Función para transcribir audio
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error transcribiendo audio');
      }

      const data = await response.json();
      return data.transcription || 'No se pudo transcribir el audio';
    } catch (error) {
      console.error('Error transcribiendo audio:', error);
      return 'Error al transcribir el audio';
    }
  };

  // Función para obtener duración del audio
  const getAudioDuration = (blob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration || 0);
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(blob);
    });
  };

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

  // Grabación de audio simplificada y robusta
  const startRecording = async () => {
    if (isRecording || chatLoading || !chatConnected) return;
    
    try {
      console.log('Iniciando grabación...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Datos de audio disponibles:', event.data.size);
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Grabación detenida, chunks:', chunks.length);
        stream.getTracks().forEach(track => track.stop());
        
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          console.log('Audio blob creado:', audioBlob.size, 'bytes');
          
          if (audioBlob.size > 1000) { // Al menos 1KB
            try {
              // Transcribir el audio
              const transcription = await transcribeAudio(audioBlob);
              console.log('Audio transcrito:', transcription);
              
              // Obtener duración del audio
              const duration = await getAudioDuration(audioBlob);
              
              // Crear URL del audio para reproducir
              const audioUrl = URL.createObjectURL(audioBlob);
              
              // Generar ID único para el mensaje de audio
              const audioId = Date.now().toString();
              
              // Guardar audio en el estado
              setAudioMessages(prev => ({
                ...prev,
                [audioId]: {
                  blob: audioBlob,
                  url: audioUrl,
                  duration: duration
                }
              }));
              
              // Enviar el mensaje con la transcripción para que GAIA pueda responder
              await sendMessage(transcription, 'audio', audioId);
              console.log('Mensaje de audio enviado exitosamente');
            } catch (error) {
              console.error('Error enviando mensaje de audio:', error);
              await sendMessage('❌ Error al procesar el audio');
            }
          } else {
            console.log('Grabación muy pequeña, ignorada');
            await sendMessage('❌ Grabación muy corta, intenta de nuevo');
          }
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('Error en MediaRecorder:', event);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        sendMessage('❌ Error en la grabación');
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('Grabación iniciada exitosamente');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      await sendMessage('❌ Error: No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    console.log('Deteniendo grabación...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Grabación detenida');
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
                ? 'Chat activo'
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

      {/* Ventana de Chat Mejorada */}
      {isChatActive && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 w-96 h-[500px] flex flex-col overflow-hidden backdrop-blur-xl z-50">
          {/* Header Profesional */}
          <div className="bg-gradient-to-r from-slate-700/90 to-slate-800/90 backdrop-blur-sm p-4 border-b border-slate-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${chatConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400'} animate-pulse`}></div>
                <h3 className="font-medium text-slate-200 text-sm">GAIA Assistant</h3>
                {messages.length > 0 && (
                  <span className="text-xs text-slate-400 bg-slate-700/60 px-2 py-1 rounded-full border border-slate-600/50">
                    {messages.length} mensajes
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Menú de opciones */}
                <div className="relative z-[60]" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-slate-700/60 rounded-full transition-colors border border-transparent hover:border-slate-600/50"
                  >
                    <MoreVertical size={16} className="text-slate-300" />
                  </button>
                  
                  {showMenu && (
                    <>
                      {/* Overlay para cerrar el menú */}
                      <div 
                        className="fixed inset-0 z-[99]" 
                        onClick={() => setShowMenu(false)}
                      />
                      {/* Menú flotante */}
                      <div className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-[100] w-48 backdrop-blur-xl"
                           style={{
                             top: '100px',
                             right: '100px'
                           }}>
                        <button
                        onClick={exportConversation}
                        disabled={messages.length === 0}
                        className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-700/60 disabled:opacity-50 first:rounded-t-lg transition-colors"
                      >
                        <Download size={14} className="text-blue-400" />
                        <span>Exportar conversación</span>
                      </button>
                      <button
                        onClick={handleClearConversation}
                        disabled={messages.length === 0}
                        className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/20 disabled:opacity-50 last:rounded-b-lg transition-colors border-t border-slate-700/50"
                      >
                        <Trash2 size={14} />
                        <span>Limpiar conversación</span>
                      </button>
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={handleChatToggle}
                  className="p-1.5 hover:bg-slate-700/60 rounded-full transition-colors border border-transparent hover:border-slate-600/50"
                >
                  <X size={16} className="text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Mensajes con diseño profesional */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-800/50 to-slate-900/80">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50 backdrop-blur-sm">
                  <MessageCircle size={28} className="text-blue-400" />
                </div>
                <p className="text-slate-300 text-sm font-medium mb-1">¡Hola! Soy GAIA</p>
                <p className="text-slate-400 text-xs max-w-64 leading-relaxed">Tu asistente especializado en palmicultura y biotecnología regenerativa</p>
                <div className="mt-4 px-3 py-1.5 bg-slate-700/40 rounded-full border border-slate-600/30">
                  <p className="text-slate-400 text-xs">Escribe un mensaje para comenzar</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] p-3.5 rounded-2xl text-sm backdrop-blur-sm border
                      ${message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 text-white rounded-br-md border-blue-500/30 shadow-lg shadow-blue-900/20'
                        : 'bg-slate-700/80 text-slate-100 rounded-bl-md border-slate-600/50 shadow-lg'
                      }
                    `}
                  >
                    {message.type === 'audio' && message.audioId && audioMessages[message.audioId] ? (
                      <div className="space-y-2">
                        <AudioMessage
                          audioUrl={audioMessages[message.audioId].url}
                          duration={audioMessages[message.audioId].duration}
                          isPlaying={playingAudio === message.audioId}
                          onPlay={() => {
                            if (playingAudio) {
                              setPlayingAudio(null);
                            }
                            if (message.audioId) {
                              const audio = new Audio(audioMessages[message.audioId].url);
                              audio.play();
                              setPlayingAudio(message.audioId);
                              audio.onended = () => setPlayingAudio(null);
                            }
                          }}
                          onPause={() => {
                            setPlayingAudio(null);
                          }}
                        />
                        <p className="text-xs opacity-70">
                          {message.content}
                        </p>
                      </div>
                    ) : (
                      <p className="leading-relaxed">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 opacity-60 ${message.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700/80 p-3.5 rounded-2xl rounded-bl-md border border-slate-600/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                    <p className="text-sm text-slate-200">GAIA está procesando...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error profesional */}
          {chatError && (
            <div className="px-4 py-2 bg-red-900/40 border-t border-red-800/50 backdrop-blur-sm">
              <p className="text-red-300 text-xs">{chatError}</p>
            </div>
          )}

          {/* Input profesional y dinámico */}
          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex space-x-3 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="w-full px-4 py-3.5 bg-slate-800/90 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 text-sm placeholder-slate-400 text-slate-100 transition-all backdrop-blur-sm shadow-inner"
                  disabled={chatLoading || !chatConnected}
                />
              </div>
              
              {/* Botón de grabación de audio simplificado */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  stopRecording();
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  if (isRecording) stopRecording();
                }}
                disabled={chatLoading || !chatConnected}
                className={`p-3.5 rounded-xl transition-all duration-200 border backdrop-blur-sm select-none ${
                  isRecording 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/50 shadow-lg shadow-red-900/30 scale-105' 
                    : 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 border-slate-600/50 hover:border-slate-500/60'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Mantén presionado para grabar audio"
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              
              {/* Botón de enviar mejorado */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading || !chatConnected}
                className="p-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-blue-500/30 shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                <Send size={16} />
              </button>
            </form>
            
            {isRecording && (
              <div className="flex items-center justify-center mt-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-900/40 rounded-full border border-red-800/50 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-300 font-medium">Grabando audio...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
