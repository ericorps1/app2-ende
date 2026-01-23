import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { CardActividadPendiente } from './CardActividadPendiente';
import { ActividadPendiente, Notification } from '../interfaces/appInterfaces';
import { LoadingScreen } from '../screens/LoadingScreen';
import { CardNotification } from './CardNotification';
import { useNavigation } from "@react-navigation/core";
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext'; // 👈 IMPORTAR

interface PropsPanelNotifications {
  actividadesPendientes: ActividadPendiente[];
  notifications: Notification[]
  loading: boolean;
}

export const PanelNotifications = ({actividadesPendientes, notifications, loading}:PropsPanelNotifications) => {
  const { colors: themeColors } = useTheme(); // 👈 HOOK
  const navigation = useNavigation<any>();
  
  if(loading)
    return (<View style={{marginVertical: 20}}>
      <LoadingScreen text='Cargando notificaciones...'/>
    </View>)

  return (
    <ScrollView style={{height: 600}}>
      {
        notifications.length > 0 &&
          notifications.map((notification:Notification)=>
            <CardNotification
              key={'notification'+notification.id_not}
              notification={notification}
            />
          )
      }
      {
        actividadesPendientes.length > 0 &&
          actividadesPendientes.map((actividadPendiente:ActividadPendiente)=>
            <CardActividadPendiente
              key={actividadPendiente.id}
              actividadPendiente={actividadPendiente}
              viewType='mini'
            />
          )
      }
      {//Si no hay notificaciones ni actividades pendientes
        actividadesPendientes.length === 0 && notifications.length === 0 &&
          <View>
            <Text style={[styles.noNotifications, { color: themeColors.textSecondary }]}>
              No tienes ninguna notificación
            </Text>
          </View>
      }
      {//Si hay alguna notificacion mostramos opcion para ver todas las notificaciones
        notifications.length > 0 &&
          <Pressable
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <Text style={[styles.allNotifications, { color: themeColors.textPrimary }]}>
              Ver todas las notificaciones
            </Text>
          </Pressable>
      }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  noNotifications: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  allNotifications: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  }
})