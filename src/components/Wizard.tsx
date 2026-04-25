import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Send, Loader2 } from 'lucide-react';
import { classifyInquiry } from '../lib/gemini';
import { supabase } from '../lib/supabase';

const QUESTIONS = [
  { id: 'q1', text: '사업자등록을 보유하고 있습니까?', options: ['예', '아니오'] },
  { id: 'q2', text: '사업자 형태는 무엇입니까?', options: ['개인', '법인', '1인샵'] },
  { id: 'q3', text: '월 트래픽 수준은?', options: ['1만 미만', '1~10만', '10~100만', '100만 이상'] },
  { id: 'q4', text: '보험 광고 판매 경험이 있습니까?', options: ['있음', '없음'] },
  { id: 'q5', text: '내부 개발조직이 있습니까?', options: ['있음 (API 연동)', '없음 (가이드 필요)'] },
];

// Q1~Q5(0~4) → 상세입력(5) → 파트너십신청(6)
const STEP_LABELS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', '상세입력', '파트너십신청'];
const TOTAL_STEPS = STEP_LABELS.length;
const STEP_DETAIL = QUESTIONS.length;
const STEP_INFO   = QUESTIONS.length + 1;

function makeFallbackResult(qna: Record<string, string>, freeText: string) {
  const hasReg = qna['q1'] === '예';
  const hasDev = qna['q5']?.includes('있음');
  const suitability = !hasReg ? '부적격' : hasDev ? '적격' : '추가검토';
  return {
    category: '광고등록',
    priority: '보통' as const,
    suitability,
    ai_summary: (freeText || '보험 파트너십 문의').slice(0, 60),
    pid: suitability === '적격'
      ? `KB-AID-${Math.floor(100000 + Math.random() * 900000)}`
      : undefined,
  };
}

const Wizard: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '', businessType: '개인',
    email: '', phone: '',
    adPageUrl: '', additionalDetail: '', freeText: '',
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.email) {
      alert('사업자명과 이메일은 필수 항목입니다.');
      return;
    }
    setLoading(true);
    try {
      let aiResult;
      try { aiResult = await classifyInquiry(answers, formData.freeText); }
      catch { aiResult = makeFallbackResult(answers, formData.freeText); }

      if (supabase) {
        const { error } = await supabase.from('inquiries').insert([{
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
        if (error) throw error;
      }

      alert(
        `✅ 파트너십 신청이 접수되었습니다!\n\n` +
        `분류: ${aiResult.category}  |  적격여부: ${aiResult.suitability}\n` +
        (aiResult.pid ? `광고ID: ${aiResult.pid}\n` : '') +
        `요약: ${aiResult.ai_summary}`
      );
      onSuccess();
    } catch (err: any) {
      alert(`오류가 발생했습니다.\n${err?.message ?? '잠시 후 다시 시도해 주세요.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl animate-fade-in">
      <StepDots current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

      {/* Q1~Q5 */}
      {step < QUESTIONS.length && (
        <div className="animate-fade-in">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
            {step + 1} / {QUESTIONS.length}
          </span>
          <h2 className="text-xl font-bold text-white mt-2 mb-6">{QUESTIONS[step].text}</h2>
          <div className="space-y-3">
            {QUESTIONS[step].options.map(opt => (
              <button
                key={opt}
                onClick={() => { setAnswers({ ...answers, [QUESTIONS[step].id]: opt }); setStep(s => s + 1); }}
                className={`w-full p-4 text-left rounded-2xl border transition-all duration-300 ${
                  answers[QUESTIONS[step].id] === opt
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-100'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >{opt}</button>
            ))}
          </div>
        </div>
      )}

      {/* 상세입력 */}
      {step === STEP_DETAIL && (
        <div className="animate-fade-in space-y-5">
          <h2 className="text-xl font-bold text-white">광고 상세 정보</h2>
          <Field label="광고 노출 페이지 URL">
            <input
              type="url"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 outline-none transition-all"
              placeholder="https://example.com"
              value={formData.adPageUrl}
              onChange={e => setFormData({ ...formData, adPageUrl: e.target.value })}
            />
          </Field>
          <Field label="추가 상세 내용">
            <textarea
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-slate-200 focus:border-cyan-500 outline-none transition-all resize-none"
              placeholder="예) 추가 개발, API 연동, 배너 제작 등"
              value={formData.additionalDetail}
              onChange={e => setFormData({ ...formData, additionalDetail: e.target.value })}
            />
          </Field>
          <Field label="자유 문의">
            <textarea
              className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-4 text-slate-200 focus:border-cyan-500 outline-none transition-all resize-none"
              placeholder="기타 문의사항"
              maxLength={1000}
              value={formData.freeText}
              onChange={e => setFormData({ ...formData, freeText: e.target.value })}
            />
          </Field>
        </div>
      )}

      {/* 파트너십신청 (기본정보) */}
      {step === STEP_INFO && (
        <div className="animate-fade-in space-y-5">
          <h2 className="text-xl font-bold text-white">연락처 정보</h2>
          <div className="space-y-4">
            <InputGroup label="사업자명 (필수)" value={formData.businessName}
              onChange={(v: string) => setFormData({ ...formData, businessName: v })} placeholder="상호명" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="사업자 형태">
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 outline-none transition-all"
                  value={formData.businessType}
                  onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                >
                  <option value="개인">개인</option>
                  <option value="법인">법인</option>
                  <option value="1인샵">1인샵</option>
                </select>
              </Field>
              <InputGroup label="이메일 (필수)" value={formData.email}
                onChange={(v: string) => setFormData({ ...formData, email: v })}
                placeholder="example@mail.com" type="email" />
            </div>
            <InputGroup label="연락처" value={formData.phone}
              onChange={(v: string) => setFormData({ ...formData, phone: v })} placeholder="010-0000-0000" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={18} /> 이전
          </button>
        )}
        <div className="ml-auto">
          {step === STEP_DETAIL && (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-7 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all">
              다음 <ChevronRight size={18} />
            </button>
          )}
          {step === STEP_INFO && (
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50">
              {loading ? <><Loader2 className="animate-spin" size={18} /> 처리 중...</> : <><Send size={18} /> 파트너십 신청</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 outline-none transition-all"
      placeholder={placeholder}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  </Field>
);

/* 도트 진행 인디케이터 */
const StepDots: React.FC<{ current: number; total: number; labels: string[] }> = ({ current, total, labels }) => (
  <div className="mb-10 select-none">
    <div className="flex items-center justify-between">
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${
                isActive ? 'w-5 h-5 bg-cyan-400 shadow-lg shadow-cyan-500/60 ring-4 ring-cyan-500/20'
                : isDone  ? 'w-4 h-4 bg-cyan-500'
                : 'w-3 h-3 bg-white/15'
              }`}>
                {isDone && (
                  <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
                    <polyline points="1,6 4,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isActive && <span className="w-2 h-2 rounded-full bg-white" />}
                {isActive && <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30" />}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${
                isActive ? 'text-cyan-400' : isDone ? 'text-slate-400' : 'text-slate-600'
              }`}>{labels[i]}</span>
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-px mx-1 mb-4 relative overflow-hidden bg-white/10 rounded-full">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: isDone ? '100%' : isActive ? '50%' : '0%' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
    <p className="text-center text-xs text-slate-600 mt-2">
      <span className="text-cyan-400 font-semibold">{current + 1}</span> / {total}
      {current < total - 1 && <span className="ml-1">— 다음: {labels[current + 1]}</span>}
    </p>
  </div>
);

export default Wizard;
