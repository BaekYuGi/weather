import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
`;

const HomeTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #3498db;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HomeSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  color: #7f8c8d;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto 3rem auto;
`;

const FeatureTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const FeatureDescription = styled.p`
  color: #7f8c8d;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <HomeTitle>날씨에 맞는 옷차림을 추천해 드립니다</HomeTitle>
      <HomeSubtitle>
        기상청 API와 인공지능 기술을 활용하여 현재 위치의 날씨에 가장 적합한 옷차림을 추천해 드립니다.
        더 이상 옷을 고르느라 고민하지 마세요!
      </HomeSubtitle>
      
      <FeatureCard>
        <FeatureTitle>날씨 기반 맞춤 옷차림 추천</FeatureTitle>
        <FeatureDescription>
          현재 위치의 실시간 날씨 정보와 앞으로의 날씨 예보를 한 번에! 
          지금 바로 입기 좋은 옷과 앞으로의 날씨 변화를 미리 확인하고 계획하세요.
        </FeatureDescription>
        <ActionButton to="/current">날씨 확인 및 옷차림 추천 받기</ActionButton>
      </FeatureCard>

    </HomeContainer>
  );
};

export default Home; 