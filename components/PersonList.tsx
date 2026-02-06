import React, { useState } from 'react';
import { Person } from '../types';
import { Trash2, User, MessageSquare, Save, X, Coffee, PlusCircle, History, Lock } from 'lucide-react';

interface PersonListProps {
  people: Person[];
  onAddPayment: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, feedback: string) => void;
  defaultAmount: number;
  isAdmin: boolean;
}

// Internal component to manage input state per row
const PersonRow: React.FC<{
  person: Person;
  defaultAmount: number;
  onAddPayment: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, feedback: string) => void;
  isAdmin: boolean;
}> = ({ person, defaultAmount, onAddPayment, onDelete, onRate, isAdmin }) => {
  const [amount, setAmount] = useState<string>(defaultAmount.toString());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempFeedback, setTempFeedback] = useState("");

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0) {
      onAddPayment(person.id, val);
    }
  };

  const handleStartEdit = () => {
    // Only admin can edit notes if we are strictly following "Data entry restricted"
    if (!isAdmin) return;
    setEditingId(person.id);
    setTempFeedback(person.satisfaction || "");
  };

  const handleSaveFeedback = () => {
    onRate(person.id, tempFeedback);
    setEditingId(null);
  };

  const hasPaid = person.totalPaid > 0;

  return (
    <div 
      className={`group flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-200 border-b border-theme-50 last:border-0 ${hasPaid ? 'bg-white hover:bg-[#F9F7F5]' : 'bg-[#FFF5F5] hover:bg-[#FFEBEB]'}`}
    >
      {/* Name & Total */}
      <div className="w-full md:col-span-5 flex items-center gap-3">
        <div className={`p-2 rounded-full transition-colors ${hasPaid ? 'bg-theme-100 text-theme-500' : 'bg-[#FFD7BA] text-[#A66828]'}`}>
          <User size={18} />
        </div>
        <div>
          <span className={`block font-bold text-base ${hasPaid ? 'text-theme-800' : 'text-theme-900'}`}>
            {person.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
             <span className={`text-xs font-bold px-2 py-0.5 rounded ${hasPaid ? 'bg-[#CCD5AE] text-[#4A5D23]' : 'bg-[#E5989B] text-[#6D3B3E]'}`}>
                Toplam: ₺{person.totalPaid}
             </span>
             {person.lastPaymentDate && (
               <span className="text-[10px] text-theme-400 flex items-center gap-1">
                 <History size={10} /> {new Date(person.lastPaymentDate).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit'})}
               </span>
             )}
          </div>
        </div>
      </div>

      {/* Add Payment Input (Admin Only) */}
      <div className="w-full md:col-span-3">
        {isAdmin ? (
            <form onSubmit={handlePayment} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-400 text-xs font-bold">₺</span>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-6 pr-2 py-2 text-sm border border-theme-200 rounded-xl focus:outline-none focus:border-accent-DEFAULT focus:ring-1 focus:ring-accent-light transition-all bg-white/50"
                        placeholder="0"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="bg-theme-800 text-white p-2 rounded-xl hover:bg-accent-DEFAULT hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
                    title="Ekle"
                >
                    <PlusCircle size={20} />
                </button>
            </form>
        ) : (
            <div className="h-full flex items-center">
                 <div className="h-1 w-12 bg-theme-100 rounded-full"></div>
            </div>
        )}
      </div>

      {/* Feedback */}
      <div className="w-full md:col-span-3 relative">
        <span className="md:hidden text-xs font-bold text-theme-400 uppercase block mb-1">Görüş:</span>
        
        {editingId === person.id ? (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
            <input 
              type="text" 
              value={tempFeedback}
              onChange={(e) => setTempFeedback(e.target.value)}
              placeholder="Not..."
              className="w-full text-sm border border-accent-DEFAULT/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-light bg-white text-theme-700"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveFeedback()}
            />
            <button onClick={handleSaveFeedback} className="text-[#4A5D23] hover:scale-110 transition-transform"><Save size={18} /></button>
            <button onClick={() => setEditingId(null)} className="text-[#E5989B] hover:scale-110 transition-transform"><X size={18} /></button>
          </div>
        ) : (
          <div 
            onClick={handleStartEdit}
            className={`flex items-center gap-2 py-1 ${isAdmin ? 'cursor-pointer group/edit' : ''}`}
          >
            {person.satisfaction ? (
              <span className="text-sm text-theme-600 italic truncate max-w-[150px] border-b border-dashed border-theme-300 hover:border-accent-DEFAULT">"{person.satisfaction}"</span>
            ) : (
              isAdmin ? (
                <span className="text-sm text-theme-300 flex items-center gap-1 group-hover/edit:text-accent-DEFAULT transition-colors">
                    <MessageSquare size={14} /> <span className="text-xs">Not ekle</span>
                </span>
              ) : (
                <span className="text-sm text-theme-200 italic">-</span>
              )
            )}
          </div>
        )}
      </div>

      {/* Delete (Admin Only) */}
      <div className="w-full md:col-span-1 flex justify-end">
        {isAdmin && (
            <button
            onClick={() => onDelete(person.id)}
            className="p-2 text-theme-300 hover:text-[#E5989B] hover:bg-[#FFF5F5] rounded-lg transition-colors"
            title="Kaydı Sil"
            >
            <Trash2 size={16} />
            </button>
        )}
      </div>
    </div>
  );
};

export const PersonList: React.FC<PersonListProps> = ({ people, onAddPayment, onDelete, onRate, defaultAmount, isAdmin }) => {
  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-theme-200 rounded-2xl">
        <div className="bg-theme-50 p-6 rounded-full border border-theme-100 mb-4">
           <Coffee size={32} className="text-theme-400" />
        </div>
        <p className="text-theme-700 font-bold text-lg">Liste Henüz Boş</p>
        <p className="text-theme-400 text-sm mt-1">
             {isAdmin ? 'Ekibe yeni bir kahve sever ekleyin.' : 'Yönetici girişi yaparak kişi ekleyebilirsiniz.'}
        </p>
      </div>
    );
  }

  // Sort: totalPaid descending (Most contributing first)
  const sortedPeople = [...people].sort((a, b) => b.totalPaid - a.totalPaid);

  return (
    <div className="bg-white border border-theme-100 shadow-sm rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F9F7F5] border-b border-theme-100 text-xs font-bold uppercase tracking-widest text-theme-400">
        <div className="col-span-5">Kişi & Toplam Katkı</div>
        <div className="col-span-3">{isAdmin ? 'Ödeme Ekle' : ''}</div>
        <div className="col-span-3">Not</div>
        <div className="col-span-1 text-right">{isAdmin ? 'Sil' : ''}</div>
      </div>

      <div>
        {sortedPeople.map((person) => (
            <PersonRow 
                key={person.id} 
                person={person} 
                defaultAmount={defaultAmount}
                onAddPayment={onAddPayment}
                onDelete={onDelete}
                onRate={onRate}
                isAdmin={isAdmin}
            />
        ))}
      </div>
    </div>
  );
};