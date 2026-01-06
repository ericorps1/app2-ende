import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { Pagos } from '../interfaces/appInterfaces';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface PropsDataPagos {
  data_pagos: Pagos;
}

export default function TarjetaPago({ data_pagos }: PropsDataPagos) {
  const { colors: themeColors } = useTheme();
  const navigation = useNavigation<any>();
  const onPressTP = () => navigation.navigate('PagoDetalle', data_pagos);

  // Detección robusta del tema oscuro (propagado desde Actividades)
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    console.log('🌓 TARJETA_PAGO_V2 - themeColors.background:', themeColors.background);
    console.log('🌓 TARJETA_PAGO_V2 - themeColors.backgroundCard:', themeColors.backgroundCard);
    
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
    
    console.log('🌓 TARJETA_PAGO_V2 - isDarkTheme resultado:', isDark);
    
    return isDark;
  })();

  const isPagado = data_pagos.est_pag === 'Pagado';
  
  const isVencido = () => {
    if (isPagado || !data_pagos.fin_pag) return false;
    
    const fechaVencimiento = new Date(data_pagos.fin_pag);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 1);
    fechaVencimiento.setHours(23, 59, 59, 999);
    
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    
    return fechaVencimiento < hoy;
  };

  const vencido = isVencido();

  // Colores pastel para modo oscuro
  const getStatusColor = () => {
    console.log('🏷️ getStatusColor - isDarkTheme:', isDarkTheme);
    console.log('🏷️ getStatusColor - isPagado:', isPagado, 'vencido:', vencido);
    
    if (isDarkTheme) {
      if (isPagado) {
        console.log('✅ Usando color PASTEL para Pagado:', '#A8C4A8');
        return '#A8C4A8'; // Verde pastel
      }
      if (vencido) {
        console.log('❌ Usando color PASTEL para Vencido:', '#D0A8A0');
        return '#D0A8A0'; // Rosa salmón pastel
      }
      console.log('⏳ Usando color PASTEL para Pendiente:', '#A8A8A8');
      return '#A8A8A8'; // Gris neutro pastel
    } else {
      if (isPagado) return '#34C759';
      if (vencido) return '#FF3B30';
      return '#666';
    }
  };

  const getStatusIcon = () => {
    if (isPagado) return 'check-circle';
    if (vencido) return 'alert-circle';
    return 'clock-outline';
  };

  const getStatusText = () => {
    if (isPagado) return 'Pagado';
    if (vencido) return 'Vencido';
    return 'Pendiente';
  };

  const getTipoPago = () => {
    return data_pagos.tip_pag === 'Otros' ? 'Trámite' : data_pagos.tip_pag;
  };

  // Estilos del contenedor de icono con colores pastel
  const getIconContainerBg = () => {
    if (isDarkTheme) {
      if (isPagado) return '#2D352E'; // Verde muy oscuro
      if (vencido) return '#382E2D'; // Rojo muy oscuro
      return '#2A2A2A'; // Gris oscuro
    } else {
      if (isPagado) return '#E8F5E9';
      if (vencido) return '#FFE5E5';
      return themeColors.backgroundGray;
    }
  };

  // Estilos del badge de estatus
  const getStatusBadgeBg = () => {
    if (isDarkTheme) {
      if (isPagado) return '#2D352E'; // Verde muy oscuro
      if (vencido) return '#382E2D'; // Rojo muy oscuro
      return '#2B2B2B'; // Gris oscuro
    } else {
      return `${getStatusColor()}15`;
    }
  };

  // Estilos del banner vencido
  const getVencidoBannerStyle = () => {
    if (isDarkTheme) {
      return {
        bg: '#382E2D', // Rojo muy oscuro
        textColor: '#D0A8A0', // Rosa salmón pastel
        iconColor: '#D0A8A0' // Rosa salmón pastel
      };
    } else {
      return {
        bg: '#FFF5F5',
        textColor: '#FF3B30',
        iconColor: '#FF3B30'
      };
    }
  };

  const statusColor = getStatusColor();
  const vencidoStyle = getVencidoBannerStyle();

  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          borderWidth: isDarkTheme ? 1 : 0
        }
      ]}
      onPress={onPressTP}
      activeOpacity={0.7}
    >
      <View style={[
        styles.header, 
        { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : themeColors.borderGray }
      ]}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getIconContainerBg() }]}>
            <Icon 
              name={isPagado ? 'cash-check' : 'receipt'} 
              size={18} 
              color={statusColor} 
            />
          </View>
          <Text style={[styles.concept, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {data_pagos.con_pag}
          </Text>
        </View>
        <Icon 
          name="chevron-right" 
          size={18} 
          color={isDarkTheme ? '#666' : themeColors.borderGray} 
        />
      </View>

      <View style={styles.body}>
        <View style={styles.mainInfo}>
          <Text style={[styles.amountLabel, { color: themeColors.textSecondary }]}>Monto a pagar</Text>
          <Text style={[styles.amount, { color: themeColors.textPrimary }]}>
            <FormatAmount amount={isPagado ? data_pagos.mon_ori_pag : data_pagos.mon_pag} />
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Estado</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeBg() }]}>
              <Icon name={getStatusIcon()} size={12} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Tipo de pago</Text>
            <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>{getTipoPago()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Fecha límite</Text>
            <Text style={[
              styles.detailValue, 
              { color: themeColors.textPrimary }, 
              vencido && { color: isDarkTheme ? '#D0A8A0' : '#FF3B30' }
            ]}>
              {formatDate(data_pagos.fin_pag)}
            </Text>
          </View>
        </View>
      </View>

      {vencido && (
        <View style={[styles.vencidoBanner, { backgroundColor: vencidoStyle.bg }]}>
          <Icon name="alert" size={12} color={vencidoStyle.iconColor} />
          <Text style={[styles.vencidoText, { color: vencidoStyle.textColor }]}>
            Pago vencido - Regulariza tu situación
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  concept: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  body: {
    padding: 14,
  },
  mainInfo: {
    marginBottom: 14,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  vencidoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  vencidoText: {
    fontSize: 11,
    fontWeight: '600',
  },
});