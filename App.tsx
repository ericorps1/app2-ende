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
import { Provider as PaperProvider } from 'react-native-paper';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StripeWrapper } from './src/components/StripeWrapper';


if (Platform.OS === 'android') {
  const emitter = new NativeEventEmitter(NativeModules.RNDeviceInfo || {});
}

const AppState = ({ children }: any ) => {
  const stripePublicKey = 'pk_test_51RHXUyAcHsnqDT52c8XwdDgYDBYfxCSXVl3htjeXO0uVQynX6ekTgSQ92P2XJid8Jtemx3RRrIdUkTo1GrFez6Sd005MRtMOMs';
  return (
    <AuthProvider>
      <StripeWrapper>
        <PaperProvider>
          { children }
        </PaperProvider>
      </StripeWrapper>
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