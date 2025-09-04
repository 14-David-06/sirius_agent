# GAIA API - Documentación Técnica

## 🔌 Endpoints de la API

### POST /api/gaia-token

Genera un token efímero para establecer una conexión WebRTC segura con OpenAI Realtime API.

#### Request
```http
POST /api/gaia-token
Content-Type: application/json
```

**Headers**: Ninguno requerido (la autenticación se maneja internamente)

**Body**: Vacío (no requiere parámetros)

#### Response

**Éxito (200)**:
```json
{
  "client_secret": "ek_1234567890abcdef...",
  "expires_at": 1756995018
}
```

**Error (500)**:
```json
{
  "error": "OPENAI_API_KEY no está configurada"
}
```

#### Implementación Interna

```typescript
// src/app/api/gaia-token/route.ts
export async function POST() {
  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model: 'gpt-4o-realtime-preview-2024-10-01'
      }
    }),
  });
  
  const data = await response.json();
  return NextResponse.json({
    client_secret: data.value,
    expires_at: data.expires_at,
  });
}
```

#### Estructura de Respuesta de OpenAI

La API de OpenAI `/v1/realtime/client_secrets` devuelve:

```json
{
  "value": "ek_68b99b722b748191b1d0232a257ff1f2",
  "expires_at": 1756995018,
  "session": {
    "type": "realtime",
    "object": "realtime.session",
    "id": "sess_CC4naY4a6d3jZsuIq5owv",
    "model": "gpt-4o-realtime-preview-2024-10-01",
    "output_modalities": ["audio"],
    "instructions": "...",
    "tools": [],
    "tool_choice": "auto",
    "max_output_tokens": "inf",
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "turn_detection": {
          "type": "server_vad",
          "threshold": 0.5,
          "prefix_padding_ms": 300,
          "silence_duration_ms": 200,
          "create_response": true,
          "interrupt_response": true
        }
      },
      "output": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "voice": "alloy",
        "speed": 1
      }
    }
  }
}
```

## 🔧 Configuración del Cliente

### Hook useGaia

```typescript
// src/lib/hooks/useGaia.ts
import { RealtimeSession } from '@openai/agents-realtime';

interface GaiaState {
  isConnected: boolean;
  isConnecting: boolean;
  session: RealtimeSession | null;
  error: string | null;
}

export function useGaia() {
  const [state, setState] = useState<GaiaState>({
    isConnected: false,
    isConnecting: false,
    session: null,
    error: null
  });

  const connect = async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // 1. Obtener token efímero
      const tokenResponse = await fetch('/api/gaia-token', {
        method: 'POST',
      });
      
      const { client_secret } = await tokenResponse.json();
      
      // 2. Crear agente GAIA
      const agent = createGaiaAgent();
      
      // 3. Establecer sesión
      const session = new RealtimeSession({
        agent,
        clientSecret: client_secret,
      });
      
      await session.connect();
      
      setState({
        isConnected: true,
        isConnecting: false,
        session,
        error: null
      });
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message
      }));
    }
  };
  
  return { ...state, connect };
}
```

## 🤖 Configuración del Agente

### RealtimeAgent Setup

```typescript
// src/lib/gaia-agent.ts
import { RealtimeAgent } from '@openai/agents';

export function createGaiaAgent() {
  return new RealtimeAgent({
    model: "gpt-4o-realtime-preview-2024-10-01",
    instructions: `
      Eres GAIA (Generative AI Assistant), un asistente especializado en el sector palmicultor colombiano.
      
      EMPRESAS ESPECIALIZADAS:
      1. GUAICARAMO S.A.S ZOMAC: Empresa palmicultora comprometida con la sostenibilidad...
      2. SIRIUS REGENERATIVE SOLUTIONS S.A.S ZOMAC: Empresa biotecnológica...
      3. DEL LLANO ALTO OLEICO: Producto especializado en aceite de palma alto oleico...
      4. FEDEPALMA: Federación Nacional de Cultivadores de Palma de Aceite...
      
      INSTRUCCIONES:
      - Responde únicamente en español
      - Usa un tono profesional pero amigable
      - Proporciona información técnica precisa
      - Si no conoces algo específico, admítelo honestamente
    `,
    // Configuración de audio automática
    // El modelo maneja la configuración de WebRTC internamente
  });
}
```

## 🎛️ Configuración de Audio

### Parámetros de WebRTC

El sistema usa configuración automática optimizada:

- **Formato de entrada**: PCM 24kHz mono
- **Formato de salida**: PCM 24kHz mono  
- **Detección de voz**: Server VAD con threshold 0.5
- **Padding**: 300ms antes, 200ms de silencio para detección
- **Interrupciones**: Habilitadas para conversación natural
- **Voz**: "alloy" (configurable)
- **Velocidad**: 1x (configurable)

### Transport Configuration

```typescript
// Configuración automática por RealtimeSession
const session = new RealtimeSession({
  agent: gaiaAgent,
  clientSecret: ephemeralToken,
  // WebRTC se configura automáticamente
  // Usa micrófono del navegador por defecto
  // Salida a altavoces/auriculares del navegador
});
```

## 🔍 Debugging y Logs

### Logs del Sistema

#### Backend Logs
```
Generando token efímero para GAIA...
Token efímero generado exitosamente
POST /api/gaia-token 200 in 1524ms
```

#### Frontend Logs
```typescript
console.log('Conectando con GAIA...');
console.log('GAIA conectado exitosamente');
console.log('Sesión de GAIA terminada');
```

### Estados de Debugging

```typescript
// Estados que puedes monitorear
const gaiaStates = {
  DISCONNECTED: 'Desconectado',
  CONNECTING: 'Conectando...',
  CONNECTED: 'Conectado',
  ACTIVE: 'Conversación activa',
  ERROR: 'Error de conexión'
};
```

## 📊 Métricas y Performance

### Métricas Clave
- **Tiempo de generación de token**: ~1-2 segundos
- **Tiempo de conexión WebRTC**: ~2-3 segundos
- **Latencia de respuesta**: <500ms (tiempo real)
- **Calidad de audio**: PCM 24kHz (alta calidad)

### Optimizaciones Implementadas
- Token caching durante la sesión
- Reconexión automática en caso de fallo
- Limpieza de recursos al desconectar
- Error handling robusto

## 🚨 Error Handling

### Códigos de Error Comunes

| Error | Código | Descripción | Solución |
|-------|--------|-------------|----------|
| `OPENAI_API_KEY no configurada` | 500 | Variable de entorno faltante | Configurar `.env.local` |
| `Ephemeral token required` | 401 | Token inválido o expirado | Regenerar conexión |
| `Microphone access denied` | - | Permisos de micrófono | Permitir en navegador |
| `WebRTC connection failed` | - | Conexión de red | Verificar internet/HTTPS |

### Manejo de Errores en Código

```typescript
try {
  await session.connect();
} catch (error) {
  if (error.message.includes('ephemeral')) {
    // Token expirado, regenerar
    await regenerateToken();
  } else if (error.message.includes('microphone')) {
    // Error de permisos
    await requestMicrophonePermission();
  } else {
    // Error genérico
    console.error('Error de conexión:', error);
  }
}
```

## 🔐 Seguridad

### Tokens Efímeros
- **Duración**: ~15-30 minutos
- **Scope**: Sesión única de RealtimeSession
- **Regeneración**: Automática por conexión
- **Almacenamiento**: Solo en memoria, nunca persistente

### Best Practices de Seguridad
```typescript
// ✅ Correcto - Token en memoria
const token = await fetchEphemeralToken();
session.connect(token);

// ❌ Incorrecto - No persistir tokens
localStorage.setItem('gaia-token', token); // No hacer esto
```

### Validaciones
- API Key validación en backend
- HTTPS requerido en producción
- CORS configurado apropiadamente
- Rate limiting recomendado

## 📱 Compatibilidad de Navegadores

### Soporte WebRTC
| Navegador | Versión | Estado |
|-----------|---------|---------|
| Chrome | 88+ | ✅ Completo |
| Firefox | 85+ | ✅ Completo |
| Safari | 14+ | ✅ Completo |
| Edge | 88+ | ✅ Completo |
| Mobile Safari | 14+ | ✅ Completo |
| Chrome Mobile | 88+ | ✅ Completo |

### Requisitos del Navegador
- WebRTC support
- Microphone API
- Web Audio API
- ES2020+ support
- HTTPS (producción)

---

**Documentación generada para GAIA v1.0** - Última actualización: Septiembre 2025
