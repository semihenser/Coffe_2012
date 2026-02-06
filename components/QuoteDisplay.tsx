import React, { useState, useEffect } from 'react';
import { getDailyQuote } from '../data/quotes';
import { Coffee, Quote } from 'lucide-react';

export const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    setQuote(getDailyQuote());
    const interval = setInterval(() => {
      setQuote(getDailyQuote());
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  if (!quote) return null;

  return (
    <div className="w-full bg-white border border-theme-100 rounded-2xl p-8 shadow-sm mb-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
      {/* Pastel Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#E3D5CA] via-[#D4A373] to-[#E3D5CA]"></div>
      
      <div className="absolute -left-6 -top-6 text-theme-100/50 group-hover:text-theme-100 transition-colors">
        <Quote size={80} />
      </div>
      
      <div className="flex items-center gap-2 mb-4 text-accent-DEFAULT font-bold text-xs uppercase tracking-widest z-10 bg-accent-light/30 px-3 py-1 rounded-full">
        <Coffee size={14} />
        <span>Günün Sözü</span>
      </div>
      
      <p className="font-serif text-xl md:text-3xl italic text-theme-700 leading-relaxed z-10 max-w-3xl">
        "{quote}"
      </p>
      
      <div className="absolute -right-6 -bottom-6 text-theme-100/50 rotate-180 group-hover:text-theme-100 transition-colors">
         <Quote size={80} />
      </div>
    </div>
  );
};