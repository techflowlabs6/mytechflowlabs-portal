export const SKILLS_DATA = [
  {
    category: 'Frontend & 3D Web',
    icon: 'Layout',
    color: '#06b6d4',
    description: 'Engineering responsive, ultra-smooth web applications with next-gen 3D graphics, state machines, and micro-interactions.',
    skills: [
      { name: 'React 18 / Next.js', level: 96, highlight: 'App Router, SSR, Server Components' },
      { name: 'Three.js & WebGL', level: 90, highlight: 'Custom shaders, 3D particle systems, Camera physics' },
      { name: 'Tailwind CSS & Vanilla CSS', level: 98, highlight: 'Glassmorphism, CSS 3D transforms, Responsive design' },
      { name: 'TypeScript & Modern JS (ES2024)', level: 94, highlight: 'Strict typing, Async streams, Web Workers' },
      { name: 'State Management (Zustand/Redux)', level: 92, highlight: 'Optimistic UI, Persistent cache, Middleware' }
    ]
  },
  {
    category: 'Backend & Cloud Infrastructure',
    icon: 'Server',
    color: '#8b5cf6',
    description: 'Architecting secure, auto-scaling backend APIs, database schemas, authentication, and edge functions.',
    skills: [
      { name: 'Node.js & Express / Fastify', level: 94, highlight: 'High-throughput REST/GraphQL, WebSockets' },
      { name: 'Supabase & PostgreSQL', level: 95, highlight: 'Row-level security (RLS), Triggers, Real-time subscriptions' },
      { name: 'Vercel / Cloudflare Workers', level: 92, highlight: 'Edge routing, Serverless compute, Custom domains' },
      { name: 'Docker & Microservices', level: 88, highlight: 'Multi-stage builds, Container orchestration, Health checks' },
      { name: 'Redis & Caching Layer', level: 86, highlight: 'Rate limiting, Session stores, Pub/Sub channels' }
    ]
  },
  {
    category: 'AI, Data & Automation',
    icon: 'Sparkles',
    color: '#ec4899',
    description: 'Integrating foundation models, prompt engineering, vector search, and intelligent automation pipelines.',
    skills: [
      { name: 'LLM Orchestration (Gemini, OpenAI)', level: 93, highlight: 'Structured JSON outputs, Function calling, RAG pipelines' },
      { name: 'Speech & Audio Processing', level: 89, highlight: 'Web Speech API, AudioContext, Real-time phonetics' },
      { name: 'Data Visualization & Analytics', level: 92, highlight: 'Chart.js, Nivo, Dynamic SVG gauges, Heatmaps' },
      { name: 'Automated CI/CD Workflows', level: 90, highlight: 'GitHub Actions, Automated linting, Zero-downtime deploys' }
    ]
  },
  {
    category: 'Cross-Platform & Mobile Readiness',
    icon: 'Smartphone',
    color: '#10b981',
    description: 'Building progressive web apps with offline capabilities, responsive fluid viewports, and native touch ergonomics.',
    skills: [
      { name: 'Progressive Web Apps (PWA)', level: 94, highlight: 'Service workers, Manifest, Offline storage cache' },
      { name: 'Mobile-First Responsive UX', level: 98, highlight: 'Fluid touch gestures, Adaptive DPI, Dynamic viewports' },
      { name: 'IndexedDB & Local Persistence', level: 91, highlight: 'Client-side encrypted databases, Auto-sync' }
    ]
  }
];

export const HIGHLIGHT_STATS = [
  { value: '6+', label: 'Shipped Production Apps', sublabel: 'Fast, secure & responsive' },
  { value: '99.9%', label: 'Uptime & Reliability', sublabel: 'Edge & Supabase infrastructure' },
  { value: '15k+', label: 'Active User Interactions', sublabel: 'Across learning & utility suites' },
  { value: '60 FPS', label: 'Silky 3D Animation', sublabel: 'Optimized WebGL & GPU pipelines' }
];
