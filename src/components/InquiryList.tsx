import React, { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const InquiryList: React.FC = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setInquiries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const downloadCSV = () => {
    if (inquiries.length === 0) return;

    const headers = ['등록일시', '사업자명', '형태', '이메일', '카테고리', '적격여부', 'PID', '요약'];
    const rows = inquiries.map(iq => [
      new Date(iq.created_at).toLocaleString(),
      iq.business_name,
      iq.business_type,
      iq.email,
      iq.category,
      iq.suitability,
      iq.pid || '-',
      iq.ai_summary
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');

    // 한글 깨짐 방지용 BOM
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kivia-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          문의 내역 관리
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-medium">
            Total {inquiries.length}
          </span>
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={fetchInquiries}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
            title="새로고침"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-all border border-white/10"
          >
            <Download size={16} /> CSV 다운로드
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <th className="px-6 py-4">일시</th>
              <th className="px-6 py-4">사업자명</th>
              <th className="px-6 py-4">카테고리</th>
              <th className="px-6 py-4">긴급도</th>
              <th className="px-6 py-4">적격여부</th>
              <th className="px-6 py-4">PID</th>
              <th className="px-6 py-4">AI 요약</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-white/5">
            {inquiries.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  접수된 문의 내역이 없습니다.
                </td>
              </tr>
            )}
            {inquiries.map((iq) => (
              <tr key={iq.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 text-slate-400 font-mono whitespace-nowrap">
                  {new Date(iq.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-200">{iq.business_name}</div>
                  <div className="text-[10px] text-slate-500">{iq.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge type={iq.category} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge type={iq.priority} />
                </td>
                <td className="px-6 py-4">
                  <SuitabilityBadge type={iq.suitability} />
                </td>
                <td className="px-6 py-4 font-mono text-cyan-400">
                  {iq.pid || '-'}
                </td>
                <td className="px-6 py-4 text-slate-400 max-w-xs truncate group-hover:whitespace-normal transition-all" title={iq.ai_summary}>
                  {iq.ai_summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Badge = ({ type }: any) => {
  const colors: any = {
    '광고등록': 'bg-blue-500/20 text-blue-400',
    '수수료': 'bg-purple-500/20 text-purple-400',
    '심의': 'bg-amber-500/20 text-amber-400',
    '개발': 'bg-cyan-500/20 text-cyan-400',
    '1인샵': 'bg-pink-500/20 text-pink-400',
    '기타': 'bg-slate-500/20 text-slate-400',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[type] || colors['기타']}`}>{type}</span>;
};

const PriorityBadge = ({ type }: any) => {
  const colors: any = {
    '높음': 'text-red-400',
    '보통': 'text-amber-400',
    '낮음': 'text-slate-400',
  };
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${colors[type]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${type === '높음' ? 'bg-red-400' : type === '보통' ? 'bg-amber-400' : 'bg-slate-400'}`} />
      {type}
    </div>
  );
};

const SuitabilityBadge = ({ type }: any) => {
  const colors: any = {
    '적격': 'bg-green-500/20 text-green-400 border-green-500/30',
    '추가검토': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    '부적격': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${colors[type] || colors['부적격']}`}>{type}</span>;
};

export default InquiryList;
