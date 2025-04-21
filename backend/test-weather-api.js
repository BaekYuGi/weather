// 기상청 API 테스트 스크립트
const { 
  getNowcastObservation,
  getShortTermForecast, 
  getNowcastForecast,
  getTodayDate,
  getCurrentTime,
  getUltraSrtFcstTime,
  getVilageFcstTime,
  convertToGrid
} = require('./utils/weatherApiUtils');

// 서울 좌표 (경도, 위도)
const lon = 126.9780;
const lat = 37.5665;

// 날짜 및 시간 출력
console.log('==== 날짜 및 시간 정보 ====');
console.log('오늘 날짜:', getTodayDate());
console.log('초단기실황 시간:', getCurrentTime());
console.log('초단기예보 시간:', getUltraSrtFcstTime());
console.log('단기예보 시간:', getVilageFcstTime());

// 격자 변환 테스트
console.log('\n==== 격자 변환 테스트 ====');
const grid = convertToGrid(lon, lat);
console.log(`서울 좌표 (경도:${lon}, 위도:${lat})의 격자값:`, grid);

// API 호출 테스트 함수
async function testWeatherAPI() {
  try {
    console.log('\n==== 초단기실황 조회 테스트 ====');
    const nowcastObservation = await getNowcastObservation(lon, lat);
    console.log('초단기실황 결과:', JSON.stringify(nowcastObservation, null, 2));

    console.log('\n==== 초단기예보 조회 테스트 ====');
    const nowcastForecast = await getNowcastForecast(lon, lat);
    console.log('초단기예보 결과 (첫 2개 항목):', JSON.stringify(nowcastForecast.slice(0, 2), null, 2));
    console.log(`총 ${nowcastForecast.length}개 항목 조회됨`);

    console.log('\n==== 단기예보 조회 테스트 ====');
    const shortTermForecast = await getShortTermForecast(lon, lat);
    console.log('단기예보 결과 (첫 2개 항목):', JSON.stringify(shortTermForecast.slice(0, 2), null, 2));
    console.log(`총 ${shortTermForecast.length}개 항목 조회됨`);
    
    console.log('\n==== 테스트 완료 ====');
  } catch (error) {
    console.error('API 테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
testWeatherAPI(); 