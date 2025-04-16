import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../context/AuthContext';

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


const Stack = createStackNavigator();

export const Navigator = () => {
  const { status } = useContext( AuthContext );

  if ( status === 'checking' ) return <LoadingScreen />



  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: 'white'
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
              <Stack.Screen name="ExamenRespuesta" component={ ExamenRespuesta } />
              <Stack.Screen name="ChatSala" component={ ChatSala } />
              <Stack.Screen name="JitsiMeetScreen" component={ JitsiMeetScreen } />
            </>          
          )
      }

    </Stack.Navigator>
  );
}