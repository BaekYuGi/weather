/**
 * Perplexity API를 활용한 AI 서비스
 * 날씨와 의류 추천에 특화된 대화형 AI 기능을 제공합니다.
 */

const axios = require('axios');
const dotenv = require('dotenv');

// 환경변수 설정
dotenv.config();

/**
 * Perplexity API를 사용하여 의류 추천 응답을 생성합니다.
 * @param {object} weatherData - 날씨 데이터
 * @param {object} userPreferences - 사용자 선호도 정보
 * @param {string} message - 사용자 메시지
 * @returns {object} - 응답 결과
 */
const getClothingRecommendation = async (weatherData, userPreferences, message) => {
  try {
    // API 키 확인
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API 키가 설정되지 않았습니다.');
    }
    
    // 날씨 및 사용자 정보 정리
    const prompt = constructPrompt(weatherData, userPreferences, message);
    
    // API 호출
    const response = await callPerplexityAPI(prompt);
    
    // 응답 구조화
    return structureResponse(response, weatherData);
  } catch (error) {
    console.error('Perplexity AI 서비스 오류:', error);
    throw error;
  }
};

/**
 * API 요청을 위한 프롬프트를 구성합니다.
 * @param {object} weatherData - 날씨 데이터
 * @param {object} userPreferences - 사용자 선호도
 * @param {string} message - 사용자 메시지
 * @returns {string} - 구성된 프롬프트
 */
const constructPrompt = (weatherData, userPreferences, message) => {
  const { temperature, weather, humidity, windSpeed } = weatherData;
  const { style = '캐주얼', gender = '무관', purpose = '일상' } = userPreferences;
  
  return `
당신은 패션 스타일리스트입니다. 날씨와 개인 선호도에 기반하여 의류를 추천해주세요.

현재 날씨 정보:
- 기온: ${temperature}°C
- 날씨 상태: ${weather}
- 습도: ${humidity}%
- 풍속: ${windSpeed}m/s

사용자 정보:
- 선호 스타일: ${style}
- 성별: ${gender}
- 목적: ${purpose}
- 기타 선호도: ${userPreferences.preferences || '없음'}

사용자 요청: ${message || '오늘 날씨에 맞는 옷을 추천해주세요.'}

다음 형식으로 응답해주세요:
1. 간단한 날씨 분석과 날씨에 맞는 전반적인 의류 특성을 설명
2. 상의 추천 (목록 형태로)
3. 하의 추천 (목록 형태로)
4. 아우터 추천 (필요한 경우, 목록 형태로)
5. 액세서리 추천 (필요한 경우, 목록 형태로)
6. 스타일링 팁 (2-3가지)
`;
};

/**
 * Perplexity API를 호출합니다.
 * @param {string} prompt - 구성된 프롬프트
 * @returns {string} - AI 응답
 */
const callPerplexityAPI = async (prompt) => {
  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3-sonar-small-32k',
      messages: [
        {
          role: 'system',
          content: '당신은 패션과 의류 추천에 특화된 전문가입니다. 응답은 간결하고 실용적이어야 합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('API 응답이 유효하지 않습니다.');
    }
  } catch (error) {
    console.error('Perplexity API 호출 오류:', error);
    throw error;
  }
};

/**
 * 응답을 구조화된 형식으로 변환합니다.
 * @param {string} response - API 응답 텍스트
 * @param {object} weatherData - 날씨 데이터
 * @returns {object} - 구조화된 응답
 */
const structureResponse = (response, weatherData) => {
  // 정규식을 사용하여 응답의 각 섹션 추출
  const topMatch = response.match(/상의[^\n]*?:([^\n]*)/i);
  const bottomMatch = response.match(/하의[^\n]*?:([^\n]*)/i);
  const outerMatch = response.match(/아우터[^\n]*?:([^\n]*)/i);
  const accessoryMatch = response.match(/액세서리[^\n]*?:([^\n]*)/i);
  const tipsMatch = response.match(/팁[^\n]*?:([^\n]*)/gi);
  
  // 아이템 목록 변환 (쉼표로 구분된 텍스트를 배열로)
  const extractItems = (match) => {
    if (match && match[1]) {
      return match[1].split(',').map(item => {
        // 목록 번호와 불필요한 기호 제거
        return item.replace(/^\s*\d+\.\s*|\*\s*|-\s*|•\s*/g, '').trim();
      }).filter(item => item);
    }
    return [];
  };
  
  // 팁 추출
  const extractTips = (matches) => {
    if (matches) {
      return matches.map(match => match.trim());
    }
    return ['오늘 날씨에 맞는 스타일을 즐겨보세요.'];
  };
  
  return {
    message: response,
    recommendation: {
      top: extractItems(topMatch),
      bottom: extractItems(bottomMatch),
      outer: extractItems(outerMatch),
      accessory: extractItems(accessoryMatch)
    },
    weatherAnalysis: {
      temperature: weatherData.temperature,
      weather: weatherData.weather,
      temperatureCategory: getTemperatureCategory(weatherData.temperature)
    },
    personalTips: extractTips(tipsMatch),
    source: 'Perplexity AI'
  };
};

/**
 * 온도에 따른 온도 카테고리를 반환합니다.
 * @param {number} temperature - 온도
 * @returns {string} - 온도 카테고리
 */
const getTemperatureCategory = (temperature) => {
  if (temperature >= 28) return '매우 더움';
  if (temperature >= 23) return '더움';
  if (temperature >= 20) return '따뜻함';
  if (temperature >= 17) return '선선함';
  if (temperature >= 12) return '쌀쌀함';
  if (temperature >= 9) return '추움';
  if (temperature >= 5) return '매우 추움';
  return '극한 추위';
};

/**
 * Perplexity 웹 검색을 사용하여 패션 트렌드 정보를 가져옵니다.
 * @param {string} query - 검색 쿼리
 * @returns {object} - 검색 결과
 */
const getFashionTrends = async (query) => {
  try {
    // 여기에 mcp_perplexity_search 기능을 활용한 코드를 작성할 수 있습니다.
    // 실제 mcp_perplexity_search_search 함수 호출은 다음과 같습니다:
    /*
    const result = await mcp_perplexity_search_search({
      query: `${query} 최신 패션 트렌드`,
      search_recency_filter: "month" // 최근 한 달 내 정보
    });
    
    return {
      trends: result,
      source: 'Perplexity Search'
    };
    */
    
    // 현재는 더미 데이터 반환
    return {
      trends: [
        "오버사이즈 실루엣이 계속해서 인기를 얻고 있습니다.",
        "지속가능한 패션에 대한 관심이 높아지고 있습니다.",
        "Y2K 스타일이 젊은 층에게 유행하고 있습니다."
      ],
      source: 'Perplexity Search Simulation'
    };
  } catch (error) {
    console.error('패션 트렌드 검색 오류:', error);
    return {
      trends: [],
      error: '패션 트렌드 정보를 가져오는 데 실패했습니다.'
    };
  }
};

module.exports = {
  getClothingRecommendation,
  getFashionTrends
}; 