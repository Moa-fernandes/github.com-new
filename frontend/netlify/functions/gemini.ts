export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as { prompt?: string; message?: string };
    const prompt = body.prompt || body.message;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Erro no Servidor: A variável GEMINI_API_KEY não está configurada no Netlify.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Nenhum prompt fornecido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Usando o endpoint oficial atualizado da API do Google (v1beta com gemini-1.5-flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await googleResponse.json() as any;

    if (!googleResponse.ok) {
      return new Response(JSON.stringify({ 
        error: `Google API Error: ${data.error?.message || 'Erro desconhecido'}` 
      }), {
        status: googleResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Erro interno na função' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};