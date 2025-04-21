const {
  getNowcastObservation,
  getShortTermForecast,
  getNowcastForecast,
  getAirQualityData,
  getUVIndexData
} = require('../utils/weatherApiUtils');

// 현재 날씨 데이터 가져오기
const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }

    console.log(`[getCurrentWeather] 요청: lat=${lat}, lon=${lon}`);

    // 실제 기상청 API 함수 호출 (날씨 기본 데이터)
    const weatherData = await getNowcastObservation(parseFloat(lon), parseFloat(lat));
    
    // 미세먼지 정보 가져오기
    const airQualityData = await getAirQualityData(parseFloat(lon), parseFloat(lat));
    
    // 자외선 지수 정보 가져오기
    const uvIndexData = await getUVIndexData(parseFloat(lon), parseFloat(lat));
    
    // 데이터 통합
    const combinedData = {
      ...weatherData,
      ...airQualityData,
      ...uvIndexData
    };
    
    console.log(`[getCurrentWeather] 통합 응답: ${JSON.stringify(combinedData)}`);
    
    res.json(combinedData);
  } catch (error) {
    console.error('날씨 데이터 가져오기 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 단기 예보 데이터 가져오기
const getShortTermForecastController = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }

    console.log(`[getShortTermForecast] 요청: lat=${lat}, lon=${lon}`);

    // 실제 기상청 API 함수 호출
    const forecastData = await getShortTermForecast(parseFloat(lon), parseFloat(lat));
    
    console.log(`[getShortTermForecast] 응답: ${JSON.stringify(forecastData)}`);
    
    res.json(forecastData);
  } catch (error) {
    console.error('단기 예보 데이터 가져오기 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 초단기 예보 데이터 가져오기
const getNowcastForecastController = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: '위도와 경도가 필요합니다.' });
    }

    console.log(`[getNowcastForecast] 요청: lat=${lat}, lon=${lon}`);

    // 실제 기상청 API 함수 호출
    const forecastData = await getNowcastForecast(parseFloat(lon), parseFloat(lat));
    
    console.log(`[getNowcastForecast] 응답: ${JSON.stringify(forecastData)}`);
    
    res.json(forecastData);
  } catch (error) {
    console.error('초단기 예보 데이터 가져오기 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  getCurrentWeather,
  getShortTermForecast: getShortTermForecastController,
  getNowcastForecast: getNowcastForecastController
}; 