-- Kivia Partners - Supabase 테이블 생성 SQL
-- Supabase > SQL Editor 에 붙여넣고 실행하세요

DROP TABLE IF EXISTS inquiries CASCADE;

CREATE TABLE inquiries (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz NOT NULL DEFAULT now(),

  -- 사업자 기본 정보
  business_name     text        NOT NULL,
  business_type     text        NOT NULL,
  email             text        NOT NULL,
  phone             text,

  -- 광고 상세 정보
  ad_page_url       text,
  additional_detail text,
  free_text         text,

  -- QnA 원본 (JSON)
  qna_answers       jsonb       NOT NULL DEFAULT '{}',

  -- AI 분류 결과
  category          text,
  priority          text,
  suitability       text,
  pid               text,
  ai_summary        text,

  -- 관리
  status            text        NOT NULL DEFAULT '신규'
);

ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
