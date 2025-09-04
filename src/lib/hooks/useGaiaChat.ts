'use client';

import { useState, useRef, useCallback } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'audio';
  audioId?: string;
}

interface UseGaiaChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string, type?: 'text' | 'audio', audioId?: string) => Promise<void>;
  clearMessages: () => void;
}

export function useGaiaChat(): UseGaiaChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      setIsConnected(true);
      
      // Mensaje de bienvenida
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '¡Hola! Soy GAIA, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error connecting to GAIA chat:', error);
      setError('Error al conectar con GAIA');
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // Cancelar cualquier solicitud en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsConnected(false);
    setIsLoading(false);
    setError(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (messageContent: string, type: 'text' | 'audio' = 'text', audioId?: string) => {
    if (!isConnected || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      type: type,
      audioId: audioId
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Crear un nuevo AbortController para esta solicitud
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/gaia-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Lo siento, no pude procesar tu mensaje.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // La solicitud fue cancelada, no hacer nada
        return;
      }
      
      console.error('Error sending message:', error);
      setError('Error al enviar mensaje');
      
      // Mensaje de error
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isConnected, isLoading, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages
  };
}
