import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #2c3e50;
  color: white;
  padding: 1.5rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  margin: 0;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const FooterLink = styled.a`
  color: #ecf0f1;
  transition: color 0.3s ease;
  
  &:hover {
    color: #3498db;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          &copy; {new Date().getFullYear()} 날씨 옷 추천 서비스. 모든 권리 보유.
        </Copyright>
        <FooterLinks>
          <FooterLink href="#">이용약관</FooterLink>
          <FooterLink href="#">개인정보처리방침</FooterLink>
          <FooterLink href="#">문의하기</FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 
 