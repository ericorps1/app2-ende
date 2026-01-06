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
import { useTheme } from '../context/ThemeContext';

export const Pagos = () => {
  const { colors: themeColors } = useTheme();
  const { top } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  const [noData, setNoData] = useState(false);
  const [totalVencido, setTotalVencido] = useState(0);
  const [cantidadVencidos, setCantidadVencidos] = useState(0);
  const [filtroActivo, setFiltroActivo] = useState<'hoy' | 'todos'>('hoy');
  
  const { data_alumno } = useContext(AuthContext);
  const pagos = useAppSelector(state => state.datapagos);

  // Detección robusta del tema oscuro (propagado desde Actividades)
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    console.log('🌓 PAGOS - themeColors.background:', themeColors.background);
    console.log('🌓 PAGOS - themeColors.backgroundCard:', themeColors.backgroundCard);
    console.log('🌓 PAGOS - themeColors.textPrimary:', themeColors.textPrimary);
    
    const isDark = bg === '#000' || 
                   bg === '#000000' ||
                   bg === '#121212' || 
                   bg === '#1a1a1a' ||
                   cardBg === '#000' ||
                   cardBg === '#000000' ||
                   cardBg === '#121212' ||
                   cardBg === '#1e1e1e' ||
                   cardBg === '#1a1a1a' ||
                   textPrimary === '#fff' ||
                   textPrimary === '#ffffff' ||
                   textPrimary === '#f5f5f5' ||
                   bg.includes('black') ||
                   (bg.startsWith('#') && parseInt(bg.replace('#', ''), 16) < 3355443);
    
    console.log('🌓 PAGOS - isDarkTheme resultado:', isDark);
    
    return isDark;
  })();

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
      
      if (aVencido && !bVencido) return -1;
      if (!aVencido && bVencido) return 1;
      
      const fechaA = new Date(a.fin_pag).getTime();
      const fechaB = new Date(b.fin_pag).getTime();
      return fechaB - fechaA;
    });
  };

  // Estilos para card de éxito con colores pastel
  const getSuccessCardStyle = () => {
    console.log('✅ getSuccessCardStyle - isDarkTheme:', isDarkTheme);
    if (isDarkTheme) {
      return {
        iconBg: '#2D352E', // Verde muy oscuro
        iconColor: '#A8C4A8', // Verde pastel
        titleColor: '#A8C4A8' // Verde pastel
      };
    } else {
      return {
        iconBg: '#E8F5E9',
        iconColor: '#34C759',
        titleColor: '#34C759'
      };
    }
  };

  // Estilos para card de alerta con colores pastel
  const getAlertCardStyle = () => {
    console.log('⚠️ getAlertCardStyle - isDarkTheme:', isDarkTheme);
    if (isDarkTheme) {
      return {
        iconBg: '#382E2D', // Rojo muy oscuro
        iconColor: '#D0A8A0', // Rosa salmón pastel
        badgeBg: '#7A5E5B' // Badge más oscuro pero visible
      };
    } else {
      return {
        iconBg: '#FFE5E5',
        iconColor: '#FF3B30',
        badgeBg: '#FF3B30'
      };
    }
  };

  const pagosFiltrados = filtrarPagos();
  const pagosPendientesFiltro = pagosFiltrados.filter((pago: any) => pago.est_pag !== 'Pagado').length;
  const estAlCorriente = cantidadVencidos === 0 && pagos.length > 0;

  const successStyle = getSuccessCardStyle();
  const alertStyle = getAlertCardStyle();

  return (
    (pagos && pagos.length === 0) ?
      <LoadingScreen/>
    :
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={10}
              tintColor={themeColors.textPrimary}
              colors={[themeColors.textPrimary]}
            />
          }
        >
          {estAlCorriente && (
            <View style={[
              styles.successCard, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                borderWidth: 1
              }
            ]}>
              <View style={styles.successHeader}>
                <View style={[styles.successIconContainer, { backgroundColor: successStyle.iconBg }]}>
                  <Icon name="check-circle" size={20} color={successStyle.iconColor} />
                </View>
                <View style={styles.successContent}>
                  <Text style={[styles.successTitle, { color: successStyle.titleColor }]}>¡Excelente!</Text>
                  <Text style={[styles.successSubtitle, { color: themeColors.textSecondary }]}>
                    Estás al corriente con tus pagos
                  </Text>
                </View>
              </View>
            </View>
          )}

          {cantidadVencidos > 0 && (
            <View style={[
              styles.alertCard, 
              { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                borderWidth: 1
              }
            ]}>
              <View style={styles.alertHeader}>
                <View style={[styles.alertIconContainer, { backgroundColor: alertStyle.iconBg }]}>
                  <Icon name="alert-circle" size={20} color={alertStyle.iconColor} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: themeColors.textPrimary }]}>Pagos vencidos</Text>
                  <Text style={[styles.alertSubtitle, { color: themeColors.textSecondary }]}>
                    {cantidadVencidos} {cantidadVencidos === 1 ? 'pago vencido' : 'pagos vencidos'}
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.alertAmount, 
                { 
                  backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  borderWidth: 1
                }
              ]}>
                <Text style={[styles.alertAmountLabel, { color: themeColors.textSecondary }]}>Total adeudado</Text>
                <Text style={[styles.alertAmountValue, { color: themeColors.textPrimary }]}>
                  <FormatAmount amount={totalVencido} />
                </Text>
              </View>

              <View style={styles.alertFooter}>
                <Icon 
                  name="information-outline" 
                  size={14} 
                  color={isDarkTheme ? '#888' : themeColors.textSecondary} 
                />
                <Text style={[styles.alertFooterText, { color: themeColors.textSecondary }]}>
                  Regulariza para evitar bloqueo de acceso
                </Text>
              </View>
            </View>
          )}

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterPill, 
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : themeColors.borderGray 
                },
                filtroActivo === 'hoy' && { 
                  backgroundColor: isDarkTheme ? '#4E5C6A' : themeColors.textPrimary,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : themeColors.textPrimary 
                }
              ]}
              onPress={() => setFiltroActivo('hoy')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterPillText, 
                { color: themeColors.textSecondary },
                filtroActivo === 'hoy' && { 
                  color: isDarkTheme ? '#FFFFFF' : themeColors.backgroundCard 
                }
              ]}>
                Hoy
              </Text>
              {filtroActivo === 'hoy' && pagosPendientesFiltro > 0 && (
                <View style={[styles.badge, { backgroundColor: alertStyle.badgeBg }]}>
                  <Text style={styles.badgeText}>{pagosPendientesFiltro}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterPill,
                { 
                  backgroundColor: themeColors.backgroundCard,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.10)' : themeColors.borderGray 
                },
                filtroActivo === 'todos' && { 
                  backgroundColor: isDarkTheme ? '#4E5C6A' : themeColors.textPrimary,
                  borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : themeColors.textPrimary 
                }
              ]}
              onPress={() => setFiltroActivo('todos')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterPillText,
                { color: themeColors.textSecondary },
                filtroActivo === 'todos' && { 
                  color: isDarkTheme ? '#FFFFFF' : themeColors.backgroundCard 
                }
              ]}>
                Todos
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                {filtroActivo === 'hoy' ? 'Pagos al día de hoy' : 'Historial completo'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
                {filtroActivo === 'hoy' 
                  ? `${pagosFiltrados.length} ${pagosFiltrados.length === 1 ? 'pago' : 'pagos'} hasta hoy`
                  : `${pagosFiltrados.length} ${pagosFiltrados.length === 1 ? 'pago' : 'pagos'} en total`
                }
              </Text>
            </View>
            
            {noData === true ? (
              <View style={styles.emptyState}>
                <Icon 
                  name="receipt-text-outline" 
                  size={64} 
                  color={isDarkTheme ? '#444' : themeColors.borderGray} 
                />
                <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>
                  No hay pagos registrados
                </Text>
              </View>
            ) : pagosFiltrados.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon 
                  name="calendar-check" 
                  size={64} 
                  color={isDarkTheme ? '#444' : themeColors.borderGray} 
                />
                <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  successCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    marginBottom: 2,
  },
  successSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  alertAmount: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertAmountLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  alertAmountValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertFooterText: {
    fontSize: 12,
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
    borderWidth: 1,
    gap: 6,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
});