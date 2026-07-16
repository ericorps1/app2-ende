import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PropsNotificationDetail } from '../interfaces/appInterfaces';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDateHour } from '../hooks/useFormats';
import { colors } from '../theme/platformTheme';
import endeApi from '../api/estudianteAPI';
import { getNotificationsService, updateStatusNotificationService } from '../services/PushNotificationsService';
import { useAppDispatch } from '../app/hooks';
import { AuthContext } from '../context/AuthContext';
import { addNotifications } from '../features/notifications/dataNotificationsSlice';
import { useTheme } from '../context/ThemeContext'; // 👈 IMPORTAR

const getStatusData = (status: 'Pendiente' | 'Enviada' | 'Recibida' | 'Leida') => {
  switch (status) {
    case 'Leida':
      return { icon: 'check-circle', color: '#000', label: 'Leída' };
    case 'Pendiente':
      return { icon: 'clock-outline', color: '#FF9500', label: 'Pendiente' };
    case 'Recibida':
      return { icon: 'bell', color: '#FF9500', label: 'Recibida' };
    case 'Enviada':
      return { icon: 'check-circle', color: '#34C759', label: 'Enviada' };
    default:
      return { icon: 'bell-outline', color: '#666', label: 'Desconocido' };
  }
};

export const NotificationDetailScreen = ({ route, navigation }: PropsNotificationDetail) => {
  const { colors: themeColors } = useTheme(); // 👈 HOOK
  const dispatch = useAppDispatch();
  const { data_alumno } = useContext(AuthContext);
  const { notification } = route.params;
  
  // Ajustar el color del ícono para "Leída" según el tema
  const statusDataBase = getStatusData(notification.est_not);
  const statusData = {
    ...statusDataBase,
    color: notification.est_not === 'Leida' ? themeColors.textPrimary : statusDataBase.color
  };

  useEffect(() => {
    updateStatusNotification();
  }, []);

  const updateStatusNotification = async () => {
    if(notification.est_not === 'Leida') return;
    await updateStatusNotificationService(notification.id_not, 'Leida');
    const data = await getNotificationsService(data_alumno?.id_alu);
    dispatch(addNotifications(data));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundCard }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: themeColors.backgroundCard }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: themeColors.backgroundGray }]}
          onPress={() => navigation.pop()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ICON HERO */}
        <View style={styles.iconHero}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.backgroundGray }]}>
            <Icon name={statusData.icon} size={40} color={statusData.color} />
          </View>
        </View>

        {/* TITLE */}
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          {notification.tit_not}
        </Text>

        {/* STATUS + DATE */}
        <View style={styles.metaContainer}>
          <View style={[styles.statusPill, { backgroundColor: themeColors.backgroundGray }]}>
            <View style={[styles.statusDot, { backgroundColor: statusData.color }]} />
            <Text style={[styles.statusLabel, { color: themeColors.textPrimary }]}>
              {statusData.label}
            </Text>
          </View>
          <Text style={[styles.date, { color: themeColors.textSecondary }]}>
            {formatDateHour(notification.fec_not)}
          </Text>
        </View>

        {/* MESSAGE CARD */}
        <View style={[styles.messageCard, { backgroundColor: themeColors.backgroundGray }]}>
          <Text style={[styles.message, { color: themeColors.textPrimary }]}>
            {notification.men_not}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconHero: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    paddingHorizontal: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
  },
  messageCard: {
    borderRadius: 16,
    padding: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
});