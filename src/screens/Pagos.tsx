import React, {useContext, useEffect, useState} from 'react'
import { Text, View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import TarjetaPago from '../components/TarjetaPago';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/platformTheme';
import { LoadingScreen } from './LoadingScreen';
import endeApi from '../api/estudianteAPI';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateInfoPagos } from '../features/pagos/dataPagosSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FormatAmount } from '../hooks/useFormats';

export const Pagos = () => {
  const { top } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  const [noData, setNoData] = useState(false);
  const [totalVencido, setTotalVencido] = useState(0);
  const [cantidadVencidos, setCantidadVencidos] = useState(0);
  const [filtroActivo, setFiltroActivo] = useState<'hoy' | 'todos'>('hoy');
  
  const { data_alumno } = useContext(AuthContext);
  const pagos = useAppSelector(state => state.datapagos);

  useEffect(() => {
    obtener_pagos_alumno();
  }, [])

  const onRefresh = async () => {
    setRefreshing(true);
    await obtener_pagos_alumno();
    setRefreshing(false);
  }

  const calcularVencidos = (listaPagos: any[]) => {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    let total = 0;
    let cantidad = 0;

    listaPagos.forEach((pago) => {
      if (pago.est_pag !== 'Pagado' && pago.fin_pag) {
        const fechaVencimiento = new Date(pago.fin_pag);
        // Agregar 1 día después del fin_pag
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 1);
        fechaVencimiento.setHours(23, 59, 59, 999);
        
        if (fechaVencimiento < hoy) {
          total += parseFloat(pago.mon_pag || 0);
          cantidad++;
        }
      }
    });

    setTotalVencido(total);
    setCantidadVencidos(cantidad);
  };

  const obtener_pagos_alumno = async() => {
    try { 
      const {data} = await endeApi.get('/pagos', { params: { 'id_alu_ram': data_alumno!.id_alu_ram } });
      if(data.data.length > 0){
        dispatch(updateInfoPagos(data.data));
        calcularVencidos(data.data);
      } else {
        setNoData(true);
        dispatch(updateInfoPagos([]));
        setTotalVencido(0);
        setCantidadVencidos(0);
      }
    } catch (error:any) {
      console.log(error);
    }
  };

  const filtrarPagos = () => {
    let pagosFiltrados = [];
    
    if (filtroActivo === 'todos') {
      pagosFiltrados = [...pagos];
    } else {
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
  
      pagosFiltrados = pagos.filter((pago: any) => {
        const fechaLimite = new Date(pago.fin_pag);
        return fechaLimite <= hoy;
      });
    }
  
    // Ordenar: vencidos primero, luego por fecha
    return pagosFiltrados.sort((a: any, b: any) => {
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      
      const fechaVencimientoA = new Date(a.fin_pag);
      fechaVencimientoA.setDate(fechaVencimientoA.getDate() + 1);
      fechaVencimientoA.setHours(23, 59, 59, 999);
      
      const fechaVencimientoB = new Date(b.fin_pag);
      fechaVencimientoB.setDate(fechaVencimientoB.getDate() + 1);
      fechaVencimientoB.setHours(23, 59, 59, 999);
      
      const aVencido = a.est_pag !== 'Pagado' && fechaVencimientoA < hoy;
      const bVencido = b.est_pag !== 'Pagado' && fechaVencimientoB < hoy;
      
      // Si uno está vencido y el otro no, el vencido va primero
      if (aVencido && !bVencido) return -1;
      if (!aVencido && bVencido) return 1;
      
      // Si ambos tienen el mismo estado de vencimiento, ordenar por fecha
      const fechaA = new Date(a.fin_pag).getTime();
      const fechaB = new Date(b.fin_pag).getTime();
      return fechaB - fechaA;
    });
  };

  const pagosFiltrados = filtrarPagos();
  const pagosPendientesFiltro = pagosFiltrados.filter((pago: any) => pago.est_pag !== 'Pagado').length;
  const estAlCorriente = cantidadVencidos === 0 && pagos.length > 0;

  return (
    (pagos && pagos.length === 0) ?
      <LoadingScreen/>
    :
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={10}
              tintColor="#000"
              colors={['#000']}
            />
          }
        >
          {/* BADGE AL CORRIENTE */}
          {estAlCorriente && (
            <View style={styles.successCard}>
              <View style={styles.successHeader}>
                <View style={styles.successIconContainer}>
                  <Icon name="check-circle" size={20} color="#34C759" />
                </View>
                <View style={styles.successContent}>
                  <Text style={styles.successTitle}>¡Excelente!</Text>
                  <Text style={styles.successSubtitle}>
                    Estás al corriente con tus pagos
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ALERTA DE PAGOS VENCIDOS */}
          {cantidadVencidos > 0 && (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertIconContainer}>
                  <Icon name="alert-circle" size={20} color="#FF3B30" />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Pagos vencidos</Text>
                  <Text style={styles.alertSubtitle}>
                    {cantidadVencidos} {cantidadVencidos === 1 ? 'pago vencido' : 'pagos vencidos'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.alertAmount}>
                <Text style={styles.alertAmountLabel}>Total adeudado</Text>
                <Text style={styles.alertAmountValue}>
                  <FormatAmount amount={totalVencido} />
                </Text>
              </View>

              <View style={styles.alertFooter}>
                <Icon name="information-outline" size={14} color="#666" />
                <Text style={styles.alertFooterText}>
                  Regulariza para evitar bloqueo de acceso
                </Text>
              </View>
            </View>
          )}

          {/* PILLS / TABS */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterPill, filtroActivo === 'hoy' && styles.filterPillActive]}
              onPress={() => setFiltroActivo('hoy')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, filtroActivo === 'hoy' && styles.filterPillTextActive]}>
                Hoy
              </Text>
              {filtroActivo === 'hoy' && pagosPendientesFiltro > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pagosPendientesFiltro}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterPill, filtroActivo === 'todos' && styles.filterPillActive]}
              onPress={() => setFiltroActivo('todos')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, filtroActivo === 'todos' && styles.filterPillTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
          </View>

          {/* LISTA DE PAGOS */}
          <View style={styles.paymentsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filtroActivo === 'hoy' ? 'Pagos al día de hoy' : 'Historial completo'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {filtroActivo === 'hoy' 
                  ? `${pagosFiltrados.length} ${pagosFiltrados.length === 1 ? 'pago' : 'pagos'} hasta hoy`
                  : `${pagosFiltrados.length} ${pagosFiltrados.length === 1 ? 'pago' : 'pagos'} en total`
                }
              </Text>
            </View>
            
            {noData === true ? (
              <View style={styles.emptyState}>
                <Icon name="receipt-text-outline" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateText}>No hay pagos registrados</Text>
              </View>
            ) : pagosFiltrados.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="calendar-check" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateText}>
                  {filtroActivo === 'hoy' 
                    ? 'No hay pagos pendientes hasta hoy' 
                    : 'No hay pagos registrados'}
                </Text>
              </View>
            ) : (
              pagosFiltrados.map((data_pagos: any) => {
                return (
                  <TarjetaPago key={data_pagos.id_pag} data_pagos={data_pagos} />
                )
              })
            )}
          </View>
        </ScrollView>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  successCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 2,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  alertAmount: {
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertAmountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  alertAmountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertFooterText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  paymentsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});