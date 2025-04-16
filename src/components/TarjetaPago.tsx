import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import React from 'react'
import { platformTheme, colors } from '../theme/platformTheme';
import { useNavigation } from '@react-navigation/core';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { Pagos } from '../interfaces/appInterfaces';

interface PropsDataPagos {
  data_pagos : Pagos;
  onPressTP?: () => void | null;
}

export default function TarjetaPago({ data_pagos, onPressTP=()=>{} }:PropsDataPagos) {
  const navigation = useNavigation<any>();
  if (onPressTP.toString() === 'function () {}') {
    onPressTP = () => navigation.navigate('PagoDetalle', data_pagos);
  }
  return (
    <TouchableOpacity 
        key={data_pagos.id_pag} 
        style={ platformTheme.paymentCard } 
        onPress={ onPressTP }
        activeOpacity={0.4}
    >
      <View style={styles.filaHeader}>
        <Text style={ styles.title }>{ data_pagos.con_pag.toUpperCase() }</Text>
      </View>
      <View style={ { ...platformTheme.fila, paddingTop: 10 } }>
        <Text 
          style={ { 
            ...styles.description, 
            flex: 1, 
            color: (data_pagos.est_pag==='Pagado') ? colors.darkBlue : colors.error,
            fontSize: 25,
          } }>
            <FormatAmount amount={(data_pagos.est_pag==='Pagado') ? data_pagos.mon_ori_pag : data_pagos.mon_pag }/>
          </Text>
        <Text style={ { ...styles.description, flex: 1 } }>{ data_pagos.est_pag }</Text>
      </View>
      <View style={ { ...platformTheme.fila, padding: 10 } }>
        <Text style={ { ...styles.description, flex: 1 } }>{ data_pagos.tip_pag }</Text>
        <Text style={ { ...styles.description, flex: 1 } }>{ formatDate(data_pagos.fec_pag) }</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    title: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      width: '100%',
      paddingHorizontal: 10,
      paddingBottom: 5,
      textAlign: 'left',
      justifyContent: 'flex-end',
      textAlignVertical: 'center'
    },
    description: {
      flex: 1,
      color: colors.darkBlue,
      fontSize: 15,
      textAlign: 'center',
      // backgroundColor: 'red',
    },
    contextText: {      
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    filaHeader: {
      backgroundColor: colors.darkBlue,
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: 5,
      borderTopLeftRadius: 8,
      borderTopEndRadius: 8,
    }
});