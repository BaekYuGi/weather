/**
 * 날씨에 따른 AI 기반 의류 추천 시스템
 * 온도, 날씨 상태, 습도 등을 고려하여 AI가 맞춤형 의류를 추천합니다.
 */

const axios = require('axios');

/**
 * AI를 활용하여 날씨에 맞는 옷을 추천하는 함수
 * @param {object} weatherData - 날씨 데이터 (온도, 날씨 상태, 습도, 바람 등)
 * @param {object} userPreferences - 사용자 선호도 정보 (선택적)
 * @returns {object} - AI 추천 의류 목록 및 스타일 제안
 */
const getAIRecommendation = async (weatherData, userPreferences = {}) => {
  try {
    // 날씨 데이터 정리
    const { temperature, weather, humidity, windSpeed } = weatherData;
    
    // 사용자 선호도 정보
    const { gender = '무관', style = '캐주얼', purpose = '일상', preferences = [] } = userPreferences;
    
    // 간단한 룰 기반 추천 (API 호출 전 기본 추천 생성)
    const basicRecommendation = getBasicRecommendation(temperature, weather);
    
    // AI 모델을 활용한 의류 추천 (내부 구현에서는 룰 기반으로 대체)
    const aiRecommendation = await getSmartRecommendation(
      weatherData,
      userPreferences,
      basicRecommendation
    );
    
    return {
      ...aiRecommendation,
      temperature,
      weather,
      humidity,
      windSpeed
    };
  } catch (error) {
    console.error('AI 의류 추천 생성 오류:', error);
    
    // 오류 발생 시 기본 추천으로 대체
    const basicRecommendation = getBasicRecommendation(
      weatherData.temperature,
      weatherData.weather
    );
    
    return {
      ...basicRecommendation,
      temperature: weatherData.temperature,
      weather: weatherData.weather,
      humidity: weatherData.humidity || 50,
      windSpeed: weatherData.windSpeed || 0,
      error: '고급 AI 추천을 생성할 수 없어 기본 추천을 제공합니다.'
    };
  }
};

/**
 * 간단한 룰 기반 추천 생성 함수
 * @param {number} temperature - 기온
 * @param {string} weather - 날씨 상태
 * @returns {object} - 기본 추천 정보
 */
const getBasicRecommendation = (temperature, weather) => {
  let recommendation = {
    top: [],
    bottom: [],
    outer: [],
    accessory: [],
    style_tip: ''
  };
  
  // 기온에 따른 의류 추천
  if (temperature >= 28) {
    // 매우 더운 날씨 (28도 이상)
    recommendation.top = ['민소매 티셔츠', '반팔 티셔츠', '린넨 셔츠'];
    recommendation.bottom = ['반바지', '린넨 팬츠', '얇은 면바지'];
    recommendation.style_tip = '통풍이 잘되는 얇고 가벼운 소재의 옷을 선택하세요. 자외선 차단에도 신경쓰세요.';
  } else if (temperature >= 23) {
    // 더운 날씨 (23-27도)
    recommendation.top = ['반팔 티셔츠', '얇은 셔츠'];
    recommendation.bottom = ['면바지', '반바지'];
    recommendation.style_tip = '가볍고 시원한 느낌의 옷을 선택하되, 실내 에어컨을 고려해 얇은 겉옷도 준비하세요.';
  } else if (temperature >= 20) {
    // 따뜻한 날씨 (20-22도)
    recommendation.top = ['얇은 긴팔 티셔츠', '얇은 셔츠'];
    recommendation.bottom = ['면바지', '청바지'];
    recommendation.outer = ['얇은 가디건'];
    recommendation.style_tip = '일교차에 대비해 얇은 겉옷을 준비하세요.';
  } else if (temperature >= 17) {
    // 온화한 날씨 (17-19도)
    recommendation.top = ['긴팔 티셔츠', '셔츠'];
    recommendation.bottom = ['청바지', '면바지'];
    recommendation.outer = ['가디건', '얇은 자켓'];
    recommendation.style_tip = '레이어링하기 좋은 날씨입니다. 체온 조절이 쉬운 옷을 여러 겹 입는 것이 좋습니다.';
  } else if (temperature >= 12) {
    // 선선한 날씨 (12-16도)
    recommendation.top = ['긴팔 티셔츠', '맨투맨', '니트'];
    recommendation.bottom = ['청바지', '슬랙스'];
    recommendation.outer = ['자켓', '가디건', '야상'];
    recommendation.style_tip = '보온성이 있는 외투가 필요한 날씨입니다. 스카프나 목도리를 활용해보세요.';
  } else if (temperature >= 9) {
    // 쌀쌀한 날씨 (9-11도)
    recommendation.top = ['니트', '맨투맨', '긴팔 티셔츠'];
    recommendation.bottom = ['기모 바지', '두꺼운 청바지'];
    recommendation.outer = ['트렌치코트', '가죽 자켓'];
    recommendation.accessory = ['목도리'];
    recommendation.style_tip = '체온을 유지할 수 있는 두꺼운 소재의 옷을 입되, 활동성도 고려하세요.';
  } else if (temperature >= 5) {
    // 추운 날씨 (5-8도)
    recommendation.top = ['히트텍', '니트', '기모 맨투맨'];
    recommendation.bottom = ['기모 바지', '두꺼운 청바지'];
    recommendation.outer = ['코트', '패딩'];
    recommendation.accessory = ['목도리', '장갑', '비니'];
    recommendation.style_tip = '체온을 보호하는 것이 중요합니다. 레이어링과 보온성 높은 아이템을 활용하세요.';
  } else {
    // 매우 추운 날씨 (4도 이하)
    recommendation.top = ['히트텍', '기모 맨투맨', '두꺼운 니트'];
    recommendation.bottom = ['기모 바지', '두꺼운 청바지'];
    recommendation.outer = ['롱패딩', '두꺼운 코트'];
    recommendation.accessory = ['두꺼운 목도리', '방한 장갑', '귀마개', '털모자'];
    recommendation.style_tip = '추위로부터 몸을 보호하는 것이 최우선입니다. 여러 겹 입고 방한 용품을 적극 활용하세요.';
  }
  
  // 날씨 상태에 따른 추가 아이템
  if (weather.includes('비')) {
    recommendation.outer.push('우산', '방수 자켓');
    recommendation.accessory.push('방수 신발');
    recommendation.style_tip += ' 비에 젖지 않는 방수 소재와 신발을 선택하세요.';
  } else if (weather.includes('눈')) {
    recommendation.outer.push('방수 패딩', '방한 부츠');
    recommendation.accessory.push('방수 장갑', '털모자');
    recommendation.style_tip += ' 눈길에 미끄러지지 않는 신발과 방수/방한 기능을 갖춘 옷을 선택하세요.';
  } else if (weather.includes('흐림')) {
    recommendation.style_tip += ' 흐린 날씨는 비가 올 수도 있으니 우산을 챙기는 것이 좋아요.';
  } else if (weather.includes('맑음')) {
    if (temperature > 20) {
      recommendation.accessory.push('선글라스', '모자');
      recommendation.style_tip += ' 자외선이 강할 수 있으니 선글라스와 자외선 차단제를 활용하세요.';
    }
  }
  
  return recommendation;
};

/**
 * AI 모델을 활용한 스마트 의류 추천 함수
 * 실제 구현에서는 OpenAI API를 사용할 수 있지만, 여기서는 고급화된 룰 기반 추천으로 대체
 */
const getSmartRecommendation = async (weatherData, userPreferences, basicRecommendation) => {
  // 실제 AI API 연동은 주석 처리
  /*
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '당신은 패션과 스타일 전문가입니다. 날씨와 사용자 취향에 맞는 옷차림을 추천해주세요.'
      },
      {
        role: 'user',
        content: `오늘 날씨: 기온 ${weatherData.temperature}도, ${weatherData.weather}, 습도 ${weatherData.humidity}%, 풍속 ${weatherData.windSpeed}m/s
        선호 스타일: ${userPreferences.style || '캐주얼'}
        성별: ${userPreferences.gender || '무관'}
        목적: ${userPreferences.purpose || '일상'}
        추가 선호사항: ${userPreferences.preferences?.join(', ') || '없음'}
        
        위 조건에 맞는 구체적인 옷차림을 추천해주세요. 상의, 하의, 겉옷, 액세서리 카테고리로 나누어 제안해주시고, 스타일링 팁도 함께 알려주세요.`
      }
    ]
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  // API 응답 파싱 및 처리
  const aiSuggestion = response.data.choices[0].message.content;
  // 응답을 파싱하여 구조화된 데이터로 변환
  */
  
  // AI API 연동 대신 고급화된 룰 기반 추천 제공
  const { gender, style, purpose } = userPreferences;
  
  // 기본 추천을 바탕으로 사용자 맞춤형 추천 생성
  let smartRecommendation = { ...basicRecommendation };
  
  // 사용자 스타일에 따른 구체적인 아이템 제안
  if (style === '캐주얼') {
    smartRecommendation.style_specific = '편안하면서도 트렌디한 캐주얼 룩을 추천합니다.';
    smartRecommendation.outfit_ideas = [
      '데님 청바지와 흰색 티셔츠의 클래식한 조합',
      '편안한 후드티와 조거 팬츠'
    ];
  } else if (style === '오피스') {
    smartRecommendation.style_specific = '전문적이면서도 편안한 오피스 룩을 추천합니다.';
    smartRecommendation.outfit_ideas = [
      '슬랙스와 단정한 블라우스/셔츠',
      '니트 스웨터와 직선적인 스커트/팬츠'
    ];
  } else if (style === '스포티') {
    smartRecommendation.style_specific = '활동적이고 기능적인 스포티 룩을 추천합니다.';
    smartRecommendation.outfit_ideas = [
      '기능성 티셔츠와 스트레치 팬츠',
      '가벼운 윈드브레이커와 트레이닝 팬츠'
    ];
  }
  
  // 목적에 따른 조언 추가
  if (purpose === '데이트') {
    smartRecommendation.purpose_tip = '편안하면서도 스타일리시한 룩으로 자신감을 표현하세요.';
  } else if (purpose === '여행') {
    smartRecommendation.purpose_tip = '레이어링이 가능하고 활동하기 편한 옷을 선택하세요.';
  } else if (purpose === '운동') {
    smartRecommendation.purpose_tip = '기능성과 쾌적함을 우선시하는 옷을 선택하세요.';
  }
  
  // 성별 특화 추천 추가
  if (gender === '남성') {
    smartRecommendation.gender_specific = '남성을 위한 맞춤형 스타일링입니다.';
  } else if (gender === '여성') {
    smartRecommendation.gender_specific = '여성을 위한 맞춤형 스타일링입니다.';
  }
  
  return {
    ...smartRecommendation,
    recommendation_type: 'AI 기반 추천'
  };
};

module.exports = {
  getAIRecommendation
}; 
 