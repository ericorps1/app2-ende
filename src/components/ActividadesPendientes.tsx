import React, { useCallback, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import endeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import { ActividadPendiente } from '../interfaces/appInterfaces';
import { CardActividadPendiente } from './CardActividadPendiente';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ActividadesPendientes = () => {
  const [loadingAct, setLoadingAct] = useState(false);
  const [actividadesPendientes, setActividadesPendientes] = useState([]);
  const { data_alumno } = useContext(AuthContext);
  const [viewContent, setViewContent] = useState(true); // Cambiar de false a true

  useFocusEffect(
    useCallback(() => {
      getActividadesPendientes();
      return () => {};
    }, [])
  );

  const getActividadesPendientes = async () => {
    setLoadingAct(true);
    try {
      const { data } = await endeApi.get(`notificaciones_actividad/${data_alumno?.id_alu}`);
      if (data.trans) {
        setActividadesPendientes(data.data);
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
      setActividadesPendientes([]);
    } finally {
      setLoadingAct(false);
    }
  };

  const totalActividades = actividadesPendientes.length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setViewContent(!viewContent)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Icon name="clipboard-list-outline" size={22} color="#000" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Actividades pendientes</Text>
            {totalActividades > 0 && (
              <Text style={styles.subtitle}>
                {totalActividades} {totalActividades === 1 ? 'actividad' : 'actividades'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          {totalActividades > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalActividades}</Text>
            </View>
          )}
          <Icon
            name={viewContent ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {/* CONTENT */}
      {viewContent && (
        <View style={styles.content}>
          {loadingAct ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={32} color="#000" />
              <Text style={styles.loadingText}>Cargando actividades...</Text>
            </View>
          ) : totalActividades > 0 ? (
            <View style={styles.actividadesContainer}>
              {actividadesPendientes.map((actividadPendiente: ActividadPendiente) => (
                <CardActividadPendiente
                  key={actividadPendiente.id}
                  actividadPendiente={actividadPendiente}
                  viewType="normal"
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="check-circle-outline" size={48} color="#4CAF50" />
              <Text style={styles.emptyTitle}>¡Todo completado!</Text>
              <Text style={styles.emptyMessage}>
                No tienes actividades pendientes
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  actividadesContainer: {
    padding: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});