const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// 현재 날씨 기반 옷 추천 받기
router.get('/clothes/current', recommendationController.getClothesForCurrentWeather);

// 특정 날짜/시간대 날씨 기반 옷 추천 받기
router.get('/clothes/forecast', recommendationController.getClothesForForecast);

module.exports = router; 