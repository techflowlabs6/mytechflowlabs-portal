export const SKILLS_DATA = [
  {
    category: 'Frontend & 3D Web Graphics',
    icon: 'Layout',
    color: '#06b6d4',
    description: 'Engineering responsive, ultra-smooth web applications with next-gen 3D WebGL graphics, state machines, and micro-interactions.',
    skills: [
      { name: 'React 19 & Next.js', level: 96, highlight: 'App Router, SSR, Server Components, Hooks' },
      { name: 'Three.js & WebGL 2.0', level: 92, highlight: 'Custom shaders, 3D particle systems, Camera physics, 60 FPS' },
      { name: 'Tailwind CSS & Modern CSS', level: 98, highlight: 'Glassmorphism, CSS 3D transforms, Responsive design' },
      { name: 'TypeScript & Modern JS (ES2024)', level: 95, highlight: 'Strict typing, Async streams, Web Workers' },
      { name: 'State Machines & Local Persistence', level: 92, highlight: 'Optimistic UI, Persistent cache, IndexedDB' }
    ]
  },
  {
    category: 'Backend & Cloud Native Infrastructure',
    icon: 'Server',
    color: '#8b5cf6',
    description: 'Architecting secure, auto-scaling backend APIs, containerized microservices, and edge functions.',
    skills: [
      { name: 'Node.js & Express / Fastify', level: 94, highlight: 'High-throughput REST/GraphQL, WebSockets' },
      { name: 'Supabase & PostgreSQL', level: 95, highlight: 'Row-level security (RLS), Triggers, Real-time subscriptions' },
      { name: 'Docker & Containerization', level: 92, highlight: 'Multi-stage builds, Distroless images, Health checks' },
      { name: 'Kubernetes (K8s) & Ingress', level: 90, highlight: 'Deployments, HPA autoscaling, TLS Cert-Manager' },
      { name: 'Vercel / Cloudflare Edge Routing', level: 94, highlight: 'Edge routing, Serverless compute, Custom domains' }
    ]
  },
  {
    category: 'AI, Data & Analytics',
    icon: 'Sparkles',
    color: '#ec4899',
    description: 'Integrating foundation models, speech recognition, vector search, and intelligent automation pipelines.',
    skills: [
      { name: 'LLM Orchestration (Gemini, OpenAI)', level: 93, highlight: 'Structured JSON outputs, Function calling, RAG pipelines' },
      { name: 'Speech & Audio Processing', level: 90, highlight: 'Web Speech API, AudioContext, Real-time phonetics' },
      { name: 'Data Visualization & Analytics', level: 94, highlight: 'Chart.js, Nivo, Dynamic SVG gauges, Heatmaps' },
      { name: 'Automated CI/CD Workflows', level: 92, highlight: 'GitHub Actions, Automated linting, Zero-downtime deploys' }
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
      { name: 'IndexedDB & Local Persistence', level: 92, highlight: 'Client-side encrypted databases, Auto-sync' }
    ]
  }
];

export const HIGHLIGHT_STATS = [
  { value: '8+', label: 'Shipped Production Apps', sublabel: 'Fast, secure & responsive' },
  { value: '99.9%', label: 'Uptime & Reliability', sublabel: 'Edge & Supabase infrastructure' },
  { value: '25k+', label: 'Active User Interactions', sublabel: 'Across learning, games & utility suites' },
  { value: '60 FPS', label: 'Silky 3D WebGL Animation', sublabel: 'Optimized Three.js & GPU pipelines' }
];
