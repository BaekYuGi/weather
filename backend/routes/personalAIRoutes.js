const express = require('express');
const router = express.Router();
const personalAIController = require('../controllers/personalAIController');

// 개인 AI 의류 추천 받기
router.get('/recommend', personalAIController.getPersonalClothingRecommendation);

// 예보 기반 미래 의류 추천
router.get('/forecast', personalAIController.getForecastRecommendation);

// AI와 대화하기
router.post('/chat', personalAIController.chatWithAI);

// 사용자 선호도 업데이트
router.post('/preferences', personalAIController.updateUserPreferences);

module.exports = router; 