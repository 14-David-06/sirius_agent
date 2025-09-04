import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Verificar que tenemos la API key de OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY no está configurada' },
        { status: 500 }
      );
    }

    console.log('Generando token efímero para GAIA...'); // Forzar recompilación

    // Generar token efímero usando el endpoint correcto según la documentación
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
      console.error('Error de OpenAI API:', response.status, errorText);
      
      return NextResponse.json(
        { error: `Error generando token efímero: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Token efímero generado exitosamente');
    
    // Según la respuesta real de OpenAI, el token está en 'value' directamente
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
