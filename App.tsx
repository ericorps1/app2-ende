import 'react-native-reanimated';
import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/es'; // o 'es', 'en-US', etc.
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { Navigator } from './src/navigator/Navigator';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { Platform, NativeEventEmitter, NativeModules, View, Text } from 'react-native';


if (Platform.OS === 'android') {
  const emitter = new NativeEventEmitter(NativeModules.RNDeviceInfo || {});
}

const AppState = ({ children }: any ) => {
  return (
    <AuthProvider>
      { children }
    </AuthProvider>
  )
}


const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppState>
          <Navigator />
        </AppState>
      </NavigationContainer>
    </Provider>
  )
}


export default App;