import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gefmiytwqwvryiqrtbru.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isUrlValid = (url: string) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  } catch {
    return false;
  }
};

if (!isUrlValid(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았거나 유효하지 않습니다. Vercel 환경 변수를 확인해 주세요.');
}

// 유효하지 않은 경우 클라이언트를 생성하지 않고 null을 반환하도록 처리
export const supabase = (isUrlValid(supabaseUrl) && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); 

/**
 * PRD에 정의된 inquiries 테이블 스키마 예시:
 * 
 * create table inquiries (
 *   id uuid default uuid_generate_v4() primary key,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   business_name text not null,
 *   business_type text not null,
 *   email text not null,
 *   phone text,
 *   qna_answers jsonb not null,
 *   free_text text,
 *   category text,
 *   priority text,
 *   suitability text,
 *   pid text,
 *   ai_summary text,
 *   status text default '신규'
 * );
 */
