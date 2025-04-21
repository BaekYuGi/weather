import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #3498db;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const NavItem = styled.li`
  margin-left: 1.5rem;
  
  a {
    color: white;
    font-weight: 500;
    transition: color 0.3s ease;
    
    &:hover {
      color: #f0f0f0;
    }
  }
  
  @media (max-width: 768px) {
    margin-left: 1rem;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Nav>
        <Logo>날씨 옷 추천</Logo>
        <NavLinks>
          <NavItem>
            <Link to="/">홈</Link>
          </NavItem>
          <NavItem>
            <Link to="/weather">날씨 및 옷차림</Link>
          </NavItem>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 
 