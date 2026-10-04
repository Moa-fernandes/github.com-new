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

// Configuração do CORS para aceitar requisições do seu domínio no Netlify e localhost
app.use(cors({
  origin: '*', // Em produção, você pode substituir '*' pela URL exata do seu netlify (ex: 'https://seu-site.netlify.app')
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configuração do Prisma com adaptador PostgreSQL (Resiliente caso falhe a conexão inicial)
let prisma: PrismaClient;
try {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} catch (e) {
  console.warn("Aviso: Prisma inicializado em modo de fallback.");
}

// Inicialização da IA do Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-core' });
});

// Rota para listar os projetos do banco
app.get('/projects', async (req, res) => {
  try {
    if (!prisma) throw new Error("DB não configurado");
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error) {
    // Fallback caso o banco na nuvem ainda não esteja populado
    res.json([
      { id: '1', title: 'Plataforma Neural AI', description: 'Sistema distribuído para inferência de modelos LLM em tempo real.', techStack: ['Python', 'FastAPI', 'Redis', 'Docker'], createdAt: '' },
      { id: '2', title: 'Fintech Transaction Core', description: 'Microsserviço de processamento de pagamentos.', techStack: ['Node.js', 'NestJS', 'RabbitMQ', 'PostgreSQL'], createdAt: '' }
    ]);
  }
});

// Rota POST: Node consulta a IA e salva o projeto no banco
app.post('/projects', async (req, res) => {
  try {
    const { title, techStack } = req.body;
    let generatedDescription = "Arquitetura gerada via Inteligência Artificial com alta escalabilidade.";

    try {
      // Se houver um serviço Python rodando
      const aiResponse = await axios.post(process.env.PYTHON_AI_URL || 'http://localhost:8000/generate-summary', {
        title: title || "Moacir Tech Hub",
        techStack: techStack || ["Node.js", "Python", "Docker", "FastAPI"]
      });
      generatedDescription = aiResponse.data.description;
    } catch (err) {
      console.log("Serviço Python externo indisponível, usando gerador interno do Node.");
    }

    let newProject: any = { id: Math.random().toString(), title: title || "Moacir Tech Hub", description: generatedDescription, techStack: techStack || ["Node.js"] };

    if (prisma) {
      newProject = await prisma.project.create({
        data: {
          title: title || "Moacir Tech Hub",
          description: generatedDescription,
          techStack: techStack || ["Node.js", "Python", "Docker", "FastAPI"]
        }
      });
    }

    res.json({ 
      message: "Sucesso! Projeto gerado e salvo.", 
      data: newProject 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao integrar serviços' });
  }
});

// Rota para enviar tarefa assíncrona para a fila do RabbitMQ
app.post('/task-ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    
    const connection = await amqp.connect(rabbitUrl);
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
    console.warn("Aviso RabbitMQ (Modo simulado ativo):", error);
    res.json({ message: "Tarefa simulada na fila com sucesso (RabbitMQ offline)!" });
  }
});

// ==========================================
// ROTA DO CHAT (Com Contexto e Correção do Modelo Gemini)
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

    // Correção: Garantindo o uso de um modelo compatível e padrão do Google AI Studio ("gemini-1.5-flash")
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(message);
    const textResponse = result.response.text();

    res.json({ reply: textResponse });

  } catch (error: any) {
    console.error("Erro no chat inteligente:", error);
    
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