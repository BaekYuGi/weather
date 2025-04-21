const perplexityService = require('../services/perplexityService');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Perplexity API 관련 컨트롤러
 */
const perplexityController = {
  /**
   * 날씨 기반 옷차림 추천을 제공합니다.
   * @route GET /api/perplexity/clothing
   */
  getClothingRecommendation: asyncHandler(async (req, res) => {
    const { weatherData, userPreferences } = req.body;
    
    if (!weatherData) {
      return res.status(400).json({
        success: false,
        message: '날씨 데이터가 필요합니다.'
      });
    }
    
    const result = await perplexityService.getClothingRecommendation(
      weatherData,
      userPreferences || {}
    );
    
    return res.status(200).json(result);
  }),
  
  /**
   * 패션 트렌드 정보를 제공합니다.
   * @route GET /api/perplexity/trends
   */
  getFashionTrends: asyncHandler(async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: '검색 쿼리가 필요합니다.'
      });
    }
    
    const result = await perplexityService.getFashionTrends(query);
    
    return res.status(200).json(result);
  })
};

module.exports = perplexityController; 