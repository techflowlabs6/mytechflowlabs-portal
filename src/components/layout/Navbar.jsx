import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Wrench, 
  Code2, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenAuthModal, onFocusSearch }) => {
  const { user, isAdmin, logout, adminEmail } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Apps Hub', href: '#apps' },
    { name: 'Dev Tools', href: '#tools', badge: 'New' },
    { name: 'Skills & Tech', href: '#skills' },
    { name: 'Showcase', href: '#showcase' },
    { name: 'Architecture', href: '#about' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled ? 'modern-nav shadow-lg py-3' : 'bg-transparent py-4'
    }`}>
      <div className="container-custom flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 text-white text-decoration-none group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                MyTechFlow<span className="text-blue-500">Labs</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              mytechflowlabs.com
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-decoration-none flex items-center gap-1.5"
            >
              <span>{link.name}</span>
              {link.badge && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Right Tools & Admin Status */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Search Trigger */}
          <button
            onClick={onFocusSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-300 text-xs font-mono transition-all"
            title="Search applications (Hotkey: /)"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 rounded text-slate-400 border border-slate-700">
              /
            </kbd>
          </button>

          {/* Admin Mode Badge / Login */}
          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold truncate max-w-[150px]">{user?.email || adminEmail}</span>
              <button
                onClick={logout}
                className="p-1 rounded hover:bg-purple-500/20 text-rose-400 hover:text-white transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] hover:border-blue-500/40 text-slate-200 text-xs font-semibold transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Login</span>
            </button>
          )}

          {/* Launch Apps Hub CTA */}
          <a
            href="#apps"
            className="btn-primary text-xs py-1.5 px-4"
          >
            <span>Launch Hub</span>
          </a>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-slate-200 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-3 p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] shadow-2xl flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-semibold flex items-center justify-between"
            >
              <span>{link.name}</span>
              {link.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {link.badge}
                </span>
              )}
            </a>
          ))}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onFocusSearch?.();
              }}
              className="flex items-center justify-between w-full p-2.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-mono"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" /> Search Applications
              </span>
              <kbd className="px-2 py-0.5 bg-slate-900 rounded">/</kbd>
            </button>

            {isAdmin ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">{user?.email || adminEmail}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 font-bold px-2 py-1 bg-rose-500/10 rounded ml-2 shrink-0"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                <span>Admin Login ({adminEmail})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
