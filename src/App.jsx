import React, { useState, useEffect } from 'react';

const ADMIN_EMAIL = 'techflowlabs6@gmail.com';

const INITIAL_APPS = [
  {
    id: '1',
    name: 'French Learner App',
    shortNote: 'AI Grammar, Vocab & Pronunciation for French Readers',
    url: 'https://french.mytechflowlabs.com/',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    description: 'AI-assisted French vocabulary, pronunciation audio, grammar rules, and interactive reading exercises for French learners.'
  },
  {
    id: '2',
    name: 'TimeLog Pro',
    shortNote: 'Internal Time Management & Billable Revenue Tracker',
    url: 'https://timelog.mytechflowlabs.com/',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80',
    description: 'Internal time log management tool, Pomodoro focus sessions, productivity tracking, and billable revenue analytics.'
  },
  {
    id: '3',
    name: 'TCF Preparation Suite',
    shortNote: 'Official Format Mock Tests & Canadian CLB Score Predictor',
    url: 'https://tcf.mytechflowlabs.com/',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    description: 'Official format mock exam tests, listening & reading comprehension practice, and Canadian CLB score prediction.'
  },
  {
    id: '4',
    name: 'Driver Earnings Tracker',
    shortNote: 'Rideshare Shift Profit, Fuel Deductions & Net Hourly Calculator',
    url: 'https://driver.mytechflowlabs.com/',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80',
    description: 'Rideshare shift money calculator, fuel expense logs, tax deductions, and net hourly profit analytics.'
  }
];

const SKILLS = [
  {
    title: 'Frontend Development',
    desc: 'React, Next.js, HTML5, CSS3, Tailwind CSS, JavaScript, TypeScript, and responsive UI design.'
  },
  {
    title: 'Backend & APIs',
    desc: 'Node.js, Express, RESTful APIs, serverless functions, authentication, and webhooks.'
  },
  {
    title: 'Database & Cloud Deployment',
    desc: 'Supabase, PostgreSQL, Row-Level Security, Firebase, Vercel edge hosting, and GitHub CI/CD.'
  },
  {
    title: 'Mobile & Utility Tools',
    desc: 'Progressive Web Apps (PWAs), offline local storage, data analytics, and workflow utilities.'
  }
];

export default function App() {
  const [apps, setApps] = useState(() => {
    const saved = localStorage.getItem('mytechflow_apps_clean');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_APPS;
      }
    }
    return INITIAL_APPS;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('mytechflow_admin_clean') === 'true';
  });

  const [search, setSearch] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  // App form fields
  const [formName, setFormName] = useState('');
  const [formShortNote, setFormShortNote] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mytechflow_apps_clean', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('mytechflow_admin_clean', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    (app.shortNote && app.shortNote.toLowerCase().includes(search.toLowerCase())) ||
    app.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError(`Access restricted. Only ${ADMIN_EMAIL} can log in as admin.`);
    }
  };

  const handleQuickLogin = () => {
    setIsAdmin(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormName('');
    setFormShortNote('');
    setFormUrl('https://');
    setFormImageUrl('');
    setFormDescription('');
    setIsAppModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setFormName(app.name);
    setFormShortNote(app.shortNote || '');
    setFormUrl(app.url);
    setFormImageUrl(app.imageUrl);
    setFormDescription(app.description);
    setIsAppModalOpen(true);
  };

  const handleSaveApp = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingApp) {
      setApps(prev => prev.map(a => a.id === editingApp.id ? {
        ...a,
        name: formName,
        shortNote: formShortNote,
        url: formUrl,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        description: formDescription
      } : a));
    } else {
      const newApp = {
        id: Date.now().toString(),
        name: formName,
        shortNote: formShortNote,
        url: formUrl,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        description: formDescription
      };
      setApps(prev => [newApp, ...prev]);
    }

    setIsAppModalOpen(false);
  };

  const handleDeleteApp = (id) => {
    if (window.confirm('Delete this app from the dashboard?')) {
      setApps(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleCardClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Header */}
      <header>
        <div className="container header-content">
          <a href="#" className="logo">
            <span>⚡</span> MyTechFlow<span>Labs</span>
          </a>

          <div className="search-box">
            <input
              id="searchInput"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
            />
          </div>

          <div>
            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#c084fc', fontFamily: 'monospace' }}>
                  Admin: {ADMIN_EMAIL}
                </span>
                <button onClick={handleLogout} className="btn btn-red btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="btn btn-gray btn-sm">
                Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        
        {/* Welcome Banner */}
        <div className="hero-banner">
          <div className="hero-text">
            <h2>Welcome to MyTechFlow Labs</h2>
            <p>Direct shortcuts to launch all our production web applications.</p>
          </div>

          {isAdmin && (
            <button onClick={handleOpenAddModal} className="btn btn-blue">
              + Add New App
            </button>
          )}
        </div>

        {/* Applications Section */}
        <div>
          <div className="section-title">
            <span>Applications ({filteredApps.length})</span>
            {isAdmin && (
              <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 'normal' }}>
                Admin Mode Active
              </span>
            )}
          </div>

          {filteredApps.length > 0 ? (
            <div className="cards-grid">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="card"
                  onClick={() => handleCardClick(app.url)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={app.imageUrl}
                    alt={app.name}
                    className="card-img"
                    loading="lazy"
                  />

                  <div className="card-body">
                    <div>
                      <div className="card-title">{app.name}</div>
                      
                      {app.shortNote && (
                        <div style={{
                          fontSize: '12px',
                          color: '#34d399',
                          fontWeight: '600',
                          marginBottom: '6px'
                        }}>
                          📌 {app.shortNote}
                        </div>
                      )}

                      <div className="card-desc">{app.description}</div>
                    </div>

                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-blue btn-sm"
                        style={{ flex: 1 }}
                      >
                        Open App ↗
                      </a>

                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="btn btn-gray btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="btn btn-red btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '12px', marginBottom: '32px' }}>
              <p style={{ color: '#94a3b8' }}>No applications found matching "{search}".</p>
              <button onClick={() => setSearch('')} className="btn btn-gray btn-sm" style={{ marginTop: '12px' }}>
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="skills-box">
          <div className="section-title" style={{ marginBottom: '8px' }}>
            <span>Skills & Capabilities</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>
            Core full-stack engineering expertise across web technologies:
          </p>

          <div className="skills-grid">
            {SKILLS.map((s, idx) => (
              <div key={idx} className="skill-item">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} MyTechFlow Labs (mytechflowlabs.com). All rights reserved.</p>
          <p style={{ marginTop: '4px' }}>
            Contact: <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>
          </p>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Admin Login</h3>
              <button onClick={() => setIsLoginModalOpen(false)} className="modal-close">×</button>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={ADMIN_EMAIL}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password..."
                />
              </div>

              {loginError && <div className="error-msg">{loginError}</div>}

              <div className="form-actions">
                <button type="submit" className="btn btn-blue">
                  Login
                </button>
              </div>

              <button
                type="button"
                onClick={handleQuickLogin}
                className="btn btn-gray"
                style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}
              >
                ⚡ 1-Click Login ({ADMIN_EMAIL})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit App Modal */}
      {isAppModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAppModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingApp ? 'Edit Application' : 'Add New Application'}</h3>
              <button onClick={() => setIsAppModalOpen(false)} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSaveApp}>
              <div className="form-group">
                <label>App Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. French Learner App"
                  required
                />
              </div>

              <div className="form-group">
                <label>Short Note / Tagline</label>
                <input
                  type="text"
                  value={formShortNote}
                  onChange={(e) => setFormShortNote(e.target.value)}
                  placeholder="e.g. AI Vocab & Grammar Practice for French Readers"
                />
              </div>

              <div className="form-group">
                <label>App Web Address (URL) *</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://french.mytechflowlabs.com/"
                  required
                />
              </div>

              <div className="form-group">
                <label>Screenshot Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short description of what the app does..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="btn btn-gray"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue">
                  {editingApp ? 'Save Changes' : 'Add App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
