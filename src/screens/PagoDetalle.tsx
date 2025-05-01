import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect }  from 'react'
import { colors } from '../theme/platformTheme';
import { Pagos } from '../interfaces/appInterfaces';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { FilaInfoPagoDetalle } from '../components/FilaInfoPagoDetalle';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';


interface PropsPagoDetalle {
  route: {
    params: Pagos
  },
  navigation: any
}

export default function PagoDetalle({ route, navigation }: PropsPagoDetalle) {
  const { top } = useSafeAreaInsets();
  const data_pagos = route.params;
  const { est_pag, mon_ori_pag, mon_pag, tip_pag, fec_pag } = data_pagos;

  useEffect(() => {
    navigation.setOptions({
      title: data_pagos.con_pag
    })
  }, []);

  return (
    <View style={{ ...styles.container, marginTop: top }}>
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={data_pagos.con_pag} />

      <Text style={styles.title}>Detalle del pago</Text>

      <Animatable.View 
        animation="fadeInUp" 
        duration={1000} 
        style={styles.card}
      >
        <FilaInfoPagoDetalle 
          texto="Monto:"
          valor={<FormatAmount amount={(est_pag === 'Pagado') ? mon_ori_pag : mon_pag} />}
          colorValor={(est_pag === 'Pagado') ? colors.success : colors.error}
          tamanoValor={22}
        />
        <FilaInfoPagoDetalle 
          texto="Estado:" 
          valor={est_pag} 
          colorValor={(est_pag === 'Pagado') ? colors.success : colors.error}
        />
        <FilaInfoPagoDetalle 
          texto="Tipo de pago:" 
          valor={tip_pag} 
          flex={12}
        />
        <FilaInfoPagoDetalle 
          texto="Fecha:" 
          valor={formatDate(fec_pag)}
        />
      </Animatable.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.softSilver, // fondo general (puede ser un gris muy claro)
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.darkBlue,
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5, // para Android
  },
});
