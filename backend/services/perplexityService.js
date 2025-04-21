const axios = require('axios');
const { handleError } = require('../utils/errorHandler');

/**
 * Perplexity AI API 서비스
 */
class PerplexityService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai';
    
    // API 키가 없으면 경고 표시
    if (!this.apiKey) {
      console.warn('PERPLEXITY_API_KEY가 설정되지 않았습니다. Perplexity AI 기능이 작동하지 않을 수 있습니다.');
    }
  }

  /**
   * Perplexity API 호출 설정
   * @returns {object} axios 인스턴스
   */
  getApiClient() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 날씨 정보와 사용자 선호도에 따른 옷차림 추천을 가져옵니다.
   * @param {object} weatherData - 날씨 정보 (온도, 습도, 강수량 등)
   * @param {object} userPreferences - 사용자 선호도 (스타일, 성별, 나이 등)
   * @returns {Promise<object>} 옷차림 추천 결과
   */
  async getClothingRecommendation(weatherData, userPreferences) {
    try {
      if (!this.apiKey) {
        throw new Error('PERPLEXITY_API_KEY가 설정되지 않았습니다.');
      }

      const client = this.getApiClient();
      
      // 사용자 선호도와 날씨 정보를 결합한 쿼리 생성
      const gender = userPreferences.gender || '중성';
      const style = userPreferences.style || '캐주얼';
      const ageGroup = userPreferences.ageGroup || '성인';
      
      // 프롬프트 생성
      const prompt = `현재 날씨: ${weatherData.temperature}°C, 습도 ${weatherData.humidity}%, 
      ${weatherData.weatherDescription}일 때, 
      ${gender}의 ${ageGroup}을 위한 ${style} 스타일 옷차림을 추천해주세요. 
      오늘의 날씨에 적합한 상의, 하의, 외투, 신발, 액세서리를 구체적으로 추천해주세요. 
      그리고 선택한 옷들이 날씨에 적합한 이유도 간략하게 설명해주세요.
      답변은 다음 형식으로 해주세요:
      {
        "상의": "추천 상의와 이유",
        "하의": "추천 하의와 이유",
        "외투": "추천 외투와 이유",
        "신발": "추천 신발과 이유",
        "액세서리": "추천 액세서리와 이유",
        "코디 팁": "전체 코디 팁"
      }
      JSON 형식으로 응답해주세요.`;

      const response = await client.post('/api/chat/completions', {
        model: 'pplx-7b-online',
        messages: [
          { role: 'system', content: '당신은 패션과 날씨에 대한 전문가로, 날씨에 적합한 옷차림을 추천해주는 AI 비서입니다.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024
      });

      // 응답 파싱
      const assistantResponse = response.data.choices[0].message.content;
      try {
        // JSON 형식으로 파싱 시도
        const jsonMatch = assistantResponse.match(/```json\n([\s\S]*?)\n```/) || 
                          assistantResponse.match(/{[\s\S]*?}/);
        
        const jsonContent = jsonMatch 
          ? jsonMatch[1] || jsonMatch[0]
          : assistantResponse;
          
        const parsedResponse = JSON.parse(jsonContent);
        
        return {
          success: true,
          recommendation: parsedResponse,
          weatherData: weatherData
        };
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트 응답 그대로 반환
        console.error('JSON 파싱 오류:', parseError);
        return {
          success: true,
          recommendation: {
            text: assistantResponse
          },
          weatherData: weatherData
        };
      }
    } catch (error) {
      console.error('Perplexity API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 현재 패션 트렌드 정보를 가져옵니다.
   * @param {string} query - 검색 쿼리 (예: "2024년 여름 패션 트렌드")
   * @returns {Promise<object>} 패션 트렌드 정보
   */
  async getFashionTrends(query) {
    try {
      if (!this.apiKey) {
        throw new Error('PERPLEXITY_API_KEY가 설정되지 않았습니다.');
      }

      const client = this.getApiClient();
      
      const prompt = `${query}에 대해 최신 정보를 제공해주세요. 
      주요 트렌드, 인기 스타일, 색상, 소재 등에 대한 정보와 어떻게 이 트렌드를 일상 생활에 적용할 수 있는지에 대한 
      조언도 함께 제공해주세요. 답변은 다음 형식으로 구조화해주세요:
      {
        "주요 트렌드": ["트렌드1", "트렌드2", ...],
        "인기 스타일": ["스타일1", "스타일2", ...],
        "트렌드 색상": ["색상1", "색상2", ...],
        "인기 소재": ["소재1", "소재2", ...],
        "스타일링 팁": ["팁1", "팁2", ...],
        "요약": "전체 트렌드에 대한 간략한 요약"
      }
      JSON 형식으로 응답해주세요.`;

      const response = await client.post('/api/chat/completions', {
        model: 'pplx-7b-online',
        messages: [
          { role: 'system', content: '당신은 패션 트렌드 분석가로, 최신 패션 트렌드에 대한 깊은 이해를 가지고 있습니다.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024
      });

      // 응답 파싱
      const assistantResponse = response.data.choices[0].message.content;
      try {
        // JSON 형식으로 파싱 시도
        const jsonMatch = assistantResponse.match(/```json\n([\s\S]*?)\n```/) || 
                          assistantResponse.match(/{[\s\S]*?}/);
        
        const jsonContent = jsonMatch 
          ? jsonMatch[1] || jsonMatch[0]
          : assistantResponse;
          
        const parsedResponse = JSON.parse(jsonContent);
        
        return {
          success: true,
          trends: parsedResponse
        };
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트 응답 그대로 반환
        console.error('JSON 파싱 오류:', parseError);
        return {
          success: true,
          trends: {
            text: assistantResponse
          }
        };
      }
    } catch (error) {
      console.error('Perplexity API 호출 오류:', error);
      throw error;
    }
  }
}

module.exports = new PerplexityService(); 