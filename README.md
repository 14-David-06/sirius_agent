# GAIA - Agente Conversacional Realtime

GAIA es un agente conversacional especializado en tiempo real para responder preguntas sobre:
- **GUAICARAMO S.A.S ZOMAC** - Empresa palmicultora de la región ZOMAC
- **SIRIUS REGENERATIVE SOLUTIONS S.A.S ZOMAC** - Empresa de soluciones biotecnológicas regenerativas
- **DEL LLANO ALTO OLEICO** - Producto de aceite alto oleico del Llano
- **FEDEPALMA** y el sector palmicultor en general

## 🚀 Características

- **Conversación de voz en tiempo real** usando OpenAI Realtime API
- **Interfaz intuitiva** con controles de audio y conexión
- **Especialización sectorial** con conocimiento específico sobre las empresas
- **Interrupciones naturales** durante la conversación
- **Conexión segura** con tokens efímeros de cliente

## 🛠️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega tu API Key de OpenAI:

```env
OPENAI_API_KEY=tu_openai_api_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API key
3. Asegúrate de que tu cuenta tenga acceso a la API Realtime
4. Copia la key y pégala en tu archivo `.env.local`

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🎯 Uso

1. **Abrir la aplicación** en tu navegador
2. **Conectar GAIA** haciendo clic en el botón "Conectar"
3. **Permitir acceso al micrófono** cuando el navegador lo solicite
4. **Hacer clic en "Hablar"** y comenzar la conversación
5. **Hacer preguntas** sobre las empresas especializadas

### Ejemplos de preguntas:

- "¿Qué es GUAICARAMO?"
- "Cuéntame sobre SIRIUS Regenerative Solutions"
- "¿Qué productos tiene Del Llano Alto Oleico?"
- "¿Qué temas se tratan en el congreso de FEDEPALMA?"
- "¿Qué es la zona ZOMAC?"

## 🏗️ Arquitectura Técnica

### Componentes principales:

- **`GaiaAgent`** - Configuración del agente especializado
- **`GaiaVoiceService`** - Servicio de gestión de sesión de voz
- **`useGaia`** - Hook React para manejo del estado
- **`GaiaSimple`** - Interfaz de usuario simplificada
- **API Route** - Endpoint para generar tokens efímeros

### Flujo de funcionamiento:

1. **Cliente** solicita token efímero al backend
2. **Backend** genera token usando OpenAI API
3. **Cliente** usa token para conectar a Realtime API
4. **Sesión** se establece con el agente GAIA
5. **Usuario** interactúa por voz con el agente

## 🔧 Desarrollo

### Estructura del proyecto:

```
src/
├── app/
│   ├── api/gaia-token/     # API para tokens efímeros
│   └── page.tsx            # Página principal
├── components/
│   ├── GaiaInterface.tsx   # Interfaz completa
│   └── GaiaSimple.tsx      # Interfaz simplificada
└── lib/
    ├── gaia-agent.ts       # Configuración del agente
    ├── gaia-voice-service.ts # Servicio de voz
    └── hooks/
        └── useGaia.ts      # Hook personalizado
```

### Scripts disponibles:

- `npm run dev` - Desarrollo
- `npm run build` - Construcción para producción
- `npm run start` - Iniciar en producción
- `npm run lint` - Linting

## 🔐 Seguridad

- Los tokens de cliente son **efímeros** y se regeneran por sesión
- La **API Key de OpenAI** solo se usa en el backend
- **No hay persistencia** de conversaciones por defecto

## 📋 Requisitos

- Node.js 18+ 
- Cuenta OpenAI con acceso a Realtime API
- Navegador con soporte para WebRTC (Chrome, Firefox, Safari)
- Micrófono y altavoces/auriculares

## 🚨 Solución de problemas

### Error de autenticación:
- Verifica que tu `OPENAI_API_KEY` sea válida
- Asegúrate de que la key tenga acceso a Realtime API

### No hay audio:
- Permite acceso al micrófono en el navegador
- Verifica que no haya otras aplicaciones usando el micrófono
- Prueba con auriculares para evitar retroalimentación

### Problemas de conexión:
- Revisa la consola del navegador para errores
- Verifica tu conexión a internet
- Intenta regenerar el token desconectando y conectando de nuevo

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre GAIA, contacta al equipo de desarrollo.
