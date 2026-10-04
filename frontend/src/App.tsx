import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Cpu, Server, Database, Activity, Terminal, Zap, RefreshCw, 
  MessageSquare, Send, X, Sun, Moon, Table2,
  BarChart3, ExternalLink, Globe, HardDrive, Layers, Play, Trash2,
  ShieldCheck, GitBranch, GitCommit, Shield, Bug, Gauge, TrendingDown,
  CheckCircle2, Code2, Network, Box, LayoutDashboard, GitPullRequest, Settings, Users, FileText, HelpCircle, HardDriveDownload
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, YAxis } from 'recharts';

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  createdAt: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface RabbitTask {
  id: string;
  task: string;
  status: 'Pendente' | 'Processando' | 'Concluído';
  timestamp: string;
}

interface DBTable {
  tableName: string;
  columns: { name: string; type: string }[];
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'cicd' | 'rabbitmq' | 'database' | 'logs' | 'finops'>('dashboard');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [dbTables, setDbTables] = useState<DBTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [techs, setTechs] = useState('React, Node.js, Python, FastAPI, Docker, RabbitMQ');
  const [submitting, setSubmitting] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Olá! Sou o assistente virtual do Moa Hub. Como posso ajudar com sua arquitetura hoje?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const [auditPrompt, setAuditPrompt] = useState('{"action": "audit_cluster", "target": "k8s-nodes"}');
  const [rabbitQueue, setRabbitQueue] = useState<RabbitTask[]>([
    { id: '1a2b3c', task: '{"action": "index_logs", "service": "auth"}', status: 'Pendente', timestamp: new Date().toLocaleTimeString() },
    { id: '9f8e7d', task: '{"action": "train_rag", "model": "llama3"}', status: 'Processando', timestamp: new Date().toLocaleTimeString() }
  ]);

  const [metricHistory, setMetricHistory] = useState<{ time: string; cpu: number; ram: number; reqs: number }[]>(
    Array.from({ length: 15 }).map(() => ({ time: '', cpu: 0, ram: 0, reqs: 0 }))
  );

  const [logs, setLogs] = useState<string[]>([
    "[System] Moa Hub Command Center inicializado com sucesso.",
    "[Network] Handshake estabelecido com API Core (Porta 4000).",
    "[Database] Schema PostgreSQL sincronizado via Prisma.",
    "[RabbitMQ] Exchange e filas de mensageria assíncrona ativas."
  ]);

  const [pipelineStep, setPipelineStep] = useState<number>(5);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMetricHistory(prev => {
        const newRecord = {
          time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute:'2-digit' }),
          cpu: Math.floor(Math.random() * 40) + 20,
          ram: Math.floor(Math.random() * 15) + 55,
          reqs: Math.floor(Math.random() * 80) + 20,
        };
        return [...prev.slice(1), newRecord];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/projects');
      setProjects(response.data);
      addLog("Sincronização de portfólio PostgreSQL concluída.");
    } catch (error) {
      addLog("Aviso: Falha na comunicação com o PostgreSQL (Fallback visual ativo).");
      if (projects.length === 0) {
        setProjects([
          { id: '1', title: 'Plataforma Neural AI', description: 'Sistema distribuído para inferência de modelos LLM em tempo real com auto-scaling.', techStack: ['Python', 'FastAPI', 'Redis', 'Docker'], createdAt: '' },
          { id: '2', title: 'Fintech Transaction Core', description: 'Microsserviço de processamento de pagamentos com garantia de entrega.', techStack: ['Node.js', 'NestJS', 'RabbitMQ', 'PostgreSQL'], createdAt: '' },
          { id: '3', title: 'Dashboard de Telemetria', description: 'Frontend de alta performance para visualização de milhões de data points em tempo real.', techStack: ['React', 'TypeScript', 'Recharts', 'Tailwind'], createdAt: '' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get('http://localhost:4000/db/schema');
      setDbTables(res.data);
    } catch (error) {
      setDbTables([
        {
          tableName: 'Project',
          columns: [
            { name: 'id', type: 'UUID (PK)' },
            { name: 'title', type: 'VARCHAR(255)' },
            { name: 'description', type: 'TEXT' },
            { name: 'techStack', type: 'VARCHAR[]' },
            { name: 'createdAt', type: 'TIMESTAMP' }
          ]
        },
        {
          tableName: 'User',
          columns: [
            { name: 'id', type: 'UUID (PK)' },
            { name: 'email', type: 'VARCHAR(150) UNIQUE' },
            { name: 'role', type: 'ENUM("ADMIN", "USER")' },
            { name: 'lastLogin', type: 'TIMESTAMP' }
          ]
        },
        {
          tableName: 'SystemLogs',
          columns: [
            { name: 'id', type: 'BIGSERIAL (PK)' },
            { name: 'level', type: 'VARCHAR(50)' },
            { name: 'message', type: 'TEXT' },
            { name: 'timestamp', type: 'TIMESTAMP INDEXED' }
          ]
        }
      ]);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTables();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await axios.post('/.netlify/functions/gemini', { prompt: userMsg });
      const textoGerado = response.data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { sender: 'ai', text: textoGerado }]);
    } catch (error: any) {
      const mensagemErro = error.response?.data?.error || error.message || 'Erro desconhecido';
      setMessages(prev => [...prev, { sender: 'ai', text: `Erro: ${mensagemErro}` }]);
    } finally {
      setChatLoading(false);
    }
  };
  
  const handleTriggerQueue = async () => {
    const newTask: RabbitTask = {
      id: Math.random().toString(36).substring(2, 8), 
      task: auditPrompt, 
      status: 'Pendente', 
      timestamp: new Date().toLocaleTimeString()
    };
    addLog(`Message published to exchange default, routing key: moa_hub_tasks`);
    setRabbitQueue(prev => [newTask, ...prev.slice(0, 19)]);
  };

  const processRabbitTask = (id: string) => {
    setRabbitQueue(prev => prev.map(t => t.id === id ? { ...t, status: 'Processando' } : t));
    addLog(`Consumer got message [${id}] - unacked`);
    setTimeout(() => {
      setRabbitQueue(prev => prev.filter(t => t.id !== id));
      addLog(`Message [${id}] acked and removed.`);
    }, 2000);
  };

  const deleteRabbitTask = (id: string) => {
    setRabbitQueue(prev => prev.filter(t => t.id !== id));
    addLog(`Message [${id}] rejected (NACK).`);
  };

  const triggerPipeline = () => {
    if(isPipelineRunning) return;
    setIsPipelineRunning(true);
    setPipelineStep(0);
    addLog("[CI/CD] Nova pipeline de deploy iniciada...");
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setPipelineStep(currentStep);
      
      const stepMsgs = [
        "[CI/CD] Clonando repositório e instalando dependências...",
        "[CI/CD] Executando testes unitários e Linting...",
        "[CI/CD] Análise SonarQube e Snyk (Vulnerabilidades 0)...",
        "[CI/CD] Build da imagem Docker e push para o Registry...",
        "[CI/CD] Deploy no Kubernetes concluído com sucesso."
      ];
      if(currentStep <= 5) addLog(stepMsgs[currentStep-1]);

      if (currentStep >= 5) {
        clearInterval(interval);
        setIsPipelineRunning(false);
      }
    }, 1500);
  };

  const currentCpu = metricHistory[metricHistory.length - 1]?.cpu || 0;
  const currentRam = metricHistory[metricHistory.length - 1]?.ram || 0;
  const currentReqs = metricHistory[metricHistory.length - 1]?.reqs || 0;

  const rabbitReady = rabbitQueue.filter(t => t.status === 'Pendente').length;
  const rabbitUnacked = rabbitQueue.filter(t => t.status === 'Processando').length;
  const rabbitTotal = rabbitQueue.length;

  const finOpsData = [
    { name: 'EC2', Unoptimized: 3200, Optimized: 1100 },
    { name: 'RDS', Unoptimized: 1800, Optimized: 850 },
    { name: 'Network', Unoptimized: 900, Optimized: 400 },
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex overflow-hidden">
        
        {/* SIDEBAR ESTILO RAILWAY */}
        <aside className="w-64 bg-[#070a12] border-r border-slate-800/80 flex flex-col justify-between select-none z-20">
          <div>
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-md">
                  M
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200 truncate w-32">Moacir Fernandes</span>
                  <span className="text-[10px] text-emerald-400 font-mono">TRIAL ACTIVE</span>
                </div>
              </div>
            </div>

            <nav className="p-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workspace</div>
              
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800/80 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Visão Geral & Métricas
              </button>

              <button 
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'projects' ? 'bg-slate-800/80 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <Layers className="w-4 h-4 text-indigo-400" /> Projetos & Arquiteturas
              </button>

              <button 
                onClick={() => setActiveTab('cicd')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'cicd' ? 'bg-slate-800/80 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <GitBranch className="w-4 h-4 text-emerald-400" /> Pipeline CI/CD
              </button>

              <button 
                onClick={() => setActiveTab('rabbitmq')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'rabbitmq' ? 'bg-slate-800/80 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <Zap className="w-4 h-4 text-orange-400" /> RabbitMQ Queues
              </button>

              <button 
                onClick={() => setActiveTab('database')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'database' ? 'bg-slate-800/80 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <Database className="w-4 h-4 text-blue-400" /> Database Schema
              </button>

              <button 
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'logs' ? 'bg-slate-800/80 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <Terminal className="w-4 h-4 text-amber-400" /> System Logs & Shell
              </button>

              <button 
                onClick={() => setActiveTab('finops')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'finops' ? 'bg-slate-800/80 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <TrendingDown className="w-4 h-4 text-pink-400" /> FinOps & Qualidade
              </button>
            </nav>

            <div className="px-6 py-2">
              <div className="border-t border-slate-800 my-2"></div>
            </div>

            <div className="p-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recursos</div>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40">
                <FileText className="w-4 h-4" /> Docs & Manuais
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40">
                <Network className="w-4 h-4" /> Central Station
              </a>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">MF</div>
              <span className="text-xs font-medium truncate w-32">Moacir Fernandes</span>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="text-slate-400 hover:text-amber-400 transition-colors p-1"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT CONTAINER */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0b0f19] p-6 lg:p-8 space-y-6">
          
          {/* TOP BANNER TRIAL EXPIRED / NOTIFICATION */}
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-2xl flex justify-between items-center text-xs shadow-md">
            <div className="flex items-center gap-2 font-medium">
              <span className="bg-amber-500 text-black px-2 py-0.5 rounded font-bold text-[10px]">Trial Ended</span>
              Thanks for trying Moa Hub! Upgrade now to continue using the full platform telemetry.
            </div>
            <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
              Upgrade now
            </button>
          </div>

          {/* HEADER DA VIEW ATUAL */}
          <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl backdrop-blur-md shadow-lg">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                {activeTab === 'dashboard' && 'Visão Geral & Métricas em Tempo Real'}
                {activeTab === 'projects' && 'Portfólio de Projetos & Arquiteturas'}
                {activeTab === 'cicd' && 'Pipeline de Automação CI/CD'}
                {activeTab === 'rabbitmq' && 'RabbitMQ Management & Mensageria'}
                {activeTab === 'database' && 'Database Schema & PostgreSQL Explorer'}
                {activeTab === 'logs' && 'System Logs & Interactive Terminal'}
                {activeTab === 'finops' && 'FinOps, Custos & Qualidade de Código'}
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">Gerenciamento de infraestrutura distribuída e microsserviços</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchProjects}
                className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Sincronizar
              </button>
            </div>
          </div>

          {/* CONTEÚDO DINÂMICO */}
          
          {(activeTab === 'dashboard' || activeTab === 'finops') && (
            <>
              {/* DORA Metrics */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-4">
                  <Gauge className="w-4 h-4" /> DORA Metrics (Elite Performer)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Deployment Freq.', value: 'On Demand', desc: 'Múltiplos deploys/dia', color: 'text-emerald-400' },
                    { label: 'Lead Time for Changes', value: '< 1 Hour', desc: 'Do commit a produção', color: 'text-cyan-400' },
                    { label: 'Time to Restore (MTTR)', value: '12 Mins', desc: 'Recuperação automática', color: 'text-indigo-400' },
                    { label: 'Change Failure Rate', value: '0.8%', desc: 'Falhas em produção', color: 'text-pink-400' },
                  ].map((metric, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl flex flex-col justify-center">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{metric.label}</p>
                      <p className={`text-xl font-black ${metric.color} mb-1`}>{metric.value}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{metric.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                      <Cpu className="w-4 h-4 text-cyan-400" /> CPU Cluster (k8s)
                    </h3>
                    <span className="text-xl font-mono font-black text-cyan-400">{currentCpu}%</span>
                  </div>
                  <div className="h-24 w-full -ml-2 -mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metricHistory}>
                        <defs>
                          <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                      <Database className="w-4 h-4 text-indigo-400" /> RAM PostgreSQL
                    </h3>
                    <span className="text-xl font-mono font-black text-indigo-400">{currentRam}%</span>
                  </div>
                  <div className="h-24 w-full -ml-2 -mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metricHistory}>
                        <defs>
                          <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="ram" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                      <BarChart3 className="w-4 h-4 text-emerald-400" /> Network Traffic
                    </h3>
                    <span className="text-xl font-mono font-black text-emerald-400">{currentReqs} req/s</span>
                  </div>
                  <div className="h-24 w-full -ml-2 -mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricHistory}>
                        <Bar dataKey="reqs" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {(activeTab === 'dashboard' || activeTab === 'finops') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-6">
                  <ShieldCheck className="w-4 h-4" /> Qualidade de Código & Segurança
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Bug className="w-6 h-6 text-emerald-400 mb-2" />
                    <span className="text-2xl font-black text-white">0</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Vulnerabilidades Críticas</span>
                  </div>
                  <div className="bg-blue-950/20 border border-blue-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Code2 className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-2xl font-black text-white">92.4%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Code Coverage (Testes)</span>
                  </div>
                  <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Shield className="w-6 h-6 text-indigo-400 mb-2" />
                    <span className="text-2xl font-black text-white">Grade A</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Technical Debt Ratio</span>
                  </div>
                  <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <GitCommit className="w-6 h-6 text-cyan-400 mb-2" />
                    <span className="text-2xl font-black text-white">100%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Code Review Approval</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4" /> FinOps & Otimização de Custos
                  </div>
                  <div className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-800">
                    Economia de 60%
                  </div>
                </div>
                <div className="h-48 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={finOpsData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px'}} />
                      <Bar dataKey="Unoptimized" name="Sem Otimização ($)" fill="#64748b" radius={[0, 4, 4, 0]} barSize={12} />
                      <Bar dataKey="Optimized" name="Arquitetura Otimizada ($)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'dashboard' || activeTab === 'cicd') && (
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <GitBranch className="w-4 h-4" /> Automação CI/CD
                </div>
                <button 
                  onClick={triggerPipeline} 
                  disabled={isPipelineRunning}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" /> Trigger Deploy
                </button>
              </div>

              <div className="relative flex justify-between items-center px-4">
                <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
                {[
                  { icon: Code2, label: 'Source' },
                  { icon: Terminal, label: 'Test & Lint' },
                  { icon: ShieldCheck, label: 'Security' },
                  { icon: Box, label: 'Build' },
                  { icon: Server, label: 'Deploy' }
                ].map((step, idx) => {
                  const isDone = pipelineStep > idx;
                  const isActive = pipelineStep === idx;
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                        isDone ? 'bg-emerald-500 border-emerald-900/50 text-white' : 
                        isActive ? 'bg-cyan-500 border-cyan-900/50 text-white animate-pulse' : 
                        'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                        isDone || isActive ? 'text-slate-200' : 'text-slate-500'
                      }`}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(activeTab === 'dashboard' || activeTab === 'rabbitmq') && (
            <div className="bg-[#1a1f2b] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-[#ff6600] text-white px-4 py-2.5 flex justify-between items-center shadow-md">
                <div className="font-bold text-lg flex items-center gap-2">RabbitMQ Management</div>
                <div className="text-xs font-medium bg-black/10 px-3 py-1 rounded">User: guest | Virtual host: /</div>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 text-slate-200">All queues</h3>
                  <div className="overflow-x-auto border border-slate-700 rounded-lg">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800 border-b border-slate-700">
                        <tr>
                          <th className="px-3 py-2.5 text-slate-300 font-semibold">Name</th>
                          <th className="px-3 py-2.5 text-slate-300 font-semibold">Features</th>
                          <th className="px-3 py-2.5 text-slate-300 font-semibold">State</th>
                          <th className="px-3 py-2.5 bg-blue-950/20 text-center border-l border-slate-700 font-semibold">Ready</th>
                          <th className="px-3 py-2.5 bg-pink-950/20 text-center border-l border-slate-700 font-semibold">Unacked</th>
                          <th className="px-3 py-2.5 bg-green-950/20 text-center border-l border-slate-700 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-blue-400">moa_hub_tasks</td>
                          <td className="px-3 py-2.5 text-[10px]"><span className="bg-[#ff6600]/10 text-[#ff6600] border border-[#ff6600]/20 px-1.5 py-0.5 rounded font-bold">D</span></td>
                          <td className="px-3 py-2.5"><span className="text-green-400 bg-green-950 px-2 py-0.5 rounded text-xs font-bold">running</span></td>
                          <td className="px-3 py-2.5 text-center border-l border-slate-800 font-mono text-slate-200">{rabbitReady}</td>
                          <td className="px-3 py-2.5 text-center border-l border-slate-800 font-mono text-slate-200">{rabbitUnacked}</td>
                          <td className="px-3 py-2.5 text-center border-l border-slate-800 font-mono font-bold text-slate-200">{rabbitTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border border-slate-700 rounded-lg p-4 space-y-4 bg-slate-900/50">
                  <div className="font-bold text-sm text-slate-200">Publish message</div>
                  <textarea
                    value={auditPrompt}
                    onChange={(e) => setAuditPrompt(e.target.value)}
                    className="w-full border border-slate-700 rounded-md bg-[#0f172a] p-3 text-sm font-mono focus:border-[#ff6600] outline-none text-slate-200 h-20"
                  />
                  <button onClick={handleTriggerQueue} className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2 rounded font-bold text-sm transition-colors">
                    Publish message
                  </button>
                </div>

                <div className="border border-slate-700 rounded-lg p-4 space-y-4 bg-slate-900/50">
                  <div className="font-bold text-sm text-slate-200">Get messages</div>
                  {rabbitQueue.length === 0 ? (
                    <div className="text-center p-4 text-slate-500 text-sm">Queue is empty</div>
                  ) : (
                    <div className="space-y-3">
                      {rabbitQueue.map(t => (
                        <div key={t.id} className="p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-[#ff6600] font-bold">ID: {t.id}</span>
                            <div className="font-mono text-xs text-slate-300">{t.task}</div>
                          </div>
                          <div className="flex gap-2">
                            {t.status === 'Pendente' && (
                              <button onClick={() => processRabbitTask(t.id)} className="bg-green-950 text-green-400 px-3 py-1 rounded text-xs font-bold">ACK</button>
                            )}
                            <button onClick={() => deleteRabbitTask(t.id)} className="bg-red-950 text-red-400 px-3 py-1 rounded text-xs font-bold">NACK</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'dashboard' || activeTab === 'database') && (
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-lg">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2 text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" /> DB Explorer
              </div>
              <h2 className="text-xl font-bold text-white mb-6">Database Schema (PostgreSQL)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {dbTables.map((table, idx) => (
                  <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                      <Table2 className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-sm font-bold text-slate-200">{table.tableName}</span>
                    </div>
                    <div className="p-4 flex-1">
                      <ul className="space-y-2">
                        {table.columns.map((col, cIdx) => (
                          <li key={cIdx} className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400">{col.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400">{col.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'dashboard' || activeTab === 'logs') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
                    <Terminal className="w-4 h-4" /> SYSTEM_LOGS.sh
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="flex-1 space-y-2 font-mono text-xs overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="text-slate-300 border-l-2 border-slate-800 pl-3">
                      <span className="text-cyan-400 font-bold mr-2">~</span> {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-center">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-8">
                  <Network className="w-4 h-4" /> System Topology
                </div>
                <div className="flex flex-col items-center gap-4 relative py-4">
                  <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-xs font-mono text-slate-300">Client / Web</div>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <div className="bg-indigo-900/50 border border-indigo-500/50 px-6 py-2.5 rounded-lg text-sm font-bold text-indigo-200">API Gateway (Kong)</div>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <div className="flex gap-3 w-full justify-center">
                    <div className="bg-cyan-950 border border-cyan-800 px-3 py-2 rounded-lg text-[10px] font-mono text-cyan-300">Auth Svc</div>
                    <div className="bg-cyan-950 border border-cyan-800 px-3 py-2 rounded-lg text-[10px] font-mono text-cyan-300">Core API</div>
                    <div className="bg-cyan-950 border border-cyan-800 px-3 py-2 rounded-lg text-[10px] font-mono text-cyan-300">Worker</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'dashboard' || activeTab === 'projects') && (
            <section className="pt-4 pb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">Projetos & Arquiteturas Ativas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col group">
                    <div className="flex justify-between gap-4 mb-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                      <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 text-sm mb-6 flex-1">{project.description}</p>
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {project.techStack.map((tech, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">{tech}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}