import { config } from '../constants/config';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIAnalysisResult {
  summary: string;
  growth_assessment: string;
  feeding_insights: string;
  recommendations: string[];
  alerts: string[];
}

export const aiService = {
  async analyzeChildData(
    childAge: number,
    childGender: string,
    records: unknown[]
  ): Promise<AIAnalysisResult> {
    const systemPrompt = `Bạn là một trợ lý AI chăm sóc trẻ em. Phân tích dữ liệu theo dõi của trẻ và đưa ra lời khuyên bằng tiếng Việt. Hãy quan tâm, chuyên nghiệp. Luôn nhắc nhở phụ huynh tham khảo ý kiến bác sĩ cho các vấn đề nghiêm trọng.`;

    const userPrompt = `Phân tích dữ liệu theo dõi cho trẻ ${childAge} tháng tuổi, giới tính ${childGender}.

Dữ liệu theo dõi:
${JSON.stringify(records, null, 2)}

Hãy phân tích và đưa ra:
1. Tóm tắt tổng quát
2. Đánh giá tăng trưởng
3. Nhận xét về chế độ ăn
4. Khuyến nghị (nếu có)
5. Cảnh báo (nếu có)

Trả lời theo format JSON:
{
  "summary": "...",
  "growth_assessment": "...",
  "feeding_insights": "...",
  "recommendations": ["...", "..."],
  "alerts": ["...", "..."]
}`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.groq.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      // Parse JSON from response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If parsing fails, return the content as summary
      }

      return {
        summary: content || 'Không thể phân tích',
        growth_assessment: '',
        feeding_insights: '',
        recommendations: [],
        alerts: [],
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  },

  async chatWithDoctor(
    messages: { role: string; content: string }[],
    childAge?: number
  ): Promise<string> {
    const systemPrompt = `Bạn là Dr. Baby - trợ lý bác sĩ nhi khoa. Bạn cung cấp hướng dẫn sức khỏe chung cho trẻ dưới 5 tuổi. Luôn nhắc nhở người dùng tham khảo ý kiến bác sĩ thực cho các vấn đề nghiêm trọng. Trả lời bằng tiếng Việt, quan tâm và chuyên nghiệp.`;

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }));

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.groq.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },
};
