import React, { useContext } from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { LoginScreen } from '../screens/LoginScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import MenuNavigator from './MenuNavigator';
import PagoDetalle from '../screens/PagoDetalle';
import { Home } from '../screens/Home';
import { BloqueDetalle } from '../screens/BloqueDetalle';
import { WebViewFullScreen } from '../components/WebViewFullScreen';
import { Foro } from '../screens/Foro';
import { Entregable } from '../screens/Entregable';
import { Examen } from '../screens/Examen';
import { ExamenRespuesta } from '../screens/ExamenRespuesta';
import { ChatSala } from '../screens/ChatSala';
import { JitsiMeetScreen } from '../screens/JitsiMeetScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationDetailScreen } from '../screens/NotificationDetailScreen';
import DocumentationDetails from '../components/DocumentationDetails';


const Stack = createStackNavigator();

export const Navigator = () => {
  const { status } = useContext( AuthContext );
  const { theme, colors: themeColors } = useTheme();
  const colorScheme = useColorScheme();
  
  // 🌙 Detectar dark mode
  const isDarkMode = theme === 'dark' || colorScheme === 'dark';

  if ( status === 'checking' ) return <LoadingScreen />

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: isDarkMode ? themeColors.background : 'white'
        }
      }}
    >

      {
        (status !== 'authenticated') 
          ? (
            <>
              <Stack.Screen name="LoginScreen" component={ LoginScreen } />
            </>
          )
          : (
            <>
              <Stack.Screen name="ProtectedScreen" component={ MenuNavigator } />
              <Stack.Screen name="PagoDetalle" component={ PagoDetalle } />
              <Stack.Screen name="Home" component={ Home } />
              <Stack.Screen name="BloqueDetalle" component={ BloqueDetalle } />
              <Stack.Screen name="WebViewFullScreen" component={ WebViewFullScreen } />
              <Stack.Screen name="Foro" component={ Foro } />
              <Stack.Screen name="Entregable" component={ Entregable } />
              <Stack.Screen name="Examen" component={ Examen } />
              
              {/* 🔥 EXAMEN RESPUESTA - CONFIGURACIÓN ESPECIAL */}
              <Stack.Screen 
                name="ExamenRespuesta" 
                component={ ExamenRespuesta }
                options={{
                  gestureEnabled: false, // 🚫 Deshabilitar swipe back
                  detachPreviousScreen: true, // 🗑️ Desmontar pantalla anterior
                  cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // 🎬 Animación que oculta la anterior
                }}
              />
              
              <Stack.Screen name="ChatSala" component={ ChatSala } />
              <Stack.Screen name="JitsiMeetScreen" component={ JitsiMeetScreen } />
              <Stack.Screen name="Notificaciones" component={ NotificationsScreen } />
              <Stack.Screen name="DetalleNotificacion" component={ NotificationDetailScreen } />
              <Stack.Screen name="DocumentationDetails" component={ DocumentationDetails } />
            </>          
          )
      }

    </Stack.Navigator>
  );
}