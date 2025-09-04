# Script de Pruebas GAIA - Sistema Mejorado

## Casos de Prueba Estructurados

### 1. GUAICARAMO S.A.S
```
Usuario: "¿Qué hace GUAICARAMO?"
Respuesta esperada: Información sobre empresa familiar, aceites/ganadería/cítricos, fundada 2012

Usuario: "¿Cuál es la filosofía de GUAICARAMO?"
Respuesta esperada: "Trabajamos con responsabilidad por amor a nuestra labor"

Usuario: "¿Cómo contacto a GUAICARAMO?"
Respuesta esperada: LinkedIn (@11425112), Instagram (@guaicaramo)
```

### 2. Fundación GUAICARAMO
```
Usuario: "¿Quién dirige la Fundación GUAICARAMO?"
Respuesta esperada: María Adelaida Barros Jaramillo, Gov. y RR.II., Maestría Derecho Adm.

Usuario: "¿Cuántas personas ha beneficiado la Fundación?"
Respuesta esperada: Más de 10,000 personas en 12+ años

Usuario: "¿Cuál es el teléfono de la Fundación?"
Respuesta esperada: +57 350 459 7003
```

### 3. SIRIUS Regenerative Solutions
```
Usuario: "¿Qué productos tiene SIRIUS?"
Respuesta esperada: Biochar Blend, Star Dust, Sirius Bacter, Tratamiento Preventivo Plagas

Usuario: "¿Cuál es la filosofía de SIRIUS?"
Respuesta esperada: "Despierta tu alma: Regenera el mundo"

Usuario: "¿Qué es la meta 2030 de SIRIUS?"
Respuesta esperada: 100,000 hectáreas regeneradas
```

### 4. Del Llano Alto Oleico
```
Usuario: "¿Qué es Del Llano Alto Oleico?"
Respuesta esperada: Producto de aceite alto oleico, región Llano Oriental

Usuario: "¿Quién es el gerente de DAO?"
Respuesta esperada: Roberto Herrera

Usuario: "¿Cuál es la visión de DAO?"
Respuesta esperada: "NUNCA PERDER TU CONFIANZA"
```

### 5. Consultas Técnicas
```
Usuario: "¿Qué es el biochar?"
Respuesta esperada: Explicación técnica relacionada con SIRIUS y biotecnología

Usuario: "¿Qué es la región ZOMAC?"
Respuesta esperada: Zona Más Afectada por el Conflicto, Barranca de Upía

Usuario: "¿Qué ventajas tiene el aceite alto oleico?"
Respuesta esperada: Propiedades nutricionales superiores, calidad premium
```

### 6. Conexiones Entre Entidades
```
Usuario: "¿Qué relación hay entre GUAICARAMO y la Fundación?"
Respuesta esperada: Empresa y fundación relacionadas, mismo ecosistema

Usuario: "¿Dónde están ubicadas estas empresas?"
Respuesta esperada: Barranca de Upía, Meta, región ZOMAC
```

## Checklist de Validación

### ✅ Información Específica
- [ ] Nombres exactos de personas
- [ ] Fechas correctas de fundación
- [ ] Números de teléfono precisos
- [ ] Emails correctos
- [ ] Ubicaciones exactas

### ✅ Conocimiento Técnico
- [ ] Explicaciones de biotecnología
- [ ] Definiciones de productos especializados
- [ ] Contexto de región ZOMAC
- [ ] Procesos agroindustriales

### ✅ Tono y Comportamiento
- [ ] Profesional pero cercano
- [ ] Especializado en sector palmicultor
- [ ] Conexiones relevantes entre entidades
- [ ] Respuestas en español
- [ ] Información de contacto cuando corresponde

### ✅ Casos Edge
- [ ] Preguntas fuera del dominio → redirigir apropiadamente
- [ ] Información no disponible → reconocer honestamente
- [ ] Múltiples entidades en una pregunta → conectar apropiadamente

## Comandos de Prueba Rápida

### Terminal Test
```bash
# Ejecutar el proyecto
npm run dev

# En otra terminal, probar la API directamente
curl -X POST http://localhost:3000/api/gaia-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Qué hace GUAICARAMO?","messages":[]}'
```

### Pruebas de Interface
1. Abrir http://localhost:3000
2. Activar modo Chat
3. Probar cada caso de prueba
4. Validar respuestas contra expectativas

### Monitoreo de Logs
```bash
# Observar logs de la API
tail -f .next/trace

# Observar errores en consola del navegador
F12 → Console → Filtrar por 'gaia' o 'chat'
```

## Resultados Esperados

### Respuesta Típica a "¿Qué hace GUAICARAMO?"
```
GUAICARAMO S.A.S es una empresa familiar fundada en 2012, ubicada en Barranca de Upía, Meta, en la región ZOMAC. 

La empresa se especializa en tres líneas principales de negocio:
- Aceites de palma sostenibles
- Ganadería responsable  
- Cultivos de cítricos

Su filosofía empresarial es "Trabajamos con responsabilidad por amor a nuestra labor", y tienen un fuerte compromiso con la sostenibilidad y la restauración de la madre tierra.

Además, desarrollan proyectos sociales como "Guaicaramo siembra futuro" enfocado en niños y jóvenes de la región.

Puedes encontrarlos en LinkedIn (@11425112) e Instagram (@guaicaramo).
```

### Indicadores de Éxito
- Información específica y precisa
- Contexto regional (ZOMAC, Meta)
- Filosofía empresarial exacta
- Datos de contacto correctos
- Conexión con sostenibilidad
- Tono profesional y especializado
