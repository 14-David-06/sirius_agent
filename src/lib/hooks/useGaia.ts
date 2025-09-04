'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RealtimeSession } from '@openai/agents-realtime';
import { createGaiaAgent } from '@/lib/gaia-agent';

interface UseGaiaOptions {
  onLog?: (message: string) => void;
  onError?: (error: Error) => void;
}

interface UseGaiaReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

export function useGaia(options: UseGaiaOptions = {}): UseGaiaReturn {
  const { onLog, onError } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<RealtimeSession | null>(null);

  // Limpiar sesión al desmontar
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current = null;
      }
    };
  }, []);

  const logMessage = useCallback((message: string) => {
    onLog?.(message);
    console.log(`[GAIA] ${message}`);
  }, [onLog]);

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    setError(errorMessage);
    onError?.(new Error(errorMessage));
    logMessage(`❌ Error: ${errorMessage}`);
  }, [onError, logMessage]);

  const generateClientToken = useCallback(async (): Promise<string> => {
    const response = await fetch('/api/gaia-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.client_secret;
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);
    logMessage('Conectando a GAIA...');

    try {
      // Generar token efímero
      const clientToken = await generateClientToken();
      logMessage('Token efímero obtenido');

      // Crear agente especializado
      const gaiaAgent = createGaiaAgent();
      
      // Crear sesión Realtime
      sessionRef.current = new RealtimeSession(gaiaAgent);
      
      // Conectar usando token efímero
      await sessionRef.current.connect({ 
        apiKey: clientToken 
      });

      setIsConnected(true);
      logMessage('✅ GAIA conectado en tiempo real');
      
    } catch (err) {
      handleError(err);
      sessionRef.current = null;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, generateClientToken, handleError, logMessage]);

  const disconnect = useCallback(async () => {
    if (sessionRef.current) {
      sessionRef.current = null;
      setIsConnected(false);
      logMessage('🔌 GAIA desconectado');
    }
  }, [logMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    clearError,
  };
}
