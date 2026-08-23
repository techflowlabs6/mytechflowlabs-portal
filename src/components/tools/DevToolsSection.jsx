import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Code2, 
  FileJson, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  Link as LinkIcon,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DevToolsSection = () => {
  const [activeTab, setActiveTab] = useState('json');

  // JSON Formatter State
  const [jsonInput, setJsonInput] = useState('{\n  "app": "MyTechFlow Labs",\n  "status": "online",\n  "endpoints": [\n    "https://french-learner.mytechflowlabs.com",\n    "https://timelog.mytechflowlabs.com"\n  ]\n}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);

  // Base64 State
  const [base64Input, setBase64Input] = useState('MyTechFlow Labs - Engineering Portal');
  const [base64Output, setBase64Output] = useState('');
  const [copiedBase64, setCopiedBase64] = useState(false);

  // UUID State
  const [uuids, setUuids] = useState([]);
  const [copiedUuid, setCopiedUuid] = useState(false);

  // Scratchpad State
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('mytechflow_scratchpad') || '// MyTechFlow Labs Scratchpad\n// Auto-saved locally in your browser\n\n- Deploy Supabase schema to staging\n- Verify Web Speech API in French Learner App\n- Test Pomodoro billable rates in TimeLog Pro\n- Sync driver earnings tax estimates';
  });

  // Pomodoro State
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState('work'); // 'work' | 'break'

  // URL Parser State
  const [urlInput, setUrlInput] = useState('https://mytechflowlabs.com/search?category=AI&featured=true&sort=popular');
  const [parsedUrl, setParsedUrl] = useState(null);

  // Initialize UUIDs
  useEffect(() => {
    generateUuids();
  }, []);

  // Save notes
  useEffect(() => {
    localStorage.setItem('mytechflow_scratchpad', notes);
  }, [notes]);

  // Pomodoro timer tick
  useEffect(() => {
    let timer;
    if (isPomoRunning && pomoTime > 0) {
      timer = setInterval(() => {
        setPomoTime(prev => prev - 1);
      }, 1000);
    } else if (pomoTime === 0) {
      setIsPomoRunning(false);
    }
    return () => clearInterval(timer);
  }, [isPomoRunning, pomoTime]);

  // JSON Formatter handlers
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (err) {
      setJsonError('Invalid JSON format: ' + err.message);
    }
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
      setJsonError('');
    } catch (err) {
      setJsonError('Invalid JSON format: ' + err.message);
    }
  };

  // Base64 handlers
  const handleEncodeBase64 = () => {
    try {
      setBase64Output(btoa(base64Input));
    } catch (err) {
      setBase64Output('Encoding error: ' + err.message);
    }
  };

  const handleDecodeBase64 = () => {
    try {
      setBase64Output(atob(base64Input));
    } catch (err) {
      setBase64Output('Invalid Base64 string');
    }
  };

  // UUID generator
  const generateUuids = () => {
    const list = Array.from({ length: 4 }, () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    });
    setUuids(list);
  };

  // URL Parser handler
  const handleParseUrl = () => {
    try {
      const u = new URL(urlInput);
      const params = {};
      u.searchParams.forEach((v, k) => {
        params[k] = v;
      });
      setParsedUrl({
        origin: u.origin,
        pathname: u.pathname,
        params: params
      });
    } catch (err) {
      setParsedUrl({ error: 'Please enter a valid full URL with protocol (https://...)' });
    }
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPomoTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="tools" className="py-16 bg-[#090d16] border-b border-[#1e293b] scroll-mt-14">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>DEVELOPER PRODUCTIVITY UTILITIES</span>
            </div>
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Built-in <span className="text-blue-500">Developer Tools</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Lightweight, browser-native tools to speed up daily engineering workflows.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-[#0f172a] p-1.5 rounded-xl border border-[#1e293b]">
            {[
              { id: 'json', name: 'JSON Formatter', icon: FileJson },
              { id: 'base64', name: 'Base64', icon: Key },
              { id: 'uuid', name: 'UUIDs', icon: Zap },
              { id: 'notes', name: 'Scratchpad', icon: FileText },
              { id: 'pomodoro', name: 'Pomodoro', icon: Clock },
              { id: 'url', name: 'URL Parser', icon: LinkIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Work Area */}
        <div className="modern-card p-6 bg-[#0f172a] border border-[#1e293b]">
          
          {/* 1. JSON FORMATTER */}
          {activeTab === 'json' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  JSON Beautifier, Minifier & Validator
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFormatJson}
                    className="btn-primary text-xs py-1 px-3 rounded-lg"
                  >
                    Format / Beautify
                  </button>
                  <button
                    onClick={handleMinifyJson}
                    className="btn-secondary text-xs py-1 px-3 rounded-lg"
                  >
                    Minify
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Input JSON</label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={8}
                    className="w-full p-3 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Paste your JSON here..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-mono">Formatted Output</label>
                    {jsonOutput && (
                      <button
                        onClick={() => copyToClipboard(jsonOutput, setCopiedJson)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                      >
                        {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={jsonOutput}
                    rows={8}
                    className="w-full p-3 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-emerald-400 focus:outline-none resize-none"
                    placeholder="Click 'Format / Beautify' to see formatted JSON output..."
                  />
                </div>
              </div>

              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. BASE64 ENCODER/DECODER */}
          {activeTab === 'base64' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Base64 Text Encoder & Decoder
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEncodeBase64}
                    className="btn-primary text-xs py-1 px-3 rounded-lg"
                  >
                    Encode to Base64
                  </button>
                  <button
                    onClick={handleDecodeBase64}
                    className="btn-secondary text-xs py-1 px-3 rounded-lg"
                  >
                    Decode from Base64
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Source Text</label>
                  <textarea
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Enter text or base64 string..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-mono">Result Output</label>
                    {base64Output && (
                      <button
                        onClick={() => copyToClipboard(base64Output, setCopiedBase64)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                      >
                        {copiedBase64 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBase64 ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={base64Output}
                    rows={6}
                    className="w-full p-3 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-blue-300 focus:outline-none resize-none"
                    placeholder="Result will appear here..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. UUID GENERATOR */}
          {activeTab === 'uuid' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Version 4 Random UUID Generator (Database & Key Ready)
                </span>
                <button
                  onClick={generateUuids}
                  className="btn-primary text-xs py-1 px-3 rounded-lg flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New Set</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uuids.map((uuid, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#090d16] border border-[#1e293b] flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-cyan-300 truncate">
                      {uuid}
                    </span>
                    <button
                      onClick={() => copyToClipboard(uuid, setCopiedUuid)}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Copy UUID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SCRATCHPAD */}
          {activeTab === 'notes' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Browser Scratchpad (Auto-saved locally in localStorage)
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-Saved
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                className="w-full p-4 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                placeholder="Write code snippets, ideas, or todo lists..."
              />
            </div>
          )}

          {/* 5. POMODORO TIMER */}
          {activeTab === 'pomodoro' && (
            <div className="flex flex-col items-center justify-center py-4 gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPomoMode('work');
                    setPomoTime(25 * 60);
                    setIsPomoRunning(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold ${
                    pomoMode === 'work' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Work (25m)
                </button>
                <button
                  onClick={() => {
                    setPomoMode('break');
                    setPomoTime(5 * 60);
                    setIsPomoRunning(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold ${
                    pomoMode === 'break' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Break (5m)
                </button>
              </div>

              <div className="font-mono text-5xl sm:text-6xl font-extrabold text-white tracking-widest my-2">
                {formatPomoTime(pomoTime)}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPomoRunning(!isPomoRunning)}
                  className="btn-primary text-xs py-2 px-5 rounded-xl flex items-center gap-1.5"
                >
                  {isPomoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPomoRunning ? 'Pause' : 'Start Focus'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPomoRunning(false);
                    setPomoTime(pomoMode === 'work' ? 25 * 60 : 5 * 60);
                  }}
                  className="btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. URL PARSER */}
          {activeTab === 'url' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/path?param=value..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleParseUrl}
                  className="btn-primary text-xs py-2 px-4 rounded-xl whitespace-nowrap"
                >
                  Parse URL
                </button>
              </div>

              {parsedUrl && (
                <div className="p-4 rounded-xl bg-[#090d16] border border-[#1e293b] flex flex-col gap-3">
                  {parsedUrl.error ? (
                    <span className="text-xs text-rose-400 font-mono">{parsedUrl.error}</span>
                  ) : (
                    <>
                      <div className="text-xs font-mono text-slate-300">
                        <span className="text-slate-500">Origin: </span>
                        <strong className="text-blue-400">{parsedUrl.origin}</strong>
                      </div>
                      <div className="text-xs font-mono text-slate-300">
                        <span className="text-slate-500">Path: </span>
                        <strong className="text-purple-400">{parsedUrl.pathname}</strong>
                      </div>
                      <div>
                        <span className="text-xs font-mono text-slate-500 block mb-1">Query Parameters:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(parsedUrl.params).length > 0 ? (
                            Object.entries(parsedUrl.params).map(([k, v], i) => (
                              <div key={i} className="p-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-xs font-mono flex items-center justify-between">
                                <span className="text-cyan-300 font-bold">{k}</span>
                                <span className="text-emerald-300">{v}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">No query parameters found.</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
