/**
 * 날씨에 따른 의류 추천 시스템
 * 온도, 날씨 상태, 습도 등을 고려하여 적절한 의류를 추천합니다.
 */

// 온도 기반 의류 추천 기준
const temperatureClothingMap = {
  veryHot: {
    range: { min: 28, max: Infinity },
    recommendations: {
      top: ['반팔 티셔츠', '민소매 티셔츠'],
      bottom: ['반바지', '얇은 면바지'],
      outer: [],
      accessory: ['모자', '선글라스', '선크림']
    }
  },
  hot: {
    range: { min: 23, max: 27 },
    recommendations: {
      top: ['반팔 티셔츠', '얇은 셔츠'],
      bottom: ['반바지', '얇은 면바지'],
      outer: [],
      accessory: ['모자', '선글라스']
    }
  },
  warm: {
    range: { min: 20, max: 22 },
    recommendations: {
      top: ['얇은 긴팔 티셔츠', '얇은 셔츠'],
      bottom: ['면바지', '청바지'],
      outer: ['얇은 가디건'],
      accessory: []
    }
  },
  mild: {
    range: { min: 17, max: 19 },
    recommendations: {
      top: ['긴팔 티셔츠', '셔츠'],
      bottom: ['면바지', '청바지'],
      outer: ['가디건', '얇은 자켓'],
      accessory: []
    }
  },
  cool: {
    range: { min: 12, max: 16 },
    recommendations: {
      top: ['긴팔 티셔츠', '맨투맨', '니트'],
      bottom: ['청바지', '슬랙스'],
      outer: ['자켓', '가디건', '야상'],
      accessory: ['목도리']
    }
  },
  chilly: {
    range: { min: 9, max: 11 },
    recommendations: {
      top: ['니트', '긴팔 티셔츠', '맨투맨'],
      bottom: ['청바지', '슬랙스', '기모 바지'],
      outer: ['트렌치코트', '야상', '자켓'],
      accessory: ['목도리']
    }
  },
  cold: {
    range: { min: 5, max: 8 },
    recommendations: {
      top: ['히트텍', '니트', '기모 맨투맨'],
      bottom: ['기모 바지', '청바지'],
      outer: ['코트', '가죽자켓', '두꺼운 자켓'],
      accessory: ['목도리', '장갑', '비니']
    }
  },
  veryCold: {
    range: { min: -Infinity, max: 4 },
    recommendations: {
      top: ['히트텍', '기모 맨투맨', '니트'],
      bottom: ['기모 바지', '두꺼운 청바지'],
      outer: ['패딩', '두꺼운 코트', '롱패딩'],
      accessory: ['목도리', '장갑', '귀마개', '비니']
    }
  }
};

// 날씨 상태에 따른 추가 추천 항목
const weatherConditionItems = {
  '비': {
    outer: ['우산', '비옷', '방수 자켓'],
    accessory: ['방수 신발', '레인부츠']
  },
  '눈': {
    outer: ['우산', '방수 자켓', '두꺼운 패딩'],
    accessory: ['방한 장갑', '방수 신발', '부츠']
  },
  '흐림': {
    outer: ['자켓'],
    accessory: ['우산(비가 올 수 있음)']
  }
};

/**
 * 온도에 맞는 의류 카테고리를 찾습니다.
 * @param {number} temperature - 현재 온도 (섭씨)
 * @returns {object} - 해당 온도에 적합한 의류 카테고리
 */
const getTemperatureCategory = (temperature) => {
  for (const [category, data] of Object.entries(temperatureClothingMap)) {
    if (temperature >= data.range.min && temperature <= data.range.max) {
      return { category, data };
    }
  }
  return { category: 'mild', data: temperatureClothingMap.mild }; // 기본값
};

/**
 * 날씨 상태에 따른 추가 아이템을 가져옵니다.
 * @param {string} weatherCondition - 날씨 상태 (맑음, 흐림, 비, 눈 등)
 * @returns {object|null} - 해당 날씨에 필요한 추가 아이템
 */
const getWeatherConditionItems = (weatherCondition) => {
  // 날씨 상태에 특정 키워드가 포함되어 있는지 확인
  for (const [condition, items] of Object.entries(weatherConditionItems)) {
    if (weatherCondition.includes(condition)) {
      return items;
    }
  }
  return null;
};

/**
 * 날씨 데이터를 기반으로 의류를 추천합니다.
 * @param {object} weatherData - 날씨 데이터 (온도, 날씨 상태 등)
 * @returns {object} - 추천 의류 목록
 */
const getRecommendation = (weatherData) => {
  try {
    const { temperature, weather, humidity } = weatherData;
    
    // 온도에 따른 기본 의류 추천
    const { category, data } = getTemperatureCategory(temperature);
    let recommendation = {
      ...data.recommendations,
      temperature: temperature,
      temperatureCategory: category,
      weather: weather
    };
    
    // 날씨 상태에 따른 추가 아이템
    const additionalItems = getWeatherConditionItems(weather);
    if (additionalItems) {
      recommendation.outer = [...recommendation.outer, ...additionalItems.outer];
      recommendation.accessory = [...recommendation.accessory, ...additionalItems.accessory];
    }
    
    // 습도가 높을 경우 추가 고려사항
    if (humidity > 70) {
      recommendation.tips = ['습도가 높으니 통풍이 잘되는 옷을 선택하세요.'];
    }
    
    return recommendation;
  } catch (error) {
    console.error('의류 추천 생성 오류:', error);
    throw new Error('의류 추천을 생성할 수 없습니다.');
  }
};

module.exports = {
  getRecommendation
}; 