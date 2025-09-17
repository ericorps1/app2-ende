import { useStripe } from '@stripe/stripe-react-native';
import { useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import stripeApi from '../api/stripeAPI';
import { Pagos } from '../interfaces/appInterfaces';
import { AuthContext } from '../context/AuthContext';
import { colors, platformTheme } from '../theme/platformTheme';
import { Button } from 'react-native-paper';
import endeApi from '../api/estudianteAPI';
import { useAppDispatch } from '../app/hooks';
import { updateInfoPagos } from '../features/pagos/dataPagosSlice';

interface PropsPaymentStripe {
  data_pagos: Pagos;
  onPaySuccess?: () => Promise<void> | null;
}

export const PaymentStripe = ({data_pagos, onPaySuccess}:PropsPaymentStripe) => {
  const [paying, setPaying] = useState(false);
  const clientSecret = useRef('')
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { data_alumno, stripeAccountId } = useContext( AuthContext );
  const dispatch = useAppDispatch();
  const initializePaymentSheet = async () => {
    try {
      if( !stripeAccountId ) {
        console.error('Stripe account ID is not available');
        return; // 🚫 No continuar si no hay stripeAccountId
      }
      setPaying(true);
      const payIntentData = {
        monto: Math.round(parseInt(data_pagos.mon_pag) * 100),
        descripcion: data_pagos.con_pag,
        metadata: {
          id_pago: data_pagos.id_pag,
          tipo_pago: data_pagos.tip_pag, 
          nombre_alumno: data_alumno?.nom_alu,
          nombre_grupo: data_alumno?.nom_gen,
          nombre_programa: data_alumno?.nom_ram,
          nombre_plantel: data_alumno?.nom_pla
        },
        cuenta_stripe: stripeAccountId
      }
      const { data } = await stripeApi.post('/crear-payment-intent', payIntentData);
      console.log('respuesta peticion stripe ', data);
      if (data.success) {
        const dataPayment = {
          merchantDisplayName: `Pago de ${data_pagos.con_pag}`,
          paymentIntentClientSecret: data.clientSecret,
          appearance: {
            colors: {
              primary: colors.primary,
            },
          },
          defaultBillingDetails: {
            name: data_alumno?.nom_alu || '',
          },
          locale: 'es',
        }
        clientSecret.current = data.clientSecret;
        console.log('dataPayment', dataPayment);
        await payment(dataPayment);
      } else {
        setPaying(false);
        console.error('Error creating payment intent, server error:', data);
        // Manejar el error de creación del Payment Intent
      }
    } catch (error: any) {
      setPaying(false);
      console.error('Error initializing payment sheet:', error);
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
    }
  };

  const payment = async (dataPayment: any) => {
    const response = await initPaymentSheet(dataPayment);
    if (response.error) {
      setPaying(false);
      console.error('❌ Error al inicializar el PaymentSheet:', response.error);
      return;
    }
  
    const result = await presentPaymentSheet();
  
    if (result.error) {
      console.error('❌ Error al presentar el PaymentSheet:', result.error);
      setPaying(false);
    } else {
      console.log('✅ Pago completado con éxito:', result);
      abonarPago();
    }
  };

  const abonarPago = async () => {
    try {
      const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
      console.log('data enviada', {
        id_pag: data_pagos.id_pag,
        mon_pag: data_pagos.mon_pag,
        tip_abo_pag: 'Depósito',
        mon_abo_pag: data_pagos.mon_pag,
        tip_pag: data_pagos.tip_pag,
        str_abo_pag: clientSecret.current,
      })
      const response = await endeApi.post('/pagos/abonar', {
        id_pag: data_pagos.id_pag,
        mon_pag: data_pagos.mon_pag,
        tip_abo_pag: 'Depósito',
        mon_abo_pag: data_pagos.mon_pag,
        tip_pag: data_pagos.tip_pag,
        str_abo_pag: clientSecret.current,
      }, headers);
      if (response.data.trans) {
        console.log('Pago abonado exitosamente:', response.data);
        await paymentsRefresh();
        await onPaySuccess?.();
      } else {
        console.error('Error abonando el pago:', response.data);
        if (response.data.error) {
          console.error('Server error details:', response.data.error);
        }
        setPaying(false);
      }
      setPaying(false);
    } catch (error:any) {
      console.error('Respuesta del servidor:', error.response?.data || error.message);
      console.error('Error al abonar el pago:', error);
      setPaying(false);
    }
  };

  const paymentsRefresh = async() => {
    console.log('actualizando pagos');
    try { 
      const {data} = await endeApi.get('/pagos', { params: { 'id_alu_ram': data_alumno!.id_alu_ram } });
      if(data.data.length>0){
          dispatch(updateInfoPagos(data.data));
      }else{
        dispatch(updateInfoPagos([]));
      }
    } catch (error:any) {
      console.log(error);
    }
};

  return (
    <View style={styles.containerButton}>
      <Button
        style={[platformTheme.btnPrimary, styles.btn]}
        onPress={initializePaymentSheet}
        disabled={paying}
        loading={paying}
        icon={paying ? 'loading' : 'lock'}
        labelStyle={{ color: 'white' }}
      >
        {paying ? 'PAGO EN PROCESO...' : 'PAGO EN LINEA'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  containerButton: {
    marginTop: 10,
    width: '100%'
  },
})