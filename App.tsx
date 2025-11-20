import 'react-native-reanimated';
import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/es';
import * as React from 'react';
import { StatusBar, Platform, NativeEventEmitter, NativeModules, Appearance, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme, MD3LightTheme } from 'react-native-paper';
import { Provider } from 'react-redux';
import { AuthProvider } from './src/context/AuthContext';
import { Navigator } from './src/navigator/Navigator';
import { store } from './src/app/store';
import { StripeWrapper } from './src/components/StripeWrapper';
import { useEffect, useState } from 'react';
import { colors } from './src/theme/platformTheme';

if (Platform.OS === 'android') {
  const emitter = new NativeEventEmitter(NativeModules.RNDeviceInfo || {});
}

// 🔥 FORZAR TEMA CLARO A NIVEL SISTEMA
Appearance.setColorScheme('light');

// 🔥 Tema claro personalizado para Paper (basado en MD3)
const LightPaperTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#ffffffff',
    primaryContainer: '#ffffffff',
    onPrimaryContainer: '#1A1F36',
    
    secondary: colors.success,
    onSecondary: '#ffffffff',
    
    background: '#ffffffff',
    onBackground: '#1A1F36',
    
    surface: '#ffffffff',
    onSurface: '#1A1F36',
    surfaceVariant: '#F6F9FC',
    onSurfaceVariant: '#8898AA',
    
    outline: '#ffffffff',
    outlineVariant: '#ffffffff',
    
    error: colors.error,
    onError: '#ffffffff',
    
    // Colores adicionales personalizados
    accent: colors.primary,
    text: colors.darkBlue,
    placeholder: '#ffffffff',
    disabled: '#ffffffff',
  },
};

// 🔥 Tema claro para Navigation
const LightNavTheme = {
  ...NavDefaultTheme,
  dark: false,
  colors: {
    ...NavDefaultTheme.colors,
    primary: colors.primary,
    background: '#f7f7f7ff',
    card: '#ffffffff',
    text: '#1A1F36',
    border: '#f7f7f7ff',
    notification: colors.success,
  },
};

const App = () => {
  // 🔥 Forzar que siempre sea tema claro
  const systemColorScheme = useColorScheme();
  
  useEffect(() => {
    // Utilizar siempre tema claro por defecto (forzar tema claro)
    Appearance.setColorScheme('light');
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme !== 'light') {
        Appearance.setColorScheme('light');
      }
    });
    
    return () => subscription.remove();
  }, []);

  const paperTheme = LightPaperTheme;
  const navTheme = LightNavTheme;

  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navTheme}>
          <StatusBar 
            barStyle="dark-content" 
            backgroundColor="#FFFFFF"
            translucent={false}
          />
          <AuthProvider>
            <StripeWrapper>
              <Navigator />
            </StripeWrapper>
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
};

export default App;