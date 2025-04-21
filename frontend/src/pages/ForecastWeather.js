import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import LocationSelector from '../components/weather/LocationSelector';
import ForecastDisplay from '../components/weather/ForecastDisplay';
import ForecastRecommendation from '../components/recommendation/ForecastRecommendation';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

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

const ForecastTypeSelector = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
`;

const TypeButton = styled.button`
  padding: 0.8rem 1.5rem;
  margin: 0 0.5rem;
  background-color: ${props => props.active ? '#3498db' : '#f1f2f6'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border-radius: 4px;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#e5e6ea'};
  }
`;

const ContentContainer = styled.div`
  margin-top: 2rem;
`;

const ForecastWeather = () => {
  const [location, setLocation] = useState(null);
  const [forecastType, setForecastType] = useState('nowcast'); // 'nowcast' 또는 'short'
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 위치 정보 가져오기
  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };
  
  // 예보 타입 변경
  const handleForecastTypeChange = (type) => {
    setForecastType(type);
  };
  
  // 위치 정보와 예보 타입이 있을 때 날씨 데이터 가져오기
  useEffect(() => {
    const fetchForecastData = async () => {
      if (!location) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const endpoint = forecastType === 'nowcast' 
          ? '/api/recommendations/clothes/forecast'
          : '/api/recommendations/clothes/forecast?type=short';
        
        const response = await axios.get(endpoint, {
          params: {
            lat: location.latitude,
            lon: location.longitude,
            type: forecastType
          }
        });
        
        setForecastData(response.data);
      } catch (err) {
        console.error('날씨 예보 데이터 가져오기 오류:', err);
        setError('날씨 예보 데이터를 가져오는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchForecastData();
  }, [location, forecastType]);
  
  return (
    <PageContainer>
      <PageTitle>날씨 예보 기반 옷차림 추천</PageTitle>
      
      <LocationSelector onLocationSelect={handleLocationSelect} />
      
      <ForecastTypeSelector>
        <TypeButton 
          active={forecastType === 'nowcast'} 
          onClick={() => handleForecastTypeChange('nowcast')}
        >
          초단기 예보 (6시간)
        </TypeButton>
        <TypeButton 
          active={forecastType === 'short'} 
          onClick={() => handleForecastTypeChange('short')}
        >
          단기 예보 (3일)
        </TypeButton>
      </ForecastTypeSelector>
      
      {loading && <LoadingSpinner />}
      
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && forecastData && (
        <ContentContainer>
          <ForecastRecommendation forecastData={forecastData} />
        </ContentContainer>
      )}
    </PageContainer>
  );
};

export default ForecastWeather; 