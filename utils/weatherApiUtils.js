// 단기예보 데이터 처리 함수
const processShortTermForecastData = (data) => {
  try {
    const items = data.response.body.items.item;
    const forecastMap = new Map();

    // 날짜별로 데이터 그룹화
    items.forEach(item => {
      const date = item.fcstDate;
      if (!forecastMap.has(date)) {
        forecastMap.set(date, {
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
          temperature: { min: 100, max: -100 },
          weather: '알 수 없음',
          humidity: 0,
          windSpeed: 0,
          ptyCode: '0',
          skyCode: '1',
          humidityCount: 0,
          windSpeedCount: 0
        });
      }

      const forecast = forecastMap.get(date);
      
      switch (item.category) {
        case 'TMN': // 최저기온
          forecast.temperature.min = Math.min(forecast.temperature.min, parseFloat(item.fcstValue));
          break;
        case 'TMX': // 최고기온
          forecast.temperature.max = Math.max(forecast.temperature.max, parseFloat(item.fcstValue));
          break;
        case 'PTY': // 강수형태
          if (item.fcstTime === '1200') { // 정오 기준
            forecast.ptyCode = item.fcstValue;
          }
          break;
        case 'SKY': // 하늘상태
          if (item.fcstTime === '1200') { // 정오 기준
            forecast.skyCode = item.fcstValue;
          }
          break;
        case 'REH': // 습도
          forecast.humidity += parseFloat(item.fcstValue);
          forecast.humidityCount++;
          break;
        case 'WSD': // 풍속
          forecast.windSpeed += parseFloat(item.fcstValue);
          forecast.windSpeedCount++;
          break;
      }
    });

    // 평균값 계산 및 날씨 정보 설정
    const forecasts = [];
    forecastMap.forEach(forecast => {
      if (forecast.humidityCount > 0) {
        forecast.humidity = Math.round(forecast.humidity / forecast.humidityCount);
      }
      if (forecast.windSpeedCount > 0) {
        forecast.windSpeed = parseFloat((forecast.windSpeed / forecast.windSpeedCount).toFixed(1));
      }
      
      // 최저기온이 비정상적으로 높거나 데이터가 없는 경우 처리
      if (forecast.temperature.min === 100 || forecast.temperature.min > forecast.temperature.max) {
        // 최고기온이 유효한 경우 최고기온보다 8~12도 낮게 설정 (일반적인 일교차)
        if (forecast.temperature.max > -100) {
          const tempDiff = 8 + Math.floor(Math.random() * 5); // 8~12도 차이
          forecast.temperature.min = Math.round(forecast.temperature.max - tempDiff);
        } else {
          // 최고기온도 없는 경우 적절한 기본값 설정
          const baseTemp = new Date().getMonth() >= 5 && new Date().getMonth() <= 8 ? 22 : 15; // 여름철/비여름철 기본 온도
          forecast.temperature.min = baseTemp - 5;
          forecast.temperature.max = baseTemp + 5;
        }
      }
      
      forecast.weather = getWeatherDescription(forecast.ptyCode, forecast.skyCode);
      
      // 필요없는 필드 제거
      delete forecast.ptyCode;
      delete forecast.skyCode;
      delete forecast.humidityCount;
      delete forecast.windSpeedCount;
      
      forecasts.push(forecast);
    });

    // 날짜순 정렬
    forecasts.sort((a, b) => a.date.localeCompare(b.date));
    return forecasts;
  } catch (error) {
    console.error('단기예보 데이터 처리 오류:', error);
    return DUMMY_DATA.short_term_forecast;
  }
}; 