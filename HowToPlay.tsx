import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface HowToPlayProps {
  rules: string[];
  controls: string[];
}

export default function HowToPlay({ rules, controls }: HowToPlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors font-medium text-sm"
      >
        <Info size={16} />
        How to Play
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Info size={20} className="text-indigo-600" />
                How to Play
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Rules</h4>
                <ul className="space-y-2">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex gap-2 text-slate-600 text-sm">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {controls.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Controls</h4>
                  <ul className="space-y-2">
                    {controls.map((control, i) => (
                      <li key={i} className="flex gap-2 text-slate-600 text-sm">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{control}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
