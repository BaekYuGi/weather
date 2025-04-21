# 날씨 정보 앱 (Weather Information App)

날씨 정보 앱은 사용자의 위치에 기반한 현재 날씨, 단기 예보, 미세먼지 정보 및 자외선 지수를 제공하는 웹 애플리케이션입니다.

## 주요 기능

- **현재 날씨 정보**: 온도, 날씨 상태, 습도, 풍속 등 현재 날씨 정보 제공
- **단기 예보 (3일)**: 향후 3일간의 날씨 예보 제공
- **초단기 예보 (6시간)**: 향후 6시간 동안의 시간별 상세 날씨 정보 제공
- **미세먼지 정보**: 미세먼지(PM10) 및 초미세먼지(PM2.5) 농도 및 상태 정보
- **자외선 지수**: 현재 위치의 자외선 지수 및 등급 정보
- **위치 기반 서비스**: 사용자의 위치를 자동으로 감지하거나 특정 지역 선택 가능
- **날씨에 맞는 옷차림 추천**: 현재 날씨에 맞는 옷차림 추천 기능

## 기술 스택

### 프론트엔드
- React.js
- Styled Components
- Axios
- Kakao Maps API

### 백엔드
- Node.js
- Express.js
- 한국 기상청 API 연동
- Perplexity AI API (날씨 기반 추천 시스템)

## 설치 및 실행 방법

### 필수 조건
- Node.js (v14 이상)
- npm 또는 yarn

### 설치 과정

1. 저장소 클론
```bash
git clone https://github.com/yourusername/weather-information-app.git
cd weather-information-app
```

2. 백엔드 설정
```bash
cd backend
npm install
# .env 파일 생성 (아래 환경 변수 참조)
```

3. 프론트엔드 설정
```bash
cd frontend
npm install
```

4. 환경 변수 설정
`.env` 파일에 다음 내용 추가:
```
PORT=5000
WEATHER_API_KEY=your_weather_api_key
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

5. 애플리케이션 실행
```bash
# 백엔드 실행 (루트 디렉토리에서)
npm run backend

# 프론트엔드 실행 (다른 터미널에서)
npm run frontend
```

## API 참조

### 백엔드 API 엔드포인트

- `GET /api/weather/current` - 현재 날씨 정보
- `GET /api/weather/forecast/short` - 단기 예보 (3일)
- `GET /api/weather/forecast/now` - 초단기 예보 (6시간)
- `GET /api/recommendations/clothes/current` - 현재 날씨에 맞는 옷차림 추천
- `GET /api/perplexity/trends` - 패션 트렌드 정보

## 스크린샷

(날씨 앱 스크린샷 추가 예정)

## 추가 개발 계획

- [ ] 모바일 앱 버전 개발 (React Native)
- [ ] 일기 예보 및 특보 알림 기능
- [ ] 사용자 맞춤형 날씨 설정 및 선호도 저장
- [ ] 다국어 지원

## 라이선스

MIT License

## 기여 방법

이슈 제출 및 풀 리퀘스트를 환영합니다. 주요 변경 사항의 경우, 먼저 이슈를 열어 변경하고자 하는 내용을 논의해주세요. 
 