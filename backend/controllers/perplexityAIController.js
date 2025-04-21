/**
 * Perplexity AI API를 사용한 컨트롤러
 * 날씨 정보와 사용자 선호도를 기반으로 의류 추천을 제공합니다.
 */

const perplexityService = require('../models/perplexityAIService');
const weatherUtils = require('../utils/weatherApiUtils');
const { handleError } = require('../utils/errorHandler');

/**
 * 사용자 요청에 따른 맞춤형 의류 추천을 제공합니다.
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const getClothingRecommendation = async (req, res) => {
  try {
    const { location, message } = req.body;
    const userPreferences = req.body.preferences || {};
    
    // 위치 정보 검증
    if (!location || !location.nx || !location.ny) {
      return res.status(400).json({ 
        success: false, 
        error: '유효한 위치 정보가 필요합니다.' 
      });
    }
    
    // 날씨 정보 가져오기
    const weatherData = await fetchWeatherData(location);
    
    // Perplexity AI를 통한 의류 추천 생성
    const recommendation = await perplexityService.getClothingRecommendation(
      weatherData,
      userPreferences,
      message || '오늘 날씨에 맞는 의류를 추천해주세요.'
    );
    
    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    handleError(res, error, '의류 추천을 가져오는 중 오류가 발생했습니다.');
  }
};

/**
 * 패션 트렌드 정보를 가져옵니다.
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const getFashionTrends = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '검색 쿼리가 필요합니다.'
      });
    }
    
    const trends = await perplexityService.getFashionTrends(query);
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    handleError(res, error, '패션 트렌드 정보를 가져오는 중 오류가 발생했습니다.');
  }
};

/**
 * 날씨 정보를 가져오는 헬퍼 함수
 * @param {object} location - 위치 정보 (nx, ny)
 * @returns {object} - 처리된 날씨 데이터
 */
const fetchWeatherData = async (location) => {
  try {
    // 현재 날씨 조회
    const currentWeather = await weatherUtils.fetchCurrentWeather(location.nx, location.ny);
    
    // 단기 예보 조회
    const forecastWeather = await weatherUtils.fetchShortTermForecast(location.nx, location.ny);
    
    // 날씨 데이터 처리
    return processWeatherData(currentWeather, forecastWeather);
  } catch (error) {
    console.error('날씨 데이터 조회 오류:', error);
    throw error;
  }
};

/**
 * 날씨 데이터를 처리하는 함수
 * @param {object} currentWeather - 현재 날씨 데이터
 * @param {object} forecastWeather - 예보 날씨 데이터
 * @returns {object} - 처리된 날씨 데이터
 */
const processWeatherData = (currentWeather, forecastWeather) => {
  // 기본 날씨 정보
  const weatherInfo = {
    temperature: currentWeather.T1H || 0,
    humidity: currentWeather.REH || 0,
    windSpeed: currentWeather.WSD || 0,
    rainAmount: currentWeather.RN1 || 0,
    weather: getWeatherDescription(currentWeather.PTY, currentWeather.SKY),
    forecast: []
  };
  
  // 예보 정보 처리 (다음 6시간)
  if (forecastWeather && forecastWeather.length > 0) {
    weatherInfo.forecast = forecastWeather.slice(0, 6).map(item => ({
      time: item.fcstTime,
      temperature: item.T1H || item.TMP || 0,
      weather: getWeatherDescription(item.PTY, item.SKY)
    }));
  }
  
  return weatherInfo;
};

/**
 * 날씨 상태 코드를 설명으로 변환
 * @param {number} ptyCode - 강수형태 코드
 * @param {number} skyCode - 하늘상태 코드
 * @returns {string} - 날씨 설명
 */
const getWeatherDescription = (ptyCode, skyCode) => {
  // 강수형태 (PTY) 코드: 0:없음, 1:비, 2:비/눈, 3:눈, 4:소나기
  if (ptyCode === 1) return '비';
  if (ptyCode === 2) return '비/눈';
  if (ptyCode === 3) return '눈';
  if (ptyCode === 4) return '소나기';
  
  // 하늘상태 (SKY) 코드: 1:맑음, 3:구름많음, 4:흐림
  if (skyCode === 1) return '맑음';
  if (skyCode === 3) return '구름많음';
  if (skyCode === 4) return '흐림';
  
  return '알 수 없음';
};

module.exports = {
  getClothingRecommendation,
  getFashionTrends
}; 