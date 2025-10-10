import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import endeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { ActividadPendiente } from '../interfaces/appInterfaces';
import { colors, platformTheme } from '../theme/platformTheme';
import { CardActividadPendiente } from './CardActividadPendiente';
import { LoadingScreen } from '../screens/LoadingScreen';
import { useFocusEffect } from '@react-navigation/native';

export const ActividadesPendientes = () => {
  const [loadingAct, setLoadingAct] = useState(false);
  const [actividadesPendientes, setActividadesPendientes] = useState([]);
  const { data_alumno } = useContext( AuthContext );
  const [viewContent, setViewContent] = useState(true)
  
  useFocusEffect(
    useCallback(() => {
      getActividadesPendientes();
      
      return () => {};
    }, []) // Dependencias vacías si no necesitas recargar por cambios de estado
  );
  
  const getActividadesPendientes = async() => {
    setLoadingAct(true);
    const {data} = await endeApi.get(`notificaciones_actividad/${data_alumno?.id_alu}`);
    if(data.trans){
      setActividadesPendientes(data.data);
    }
    setLoadingAct(false);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.containerTitleActPend, 
          {
            borderBottomStartRadius: viewContent ? 0 : 10,
            borderBottomEndRadius: viewContent ? 0 : 10,
          }
        ]}
        activeOpacity={0.9}
        onPress={() => setViewContent(!viewContent)}
      >
        <Text style={styles.textTitle}>Actividades pendientes</Text>
        
        {actividadesPendientes.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {actividadesPendientes.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={[styles.containerActPend, {height: viewContent ? 'auto' : 0, opacity: viewContent ? 1 : 0}]}>
        {
          loadingAct ? 
            <View style={{marginVertical: 20}}>
              <LoadingScreen text='Cargando actividades pendientes...'/>
            </View>
          :
            actividadesPendientes.length > 0 ?
              actividadesPendientes.map((actividadPendiente: ActividadPendiente) =>
                <CardActividadPendiente
                  key={actividadPendiente.id}
                  actividadPendiente={actividadPendiente}
                  viewType='normal'
                />
              )
            :
              <View style={{marginVertical: 20}}>
                <Text style={{textAlign: 'center', marginHorizontal: 20}}>Actualmente no presenta actividades pendientes</Text>
              </View>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...platformTheme.shadowBox,
    padding: 10,
  },
  containerTitleActPend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    height: 50,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
  },
  textTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  containerActPend: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.primary,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: 'white',
  }
});