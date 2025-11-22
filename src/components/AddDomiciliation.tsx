import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

  // ========== OBTENER ICONO DE LA TARJETA ==========
  const getCardIcon = (brand: string) => {
    const icons: { [key: string]: string } = {
      visa: 'credit-card',
      mastercard: 'credit-card',
      amex: 'credit-card',
      discover: 'credit-card',
      default: 'credit-card'
    };
    return icons[(brand || '').toLowerCase()] || icons.default;
  };

  // ========== OBTENER COLOR DE LA TARJETA ==========
  const getCardColor = (brand: string) => {
    const colors: { [key: string]: string } = {
      visa: '#1A1F71',
      mastercard: '#EB001B',
      amex: '#006FCF',
      discover: '#FF6000',
      default: '#000'
    };
    return colors[(brand || '').toLowerCase()] || colors.default;
  };

  // ========== FORMATEAR NOMBRE DE LA MARCA ==========
  const formatBrand = (brand?: string) => {
    if (!brand) return 'Tarjeta';
    const brandUpper = brand.toUpperCase();
    const names: { [key: string]: string } = {
      'VISA': 'Visa',
      'MASTERCARD': 'Mastercard',
      'AMEX': 'American Express',
      'DISCOVER': 'Discover',
      'DINERS': 'Diners Club',
      'JCB': 'JCB'
    };
    return names[brandUpper] || brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  };

  // ========== FORMATEAR FECHA DE EXPIRACIÓN ==========
  const formatExpiry = (m?: string, y?: string) => {
    if (!m || !y) return '';
    return `${m.padStart(2, '0')}/${String(y).slice(-2)}`;
  };

  // ========== NÚMERO ENMASCARADO ==========
  const maskedNumber = (last4?: string) => {
    if (!last4) return '•••• •••• •••• ••••';
    return `•••• •••• •••• ${last4}`;
  };

  // ========== GUARDAR DOMICILIACIÓN ==========
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

  // ========== ELIMINAR DOMICILIACIÓN ==========
  const deleteDomiciliation = async () => {
    try {
      setLoading(true);
      const {data} = await endeApi.delete('/domiciliacion/' + data_alumno?.id_alu_ram || '');
      if(data.trans === true) {
        updateDomiciliation();
        setAlerts({ 
          type: 'success', 
          title: 'Eliminado', 
          message: 'Método de pago eliminado correctamente.' 
        });
      } else {
        setAlerts({ 
          type: 'error', 
          title: 'Error', 
          message: data.msg || 'No se pudo eliminar el método de pago.' 
        });
      }
    } catch (error:any) {
      console.log('Error al eliminar la domiciliación:', error);
      setAlerts({ 
        type: 'error', 
        title: 'Error', 
        message: error.message || 'Error al eliminar el método de pago.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Métodos de pago</Text>

      {!domiciliation?.isSaved ? (
        // ========== SIN TARJETA GUARDADA ==========
        <TouchableOpacity 
          style={styles.addCard} 
          onPress={saveDomiciliation}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={styles.addCardIcon}>
            <Icon name="plus" size={20} color="#000" />
          </View>
          <View style={styles.addCardContent}>
            <Text style={styles.addCardTitle}>
              {loading ? 'Preparando formulario...' : 'Agregar método de pago'}
            </Text>
            <Text style={styles.addCardSubtitle}>
              Configura pagos automáticos de forma segura
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color="#D0D0D0" />
        </TouchableOpacity>
      ) : (
        // ========== TARJETA GUARDADA ==========
        <View style={styles.savedCard}>
          {/* HEADER DE LA TARJETA */}
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrapper, { backgroundColor: getCardColor(domiciliation.brand) + '15' }]}>
              <Icon 
                name={getCardIcon(domiciliation.brand)} 
                size={28} 
                color={getCardColor(domiciliation.brand)}
              />
            </View>
            <View style={styles.activeBadge}>
              <Icon name="check-circle" size={12} color="#34C759" />
              <Text style={styles.activeBadgeText}>Activo</Text>
            </View>
          </View>
          
          {/* INFO DE LA TARJETA */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardBrand}>{formatBrand(domiciliation.brand)}</Text>
            <Text style={styles.cardNumber}>{maskedNumber(domiciliation.card_no)}</Text>
            
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Icon name="calendar-outline" size={14} color="#999" />
                <Text style={styles.cardExpiry}>
                  {formatExpiry(domiciliation.exp_month, domiciliation.exp_year)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="shield-check-outline" size={14} color="#34C759" />
                <Text style={styles.verifiedText}>Verificada</Text>
              </View>
            </View>
          </View>

          {/* ACCIONES */}
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={saveDomiciliation}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon name="credit-card-refresh-outline" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>
                {loading ? 'Cargando...' : 'Cambiar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => setAlerts({
                type: 'confirmDelete',
                title: 'Eliminar método de pago',
                message: '¿Estás seguro que deseas eliminar este método de pago? Esta acción no se puede deshacer.'
              })}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon name="delete-outline" size={16} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* FOOTER DE SEGURIDAD */}
      <View style={styles.footer}>
        <Icon name="lock-outline" size={14} color="#999" />
        <Text style={styles.footerText}>
          Tus datos están protegidos
        </Text>
      </View>

      {/* MODAL DE MENSAJES */}
      <PaperMessages
        visible={alerts.type !== ''}
        title={alerts.title}
        message={alerts.message}
        buttonText={alerts.type === 'confirmDelete' ? 'Sí, eliminar' : 'Aceptar'}
        dismissable={true}
        styleButton={alerts.type === 'error' ? platformTheme.btnDanger : platformTheme.btnSuccess}
        colorTitle={alerts.type === 'error' ? colors.error : colors.success}
        colorBody={colors.darkSilver}
        onDismiss={() => setAlerts({type: '', title: '', message: ''})}
        pressButton={() => {
          if (alerts.type === 'confirmDelete') {
            deleteDomiciliation();
          } else {
            setAlerts({type: '', title: '', message: ''});
          }
        }}
        btnTxtCancel={alerts.type === 'confirmDelete' ? 'Cancelar' : ''}
        evtBtnCancel={() => setAlerts({type: '', title: '', message: ''})}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // ===== ADD CARD =====
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  addCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addCardContent: {
    flex: 1,
  },
  addCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 3,
  },
  addCardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  
  // ===== SAVED CARD =====
  savedCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconWrapper: {
    width: 56,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  cardInfo: {
    marginBottom: 18,
  },
  cardBrand: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 2,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  verifiedText: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
  },
  
  // ===== ACTIONS =====
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  deleteButtonText: {
    color: '#FF6B6B',
  },
  
  // ===== FOOTER =====
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});