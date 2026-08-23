import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Check, 
  CheckCircle2, 
  TrendingUp, 
  Flame, 
  DollarSign,
  Clock,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

// ==========================================
// 1. FRENCH LEARNER INTERACTIVE WIDGET
// ==========================================
export const FrenchLearnerWidget = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const phrases = [
    { fr: 'Bonjour ! Comment allez-vous ?', en: 'Hello! How are you?', options: ['Hello! How are you?', 'Good morning my friend', 'Where are you going?'], correct: 0, ipa: '/bɔ̃.ʒuʁ kɔ.mɑ̃ ta.le vu/' },
    { fr: 'Je voudrais un café s’il vous plaît', en: 'I would like a coffee please', options: ['I have a coffee', 'I would like a coffee please', 'Do you want tea?'], correct: 1, ipa: '/ʒə vu.dʁɛ œ̃ ka.fe sil vu plɛ/' },
    { fr: 'L’intelligence artificielle accélère l’apprentissage', en: 'Artificial intelligence accelerates learning', options: ['Technology is difficult', 'Learning French is slow', 'Artificial intelligence accelerates learning'], correct: 2, ipa: '/l‿ɛ̃.tɛ.li.ʒɑ̃s aʁ.ti.fi.sjɛl/' }
  ];

  const current = phrases[currentWordIndex];

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.fr);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (idx) => {
    setSelectedOption(idx);
    if (idx === current.correct) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setFeedback(null);
    setCurrentWordIndex((prev) => (prev + 1) % phrases.length);
  };

  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/20 flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
          LIVE DEMO • CEFR B2
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          Card {currentWordIndex + 1}/{phrases.length}
        </span>
      </div>

      {/* French Sentence Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/50 to-indigo-950/40 border border-blue-500/30 text-center relative overflow-hidden">
        <p className="text-sm font-bold text-white tracking-wide">
          "{current.fr}"
        </p>
        <p className="text-[10px] text-blue-300 font-mono mt-1">
          {current.ipa}
        </p>

        <button
          onClick={handleSpeak}
          className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
            isSpeaking ? 'bg-cyan-400 text-black scale-105' : 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-200'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isSpeaking ? 'Playing French Audio...' : 'Listen Pronunciation'}</span>
        </button>
      </div>

      {/* Interactive Options */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-mono text-slate-400 uppercase">Select English Translation:</p>
        {current.options.map((opt, idx) => {
          let btnStyle = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10';
          if (selectedOption === idx) {
            btnStyle = idx === current.correct 
              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold' 
              : 'bg-rose-500/30 border-rose-400 text-rose-300';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`px-3 py-1.5 rounded-lg border text-left text-xs transition-all ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs font-bold ${feedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {feedback === 'correct' ? '✨ Excellent! +25 XP' : '❌ Try again'}
          </span>
          <button
            onClick={handleNext}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono"
          >
            Next Phrase →
          </button>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 2. TIMELOG PRO INTERACTIVE WIDGET
// ==========================================
export const TimeLogWidget = () => {
  const [seconds, setSeconds] = useState(1420);
  const [isActive, setIsActive] = useState(true);
  const hourlyRate = 85;

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatedRevenue = ((seconds / 3600) * hourlyRate).toFixed(2);

  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          ACTIVE FOCUS BLOCK
        </span>
        <span className="text-[11px] text-emerald-300 font-mono font-bold">
          ${hourlyRate}/hr rate
        </span>
      </div>

      {/* Timer Display */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase">Elapsed Time</span>
          <p className="font-mono font-bold text-2xl text-white tracking-widest">
            {formatTime(seconds)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Billable Value</span>
          <p className="font-mono font-bold text-xl text-emerald-400">
            ${calculatedRevenue}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500 text-black'
          }`}
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isActive ? 'Pause Timer' : 'Resume Focus'}</span>
        </button>

        <button
          onClick={() => { setSeconds(0); setIsActive(false); }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mini Timesheet Heatmap */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
        <span>Daily Target: 6.5h / 8h</span>
        <div className="flex gap-1">
          <span className="w-3 h-3 rounded-xs bg-emerald-500/40" />
          <span className="w-3 h-3 rounded-xs bg-emerald-500/80" />
          <span className="w-3 h-3 rounded-xs bg-emerald-400" />
          <span className="w-3 h-3 rounded-xs bg-emerald-500/90" />
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 3. TCF PREPARATION SUITE INTERACTIVE WIDGET
// ==========================================
export const TCFPrepWidget = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [scorePredicted, setScorePredicted] = useState('CLB 8 (Advanced)');

  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          TCF CANADA SIMULATOR
        </span>
        <span className="text-[11px] text-purple-300 font-mono font-bold">
          Predicted: {scorePredicted}
        </span>
      </div>

      {/* Question simulation */}
      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs">
        <span className="text-[10px] text-purple-300 font-mono font-bold uppercase block mb-1">
          Compréhension Écrite • Item #14
        </span>
        <p className="text-white font-medium">
          « En raison des travaux sur la ligne principale, les usagers sont invités à emprunter les navettes de substitution. »
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-1">
        {[
          'Les trains circulent normalement',
          'Des autobus remplacent temporairement les trains',
          'La gare est fermée définitivement'
        ].map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedAnswer(idx)}
            className={`px-3 py-1.5 rounded-lg border text-left text-xs transition-all ${
              selectedAnswer === idx
                ? idx === 1 
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-rose-500/30 border-rose-400 text-rose-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {selectedAnswer === 1 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Correct! +15 TCF Points mapped to NCLC 9.</span>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 4. DRIVER EARNINGS TRACKER WIDGET
// ==========================================
export const DriverEarningsWidget = () => {
  const [shiftHours, setShiftHours] = useState(6);
  const [platform, setPlatform] = useState('Uber + Lyft');

  const grossRevenue = shiftHours * 38;
  const fuelExpense = shiftHours * 6.5;
  const netProfit = grossRevenue - fuelExpense;
  const netHourly = (netProfit / shiftHours).toFixed(2);

  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
          PROFIT INTELLIGENCE GAUGE
        </span>
        <span className="text-[11px] text-amber-300 font-mono font-bold">
          ${netHourly}/hr Net Profit
        </span>
      </div>

      {/* Hours Slider */}
      <div>
        <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
          <span>Shift Length: <strong>{shiftHours} hrs</strong></span>
          <span className="text-amber-400 font-bold">${grossRevenue} Gross</span>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          value={shiftHours}
          onChange={(e) => setShiftHours(Number(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer h-1.5 rounded-lg bg-white/10"
        />
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-mono">Fuel & Deductions</span>
          <p className="font-mono text-rose-400 font-bold">-${fuelExpense.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono">Take-Home Profit</span>
          <p className="font-mono text-emerald-400 font-bold text-sm">+${netProfit.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
