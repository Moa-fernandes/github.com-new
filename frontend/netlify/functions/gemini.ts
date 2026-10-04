export default async (req: Request) => {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as { prompt?: string };
    const prompt = body.prompt;

    const apiKey = process.env.GEMINI_API_KEY;

    // Verificação de segurança da chave
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

    // A CORREÇÃO MAIS IMPORTANTE: Usar o endpoint universal do Google AI Studio (v1)
    // e o modelo gemini-1.5-flash com o formato correto.
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await googleResponse.json() as any;

    // Tratamento de erro da API do Google
    if (!googleResponse.ok) {
      console.error('Erro da API do Google:', JSON.stringify(data));
      return new Response(JSON.stringify({ 
        error: `Google API Error (${googleResponse.status}): ${data.error?.message || 'Verifique o console de erro do Netlify.'}` 
      }), {
        status: googleResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificação da estrutura da resposta do Gemini
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts) {
        console.error('Estrutura de resposta do Gemini inesperada:', JSON.stringify(data));
        return new Response(JSON.stringify({ error: 'A API retornou sucesso, mas nenhum conteúdo foi gerado.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Retorna a resposta de sucesso para o frontend
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro interno na Netlify Function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno desconhecido no servidor Netlify' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};