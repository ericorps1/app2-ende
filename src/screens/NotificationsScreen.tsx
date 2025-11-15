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

export const NotificationsScreen = ({route, navigation}: any) => {
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
      <Icon name="bell-outline" size={64} color="#E0E0E0" />
      <Text style={styles.emptyStateTitle}>
        {filtroActivo === 'leidas' 
          ? 'No hay notificaciones leídas' 
          : filtroActivo === 'no_leidas' 
          ? 'No hay notificaciones nuevas' 
          : 'No hay notificaciones'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {filtroActivo === 'todas' 
          ? 'Las notificaciones que recibas aparecerán aquí'
          : 'Cambia el filtro para ver otras notificaciones'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.pop()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          {totalNoLeidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalNoLeidas}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* PILLS FILTER */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterPill, filtroActivo === 'todas' && styles.filterPillActive]}
          onPress={() => setFiltroActivo('todas')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filtroActivo === 'todas' && styles.filterTextActive]}>
            Todas
          </Text>
          <Text style={[styles.filterCount, filtroActivo === 'todas' && styles.filterCountActive]}>
            {notifications.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filtroActivo === 'no_leidas' && styles.filterPillActive]}
          onPress={() => setFiltroActivo('no_leidas')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filtroActivo === 'no_leidas' && styles.filterTextActive]}>
            Nuevas
          </Text>
          {totalNoLeidas > 0 && (
            <Text style={[styles.filterCount, filtroActivo === 'no_leidas' && styles.filterCountActive]}>
              {totalNoLeidas}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filtroActivo === 'leidas' && styles.filterPillActive]}
          onPress={() => setFiltroActivo('leidas')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filtroActivo === 'leidas' && styles.filterTextActive]}>
            Leídas
          </Text>
          <Text style={[styles.filterCount, filtroActivo === 'leidas' && styles.filterCountActive]}>
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
            tintColor="#000"
            colors={['#000']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
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
    color: '#000',
  },
  badge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
  },
  filterCountActive: {
    color: '#FFF',
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
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});