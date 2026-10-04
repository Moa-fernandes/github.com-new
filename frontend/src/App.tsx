import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Cpu, Server, Database, Activity, Terminal, Zap, RefreshCw, 
  MessageSquare, Send, X, Sun, Moon, Table2,
  BarChart3, ExternalLink, Globe, HardDrive, Layers, Play, Trash2,
  ShieldCheck, GitBranch, GitCommit, Shield, Bug, Gauge, TrendingDown,
  CheckCircle2, Code2, Network, Box
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

  // NOVOS ESTADOS PARA CI/CD PIPELINE
  const [pipelineStep, setPipelineStep] = useState<number>(5); // Começa concluído
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    addLog(`Pipeline acionada para síntese: "${title}"...`);
    
    try {
      const techStackArray = techs.split(',').map(t => t.trim()).filter(Boolean);
      await axios.post('http://localhost:4000/projects', { title, techStack: techStackArray });
      setTitle('');
      addLog("Sucesso! IA gerou a arquitetura e persistiu no BD.");
      await fetchProjects();
    } catch (error) {
      addLog("Erro: Microsserviço indisponível. Simulando criação local...");
      setTimeout(() => {
        setProjects(prev => [{
          id: Math.random().toString(), title, description: 'Arquitetura gerada (Simulação Offline). Sistema altamente escalável e resiliente.', techStack: techs.split(','), createdAt: ''
        }, ...prev]);
        setTitle('');
        setSubmitting(false);
      }, 1000);
    } 
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const currentSystemState = {
        cpu: metricHistory[metricHistory.length - 1]?.cpu || 0,
        ram: metricHistory[metricHistory.length - 1]?.ram || 0,
        reqs: metricHistory[metricHistory.length - 1]?.reqs || 0,
        tasksNaFila: rabbitQueue.length,
        totalProjetos: projects.length,
        tecnologiasAtivas: "React, Node.js, Python, PostgreSQL, RabbitMQ, Docker"
      };

      const response = await axios.post('http://localhost:4000/chat', { 
        message: userMsg,
        state: currentSystemState
      });
      
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Erro de comunicação com a IA local/Cloud.' }]);
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

  // NOVA FUNÇÃO: Disparar CI/CD
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

  // DADOS DO FINOPS
  const finOpsData = [
    { name: 'EC2', Unoptimized: 3200, Optimized: 1100 },
    { name: 'RDS', Unoptimized: 1800, Optimized: 850 },
    { name: 'Network', Unoptimized: 900, Optimized: 400 },
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#060B19] text-slate-800 dark:text-slate-100 p-4 sm:p-6 md:p-8 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-500 overflow-x-hidden">
        
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* HEADER PRINCIPAL ATUALIZADO */}
          <header className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 rounded-2xl text-cyan-500 shadow-inner">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400 bg-clip-text text-transparent">
                    MOA HUB
                  </h1>
                  <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-300 dark:border-indigo-800">
                    TECH LEAD DASHBOARD
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
                  Software Engineering & Cloud Architecture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-105 transition-transform border border-slate-300 dark:border-slate-700"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* NOVO: DORA METRICS (Métricas de Elite) */}
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-4">
              <Gauge className="w-4 h-4" /> DORA Metrics (Elite Performer)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Deployment Freq.', value: 'On Demand', desc: 'Múltiplos deploys/dia', color: 'text-emerald-500' },
                { label: 'Lead Time for Changes', value: '< 1 Hour', desc: 'Do commit a produção', color: 'text-cyan-500' },
                { label: 'Time to Restore (MTTR)', value: '12 Mins', desc: 'Recuperação automática', color: 'text-indigo-500' },
                { label: 'Change Failure Rate', value: '0.8%', desc: 'Falhas em produção', color: 'text-pink-500' },
              ].map((metric, i) => (
                <div key={i} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{metric.label}</p>
                  <p className={`text-xl font-black ${metric.color} mb-1`}>{metric.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{metric.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GRÁFICOS EM TEMPO REAL (MANTIDOS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU */}
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-500" /> CPU Cluster (k8s)
                </h3>
                <span className="text-xl font-mono font-black text-cyan-500">{currentCpu}%</span>
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

            {/* RAM */}
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Database className="w-4 h-4 text-indigo-500" /> RAM PostgreSQL
                </h3>
                <span className="text-xl font-mono font-black text-indigo-500">{currentRam}%</span>
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

            {/* Network */}
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <BarChart3 className="w-4 h-4 text-emerald-500" /> Network Traffic
                </h3>
                <span className="text-xl font-mono font-black text-emerald-500">{currentReqs} req/s</span>
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

          {/* NOVOS MÓDULOS DE TECH LEAD (Quality + FinOps) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QUALITY & SECURITY PANEL */}
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-6">
                <ShieldCheck className="w-4 h-4" /> Qualidade de Código & Segurança
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Bug className="w-6 h-6 text-emerald-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800 dark:text-white">0</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Vulnerabilidades Críticas</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Code2 className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800 dark:text-white">92.4%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Code Coverage (Testes)</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Shield className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800 dark:text-white">Grade A</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Technical Debt Ratio</span>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <GitCommit className="w-6 h-6 text-cyan-500 mb-2" />
                  <span className="text-2xl font-black text-slate-800 dark:text-white">100%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Code Review Approval</span>
                </div>
              </div>
            </div>

            {/* FINOPS & CLOUD SPEND */}
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <TrendingDown className="w-4 h-4" /> FinOps & Otimização de Custos
                </div>
                <div className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-200 dark:border-emerald-800">
                  Economia de 60%
                </div>
              </div>
              <div className="h-48 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finOpsData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px'}} />
                    <Bar dataKey="Unoptimized" name="Sem Otimização ($)" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                    <Bar dataKey="Optimized" name="Arquitetura Otimizada ($)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['Spot Instances', 'Auto-scaling K8s', 'DB Query Tuning', 'S3 Lifecycle'].map(t => (
                  <span key={t} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">{t}</span>
                ))}
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUNA ESQUERDA - MAIOR PARTE */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* NOVO: CI/CD PIPELINE */}
              <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <GitBranch className="w-4 h-4" /> Automação CI/CD
                  </div>
                  <button 
                    onClick={triggerPipeline} 
                    disabled={isPipelineRunning}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" /> Trigger Deploy
                  </button>
                </div>

                <div className="relative flex justify-between items-center px-4">
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                  
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
                          isDone ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-900/50 text-white' : 
                          isActive ? 'bg-cyan-500 border-cyan-200 dark:border-cyan-900/50 text-white animate-[pulse_1.5s_ease-in-out_infinite]' : 
                          'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-center hidden sm:block ${
                          isDone || isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                        }`}>{step.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>


              {/* RABBITMQ MANAGEMENT UI (SEU CLONE REAL INTACTO) */}
              <div className="bg-white dark:bg-[#1a1f2b] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans shadow-orange-500/5">
                
                {/* Header estilo RabbitMQ */}
                <div className="bg-[#ff6600] text-white px-4 py-2.5 flex justify-between items-center shadow-md relative z-10">
                  <div className="font-bold text-lg flex items-center gap-2 tracking-tight">
                    RabbitMQ Management
                  </div>
                  <div className="text-[11px] sm:text-xs font-medium bg-black/10 px-3 py-1 rounded">
                    User: guest | Virtual host: /
                  </div>
                </div>

                {/* Abas Superiores */}
                <div className="flex overflow-x-auto bg-[#f8f9fa] dark:bg-[#111827] border-b border-slate-300 dark:border-slate-700 text-xs sm:text-sm hide-scrollbar">
                  {['Overview', 'Connections', 'Channels', 'Exchanges'].map(tab => (
                    <div key={tab} className="px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap border-r border-slate-200 dark:border-slate-800">
                      {tab}
                    </div>
                  ))}
                  <div className="px-4 py-2.5 bg-white dark:bg-[#1a1f2b] border-t-2 border-[#ff6600] font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    Queues
                  </div>
                  <div className="px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap border-l border-slate-200 dark:border-slate-800">
                    Admin
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-6">
                  
                  {/* Tabela de Queues */}
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">All queues</h3>
                    <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700">
                          <tr>
                            <th className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-semibold">Name</th>
                            <th className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-semibold">Features</th>
                            <th className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-semibold">State</th>
                            <th className="px-3 py-2.5 bg-blue-50 dark:bg-blue-900/10 text-center border-l border-slate-300 dark:border-slate-700 font-semibold">Ready</th>
                            <th className="px-3 py-2.5 bg-pink-50 dark:bg-pink-900/10 text-center border-l border-slate-300 dark:border-slate-700 font-semibold">Unacked</th>
                            <th className="px-3 py-2.5 bg-green-50 dark:bg-green-900/10 text-center border-l border-slate-300 dark:border-slate-700 font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-3 py-2.5 font-bold text-blue-600 dark:text-blue-400 cursor-pointer">moa_hub_tasks</td>
                            <td className="px-3 py-2.5 text-[10px]">
                              <span className="bg-[#ff6600]/10 text-[#ff6600] border border-[#ff6600]/20 px-1.5 py-0.5 rounded font-bold">D</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs font-bold">running</span>
                            </td>
                            <td className="px-3 py-2.5 text-center border-l border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 bg-blue-50/50 dark:bg-blue-900/5">{rabbitReady}</td>
                            <td className="px-3 py-2.5 text-center border-l border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 bg-pink-50/50 dark:bg-pink-900/5">{rabbitUnacked}</td>
                            <td className="px-3 py-2.5 text-center border-l border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 bg-green-50/50 dark:bg-green-900/5">{rabbitTotal}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Publish Message Panel */}
                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 px-4 py-2.5 font-bold text-sm border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between">
                      Publish message
                      <span className="text-[10px] bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">Exchange: default</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-[#1a1f2b] space-y-4">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Payload:</label>
                         <textarea
                           value={auditPrompt}
                           onChange={(e) => setAuditPrompt(e.target.value)}
                           className="w-full border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-[#0f172a] p-3 text-sm font-mono focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] outline-none transition-all h-20 text-slate-800 dark:text-slate-200"
                         />
                       </div>
                       <button
                         onClick={handleTriggerQueue}
                         className="bg-[#ff6600] hover:bg-[#e65c00] text-white px-5 py-2 rounded font-bold text-sm transition-colors shadow-sm active:scale-95 w-full sm:w-auto"
                       >
                         Publish message
                       </button>
                    </div>
                  </div>

                  {/* Get Messages Panel */}
                  <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 px-4 py-2.5 font-bold text-sm border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      Get messages
                    </div>
                    <div className="p-0 bg-white dark:bg-[#1a1f2b] max-h-[300px] overflow-y-auto">
                       {rabbitQueue.length === 0 ? (
                         <div className="text-center p-8 text-slate-400 text-sm">Queue is empty</div>
                       ) : (
                         <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                           {rabbitQueue.map(t => (
                             <div key={t.id} className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                               <div className="flex-1 min-w-0">
                                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                   Message ID: <span className="text-[#ff6600]">{t.id}</span>
                                 </div>
                                 <div className="font-mono text-xs text-slate-800 dark:text-slate-300 truncate bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                                   {t.task}
                                 </div>
                               </div>
                               <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                 {t.status === 'Pendente' && (
                                   <button onClick={() => processRabbitTask(t.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/60 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                                     <Play className="w-3 h-3" /> ACK
                                   </button>
                                 )}
                                 <button onClick={() => deleteRabbitTask(t.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/60 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                                   <Trash2 className="w-3 h-3" /> NACK
                                 </button>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>

                </div>
              </div>

              {/* DB EXPLORER SEU (INTACTO) */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-2 text-xs uppercase tracking-wider">
                  <Database className="w-4 h-4" /> DB Explorer
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Database Schema (PostgreSQL)</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dbTables.map((table, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                      <div className="bg-slate-200 dark:bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-slate-300 dark:border-slate-700">
                        <Table2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{table.tableName}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <ul className="space-y-2">
                          {table.columns.map((col, cIdx) => (
                            <li key={cIdx} className="flex justify-between items-center text-xs font-mono">
                              <span className="text-slate-600 dark:text-slate-400">{col.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                col.type.includes('PK') || col.type.includes('ID') 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {col.type}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA - MENOR PARTE */}
            <div className="lg:col-span-5 space-y-8">

              {/* NOVO: TOPOLOGY MAP */}
              <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-3xl shadow-lg relative flex flex-col justify-center overflow-hidden">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-8">
                  <Network className="w-4 h-4" /> System Topology
                </div>
                
                <div className="flex flex-col items-center gap-4 relative py-4">
                  {/* Client */}
                  <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-xs font-mono text-slate-300 shadow-sm z-10">Client / Web</div>
                  <div className="h-6 w-px bg-slate-700 relative"><div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-cyan-500 -translate-x-1/2 animate-[ping_2s_ease-in-out_infinite]"></div></div>
                  
                  {/* Gateway */}
                  <div className="bg-indigo-900/50 border border-indigo-500/50 px-6 py-2.5 rounded-lg text-sm font-bold text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)] z-10">API Gateway (Kong)</div>
                  <div className="h-6 w-px bg-slate-700 relative"><div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-indigo-500 -translate-x-1/2 animate-[ping_2s_ease-in-out_infinite_0.5s]"></div></div>
                  
                  {/* Microservices */}
                  <div className="flex gap-3 w-full justify-center z-10 flex-wrap">
                    <div className="bg-cyan-900/30 border border-cyan-800 px-3 py-2 rounded-lg text-[10px] font-mono text-cyan-300">Auth Svc</div>
                    <div className="bg-cyan-900/30 border border-cyan-800 px-3 py-2 rounded-lg text-[10px] font-mono text-cyan-300">Core API</div>
                    <div className="bg-cyan-900/30 border border-cyan-800 px-3 py-2 rounded-lg text-[10px] font-mono text-cyan-300">Worker</div>
                  </div>
                  
                  <div className="h-6 w-px bg-slate-700 relative"><div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-cyan-500 -translate-x-1/2 animate-[ping_2s_ease-in-out_infinite_1s]"></div></div>

                  {/* Databases */}
                  <div className="flex gap-4 z-10">
                    <div className="bg-emerald-900/30 border border-emerald-800 px-4 py-2 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                      <Database className="w-3 h-3" /> PostgreSQL
                    </div>
                    <div className="bg-red-900/30 border border-red-800 px-4 py-2 rounded-lg text-xs font-mono text-red-300 flex items-center gap-1.5">
                      <Database className="w-3 h-3" /> Redis Cache
                    </div>
                  </div>
                </div>
              </div>
              
              {/* LIVE LOGS TERMINAL (SEU INTACTO) */}
              <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-3xl shadow-2xl h-[450px] flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>
                
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>SYSTEM_LOGS.sh</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
                <div className="flex-1 space-y-3 font-mono text-xs overflow-y-auto pr-2 custom-scrollbar">
                  {logs.map((log, index) => (
                    <div key={index} className="text-slate-300 leading-relaxed border-l-2 border-slate-800 pl-3">
                      <span className="text-cyan-500 font-bold mr-2">~</span> 
                      <span dangerouslySetInnerHTML={{__html: log.replace(/(\[.*?\])/g, '<span class="text-indigo-400 font-bold">$1</span>').replace(/(Erro|Falha|Aviso)/g, '<span class="text-red-400">$1</span>').replace(/(Sucesso)/g, '<span class="text-emerald-400">$1</span>')}}></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CORE TECH STACK (SEU INTACTO) */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Database className="w-4 h-4 text-cyan-500" /> Core Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['TypeScript', 'React.js', 'Node.js', 'Python', 'FastAPI', 'Go', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'RabbitMQ', 'Redis', 'GraphQL'].map(tech => (
                    <span key={tech} className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* PORTFÓLIO DE ARQUITETURAS (SEU INTACTO) */}
          <section className="pt-8 pb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-2 text-xs uppercase tracking-wider">
                  <Server className="w-4 h-4" /> Repertório Técnico
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  Projetos & Arquiteturas
                </h2>
              </div>
              <button 
                onClick={fetchProjects}
                className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Sincronizar
              </button>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl shadow-lg hover:shadow-xl hover:border-cyan-500/30 dark:hover:border-cyan-500/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group">
                  <div className="flex justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-start gap-2">
                      {project.title}
                    </h3>
                    <a href="#" className="text-slate-400 hover:text-cyan-500 transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md font-mono font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CHAT FLUTUANTE (SEU INTACTO) */}
        <div className="fixed bottom-16 right-6 z-50">
          {!isChatOpen ? (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white p-4 rounded-full shadow-[0_10px_25px_rgba(8,145,178,0.4)] flex items-center gap-3 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group"
            >
              <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
            </button>
          ) : (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl w-[90vw] sm:w-[400px] flex flex-col h-[500px] overflow-hidden transform origin-bottom-right transition-all animate-in fade-in zoom-in duration-200">
              
              <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">Moa AI</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Arquiteto de Software Virtual</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-sm bg-slate-50/50 dark:bg-transparent custom-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.sender === 'ai' && (
                       <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                         <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">AI</span>
                       </div>
                    )}
                    <div className={`max-w-[80%] p-3.5 rounded-2xl shadow-sm ${m.sender === 'user' ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start items-center">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl rounded-bl-sm flex gap-1.5 shadow-sm">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Faça uma pergunta sobre código..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-5 pr-12 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={chatLoading} 
                    className="absolute right-1.5 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Estilos Globais Auxiliares */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}