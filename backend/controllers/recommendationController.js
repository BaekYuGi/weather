const { 
  getNowcastObservation, 
  getShortTermForecast, 
  getNowcastForecast 
} = require('../utils/weatherApiUtils');
const { getRecommendation } = require('../models/clothingRecommendation');

// 현재 날씨 기반 옷 추천
const getClothesForCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }

    // 1. 기상청 API를 통해 현재 날씨 데이터 가져오기
    const weatherData = await getNowcastObservation(parseFloat(lon), parseFloat(lat));

    // 2. 가져온 날씨 데이터를 변환 및 구조화 (API 응답 형식에 따라 조정 필요)
    const processedWeatherData = {
      temperature: weatherData.temperature || 0,
      weather: weatherData.weather || '맑음',
      humidity: weatherData.humidity || 50,
      windSpeed: weatherData.windSpeed || 0
    };

    // 3. 날씨 데이터를 기반으로 의류 추천 생성
    const recommendation = getRecommendation(processedWeatherData);

    // 4. 추천 결과 반환
    res.json({
      weatherData: processedWeatherData,
      recommendation: recommendation
    });
  } catch (error) {
    console.error('현재 날씨 기반 의류 추천 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 예보 날씨 기반 옷 추천
const getClothesForForecast = async (req, res) => {
  try {
    const { lat, lon, type } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }

    let weatherData;
    
    // 예보 유형에 따라 다른 API 호출
    if (type === 'short') {
      // 단기 예보 데이터 (3~5일)
      weatherData = await getShortTermForecast(parseFloat(lon), parseFloat(lat));
    } else {
      // 기본값: 초단기 예보 (6시간 이내)
      weatherData = await getNowcastForecast(parseFloat(lon), parseFloat(lat));
    }

    // 예보 데이터 처리 및 추천 생성
    let recommendations = [];
    
    // API 응답 형식에 따라 조정 필요
    // 예보 데이터는 배열 형태로 가정 (시간별/일별 예보)
    if (Array.isArray(weatherData)) {
      recommendations = weatherData.map(forecast => {
        const processedForecast = {
          temperature: forecast.temperature || (typeof forecast.temperature === 'object' ? forecast.temperature.max : 0),
          weather: forecast.weather || '맑음',
          humidity: forecast.humidity || 50,
          windSpeed: forecast.windSpeed || 0,
          time: forecast.time || forecast.date || '미정'
        };
        
        const recommendation = getRecommendation(processedForecast);
        return {
          time: processedForecast.time,
          weatherData: processedForecast,
          recommendation: recommendation
        };
      });
    } else {
      // 단일 시간대 예보인 경우
      const processedForecast = {
        temperature: weatherData.temperature || 0,
        weather: weatherData.weather || '맑음',
        humidity: weatherData.humidity || 50,
        windSpeed: weatherData.windSpeed || 0
      };
      
      const recommendation = getRecommendation(processedForecast);
      recommendations.push({
        weatherData: processedForecast,
        recommendation: recommendation
      });
    }
    
    res.json({
      forecastType: type === 'short' ? '단기 예보' : '초단기 예보',
      recommendations: recommendations
    });
  } catch (error) {
    console.error('예보 날씨 기반 의류 추천 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  getClothesForCurrentWeather,
  getClothesForForecast
}; 
 