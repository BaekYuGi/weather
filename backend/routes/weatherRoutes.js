const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// 현재 날씨 데이터 가져오기
router.get('/current', weatherController.getCurrentWeather);

// 단기 예보 데이터 가져오기
router.get('/forecast/short', weatherController.getShortTermForecast);

// 초단기 예보 데이터 가져오기
router.get('/forecast/now', weatherController.getNowcastForecast);

module.exports = router; 