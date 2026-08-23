export const SEED_APPS = [
  {
    id: 'app-french-learner',
    title: 'French Learner AI',
    tagline: 'Interactive French Mastery with Spaced Repetition & Real-time AI Audio',
    description: 'An immersive language acquisition platform tailored for accelerated French fluency. Features intelligent voice dialogue drills, CEFR grammar breakdown (A1 to C2), smart flashcards, conjugation engines, and real-time pronunciation feedback.',
    category: 'Education',
    url: 'https://french-learner.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#3b82f6',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    icon: 'BookOpen',
    screenshotUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    tags: ['React', 'Web Speech API', 'Tailwind', 'AI Voice', 'Spaced Repetition'],
    features: [
      'Interactive Speech-to-Text & Pronunciation Evaluator',
      'CEFR-aligned vocabulary decks with audio playback',
      'Dynamic conjugation engine with 1,000+ verbs',
      'Daily streak tracking & gamified leaderboard'
    ],
    stats: { users: '3.4k+', rating: '4.9/5', version: 'v2.4' }
  },
  {
    id: 'app-timelog-pro',
    title: 'TimeLog Pro',
    tagline: 'Precision Productivity Tracker & Client Billable Analytics Suite',
    description: 'A powerful, sleek time tracking and work log intelligence suite for engineers and freelancers. Seamlessly record active focus blocks, manage multi-tier projects, calculate billable earnings in real-time, and generate comprehensive timesheets.',
    category: 'Productivity',
    url: 'https://timelog.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#10b981',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
    icon: 'Clock',
    screenshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    tags: ['React', 'Chart.js', 'Supabase', 'Export CSV/PDF', 'Pomodoro'],
    features: [
      'Smart Pomodoro & continuous stopwatch with idle detect',
      'Multi-currency billable rate calculator',
      'Interactive timesheet heatmaps & productivity analytics',
      'Automated one-click invoice & CSV report export'
    ],
    stats: { users: '5.1k+', rating: '4.95/5', version: 'v3.1' }
  },
  {
    id: 'app-tcf-suite',
    title: 'TCF Preparation Suite',
    tagline: 'Official TCF Exam Simulator with Timed Listening & Auto-Scoring',
    description: 'A specialized testing environment engineered for candidates taking the Test de Connaissance du Français (TCF Canada / TCF TP). Includes full-length timed mock tests, listening comprehension audio tracks, writing rubric guidance, and instant score predictions.',
    category: 'Education',
    url: 'https://tcf.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#8b5cf6',
    gradient: 'from-purple-600 via-violet-600 to-indigo-500',
    icon: 'GraduationCap',
    screenshotUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    tags: ['React', 'Web Audio', 'Exam Engine', 'Nivo Charts', 'Supabase'],
    features: [
      'Full-length simulation of Comprehension Orale & Ecrite',
      'Automated CLB (Canadian Language Benchmark) converter',
      'Detailed answer explanations and error analysis',
      'Offline-capable practice question repository'
    ],
    stats: { users: '2.8k+', rating: '4.88/5', version: 'v1.9' }
  },
  {
    id: 'app-driver-earnings',
    title: 'Driver Earnings Tracker',
    tagline: 'Smart Multi-Platform Rideshare & Delivery Revenue Intelligence',
    description: 'Designed specifically for gig economy drivers (Uber, Lyft, DoorDash, Instacart). Log gross shift revenues, calculate real fuel and maintenance depreciation, monitor net hourly profitability, and forecast tax liabilities in real-time.',
    category: 'Finance',
    url: 'https://driver-earnings.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 via-orange-600 to-rose-500',
    icon: 'DollarSign',
    screenshotUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80',
    tags: ['React', 'PWA', 'IndexedDB', 'Financial Analytics', 'Geolocation'],
    features: [
      'Unified multi-platform income logging',
      'Automated mileage deduction & fuel expense tracking',
      'Real-time Net vs Gross hourly profit gauges',
      'Tax-ready quarterly export summary'
    ],
    stats: { users: '4.2k+', rating: '4.92/5', version: 'v2.2' }
  },
  {
    id: 'app-techflow-ai',
    title: 'TechFlow AI Studio',
    tagline: 'Multi-Agent Prompt Pipeline & Autonomous Workflow Workbench',
    description: 'An AI developer studio for constructing, benchmarking, and chaining LLM prompts with vector search memory, code generation execution sandboxes, and automated agent flows.',
    category: 'AI & Tools',
    url: 'https://ai.mytechflowlabs.com',
    status: 'Beta',
    featured: false,
    accentColor: '#ec4899',
    gradient: 'from-pink-500 via-rose-600 to-purple-600',
    icon: 'Cpu',
    screenshotUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    tags: ['OpenAI / Gemini', 'Vector DB', 'LangChain', 'Node.js', 'WebSockets'],
    features: [
      'Multi-model comparison benchmark matrix',
      'Visual flow-node orchestrator for prompt chains',
      'Live code execution & syntax sandbox',
      'Context-aware knowledge base retrieval'
    ],
    stats: { users: '1.2k+', rating: '4.85/5', version: 'v0.9-beta' }
  },
  {
    id: 'app-cloudops-monitor',
    title: 'CloudOps Live Monitor',
    tagline: 'Distributed Infrastructure Telemetry & Latency Matrix',
    description: 'High-frequency telemetry dashboard visualizing container health, API edge latency, database connections, and anomaly detection across global cloud regions.',
    category: 'DevOps',
    url: 'https://cloudops.mytechflowlabs.com',
    status: 'Beta',
    featured: false,
    accentColor: '#06b6d4',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    icon: 'Activity',
    screenshotUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80',
    tags: ['Grafana/Prometheus', 'WebSockets', 'Tailwind', 'Docker', 'Vercel Edge'],
    features: [
      'Global latency map with edge node pings',
      'Real-time CPU/RAM container saturation charts',
      'Automated Discord & Slack webhook alert triggers',
      'Historical error rate log stream'
    ],
    stats: { users: '900+', rating: '4.78/5', version: 'v1.1' }
  }
];

export const CATEGORIES = [
  'All',
  'Education',
  'Productivity',
  'Finance',
  'AI & Tools',
  'DevOps'
];
