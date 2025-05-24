import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PropsNotificationDetail } from '../interfaces/appInterfaces';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { formatDateHour } from '../hooks/useFormats';
import { colors } from '../theme/platformTheme'; // Asegúrate de tener una paleta definida
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import endeApi from '../api/estudianteAPI';
import { getNotificationsService, updateStatusNotificationService } from '../services/PushNotificationsService';
import { useAppDispatch } from '../app/hooks';
import { AuthContext } from '../context/AuthContext';
import { addNotifications } from '../features/notifications/dataNotificationsSlice';

export const NotificationDetailScreen = ({ route, navigation }: PropsNotificationDetail) => {
  const dispatch = useAppDispatch();
  const { data_alumno } = useContext( AuthContext );
  const { notification } = route.params;
  useEffect(() => {
    updateStatusNotification();
  }, []);
  const updateStatusNotification = async () => {
    if(notification.est_not === 'Leida') return;
    await updateStatusNotificationService(notification.id_not, 'Leida');
    const data = await getNotificationsService(data_alumno?.id_alu);
    dispatch(addNotifications(data))
  }
  const getStatusIcon = (status: 'Pendiente' | 'Enviada' | 'Recibida' | 'Leida') => {
    let icon = 'bell';
    switch (status) {
      case 'Leida':
        icon = 'check';
        break;
      case 'Pendiente':
        icon = 'clock';
        break;
      case 'Recibida':
        icon = 'bell';
        break;
      case 'Enviada':
        icon = 'paper-plane';
        break;
      default:
        return 'bell';
    }
    return <FontAwesome5Icon name={icon} size={28} color={colors.primary}/>;
  };
  return (
    <SafeAreaView style={styles.container}>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={'Detalle de la notificación'}/>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            {getStatusIcon(notification.est_not)}
          </View>
          <Text style={styles.title}>{notification.tit_not}</Text>
          <Text style={styles.date}>{formatDateHour(notification.fec_not)}</Text>
          <Text style={styles.message}>{notification.men_not}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'left',
  },
});
