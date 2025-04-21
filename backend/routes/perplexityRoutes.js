const express = require('express');
const router = express.Router();
const perplexityController = require('../controllers/perplexityController');

/**
 * Perplexity API 라우트
 * @route /api/perplexity
 */

// 날씨 기반 옷차림 추천
router.post('/clothing', perplexityController.getClothingRecommendation);

// 패션 트렌드 정보 조회
router.get('/trends', perplexityController.getFashionTrends);

module.exports = router; 