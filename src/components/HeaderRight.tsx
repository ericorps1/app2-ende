import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../theme/platformTheme';
import { PanelNotifications } from './PanelNotifications';
import { AuthContext } from '../context/AuthContext';
import { NumberNotification } from './NumberNotification';
import endeApi from '../api/estudianteAPI';
import { addNotifications } from '../features/notifications/dataNotificationsSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getNotificationsService } from '../services/PushNotificationsService';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/core';

export const HeaderRight = () => {
  const dispatch = useAppDispatch();
  const { data_alumno } = useContext( AuthContext );
  const [actividadesPendientes, setActividadesPendientes] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const width = useWindowDimensions().width-100;
  const notifications = useAppSelector(state => state.datanotifications);
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  }
  useFocusEffect(
    useCallback(() => {
      getActividadesPendientes();
      return () => {};
    }, []) // Dependencias vacías si no necesitas recargar por cambios de estado
  );
  useEffect(() => {
    getNotifications();
    return () => {}
  }, [])

  const getActividadesPendientes = async() => {
    const {data} = await endeApi.get(`notificaciones_actividad/${data_alumno?.id_alu}`);
    if(data.trans){
      setActividadesPendientes(data.data);
      setLoading(false);
    }
  }

  const getNotifications = async() => {
    const data = await getNotificationsService(data_alumno?.id_alu);
    dispatch(addNotifications(data))
  }

  return (
    <View style={styles.container}>
      <View 
        style={{...styles.iconContainer, backgroundColor: showNotifications ? colors.darkBlue : colors.softSilver}}
        onTouchEnd={toggleNotifications}
      >
        <FontAwesome5Icon 
          name={'bell'}
          style={{...styles.icon, color: showNotifications ? colors.softSilver : colors.darkBlue}}
        />
        <NumberNotification pressed={toggleNotifications}/>
      </View>
      {showNotifications && (
      <View style={{...styles.contentNotifications, width}}>
        <PanelNotifications
          actividadesPendientes={actividadesPendientes}
          notifications={notifications}
          loading={loading}
        />
      </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 15,
  },
  iconContainer: {
    position: 'relative',
    borderRadius: 50,
    overflow: 'hidden',
    padding: 5,
    width: 40,
    height: 40,
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
      fontSize: 25,
  },
  contentNotifications: {
    backgroundColor: colors.white,
    borderRadius: 5,
    position: 'absolute',
    top: 40,
    right: 0,
    zIndex: 1,
    padding: 5,
    elevation: 10,
    borderWidth: 1,
  }
})
