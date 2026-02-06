import React from 'react';
import { Expense } from '../types';
import { Trash2, ShoppingBag, Calendar } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-theme-200 rounded-2xl">
        <div className="bg-theme-50 p-6 rounded-full border border-theme-100 mb-4">
           <ShoppingBag size={32} className="text-theme-400" />
        </div>
        <p className="text-theme-700 font-bold text-lg">Henüz Harcama Yok</p>
        <p className="text-theme-400 text-sm mt-1">Yapılan alışverişleri buraya ekleyebilirsiniz.</p>
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white border border-theme-100 shadow-sm rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F9F7F5] border-b border-theme-100 text-xs font-bold uppercase tracking-widest text-theme-400">
        <div className="col-span-6">Açıklama</div>
        <div className="col-span-3">Tarih</div>
        <div className="col-span-2 text-right">Tutar</div>
        <div className="col-span-1 text-right">Sil</div>
      </div>

      <div className="divide-y divide-theme-50">
        {sortedExpenses.map((expense) => (
          <div 
            key={expense.id} 
            className="flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#F9F7F5] transition-colors group"
          >
            {/* Description */}
            <div className="w-full md:col-span-6 flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#FFD7BA] text-[#A66828]">
                <ShoppingBag size={16} />
              </div>
              <span className="font-bold text-theme-800 text-sm md:text-base">
                {expense.description}
              </span>
            </div>

            {/* Date */}
            <div className="w-full md:col-span-3 flex items-center gap-2">
               <Calendar size={14} className="text-theme-300 md:hidden" />
               <span className="text-sm font-mono text-theme-500">
                {new Date(expense.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
               </span>
            </div>

            {/* Amount */}
            <div className="w-full md:col-span-2 flex justify-between md:justify-end items-center">
              <span className="md:hidden text-xs font-bold text-theme-400 uppercase">Tutar:</span>
              <span className="text-base font-bold text-[#6D3B3E] font-mono bg-[#FFF0F3] px-2 py-1 rounded">
                -₺{expense.amount}
              </span>
            </div>

            {/* Delete */}
            <div className="w-full md:col-span-1 flex justify-end">
              <button
                onClick={() => onDelete(expense.id)}
                className="p-2 text-theme-300 hover:text-[#E5989B] hover:bg-[#FFF5F5] rounded-lg transition-colors"
                title="Harcamayı Sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};