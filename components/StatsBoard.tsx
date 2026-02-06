import React from 'react';
import { Stats } from '../types';
import { Wallet, TrendingDown, PiggyBank, UserX } from 'lucide-react';

interface StatsBoardProps {
  stats: Stats;
}

export const StatsBoard: React.FC<StatsBoardProps> = ({ stats }) => {
  
  const StatCard = ({ label, value, subtext, icon: Icon, colorClass }: any) => (
    <div className={`p-6 bg-white rounded-2xl shadow-sm border border-theme-100 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-400">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
           <Icon size={18} className="opacity-80" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl md:text-3xl font-black text-theme-800 tracking-tight font-sans">
          {value}
        </span>
        {subtext && <span className="text-xs font-medium text-theme-400 mt-1">{subtext}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Gelir */}
      <StatCard 
        label="Toplanan" 
        value={`₺${stats.totalCollected}`} 
        icon={Wallet} 
        colorClass="bg-[#E9EDC9] text-[#4A5D23]" // Pastel Green
      />
      
      {/* Gider */}
      <StatCard 
        label="Harcanan" 
        value={`₺${stats.totalSpent}`} 
        subtext="Kahve, şeker, filtre vb."
        icon={TrendingDown}
        colorClass="bg-[#FFD7BA] text-[#A66828]" // Pastel Apricot
      />

      {/* Kasa */}
      <StatCard 
        label="Kasa (Net)" 
        value={`₺${stats.remainingBalance}`} 
        icon={PiggyBank}
        colorClass={`bg-[#B5C9C3] text-[#354F52] ${stats.remainingBalance < 0 ? 'border-red-200 bg-red-50 text-red-600' : ''}`} // Pastel Blue
      />

      {/* Hiç Ödemeyen Sayısı */}
      <StatCard 
        label="MİKROPLAR" 
        value={stats.zeroContributionCount} 
        subtext="Kişi Hiç Ödemedi"
        icon={UserX}
        colorClass="bg-[#E3D5CA] text-[#7F5539]" // Pastel Mocha
      />
    </div>
  );
};