import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { classifyInquiry } from '../lib/gemini';
import { supabase } from '../lib/supabase';

/* ── 헬퍼 컴포넌트 (상단 정의로 호이스팅 방지) ── */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs text-slate-400 font-medium">{label}</label>
    {children}
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <Field label={label}>
    <input
      type={type}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600"
      placeholder={placeholder}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  </Field>
);

const StepDots = ({ current, total, labels }: any) => (
  <div className="mb-8 select-none">
    <div className="flex items-center justify-between">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= current ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`} />
            <span className={`text-[8px] font-bold ${i === current ? 'text-cyan-400' : 'text-slate-600'}`}>{labels[i]}</span>
          </div>
          {i < total - 1 && <div className={`flex-1 h-[1px] mx-1 mb-3 ${i < current ? 'bg-cyan-500/50' : 'bg-white/5'}`} />}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const QUESTIONS = [
  { id: 'q1', text: '사업자등록을 보유하고 있습니까?', options: ['예', '아니오'] },
  { id: 'q2', text: '사업자 형태는 무엇입니까?', options: ['개인', '법인', '1인샵'] },
  { id: 'q3', text: '월 트래픽 수준은?', options: ['1만 미만', '1~10만', '10~100만', '100만 이상'] },
  { id: 'q4', text: '보험 광고 판매 경험이 있습니까?', options: ['있음', '없음'] },
  { id: 'q5', text: '내부 개발조직이 있습니까?', options: ['있음 (API 연동)', '없음 (가이드 필요)'] },
];

const STEP_LABELS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', '상세', '신청'];

const Wizard: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '', businessType: '개인', email: '', phone: '',
    adPageUrl: '', additionalDetail: '', freeText: '',
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const TOTAL_STEPS = STEP_LABELS.length;
  const STEP_DETAIL = 5;
  const STEP_INFO = 6;

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.email) {
      alert('사업자명과 이메일은 필수입니다.');
      return;
    }
    setLoading(true);
    try {
      let aiResult;
      try {
        aiResult = await classifyInquiry(answers, formData.freeText);
      } catch {
        aiResult = { category: '기타', priority: '보통', suitability: '추가검토', ai_summary: formData.freeText || '파트너십 문의' };
      }

      if (supabase) {
        await supabase.from('inquiries').insert([{
          business_name: formData.businessName,
          business_type: formData.businessType,
          email: formData.email,
          phone: formData.phone,
          ad_page_url: formData.adPageUrl,
          additional_detail: formData.additionalDetail,
          free_text: formData.freeText,
          qna_answers: answers,
          ...aiResult,
        }]);
      }
      alert('신청이 접수되었습니다.');
      onSuccess();
    } catch (e: any) {
      alert('오류가 발생했습니다: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10">
      <StepDots current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

      {step < 5 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-6">{QUESTIONS[step].text}</h2>
          <div className="grid gap-3">
            {QUESTIONS[step].options.map(opt => (
              <button
                key={opt}
                onClick={() => { setAnswers({...answers, [QUESTIONS[step].id]: opt}); setStep(s => s + 1); }}
                className="w-full p-4 text-left rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
              >{opt}</button>
            ))}
          </div>
        </div>
      )}

      {step === STEP_DETAIL && (
        <div className="animate-fade-in space-y-4">
          <InputGroup label="광고 노출 URL" value={formData.adPageUrl} onChange={(v:any)=>setFormData({...formData, adPageUrl:v})} placeholder="https://" />
          <Field label="추가 상세">
            <textarea className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-slate-200 outline-none" value={formData.additionalDetail} onChange={e=>setFormData({...formData, additionalDetail:e.target.value})} />
          </Field>
          <Field label="자유 문의">
            <textarea className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-4 text-slate-200 outline-none" value={formData.freeText} onChange={e=>setFormData({...formData, freeText:e.target.value})} />
          </Field>
        </div>
      )}

      {step === STEP_INFO && (
        <div className="animate-fade-in space-y-4">
          <InputGroup label="사업자명 (필수)" value={formData.businessName} onChange={(v:any)=>setFormData({...formData, businessName:v})} />
          <InputGroup label="이메일 (필수)" value={formData.email} onChange={(v:any)=>setFormData({...formData, email:v})} type="email" />
          <InputGroup label="연락처" value={formData.phone} onChange={(v:any)=>setFormData({...formData, phone:v})} />
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 0 && <button onClick={()=>setStep(s=>s-1)} className="text-slate-500 hover:text-white px-4 py-2">이전</button>}
        <div className="ml-auto">
          {step === STEP_DETAIL && <button onClick={()=>setStep(6)} className="bg-cyan-600 px-6 py-2 rounded-xl font-bold">다음</button>}
          {step === STEP_INFO && (
            <button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 신청하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wizard;
