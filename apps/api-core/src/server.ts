import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import amqp from 'amqplib';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Configuração do Prisma com adaptador PostgreSQL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Inicialização da IA do Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-core' });
});

// Rota para listar os projetos do banco
app.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar projetos do banco' });
  }
});

// Rota POST: Node consulta a IA em Python e salva o projeto no banco
app.post('/projects', async (req, res) => {
  try {
    const { title, techStack } = req.body;

    const aiResponse = await axios.post('http://localhost:8000/generate-summary', {
      title: title || "Moacir Tech Hub",
      techStack: techStack || ["Node.js", "Python", "Docker", "FastAPI"]
    });

    const generatedDescription = aiResponse.data.description;

    const newProject = await prisma.project.create({
      data: {
        title: title || "Moacir Tech Hub",
        description: generatedDescription,
        techStack: techStack || ["Node.js", "Python", "Docker", "FastAPI"]
      }
    });

    res.json({ 
      message: "Sucesso! A IA gerou o resumo e o banco salvou.", 
      data: newProject 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao integrar Node com a IA ou banco' });
  }
});

// Rota para enviar tarefa assíncrona para a fila do RabbitMQ
app.post('/task-ai', async (req, res) => {
  try {
    const { prompt } = req.body;

    const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'ai_tasks_queue';

    await channel.assertQueue(queue, { durable: true });

    const message = JSON.stringify({ 
      prompt: prompt || "Processar dados em segundo plano", 
      timestamp: new Date() 
    });
    
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

    await channel.close();
    await connection.close();

    res.json({ message: "Tarefa enviada para a fila do RabbitMQ com sucesso!" });
  } catch (error) {
    console.error("Erro no RabbitMQ:", error);
    res.status(500).json({ error: "Erro ao publicar mensagem na fila" });
  }
});

// ==========================================
// ROTA DO CHAT (Com Contexto e Tratamento de Queda)
// ==========================================
app.post('/chat', async (req, res) => {
  try {
    const { message, state } = req.body;

    if (!state) {
      return res.status(400).json({ reply: "Aviso: Estado de telemetria não fornecido." });
    }

    console.log(`[Moa AI] Processando chat com contexto do sistema...`);

    const systemInstruction = `
      Você é a "Moa AI", uma Inteligência Artificial avançada que atua como Arquiteta de Software Cloud no sistema "Moa Hub".
      O Moa Hub é um Command Center Enterprise focado em Microsserviços, RabbitMQ, Docker e PostgreSQL.
      Seu tom deve ser altamente técnico, profissional, direto (sem rodeios) e ligeiramente futurista.
      
      INFORMAÇÕES CRÍTICAS EM TEMPO REAL DO SISTEMA NESTE EXATO MOMENTO:
      - Uso de CPU do Cluster (Docker/K8s): ${state.cpu}%
      - Memória RAM (PostgreSQL/Redis): ${state.ram}%
      - Tráfego de Rede (Throughput): ${state.reqs} Requisições por segundo (TPS)
      - Fila Assíncrona (RabbitMQ): ${state.tasksNaFila} tarefas aguardando processamento
      - Portfólio de Projetos (BD): ${state.totalProjetos} projetos registrados
      - Stack Base: ${state.tecnologiasAtivas}
      
      REGRAS GERAIS DE RESPOSTA:
      1. Se o usuário perguntar sobre métricas, infraestrutura ou status do sistema, responda analisando cirurgicamente os dados reais fornecidos acima.
      2. Se a CPU estiver acima de 80%, alerte sobre gargalos e recomende auto-scaling.
      3. Se houver tarefas na fila, mencione os workers assíncronos em ação.
      4. Seja breve e objetivo. Formate a resposta em Markdown (usando negritos e listas quando necessário) para facilitar a leitura no chat flutuante.
    `;

    // Usando o modelo estável padrão do Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(message);
    const textResponse = result.response.text();

    res.json({ reply: textResponse });

  } catch (error: any) {
    console.error("Erro no chat inteligente:", error);
    
    // Tratamento resiliente caso a API do Google caia ou lote
    if (error.status === 503) {
      return res.json({ 
        reply: "⚠️ *Status:* A rede neural do Google Gemini está passando por um pico de tráfego global neste momento. Aguarde alguns segundos e tente consultar as métricas novamente." 
      });
    }

    res.status(500).json({ reply: "Falha de comunicação com a rede neural (Serviço indisponível no momento)." });
  }
});

app.listen(port, () => {
  console.log(`🚀 API Core rodando na porta http://localhost:${port}`);
});