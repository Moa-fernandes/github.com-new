import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Cpu, Server, Database, Activity, Terminal, Zap, RefreshCw, 
  CheckCircle2, MessageSquare, Send, X, Sun, Moon, 
  BarChart3, ListTree, Play, Trash2, ExternalLink, Globe, HardDrive, Layers,
  Code, User 
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

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
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

  const [auditPrompt, setAuditPrompt] = useState('Auditar resiliência do cluster');
  const [rabbitQueue, setRabbitQueue] = useState<RabbitTask[]>([
    { id: 'mq-1', task: 'Indexação de Logs de Segurança', status: 'Pendente', timestamp: new Date().toLocaleTimeString() },
    { id: 'mq-2', task: 'Treinamento de Modelo RAG', status: 'Processando', timestamp: new Date().toLocaleTimeString() }
  ]);

  // Histórico de métricas para os gráficos do Recharts
  const [metricHistory, setMetricHistory] = useState<{ time: string; cpu: number; ram: number; reqs: number }[]>(
    Array.from({ length: 15 }).map(() => ({ time: '', cpu: 0, ram: 0, reqs: 0 }))
  );

  const [logs, setLogs] = useState<string[]>([
    "[System] Moa Hub Command Center inicializado com sucesso.",
    "[Network] Handshake estabelecido com API Core (Porta 4000).",
    "[RabbitMQ] Exchange e filas de mensageria assíncrona ativas."
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  // Atualização em tempo real das métricas (Performance melhorada com arrays limitados)
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
      // Dados de fallback mais bonitos para o portfólio
      if (projects.length === 0) {
        setProjects([
          { id: '1', title: 'Plataforma Neural AI', description: 'Sistema distribuído para inferência de modelos LLM em tempo real com auto-scaling usando Kubernetes e filas.', techStack: ['Python', 'FastAPI', 'Redis', 'Docker'], createdAt: '' },
          { id: '2', title: 'Fintech Transaction Core', description: 'Microsserviço de processamento de pagamentos com garantia de entrega e consistência eventual.', techStack: ['Node.js', 'NestJS', 'RabbitMQ', 'PostgreSQL'], createdAt: '' },
          { id: '3', title: 'Dashboard de Telemetria', description: 'Frontend de alta performance para visualização de milhões de data points em tempo real.', techStack: ['React', 'TypeScript', 'Recharts', 'Tailwind'], createdAt: '' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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
      // CAPTURANDO O ESTADO ATUAL PARA A IA SABER O QUE ESTÁ ACONTECENDO
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
        state: currentSystemState // Enviando o contexto invisível para o backend!
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
      id: `mq-${Date.now().toString().slice(-4)}`, task: auditPrompt, status: 'Pendente', timestamp: new Date().toLocaleTimeString()
    };
    addLog(`Enfileirando job [${newTask.id}]: "${auditPrompt}"`);
    setRabbitQueue(prev => [newTask, ...prev.slice(0, 4)]);
  };

  const processRabbitTask = (id: string) => {
    setRabbitQueue(prev => prev.map(t => t.id === id ? { ...t, status: 'Processando' } : t));
    addLog(`Worker assumiu a tarefa [${id}]`);
    setTimeout(() => {
      setRabbitQueue(prev => prev.filter(t => t.id !== id));
      addLog(`Tarefa [${id}] processada (ACK).`);
    }, 3000);
  };

  const deleteRabbitTask = (id: string) => {
    setRabbitQueue(prev => prev.filter(t => t.id !== id));
    addLog(`Mensagem [${id}] descartada (NACK).`);
  };

  const currentCpu = metricHistory[metricHistory.length - 1]?.cpu || 0;
  const currentRam = metricHistory[metricHistory.length - 1]?.ram || 0;
  const currentReqs = metricHistory[metricHistory.length - 1]?.reqs || 0;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#060B19] text-slate-800 dark:text-slate-100 p-4 sm:p-6 md:p-8 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-500 overflow-x-hidden">
        
        {/* Background Gradients */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* HEADER HUD */}
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
                  <span className="text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-300 dark:border-cyan-800">
                    DEV PORTFOLIO
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
                  Software Engineer & Cloud Architect
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="flex gap-2">
                <a href="#" className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  <Code className="w-5 h-5" />
                </a>
                <a href="#" className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  <User className="w-5 h-5" />
                </a>
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 hidden md:block"></div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-105 transition-transform border border-slate-300 dark:border-slate-700"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* ESTATÍSTICAS RÁPIDAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Uptime Sistema', value: '99.98%', icon: Globe, color: 'text-emerald-500' },
              { label: 'Microsserviços', value: '14 Ativos', icon: Layers, color: 'text-indigo-500' },
              { label: 'Cloud Regions', value: 'us-east-1', icon: Server, color: 'text-orange-500' },
              { label: 'BD Latency', value: '12ms', icon: HardDrive, color: 'text-cyan-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">{stat.label}</p>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* GRÁFICOS EM TEMPO REAL (RECHARTS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gráfico CPU */}
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

            {/* Gráfico RAM */}
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

            {/* Gráfico Tráfego */}
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

          {/* GRID PRINCIPAL DE AÇÕES E LOGS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUNA ESQUERDA (Interações) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* CADASTRAR PROJETO */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold mb-2 text-xs uppercase tracking-wider">
                  <Cpu className="w-4 h-4" /> Engine de Síntese
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Deploy Novo Projeto</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Simule o cadastro de um projeto no portfólio. A IA analisará a stack e gerará a documentação de arquitetura no BD.
                </p>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Nome do Sistema</label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Pagamentos Core" 
                        className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Stack (Separado por vírgula)</label>
                      <input 
                        type="text" 
                        value={techs} 
                        onChange={(e) => setTechs(e.target.value)}
                        className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/80 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-3 text-sm transition-all active:scale-[0.98]"
                  >
                    <Zap className="w-5 h-5" />
                    {submitting ? 'Sintetizando Arquitetura...' : 'Inicializar Pipeline'}
                  </button>
                </form>
              </div>

              {/* RABBIT MQ PAINEL */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold mb-2 text-xs uppercase tracking-wider">
                  <ListTree className="w-4 h-4" /> Message Broker
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Simulador de Fila (RabbitMQ)</h2>
                
                <div className="flex gap-2 mb-6 mt-4">
                  <input 
                    type="text" 
                    value={auditPrompt} 
                    onChange={(e) => setAuditPrompt(e.target.value)}
                    className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none dark:text-white text-slate-900 transition-all"
                  />
                  <button 
                    onClick={handleTriggerQueue}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition-colors"
                  >
                    Publish
                  </button>
                </div>

                <div className="bg-slate-100/50 dark:bg-[#030712]/50 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3 overflow-y-auto space-y-2 min-h-[160px]">
                  {rabbitQueue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                      <ListTree className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Exchange vazio. Nenhuma task na fila.</p>
                    </div>
                  ) : (
                    rabbitQueue.map((t) => (
                      <div key={t.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between shadow-sm group hover:border-purple-500/30 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">{t.task}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                            <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                              ID: {t.id}
                            </span>
                            <span className={`${t.status === 'Processando' ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {t.status === 'Pendente' && (
                            <button onClick={() => processRabbitTask(t.id)} title="Consumir Mensagem (ACK)" className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => deleteRabbitTask(t.id)} title="Descartar (NACK)" className="p-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA (Tech Stack & Logs) */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* MINHA STACK (Portfólio) */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Database className="w-4 h-4 text-cyan-500" /> Core Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['TypeScript', 'React.js', 'Node.js', 'Python', 'FastAPI', 'Go', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'RabbitMQ', 'Redis', 'GraphQL'].map(tech => (
                    <span key={tech} className="text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* LIVE LOGS TERMINAL */}
              <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-3xl shadow-2xl h-[380px] flex flex-col relative overflow-hidden group">
                {/* Efeito de brilho de terminal no topo */}
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
                      {/* Highlight de palavras-chave no log */}
                      <span dangerouslySetInnerHTML={{__html: log.replace(/(\[.*?\])/g, '<span class="text-indigo-400 font-bold">$1</span>').replace(/(Erro|Falha|Aviso)/g, '<span class="text-red-400">$1</span>').replace(/(Sucesso)/g, '<span class="text-emerald-400">$1</span>')}}></span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* PORTFÓLIO DE ARQUITETURAS */}
          <section className="pt-8">
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

        {/* --- CHAT FLUTUANTE (Design Apple/Vercel) --- */}
        <div className="fixed bottom-6 right-6 z-50">
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

              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-sm bg-slate-50/50 dark:bg-transparent">
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
      `}</style>
    </div>
  );
}