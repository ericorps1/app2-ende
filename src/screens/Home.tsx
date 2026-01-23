import React, { useContext, useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, SafeAreaView, Linking, View, RefreshControl, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PaperMessages from '../components/PaperMessages';
import { colors, platformTheme } from '../theme/platformTheme';
import { ActividadesPendientes } from '../components/ActividadesPendientes';
import { baseUrlSite } from '../hooks/useGlobal';
// import { requestUserPermission, NotificationListener } from '../utils/pushnotification_helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { PagosAnticipadosVencidos } from '../components/PagosAnticipadosVencidos';
// import { getMessaging } from '@react-native-firebase/messaging';
import endeApi from '../api/estudianteAPI';
import { useAppDispatch } from '../app/hooks';
import { addNotifications } from '../features/notifications/dataNotificationsSlice';
import { useNavigation } from '@react-navigation/core';
import { updateStatusNotificationService } from '../services/PushNotificationsService';
import { BannerSlider } from '../components/BannerSlider';

interface Banner {
  id: string;
  url: string;
  title?: string;
  description?: string;
  link?: string;
}

export const Home = () => {
  const { colors: themeColors } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { data_alumno } = useContext(AuthContext);
  
  const [encuestasPendientes, setEncuestasPendientes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    initializeHome();
    
    // const unsubscribeMessage = getMessaging().onMessage(handleIncomingMessage);
    // const unsubscribeOpen = getMessaging().onNotificationOpenedApp(handleNotificationOpen);
    // const unsubscribeTokenRefresh = getMessaging().onTokenRefresh(handleTokenRefresh);

    return () => {
      setEncuestasPendientes([]);
      setBanners([]);
      // unsubscribeMessage();
      // unsubscribeOpen();
      // unsubscribeTokenRefresh();
    };
  }, []);

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return 'Buenos días ☀️';
    if (hora >= 12 && hora < 19) return 'Buenas tardes 🌤️';
    return 'Buenas noches 🌙';
  };

  const getNombreAlumno = () => {
    const nombreCompleto = data_alumno?.nom_alu || '';
    const nombre = nombreCompleto.split(' ')[0];
    return nombre;
  };

  const initializeHome = async () => {
    await validarToken();
    // NotificationListener();
    await Promise.all([
      getCarruselesAlumno(),
      getEncuestasAlumno(),
      updateNotifications(),
    ]);
  };

  const getCarruselesAlumno = async () => {
    try {
      setLoadingBanners(true);
      const { data } = await endeApi.get(`/carruseles/${data_alumno?.id_alu_ram}`);
      
      if (data.trans && data.data) {
        setBanners(data.data);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.log('❌ ERROR:', error);
      setBanners([]);
    } finally {
      setLoadingBanners(false);
    }
  };

  const handleIncomingMessage = async (remoteMessage: any) => {
    const id_not = remoteMessage?.data?.not_id ?? 0;
    await updateStatusNotificationService(id_not, 'Recibida');
    await updateNotifications();
  };

  const handleNotificationOpen = async (remoteMessage: any) => {
    await updateNotifications();
    console.log('App abierta desde notificación:', remoteMessage);
    
    const notification = typeof remoteMessage?.data?.notification === 'string'
      ? JSON.parse(remoteMessage?.data?.notification)
      : null;
      
    if (notification) {
      navigation.navigate('DetalleNotificacion', { notification });
    }
  };

  const handleTokenRefresh = async (newToken: string) => {
    console.log('Nuevo token FCM:', newToken);
    try {
      await AsyncStorage.setItem('fcmtoken', newToken);
      await vincularUsuario();
    } catch (error) {
      console.log('Error actualizando token FCM:', error);
    }
  };

  const updateNotifications = async () => {
    try {
      const { data } = await endeApi.get(`notificaciones/${data_alumno?.id_alu}`);
      if (data.trans && data.data.length > 0) {
        dispatch(addNotifications(data.data));
      }
    } catch (error) {
      console.log('Error actualizando notificaciones:', error);
    }
  };

  const validarToken = async () => {
    try {
      // await requestUserPermission();
      const token = await AsyncStorage.getItem('fcmtoken');
      
      if (!token) return;
      
      const { data } = await endeApi.get('push_notification/validarToken', {
        params: { token, usuario: data_alumno?.id_alu }
      });
      
      if (data.trans && !data.miUsuario) {
        await vincularUsuario();
      }
    } catch (error) {
      console.log('Error validando token:', error);
    }
  };

  const getEncuestasAlumno = async () => {
    try {
      const { data } = await endeApi.get(
        `encuestas/encuestasPendientes/${data_alumno?.id_alu}/${data_alumno?.id_cad1}/${data_alumno?.id_pla8}`
      );
      if (data.trans) {
        setEncuestasPendientes(data.data);
      }
    } catch (error) {
      console.log('Error obteniendo encuestas:', error);
    }
  };

  const vincularUsuario = async () => {
    try {
      const token = await AsyncStorage.getItem('fcmtoken');
      
      if (!token || !data_alumno?.id_alu) return;

      const deviceInfo = {
        deviceId: await DeviceInfo.getDeviceId(),
        model: DeviceInfo.getModel(),
        brand: DeviceInfo.getBrand(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        uniqueId: DeviceInfo.getUniqueId(),
      };

      await endeApi.post(
        '/push_notification/vincularUsuarioToken',
        {
          token,
          usuario: data_alumno?.id_alu,
          deviceInfo: JSON.stringify(deviceInfo)
        },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    } catch (error) {
      console.log('Error vinculando usuario:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      getCarruselesAlumno(),
      getEncuestasAlumno(),
      updateNotifications(),
    ]);
    setRefreshing(false);
  };

  const handleResponderEncuestas = () => {
    Linking.openURL(baseUrlSite);
    setEncuestasPendientes([]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.textPrimary}
            colors={[themeColors.textPrimary]}
          />
        }
      >
        {loadingBanners ? (
          <View style={styles.bannerLoader}>
            <ActivityIndicator size="large" color={themeColors.textPrimary} />
          </View>
        ) : banners.length > 0 ? (
          <BannerSlider 
            banners={banners} 
            autoPlayInterval={3000}
            height={200}
          />
        ) : null}
        
        <View style={[styles.header, { 
          backgroundColor: themeColors.backgroundCard,
          borderBottomColor: themeColors.borderGray 
        }]}>
          <Text style={[styles.greeting, { color: themeColors.textSecondary }]}>
            {getSaludo()}
          </Text>
          <Text style={[styles.userName, { color: themeColors.textPrimary }]}>
            {getNombreAlumno()}
          </Text>
        </View>

        <View style={styles.content}>
          <ActividadesPendientes />
          <PagosAnticipadosVencidos />
        </View>
      </ScrollView>

      <PaperMessages
        visible={encuestasPendientes.length > 0}
        title="Encuestas pendientes"
        message={
          <Text style={[styles.modalMessage, { color: themeColors.textSecondary }]}>
            Tu opinión es lo más importante para nosotros. Ayúdanos a mejorar la experiencia ENDE.
          </Text>
        }
        buttonText="RESPONDER ENCUESTAS"
        dismissable={true}
        colorTitle={colors.blue}
        colorBody={colors.darkBlue}
        pressButton={handleResponderEncuestas}
        btnTxtCancel="AHORA NO"
        evtBtnCancel={() => setEncuestasPendientes([])}
        styleButton={platformTheme.btnBlue}
        styleBtnCancel={platformTheme.btnSilver}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 15,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 20,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  bannerLoader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});