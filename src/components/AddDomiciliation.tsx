import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, platformTheme } from '../theme/platformTheme';
import { useStripe } from '@stripe/stripe-react-native';
import endeApi from '../api/estudianteAPI';
import stripeApi from '../api/stripeAPI';
import PaperMessages from './PaperMessages';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  const { colors: themeColors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState({
    type: '',
    title: '',
    message: '',
  });
  
  const { data_alumno, stripeAccountId } = useContext(AuthContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

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

  const getCardColor = (brand: string) => {
    if (isDarkTheme) {
      // Colores pastel apagados para modo oscuro
      const colors: { [key: string]: string } = {
        visa: '#9DB4C8',
        mastercard: '#D0A8A0',
        amex: '#A8C5D0',
        discover: '#D4BDA0',
        default: '#B0B0B0'
      };
      return colors[(brand || '').toLowerCase()] || colors.default;
    } else {
      const colors: { [key: string]: string } = {
        visa: '#1A1F71',
        mastercard: '#EB001B',
        amex: '#006FCF',
        discover: '#FF6000',
        default: '#000'
      };
      return colors[(brand || '').toLowerCase()] || colors.default;
    }
  };

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
      const isDark = theme === 'dark';

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: data_alumno?.nom_ram || 'ENDE Universidad',
        customerId: customerId,
        customerEphemeralKeySecret: setupData.ephemeralKey,
        setupIntentClientSecret: setupData.clientSecret,
        allowsDelayedPaymentMethods: false,
        appearance: {
          colors: {
            primary: isDark ? '#9DB4C8' : '#000000',  // Azul pastel para modo oscuro
            background: isDark ? '#1C1C1E' : '#FFFFFF',
            componentBackground: isDark ? '#2C2C2E' : '#F6F6F6',
            componentBorder: isDark ? '#38383A' : '#E0E0E0',
            componentText: isDark ? '#FFFFFF' : '#000000',
            primaryText: isDark ? '#FFFFFF' : '#000000',
            secondaryText: isDark ? '#EBEBF5' : '#666666',
            placeholderText: isDark ? '#8E8E93' : '#999999',
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
    <View style={[styles.container, { backgroundColor: themeColors.backgroundCard }]}>
      <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Métodos de pago</Text>

      {!domiciliation?.isSaved ? (
        <TouchableOpacity 
          style={[styles.addCard, { 
            backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray, 
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : themeColors.borderGray 
          }]} 
          onPress={saveDomiciliation}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={[
            styles.addCardIcon, 
            { backgroundColor: isDarkTheme ? '#2A2F35' : themeColors.backgroundCard }
          ]}>
            <Icon 
              name="plus" 
              size={20} 
              color={isDarkTheme ? '#9DB4C8' : themeColors.textPrimary} 
            />
          </View>
          <View style={styles.addCardContent}>
            <Text style={[styles.addCardTitle, { color: themeColors.textPrimary }]}>
              {loading ? 'Preparando formulario...' : 'Agregar método de pago'}
            </Text>
            <Text style={[styles.addCardSubtitle, { color: themeColors.textSecondary }]}>
              Configura pagos automáticos de forma segura
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={themeColors.borderGray} />
        </TouchableOpacity>
      ) : (
        <View style={[styles.savedCard, { 
          backgroundColor: isDarkTheme ? '#2A2A2A' : themeColors.backgroundGray, 
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : themeColors.borderGray 
        }]}>
          <View style={styles.cardHeader}>
            <View style={[
              styles.cardIconWrapper, 
              { backgroundColor: getCardColor(domiciliation.brand) + (isDarkTheme ? '25' : '15') }
            ]}>
              <Icon 
                name={getCardIcon(domiciliation.brand)} 
                size={28} 
                color={getCardColor(domiciliation.brand)}
              />
            </View>
            <View style={[
              styles.activeBadge,
              { backgroundColor: isDarkTheme ? '#2D352E' : '#E8F5E9' }
            ]}>
              <Icon 
                name="check-circle" 
                size={12} 
                color={isDarkTheme ? '#A8C4A8' : '#34C759'} 
              />
              <Text style={[
                styles.activeBadgeText,
                { color: isDarkTheme ? '#A8C4A8' : '#34C759' }
              ]}>
                Activo
              </Text>
            </View>
          </View>
          
          <View style={styles.cardInfo}>
            <Text style={[styles.cardBrand, { color: themeColors.textSecondary }]}>
              {formatBrand(domiciliation.brand)}
            </Text>
            <Text style={[styles.cardNumber, { color: themeColors.textPrimary }]}>
              {maskedNumber(domiciliation.card_no)}
            </Text>
            
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Icon name="calendar-outline" size={14} color={themeColors.textTertiary} />
                <Text style={[styles.cardExpiry, { color: themeColors.textTertiary }]}>
                  {formatExpiry(domiciliation.exp_month, domiciliation.exp_year)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon 
                  name="shield-check-outline" 
                  size={14} 
                  color={isDarkTheme ? '#A8C4A8' : '#34C759'} 
                />
                <Text style={[
                  styles.verifiedText,
                  { color: isDarkTheme ? '#A8C4A8' : '#34C759' }
                ]}>
                  Verificada
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: isDarkTheme ? '#4A4A4A' : themeColors.textPrimary 
              }]}
              onPress={saveDomiciliation}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon 
                name="credit-card-refresh-outline" 
                size={16} 
                color="#FFF"
              />
              <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
                {loading ? 'Cargando...' : 'Cambiar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton, { 
                backgroundColor: themeColors.backgroundCard,
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : '#FFE5E5' 
              }]}
              onPress={() => setAlerts({
                type: 'confirmDelete',
                title: 'Eliminar método de pago',
                message: '¿Estás seguro que deseas eliminar este método de pago? Esta acción no se puede deshacer.'
              })}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon 
                name="delete-outline" 
                size={16} 
                color={isDarkTheme ? '#D0A8A0' : '#FF6B6B'} 
              />
              <Text style={[
                styles.actionButtonText, 
                styles.deleteButtonText,
                { color: isDarkTheme ? '#D0A8A0' : '#FF6B6B' }
              ]}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Icon name="lock-outline" size={14} color={themeColors.textTertiary} />
        <Text style={[styles.footerText, { color: themeColors.textTertiary }]}>
          Tus datos están protegidos
        </Text>
      </View>

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
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 3,
  },
  addCardSubtitle: {
    fontSize: 12,
  },
  savedCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardInfo: {
    marginBottom: 18,
  },
  cardBrand: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '500',
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
  },
  deleteButtonText: {
    // Color se aplica dinámicamente
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});