import { RealtimeSession } from '@openai/agents-realtime';
import { createGaiaAgent, DEFAULT_SESSION_CONFIG } from './gaia-agent';

export class GaiaVoiceService {
  private session: RealtimeSession | null = null;
  private isConnected = false;
  private isConnecting = false;

  constructor() {
    // Inicializar eventos del navegador si estamos en el cliente
    if (typeof window !== 'undefined') {
      this.setupBrowserEvents();
    }
  }

  private setupBrowserEvents() {
    // Limpiar sesión cuando se cierra la ventana
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  /**
   * Conecta al agente GAIA usando una clave de cliente efímera
   */
  async connect(clientApiKey: string): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      console.warn('Already connected or connecting to GAIA');
      return;
    }

    this.isConnecting = true;

    try {
      // Crear el agente GAIA
      const gaiaAgent = createGaiaAgent();
      
      // Crear la sesión en tiempo real
      this.session = new RealtimeSession(gaiaAgent, DEFAULT_SESSION_CONFIG);

      // Configurar eventos de la sesión
      this.setupSessionEvents();

      // Conectar a la API con configuración específica para browser
      await this.session.connect({ 
        apiKey: clientApiKey,
      });

      this.isConnected = true;
      console.log('🤖 GAIA conectado exitosamente');
      
    } catch (error) {
      console.error('Error conectando a GAIA:', error);
      this.isConnecting = false;
      throw error;
    }

    this.isConnecting = false;
  }

  /**
   * Desconecta la sesión de GAIA
   */
  async disconnect(): Promise<void> {
    if (this.session && this.isConnected) {
      try {
        // La sesión se desconecta automáticamente o necesitamos llamar a close()
        this.session = null;
        console.log('🤖 GAIA desconectado');
      } catch (error) {
        console.error('Error desconectando GAIA:', error);
      }
    }

    this.session = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Configura los eventos de la sesión
   */
  private setupSessionEvents() {
    if (!this.session) return;

    // Los eventos específicos pueden variar según la versión de la API
    // Utilizaremos eventos genéricos por ahora
    console.log('🔧 Eventos de sesión configurados para GAIA');
  }

  /**
   * Maneja errores de la sesión
   */
  private handleSessionError(error: Error) {
    // Aquí puedes implementar lógica de reconexión automática si es necesario
    console.error('Error en la sesión:', error);
    
    if ('code' in error && error.code === 'authentication_failed') {
      console.error('Fallo de autenticación - verifica tu clave API');
    }
  }

  /**
   * Obtiene el estado de conexión
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      hasSession: !!this.session
    };
  }

  /**
   * Obtiene estadísticas de la sesión
   */
  getSessionStats() {
    if (!this.session) return null;
    
    return {
      // Aquí puedes agregar más estadísticas según lo que necesites
      connected: this.isConnected,
      model: DEFAULT_SESSION_CONFIG.model,
    };
  }

  /**
   * Inicia grabación de audio (si está soportado)
   */
  async startListening(): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('GAIA no está conectado');
    }
    
    console.log('🎤 Iniciando escucha con GAIA...');
    // La sesión maneja automáticamente el audio en el navegador
  }

  /**
   * Detiene la grabación de audio
   */
  async stopListening(): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('GAIA no está conectado');
    }
    
    console.log('⏹️ Deteniendo escucha con GAIA...');
    // La sesión maneja automáticamente el audio en el navegador
  }
}
