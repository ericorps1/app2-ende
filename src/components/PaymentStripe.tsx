import { useStripe } from '@stripe/stripe-react-native';
import { useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import stripeApi from '../api/stripeAPI';
import { Pagos } from '../interfaces/appInterfaces';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../theme/platformTheme';
import endeApi from '../api/estudianteAPI';
import { useAppDispatch } from '../app/hooks';
import { updateInfoPagos } from '../features/pagos/dataPagosSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

interface PropsPaymentStripe {
  data_pagos: Pagos;
  onPaySuccess?: () => Promise<void> | null;
}

export const PaymentStripe = ({data_pagos, onPaySuccess}:PropsPaymentStripe) => {
  const { colors: themeColors, theme } = useTheme();
  const [paying, setPaying] = useState(false);
  const clientSecret = useRef('')
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { data_alumno, stripeAccountId } = useContext( AuthContext );
  const dispatch = useAppDispatch();

  // Detectar tema oscuro
  const isDarkTheme = (() => {
    const bg = themeColors.background?.toLowerCase() || '';
    const cardBg = themeColors.backgroundCard?.toLowerCase() || '';
    const textPrimary = themeColors.textPrimary?.toLowerCase() || '';
    
    return bg === '#000' || 
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
           textPrimary === '#f5f5f5';
  })();

  const MONTO_MINIMO = 10;
  const montoAPagar = parseFloat(data_pagos.mon_pag || '0');
  const esMontoBajo = montoAPagar < MONTO_MINIMO;

  const initializePaymentSheet = async () => {
    if (esMontoBajo) {
      Alert.alert(
        'Monto no válido',
        `El monto mínimo para procesar un pago es de $${MONTO_MINIMO} MXN.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      if( !stripeAccountId ) {
        Alert.alert(
          'Error de configuración',
          'No se pudo conectar con el sistema de pagos. Por favor, contacta a soporte.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
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
      
      if (data.success) {
        const dataPayment = {
          merchantDisplayName: `Pago de ${data_pagos.con_pag}`,
          paymentIntentClientSecret: data.clientSecret,
          appearance: {
            colors: {
              primary: isDarkTheme ? '#9DB4C8' : '#000000',  // Azul pastel para modo oscuro
              background: isDarkTheme ? '#1C1C1E' : '#FFFFFF',
              componentBackground: isDarkTheme ? '#2C2C2E' : '#F6F6F6',
              componentBorder: isDarkTheme ? '#38383A' : '#E0E0E0',
              componentText: isDarkTheme ? '#FFFFFF' : '#000000',
              primaryText: isDarkTheme ? '#FFFFFF' : '#000000',
              secondaryText: isDarkTheme ? '#EBEBF5' : '#666666',
              placeholderText: isDarkTheme ? '#8E8E93' : '#999999',
            },
          },
          defaultBillingDetails: {
            name: data_alumno?.nom_alu || '',
          },
          locale: 'es',
        }
        clientSecret.current = data.clientSecret;
        await payment(dataPayment);
      } else {
        setPaying(false);
        console.error('Error creating payment intent, server error:', data);
        Alert.alert(
          'Error',
          'No se pudo iniciar el proceso de pago. Inténtalo nuevamente.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error: any) {
      setPaying(false);
      console.error('Error initializing payment sheet:', error);
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const payment = async (dataPayment: any) => {
    const response = await initPaymentSheet(dataPayment);
    if (response.error) {
      setPaying(false);
      console.error('❌ Error al inicializar el PaymentSheet:', response.error);
      Alert.alert(
        'Error',
        'No se pudo cargar el formulario de pago. Inténtalo nuevamente.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
  
    const result = await presentPaymentSheet();
  
    if (result.error) {
      console.error('❌ Error al presentar el PaymentSheet:', result.error);
      setPaying(false);
      if (result.error.code !== 'Canceled') {
        Alert.alert(
          'Error en el pago',
          result.error.message || 'Ocurrió un error al procesar el pago.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } else {
      abonarPago();
    }
  };

  const abonarPago = async () => {
    try {
      const headers = {headers:{ 'Content-Type':'multipart/form-data' }};
      const response = await endeApi.post('/pagos/abonar', {
        id_pag: data_pagos.id_pag,
        mon_pag: data_pagos.mon_pag,
        tip_abo_pag: 'Depósito',
        mon_abo_pag: data_pagos.mon_pag,
        tip_pag: data_pagos.tip_pag,
        str_abo_pag: clientSecret.current,
      }, headers);

      if (response.data.trans) {
        await paymentsRefresh();
        await onPaySuccess?.();
        Alert.alert(
          'Pago exitoso',
          'Tu pago ha sido procesado correctamente.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        console.error('Error abonando el pago:', response.data);
        if (response.data.error) {
          console.error('Server error details:', response.data.error);
        }
        setPaying(false);
        Alert.alert(
          'Error',
          'El pago fue procesado pero no se pudo registrar. Contacta a soporte.',
          [{ text: 'OK', style: 'default' }]
        );
      }
      setPaying(false);
    } catch (error:any) {
      console.error('Respuesta del servidor:', error.response?.data || error.message);
      console.error('Error al abonar el pago:', error);
      setPaying(false);
      Alert.alert(
        'Error',
        'No se pudo completar el registro del pago. Contacta a soporte.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const paymentsRefresh = async() => {
    console.log('Actualizando pagos...');
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
    <View style={styles.container}>
      {esMontoBajo && (
        <View style={[
          styles.warningCard,
          { backgroundColor: isDarkTheme ? '#3A3632' : '#FFF5E6' }
        ]}>
          <Icon 
            name="information-outline" 
            size={18} 
            color={isDarkTheme ? '#D4BDA0' : '#FF9500'} 
          />
          <Text style={[
            styles.warningText,
            { color: isDarkTheme ? '#D4BDA0' : '#FF9500' }
          ]}>
            El monto mínimo para procesar un pago es de ${MONTO_MINIMO} MXN
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.payButton, 
          { backgroundColor: isDarkTheme ? '#4A4A4A' : '#000' },
          (paying || esMontoBajo) && styles.payButtonDisabled
        ]}
        onPress={initializePaymentSheet}
        disabled={paying || esMontoBajo}
        activeOpacity={0.7}
      >
        {paying ? (
          <>
            <ActivityIndicator size={20} color="#FFF" />
            <Text style={styles.payButtonText}>
              Procesando pago...
            </Text>
          </>
        ) : (
          <>
            <Icon 
              name="lock-outline" 
              size={20} 
              color="#FFF" 
            />
            <Text style={styles.payButtonText}>
              Pagar ahora
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.securityNote}>
        <Icon 
          name="shield-check-outline" 
          size={14} 
          color={isDarkTheme ? '#A8C4A8' : '#666'} 
        />
        <Text style={[
          styles.securityNoteText,
          { color: isDarkTheme ? themeColors.textTertiary : '#666' }
        ]}>
          Tus datos están protegidos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    opacity: 0.4,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  securityNoteText: {
    fontSize: 12,
    fontWeight: '500',
  },
});