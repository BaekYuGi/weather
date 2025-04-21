import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastType, setForecastType] = useState('nowcast'); // 'nowcast' 또는 'short'

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 접근 권한이 필요합니다');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      fetchWeatherData(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      // API 서버 URL - 컴퓨터의 IP 주소로 변경
      const baseUrl = 'http://192.168.1.123:5000'; // 여기에 컴퓨터 IP 주소 입력
      
      const weatherResponse = await axios.get(`${baseUrl}/api/weather/current`, {
        params: { lat: latitude, lon: longitude }
      });
      
      setWeatherData(weatherResponse.data);
      
      // 초단기 예보 데이터 가져오기
      fetchForecastData(latitude, longitude, forecastType);
    } catch (error) {
      console.error('날씨 데이터 가져오기 오류:', error);
      setErrorMsg('날씨 데이터를 가져오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async (latitude, longitude, type) => {
    try {
      const baseUrl = 'http://192.168.1.123:5000'; // 여기에 컴퓨터 IP 주소 입력
      const endpoint = type === 'nowcast' ? '/api/weather/forecast/now' : '/api/weather/forecast/short';
      
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        params: { lat: latitude, lon: longitude }
      });
      
      setForecastData(response.data);
    } catch (error) {
      console.error('예보 데이터 가져오기 오류:', error);
    }
  };

  const toggleForecastType = () => {
    const newType = forecastType === 'nowcast' ? 'short' : 'nowcast';
    setForecastType(newType);
    if (location) {
      fetchForecastData(location.coords.latitude, location.coords.longitude, newType);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>날씨 정보를 가져오는 중...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>날씨 정보</Text>
        {location && (
          <Text style={styles.subtitle}>
            위치: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      
      {weatherData && (
        <View style={styles.weatherCard}>
          <Text style={styles.weatherTemp}>{weatherData.temperature}°C</Text>
          <Text style={styles.weatherDesc}>{weatherData.weather}</Text>
          <Text style={styles.weatherInfo}>습도: {weatherData.humidity}%</Text>
          <Text style={styles.weatherInfo}>풍속: {weatherData.windSpeed}m/s</Text>
        </View>
      )}
      
      <View style={styles.forecastHeader}>
        <TouchableOpacity 
          style={[styles.typeButton, forecastType === 'nowcast' && styles.activeButton]} 
          onPress={() => toggleForecastType()}
        >
          <Text style={forecastType === 'nowcast' ? styles.activeButtonText : styles.buttonText}>6시간 예보</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeButton, forecastType === 'short' && styles.activeButton]} 
          onPress={() => toggleForecastType()}
        >
          <Text style={forecastType === 'short' ? styles.activeButtonText : styles.buttonText}>3일 예보</Text>
        </TouchableOpacity>
      </View>
      
      {forecastData && forecastData.length > 0 && (
        <View style={styles.forecastList}>
          <Text style={styles.forecastTitle}>
            {forecastType === 'nowcast' ? '초단기 예보 (6시간)' : '단기 예보 (3일)'}
          </Text>
          
          {forecastData.map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastTime}>
                {forecastType === 'nowcast' ? item.time : new Date(item.date).toLocaleDateString()}
              </Text>
              <Text style={styles.forecastWeather}>{item.weather}</Text>
              <Text style={styles.forecastTemp}>
                {forecastType === 'nowcast' 
                  ? `${item.temperature}°C` 
                  : `${item.temperature.min}°C / ${item.temperature.max}°C`}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  weatherDesc: {
    fontSize: 24,
    color: '#3498db',
    marginVertical: 10,
  },
  weatherInfo: {
    fontSize: 16,
    color: '#7f8c8d',
    marginVertical: 5,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f1f2f6',
  },
  activeButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#2c3e50',
  },
  activeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  forecastList: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  forecastTime: {
    flex: 1,
    fontSize: 16,
    color: '#34495e',
  },
  forecastWeather: {
    flex: 1,
    fontSize: 16,
    color: '#3498db',
    textAlign: 'center',
  },
  forecastTemp: {
    flex: 1,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'right',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
}); 