# GAIA - Documentación de Componentes

## 🧩 Arquitectura de Componentes

### Jerarquía de Componentes
```
App (page.tsx)
├── ThreeAnimationFixed (dinámico)
├── PartnerCarousel
└── GaiaRealtime
    └── useGaia (hook)
        ├── gaia-agent.ts
        └── /api/gaia-token
```

## 📱 Componentes Frontend

### 1. GaiaRealtime.tsx

**Ubicación**: `src/components/GaiaRealtime.tsx`

**Propósito**: Componente principal de la interfaz de GAIA que maneja la interacción del usuario con el agente conversacional.

#### Props
- Ninguna (componente autocontenido)

#### Estado Interno
```typescript
interface GaiaState {
  isConnected: boolean;
  isConnecting: boolean;
  session: RealtimeSession | null;
  error: string | null;
  activityLog: string[];
}
```

#### Funcionalidades Clave
- **Gestión de conexión**: Conectar/desconectar con GAIA
- **Indicadores visuales**: Estados de conexión y actividad de voz
- **Log de actividad**: Registro de eventos para debugging
- **UI responsiva**: Adaptable a diferentes tamaños de pantalla

#### Estructura del Componente
```tsx
export default function GaiaRealtime() {
  const { isConnected, isConnecting, error, connect, disconnect } = useGaia();
  
  return (
    <div className="bg-gradient-to-br from-green-900 to-green-700 text-white p-6 rounded-lg shadow-xl">
      {/* Header con título y estado */}
      <div className="flex items-center justify-between mb-4">
        <h2>GAIA - Asistente IA</h2>
        <StatusIndicator />
      </div>
      
      {/* Controles principales */}
      <div className="space-y-4">
        {!isConnected ? (
          <ConnectButton onClick={connect} loading={isConnecting} />
        ) : (
          <DisconnectButton onClick={disconnect} />
        )}
      </div>
      
      {/* Log de actividad */}
      <ActivityLog />
    </div>
  );
}
```

#### Estados Visuales
- **🔴 Desconectado**: Botón "Conectar con GAIA" disponible
- **🟡 Conectando**: Spinner y mensaje "Conectando..."
- **🟢 Conectado**: Botón "Desconectar" y indicador verde
- **🎙️ Activo**: Animación de ondas de audio durante conversación
- **❌ Error**: Mensaje de error con opción de reintentar

---

### 2. PartnerCarousel.tsx

**Ubicación**: `src/components/PartnerCarousel.tsx`

**Propósito**: Carrusel de logos de empresas palmicultoras especializadas.

#### Funcionalidades
- **Rotación automática**: Logos rotan cada 4 segundos
- **Transiciones suaves**: Animaciones CSS elegantes
- **Responsive**: Se adapta a móviles y escritorio

#### Estructura
```tsx
export default function PartnerCarousel() {
  const partners = [
    { name: 'GUAICARAMO', logo: '/logo-guaicaramo.png' },
    { name: 'SIRIUS', logo: '/logo.png' },
    { name: 'DEL LLANO', logo: '/logo2.png' }
  ];
  
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <AnimatedCarousel partners={partners} />
    </div>
  );
}
```

---

### 3. ThreeAnimationFixed.tsx

**Ubicación**: `src/components/ThreeAnimationFixed.tsx`

**Propósito**: Animación de fondo 3D optimizada para la aplicación.

#### Características
- **Renderizado 3D**: Usando Three.js para efectos visuales
- **Optimización**: Carga dinámica para evitar SSR
- **Performance**: Optimizada para no interferir con GAIA
- **Responsive**: Adaptable a diferentes resoluciones

#### Carga Dinámica
```tsx
// En page.tsx
const ThreeAnimation = dynamic(() => import('../components/ThreeAnimationFixed'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
});
```

---

## 🎣 Hooks Personalizados

### useGaia Hook

**Ubicación**: `src/lib/hooks/useGaia.ts`

**Propósito**: Gestión centralizada del estado y ciclo de vida de GAIA.

#### Interface
```typescript
interface UseGaiaReturn {
  // Estado
  isConnected: boolean;
  isConnecting: boolean;
  session: RealtimeSession | null;
  error: string | null;
  activityLog: string[];
  
  // Acciones
  connect: () => Promise<void>;
  disconnect: () => void;
  addLog: (message: string) => void;
}
```

#### Implementación Completa
```typescript
export function useGaia(): UseGaiaReturn {
  const [state, setState] = useState<GaiaState>({
    isConnected: false,
    isConnecting: false,
    session: null,
    error: null,
    activityLog: []
  });

  const connect = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null 
    }));
    
    try {
      // 1. Generar token efímero
      const response = await fetch('/api/gaia-token', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error generando token');
      }
      
      const { client_secret } = await response.json();
      
      // 2. Crear agente especializado
      const agent = createGaiaAgent();
      
      // 3. Establecer sesión WebRTC
      const session = new RealtimeSession({
        agent,
        clientSecret: client_secret,
      });
      
      await session.connect();
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        session,
        activityLog: [...prev.activityLog, 'GAIA conectado exitosamente']
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message,
        activityLog: [...prev.activityLog, `Error: ${error.message}`]
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (state.session) {
      state.session.disconnect();
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      session: null,
      activityLog: [...prev.activityLog, 'Sesión de GAIA terminada']
    }));
  }, [state.session]);

  const addLog = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      activityLog: [...prev.activityLog.slice(-9), message]
    }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    addLog
  };
}
```

#### Características del Hook
- **Gestión de estado**: Centralizada y type-safe
- **Cleanup automático**: Limpia recursos al desconectar
- **Error handling**: Manejo robusto de errores
- **Activity logging**: Registro de eventos para debugging
- **Memoización**: Callbacks optimizados con useCallback

---

## 🧠 Lógica de Negocio

### gaia-agent.ts

**Ubicación**: `src/lib/gaia-agent.ts`

**Propósito**: Configuración y creación del agente especializado GAIA.

#### Función Principal
```typescript
export function createGaiaAgent() {
  return new RealtimeAgent({
    model: "gpt-4o-realtime-preview-2024-10-01",
    instructions: gaiaInstructions,
  });
}
```

#### Instrucciones Especializadas
```typescript
const gaiaInstructions = `
Eres GAIA (Generative AI Assistant), un asistente conversacional especializado en el sector palmicultor colombiano.

CONOCIMIENTO ESPECÍFICO:

1. GUAICARAMO S.A.S ZOMAC:
   - Empresa palmicultora de la región ZOMAC (Zona Más Afectada por el Conflicto)
   - Comprometida con la sostenibilidad y la responsabilidad social
   - Implementa prácticas agrícolas regenerativas
   - Enfoque en la mejora continua de procesos

2. SIRIUS REGENERATIVE SOLUTIONS S.A.S ZOMAC:
   - Empresa de biotecnología especializada en soluciones regenerativas
   - Desarrollo de productos para la restauración de suelos degradados
   - Tecnologías innovadoras para agricultura sostenible
   - Investigación en microorganismos beneficiosos para cultivos

3. DEL LLANO ALTO OLEICO:
   - Producto especializado en aceite de palma alto oleico
   - Beneficios nutricionales superiores (alto contenido de ácido oleico)
   - Mayor estabilidad oxidativa
   - Aplicaciones culinarias e industriales

4. FEDEPALMA:
   - Federación Nacional de Cultivadores de Palma de Aceite
   - Gremio que representa al sector palmicultor colombiano
   - Promueve el desarrollo sostenible del sector
   - Organiza eventos, capacitaciones y congresos

INSTRUCCIONES DE COMPORTAMIENTO:
- Responde únicamente en español colombiano
- Usa un tono profesional pero amigable y accesible
- Proporciona información técnica precisa cuando sea necesario
- Si no conoces algo específico, admítelo honestamente
- Enfócate en aspectos de sostenibilidad, innovación y desarrollo del sector
- Sé conciso pero informativo en tus respuestas
- Cuando sea relevante, conecta temas con las empresas especializadas
`;
```

#### Características del Agente
- **Modelo**: gpt-4o-realtime-preview-2024-10-01 (último modelo optimizado para voz)
- **Especialización**: Conocimiento específico del sector palmicultor
- **Idioma**: Español colombiano exclusivamente
- **Tono**: Profesional pero amigable
- **Scope**: Limitado al dominio de conocimiento especificado

---

## 🔌 API Routes

### /api/gaia-token/route.ts

**Ubicación**: `src/app/api/gaia-token/route.ts`

**Propósito**: Endpoint serverless para generar tokens efímeros seguros.

#### Implementación
```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY no está configurada' },
        { status: 500 }
      );
    }

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

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Error generando token efímero: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      client_secret: data.value,
      expires_at: data.expires_at,
    });

  } catch (error) {
    console.error('Error en API de token ephemeral:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

#### Flujo de Funcionamiento
1. **Validación**: Verifica existencia de `OPENAI_API_KEY`
2. **Request a OpenAI**: Llama al endpoint oficial `/v1/realtime/client_secrets`
3. **Procesamiento**: Extrae `value` y `expires_at` de la respuesta
4. **Respuesta**: Devuelve token formateado al cliente
5. **Error Handling**: Manejo robusto de errores con logging

#### Estructura de Respuesta OpenAI
```json
{
  "value": "ek_68b99b722b748191b1d0232a257ff1f2",
  "expires_at": 1756995018,
  "session": {
    "type": "realtime",
    "model": "gpt-4o-realtime-preview-2024-10-01",
    // ... configuración adicional
  }
}
```

---

## 🎨 Estilos y UI

### Tailwind CSS Classes Utilizadas

#### GaiaRealtime Component
```css
/* Contenedor principal */
.bg-gradient-to-br.from-green-900.to-green-700

/* Estados de conexión */
.text-green-400    /* Conectado */
.text-yellow-400   /* Conectando */
.text-red-400      /* Error */

/* Botones */
.bg-green-600.hover:bg-green-700    /* Conectar */
.bg-red-600.hover:bg-red-700        /* Desconectar */

/* Animaciones */
.animate-pulse     /* Estado de carga */
.animate-bounce    /* Indicador activo */
```

#### Responsive Design
```css
/* Mobile First */
.w-80              /* Ancho fijo en desktop */
.max-w-full        /* Responsive en mobile */
.p-4.md:p-6        /* Padding adaptativo */
```

### Iconografía (Lucide React)
- `Mic`: Micrófono para indicar funcionalidad de voz
- `MicOff`: Micrófono deshabilitado
- `Loader2`: Spinner de carga
- `AlertCircle`: Indicador de error
- `CheckCircle`: Indicador de éxito

---

## 🚀 Performance y Optimizaciones

### Code Splitting
- **Three.js**: Carga dinámica para evitar SSR
- **Componentes pesados**: Lazy loading donde sea apropiado

### Memory Management
- **Cleanup de sesiones**: Desconexión automática de WebRTC
- **Event listeners**: Removal apropiado en unmount
- **State management**: Estados mínimos necesarios

### Network Optimizations
- **Token caching**: Durante la duración de la sesión
- **Request batching**: Minimización de llamadas a API
- **Error retry**: Lógica de reintentos inteligente

---

## 🧪 Testing Considerations

### Unit Tests Recomendados
```typescript
// useGaia.test.ts
describe('useGaia hook', () => {
  test('should connect successfully', async () => {
    const { result } = renderHook(() => useGaia());
    await act(async () => {
      await result.current.connect();
    });
    expect(result.current.isConnected).toBe(true);
  });
});

// GaiaRealtime.test.tsx  
describe('GaiaRealtime component', () => {
  test('renders connect button when disconnected', () => {
    render(<GaiaRealtime />);
    expect(screen.getByText('Conectar con GAIA')).toBeInTheDocument();
  });
});
```

### Integration Tests
- **API endpoint**: Validar generación de tokens
- **WebRTC connection**: Simular conexión exitosa
- **Audio permissions**: Mock de getUserMedia
- **Error scenarios**: Manejar fallos de conexión

---

**Documentación de Componentes GAIA v1.0** - Septiembre 2025
