import { View, Text } from 'react-native'
import React from 'react'

import { Cuenta } from '../screens/Cuenta';
import { Home } from '../screens/Home';
import { Notificaciones } from '../screens/Notificaciones';
import { Materias } from '../screens/Materias';
import { Mensajes } from '../screens/Mensajes';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pagos } from '../screens/Pagos';

const Tab = createBottomTabNavigator();

export default function BottomNavbar() {
  return (
    <Tab.Navigator>

        <Tab.Screen
            name="Inicio"
            component={Home}
            options={{
                tabBarLabel: "Inicio",
            }}
        />
        

        <Tab.Screen
            name="Cuenta"
            component={Cuenta}
            options={{
                tabBarLabel: "Cuenta",
            }}
        />

        <Tab.Screen
            name="Pagos"
            component={Pagos}
            options={{
                tabBarLabel: "Pagos",
            }}
        />


        <Tab.Screen
            name="Mensajes"
            component={Mensajes}
            options={{
                tabBarLabel: "Mensajes",
            }}
        />

        <Tab.Screen
            name="Notificaciones"
            component={Notificaciones}
            options={{
                tabBarLabel: "Notificaciones",
            }}
        />

        
        
        
    </Tab.Navigator>
  )
}