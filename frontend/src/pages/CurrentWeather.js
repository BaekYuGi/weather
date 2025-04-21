import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import LocationSelector from '../components/weather/LocationSelector';
import WeatherDisplay from '../components/weather/WeatherDisplay';
import ForecastDisplay from '../components/weather/ForecastDisplay';
import ClothingRecommendation from '../components/recommendation/ClothingRecommendation';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import config from '../config';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const WeatherSection = styled.section`
  flex: 1;
  min-width: 300px;
`;

const RecommendationSection = styled.section`
  flex: 1;
  min-width: 300px;
`;

const ForecastSection = styled.section`
  width: 100%;
  margin-top: 2rem;
`;

const ForecastTypeSelector = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
`;

const TypeButton = styled.button`
  padding: 0.8rem 1.5rem;
  margin: 0 0.5rem;
  background-color: ${props => props.$active ? '#3498db' : '#f1f2f6'};
  color: ${props => props.$active ? 'white' : '#2c3e50'};
  border-radius: 4px;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$active ? '#2980b9' : '#e5e6ea'};
  }
`;

const CurrentWeather = () => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastType, setForecastType] = useState('nowcast'); // 'nowcast' 또는 'short'
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);

  // 위치 정보 가져오기
  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  // 예보 타입 변경
  const handleForecastTypeChange = (type) => {
    setForecastType(type);
  };

  // 위치 정보가 있을 때 날씨 데이터 가져오기
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/weather/current`, {
          params: {
            lat: location.latitude,
            lon: location.longitude
          }
        });

        setWeatherData(response.data);

        // 옷 추천 데이터 가져오기
        const recommendResponse = await axios.get(`${config.API_BASE_URL}/api/recommendations/clothes/current`, {
          params: {
            lat: location.latitude,
            lon: location.longitude
          }
        });

        setRecommendation(recommendResponse.data.recommendation);
      } catch (err) {
        console.error('날씨 데이터 가져오기 오류:', err);
        setError('날씨 데이터를 가져오는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  // 날씨 예보 데이터 가져오기
  useEffect(() => {
    const fetchForecastData = async () => {
      if (!location) return;
      
      setForecastLoading(true);
      setForecastError(null);
      
      try {
        // API 엔드포인트 선택
        const endpoint = forecastType === 'nowcast' 
          ? `${config.API_BASE_URL}/api/weather/forecast/now`
          : `${config.API_BASE_URL}/api/weather/forecast/short`;
        
        console.log(`Fetching forecast from ${endpoint} for type: ${forecastType}`);
        
        const response = await axios.get(endpoint, {
          params: {
            lat: location.latitude,
            lon: location.longitude
          }
        });
        
        console.log(`${forecastType} forecast data:`, response.data);
        
        // 응답 데이터 형식 처리
        let processedData = response.data;
        
        // 백엔드 응답이 recommendation 프로퍼티 안에 데이터를 담고 있는 경우
        if (response.data && response.data.forecast) {
          processedData = response.data.forecast;
        }
        
        // 데이터 유효성 확인
        if (!Array.isArray(processedData)) {
          console.error('Forecast data is not an array:', processedData);
          setForecastError('예보 데이터 형식이 올바르지 않습니다.');
          setForecastData(null);
          return;
        }
        
        if (processedData.length === 0) {
          console.warn('Forecast data array is empty');
          setForecastError('예보 데이터가 없습니다.');
          setForecastData(null);
          return;
        }
        
        setForecastData(processedData);
      } catch (err) {
        console.error('날씨 예보 데이터 가져오기 오류:', err);
        setForecastError('날씨 예보 데이터를 가져오는 중에 오류가 발생했습니다.');
        setForecastData(null);
      } finally {
        setForecastLoading(false);
      }
    };
    
    fetchForecastData();
  }, [location, forecastType]);

  return (
    <PageContainer>
      <PageTitle>날씨 정보 및 옷차림 추천</PageTitle>
      
      <LocationSelector onLocationSelect={handleLocationSelect} />
      
      {loading && <LoadingSpinner />}
      
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && weatherData && recommendation && (
        <ContentContainer>
          <WeatherSection>
            <WeatherDisplay weatherData={weatherData} />
          </WeatherSection>
          
          <RecommendationSection>
            <ClothingRecommendation recommendation={recommendation} />
          </RecommendationSection>
        </ContentContainer>
      )}
      
      {/* 날씨 예보 섹션 추가 */}
      <ForecastSection>
        <ForecastTypeSelector>
          <TypeButton 
            $active={forecastType === 'nowcast'} 
            onClick={() => handleForecastTypeChange('nowcast')}
          >
            초단기 예보 (6시간)
          </TypeButton>
          <TypeButton 
            $active={forecastType === 'short'} 
            onClick={() => handleForecastTypeChange('short')}
          >
            단기 예보 (3일)
          </TypeButton>
        </ForecastTypeSelector>
        
        {forecastLoading && <LoadingSpinner />}
        
        {forecastError && <ErrorMessage message={forecastError} />}
        
        {!forecastLoading && !forecastError && forecastData && (
          <ForecastDisplay 
            forecastData={forecastData} 
            isShortTerm={forecastType === 'short'} 
          />
        )}
      </ForecastSection>
    </PageContainer>
  );
};

export default CurrentWeather; 