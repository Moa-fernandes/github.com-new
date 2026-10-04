import { Handler } from '@netlify/functions';

// Importação necessária para o fetch funcionar em ambientes Node.js mais antigos no Netlify
import fetch from 'node-fetch'; 

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt || body.message;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro no Servidor: A variável GEMINI_API_KEY não está configurada no Netlify.' }),
      };
    }

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nenhum prompt fornecido.' }),
      };
    }

    // URL Corrigida e Simplificada para o modelo universal estável (gemini-pro na v1)
    const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Tratamento de erro mais detalhado para ajudar no debug
      const errorDetails = data.error ? JSON.stringify(data.error) : 'Resposta inválida do Google AI';
      console.error('Erro da API do Google:', errorDetails);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Google API Error (${response.status}): ${data.error?.message || 'Verifique a chave da API e o modelo.'}`
        }),
      };
    }

    // Verificação da estrutura da resposta para evitar erros no frontend
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'A API do Google retornou sucesso, mas nenhum conteúdo foi gerado.' }),
        };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error('Erro interno na Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Erro interno desconhecido no servidor Netlify' }),
    };
  }
};