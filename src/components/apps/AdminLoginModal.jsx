import React, { useState } from 'react';
import { ShieldCheck, X, Lock, Mail, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginModal = ({ onClose }) => {
  const { login, loginAsAdminQuick, adminEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    loginAsAdminQuick();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">SuperAdmin Portal</h3>
              <p className="text-[11px] text-purple-300 font-mono">MyTechFlow Labs Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Note */}
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] font-mono text-purple-200 mb-4 flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
          <span>
            Authorized privileges are strictly granted to: <strong>{adminEmail}</strong> for application management (Add, Edit, Delete).
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={adminEmail}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign in as SuperAdmin'}</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#1e293b] text-center">
          <p className="text-[11px] text-slate-400 font-mono mb-2">
            Developer / Owner Quick Authentication:
          </p>
          <button
            type="button"
            onClick={handleQuickLogin}
            className="w-full py-2 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-purple-300 hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors border border-purple-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>1-Click Authenticate ({adminEmail})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
