import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

export interface AIClassificationResult {
  category: string;
  priority: string;
  suitability: string;
  ai_summary: string;
  pid?: string;
}

export async function classifyInquiry(
  qna: Record<string, string>,
  freeText: string
): Promise<AIClassificationResult> {
  if (!apiKey) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. .env.local에 VITE_GEMINI_API_KEY를 입력해 주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
당신은 KB보험 파트너 플랫폼 'Kivia'의 AI 분류 시스템입니다.
사용자의 QnA 응답과 자유 문의 내용을 바탕으로 다음 형식의 JSON으로만 응답하세요.
마크다운 코드블록(json 등)을 사용하지 말고 순수 JSON만 출력하세요.

[분류 규칙]
1. category: '광고등록' | '수수료' | '심의' | '개발' | '1인샵' | '기타' 중 선택
2. priority: '높음' | '보통' | '낮음' 중 선택
3. suitability:
   - '적격': 사업자등록 있음(예) + 개발조직 있거나 1인샵 가이드 동의
   - '부적격': 사업자 없음(아니오)
   - '추가검토': 정보 미흡
4. ai_summary: 1문장 60자 이내 요약
5. pid: suitability가 '적격'이면 'KB-PID-' + 랜덤 6자리 숫자, 아니면 null

[입력]
QnA: ${JSON.stringify(qna)}
문의: ${freeText || "(없음)"}

[출력 예시]
{"category":"광고등록","priority":"높음","suitability":"적격","ai_summary":"신규 펫보험 광고 매체 등록 요청","pid":"KB-PID-482910"}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const text = response.text ?? "";

    // JSON 추출 (코드 블록 포함 시 제거)
    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 응답 형식이 올바르지 않습니다: " + text.slice(0, 200));

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini AI Classification Error:", error);
    throw error;
  }
}
