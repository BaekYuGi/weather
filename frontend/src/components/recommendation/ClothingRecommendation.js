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

const TemperatureCategory = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background-color: #f1f2f6;
  border-radius: 4px;
  font-weight: 500;
  color: #3498db;
`;

const ClothingSection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
`;

const SectionIcon = styled.span`
  margin-right: 0.5rem;
`;

const ItemsList = styled.ul`
  list-style: none;
  padding-left: 1rem;
`;

const Item = styled.li`
  margin-bottom: 0.4rem;
  color: #34495e;
  display: flex;
  align-items: center;
  
  &:before {
    content: '•';
    margin-right: 0.5rem;
    color: #3498db;
  }
`;

const TipsContainer = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
`;

const Tip = styled.p`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// 온도 카테고리에 따른 텍스트 반환
const getTemperatureCategoryText = (category) => {
  const categoryMap = {
    veryHot: '매우 더움 (28°C 이상)',
    hot: '더움 (23°C ~ 27°C)',
    warm: '따뜻함 (20°C ~ 22°C)',
    mild: '쾌적함 (17°C ~ 19°C)',
    cool: '선선함 (12°C ~ 16°C)',
    chilly: '쌀쌀함 (9°C ~ 11°C)',
    cold: '추움 (5°C ~ 8°C)',
    veryCold: '매우 추움 (4°C 이하)'
  };
  
  return categoryMap[category] || '알 수 없음';
};

// 카테고리별 아이콘
const getCategoryIcon = (category) => {
  switch (category) {
    case 'top': return '👕';
    case 'bottom': return '👖';
    case 'outer': return '🧥';
    case 'accessory': return '🧣';
    default: return '👔';
  }
};

const ClothingRecommendation = ({ recommendation }) => {
  if (!recommendation) {
    return (
      <Container>
        <Title>옷 추천 정보를 불러오는 중입니다...</Title>
      </Container>
    );
  }
  
  const { temperatureCategory, top, bottom, outer, accessory, tips } = recommendation;
  
  return (
    <Container>
      <Title>오늘의 옷차림 추천</Title>
      
      <TemperatureCategory>
        {getTemperatureCategoryText(temperatureCategory)}
      </TemperatureCategory>
      
      <ClothingSection>
        <SectionTitle>
          <SectionIcon>{getCategoryIcon('top')}</SectionIcon>
          상의
        </SectionTitle>
        <ItemsList>
          {top && top.length > 0 ? (
            top.map((item, index) => <Item key={index}>{item}</Item>)
          ) : (
            <Item>추천 상의가 없습니다</Item>
          )}
        </ItemsList>
      </ClothingSection>
      
      <ClothingSection>
        <SectionTitle>
          <SectionIcon>{getCategoryIcon('bottom')}</SectionIcon>
          하의
        </SectionTitle>
        <ItemsList>
          {bottom && bottom.length > 0 ? (
            bottom.map((item, index) => <Item key={index}>{item}</Item>)
          ) : (
            <Item>추천 하의가 없습니다</Item>
          )}
        </ItemsList>
      </ClothingSection>
      
      {outer && outer.length > 0 && (
        <ClothingSection>
          <SectionTitle>
            <SectionIcon>{getCategoryIcon('outer')}</SectionIcon>
            아우터
          </SectionTitle>
          <ItemsList>
            {outer.map((item, index) => (
              <Item key={index}>{item}</Item>
            ))}
          </ItemsList>
        </ClothingSection>
      )}
      
      {accessory && accessory.length > 0 && (
        <ClothingSection>
          <SectionTitle>
            <SectionIcon>{getCategoryIcon('accessory')}</SectionIcon>
            액세서리
          </SectionTitle>
          <ItemsList>
            {accessory.map((item, index) => (
              <Item key={index}>{item}</Item>
            ))}
          </ItemsList>
        </ClothingSection>
      )}
      
      {tips && tips.length > 0 && (
        <TipsContainer>
          {tips.map((tip, index) => (
            <Tip key={index}>💡 {tip}</Tip>
          ))}
        </TipsContainer>
      )}
    </Container>
  );
};

export default ClothingRecommendation; 