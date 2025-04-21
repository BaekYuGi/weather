import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  background-color: #fff8f8;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  color: #c0392b;
`;

const ErrorTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const ErrorIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.1rem;
`;

const ErrorText = styled.p`
  font-size: 0.9rem;
  margin: 0;
`;

const ErrorMessage = ({ message, title = '오류가 발생했습니다' }) => {
  return (
    <ErrorContainer>
      <ErrorTitle>
        <ErrorIcon>⚠️</ErrorIcon>
        {title}
      </ErrorTitle>
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
};

export default ErrorMessage; 