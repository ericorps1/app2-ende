import React, { useContext, useEffect, useState } from 'react'
import { Text, useWindowDimensions, View } from 'react-native'
import cafeApi from '../api/estudianteAPI';
import { CardActividadPendiente } from './CardActividadPendiente';
import { ActividadPendiente } from '../interfaces/appInterfaces';
import { AuthContext } from '../context/AuthContext';
import { LoadingScreen } from '../screens/LoadingScreen';

interface PropsPanelNotifications {
  actividadesPendientes: ActividadPendiente[];
  loading: boolean;
}

export const PanelNotifications = ({actividadesPendientes, loading}:PropsPanelNotifications) => {
  return (
    <>
      {
        actividadesPendientes.length>0 ?
          actividadesPendientes.map((actividadPendiente:ActividadPendiente)=>
            <CardActividadPendiente
              key={actividadPendiente.id}
              actividadPendiente={actividadPendiente}
              viewType='mini'
            />
          )
        :
          loading ? 
            (<View style={{marginVertical: 20}}>
              <LoadingScreen text='Cargando notificaciones...'/>
            </View>)
          :
            <View style={{marginVertical: 20}}>
              <Text style={{textAlign: 'center', marginHorizontal: 20}}>
                No hay actividades pendientes
              </Text>
            </View>
        }
    </>
  )
}
