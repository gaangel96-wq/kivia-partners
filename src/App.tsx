import React, { useState } from 'react';
import { PenTool, Database } from 'lucide-react';
import Wizard from './components/Wizard';
import InquiryList from './components/InquiryList';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'list'>('input');

  return (
    <div className="min-h-screen text-slate-200 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black italic text-xl">K</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-white italic">Kivia</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent ml-1">Partners</span>
            </h1>
          </div>

          <nav className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'input' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool size={16} /> 문의 접수
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'list' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database size={16} /> 내역 관리
            </button>
          </nav>
        </header>

        {/* Main */}
        <main>
          {activeTab === 'input' ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">KB보험 파트너십</h2>
                <p className="text-slate-500 text-sm">파트너십 자격 진단 및 신청을 시작합니다.</p>
              </div>
              <Wizard onSuccess={() => setActiveTab('list')} />
            </div>
          ) : (
            <InquiryList />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-20 py-6 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest">
          <span>© 2026 Kivia Partners</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Terms</a>
            <a href="#" className="hover:text-slate-400">Privacy</a>
          </div>
        </footer>
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default App;
