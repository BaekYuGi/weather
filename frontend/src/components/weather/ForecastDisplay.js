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

const ForecastList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ForecastItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 6px;
  background-color: #f8f9fa;
  
  &:nth-child(even) {
    background-color: #f1f2f6;
  }
`;

const TimeInfo = styled.div`
  flex: 1;
  min-width: 100px;
  font-weight: 500;
  color: #34495e;
`;

const WeatherInfo = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.5rem;
`;

const WeatherText = styled.span`
  color: #3498db;
`;

const TemperatureInfo = styled.div`
  flex: 1;
  text-align: right;
  font-weight: 500;
  color: #e74c3c;
`;

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

// 시간 포맷 함수
const formatTime = (timeString) => {
  // 입력이 undefined인 경우 처리
  if (!timeString) return '시간 정보 없음';
  
  // 날짜 형식인 경우 (YYYY-MM-DD)
  if (typeof timeString === 'string' && timeString.includes('-')) {
    const date = new Date(timeString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
  
  // 시간 형식인 경우 (HH:MM)
  return timeString;
};

// 온도 정보 포맷 함수 추가
const formatTemperature = (temperature, isShortTerm) => {
  if (!temperature) return '온도 정보 없음';
  
  if (isShortTerm && typeof temperature === 'object') {
    const min = temperature.min !== undefined ? temperature.min : '?';
    const max = temperature.max !== undefined ? temperature.max : '?';
    return `${min}°C / ${max}°C`;
  }
  
  return `${temperature}°C`;
};

// 날씨 정보 포맷 함수 추가
const formatWeather = (weather) => {
  if (!weather) return '날씨 정보 없음';
  return weather;
};

const ForecastDisplay = ({ forecastData, isShortTerm = false }) => {
  if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) {
    return (
      <Container>
        <Title>날씨 예보 데이터가 없습니다</Title>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>{isShortTerm ? '내일부터 3일간 예보' : '초단기 예보 (6시간)'}</Title>
      
      <ForecastList>
        {forecastData.map((item, index) => {
          // 아이템이 null이거나 undefined인 경우 건너뛰기
          if (!item) return null;
          
          const timeDisplay = formatTime(isShortTerm ? item.date : item.time);
          const weatherDisplay = formatWeather(item.weather);
          const temperatureDisplay = formatTemperature(item.temperature, isShortTerm);
          
          return (
            <ForecastItem key={index}>
              <TimeInfo>{timeDisplay}</TimeInfo>
              <WeatherInfo>
                <WeatherIcon>{getWeatherIcon(item.weather)}</WeatherIcon>
                <WeatherText>{weatherDisplay}</WeatherText>
              </WeatherInfo>
              <TemperatureInfo>{temperatureDisplay}</TemperatureInfo>
            </ForecastItem>
          );
        })}
      </ForecastList>
    </Container>
  );
};

export default ForecastDisplay; 