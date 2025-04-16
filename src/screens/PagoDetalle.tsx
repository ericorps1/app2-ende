import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect }  from 'react'
import { colors, platformTheme } from '../theme/platformTheme';
import { Pagos } from '../interfaces/appInterfaces';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { FilaInfoPagoDetalle } from '../components/FilaInfoPagoDetalle';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import TarjetaPago from '../components/TarjetaPago';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PropsPagoDetalle {
  route: {
    params: Pagos
  },
  navigation: any
}

export default function PagoDetalle( { route, navigation }:PropsPagoDetalle ) {
    const {top} = useSafeAreaInsets();
    const data_pagos = route.params;
    const {est_pag,mon_ori_pag,mon_pag,tip_pag,fec_pag} = data_pagos;
    useEffect( () => {
        navigation.setOptions({
            title: data_pagos.con_pag
        })
    },[])
    
  return (
    <View style={ {
      ...styles.container,
      marginTop: top
    }}>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={data_pagos.con_pag}/>
      {/* <View style={{height: '22%', marginRight: 10}}>
        <TarjetaPago data_pagos={data_pagos} onPressTP={()=>{}}/>
      </View> */}
      <Text style={styles.title}>Detalle del pago</Text>
      <View style={ styles.bodyPagDetalle }>
        <FilaInfoPagoDetalle 
          texto='Monto:'
          valor={<FormatAmount amount={(est_pag==='Pagado') ? mon_ori_pag : mon_pag }/>}
          colorValor={(est_pag==='Pagado') ? colors.silver : colors.error}
          tamanoValor={25}
        />
        <FilaInfoPagoDetalle texto='Estado:' valor={est_pag}/>
        <FilaInfoPagoDetalle texto='Tipo de pago:'valor={tip_pag} flex={12}/>
        <FilaInfoPagoDetalle texto='Fecha:'valor={formatDate(fec_pag)}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      paddingTop: 10,
      // backgroundColor: 'red',
      flex: 1,
      paddingLeft: 20,
    },
    bodyPagDetalle: {
      marginLeft: 10,
      marginRight: 20,
      marginTop: 5,
      padding: 10,
    },
    title: {
      fontSize: 30,
      color: colors.darkBlue
    }
});