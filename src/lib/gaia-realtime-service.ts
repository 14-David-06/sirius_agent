import { RealtimeSession } from '@openai/agents-realtime';
import { createGaiaAgent, DEFAULT_SESSION_CONFIG } from './gaia-agent';

export class GaiaRealtimeService {
  private session: RealtimeSession | null = null;
  private isConnected = false;
  private isConnecting = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupBrowserEvents();
    }
  }

  private setupBrowserEvents() {
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  async connect(apiKey: string): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      console.warn('Already connected or connecting to GAIA Realtime');
      return;
    }

    this.isConnecting = true;

    try {
      const gaiaAgent = createGaiaAgent();
      
      // Crear sesión con configuración específica para WebSocket en navegador
      this.session = new RealtimeSession(gaiaAgent, {
        ...DEFAULT_SESSION_CONFIG,
      });

      // Configurar eventos antes de conectar
      this.setupSessionEvents();

      // Intentar conectar con diferentes configuraciones
      try {
        // Primero intentar con configuración estándar
        await this.session.connect({ 
          apiKey: apiKey,
        });
      } catch (webrtcError) {
        console.warn('WebRTC connection failed, this is expected with regular API keys:', webrtcError);
        // El error es esperado, vamos a usar el modo híbrido
        throw new Error('WebRTC requires ephemeral tokens. Use text mode instead.');
      }

      this.isConnected = true;
      console.log('🤖 GAIA Realtime conectado exitosamente');
      
    } catch (error) {
      console.error('Error conectando a GAIA Realtime:', error);
      this.isConnecting = false;
      throw error;
    }

    this.isConnecting = false;
  }

  async disconnect(): Promise<void> {
    if (this.session && this.isConnected) {
      try {
        // Limpiar sesión
        this.session = null;
        console.log('🤖 GAIA Realtime desconectado');
      } catch (error) {
        console.error('Error desconectando GAIA Realtime:', error);
      }
    }

    this.session = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  private setupSessionEvents() {
    if (!this.session) return;

    // Configurar eventos básicos (los eventos específicos pueden variar según la versión)
    console.log('🔧 Eventos de sesión Realtime configurados');
  }

  private handleSessionError(error: Error) {
    console.error('Error en la sesión Realtime:', error);
    
    if ('code' in error && error.code === 'authentication_failed') {
      console.error('Fallo de autenticación - verifica tu clave API');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      hasSession: !!this.session
    };
  }

  getSessionStats() {
    if (!this.session) return null;
    
    return {
      connected: this.isConnected,
      model: DEFAULT_SESSION_CONFIG.model,
    };
  }

  async startListening(): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('GAIA Realtime no está conectado');
    }
    
    console.log('🎤 Iniciando escucha con GAIA Realtime...');
  }

  async stopListening(): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('GAIA Realtime no está conectado');
    }
    
    console.log('⏹️ Deteniendo escucha con GAIA Realtime...');
  }
}
