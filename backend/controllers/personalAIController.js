const { 
  getNowcastObservation, 
  getShortTermForecast, 
  getNowcastForecast 
} = require('../utils/weatherApiUtils');
const { getPersonalAIRecommendation } = require('../models/personalAI');

/**
 * 사용자 ID 생성 또는 검증
 * 실제 구현에서는 인증 시스템과 연동
 */
const getUserId = (req) => {
  // 사용자 ID가 요청에 포함되어 있으면 사용
  if (req.query.userId || req.body.userId) {
    return req.query.userId || req.body.userId;
  }
  
  // 세션 또는 쿠키에서 사용자 ID 검색 (예시)
  if (req.headers.cookie && req.headers.cookie.includes('userId=')) {
    const match = req.headers.cookie.match(/userId=([^;]+)/);
    if (match) return match[1];
  }
  
  // 임시 ID 생성 (실제 구현에서는 더 안전한 방법 사용)
  return `temp_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * 개인 AI 의류 추천 받기
 * 현재 날씨와 사용자 대화를 기반으로 맞춤형 의류 추천
 */
const getPersonalClothingRecommendation = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const userId = getUserId(req);
    const userMessage = req.query.message || req.body.message;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }

    // 날씨 데이터 가져오기
    const weatherData = await getNowcastObservation(parseFloat(lon), parseFloat(lat));
    
    // 사용자 입력 처리
    const userInput = {
      message: userMessage,
      preferences: req.body.preferences || {}
    };
    
    // 개인 AI 추천 생성
    const personalRecommendation = await getPersonalAIRecommendation(userId, weatherData, userInput);
    
    // 응답 반환
    res.json({
      userId,
      weatherData,
      personalRecommendation
    });
  } catch (error) {
    console.error('개인 AI 의류 추천 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

/**
 * 사용자 선호도 업데이트
 */
const updateUserPreferences = async (req, res) => {
  try {
    const userId = getUserId(req);
    const preferences = req.body.preferences;
    
    if (!preferences) {
      return res.status(400).json({ message: '업데이트할 선호도 정보가 필요합니다.' });
    }
    
    // PersonalAI 모듈에서 사용자 컨텍스트 가져오기
    const userContext = require('../models/personalAI').getUserContext(userId);
    
    // 선호도 업데이트
    userContext.preferences = {
      ...userContext.preferences,
      ...preferences
    };
    
    // 업데이트된 컨텍스트 저장
    require('../models/personalAI').saveUserContext(userId, userContext);
    
    res.json({
      message: '사용자 선호도가 업데이트되었습니다.',
      userId,
      preferences: userContext.preferences
    });
  } catch (error) {
    console.error('사용자 선호도 업데이트 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

/**
 * AI와 대화 주고받기
 */
const chatWithAI = async (req, res) => {
  try {
    const { lat, lon, message } = req.body;
    const userId = getUserId(req);
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }
    
    if (!message) {
      return res.status(400).json({ message: '메시지 내용이 필요합니다.' });
    }
    
    // 날씨 데이터 가져오기
    const weatherData = await getNowcastObservation(parseFloat(lon), parseFloat(lat));
    
    // AI 응답 생성
    const aiResponse = await getPersonalAIRecommendation(userId, weatherData, { message });
    
    // 응답 반환
    res.json({
      userId,
      message,
      aiResponse
    });
  } catch (error) {
    console.error('AI 대화 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

/**
 * 날씨 예보 기반 미래 의류 추천
 */
const getForecastRecommendation = async (req, res) => {
  try {
    const { lat, lon, type } = req.query;
    const userId = getUserId(req);
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }
    
    let forecastData;
    
    // 예보 유형에 따라 다른 API 호출
    if (type === 'short') {
      // 단기 예보 데이터 (3~5일)
      forecastData = await getShortTermForecast(parseFloat(lon), parseFloat(lat));
    } else {
      // 기본값: 초단기 예보 (6시간 이내)
      forecastData = await getNowcastForecast(parseFloat(lon), parseFloat(lat));
    }
    
    // 각 예보 시간대별 추천 생성
    const recommendations = [];
    
    for (const forecast of forecastData) {
      // 각 예보 시간대의 날씨 데이터 구성
      const weatherData = {
        temperature: forecast.temperature || (typeof forecast.temperature === 'object' ? forecast.temperature.max : 0),
        weather: forecast.weather || '맑음',
        humidity: forecast.humidity || 50,
        windSpeed: forecast.windSpeed || 0
      };
      
      // 해당 시간대의 AI 추천 생성
      const recommendation = await getPersonalAIRecommendation(userId, weatherData, {
        message: `${forecast.time || forecast.date || '해당 시간'}의 옷차림을 추천해주세요.`
      });
      
      recommendations.push({
        time: forecast.time || forecast.date,
        weatherData,
        recommendation
      });
    }
    
    // 응답 반환
    res.json({
      userId,
      forecastType: type === 'short' ? '단기 예보' : '초단기 예보',
      recommendations
    });
  } catch (error) {
    console.error('예보 기반 추천 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  getPersonalClothingRecommendation,
  updateUserPreferences,
  chatWithAI,
  getForecastRecommendation
}; 