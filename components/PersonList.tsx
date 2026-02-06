import React, { useState } from 'react';
import { Person } from '../types';
import { Check, Trash2, User, MessageSquare, Save, X, Coffee } from 'lucide-react';

interface PersonListProps {
  people: Person[];
  onTogglePay: (id: string) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, feedback: string) => void;
}

export const PersonList: React.FC<PersonListProps> = ({ people, onTogglePay, onDelete, onRate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempFeedback, setTempFeedback] = useState("");

  const handleStartEdit = (person: Person) => {
    setEditingId(person.id);
    setTempFeedback(person.satisfaction || "");
  };

  const handleSaveFeedback = (id: string) => {
    onRate(id, tempFeedback);
    setEditingId(null);
  };

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-theme-200 rounded-2xl">
        <div className="bg-theme-50 p-6 rounded-full border border-theme-100 mb-4">
           <Coffee size={32} className="text-theme-400" />
        </div>
        <p className="text-theme-700 font-bold text-lg">Liste Henüz Boş</p>
        <p className="text-theme-400 text-sm mt-1">Ekibe yeni bir kahve sever ekleyin.</p>
      </div>
    );
  }

  // Sort: Unpaid first, then Paid
  const sortedPeople = [...people].sort((a, b) => (a.hasPaid === b.hasPaid ? 0 : a.hasPaid ? 1 : -1));

  return (
    <div className="bg-white border border-theme-100 shadow-sm rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F9F7F5] border-b border-theme-100 text-xs font-bold uppercase tracking-widest text-theme-400">
        <div className="col-span-1">Durum</div>
        <div className="col-span-4">İsim</div>
        <div className="col-span-2">Ödeme Tarihi</div>
        <div className="col-span-4">Görüş / Not</div>
        <div className="col-span-1 text-right">Sil</div>
      </div>

      <div className="divide-y divide-theme-50">
        {sortedPeople.map((person) => (
          <div 
            key={person.id} 
            className={`group flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-200 ${person.hasPaid ? 'bg-white hover:bg-[#F9F7F5]' : 'bg-[#FFF5F5] hover:bg-[#FFEBEB]'}`}
          >
            {/* Status Button */}
            <div className="w-full md:col-span-1 flex md:block">
              <button
                onClick={() => onTogglePay(person.id)}
                className={`w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-lg border transition-all duration-300 shadow-sm ${
                  person.hasPaid 
                    ? 'bg-[#CCD5AE] border-[#B7C496] text-[#4A5D23] hover:bg-[#D4E09B]' // Pastel Green Check
                    : 'bg-white border-theme-200 text-theme-200 hover:border-accent-DEFAULT hover:text-accent-DEFAULT'
                }`}
              >
                <Check size={16} strokeWidth={4} />
              </button>
            </div>

            {/* Name */}
            <div className="w-full md:col-span-4 flex items-center gap-3">
              <div className={`p-2 rounded-full transition-colors ${person.hasPaid ? 'bg-theme-100 text-theme-500' : 'bg-[#FFD7BA] text-[#A66828]'}`}>
                <User size={16} />
              </div>
              <div>
                <span className={`block font-bold text-sm md:text-base ${person.hasPaid ? 'text-theme-700' : 'text-theme-900'}`}>
                  {person.name}
                </span>
                {!person.hasPaid && (
                   <span className="text-[10px] font-bold uppercase tracking-wide text-[#E5989B]">
                     Ödeme Bekleniyor
                   </span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="w-full md:col-span-2 flex items-center gap-2">
              <span className="md:hidden text-xs font-bold text-theme-400 uppercase w-24">Tarih:</span>
              <span className="text-sm font-mono text-theme-500">
                {person.hasPaid && person.datePaid 
                  ? new Date(person.datePaid).toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit'}) 
                  : '-'}
              </span>
            </div>

            {/* Feedback / Note Input */}
            <div className="w-full md:col-span-4 relative">
              <span className="md:hidden text-xs font-bold text-theme-400 uppercase block mb-1">Görüş:</span>
              
              {editingId === person.id ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <input 
                    type="text" 
                    value={tempFeedback}
                    onChange={(e) => setTempFeedback(e.target.value)}
                    placeholder="Bir not bırakın..."
                    className="w-full text-sm border border-accent-DEFAULT/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-light bg-white text-theme-700"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveFeedback(person.id)}
                  />
                  <button onClick={() => handleSaveFeedback(person.id)} className="text-[#4A5D23] hover:scale-110 transition-transform"><Save size={18} /></button>
                  <button onClick={() => setEditingId(null)} className="text-[#E5989B] hover:scale-110 transition-transform"><X size={18} /></button>
                </div>
              ) : (
                <div 
                  onClick={() => handleStartEdit(person)}
                  className="group/edit flex items-center gap-2 cursor-pointer py-1"
                >
                  {person.satisfaction ? (
                    <span className="text-sm text-theme-600 italic border-b border-dashed border-theme-300 hover:border-accent-DEFAULT">"{person.satisfaction}"</span>
                  ) : (
                    <span className="text-sm text-theme-300 flex items-center gap-1 group-hover/edit:text-accent-DEFAULT transition-colors">
                      <MessageSquare size={14} /> <span className="text-xs">Görüş ekle</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="w-full md:col-span-1 flex justify-end">
              <button
                onClick={() => onDelete(person.id)}
                className="p-2 text-theme-300 hover:text-[#E5989B] hover:bg-[#FFF5F5] rounded-lg transition-colors"
                title="Kaydı Sil"
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