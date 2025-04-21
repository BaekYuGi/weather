import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
`;

const WeatherContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Temperature = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const WeatherStatus = styled.div`
  font-size: 1.5rem;
  color: #3498db;
  margin-bottom: 1.5rem;
`;

const WeatherDetails = styled.div`
  width: 100%;
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
  margin-top: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #7f8c8d;
`;

const DetailValue = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

// 추가: 미세먼지 및 자외선 지수 정보를 보여주는 섹션
const AirQualitySection = styled.div`
  width: 100%;
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
  margin-top: 1rem;
`;

const AirQualityTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #2c3e50;
`;

const AirQualityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const AirQualityItem = styled.div`
  background-color: ${props => getStatusColor(props.$status)};
  padding: 0.8rem;
  border-radius: 6px;
  text-align: center;
`;

const AirQualityValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
`;

const AirQualityLabel = styled.div`
  font-size: 0.8rem;
  color: white;
  margin-top: 0.3rem;
`;

const UVIndexSection = styled.div`
  width: 100%;
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
  margin-top: 1rem;
`;

// 미세먼지, 자외선 상태에 따른 배경색 결정 함수
const getStatusColor = (status) => {
  switch(status) {
    case '좋음':
    case '낮음':
      return '#27ae60'; // 초록색
    case '보통':
      return '#3498db'; // 파란색
    case '나쁨':
    case '높음':
      return '#f39c12'; // 주황색
    case '매우나쁨':
    case '매우높음':
    case '위험':
      return '#e74c3c'; // 빨간색
    default:
      return '#95a5a6'; // 회색
  }
};

// 날씨 아이콘 매핑 (간단한 이모지 사용)
const getWeatherIcon = (weather) => {
  if (!weather) return '🌈';
  
  const lowercaseWeather = weather.toLowerCase();
  
  if (lowercaseWeather.includes('맑음')) return '☀️';
  if (lowercaseWeather.includes('구름조금')) return '🌤️';
  if (lowercaseWeather.includes('구름많음') || lowercaseWeather.includes('흐림')) return '☁️';
  if (lowercaseWeather.includes('비')) return '🌧️';
  if (lowercaseWeather.includes('눈')) return '❄️';
  if (lowercaseWeather.includes('번개') || lowercaseWeather.includes('뇌우')) return '⚡';
  
  return '🌈';
};

// 미세먼지 레벨을 판단하는 함수
const getDustLevel = (pm10Value) => {
  if (!pm10Value && pm10Value !== 0) return { text: '정보 없음', level: 'unknown' };
  
  if (pm10Value <= 30) return { text: '좋음', level: 'good' };
  if (pm10Value <= 80) return { text: '보통', level: 'moderate' };
  if (pm10Value <= 150) return { text: '나쁨', level: 'unhealthy' };
  return { text: '매우 나쁨', level: 'very-unhealthy' };
};

// 자외선 레벨을 판단하는 함수
const getUVLevel = (uvValue) => {
  if (!uvValue && uvValue !== 0) return { text: '정보 없음', level: 'unknown' };
  
  if (uvValue <= 2) return { text: '낮음', level: 'good' };
  if (uvValue <= 5) return { text: '보통', level: 'moderate' };
  if (uvValue <= 7) return { text: '높음', level: 'unhealthy' };
  if (uvValue <= 10) return { text: '매우 높음', level: 'very-unhealthy' };
  return { text: '위험', level: 'hazardous' };
};

const WeatherDisplay = ({ weatherData }) => {
  if (!weatherData) {
    return (
      <Container>
        <Title>날씨 정보를 불러오는 중입니다...</Title>
      </Container>
    );
  }
  
  const { temperature, weather, humidity, windSpeed, pm10, pm25, pm10Status, pm25Status, uvIndex, uvStatus } = weatherData;
  
  const dustInfo = getDustLevel(pm10);
  const uvInfo = getUVLevel(uvIndex);
  
  return (
    <Container>
      <Title>현재 날씨 정보</Title>
      
      <WeatherContent>
        <Temperature>{temperature}°C</Temperature>
        <WeatherStatus>
          {getWeatherIcon(weather)} {weather}
        </WeatherStatus>
        
        <WeatherDetails>
          <DetailRow>
            <DetailLabel>습도</DetailLabel>
            <DetailValue>{humidity || 0}%</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>풍속</DetailLabel>
            <DetailValue>{windSpeed || 0}m/s</DetailValue>
          </DetailRow>
        </WeatherDetails>
        
        {/* 미세먼지 정보 표시 */}
        {(pm10 || pm25) && (
          <AirQualitySection>
            <AirQualityTitle>미세먼지 정보</AirQualityTitle>
            <AirQualityGrid>
              <AirQualityItem $status={pm10Status}>
                <AirQualityValue>{pm10}</AirQualityValue>
                <AirQualityLabel>미세먼지(PM10) - {pm10Status}</AirQualityLabel>
              </AirQualityItem>
              <AirQualityItem $status={pm25Status}>
                <AirQualityValue>{pm25}</AirQualityValue>
                <AirQualityLabel>초미세먼지(PM2.5) - {pm25Status}</AirQualityLabel>
              </AirQualityItem>
            </AirQualityGrid>
          </AirQualitySection>
        )}
        
        {/* 자외선 지수 정보 표시 */}
        {uvIndex !== undefined && (
          <UVIndexSection>
            <AirQualityTitle>자외선 지수</AirQualityTitle>
            <AirQualityItem $status={uvStatus}>
              <AirQualityValue>{uvIndex}</AirQualityValue>
              <AirQualityLabel>자외선 지수 - {uvStatus}</AirQualityLabel>
            </AirQualityItem>
          </UVIndexSection>
        )}
      </WeatherContent>
    </Container>
  );
};

export default WeatherDisplay; 