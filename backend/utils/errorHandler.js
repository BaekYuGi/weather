/**
 * 에러 핸들링을 위한 유틸리티 함수들
 */

/**
 * API 응답에서 에러를 처리합니다.
 * @param {object} res - Express 응답 객체
 * @param {Error} error - 발생한 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 */
const handleError = (res, error, defaultMessage = '서버 오류가 발생했습니다.') => {
  console.error('에러 발생:', error);
  
  // API 응답 에러인 경우
  if (error.response && error.response.data) {
    return res.status(error.response.status || 500).json({
      success: false,
      error: error.response.data.message || defaultMessage,
      details: error.response.data
    });
  }
  
  // 유효성 검사 에러인 경우
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: '유효성 검사 오류',
      details: error.message
    });
  }
  
  // API 키 관련 에러인 경우
  if (error.message && error.message.includes('API key')) {
    return res.status(401).json({
      success: false,
      error: 'API 키 오류',
      details: error.message
    });
  }
  
  // 기본 에러 응답
  res.status(500).json({
    success: false,
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

/**
 * 비동기 요청 래퍼 함수
 * 비동기 컨트롤러를 try-catch로 감싸는 헬퍼 함수
 * @param {Function} fn - 비동기 컨트롤러 함수
 * @returns {Function} - 래핑된 함수
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    handleError(res, error);
  });
};

/**
 * 필수 환경 변수 검증
 * @param {string[]} requiredVars - 필요한 환경 변수 배열
 * @returns {string[]} - 누락된 환경 변수 배열
 */
const validateEnvVariables = (requiredVars) => {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  return missingVars;
};

module.exports = {
  handleError,
  asyncHandler,
  validateEnvVariables
}; 