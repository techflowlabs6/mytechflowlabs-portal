export const SEED_APPS = [
  {
    id: 'app-french-learner',
    title: 'French Learner AI',
    tagline: 'Interactive French Mastery with Spaced Repetition & Real-time AI Audio',
    description: 'An immersive language acquisition platform tailored for accelerated French fluency. Features intelligent voice dialogue drills, CEFR grammar breakdown (A1 to C2), smart flashcards, conjugation engines, and real-time pronunciation feedback.',
    category: 'Education',
    url: 'https://french.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#3b82f6',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    icon: 'BookOpen',
    screenshotUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80',
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
    screenshotUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=80',
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
    url: 'https://driver.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 via-orange-600 to-rose-500',
    icon: 'DollarSign',
    screenshotUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
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
    id: 'app-lost-frontier',
    title: 'Lost Frontier 3D Runner',
    tagline: 'High-Speed 3D Sci-Fi Endless Arcade Runner with Procedural Worlds',
    description: 'A high-octane 3D WebGL endless runner featuring procedural terrain generation, obstacle dodging, dynamic cyber synth soundtrack, powerups, and global real-time high-score leaderboards.',
    category: '3D Games & Arcade',
    url: 'https://lostrun.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#06b6d4',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    icon: 'Rocket',
    screenshotUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    tags: ['Three.js', 'WebGL', 'Web Audio API', 'Procedural Generation', 'Physics'],
    features: [
      'Silky 60 FPS 3D particle and lighting pipeline',
      'Procedurally generated sci-fi canyon tracks',
      'Adaptive difficulty curve & speed scaling',
      'Web Audio reactive soundtrack and FX'
    ],
    stats: { users: '6.7k+', rating: '4.96/5', version: 'v1.4' }
  },
  {
    id: 'app-neon-dodge-rush',
    title: 'Neon Dodge Rush',
    tagline: 'Fast-Paced Neon Grid Arcade Dodger & Bullet Hell Survival',
    description: 'An adrenaline-fueled retro neon grid arcade game. Dodge dynamic geometry hazards, collect multiplier orbs, activate bullet-time slow motion, and dominate high-score survival tables.',
    category: '3D Games & Arcade',
    url: 'https://neon.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#ec4899',
    gradient: 'from-pink-500 via-purple-600 to-indigo-600',
    icon: 'Zap',
    screenshotUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    tags: ['HTML5 Canvas', 'Retro Synthwave', 'Particles', 'Arcade', 'Mobile Touch'],
    features: [
      'Vibrant reactive neon visual aesthetic',
      'Dynamic hazard collision detection engine',
      'Combo multipliers and adrenaline powerups',
      'Local & cloud high score persistence'
    ],
    stats: { users: '4.8k+', rating: '4.91/5', version: 'v2.0' }
  },
  {
    id: 'app-reflex-rush',
    title: 'Reflex Rush',
    tagline: 'Sub-Millisecond Reaction Speed & Reflex Training Arena',
    description: 'A competitive precision reflex benchmark suite measuring visual, auditory, and kinetic reaction times with detailed standard deviation analytics and percentile rankings.',
    category: '3D Games & Arcade',
    url: 'https://reflex.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#e11d48',
    gradient: 'from-rose-500 via-red-600 to-amber-500',
    icon: 'Target',
    screenshotUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    tags: ['Performance API', 'Reflex Analytics', 'Chart.js', 'Leaderboard', 'Precision'],
    features: [
      'Microsecond-accurate hardware-timed reaction hooks',
      'Multi-mode test sequences (visual cue, sound pulse, aim target)',
      'Detailed human reaction speed distribution curves',
      'Global percentile benchmark calculator'
    ],
    stats: { users: '5.3k+', rating: '4.93/5', version: 'v1.8' }
  },
  {
    id: 'app-smashhit-3d',
    title: 'Smash Hit 3D',
    tagline: '3D Glass-Shattering Physics & Dimension Warp Arcade',
    description: 'A hypnotic 3D physics arcade experience traversing crystalline glass corridors, shattering temporal prisms, triggering kinetic chain reactions, and traveling through dimensional warps.',
    category: '3D Games & Arcade',
    url: 'https://smashhit.mytechflowlabs.com',
    status: 'Live',
    featured: true,
    accentColor: '#8b5cf6',
    gradient: 'from-violet-600 via-fuchsia-600 to-cyan-500',
    icon: 'Disc',
    screenshotUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    tags: ['Three.js', 'Physics Engine', 'Destruction Voronoi', 'Spatial Audio', 'WebGL'],
    features: [
      'Real-time Voronoi fracture physics simulation',
      'Spatial 3D audio glass shattering resonance',
      'Synchronized rhythmic visual pulse mechanics',
      'Fluid camera travel and motion blur post-processing'
    ],
    stats: { users: '7.2k+', rating: '4.97/5', version: 'v2.1' }
  }
];

export const CATEGORIES = [
  'All',
  'Education',
  'Productivity',
  'Finance',
  '3D Games & Arcade'
];
