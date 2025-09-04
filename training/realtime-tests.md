# Pruebas para GAIA Realtime - Información Especializada

## Estado Actual
✅ **ACTUALIZADO**: `gaia-agent.ts` ahora incluye toda la información de entrenamiento completa
✅ **SINCRONIZADO**: GAIA realtime y GAIA chat tienen el mismo conocimiento especializado

## Casos de Prueba para GAIA Realtime (Voz)

### 1. Información Básica de Empresas
```
🎤 "¿Qué hace GUAICARAMO?"
Respuesta esperada: Empresa familiar 2012, aceites/ganadería/cítricos, Barranca de Upía

🎤 "¿Cuál es la filosofía de GUAICARAMO?"
Respuesta esperada: "Trabajamos con responsabilidad por amor a nuestra labor"

🎤 "¿Qué productos tiene SIRIUS?"
Respuesta esperada: Biochar Blend, Star Dust, Sirius Bacter, Tratamiento Preventivo Plagas
```

### 2. Información de Contacto Específica
```
🎤 "¿Cómo contacto a la Fundación GUAICARAMO?"
Respuesta esperada: +57 350 459 7003, contacto@funguaicaramo.org

🎤 "¿Quién dirige la Fundación GUAICARAMO?"
Respuesta esperada: María Adelaida Barros Jaramillo

🎤 "¿Cuál es el teléfono de SIRIUS?"
Respuesta esperada: +57 320 956 8566
```

### 3. Información Técnica Especializada
```
🎤 "¿Qué es el biochar?"
Respuesta esperada: Explicación técnica relacionada con SIRIUS y pirólisis

🎤 "¿Cuál es la meta 2030 de SIRIUS?"
Respuesta esperada: 100,000 hectáreas regeneradas

🎤 "¿Qué es ZOMAC?"
Respuesta esperada: Zona Más Afectada por el Conflicto, Barranca de Upía, Meta
```

### 4. Conexiones Entre Entidades
```
🎤 "¿Qué relación hay entre GUAICARAMO y la Fundación?"
Respuesta esperada: Ecosistema relacionado, mismo territorio, desarrollo integral

🎤 "¿Dónde están ubicadas estas empresas?"
Respuesta esperada: Barranca de Upía, Meta, región ZOMAC
```

## Diferencias Clave Implementadas

### Antes (Información Básica)
- Descripción general del sector
- Información limitada de empresas
- Sin datos de contacto específicos
- Sin detalles técnicos especializados

### Después (Información Completa)
- ✅ Datos específicos de fundación y ubicación
- ✅ Filosofías empresariales exactas
- ✅ Información de contacto completa
- ✅ Detalles técnicos especializados
- ✅ Personas clave por nombre
- ✅ Productos y servicios específicos
- ✅ Metas y objetivos empresariales

## Validación de Actualización

### Campos Actualizados en gaia-agent.ts:
- ✅ `ENHANCED_GAIA_KNOWLEDGE` con información completa
- ✅ Entidades principales detalladas
- ✅ Especialización técnica expandida
- ✅ Capacidades conversacionales mejoradas
- ✅ Palabras clave específicas del sector
- ✅ Personalidad especializada

### Información Ahora Disponible en Voz:
- ✅ GUAICARAMO S.A.S (empresa + filosofía + contactos)
- ✅ Fundación GUAICARAMO (directora + programas + contacto)
- ✅ SIRIUS Regenerative (productos + tecnología + metas)
- ✅ Del Llano Alto Oleico (gerente + visión + propiedades)
- ✅ Contexto ZOMAC y sector palmicultor

## Próximos Pasos

1. **Probar GAIA Realtime**: Activar modo de voz y probar casos específicos
2. **Validar Respuestas**: Comparar con información en carpeta `training/`
3. **Ajustar si Necesario**: Refinar prompts basado en resultados de prueba
4. **Documentar Resultados**: Registrar casos exitosos y áreas de mejora

## Comandos de Prueba

### Iniciar Servidor
```bash
npm run dev
```

### Acceder a GAIA
1. Ir a http://localhost:3000
2. Hacer clic en botón de "Conversación" (modo realtime)
3. Hablar cualquiera de los casos de prueba
4. Validar que la respuesta incluya información específica

### Casos de Éxito Esperados
- Menciona nombres específicos de personas
- Incluye datos de contacto exactos
- Explica filosofías empresariales
- Conecta conceptos entre organizaciones
- Demuestra conocimiento técnico especializado
