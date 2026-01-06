import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { statusColors } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { useTheme } from '../context/ThemeContext';

interface PropsPaymentCard {
  data_pagos: {
    id_pag: number;
    type: string;
    amount: number;
    est_pag: 'Pagado' | 'Pendiente' | 'Vencido';
    fec_pag: string;
    fin_pag: string;
    con_pag: string;
    mon_ori_pag: string;
    mon_pag: string;
  };
}

const PaymentCard = ({ data_pagos }: PropsPaymentCard) => {
  const { colors: themeColors } = useTheme();
  const navigation = useNavigation<any>();

  // Detección robusta del tema oscuro (propagado desde Actividades)
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    console.log('🌓 TARJETA_PAGO - themeColors.background:', themeColors.background);
    console.log('🌓 TARJETA_PAGO - themeColors.backgroundCard:', themeColors.backgroundCard);
    
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
    
    console.log('🌓 TARJETA_PAGO - isDarkTheme resultado:', isDark);
    
    return isDark;
  })();

  // Validar si el pago está vencido
  const getEstadoPago = () => {
    if (data_pagos.est_pag === 'Pagado') {
      return 'Pagado';
    }

    if (data_pagos.est_pag === 'Pendiente') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      let fechaVencimiento: Date;
      
      if (data_pagos.fin_pag.includes('-')) {
        const [year, month, day] = data_pagos.fin_pag.split('T')[0].split('-');
        fechaVencimiento = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (data_pagos.fin_pag.includes('/')) {
        const [day, month, year] = data_pagos.fin_pag.split('/');
        fechaVencimiento = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        fechaVencimiento = new Date(data_pagos.fin_pag);
      }
      
      fechaVencimiento.setHours(0, 0, 0, 0);

      if (fechaVencimiento < hoy) {
        return 'Vencido';
      }
      
      return 'Pendiente';
    }

    return data_pagos.est_pag;
  };

  const estadoReal = getEstadoPago();

  // Estilos de estatus con colores pastel para modo oscuro
  const getStatusStyle = () => {
    console.log('🏷️ getStatusStyle - isDarkTheme:', isDarkTheme);
    console.log('🏷️ getStatusStyle - estadoReal:', estadoReal);
    
    if (isDarkTheme) {
      switch (estadoReal) {
        case 'Pagado':
          console.log('✅ Usando colores PASTEL para Pagado');
          return {
            icon: 'check-circle',
            color: '#A8C4A8', // Verde pastel
            badgeBg: '#2D352E', // Verde muy oscuro
            dotColor: '#A8C4A8' // Verde pastel
          };
        case 'Vencido':
          console.log('❌ Usando colores PASTEL para Vencido');
          return {
            icon: 'alert-circle',
            color: '#D0A8A0', // Rosa salmón pastel
            badgeBg: '#382E2D', // Rojo muy oscuro
            dotColor: '#D0A8A0' // Rosa salmón pastel
          };
        default: // Pendiente
          console.log('⏳ Usando colores PASTEL para Pendiente');
          return {
            icon: 'clock-outline',
            color: '#D4BDA0', // Beige/amarillo pastel
            badgeBg: '#352F2A', // Amarillo muy oscuro
            dotColor: '#D4BDA0' // Beige pastel
          };
      }
    } else {
      // Modo claro - colores vibrantes
      switch (estadoReal) {
        case 'Pagado':
          return {
            icon: 'check-circle',
            color: '#4CAF50',
            badgeBg: `#4CAF5015`,
            dotColor: '#4CAF50'
          };
        case 'Vencido':
          return {
            icon: 'alert-circle',
            color: '#F44336',
            badgeBg: `#F4433615`,
            dotColor: '#F44336'
          };
        default: // Pendiente
          return {
            icon: 'clock-outline',
            color: '#FF9800',
            badgeBg: `#FF980015`,
            dotColor: '#FF9800'
          };
      }
    }
  };

  const statusStyle = getStatusStyle();
  const amount = estadoReal === 'Pagado' ? data_pagos.mon_ori_pag : data_pagos.mon_pag;

  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: themeColors.backgroundCard,
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
        }
      ]}
      onPress={() => navigation.navigate('PagoDetalle', data_pagos)}
      activeOpacity={0.7}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.dotColor }]} />
          <Text style={[styles.concept, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {data_pagos.con_pag}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.badgeBg }]}>
          <Icon name={statusStyle.icon} size={14} color={statusStyle.color} />
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {estadoReal}
          </Text>
        </View>
      </View>

      {/* AMOUNT */}
      <Text style={[styles.amount, { color: themeColors.textPrimary }]}>
        <FormatAmount amount={amount} />
      </Text>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Icon 
          name="calendar-outline" 
          size={16} 
          color={isDarkTheme ? '#888' : themeColors.textTertiary} 
        />
        <Text style={[styles.date, { color: themeColors.textTertiary }]}>
          {formatDate(data_pagos.fec_pag)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  concept: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
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
    fontSize: 11,
    fontWeight: '700',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 13,
  },
});

export default PaymentCard;