import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

// Expo에서 실행 중인지 확인
if ('expo' in global.navigator) {
  // Expo를 통해 실행 중인 경우
  registerRootComponent(App);
} else {
  // 네이티브 빌드로 실행 중인 경우
  AppRegistry.registerComponent('WeatherApp', () => App);
}

// 아래의 코드는 개발 환경에서만 작동합니다
if (__DEV__) {
  console.log('Running in development mode');
} 