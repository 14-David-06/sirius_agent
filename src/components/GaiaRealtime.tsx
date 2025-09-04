'use client';

import { useState } from 'react';
import { useGaia } from '@/lib/hooks/useGaia';
import { Mic, Power, PowerOff, X } from 'lucide-react';

interface GaiaRealtimeProps {
  className?: string;
  onClose?: () => void;
}

export default function GaiaRealtime({ className = '', onClose }: GaiaRealtimeProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    clearError,
  } = useGaia({
    onLog: (message) => {
      setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    },
  });

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
              <p className="text-blue-100 text-xs">Agente Conversacional Realtime</p>
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
              Conectado - Habla normalmente
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
              className="text-red-400 hover:text-red-600 text-xs ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="p-4">
        {/* Connect/Disconnect Button */}
        <button
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            isConnected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isConnected ? <PowerOff size={20} /> : <Power size={20} />}
          {isConnecting ? 'Conectando...' : isConnected ? 'Desconectar GAIA' : 'Conectar GAIA'}
        </button>

        {/* Voice Indicator */}
        {isConnected && (
          <div className="mt-4 flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
            <Mic className="text-green-600 animate-pulse" size={24} />
            <div className="text-center">
              <p className="text-green-700 font-medium text-sm">¡GAIA te está escuchando!</p>
              <p className="text-green-600 text-xs mt-1">Habla normalmente, puedes interrumpir cuando quieras</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && !isConnecting && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-blue-800 font-medium text-sm mb-2">Cómo usar GAIA:</h4>
            <ol className="text-blue-700 text-xs space-y-1 list-decimal list-inside">
              <li>Haz clic en "Conectar GAIA"</li>
              <li>Permite el acceso al micrófono</li>
              <li>¡Comienza a hablar! GAIA responderá automáticamente</li>
            </ol>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-blue-600 text-xs font-medium mb-1">Pregúntale sobre:</p>
              <ul className="text-blue-600 text-xs space-y-1">
                <li>• GUAICARAMO S.A.S</li>
                <li>• SIRIUS Regenerative Solutions</li>
                <li>• Del Llano Alto Oleico</li>
                <li>• Congreso FEDEPALMA</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <h4 className="text-gray-700 font-medium text-xs mb-2">Registro de actividad:</h4>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {logs.slice(-3).map((log, index) => (
              <p key={index} className="text-xs text-gray-600 font-mono">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          GAIA - Especialista en Sector Palmicultor Colombiano
        </p>
      </div>
    </div>
  );
}
