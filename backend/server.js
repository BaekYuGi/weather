const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const weatherRoutes = require('./routes/weatherRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const personalAIRoutes = require('./routes/personalAIRoutes');
const perplexityRoutes = require('./routes/perplexityRoutes');

// 환경변수 설정
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/weather', weatherRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/personal-ai', personalAIRoutes);
app.use('/api/perplexity', perplexityRoutes);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 