import React, { useState, useEffect, useMemo } from 'react';
import { Person, Expense, Stats } from './types';
import { StatsBoard } from './components/StatsBoard';
import { PersonList } from './components/PersonList';
import { ExpenseList } from './components/ExpenseList';
import { QuoteDisplay } from './components/QuoteDisplay';
import { generateMotivationMessage } from './services/geminiService';
import { subscribeToData, saveData } from './services/storageService';
import { Plus, Download, Settings, Loader2, Coffee, Sparkles, Wifi } from 'lucide-react';

const SETTINGS_KEY = 'office-coffee-settings';

// Simple ID generator fallback
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App: React.FC = () => {
  // Data State
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Input State
  const [newName, setNewName] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  
  // Settings State
  const [coffeePrice, setCoffeePrice] = useState<number>(200); // Default monthly contribution
  const [coffeeConsumption, setCoffeeConsumption] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load data
  useEffect(() => {
    // Load Settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setCoffeePrice(settings.price || 200);
        setCoffeeConsumption(settings.consumption || 0);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }

    // Subscribe to Cloud Data
    setIsLoadingData(true);
    const unsubscribe = subscribeToData((dataPeople, dataExpenses) => {
      // MIGRATION LOGIC: Convert old boolean 'hasPaid' to 'totalPaid'
      const migratedPeople = dataPeople.map(p => {
        if (p.totalPaid === undefined) {
             return {
                 ...p,
                 totalPaid: p.hasPaid ? 200 : 0, // Assume 200 if marked as paid in old system
                 lastPaymentDate: p.datePaid
             }
        }
        return p;
      });

      setPeople(migratedPeople);
      setExpenses(dataExpenses);
      setIsLoadingData(false);
    });

    return () => unsubscribe();
  }, []);

  // Save Settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ 
      price: coffeePrice, 
      consumption: coffeeConsumption 
    }));
  }, [coffeePrice, coffeeConsumption]);

  // Derived Stats
  const stats: Stats = useMemo(() => {
    // Total collected is sum of all totalPaid
    const totalCollected = people.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const contributors = people.filter(p => p.totalPaid > 0).length;

    return {
      totalPeople: people.length,
      contributorsCount: contributors,
      zeroContributionCount: people.length - contributors,
      totalCollected: totalCollected,
      totalSpent: totalSpent,
      remainingBalance: totalCollected - totalSpent
    };
  }, [people, expenses]);

  // Handlers
  const handleAddData = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'income') {
        if (!newName.trim()) return;
        const newPerson: Person = {
            id: generateId(),
            name: newName.trim(),
            totalPaid: 0 // New person starts with 0
        };
        const updatedPeople = [...people, newPerson];
        setPeople(updatedPeople);
        saveData(updatedPeople, expenses);
        setNewName('');
    } else {
        if (!expenseDesc.trim() || !expenseAmount) return;
        const newExpense: Expense = {
            id: generateId(),
            description: expenseDesc.trim(),
            amount: Number(expenseAmount),
            date: new Date().toISOString()
        };
        const updatedExpenses = [...expenses, newExpense];
        setExpenses(updatedExpenses);
        saveData(people, updatedExpenses);
        setExpenseDesc('');
        setExpenseAmount('');
    }
  };

  const handleAddPayment = (id: string, amount: number) => {
      const updatedPeople = people.map(p => {
          if (p.id === id) {
              return {
                  ...p,
                  totalPaid: (p.totalPaid || 0) + amount,
                  lastPaymentDate: new Date().toISOString()
              };
          }
          return p;
      });
      setPeople(updatedPeople);
      saveData(updatedPeople, expenses);
  };

  const handleDeletePerson = (id: string) => {
    if (window.confirm('Kişi silinecek. Onaylıyor musunuz?')) {
      const updatedPeople = people.filter(p => p.id !== id);
      setPeople(updatedPeople);
      saveData(updatedPeople, expenses);
    }
  };

  const handleDeleteExpense = (id: string) => {
     if (window.confirm('Harcama kaydı silinecek. Onaylıyor musunuz?')) {
        const updatedExpenses = expenses.filter(e => e.id !== id);
        setExpenses(updatedExpenses);
        saveData(people, updatedExpenses);
     }
  }

  const handleRate = (id: string, feedback: string) => {
    const updatedPeople = people.map(p => {
      if (p.id === id) return { ...p, satisfaction: feedback };
      return p;
    });
    setPeople(updatedPeople);
    saveData(updatedPeople, expenses);
  }

  const handleExportExcel = () => {
    const BOM = "\uFEFF";
    let csvContent = BOM;

    if (activeTab === 'income') {
        const headers = "İsim,Toplam Ödenen,Son Ödeme Tarihi,Not\n";
        const rows = people.map(p => {
            const date = p.lastPaymentDate ? new Date(p.lastPaymentDate).toLocaleDateString('tr-TR') : "-";
            const feedback = p.satisfaction ? p.satisfaction.replace(/"/g, '""') : "-";
            return `"${p.name}","${p.totalPaid}","${date}","${feedback}"`;
        }).join("\n");
        csvContent += headers + rows;
    } else {
        const headers = "Açıklama,Tarih,Tutar\n";
        const rows = expenses.map(e => {
            const date = new Date(e.date).toLocaleDateString('tr-TR');
            return `"${e.description}","${date}","${e.amount}"`;
        }).join("\n");
        csvContent += headers + rows;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KAHVE_${activeTab === 'income' ? 'GELIR' : 'GIDER'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    setGeneratedMessage(null);
    const zeroContributors = people.filter(p => p.totalPaid === 0);
    const topContributors = people.filter(p => p.totalPaid > 0).sort((a,b) => b.totalPaid - a.totalPaid);
    
    const msg = await generateMotivationMessage(zeroContributors, topContributors);
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5] text-[#332B26] font-sans selection:bg-[#FAEDCD] selection:text-[#7F5539]">
      
      {/* Top Bar */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-theme-100 py-2 px-4 flex justify-between items-center text-[10px] uppercase tracking-widest shadow-sm sticky top-0 z-50">
         <span className="text-theme-400 font-bold">İzmir B.B. • Oda 2012</span>
         <div className="flex items-center gap-2">
            {isLoadingData ? (
               <><Loader2 size={12} className="animate-spin text-accent-DEFAULT" /> Yükleniyor</>
            ) : (
               <><Wifi size={12} className="text-[#A5A58D]" /> Sistem Aktif</>
            )}
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-gradient-to-br from-[#D4A373] to-[#B08968] p-4 rounded-3xl text-white shadow-lg shadow-[#D4A373]/30">
                <Coffee size={40} strokeWidth={1.5} />
             </div>
             <div>
                <h2 className="text-xs font-bold text-accent-DEFAULT uppercase tracking-[0.2em] mb-1">
                  Ofis İçi Dayanışma
                </h2>
                <h1 className="text-4xl md:text-5xl font-black text-theme-800 tracking-tight leading-none">
                  Filtre Kahve<br/><span className="text-[#B0A090]">Fonu.</span>
                </h1>
             </div>
          </div>
          
          <div className="flex gap-2">
             <button onClick={() => setShowSettings(!showSettings)} className="px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-white text-theme-500 border border-theme-100 hover:border-accent-DEFAULT hover:text-accent-DEFAULT transition-all flex items-center gap-2">
                <Settings size={16} />
             </button>
             <button onClick={handleExportExcel} className="px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-white text-theme-500 border border-theme-100 hover:border-accent-DEFAULT hover:text-accent-DEFAULT transition-all flex items-center gap-2">
                <Download size={16} /> Excel
             </button>
          </div>
        </header>

        {/* Quote */}
        <QuoteDisplay />

        {/* Settings */}
        {showSettings && (
          <div className="mb-8 bg-white p-6 border border-theme-100 shadow-xl rounded-2xl animate-in fade-in slide-in-from-top-2">
             <div className="flex items-center gap-2 mb-4 pb-2 border-b border-theme-50">
               <Settings size={18} className="text-accent-DEFAULT" />
               <span className="font-bold uppercase tracking-widest text-theme-500 text-sm">Parametreler</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="group">
                  <label className="block text-xs font-bold text-theme-400 uppercase tracking-wider mb-2">Önerilen Ödeme Tutarı (TL)</label>
                  <input type="number" value={coffeePrice} onChange={(e) => setCoffeePrice(Number(e.target.value))} className="w-full bg-[#F9F7F5] border border-theme-200 rounded-xl outline-none py-3 px-4 text-lg font-mono text-theme-800" />
                  <p className="text-[10px] text-theme-300 mt-1">Listede "Ekle" butonuna basıldığında varsayılan olarak gelecek tutar.</p>
               </div>
               <div className="group">
                  <label className="block text-xs font-bold text-theme-400 uppercase tracking-wider mb-2">Aylık Hedef (Gr)</label>
                  <input type="number" value={coffeeConsumption} onChange={(e) => setCoffeeConsumption(Number(e.target.value))} className="w-full bg-[#F9F7F5] border border-theme-200 rounded-xl outline-none py-3 px-4 text-lg font-mono text-theme-800" />
               </div>
            </div>
            <div className="mt-6 flex justify-end">
               <button onClick={() => setShowSettings(false)} className="bg-theme-800 text-white hover:bg-accent-DEFAULT px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors text-xs shadow-lg shadow-theme-200">Kaydet & Kapat</button>
            </div>
          </div>
        )}

        <StatsBoard stats={stats} />

        {/* TABS */}
        <div className="flex gap-4 mb-4 border-b border-theme-200">
            <button 
                onClick={() => setActiveTab('income')}
                className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'income' ? 'border-accent-DEFAULT text-accent-DEFAULT' : 'border-transparent text-theme-400 hover:text-theme-600'}`}
            >
                Ödeme Listesi
            </button>
            <button 
                onClick={() => setActiveTab('expense')}
                className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'expense' ? 'border-[#E5989B] text-[#E5989B]' : 'border-transparent text-theme-400 hover:text-theme-600'}`}
            >
                Harcamalar
            </button>
        </div>

        {/* Dynamic Form & Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
           <div className="lg:col-span-2">
              <form onSubmit={handleAddData} className="flex gap-2">
                 {activeTab === 'income' ? (
                     <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Yeni Kişi Ekle..."
                        className="flex-1 bg-white border border-theme-200 rounded-2xl p-5 text-theme-800 placeholder:text-theme-300 focus:outline-none focus:border-accent-DEFAULT focus:ring-2 focus:ring-accent-light transition-all font-bold text-sm tracking-wide shadow-sm"
                     />
                 ) : (
                     <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={expenseDesc}
                            onChange={(e) => setExpenseDesc(e.target.value)}
                            placeholder="Ne alındı? (Örn: Filtre kağıdı)"
                            className="flex-[2] bg-white border border-theme-200 rounded-2xl p-5 text-theme-800 placeholder:text-theme-300 focus:outline-none focus:border-[#E5989B] focus:ring-2 focus:ring-[#FFE5E5] transition-all font-bold text-sm tracking-wide shadow-sm"
                        />
                         <input
                            type="number"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="Tutar"
                            className="flex-1 bg-white border border-theme-200 rounded-2xl p-5 text-theme-800 placeholder:text-theme-300 focus:outline-none focus:border-[#E5989B] focus:ring-2 focus:ring-[#FFE5E5] transition-all font-bold text-sm tracking-wide shadow-sm"
                        />
                     </div>
                 )}
                 
                 <button 
                    type="submit"
                    className={`text-white px-8 rounded-2xl transition-colors shadow-md shadow-theme-200 ${activeTab === 'income' ? 'bg-theme-800 hover:bg-accent-DEFAULT' : 'bg-[#E5989B] hover:bg-[#D4A373]'}`}
                 >
                    <Plus size={24} />
                 </button>
              </form>
           </div>

           {/* AI Button (Only visible on Income tab or generally available) */}
           <div className="lg:col-span-1">
              <button 
                 onClick={handleGenerateMessage}
                 disabled={isGenerating || people.length === 0}
                 className="w-full h-full flex items-center justify-between px-6 py-4 bg-white border border-theme-200 rounded-2xl hover:border-accent-DEFAULT hover:shadow-md transition-all group disabled:opacity-50"
              >
                 <div className="text-left">
                    <span className="block text-[10px] font-bold uppercase text-theme-400 tracking-widest group-hover:text-accent-DEFAULT transition-colors">
                       Yapay Zeka
                    </span>
                    <span className="font-bold text-theme-600 text-sm">Mesaj Oluştur</span>
                 </div>
                 {isGenerating ? <Loader2 className="animate-spin text-accent-DEFAULT" /> : <Sparkles size={20} className="text-[#E5989B] group-hover:text-[#D4A373]" />}
              </button>
           </div>
        </div>

        {/* AI Output */}
        {generatedMessage && (
           <div className="mb-8 bg-[#FFF0F3] text-[#6D3B3E] p-8 rounded-2xl border border-[#FFCCD5] relative overflow-hidden animate-in zoom-in-95">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                 <Sparkles size={120} />
              </div>
              <p className="font-medium text-xl font-serif italic relative z-10 leading-relaxed">"{generatedMessage}"</p>
           </div>
        )}

        {/* Content List */}
        {activeTab === 'income' ? (
            <PersonList 
                people={people} 
                onAddPayment={handleAddPayment} 
                onDelete={handleDeletePerson}
                onRate={handleRate}
                defaultAmount={coffeePrice}
            />
        ) : (
            <ExpenseList 
                expenses={expenses}
                onDelete={handleDeleteExpense}
            />
        )}

        <footer className="mt-16 border-t border-theme-200 pt-8 text-center">
           <div className="inline-flex items-center justify-center p-3 bg-white rounded-full mb-4 shadow-sm border border-theme-50">
              <Coffee size={20} className="text-accent-DEFAULT" />
           </div>
           <p className="text-xs font-bold text-theme-400 uppercase tracking-[0.2em]">
              İzmir Büyükşehir Belediyesi • Oda 2012
           </p>
           <p className="text-[10px] text-theme-300 mt-2">Afiyet Olsun.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;