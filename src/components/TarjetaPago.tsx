import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import React from 'react';
import { platformTheme, colors } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { Pagos } from '../interfaces/appInterfaces';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

interface PropsDataPagos {
  data_pagos: Pagos;
  onPressTP?: () => void | null;
}

export default function TarjetaPago({ data_pagos, onPressTP = () => {} }: PropsDataPagos) {
  const navigation = useNavigation<any>();

  if (onPressTP.toString() === 'function () {}') {
    onPressTP = () => navigation.navigate('PagoDetalle', data_pagos);
  }

  const isPagado = data_pagos.est_pag === 'Pagado';

  return (
    <TouchableOpacity
      key={data_pagos.id_pag}
      style={styles.cardContainer}
      onPress={onPressTP}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <FontAwesome5Icon name="money-bill-wave" size={18} color="white" />
        <Text style={styles.headerText}>{data_pagos.con_pag.toUpperCase()}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, { color: isPagado ? colors.success : colors.error }]}>
            {data_pagos.est_pag}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Monto:</Text>
          <Text style={[styles.value, { fontWeight: 'bold', fontSize: 18 }]}>
            <FormatAmount
              amount={isPagado ? data_pagos.mon_ori_pag : data_pagos.mon_pag}
            />
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tipo de pago:</Text>
          <Text style={styles.value}>{data_pagos.tip_pag}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{formatDate(data_pagos.fec_pag)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  body: {
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#777',
    fontSize: 14,
  },
  value: {
    color: colors.darkBlue,
    fontSize: 14,
  },
});
