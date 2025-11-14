import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors, platformTheme } from '../theme/platformTheme';
import { useStripe } from '@stripe/stripe-react-native';
import endeApi from '../api/estudianteAPI';
import stripeApi from '../api/stripeAPI';
import PaperMessages from './PaperMessages';
import { AuthContext } from '../context/AuthContext';

interface AddDomiciliationProps {
  domiciliation: {
    isSaved: boolean;
    card_no: string;
    exp_month: string;
    exp_year: string;
    brand: string;
  };
  updateDomiciliation: () => Promise<void>;
}

export const AddDomiciliation = ({
  domiciliation,
  updateDomiciliation,
}: AddDomiciliationProps) => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState({
    type: '',
    title: '',
    message: '',
  });
  
  const { data_alumno, stripeAccountId } = useContext(AuthContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Helpers
  const getCardIcon = (brand: string) => {
    const icons: { [key: string]: string } = {
      visa: 'cc-visa',
      mastercard: 'cc-mastercard',
      amex: 'cc-amex',
      discover: 'cc-discover',
      default: 'credit-card'
    };
    return icons[(brand || '').toLowerCase()] || icons.default;
  };

  const formatBrand = (brand?: string) => {
    if (!brand) return 'Tarjeta';
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  };

  const formatExpiry = (m?: string, y?: string) => {
    if (!m || !y) return '';
    return `${m.padStart(2, '0')}/${String(y).slice(-2)}`;
  };

  const maskedNumber = (last4?: string) => {
    if (!last4) return '•••• •••• •••• ••••';
    return `•••• •••• •••• ${last4}`;
  };

  const saveDomiciliation = async () => {
    if (!stripeAccountId) {
      setAlerts({
        type: 'error',
        title: 'Error',
        message: 'No se encontró la cuenta de Stripe asociada.'
      });
      return;
    }

    setLoading(true);

    try {      
      // 1. Crear SetupIntent en el backend (mismo endpoint de la web)
      const { data: setupData } = await stripeApi.post('/crear-setup-intent', {
        id_alu_ram: data_alumno?.id_alu_ram,
        email: data_alumno?.cor_alu,
        nombre: data_alumno?.nom_alu,
        generacion: data_alumno?.nom_gen,
        cuenta_stripe: stripeAccountId,
      });

      if (!setupData.success || !setupData.clientSecret) {
        console.error('❌ Error al crear SetupIntent:', setupData);
        setAlerts({
          type: 'error',
          title: 'Error',
          message: setupData.message || 'Error al configurar la domiciliación.'
        });
        setLoading(false);
        return;
      }

      const customerId = setupData.customer;

      // 2. Inicializar Payment Sheet con la cuenta conectada
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: data_alumno?.nom_ram || 'ENDE Universidad',
        customerId: customerId,
        customerEphemeralKeySecret: setupData.ephemeralKey,
        setupIntentClientSecret: setupData.clientSecret,
        allowsDelayedPaymentMethods: false,
        appearance: {
          colors: {
            primary: colors.primary,
          },
          shapes: {
            borderRadius: 8,
            borderWidth: 1,
          },
        },
      });

      if (initError) {
        console.error('❌ Error al inicializar Payment Sheet:', initError);
        setAlerts({
          type: 'error',
          title: 'Error',
          message: initError.message || 'Error al inicializar el formulario de pago'
        });
        setLoading(false);
        return;
      }

      // 3. Presentar el Payment Sheet (modal de Stripe)
      
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        
        // Si el usuario canceló, no mostrar error
        if (presentError.code === 'Canceled') {
          setLoading(false);
          return;
        }
        
        setAlerts({
          type: 'error',
          title: 'Error',
          message: presentError.message || 'Error al procesar el pago'
        });
        setLoading(false);
        return;
      }

      // 4. El SetupIntent ya está confirmado, obtener detalles

      const { data: setupDetails } = await stripeApi.post('/obtener-payment-method', {
        setup_intent_id: setupData.setupIntentId,
        cuenta_stripe: stripeAccountId,
      });

      if (!setupDetails.success) {
        console.error('❌ Error al obtener detalles:', setupDetails);
        setAlerts({
          type: 'error',
          title: 'Error',
          message: setupDetails.message || 'Error al obtener los detalles de la domiciliación.'
        });
        setLoading(false);
        return;
      }

      // 5. Guardar en la base de datos
      const { data: payMethod, payment_method_id } = setupDetails;
      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = await endeApi.post(
        '/domiciliacion',
        {
          id_alu_ram: data_alumno?.id_alu_ram ?? 0,
          brand: payMethod?.card?.brand || '',
          card_no: payMethod?.card?.last4 || '',
          exp_month: payMethod?.card?.exp_month || '',
          exp_year: payMethod?.card?.exp_year || '',
          payment_method_id: payment_method_id || '',
          customer_id: customerId || '',
        },
        headers
      );

      if (response.data.trans) {
        
        setAlerts({
          type: 'success',
          title: 'Éxito',
          message: 'La domiciliación ha sido guardada correctamente.'
        });
        updateDomiciliation();
        
      } else {
        setAlerts({
          type: 'error',
          title: 'Error',
          message: response.data.message || 'Error al guardar la domiciliación.'
        });
      }
      
    } catch (error: any) {
      console.error('❌ Error en saveDomiciliation:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      
      let mensajeUsuario = error?.response?.data?.message || error.message || 'Ocurrió un error al guardar la domiciliación.';
      
      setAlerts({
        type: 'error',
        title: 'Error',
        message: mensajeUsuario
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDomiciliation = async () => {
    try {
      setLoading(true);
      const {data} = await endeApi.delete('/domiciliacion/' + data_alumno?.id_alu_ram || '');
      if(data.trans === true) {
        updateDomiciliation();
        setAlerts({ 'type': 'success', 'title': 'Éxito', 'message': 'Domiciliación eliminada exitosamente.' });
      } else {
        setAlerts({ 'type': 'error', 'title': 'Error', 'message': data.msg || 'Error al eliminar la domiciliación.' });
      }
    } catch (error:any) {
      console.log('Error al eliminar la domiciliación:', error);
      setAlerts({ 'type': 'error', 'title': 'Error', 'message': error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!domiciliation?.isSaved ? (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={saveDomiciliation}
          activeOpacity={0.8}
          disabled={loading}
        >
          <View style={styles.addButtonContent}>
            <View style={styles.iconContainer}>
              <FontAwesome5 
                name={loading ? 'spinner' : 'plus'} 
                size={16} 
                color={colors.primary || '#635BFF'} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.addTitle}>
                {loading ? 'Preparando...' : 'Domiciliación de pagos'}
              </Text>
              <Text style={styles.addSubtitle}>
                Activa pagos automáticos con tarjeta de forma segura.
              </Text>
            </View>
            <FontAwesome5 
              name="chevron-right" 
              size={16} 
              color="#8898AA" 
            />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Tarjeta domiciliada</Text>
            <TouchableOpacity 
              onPress={() => setAlerts({
                type: 'confirmDelete',
                title: 'Confirmar eliminación',
                message: '¿Estás seguro de que deseas eliminar la domiciliación? Esta acción no se puede deshacer.'
              })}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBox}>
            <View style={styles.left}>
              <View style={styles.cardIcon}>
                <FontAwesome5 
                  name={getCardIcon(domiciliation.brand)} 
                  size={28} 
                  color="#1A1F36" 
                />
              </View>
            </View>

            <View style={styles.middle}>
              <Text style={styles.cardBrandLarge}>{formatBrand(domiciliation.brand)}</Text>
              <Text style={styles.cardNumberLarge}>{maskedNumber(domiciliation.card_no)}</Text>
              <View style={styles.row}>
                <Text style={styles.muted}>Expira</Text>
                <Text style={styles.value}> {formatExpiry(domiciliation.exp_month, domiciliation.exp_year)}</Text>
              </View>
            </View>

            <View style={styles.right}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>Domiciliada</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={saveDomiciliation}
              disabled={loading}
            >
              <Text style={[styles.actionText, { color: '#fff' }]}>{loading ? 'Procesando...' : 'Cambiar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.securitySection}>
        <FontAwesome5 name="lock" size={12} color="#8898AA" />
        <Text style={styles.securityText}>
          Procesado de forma segura por Stripe
        </Text>
      </View>

      <PaperMessages
        visible={alerts.type !== ''}
        title={alerts.title}
        message={alerts.message}
        buttonText={alerts.type === 'confirmDelete' ? 'Confirmar' : 'Aceptar'}
        dismissable={true}
        styleButton={alerts.type === 'error' ? platformTheme.btnDanger : platformTheme.btnSuccess}
        colorTitle={alerts.type === 'error' ? colors.error : colors.success}
        colorBody={colors.darkSilver}
        onDismiss={() => setAlerts({'type': '', 'title': '', 'message': ''})}
        pressButton={() => {
          if (alerts.type === 'confirmDelete') {
            deleteDomiciliation();
          }else {
            setAlerts({'type': '', 'title': '', 'message': ''});
          }
        }}
        btnTxtCancel={alerts.type === 'confirmDelete' ? 'Cancelar' : ''}
        evtBtnCancel={() => setAlerts({'type': '', 'title': '', 'message': ''})}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },

  /* Add button */
  addButton: {
    padding: 18,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F6F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1F36',
    marginBottom: 3,
  },
  addSubtitle: {
    fontSize: 13,
    color: '#8898AA',
  },

  /* Card saved view */
  cardContainer: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8898AA',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 13,
    color: '#DC3545',
    fontWeight: '600',
  },

  cardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },

  left: {
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    width: 56,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EDF3',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  middle: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cardBrandLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1724',
    marginBottom: 4,
  },
  cardNumberLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22313F',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muted: {
    fontSize: 12,
    color: '#8898AA',
    marginRight: 6,
  },
  value: {
    fontSize: 13,
    color: '#22313F',
    fontWeight: '600',
  },

  right: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
  },
  statusPill: {
    backgroundColor: '#E9F7EF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1F0D6',
  },
  statusText: {
    fontSize: 12,
    color: '#1F7A3A',
    fontWeight: '700',
  },

  /* Actions */
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: colors.primary || '#635BFF',
  },
  ghostAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E6EDF3',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  ghostText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22313F',
  },

  /* Security footer */
  securitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  securityText: {
    fontSize: 12,
    color: '#8898AA',
  },
});