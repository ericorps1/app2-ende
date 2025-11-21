import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { statusColors } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';

interface PropsPaymentCard {
  data_pagos: {
    id_pag: number;
    type: string;
    amount: number;
    est_pag: 'Pagado' | 'Pendiente' | 'Vencido';
    fec_pag: string;
    fin_pag: string; // Fecha de vencimiento
    con_pag: string;
    mon_ori_pag: string;
    mon_pag: string;
  };
}

const PaymentCard = ({ data_pagos }: PropsPaymentCard) => {
  const navigation = useNavigation<any>();

  // Validar si el pago está vencido
  const getEstadoPago = () => {
    if (data_pagos.est_pag === 'Pagado') {
      return 'Pagado';
    }

    if (data_pagos.est_pag === 'Pendiente') {
      // Obtener fecha actual sin horas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      // Parsear la fecha de vencimiento de manera más robusta
      // Puede venir como "2025-11-14" o "14/11/2025" o con hora
      let fechaVencimiento: Date;
      
      if (data_pagos.fin_pag.includes('-')) {
        // Formato ISO: "2025-11-14" o "2025-11-14T00:00:00"
        const [year, month, day] = data_pagos.fin_pag.split('T')[0].split('-');
        fechaVencimiento = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (data_pagos.fin_pag.includes('/')) {
        // Formato DD/MM/YYYY: "14/11/2025"
        const [day, month, year] = data_pagos.fin_pag.split('/');
        fechaVencimiento = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Fallback: intentar parsear directamente
        fechaVencimiento = new Date(data_pagos.fin_pag);
      }
      
      fechaVencimiento.setHours(0, 0, 0, 0);

      // Solo está vencido si la fecha de vencimiento ya pasó
      if (fechaVencimiento < hoy) {
        return 'Vencido';
      }
      
      return 'Pendiente';
    }

    return data_pagos.est_pag;
  };

  const estadoReal = getEstadoPago();

  const getStatusIcon = () => {
    switch (estadoReal) {
      case 'Pagado':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'Vencido':
        return { name: 'alert-circle', color: '#F44336' };
      default:
        return { name: 'clock-outline', color: '#FF9800' };
    }
  };

  const statusIcon = getStatusIcon();
  const amount = estadoReal === 'Pagado' ? data_pagos.mon_ori_pag : data_pagos.mon_pag;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PagoDetalle', data_pagos)}
      activeOpacity={0.7}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusIcon.color }]} />
          <Text style={styles.concept} numberOfLines={1}>
            {data_pagos.con_pag}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusIcon.color}15` }]}>
          <Icon name={statusIcon.name} size={14} color={statusIcon.color} />
          <Text style={[styles.statusText, { color: statusIcon.color }]}>
            {estadoReal}
          </Text>
        </View>
      </View>

      {/* AMOUNT */}
      <Text style={styles.amount}>
        <FormatAmount amount={amount} />
      </Text>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Icon name="calendar-outline" size={16} color="#999" />
        <Text style={styles.date}>{formatDate(data_pagos.fec_pag)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
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
    color: '#1A1A1A',
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
    color: '#000',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
});

export default PaymentCard;