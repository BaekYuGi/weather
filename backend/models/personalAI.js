/**
 * 개인화된 AI 의류 추천 시스템
 * 사용자의 선호도와 날씨 데이터를 기반으로 맞춤형 의류를 추천합니다.
 */

const axios = require('axios');
const dotenv = require('dotenv');

// 환경변수 설정
dotenv.config();

// 사용자 컨텍스트 저장소 (실제 서비스에서는 데이터베이스 사용 권장)
const userContexts = new Map();

/**
 * 사용자 맞춤형 AI 추천을 생성합니다.
 * @param {string} userId - 사용자 고유 ID
 * @param {object} weatherData - 날씨 데이터
 * @param {object} userInput - 사용자 입력 (선택사항, 대화 컨텍스트)
 * @returns {object} - AI 응답 및 의류 추천
 */
const getPersonalAIRecommendation = async (userId, weatherData, userInput = {}) => {
  try {
    // 사용자 컨텍스트 가져오기 또는 새로 생성
    const userContext = getUserContext(userId);
    
    // 대화 내역 업데이트
    updateConversationHistory(userContext, userInput.message, weatherData);
    
    // 날씨 데이터 분석
    const weatherAnalysis = analyzeWeatherData(weatherData);
    
    // OpenAI API를 사용한 맞춤형 응답 생성 (주석 해제하여 사용)
    const aiResponse = await generateAIResponse(userContext, weatherData, userInput);
    
    // 사용자 컨텍스트 저장
    saveUserContext(userId, userContext);
    
    return {
      recommendation: aiResponse.recommendation,
      message: aiResponse.message,
      personalTips: aiResponse.personalTips,
      weatherAnalysis: weatherAnalysis
    };
  } catch (error) {
    console.error('개인 AI 추천 생성 오류:', error);
    return {
      error: '개인 AI 추천을 생성할 수 없습니다.',
      fallbackRecommendation: getFallbackRecommendation(weatherData)
    };
  }
};

/**
 * 사용자 컨텍스트를 가져오거나 새로 생성합니다.
 * @param {string} userId - 사용자 ID
 * @returns {object} - 사용자 컨텍스트
 */
const getUserContext = (userId) => {
  if (!userContexts.has(userId)) {
    userContexts.set(userId, {
      userId,
      preferences: {
        style: '캐주얼',
        favoriteBrands: [],
        dislikedItems: [],
        ownedItems: [],
        colorPreferences: []
      },
      conversationHistory: [],
      lastRecommendations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return userContexts.get(userId);
};

/**
 * 사용자 컨텍스트를 저장합니다.
 * @param {string} userId - 사용자 ID
 * @param {object} context - 사용자 컨텍스트
 */
const saveUserContext = (userId, context) => {
  context.updatedAt = new Date();
  userContexts.set(userId, context);
  
  // 실제 구현에서는 데이터베이스에 저장
  console.log(`사용자 ${userId}의 컨텍스트가 업데이트되었습니다.`);
};

/**
 * 대화 내역을 업데이트합니다.
 * @param {object} userContext - 사용자 컨텍스트
 * @param {string} message - 사용자 메시지
 * @param {object} weatherData - 날씨 데이터
 */
const updateConversationHistory = (userContext, message, weatherData) => {
  if (!message) return;
  
  // 최근 10개 대화만 유지
  if (userContext.conversationHistory.length >= 10) {
    userContext.conversationHistory.shift();
  }
  
  userContext.conversationHistory.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
    weatherData: {
      temperature: weatherData.temperature,
      weather: weatherData.weather
    }
  });
};

/**
 * 날씨 데이터를 분석합니다.
 * @param {object} weatherData - 날씨 데이터
 * @returns {object} - 날씨 분석 결과
 */
const analyzeWeatherData = (weatherData) => {
  const { temperature, weather, humidity, windSpeed } = weatherData;
  
  let temperatureCategory = '보통';
  if (temperature >= 28) temperatureCategory = '매우 더움';
  else if (temperature >= 23) temperatureCategory = '더움';
  else if (temperature >= 20) temperatureCategory = '따뜻함';
  else if (temperature >= 17) temperatureCategory = '선선함';
  else if (temperature >= 12) temperatureCategory = '쌀쌀함';
  else if (temperature >= 9) temperatureCategory = '추움';
  else if (temperature >= 5) temperatureCategory = '매우 추움';
  else temperatureCategory = '극한 추위';
  
  let weatherImpact = '보통';
  if (weather.includes('비')) weatherImpact = '우천';
  else if (weather.includes('눈')) weatherImpact = '강설';
  else if (weather.includes('흐림')) weatherImpact = '흐림';
  else if (weather.includes('맑음')) weatherImpact = '맑음';
  
  const humidityImpact = humidity > 70 ? '높음' : '보통';
  const windImpact = windSpeed > 5 ? '강함' : '보통';
  
  return {
    temperatureCategory,
    weatherImpact,
    humidityImpact,
    windImpact,
    overall: `${temperatureCategory}의 ${weatherImpact} 날씨`
  };
};

/**
 * OpenAI API를 사용하여 AI 응답을 생성합니다.
 * 실제 API 키가 필요합니다.
 * @param {object} userContext - 사용자 컨텍스트
 * @param {object} weatherData - 날씨 데이터
 * @param {object} userInput - 사용자 입력
 * @returns {object} - AI 응답
 */
const generateAIResponse = async (userContext, weatherData, userInput) => {
  // API 키가 없는 경우 대체 응답 사용
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('Perplexity API 키가 없어 대체 응답을 사용합니다.');
    return generateFallbackResponse(userContext, weatherData, userInput);
  }
  
  try {
    // Perplexity API 호출
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3-sonar-small-32k',
      messages: [
        {
          role: 'system',
          content: `당신은 개인 의류 스타일리스트 AI입니다. 날씨와 사용자 선호도에 맞는 옷차림을 추천해주세요.
          사용자 정보: ${JSON.stringify(userContext.preferences)}
          과거 추천 내역: ${JSON.stringify(userContext.lastRecommendations)}
          대화 내역: ${JSON.stringify(userContext.conversationHistory)}`
        },
        {
          role: 'user',
          content: `현재 날씨: 기온 ${weatherData.temperature}도, ${weatherData.weather}, 습도 ${weatherData.humidity}%, 풍속 ${weatherData.windSpeed}m/s
          
          ${userInput.message || '오늘 입을 옷을 추천해주세요.'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // API 응답 파싱
    const aiMessage = response.data.choices[0].message.content;
    
    // 응답에서 추천 정보 추출 (실제 구현에서는 더 정교한 파싱 필요)
    return {
      message: aiMessage,
      recommendation: extractRecommendationFromAIResponse(aiMessage),
      personalTips: extractPersonalTipsFromAIResponse(aiMessage)
    };
  } catch (error) {
    console.error('Perplexity API 호출 오류:', error);
    return generateFallbackResponse(userContext, weatherData, userInput);
  }
};

/**
 * AI 응답에서 의류 추천 정보를 추출합니다.
 * @param {string} aiResponse - AI 응답 텍스트
 * @returns {object} - 추출된 추천 정보
 */
const extractRecommendationFromAIResponse = (aiResponse) => {
  // 실제 구현에서는 정규식 또는 구조화된 응답 형식을 사용하여
  // 더 정확하게 추천 정보를 추출해야 합니다.
  return {
    top: extractCategory(aiResponse, '상의'),
    bottom: extractCategory(aiResponse, '하의'),
    outer: extractCategory(aiResponse, '아우터'),
    accessory: extractCategory(aiResponse, '액세서리')
  };
};

/**
 * AI 응답에서 개인 맞춤 팁을 추출합니다.
 * @param {string} aiResponse - AI 응답 텍스트
 * @returns {string[]} - 추출된 팁 목록
 */
const extractPersonalTipsFromAIResponse = (aiResponse) => {
  // 간단한 구현: "팁:" 또는 "조언:" 이후 문장 추출
  const tipMatches = aiResponse.match(/(?:팁|조언|Tip|Tips):(.*?)(?:\n|$)/gi);
  if (tipMatches) {
    return tipMatches.map(match => match.trim());
  }
  return ['오늘 날씨에 맞는 스타일을 즐겨보세요.'];
};

/**
 * AI 응답에서 특정 카테고리를 추출합니다.
 * @param {string} text - 텍스트
 * @param {string} category - 카테고리명
 * @returns {string[]} - 추출된 아이템 목록
 */
const extractCategory = (text, category) => {
  const regex = new RegExp(`${category}[^\\n]*?:([^\\n]*)`, 'i');
  const match = text.match(regex);
  
  if (match && match[1]) {
    return match[1].split(',').map(item => item.trim());
  }
  
  return [];
};

/**
 * 대체 응답을 생성합니다. (API 호출 실패 시)
 * @param {object} userContext - 사용자 컨텍스트
 * @param {object} weatherData - 날씨 데이터
 * @param {object} userInput - 사용자 입력
 * @returns {object} - 대체 응답
 */
const generateFallbackResponse = (userContext, weatherData, userInput) => {
  const fallbackRecommendation = getFallbackRecommendation(weatherData);
  const userStyle = userContext.preferences.style || '캐주얼';
  
  let personalMessage = '';
  if (userInput.message) {
    if (userInput.message.includes('추천')) {
      personalMessage = '날씨와 선호도에 맞는 옷을 추천해 드립니다.';
    } else if (userInput.message.includes('안녕') || userInput.message.includes('반가워')) {
      personalMessage = '안녕하세요! 오늘 날씨에 맞는 옷차림을 추천해 드릴게요.';
    } else {
      personalMessage = '오늘 날씨에 적합한 옷차림을 알려드릴게요.';
    }
  }
  
  return {
    message: `${personalMessage}\n\n오늘은 ${weatherData.temperature}도의 ${weatherData.weather} 날씨입니다. ${userStyle} 스타일에 맞춰 다음 의류를 추천합니다.`,
    recommendation: fallbackRecommendation,
    personalTips: [
      `${userStyle} 스타일에 맞춰 색상을 조합해보세요.`,
      `오늘 기온은 ${weatherData.temperature}도로, 체감온도를 고려하세요.`
    ]
  };
};

/**
 * 기본 의류 추천을 생성합니다.
 * @param {object} weatherData - 날씨 데이터
 * @returns {object} - 기본 추천
 */
const getFallbackRecommendation = (weatherData) => {
  const { temperature } = weatherData;
  
  // 온도별 기본 추천
  if (temperature >= 28) {
    return {
      top: ['반팔 티셔츠', '민소매 셔츠'],
      bottom: ['반바지', '얇은 면바지'],
      outer: [],
      accessory: ['모자', '선글라스']
    };
  } else if (temperature >= 23) {
    return {
      top: ['반팔 티셔츠', '얇은 셔츠'],
      bottom: ['면바지', '청바지'],
      outer: [],
      accessory: ['모자']
    };
  } else if (temperature >= 20) {
    return {
      top: ['얇은 긴팔 티셔츠', '얇은 셔츠'],
      bottom: ['면바지', '청바지'],
      outer: ['얇은 가디건'],
      accessory: []
    };
  } else if (temperature >= 17) {
    return {
      top: ['긴팔 티셔츠', '셔츠'],
      bottom: ['면바지', '청바지'],
      outer: ['가디건', '얇은 자켓'],
      accessory: []
    };
  } else if (temperature >= 12) {
    return {
      top: ['긴팔 티셔츠', '맨투맨', '니트'],
      bottom: ['청바지', '슬랙스'],
      outer: ['자켓', '가디건'],
      accessory: ['목도리']
    };
  } else if (temperature >= 9) {
    return {
      top: ['니트', '맨투맨'],
      bottom: ['청바지', '기모 바지'],
      outer: ['코트', '자켓'],
      accessory: ['목도리', '장갑']
    };
  } else if (temperature >= 5) {
    return {
      top: ['두꺼운 니트', '기모 맨투맨'],
      bottom: ['기모 바지', '두꺼운 청바지'],
      outer: ['패딩', '두꺼운 코트'],
      accessory: ['목도리', '장갑', '비니']
    };
  } else {
    return {
      top: ['히트텍', '두꺼운 니트', '기모 맨투맨'],
      bottom: ['기모 바지'],
      outer: ['롱패딩', '두꺼운 코트'],
      accessory: ['두꺼운 목도리', '장갑', '귀마개', '비니']
    };
  }
};

module.exports = {
  getPersonalAIRecommendation,
  getUserContext,
  saveUserContext
}; 