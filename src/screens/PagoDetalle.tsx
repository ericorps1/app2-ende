import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react'
import { colors } from '../theme/platformTheme';
import { Pagos } from '../interfaces/appInterfaces';
import { BackButtonNavigation } from '../components/BackButtonNavigation';
import { FilaInfoPagoDetalle } from '../components/FilaInfoPagoDetalle';
import { FormatAmount, formatDate } from '../hooks/useFormats';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { PaymentStripe } from '../components/PaymentStripe';
import RenderPdf from '../components/RenderUrlPdf';

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
  const [paid, setPaid] = useState(data_pagos.est_pag === 'Pagado')
  const [payStatus, setPayStatus] = useState(est_pag)
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: data_pagos.con_pag
    })
  }, []);

  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      style={{ ...styles.container, marginTop: top }}
    >
      <BackButtonNavigation onPressBack={() => navigation.pop()} title={data_pagos.con_pag} />
      
      <View style={styles.headerSection}>
        <Text style={styles.title}>Detalle del pago</Text>
        <View style={styles.titleUnderline} />
      </View>

      <Animatable.View
        animation="fadeInUp"
        duration={1000}
        style={styles.mainCard}
      >
        {/* Header de la tarjeta con gradiente sutil */}
        <View style={styles.cardHeader}>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: paid ? colors.success : colors.error }
            ]} />
            <Text style={[
              styles.statusText,
              { color: paid ? colors.success : colors.error }
            ]}>
              {payStatus}
            </Text>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.cardContent}>
          {/* Sección de monto destacada */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Monto del pago</Text>
            <View style={styles.amountContainer}>
              <FormatAmount 
                amount={paid ? mon_ori_pag : mon_pag} 
                style={[
                  styles.amountValue,
                  { color: paid ? colors.success : colors.error }
                ]}
              />
            </View>
          </View>

          {/* Divisor elegante */}
          <View style={styles.divider} />

          {/* Información adicional */}
          <View style={styles.infoSection}>
            <FilaInfoPagoDetalle
              texto="Tipo de pago:"
              valor={tip_pag}
              flex={12}
              style={styles.infoRow}
            />
            <FilaInfoPagoDetalle
              texto="Fecha:"
              valor={formatDate(fec_pag)}
              style={styles.infoRow}
            />
          </View>

          {/* Botón de pago si no está pagado */}
          {!paid && (
            <View style={styles.paymentSection}>
              <View style={styles.paymentContainer}>
                <PaymentStripe 
                  data_pagos={data_pagos} 
                  onPaySuccess={async () => { 
                    await setPaid(true); 
                    await setPayStatus('Pagado')
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Footer decorativo */}
        <View style={styles.cardFooter}>
          <View style={styles.footerPattern}>
            <View style={styles.patternDot} />
            <View style={styles.patternDot} />
            <View style={styles.patternDot} />
          </View>
        </View>
      </Animatable.View>
      <RenderPdf
        title="Ticket de pago"
        patterScrollEnabled={setScrollEnabled}
        pdfUrl={`https://plataforma.ahjende.com/ticket_pago.php?id_pag=${data_pagos.id_pag}`}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.softSilver,
    paddingHorizontal: 20,
  },
  
  headerSection: {
    alignItems: 'center',
    marginVertical: 25,
  },
  
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.darkBlue,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: colors.darkBlue,
    marginTop: 8,
    borderRadius: 2,
  },

  mainCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginBottom: 20,
    marginHorizontal: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },

  cardHeader: {
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },

  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  statusText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  cardContent: {
    padding: 28,
  },

  amountSection: {
    alignItems: 'center',
    marginBottom: 24,
  },

  amountLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkBlue,
    marginBottom: 8,
    opacity: 0.8,
    letterSpacing: 0.2,
  },

  amountContainer: {
    backgroundColor: 'rgba(248, 249, 250, 0.6)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    minWidth: 200,
    alignItems: 'center',
  },

  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 24,
    marginHorizontal: -8,
  },

  infoSection: {
    marginBottom: 20,
  },

  infoRow: {
    marginBottom: 16,
    paddingVertical: 4,
  },

  paymentSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },

  paymentContainer: {
    alignItems: 'center',
  },

  cardFooter: {
    backgroundColor: 'rgba(248, 249, 250, 0.4)',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },

  footerPattern: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  patternDot: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginHorizontal: 3,
  },
});