'use client';

import { useState, useEffect, useRef } from 'react';
import { GaiaVoiceService } from '@/lib/gaia-voice-service';
import { Mic, MicOff, Volume2, VolumeX, Power, PowerOff } from 'lucide-react';

interface GaiaInterfaceProps {
  className?: string;
}

export default function GaiaInterface({ className = '' }: GaiaInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const gaiaServiceRef = useRef<GaiaVoiceService | null>(null);

  useEffect(() => {
    // Inicializar el servicio de GAIA
    gaiaServiceRef.current = new GaiaVoiceService();

    // Cleanup al desmontar
    return () => {
      if (gaiaServiceRef.current) {
        gaiaServiceRef.current.disconnect();
      }
    };
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const generateClientToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/gaia-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data.client_secret;
    } catch (error) {
      console.error('Error obteniendo token de cliente:', error);
      throw new Error('No se pudo obtener el token de autenticación');
    }
  };

  const handleConnect = async () => {
    if (!gaiaServiceRef.current || isConnecting) return;

    setIsConnecting(true);
    setError(null);
    addLog('Conectando a GAIA...');

    try {
      // Generar token de cliente
      const clientToken = await generateClientToken();
      
      // Conectar al servicio
      await gaiaServiceRef.current.connect(clientToken);
      
      setIsConnected(true);
      addLog('✅ GAIA conectado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      addLog(`❌ Error: ${errorMessage}`);
      console.error('Error conectando a GAIA:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!gaiaServiceRef.current) return;

    try {
      await gaiaServiceRef.current.disconnect();
      setIsConnected(false);
      setIsListening(false);
      addLog('🔌 GAIA desconectado');
    } catch (err) {
      console.error('Error desconectando:', err);
      addLog('❌ Error desconectando');
    }
  };

  const toggleListening = async () => {
    if (!gaiaServiceRef.current || !isConnected) return;

    try {
      if (isListening) {
        await gaiaServiceRef.current.stopListening();
        setIsListening(false);
        addLog('⏹️ Escucha detenida');
      } else {
        await gaiaServiceRef.current.startListening();
        setIsListening(true);
        addLog('🎤 Iniciando escucha...');
      }
    } catch (err) {
      console.error('Error toggling listening:', err);
      addLog('❌ Error manejando audio');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    addLog(isMuted ? '🔊 Audio activado' : '🔇 Audio silenciado');
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-xl ${className}`}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🤖</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">GAIA</h2>
        </div>
        <p className="text-gray-600">Asistente especializado en GUAICARAMO, SIRIUS y Sector Palmicultor</p>
        
        {/* Estado de conexión */}
        <div className="mt-3">
          {isConnected ? (
            <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Conectado
            </span>
          ) : isConnecting ? (
            <span className="inline-flex items-center gap-1 text-yellow-600 text-sm font-medium">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-spin"></div>
              Conectando...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-gray-500 text-sm font-medium">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Desconectado
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        {/* Connect/Disconnect Button */}
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isConnected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isConnected ? <PowerOff size={16} /> : <Power size={16} />}
          {isConnecting ? 'Conectando...' : isConnected ? 'Desconectar' : 'Conectar'}
        </button>

        {/* Microphone Button */}
        <button
          onClick={toggleListening}
          disabled={!isConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isListening
              ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          {isListening ? 'Escuchando' : 'Hablar'}
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          disabled={!isConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isMuted
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {isMuted ? 'Silenciado' : 'Audio'}
        </button>
      </div>

      {/* Instructions */}
      {isConnected && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Instrucciones:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Haz clic en "Hablar" y comienza a conversar</li>
            <li>• Pregúntame sobre GUAICARAMO, SIRIUS o el sector palmicultor</li>
            <li>• Puedes interrumpir mientras hablo</li>
            <li>• Usa el botón de audio para silenciar las respuestas</li>
          </ul>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Registro de actividad:</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Sin actividad reciente</p>
          ) : (
            logs.map((log, index) => (
              <p key={index} className="text-xs text-gray-600 font-mono">
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Company Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Especializado en: GUAICARAMO S.A.S • SIRIUS REGENERATIVE SOLUTIONS • DEL LLANO ALTO OLEICO • FEDEPALMA
        </p>
      </div>
    </div>
  );
}
