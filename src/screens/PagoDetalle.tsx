import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react'
import { colors } from '../theme/platformTheme';
import { Pagos } from '../interfaces/appInterfaces';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaymentStripe } from '../components/PaymentStripe';
import RenderPdf from '../components/RenderUrlPdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { BackButtonNavigation } from '../components/BackButtonNavigation';

interface PropsPagoDetalle {
  route: {
    params: Pagos
  },
  navigation: any
}

export default function PagoDetalle({ route, navigation }: PropsPagoDetalle) {
  const { colors: themeColors } = useTheme();
  const { top } = useSafeAreaInsets();
  const data_pagos = route.params;
  const { est_pag, mon_ori_pag, mon_pag, tip_pag, fec_pag, fin_pag } = data_pagos;
  const [paid, setPaid] = useState(data_pagos.est_pag === 'Pagado')
  const [payStatus, setPayStatus] = useState(est_pag)
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Detección robusta del tema oscuro (propagado desde Actividades)
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    console.log('🌓 PAGO_DETALLE - themeColors.background:', themeColors.background);
    console.log('🌓 PAGO_DETALLE - themeColors.backgroundCard:', themeColors.backgroundCard);
    console.log('🌓 PAGO_DETALLE - themeColors.textPrimary:', themeColors.textPrimary);
    
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
    
    console.log('🌓 PAGO_DETALLE - isDarkTheme resultado:', isDark);
    
    return isDark;
  })();

  const isVencido = !paid && fin_pag && new Date(fin_pag) < new Date();

  const getTipoPago = () => {
    return tip_pag === 'Otros' ? 'Trámite' : tip_pag;
  };

  // Colores pastel para modo oscuro
  const getStatusColor = () => {
    console.log('🏷️ getStatusColor - isDarkTheme:', isDarkTheme);
    console.log('🏷️ getStatusColor - paid:', paid, 'isVencido:', isVencido);
    
    if (isDarkTheme) {
      if (paid) {
        console.log('✅ Usando color PASTEL para Pagado:', '#A8C4A8');
        return '#A8C4A8'; // Verde pastel
      }
      if (isVencido) {
        console.log('❌ Usando color PASTEL para Vencido:', '#D0A8A0');
        return '#D0A8A0'; // Rosa salmón pastel
      }
      console.log('⏳ Usando color PASTEL para Pendiente:', '#D4BDA0');
      return '#D4BDA0'; // Beige/amarillo pastel
    } else {
      if (paid) return '#28A745';
      if (isVencido) return '#DC3545';
      return '#FFC107';
    }
  };

  const getStatusIcon = () => {
    if (paid) return 'check-circle';
    if (isVencido) return 'alert-circle';
    return 'clock-outline';
  };

  const getStatusText = () => {
    if (paid) return 'Pagado';
    if (isVencido) return 'Vencido';
    return 'Pendiente';
  };

  // Estilos del banner de alerta con colores pastel
  const getAlertBannerStyle = () => {
    console.log('⚠️ getAlertBannerStyle - isDarkTheme:', isDarkTheme);
    if (isDarkTheme) {
      return {
        bg: '#382E2A', // Naranja muy oscuro
        borderColor: '#7A5E50', // Naranja apagado
        iconColor: '#D4BDA0', // Beige pastel
        textColor: '#D4BDA0' // Beige pastel
      };
    } else {
      return {
        bg: '#FFF8F0',
        borderColor: '#FF6D00',
        iconColor: '#E65100',
        textColor: '#E65100'
      };
    }
  };

  const statusColor = getStatusColor();
  const alertStyle = getAlertBannerStyle();

  useEffect(() => {
    navigation.setOptions({
      title: data_pagos.con_pag,
      headerStyle: {
        backgroundColor: themeColors.backgroundCard,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '700',
        color: themeColors.textPrimary,
      },
      headerTintColor: themeColors.textPrimary,
    })
  }, [themeColors]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={data_pagos.con_pag}/>
      <ScrollView
        scrollEnabled={scrollEnabled}
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
      >

        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Detalle del pago
          </Text>
        </View>

        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: isDarkTheme 
              ? (paid ? '#2D352E' : isVencido ? '#382E2D' : '#352F2A')
              : `${statusColor}15`
          }
        ]}>
          <Icon name={getStatusIcon()} size={20} color={statusColor} />
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {getStatusText()}
          </Text>
        </View>

        {isVencido && (
          <View style={[
            styles.alertBanner,
            { 
              backgroundColor: alertStyle.bg,
              borderLeftColor: alertStyle.borderColor
            }
          ]}>
            <Icon name="alert" size={18} color={alertStyle.iconColor} />
            <Text style={[styles.alertBannerText, { color: alertStyle.textColor }]}>
              Este pago está vencido. Regulariza tu situación para evitar el bloqueo de tu acceso.
            </Text>
          </View>
        )}

        <View style={[
          styles.amountCard, 
          { 
            backgroundColor: themeColors.backgroundCard,
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
          }
        ]}>
          <Text style={[styles.amountLabel, { color: themeColors.textSecondary }]}>
            Monto a pagar
          </Text>
          <Text style={[styles.amount, { color: themeColors.textPrimary }]}>
            <FormatAmount amount={paid ? mon_ori_pag : mon_pag} />
          </Text>
        </View>

        <View style={[
          styles.detailsCard, 
          { 
            backgroundColor: themeColors.backgroundCard,
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Información del pago
          </Text>
          
          <View style={[
            styles.detailRow, 
            { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : themeColors.borderGray }
          ]}>
            <View style={styles.detailLabel}>
              <Icon 
                name="shape" 
                size={16} 
                color={isDarkTheme ? '#888' : themeColors.textSecondary} 
              />
              <Text style={[styles.detailLabelText, { color: themeColors.textSecondary }]}>
                Tipo de pago
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>
              {getTipoPago()}
            </Text>
          </View>

          <View style={[
            styles.detailRow, 
            { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : themeColors.borderGray }
          ]}>
            <View style={styles.detailLabel}>
              <Icon 
                name="calendar" 
                size={16} 
                color={isDarkTheme ? '#888' : themeColors.textSecondary} 
              />
              <Text style={[styles.detailLabelText, { color: themeColors.textSecondary }]}>
                Fecha de emisión
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>
              {formatDate(fec_pag)}
            </Text>
          </View>

          <View style={[
            styles.detailRow, 
            { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : themeColors.borderGray }
          ]}>
            <View style={styles.detailLabel}>
              <Icon 
                name="calendar-alert" 
                size={16} 
                color={isDarkTheme ? '#888' : themeColors.textSecondary} 
              />
              <Text style={[styles.detailLabelText, { color: themeColors.textSecondary }]}>
                Fecha límite
              </Text>
            </View>
            <Text style={[
              styles.detailValue, 
              { color: themeColors.textPrimary },
              isVencido && { color: isDarkTheme ? '#D0A8A0' : '#DC3545' }
            ]}>
              {formatDate(fin_pag)}
            </Text>
          </View>
        </View>

        {!paid && (
          <View style={styles.paymentSection}>
            <PaymentStripe 
              data_pagos={data_pagos} 
              onPaySuccess={async () => { 
                await setPaid(true); 
                await setPayStatus('Pagado')
              }}
            />
          </View>
        )}

        {payStatus === 'Pagado' && (
          <RenderPdf
            title="Ticket de pago"
            patterScrollEnabled={setScrollEnabled}
            pdfUrl={`https://plataforma.ahjende.com/ticket_pago.php?id_pag=${data_pagos.id_pag}`}
            patterStyle={styles.pdfContainer}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 20,
    gap: 12,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  amountCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
  },
  detailsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailLabelText: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentSection: {
    marginBottom: 20,
  },
  pdfContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
  },
});