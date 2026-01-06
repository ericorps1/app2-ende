import 'react-native-reanimated';
import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/es';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { Navigator } from './src/navigator/Navigator';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StripeWrapper } from './src/components/StripeWrapper';
import { ThemeProvider } from './src/context/ThemeContext'; // 👈 NUEVA LÍNEA

if (Platform.OS === 'android') {
  const emitter = new NativeEventEmitter(NativeModules.RNDeviceInfo || {});
}

const AppState = ({ children }: any) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StripeWrapper>
          <PaperProvider>
            {children}
          </PaperProvider>
        </StripeWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppState>
          <Navigator />
        </AppState>
      </NavigationContainer>
    </Provider>
  );
};

export default App;