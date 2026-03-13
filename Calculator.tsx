import React, { useState, useEffect, useRef } from 'react';
import { Delete, Equal, Divide, X, Minus, Plus, RotateCcw, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Calculator = () => {
  const [expression, setExpression] = useState('');
  const [liveResult, setLiveResult] = useState('');
  const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const evaluateExpression = (expr: string) => {
    try {
      if (!expr) return '';
      let toEval = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**');
        
      toEval = toEval.replace(/([0-9.]+)%/g, '($1/100)');

      // Using with(Math) allows users to type things like sin(90), sqrt(16), PI, etc.
      const res = new Function('with(Math) { return ' + toEval + ' }')();
      
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        return parseFloat(res.toFixed(10)).toString();
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    setLiveResult(evaluateExpression(expression));
  }, [expression]);

  const handleEqual = () => {
    const res = evaluateExpression(expression);
    if (res) {
      setHistory((prev) => [{ eq: expression, res }, ...prev].slice(0, 50));
      setExpression(res);
      setLiveResult('');
    } else if (expression) {
      setLiveResult('هەڵەیە');
      setTimeout(() => setLiveResult(evaluateExpression(expression)), 1500);
    }
  };

  const handleButton = (symbol: string) => {
    if (symbol === 'C') {
      setExpression('');
      setLiveResult('');
    } else if (symbol === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
    } else if (symbol === '=') {
      handleEqual();
    } else {
      setExpression((prev) => prev + symbol);
    }
    inputRef.current?.focus();
  };

  const buttons = [
    { label: 'C', color: 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200' },
    { label: '(', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { label: ')', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { label: 'DEL', icon: <Delete size={22} />, color: 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200' },
    
    { label: '^', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { label: '%', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { label: '÷', icon: <Divide size={22} />, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { label: '×', icon: <X size={22} />, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    
    { label: '7' }, { label: '8' }, { label: '9' },
    { label: '−', icon: <Minus size={22} />, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    
    { label: '4' }, { label: '5' }, { label: '6' },
    { label: '+', icon: <Plus size={22} />, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    
    { label: '1' }, { label: '2' }, { label: '3' },
    { label: '=', icon: <Equal size={28} />, color: 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 border-indigo-700', className: 'row-span-2' },
    
    { label: '0', className: 'col-span-2' }, { label: '.' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-6xl mx-auto pb-20 lg:pb-0">
      {/* Calculator */}
      <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/50 p-4 sm:p-8 flex flex-col min-h-[600px] relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 mb-6 border border-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-end justify-end h-40 sm:h-48 shrink-0 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleEqual();
              }
            }}
            className="w-full bg-transparent text-right text-4xl sm:text-6xl font-black text-slate-800 tracking-tight outline-none placeholder:text-slate-300"
            dir="ltr"
            placeholder="0"
            autoFocus
          />
          <div className="text-indigo-500 text-xl sm:text-2xl h-8 mt-2 font-bold tracking-wide" dir="ltr">
            {liveResult && liveResult !== 'هەڵەیە' ? `= ${liveResult}` : liveResult}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4 flex-1 relative z-10">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => handleButton(btn.label)}
              className={`flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-2xl sm:rounded-3xl transition-all duration-200 active:scale-90 border-b-4 hover:-translate-y-1 ${
                btn.className || ''
              } ${
                btn.color || 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              {btn.icon || btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="w-full lg:w-96 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/50 flex flex-col h-96 lg:h-auto shrink-0 relative overflow-hidden">
        <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <HistoryIcon size={22} className="text-indigo-600" />
            <span>مێژووی ژمێرەر</span>
          </h3>
          <button
            onClick={() => setHistory([])}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-colors"
            title="سڕینەوەی مێژوو"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <AnimatePresence>
            {history.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={idx}
                className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
                onClick={() => {
                  setExpression(item.res);
                  inputRef.current?.focus();
                }}
              >
                <div className="text-slate-500 text-sm mb-2 font-medium group-hover:text-indigo-500 transition-colors" dir="ltr">{item.eq}</div>
                <div className="text-2xl font-black text-slate-800 group-hover:text-indigo-700 transition-colors" dir="ltr">= {item.res}</div>
              </motion.div>
            ))}
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 space-y-4">
                <HistoryIcon size={48} />
                <p className="font-medium">هیچ مێژوویەک نییە</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
