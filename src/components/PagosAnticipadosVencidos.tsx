import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import cafeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import PaymentCard from './PaymentCard';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateInfoPagos } from '../features/pagos/dataPagosSlice';
import { Pagos } from '../interfaces/appInterfaces';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PagosAnticipadosVencidos = () => {
  const [loadingPayExp, setLoadingPayExp] = useState(false);
  const { data_alumno } = useContext(AuthContext);
  const [viewContent, setViewContent] = useState(false);
  const paysExpired: Pagos[] = useAppSelector(state => state.datapagos);
  const dispatch = useAppDispatch();

  useEffect(() => {
    getPaysExpired();
    return () => {};
  }, []);

  const getPaysExpired = async () => {
    setLoadingPayExp(true);
    try {
      const { data } = await cafeApi.get('/pagos', {
        params: { id_alu_ram: data_alumno!.id_alu_ram }
      });
      dispatch(updateInfoPagos(data.data.length > 0 ? data.data : []));
    } catch (error) {
      console.error('Error cargando pagos:', error);
      dispatch(updateInfoPagos([]));
    } finally {
      setLoadingPayExp(false);
    }
  };

  const totalPagos = paysExpired.length;
  const totalVencidos = paysExpired.filter((p: any) => p.estado === 'vencido').length;

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
            <Icon name="credit-card-outline" size={22} color="#000" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Pagos anticipados y vencidos</Text>
            {totalPagos > 0 && (
              <Text style={styles.subtitle}>
                {totalPagos} {totalPagos === 1 ? 'pago' : 'pagos'}
                {totalVencidos > 0 && ` • ${totalVencidos} vencido${totalVencidos > 1 ? 's' : ''}`}
              </Text>
            )}
          </View>
        </View>
        <Icon
          name={viewContent ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#666"
        />
      </TouchableOpacity>

      {/* CONTENT */}
      {viewContent && (
        <View style={styles.content}>
          {loadingPayExp ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={32} color="#000" />
              <Text style={styles.loadingText}>Cargando pagos...</Text>
            </View>
          ) : paysExpired.length > 0 ? (
            <View style={styles.paymentsContainer}>
              {paysExpired.map((data_pagos: any) => (
                <PaymentCard key={data_pagos.id_pag} data_pagos={data_pagos} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="check-circle-outline" size={48} color="#4CAF50" />
              <Text style={styles.emptyTitle}>¡Todo al corriente!</Text>
              <Text style={styles.emptyMessage}>
                No tienes pagos anticipados ni vencidos
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
  paymentsContainer: {
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