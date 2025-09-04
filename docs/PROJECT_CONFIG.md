# GAIA - Configuración del Proyecto

## 📦 Dependencias del Proyecto

### package.json Actualizado

```json
{
  "name": "sirius_agent",
  "version": "1.0.0",
  "description": "GAIA - Agente conversacional especializado en sector palmicultor colombiano",
  "private": true,
  "author": "Sirius Development Team",
  "keywords": [
    "ai",
    "realtime",
    "voice-agent",
    "palm-oil",
    "colombia",
    "conversation",
    "openai"
  ],
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next node_modules/.cache"
  },
  "dependencies": {
    "@openai/agents": "^0.1.0",
    "@openai/agents-realtime": "^0.1.0",
    "@types/dom-speech-recognition": "^0.0.6",
    "@types/three": "^0.179.0",
    "animejs": "^4.1.3",
    "dat.gui": "^0.7.9",
    "lucide-react": "^0.542.0",
    "next": "15.5.2",
    "openai": "^5.19.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "three": "^0.180.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

---

## 🔧 Configuraciones Principales

### 1. Next.js Configuration (next.config.ts)

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Habilitar Turbopack para desarrollo ultrarrápido
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Optimizaciones para producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configuración para assets estáticos
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers de seguridad para WebRTC
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configuración para API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },

  // Variables de entorno expuestas al cliente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
```

### 2. TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/lib/hooks/*"]
    },
    "types": ["dom-speech-recognition"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### 3. Tailwind CSS Configuration (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores para sector palmicultor
        palm: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Colores GAIA
        gaia: {
          primary: '#15803d',
          secondary: '#166534',
          accent: '#22c55e',
          light: '#dcfce7',
          dark: '#052e16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'voice-wave': 'voice-wave 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        'voice-wave': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.5)' },
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    // Plugin para componentes adicionales
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
```

### 4. ESLint Configuration (eslint.config.mjs)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Reglas personalizadas para el proyecto
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Reglas específicas para componentes
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

export default eslintConfig;
```

### 5. PostCSS Configuration (postcss.config.mjs)

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
}

export default config
```

---

## 🌍 Variables de Entorno

### .env.local (Template)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=

# Optional: Custom Configuration
GAIA_DEBUG=true
GAIA_LOG_LEVEL=info
```

### .env.example

```bash
# Copiar a .env.local y configurar valores reales

# OpenAI API Key (Requerida)
# Obtener en: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key-here

# URL de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuraciones opcionales
GAIA_DEBUG=true
GAIA_LOG_LEVEL=info
```

---

## 🗂️ Estructura de Archivos Completa

```
sirius_agent/
├── 📁 docs/                          # Documentación del proyecto
│   ├── API_DOCUMENTATION.md
│   ├── COMPONENTS.md
│   └── PROJECT_CONFIG.md
│
├── 📁 public/                        # Assets estáticos
│   ├── favicon.ico
│   ├── logo-guaicaramo.png
│   ├── logo.png
│   └── logo2.png
│
├── 📁 src/                          # Código fuente
│   ├── 📁 app/                      # App Router de Next.js
│   │   ├── 📁 api/                  # API Routes
│   │   │   └── 📁 gaia-token/
│   │   │       └── route.ts         # Generación de tokens efímeros
│   │   ├── favicon.ico
│   │   ├── globals.css              # Estilos globales + Tailwind
│   │   ├── layout.tsx               # Layout raíz con metadata
│   │   └── page.tsx                 # Página principal
│   │
│   ├── 📁 components/               # Componentes React
│   │   ├── GaiaRealtime.tsx         # Componente principal GAIA
│   │   ├── PartnerCarousel.tsx      # Carrusel de empresas
│   │   ├── ThreeAnimation.tsx       # Animación 3D base
│   │   └── ThreeAnimationFixed.tsx  # Animación 3D optimizada
│   │
│   └── 📁 lib/                      # Lógica de negocio
│       ├── gaia-agent.ts            # Configuración del agente
│       └── 📁 hooks/
│           └── useGaia.ts           # Hook personalizado
│
├── 📄 .env.example                  # Template de variables de entorno
├── 📄 .env.local                    # Variables de entorno (no subir a git)
├── 📄 .gitignore                    # Archivos ignorados por Git
├── 📄 eslint.config.mjs            # Configuración ESLint
├── 📄 next-env.d.ts                # Tipos de Next.js
├── 📄 next.config.ts               # Configuración Next.js
├── 📄 package.json                 # Dependencias y scripts
├── 📄 postcss.config.mjs           # Configuración PostCSS
├── 📄 README.md                    # Documentación principal
├── 📄 README_COMPLETO.md           # Documentación completa
├── 📄 tailwind.config.ts           # Configuración Tailwind
├── 📄 tsconfig.json                # Configuración TypeScript
└── 📄 tsconfig.tsbuildinfo         # Cache de TypeScript
```

---

## 🚀 Scripts de NPM

### Scripts de Desarrollo

```bash
# Iniciar servidor de desarrollo con Turbopack
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm run start

# Linting del código
npm run lint

# Verificación de tipos TypeScript
npm run type-check

# Limpiar cache y node_modules
npm run clean
```

### Scripts Personalizados Recomendados

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next node_modules/.cache",
    "analyze": "cross-env ANALYZE=true npm run build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📊 Optimizaciones de Performance

### Bundle Analysis

```bash
# Instalar analizador de bundle
npm install -D @next/bundle-analyzer cross-env

# Configurar en next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Ejecutar análisis
npm run analyze
```

### Core Web Vitals Optimization

```typescript
// En layout.tsx o page.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🔐 Configuración de Seguridad

### Headers de Seguridad (next.config.ts)

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'microphone=*, camera=(), geolocation=()',
        },
      ],
    },
  ];
},
```

### Content Security Policy

```typescript
// Opcional: CSP estricto para máxima seguridad
{
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    connect-src 'self' https://api.openai.com wss:;
    media-src 'self';
  `.replace(/\s{2,}/g, ' ').trim()
}
```

---

**Configuración del Proyecto GAIA v1.0** - Septiembre 2025
