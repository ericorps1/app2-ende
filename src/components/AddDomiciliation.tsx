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

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: data_alumno?.nom_ram || 'ENDE Universidad',
        customerId: customerId,
        customerEphemeralKeySecret: setupData.ephemeralKey,
        setupIntentClientSecret: setupData.clientSecret,
        allowsDelayedPaymentMethods: false,
        appearance: {
          colors: {
            primary: '#000000',
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

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
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
      <Text style={styles.sectionTitle}>Métodos de pago</Text>

      {!domiciliation?.isSaved ? (
        <TouchableOpacity 
          style={styles.addCard} 
          onPress={saveDomiciliation}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={styles.addCardIcon}>
            <FontAwesome5 name="plus" size={18} color="#000" />
          </View>
          <View style={styles.addCardContent}>
            <Text style={styles.addCardTitle}>
              {loading ? 'Preparando formulario...' : 'Agregar método de pago'}
            </Text>
            <Text style={styles.addCardSubtitle}>
              Configura pagos automáticos de forma segura
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#999" />
        </TouchableOpacity>
      ) : (
        <View style={styles.savedCard}>
          <View style={styles.cardIconWrapper}>
            <FontAwesome5 
              name={getCardIcon(domiciliation.brand)} 
              size={32} 
              color="#000" 
            />
          </View>
          
          <View style={styles.cardInfo}>
            <Text style={styles.cardBrand}>{formatBrand(domiciliation.brand)}</Text>
            <Text style={styles.cardNumber}>{maskedNumber(domiciliation.card_no)}</Text>
            <Text style={styles.cardExpiry}>
              Vence {formatExpiry(domiciliation.exp_month, domiciliation.exp_year)}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={saveDomiciliation}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>
                {loading ? 'Cargando...' : 'Cambiar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => setAlerts({
                type: 'confirmDelete',
                title: 'Eliminar método de pago',
                message: '¿Estás seguro? Esta acción no se puede deshacer.'
              })}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <FontAwesome5 name="lock" size={12} color="#999" />
        <Text style={styles.footerText}>Tus datos están protegidos</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
  },
  addCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addCardContent: {
    flex: 1,
  },
  addCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  addCardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  savedCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  cardIconWrapper: {
    width: 60,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    marginBottom: 20,
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deleteButtonText: {
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});