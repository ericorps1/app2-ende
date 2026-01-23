import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Notification } from '../interfaces/appInterfaces';
import { AuthContext } from '../context/AuthContext';
import endeApi from '../api/estudianteAPI';
import { updateInfoNotifications } from '../features/notifications/dataNotificationsSlice';
import { CardNotification } from '../components/CardNotification';
import { useTheme } from '../context/ThemeContext'; // 👈 IMPORTAR

export const NotificationsScreen = ({route, navigation}: any) => {
  const { colors: themeColors } = useTheme(); // 👈 HOOK
  const { data_alumno } = useContext(AuthContext);
  const dispatch = useAppDispatch();
  const notifications: Notification[] = useAppSelector(state => state.datanotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'leidas' | 'no_leidas'>('todas');

  const onRefresh = async () => {
    setRefreshing(true);
    await obtener_notificaciones();
    setRefreshing(false);
  };

  const obtener_notificaciones = async() => {
    try { 
      const {data} = await endeApi.get('/notificaciones', { 
        params: { 'id_alu_ram': data_alumno!.id_alu_ram } 
      });
      if(data.data.length > 0){
        dispatch(updateInfoNotifications(data.data));
      } else {
        dispatch(updateInfoNotifications([]));
      }
    } catch (error: any) {
      console.log('Error obteniendo notificaciones:', error);
    }
  };

  const filtrarNotificaciones = () => {
    if (filtroActivo === 'leidas') {
      return notifications.filter(n => n.est_not === 'Leida');
    }
    if (filtroActivo === 'no_leidas') {
      return notifications.filter(n => n.est_not !== 'Leida');
    }
    return notifications;
  };

  const notificacionesFiltradas = filtrarNotificaciones();
  const totalNoLeidas = notifications.filter(n => n.est_not !== 'Leida').length;
  const totalLeidas = notifications.filter(n => n.est_not === 'Leida').length;

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="bell-outline" size={64} color={themeColors.borderGray} />
      <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>
        {filtroActivo === 'leidas' 
          ? 'No hay notificaciones leídas' 
          : filtroActivo === 'no_leidas' 
          ? 'No hay notificaciones nuevas' 
          : 'No hay notificaciones'}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: themeColors.textSecondary }]}>
        {filtroActivo === 'todas' 
          ? 'Las notificaciones que recibas aparecerán aquí'
          : 'Cambia el filtro para ver otras notificaciones'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundCard }]}>
      {/* HEADER */}
      <View style={[styles.header, { 
        backgroundColor: themeColors.backgroundCard,
        borderBottomColor: themeColors.borderGray 
      }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: themeColors.backgroundGray }]}
          onPress={() => navigation.pop()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Notificaciones
          </Text>
          {totalNoLeidas > 0 && (
            <View style={[styles.badge, { backgroundColor: themeColors.textPrimary }]}>
              <Text style={[styles.badgeText, { color: themeColors.backgroundCard }]}>
                {totalNoLeidas}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* PILLS FILTER */}
      <View style={[styles.filterContainer, { 
        backgroundColor: themeColors.backgroundCard,
        borderBottomColor: themeColors.borderGray 
      }]}>
        <TouchableOpacity
          style={[
            styles.filterPill, 
            { backgroundColor: themeColors.backgroundGray },
            filtroActivo === 'todas' && { backgroundColor: themeColors.textPrimary }
          ]}
          onPress={() => setFiltroActivo('todas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterText, 
            { color: themeColors.textSecondary },
            filtroActivo === 'todas' && { color: themeColors.backgroundCard }
          ]}>
            Todas
          </Text>
          <Text style={[
            styles.filterCount, 
            { color: themeColors.textTertiary },
            filtroActivo === 'todas' && { color: themeColors.backgroundCard }
          ]}>
            {notifications.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill, 
            { backgroundColor: themeColors.backgroundGray },
            filtroActivo === 'no_leidas' && { backgroundColor: themeColors.textPrimary }
          ]}
          onPress={() => setFiltroActivo('no_leidas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterText, 
            { color: themeColors.textSecondary },
            filtroActivo === 'no_leidas' && { color: themeColors.backgroundCard }
          ]}>
            Nuevas
          </Text>
          {totalNoLeidas > 0 && (
            <Text style={[
              styles.filterCount, 
              { color: themeColors.textTertiary },
              filtroActivo === 'no_leidas' && { color: themeColors.backgroundCard }
            ]}>
              {totalNoLeidas}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill, 
            { backgroundColor: themeColors.backgroundGray },
            filtroActivo === 'leidas' && { backgroundColor: themeColors.textPrimary }
          ]}
          onPress={() => setFiltroActivo('leidas')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterText, 
            { color: themeColors.textSecondary },
            filtroActivo === 'leidas' && { color: themeColors.backgroundCard }
          ]}>
            Leídas
          </Text>
          <Text style={[
            styles.filterCount, 
            { color: themeColors.textTertiary },
            filtroActivo === 'leidas' && { color: themeColors.backgroundCard }
          ]}>
            {totalLeidas}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={notificacionesFiltradas}
        keyExtractor={(item) => 'notification_' + item.id_not.toString()}
        renderItem={({ item }) => <CardNotification notification={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notificacionesFiltradas.length === 0 && styles.listEmpty}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.textPrimary}
            colors={[themeColors.textPrimary]}
          />
        }
      />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});