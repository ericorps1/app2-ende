import React, {useContext, useState, useEffect } from 'react'
import { Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView, Linking } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { WhiteLogo } from '../components/WhiteLogo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import cafeApi from '../api/estudianteAPI';
import PaperMessages from '../components/PaperMessages';
import { colors, platformTheme } from '../theme/platformTheme';
import { ActividadesPendientes } from '../components/ActividadesPendientes';
import { AvisosEstudiante } from '../components/AvisosEstudiante';
import { baseUrlSite } from '../hooks/useGlobal';
import {requestUserPermission,NotificationListener} from '../utils/pushnotification_helper'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { PagosAnticipadosVencidos } from '../components/PagosAnticipadosVencidos';
import { getMessaging } from '@react-native-firebase/messaging';
import endeApi from '../api/estudianteAPI';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addNotifications } from '../features/notifications/dataNotificationsSlice';
import { useNavigation } from "@react-navigation/core";
import { updateStatusNotificationService } from '../services/PushNotificationsService';
import { LoadingScreen } from './LoadingScreen';
import { set } from '@jitsi/react-native-sdk/react/features/base/redux/functions';

export const Home = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { data_alumno, token, logOut } = useContext( AuthContext );
  const [ setRefreshing] = useState(false);
  const [encuestasPendientes, setEncuestasPendientes] = useState([])
  const [setTokenOtroUsuario] = useState(false)
  const notifications = useAppSelector(state => state.datanotifications);

  useEffect(() => {
    validarToken();
    NotificationListener();
    getEncuestasAlumno();
    const unsubscribe = getMessaging().onMessage(async remoteMessage => {
      const id_not = remoteMessage?.data?.not_id ?? 0;
      await updateStatusNotificationService(id_not, 'Recibida');
      await updateNotifications();
    });
    const unsubscribe2 = getMessaging().onNotificationOpenedApp(async remoteMessage => {//evento cuando se oprime en la notificación recibida en el dispositivo
      await updateNotifications();
      console.log(
        'Se abrio la app desde la notificación:',
        remoteMessage,
      );
      const notification = typeof remoteMessage?.data?.notification === 'string' 
        ? JSON.parse(remoteMessage?.data?.notification) 
        : null;
      if(notification){
        navigation.navigate('DetalleNotificacion', { notification })
      }
    });
    return () => {
      setEncuestasPendientes([]);
      unsubscribe();
      unsubscribe2();
    }
  }, [])

  const updateNotifications = async () => {
    const {data} = await endeApi.get(`notificaciones/${data_alumno?.id_alu}`);
    if(data.trans){
      if(data.data.length > 0){
        dispatch(addNotifications(data.data))
      }
    }
  }

  const validarToken = async () => {
      await requestUserPermission();
      const token = await AsyncStorage.getItem('fcmtoken');
      const {data} = await cafeApi.get('push_notification/validarToken', {params:{token, usuario: data_alumno?.id_alu}});
      if(data.trans && token!==null){
          if(!data.miUsuario){//Si no ha sido asignado a otro usuario y no ha sido asignado a mi usuario lo asigno a mi usuario
              await vincularUsuario();
          }
      }
  }

  const getEncuestasAlumno = async () => {
      const {data} = await cafeApi.get(`encuestas/encuestasPendientes/${data_alumno?.id_alu}/${data_alumno?.id_cad1}/${data_alumno?.id_pla8}`);
      if(data.trans){
          setEncuestasPendientes(data.data)
      }
  }

  const vincularUsuario = async () => {
      const token = await AsyncStorage.getItem('fcmtoken');
      if(token && data_alumno?.id_alu){//Si existe el token ya sea desde el AsyncStorage o generado desde firebase, se asocia al usuario en la base de datos (dispositivo -> usuario)
          const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
          let dataDesv = true;
          if(dataDesv){
              const deviceInfo = {
                  deviceId: await DeviceInfo.getDeviceId(),
                  model: DeviceInfo.getModel(),
                  brand: DeviceInfo.getBrand(),
                  systemName: DeviceInfo.getSystemName(),
                  systemVersion: DeviceInfo.getSystemVersion(),
                  uniqueId: DeviceInfo.getUniqueId(),
              };
              await cafeApi.post('/push_notification/vincularUsuarioToken', {token, usuario: data_alumno?.id_alu, deviceInfo: JSON.stringify(deviceInfo)}, headers);//Se quita el token a cualquier usuario que ya lo tenga asignado.
          }
          // console.log('Guardar token en la bd');
      }
  }

  return (
      <SafeAreaView style={styles.container}>
          <ScrollView>
              {/* <WhiteLogo /> */}
              <AvisosEstudiante/>
              <ActividadesPendientes/>
              <PagosAnticipadosVencidos/>
          </ScrollView>
          <PaperMessages
            visible={encuestasPendientes.length>0}
            title='Encuestas pendientes'
            message=<Text>Tu opinion es lo más importante para nosotros. Ayúdanos a mejorar la experiencia ENDE.</Text>
            buttonText='RESPONDER ENCUESTAS'
            dismissable={true}
            colorTitle={colors.blue}
            colorBody={colors.darkBlue}
            pressButton = { () => {Linking.openURL(baseUrlSite);setEncuestasPendientes([])} }
            btnTxtCancel='AHORA NO'
            evtBtnCancel={() => setEncuestasPendientes([])}
            styleButton={platformTheme.btnBlue}
            styleBtnCancel={platformTheme.btnSilver}
          />
      </SafeAreaView>
      
  )
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    title: {
        fontSize: 20,
        marginBottom: 20
    },

    card_1: {
        borderRadius: 20,
        backgroundColor: "#ffffff",
        flex: 1,
        alignItems: 'center',
        padding: 30,
        width: 350,
        margin: 10
        
    }
});