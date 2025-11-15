import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import React from 'react';
import { colors } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { Pagos } from '../interfaces/appInterfaces';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PropsDataPagos {
  data_pagos: Pagos;
}

export default function TarjetaPago({ data_pagos }: PropsDataPagos) {
  const navigation = useNavigation<any>();
  const onPressTP = () => navigation.navigate('PagoDetalle', data_pagos);

  const isPagado = data_pagos.est_pag === 'Pagado';
  
  // Vencido = +1 día después del fin_pag
  const isVencido = () => {
    if (isPagado || !data_pagos.fin_pag) return false;
    
    const fechaVencimiento = new Date(data_pagos.fin_pag);
    // Agregar 1 día después del fin_pag
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 1);
    fechaVencimiento.setHours(23, 59, 59, 999);
    
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    
    return fechaVencimiento < hoy;
  };

  const vencido = isVencido();

  const getStatusColor = () => {
    if (isPagado) return '#34C759';
    if (vencido) return '#FF3B30';
    return '#666';
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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPressTP}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: isPagado ? '#E8F5E9' : vencido ? '#FFE5E5' : '#F5F5F5' }]}>
            <Icon 
              name={isPagado ? 'cash-check' : 'receipt'} 
              size={18} 
              color={getStatusColor()} 
            />
          </View>
          <Text style={styles.concept} numberOfLines={1}>
            {data_pagos.con_pag}
          </Text>
        </View>
        <Icon name="chevron-right" size={18} color="#D0D0D0" />
      </View>

      <View style={styles.body}>
        <View style={styles.mainInfo}>
          <Text style={styles.amountLabel}>Monto a pagar</Text>
          <Text style={styles.amount}>
            <FormatAmount amount={isPagado ? data_pagos.mon_ori_pag : data_pagos.mon_pag} />
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estado</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
              <Icon name={getStatusIcon()} size={12} color={getStatusColor()} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo de pago</Text>
            <Text style={styles.detailValue}>{getTipoPago()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha límite</Text>
            <Text style={[styles.detailValue, vencido && styles.detailValueVencido]}>
              {formatDate(data_pagos.fin_pag)}
            </Text>
          </View>
        </View>
      </View>

      {vencido && (
        <View style={styles.vencidoBanner}>
          <Icon name="alert" size={12} color="#FF3B30" />
          <Text style={styles.vencidoText}>Pago vencido - Regulariza tu situación</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    borderBottomColor: '#F0F0F0',
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
    color: '#000',
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
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
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
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  detailValueVencido: {
    color: '#FF3B30',
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
    backgroundColor: '#FFF5F5',
    paddingVertical: 8,
    gap: 6,
  },
  vencidoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF3B30',
  },
});