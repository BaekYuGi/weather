import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import CurrentWeather from './pages/CurrentWeather';
import './App.css';

function App() {
  return (
    <Router basename="/weather">
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/current" element={<CurrentWeather />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 
 