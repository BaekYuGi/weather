// API 엔드포인트 설정
const config = {
  // 개발 환경일 때는 로컬 서버 사용, 프로덕션(GitHub Pages)일 때는 실제 API 서버 URL 사용
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://weather-api.baekyugi.com/api' // 프로덕션용 API URL (실제 서버 URL로 대체 필요)
    : '' // 개발 환경에서는 package.json의 proxy 설정 사용
};

export default config; 