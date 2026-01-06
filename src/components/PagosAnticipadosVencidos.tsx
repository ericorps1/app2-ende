import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import cafeApi from '../api/estudianteAPI';
import { AuthContext } from '../context/AuthContext';
import PaymentCard from './PaymentCard';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateInfoPagos } from '../features/pagos/dataPagosSlice';
import { Pagos } from '../interfaces/appInterfaces';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext'; // 👈 IMPORTAR

export const PagosAnticipadosVencidos = () => {
  const { colors: themeColors } = useTheme(); // 👈 HOOK
  const [loadingPayExp, setLoadingPayExp] = useState(false);
  const { data_alumno } = useContext(AuthContext);
  const [viewContent, setViewContent] = useState(false);
  const allPagos: Pagos[] = useAppSelector(state => state.datapagos);
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

  // Filtrar solo pagos pendientes vencidos
  const paysExpired = allPagos.filter((pago: any) => {
    if (pago.est_pag !== 'Pendiente') return false;
    
    const fechaVencimiento = new Date(pago.fin_pag);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return fechaVencimiento < hoy;
  });

  const totalPagos = paysExpired.length;

  return (
    <View style={[styles.container, { 
      backgroundColor: themeColors.backgroundCard,
      borderColor: themeColors.borderGray 
    }]}>
      {/* HEADER */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setViewContent(!viewContent)}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.backgroundGray }]}>
            <Icon name="credit-card-outline" size={22} color={themeColors.textPrimary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Pagos pendientes
            </Text>
            {totalPagos > 0 && (
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                {totalPagos} {totalPagos === 1 ? 'pago pendiente' : 'pagos pendientes'}
              </Text>
            )}
          </View>
        </View>
        <Icon
          name={viewContent ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {/* CONTENT */}
      {viewContent && (
        <View style={[styles.content, { borderTopColor: themeColors.borderGray }]}>
          {loadingPayExp ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={32} color={themeColors.textPrimary} />
              <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
                Cargando pagos...
              </Text>
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
              <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
                ¡Todo al corriente!
              </Text>
              <Text style={[styles.emptyMessage, { color: themeColors.textSecondary }]}>
                No tienes pagos pendientes
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
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  content: {
    borderTopWidth: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});