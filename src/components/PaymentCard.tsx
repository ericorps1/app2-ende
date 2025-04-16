import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { colors, statusColors } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { Touchable } from './Touchable';

interface PropsPaymentCard {
  data_pagos: {
    id_pag: number;
    type: string;
    amount: number;
    est_pag: 'Pagado' | 'Pendiente' | 'Vencido';
    fec_pag: string;
    con_pag: string;
    mon_ori_pag: string;
    mon_pag: string;
  },
}

const PaymentCard = ({ data_pagos }: PropsPaymentCard) => {
  const navigation = useNavigation<any>();

  const onPressTP = () => navigation.navigate('PagoDetalle', data_pagos)
  return (
    <Touchable 
      onPress={onPressTP}
      styleContainer={{
        ...styles.card,
        borderLeftColor: statusColors[data_pagos.est_pag]
    }}>
      <View style={styles.row}>
        <Text style={[styles.type,{ color: colors.silver }]}>{data_pagos.con_pag}</Text>
        <Text style={[styles.status, { color: statusColors[data_pagos.est_pag] }]}>{data_pagos.est_pag}</Text>
      </View>

      <Text style={[styles.amount, { color: colors.darkSilver }]}>
        <FormatAmount amount={(data_pagos.est_pag==='Pagado') ? data_pagos.mon_ori_pag : data_pagos.mon_pag }/>
      </Text>
      <View style={styles.row}>
        <Icon name="calendar-outline" size={30} color={colors.mediumSilver} />
        <Text style={[styles.date, { color: colors.mediumSilver }]}>{formatDate(data_pagos.fec_pag)}</Text>
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 5, // Indicador de color para el estado
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  date: {
    fontSize: 14,
    marginLeft: 5,
  }
});

export default PaymentCard;
