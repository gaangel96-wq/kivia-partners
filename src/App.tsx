import React, { useState } from 'react';
import { LayoutDashboard, PenTool, Database, Link2 } from 'lucide-react';
import Wizard from './components/Wizard';
import InquiryList from './components/InquiryList';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'list'>('input');

  return (
    <div className="min-h-screen p-4 md:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            {/* Logo: 점과 점이 이어지는 파트너십 아이콘 */}
            <div className="relative w-16 h-14 flex items-center justify-center">
              {/* 왼쪽 원 - KB보험 노드 */}
              <div className="absolute left-0 w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/40 flex items-center justify-center z-10">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                  {/* 중심 점 */}
                  <circle cx="10" cy="10" r="3" fill="white"/>
                  {/* 주변 작은 점들 */}
                  <circle cx="10" cy="3" r="1.5" fill="white" opacity="0.6"/>
                  <circle cx="17" cy="10" r="1.5" fill="white" opacity="0.6"/>
                  <circle cx="10" cy="17" r="1.5" fill="white" opacity="0.6"/>
                  {/* 연결선 */}
                  <line x1="10" y1="7" x2="10" y2="4.5" stroke="white" strokeWidth="1" opacity="0.5"/>
                  <line x1="13" y1="10" x2="15.5" y2="10" stroke="white" strokeWidth="1" opacity="0.5"/>
                  <line x1="10" y1="13" x2="10" y2="15.5" stroke="white" strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>
              {/* 가운데 연결선 */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <svg viewBox="0 0 64 20" width="64" height="20" fill="none">
                  {/* 왼쪽 점 */}
                  <circle cx="14" cy="10" r="2.5" fill="#22d3ee"/>
                  {/* 가운데 점들 */}
                  <circle cx="24" cy="10" r="1.5" fill="white" opacity="0.5"/>
                  <circle cx="32" cy="10" r="2" fill="white" opacity="0.8"/>
                  <circle cx="40" cy="10" r="1.5" fill="white" opacity="0.5"/>
                  {/* 오른쪽 점 */}
                  <circle cx="50" cy="10" r="2.5" fill="#818cf8"/>
                  {/* 연결선 */}
                  <line x1="16.5" y1="10" x2="22.5" y2="10" stroke="white" strokeWidth="1" strokeDasharray="2 1" opacity="0.4"/>
                  <line x1="25.5" y1="10" x2="30" y2="10" stroke="white" strokeWidth="1" opacity="0.4"/>
                  <line x1="34" y1="10" x2="38.5" y2="10" stroke="white" strokeWidth="1" opacity="0.4"/>
                  <line x1="41.5" y1="10" x2="47.5" y2="10" stroke="white" strokeWidth="1" strokeDasharray="2 1" opacity="0.4"/>
                </svg>
              </div>
              {/* 오른쪽 원 - 광고사업자 노드 */}
              <div className="absolute right-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40 flex items-center justify-center z-10">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                  {/* 중심 점 */}
                  <circle cx="10" cy="10" r="3" fill="white"/>
                  {/* 주변 작은 점들 */}
                  <circle cx="3" cy="10" r="1.5" fill="white" opacity="0.6"/>
                  <circle cx="10" cy="3" r="1.5" fill="white" opacity="0.6"/>
                  <circle cx="10" cy="17" r="1.5" fill="white" opacity="0.6"/>
                  {/* 연결선 */}
                  <line x1="7" y1="10" x2="4.5" y2="10" stroke="white" strokeWidth="1" opacity="0.5"/>
                  <line x1="10" y1="7" x2="10" y2="4.5" stroke="white" strokeWidth="1" opacity="0.5"/>
                  <line x1="10" y1="13" x2="10" y2="15.5" stroke="white" strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                <span className="text-white italic">Kivia</span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-black ml-1">Partners</span>
              </h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 w-full md:w-auto">
            <TabButton 
              active={activeTab === 'input'} 
              onClick={() => setActiveTab('input')}
              icon={<PenTool size={18} />}
              label="문의 접수"
            />
            <TabButton 
              active={activeTab === 'list'} 
              onClick={() => setActiveTab('list')}
              icon={<Database size={18} />}
              label="내역 관리"
            />
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="relative min-h-[600px]">
          {activeTab === 'input' ? (
            <div className="max-w-4xl mx-auto py-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">
                  KB보험과 <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">함께 성장</span>하세요
                </h2>
              </div>
              <Wizard onSuccess={() => setActiveTab('list')} />
            </div>
          ) : (
            <div className="py-6">
              <InquiryList />
            </div>
          )}
        </main>

        <footer className="mt-16 pt-6 border-t border-white/5 flex justify-between items-center text-slate-600">
          <span className="text-xs">Kivia Partners v1.0</span>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-slate-400 transition-colors">이용약관</a>
            <a href="#" className="hover:text-slate-400 transition-colors">개인정보처리방침</a>
          </div>
        </footer>
      </div>

      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 w-full md:w-auto justify-center ${
      active 
      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
      : 'text-slate-400 hover:text-slate-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
