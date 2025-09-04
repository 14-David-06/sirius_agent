import OpenAI from 'openai';

export class GaiaWebSocketService {
  private ws: WebSocket | null = null;
  private openai: OpenAI | null = null;
  private isConnected = false;
  private isConnecting = false;

  constructor() {}

  async connect(apiKey: string): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      console.warn('Already connected or connecting to GAIA WebSocket');
      return;
    }

    this.isConnecting = true;

    try {
      // Inicializar OpenAI client
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      // Por ahora, crear una conexión simulada
      console.log('🤖 GAIA WebSocket conectado (modo simulado)');
      this.isConnected = true;
      
    } catch (error) {
      console.error('Error conectando WebSocket GAIA:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.openai = null;
    this.isConnected = false;
    console.log('🔌 GAIA WebSocket desconectado');
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.openai) {
      throw new Error('GAIA WebSocket no está conectado');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres GAIA, un agente conversacional especializado en información sobre el sector palmicultor colombiano, específicamente sobre:

1. GUAICARAMO S.A.S ZOMAC - Empresa palmicultora de la región ZOMAC
2. SIRIUS REGENERATIVE SOLUTIONS S.A.S ZOMAC - Empresa de soluciones biotecnológicas regenerativas
3. DEL LLANO ALTO OLEICO - Producto de aceite alto oleico del Llano
4. Congreso FEDEPALMA y el sector palmicultor en general

Responde de manera profesional, amigable y conocedora del sector. Si te preguntan sobre temas fuera de tu especialidad, redirige amablemente hacia los temas que dominas.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.';
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      hasClient: !!this.openai
    };
  }
}
