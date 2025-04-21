import React, { useState } from 'react';
import styled from 'styled-components';
import ForecastDisplay from '../weather/ForecastDisplay';
import ClothingRecommendation from './ClothingRecommendation';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ForecastTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  text-align: center;
`;

const ForecastContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TimeSelectContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const TimeButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 4px;
  background-color: ${props => props.active ? '#3498db' : '#f1f2f6'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.3s ease;
  margin: 0.25rem;
  
  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#e5e6ea'};
  }
`;

const SplitView = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ForecastSection = styled.div`
  flex: 1;
`;

const RecommendationSection = styled.div`
  flex: 1;
`;

// 시간 포맷 함수
const formatTimeForDisplay = (timeString) => {
  // 날짜 형식인 경우 (YYYY-MM-DD)
  if (timeString && timeString.includes('-')) {
    const date = new Date(timeString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
  
  // 시간 형식인 경우 (HH:MM)
  return timeString || '';
};

const ForecastRecommendation = ({ forecastData }) => {
  const isShortTerm = forecastData?.forecastType === '단기 예보';
  const recommendations = forecastData?.recommendations || [];
  
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  
  const handleTimeSelect = (index) => {
    setSelectedTimeIndex(index);
  };
  
  if (!forecastData || !recommendations || recommendations.length === 0) {
    return (
      <Container>
        <ForecastTitle>예보 데이터를 불러오는 중입니다...</ForecastTitle>
      </Container>
    );
  }
  
  // 선택된 시간대의 추천 정보
  const selectedRecommendation = recommendations[selectedTimeIndex];
  
  return (
    <Container>
      <ForecastContainer>
        <ForecastTitle>
          {isShortTerm ? '단기 예보 (3일)' : '초단기 예보 (6시간)'} 및 옷차림 추천
        </ForecastTitle>
        
        <TimeSelectContainer>
          {recommendations.map((item, index) => (
            <TimeButton
              key={index}
              active={selectedTimeIndex === index}
              onClick={() => handleTimeSelect(index)}
            >
              {formatTimeForDisplay(item.time)}
            </TimeButton>
          ))}
        </TimeSelectContainer>
        
        <SplitView>
          <ForecastSection>
            <ForecastDisplay 
              forecastData={[recommendations[selectedTimeIndex].weatherData]} 
              isShortTerm={isShortTerm} 
            />
          </ForecastSection>
          
          <RecommendationSection>
            <ClothingRecommendation recommendation={selectedRecommendation.recommendation} />
          </RecommendationSection>
        </SplitView>
      </ForecastContainer>
    </Container>
  );
};

export default ForecastRecommendation; 