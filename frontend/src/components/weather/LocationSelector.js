import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// 스타일 컴포넌트 정의
const SelectorContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.2rem;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  flex: 1;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.p`
  margin-top: 1rem;
  color: ${props => props.error ? '#e74c3c' : '#7f8c8d'};
  font-size: 0.9rem;
`;

const PresetLocations = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
`;

const PresetTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #34495e;
`;

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.8rem;
`;

const LocationButton = styled.button`
  padding: 0.6rem;
  background-color: #f1f2f6;
  color: #2c3e50;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e5e6ea;
  }
`;

const MapContainer = styled.div`
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  height: 300px;
`;

const FallbackMapContainer = styled.div`
  margin-top: 1.5rem;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f1f2f6;
  border-radius: 8px;
  color: #2c3e50;
  text-align: center;
`;

const PositionInfo = styled.div`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const AddressInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f1f2f6;
  border-radius: 6px;
  color: #2c3e50;
`;

// 주요 도시 목록 (위도, 경도 정보 포함)
const PRESET_LOCATIONS = [
  { name: '서울', latitude: 37.5665, longitude: 126.9780 },
  { name: '부산', latitude: 35.1796, longitude: 129.0756 },
  { name: '인천', latitude: 37.4563, longitude: 126.7052 },
  { name: '대구', latitude: 35.8714, longitude: 128.6014 },
  { name: '광주', latitude: 35.1595, longitude: 126.8526 },
  { name: '대전', latitude: 36.3504, longitude: 127.3845 },
  { name: '울산', latitude: 35.5384, longitude: 129.3114 },
  { name: '제주', latitude: 33.4996, longitude: 126.5312 }
];

const LocationSelector = ({ onLocationSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [kakaoMapsAvailable, setKakaoMapsAvailable] = useState(false);
  const [Map, setMap] = useState(null);
  const [MapMarker, setMapMarker] = useState(null);
  
  // 카카오맵 geocoder 서비스 참조
  const geocoder = useRef(null);
  
  // 카카오맵 SDK 로드
  useEffect(() => {
    const loadKakaoMap = () => {
      // 이미 로드된 경우 건너뜀
      if (window.kakao && window.kakao.maps) {
        setKakaoMapsAvailable(true);
        return;
      }
      
      const script = document.createElement('script');
      // 환경변수에서 API 키 가져오기
      const apiKeyFromEnv = process.env.REACT_APP_KAKAO_MAP_API_KEY;
      // 하드코딩된 API 키 (테스트용)
      const apiKey = 'd4bb1b8851988258f6b5507acbe5c6d6';
      
      // API 키 로드 확인
      console.log('Kakao Maps API Key 상태:', {
        apiKeyFromEnv,
        apiKeyUsed: apiKey
      });
      
      script.type = 'text/javascript';
      // 프로토콜을 명시적으로 지정 (//dapi.kakao.com 대신 https://dapi.kakao.com 사용)
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      script.async = true;
      
      script.onload = () => {
        // SDK 로드 후 초기화
        if (window.kakao && window.kakao.maps) {
          console.log('Kakao Maps SDK 로드 성공');
          window.kakao.maps.load(() => {
            try {
              // react-kakao-maps-sdk와 유사한 인터페이스 제공
              const CustomMap = ({ center, children, style, level, ...props }) => {
                const mapRef = useRef(null);
                const mapInstance = useRef(null);
                const markerRef = useRef(null);
                
                useEffect(() => {
                  if (mapRef.current) {
                    // 맵이 이미 생성되어 있으면 중심점만 변경
                    if (mapInstance.current) {
                      // 맵 중심점 변경
                      const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
                      mapInstance.current.setCenter(newCenter);
                      
                      // 기존 마커 제거
                      if (markerRef.current) {
                        markerRef.current.setMap(null);
                      }
                      
                      // 새 마커 생성
                      markerRef.current = new window.kakao.maps.Marker({
                        position: newCenter,
                        map: mapInstance.current
                      });
                    } 
                    // 맵이 없으면 새로 생성
                    else {
                      const options = {
                        center: new window.kakao.maps.LatLng(center.lat, center.lng),
                        level
                      };
                      mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
                      
                      // 맵 객체가 생성된 후에 마커를 직접 생성합니다
                      markerRef.current = new window.kakao.maps.Marker({
                        position: new window.kakao.maps.LatLng(center.lat, center.lng),
                        map: mapInstance.current
                      });
                    }
                  }
                }, [center, level]);
                
                return <div ref={mapRef} style={style} {...props}></div>;
              };
              
              // MarkerComponent는 사용하지 않고 맵에 직접 마커를 표시합니다
              const CustomMapMarker = () => {
                return null;
              };
              
              setMap(() => CustomMap);
              setMapMarker(() => CustomMapMarker);
              setKakaoMapsAvailable(true);
              console.log('Kakao Maps 초기화 성공');
            } catch (error) {
              console.error('카카오맵 초기화 오류:', error);
              setKakaoMapsAvailable(false);
            }
          });
        } else {
          console.error('Kakao Maps SDK는 로드되었지만 window.kakao.maps가 존재하지 않습니다');
          setKakaoMapsAvailable(false);
        }
      };
      
      script.onerror = (error) => {
        console.error('카카오맵 SDK 로드 실패:', error);
        setKakaoMapsAvailable(false);
      };
      
      document.head.appendChild(script);
    };
    
    loadKakaoMap();
  }, []);
  
  // 주소 정보 가져오기 (OpenStreetMap Nominatim API 사용)
  const getAddressFromCoordsOSM = async (lat, lng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name);
      } else {
        setAddress('주소를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('주소 정보 가져오기 실패:', error);
      setAddress('주소를 가져오는 중 오류가 발생했습니다');
    }
  };
  
  // 주소 정보 가져오기
  const getAddressFromCoords = (lat, lng) => {
    if (kakaoMapsAvailable && window.kakao && window.kakao.maps) {
      if (!geocoder.current) {
        geocoder.current = new window.kakao.maps.services.Geocoder();
      }
      
      geocoder.current.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          if (result[0].road_address) {
            setAddress(result[0].road_address.address_name);
          } else {
            setAddress(result[0].address.address_name);
          }
        } else {
          setAddress('주소를 찾을 수 없습니다');
        }
      });
    } else {
      // Kakao Maps가 없을 경우 OpenStreetMap API 사용
      getAddressFromCoordsOSM(lat, lng);
    }
  };
  
  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('브라우저에서 위치 정보를 지원하지 않습니다.');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: '현재 위치'
        };
        
        setCurrentLocation(location);
        onLocationSelect(location);
        getAddressFromCoords(location.latitude, location.longitude);
        setLoading(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('위치 정보 접근 권한이 거부되었습니다.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다.');
            break;
          case error.TIMEOUT:
            setError('위치 정보 요청 시간이 초과되었습니다.');
            break;
          default:
            setError('위치 정보를 가져오는 중 오류가 발생했습니다.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };
  
  // 사전 정의된 위치 선택
  const selectPresetLocation = (location) => {
    setCurrentLocation(location);
    onLocationSelect(location);
    getAddressFromCoords(location.latitude, location.longitude);
  };
  
  // 컴포넌트 마운트 시 자동으로 위치 정보 요청
  useEffect(() => {
    getCurrentLocation();
  }, []);
  
  return (
    <SelectorContainer>
      <Title>위치 정보</Title>
      
      <ButtonContainer>
        <Button 
          onClick={getCurrentLocation} 
          disabled={loading}
        >
          {loading ? '위치 가져오는 중...' : '내 위치 사용하기'}
        </Button>
      </ButtonContainer>
      
      {error && <StatusMessage error>{error}</StatusMessage>}
      
      {currentLocation && (
        <>
          <StatusMessage>
            현재 선택된 위치: {currentLocation.name} ({currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)})
          </StatusMessage>
          
          {kakaoMapsAvailable && Map && MapMarker ? (
            <MapContainer>
              <Map
                center={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                style={{ width: "100%", height: "100%" }}
                level={3}
              />
            </MapContainer>
          ) : (
            <FallbackMapContainer>
              <PositionInfo>
                현재 위치 ({currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)})
              </PositionInfo>
              <div>지도를 표시할 수 없습니다. Kakao Maps API 키를 확인해주세요.</div>
            </FallbackMapContainer>
          )}
          
          {address && (
            <AddressInfo>
              <strong>도로명 주소:</strong> {address}
            </AddressInfo>
          )}
        </>
      )}
      
      <PresetLocations>
        <PresetTitle>주요 도시 선택</PresetTitle>
        <LocationGrid>
          {PRESET_LOCATIONS.map(location => (
            <LocationButton 
              key={location.name}
              onClick={() => selectPresetLocation(location)}
            >
              {location.name}
            </LocationButton>
          ))}
        </LocationGrid>
      </PresetLocations>
    </SelectorContainer>
  );
};

export default LocationSelector; 