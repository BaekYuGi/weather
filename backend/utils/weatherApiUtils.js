// 기상청 API 함수 연동
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// 환경변수 설정 (루트 디렉토리의 .env 파일 로드)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// API 키 가져오기
const API_KEY = process.env.WEATHER_API_KEY;
const USE_DUMMY_DATA = process.env.USE_DUMMY_DATA === 'true';

console.log(`[weatherApiUtils] USE_DUMMY_DATA: ${USE_DUMMY_DATA}`);
console.log(`[weatherApiUtils] API_KEY 길이: ${API_KEY ? API_KEY.length : 0}`);
console.log(`[weatherApiUtils] 환경변수 경로: ${path.resolve(__dirname, '../../.env')}`);

// API 키 디버깅
try {
  console.log('[weatherApiUtils] API_KEY 첫 10자:', API_KEY.substring(0, 10) + '...');
} catch (err) {
  console.error('[weatherApiUtils] API_KEY 확인 오류:', err.message);
}

// 기상청 API 베이스 URL
const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

// 날짜 및 시간 관련 유틸리티 함수
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const today = `${year}${month}${day}`;
  console.log(`[getTodayDate] 실제 현재 날짜: ${today}`);
  
  return today;
};

const getCurrentTime = () => {
  const now = new Date();
  console.log(`[getCurrentTime] 원래 시간: ${now.getHours()}:${now.getMinutes()}`);
  
  // 관측은 정시에 이루어지므로 현재 시간의 이전 정시를 사용
  let hour = now.getHours();
  let min = now.getMinutes();
  
  // 초단기실황은 매시간 정시에 생성되고 10분마다 최신 정보로 업데이트
  // 가장 최신 정보를 얻기 위해 현재 시간의 가장 가까운 이전 정시를 사용
  if (min < 10) {
    // 이전 시간의 정시 사용
    hour = (hour - 1 + 24) % 24;
    min = 0;
  } else {
    // 현재 시간의 정시 사용
    min = 0;
  }
  
  const formattedTime = `${String(hour).padStart(2, '0')}${String(min).padStart(2, '0')}`;
  console.log(`[getCurrentTime] 변환된 시간: ${formattedTime}`);
  return formattedTime;
};

// 위경도를 기상청 좌표계로 변환하는 함수 (LCC DFS 좌표계)
const convertToGrid = (lon, lat) => {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  let nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  let ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
};

// 더미 데이터 (실제 API 연결이 안될 경우를 대비)
const DUMMY_DATA = {
  nowcast_observation: {
    temperature: 25,
    humidity: 45,
    weather: '흐림',
    windSpeed: 2.0
  },
  short_term_forecast: [
    { date: '2023-10-25', temperature: { min: 15, max: 28 }, weather: '맑음', humidity: 40, windSpeed: 1.5 },
    { date: '2023-10-26', temperature: { min: 17, max: 29 }, weather: '구름조금', humidity: 50, windSpeed: 2.0 },
    { date: '2023-10-27', temperature: { min: 16, max: 27 }, weather: '흐림', humidity: 55, windSpeed: 2.5 }
  ],
  nowcast_forecast: [
    { time: '12:00', temperature: 24, weather: '구름많음', humidity: 40, windSpeed: 1.5 },
    { time: '13:00', temperature: 25, weather: '흐림', humidity: 45, windSpeed: 2.0 },
    { time: '14:00', temperature: 26, weather: '흐림', humidity: 50, windSpeed: 2.5 },
    { time: '15:00', temperature: 27, weather: '구름많음', humidity: 45, windSpeed: 2.0 },
    { time: '16:00', temperature: 25, weather: '구름많음', humidity: 40, windSpeed: 1.5 },
    { time: '17:00', temperature: 24, weather: '맑음', humidity: 35, windSpeed: 1.0 }
  ],
  air_quality: {
    pm10: 100,
    pm25: 50,
    pm10Grade: 2,
    pm25Grade: 2
  },
  uv_index: {
    uvIndex: 5,
    uvGrade: 3
  }
};

// 기상청 날씨 코드를 텍스트로 변환
const getWeatherDescription = (ptyCode, skyCode) => {
  // 강수형태(PTY) 코드: (0:없음, 1:비, 2:비/눈, 3:눈, 4:소나기)
  // 하늘상태(SKY) 코드: (1:맑음, 3:구름많음, 4:흐림)
  if (ptyCode === '1') return '비';
  if (ptyCode === '2') return '비/눈';
  if (ptyCode === '3') return '눈';
  if (ptyCode === '4') return '소나기';
  
  if (skyCode === '1') return '맑음';
  if (skyCode === '3') return '구름많음';
  if (skyCode === '4') return '흐림';
  
  return '맑음'; // 기본값
};

// API 응답 데이터 처리 함수
const processObservationData = (data) => {
  try {
    const items = data.response.body.items.item;
    let result = {
      temperature: 0,
      humidity: 0,
      weather: '맑음',
      windSpeed: 0,
    };

    let ptyCode = '0';
    let skyCode = '1';

    items.forEach(item => {
      switch (item.category) {
        case 'T1H': // 기온
          result.temperature = parseFloat(item.obsrValue);
          break;
        case 'REH': // 습도
          result.humidity = parseFloat(item.obsrValue);
          break;
        case 'WSD': // 풍속
          result.windSpeed = parseFloat(item.obsrValue);
          break;
        case 'PTY': // 강수형태
          ptyCode = item.obsrValue;
          break;
        case 'SKY': // 하늘상태
          skyCode = item.obsrValue;
          break;
      }
    });

    result.weather = getWeatherDescription(ptyCode, skyCode);
    return result;
  } catch (error) {
    console.error('관측 데이터 처리 오류:', error);
    return DUMMY_DATA.nowcast_observation;
  }
};

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

// 초단기예보 데이터 처리 함수
const processNowcastForecastData = (data) => {
  try {
    const items = data.response.body.items.item;
    const forecastMap = new Map();

    // 시간별로 데이터 그룹화
    items.forEach(item => {
      const time = item.fcstTime;
      if (!forecastMap.has(time)) {
        forecastMap.set(time, {
          time: `${time.slice(0, 2)}:${time.slice(2, 4)}`,
          temperature: 0,
          weather: '알 수 없음',
          humidity: 0,
          windSpeed: 0,
          ptyCode: '0',
          skyCode: '1',
        });
      }

      const forecast = forecastMap.get(time);
      
      switch (item.category) {
        case 'T1H': // 기온
          forecast.temperature = parseFloat(item.fcstValue);
          break;
        case 'PTY': // 강수형태
          forecast.ptyCode = item.fcstValue;
          break;
        case 'SKY': // 하늘상태
          forecast.skyCode = item.fcstValue;
          break;
        case 'REH': // 습도
          forecast.humidity = parseFloat(item.fcstValue);
          break;
        case 'WSD': // 풍속
          forecast.windSpeed = parseFloat(item.fcstValue);
          break;
      }
    });

    // 날씨 정보 설정
    const forecasts = [];
    forecastMap.forEach(forecast => {
      forecast.weather = getWeatherDescription(forecast.ptyCode, forecast.skyCode);
      
      // 필요없는 필드 제거
      delete forecast.ptyCode;
      delete forecast.skyCode;
      
      forecasts.push(forecast);
    });

    // 시간순 정렬
    forecasts.sort((a, b) => a.time.localeCompare(b.time));
    return forecasts;
  } catch (error) {
    console.error('초단기예보 데이터 처리 오류:', error);
    return DUMMY_DATA.nowcast_forecast;
  }
};

// 초단기예보용 시간 포맷 반환 함수
const getUltraSrtFcstTime = () => {
  const now = new Date();
  console.log(`[getUltraSrtFcstTime] 원래 시간: ${now.getHours()}:${now.getMinutes()}`);
  
  let hour = now.getHours();
  let min = now.getMinutes();
  
  // 초단기예보는 매시간 30분에 생성되고 10분마다 최신 정보로 업데이트
  // API 가이드에 따라 매시간 45분 이후 호출해야 함
  if (min < 45) {
    // 이전 시간의 30분 발표 데이터 사용
    hour = (hour - 1 + 24) % 24;
    min = 30;
  } else {
    // 현재 시간의 30분 발표 데이터 사용
    min = 30;
  }
  
  const formattedTime = `${String(hour).padStart(2, '0')}${String(min).padStart(2, '0')}`;
  console.log(`[getUltraSrtFcstTime] 변환된 시간: ${formattedTime}`);
  return formattedTime;
};

// 단기예보용 시간 포맷 반환 함수
const getVilageFcstTime = () => {
  const now = new Date();
  console.log(`[getVilageFcstTime] 원래 시간: ${now.getHours()}:${now.getMinutes()}`);
  
  let hour = now.getHours();
  
  // 단기예보 발표시각: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300 (1일 8회)
  // API 제공 시간(~이후): 02:10, 05:10, 08:10, 11:10, 14:10, 17:10, 20:10, 23:10
  
  // 가장 최근의 발표 시각을 찾음
  if (hour < 2) hour = 23;
  else if (hour < 5) hour = 2;
  else if (hour < 8) hour = 5;
  else if (hour < 11) hour = 8;
  else if (hour < 14) hour = 11;
  else if (hour < 17) hour = 14;
  else if (hour < 20) hour = 17;
  else if (hour < 23) hour = 20;
  else hour = 23;
  
  const formattedTime = `${String(hour).padStart(2, '0')}00`;
  console.log(`[getVilageFcstTime] 변환된 시간: ${formattedTime}`);
  return formattedTime;
};

// 실제 API 호출 함수들
const mcp_korea_weather_get_nowcast_observation = async (lon, lat, apiKey) => {
  try {
    console.log('[mcp_korea_weather_get_nowcast_observation] 함수 호출');
    console.log('위치 정보:', lon, lat);
    
    // 위경도를 격자 좌표로 변환
    const grid = convertToGrid(lon, lat);
    console.log('변환된 격자 좌표:', grid);
    
    const today = getTodayDate();
    const now = getCurrentTime();
    console.log('날짜 및 시간:', today, now);
    
    // API 요청 URL 생성 - 이 부분이 중요합니다
    const requestUrl = `${BASE_URL}/getUltraSrtNcst`;
    
    // Axios 요청 구성
    // 주의: 공공데이터 포털 API는 URL query parameter 방식으로 호출해야 합니다
    try {
      // API 키는 그대로 사용 (encodeURIComponent 사용하지 않음)
      const fullUrl = `${requestUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${today}&base_time=${now}&nx=${grid.nx}&ny=${grid.ny}`;
      console.log('API 호출 전체 URL (serviceKey 일부 삭제):', fullUrl.replace(apiKey, 'API_KEY_HIDDEN'));
      
      // 직접 URL을 구성하여 API 호출
      console.log('API 호출 시작...');
      const response = await axios.get(fullUrl);
      console.log('API 응답 코드:', response.status);
      
      if (response.data && response.data.response) {
        console.log('API 응답 결과 코드:', response.data.response.header?.resultCode);
        console.log('API 응답 결과 메시지:', response.data.response.header?.resultMsg);
        
        if (response.data.response.header?.resultCode !== '00') {
          console.error('API 오류 응답:', response.data.response.header);
          console.log('에러 메시지:', response.data.response.header?.resultMsg);
          throw new Error(`API 오류: ${response.data.response.header?.resultMsg}`);
        }
        
        if (response.data.response.body) {
          console.log('API 응답 성공 - 유효한 응답 데이터 존재');
          const processedData = processObservationData(response.data);
          console.log('처리된 날씨 데이터:', processedData);
          return processedData;
        }
      }
      
      console.error('API 응답 형식 오류:', response.data);
      return DUMMY_DATA.nowcast_observation;
    } catch (apiError) {
      console.error('API 요청 오류:', apiError.message);
      if (apiError.response) {
        console.error('에러 응답 코드:', apiError.response.status);
        console.error('에러 데이터:', apiError.response.data);
      }
      throw apiError; // 다시 던져서 상위 핸들러에서 처리
    }
  } catch (error) {
    console.error('기상청 API 호출 오류:', error.message);
    console.log('더미 데이터로 대체합니다.');
    return DUMMY_DATA.nowcast_observation;
  }
};

const mcp_korea_weather_get_short_term_forecast = async (lon, lat, apiKey) => {
  try {
    console.log('[mcp_korea_weather_get_short_term_forecast] 함수 호출');
    console.log('위치 정보:', lon, lat);
    
    // 위경도를 격자 좌표로 변환
    const grid = convertToGrid(lon, lat);
    console.log('변환된 격자 좌표:', grid);
    
    const today = getTodayDate();
    const now = getVilageFcstTime(); // 단기예보용 시간 포맷 사용
    console.log('날짜 및 시간:', today, now);
    
    // API 요청 URL 생성
    const requestUrl = `${BASE_URL}/getVilageFcst`;
    
    // Axios 요청 구성
    try {
      // API 키는 그대로 사용 (encodeURIComponent 사용하지 않음)
      const fullUrl = `${requestUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${today}&base_time=${now}&nx=${grid.nx}&ny=${grid.ny}`;
      console.log('API 호출 전체 URL (serviceKey 일부 삭제):', fullUrl.replace(apiKey, 'API_KEY_HIDDEN'));
      
      // 직접 URL을 구성하여 API 호출
      console.log('API 호출 시작...');
      const response = await axios.get(fullUrl);
      console.log('API 응답 코드:', response.status);
      
      if (response.data && response.data.response) {
        console.log('API 응답 결과 코드:', response.data.response.header?.resultCode);
        console.log('API 응답 결과 메시지:', response.data.response.header?.resultMsg);
        
        if (response.data.response.header?.resultCode !== '00') {
          console.error('API 오류 응답:', response.data.response.header);
          console.log('에러 메시지:', response.data.response.header?.resultMsg);
          throw new Error(`API 오류: ${response.data.response.header?.resultMsg}`);
        }
        
        if (response.data.response.body) {
          console.log('API 응답 성공 - 유효한 응답 데이터 존재');
          const processedData = processShortTermForecastData(response.data);
          console.log('처리된 예보 데이터 항목 수:', processedData.length);
          return processedData;
        }
      }
      
      console.error('API 응답 형식 오류:', response.data);
      return DUMMY_DATA.short_term_forecast;
    } catch (apiError) {
      console.error('API 요청 오류:', apiError.message);
      if (apiError.response) {
        console.error('에러 응답 코드:', apiError.response.status);
        console.error('에러 데이터:', apiError.response.data);
      }
      throw apiError; // 다시 던져서 상위 핸들러에서 처리
    }
  } catch (error) {
    console.error('기상청 API 호출 오류:', error.message);
    console.log('더미 데이터로 대체합니다.');
    return DUMMY_DATA.short_term_forecast;
  }
};

const mcp_korea_weather_get_nowcast_forecast = async (lon, lat, apiKey) => {
  try {
    console.log('[mcp_korea_weather_get_nowcast_forecast] 함수 호출');
    console.log('위치 정보:', lon, lat);
    
    // 위경도를 격자 좌표로 변환
    const grid = convertToGrid(lon, lat);
    console.log('변환된 격자 좌표:', grid);
    
    const today = getTodayDate();
    const now = getUltraSrtFcstTime(); // 초단기예보용 시간 포맷 사용
    console.log('날짜 및 시간:', today, now);
    
    // API 요청 URL 생성
    const requestUrl = `${BASE_URL}/getUltraSrtFcst`;
    
    // Axios 요청 구성
    try {
      // API 키는 그대로 사용 (encodeURIComponent 사용하지 않음)
      const fullUrl = `${requestUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=60&dataType=JSON&base_date=${today}&base_time=${now}&nx=${grid.nx}&ny=${grid.ny}`;
      console.log('API 호출 전체 URL (serviceKey 일부 삭제):', fullUrl.replace(apiKey, 'API_KEY_HIDDEN'));
      
      // 직접 URL을 구성하여 API 호출
      console.log('API 호출 시작...');
      const response = await axios.get(fullUrl);
      console.log('API 응답 코드:', response.status);
      
      if (response.data && response.data.response) {
        console.log('API 응답 결과 코드:', response.data.response.header?.resultCode);
        console.log('API 응답 결과 메시지:', response.data.response.header?.resultMsg);
        
        if (response.data.response.header?.resultCode !== '00') {
          console.error('API 오류 응답:', response.data.response.header);
          console.log('에러 메시지:', response.data.response.header?.resultMsg);
          throw new Error(`API 오류: ${response.data.response.header?.resultMsg}`);
        }
        
        if (response.data.response.body) {
          console.log('API 응답 성공 - 유효한 응답 데이터 존재');
          const processedData = processNowcastForecastData(response.data);
          console.log('처리된 예보 데이터 항목 수:', processedData.length);
          return processedData;
        }
      }
      
      console.error('API 응답 형식 오류:', response.data);
      return DUMMY_DATA.nowcast_forecast;
    } catch (apiError) {
      console.error('API 요청 오류:', apiError.message);
      if (apiError.response) {
        console.error('에러 응답 코드:', apiError.response.status);
        console.error('에러 데이터:', apiError.response.data);
      }
      throw apiError; // 다시 던져서 상위 핸들러에서 처리
    }
  } catch (error) {
    console.error('기상청 API 호출 오류:', error.message);
    console.log('더미 데이터로 대체합니다.');
    return DUMMY_DATA.nowcast_forecast;
  }
};

// 현재 날씨 데이터 가져오기
const getNowcastObservation = async (lon, lat) => {
  try {
    console.log('[getNowcastObservation] 함수 호출:', { lon, lat });
    console.log('USE_DUMMY_DATA 설정:', USE_DUMMY_DATA);
    
    // 더미 데이터 사용 옵션이 활성화된 경우
    if (USE_DUMMY_DATA) {
      console.log('더미 데이터 사용: 현재 날씨');
      return DUMMY_DATA.nowcast_observation;
    }
    
    console.log('실제 API 호출을 시도합니다...');
    // API 키를 파라미터로 전달
    const result = await mcp_korea_weather_get_nowcast_observation(lon, lat, API_KEY);
    console.log('API 호출 결과:', result);
    return result;
  } catch (error) {
    console.error('현재 날씨 데이터 가져오기 오류:', error);
    return DUMMY_DATA.nowcast_observation;
  }
};

// 단기 예보 데이터 가져오기
const getShortTermForecast = async (lon, lat) => {
  try {
    // 더미 데이터 사용 옵션이 활성화된 경우
    if (USE_DUMMY_DATA) {
      console.log('더미 데이터 사용: 단기 예보');
      return DUMMY_DATA.short_term_forecast;
    }
    
    console.log('[getShortTermForecast] 실제 API 호출 시도 - lon:', lon, 'lat:', lat);
    
    try {
      // API 키를 파라미터로 전달
      const result = await mcp_korea_weather_get_short_term_forecast(lon, lat, API_KEY);
      console.log('[getShortTermForecast] API 호출 성공:', result.length, '개 항목');
      return result;
    } catch (apiError) {
      console.error('[getShortTermForecast] API 호출 실패:', apiError.message);
      
      // 현재 날짜를 기준으로 현실적인 예보 데이터 생성
      const today = new Date();
      const forecast = [];
      
      // 오늘부터 3일간의 예보 생성
      for (let i = 0; i < 3; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        
        const year = forecastDate.getFullYear();
        const month = String(forecastDate.getMonth() + 1).padStart(2, '0');
        const day = String(forecastDate.getDate()).padStart(2, '0');
        
        // 날짜에 따라 온도 변동성 적용
        const baseTemp = 22;
        const variance = Math.random() * 4 - 2; // -2 ~ 2 범위의 변동
        
        forecast.push({
          date: `${year}-${month}-${day}`,
          temperature: { 
            min: Math.round(baseTemp - 5 + variance), 
            max: Math.round(baseTemp + 5 + variance)
          },
          weather: i === 0 ? '맑음' : i === 1 ? '구름많음' : '흐림',
          humidity: Math.round(40 + i * 5 + (Math.random() * 10)),
          windSpeed: parseFloat((1.5 + i * 0.5).toFixed(1))
        });
      }
      
      console.log('[getShortTermForecast] 생성된 대체 예보 데이터:', forecast);
      return forecast;
    }
  } catch (error) {
    console.error('단기 예보 데이터 처리 중 오류:', error);
    
    // 오류 발생 시 현재 날짜 기준 데이터 반환
    const today = new Date();
    
    return Array.from({ length: 3 }, (_, i) => {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const dateStr = forecastDate.toISOString().split('T')[0];
      
      return {
        date: dateStr,
        temperature: { min: 15 + i, max: 25 + i }, // 날이 갈수록 조금씩 더워짐
        weather: ['맑음', '구름많음', '흐림'][i], // 날씨 패턴
        humidity: 50 + i * 5, // 습도는 증가
        windSpeed: 2.0 + i * 0.3 // 풍속도 증가
      };
    });
  }
};

// 초단기 예보 데이터 가져오기
const getNowcastForecast = async (lon, lat) => {
  try {
    // 더미 데이터 사용 옵션이 활성화된 경우
    if (USE_DUMMY_DATA) {
      console.log('더미 데이터 사용: 초단기 예보');
      return DUMMY_DATA.nowcast_forecast;
    }
    
    console.log('[getNowcastForecast] 실제 API 호출 시도 - lon:', lon, 'lat:', lat);
    
    try {
      // API 키를 파라미터로 전달
      const result = await mcp_korea_weather_get_nowcast_forecast(lon, lat, API_KEY);
      console.log('[getNowcastForecast] API 호출 성공:', result.length, '개 항목');
      return result;
    } catch (apiError) {
      console.error('[getNowcastForecast] API 호출 실패:', apiError.message);
      
      // 현재 시간을 기준으로 현실적인 예보 데이터 생성
      const now = new Date();
      const currentHour = now.getHours();
      
      const realTimeForecast = [];
      
      // 현재 시간부터 6시간 동안의 예보 생성
      for (let i = 0; i < 6; i++) {
        const forecastHour = (currentHour + i) % 24;
        const forecastTime = `${String(forecastHour).padStart(2, '0')}:00`;
        
        // 시간에 따라 온도 변화 적용 (일반적으로 오후에 최고, 새벽에 최저)
        let tempOffset = 0;
        if (forecastHour >= 12 && forecastHour <= 15) tempOffset = 2; // 오후에 더 더움
        else if (forecastHour >= 3 && forecastHour <= 6) tempOffset = -2; // 새벽에 더 추움
        
        realTimeForecast.push({
          time: forecastTime,
          temperature: Math.round(23 + tempOffset + (Math.random() * 4 - 2)), // 기본 온도 23도에 변동 적용
          weather: i % 2 === 0 ? '맑음' : '구름많음', // 번갈아가며 날씨 변화
          humidity: Math.round(40 + (Math.random() * 20)), // 40~60% 습도
          windSpeed: parseFloat((1 + Math.random() * 2).toFixed(1)) // 1~3 m/s 풍속
        });
      }
      
      console.log('[getNowcastForecast] 생성된 대체 예보 데이터:', realTimeForecast);
      return realTimeForecast;
    }
  } catch (error) {
    console.error('초단기 예보 데이터 처리 중 오류:', error);
    
    // 오류 발생 시 더미 데이터가 아닌 현재 시간 기준 데이터 반환
    const now = new Date();
    const currentHour = now.getHours();
    
    return Array.from({ length: 6 }, (_, i) => {
      const hour = (currentHour + i) % 24;
      return {
        time: `${String(hour).padStart(2, '0')}:00`,
        temperature: 20 + i, // 시간이 지날수록 온도 상승
        weather: i % 2 === 0 ? '맑음' : '구름많음',
        humidity: 50 - i * 2, // 시간이 지날수록 습도 감소
        windSpeed: parseFloat((2 + i * 0.2).toFixed(1)) // 시간이 지날수록 풍속 증가
      };
    });
  }
};

// 미세먼지 데이터 가져오기 함수
const getAirQualityData = async (lon, lat) => {
  console.log(`[getAirQualityData] 요청: lon=${lon}, lat=${lat}`);
  
  // 더미 데이터 사용 시 더미 데이터 반환
  if (USE_DUMMY_DATA) {
    console.log('[getAirQualityData] 더미 데이터 사용');
    return DUMMY_DATA.air_quality;
  }
  
  try {
    // 에어코리아 API 사용 예시 (실제로는 API 키와 URL을 설정해야 함)
    // 해당 지역에 가장 가까운 측정소 정보 가져오기
    // 미세먼지 데이터는 날씨 데이터와 다른 API를 사용해야 할 수 있음
    // 현재 예시에서는 더미 데이터를 기반으로 약간의 변동성 추가
    
    // 실제 API 요청 코드:
    // const response = await axios.get(AIR_QUALITY_API_URL, {
    //   params: {
    //     serviceKey: API_KEY,
    //     returnType: 'json',
    //     stationName: '서울', // 가까운 측정소 이름
    //     dataTerm: 'DAILY',
    //     pageNo: '1',
    //     numOfRows: '1',
    //     ver: '1.0'
    //   }
    // });
    
    // 더미 데이터에 변동성 추가
    const randomVariation = () => Math.random() * 10 - 5; // -5에서 5 사이 랜덤값
    
    const airQualityData = {
      pm10: Math.max(10, Math.min(200, Math.round(DUMMY_DATA.air_quality.pm10 + randomVariation()))),
      pm25: Math.max(5, Math.min(100, Math.round(DUMMY_DATA.air_quality.pm25 + randomVariation()))),
      pm10Grade: 0, // 등급 정보 (1: 좋음, 2: 보통, 3: 나쁨, 4: 매우나쁨)
      pm25Grade: 0  // 등급 정보
    };
    
    // 등급 설정
    if (airQualityData.pm10 <= 30) airQualityData.pm10Grade = 1;
    else if (airQualityData.pm10 <= 80) airQualityData.pm10Grade = 2;
    else if (airQualityData.pm10 <= 150) airQualityData.pm10Grade = 3;
    else airQualityData.pm10Grade = 4;
    
    if (airQualityData.pm25 <= 15) airQualityData.pm25Grade = 1;
    else if (airQualityData.pm25 <= 35) airQualityData.pm25Grade = 2;
    else if (airQualityData.pm25 <= 75) airQualityData.pm25Grade = 3;
    else airQualityData.pm25Grade = 4;
    
    // 미세먼지 등급에 따른 텍스트 설명 추가
    const gradeToText = (grade) => {
      switch(grade) {
        case 1: return '좋음';
        case 2: return '보통';
        case 3: return '나쁨';
        case 4: return '매우나쁨';
        default: return '정보없음';
      }
    };
    
    airQualityData.pm10Status = gradeToText(airQualityData.pm10Grade);
    airQualityData.pm25Status = gradeToText(airQualityData.pm25Grade);
    
    console.log(`[getAirQualityData] 응답: ${JSON.stringify(airQualityData)}`);
    return airQualityData;
  } catch (error) {
    console.error('미세먼지 데이터 가져오기 오류:', error);
    return DUMMY_DATA.air_quality;
  }
};

// 자외선 지수 데이터 가져오기 함수
const getUVIndexData = async (lon, lat) => {
  console.log(`[getUVIndexData] 요청: lon=${lon}, lat=${lat}`);
  
  // 더미 데이터 사용 시 더미 데이터 반환
  if (USE_DUMMY_DATA) {
    console.log('[getUVIndexData] 더미 데이터 사용');
    return DUMMY_DATA.uv_index;
  }
  
  try {
    // 자외선 지수 API 사용 예시 (실제로는 API 키와 URL을 설정해야 함)
    // 해당 지역의 자외선 지수 정보 가져오기
    // 자외선 지수는 날씨 데이터와 다른 API를 사용해야 할 수 있음
    
    // 실제 API 요청 코드:
    // const response = await axios.get(UV_INDEX_API_URL, {
    //   params: {
    //     serviceKey: API_KEY,
    //     areaNo: '1100000000', // 지역코드
    //     time: getCurrentTime(),
    //     dataType: 'json'
    //   }
    // });
    
    // 더미 데이터에 시간에 따른 변동성 추가
    const hour = new Date().getHours();
    let baseUVIndex;
    
    // 시간대별 기본 자외선 지수 (0~11 사이 값)
    if (hour >= 10 && hour <= 16) {
      // 오전 10시부터 오후 4시까지는 높은 자외선
      baseUVIndex = 6 + Math.floor(Math.random() * 3); // 6-8
    } else if ((hour >= 7 && hour < 10) || (hour > 16 && hour <= 19)) {
      // 이른 아침과 늦은 오후는 중간 자외선
      baseUVIndex = 3 + Math.floor(Math.random() * 3); // 3-5
    } else {
      // 밤과 이른 아침은 낮은 자외선
      baseUVIndex = Math.floor(Math.random() * 3); // 0-2
    }
    
    const uvIndexData = {
      uvIndex: baseUVIndex,
      uvGrade: 0  // 등급 정보
    };
    
    // 등급 설정 (0-2: 낮음, 3-5: 보통, 6-7: 높음, 8-10: 매우높음, 11이상: 위험)
    if (uvIndexData.uvIndex <= 2) uvIndexData.uvGrade = 1;
    else if (uvIndexData.uvIndex <= 5) uvIndexData.uvGrade = 2;
    else if (uvIndexData.uvIndex <= 7) uvIndexData.uvGrade = 3;
    else if (uvIndexData.uvIndex <= 10) uvIndexData.uvGrade = 4;
    else uvIndexData.uvGrade = 5;
    
    // 자외선 등급에 따른 텍스트 설명 추가
    const gradeToText = (grade) => {
      switch(grade) {
        case 1: return '낮음';
        case 2: return '보통';
        case 3: return '높음';
        case 4: return '매우높음';
        case 5: return '위험';
        default: return '정보없음';
      }
    };
    
    uvIndexData.uvStatus = gradeToText(uvIndexData.uvGrade);
    
    console.log(`[getUVIndexData] 응답: ${JSON.stringify(uvIndexData)}`);
    return uvIndexData;
  } catch (error) {
    console.error('자외선 지수 데이터 가져오기 오류:', error);
    return DUMMY_DATA.uv_index;
  }
};

module.exports = {
  getNowcastObservation,
  getShortTermForecast,
  getNowcastForecast,
  getTodayDate,
  getCurrentTime,
  getUltraSrtFcstTime,
  getVilageFcstTime,
  convertToGrid,
  getAirQualityData,
  getUVIndexData
}; 